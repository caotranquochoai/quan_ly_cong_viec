import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, createDefaultAdmin } from "@/lib/server-auth"
import { initializeAdminTables } from "@/lib/server-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize all database tables and default data
    await initializeDatabase()
    await initializeAdminTables()
    await createDefaultAdmin()

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      credentials: {
        admin: "admin / admin123",
        user: "testuser / user123",
      },
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
