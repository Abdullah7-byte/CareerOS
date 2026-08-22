export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
] as const;

export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPE_OPTIONS)[number]["value"];

export function normalizeEmploymentType(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const directMatch = EMPLOYMENT_TYPE_OPTIONS.find(
    (option) => option.value === trimmed || option.label.toLowerCase() === trimmed.toLowerCase()
  );

  if (directMatch) {
    return directMatch.value;
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, "_");
  const fallbackMatch = EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === normalized);

  return fallbackMatch?.value ?? null;
}

export function formatEmploymentType(value: string | null | undefined): string {
  if (!value) return "—";

  const match = EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value;
}
