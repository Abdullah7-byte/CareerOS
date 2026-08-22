import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function CandidateSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, headline, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "candidate") {
    throw new Error("We couldn't load your account settings. Please try again.");
  }

  return <SettingsForm email={user.email ?? ""} profile={{ fullName: profile.full_name, headline: profile.headline }} />;
}
