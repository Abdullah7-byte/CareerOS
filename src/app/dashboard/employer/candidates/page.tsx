import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployerCandidatesBoard } from "@/components/dashboard/employer/candidate-review";
import { getApplicationsForEmployer } from "@/app/action/applications";

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

  const applicationResult = await getApplicationsForEmployer();
  if (!applicationResult.success) throw new Error(applicationResult.error || "We couldn't load candidate applications.");
  const applicants = applicationResult.data
    .map((application) => ({
      id: application.id,
      profile_id: application.profile?.id ?? "",
      status: application.status,
      match_score: application.match_score,
      score_status: application.score_status,
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
