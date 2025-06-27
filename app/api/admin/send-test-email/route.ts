import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/server-auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const verification = verifyToken(token);

    if (!verification.valid || verification.payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sendEmail(
      email,
      "SMTP Configuration Test",
      "This is a test email to confirm that your SMTP settings are configured correctly.",
      "<b>This is a test email to confirm that your SMTP settings are configured correctly.</b>"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send test email API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}