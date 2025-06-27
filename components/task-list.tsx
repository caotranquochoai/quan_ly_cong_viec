"use client"

import type { Task, Language } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Edit, Trash2, RotateCcw } from "lucide-react"
import { format, isPast, isSameDay } from "date-fns"
import { useTranslation, formatDate } from "@/lib/i18n"

interface TaskListProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
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

export default function TaskList({ tasks, onEditTask, onDeleteTask, onToggleComplete, language }: TaskListProps) {
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

  const getDateLabel = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (isSameDay(date, today)) return t.today
    if (isSameDay(date, tomorrow)) return t.tomorrow
    return formatDate(date, language, "short")
  }

  const getTimeLabel = (date: Date) => {
    return format(date, "h:mm a")
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1
    }
    return a.dueDate.getTime() - b.dueDate.getTime()
  })

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t.noTasks}</p>
        <p className="text-sm">{t.noTasksSubtitle}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <Card key={task.id} className={`transition-all ${task.isCompleted ? "opacity-60" : ""}`}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h3
                    className={`font-medium text-sm sm:text-base flex-1 ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </h3>
                  {task.isRecurring && <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                </div>

                {task.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className={`${categoryColors[task.category]} text-xs`}>
                    {categoryLabels[task.category]}
                  </Badge>
                  {task.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      {task.recurringType}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div
                    className={`flex items-center gap-1 ${isPast(task.dueDate) && !task.isCompleted ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">
                      {getDateLabel(task.dueDate)} at {getTimeLabel(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleComplete(task.id)}
                  className={`h-8 w-8 sm:h-10 sm:w-10 ${task.isCompleted ? "text-green-600" : ""}`}
                >
                  <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${task.isCompleted ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditTask(task)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTask(task.id)}
                  className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
