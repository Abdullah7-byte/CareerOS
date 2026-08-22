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
  MapPin,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import { withdrawApplication } from "@/app/action/applications";
import { withdrawableApplicationStatuses } from "@/lib/validations/application";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCandidateDashboardDate, formatMatchScore } from "@/lib/utils";

export interface CandidateApplication {
  id: string;
  jobId: string;
  status: string;
  matchScore: number | null;
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

interface ApplicationsBoardProps {
  applications: CandidateApplication[];
  focusedApplicationId: string | null;
  filters: {
    search: string;
    status: string;
    order: "newest" | "oldest";
  };
}

function displayStatus(status: string) {
  const labels: Record<string, string> = {
    applied: "Submitted",
    reviewing: "Reviewing",
    interview: "Interview",
    offered: "Offered",
    rejected: "Declined",
    hired: "Hired",
    withdrawn: "Withdrawn",
  };

  return labels[status.toLowerCase()] ?? status;
}

function statusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "interview":
      return "ai" as const;
    case "offered":
    case "hired":
      return "success" as const;
    case "rejected":
      return "error" as const;
    case "reviewing":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function formatAppliedDate(date: string) {
  return formatCandidateDashboardDate(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ApplicationsBoard({ applications, filters, focusedApplicationId }: ApplicationsBoardProps) {
  const [hiddenApplicationIds, setHiddenApplicationIds] = useState<Set<string>>(() => new Set());
  const applicationItems = applications.filter((application) => !hiddenApplicationIds.has(application.id));
  const normalizedSearch = filters.search.toLowerCase();
  const filteredApplications = applicationItems
    .filter((application) => {
      const normalizedStatus = application.status.toLowerCase();
      const matchesStatus =
        !filters.status ||
        (filters.status.toLowerCase() === "active"
          ? ["applied", "reviewing"].includes(normalizedStatus)
          : normalizedStatus === filters.status.toLowerCase());
      const searchText = [
        application.job?.title,
        application.job?.company,
        application.job?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedSearch || searchText.includes(normalizedSearch));
    })
    .sort((a, b) => {
      const difference = new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      return filters.order === "oldest" ? -difference : difference;
    });

  const counts = {
    all: applicationItems.length,
    active: applicationItems.filter((application) => ["applied", "reviewing"].includes(application.status.toLowerCase())).length,
    interview: applicationItems.filter((application) => application.status.toLowerCase() === "interview").length,
    offered: applicationItems.filter((application) => application.status.toLowerCase() === "offered").length,
  };
  const statuses = Array.from(new Set(applicationItems.map((application) => application.status))).sort();

  function handleWithdrawn(applicationId: string) {
    setHiddenApplicationIds((current) => new Set(current).add(applicationId));
  }

  useEffect(() => {
    if (!focusedApplicationId) return;
    const target = document.getElementById(`application-${focusedApplicationId}`);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  }, [focusedApplicationId]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Applications</h1>
        <p className="mt-1 text-sm leading-5 text-text-secondary">
          Track submitted applications and follow each employer&apos;s latest decision.
        </p>
      </header>

      {applicationItems.length > 0 && <ApplicationSummary counts={counts} selectedStatus={filters.status} />}

      <ApplicationFilters key={`${filters.search}-${filters.status}-${filters.order}`} statuses={statuses} filters={filters} />

      <section aria-labelledby="application-results-heading">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <div>
            <h2 id="application-results-heading" className="text-sm font-bold tracking-tight text-foreground">
              Application history
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary" aria-live="polite">
              {filteredApplications.length === 1 ? "1 application" : `${filteredApplications.length} applications`}
            </p>
          </div>
        </div>

        {applicationItems.length === 0 ? (
          <ApplicationsEmpty />
        ) : filteredApplications.length === 0 ? (
          <NoMatches />
        ) : (
          <div className="space-y-2.5">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} isFocused={application.id === focusedApplicationId} onWithdrawn={handleWithdrawn} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ApplicationSummary({
  counts,
  selectedStatus,
}: {
  counts: Record<"all" | "active" | "interview" | "offered", number>;
  selectedStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = [
    { label: "All", value: counts.all, status: "" },
    { label: "Submitted", value: counts.active, status: "active" },
    { label: "Interview", value: counts.interview, status: "interview" },
    { label: "Offers", value: counts.offered, status: "offered" },
  ];

  function selectStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <section aria-label="Application summary" className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface shadow-xs sm:grid-cols-4">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          aria-pressed={selectedStatus.toLowerCase() === item.status}
          onClick={() => selectStatus(item.status)}
          className={cn(
            "motion-interactive px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
            index > 0 && "border-l border-border",
            index === 2 && "max-sm:border-l-0 max-sm:border-t",
            index === 3 && "max-sm:border-t",
            selectedStatus.toLowerCase() === item.status
              ? "bg-accent-soft/70"
              : "bg-surface hover:bg-background/65"
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{item.label}</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-foreground tabular-nums">{item.value}</p>
        </button>
      ))}
    </section>
  );
}

function ApplicationFilters({ statuses, filters }: { statuses: string[]; filters: ApplicationsBoardProps["filters"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search);
  const initialSearch = useRef(filters.search);

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
    if (search === initialSearch.current) return;
    const timer = window.setTimeout(() => updateParams({ q: search.trim() }), 300);
    return () => window.clearTimeout(timer);
    // The URL is read at the moment search is committed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <section aria-label="Search and filter applications" className="rounded-xl border border-border bg-surface p-2.5 shadow-xs sm:p-3">
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_10.5rem_9rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, company, or location" aria-label="Search applications" className="h-10 border-border-strong bg-background/45 pl-9 shadow-none" />
        </div>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <select value={filters.status} onChange={(event) => updateParams({ status: event.target.value })} aria-label="Filter by application status" className="motion-field h-10 w-full appearance-none rounded-md border border-border bg-surface py-2 pl-8 pr-8 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">All statuses</option>
            <option value="active">Submitted / in review</option>
            {statuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        </div>
        <div className="relative">
          <select value={filters.order} onChange={(event) => updateParams({ sort: event.target.value === "oldest" ? "oldest" : "" })} aria-label="Sort applications" className="motion-field h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-8 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function ApplicationCard({ application, isFocused, onWithdrawn }: { application: CandidateApplication; isFocused: boolean; onWithdrawn: (applicationId: string) => void }) {
  const job = application.job;
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const canWithdraw = (withdrawableApplicationStatuses as readonly string[]).includes(application.status.toLowerCase());

  useEffect(() => {
    if (!isConfirmOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsConfirmOpen(false);
        window.setTimeout(() => actionsButtonRef.current?.focus(), 0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmOpen, isPending]);

  function closeConfirmation() {
    if (isPending) return;
    setIsConfirmOpen(false);
    window.setTimeout(() => actionsButtonRef.current?.focus(), 0);
  }

  function openConfirmation() {
    setWithdrawNotice(null);
    setIsMenuOpen(false);
    setIsConfirmOpen(true);
  }

  function trapDialogFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function confirmWithdrawal() {
    startTransition(async () => {
      const result = await withdrawApplication(application.id);
      if (!result.success) {
        setIsConfirmOpen(false);
        const staleErrors = [
          "Application not found.",
          "This application can no longer be withdrawn.",
          "This application was updated and can no longer be withdrawn.",
        ];
        setWithdrawNotice(
          staleErrors.includes(result.error)
            ? "Unable to withdraw this application. Its status has changed."
            : result.error
        );
        window.setTimeout(() => actionsButtonRef.current?.focus(), 0);
        router.refresh();
        return;
      }
      onWithdrawn(result.data.id);
      setIsConfirmOpen(false);
      setIsMenuOpen(false);
    });
  }

  return (
    <article
      id={`application-${application.id}`}
      tabIndex={isFocused ? -1 : undefined}
      aria-current={isFocused ? "true" : undefined}
      className={cn(
        "rounded-lg border border-border/70 bg-surface/80 p-3.5 shadow-none sm:px-4 sm:py-3.5",
        isFocused && "border-foreground/35 bg-accent-soft/35 ring-1 ring-foreground/15"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-[17px]">
              {job?.title ?? "Role no longer available"}
            </h3>
            <Badge variant={statusVariant(application.status)} className="motion-status gap-1.5 px-1.5 py-0 text-[10px] font-medium">
              <Check className="h-3 w-3" aria-hidden="true" />
              {displayStatus(application.status)}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground/80">{job?.company ?? "Company unavailable"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
            {job?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-text-muted" aria-hidden="true" />{job.location}</span>}
            {job?.location && job.employmentType && <span className="text-text-muted">·</span>}
            {job?.employmentType && <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3 text-text-muted" aria-hidden="true" />{job.employmentType}</span>}
            {(job?.location || job?.employmentType) && <span className="text-text-muted">·</span>}
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3 text-text-muted" aria-hidden="true" />Applied {formatAppliedDate(application.appliedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-center sm:self-start">
          {application.matchScore !== null && (
            <div className="flex min-h-[60px] min-w-[80px] flex-col items-center justify-center rounded-lg border border-border bg-[#f6f4f1] px-2 py-1.5 text-center leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-text-muted">Match</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums leading-none text-foreground">{formatMatchScore(application.matchScore)}</p>
            </div>
          )}
          {canWithdraw && (
            <div className="flex h-[78px] items-center justify-center">
              <div className="relative">
                <Button ref={actionsButtonRef} variant="ghost" size="icon" aria-label="Application actions" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)} className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
                {isMenuOpen && (
                  <div className="motion-menu absolute right-0 z-10 mt-1 w-44 rounded-md border border-border bg-surface p-1 shadow-sm">
                    <button type="button" onClick={openConfirmation} className="motion-interactive flex w-full rounded-sm px-2.5 py-2 text-left text-xs font-medium text-error hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
                      Withdraw application
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {withdrawNotice && <p role="alert" className="mt-3 text-xs font-medium text-error">{withdrawNotice}</p>}
      {isConfirmOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
          <button type="button" tabIndex={-1} aria-label="Close withdrawal confirmation" onClick={closeConfirmation} className="fixed inset-0 bg-foreground/25" />
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`withdraw-title-${application.id}`} aria-describedby={`withdraw-description-${application.id}`} onKeyDown={trapDialogFocus} className="motion-menu relative w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-lg">
            <h2 id={`withdraw-title-${application.id}`} className="text-base font-bold tracking-tight text-foreground">Withdraw this application?</h2>
            <p id={`withdraw-description-${application.id}`} className="mt-1.5 text-sm leading-5 text-text-secondary">You won&apos;t be considered for this position unless you apply again, if applications are still open.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button ref={cancelButtonRef} variant="outline" size="sm" onClick={closeConfirmation} disabled={isPending}>Cancel</Button>
              <Button variant="default" size="sm" onClick={confirmWithdrawal} disabled={isPending} className="bg-error text-white hover:bg-error/90">
                <span className={isPending ? "motion-status" : undefined}>{isPending ? "Withdrawing..." : "Withdraw application"}</span>
              </Button>
            </div>
          </section>
        </div>
      , document.body)}
    </article>
  );
}

function ApplicationsEmpty() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-text-secondary"><BriefcaseBusiness className="h-4 w-4" aria-hidden="true" /></div>
      <h3 className="mt-3 text-base font-bold tracking-tight text-foreground">No applications yet</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-text-secondary">Once you apply to a verified role, its status and match score will appear here.</p>
      <Link href="/dashboard/candidate/jobs" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-5 gap-2")}>
        Browse jobs
      </Link>
    </div>
  );
}

function NoMatches() {
  const router = useRouter();

  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center">
      <h3 className="text-base font-bold tracking-tight text-foreground">No matching applications</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-text-secondary">Try a different search term or status filter.</p>
      <Button variant="outline" size="sm" onClick={() => router.replace("/dashboard/candidate/applications")} className="mt-5">Clear filters</Button>
    </div>
  );
}
