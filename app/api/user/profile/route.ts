import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/server-auth"
import bcrypt from "bcryptjs"

// Server-side database query function
async function executeQuery(query: string, params: any[] = []) {
  const mysql = await import("mysql2/promise")

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306,
    ssl: false,
    connectTimeout: 60000,
    acquireTimeout: 60000,
  }

  const connection = await mysql.createConnection(dbConfig)
  const [results] = await connection.execute(query, params)
  await connection.end()
  return results
}

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

    // Get user settings including timezone
    const userSettings = (await executeQuery("SELECT timezone, settings FROM users WHERE id = ?", [user.id])) as any[]

    const userWithSettings = {
      ...user,
      timezone: userSettings[0]?.timezone || "UTC",
      settings: userSettings[0]?.settings ? JSON.parse(userSettings[0].settings) : {},
    }

    return NextResponse.json({ success: true, user: userWithSettings }, { status: 200 })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const userId = verification.payload.userId
    const updates = await request.json()

    // Validate input
    if (updates.username) {
      if (updates.username.length < 3 || updates.username.length > 50) {
        return NextResponse.json(
          {
            success: false,
            message: "Username must be between 3 and 50 characters",
          },
          { status: 400 },
        )
      }

      // Check if username is already taken by another user
      const existingUser = (await executeQuery("SELECT id FROM users WHERE username = ? AND id != ?", [
        updates.username,
        userId,
      ])) as any[]

      if (existingUser.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 400 },
        )
      }
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email format",
          },
          { status: 400 },
        )
      }

      // Check if email is already taken by another user
      const existingUser = (await executeQuery("SELECT id FROM users WHERE email = ? AND id != ?", [
        updates.email,
        userId,
      ])) as any[]

      if (existingUser.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already taken",
          },
          { status: 400 },
        )
      }
    }

    // Handle password change
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required",
          },
          { status: 400 },
        )
      }

      // Verify current password
      const user = (await executeQuery("SELECT password_hash FROM users WHERE id = ?", [userId])) as any[]

      if (user.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
      }

      const isCurrentPasswordValid = await bcrypt.compare(updates.currentPassword, user[0].password_hash)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is incorrect",
          },
          { status: 400 },
        )
      }

      // Validate new password
      if (updates.newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "New password must be at least 8 characters long",
          },
          { status: 400 },
        )
      }

      // Hash new password
      const saltRounds = 12
      const newPasswordHash = await bcrypt.hash(updates.newPassword, saltRounds)
      updates.password_hash = newPasswordHash
    }

    // Build update query
    const updateFields = []
    const updateValues = []

    if (updates.username) {
      updateFields.push("username = ?")
      updateValues.push(updates.username)
    }

    if (updates.email) {
      updateFields.push("email = ?")
      updateValues.push(updates.email)
    }

    if (updates.password_hash) {
      updateFields.push("password_hash = ?")
      updateValues.push(updates.password_hash)
    }

    if (updates.timezone) {
      updateFields.push("timezone = ?")
      updateValues.push(updates.timezone)
    }

    if (updates.email_notifications !== undefined) {
      updateFields.push("email_notifications = ?")
      updateValues.push(updates.email_notifications)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields to update",
        },
        { status: 400 },
      )
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(userId)

    const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`
    await executeQuery(updateQuery, updateValues)

    // Get updated user
    const updatedUser = await getUserById(userId)
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Failed to get updated user" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
