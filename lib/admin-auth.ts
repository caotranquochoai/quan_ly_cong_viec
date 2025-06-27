// Admin authentication with hardcoded credentials
export interface AdminUser {
  username: string
  role: "admin"
  loginTime: Date
}

export interface AdminAuthResult {
  success: boolean
  message: string
  admin?: AdminUser
  token?: string
}

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME!,
  password: process.env.ADMIN_PASSWORD!,
}

// Simple JWT-like token generation for admin (client-side only)
export function generateAdminToken(username: string): string {
  const payload = {
    username,
    role: "admin",
    loginTime: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

// Verify admin token
export function verifyAdminToken(token: string): { valid: boolean; admin?: AdminUser } {
  try {
    const payload = JSON.parse(atob(token))

    if (payload.exp < Date.now()) {
      return { valid: false }
    }

    if (payload.role !== "admin" || payload.username !== ADMIN_CREDENTIALS.username) {
      return { valid: false }
    }

    return {
      valid: true,
      admin: {
        username: payload.username,
        role: payload.role,
        loginTime: new Date(payload.loginTime),
      },
    }
  } catch (error) {
    return { valid: false }
  }
}

// Admin login function
export async function loginAdmin(username: string, password: string): Promise<AdminAuthResult> {
  // Simulate network delay for better UX
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Validate credentials
  if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
    return {
      success: false,
      message: "Invalid admin credentials",
    }
  }

  const admin: AdminUser = {
    username: ADMIN_CREDENTIALS.username,
    role: "admin",
    loginTime: new Date(),
  }

  const token = generateAdminToken(username)

  return {
    success: true,
    message: "Admin login successful",
    admin,
    token,
  }
}

// Check if user is admin
export function isAdminLoggedIn(): boolean {
  const token = localStorage.getItem("admin-token")
  if (!token) return false

  const verification = verifyAdminToken(token)
  return verification.valid
}

// Get current admin
export function getCurrentAdmin(): AdminUser | null {
  const token = localStorage.getItem("admin-token")
  if (!token) return null

  const verification = verifyAdminToken(token)
  return verification.valid ? verification.admin! : null
}

// Admin logout
export function logoutAdmin(): void {
  localStorage.removeItem("admin-token")
}
