// Client-side task management (API calls) with enhanced error handling
import type { Task } from "./types"

export async function getUserTasks(token: string): Promise<Task[]> {
  try {
    console.log("Fetching user tasks from API")

    const response = await fetch("/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const tasks = await response.json()
      console.log("Received tasks from API:", tasks.length)

      return tasks.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }))
    } else {
      console.error("Failed to fetch tasks, status:", response.status)
      const errorText = await response.text()
      console.error("Error response:", errorText)
    }
    return []
  } catch (error) {
    console.error("Get tasks error:", error)
    return []
  }
}

export async function createTask(token: string, task: Omit<Task, "id" | "createdAt">): Promise<Task | null> {
  try {
    console.log("Creating task via API:", task.title)

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...task,
        dueDate: task.dueDate.toISOString(),
        completedAt: task.completedAt?.toISOString(),
      }),
    })

    if (response.ok) {
      const savedTask = await response.json()
      console.log("Task created successfully:", savedTask.id)

      return {
        ...savedTask,
        dueDate: new Date(savedTask.dueDate),
        createdAt: new Date(savedTask.createdAt),
        completedAt: savedTask.completedAt ? new Date(savedTask.completedAt) : undefined,
      }
    } else {
      console.error("Failed to create task, status:", response.status)
      const errorText = await response.text()
      console.error("Error response:", errorText)
    }
    return null
  } catch (error) {
    console.error("Create task error:", error)
    return null
  }
}

export async function updateTask(token: string, taskId: string, updates: Partial<Task> & { timezone?: string }): Promise<boolean> {
  try {
    console.log("Updating task via API:", taskId)
    console.log("Update data:", updates)

    // Prepare the update payload with proper date serialization
    const updatePayload: any = { ...updates }

    if (updates.dueDate) {
      updatePayload.dueDate = updates.dueDate.toISOString()
    }

    if (updates.createdAt) {
      updatePayload.createdAt = updates.createdAt.toISOString()
    }

    if (updates.completedAt) {
      updatePayload.completedAt = updates.completedAt.toISOString()
    } else if (updates.completedAt === null || updates.completedAt === undefined) {
      updatePayload.completedAt = null
    }

    console.log("Sending update payload:", updatePayload)

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("Task updated successfully:", result)
      return true
    } else {
      console.error("Failed to update task, status:", response.status)
      const errorText = await response.text()
      console.error("Error response:", errorText)

      // Try to parse error response
      try {
        const errorData = JSON.parse(errorText)
        console.error("Parsed error:", errorData)
      } catch (e) {
        console.error("Could not parse error response")
      }
    }

    return false
  } catch (error) {
    console.error("Update task error:", error)
    console.error("Stack trace:", error.stack)
    return false
  }
}

export async function deleteTask(token: string, taskId: string): Promise<boolean> {
  try {
    console.log("Deleting task via API:", taskId)

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      console.log("Task deleted successfully")
      return true
    } else {
      console.error("Failed to delete task, status:", response.status)
      const errorText = await response.text()
      console.error("Error response:", errorText)
    }

    return false
  } catch (error) {
    console.error("Delete task error:", error)
    return false
  }
}
