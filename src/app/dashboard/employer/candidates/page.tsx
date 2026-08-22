import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployerCandidatesBoard } from "@/components/dashboard/employer/candidate-review";
import { getApplicationsForJob } from "@/app/action/applications";

export const dynamic = "force-dynamic";

export default async function EmployerCandidatesPage() {
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

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    throw new Error("We couldn't load candidates. Please try again.");
  }

  const ownedJobIds = (jobs ?? []).map((job) => job.id);
  const applicationResults = await Promise.all(
    ownedJobIds.map(async (jobId) => {
      const result = await getApplicationsForJob(jobId);
      if (!result.success) {
        throw new Error(result.error || "We couldn't load candidate applications.");
      }
      return result.data;
    })
  );

  const applicants = applicationResults
    .flat()
    .map((application) => ({
      id: application.id,
      profile_id: application.profile?.id ?? "",
      status: application.status,
      match_score: application.match_score,
      applied_at: application.applied_at,
      full_name: application.profile?.full_name ?? null,
      headline: application.profile?.headline ?? null,
      resume_title: application.resume?.title ?? null,
      job_title: application.job?.title ?? "Role",
      company: application.job?.company ?? "Company",
      location: application.job?.location ?? application.profile?.location ?? null,
    }));

  return <EmployerCandidatesBoard applicants={applicants} />;
}
