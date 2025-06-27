"use client"

import { useState, useEffect } from "react"
import { loginAdmin, isAdminLoggedIn, getCurrentAdmin, logoutAdmin } from "@/lib/admin-auth"
import type { AdminUser } from "@/lib/admin-auth"
import type { Language } from "@/lib/types"
import AdminLoginForm from "@/components/admin/admin-login-form"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Check if admin is already logged in
    if (isAdminLoggedIn()) {
      const currentAdmin = getCurrentAdmin()
      setAdmin(currentAdmin)
    }
    setIsInitializing(false)

    // Load saved language
    const savedLanguage = localStorage.getItem("admin-language") as Language
    if (savedLanguage && ["en", "vi", "zh"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleLogin = async (username: string, password: string) => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      const result = await loginAdmin(username, password)

      if (result.success && result.admin && result.token) {
        localStorage.setItem("admin-token", result.token)
        setAdmin(result.admin)
      } else {
        setAuthError(result.message)
      }
    } catch (error) {
      setAuthError("Login failed. Please try again.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    setAdmin(null)
    setAuthError(null)
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("admin-language", newLanguage)
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Show login form if admin is not logged in
  if (!admin) {
    return <AdminLoginForm onLogin={handleLogin} language={language} isLoading={authLoading} error={authError} />
  }

  // Show admin dashboard if logged in
  return (
    <AdminDashboard admin={admin} onLogout={handleLogout} language={language} onLanguageChange={handleLanguageChange} />
  )
}
