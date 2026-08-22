import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmployerDashboardJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  created_at: string;
}

export interface EmployerDashboardApplication {
  id: string;
  status: string;
  match_score: number | null;
  applied_at: string;
  profile: {
    id: string;
    full_name: string | null;
    headline: string | null;
  } | null;
  job: {
    id: string;
    title: string;
    company: string;
  } | null;
  resume: { id: string; title: string } | null;
}

function summaryLabel(status: string) {
  const labels: Record<string, string> = {
    applied: "Waiting review",
    reviewing: "Reviewing",
    interview: "Interview",
    interviewing: "Interview",
    offer: "Offer",
    offered: "Offer",
    rejected: "Rejected",
    hired: "Hired",
  };

  return labels[status.toLowerCase()] ?? status;
}

export function EmployerDashboardOverview({
  jobs,
  applications,
  organizationName,
  recruiterName,
}: {
  jobs: EmployerDashboardJob[];
  applications: EmployerDashboardApplication[];
  organizationName: string | null;
  recruiterName: string | null;
}) {
  const activeJobs = jobs.length;
  const totalApplicants = applications.length;
  const needsReview = applications.filter((application) =>
    ["applied", "reviewing"].includes(application.status.toLowerCase())
  ).length;
  const recentJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
          Hiring activity
        </h1>
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          Track active roles, applicant flow, and the next review actions that need your attention.
        </p>
        {(organizationName || recruiterName) && (
          <p className="mt-2 text-xs font-medium text-text-muted">
            {[organizationName, recruiterName].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Active jobs</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{activeJobs}</p>
            </div>
            <div className="rounded-xl border border-border bg-accent-soft p-2.5 text-foreground">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Total applicants</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{totalApplicants}</p>
            </div>
            <div className="rounded-xl border border-border bg-accent-soft p-2.5 text-foreground">
              <Users className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Needs review</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{needsReview}</p>
            </div>
            <div className="rounded-xl border border-border bg-accent-soft p-2.5 text-foreground">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">Hiring overview</h2>
              <p className="mt-1 text-xs text-text-secondary">Your active pipeline and the next steps.</p>
            </div>
            <Link href="/dashboard/employer/jobs">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                Manage jobs
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-border bg-background/45 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">{job.company}</p>
                    </div>
                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                    {job.location && <span>{job.location}</span>}
                    {job.location && job.employment_type && <span>·</span>}
                    {job.employment_type && <span>{job.employment_type}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background/45 p-4 text-sm text-text-secondary">
                No active roles yet. Post your first job to begin receiving applicants.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">Priority action</p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground">
              {needsReview > 0 ? "Review applicants" : "Keep hiring momentum"}
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {needsReview > 0
              ? `${needsReview} candidate${needsReview === 1 ? "" : "s"} are waiting for your review. Start with the newest application to keep the pipeline moving.`
              : "Your hiring pipeline is clear. Post a new role or refresh an existing opening to keep attracting candidates."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link href="/dashboard/employer/candidates">
              <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
                Review candidates
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/dashboard/employer/jobs/new">
              <Button variant="outline" size="sm" className="text-xs font-medium">
                Post a job
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Recent applicants</h2>
            <p className="mt-1 text-xs text-text-secondary">Recent candidate activity across your roles.</p>
          </div>
          <Link href="/dashboard/employer/candidates" className="text-xs font-medium text-foreground underline-offset-4 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {recentApplications.length > 0 ? (
            recentApplications.map((application) => (
              <div
                key={application.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border border-border bg-background/45 p-3.5 md:flex-row md:items-center md:justify-between"
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {application.profile?.full_name ?? "Unnamed candidate"}
                  </p>
                  {application.resume?.title && (
                    <p className="mt-0.5 text-xs font-medium text-foreground/80">{application.resume.title}</p>
                  )}
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {application.job?.title ?? "Role"} · {application.job?.company ?? "Company"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {typeof application.match_score === "number" && (
                    <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                      Match {Math.round((application.match_score / 25) * 100)}%
                    </Badge>
                  )}
                  <Badge variant={application.status.toLowerCase() === "applied" ? "secondary" : "outline"} className="px-2 py-0.5 text-[10px]">
                    {summaryLabel(application.status)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background/45 p-4 text-sm text-text-secondary">
              No applications yet. Once candidates apply to your roles, they will appear here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
