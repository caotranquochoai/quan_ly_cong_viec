"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Activity,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Clock,
  User,
} from "lucide-react"
import type { Language } from "@/lib/types"
import type { AdminUser } from "@/lib/admin-auth"
import { useTranslation, formatDate } from "@/lib/i18n"
import LanguageSelector from "@/components/language-selector"

interface AdminDashboardProps {
  admin: AdminUser
  onLogout: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

export default function AdminDashboard({ admin, onLogout, language, onLanguageChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dashboard stats
  const [stats, setStats] = useState<any>(null)

  // Users management
  const [users, setUsers] = useState<any[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersFilter, setUsersFilter] = useState({ role: "", status: "" })
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)

  // Tasks management
  const [tasks, setTasks] = useState<any[]>([])
  const [tasksTotal, setTasksTotal] = useState(0)
  const [tasksPage, setTasksPage] = useState(1)
  const [tasksSearch, setTasksSearch] = useState("")
  const [tasksFilter, setTasksFilter] = useState({ status: "", userId: "" })

  // Activity logs
  const [logs, setLogs] = useState<any[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [logsFilter, setLogsFilter] = useState({ userId: "", action: "" })

  // App configurations
  const [configs, setConfigs] = useState<any[]>([])
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("")
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)

  const t = useTranslation(language)

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  // Load users
  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: "10",
        search: usersSearch,
        role: usersFilter.role || "all",
        status: usersFilter.status || "all",
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setUsersTotal(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load users")
      }
    } catch (error) {
      console.error("Load users error:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // Load tasks
  const loadTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: tasksPage.toString(),
        limit: "10",
        search: tasksSearch,
        status: tasksFilter.status || "all",
        userId: tasksFilter.userId,
      })

