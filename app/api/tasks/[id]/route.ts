import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server-auth"
import { updateTask, deleteTask, verifyTaskOwnership, getTaskById } from "@/lib/server-task-db"
import { executeQuery } from "@/lib/server-auth"

async function handleAuthorization(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 }
  }
  const token = authHeader.substring(7)
  const verification = verifyToken(token)
  if (!verification.valid) {
    return { error: "Invalid token", status: 401 }
  }
  return { userId: verification.payload.userId }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await handleAuthorization(request)
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    const { userId } = authResult
    const taskId = params.id

    const ownsTask = await verifyTaskOwnership(userId, taskId)
    if (!ownsTask) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    const { update_scope, ...updates } = await request.json()

    if (update_scope === "all_future") {
      const currentTask = await getTaskById(taskId, userId);
      if (!currentTask || !currentTask.recurring_series_id) {
        return NextResponse.json({ error: "Task is not part of a recurring series." }, { status: 400 });
      }

      // 1. Update the current task itself
      await updateTask(userId, taskId, updates);

      const { recurring_series_id, recurringCount } = currentTask;
      const { dueDate, ...otherUpdates } = updates;

      // 2. Update metadata for all future tasks in the series
      if (Object.keys(otherUpdates).length > 0) {
        const columnMapping: { [key: string]: string } = {
          title: "title", description: "description", category: "category",
          reminderTime: "reminder_time", isRecurring: "is_recurring",
          recurringType: "recurring_type", recurringCycles: "recurring_cycles",
        };
        const updateFields = Object.keys(otherUpdates).filter(key => columnMapping[key]).map(key => `${columnMapping[key]} = ?`).join(", ");
        const updateValues = Object.keys(otherUpdates).filter(key => columnMapping[key]).map(key => otherUpdates[key]);

        if (updateFields.length > 0) {
          const metadataQuery = `UPDATE tasks SET ${updateFields} WHERE recurring_series_id = ? AND recurring_count > ? AND user_id = ?`;
          await executeQuery(metadataQuery, [...updateValues, recurring_series_id, recurringCount, userId]);
        }
      }

      // 3. If dueDate was changed, calculate the delta and apply it to all future tasks
      if (dueDate) {
        const newDueDate = new Date(dueDate);
        const oldDueDate = new Date(currentTask.due_date);
        const delta = newDueDate.getTime() - oldDueDate.getTime();

        if (delta !== 0) {
          const futureTasks = (await executeQuery(
            "SELECT id, due_date FROM tasks WHERE recurring_series_id = ? AND recurring_count > ?",
            [recurring_series_id, recurringCount]
          )) as { id: number; due_date: Date }[];

          for (const task of futureTasks) {
            const futureDate = new Date(task.due_date);
            const newFutureDate = new Date(futureDate.getTime() + delta);
            const newDueDateStr = newFutureDate.toISOString().slice(0, 19).replace('T', ' ');
            await executeQuery("UPDATE tasks SET due_date = ? WHERE id = ?", [newDueDateStr, task.id]);
          }
        }
      }
    } else {
      // Single task update
      const success = await updateTask(userId, taskId, updates);
      if (!success) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Task(s) updated successfully" })
  } catch (error) {
    console.error("Update task API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await handleAuthorization(request)
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    const { userId } = authResult
    const taskId = params.id

    const url = new URL(request.url)
    const delete_scope = url.searchParams.get("delete_scope")

    const taskToDelete = await getTaskById(taskId, userId)
    if (!taskToDelete) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    if (delete_scope === "all_future" && taskToDelete.recurring_series_id) {
      const { recurring_series_id, recurringCount } = taskToDelete;
      if (typeof recurringCount !== 'number') {
        return NextResponse.json({ error: "Invalid recurring task data." }, { status: 400 });
      }
      const query = "DELETE FROM tasks WHERE recurring_series_id = ? AND recurring_count >= ? AND user_id = ?";
      const params = [recurring_series_id, recurringCount, userId];
      await executeQuery(query, params);
    } else {
      const success = await deleteTask(userId, taskId)
      if (!success) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Task(s) deleted successfully" })
  } catch (error) {
    console.error("Delete task API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
