"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, TaskCategory, Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { convertLunarToSolar } from "@/lib/lunar-utils"
import { X } from "lucide-react"

interface TaskFormProps {
  task?: Task
  onSave: (task: Omit<Task, "id" | "createdAt">) => void
  onCancel: () => void
  language: Language
  prefilledDate?: Date
}

export default function TaskForm({ task, onSave, onCancel, language, prefilledDate }: TaskFormProps) {
  const t = useTranslation(language)

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || ("other" as TaskCategory),
    dueDate: task?.dueDate ? task.dueDate.toISOString().slice(0, 16) : (prefilledDate ? prefilledDate.toISOString().slice(0, 16) : ""),
    reminderTime: task?.reminderTime || 60,
    isRecurring: task?.isRecurring || false,
    recurringType: task?.recurringType || ("monthly" as const),
    isCompleted: task?.isCompleted || false,
  })
  const [isLunar, setIsLunar] = useState(false)
  const [lunarDate, setLunarDate] = useState({ year: new Date().getFullYear(), month: 1, day: 1, isLeap: false })

  const categoryLabels: Record<TaskCategory, string> = {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    let solarDueDate: Date
    if (isLunar) {
      solarDueDate = convertLunarToSolar(lunarDate.year, lunarDate.month, lunarDate.day, lunarDate.isLeap)
    } else {
      if (!formData.dueDate) return
      solarDueDate = new Date(formData.dueDate)
    }

    onSave({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      dueDate: solarDueDate,
      reminderTime: formData.reminderTime,
      isRecurring: formData.isRecurring,
      recurringType: formData.isRecurring ? formData.recurringType : undefined,
      isCompleted: formData.isCompleted,
      completedAt: formData.isCompleted ? new Date() : undefined,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-white z-10">
        <CardTitle className="text-lg sm:text-xl">{task ? t.editTask : t.addTask}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {t.taskTitle}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t.enterTaskTitle}
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t.description}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.addTaskDetails}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                {t.category}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: TaskCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-sm">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderTime" className="text-sm font-medium">
                {t.reminderTime}
              </Label>
              <Select
                value={formData.reminderTime.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminderTime: Number.parseInt(value) })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15" className="text-sm">
                    {t.minutes15}
                  </SelectItem>
                  <SelectItem value="30" className="text-sm">
                    {t.minutes30}
                  </SelectItem>
                  <SelectItem value="60" className="text-sm">
                    {t.hour1}
                  </SelectItem>
                  <SelectItem value="120" className="text-sm">
                    {t.hours2}
                  </SelectItem>
                  <SelectItem value="1440" className="text-sm">
                    {t.day1}
                  </SelectItem>
                  <SelectItem value="2880" className="text-sm">
                    {t.days2}
                  </SelectItem>
                  <SelectItem value="10080" className="text-sm">
                    {t.week1}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="lunar-date" checked={isLunar} onCheckedChange={setIsLunar} />
            <Label htmlFor="lunar-date">Use Lunar Calendar</Label>
          </div>

          {isLunar ? (
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Year"
                value={lunarDate.year}
                onChange={(e) => setLunarDate({ ...lunarDate, year: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Month"
                value={lunarDate.month}
                onChange={(e) => setLunarDate({ ...lunarDate, month: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Day"
                value={lunarDate.day}
                onChange={(e) => setLunarDate({ ...lunarDate, day: parseInt(e.target.value) })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">
                {t.dueDate}
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                className="text-sm"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
            />
            <Label htmlFor="recurring" className="text-sm font-medium">
              {t.recurringTask}
            </Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringType" className="text-sm font-medium">
                {t.repeat}
              </Label>
              <Select
                value={formData.recurringType}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  setFormData({ ...formData, recurringType: value })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="text-sm">
                    {t.daily}
                  </SelectItem>
                  <SelectItem value="weekly" className="text-sm">
                    {t.weekly}
                  </SelectItem>
                  <SelectItem value="monthly" className="text-sm">
                    {t.monthly}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4 sticky bottom-0 bg-white">
            <Button type="submit" className="flex-1 text-sm">
              {task ? t.editTask : t.addTask}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="text-sm">
              {t.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
