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

// Initialize admin tables
export async function initializeAdminTables() {
  try {
    // Create activity logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        admin_id INT,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Create app configurations table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS app_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value TEXT,
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Insert default configurations if they don't exist
    const existingConfigs = (await executeQuery("SELECT COUNT(*) as count FROM app_configurations")) as any[]

    if (existingConfigs[0].count === 0) {
      await executeQuery(`
        INSERT INTO app_configurations (config_key, config_value, description) VALUES
        ('app_name', 'Task Scheduler', 'Application name'),
        ('max_tasks_per_user', '100', 'Maximum tasks per user'),
        ('session_timeout', '24', 'Session timeout in hours'),
        ('email_notifications', 'true', 'Enable email notifications'),
        ('maintenance_mode', 'false', 'Maintenance mode status'),
        ('registration_enabled', 'true', 'Allow new user registration'),
        ('default_reminder_time', '60', 'Default reminder time in minutes'),
        ('backup_frequency', '24', 'Backup frequency in hours')
      `)
    }

    console.log("Admin tables initialized successfully")
  } catch (error) {
    console.error("Admin tables initialization failed:", error)
    throw error
  }
}

// Log admin activity
export async function logActivity(
  adminId: number,
  action: string,
  description: string,
  userId?: number,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await executeQuery(
      "INSERT INTO activity_logs (admin_id, user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
      [adminId, userId || null, action, description, ipAddress || null, userAgent || null],
    )
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}

