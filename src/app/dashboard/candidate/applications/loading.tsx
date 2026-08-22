function ApplicationRowSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4 sm:px-5 sm:py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-5 w-2/5 rounded bg-accent-soft" />
          <div className="h-3 w-1/4 rounded bg-accent-soft" />
          <div className="h-3 w-3/5 rounded bg-accent-soft" />
        </div>
        <div className="h-6 w-20 rounded bg-accent-soft" />
      </div>
    </div>
  );
}

export default function CandidateApplicationsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <div className="space-y-1.5">
        <div className="h-3 w-32 animate-pulse rounded bg-accent-soft" />
        <div className="h-7 w-36 animate-pulse rounded bg-accent-soft" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-accent-soft" />
      </div>
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse bg-surface" />
        ))}
      </div>
      <div className="grid gap-2.5 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_10.5rem_9rem]">
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
        <div className="h-10 animate-pulse rounded-md bg-accent-soft" />
      </div>
      <div className="space-y-2.5">
        <ApplicationRowSkeleton />
        <ApplicationRowSkeleton />
        <ApplicationRowSkeleton />
      </div>
    </div>
  );
}
