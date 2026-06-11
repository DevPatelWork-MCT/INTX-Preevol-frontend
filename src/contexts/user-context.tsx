"use client"

import * as React from "react"
import { fetchCurrentUser, clearAuthToken, apiRequest } from "@/lib/apiClient"

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  accountStatus: string
  isAdmin: boolean
  role: { roleId: number; roleName: string } | null
}

interface UserContextType {
  user: UserInfo | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const UserContext = React.createContext<UserContextType | null>(null)

// JWT expiry is 7 days. Refresh silently at 6 days (85% of lifetime).
const TOKEN_REFRESH_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000 // 6 days

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Silent token refresh — calls /me to validate and get fresh user info.
  // If the token is expired, the backend returns 401 and we clear the cookie.
  const refreshUser = React.useCallback(async () => {
    try {
      const data = await fetchCurrentUser()
      if (data) {
        setUser(data)
        return true
      } else {
        setUser(null)
        return false
      }
    } catch {
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Schedule the next silent refresh
  const scheduleNextRefresh = React.useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }
    refreshTimerRef.current = setTimeout(async () => {
      const success = await refreshUser()
      if (success) {
        scheduleNextRefresh() // Keep the cycle going
      }
    }, TOKEN_REFRESH_INTERVAL_MS)
  }, [refreshUser])

  // Auto-login on mount + start refresh cycle
  React.useEffect(() => {
    refreshUser().then((success) => {
      if (success) {
        scheduleNextRefresh()
      }
    })
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [refreshUser, scheduleNextRefresh])

  // Also refresh when user becomes active after being idle
  // This handles the case where the user leaves the tab open for a long time
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab became visible again — silently check if token is still valid
        refreshUser()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [refreshUser])

  const logout = React.useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }
    clearAuthToken()
    setUser(null)
    // Only redirect if not already on login page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = React.useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
