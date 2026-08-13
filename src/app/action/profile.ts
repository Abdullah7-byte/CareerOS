"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

type ProfileActionResult =
    | {
        success: true;
        data: Tables<"profiles">;
    }
    | {
        success: false;
        error: string;
    };

export async function getCurrentProfile(): Promise<ProfileActionResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
        data,
    };
}