import { createClient } from "@/lib/supabase/server";
import ResumeForm from "./components/ResumeForm";

export default async function ResumePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: resume } = await supabase
        .from("resumes")
        .select("*")
        .eq("profile_id", user!.id)
        .eq("is_default", true)
        .maybeSingle();

    return (
        <main>
            <h1>Create Resume</h1>
            <ResumeForm resume={resume} />
        </main>
    );
}