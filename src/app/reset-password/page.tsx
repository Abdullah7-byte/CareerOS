"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const recovery = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "update";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    const supabase = createClient();
    if (recovery) {
      const { error } = await supabase.auth.updateUser({ password });
      setNotice(error ? "We couldn't update your password. Request a new link and try again." : "Password updated. You can now sign in.");
      return;
    }
    const redirectTo = `${window.location.origin}/reset-password?mode=update`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    // Same response prevents account enumeration.
    setNotice("If an account exists, a recovery email will be sent shortly.");
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-6"><section className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
    <h1 className="text-xl font-semibold text-foreground">{recovery ? "Choose a new password" : "Reset your password"}</h1>
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div><Label htmlFor="reset-value">{recovery ? "New password" : "Email"}</Label><Input id="reset-value" className="mt-2" type={recovery ? "password" : "email"} value={recovery ? password : email} onChange={(event) => recovery ? setPassword(event.target.value) : setEmail(event.target.value)} minLength={recovery ? 8 : undefined} required /></div>
      <Button className="w-full" type="submit">{recovery ? "Update password" : "Send recovery link"}</Button>
    </form>
    {notice && <p className="mt-4 text-sm text-text-secondary" role="status">{notice}</p>}
    <Link href="/login" className="mt-6 block text-center text-sm text-text-secondary underline">Return to sign in</Link>
  </section></main>;
}
