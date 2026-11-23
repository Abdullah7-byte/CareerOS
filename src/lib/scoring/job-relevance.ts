import { ResumeContent } from "@/lib/validations/resume";
import { evaluateJobRelevance } from "@/lib/ai/job-matcher";
import { ScoreCategory } from "./parseability";

export const SCORE_RUBRIC_VERSION = "grounded-v1";

export interface EvidenceCategory extends ScoreCategory {
  evidence: { requirements: string[]; matched: string[]; resumeEvidence: string[] };
}

export interface JobRelevanceResult {
  success: boolean;
  outcome?: "scored" | "insufficient";
  totalScore?: number;
  maxScore: number;
  categories?: {
    requiredSkills: EvidenceCategory;
    preferredSkills: EvidenceCategory;
    responsibilities: EvidenceCategory;
    qualifications: EvidenceCategory;
    overallRelevance: EvidenceCategory;
  };
  error?: string;
}

const aliases: Record<string, string> = {
  reactjs: "react", "react js": "react", nodejs: "node", "node js": "node",
  js: "javascript", ts: "typescript",
};

function canonical(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9+# ]/g, " ").replace(/\s+/g, " ").trim();
  return normalized.split(" ").map((token) => aliases[token] ?? token).join(" ");
}

function unique(values: string[]) { return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))); }

function containsTerm(haystack: string, term: string) {
  const text = canonical(haystack);
  const target = canonical(term);
  return target.length > 1 && (` ${text} `).includes(` ${target} `);
}

function isNegated(haystack: string, term: string) {
  const target = canonical(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b(?:no|not|without|lack(?:ing)?)\\s+(?:[a-z0-9+#.]+\\s+){0,2}${target}\\b`, "i").test(canonical(haystack));
}

function resumeEvidence(resume: ResumeContent) {
  return [
    ...resume.skills.map((skill) => `skill: ${skill.skill}`),
    resume.summary ? `summary: ${resume.summary}` : "",
    ...resume.experience.flatMap((item) => [`experience: ${item.position} ${item.company}`, item.description ? `experience detail: ${item.description}` : ""]),
    ...resume.education.map((item) => `education: ${item.degree} ${item.fieldOfStudy ?? ""} ${item.institution}`),
    ...resume.projects.flatMap((item) => [`project: ${item.title} ${item.technologies ?? ""}`, item.description ? `project detail: ${item.description}` : ""]),
  ].filter(Boolean);
}

function groundedMatches(requirements: string[], modelMatches: string[], jobDescription: string, evidence: string[]) {
  const acceptedRequirements = unique(requirements).filter((requirement) => containsTerm(jobDescription, requirement));
  const matches = unique(modelMatches).filter((match) => {
    const requirement = acceptedRequirements.find((item) => canonical(item) === canonical(match));
    return Boolean(requirement) && evidence.some((line) => containsTerm(line, match) && !isNegated(line, match));
  });
  return { requirements: acceptedRequirements, matches, resumeEvidence: matches.flatMap((match) => evidence.filter((line) => containsTerm(line, match) && !isNegated(line, match))) };
}

function category(maxScore: number, requirements: string[], matches: string[], evidence: string[], label: string): EvidenceCategory {
  const score = requirements.length ? (matches.length / requirements.length) * maxScore : 0;
  return {
    score,
    maxScore,
    details: requirements.length ? [`Grounded ${matches.length} of ${requirements.length} ${label} (+${score.toFixed(1)})`] : [`No grounded ${label} in this job description`],
    evidence: { requirements, matched: matches, resumeEvidence: evidence },
  };
}

export async function scoreJobRelevance(
  resume: ResumeContent,
  jobDescription: string,
  evaluate: typeof evaluateJobRelevance = evaluateJobRelevance,
): Promise<JobRelevanceResult> {
  const result = await evaluate(resume, jobDescription);
  if (!result.success || !result.data) return { success: false, maxScore: 25, error: result.error || "AI evaluation failed" };

  const sourceEvidence = resumeEvidence(resume);
  const required = groundedMatches(result.data.requiredSkills.identified, result.data.requiredSkills.matched, jobDescription, sourceEvidence);
  const preferred = groundedMatches(result.data.preferredSkills.identified, result.data.preferredSkills.matched, jobDescription, sourceEvidence);
  const qualifications = groundedMatches(result.data.qualifications.identified, result.data.qualifications.matched, jobDescription, sourceEvidence);
  if (required.requirements.length + preferred.requirements.length + qualifications.requirements.length === 0) {
    return { success: true, outcome: "insufficient", maxScore: 25 };
  }

  const requiredSkills = category(8, required.requirements, required.matches, required.resumeEvidence, "required skills");
  const preferredSkills = category(4, preferred.requirements, preferred.matches, preferred.resumeEvidence, "preferred skills");
  const qualificationCategory = category(4, qualifications.requirements, qualifications.matches, qualifications.resumeEvidence, "qualifications");
  const responsibilities: EvidenceCategory = { score: result.data.responsibilities.score, maxScore: 5, details: [result.data.responsibilities.details], evidence: { requirements: [], matched: [], resumeEvidence: [] } };
  const overallRelevance: EvidenceCategory = { score: (result.data.overallRelevance.score / 5) * 4, maxScore: 4, details: [result.data.overallRelevance.details], evidence: { requirements: [], matched: [], resumeEvidence: [] } };
  const totalScore = Math.round((requiredSkills.score + preferredSkills.score + qualificationCategory.score + responsibilities.score + overallRelevance.score) * 10) / 10;
  return { success: true, outcome: "scored", totalScore, maxScore: 25, categories: { requiredSkills, preferredSkills, responsibilities, qualifications: qualificationCategory, overallRelevance } };
}
