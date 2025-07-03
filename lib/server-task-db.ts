// Server-side task database functions with enhanced error handling and logging
import type { Task } from "./types"

// Server-side database query function with better error handling
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
  }

  let connection
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log("Database connection established for query:", query.substring(0, 50) + "...")

    const [results] = await connection.execute(query, params)
    console.log("Query executed successfully, affected rows:", (results as any).affectedRows || "N/A")

    return results
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("Database connection closed")
    }
  }
}

// Enhanced getUserTasks function with better error handling
export async function getUserTasks(userId: number): Promise<Task[]> {
  try {
    console.log("Fetching tasks for user:", userId)

    const tasks = (await executeQuery(
      `SELECT id, title, description, category, due_date, reminder_time,
       is_recurring, recurring_type, is_completed, created_at, completed_at, recurring_count, recurring_cycles, recurring_series_id
       FROM tasks WHERE user_id = ? ORDER BY due_date ASC`,
      [userId],
    )) as any[]

    console.log("Retrieved tasks count:", tasks.length)

    return tasks.map((task) => ({
      id: task.id.toString(),
      title: task.title,
      description: task.description || "",
      category: task.category,
      dueDate: new Date(task.due_date),
      reminderTime: task.reminder_time || 60,
      isRecurring: Boolean(task.is_recurring),
      recurringType: task.recurring_type || undefined,
      isCompleted: Boolean(task.is_completed),
      createdAt: new Date(task.created_at),
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      recurring_series_id: task.recurring_series_id?.toString(),
    }))
  } catch (error) {
    console.error("Get tasks error:", error)
    return []
  }
}

