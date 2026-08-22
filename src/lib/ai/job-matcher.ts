import groq from "@/lib/ai/groq";
import { ResumeContent, jobRelevanceEvaluationSchema } from "@/lib/validations/resume";

export async function evaluateJobRelevance(resume: ResumeContent, jobDescription: string) {
  const prompt = `You are a professional technical recruiter and ATS parsing engine.
Your task is to evaluate how well a resume aligns with a specific job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${JSON.stringify(resume, null, 2)}

INSTRUCTIONS:
1. Extract requirements ONLY explicitly stated in the JOB DESCRIPTION. Do not invent requirements.
2. Cross-reference those requirements with the RESUME. Mark a requirement as "matched" ONLY if the resume explicitly supports it.
3. Normalize equivalent terminology (e.g., ReactJS -> React). Do NOT treat merely related technologies (e.g., AWS vs Docker) as matches.
4. Provide a semantic alignment score (0-5) for "responsibilities" and "overallRelevance".
5. The overallRelevance score must be a holistic semantic assessment, NOT just a keyword count.

STRICT SAFEGUARDS:
- EVERY matched item must also exist in the corresponding identified array.
- NEVER invent requirements.
- NO DUPLICATE ITEMS in identified or matched arrays.
- If no requirements exist in a category (e.g., no explicit qualifications), return empty arrays.

Return JSON EXACTLY matching this schema:
{
  "requiredSkills": {
    "identified": ["<skill1>", "<skill2>"],
    "matched": ["<skill1>"]
  },
  "preferredSkills": {
    "identified": [],
    "matched": []
  },
  "responsibilities": {
    "score": <0-5 integer>,
    "details": "<1 sentence explanation>"
  },
  "qualifications": {
    "identified": ["<qual1>"],
    "matched": []
  },
  "overallRelevance": {
    "score": <0-5 integer>,
    "details": "<1 sentence explanation>"
  }
}`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a precise AI resume/job matcher. Return only the requested structured JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    return { success: false, error: "AI returned an empty response" };
  }

  try {
    const parsed = JSON.parse(content);
    const result = jobRelevanceEvaluationSchema.safeParse(parsed);

    if (!result.success) {
      return { success: false, error: "AI returned invalid scoring schema" };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return { success: false, error: "AI returned invalid JSON" };
  }
}
