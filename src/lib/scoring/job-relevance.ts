import { ResumeContent } from "@/lib/validations/resume";
import { evaluateJobRelevance } from "@/lib/ai/job-matcher";
import { ScoreCategory } from "./parseability";

export interface JobRelevanceResult {
  success: boolean;
  totalScore?: number;
  maxScore: number;
  categories?: {
    requiredSkills: ScoreCategory;
    preferredSkills: ScoreCategory;
    responsibilities: ScoreCategory;
    qualifications: ScoreCategory;
    overallRelevance: ScoreCategory;
  };
  error?: string;
}

function sanitizeMatches(identified: string[], matched: string[]): string[] {
  const uniqueIdentified = new Set(identified.map(s => s.toLowerCase().trim()));
  const uniqueMatched = new Set(matched.map(s => s.trim()));
  
  // Only keep matched items that are actually in the identified array (case insensitive check, but return original case if possible or just normalized)
  const sanitized: string[] = [];
  for (const m of uniqueMatched) {
    if (uniqueIdentified.has(m.toLowerCase())) {
      sanitized.push(m);
    }
  }
  return sanitized;
}

export async function scoreJobRelevance(resume: ResumeContent, jobDescription: string): Promise<JobRelevanceResult> {
  const result = await evaluateJobRelevance(resume, jobDescription);

  if (!result.success || !result.data) {
    return {
      success: false,
      maxScore: 25,
      error: result.error || "AI evaluation failed",
    };
  }

  const { requiredSkills, preferredSkills, responsibilities, qualifications, overallRelevance } = result.data;

  // Sanitize
  const reqIdentified = Array.from(new Set(requiredSkills.identified.map(s => s.trim())));
  const reqMatched = sanitizeMatches(reqIdentified, requiredSkills.matched);

  const prefIdentified = Array.from(new Set(preferredSkills.identified.map(s => s.trim())));
  const prefMatched = sanitizeMatches(prefIdentified, preferredSkills.matched);

  const qualIdentified = Array.from(new Set(qualifications.identified.map(s => s.trim())));
  const qualMatched = sanitizeMatches(qualIdentified, qualifications.matched);

  // Deterministic scoring
  // Note: We deliberately use "neutral scoring" (awarding full points) when the JD lacks 
  // explicit requirements in a category. This prevents unfairly penalizing a resume for missing 
  // qualifications if the JD never asked for them, though it can inflate scores for sparse JDs.
  let requiredScore = 8;
  let requiredDetails = "No specific required skills identified in JD (+8)";
  if (reqIdentified.length > 0) {
    requiredScore = (reqMatched.length / reqIdentified.length) * 8;
    requiredDetails = `Matched ${reqMatched.length} of ${reqIdentified.length} required skills (+${requiredScore.toFixed(1)})`;
  }

  let preferredScore = 4;
  let preferredDetails = "No specific preferred skills identified in JD (+4)";
  if (prefIdentified.length > 0) {
    preferredScore = (prefMatched.length / prefIdentified.length) * 4;
    preferredDetails = `Matched ${prefMatched.length} of ${prefIdentified.length} preferred skills (+${preferredScore.toFixed(1)})`;
  }

  let qualScore = 4;
  let qualDetails = "No explicit qualifications required in JD (+4)";
  if (qualIdentified.length > 0) {
    qualScore = (qualMatched.length / qualIdentified.length) * 4;
    qualDetails = `Matched ${qualMatched.length} of ${qualIdentified.length} qualifications (+${qualScore.toFixed(1)})`;
  }

  // LLM evaluated Semantic alignments
  // Responsibilities out of 5
  const respScore = responsibilities.score; 

  // Overall Relevance out of 4 (LLM gives 0-5, we map to /4)
  const relScore = (overallRelevance.score / 5) * 4;

  const totalScore = requiredScore + preferredScore + qualScore + respScore + relScore;

  return {
    success: true,
    totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal place for neatness
    maxScore: 25,
    categories: {
      requiredSkills: { score: requiredScore, maxScore: 8, details: [requiredDetails] },
      preferredSkills: { score: preferredScore, maxScore: 4, details: [preferredDetails] },
      responsibilities: { score: respScore, maxScore: 5, details: [responsibilities.details] },
      qualifications: { score: qualScore, maxScore: 4, details: [qualDetails] },
      overallRelevance: { score: relScore, maxScore: 4, details: [overallRelevance.details] },
    },
  };
}
