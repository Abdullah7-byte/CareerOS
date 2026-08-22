"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";
import { employerProfileSchema, profileSettingsSchema } from "@/lib/validations/profile";

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
        console.error("getCurrentProfile: fetch failed", { userId: user.id, code: error.code, message: error.message });
        return {
            success: false,
            error: "Unable to load your profile. Please try again.",
        };
    }

    return {
        success: true,
        data,
    };
}

export async function updateCandidateProfile(input: unknown): Promise<ProfileActionResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Please sign in again to save your changes." };
    }

    const validation = profileSettingsSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0]?.message ?? "Check your profile details and try again." };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "candidate") {
        return { success: false, error: "Only candidate profiles can be updated here." };
    }

    const rawInput = input && typeof input === "object" ? input as Record<string, unknown> : {};
    const profileUpdate: {
        full_name?: string | null;
        headline?: string | null;
        location?: string | null;
        phone?: string | null;
    } = {};

    if (Object.prototype.hasOwnProperty.call(rawInput, "fullName")) {
        profileUpdate.full_name = validation.data.fullName ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(rawInput, "headline")) {
        profileUpdate.headline = validation.data.headline ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(rawInput, "location")) {
        profileUpdate.location = validation.data.location ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(rawInput, "phone")) {
        profileUpdate.phone = validation.data.phone ?? null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id)
        .select("*")
        .single();

    if (error) {
        console.error("Candidate profile update failed", {
            userId: user.id,
            errorCode: error.code ?? "unknown",
            errorMessage: error.message,
        });
        return { success: false, error: "We couldn't save your profile. Please try again." };
    }

    return { success: true, data };
}

export async function updateEmployerProfile(input: unknown): Promise<ProfileActionResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Please sign in again to save your changes." };
    }

    const validation = employerProfileSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0]?.message ?? "Check your profile details and try again." };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "employer") {
        return { success: false, error: "Only employer profiles can be updated here." };
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({
            organization_name: validation.data.organizationName,
            organization_website: validation.data.organizationWebsite,
            recruiter_name: validation.data.recruiterName,
            recruiter_title: validation.data.recruiterTitle,
        })
        .eq("id", user.id)
        .select("*")
        .single();

    if (error) {
        console.error("Employer profile update failed", {
            userId: user.id,
            errorCode: error.code ?? "unknown",
            errorMessage: error.message,
        });
        return { success: false, error: "We couldn't save your employer profile. Please try again." };
    }

    return { success: true, data };
}
