export type Language = "en" | "vi" | "zh";

// Update the User interface to handle both string and Date types for dates
export interface User {
  id: number
  username: string
  email: string
  role: "user" | "admin"
  created_at: string | Date
  last_login?: string | Date
  timezone?: string
  email_verified?: number
  email_notifications?: number
}

// Add UserProfile interface for settings
export interface UserProfile extends User {
  timezone: string
}

export type TaskCategory =
  | "server-renewal"
  | "electricity-bill"
  | "internet-bill"
  | "water-bill"
  | "rent"
  | "insurance"
  | "subscription"
  | "maintenance"
  | "other"

export type RecurringType = "daily" | "weekly" | "monthly"

export interface Task {
  id: string
  title: string
  description?: string
  category: string
  dueDate: Date
  reminderTime: number
  isRecurring: boolean
  recurringType?: RecurringType
  isCompleted: boolean
  createdAt: Date
  completedAt?: Date
  lunarDate?: LunarDateInfo // Add lunar date information
}

export interface Notification {
  id: string
  taskId: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface LunarDateInfo {
  year: number
  month: number
  day: number
  isLeap: boolean // Indicates if it's a leap month
  chineseMonth: string // e.g., "正", "二", "闰二"
  chineseDay: string // e.g., "初一", "十五"
  zodiac: string // e.g., "鼠", "牛"
  solarTerm?: string // e.g., "立春", "清明"
}
