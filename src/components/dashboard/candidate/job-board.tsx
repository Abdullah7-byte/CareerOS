"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  ArrowRight,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { createApplication } from "@/app/action/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEmploymentType } from "@/lib/job-employment-types";
import { formatCandidateDashboardDate, formatMatchScore } from "@/lib/utils";
import { MatchAnalysisPanel, useMatchAnalysis } from "./match-analysis";

export interface ResumeOption {
  id: string;
  title: string;
  updated_at: string;
}

export interface JobBoardItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  employmentType: string | null;
  createdAt: string;
  application: {
    id: string;
    status: string;
    matchScore: number | null;
    appliedAt: string;
  } | null;
}

interface JobBoardProps {
  jobs: JobBoardItem[];
  employmentTypes: string[];
  hasResume: boolean;
  resumes?: ResumeOption[];
  filters: {
    search: string;
    employmentType: string;
    order: "newest" | "oldest";
  };
}

function formatDate(date: string) {
  return `Posted ${formatCandidateDashboardDate(date, { month: "short", day: "numeric" })}`;
}

function formatSubmissionDate(date: string) {
  return `Submitted ${formatCandidateDashboardDate(date, { month: "short", day: "numeric" })}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    applied: "Application sent",
    reviewing: "Under review",
    interview: "Interview stage",
    interviewing: "Interview stage",
    offer: "Offer received",
    offered: "Offer received",
    rejected: "Not selected",
    hired: "Hired",
    withdrawn: "Withdrawn",
  };

  return labels[status.toLowerCase()] ?? status;
}

export function JobBoard({ jobs, employmentTypes, hasResume, resumes = [], filters }: JobBoardProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
          Explore jobs
        </h1>
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          Browse verified openings matched to your profile.
        </p>
      </header>

      <JobBoardFilters
        key={`${filters.search}-${filters.employmentType}-${filters.order}`}
        employmentTypes={employmentTypes}
        filters={filters}
      />

      <section aria-labelledby="job-results-heading">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <div>
            <h2 id="job-results-heading" className="text-sm font-bold tracking-tight text-foreground">
              Open positions
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary" aria-live="polite">
              {jobs.length === 1 ? "1 matching position" : `${jobs.length} matching positions`}
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <JobBoardEmpty hasFilters={Boolean(filters.search || filters.employmentType)} />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} hasResume={hasResume} resumes={resumes} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JobBoardFilters({
  employmentTypes,
  filters,
}: Pick<JobBoardProps, "employmentTypes" | "filters">) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search);
  const initializedSearch = useRef(filters.search);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (search === initializedSearch.current) return;
    const timer = window.setTimeout(() => updateParams({ q: search.trim() }), 300);
    return () => window.clearTimeout(timer);
  // updateParams intentionally reads the current URL each time a search is committed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <section aria-label="Search and filter jobs" className="rounded-xl border border-border bg-surface p-2.5 shadow-xs sm:p-3">
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_10.5rem_9rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, company, or keyword"
            aria-label="Search jobs"
            className="h-10 border-border-strong bg-background/45 pl-9 shadow-none"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <select
            value={filters.employmentType}
            onChange={(event) => updateParams({ type: event.target.value })}
            aria-label="Filter by employment type"
            className="motion-field h-10 w-full appearance-none rounded-md border border-border bg-surface py-2 pl-8 pr-8 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">All types</option>
            {employmentTypes.map((employmentType) => (
              <option key={employmentType} value={employmentType}>
                {employmentType}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        </div>
        <div className="relative">
          <select
            value={filters.order}
            onChange={(event) => updateParams({ sort: event.target.value === "oldest" ? "oldest" : "" })}
            aria-label="Sort jobs"
            className="motion-field h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-8 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function JobCard({ job, hasResume, resumes }: { job: JobBoardItem; hasResume: boolean; resumes: ResumeOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(resumes[0]?.id ?? null);
  const { analysis, run: runAnalysis, resetAnalysis } = useMatchAnalysis();

  function openApplyDialog() {
    if (!hasResume) {
      router.push("/dashboard/candidate/resume");
      return;
    }

    if (!selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }

    setError(null);
    resetAnalysis();
    setResumeDialogOpen(true);
  }

  function apply() {
    if (!hasResume) {
      setError("Resume required to apply. Create a resume to unlock job applications.");
      return;
    }

    if (resumes.length === 0) {
      setError("Create a resume before applying.");
      return;
    }

    if (!selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }

    const resumeToSubmit = selectedResumeId ?? resumes[0].id;

    setError(null);
    startTransition(async () => {
      const result = await runAnalysis(() => createApplication(job.id, resumeToSubmit));
      if (result.success) {
        setResumeDialogOpen(false);
        resetAnalysis();
        router.refresh();
      } else {
        setError(result.error || "We couldn't submit your application.");
      }
    });
  }

  const preview = job.description?.replace(/\s+/g, " ").trim();

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_0_rgba(17,18,17,0.02)] transition-colors duration-150 hover:border-border-strong sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-[17px]">{job.title}</h3>
            <p className="mt-0.5 text-sm font-medium text-foreground/80">{job.company}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
            {job.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-text-muted" aria-hidden="true" />{job.location}</span>
            )}
            {job.location && (job.employmentType || job.createdAt) && <span className="text-text-muted">·</span>}
            {job.employmentType && (
              <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3 text-text-muted" aria-hidden="true" />{formatEmploymentType(job.employmentType)}</span>
            )}
            {job.employmentType && <span className="text-text-muted">·</span>}
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3 text-text-muted" aria-hidden="true" />{formatDate(job.createdAt)}</span>
          </div>

          {preview && <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-5 text-text-secondary">{preview}</p>}

          {job.application && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
              {job.application.matchScore !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">Match</span>
                  <span className="font-semibold tabular-nums text-foreground">{formatMatchScore(job.application.matchScore)}</span>
                </span>
              )}
              <span>{formatSubmissionDate(job.application.appliedAt)}</span>
            </div>
          )}

          {!hasResume && !job.application && (
            <p className="mt-2.5 text-[11px] font-medium text-warning">Resume required to apply. Create a resume to unlock job applications.</p>
          )}
          {error && <p role="alert" className="mt-2.5 text-xs font-medium text-error">{error}</p>}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:pt-1">
          {resumes.length > 1 && !job.application && (
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground hover:border-border-strong"
              onClick={() => setResumeDialogOpen(true)}
            >
              {selectedResumeId ? "Resume: " + (resumes.find((resume) => resume.id === selectedResumeId)?.title ?? "Selected") : "Select resume"}
            </button>
          )}
          {job.application ? (
            <>
              <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-[#f2f1ee] px-2.5 text-xs font-medium text-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <Check className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                <span>{statusLabel(job.application.status)}</span>
              </div>
              <Link
                href={`/dashboard/candidate/applications?application=${job.application.id}`}
                className="motion-interactive inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              >
                View application
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <Button
              size="sm"
              onClick={hasResume ? openApplyDialog : () => router.push("/dashboard/candidate/resume")}
              disabled={isPending}
              className="min-w-[7.5rem] gap-1.5 justify-center"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span key={isPending ? "applying" : "ready"} className={isPending ? "motion-status" : undefined}>
                {isPending ? "Submitting..." : hasResume ? "Apply" : "Add resume"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {resumeDialogOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,17,17,0.03)] p-4">
          <div className={`w-full border border-border bg-surface ${analysis.status === "idle" ? "max-w-md rounded-2xl p-5 shadow-[0_12px_36px_rgba(17,17,17,0.08)]" : analysis.status === "resolved" ? "max-w-[17rem] rounded-md p-0 shadow-[0_5px_16px_rgba(17,17,17,0.07)]" : "max-w-[20rem] rounded-2xl p-3 shadow-[0_12px_36px_rgba(17,17,17,0.08)]"}`}>
            {analysis.status === "idle" ? (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Apply</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">{job.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {job.company} · {job.location ?? "Remote"} · {job.employmentType ? formatEmploymentType(job.employmentType) : "Role"}
              </p>
            </div>
            ) : (
              <MatchAnalysisPanel
                analysis={analysis}
                jobTitle={job.title}
                resumeTitle={resumes.find((resume) => resume.id === selectedResumeId)?.title ?? "Selected resume"}
              />
            )}

            {analysis.status === "idle" && <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Choose a resume</p>
              {resumes.length > 1 ? (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      type="button"
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${selectedResumeId === resume.id ? "border-foreground bg-accent-soft" : "border-border bg-background hover:border-border-strong"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{resume.title}</div>
                          <div className="mt-1 text-[11px] text-text-secondary">
                            Updated {new Date(resume.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        {selectedResumeId === resume.id && <Check className="h-4 w-4 text-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="text-sm font-semibold text-foreground">{resumes[0]?.title ?? "Resume"}</div>
                  <div className="mt-1 text-[11px] text-text-secondary">Selected for this application</div>
                </div>
              )}
            </div>}

            {error && analysis.status === "idle" && <p className="mb-3 text-xs font-medium text-error">{error}</p>}

            {(analysis.status === "error" || analysis.status === "idle") && <div className="mt-4 flex justify-end gap-2">
              {analysis.status === "error" ? (
                <Button type="button" size="sm" onClick={resetAnalysis}>Try again</Button>
              ) : analysis.status === "idle" ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => setResumeDialogOpen(false)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={apply} disabled={isPending}>Apply</Button>
                </>
              ) : null}
            </div>}
          </div>
        </div>,
        document.body
      )}
    </article>
  );
}

function JobBoardEmpty({ hasFilters }: { hasFilters: boolean }) {
  const router = useRouter();

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-text-secondary">
        <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-base font-bold tracking-tight text-foreground">
        {hasFilters ? "No matching positions" : "No open positions yet"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-text-secondary">
        {hasFilters
          ? "Try broadening your search or choosing a different employment type."
          : "New verified opportunities will appear here as soon as employers publish them."}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={() => router.replace("/dashboard/candidate/jobs")} className="mt-5">
          Clear filters
        </Button>
      )}
    </div>
  );
}
