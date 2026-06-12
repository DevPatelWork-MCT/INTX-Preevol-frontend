"use client"

import * as React from "react"
import { fetchCurrentUser, clearAuthToken } from "@/lib/apiClient"

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  accountStatus: string
  isAdmin: boolean
  avatar: string | null
  profilePicture: string | null
  role: { roleId: number; roleName: string } | null
}

interface UserContextType {
  user: UserInfo | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const UserContext = React.createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserInfo | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refreshUser = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCurrentUser()
      if (data) {
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-login on mount
  React.useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const logout = React.useCallback(() => {
    clearAuthToken()
    setUser(null)
    if (typeof window !== "undefined") {
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
