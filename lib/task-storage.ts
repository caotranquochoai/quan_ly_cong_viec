import type { Task, Notification } from "./types"

const TASKS_KEY = "task-scheduler-tasks"
const NOTIFICATIONS_KEY = "task-scheduler-notifications"

export const taskStorage = {
  getTasks: (): Task[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(TASKS_KEY)
    if (!stored) return []

    const tasks = JSON.parse(stored)
    return tasks.map((task: any) => ({
      ...task,
      dueDate: new Date(task.dueDate),
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }))
  },

  saveTasks: (tasks: Task[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  },

  addTask: (task: Task) => {
    const tasks = taskStorage.getTasks()
    tasks.push(task)
    taskStorage.saveTasks(tasks)
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    const tasks = taskStorage.getTasks()
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      taskStorage.saveTasks(tasks)
    }
  },

  deleteTask: (taskId: string) => {
    const tasks = taskStorage.getTasks().filter((t) => t.id !== taskId)
    taskStorage.saveTasks(tasks)
  },

  getNotifications: (): Notification[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!stored) return []

    const notifications = JSON.parse(stored)
    return notifications.map((notif: any) => ({
      ...notif,
      createdAt: new Date(notif.createdAt),
    }))
  },

  saveNotifications: (notifications: Notification[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  },

  addNotification: (notification: Notification) => {
    const notifications = taskStorage.getNotifications()
    notifications.push(notification)
    taskStorage.saveNotifications(notifications)
  },

  markNotificationRead: (notificationId: string) => {
    const notifications = taskStorage.getNotifications()
    const index = notifications.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notifications[index].isRead = true
      taskStorage.saveNotifications(notifications)
    }
  },
}
