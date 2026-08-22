import { createClient } from "@/lib/supabase/server";
import { withdrawnApplicationStatus } from "@/lib/validations/application";
import { redirect } from "next/navigation";
import { JobBoard, type JobBoardItem } from "@/components/dashboard/candidate/job-board";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  sort?: string;
}>;

export default async function CandidateJobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, type, sort } = await searchParams;
  const search = q?.trim() ?? "";
  const employmentType = type?.trim() ?? "";
  const order = sort === "oldest" ? "oldest" : "newest";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let jobsQuery = supabase
    .from("jobs")
    .select("id, title, company, location, description, employment_type, created_at")
    .order("created_at", { ascending: order === "oldest" });

  if (search) {
    const escapedSearch = search.replace(/[,%()]/g, " ");
    jobsQuery = jobsQuery.or(
      `title.ilike.%${escapedSearch}%,company.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
    );
  }

  if (employmentType) {
    jobsQuery = jobsQuery.eq("employment_type", employmentType);
  }

  const [jobsResult, applicationsResult, resumeResult, typesResult] = await Promise.all([
    jobsQuery,
    supabase
      .from("applications")
      .select("id, job_id, status, match_score, applied_at")
      .eq("profile_id", user.id)
      .neq("status", withdrawnApplicationStatus)
      .order("applied_at", { ascending: false }),
    supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase.from("jobs").select("employment_type"),
  ]);

  if (jobsResult.error || applicationsResult.error || typesResult.error) {
    throw new Error("We couldn't load the job board. Please try again.");
  }

  const applicationsByJobId = new Map<string, NonNullable<typeof applicationsResult.data>[number]>();
  for (const application of applicationsResult.data ?? []) {
    if (!applicationsByJobId.has(application.job_id)) {
      applicationsByJobId.set(application.job_id, application);
    }
  }

  const jobs: JobBoardItem[] = (jobsResult.data ?? []).map((job) => {
    const application = applicationsByJobId.get(job.id);

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      employmentType: job.employment_type,
      createdAt: job.created_at,
      application: application
        ? {
            id: application.id,
            status: application.status,
            matchScore: application.match_score,
            appliedAt: application.applied_at,
          }
        : null,
    };
  });

  const employmentTypes = Array.from(
    new Set(
      (typesResult.data ?? [])
        .map((job) => job.employment_type)
        .filter((value): value is string => Boolean(value))
    )
  ).sort();

  return (
    <JobBoard
      jobs={jobs}
      employmentTypes={employmentTypes}
      hasResume={Boolean((resumeResult.data ?? []).length)}
      resumes={(resumeResult.data ?? []).map((resume) => ({ id: resume.id, title: resume.title, updated_at: resume.updated_at }))}
      filters={{ search, employmentType, order }}
    />
  );
}
