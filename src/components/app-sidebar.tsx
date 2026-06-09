"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { IconLayoutRows, IconWaveSine, IconCommand, IconFrame, IconChartPie, IconMap, IconFileInvoice, IconChartBar, IconShoppingCart, IconCategory, IconUserPlus, IconLogout, IconBox } from "@tabler/icons-react"

// Theme toggle component
import { ThemeToggle } from "@/components/ui/theme-toggle"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <IconLayoutRows
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <IconWaveSine
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <IconCommand
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    // New sections added per user request
    {
      title: "Quotation",
      url: "#",
      icon: <IconFileInvoice />, // quotation icon
      items: [],
    },
    {
      title: "Sales",
      url: "#",
      icon: <IconChartBar />, // sales icon
      items: [
        { title: "Profoma Invoice", url: "#" },
        { title: "Client", url: "#" },
        { title: "Invoice", url: "#" },
        { title: "Report", url: "#" },
      ],
    },
    {
      title: "Purchase",
      url: "#",
      icon: <IconShoppingCart />, // purchase icon
      items: [
        { title: "Vendor", url: "#" },
        { title: "Purchase Product", url: "#" },
        { title: "Purchase Order", url: "#" },
        { title: "Work Order", url: "#" },
      ],
    },
    {
      title: "Masters",
      url: "#",
      icon: <IconCategory />, // masters icon
      items: [
        { title: "Category", url: "#" },
        { title: "Sub Category", url: "#" },
        { title: "Product", url: "#" },
        { title: "Company Profile", url: "#" },
        { title: "Bank", url: "#" },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: <IconBox />, // inventory icon
      items: [
        { title: "Type", url: "#" },
        { title: "Model", url: "#" },
        { title: "Plunger Diameter", url: "#" },
        { title: "Goods", url: "#" },
        { title: "Inventory", url: "#" },
        { title: "Stock Report", url: "#" },
      ],
    },
    {
      title: "User Create",
      url: "#",
      icon: <IconUserPlus />, // user create icon
      items: [],
    },
    {
      title: "Close",
      url: "#",
      icon: <IconLogout />, // close icon
      items: [
        { title: "Change Company", url: "#" },
        { title: "Backup", url: "#" },
        { title: "Exit", url: "#" },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <IconFrame
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <IconChartPie
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <IconMap
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* Theme toggle */}
        <ThemeToggle />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
