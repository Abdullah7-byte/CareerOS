import { createClient } from "@/lib/supabase/server";
import { withdrawnApplicationStatus } from "@/lib/validations/application";
import { redirect } from "next/navigation";
import {
  ApplicationsBoard,
  type CandidateApplication,
} from "@/components/dashboard/candidate/applications-board";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  sort?: string;
  application?: string;
}>;

export default async function CandidateApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, status, sort, application } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, job_id, status, match_score, applied_at, created_at, job:jobs(id, title, company, location, employment_type)"
    )
    .eq("profile_id", user.id)
    .neq("status", withdrawnApplicationStatus)
    .order("applied_at", { ascending: false });

  if (error) {
    throw new Error("We couldn't load your applications. Please try again.");
  }

  const applications: CandidateApplication[] = (data ?? []).map((application) => ({
    id: application.id,
    jobId: application.job_id,
    status: application.status,
    matchScore: application.match_score,
    appliedAt: application.applied_at,
    createdAt: application.created_at,
    job: application.job
      ? {
          id: application.job.id,
          title: application.job.title,
          company: application.job.company,
          location: application.job.location,
          employmentType: application.job.employment_type,
        }
      : null,
  }));

  return (
    <ApplicationsBoard
      applications={applications}
      filters={{
        search: q?.trim() ?? "",
        status: status?.trim() ?? "",
        order: sort === "oldest" ? "oldest" : "newest",
      }}
      focusedApplicationId={application?.trim() || null}
    />
  );
}
