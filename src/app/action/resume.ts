"use server";

import { createClient } from "@/lib/supabase/server";
import {
    resumeContentSchema,
    type ResumeContent,
} from "@/lib/validations/resume";

type ResumeActionResult =
    | {
        success: true;
        data: { id: string; resume: ResumeContent };
    }
    | {
        success: false;
        error: string;
    };

type ResumeRow = {
    id: string;
    title: string;
    summary: string | null;
    is_default: boolean;
    updated_at: string;
    profile_id: string;
    resume_experiences?: Array<Record<string, unknown>>;
    resume_education?: Array<Record<string, unknown>>;
    resume_skills?: Array<Record<string, unknown>>;
    resume_projects?: Array<Record<string, unknown>>;
};

function getResumePayload(input: unknown) {
    if (!input || typeof input !== "object") {
        return null;
    }

    const record = input as Record<string, unknown>;
    const resumeId = typeof record.resumeId === "string" && record.resumeId.trim() ? record.resumeId : undefined;
    const title = typeof record.title === "string" ? record.title : "";
    const summary = typeof record.summary === "string" ? record.summary : undefined;
    const experience = Array.isArray(record.experience) ? record.experience : [];
    const education = Array.isArray(record.education) ? record.education : [];
    const skills = Array.isArray(record.skills) ? record.skills : [];
    const projects = Array.isArray(record.projects) ? record.projects : [];

    const parsed = resumeContentSchema.safeParse({
        title,
        summary,
        experience,
        education,
        skills,
        projects,
    });

    return { resumeId, resumeData: parsed.success ? parsed.data : null, parseError: parsed.success ? null : parsed.error };
}

async function replaceResumeRelations(resumeId: string, resumeData: ResumeContent) {
    const supabase = await createClient();

    const { error } = await supabase.rpc("save_candidate_resume", {
        p_resume_id: resumeId,
        p_resume: {
            title: resumeData.title,
            summary: resumeData.summary ?? "",
            experience: resumeData.experience.map((experience) => ({
                company: experience.company,
                position: experience.position,
                location: experience.location ?? "",
                start_date: experience.startDate,
                end_date: experience.endDate ?? "",
                is_current: experience.isCurrent,
                description: experience.description ?? "",
            })),
            education: resumeData.education.map((education) => ({
                institution: education.institution,
                degree: education.degree,
                field_of_study: education.fieldOfStudy ?? "",
                start_date: education.startDate ?? "",
                end_date: education.endDate ?? "",
                grade: education.grade ?? "",
            })),
            skills: resumeData.skills,
            projects: resumeData.projects.map((project) => ({
                title: project.title,
                description: project.description ?? "",
                technologies: project.technologies ?? "",
                github_url: project.githubUrl ?? "",
                live_url: project.liveUrl ?? "",
            })),
        },
    });

    if (error) throw new Error(error.message);
}

export async function listCandidateResumes(): Promise<ResumeRow[]> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, summary, is_default, updated_at, profile_id, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)")
        .eq("profile_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as ResumeRow[];
}

export async function createResume(title = "Untitled Resume", options: { makeDefault?: boolean } = {}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" } as const;
    }

    const normalizedTitle = (title ?? "").trim() || "Untitled Resume";

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            profile_id: user.id,
            title: normalizedTitle,
            summary: null,
            is_default: false,
        })
        .select("id")
        .single();

    if (error || !data) {
        console.error("createResume: insert failed", { userId: user.id, code: error?.code, message: error?.message });
        return { success: false, error: "Unable to create resume. Please try again." } as const;
    }

    if (options.makeDefault) {
        const { error: defaultError } = await supabase.rpc("set_candidate_default_resume", {
            p_resume_id: data.id,
        });

        if (defaultError) {
            return { success: false, error: "Resume created, but its default status could not be updated." } as const;
        }
    }

    return { success: true, data: { id: data.id } } as const;
}

export async function setResumeAsDefault(resumeId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" } as const;
    }

    const { data: currentResume, error: resumeError } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (resumeError) {
        console.error("setResumeAsDefault: ownership check failed", { userId: user.id, resumeId, code: resumeError.code, message: resumeError.message });
        return { success: false, error: "Unable to update default resume. Please try again." } as const;
    }

    if (!currentResume) {
        return { success: false, error: "Resume not found." } as const;
    }

    const { error } = await supabase.rpc("set_candidate_default_resume", {
        p_resume_id: resumeId,
    });

    if (error) {
        return { success: false, error: "Unable to update default resume." } as const;
    }

    return { success: true, data: { id: resumeId } } as const;
}

export async function renameResume(resumeId: string, title: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" } as const;
    }

    const normalizedTitle = title.trim() || "Untitled Resume";

    const { data, error } = await supabase
        .from("resumes")
        .update({ title: normalizedTitle })
        .eq("id", resumeId)
        .eq("profile_id", user.id)
        .select("id, title")
        .single();

    if (error || !data) {
        console.error("renameResume: update failed", { userId: user.id, resumeId, code: error?.code, message: error?.message });
        return { success: false, error: "Unable to rename resume. Please try again." } as const;
    }

    return { success: true, data: { id: data.id, title: data.title } } as const;
}

export async function getResumeById(resumeId: string): Promise<ResumeRow | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, summary, is_default, updated_at, profile_id, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)")
        .eq("id", resumeId)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? null) as ResumeRow | null;
}

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

    const parsed = getResumePayload(input);
    if (!parsed || !parsed.resumeData) {
        return {
            success: false,
            error: parsed?.parseError
                ? "Invalid resume data"
                : "Invalid resume payload",
        };
    }

    const resumeData = parsed.resumeData;

    for (const exp of resumeData.experience) {
        if (!exp.startDate || exp.startDate.trim() === "") {
            return {
                success: false,
                error: "Start date is required for all experience entries.",
            };
        }
    }

    try {
        let resumeId = parsed.resumeId;

        if (resumeId) {
            const { data: existingResume, error: existingResumeError } = await supabase
                .from("resumes")
                .select("id, profile_id")
                .eq("id", resumeId)
                .eq("profile_id", user.id)
                .maybeSingle();

            if (existingResumeError) {
                throw new Error(existingResumeError.message);
            }

            if (!existingResume) {
                return {
                    success: false,
                    error: "Resume not found.",
                };
            }

        } else {
            const { data: insertedResume, error: insertedResumeError } = await supabase
                .from("resumes")
                .insert({
                    profile_id: user.id,
                    title: resumeData.title.trim() || "Untitled Resume",
                    summary: resumeData.summary ?? null,
                    is_default: false,
                })
                .select("id")
                .single();

            if (insertedResumeError || !insertedResume) {
                throw new Error(insertedResumeError?.message ?? "Unable to create resume.");
            }

            resumeId = insertedResume.id;
        }

        await replaceResumeRelations(resumeId, resumeData);

        return {
            success: true,
            data: {
                id: resumeId,
                resume: resumeData,
            },
        };
    } catch (error) {
        console.error("Candidate resume save failed", {
            userId: user.id,
            resumeId: parsed.resumeId ?? null,
            error: error instanceof Error ? error.message : error,
        });
        return {
            success: false,
            error: "We couldn't save your resume. Please try again.",
        };
    }
}
