import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { EmployerCandidateDetail } from "@/components/dashboard/employer/candidate-review";

export const dynamic = "force-dynamic";

export default async function EmployerCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "employer") {
    redirect("/dashboard/candidate");
  }

  const { data: application, error } = await supabase
    .from("applications")
    .select(
      "id, profile_id, status, match_score, applied_at, resume_id, job:jobs(id, title, company, location, employment_type, profile_id)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    redirect("/dashboard/employer/candidates");
  }

  if (application.job?.profile_id !== user.id) {
    redirect("/dashboard/employer/candidates");
  }

  let submittedResume: { id: string; title: string; summary: string | null } | null = null;

  if (application.resume_id) {
    const admin = createAdminClient();
    const { data: resumeData, error: resumeError } = await admin
      .from("resumes")
      .select("id, title, summary")
      .eq("id", application.resume_id)
      .eq("profile_id", application.profile_id)
      .maybeSingle();

    if (resumeError) {
      throw new Error("We couldn't load the submitted resume for this application.");
    }

    submittedResume = resumeData
      ? {
          id: resumeData.id,
          title: resumeData.title,
          summary: resumeData.summary,
        }
      : null;
  }

  const admin = createAdminClient();
  const { data: candidate } = await admin
    .from("profiles")
    .select("id, full_name, headline, location, phone")
    .eq("id", application.profile_id)
    .maybeSingle();

  return (
    <EmployerCandidateDetail
      application={{
        id: application.id,
        status: application.status,
        match_score: application.match_score,
        applied_at: application.applied_at,
        resume_id: application.resume_id,
        resume: submittedResume,
        job: application.job
          ? {
              id: application.job.id,
              title: application.job.title,
              company: application.job.company,
              location: application.job.location,
              employment_type: application.job.employment_type,
            }
          : null,
      }}
      candidate={candidate}
    />
  );
}
