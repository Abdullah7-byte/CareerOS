import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import { scoreJobRelevance, SCORE_RUBRIC_VERSION } from "@/lib/scoring/job-relevance";
import { resumeContentSchema } from "@/lib/validations/resume";
import { GROQ_MODEL } from "@/lib/ai/groq";

const retryDelaysSeconds = [60, 300, 1800, 7200] as const;

type Claim = {
  application_id: string;
  profile_id: string;
  resume_snapshot: unknown;
  job_snapshot: unknown;
  attempt: number;
};

function errorCode(error: unknown) {
  if (error instanceof Error && /timeout|abort/i.test(error.message)) return "timeout";
  return "provider_unavailable";
}

/**
 * Claims and scores one durable application. It deliberately stores only a
 * redacted error code in diagnostics; snapshots already belong to the
 * application record and are never copied to operational logs.
 */
export async function processApplicationScoring(applicationId: string) {
  const admin = createAdminClient();
  const { data: claimedRows, error: claimError } = await admin.rpc("claim_application_scoring", {
    p_application_id: applicationId,
  });
  if (claimError) return { claimed: false, error: "claim_failed" as const };
  const claim = (claimedRows?.[0] ?? null) as Claim | null;
  if (!claim) return { claimed: false, error: null };

  const parsedResume = resumeContentSchema.safeParse(claim.resume_snapshot);
  const snapshot = claim.job_snapshot as { description?: unknown } | null;
  if (!parsedResume.success || !snapshot || typeof snapshot.description !== "string") {
    await admin.from("applications").update({
      score_status: "failed", score_next_retry_at: null, score_last_error_code: "invalid_snapshot",
    }).eq("id", claim.application_id).eq("score_status", "processing");
    await admin.from("application_scoring_events").insert({
      application_id: claim.application_id, profile_id: claim.profile_id, attempt: claim.attempt,
      event_type: "failed", error_code: "invalid_snapshot",
    });
    return { claimed: true, outcome: "failed" as const };
  }

  try {
    const result = await scoreJobRelevance(parsedResume.data, snapshot.description);
    if (!result.success) throw new Error(result.error ?? "provider unavailable");
    if (result.outcome === "insufficient") {
      await admin.from("applications").update({
        match_score: null, score_status: "insufficient", score_breakdown: null,
        score_rubric_version: SCORE_RUBRIC_VERSION, score_model_version: GROQ_MODEL,
        score_completed_at: new Date().toISOString(), score_last_error_code: null,
      }).eq("id", claim.application_id).eq("score_status", "processing");
      await admin.from("application_scoring_events").insert({
        application_id: claim.application_id, profile_id: claim.profile_id, attempt: claim.attempt, event_type: "insufficient",
      });
      return { claimed: true, outcome: "insufficient" as const };
    }

    await admin.from("applications").update({
      match_score: result.totalScore, score_status: "scored", score_breakdown: result.categories as unknown as Json,
      score_rubric_version: SCORE_RUBRIC_VERSION, score_model_version: GROQ_MODEL,
      score_completed_at: new Date().toISOString(), score_last_error_code: null,
    }).eq("id", claim.application_id).eq("score_status", "processing");
    await admin.from("application_scoring_events").insert({
      application_id: claim.application_id, profile_id: claim.profile_id, attempt: claim.attempt, event_type: "scored",
    });
    return { claimed: true, outcome: "scored" as const };
  } catch (error) {
    const retryDelay = retryDelaysSeconds[claim.attempt - 1];
    await admin.from("applications").update({
      score_status: "failed",
      score_next_retry_at: retryDelay ? new Date(Date.now() + retryDelay * 1000).toISOString() : null,
      score_last_error_code: errorCode(error),
    }).eq("id", claim.application_id).eq("score_status", "processing");
    await admin.from("application_scoring_events").insert({
      application_id: claim.application_id, profile_id: claim.profile_id, attempt: claim.attempt,
      event_type: "failed", error_code: errorCode(error),
    });
    return { claimed: true, outcome: "failed" as const };
  }
}
