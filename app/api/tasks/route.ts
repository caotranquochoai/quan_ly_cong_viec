import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { getUserTasks, createTask, updateTask } from "@/lib/server-task-db"
import type { Task } from "@/lib/types"

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
    const userId = verification.payload.userId

    const formattedTaskData: Omit<Task, "id" | "createdAt"> = {
      ...taskData,
      dueDate: new Date(taskData.dueDate),
      completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
    }

    if (
      formattedTaskData.isRecurring &&
      formattedTaskData.recurringType &&
      formattedTaskData.recurringCycles &&
      formattedTaskData.recurringCycles > 1
    ) {
      const rootTaskData = { ...formattedTaskData, recurringCount: 1 }
      const rootTaskId = await createTask(userId, rootTaskData)
      if (!rootTaskId) {
        return NextResponse.json({ error: "Failed to create root recurring task" }, { status: 500 })
      }

      await updateTask(userId, rootTaskId, { recurring_series_id: rootTaskId })

      let lastDueDate = new Date(formattedTaskData.dueDate)
      for (let i = 2; i <= formattedTaskData.recurringCycles; i++) {
        const nextDueDate = new Date(lastDueDate)
        const originalDay = nextDueDate.getDate()

        switch (formattedTaskData.recurringType) {
          case "daily":
            nextDueDate.setDate(nextDueDate.getDate() + 1)
            break
          case "weekly":
            nextDueDate.setDate(nextDueDate.getDate() + 7)
            break
          case "monthly":
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            if (nextDueDate.getDate() !== originalDay) {
              nextDueDate.setDate(0)
            }
            break
        }

        const nextTaskData: Omit<Task, "id" | "createdAt"> = {
          ...formattedTaskData,
          dueDate: nextDueDate,
          recurring_series_id: rootTaskId,
          recurringCount: i,
        }
        await createTask(userId, nextTaskData)
        lastDueDate = nextDueDate
      }

      const createdTask = {
        id: rootTaskId,
        ...rootTaskData,
        recurring_series_id: rootTaskId,
        createdAt: new Date(),
      }
      return NextResponse.json(createdTask, { status: 201 })
    } else {
      const taskId = await createTask(userId, formattedTaskData)
      if (taskId) {
        const createdTask = {
          id: taskId,
          ...formattedTaskData,
          createdAt: new Date(),
        }
        return NextResponse.json(createdTask, { status: 201 })
      } else {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Create task API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
