import { createClient } from "@/lib/supabase/server";
import ResumeForm from "./components/ResumeForm";
import { redirect } from "next/navigation";
import { ResumeCollectionActions } from "./ResumeCollection";

export default async function ResumePage({ searchParams }: { searchParams: Promise<{ resume?: string }> }) {
    const { resume: selectedResumeId } = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const [{ data: resumes, error: resumeError }, { data: profile, error: profileError }] = await Promise.all([
        supabase
            .from("resumes")
            .select("*, resume_experiences(*), resume_education(*), resume_skills(*), resume_projects(*)")
            .eq("profile_id", user.id)
            .order("updated_at", { ascending: false }),
        supabase
            .from("profiles")
            .select("full_name, headline")
            .eq("id", user.id)
            .maybeSingle(),
    ]);

    if (resumeError || profileError) {
        throw new Error("We couldn't load your resume. Please try again.");
    }

    const activeResume = resumes?.find((resume) => resume.id === selectedResumeId) ?? resumes?.[0] ?? null;

    return (
        <div className="-m-4 space-y-4 sm:-m-6 lg:-m-8">
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                <ResumeCollectionActions
                    selectedResumeId={activeResume?.id ?? null}
                    resumes={(resumes ?? []).map((resume) => ({ id: resume.id, title: resume.title, updated_at: resume.updated_at, is_default: !!resume.is_default }))}
                />
            </div>
            <ResumeForm
                key={activeResume?.id ?? "empty-resume"}
                resume={activeResume}
                resumeId={activeResume?.id ?? null}
                candidateName={profile?.full_name ?? null}
                profile={{
                    headline: profile?.headline ?? null,
                }}
            />
        </div>
    );
}
