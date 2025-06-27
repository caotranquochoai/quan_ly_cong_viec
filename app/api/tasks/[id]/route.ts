import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { updateTask, deleteTask, verifyTaskOwnership } from "@/lib/server-task-db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("PUT request received for task:", params.id)

    // Verify authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid) {
      console.error("Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = verification.payload.userId
    const taskId = params.id

    console.log("Authenticated user:", userId, "updating task:", taskId)

    // Verify task ownership
    const ownsTask = await verifyTaskOwnership(userId, taskId)
    if (!ownsTask) {
      console.error("Task not found or user doesn't own task")
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    // Parse request body
    let updates
    try {
      updates = await request.json()
      console.log("Received updates:", updates)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate and sanitize updates
    const sanitizedUpdates: any = {}

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || updates.title.trim().length === 0) {
        return NextResponse.json({ error: "Title is required and must be a non-empty string" }, { status: 400 })
      }
      sanitizedUpdates.title = updates.title.trim()
    }

    if (updates.description !== undefined) {
      sanitizedUpdates.description = typeof updates.description === "string" ? updates.description.trim() : ""
    }

    if (updates.category !== undefined) {
      const validCategories = [
        "server-renewal",
        "electricity-bill",
        "internet-bill",
        "water-bill",
        "rent",
        "insurance",
        "subscription",
        "maintenance",
        "other",
      ]
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
      }
      sanitizedUpdates.category = updates.category
    }

    if (updates.dueDate !== undefined) {
      try {
        const dueDate = new Date(updates.dueDate)
        if (isNaN(dueDate.getTime())) {
          return NextResponse.json({ error: "Invalid due date" }, { status: 400 })
        }
        sanitizedUpdates.dueDate = dueDate
      } catch (error) {
        return NextResponse.json({ error: "Invalid due date format" }, { status: 400 })
      }
    }

    if (updates.reminderTime !== undefined) {
      const reminderTime = Number(updates.reminderTime)
      if (isNaN(reminderTime) || reminderTime < 0) {
        return NextResponse.json({ error: "Invalid reminder time" }, { status: 400 })
      }
      sanitizedUpdates.reminderTime = reminderTime
    }

    if (updates.isRecurring !== undefined) {
      sanitizedUpdates.isRecurring = Boolean(updates.isRecurring)
    }

    if (updates.recurringType !== undefined) {
      const validTypes = ["daily", "weekly", "monthly"]
      if (updates.recurringType !== null && !validTypes.includes(updates.recurringType)) {
        return NextResponse.json({ error: "Invalid recurring type" }, { status: 400 })
      }
      sanitizedUpdates.recurringType = updates.recurringType
    }

    if (updates.isCompleted !== undefined) {
      sanitizedUpdates.isCompleted = Boolean(updates.isCompleted)

      // Set completedAt based on isCompleted status
      if (sanitizedUpdates.isCompleted && !updates.completedAt) {
        sanitizedUpdates.completedAt = new Date()
      } else if (!sanitizedUpdates.isCompleted) {
        sanitizedUpdates.completedAt = null
      }
    }

    if (updates.completedAt !== undefined && updates.completedAt !== null) {
      try {
        const completedAt = new Date(updates.completedAt)
        if (isNaN(completedAt.getTime())) {
          return NextResponse.json({ error: "Invalid completed date" }, { status: 400 })
        }
        sanitizedUpdates.completedAt = completedAt
      } catch (error) {
        return NextResponse.json({ error: "Invalid completed date format" }, { status: 400 })
      }
    }

    console.log("Sanitized updates:", sanitizedUpdates)

    // Perform the update
    const success = await updateTask(userId, taskId, sanitizedUpdates)

    if (success) {
      console.log("Task updated successfully")
      return NextResponse.json({
        success: true,
        message: "Task updated successfully",
        taskId: taskId,
      })
    } else {
      console.error("Failed to update task in database")
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }
  } catch (error) {
    console.error("Update task API error:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("DELETE request received for task:", params.id)

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid) {
      console.error("Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = verification.payload.userId
    const taskId = params.id

    console.log("Authenticated user:", userId, "deleting task:", taskId)

    // Verify task ownership before deletion
    const ownsTask = await verifyTaskOwnership(userId, taskId)
    if (!ownsTask) {
      console.error("Task not found or user doesn't own task")
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    const success = await deleteTask(userId, taskId)

    if (success) {
      console.log("Task deleted successfully")
      return NextResponse.json({
        success: true,
        message: "Task deleted successfully",
        taskId: taskId,
      })
    } else {
      console.error("Failed to delete task from database")
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete task API error:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
