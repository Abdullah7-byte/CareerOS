"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ScanLine } from "lucide-react";
import { formatMatchScore } from "@/lib/utils";

export type MatchAnalysisState =
  | { status: "idle" }
  | { status: "activating" | "locking" | "scanning" | "verifying"; step: number }
  | { status: "resolved"; score: number }
  | { status: "error"; message: string };

const ANALYSIS_DURATION = 5200;
const RESULT_HOLD_DURATION = 1300;
const SCAN_STEPS = ["Skills", "Experience", "Projects", "Role fit"] as const;

function wait(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}

export function useMatchAnalysis() {
  const [analysis, setAnalysis] = useState<MatchAnalysisState>({ status: "idle" });
  const timers = useRef<number[]>([]);
  const interval = useRef<number | null>(null);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    if (interval.current !== null) window.clearInterval(interval.current);
  }, []);

  function clearAnimation() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    if (interval.current !== null) window.clearInterval(interval.current);
    interval.current = null;
  }

  async function run<T extends { success: boolean; data?: { match_score?: number | null }; error?: string }>(task: () => Promise<T>) {
    clearAnimation();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnalysis({ status: "activating", step: 0 });
    const startedAt = performance.now();
    if (!reducedMotion) {
      timers.current.push(window.setTimeout(() => setAnalysis({ status: "locking", step: 0 }), 800));
      timers.current.push(window.setTimeout(() => {
        setAnalysis({ status: "scanning", step: 0 });
        interval.current = window.setInterval(() => {
          setAnalysis((current) => current.status === "scanning"
            ? { status: "scanning", step: Math.min(current.step + 1, SCAN_STEPS.length) }
            : current);
        }, 750);
      }, 1600));
      timers.current.push(window.setTimeout(() => {
        if (interval.current !== null) window.clearInterval(interval.current);
        interval.current = null;
        setAnalysis({ status: "verifying", step: SCAN_STEPS.length });
      }, 4900));
    }
    const result = await task();
    const remaining = reducedMotion ? 0 : Math.max(0, ANALYSIS_DURATION - (performance.now() - startedAt));
    await wait(remaining);
    clearAnimation();

    if (!result.success) {
      setAnalysis({ status: "error", message: result.error ?? "Match analysis failed. Please try again." });
      return result;
    }

    const score = result.data?.match_score;
    if (typeof score !== "number") {
      setAnalysis({ status: "error", message: "Match analysis did not return a score. Please try again." });
      return result;
    }

    setAnalysis({ status: "resolved", score });
    await wait(reducedMotion ? 0 : RESULT_HOLD_DURATION);
    return result;
  }

  function resetAnalysis() {
    clearAnimation();
    setAnalysis({ status: "idle" });
  }

  return { analysis, run, resetAnalysis };
}

export function MatchAnalysisPanel({ analysis, jobTitle, resumeTitle }: { analysis: MatchAnalysisState; jobTitle: string; resumeTitle: string }) {
  if (analysis.status === "idle") return null;

  const step = "step" in analysis ? analysis.step : SCAN_STEPS.length;
  const isResolved = analysis.status === "resolved";
  const isError = analysis.status === "error";

  if (analysis.status === "resolved") {
    return (
      <div className="match-analysis-panel mx-auto w-full max-w-[17rem]" aria-live="polite">
        <div className="match-analysis-result flex h-[72px] items-center justify-center rounded-md border border-border bg-[#fcfbf9] px-2 text-center shadow-[0_5px_12px_rgba(17,17,17,0.06)]">
          <p className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.14em] text-foreground">Job match <span className="ml-1.5 text-2xl font-bold tabular-nums tracking-tight">{formatMatchScore(analysis.score)}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`match-analysis-panel match-analysis-panel-${analysis.status} mx-auto w-full max-w-[17rem]`} aria-live="polite">
      {!isResolved && <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">CareerOS analysis</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">{isError ? "Analysis paused" : "Resume / role comparison"}</p>
      </div>}

      <div className={`match-analysis-stage ${isResolved ? "match-analysis-stage-resolved" : "mt-3"} [perspective:800px]`}>
        <div className={`match-analysis-card match-analysis-card-${analysis.status} relative overflow-hidden rounded-md border border-border bg-[#fcfbf9] [transform-style:preserve-3d]`}>
          <div className="match-analysis-resume flex min-h-[64px] items-center justify-between gap-2.5 px-2.5 py-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Selected resume</p>
              <p className="mt-1 truncate text-sm font-bold text-foreground">{resumeTitle}</p>
              <p className="mt-0.5 text-[11px] text-text-secondary">Locked for comparison</p>
            </div>
            <div className="match-analysis-lock flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground">
              <Check className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="match-analysis-module px-2.5 pb-2.5">
            <div className="flex items-center justify-between border-t border-border pt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
              <span>{jobTitle}</span>
              <ScanLine className="match-analysis-scan h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="match-analysis-rail mt-2" aria-hidden="true"><span /></div>
            <div className="mt-2 space-y-1" role="status" aria-label="Resume analysis progress">
        {SCAN_STEPS.map((label, index) => {
          const isVerified = isResolved || analysis.status === "verifying" || (analysis.status === "scanning" && index < step);
          const isScanning = analysis.status === "scanning" && index === step;
          return (
            <div key={label} className={`match-analysis-step ${isVerified ? "is-verified" : ""} ${isScanning ? "is-scanning" : ""} flex items-center justify-between border-b border-border/70 pb-1 text-xs`}>
              <span className="font-medium uppercase tracking-[0.12em]">{label}</span>
              <span className="match-analysis-step-state flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
                {isVerified && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {isVerified ? "Verified" : isScanning ? "Scanning" : "Queued"}
              </span>
            </div>
          );
        })}
            </div>
          </div>

          {isError && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#fcfbf9] px-6 text-center text-xs font-medium text-error">{analysis.message}</div>}
        </div>
        {!isResolved && !isError && <div className="match-analysis-beam" aria-hidden="true" />}
      </div>

      {!isResolved && <p className="mt-2 text-[11px] text-text-secondary">Comparing the selected resume with this role.</p>}
    </div>
  );
}

/** A static representation of the same resume-to-role analysis used during application submission. */
export function MatchAnalysisPreview({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full rounded-md border border-border bg-[#fcfbf9] p-5 ${className}`} aria-label="CareerOS role match preview">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Match</p>
      <div className="mt-4 flex items-start justify-between text-sm font-semibold text-foreground"><span>Resume</span><span>Job</span></div>
      <div className="mt-2 border-t border-border" />
      <div className="mt-5 flex items-baseline gap-2"><span className="text-4xl font-bold tracking-[-0.065em] text-foreground">92%</span><span className="text-sm font-medium text-text-secondary">Match</span></div>
      <div className="mt-5 grid grid-cols-2 gap-y-2.5 text-[11px] font-medium text-text-secondary">{SCAN_STEPS.map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-foreground" />{item}</span>)}</div>
    </div>
  );
}
