"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobIdSchema } from "@/lib/validations/job";
import type { Tables } from "@/lib/database.types";
import type { ResumeContent } from "@/lib/validations/resume";
import { scoreJobRelevance } from "@/lib/scoring/job-relevance";

type Application = Tables<"applications">;
type Job = Tables<"jobs">;
type Profile = Tables<"profiles">;

export type ApplicationWithRelations = Application & {
    job: Job | null;
    profile: Profile | null;
    resume: Pick<Tables<"resumes">, "id" | "title"> | null;
};

export type ApplicationWithJobDetails = Application & {
    job: {
        title: string;
        company: string;
        location: string | null;
        employment_type: string | null;
    } | null;
};

type ApplicationActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

import { applicationIdSchema, updateApplicationStatusSchema, withdrawableApplicationStatuses, withdrawnApplicationStatus } from "@/lib/validations/application";

export async function createApplication(
    jobId: string,
    resumeId: string
): Promise<ApplicationActionResult<Application>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "candidate") {
        return { success: false, error: "Only candidates can apply to jobs." };
    }

    const idValidation = jobIdSchema.safeParse(jobId);
    if (!idValidation.success) {
        return { success: false, error: "Invalid job ID" };
    }
    const id = idValidation.data;

    const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

    if (jobError) {
        console.error("createApplication: job lookup failed", { userId: user.id, jobId: id, code: jobError.code, message: jobError.message });
        return { success: false, error: "Unable to submit your application. Please try again." };
    }

    const { data: existingApplication, error: existingApplicationError } = await supabase
        .from("applications")
        .select("id")
        .eq("profile_id", user.id)
        .eq("job_id", id)
        .neq("status", withdrawnApplicationStatus)
        .limit(1)
        .maybeSingle();

    if (existingApplicationError) {
        console.error("createApplication: duplicate check failed", { userId: user.id, jobId: id, code: existingApplicationError.code, message: existingApplicationError.message });
        return { success: false, error: "Unable to submit your application. Please try again." };
    }

    if (existingApplication) {
        return { success: false, error: "You already have an active application for this job." };
    }

    const { data: candidateResumes, error: resumesError } = await supabase
        .from("resumes")
        .select("id, title, summary, profile_id, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)")
        .eq("profile_id", user.id)
        .order("updated_at", { ascending: false });

    if (resumesError) {
        console.error("createApplication: resume fetch failed", { userId: user.id, code: resumesError.code, message: resumesError.message });
        return { success: false, error: "Unable to submit your application. Please try again." };
    }

    if (!candidateResumes || candidateResumes.length === 0) {
        return { success: false, error: "Create a resume before applying to a job." };
    }

    if (!resumeId.trim()) {
        return { success: false, error: "Please select a resume to submit with this application." };
    }

    const selectedResume = candidateResumes.find((resume) => resume.id === resumeId);
    if (!selectedResume) {
        return { success: false, error: "Selected resume not found." };
    }

    const resumeContent: ResumeContent = {
        title: selectedResume.title,
        summary: selectedResume.summary ?? undefined,
        experience: (selectedResume.resume_experiences ?? []).map((exp) => ({
            company: exp.company,
            position: exp.position,
            location: exp.location ?? undefined,
            startDate: exp.start_date,
            endDate: exp.end_date ?? undefined,
            isCurrent: exp.is_current,
            description: exp.description ?? undefined,
        })),
        education: (selectedResume.resume_education ?? []).map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study ?? undefined,
            grade: edu.grade ?? undefined,
            startDate: edu.start_date ?? undefined,
            endDate: edu.end_date ?? undefined,
        })),
        skills: (selectedResume.resume_skills ?? []).map((s) => ({
            skill: s.skill,
        })),
        projects: (selectedResume.resume_projects ?? []).map((p) => ({
            title: p.title,
            description: p.description ?? undefined,
            technologies: p.technologies ?? undefined,
            githubUrl: p.github_url ?? undefined,
            liveUrl: p.live_url ?? undefined,
        })),
    };

    const scoringResult = await scoreJobRelevance(
        resumeContent,
        job.description ?? ""
    );

    if (!scoringResult.success) {
        return {
            success: false,
            error: scoringResult.error ?? "Failed to score job relevance.",
        };
    }

    const matchScore = scoringResult.totalScore;

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return { success: false, error: "Application submission is temporarily unavailable." };
    }

    const { data, error: insertError } = await admin
        .from("applications")
        .insert({
            profile_id: user.id,
            job_id: id,
            resume_id: selectedResume.id,
            status: "applied",
            match_score: matchScore,
        })
        .select("*")
        .single();

    if (insertError) {
        if (insertError.code === "23505") {
            return { success: false, error: "You already have an active application for this job." };
        }

        console.error("createApplication: insert failed", { userId: user.id, jobId: id, code: insertError.code, message: insertError.message });
        return { success: false, error: "Unable to submit your application. Please try again." };
    }

    return { success: true, data };
}

