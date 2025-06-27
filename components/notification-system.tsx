"use client"

import { useEffect, useState } from "react"
import type { Task, Notification, Language } from "@/lib/types"
import { taskStorage } from "@/lib/task-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X } from "lucide-react"
import { useTranslation, formatDate } from "@/lib/i18n"

interface NotificationSystemProps {
  tasks: Task[]
  onTaskComplete: (taskId: string) => void
  language: Language
}

export default function NotificationSystem({ tasks, onTaskComplete, language }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const t = useTranslation(language)

  useEffect(() => {
    const checkForNotifications = () => {
      const now = new Date()
      const existingNotifications = taskStorage.getNotifications()
      const newNotifications: Notification[] = []

      tasks.forEach((task) => {
        if (task.isCompleted) return

        const reminderTime = new Date(task.dueDate.getTime() - task.reminderTime * 60 * 1000)

        if (now >= reminderTime) {
          const existingNotification = existingNotifications.find((n) => n.taskId === task.id && !n.isRead)

          if (!existingNotification) {
            const notification: Notification = {
              id: `${task.id}-${Date.now()}`,
              taskId: task.id,
              message: `${t.reminder}: ${task.title} ${formatDate(task.dueDate, language, "full")}`,
              createdAt: now,
              isRead: false,
            }
            newNotifications.push(notification)
            taskStorage.addNotification(notification)
          }
        }
      })

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...prev, ...newNotifications])
      }
    }

    // Check immediately and then every minute
    checkForNotifications()
    const interval = setInterval(checkForNotifications, 60000)

    // Load existing unread notifications
    const unreadNotifications = taskStorage.getNotifications().filter((n) => !n.isRead)
    setNotifications(unreadNotifications)

    return () => clearInterval(interval)
  }, [tasks, language, t])

  const handleMarkAsRead = (notificationId: string) => {
    taskStorage.markNotificationRead(notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const handleCompleteTask = (taskId: string, notificationId: string) => {
    onTaskComplete(taskId)
    handleMarkAsRead(notificationId)
  }

  const unreadCount = notifications.length

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4">
          <Card className="w-full max-w-md max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{t.notifications}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t.noNotifications}</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => {
                    const task = tasks.find((t) => t.id === notification.taskId)
                    return (
                      <Card key={notification.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium mb-2">{notification.message}</p>
                          <div className="flex gap-2">
                            {task && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteTask(task.id, notification.id)}
                                className="flex-1"
                              >
                                {t.markComplete}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                              {t.dismiss}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
