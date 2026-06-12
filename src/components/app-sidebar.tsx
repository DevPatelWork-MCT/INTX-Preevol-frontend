"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { CompanySwitcher } from "@/components/company-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  IconFrame,
  IconChartPie,
  IconMap,
  IconChartBar,
  IconShoppingCart,
  IconCategory,
  IconBox,
  IconUserPlus,
  IconDashboard,
  IconFileDollar,
  IconReport,
} from "@tabler/icons-react"

const data = {
  user: {
    name: "User",
    email: "user@preevol.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <IconDashboard />,
    },
    {
      title: "Quotation",
      url: "/quotation",
      icon: <IconFileDollar />,
      items: [
        { title: "Create Quotation", url: "/quotation/create" },
        { title: "All Quotations", url: "/quotation" },
      ],
    },
    {
      title: "Sales",
      url: "/sales",
      icon: <IconChartBar />,
      items: [
        { title: "Invoice", url: "/sales/invoice" },
        { title: "Proforma Invoice", url: "/sales/proforma-invoice" },
        { title: "Clients", url: "/sales/client" },
        { title: "Sales Report", url: "/reports/sales" },
      ],
    },
    {
      title: "Purchase",
      url: "/purchase",
      icon: <IconShoppingCart />,
      items: [
        { title: "Vendors", url: "/purchase/vendor" },
        { title: "Purchase Products", url: "/purchase/products" },
        { title: "Purchase Orders", url: "/purchase/orders" },
        { title: "Work Orders", url: "/purchase/work-orders" },
      ],
    },
    {
      title: "Masters",
      url: "/masters",
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
      url: "/inventory",
      icon: <IconBox />,
      items: [
        { title: "Goods", url: "/inventory/goods" },
        { title: "Stock Management", url: "/inventory/stock" },
        { title: "Stock Report", url: "/reports/stock" },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: <IconReport />,
      items: [
        { title: "Sales Report", url: "/reports/sales" },
        { title: "Service Report", url: "/reports/service" },
        { title: "Stock Report", url: "/reports/stock" },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: <IconUserPlus />,
      items: [
        { title: "Users", url: "/admin/users" },
        { title: "Roles", url: "/admin/roles" },
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
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
