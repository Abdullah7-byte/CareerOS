"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="flex min-h-[420px] items-center justify-center"><section className="max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-xs"><AlertCircle className="mx-auto h-5 w-5 text-text-secondary" aria-hidden="true" /><h1 className="mt-4 text-lg font-bold text-foreground">Resume is temporarily unavailable</h1><p className="mt-2 text-sm text-text-secondary">We couldn&apos;t load your resume. Your saved data is unchanged.</p><Button onClick={reset} className="mt-5 gap-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button></section></div>;
}
