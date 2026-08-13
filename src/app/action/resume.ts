"use server";

import { createClient } from "@/lib/supabase/server";
import {
    resumeContentSchema,
    type ResumeContent,
} from "@/lib/validations/resume";

type ResumeActionResult =
    | {
        success: true;
        data: ResumeContent;
    }
    | {
        success: false;
        error: string;
    };

export async function saveResume(
    input: unknown
): Promise<ResumeActionResult> {
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

    const result = resumeContentSchema.safeParse(input);

    if (!result.success) {
        return {
            success: false,
            error: "Invalid resume data",
        };
    }

    const resumeData = result.data;

    const { data: existingResume } = await supabase
        .from("resumes")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

    if (existingResume) {
        const { error } = await supabase
            .from("resumes")
            .update({
                title: resumeData.title,
                summary: resumeData.summary ?? null,
            })
            .eq("id", existingResume.id);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    } else {
        const { error } = await supabase
            .from("resumes")
            .insert({
                profile_id: user.id,
                title: resumeData.title,
                summary: resumeData.summary ?? null,
                is_default: true,
            });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    return {
        success: true,
        data: resumeData,
    };
}