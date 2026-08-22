export default function EmployerLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12" aria-label="Loading employer workspace">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-accent-soft" />
      <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
      <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  );
}