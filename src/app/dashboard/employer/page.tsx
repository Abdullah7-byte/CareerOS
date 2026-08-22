import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployerDashboardOverview } from "@/components/dashboard/employer/dashboard-overview";
import { getApplicationsForJob } from "@/app/action/applications";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, organization_name, recruiter_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "employer") {
    redirect("/dashboard/candidate");
  }

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, company, location, employment_type, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    throw new Error("We couldn't load your hiring overview. Please try again.");
  }

  const ownedJobIds = (jobs ?? []).map((job) => job.id);
  const applicationsByJob = await Promise.all(
    ownedJobIds.map(async (jobId) => {
      const result = await getApplicationsForJob(jobId);
      if (!result.success) {
        throw new Error(result.error || "We couldn't load candidate applications.");
      }
      return result.data;
    })
  );

  const applications = applicationsByJob
    .flat()
    .sort((left, right) => new Date(right.applied_at).getTime() - new Date(left.applied_at).getTime());

  return (
    <EmployerDashboardOverview
      jobs={jobs ?? []}
      applications={applications}
      organizationName={profile.organization_name}
      recruiterName={profile.recruiter_name}
    />
  );
}
