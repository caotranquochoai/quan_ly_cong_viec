export const dynamic = 'force-dynamic'
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Missing or invalid token" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(verification.payload.userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
