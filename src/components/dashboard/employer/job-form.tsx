"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createJob, updateJob } from "@/app/action/jobs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYMENT_TYPE_OPTIONS, normalizeEmploymentType } from "@/lib/job-employment-types";

interface JobFormProps {
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    title: string;
    company: string;
    location: string | null;
    employment_type: string | null;
    description: string | null;
  };
}

export function JobForm({ mode, initialValues }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    title: initialValues?.title ?? "",
    company: initialValues?.company ?? "",
    location: initialValues?.location ?? "",
    employment_type: normalizeEmploymentType(initialValues?.employment_type) ?? "",
    description: initialValues?.description ?? "",
  });

  const isEdit = mode === "edit";

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const canonicalEmploymentType = normalizeEmploymentType(values.employment_type);
    const payload = {
      title: values.title.trim(),
      company: values.company.trim(),
      location: values.location.trim() || null,
      employment_type: canonicalEmploymentType,
      description: values.description.trim() || null,
    };

    try {
      const result = isEdit && initialValues?.id
        ? await updateJob(initialValues.id, payload)
        : await createJob(payload);

      if (!result.success) {
        setError(result.error || "We couldn't save this job.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      router.push("/dashboard/employer/jobs");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't save this job.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-12">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
            {isEdit ? "Edit job" : "Post a job"}
          </h1>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            {isEdit ? "Update the details of this role." : "Create a role and start receiving qualified candidates."}
          </p>
        </div>
        <Link href="/dashboard/employer/jobs">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to jobs
          </Button>
        </Link>
      </header>

      <div className="w-full max-w-[860px]">
        <Card className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_0_rgba(17,18,17,0.02)] sm:p-5">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-xs font-semibold text-foreground">Job title</label>
                <Input
                  id="title"
                  value={values.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Senior Product Designer"
                  className="mt-1.5 h-10 bg-background/45"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="text-xs font-semibold text-foreground">Company</label>
                <Input
                  id="company"
                  value={values.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  placeholder="CareerOS"
                  className="mt-1.5 h-10 bg-background/45"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="text-xs font-semibold text-foreground">Location</label>
                  <Input
                    id="location"
                    value={values.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Remote, New York, etc."
                    className="mt-1.5 h-10 bg-background/45"
                  />
                </div>

                <div>
                  <label htmlFor="employment_type" className="text-xs font-semibold text-foreground">Employment type</label>
                  <select
                    id="employment_type"
                    value={values.employment_type}
                    onChange={(event) => updateField("employment_type", event.target.value)}
                    className="motion-field mt-1.5 h-10 w-full rounded-md border border-border bg-[#fbfbf9] px-3 text-sm text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <option value="">Select employment type</option>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  id="description"
                  value={values.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe the role, requirements, and what you're looking for in the ideal candidate."
                  className="mt-1.5 min-h-[145px] bg-background/45"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-0.5">
              <Link href="/dashboard/employer/jobs">
                <Button type="button" variant="outline" size="sm" className="text-xs font-medium">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="sm" className="gap-1.5 text-xs font-medium" disabled={isSubmitting}>
                <Save className="h-3.5 w-3.5" />
                {isSubmitting ? (isEdit ? "Saving..." : "Posting...") : isEdit ? "Save changes" : "Post job"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
