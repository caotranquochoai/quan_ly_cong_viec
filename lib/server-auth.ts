// Server-side authentication functions
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendEmail } from "./email"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: number
  username: string
  email: string
  role: "user" | "admin"
  created_at: Date
  is_active: boolean
  last_login?: Date
  timezone?: string
  email_verified?: number
  email_notifications?: number
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
  token?: string
}

// Server-side database query function
export async function executeQuery(query: string, params: any[] = []) {
  const mysql = await import("mysql2/promise")

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306,
    ssl: undefined,
    connectTimeout: 60000,
  }

  const connection = await mysql.createConnection(dbConfig)
  const [results] = await connection.execute(query, params)
  await connection.end()
  return results
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        timezone VARCHAR(100) DEFAULT 'Asia/Ho_Chi_Minh',
        settings JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active TINYINT(1) DEFAULT 1,
        last_login TIMESTAMP NULL,
        email_verified TINYINT(1) DEFAULT 0,
        email_notifications TINYINT(1) DEFAULT 0
      )
    `)

    // Create tasks table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        due_date DATETIME NOT NULL,
        reminder_time INT NOT NULL DEFAULT 60,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_type ENUM('daily', 'weekly', 'monthly') NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        recurring_count INT DEFAULT 0,
        recurring_cycles INT DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create notifications table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `)

    console.log("Database tables initialized successfully")

    // Add email_verified and email_notifications columns if they don't exist
    try {
      await executeQuery("ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0", []);
      await executeQuery("ALTER TABLE users ADD COLUMN email_notifications TINYINT(1) DEFAULT 0", []);
    } catch (error) {
      // Ignore error if columns already exist
    }

    // Add recurring_count column if it doesn't exist
    try {
      await executeQuery("ALTER TABLE tasks ADD COLUMN recurring_count INT DEFAULT 0", []);
    } catch (error) {
      // Ignore error if column already exists
    }

    // Add recurring_cycles column if it doesn't exist
    try {
      await executeQuery("ALTER TABLE tasks ADD COLUMN recurring_cycles INT DEFAULT 1", []);
    } catch (error) {
      // Ignore error if column already exists
    }

    // Add recurring_series_id column for grouping recurring tasks
    try {
      await executeQuery("ALTER TABLE tasks ADD COLUMN recurring_series_id BIGINT NULL", []);
      await executeQuery("CREATE INDEX idx_recurring_series_id ON tasks (recurring_series_id)", []);
    } catch (error) {
      // Ignore error if column or index already exists
    }

  } catch (error) {
    console.error("Database initialization failed:", error)
    throw error
  }
}

// Password validation
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }
  return { valid: true, message: "Password is valid" }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Username validation
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long" }
  }
  if (username.length > 50) {
    return { valid: false, message: "Username must be less than 50 characters" }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: "Username can only contain letters, numbers, and underscores" }
  }
  return { valid: true, message: "Username is valid" }
}

// Register user (server-side)
export async function registerUser(username: string, email: string, password: string): Promise<AuthResult> {
  try {
    // Validate input
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return { success: false, message: usernameValidation.message }
    }

    if (!validateEmail(email)) {
      return { success: false, message: "Invalid email format" }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message }
    }

    // Check if user already exists
    const existingUser = (await executeQuery("SELECT id FROM users WHERE username = ? OR email = ?", [
      username,
      email,
    ])) as any[]

    if (existingUser.length > 0) {
      return { success: false, message: "Username or email already exists" }
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert user
    const result = (await executeQuery("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [
      username,
      email,
      passwordHash,
    ])) as any

    // Get the created user
    const newUser = (await executeQuery(
      "SELECT id, username, email, role, created_at, is_active FROM users WHERE id = ?",
      [result.insertId],
    )) as any[]

    if (newUser.length === 0) {
      return { success: false, message: "Failed to create user" }
    }

    const user: User = {
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      role: newUser[0].role,
      created_at: newUser[0].created_at,
      is_active: newUser[0].is_active,
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    // Send verification email
    const verificationToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      user.email,
      "Verify your email address",
      `Please click the following link to verify your email address: ${verificationLink}`,
      `<p>Please click the following link to verify your email address: <a href="${verificationLink}">${verificationLink}</a></p>`
    );


    return {
      success: true,
      message: "User registered successfully",
      user,
      token,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

// Login user (server-side)
export async function loginUser(usernameOrEmail: string, password: string): Promise<AuthResult> {
  try {
    // Get user from database
    const users = (await executeQuery(
      "SELECT id, username, email, password_hash, role, created_at, is_active, email_verified, email_notifications, timezone FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE",
      [usernameOrEmail, usernameOrEmail],
    )) as any[]

    if (users.length === 0) {
      return { success: false, message: "Invalid credentials" }
    }

    const userData = users[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" }
    }

    // Update last login
    await executeQuery("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [userData.id])

    const user: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      created_at: userData.created_at,
      is_active: userData.is_active,
      last_login: new Date(),
      email_verified: userData.email_verified,
      email_notifications: userData.email_notifications,
      timezone: userData.timezone,
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    return {
      success: true,
      message: "Login successful",
      user,
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed. Please try again." }
  }
}

// Verify JWT token (server-side)
export function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return { valid: true, payload }
  } catch (error) {
    return { valid: false }
  }
}

// Get user by ID (server-side)
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const users = (await executeQuery(
      "SELECT id, username, email, role, created_at, is_active, last_login, email_verified, email_notifications, timezone FROM users WHERE id = ? AND is_active = TRUE",
      [userId],
    )) as any[]

    if (users.length === 0) {
      return null
    }

    const userData = users[0]
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      created_at: userData.created_at,
      is_active: userData.is_active,
      last_login: userData.last_login,
      email_verified: userData.email_verified,
      email_notifications: userData.email_notifications,
      timezone: userData.timezone,
    }
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

// Add this function to create admin user if none exists
export async function createDefaultAdmin() {
  try {
    // Check if any admin exists
    const admins = (await executeQuery("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")) as any[]

    if (admins[0].count === 0) {
      // Create default admin user
      const saltRounds = 12
      const passwordHash = await bcrypt.hash("admin123", saltRounds)

      await executeQuery("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)", [
        "admin",
        `admin@${process.env.DOMAIN || "vivucloud.com"}`,
        passwordHash,
        "admin",
      ])

      console.log("Default admin user created: admin / admin123")
    }
  } catch (error) {
    console.error("Failed to create default admin:", error)
  }
}