// Get all users with pagination and filtering
export async function getAllUsers(page = 1, limit = 10, search = "", role = "", status = "") {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (username LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (role && role !== "all") {
      whereClause += " AND role = ?"
      params.push(role)
    }

    if (status && status !== "all") {
      whereClause += " AND is_active = ?"
      params.push(status === "active")
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = (await executeQuery(countQuery, params)) as any[]
    const total = countResult[0].total

    // Get users with pagination
    const offset = (page - 1) * limit
    const usersQuery = `
      SELECT id, username, email, role, is_active, created_at, last_login,
             (SELECT COUNT(*) FROM tasks WHERE user_id = users.id) as task_count
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)

    const users = (await executeQuery(usersQuery, params)) as any[]

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        taskCount: user.task_count,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Get users error:", error)
    throw error
  }
}

// Get user by ID with detailed information
export async function getUserById(userId: number) {
  try {
    const userQuery = `
      SELECT id, username, email, role, is_active, created_at, last_login
      FROM users WHERE id = ?
    `
    const users = (await executeQuery(userQuery, [userId])) as any[]

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    // Get user's tasks
    const tasksQuery = `
      SELECT id, title, category, due_date, is_completed, created_at
      FROM tasks WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `
    const tasks = (await executeQuery(tasksQuery, [userId])) as any[]

    // Get user's activity logs
    const logsQuery = `
      SELECT action, description, created_at
      FROM activity_logs WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `
    const logs = (await executeQuery(logsQuery, [userId])) as any[]

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        category: task.category,
        dueDate: task.due_date,
        isCompleted: task.is_completed,
        createdAt: task.created_at,
      })),
      activityLogs: logs.map((log) => ({
        action: log.action,
        description: log.description,
        createdAt: log.created_at,
      })),
    }
  } catch (error) {
    console.error("Get user by ID error:", error)
    throw error
  }
}

// Update user
export async function updateUser(userId: number, updates: any, adminId: number) {
  try {
    const setClause = []
    const values = []

    if (updates.username !== undefined) {
      setClause.push("username = ?")
      values.push(updates.username)
    }
    if (updates.email !== undefined) {
      setClause.push("email = ?")
      values.push(updates.email)
    }
    if (updates.role !== undefined) {
      setClause.push("role = ?")
      values.push(updates.role)
    }
    if (updates.isActive !== undefined) {
      setClause.push("is_active = ?")
      values.push(updates.isActive)
    }

    if (setClause.length === 0) {
      return false
    }

    values.push(userId)

    await executeQuery(`UPDATE users SET ${setClause.join(", ")} WHERE id = ?`, values)

    // Log the activity
    await logActivity(adminId, "USER_UPDATED", `Updated user ${updates.username || userId}`, userId)

    return true
  } catch (error) {
    console.error("Update user error:", error)
    throw error
  }
}

// Delete user
export async function deleteUser(userId: number, adminId: number) {
  try {
    // Get user info before deletion
    const user = await getUserById(userId)
    if (!user) return false

    await executeQuery("DELETE FROM users WHERE id = ?", [userId])

    // Log the activity
    await logActivity(adminId, "USER_DELETED", `Deleted user ${user.username}`, userId)

    return true
  } catch (error) {
    console.error("Delete user error:", error)
    throw error
  }
}

// Get all tasks with user information
export async function getAllTasks(page = 1, limit = 10, search = "", status = "", userId = "") {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (t.title LIKE ? OR t.description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status && status !== "all") {
      whereClause += " AND t.is_completed = ?"
      params.push(status === "completed")
    }

    if (userId) {
      whereClause += " AND t.user_id = ?"
      params.push(userId)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM tasks t ${whereClause}`
    const countResult = (await executeQuery(countQuery, params)) as any[]
    const total = countResult[0].total

    // Get tasks with user information
    const offset = (page - 1) * limit
    const tasksQuery = `
      SELECT t.id, t.title, t.description, t.category, t.due_date, t.reminder_time,
             t.is_recurring, t.recurring_type, t.is_completed, t.created_at, t.completed_at,
             u.username, u.email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)

    const tasks = (await executeQuery(tasksQuery, params)) as any[]

    return {
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        dueDate: task.due_date,
        reminderTime: task.reminder_time,
        isRecurring: task.is_recurring,
        recurringType: task.recurring_type,
        isCompleted: task.is_completed,
        createdAt: task.created_at,
        completedAt: task.completed_at,
        user: {
          username: task.username,
          email: task.email,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Get tasks error:", error)
    throw error
  }
}

// Update task status
export async function updateTaskStatus(taskId: number, isCompleted: boolean, adminId: number) {
  try {
    const completedAt = isCompleted ? new Date() : null
    await executeQuery("UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?", [
      isCompleted,
      completedAt,
      taskId,
    ])

    // Log the activity
    await logActivity(adminId, "TASK_UPDATED", `${isCompleted ? "Completed" : "Reopened"} task ${taskId}`, undefined)

    return true
  } catch (error) {
    console.error("Update task status error:", error)
    throw error
  }
}

// Delete task
export async function deleteTask(taskId: number, adminId: number) {
  try {
    await executeQuery("DELETE FROM tasks WHERE id = ?", [taskId])

    // Log the activity
    await logActivity(adminId, "TASK_DELETED", `Deleted task ${taskId}`)

    return true
  } catch (error) {
    console.error("Delete task error:", error)
    throw error
  }
}

// Get activity logs
export async function getActivityLogs(page = 1, limit = 20, userId = "", action = "") {
  try {
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (userId) {
      whereClause += " AND (al.user_id = ? OR al.admin_id = ?)"
      params.push(userId, userId)
    }

    if (action) {
      whereClause += " AND al.action LIKE ?"
      params.push(`%${action}%`)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM activity_logs al ${whereClause}`
    const countResult = (await executeQuery(countQuery, params)) as any[]
    const total = countResult[0].total

    // Get logs with user information
    const offset = (page - 1) * limit
    const logsQuery = `
      SELECT al.id, al.action, al.description, al.ip_address, al.created_at,
             u.username as user_username, a.username as admin_username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN users a ON al.admin_id = a.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)

    const logs = (await executeQuery(logsQuery, params)) as any[]

    return {
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        ipAddress: log.ip_address,
        createdAt: log.created_at,
        userUsername: log.user_username,
        adminUsername: log.admin_username,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Get activity logs error:", error)
    throw error
  }
}

// Get app configurations
export async function getAppConfigurations() {
  try {
    const configs = (await executeQuery(
      "SELECT config_key, config_value, description, updated_at FROM app_configurations ORDER BY config_key",
    )) as any[]

    return configs.map((config) => ({
      key: config.config_key,
      value: config.config_value,
      description: config.description,
      updatedAt: config.updated_at,
    }))
  } catch (error) {
    console.error("Get configurations error:", error)
    throw error
  }
}

// Update app configuration
export async function updateAppConfiguration(key: string, value: string, adminId: number) {
  try {
    await executeQuery("UPDATE app_configurations SET config_value = ?, updated_by = ? WHERE config_key = ?", [
      value,
      adminId,
      key,
    ])

    // Log the activity
    await logActivity(adminId, "CONFIG_UPDATED", `Updated configuration ${key} to ${value}`)

    return true
  } catch (error) {
    console.error("Update configuration error:", error)
    throw error
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    // Get user stats
    const userStats = (await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today
      FROM users
    `)) as any[]

    // Get task stats
    const taskStats = (await executeQuery(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN is_completed = 0 AND due_date < NOW() THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_tasks_today
      FROM tasks
    `)) as any[]

    // Get recent activity count
    const activityStats = (await executeQuery(`
      SELECT COUNT(*) as recent_activities
      FROM activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `)) as any[]

    return {
      users: {
        total: userStats[0].total_users || 0,
        active: userStats[0].active_users || 0,
        admins: userStats[0].admin_users || 0,
        newToday: userStats[0].new_users_today || 0,
      },
      tasks: {
        total: taskStats[0].total_tasks || 0,
        completed: taskStats[0].completed_tasks || 0,
        overdue: taskStats[0].overdue_tasks || 0,
        newToday: taskStats[0].new_tasks_today || 0,
      },
      activities: {
        recent: activityStats[0].recent_activities || 0,
      },
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return {
      users: { total: 0, active: 0, admins: 0, newToday: 0 },
      tasks: { total: 0, completed: 0, overdue: 0, newToday: 0 },
      activities: { recent: 0 },
    }
  }
}
