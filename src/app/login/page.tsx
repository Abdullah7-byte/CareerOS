"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/app/components/AuthShell";
import { getPortalPath } from "@/lib/auth/portal-route";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      setErrorMessage("Email or password is incorrect.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("We couldn't complete sign in. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const searchParams = new URLSearchParams(window.location.search);
    const nextUrl = searchParams.get("next");
    const safeNext = (nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//")) ? nextUrl : null;

    window.location.replace(safeNext || getPortalPath(profile?.role));
  }

  return (
    <AuthShell context="login">
      <div>
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-text-secondary">Sign in to continue.</p>
      </div>
      <div className="mt-7 rounded-[22px] border border-border/80 bg-white p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="h-11"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm font-medium text-error bg-error/10 py-2.5 px-3.5 rounded-lg border border-error/20">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="mt-1 h-11 w-full rounded-full text-sm" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
      <div className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:text-accent transition-colors">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
