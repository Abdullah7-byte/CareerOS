import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/dashboard/app-shell";
import { candidateNavigation, recruiterNavigation } from "@/lib/config/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, headline, organization_name, organization_website, recruiter_name, recruiter_title")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "candidate" && profile?.role !== "employer") {
    redirect("/login?error=invalid_role");
  }

  const role = profile.role;

  const navItems = role === "employer" ? recruiterNavigation : candidateNavigation;

  return (
    <AppShell
      navItems={navItems}
      candidateIdentity={role !== "employer" ? {
        fullName: profile?.full_name ?? null,
        headline: profile?.headline ?? null,
      } : undefined}
      employerIdentity={role === "employer" ? {
        organizationName: profile?.organization_name ?? null,
        organizationWebsite: profile?.organization_website ?? null,
        recruiterName: profile?.recruiter_name ?? null,
        recruiterTitle: profile?.recruiter_title ?? null,
      } : undefined}
    >
      {children}
    </AppShell>
  );
}
