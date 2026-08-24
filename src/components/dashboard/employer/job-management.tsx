"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, BriefcaseBusiness, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteJob } from "@/app/action/jobs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface EmployerJobListItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  created_at: string;
  applicant_count: number;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function EmployerJobsBoard({ jobs }: { jobs: EmployerJobListItem[] }) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [visibleJobs, setVisibleJobs] = useState(jobs);
  const [jobToDelete, setJobToDelete] = useState<EmployerJobListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function openDeleteConfirmation(job: EmployerJobListItem) {
    setOpenMenuId(null);
    setDeleteError(null);
    setJobToDelete(job);
  }

  function closeDeleteConfirmation() {
    if (isDeleting) return;
    setDeleteError(null);
    setJobToDelete(null);
  }

  function confirmDelete() {
    if (!jobToDelete || isDeleting) return;

    startDeleteTransition(async () => {
      const result = await deleteJob(jobToDelete.id);
      if (!result.success) {
        setDeleteError(result.error || "We couldn't delete this job.");
        return;
      }

      setVisibleJobs((current) => current.filter((job) => job.id !== jobToDelete.id));
      setJobToDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
            Manage jobs
          </h1>
          <p className="mt-2 text-sm leading-5 text-text-secondary">
            Review your active roles, track applicant volume, and keep hiring moving.
          </p>
        </div>

        <Link href="/dashboard/employer/jobs/new">
          <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
            <Plus className="h-3.5 w-3.5" />
            Post a Job
          </Button>
        </Link>
      </header>

      <section className="space-y-3">
        {visibleJobs.length === 0 ? (
          <Card className="p-6">
            <div className="flex flex-col gap-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent-soft text-foreground">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">No jobs posted yet</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Create your first role to start receiving qualified applicants and build your hiring pipeline.
                </p>
              </div>
              <Link href="/dashboard/employer/jobs/new" className="mx-auto">
                <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
                  <Plus className="h-3.5 w-3.5" />
                  Post your first job
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          visibleJobs.map((job) => (
            <Card key={job.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-[17px]">
                      {job.title}
                    </h2>
                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                      Active
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm font-medium text-foreground/80">{job.company}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
                    {job.location && <span>{job.location}</span>}
                    {job.location && job.employment_type && <span>·</span>}
                    {job.employment_type && <span>{job.employment_type}</span>}
                    <span>·</span>
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2 md:min-w-[230px] md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#f9f7f4] px-2.5 py-1 text-[11px] text-text-secondary">
                    <span>{job.applicant_count} applicant{job.applicant_count === 1 ? "" : "s"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/employer/candidates?job=${job.id}`}>
                      <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
                        View applicants
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`More actions for ${job.title}`}
                        aria-expanded={openMenuId === job.id}
                        onClick={() => setOpenMenuId((current) => current === job.id ? null : job.id)}
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {openMenuId === job.id && (
                        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-border bg-surface p-1.5 shadow-sm">
                          <Link href={`/dashboard/employer/jobs/${job.id}/edit`} onClick={() => setOpenMenuId(null)}>
                            <Button type="button" variant="ghost" size="sm" className="flex w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent-soft">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit job
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirmation(job)}
                            className="flex w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-error hover:bg-error/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete job
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </section>

      {jobToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
          <button type="button" tabIndex={-1} aria-label="Close delete confirmation" onClick={closeDeleteConfirmation} disabled={isDeleting} className="fixed inset-0" />
          <section role="dialog" aria-modal="true" aria-labelledby="delete-job-title" aria-describedby="delete-job-description" className="motion-menu relative w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-lg">
            <h2 id="delete-job-title" className="text-base font-bold tracking-tight text-foreground">Delete this job?</h2>
            <p id="delete-job-description" className="mt-1.5 text-sm leading-5 text-text-secondary">This action cannot be undone.</p>
            {deleteError && <p role="alert" className="mt-3 text-xs font-medium text-error">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeDeleteConfirmation} disabled={isDeleting}>Cancel</Button>
              <Button variant="default" size="sm" onClick={confirmDelete} disabled={isDeleting} className="bg-error text-white hover:bg-error/90">
                {isDeleting ? "Deleting..." : "Delete job"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
