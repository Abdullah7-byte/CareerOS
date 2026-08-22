import * as z from "zod";

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().max(120, "Full name must be 120 characters or fewer.").transform((value) => value || null),
  headline: z.string().trim().max(120, "Headline must be 120 characters or fewer.").transform((value) => value || null),
  location: z.string().trim().max(150, "Location must be 150 characters or fewer.").optional().transform((value) => value && value.trim() ? value.trim() : null),
  phone: z.string().trim().max(20, "Phone must be 20 characters or fewer.").optional().transform((value) => value && value.trim() ? value.trim() : null),
});

export const employerProfileSchema = z.object({
  organizationName: z.string().trim().max(150, "Company name must be 150 characters or fewer.").transform((value) => value || null),
  organizationWebsite: z.string().trim().max(200, "Company website must be 200 characters or fewer.").optional().transform((value) => value && value.trim() ? value.trim() : null),
  recruiterName: z.string().trim().max(120, "Recruiter name must be 120 characters or fewer.").transform((value) => value || null),
  recruiterTitle: z.string().trim().max(120, "Recruiter title must be 120 characters or fewer.").transform((value) => value || null),
});

export type ProfileSettingsInput = z.input<typeof profileSettingsSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters.")
    .max(72, "New password must be 72 characters or fewer."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).superRefine(({ currentPassword, newPassword, confirmPassword }, context) => {
  if (newPassword !== confirmPassword) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "New passwords do not match.",
    });
  }

  if (currentPassword === newPassword) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["newPassword"],
      message: "Choose a password that differs from your current password.",
    });
  }
});
