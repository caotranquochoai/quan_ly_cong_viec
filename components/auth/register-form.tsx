"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle, XCircle } from "lucide-react"
import type { Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { validatePassword, validateEmail, validateUsername } from "@/lib/auth"

interface RegisterFormProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>
  onSwitchToLogin: () => void
  language: Language
  isLoading: boolean
  error: string | null
}

export default function RegisterForm({ onRegister, onSwitchToLogin, language, isLoading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const t = useTranslation(language)

  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors }

    switch (field) {
      case "username":
        const usernameValidation = validateUsername(value)
        if (!usernameValidation.valid) {
          errors.username = usernameValidation.message
        } else {
          delete errors.username
        }
        break
      case "email":
        if (value && !validateEmail(value)) {
          errors.email =
            language === "vi" ? "Email không hợp lệ" : language === "zh" ? "邮箱格式无效" : "Invalid email format"
        } else {
          delete errors.email
        }
        break
      case "password":
        const passwordValidation = validatePassword(value)
        if (!passwordValidation.valid) {
          errors.password = passwordValidation.message
        } else {
          delete errors.password
        }
        break
      case "confirmPassword":
        if (value !== formData.password) {
          errors.confirmPassword =
            language === "vi" ? "Mật khẩu không khớp" : language === "zh" ? "密码不匹配" : "Passwords do not match"
        } else {
          delete errors.confirmPassword
        }
        break
    }

    setValidationErrors(errors)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    validateField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      validateField(field, formData[field as keyof typeof formData])
    })

    if (Object.keys(validationErrors).length > 0) return
    if (formData.password !== formData.confirmPassword) return

    await onRegister(formData.username, formData.email, formData.password)
  }

  const getFieldIcon = (field: string, value: string) => {
    if (!value) return null

    switch (field) {
      case "username":
        const usernameValid = validateUsername(value).valid
        return usernameValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      case "email":
        const emailValid = validateEmail(value)
        return emailValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      case "password":
        const passwordValid = validatePassword(value).valid
        return passwordValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      case "confirmPassword":
        const confirmValid = value === formData.password && value.length > 0
        return confirmValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          <UserPlus className="h-6 w-6 inline mr-2" />
          {language === "vi" ? "Đăng Ký" : language === "zh" ? "注册" : "Register"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">
              {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder={
                  language === "vi" ? "Nhập tên đăng nhập" : language === "zh" ? "输入用户名" : "Enter username"
                }
                required
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {getFieldIcon("username", formData.username)}
              </div>
            </div>
            {validationErrors.username && <p className="text-sm text-red-500">{validationErrors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={
                  language === "vi" ? "Nhập địa chỉ email" : language === "zh" ? "输入邮箱地址" : "Enter email address"
                }
                required
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">{getFieldIcon("email", formData.email)}</div>
            </div>
            {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{language === "vi" ? "Mật khẩu" : language === "zh" ? "密码" : "Password"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder={language === "vi" ? "Nhập mật khẩu" : language === "zh" ? "输入密码" : "Enter password"}
                required
                disabled={isLoading}
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                {getFieldIcon("password", formData.password)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {language === "vi" ? "Xác nhận mật khẩu" : language === "zh" ? "确认密码" : "Confirm Password"}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder={
                  language === "vi" ? "Nhập lại mật khẩu" : language === "zh" ? "再次输入密码" : "Confirm your password"
                }
                required
                disabled={isLoading}
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                {getFieldIcon("confirmPassword", formData.confirmPassword)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || Object.keys(validationErrors).length > 0}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "vi" ? "Đang đăng ký..." : language === "zh" ? "注册中..." : "Registering..."}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {language === "vi" ? "Đăng Ký" : language === "zh" ? "注册" : "Register"}
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {language === "vi" ? "Đã có tài khoản?" : language === "zh" ? "已有账户？" : "Already have an account?"}{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              {language === "vi" ? "Đăng nhập ngay" : language === "zh" ? "立即登录" : "Login now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
