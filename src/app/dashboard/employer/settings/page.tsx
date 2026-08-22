import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerSettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function EmployerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_name, organization_website, recruiter_name, recruiter_title, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "employer") {
    throw new Error("We couldn't load your employer account settings. Please try again.");
  }

  return (
    <EmployerSettingsForm
      email={user.email ?? ""}
      profile={{
        organizationName: profile.organization_name,
        organizationWebsite: profile.organization_website,
        recruiterName: profile.recruiter_name,
        recruiterTitle: profile.recruiter_title,
      }}
    />
  );
}