      const response = await fetch(`/api/admin/tasks?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setTasksTotal(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load tasks")
      }
    } catch (error) {
      console.error("Load tasks error:", error)
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  // Load activity logs
  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: logsPage.toString(),
        limit: "20",
        userId: logsFilter.userId,
        action: logsFilter.action,
      })

      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setLogsTotal(data.total || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load logs")
      }
    } catch (error) {
      console.error("Load logs error:", error)
      setError("Failed to load logs")
    } finally {
      setLoading(false)
    }
  }

  // Load configurations
  const loadConfigs = async () => {
    try {
      const response = await fetch("/api/admin/config", {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setConfigs(data || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load configurations")
      }
    } catch (error) {
      console.error("Load configs error:", error)
      setError("Failed to load configurations")
    }
  }

  // Update user
  const updateUser = async (userId: number, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        loadUsers()
        setEditingUser(null)
      } else {
        setError("Failed to update user")
      }
    } catch (error) {
      setError("Failed to update user")
    }
  }

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })

      if (response.ok) {
        loadUsers()
      } else {
        setError("Failed to delete user")
      }
    } catch (error) {
      setError("Failed to delete user")
    }
  }

  // Update task status
  const updateTaskStatus = async (taskId: number, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ isCompleted }),
      })

      if (response.ok) {
        loadTasks()
      } else {
        setError("Failed to update task")
      }
    } catch (error) {
      setError("Failed to update task")
    }
  }

  // Delete task
  const deleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth-token")}` },
      })

      if (response.ok) {
        loadTasks()
      } else {
        setError("Failed to delete task")
      }
    } catch (error) {
      setError("Failed to delete task")
    }
  }

  // Update configuration
  const updateConfig = async (key: string, value: string) => {
    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ key, value }),
      })

      if (response.ok) {
        loadConfigs()
        setEditingConfig(null)
      } else {
        setError("Failed to update configuration")
      }
    } catch (error) {
      setError("Failed to update configuration")
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      setError("Please enter an email address.")
      return
    }
    setIsSendingTestEmail(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.ok) {
        alert("Test email sent successfully!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to send test email")
      }
    } catch (error) {
      setError("Failed to send test email")
    } finally {
      setIsSendingTestEmail(false)
    }
  }

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setError(null)

      switch (activeTab) {
        case "overview":
          await loadStats()
          break
        case "users":
          await loadUsers()
          break
        case "tasks":
          await loadTasks()
          break
        case "logs":
          await loadLogs()
          break
        case "settings":
          await loadConfigs()
          break
      }
    }

    loadData()
  }, [activeTab, usersPage, usersSearch, usersFilter, tasksPage, tasksSearch, tasksFilter, logsPage, logsFilter])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return language === "vi" ? "Chào buổi sáng" : language === "zh" ? "早上好" : "Good Morning"
    } else if (hour < 18) {
      return language === "vi" ? "Chào buổi chiều" : language === "zh" ? "下午好" : "Good Afternoon"
    } else {
      return language === "vi" ? "Chào buổi tối" : language === "zh" ? "晚上好" : "Good Evening"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {language === "vi" ? "Bảng Điều Khiển Quản Trị" : language === "zh" ? "管理控制面板" : "Admin Dashboard"}
            </h1>
            <p className="text-slate-600 mt-1">
              {getGreeting()}, {admin.username}!
              {language === "vi" ? " Chào mừng trở lại." : language === "zh" ? " 欢迎回来。" : " Welcome back."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              {language === "vi" ? "Quản trị viên" : language === "zh" ? "管理员" : "Administrator"}
            </Badge>
            <Button onClick={onLogout} variant="outline" className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              {language === "vi" ? "Đăng xuất" : language === "zh" ? "退出登录" : "Logout"}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      {language === "vi" ? "Tổng người dùng" : language === "zh" ? "总用户数" : "Total Users"}
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{stats.users.total.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {stats.users.active} {language === "vi" ? "hoạt động" : language === "zh" ? "活跃" : "active"}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      {language === "vi" ? "Tổng công việc" : language === "zh" ? "总任务数" : "Total Tasks"}
                    </p>
                    <p className="text-3xl font-bold text-green-900">{stats.tasks.total.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.tasks.completed}{" "}
                      {language === "vi" ? "hoàn thành" : language === "zh" ? "已完成" : "completed"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {language === "vi" ? "Hoạt động gần đây" : language === "zh" ? "最近活动" : "Recent Activities"}
                    </p>
                    <p className="text-3xl font-bold text-purple-900">{stats.activities.recent.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {language === "vi" ? "24 giờ qua" : language === "zh" ? "过去24小时" : "Last 24 hours"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      {language === "vi" ? "Công việc quá hạn" : language === "zh" ? "逾期任务" : "Overdue Tasks"}
                    </p>
                    <p className="text-3xl font-bold text-orange-900">{stats.tasks.overdue.toLocaleString()}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      {language === "vi" ? "Cần xử lý" : language === "zh" ? "需要处理" : "Need attention"}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {language === "vi" ? "Tổng quan" : language === "zh" ? "概览" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === "vi" ? "Người dùng" : language === "zh" ? "用户管理" : "Users"}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {language === "vi" ? "Công việc" : language === "zh" ? "任务管理" : "Tasks"}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {language === "vi" ? "Nhật ký" : language === "zh" ? "活动日志" : "Logs"}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === "vi" ? "Cài đặt" : language === "zh" ? "设置" : "Settings"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {language === "vi" ? "Thống kê người dùng" : language === "zh" ? "用户统计" : "User Statistics"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Hoạt động" : language === "zh" ? "活跃用户" : "Active Users"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.users.active}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.users.active / stats.users.total) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Quản trị viên" : language === "zh" ? "管理员" : "Administrators"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.users.admins}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(stats.users.admins / stats.users.total) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Mới hôm nay" : language === "zh" ? "今日新增" : "New Today"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.users.newToday}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {language === "vi" ? "Thống kê công việc" : language === "zh" ? "任务统计" : "Task Statistics"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Hoàn thành" : language === "zh" ? "已完成" : "Completed"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.tasks.completed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.tasks.completed / stats.tasks.total) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Quá hạn" : language === "zh" ? "逾期" : "Overdue"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.tasks.overdue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(stats.tasks.overdue / stats.tasks.total) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {language === "vi" ? "Mới hôm nay" : language === "zh" ? "今日新增" : "New Today"}
                        </span>
                        <span className="text-sm text-muted-foreground">{stats.tasks.newToday}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {language === "vi" ? "Quản lý người dùng" : language === "zh" ? "用户管理" : "User Management"}
                  </CardTitle>
                  <Button onClick={loadUsers} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Làm mới" : language === "zh" ? "刷新" : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={
                          language === "vi"
                            ? "Tìm kiếm người dùng..."
                            : language === "zh"
                              ? "搜索用户..."
                              : "Search users..."
                        }
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={usersFilter.role}
                    onValueChange={(value) => setUsersFilter({ ...usersFilter, role: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={language === "vi" ? "Vai trò" : language === "zh" ? "角色" : "Role"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "vi" ? "Tất cả vai trò" : language === "zh" ? "所有角色" : "All Roles"}
                      </SelectItem>
                      <SelectItem value="user">
                        {language === "vi" ? "Người dùng" : language === "zh" ? "用户" : "User"}
                      </SelectItem>
                      <SelectItem value="admin">
                        {language === "vi" ? "Quản trị" : language === "zh" ? "管理员" : "Admin"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={usersFilter.status}
                    onValueChange={(value) => setUsersFilter({ ...usersFilter, status: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue
                        placeholder={language === "vi" ? "Trạng thái" : language === "zh" ? "状态" : "Status"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "vi" ? "Tất cả trạng thái" : language === "zh" ? "所有状态" : "All Status"}
                      </SelectItem>
                      <SelectItem value="active">
                        {language === "vi" ? "Hoạt động" : language === "zh" ? "活跃" : "Active"}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {language === "vi" ? "Không hoạt động" : language === "zh" ? "非活跃" : "Inactive"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>{language === "vi" ? "Đang tải..." : language === "zh" ? "加载中..." : "Loading..."}</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {language === "vi"
                          ? "Không tìm thấy người dùng"
                          : language === "zh"
                            ? "未找到用户"
                            : "No users found"}
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role === "admin"
                                  ? language === "vi"
                                    ? "Quản trị"
                                    : language === "zh"
                                      ? "管理员"
                                      : "Admin"
                                  : language === "vi"
                                    ? "Người dùng"
                                    : language === "zh"
                                      ? "用户"
                                      : "User"}
                              </Badge>
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive
                                  ? language === "vi"
                                    ? "Hoạt động"
                                    : language === "zh"
                                      ? "活跃"
                                      : "Active"
                                  : language === "vi"
                                    ? "Không hoạt động"
                                    : language === "zh"
                                      ? "非活跃"
                                      : "Inactive"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {user.taskCount}{" "}
                                {language === "vi" ? "công việc" : language === "zh" ? "任务" : "tasks"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {language === "vi" ? "Đăng nhập cuối" : language === "zh" ? "最后登录" : "Last login"}:{" "}
                              {user.lastLogin ? formatDate(new Date(user.lastLogin), language, "short") : "Never"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                {language === "vi" ? "Xem" : language === "zh" ? "查看" : "View"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {language === "vi"
                                    ? "Chi tiết người dùng"
                                    : language === "zh"
                                      ? "用户详情"
                                      : "User Details"}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>
                                      {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
                                    </Label>
                                    <p className="font-medium">{user.username}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{user.email}</p>
                                  </div>
                                  <div>
                                    <Label>{language === "vi" ? "Vai trò" : language === "zh" ? "角色" : "Role"}</Label>
                                    <p className="font-medium">{user.role}</p>
                                  </div>
                                  <div>
                                    <Label>
                                      {language === "vi" ? "Trạng thái" : language === "zh" ? "状态" : "Status"}
                                    </Label>
                                    <p className="font-medium">{user.isActive ? "Active" : "Inactive"}</p>
                                  </div>
                                  <div>
                                    <Label>
                                      {language === "vi" ? "Ngày tạo" : language === "zh" ? "创建日期" : "Created"}
                                    </Label>
                                    <p className="font-medium">
                                      {formatDate(new Date(user.createdAt), language, "short")}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>
                                      {language === "vi"
                                        ? "Số công việc"
                                        : language === "zh"
                                          ? "任务数量"
                                          : "Task Count"}
                                    </Label>
                                    <p className="font-medium">{user.taskCount}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                                <Edit className="h-4 w-4 mr-1" />
                                {language === "vi" ? "Sửa" : language === "zh" ? "编辑" : "Edit"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {language === "vi"
                                    ? "Chỉnh sửa người dùng"
                                    : language === "zh"
                                      ? "编辑用户"
                                      : "Edit User"}
                                </DialogTitle>
                              </DialogHeader>
                              {editingUser && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>
                                      {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
                                    </Label>
                                    <Input
                                      value={editingUser.username}
                                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <Input
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>{language === "vi" ? "Vai trò" : language === "zh" ? "角色" : "Role"}</Label>
                                    <Select
                                      value={editingUser.role}
                                      onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">
                                          {language === "vi" ? "Người dùng" : language === "zh" ? "用户" : "User"}
                                        </SelectItem>
                                        <SelectItem value="admin">
                                          {language === "vi" ? "Quản trị" : language === "zh" ? "管理员" : "Admin"}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={editingUser.isActive}
                                      onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                                    />
                                    <Label>
                                      {language === "vi"
                                        ? "Tài khoản hoạt động"
                                        : language === "zh"
                                          ? "账户激活"
                                          : "Account Active"}
                                    </Label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => updateUser(editingUser.id, editingUser)} className="flex-1">
                                      <Save className="h-4 w-4 mr-2" />
                                      {language === "vi" ? "Lưu" : language === "zh" ? "保存" : "Save"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                      {language === "vi" ? "Hủy" : language === "zh" ? "取消" : "Cancel"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {language === "vi" ? "Xóa" : language === "zh" ? "删除" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {usersTotal > 10 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      {language === "vi" ? "Hiển thị" : language === "zh" ? "显示" : "Showing"}{" "}
                      {(usersPage - 1) * 10 + 1} - {Math.min(usersPage * 10, usersTotal)}{" "}
                      {language === "vi" ? "của" : language === "zh" ? "共" : "of"} {usersTotal}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                        disabled={usersPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{usersPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(usersPage + 1)}
                        disabled={usersPage * 10 >= usersTotal}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {language === "vi" ? "Quản lý công việc" : language === "zh" ? "任务管理" : "Task Management"}
                  </CardTitle>
                  <Button onClick={loadTasks} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Làm mới" : language === "zh" ? "刷新" : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={
                          language === "vi"
                            ? "Tìm kiếm công việc..."
                            : language === "zh"
                              ? "搜索任务..."
                              : "Search tasks..."
                        }
                        value={tasksSearch}
                        onChange={(e) => setTasksSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={tasksFilter.status}
                    onValueChange={(value) => setTasksFilter({ ...tasksFilter, status: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue
                        placeholder={language === "vi" ? "Trạng thái" : language === "zh" ? "状态" : "Status"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "vi" ? "Tất cả trạng thái" : language === "zh" ? "所有状态" : "All Status"}
                      </SelectItem>
                      <SelectItem value="completed">
                        {language === "vi" ? "Hoàn thành" : language === "zh" ? "已完成" : "Completed"}
                      </SelectItem>
                      <SelectItem value="pending">
                        {language === "vi" ? "Đang chờ" : language === "zh" ? "待处理" : "Pending"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tasks Table */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>{language === "vi" ? "Đang tải..." : language === "zh" ? "加载中..." : "Loading..."}</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {language === "vi"
                          ? "Không tìm thấy công việc"
                          : language === "zh"
                            ? "未找到任务"
                            : "No tasks found"}
                      </p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4
                              className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </h4>
                            <Badge variant={task.isCompleted ? "default" : "secondary"}>
                              {task.isCompleted
                                ? language === "vi"
                                  ? "Hoàn thành"
                                  : language === "zh"
                                    ? "已完成"
                                    : "Completed"
                                : language === "vi"
                                  ? "Đang chờ"
                                  : language === "zh"
                                    ? "待处理"
                                    : "Pending"}
                            </Badge>
                            {task.isRecurring && (
                              <Badge variant="outline">
                                {language === "vi" ? "Lặp lại" : language === "zh" ? "重复" : "Recurring"}
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{task.user.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(new Date(task.dueDate), language, "short")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="capitalize">{task.category.replace("-", " ")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, !task.isCompleted)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {task.isCompleted
                              ? language === "vi"
                                ? "Mở lại"
                                : language === "zh"
                                  ? "重新打开"
                                  : "Reopen"
                              : language === "vi"
                                ? "Hoàn thành"
                                : language === "zh"
                                  ? "完成"
                                  : "Complete"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {language === "vi" ? "Xóa" : language === "zh" ? "删除" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {tasksTotal > 10 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      {language === "vi" ? "Hiển thị" : language === "zh" ? "显示" : "Showing"}{" "}
                      {(tasksPage - 1) * 10 + 1} - {Math.min(tasksPage * 10, tasksTotal)}{" "}
                      {language === "vi" ? "của" : language === "zh" ? "共" : "of"} {tasksTotal}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTasksPage(Math.max(1, tasksPage - 1))}
                        disabled={tasksPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{tasksPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTasksPage(tasksPage + 1)}
                        disabled={tasksPage * 10 >= tasksTotal}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {language === "vi" ? "Nhật ký hoạt động" : language === "zh" ? "活动日志" : "Activity Logs"}
                  </CardTitle>
                  <Button onClick={loadLogs} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Làm mới" : language === "zh" ? "刷新" : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Input
                    placeholder={
                      language === "vi"
                        ? "Lọc theo ID người dùng..."
                        : language === "zh"
                          ? "按用户ID筛选..."
                          : "Filter by user ID..."
                    }
                    value={logsFilter.userId}
                    onChange={(e) => setLogsFilter({ ...logsFilter, userId: e.target.value })}
                  />
                  <Input
                    placeholder={
                      language === "vi"
                        ? "Lọc theo hành động..."
                        : language === "zh"
                          ? "按操作筛选..."
                          : "Filter by action..."
                    }
                    value={logsFilter.action}
                    onChange={(e) => setLogsFilter({ ...logsFilter, action: e.target.value })}
                  />
                </div>

                {/* Logs List */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>{language === "vi" ? "Đang tải..." : language === "zh" ? "加载中..." : "Loading..."}</p>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{language === "vi" ? "Không có nhật ký" : language === "zh" ? "没有日志" : "No logs found"}</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(new Date(log.createdAt), language, "full")}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{log.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {log.userUsername && (
                              <span>
                                {language === "vi" ? "Người dùng" : language === "zh" ? "用户" : "User"}:{" "}
                                {log.userUsername}
                              </span>
                            )}
                            {log.adminUsername && (
                              <span>
                                {language === "vi" ? "Quản trị" : language === "zh" ? "管理员" : "Admin"}:{" "}
                                {log.adminUsername}
                              </span>
                            )}
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {logsTotal > 20 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      {language === "vi" ? "Hiển thị" : language === "zh" ? "显示" : "Showing"}{" "}
                      {(logsPage - 1) * 20 + 1} - {Math.min(logsPage * 20, logsTotal)}{" "}
                      {language === "vi" ? "của" : language === "zh" ? "共" : "of"} {logsTotal}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogsPage(Math.max(1, logsPage - 1))}
                        disabled={logsPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{logsPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogsPage(logsPage + 1)}
                        disabled={logsPage * 20 >= logsTotal}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {language === "vi"
                    ? "Cấu hình ứng dụng"
                    : language === "zh"
                      ? "应用配置"
                      : "Application Configuration"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {config.key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === "vi" ? "Cập nhật" : language === "zh" ? "更新于" : "Updated"}:{" "}
                          {formatDate(new Date(config.updatedAt), language, "short")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{config.value}</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingConfig(config)}>
                              <Edit className="h-4 w-4 mr-1" />
                              {language === "vi" ? "Sửa" : language === "zh" ? "编辑" : "Edit"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {language === "vi"
                                  ? "Chỉnh sửa cấu hình"
                                  : language === "zh"
                                    ? "编辑配置"
                                    : "Edit Configuration"}
                              </DialogTitle>
                            </DialogHeader>
                            {editingConfig && (
                              <div className="space-y-4">
                                <div>
                                  <Label>
                                    {language === "vi"
                                      ? "Khóa cấu hình"
                                      : language === "zh"
                                        ? "配置键"
                                        : "Configuration Key"}
                                  </Label>
                                  <Input value={editingConfig.key} disabled />
                                </div>
                                <div>
                                  <Label>{language === "vi" ? "Giá trị" : language === "zh" ? "值" : "Value"}</Label>
                                  <Input
                                    value={editingConfig.value}
                                    onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>
                                    {language === "vi" ? "Mô tả" : language === "zh" ? "描述" : "Description"}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{editingConfig.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => updateConfig(editingConfig.key, editingConfig.value)}
                                    className="flex-1"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    {language === "vi" ? "Lưu" : language === "zh" ? "保存" : "Save"}
                                  </Button>
                                  <Button variant="outline" onClick={() => setEditingConfig(null)}>
                                    {language === "vi" ? "Hủy" : language === "zh" ? "取消" : "Cancel"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {language === "vi"
                    ? "Kiểm tra Email"
                    : language === "zh"
                      ? "邮件测试"
                      : "Email Test"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="test-email">
                    {language === "vi"
                      ? "Gửi email kiểm tra đến"
                      : language === "zh"
                        ? "发送测试邮件至"
                        : "Send test email to"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="email@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button onClick={sendTestEmail} disabled={isSendingTestEmail}>
                      {isSendingTestEmail
                        ? language === "vi"
                          ? "Đang gửi..."
                          : language === "zh"
                            ? "发送中..."
                            : "Sending..."
                        : language === "vi"
                          ? "Gửi"
                          : language === "zh"
                            ? "发送"
                            : "Send"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
