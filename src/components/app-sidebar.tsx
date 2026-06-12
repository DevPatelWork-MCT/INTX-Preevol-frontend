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
import { IconLayoutCollage,IconFrame, IconChartPie, IconMap, IconFileInvoice, IconChartBar, IconShoppingCart, IconCategory, IconBox, IconUserPlus } from "@tabler/icons-react"
import { useUser } from "@/contexts/user-context"

const data = {
  navMain: [
    {
      title: "Sales",
      url: "#",
      icon: <IconChartBar />,
      items: [
        { title: "Proforma Invoice", url: "/sales/proforma-invoice" },
        { title: "Client", url: "/sales/client" },
        { title: "Invoice", url: "/sales/invoice" },
        { title: "Report", url: "/reports/sales" },
      ],
    },
    {
      title: "Purchase",
      url: "#",
      icon: <IconShoppingCart />,
      items: [
        { title: "Vendor", url: "/purchase/vendor" },
        { title: "Purchase Order", url: "/purchase/orders" },
      ],
    },
    {
      title: "Masters",
      url: "#",
      icon: <IconCategory />,
      items: [
        { title: "Company", url: "/masters/company" },
        { title: "Party", url: "/masters/party" },
        { title: "Bank", url: "/masters/bank" },
        { title: "Category", url: "/masters/category" },
        { title: "Sub Category", url: "/masters/sub-category" },
        { title: "Product", url: "/masters/product" },
        { title: "Type", url: "/masters/type" },
        { title: "Model", url: "/masters/model" },
        { title: "Plunger Diameter", url: "/masters/plunger-diameter" },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: <IconBox />,
      items: [
        { title: "Goods", url: "/inventory/goods" },
        { title: "Stock", url: "/inventory/stock" },
        { title: "Stock Report", url: "/reports/stock" },
      ],
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: <IconUserPlus />,
      items: [],
    },
  ],
  projects: [
        {
      name: "Dashboard",
      url: "/dashboard",
      icon: <IconLayoutCollage />,
    },
    {
      name: "Quotation",
      url: "/quotation",
      icon: <IconFileInvoice />,
    },
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
  const { user } = useUser()

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "Guest"

  const navUser = {
    name: displayName,
    email: user?.email || "",
    avatar: user?.profilePicture || user?.avatar || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
