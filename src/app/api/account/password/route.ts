import { NextResponse } from "next/server";
import { updateUserPassword } from "@/lib/auth/update-user-password";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid password update request." }, { status: 400 });
  }

  const result = await updateUserPassword(input);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
