import { type NextRequest, NextResponse } from "next/server"
import { loginUser, initializeDatabase, createDefaultAdmin } from "@/lib/server-auth"
import { initializeAdminTables } from "@/lib/server-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize database and admin tables
    await initializeDatabase()
    await initializeAdminTables()
    await createDefaultAdmin()

    const { usernameOrEmail, password } = await request.json()

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 })
    }

    const result = await loginUser(usernameOrEmail, password)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
