"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Send,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCandidateDashboardDate } from "@/lib/utils";
import { createApplication } from "@/app/action/applications";
import { useRouter } from "next/navigation";
import type { ResumeOption } from "./job-board";
import { MatchAnalysisPanel, useMatchAnalysis } from "./match-analysis";

export interface JobMatchItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  description: string | null;
  createdAt: string;
  hasApplied: boolean;
}

interface JobRecommendationsProps {
  jobs: JobMatchItem[];
  hasResume: boolean;
  resumes: ResumeOption[];
}

export function JobRecommendations({ jobs, hasResume, resumes }: JobRecommendationsProps) {
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [resumeDialogJobId, setResumeDialogJobId] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(resumes[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const { analysis, run: runAnalysis, resetAnalysis } = useMatchAnalysis();
  const router = useRouter();

  function openQuickApply(jobId: string) {
    if (!hasResume) {
      setApplyError("Resume required to apply. Create a resume to unlock job applications.");
      return;
    }

    setApplyError(null);
    resetAnalysis();
    setSelectedResumeId((current) => current ?? resumes[0]?.id ?? null);
    setResumeDialogJobId(jobId);
  }

  async function handleQuickApply() {
    if (!resumeDialogJobId || !selectedResumeId) {
      setApplyError("Select a resume before applying.");
      return;
    }

    setApplyingJobId(resumeDialogJobId);
    setApplyError(null);

    startTransition(async () => {
      try {
        const res = await runAnalysis(() => createApplication(resumeDialogJobId, selectedResumeId));
        if (!res.success) {
          setApplyError(res.error || "Application failed. Please try again.");
        } else {
          setApplyError(null);
          setResumeDialogJobId(null);
          resetAnalysis();
          router.refresh();
        }
      } catch (err: unknown) {
        setApplyError(err instanceof Error ? err.message : "Application failed. Please try again.");
      } finally {
        setApplyingJobId(null);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(17,18,17,0.02)] md:p-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Recommended Positions
          </h2>
          <p className="mt-1 text-[11px] text-text-secondary">
            Verified roles tailored to your experience profile
          </p>
        </div>

        <Link
          href="/dashboard/candidate/jobs"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-accent-soft"
          )}
        >
          <span>All roles</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {applyError && (
        <div className="rounded-md border border-error/30 bg-error/10 p-2 text-xs text-error">
          {applyError}
        </div>
      )}

      {!hasResume && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-2 text-[11px] text-warning">
          Create a resume to unlock application submissions.
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-2.5 px-3 text-center bg-background/25">
          <div className="flex items-center justify-center gap-1.5 text-text-secondary">
            <Briefcase className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span className="text-xs font-medium text-foreground">
              No active roles right now
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            Verified employer openings will appear here as soon as they are published.
          </p>
          <Link
            href="/dashboard/candidate/jobs"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-3 h-7 text-[11px] px-2.5 rounded-md"
            )}
          >
            Browse all roles
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.slice(0, 4).map((job) => {
            const isApplying = applyingJobId === job.id && isPending;

            return (
              <div
                key={job.id}
                className="rounded-xl border border-border bg-background/50 p-3.5 transition-colors hover:border-border-strong hover:bg-background/70"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {job.title}
                      </span>
                      {job.employmentType && (
                        <span className="rounded bg-accent-soft px-1.5 py-0.2 text-[10px] font-medium text-text-secondary">
                          {job.employmentType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 text-[11px] text-text-secondary">
                      <span className="font-semibold text-foreground/80">
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1 text-text-muted">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-text-muted">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatCandidateDashboardDate(job.createdAt, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2">
                    {job.hasApplied ? (
                      <>
                        <Badge variant="success" className="gap-1 px-2 py-0.5 text-[11px] font-normal">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Application sent</span>
                        </Badge>
                        <Link
                          href="/dashboard/candidate/applications"
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium"
                          )}
                        >
                          <span>View application</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isApplying}
                        onClick={() => openQuickApply(job.id)}
                        className="h-8 gap-1 rounded-lg bg-foreground px-2.5 text-xs font-medium text-surface transition-colors duration-150 hover:bg-foreground/90"
                      >
                        <Send className="h-3 w-3" />
                        <span>{isApplying ? "Submitting..." : "Apply"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resumeDialogJobId && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,17,17,0.03)] p-4">
          <div className={`w-full border border-border bg-surface ${analysis.status === "idle" ? "max-w-md rounded-2xl p-5 shadow-[0_12px_36px_rgba(17,17,17,0.08)]" : analysis.status === "resolved" ? "max-w-[17rem] rounded-md p-0 shadow-[0_5px_16px_rgba(17,17,17,0.07)]" : "max-w-[20rem] rounded-2xl p-3 shadow-[0_12px_36px_rgba(17,17,17,0.08)]"}`}>
            {analysis.status === "idle" ? <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Quick apply</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">Choose a resume</h3>
              <p className="mt-1 text-sm text-text-secondary">Select the resume to submit with this application.</p>
            </div> : (
              <MatchAnalysisPanel
                analysis={analysis}
                jobTitle={jobs.find((job) => job.id === resumeDialogJobId)?.title ?? "Selected role"}
                resumeTitle={resumes.find((resume) => resume.id === selectedResumeId)?.title ?? "Selected resume"}
              />
            )}
            {analysis.status === "idle" && <div className="space-y-2">
              {resumes.map((resume) => (
                <button
                  key={resume.id}
                  type="button"
                  onClick={() => setSelectedResumeId(resume.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${selectedResumeId === resume.id ? "border-foreground bg-accent-soft text-foreground" : "border-border text-text-secondary hover:bg-background"}`}
                >
                  <span className="font-medium">{resume.title}</span>
                  {selectedResumeId === resume.id && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                </button>
              ))}
            </div>}
            {(analysis.status === "error" || analysis.status === "idle") && <div className="mt-5 flex justify-end gap-2">
              {analysis.status === "error" ? (
                <Button type="button" size="sm" onClick={resetAnalysis}>Try again</Button>
              ) : analysis.status === "idle" ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => setResumeDialogJobId(null)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={handleQuickApply} disabled={isPending || !selectedResumeId}>Apply</Button>
                </>
              ) : null}
            </div>}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
