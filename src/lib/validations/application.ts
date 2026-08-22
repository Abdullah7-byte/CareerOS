import * as z from "zod";

export const applicationIdSchema = z.string().uuid("Invalid application ID");
export const withdrawableApplicationStatuses = ["applied", "reviewing"] as const;
export const withdrawnApplicationStatus = "withdrawn" as const;
export const applicationStatusSchema = z.enum([
    "applied",
    "reviewing",
    "interview",
    "offer",
    "rejected",
    "hired",
    "withdrawn",
]);

// These statuses are controlled by an employer. Withdrawal is deliberately
// excluded because it is a candidate-only operation.
export const employerApplicationStatusSchema = applicationStatusSchema.exclude(["withdrawn"]);

export const updateApplicationStatusSchema = z.object({
    applicationId: applicationIdSchema,
    status: employerApplicationStatusSchema,
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
