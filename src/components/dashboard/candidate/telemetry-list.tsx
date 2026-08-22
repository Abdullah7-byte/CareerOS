import Link from "next/link";
import { ChevronRight, ShieldCheck, Send, Briefcase } from "lucide-react";

interface TelemetryListProps {
  atsScore: number;
  hasResume: boolean;
  appliedCount: number;
  jobCount: number;
}

export function TelemetryList({
  atsScore,
  hasResume,
  appliedCount,
  jobCount,
}: TelemetryListProps) {
  const readinessStatus = hasResume
    ? atsScore >= 75
      ? "Optimal"
      : "Needs Polish"
    : "Pending Setup";

  return (
    <div className="space-y-3">
      {/* 1. ATS Readiness (Status only, percentage in Diagnostics) */}
      <Link
        href="/dashboard/candidate/resume"
        className="group flex items-center justify-between rounded-2xl border border-border bg-surface p-3.5 shadow-[0_1px_0_rgba(17,18,17,0.02)] transition-all duration-150 hover:border-border-strong hover:bg-background/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              ATS Readiness
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {readinessStatus}
            </p>
            <p className="mt-0.5 text-[10px] text-text-secondary">Resume quality and structure</p>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>

      {/* 2. Applications (De-emphasized when empty) */}
      <Link
        href="/dashboard/candidate/applications"
        className="group flex items-center justify-between rounded-2xl border border-border bg-background/45 p-3.5 shadow-[0_1px_0_rgba(17,18,17,0.02)] transition-all duration-150 hover:border-border-strong hover:bg-background/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-foreground">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Applications
            </p>
            {appliedCount > 0 ? (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">
                  {appliedCount}
                </span>
                <span className="text-xs text-text-secondary">In pipeline</span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-text-muted">
                No active applications
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>

      {/* 3. Verified Roles (De-emphasized when empty) */}
      <Link
        href="/dashboard/candidate/jobs"
        className="group flex items-center justify-between rounded-2xl border border-border bg-background/35 p-3.5 shadow-[0_1px_0_rgba(17,18,17,0.02)] transition-all duration-150 hover:border-border-strong hover:bg-background/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Verified roles
            </p>
            {jobCount > 0 ? (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">
                  {jobCount}
                </span>
                <span className="text-xs text-text-secondary">Open roles</span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-text-muted">
                No open roles
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>
    </div>
  );
}
