use client

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default function DemoPage() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <AppSidebar />
      </div>
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Current Path: {pathname}</h1>
      </div>
    </div>
  );
}
