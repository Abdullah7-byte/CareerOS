import "server-only";

import { createAdminClient } from "../src/lib/supabase/admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
if (process.env.ALLOW_SYNTHETIC_DEMO_SEED !== "true" || !/localhost|127\.0\.0\.1/.test(url)) {
  throw new Error("Synthetic demo seeding is permitted only against an explicitly local Supabase URL.");
}

async function user(email: string, role: "candidate" | "employer") {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password: "Demo-only-Change-Me-123!", email_confirm: true, user_metadata: { role } });
  if (error && !/already/i.test(error.message)) throw error;
  return data.user;
}

void (async () => {
const candidate = await user("candidate.demo@careeros.test", "candidate");
const employer = await user("employer.demo@careeros.test", "employer");
if (candidate && employer) {
  const admin = createAdminClient();
  await admin.from("profiles").update({ full_name: "Casey Candidate", headline: "Synthetic demo profile" }).eq("id", candidate.id);
  await admin.from("profiles").update({ organization_name: "CareerOS Demo Co.", recruiter_name: "Emery Employer" }).eq("id", employer.id);
  const { data: job } = await admin.from("jobs").upsert({ profile_id: employer.id, title: "Synthetic Frontend Engineer", company: "CareerOS Demo Co.", description: "Requires React and TypeScript.", employment_type: "full_time" }, { onConflict: "id" }).select("id").maybeSingle();
  if (!job) console.warn("Demo accounts created; create the demo job in the employer portal.");
}
console.log("Synthetic local-only demo accounts are ready.");
})();
