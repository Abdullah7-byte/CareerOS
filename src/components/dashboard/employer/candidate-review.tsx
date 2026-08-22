"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, CheckCheck, FileText, Search, Users } from "lucide-react";
import { updateApplicationStatus } from "@/app/action/applications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCandidateDashboardDate } from "@/lib/utils";

export interface EmployerApplicant {
  id: string;
  profile_id: string;
  status: string;
  match_score: number | null;
  applied_at: string;
  full_name: string | null;
  headline: string | null;
  resume_title: string | null;
  job_title: string;
  company: string;
  location: string | null;
}

function normalizeStatusKey(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "interviewing") return "interview";
  if (normalized === "offered") return "offer";
  return normalized;
}

function statusLabel(status: string) {
  const key = normalizeStatusKey(status);
  const labels: Record<string, string> = {
    applied: "Applied",
    reviewing: "Under review",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    hired: "Hired",
  };

  return labels[key] ?? status;
}

export function EmployerCandidatesBoard({ applicants }: { applicants: EmployerApplicant[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");

  const visibleApplicants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applicants.filter((applicant) => {
      const matchesQuery =
        !q ||
        applicant.full_name?.toLowerCase().includes(q) ||
        applicant.job_title.toLowerCase().includes(q) ||
        applicant.company.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || normalizeStatusKey(applicant.status) === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [applicants, query, statusFilter]);

  function updateQueryParams(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery) params.set("q", nextQuery); else params.delete("q");
    if (nextStatus) params.set("status", nextStatus); else params.delete("status");
    const url = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${window.location.pathname}${url}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
          Candidates
        </h1>
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          Review applicants across your roles and move each candidate through the hiring pipeline.
        </p>
      </header>

      <Card className="p-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                updateQueryParams(value, statusFilter);
              }}
              placeholder="Search candidates or roles"
              className="h-10 pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value;
              setStatusFilter(value);
              updateQueryParams(query, value);
            }}
            className="motion-field h-10 rounded-md border border-border bg-[#fbfbf9] px-3 text-sm text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Filter candidates by status"
          >
            <option value="">All statuses</option>
            <option value="applied">Applied</option>
            <option value="reviewing">Under review</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </Card>

      {visibleApplicants.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent-soft text-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">No candidates to review</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                You’re caught up for now. New applicants will appear here as soon as they apply to your roles.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleApplicants.map((applicant) => (
            <Card key={applicant.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight text-foreground">{applicant.full_name ?? "Unnamed candidate"}</h2>
                    {typeof applicant.match_score === "number" && (
                      <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                        Match {Math.round((applicant.match_score / 25) * 100)}%
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-text-secondary">
                    {applicant.headline ?? "No headline provided yet"}
                  </p>

                  {applicant.resume_title && (
                    <p className="mt-2 text-xs font-medium text-foreground/80">
                      Submitted resume: {applicant.resume_title}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
                    <span>{applicant.job_title}</span>
                    <span>·</span>
                    <span>{applicant.company}</span>
                    {applicant.location && (
                      <>
                        <span>·</span>
                        <span>{applicant.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                    {statusLabel(applicant.status)}
                  </Badge>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/employer/candidates/${applicant.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                        Review
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmployerCandidateDetail({
  application,
  candidate,
}: {
  application: {
    id: string;
    status: string;
    match_score: number | null;
    applied_at: string;
    resume_id: string | null;
    resume: { id: string; title: string; summary: string | null } | null;
    job: { id: string; title: string; company: string; location: string | null; employment_type: string | null } | null;
  };
  candidate: {
    id: string;
    full_name: string | null;
    headline: string | null;
    location: string | null;
    phone: string | null;
  } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(application.status);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(nextStatus: "applied" | "reviewing" | "interview" | "offer" | "rejected" | "hired") {
    setError(null);
    startTransition(async () => {
      const result = await updateApplicationStatus({ applicationId: application.id, status: nextStatus });
      if (!result.success) {
        setError(result.error || "We couldn't update this application.");
        return;
      }
      setStatus(nextStatus);
      router.refresh();
    });
  }

  const statuses: Array<"applied" | "reviewing" | "interview" | "offer" | "rejected" | "hired"> = [
    "applied",
    "reviewing",
    "interview",
    "offer",
    "rejected",
    "hired",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Candidate review</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
            {candidate?.full_name ?? "Unnamed candidate"}
          </h1>
        </div>
        <Link href="/dashboard/employer/candidates">
          <Button variant="outline" size="sm" className="text-xs font-medium">
            Back to candidates
          </Button>
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="text-base font-bold tracking-tight text-foreground">Profile</h2>
          <p className="mt-2 text-sm text-text-secondary">{candidate?.headline ?? "No headline provided yet."}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Role</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{application.job?.title ?? "Role"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Company</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{application.job?.company ?? "Company"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Location</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{candidate?.location ?? application.job?.location ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Employment type</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{application.job?.employment_type ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Applied</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{formatCandidateDashboardDate(application.applied_at, { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Match</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {typeof application.match_score === "number" ? `${Math.round((application.match_score / 25) * 100)}%` : "—"}
              </p>
            </div>
            {candidate?.phone && (
              <div className="rounded-xl border border-border bg-background/45 p-3 sm:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Phone</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{candidate.phone}</p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background/45 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Submitted resume</p>
                {application.resume_id ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {application.resume?.title ?? "Submitted resume unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {application.resume ? "Resume used for this application" : "The referenced resume could not be loaded."}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">No resume was attached to this application.</p>
                )}
              </div>
              {application.resume && (
                <Link href={`/dashboard/employer/candidates/${application.id}/resume`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                    <FileText className="h-3.5 w-3.5" />
                    View full resume
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Application</p>
              <h2 className="mt-2 text-base font-bold tracking-tight text-foreground">Status</h2>
            </div>
            <CheckCheck className="h-4 w-4 text-text-secondary" />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="application-status" className="text-xs font-semibold text-foreground">Current status</label>
              <select
                id="application-status"
                value={status}
                onChange={(event) => handleStatusChange(event.target.value as "applied" | "reviewing" | "interview" | "offer" | "rejected" | "hired")}
                disabled={isPending}
                className="motion-field mt-1.5 h-10 w-full rounded-md border border-border bg-[#fbfbf9] px-3 text-sm text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-text-secondary">
              {statusLabel(status)} is the current application state.
            </p>
          </div>

          {error && <p className="mt-4 text-sm text-error">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
