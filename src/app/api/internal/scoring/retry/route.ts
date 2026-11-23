import "server-only";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processApplicationScoring } from "@/lib/scoring/application-scoring";

// Invoke from an authenticated scheduler. This endpoint intentionally returns
// counts only; it never returns résumé content or provider diagnostics.
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== process.env.SCORING_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data } = await admin.from("applications")
    .select("id").in("score_status", ["pending", "failed", "processing"])
    .order("created_at", { ascending: true }).limit(25);
  const results = await Promise.all((data ?? []).map((application) => processApplicationScoring(application.id)));
  return NextResponse.json({ processed: results.filter((result) => result.claimed).length });
}
