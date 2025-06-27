import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { getDashboardStats } from "@/lib/server-admin"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid || verification.payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
