function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4 sm:px-5 sm:py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-5 w-2/5 rounded bg-accent-soft" />
          <div className="h-3 w-1/4 rounded bg-accent-soft" />
          <div className="h-3 w-full max-w-2xl rounded bg-accent-soft" />
          <div className="h-3 w-4/5 max-w-xl rounded bg-accent-soft" />
        </div>
        <div className="h-9 w-20 shrink-0 rounded-md bg-accent-soft" />
      </div>
    </div>
  );
}

export default function CandidateJobsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <div className="space-y-1.5">
        <div className="h-7 w-40 animate-pulse rounded bg-accent-soft" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-accent-soft" />
      </div>
      <div className="grid gap-2.5 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_11rem_9rem]">
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
      </div>
      <div className="space-y-2.5">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    </div>
  );
}
