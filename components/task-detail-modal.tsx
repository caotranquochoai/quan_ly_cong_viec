"use client"

import type { Task, Language } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Calendar, Clock, Bell, RotateCcw, CheckCircle, Edit, Trash2, AlertCircle } from "lucide-react"
import { isPast } from "date-fns"
import { useTranslation, formatDate } from "@/lib/i18n"

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: () => void
  language: Language
}

const categoryColors: Record<string, string> = {
  "server-renewal": "bg-blue-100 text-blue-800",
  "electricity-bill": "bg-yellow-100 text-yellow-800",
  "internet-bill": "bg-purple-100 text-purple-800",
  "water-bill": "bg-cyan-100 text-cyan-800",
  rent: "bg-green-100 text-green-800",
  insurance: "bg-orange-100 text-orange-800",
  subscription: "bg-pink-100 text-pink-800",
  maintenance: "bg-gray-100 text-gray-800",
  other: "bg-slate-100 text-slate-800",
}

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  language,
}: TaskDetailModalProps) {
  const t = useTranslation(language)

  const categoryLabels: Record<string, string> = {
    "server-renewal": t.serverRenewal,
    "electricity-bill": t.electricityBill,
    "internet-bill": t.internetBill,
    "water-bill": t.waterBill,
    rent: t.rentPayment,
    insurance: t.insurance,
    subscription: t.subscription,
    maintenance: t.maintenance,
    other: t.other,
  }

  const reminderLabels: Record<number, string> = {
    15: `${t.minutes15} ${t.before}`,
    30: `${t.minutes30} ${t.before}`,
    60: `${t.hour1} ${t.before}`,
    120: `${t.hours2} ${t.before}`,
    1440: `${t.day1} ${t.before}`,
    2880: `${t.days2} ${t.before}`,
    10080: `${t.week1} ${t.before}`,
  }

  const isOverdue = !task.isCompleted && isPast(task.dueDate)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-lg ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={categoryColors[task.category]}>
                {categoryLabels[task.category]}
              </Badge>
              {task.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {task.recurringType}
                </Badge>
              )}
              {task.isCompleted && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <h4 className="font-medium mb-2">{t.description}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.dueDateLabel}</p>
                <p className={`text-sm ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                  {formatDate(task.dueDate, language, "full")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.reminderLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {reminderLabels[task.reminderTime] || `${task.reminderTime} minutes before`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.createdLabel}</p>
                <p className="text-sm text-muted-foreground">{formatDate(task.createdAt, language, "full")}</p>
              </div>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t.completedLabel}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(task.completedAt, language, "full")}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={onToggleComplete} variant={task.isCompleted ? "outline" : "default"} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              {task.isCompleted ? t.markIncomplete : t.markComplete}
            </Button>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
