"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Loader2, Lock } from "lucide-react"
import type { Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface AdminLoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>
  language: Language
  isLoading: boolean
  error: string | null
}

export default function AdminLoginForm({ onLogin, language, isLoading, error }: AdminLoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const t = useTranslation(language)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.username.trim()) {
      errors.username =
        language === "vi"
          ? "Tên đăng nhập không được để trống"
          : language === "zh"
            ? "用户名不能为空"
            : "Username is required"
    } else if (formData.username.length < 3) {
      errors.username =
        language === "vi"
          ? "Tên đăng nhập phải có ít nhất 3 ký tự"
          : language === "zh"
            ? "用户名至少需要3个字符"
            : "Username must be at least 3 characters"
    }

    if (!formData.password.trim()) {
      errors.password =
        language === "vi" ? "Mật khẩu không được để trống" : language === "zh" ? "密码不能为空" : "Password is required"
    } else if (formData.password.length < 3) {
      errors.password =
        language === "vi"
          ? "Mật khẩu phải có ít nhất 3 ký tự"
          : language === "zh"
            ? "密码至少需要3个字符"
            : "Password must be at least 3 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await onLogin(formData.username.trim(), formData.password)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {language === "vi" ? "Đăng Nhập Quản Trị" : language === "zh" ? "管理员登录" : "Admin Login"}
            </CardTitle>
            <p className="text-slate-400 text-sm">
              {language === "vi"
                ? "Truy cập bảng điều khiển quản trị"
                : language === "zh"
                  ? "访问管理控制面板"
                  : "Access the admin control panel"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                  <Lock className="h-4 w-4" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">
                  {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder={
                    language === "vi"
                      ? "Nhập tên đăng nhập quản trị"
                      : language === "zh"
                        ? "输入管理员用户名"
                        : "Enter admin username"
                  }
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                />
                {validationErrors.username && <p className="text-sm text-red-400">{validationErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  {language === "vi" ? "Mật khẩu" : language === "zh" ? "密码" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={
                      language === "vi"
                        ? "Nhập mật khẩu quản trị"
                        : language === "zh"
                          ? "输入管理员密码"
                          : "Enter admin password"
                    }
                    required
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-400">{validationErrors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "vi" ? "Đang đăng nhập..." : language === "zh" ? "登录中..." : "Logging in..."}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Đăng Nhập" : language === "zh" ? "登录" : "Login"}
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-slate-400 mt-4">
                {language === "vi"
                  ? "Chỉ dành cho quản trị viên được ủy quyền"
                  : language === "zh"
                    ? "仅限授权管理员使用"
                    : "For authorized administrators only"}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
