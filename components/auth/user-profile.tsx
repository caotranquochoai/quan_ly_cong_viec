"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, LogOut, Shield, Calendar, Clock, X, Settings, Mail, Check, AlertCircle } from "lucide-react"
import type { Language } from "@/lib/types"
import type { User as UserType } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTranslation, formatDate } from "@/lib/i18n"
import UserSettingsModal from "./user-settings-modal"
import { updateUserProfile } from "@/lib/user-api"

interface UserProfileProps {
  user: UserType
  onLogout: () => void
  onUserUpdate: (updatedUser: UserType) => void
  language: Language
}

export default function UserProfile({ user, onLogout, onUserUpdate, language }: UserProfileProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const t = useTranslation(language)

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        buttonRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showProfile])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showProfile])

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return language === "vi" ? "Quản trị viên" : language === "zh" ? "管理员" : "Administrator"
      case "user":
      default:
        return language === "vi" ? "Người dùng" : language === "zh" ? "用户" : "User"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  const handleToggleProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowProfile(!showProfile)
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowProfile(false)
    onLogout()
  }

  const handleCloseProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowProfile(false)
  }

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowProfile(false)
    setShowSettings(true)
  }

  const handleUserUpdate = async (updates: any) => {
    try {
      const result = await updateUserProfile(updates)
      if (result.success && result.user) {
        onUserUpdate(result.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update user:", error)
      return false
    }
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={handleToggleProfile}
        className="relative"
        aria-label="User profile"
      >
        <User className="h-5 w-5" />
      </Button>

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card ref={profileRef} className="w-full max-w-md mx-auto relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseProfile}
              className="absolute right-2 top-2 z-10"
              aria-label="Close profile"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl break-words">{user.username}</CardTitle>
              <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(user.role)}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {language === "vi" ? "Tên đăng nhập" : language === "zh" ? "用户名" : "Username"}
                    </p>
                    <p className="text-sm text-muted-foreground break-words">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">📧</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground break-words">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {language === "vi" ? "Ngày tạo tài khoản" : language === "zh" ? "注册日期" : "Member Since"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(
                        typeof user.created_at === "string" ? user.created_at : user.created_at,
                        language,
                        "short",
                      )}
                    </p>
                  </div>
                </div>

                {user.last_login && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {language === "vi" ? "Lần đăng nhập cuối" : language === "zh" ? "最后登录" : "Last Login"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          typeof user.last_login === "string" ? user.last_login : user.last_login,
                          language,
                          "full",
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Notifications</span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={!!user.email_notifications}
                    onCheckedChange={(checked) => handleUserUpdate({ email_notifications: checked ? 1 : 0 })}
                    disabled={!user.email_verified}
                  />
                </div>
                {!user.email_verified && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Please verify your email to enable notifications.</span>
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Resend verification
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button onClick={handleOpenSettings} variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  {language === "vi" ? "Cài đặt" : language === "zh" ? "设置" : "Settings"}
                </Button>

                <div className="flex gap-2">
                  <Button onClick={handleLogout} variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Đăng xuất" : language === "zh" ? "退出登录" : "Logout"}
                  </Button>
                  <Button onClick={handleCloseProfile} variant="outline">
                    {language === "vi" ? "Đóng" : language === "zh" ? "关闭" : "Close"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showSettings && (
        <UserSettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUserUpdate}
          language={language}
        />
      )}
    </>
  )
}
