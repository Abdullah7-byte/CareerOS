"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CandidateJobsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[420px] max-w-7xl items-center justify-center">
      <section className="max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-xs">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-text-secondary">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-bold tracking-tight text-foreground">
          The job board is temporarily unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          We couldn&apos;t retrieve open positions just now. Your application data is unchanged.
        </p>
        <Button onClick={reset} className="mt-5 gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </section>
    </div>
  );
}
