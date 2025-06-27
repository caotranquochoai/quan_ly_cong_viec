import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { getUserTasks, createTask } from "@/lib/server-task-db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const tasks = await getUserTasks(verification.payload.userId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Fix the task creation to properly handle user authentication and data format
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const verification = verifyToken(token)

    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const taskData = await request.json()

    // Ensure the task data has the correct format
    const formattedTaskData = {
      ...taskData,
      dueDate: new Date(taskData.dueDate),
      createdAt: new Date(),
      completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
    }

    const taskId = await createTask(verification.payload.userId, formattedTaskData)

    if (taskId) {
      // Return the created task with proper formatting
      const createdTask = {
        id: taskId,
        ...formattedTaskData,
        createdAt: new Date(),
      }
      return NextResponse.json(createdTask, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
