import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { getActivityLogs } from "@/lib/server-admin"

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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const userId = searchParams.get("userId") || ""
    const action = searchParams.get("action") || ""

    const result = await getActivityLogs(page, limit, userId, action)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Get logs API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
