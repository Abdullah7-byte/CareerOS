import { ResumeContent } from "@/lib/validations/resume";

export interface ScoreCategory {
  score: number;
  maxScore: number;
  details: string[];
}

export interface DataStructureIntegrityResult {
  totalScore: number;
  maxScore: number;
  categories: {
    dateRepresentation: ScoreCategory;
    fieldCohesion: ScoreCategory;
    entryValidity: ScoreCategory;
  };
}

const isValidString = (s: string | undefined): boolean => s !== undefined && s.trim().length > 0;

export function scoreDataStructureAndIntegrity(resume: ResumeContent): DataStructureIntegrityResult {
  const categories = {
    dateRepresentation: getDateRepresentationScore(resume),
    fieldCohesion: getFieldCohesionScore(resume),
    entryValidity: getEntryValidityScore(resume),
  };

  const totalScore = 
    categories.dateRepresentation.score + 
    categories.fieldCohesion.score + 
    categories.entryValidity.score;

  return {
    totalScore,
    maxScore: 35,
    categories,
  };
}

function getDateRepresentationScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  let representationScore = 0;
  let logicScore = 0;
  
  const MAX_REPRESENTATION = 5;
  const MAX_LOGIC = 5;

  let totalDatesApplicable = 0;
  let validDates = 0;

  let totalLogicApplicable = 0;
  let validLogic = 0;

  // Evaluate Experience dates
  resume.experience.forEach(exp => {
    // Structure
    totalDatesApplicable++; // startDate always applicable
    if (isValidString(exp.startDate) && exp.startDate!.trim().length >= 4) {
      validDates++;
    } else {
      details.push(`Experience "${exp.company || 'Unknown'}" is missing a substantive start date.`);
    }

    if (!exp.isCurrent) {
      totalDatesApplicable++; // endDate always applicable if not current
      if (isValidString(exp.endDate) && exp.endDate!.trim().length >= 4) {
        validDates++;
      } else {
        details.push(`Experience "${exp.company || 'Unknown'}" is missing a substantive end date.`);
      }
    } else if (isValidString(exp.endDate)) {
      totalDatesApplicable++; // evaluate end date if provided anyway
      if (exp.endDate!.trim().length >= 4) validDates++;
    }

    // Logic
    totalLogicApplicable++;
    const hasEndDate = isValidString(exp.endDate);
    if (exp.isCurrent) {
      if (!hasEndDate) {
        validLogic++;
      } else {
        details.push(`Experience "${exp.company || 'Unknown'}" is marked current but has an end date.`);
      }
    } else {
      if (hasEndDate) {
        validLogic++;
      } else {
        details.push(`Experience "${exp.company || 'Unknown'}" is not current but is missing an end date.`);
      }
    }
  });

  // Evaluate Education dates
  resume.education.forEach(edu => {
    if (isValidString(edu.startDate)) {
      totalDatesApplicable++;
      if (edu.startDate!.trim().length >= 4) validDates++;
    }
    if (isValidString(edu.endDate)) {
      totalDatesApplicable++;
      if (edu.endDate!.trim().length >= 4) validDates++;
    }
  });

  if (totalDatesApplicable === 0) {
    representationScore = MAX_REPRESENTATION;
    details.push("No dates provided to evaluate representation (neutral 5/5).");
  } else {
    representationScore = (validDates / totalDatesApplicable) * MAX_REPRESENTATION;
    details.push(`Date representation validity: ${validDates}/${totalDatesApplicable} (+${representationScore.toFixed(1)})`);
  }

  if (totalLogicApplicable === 0) {
    logicScore = MAX_LOGIC;
    details.push("No experience dates provided to evaluate logic (neutral 5/5).");
  } else {
    logicScore = (validLogic / totalLogicApplicable) * MAX_LOGIC;
    details.push(`Date logic consistency: ${validLogic}/${totalLogicApplicable} (+${logicScore.toFixed(1)})`);
  }

  const total = Math.round((representationScore + logicScore) * 10) / 10;
  return { score: total, maxScore: MAX_REPRESENTATION + MAX_LOGIC, details };
}

function getFieldCohesionScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  
  let urlScore = 0;
  let pairingsScore = 0;
  let coreScore = 0;

  const MAX_URL = 5;
  const MAX_PAIRINGS = 5;
  const MAX_CORE = 5;

  let totalUrls = 0;
  let validUrls = 0;

  let totalPairings = 0;
  let validPairings = 0;

  let totalCore = 0;
  let validCore = 0;

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  // 1. URLs
  resume.projects.forEach(proj => {
    if (isValidString(proj.githubUrl)) {
      totalUrls++;
      if (isValidUrl(proj.githubUrl!)) validUrls++;
      else details.push(`Invalid URL format in project "${proj.title || 'Unknown'}" (githubUrl)`);
    }
    if (isValidString(proj.liveUrl)) {
      totalUrls++;
      if (isValidUrl(proj.liveUrl!)) validUrls++;
      else details.push(`Invalid URL format in project "${proj.title || 'Unknown'}" (liveUrl)`);
    }
  });

  // 2. Pairings & 3. Core Field Integrity
  resume.education.forEach(edu => {
    // Core
    totalCore++;
    if (isValidString(edu.institution) && isValidString(edu.degree)) {
      validCore++;
    } else {
      details.push("Education entry missing core institution or degree.");
    }

    // Pairings
    if (isValidString(edu.grade) || isValidString(edu.fieldOfStudy)) {
      totalPairings++;
      if (isValidString(edu.institution) && isValidString(edu.degree)) {
        validPairings++;
      } else {
        details.push("Education entry has grade/fieldOfStudy but missing institution/degree.");
      }
    }
  });

  resume.projects.forEach(proj => {
    // Core
    totalCore++;
    if (isValidString(proj.title)) {
      validCore++;
    } else {
      details.push("Project entry missing core title.");
    }

    // Pairings
    if (isValidString(proj.githubUrl) || isValidString(proj.liveUrl) || isValidString(proj.technologies) || isValidString(proj.description)) {
      totalPairings++;
      if (isValidString(proj.title)) {
        validPairings++;
      } else {
        details.push("Project entry has details/URL but missing title.");
      }
    }
  });

  resume.experience.forEach(exp => {
    // Core
    totalCore++;
    if (isValidString(exp.company) && isValidString(exp.position)) {
      validCore++;
    } else {
      details.push("Experience entry missing core company or position.");
    }
  });

  // Calculate Scores
  if (totalUrls === 0) {
    urlScore = MAX_URL;
  } else {
    urlScore = (validUrls / totalUrls) * MAX_URL;
  }

  if (totalPairings === 0) {
    pairingsScore = MAX_PAIRINGS;
  } else {
    pairingsScore = (validPairings / totalPairings) * MAX_PAIRINGS;
  }

  if (totalCore === 0) {
    coreScore = MAX_CORE;
  } else {
    coreScore = (validCore / totalCore) * MAX_CORE;
  }

  const total = Math.round((urlScore + pairingsScore + coreScore) * 10) / 10;
  details.unshift(`Field Cohesion: URLs (${totalUrls ? `${validUrls}/${totalUrls}` : 'N/A'}), Pairings (${totalPairings ? `${validPairings}/${totalPairings}` : 'N/A'}), Core (${totalCore ? `${validCore}/${totalCore}` : 'N/A'})`);
  
  return { score: total, maxScore: MAX_URL + MAX_PAIRINGS + MAX_CORE, details };
}

function getEntryValidityScore(resume: ResumeContent): ScoreCategory {
  const details: string[] = [];
  
  const MAX_VALIDITY = 6;
  const MAX_NON_EMPTY_SKILLS = 2;
  const MAX_UNIQUE_SKILLS = 2;

  let validityScore = 0;
  let nonemptySkillsScore = 0;
  let uniqueSkillsScore = 0;

  const isObjEmptyStr = (obj: Record<string, unknown>) => {
    return Object.values(obj).every(v => typeof v !== 'string' || v.trim().length === 0);
  };

  // 1. Entry Validity (6 points)
  let totalArrays = 0;
  let validArrays = 0;

  const checkArray = <T extends Record<string, unknown>>(arr: T[], name: string) => {
    if (arr.length > 0) {
      totalArrays++;
      const noEmpty = arr.every(item => !isObjEmptyStr(item));
      if (noEmpty) validArrays++;
      else details.push(`Found completely empty entry in ${name}`);
    }
  };

  checkArray(resume.experience, "experience");
  checkArray(resume.education, "education");
  checkArray(resume.skills, "skills");
  checkArray(resume.projects, "projects");

  if (totalArrays === 0) {
    validityScore = MAX_VALIDITY;
  } else {
    validityScore = (validArrays / totalArrays) * MAX_VALIDITY;
  }

  // 2. Skill Normalization (4 points)
  if (resume.skills.length > 0) {
    let validDiscrete = 0;
    resume.skills.forEach(skill => {
      // Must be substantive (e.g. at least 1 char) and not excessively long (e.g. > 60 chars)
      const val = skill.skill?.trim();
      if (val && val.length > 0 && val.length <= 60) {
        validDiscrete++;
      } else {
        details.push(`Skill entry is empty or excessively long (>60 chars).`);
      }
    });
    nonemptySkillsScore = (validDiscrete / resume.skills.length) * MAX_NON_EMPTY_SKILLS;

    const uniqueSkills = new Set(resume.skills.map(s => s.skill?.trim().toLowerCase()));
    if (uniqueSkills.size === resume.skills.length) {
      uniqueSkillsScore = MAX_UNIQUE_SKILLS;
    } else {
      uniqueSkillsScore = (uniqueSkills.size / resume.skills.length) * MAX_UNIQUE_SKILLS; // Proportional penalty for duplicates
      details.push("Found duplicate skill entries.");
    }
  } else {
    nonemptySkillsScore = MAX_NON_EMPTY_SKILLS;
    uniqueSkillsScore = MAX_UNIQUE_SKILLS;
  }

  const total = Math.round((validityScore + nonemptySkillsScore + uniqueSkillsScore) * 10) / 10;
  return { score: total, maxScore: MAX_VALIDITY + MAX_NON_EMPTY_SKILLS + MAX_UNIQUE_SKILLS, details };
}
