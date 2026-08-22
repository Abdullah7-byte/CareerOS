import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { scoreResumeCompleteness } from "@/lib/scoring/completeness";
import { scoreDataStructureAndIntegrity } from "@/lib/scoring/parseability";
import type { ResumeContent } from "@/lib/validations/resume";
import { CandidateHero } from "@/components/dashboard/candidate/candidate-hero";
import { TelemetryList } from "@/components/dashboard/candidate/telemetry-list";
import { IntelligenceCard } from "@/components/dashboard/candidate/intelligence-card";
import { JobRecommendations, JobMatchItem } from "@/components/dashboard/candidate/job-recommendations";
import { ApplicationTracker, CandidateApplicationItem } from "@/components/dashboard/candidate/application-tracker";
import { withdrawnApplicationStatus } from "@/lib/validations/application";

export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch User Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Fetch candidate resumes and use the most recently updated one for dashboard scoring
  const { data: resumes, error: resumeError } = await supabase
    .from("resumes")
    .select(
      "id, title, summary, updated_at, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)"
    )
    .eq("profile_id", user.id)
    .order("updated_at", { ascending: false });

  const resume = resumes?.[0] ?? null;

  // 3. Calculate Deterministic ATS Health Scores
  let completenessScore = 0;
  let parseabilityScore = 0;
  let healthPercentage = 0;
  let skillsCount = 0;
  let experienceCount = 0;
  let projectsCount = 0;
  let hasSummary = false;

  if (resume) {
    const resumeContent: ResumeContent = {
      title: resume.title,
      summary: resume.summary ?? undefined,
      experience: (resume.resume_experiences ?? []).map((exp) => ({
        company: exp.company,
        position: exp.position,
        location: exp.location ?? undefined,
        startDate: exp.start_date,
        endDate: exp.end_date ?? undefined,
        isCurrent: exp.is_current,
        description: exp.description ?? undefined,
      })),
      education: (resume.resume_education ?? []).map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.field_of_study ?? undefined,
        grade: edu.grade ?? undefined,
        startDate: edu.start_date ?? undefined,
        endDate: edu.end_date ?? undefined,
      })),
      skills: (resume.resume_skills ?? []).map((s) => ({
        skill: s.skill,
      })),
      projects: (resume.resume_projects ?? []).map((p) => ({
        title: p.title,
        description: p.description ?? undefined,
        technologies: p.technologies ?? undefined,
        githubUrl: p.github_url ?? undefined,
        liveUrl: p.live_url ?? undefined,
      })),
    };

    const compRes = scoreResumeCompleteness(resumeContent);
    const parseRes = scoreDataStructureAndIntegrity(resumeContent);

    completenessScore = compRes.totalScore; // out of 20
    parseabilityScore = parseRes.totalScore; // out of 35
    healthPercentage = Math.min(
      Math.round(((completenessScore + parseabilityScore) / 55) * 100),
      100
    );

    skillsCount = resume.resume_skills?.length ?? 0;
    experienceCount = resume.resume_experiences?.length ?? 0;
    projectsCount = resume.resume_projects?.length ?? 0;
    hasSummary = !!resume.summary && resume.summary.trim().length > 0;
  }

  // 4. Fetch Applications
  const { data: rawApplications, error: applicationsError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      match_score,
      status,
      applied_at,
      created_at,
      job:jobs(id, title, company, location, employment_type)
    `)
    .eq("profile_id", user.id)
    .neq("status", withdrawnApplicationStatus)
    .order("created_at", { ascending: false });

  const applications: CandidateApplicationItem[] = (rawApplications ?? []).map((app) => ({
    id: app.id,
    jobId: app.job_id,
    matchScore: app.match_score,
    status: app.status,
    appliedAt: app.applied_at,
    createdAt: app.created_at,
    job: app.job
      ? {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          employmentType: app.job.employment_type,
        }
      : null,
  }));

  // 5. Fetch Browse Jobs
  const { data: rawJobs, count: totalJobsCount, error: jobsError } = await supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(6);

  if (profileError || resumeError || applicationsError || jobsError) {
    throw new Error("We couldn't load your dashboard. Please try again.");
  }

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  const jobs: JobMatchItem[] = (rawJobs ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    employmentType: j.employment_type,
    description: j.description,
    createdAt: j.created_at,
    hasApplied: appliedJobIds.has(j.id),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Dashboard</h1>
        <p className="mt-2 text-sm leading-5 text-text-secondary">Your career workspace at a glance.</p>
        {(profile?.full_name || profile?.headline) && (
          <p className="mt-2 text-xs font-medium text-text-muted">
            {[profile.full_name, profile.headline].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      {/* 1. EDITORIAL HERO & NEXT BEST ACTION */}
      <CandidateHero
        fullName={profile?.full_name ?? null}
        headline={profile?.headline ?? null}
        hasResume={!!resume}
        atsScore={healthPercentage}
        skillsCount={skillsCount}
        hasSummary={hasSummary}
        appliedCount={applications.length}
      />

      {/* 2. ASYMMETRIC CONTENT & INTELLIGENCE COMPOSITION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Primary Left Column: Recommended Opportunities & Application Tracker (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <JobRecommendations
            jobs={jobs}
            hasResume={(resumes?.length ?? 0) > 0}
            resumes={(resumes ?? []).map((candidateResume) => ({
              id: candidateResume.id,
              title: candidateResume.title,
              updated_at: candidateResume.updated_at,
            }))}
          />
          <ApplicationTracker applications={applications} />
        </div>

        {/* Supporting Right Column: Linear Telemetry List & Softened Graphite Intelligence Card (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <TelemetryList
            atsScore={healthPercentage}
            hasResume={!!resume}
            appliedCount={applications.length}
            jobCount={totalJobsCount ?? jobs.length}
          />
          <IntelligenceCard
            hasResume={!!resume}
            completenessScore={completenessScore}
            parseabilityScore={parseabilityScore}
            healthPercentage={healthPercentage}
            hasSummary={hasSummary}
            skillsCount={skillsCount}
            hasExperienceOrProjects={experienceCount > 0 || projectsCount > 0}
          />
        </div>
      </div>
    </div>
  );
}
