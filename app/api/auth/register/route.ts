import { type NextRequest, NextResponse } from "next/server"
import { registerUser, initializeDatabase, createDefaultAdmin } from "@/lib/server-auth"
import { initializeAdminTables } from "@/lib/server-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    await initializeAdminTables()
    await createDefaultAdmin()

    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const result = await registerUser(username, email, password)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
