import test from "node:test";
import assert from "node:assert/strict";
import { scoreJobRelevance } from "../src/lib/scoring/job-relevance";
import type { ResumeContent } from "../src/lib/validations/resume";

const base: ResumeContent = { title: "Synthetic", experience: [], education: [], projects: [], skills: [{ skill: "ReactJS" }] };
const model = (identified: string[], matched: string[]) => async () => ({
  success: true as const,
  data: {
    requiredSkills: { identified, matched }, preferredSkills: { identified: [], matched: [] }, qualifications: { identified: [], matched: [] },
    responsibilities: { score: 0, details: "fixture" }, overallRelevance: { score: 0, details: "fixture" },
  },
});

test("grounds an explicit alias in both job and resume", async () => {
  const result = await scoreJobRelevance(base, "Requires React.", model(["React"], ["React"]) as never);
  assert.equal(result.outcome, "scored");
  assert.equal(result.categories?.requiredSkills.score, 8);
});

test("rejects model-only unsupported and negated skill claims", async () => {
  const unsupported = await scoreJobRelevance(base, "Requires Python.", model(["Python"], ["Python"]) as never);
  assert.equal(unsupported.categories?.requiredSkills.score, 0);
  const negated: ResumeContent = { ...base, skills: [{ skill: "No React experience" }] };
  const result = await scoreJobRelevance(negated, "Requires React.", model(["React"], ["React"]) as never);
  assert.equal(result.categories?.requiredSkills.score, 0);
});

test("marks jobs with no grounded requirements insufficient", async () => {
  const result = await scoreJobRelevance(base, "Help our team.", model([], []) as never);
  assert.equal(result.outcome, "insufficient");
  assert.equal(result.totalScore, undefined);
});

test("equivalent whitespace formatting yields the same grounded score", async () => {
  const compact = await scoreJobRelevance(base, "Requires React.", model(["React"], ["React"]) as never);
  const formatted = await scoreJobRelevance({ ...base, skills: [{ skill: "  ReactJS\n" }] }, "Requires   React.", model(["React"], ["React"]) as never);
  assert.equal(compact.totalScore, formatted.totalScore);
});

test("provider outage or malformed result is a recoverable scoring failure", async () => {
  const outage = await scoreJobRelevance(base, "Requires React.", async () => ({ success: false as const, error: "AI scoring is temporarily unavailable" }) as never);
  assert.equal(outage.success, false);
  assert.equal(outage.error, "AI scoring is temporarily unavailable");
});
