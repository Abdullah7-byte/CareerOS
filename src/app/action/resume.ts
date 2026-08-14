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

    if (resumeData.experience && resumeData.experience.length > 0) {
        for (const exp of resumeData.experience) {
            if (!exp.startDate || exp.startDate.trim() === "") {
                return {
                    success: false,
                    error: "Start date is required for all experience entries.",
                };
            }
        }
    }

    const { data: existingResume } = await supabase
        .from("resumes")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

    let currentResumeId: string;

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
        currentResumeId = existingResume.id;
    } else {
        const { data: newResume, error } = await supabase
            .from("resumes")
            .insert({
                profile_id: user.id,
                title: resumeData.title,
                summary: resumeData.summary ?? null,
                is_default: true,
            })
            .select("id")
            .single();

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        currentResumeId = newResume.id;
    }

    if (currentResumeId) {
        const { error: deleteError } = await supabase
            .from("resume_experiences")
            .delete()
            .eq("resume_id", currentResumeId);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        if (resumeData.experience && resumeData.experience.length > 0) {
            const experiencesToInsert = resumeData.experience.map((exp) => ({
                resume_id: currentResumeId,
                company: exp.company,
                position: exp.position,
                location: exp.location || null,
                start_date: exp.startDate,
                end_date: exp.endDate ? exp.endDate : null,
                is_current: exp.isCurrent,
                description: exp.description || null,
            }));

            const { error: insertError } = await supabase
                .from("resume_experiences")
                .insert(experiencesToInsert);

            if (insertError) {
                return { success: false, error: insertError.message };
            }
        }

        const { error: delEduError } = await supabase
            .from("resume_education")
            .delete()
            .eq("resume_id", currentResumeId);
        if (delEduError) return { success: false, error: delEduError.message };

        if (resumeData.education && resumeData.education.length > 0) {
            const educationToInsert = resumeData.education.map((edu) => ({
                resume_id: currentResumeId,
                institution: edu.institution,
                degree: edu.degree,
                field_of_study: edu.fieldOfStudy || null,
                start_date: edu.startDate ? edu.startDate : null,
                end_date: edu.endDate ? edu.endDate : null,
                grade: edu.grade || null,
            }));
            const { error: insEduError } = await supabase
                .from("resume_education")
                .insert(educationToInsert);
            if (insEduError) return { success: false, error: insEduError.message };
        }

        const { error: delSkillError } = await supabase
            .from("resume_skills")
            .delete()
            .eq("resume_id", currentResumeId);
        if (delSkillError) return { success: false, error: delSkillError.message };

        if (resumeData.skills && resumeData.skills.length > 0) {
            const skillsToInsert = resumeData.skills.map((s) => ({
                resume_id: currentResumeId,
                skill: s.skill,
            }));
            const { error: insSkillError } = await supabase
                .from("resume_skills")
                .insert(skillsToInsert);
            if (insSkillError) return { success: false, error: insSkillError.message };
        }

        const { error: delProjError } = await supabase
            .from("resume_projects")
            .delete()
            .eq("resume_id", currentResumeId);
        if (delProjError) return { success: false, error: delProjError.message };

        if (resumeData.projects && resumeData.projects.length > 0) {
            const projectsToInsert = resumeData.projects.map((p) => ({
                resume_id: currentResumeId,
                title: p.title,
                description: p.description || null,
                technologies: p.technologies || null,
                github_url: p.githubUrl || null,
                live_url: p.liveUrl || null,
            }));
            const { error: insProjError } = await supabase
                .from("resume_projects")
                .insert(projectsToInsert);
            if (insProjError) return { success: false, error: insProjError.message };
        }
    }

    return {
        success: true,
        data: resumeData,
    };
}