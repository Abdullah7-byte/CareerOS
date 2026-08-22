import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/dashboard/employer/job-form";

export const dynamic = "force-dynamic";

export default async function NewEmployerJobPage() {
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

  return <JobForm mode="create" />;
}
