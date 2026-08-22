import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CandidateHeroProps {
  fullName: string | null;
  headline: string | null;
  hasResume: boolean;
  atsScore: number;
  skillsCount: number;
  hasSummary: boolean;
  appliedCount: number;
}

export function CandidateHero({
  fullName,
  headline,
  hasResume,
  atsScore,
  skillsCount,
  hasSummary,
  appliedCount,
}: CandidateHeroProps) {
  const firstName = fullName ? fullName.split(" ")[0] : "Candidate";

  // Derive Next Best Action based on real data
  let nextAction = {
    title: "Create your first resume",
    description: "Add your work history, skills, and summary to unlock automated ATS evaluation.",
    cta: "Build Resume",
    href: "/dashboard/candidate/resume",
  };

  if (hasResume) {
    if (!hasSummary) {
      nextAction = {
        title: "Add a summary to your resume",
        description: "A professional summary significantly improves recruiter parseability scores.",
        cta: "Add Summary",
        href: "/dashboard/candidate/resume",
      };
    } else if (skillsCount < 3) {
      nextAction = {
        title: "Add at least 3 core skills",
        description: "Skills allow CareerOS to calculate accurate job relevance matches.",
        cta: "Add Skills",
        href: "/dashboard/candidate/resume",
      };
    } else if (appliedCount === 0) {
      nextAction = {
        title: "Submit your first application",
        description: "Your resume is ready. Apply directly to verified employer positions.",
        cta: "Browse Jobs",
        href: "/dashboard/candidate/jobs",
      };
    } else {
      nextAction = {
        title: "Review new matching roles",
        description: "Explore newly published positions matching your experience profile.",
        cta: "View Roles",
        href: "/dashboard/candidate/jobs",
      };
    }
  }

  const isAtsReady = atsScore >= 75;

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-[#f8f6f3] p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {hasResume && (
              <Badge variant={isAtsReady ? "success" : "warning"} className="px-2 py-0.5 text-[10px] font-normal">
                {isAtsReady ? "ATS Ready" : "Needs Polish"}
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[2rem]">
              Hi {firstName}.
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              {headline || "Track your applications, monitor ATS readiness, and review verified employer openings."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:max-w-md">
            <div className="rounded-xl border border-border bg-white/80 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.12em] text-text-muted">ATS</p>
              <p className="mt-1.5 text-sm font-bold text-foreground">{hasResume ? `${atsScore}%` : "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-white/80 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.12em] text-text-muted">Applied</p>
              <p className="mt-1.5 text-sm font-bold text-foreground">{appliedCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-white/80 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.12em] text-text-muted">Open roles</p>
              <p className="mt-1.5 text-sm font-bold text-foreground">{hasResume ? "6" : "—"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={nextAction.href}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 bg-accent text-surface text-xs font-medium hover:bg-accent-strong"
              )}
            >
              <span>{nextAction.cta}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/dashboard/candidate/resume"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs font-medium text-foreground hover:bg-accent-soft"
              )}
            >
              View Resume
            </Link>
          </div>
        </div>

        <div className="w-full rounded-[18px] border border-border bg-white/70 p-4 lg:max-w-xs">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Priority action
            </span>
            <h3 className="text-sm font-bold text-foreground">{nextAction.title}</h3>
            <p className="text-xs leading-5 text-text-secondary">{nextAction.description}</p>
            <Link
              href={nextAction.href}
              className="inline-flex items-center gap-1 font-semibold text-foreground transition-colors duration-150 hover:underline"
            >
              <span>{nextAction.cta}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
