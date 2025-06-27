import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/server-auth";
import { executeQuery } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verification = verifyToken(token);
    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const { userId } = verification.payload;
    await executeQuery("UPDATE users SET email_verified = 1 WHERE id = ?", [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}