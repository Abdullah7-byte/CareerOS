"use client";

import { Button } from "@/components/ui/button";

export default function EmployerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-lg font-bold text-foreground">Unable to load this employer workspace.</h1>
        <p className="mt-2 text-sm text-text-secondary">Please try again. Your applications and submitted resumes are unchanged.</p>
        <Button type="button" className="mt-5" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}