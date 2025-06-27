"use client"

import type React from "react"

import { useState } from "react"
import type { Task, Language } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, RotateCcw, Clock, CheckCircle } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  addMonths,
  subMonths,
} from "date-fns"
import TaskDetailModal from "./task-detail-modal"
import { useTranslation, formatDate } from "@/lib/i18n"
import { getLunarDateInfo } from "@/lib/lunar-utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface CalendarViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onAddTask: (date?: Date) => void
  language: Language
}

const categoryColors: Record<string, string> = {
  "server-renewal": "bg-blue-500",
  "electricity-bill": "bg-yellow-500",
  "internet-bill": "bg-purple-500",
  "water-bill": "bg-cyan-500",
  rent: "bg-green-500",
  insurance: "bg-orange-500",
  subscription: "bg-pink-500",
  maintenance: "bg-gray-500",
  other: "bg-slate-500",
}

export default function CalendarView({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onAddTask,
  language,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showLunar, setShowLunar] = useState(false)

  const t = useTranslation(language)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.dueDate, date))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTaskClick = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTask(task)
  }

  const tasksForSelectedDate = selectedDate ? getTasksForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg sm:text-xl font-bold min-w-[180px] sm:min-w-[200px] text-center">
                {formatDate(currentDate, language, "month")}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="lunar-toggle" checked={showLunar} onCheckedChange={setShowLunar} />
              <Label htmlFor="lunar-toggle">{t.showLunar}</Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {[t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat].map((day) => (
              <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasOverdueTasks = dayTasks.some((task) => !task.isCompleted && isPast(task.dueDate))

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[60px] sm:min-h-[80px] p-1 border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                    ${isCurrentMonth ? "bg-background" : "bg-muted/20 text-muted-foreground"}
                    ${isSelected ? "ring-2 ring-primary" : ""}
                    ${isToday(day) ? "bg-primary/5 border-primary/20" : ""}
                    ${hasOverdueTasks ? "border-red-200 bg-red-50/50" : ""}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs sm:text-sm font-medium ${isToday(day) ? "text-primary font-bold" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs rounded-full">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                  {showLunar && (
                    <div className="text-xs text-muted-foreground text-center">
                      {getLunarDateInfo(day).day}/{getLunarDateInfo(day).month}
                    </div>
                  )}

                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          text-xs p-1 rounded cursor-pointer transition-all hover:scale-105
                          ${task.isCompleted ? "opacity-60 line-through" : ""}
                        `}
                        style={{
                          backgroundColor: `${categoryColors[task.category]}20`,
                          borderLeft: `3px solid ${categoryColors[task.category]}`,
                        }}
                        onClick={(e) => handleTaskClick(task, e)}
                        title={task.title}
                      >
                        <div className="flex items-center gap-1">
                          {task.isRecurring && <RotateCcw className="h-2 w-2 sm:h-3 sm:w-3" />}
                          {task.isCompleted && <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3" />}
                          {!task.isCompleted && isPast(task.dueDate) && (
                            <Clock className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                          )}
                          <span className="truncate flex-1 text-xs">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">+{dayTasks.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">
              {t.tasksFor} {formatDate(selectedDate, language, "short")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">{t.noTasksForDate}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => onAddTask(selectedDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addTask}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForSelectedDate
                  .sort((a, b) => {
                    if (a.isCompleted !== b.isCompleted) {
                      return a.isCompleted ? 1 : -1
                    }
                    return a.dueDate.getTime() - b.dueDate.getTime()
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                        ${task.isCompleted ? "opacity-60 bg-muted/50" : "bg-background"}
                        ${!task.isCompleted && isPast(task.dueDate) ? "border-red-200 bg-red-50/50" : ""}
                      `}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: categoryColors[task.category] }}
                            />
                            <h4
                              className={`font-medium text-sm sm:text-base ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </h4>
                            {task.isRecurring && <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                          </div>

                          {task.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span
                                className={
                                  !task.isCompleted && isPast(task.dueDate)
                                    ? "text-red-600 font-medium"
                                    : "text-muted-foreground"
                                }
                              >
                                {format(task.dueDate, "h:mm a")}
                              </span>
                            </div>
                            {task.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                {task.recurringType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleComplete(task.id)
                          }}
                          className={`h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ${task.isCompleted ? "text-green-600" : ""}`}
                        >
                          <CheckCircle className={`h-4 w-4 ${task.isCompleted ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            onEditTask(selectedTask)
            setSelectedTask(null)
          }}
          onDelete={() => {
            onDeleteTask(selectedTask.id)
            setSelectedTask(null)
          }}
          onToggleComplete={() => {
            onToggleComplete(selectedTask.id)
            setSelectedTask(null)
          }}
          language={language}
        />
      )}
    </div>
  )
}