// Enhanced createTask function with better validation and error handling
export async function createTask(userId: number, task: Omit<Task, "id" | "createdAt">): Promise<string | null> {
  try {
    console.log("Creating task for user:", userId)
    console.log("Task data:", {
      title: task.title,
      category: task.category,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
    })

    // Validate required fields
    if (!task.title || !task.dueDate || !task.category) {
      console.error("Missing required fields for task creation")
      return null
    }

    // Convert dates to MySQL format
    const dueDateString =
      task.dueDate instanceof Date ? task.dueDate.toISOString().slice(0, 19).replace("T", " ") : task.dueDate
    const completedAtString =
      task.completedAt instanceof Date
        ? task.completedAt.toISOString().slice(0, 19).replace("T", " ")
        : task.completedAt

    const result = (await executeQuery(
      `INSERT INTO tasks (user_id, title, description, category, due_date, reminder_time,
       is_recurring, recurring_type, is_completed, completed_at, recurring_count, recurring_cycles, recurring_series_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        task.title,
        task.description || "",
        task.category,
        dueDateString,
        task.reminderTime || 60,
        task.isRecurring ? 1 : 0,
        task.recurringType || null,
        task.isCompleted ? 1 : 0,
        completedAtString || null,
        task.recurringCount || 0,
        task.recurringCycles || 1,
        task.recurring_series_id || null,
      ],
    )) as any

    console.log("Task created with ID:", result.insertId)
    return result.insertId.toString()
  } catch (error) {
    console.error("Create task error:", error)
    return null
  }
}

// Completely rewritten updateTask function with comprehensive error handling
export async function updateTask(userId: number, taskId: string, updates: Partial<Task> & { timezone?: string }): Promise<boolean> {
  try {
    console.log("Updating task:", taskId, "for user:", userId)
    console.log("Update data:", updates)

    // Validate inputs
    if (!userId || !taskId) {
      console.error("Missing userId or taskId for update")
      return false
    }

    // First, verify the task exists and belongs to the user
    const existingTasks = (await executeQuery("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [
      taskId,
      userId,
    ])) as any[]

    if (existingTasks.length === 0) {
      console.error("Task not found or doesn't belong to user:", taskId, userId)
      return false
    }

    // Build update query dynamically
    const setClause = []
    const values = []

    if (updates.title !== undefined) {
      setClause.push("title = ?")
      values.push(updates.title)
      console.log("Updating title to:", updates.title)
    }

    if (updates.description !== undefined) {
      setClause.push("description = ?")
      values.push(updates.description || "")
      console.log("Updating description to:", updates.description)
    }

    if (updates.category !== undefined) {
      setClause.push("category = ?")
      values.push(updates.category)
      console.log("Updating category to:", updates.category)
    }

    if (updates.dueDate !== undefined) {
      const dueDate = new Date(updates.dueDate);
      const dueDateString = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')} ${dueDate.getHours().toString().padStart(2, '0')}:${dueDate.getMinutes().toString().padStart(2, '0')}:${dueDate.getSeconds().toString().padStart(2, '0')}`;
      setClause.push("due_date = ?")
      values.push(dueDateString)
      console.log("Updating due_date to:", dueDateString)
    }

    if (updates.reminderTime !== undefined) {
      setClause.push("reminder_time = ?")
      values.push(updates.reminderTime)
      console.log("Updating reminder_time to:", updates.reminderTime)
    }

    if (updates.isRecurring !== undefined) {
      setClause.push("is_recurring = ?")
      values.push(updates.isRecurring ? 1 : 0)
      console.log("Updating is_recurring to:", updates.isRecurring)
    }

    if (updates.recurringType !== undefined) {
      setClause.push("recurring_type = ?")
      values.push(updates.recurringType)
      console.log("Updating recurring_type to:", updates.recurringType)
    }

    if (updates.isCompleted !== undefined) {
      setClause.push("is_completed = ?")
      values.push(updates.isCompleted ? 1 : 0)
      console.log("Updating is_completed to:", updates.isCompleted)
    }

    if (updates.completedAt !== undefined) {
      const completedAtString =
        updates.completedAt instanceof Date
          ? updates.completedAt.toISOString().slice(0, 19).replace("T", " ")
          : updates.completedAt
      setClause.push("completed_at = ?")
      values.push(completedAtString)
      console.log("Updating completed_at to:", completedAtString)
    }

    if (updates.recurringCount !== undefined) {
      setClause.push("recurring_count = ?")
      values.push(updates.recurringCount)
      console.log("Updating recurring_count to:", updates.recurringCount)
    }

    if (updates.recurringCycles !== undefined) {
      setClause.push("recurring_cycles = ?")
      values.push(updates.recurringCycles)
      console.log("Updating recurring_cycles to:", updates.recurringCycles)
    }

    if (updates.recurring_series_id !== undefined) {
      setClause.push("recurring_series_id = ?")
      values.push(updates.recurring_series_id)
      console.log("Updating recurring_series_id to:", updates.recurring_series_id)
    }

    if (updates.timezone) {
      await executeQuery("UPDATE users SET timezone = ? WHERE id = ?", [updates.timezone, userId])
    }

    if (setClause.length === 0) {
      console.log("No fields to update")
      return true // No updates needed
    }

    // Add WHERE clause parameters
    values.push(taskId, userId)

    const updateQuery = `UPDATE tasks SET ${setClause.join(", ")} WHERE id = ? AND user_id = ?`
    console.log("Executing update query:", updateQuery)
    console.log("With values:", values)

    const result = (await executeQuery(updateQuery, values)) as any

    if (result.affectedRows === 0) {
      console.error("No rows affected by update - task may not exist or belong to user")
      return false
    }

    console.log("Task updated successfully, affected rows:", result.affectedRows)
    return true
  } catch (error) {
    console.error("Update task error:", error)
    console.error("Stack trace:", error.stack)
    return false
  }
}

// Enhanced deleteTask function
export async function deleteTask(userId: number, taskId: string): Promise<boolean> {
  try {
    console.log("Deleting task:", taskId, "for user:", userId)

    const result = (await executeQuery("DELETE FROM tasks WHERE user_id = ? AND id = ?", [userId, taskId])) as any

    if (result.affectedRows === 0) {
      console.error("No task deleted - task may not exist or belong to user")
      return false
    }

    console.log("Task deleted successfully, affected rows:", result.affectedRows)
    return true
  } catch (error) {
    console.error("Delete task error:", error)
    return false
  }
}

// New function to verify task ownership
export async function verifyTaskOwnership(userId: number, taskId: string): Promise<boolean> {
  try {
    const tasks = (await executeQuery("SELECT id FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId])) as any[]

    return tasks.length > 0
  } catch (error) {
    console.error("Error verifying task ownership:", error)
    return false
  }
}

// Get a single task's details
export async function getTaskById(taskId: string, userId: number): Promise<(Task & { recurring_series_id: string | null; due_date: Date }) | null> {
  try {
    const tasks = (await executeQuery(
      "SELECT *, due_date as due_date_type FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId]
    )) as any[];

    if (tasks.length === 0) {
      return null;
    }
    const task = tasks[0];
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description || "",
      category: task.category,
      dueDate: new Date(task.due_date),
      reminderTime: task.reminder_time || 60,
      isRecurring: Boolean(task.is_recurring),
      recurringType: task.recurring_type || undefined,
      isCompleted: Boolean(task.is_completed),
      createdAt: new Date(task.created_at),
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      recurring_series_id: task.recurring_series_id ? task.recurring_series_id.toString() : null,
      due_date: new Date(task.due_date_type),
      recurringCount: task.recurring_count,
    };
  } catch (error) {
    console.error("Get task by ID error:", error);
    return null;
  }
}
