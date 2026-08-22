import { ResumeContent } from "@/lib/validations/resume";
import { ScoreCategory } from "./parseability";

export interface CompletenessResult {
  totalScore: number;
  maxScore: number;
  categories: {
    title: ScoreCategory;
    summary: ScoreCategory;
    education: ScoreCategory;
    skills: ScoreCategory;
    experienceOrProjects: ScoreCategory;
  };
}

const isValidString = (s: string | undefined): boolean => s !== undefined && s.trim().length > 0;

export function scoreResumeCompleteness(resume: ResumeContent): CompletenessResult {
  const categories = {
    title: getTitleScore(resume),
    summary: getSummaryScore(resume),
    education: getEducationScore(resume),
    skills: getSkillsScore(resume),
    experienceOrProjects: getExperienceOrProjectsScore(resume),
  };

  const totalScore = 
    categories.title.score +
    categories.summary.score +
    categories.education.score +
    categories.skills.score +
    categories.experienceOrProjects.score;

  return {
    totalScore,
    maxScore: 20,
    categories,
  };
}

function getTitleScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let score = 0;
  const maxScore = 2;

  if (isValidString(resume.title)) {
    score = 2;
    details.push("Resume has a title (+2)");
  } else {
    details.push("Resume title is missing (0/2)");
  }

  return { score, maxScore, details };
}

function getSummaryScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let score = 0;
  const maxScore = 4;

  if (isValidString(resume.summary)) {
    score = 4;
    details.push("Resume contains a summary (+4)");
  } else {
    details.push("Resume summary is missing (0/4)");
  }

  return { score, maxScore, details };
}

function getEducationScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let score = 0;
  const maxScore = 4;

  const hasMeaningfulEdu = resume.education.some(edu => isValidString(edu.institution) && isValidString(edu.degree));

  if (hasMeaningfulEdu) {
    score = 4;
    details.push("Resume contains at least one populated education entry (+4)");
  } else {
    details.push("Resume education section is empty or missing (0/4)");
  }

  return { score, maxScore, details };
}

function getSkillsScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let score = 0;
  const maxScore = 4;

  const meaningfulSkills = resume.skills.filter(s => isValidString(s.skill)).length;

  if (meaningfulSkills >= 3) {
    score = 4;
    details.push(`Resume contains ${meaningfulSkills} populated skills (+4)`);
  } else if (meaningfulSkills >= 1) {
    score = 2;
    details.push(`Resume contains ${meaningfulSkills} populated skill(s). Add more to maximize score (+2)`);
  } else {
    details.push("Resume skills section is empty or missing (0/4)");
  }

  return { score, maxScore, details };
}

function getExperienceOrProjectsScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let score = 0;
  const maxScore = 6;

  const hasMeaningfulExp = resume.experience.some(exp => isValidString(exp.company) && isValidString(exp.position));
  const hasMeaningfulProj = resume.projects.some(proj => isValidString(proj.title));

  if (hasMeaningfulExp) {
    score = 6;
    details.push("Resume contains populated experience entries (+6)");
  } else if (hasMeaningfulProj) {
    score = 6;
    details.push("No experience found, but resume contains populated project entries (+6)");
  } else {
    details.push("Resume must contain at least one meaningful experience or project entry (0/6)");
  }

  return { score, maxScore, details };
}
