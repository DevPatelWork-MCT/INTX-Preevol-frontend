"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserProvider } from "@/contexts/user-context"
import { CompanyProvider } from "@/contexts/company-context"
import { useUser } from "@/contexts/user-context"

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CompanyProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col overflow-x-auto overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </CompanyProvider>
  )
}

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ProtectedContent>{children}</ProtectedContent>
    </UserProvider>
  )
}
