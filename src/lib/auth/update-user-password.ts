import { createClient } from "@/lib/supabase/server";
import { passwordChangeSchema } from "@/lib/validations/profile";

export type PasswordUpdateResult = { success: true } | { success: false; error: string };

export async function updateUserPassword(input: unknown): Promise<PasswordUpdateResult> {
  const validation = passwordChangeSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? "Check your password details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const { error: verificationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: validation.data.currentPassword,
  });

  if (verificationError) {
    return { success: false, error: "Your current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: validation.data.newPassword,
  });

  if (updateError) {
    console.error("Password update failed", {
      userId: user.id,
      errorCode: updateError.code ?? "unknown",
      status: updateError.status ?? "unknown",
    });
    return { success: false, error: "We couldn't update your password. Please try again." };
  }

  return { success: true };
}
