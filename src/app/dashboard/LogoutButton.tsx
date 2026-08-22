"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export default function LogoutButton({ className, label = "Logout" }: { className?: string; label?: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleLogout() {
        setError(null);
        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            setError("We couldn't sign you out. Please try again.");
            return;
        }

        router.replace("/");
        router.refresh();
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => startTransition(handleLogout)}
                disabled={isPending}
                className={cn("motion-button disabled:cursor-not-allowed disabled:opacity-50", className)}
            >
                {isPending ? "Signing out..." : label}
            </button>
            {error && <p role="alert" className="mt-2 text-xs font-medium text-error">{error}</p>}
        </div>
    );
}
