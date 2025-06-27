"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import type { Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface LoginFormProps {
  onLogin: (usernameOrEmail: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
  language: Language
  isLoading: boolean
  error: string | null
}

export default function LoginForm({ onLogin, onSwitchToRegister, language, isLoading, error }: LoginFormProps) {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const t = useTranslation(language)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.usernameOrEmail || !formData.password) return
    await onLogin(formData.usernameOrEmail, formData.password)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          <LogIn className="h-6 w-6 inline mr-2" />
          {language === "vi" ? "Đăng Nhập" : language === "zh" ? "登录" : "Login"}
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
            <Label htmlFor="usernameOrEmail">
              {language === "vi"
                ? "Tên đăng nhập hoặc Email"
                : language === "zh"
                  ? "用户名或邮箱"
                  : "Username or Email"}
            </Label>
            <Input
              id="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              placeholder={
                language === "vi"
                  ? "Nhập tên đăng nhập hoặc email"
                  : language === "zh"
                    ? "输入用户名或邮箱"
                    : "Enter username or email"
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{language === "vi" ? "Mật khẩu" : language === "zh" ? "密码" : "Password"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={language === "vi" ? "Nhập mật khẩu" : language === "zh" ? "输入密码" : "Enter password"}
                required
                disabled={isLoading}
              />
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
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "vi" ? "Đang đăng nhập..." : language === "zh" ? "登录中..." : "Logging in..."}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                {language === "vi" ? "Đăng Nhập" : language === "zh" ? "登录" : "Login"}
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {language === "vi" ? "Chưa có tài khoản?" : language === "zh" ? "还没有账户？" : "Don't have an account?"}{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              {language === "vi" ? "Đăng ký ngay" : language === "zh" ? "立即注册" : "Register now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
