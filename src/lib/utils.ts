import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return "—";
  }

  const percentage = (score / 25) * 100;
  return `${Math.max(0, Math.min(100, percentage)).toFixed(0)}%`;
}

/** Formats candidate dashboard dates consistently during SSR and hydration. */
export function formatCandidateDashboardDate(date: string | Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(date));
}
