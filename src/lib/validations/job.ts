import { z } from "zod";

export const jobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    company: z.string().min(1, "Company is required"),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    employment_type: z.string().optional().nullable(),
});

export const updateJobSchema = jobSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Update payload must contain at least one field" }
);

export const jobIdSchema = z.string().uuid("Invalid job ID format");

export type JobInput = z.infer<typeof jobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
