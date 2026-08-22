"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createResume, renameResume, setResumeAsDefault } from "@/app/action/resume";
import { Check, ChevronDown, MoreHorizontal } from "lucide-react";

export function ResumeCollectionActions({
  selectedResumeId,
  resumes,
}: {
  selectedResumeId?: string | null;
  resumes: Array<{ id: string; title: string; updated_at: string; is_default?: boolean }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameResumeId, setRenameResumeId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [makeDefaultChecked, setMakeDefaultChecked] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedResume = resumes.find((resume) => resume.id === selectedResumeId) ?? resumes[0] ?? null;
  const renameTarget = resumes.find((resume) => resume.id === renameResumeId) ?? null;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setActionMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setActionMenuId(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleCreateResume() {
    const title = newTitle.trim();
    startTransition(async () => {
      const result = await createResume(title || "Untitled Resume", { makeDefault: makeDefaultChecked });
      if (result.success && result.data?.id) {
        setCreateOpen(false);
        setNewTitle("");
        setMakeDefaultChecked(false);
        const nextUrl = `/dashboard/candidate/resume?resume=${result.data.id}`;
        router.push(nextUrl);
      }
    });
  }

  async function handleRenameResume() {
    const resumeToRename = resumes.find((resume) => resume.id === renameResumeId);
    if (!resumeToRename) return;
    const title = renameValue.trim() || resumeToRename.title;
    startTransition(async () => {
      const result = await renameResume(resumeToRename.id, title);
      if (result.success) {
        setRenameOpen(false);
        setRenameResumeId(null);
        setRenameValue("");
        router.refresh();
      }
    });
  }

  function handleSelectResume(nextId: string) {
    setMenuOpen(false);
    router.push(`/dashboard/candidate/resume?resume=${nextId}`);
  }

  function handleSetDefaultResume(resumeId: string) {
    setMenuOpen(false);
    setActionMenuId(null);
    startTransition(async () => {
      const result = await setResumeAsDefault(resumeId);
      if (result.success) router.refresh();
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_0_rgba(17,18,17,0.02)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Resume Builder</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{selectedResume?.title ?? "Your resumes"}</h2>
            </div>
            {selectedResume?.is_default && (
              <p className="mt-1 text-sm text-text-secondary">
                Default resume
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {resumes.length > 0 && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-[0_1px_0_rgba(17,17,17,0.02)] transition-colors hover:border-border-strong"
                  aria-expanded={menuOpen}
                  aria-label="Choose the resume to edit"
                >
                  <span className="max-w-[16rem] truncate text-left">
                    {selectedResume?.title ?? "Choose a resume"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-[20rem] rounded-xl border border-border bg-surface p-2 shadow-[0_8px_30px_rgba(17,17,17,0.08)]">
                    <div className="border-b border-border px-2.5 pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Your resumes</p>
                      <p className="mt-1 text-xs text-text-secondary">Select a resume to edit.</p>
                    </div>

                    <div className="space-y-1 py-2">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 ${selectedResume?.id === resume.id ? "bg-accent-soft" : "hover:bg-background"}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectResume(resume.id)}
                            className="flex min-w-0 flex-1 items-start gap-2 text-left"
                            aria-current={selectedResume?.id === resume.id ? "true" : undefined}
                          >
                            {selectedResume?.id === resume.id ? (
                              <Check className="h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                            ) : (
                              <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="min-w-0 truncate text-sm font-medium text-foreground">{resume.title}</span>
                                {resume.is_default && (
                                  <span className="shrink-0 rounded-full border border-border-strong px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                                    Default
                                  </span>
                                )}
                              </span>
                              {selectedResume?.id === resume.id && <span className="mt-0.5 block text-[11px] text-text-muted">Editing</span>}
                            </span>
                          </button>
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setActionMenuId((openId) => openId === resume.id ? null : resume.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-background hover:text-foreground"
                              aria-label={`Actions for ${resume.title}`}
                              aria-expanded={actionMenuId === resume.id}
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </button>
                            {actionMenuId === resume.id && (
                              <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-border bg-surface p-1 shadow-[0_8px_24px_rgba(17,17,17,0.1)]">
                                {!resume.is_default && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultResume(resume.id)}
                                    className="flex w-full rounded-md px-2.5 py-2 text-left text-xs font-medium text-text-secondary hover:bg-background hover:text-foreground"
                                  >
                                    Set as default
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuId(null);
                                    setRenameResumeId(resume.id);
                                    setRenameValue(resume.title);
                                    setRenameOpen(true);
                                  }}
                                  className="flex w-full rounded-md px-2.5 py-2 text-left text-xs font-medium text-text-secondary hover:bg-background hover:text-foreground"
                                >
                                  Rename
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setCreateOpen(true);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background"
                      >
                        <span>+ Create new resume</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button type="button" size="sm" onClick={() => setCreateOpen(true)} disabled={isPending}>
              {isPending ? "Creating…" : "+ Create new resume"}
            </Button>
          </div>
        </div>
      </div>

      {createOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,17,17,0.03)] p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(17,17,17,0.08)]">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Resume Builder</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">Create new resume</h3>
            </div>

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Resume name
            </label>
            <Input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Frontend Developer"
              className="h-11"
            />

            <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={makeDefaultChecked}
                onChange={(event) => setMakeDefaultChecked(event.target.checked)}
                className="h-4 w-4 rounded border-border text-foreground"
              />
              Make this my default resume
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleCreateResume} disabled={isPending}>
                Create resume
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {renameOpen && renameTarget && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,17,17,0.03)] p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(17,17,17,0.08)]">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Resume</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">Rename resume</h3>
            </div>

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Resume name
            </label>
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value.slice(0, 80))}
              className="h-11"
            />

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleRenameResume} disabled={isPending || renameValue.trim().length === 0}>
                Save
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
