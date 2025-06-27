// Remove bcrypt and jwt imports, replace with browser-compatible auth
export interface User {
  id: number
  username: string
  email: string
  role: "user" | "admin"
  created_at: Date
  is_active: boolean
  last_login?: Date
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
  token?: string
}

// Password validation (client-side)
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

// Client-side auth functions (API calls)
export async function registerUser(username: string, email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })

    return await response.json()
  } catch (error) {
    return { success: false, message: "Registration failed. Please try again." }
  }
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    })

    return await response.json()
  } catch (error) {
    return { success: false, message: "Login failed. Please try again." }
  }
}

// Verify token (client-side)
export async function verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
  try {
    const response = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const data = await response.json()
      return { valid: true, user: data.user }
    }
    return { valid: false }
  } catch (error) {
    return { valid: false }
  }
}
