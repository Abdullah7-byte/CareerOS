import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatMatchScore } from "@/lib/utils";

export interface CandidateApplicationItem {
  id: string;
  jobId: string;
  matchScore: number | null;
  status: string;
  appliedAt: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    employmentType: string | null;
  } | null;
}

interface ApplicationTrackerProps {
  applications: CandidateApplicationItem[];
}

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <Badge variant="secondary" className="text-[10px] font-medium py-0 px-2">Submitted</Badge>;
      case "reviewing":
        return <Badge variant="warning" className="text-[10px] font-medium py-0 px-2">Reviewing</Badge>;
      case "interviewing":
        return <Badge variant="ai" className="text-[10px] font-medium py-0 px-2">Interviewing</Badge>;
      case "offered":
        return <Badge variant="success" className="text-[10px] font-medium py-0 px-2">Offered</Badge>;
      case "rejected":
        return <Badge variant="error" className="text-[10px] font-medium py-0 px-2">Declined</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-medium py-0 px-2">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(17,18,17,0.02)] md:p-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Recent activity
          </h2>
          <p className="mt-1 text-[11px] text-text-secondary">
            {applications.length > 0
              ? `${applications.length} recent submissions and updates`
              : "No recent applications yet"}
          </p>
        </div>

        <Link
          href="/dashboard/candidate/applications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-accent-soft"
          )}
        >
          <span>Full history</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-2.5 px-3 text-center bg-background/25">
          <div className="flex items-center justify-center gap-1.5 text-text-secondary">
            <Inbox className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span className="text-xs font-medium text-foreground">
              No applications submitted yet
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            Submit a role to keep track of recruiter responses and interview progress.
          </p>
          <Link
            href="/dashboard/candidate/jobs"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-3 h-7 text-[11px] px-2.5 rounded-md"
            )}
          >
            Browse roles
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.slice(0, 4).map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-border bg-background/50 px-3.5 py-2.5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-foreground truncate">
                    {app.job?.title || "Role Application"}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span className="truncate">{app.job?.company || "Company"}</span>
                    {app.matchScore !== null && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px] font-medium text-text-muted">
                          {formatMatchScore(app.matchScore)} match
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {getStatusBadge(app.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
