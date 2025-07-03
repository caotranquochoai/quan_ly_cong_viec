"use client"

import { useState, useEffect } from "react"
import type { Task, Language } from "@/lib/types"
import type { User } from "@/lib/types"
import { taskStorage } from "@/lib/task-storage"
import TaskForm from "@/components/task-form"
import TaskList from "@/components/task-list"
import NotificationSystem from "@/components/notification-system"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import UserProfile from "@/components/auth/user-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, CheckCircle, Clock } from "lucide-react"
import { isToday, isPast } from "date-fns"
import CalendarView from "@/components/calendar-view"
import { useTranslation } from "@/lib/i18n"
import LanguageSelector from "@/components/language-selector"
import {
  getUserTasks,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  createTask as createTaskAPI,
} from "@/lib/task-db"
import { getLunarDateInfo } from "@/lib/lunar-utils"
import RecurringTaskDialog from "@/components/recurring-task-dialog"

type DialogState = {
  isOpen: boolean
  actionType: "update" | "delete"
  taskData: any
  taskId?: string
}

export default function TaskScheduler() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>()
  const [activeTab, setActiveTab] = useState("calendar")
  const [language, setLanguage] = useState<Language>("en")
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    actionType: "update",
    taskData: null,
  })

  // Authentication state
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const t = useTranslation(language)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth-token")
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const { user } = await response.json()
            const formattedUser = {
              ...user,
              created_at: user.created_at,
              last_login: user.last_login,
              timezone: user.timezone || "UTC",
            }
            setUser(formattedUser)
            await loadUserTasks(token)
          } else {
            localStorage.removeItem("auth-token")
          }
        } catch (error) {
          console.error("Auth verification failed:", error)
          localStorage.removeItem("auth-token")
        }
      }
      setIsInitializing(false)
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("task-scheduler-language") as Language
    if (savedLanguage && ["en", "vi", "zh"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const loadUserTasks = async (token: string) => {
    try {
      const userTasks = await getUserTasks(token)
      setTasks(userTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
      const localTasks = taskStorage.getTasks()
      setTasks(localTasks)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("task-scheduler-language", newLanguage)
  }

  const handleLogin = async (usernameOrEmail: string, password: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      })
      const result = await response.json()
      if (result.success) {
        localStorage.setItem("auth-token", result.token)
        setUser(result.user)
        await loadUserTasks(result.token)
      } else {
        setAuthError(result.message)
      }
    } catch (error) {
      setAuthError("Login failed. Please try again.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (username: string, email: string, password: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const result = await response.json()
      if (result.success) {
        localStorage.setItem("auth-token", result.token)
        setUser(result.user)
        await loadUserTasks(result.token)
      } else {
        setAuthError(result.message)
      }
    } catch (error) {
      setAuthError("Registration failed. Please try again.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    setUser(null)
    setTasks([])
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    updateTaskAPI(localStorage.getItem("auth-token")!, updatedUser.id.toString(), { timezone: updatedUser.timezone })
      .catch(error => console.error("Failed to update user timezone:", error));
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
          {authMode === "login" ? (
            <LoginForm onLogin={handleLogin} onSwitchToRegister={() => { setAuthMode("register"); setAuthError(null); }} language={language} isLoading={authLoading} error={authError} />
          ) : (
            <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => { setAuthMode("login"); setAuthError(null); }} language={language} isLoading={authLoading} error={authError} />
          )}
        </div>
      </div>
    )
  }

  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask && editingTask.recurring_series_id) {
      setDialogState({
        isOpen: true,
        actionType: "update",
        taskData: taskData,
        taskId: editingTask.id,
      });
    } else {
      await performSaveTask(taskData, "single");
    }
  };

  const performSaveTask = async (taskData: Omit<Task, "id" | "createdAt">, scope: "single" | "all_future") => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    if (editingTask) {
      try {
        const success = await updateTaskAPI(token, editingTask.id, taskData, scope);
        if (success) {
          await loadUserTasks(token);
        } else {
          alert("Failed to update task. Please try again.");
        }
      } catch (error) {
        console.error("Failed to update task:", error);
        alert("Failed to update task. Please try again.");
      }
    } else {
      try {
        const savedTask = await createTaskAPI(token, taskData);
        if (savedTask) {
          await loadUserTasks(token);
        } else {
          alert("Failed to create task. Please try again.");
        }
      } catch (error) {
        console.error("Failed to create task:", error);
        alert("Failed to create task. Please try again.");
      }
    }
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.recurring_series_id) {
      setDialogState({
        isOpen: true,
        actionType: "delete",
        taskData: null,
        taskId: taskId,
      });
    } else {
      await performDeleteTask(taskId, "single");
    }
  };

  const performDeleteTask = async (taskId: string, scope: "single" | "all_future") => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;
    try {
      const success = await deleteTaskAPI(token, taskId, scope);
      if (success) {
        await loadUserTasks(token);
      } else {
        alert("Failed to delete task. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleConfirmRecurringAction = (scope: "single" | "all_future") => {
    if (dialogState.actionType === "update") {
      performSaveTask(dialogState.taskData, scope);
    } else if (dialogState.actionType === "delete" && dialogState.taskId) {
      performDeleteTask(dialogState.taskId, scope);
    }
    setDialogState({ isOpen: false, actionType: "update", taskData: null });
  };

  const handleToggleComplete = async (taskId: string) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isCompleting = !task.isCompleted;
    const updates: Partial<Task> = {
      isCompleted: isCompleting,
      completedAt: isCompleting ? new Date() : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));

    if (isCompleting && task.isRecurring && task.recurringType && (task.recurringCount || 0) < (task.recurringCycles || 1) - 1) {
      const nextDueDate = new Date(task.dueDate);
      const originalDay = nextDueDate.getDate();
      switch (task.recurringType) {
        case "daily": nextDueDate.setDate(nextDueDate.getDate() + 1); break;
        case "weekly": nextDueDate.setDate(nextDueDate.getDate() + 7); break;
        case "monthly":
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          if (nextDueDate.getDate() !== originalDay) {
            nextDueDate.setDate(0);
          }
          break;
      }
      const newRecurringTask: Omit<Task, "id" | "createdAt"> = {
        ...task,
        dueDate: nextDueDate,
        isCompleted: false,
        completedAt: undefined,
        recurringCount: (task.recurringCount || 0) + 1,
      };
      try {
        const savedTask = await createTaskAPI(token, newRecurringTask);
        if (savedTask) {
          setTasks((prev) => [...prev, savedTask]);
        }
      } catch (error) {
        console.error("Failed to create recurring task:", error);
      }
    }

    try {
      const success = await updateTaskAPI(token, taskId, updates);
      if (!success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
        alert("Failed to update task. Please try again.");
      }
    } catch (error) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      alert("Failed to update task. Please try again.");
    }
  };

  const upcomingTasks = tasks.filter((t) => !t.isCompleted && !isPast(t.dueDate));
  const overdueTasks = tasks.filter((t) => !t.isCompleted && isPast(t.dueDate));
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const todayTasks = tasks.filter((t) => !t.isCompleted && isToday(t.dueDate));

  const stats = {
    total: tasks.length,
    completed: completedTasks.length,
    overdue: overdueTasks.length,
    today: todayTasks.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{t.appTitle}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t.appSubtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
            <NotificationSystem tasks={tasks} onTaskComplete={handleToggleComplete} language={language} />
            <UserProfile user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} language={language} />
            <Button onClick={() => { setPrefilledDate(undefined); setShowForm(true); }} size="sm" className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              {t.addTask}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" /><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">{t.totalTasks}</p><p className="text-lg sm:text-xl font-bold">{stats.total}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">{t.completed}</p><p className="text-lg sm:text-xl font-bold">{stats.completed}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-orange-600 flex-shrink-0" /><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">{t.dueToday}</p><p className="text-lg sm:text-xl font-bold">{stats.today}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-red-600 flex-shrink-0" /><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground truncate">{t.overdue}</p><p className="text-lg sm:text-xl font-bold">{stats.overdue}</p></div></div></CardContent></Card>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <TaskForm
              task={editingTask}
              onSave={handleSaveTask}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(undefined)
              }}
              language={language}
              prefilledDate={prefilledDate}
            />
          </div>
        )}

        <RecurringTaskDialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          onConfirm={handleConfirmRecurringAction}
          actionType={dialogState.actionType}
          language={language}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-6">
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">{t.calendar}</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm"><span className="hidden sm:inline">{t.upcoming}</span><span className="sm:hidden">Up</span><span className="ml-1">({upcomingTasks.length})</span></TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm"><span className="hidden sm:inline">{t.overdue}</span><span className="sm:hidden">Over</span><span className="ml-1">({overdueTasks.length})</span></TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm hidden sm:flex">{t.completed} ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm hidden sm:flex">{t.all} ({tasks.length})</TabsTrigger>
          </TabsList>

          <div className="sm:hidden mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="completed" className="text-xs">{t.completed} ({completedTasks.length})</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">{t.all} ({tasks.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView tasks={tasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleComplete} onAddTask={(date) => { setPrefilledDate(date); setShowForm(true); }} language={language} />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-6">
            <TaskList tasks={upcomingTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleComplete} language={language} />
          </TabsContent>
          <TabsContent value="overdue" className="mt-6">
            <TaskList tasks={overdueTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleComplete} language={language} />
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <TaskList tasks={completedTasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleComplete} language={language} />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <TaskList tasks={tasks} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onToggleComplete={handleToggleComplete} language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
