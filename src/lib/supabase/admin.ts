import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Server-only client for writes that must not be available to a user JWT. */
export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    // Sanity check: common mistake is to set the publishable/anon key here.
    // Detect obvious publishable key prefixes and fail fast to avoid running
    // with a key that maps to the `authenticated` role at runtime.
    const lower = serviceRoleKey.toLowerCase();
    if (
        lower.startsWith("sb_publishable_") ||
        lower.startsWith("pk_") ||
        lower.startsWith("anon_")
    ) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY appears to be a publishable/anon key. Set the service role secret instead."
        );
    }

    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}
