import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployerJobsBoard } from "@/components/dashboard/employer/job-management";

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
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

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, employment_type, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("We couldn't load your jobs. Please try again.");
  }

  const applicantCounts = await supabase
    .from("applications")
    .select("job_id")
    .neq("status", "withdrawn")
    .in(
      "job_id",
      (jobs ?? []).map((job) => job.id)
    );

  if (applicantCounts.error) {
    throw new Error("We couldn't load applicant counts. Please try again.");
  }

  const jobsWithCounts = (jobs ?? []).map((job) => ({
    ...job,
    applicant_count: (applicantCounts.data ?? []).filter((row) => row.job_id === job.id).length,
  }));

  return <EmployerJobsBoard jobs={jobsWithCounts} />;
}
