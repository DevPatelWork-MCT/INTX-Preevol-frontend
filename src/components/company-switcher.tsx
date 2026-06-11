"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { IconBuilding, IconSelector, IconLoader } from "@tabler/icons-react"
import { useCompany } from "@/contexts/company-context"

export function CompanySwitcher() {
  const { isMobile } = useSidebar()
  const { selectedCompany, companies, loading, selectCompany } = useCompany()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconBuilding className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {loading ? (
                  <span className="truncate text-xs text-muted-foreground">Loading…</span>
                ) : selectedCompany ? (
                  <>
                    <span className="truncate font-medium">{selectedCompany.Name}</span>
                    <span className="truncate text-xs text-muted-foreground">Company</span>
                  </>
                ) : (
                  <span className="truncate text-xs text-muted-foreground">Select company</span>
                )}
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[200px]"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Company
            </DropdownMenuLabel>
            {loading && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <IconLoader className="h-4 w-4 animate-spin" />
              </div>
            )}
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.CompanyID}
                onClick={() => selectCompany(company)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <IconBuilding className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 truncate">{company.Name}</span>
                {selectedCompany?.CompanyID === company.CompanyID && (
                  <span className="text-xs text-primary font-medium">Active</span>
                )}
              </DropdownMenuItem>
            ))}
            {companies.length === 0 && !loading && (
              <div className="py-3 text-center text-xs text-muted-foreground">
                No companies found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
