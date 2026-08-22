import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h1 className="text-xl font-semibold text-foreground">Password reset unavailable</h1>
        <p className="mt-4 text-sm text-text-secondary">
          The password reset feature is not currently enabled for this environment. Please contact support for assistance.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button className="w-full">Return to Login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
