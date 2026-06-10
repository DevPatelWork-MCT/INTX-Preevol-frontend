"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { useEffect, useState } from "react";
import { useCompanyApi } from "@/hooks/useCompanyApi";
import { DataTable } from "@/components/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function CompanyPage() {
  const { listCompanies, loading, error } = useCompanyApi();
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    listCompanies()
      .then((data) => setCompanies(data))
      .catch(() => {});
  }, [listCompanies]);

  return (
    <SidebarProvider
        style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error loading companies</p>}
            <DataTable data={companies} />
            <Button className="mt-4">Add Company</Button>
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
