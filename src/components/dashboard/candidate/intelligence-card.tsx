import Link from "next/link";
import { Sparkles, Check, AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IntelligenceCardProps {
  hasResume: boolean;
  completenessScore: number;
  parseabilityScore: number;
  healthPercentage: number;
  hasSummary: boolean;
  skillsCount: number;
  hasExperienceOrProjects: boolean;
}

export function IntelligenceCard({
  hasResume,
  completenessScore,
  parseabilityScore,
  healthPercentage,
  hasSummary,
  skillsCount,
  hasExperienceOrProjects,
}: IntelligenceCardProps) {
  return (
    <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-border-dark bg-surface-dark p-5 text-white shadow-[0_1px_0_rgba(17,18,17,0.04)] md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-dark pb-3">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Diagnostics
          </span>
          <h2 className="mt-1 text-base font-bold tracking-tight text-white">
            ATS Readiness
          </h2>
        </div>

        <Link
          href="/dashboard/candidate/resume"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "h-8 gap-1.5 rounded-lg bg-white px-2.5 text-xs font-medium text-surface-dark transition-colors duration-150 hover:bg-white/90"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Polish</span>
        </Link>
      </div>

      {/* Dominant Value with Secondary Metadata (No individual boxes) */}
      <div className="py-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {hasResume ? `${healthPercentage}%` : "—"}
          </span>
          <span className="text-xs font-medium text-white/60">
            {hasResume
              ? healthPercentage >= 75
                ? "Optimal Pass Index"
                : "Needs Review"
              : "No Resume"}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-white/60 font-mono">
          <span>
            Completeness: <strong className="font-medium text-white">{completenessScore}/20</strong>
          </span>
          <span className="text-white/30">·</span>
          <span>
            Structure: <strong className="font-medium text-white">{parseabilityScore}/35</strong>
          </span>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-white/65">
          Higher scores indicate stronger ATS compatibility and cleaner resume structure.
        </p>
      </div>

      {/* Diagnostic Checklist */}
      <div className="space-y-1.5 border-t border-border-dark pt-2 text-xs">
        <div className="flex items-center justify-between border-b border-white/5 py-1">
          <span className="text-white/70">Summary Section</span>
          {hasSummary ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Missing
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-b border-white/5 py-1">
          <span className="text-white/70">Skills Index</span>
          {skillsCount >= 3 ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-success">
              <Check className="h-3.5 w-3.5" /> {skillsCount} Listed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Add 3+
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-white/70">Experience / Projects</span>
          {hasExperienceOrProjects ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Populated
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Incomplete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
