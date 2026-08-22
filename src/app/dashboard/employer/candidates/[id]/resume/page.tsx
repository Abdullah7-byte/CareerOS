import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFDownload from "@/app/dashboard/candidate/resume/components/PDFDownload";
import ResumePreview from "@/app/dashboard/candidate/resume/components/ResumePreview";
import type { ResumeContent } from "@/lib/validations/resume";

export const dynamic = "force-dynamic";

export default async function EmployerSubmittedResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "employer") {
    redirect("/dashboard/candidate");
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select(
      "id, profile_id, resume_id, status, match_score, applied_at, job:jobs(id, title, company, location, employment_type, profile_id)"
    )
    .eq("id", id)
    .maybeSingle();

  if (applicationError || !application) {
    redirect("/dashboard/employer/candidates");
  }

  if (application.job?.profile_id !== user.id) {
    redirect("/dashboard/employer/candidates");
  }

  let admin;
    try {
      admin = createAdminClient();
    } catch {
      throw new Error("Submitted resume service is unavailable.");
    }
  const { data: candidate, error: candidateError } = await admin
    .from("profiles")
    .select("id, full_name, headline")
    .eq("id", application.profile_id)
    .maybeSingle();

  if (candidateError) {
    throw new Error("We couldn't load the candidate profile for this application.");
  }

  if (!application.resume_id) {
    return (
      <div className="mx-auto max-w-5xl pb-12">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Submitted resume</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
              No submitted resume on file
            </h1>
          </div>
          <Link href={`/dashboard/employer/candidates/${application.id}`}>
            <Button variant="outline" size="sm" className="text-xs font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to review
            </Button>
          </Link>
        </header>

        <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-text-secondary">
          This application does not have a resume attached to it.
        </div>
      </div>
    );
  }

  const { data: resume, error: resumeError } = await admin
    .from("resumes")
    .select("title, summary, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)")
    .eq("id", application.resume_id)
    .eq("profile_id", application.profile_id)
    .maybeSingle();

  if (resumeError || !resume) {
    throw new Error("We couldn't load the submitted resume for this application.");
  }

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
    skills: (resume.resume_skills ?? []).map((skill) => ({ skill: skill.skill })),
    projects: (resume.resume_projects ?? []).map((project) => ({
      title: project.title,
      description: project.description ?? undefined,
      technologies: project.technologies ?? undefined,
      githubUrl: project.github_url ?? undefined,
      liveUrl: project.live_url ?? undefined,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Submitted resume</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
            {candidate?.full_name ?? "Unnamed candidate"}
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">{resume.title}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <PDFDownload resume={resumeContent} candidateName={candidate?.full_name ?? undefined} />
          <Link href={`/dashboard/employer/candidates/${application.id}`}>
            <Button variant="outline" size="sm" className="text-xs font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to review
            </Button>
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_0_rgba(17,17,17,0.02)]">
        <ResumePreview resume={resumeContent} candidateName={candidate?.full_name ?? null} />
      </div>
    </div>
  );
}
