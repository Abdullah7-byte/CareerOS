import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EmployerWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/employer");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "employer") {
    redirect(profile?.role === "candidate" ? "/dashboard/candidate" : "/login?error=invalid_role");
  }

  return children;
}
