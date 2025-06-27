"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, User, Lock, Globe, Clock, Save, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import type { Language, UserProfile } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { validateEmail, validateUsername, validatePassword } from "@/lib/auth"
import { TIMEZONES, getSystemTimezone, getCurrentTimeInTimezone, getTimezoneOffset } from "@/lib/timezone-utils"

interface UserSettingsModalProps {
  user: UserProfile
  onClose: () => void
  onUpdate: (updates: Partial<UserProfile>) => Promise<boolean>
  language: Language
}

interface FormData {
  username: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  timezone: string
}

interface ValidationErrors {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function UserSettingsModal({ user, onClose, onUpdate, language }: UserSettingsModalProps) {
  const t = useTranslation(language)
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState<FormData>({
    username: user.username,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    timezone: user.timezone || getSystemTimezone(),
  })

  const [currentTimes, setCurrentTimes] = useState({
    system: "",
    user: "",
    systemTimezone: getSystemTimezone(),
  })

  // Update current times every second
  useEffect(() => {
    const updateTimes = () => {
      setCurrentTimes({
        system: getCurrentTimeInTimezone(getSystemTimezone()),
        user: getCurrentTimeInTimezone(formData.timezone),
        systemTimezone: getSystemTimezone(),
      })
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [formData.timezone])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Username validation
    const usernameValidation = validateUsername(formData.username)
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.message
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Password validation (only if changing password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password"
      }

      const passwordValidation = validatePassword(formData.newPassword)
      if (!passwordValidation.valid) {
        newErrors.newPassword = passwordValidation.message
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setSuccess(null)

    try {
      const updates: Partial<UserProfile> = {
        username: formData.username,
        email: formData.email,
        timezone: formData.timezone,
      }

      // Add password if changing
      if (formData.newPassword) {
        ;(updates as any).currentPassword = formData.currentPassword
        ;(updates as any).newPassword = formData.newPassword
      }

      const success = await onUpdate(updates)

      if (success) {
        setSuccess("Profile updated successfully!")
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear related errors
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const getTimezoneLabel = (timezone: string) => {
    const tz = TIMEZONES.find((t) => t.value === timezone)
    return tz ? tz.label : timezone
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">
            {language === "vi" ? "Cài đặt tài khoản" : language === "zh" ? "账户设置" : "Account Settings"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === "vi" ? "Hồ sơ" : language === "zh" ? "个人资料" : "Profile"}
              </TabsTrigger>
              <TabsTrigger value="timezone" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {language === "vi" ? "Múi giờ" : language === "zh" ? "时区" : "Timezone"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {language === "vi" ? "Thông tin cơ bản" : language === "zh" ? "基本信息" : "Basic Information"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{language === "vi" ? "Email" : language === "zh" ? "邮箱" : "Email"}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Password Change */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {language === "vi" ? "Đổi mật khẩu" : language === "zh" ? "更改密码" : "Change Password"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "vi"
                    ? "Để lại trống nếu không muốn thay đổi mật khẩu"
                    : language === "zh"
                      ? "如果不想更改密码，请留空"
                      : "Leave blank if you don't want to change your password"}
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {language === "vi" ? "Mật khẩu hiện tại" : language === "zh" ? "当前密码" : "Current Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        className={errors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        {language === "vi" ? "Mật khẩu mới" : language === "zh" ? "新密码" : "New Password"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange("newPassword", e.target.value)}
                          className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        {language === "vi" ? "Xác nhận mật khẩu" : language === "zh" ? "确认密码" : "Confirm Password"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timezone" className="space-y-6 mt-6">
              {/* Current Time Display */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {language === "vi" ? "Thời gian hiện tại" : language === "zh" ? "当前时间" : "Current Time"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {language === "vi" ? "Hệ thống" : language === "zh" ? "系统" : "System"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getTimezoneOffset(currentTimes.systemTimezone)}
                        </span>
                      </div>
                      <p className="text-lg font-mono">{currentTimes.system}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getTimezoneLabel(currentTimes.systemTimezone)}
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 border-primary">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          {language === "vi" ? "Của bạn" : language === "zh" ? "您的" : "Your"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{getTimezoneOffset(formData.timezone)}</span>
                      </div>
                      <p className="text-lg font-mono">{currentTimes.user}</p>
                      <p className="text-sm text-muted-foreground truncate">{getTimezoneLabel(formData.timezone)}</p>
                    </div>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Timezone Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {language === "vi" ? "Chọn múi giờ" : language === "zh" ? "选择时区" : "Select Timezone"}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="timezone">
                    {language === "vi" ? "Múi giờ ưa thích" : language === "zh" ? "首选时区" : "Preferred Timezone"}
                  </Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{tz.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">{tz.offset}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{language === "vi" ? "Lưu ý:" : language === "zh" ? "注意:" : "Note:"}</strong>{" "}
                    {language === "vi"
                      ? "Thay đổi múi giờ sẽ ảnh hưởng đến cách hiển thị tất cả thời gian trong ứng dụng, bao gồm thời hạn công việc và thông báo."
                      : language === "zh"
                        ? "更改时区将影响应用程序中所有时间的显示方式，包括任务截止时间和通知。"
                        : "Changing your timezone will affect how all times are displayed in the application, including task due dates and notifications."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {language === "vi" ? "Hủy" : language === "zh" ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === "vi" ? "Đang lưu..." : language === "zh" ? "保存中..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {language === "vi" ? "Lưu thay đổi" : language === "zh" ? "保存更改" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