export async function getApplicationsForJob(
    jobId: string
): Promise<ApplicationActionResult<ApplicationWithRelations[]>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const idValidation = jobIdSchema.safeParse(jobId);
    if (!idValidation.success) {
        return { success: false, error: "Invalid job ID" };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error("getApplicationsForJob: profile fetch failed", { userId: user.id, code: profileError.code, message: profileError.message });
        return { success: false, error: "Unable to load candidate applications." };
    }

    if (profile?.role !== "employer") {
        return { success: false, error: "Not authorized to view applications for this job." };
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return { success: false, error: "Unable to load candidate applications." };
    }

    const { data: job, error: jobError } = await admin
        .from("jobs")
        .select("id, profile_id")
        .eq("id", idValidation.data)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (jobError) {
        console.error("getApplicationsForJob: job ownership check failed", { userId: user.id, jobId: idValidation.data, code: jobError.code, message: jobError.message });
        return { success: false, error: "Unable to load candidate applications." };
    }

    if (!job) {
        return { success: false, error: "Job not found." };
    }

    if (job.profile_id !== user.id) {
        return { success: false, error: "Not authorized to view applications for this job." };
    }

    const { data, error } = await admin
        .from("applications")
        .select(`
            *,
            job:jobs(*),
            profile:profiles(*),
            resume:resumes(id, title)
        `)
        .eq("job_id", idValidation.data)
        .order("match_score", { ascending: false });

    if (error) {
        console.error("getApplicationsForJob: applications fetch failed", { userId: user.id, jobId: idValidation.data, code: error.code, message: error.message });
        return { success: false, error: "Unable to load candidate applications." };
    }

    return { success: true, data };
}

export async function getUserApplications(): Promise<ApplicationActionResult<ApplicationWithJobDetails[]>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("applications")
        .select(`
            *,
            job:jobs(title, company, location, employment_type)
        `)
        .eq("profile_id", user.id)
        .neq("status", withdrawnApplicationStatus)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getUserApplications: fetch failed", { userId: user.id, code: error.code, message: error.message });
        return { success: false, error: "Unable to load your applications. Please try again." };
    }

    return { success: true, data };
}

export async function updateApplicationStatus(
    input: unknown
): Promise<ApplicationActionResult<Application>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "employer") {
        return { success: false, error: "Not authorized to update application status." };
    }

    const validation = updateApplicationStatusSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: "Invalid application status update data" };
    }

    const { applicationId, status } = validation.data;

    const { data: application, error: applicationError } = await supabase
        .from("applications")
        .select("id, job_id, status")
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
        console.error("updateApplicationStatus: application fetch failed", { userId: user.id, applicationId, code: applicationError.code, message: applicationError.message });
        return { success: false, error: "Unable to update the application status. Please try again." };
    }

    if (!application) {
        return { success: false, error: "Application not found or not authorized." };
    }

    const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", application.job_id)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (jobError) {
        console.error("updateApplicationStatus: job ownership check failed", { userId: user.id, applicationId, code: jobError.code, message: jobError.message });
        return { success: false, error: "Unable to update the application status. Please try again." };
    }

    if (!job) {
        return { success: false, error: "Application not found or not authorized." };
    }

    // Withdrawal is terminal for this record; a reapplication creates a new one.
    if (application.status === withdrawnApplicationStatus) {
        return { success: false, error: "Withdrawn applications cannot be updated." };
    }

    const { data, error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId)
        .select("*")
        .single();

    if (error) {
        console.error("updateApplicationStatus: status update failed", { userId: user.id, applicationId, code: error.code, message: error.message });
        return { success: false, error: "Unable to update the application status. Please try again." };
    }

    return { success: true, data };
}

export async function withdrawApplication(
    applicationId: string
): Promise<ApplicationActionResult<Application>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const validation = applicationIdSchema.safeParse(applicationId);
    if (!validation.success) {
        return { success: false, error: "Invalid application ID" };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.error("withdrawApplication: profile fetch failed", { userId: user.id, code: profileError.code, message: profileError.message });
        return { success: false, error: "Unable to withdraw the application. Please try again." };
    }

    if (profile?.role !== "candidate") {
        return { success: false, error: "Only candidates can withdraw applications." };
    }

    const { data: application, error: applicationError } = await supabase
        .from("applications")
        .select("id, status")
        .eq("id", validation.data)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (applicationError) {
        console.error("withdrawApplication: application fetch failed", { userId: user.id, applicationId: validation.data, code: applicationError.code, message: applicationError.message });
        return { success: false, error: "Unable to withdraw the application. Please try again." };
    }

    if (!application) {
        return { success: false, error: "Application not found." };
    }

    if (!(withdrawableApplicationStatuses as readonly string[]).includes(application.status.toLowerCase())) {
        return { success: false, error: "This application can no longer be withdrawn." };
    }

    const { data, error } = await supabase
        .from("applications")
        .update({ status: withdrawnApplicationStatus })
        .eq("id", validation.data)
        .eq("profile_id", user.id)
        .in("status", withdrawableApplicationStatuses)
        .select("*")
        .maybeSingle();

    if (error) {
        console.error("withdrawApplication: update failed", { userId: user.id, applicationId: validation.data, code: error.code, message: error.message });
        return { success: false, error: "Unable to withdraw the application. Please try again." };
    }

    if (!data) {
        return { success: false, error: "This application was updated and can no longer be withdrawn." };
    }

    return { success: true, data };
}
