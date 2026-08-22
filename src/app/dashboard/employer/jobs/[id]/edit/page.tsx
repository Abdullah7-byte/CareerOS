import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/dashboard/employer/job-form";

export const dynamic = "force-dynamic";

export default async function EditEmployerJobPage({
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

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, employment_type, description")
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !job) {
    redirect("/dashboard/employer/jobs");
  }

  return (
    <JobForm
      mode="edit"
      initialValues={{
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description,
      }}
    />
  );
}
