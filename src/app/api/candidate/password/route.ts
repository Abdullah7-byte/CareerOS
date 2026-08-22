import { NextResponse } from "next/server";
import { updateCandidatePassword } from "@/lib/auth/update-candidate-password";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid password update request." }, { status: 400 });
  }

  const result = await updateCandidatePassword(input);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
