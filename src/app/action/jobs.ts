"use server";

import { createClient } from "@/lib/supabase/server";
import { jobSchema, updateJobSchema, jobIdSchema } from "@/lib/validations/job";
import type { Tables } from "@/lib/database.types";

type Job = Tables<"jobs">;

type JobActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export async function createJob(input: unknown): Promise<JobActionResult<Job>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'employer') {
        return { success: false, error: 'Only employers can post jobs.' };
    }

    const result = jobSchema.safeParse(input);
    if (!result.success) {
        return { success: false, error: "Invalid job data" };
    }

    const jobData = result.data;

    const { data, error } = await supabase
        .from("jobs")
        .insert({
            profile_id: user.id,
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            description: jobData.description,
            employment_type: jobData.employment_type,
        })
        .select("*")
        .single();

    if (error) {
        console.error("createJob: insert failed", { userId: user.id, code: error.code, message: error.message });
        return { success: false, error: "Unable to save the job. Please try again." };
    }

    return { success: true, data };
}

export async function getBrowseJobs(): Promise<JobActionResult<Job[]>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getBrowseJobs: fetch failed", { userId: user.id, code: error.code, message: error.message });
        return { success: false, error: "Unable to load jobs. Please try again." };
    }

    return { success: true, data };
}

export async function getMyJobs(): Promise<JobActionResult<Job[]>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Employers see only their own jobs
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getMyJobs: fetch failed", { userId: user.id, code: error.code, message: error.message });
        return { success: false, error: "Unable to load your jobs. Please try again." };
    }

    return { success: true, data };
}

export async function getJobById(jobId: string): Promise<JobActionResult<Job>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'employer') {
        return { success: false, error: 'Only employers can manage jobs.' };
    }

    const idValidation = jobIdSchema.safeParse(jobId);
    if (!idValidation.success) {
        return { success: false, error: "Invalid job ID" };
    }
    const id = idValidation.data;

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("profile_id", user.id)
        .single();

    if (error) {
        console.error("getJobById: fetch failed", { userId: user.id, jobId: id, code: error.code, message: error.message });
        return { success: false, error: "Unable to load the job. Please try again." };
    }

    return { success: true, data };
}

export async function updateJob(jobId: string, input: unknown): Promise<JobActionResult<Job>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'employer') {
        return { success: false, error: 'Only employers can update jobs.' };
    }

    const idValidation = jobIdSchema.safeParse(jobId);
    if (!idValidation.success) {
        return { success: false, error: "Invalid job ID" };
    }
    const id = idValidation.data;

    const result = updateJobSchema.safeParse(input);
    if (!result.success) {
        return { success: false, error: "Invalid job data" };
    }

    const jobData = result.data;

    const { data, error } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", id)
        .eq("profile_id", user.id)
        .select("*")
        .single();

    if (error) {
        console.error("updateJob: update failed", { userId: user.id, jobId: id, code: error.code, message: error.message });
        return { success: false, error: "Unable to save the job. Please try again." };
    }

    return { success: true, data };
}

export async function deleteJob(jobId: string): Promise<JobActionResult<null>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'employer') {
        return { success: false, error: 'Only employers can delete jobs.' };
    }

    const idValidation = jobIdSchema.safeParse(jobId);
    if (!idValidation.success) {
        return { success: false, error: "Invalid job ID" };
    }
    const id = idValidation.data;

    const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id)
        .eq("profile_id", user.id)
        .select("*")
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return { success: false, error: "Job not found or access denied" };
        }
        console.error("deleteJob: delete failed", { userId: user.id, jobId: id, code: error.code, message: error.message });
        return { success: false, error: "Unable to delete the job. Please try again." };
    }

    return { success: true, data: null };
}