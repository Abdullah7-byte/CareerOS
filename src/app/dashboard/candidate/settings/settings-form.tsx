"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { updateCandidateProfile } from "@/app/action/profile";
import LogoutButton from "@/app/dashboard/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsFormProps {
  email: string;
  profile: {
    fullName: string | null;
    headline: string | null;
  };
}

export function SettingsForm({ email, profile }: SettingsFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const passwordTriggerRef = useRef<HTMLButtonElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const passwordDialogRef = useRef<HTMLElement>(null);

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    startTransition(async () => {
      const result = await updateCandidateProfile({ fullName, headline });
      if (!result.success) {
        setNotice({ type: "error", text: result.error });
        return;
      }

      setFullName(result.data.full_name ?? "");
      setHeadline(result.data.headline ?? "");
      setNotice({ type: "success", text: "Profile saved." });
    });
  }

  function handleFullNameChange(value: string) {
    setFullName(value);
    setNotice(null);
  }

  function handleHeadlineChange(value: string) {
    setHeadline(value);
    setNotice(null);
  }

  useEffect(() => {
    if (!isPasswordDialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    currentPasswordRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPasswordPending) {
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError(null);
        setIsPasswordUpdated(false);
        window.setTimeout(() => passwordTriggerRef.current?.focus(), 0);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPasswordDialogOpen, isPasswordPending]);

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setIsPasswordUpdated(false);
  }

  function openPasswordDialog() {
    resetPasswordForm();
    setIsPasswordDialogOpen(true);
  }

  function closePasswordDialog() {
    if (isPasswordPending) return;
    setIsPasswordDialogOpen(false);
    resetPasswordForm();
    window.setTimeout(() => passwordTriggerRef.current?.focus(), 0);
  }

  function trapPasswordDialogFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = passwordDialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function submitPasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setPasswordError("New password must be 72 characters or fewer.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Choose a password that differs from your current password.");
      return;
    }

    startPasswordTransition(async () => {
      let result: { success: boolean; error?: string };

      try {
        const response = await fetch("/api/account/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        });
        result = await response.json();
      } catch {
        setPasswordError("We couldn't update your password. Please try again.");
        return;
      }

      if (!result.success) {
        setPasswordError(result.error ?? "We couldn't update your password. Please try again.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordUpdated(true);
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Settings</h1>
        <p className="mt-2 text-sm leading-5 text-text-secondary">Manage your profile, account, and sign-in details.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section aria-labelledby="profile-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(17,18,17,0.02)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Profile</p>
          <div className="mt-2">
            <h2 id="profile-heading" className="text-sm font-bold tracking-tight text-foreground">Profile information</h2>
            <p className="mt-1.5 text-sm text-text-secondary">Keep the details that personalize your CareerOS workspace.</p>
          </div>

          <form onSubmit={saveProfile} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full-name" className="text-xs font-semibold text-foreground">Full name</label>
                <Input id="full-name" value={fullName} onChange={(event) => handleFullNameChange(event.target.value)} maxLength={120} autoComplete="name" className="mt-1.5 bg-background/45" />
              </div>
              <div>
                <label htmlFor="headline" className="text-xs font-semibold text-foreground">Headline</label>
                <Input id="headline" value={headline} onChange={(event) => handleHeadlineChange(event.target.value)} maxLength={120} className="mt-1.5 bg-background/45" />
              </div>
            </div>

            <div className="mt-5 flex min-h-8 flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              {notice?.type === "error" && <p role="alert" className="text-xs font-medium text-error">{notice.text}</p>}
              <Button type="submit" size="sm" disabled={isPending} className="min-w-27">
                <span className={isPending || notice?.type === "success" ? "motion-status inline-flex items-center gap-1.5" : undefined}>
                  {notice?.type === "success" && !isPending && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  {isPending ? "Saving..." : notice?.type === "success" ? "Saved" : "Save changes"}
                </span>
              </Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="account-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(17,18,17,0.02)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Account</p>
          <div className="mt-2">
            <h2 id="account-heading" className="text-sm font-bold tracking-tight text-foreground">Sign-in email</h2>
            <p className="mt-1.5 text-sm text-text-secondary">Managed by your sign-in provider.</p>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/35 px-4 py-3.5">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">{email}</p>
          </div>
          <div className="mt-4">
            <LogoutButton label="Sign out" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-secondary hover:bg-accent-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2" />
          </div>
        </section>
      </div>

      <section aria-labelledby="security-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(17,18,17,0.02)] sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Security</p>
        <div className="mt-2">
          <h2 id="security-heading" className="text-sm font-bold tracking-tight text-foreground">Password</h2>
          <p className="mt-1.5 text-sm text-text-secondary">Keep your account credentials up to date.</p>
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-background/35 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">Password</p>
          <Button ref={passwordTriggerRef} type="button" variant="ghost" size="sm" onClick={openPasswordDialog} className="gap-1.5 self-start text-foreground sm:self-auto">
            Change <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </section>

      {isPasswordDialogOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
          <button type="button" tabIndex={-1} aria-label="Close password change" onClick={closePasswordDialog} className="fixed inset-0 bg-foreground/25" />
          <section ref={passwordDialogRef} role="dialog" aria-modal="true" aria-labelledby="change-password-title" aria-describedby="change-password-description" onKeyDown={trapPasswordDialogFocus} className="motion-menu relative w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg">
            {isPasswordUpdated ? (
              <div>
                <h2 id="change-password-title" className="text-base font-bold tracking-tight text-foreground">Password updated</h2>
                <p id="change-password-description" className="mt-1.5 text-sm leading-5 text-text-secondary">Your new password is ready to use.</p>
                <div className="mt-5 flex justify-end">
                  <Button type="button" size="sm" onClick={closePasswordDialog}>Done</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitPasswordChange}>
                <h2 id="change-password-title" className="text-base font-bold tracking-tight text-foreground">Change password</h2>
                <p id="change-password-description" className="mt-1.5 text-sm leading-5 text-text-secondary">Confirm your current password, then choose a new one.</p>
                <div className="mt-5 space-y-3.5">
                  <div>
                    <label htmlFor="current-password" className="text-xs font-semibold text-foreground">Current password</label>
                    <Input ref={currentPasswordRef} id="current-password" type="password" value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); setPasswordError(null); }} autoComplete="current-password" required className="mt-1.5 bg-background/45" />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="text-xs font-semibold text-foreground">New password</label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setPasswordError(null); }} minLength={6} maxLength={72} autoComplete="new-password" required className="mt-1.5 bg-background/45" />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">Confirm new password</label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setPasswordError(null); }} minLength={6} autoComplete="new-password" required className="mt-1.5 bg-background/45" />
                  </div>
                </div>
                {passwordError && <p role="alert" className="mt-3 text-xs font-medium text-error">{passwordError}</p>}
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={closePasswordDialog} disabled={isPasswordPending}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isPasswordPending}>
                    <span className={isPasswordPending ? "motion-status" : undefined}>{isPasswordPending ? "Updating..." : "Update password"}</span>
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}
