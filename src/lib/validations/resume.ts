import { z } from "zod";

const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().optional(),
  grade: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const skillSchema = z.object({
  skill: z.string(),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  technologies: z.string().optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
});

export const resumeContentSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
  projects: z.array(projectSchema),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;