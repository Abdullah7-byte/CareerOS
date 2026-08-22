"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Briefcase, User, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/app/components/AuthShell";
import { getPortalPath } from "@/lib/auth/portal-route";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (signUpError) {
      console.error("Signup failed:", signUpError.message);
      if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists.");
      } else if (signUpError.message.toLowerCase().includes("password")) {
        setError("Use a stronger password (minimum 6 characters).");
      } else {
        setError("Unable to create your account. Please try again.");
      }
      setLoading(false);
      return;
    }

    if (data?.session && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const searchParams = new URLSearchParams(window.location.search);
      const nextUrl = searchParams.get("next");
      const safeNext = (nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//")) ? nextUrl : null;

      window.location.replace(safeNext || getPortalPath(profile?.role ?? role));
    } else {
      setMessage("Account created. Please check your email to confirm your account.");
      setLoading(false);
    }
  }

  return (
    <AuthShell context="register">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-text-secondary">Choose how you&apos;ll use CareerOS.</p>
        </div>

        {message ? (
          <div className="mt-9 rounded-[22px] border border-border bg-white p-6 text-center shadow-[0_8px_22px_rgba(38,37,33,0.035)]">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Check your email</h3>
            <p className="mt-2 text-sm text-text-secondary">{message}</p>
            <Button onClick={() => router.push("/login")} className="mt-8 h-11 w-full rounded-full" variant="outline">
              Return to Login
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-9 rounded-[22px] border border-border bg-white p-5 shadow-[0_8px_22px_rgba(38,37,33,0.035)] sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-3 text-left">
                <Label className="text-sm font-medium">How will you use CareerOS?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("candidate")}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-xl border p-3.5 transition-all text-left",
                      role === "candidate"
                        ? "border-foreground bg-surface-elevated shadow-sm ring-1 ring-foreground"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-elevated text-text-muted"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      role === "candidate" ? "bg-foreground text-surface" : "bg-surface-elevated border border-border text-foreground"
                    )}>
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={cn("text-sm font-medium", role === "candidate" ? "text-foreground" : "text-foreground")}>Candidate</div>
                      <div className={cn("text-xs mt-0.5", role === "candidate" ? "text-text-secondary" : "text-text-muted")}>Find a job</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-xl border p-3.5 transition-all text-left",
                      role === "employer"
                        ? "border-foreground bg-surface-elevated shadow-sm ring-1 ring-foreground"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-elevated text-text-muted"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      role === "employer" ? "bg-foreground text-surface" : "bg-surface-elevated border border-border text-foreground"
                    )}>
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={cn("text-sm font-medium", role === "employer" ? "text-foreground" : "text-foreground")}>Employer</div>
                      <div className={cn("text-xs mt-0.5", role === "employer" ? "text-text-secondary" : "text-text-muted")}>Hire talent</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
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
                    minLength={6}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-11"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-error bg-error/10 py-2.5 px-3.5 rounded-lg border border-error/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="mt-2 h-11 w-full rounded-full text-sm" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:text-accent transition-colors">
              Sign In
            </Link>
            </div>
          </>
        )}
    </AuthShell>
  );
}
