import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { getAllUsers, initializeAdminTables } from "@/lib/server-admin"

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

    // Initialize admin tables if needed
    await initializeAdminTables()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    const result = await getAllUsers(page, limit, search, role, status)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Get users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
