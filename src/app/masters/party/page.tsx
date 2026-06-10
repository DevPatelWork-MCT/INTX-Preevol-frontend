"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { useEffect, useState } from "react";
import { usePartyApi } from "@/hooks/usePartyApi";
import { DataTable } from "@/components/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function PartyPage() {
  const { listParties, loading, error } = usePartyApi();
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    listParties()
      .then((data) => setParties(data))
      .catch(() => {});
  }, [listParties]);

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
        <Button className="m-4" variant="default">Add Party</Button>
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Parties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error loading parties</p>}
            <DataTable data={parties} />
            <Button className="mt-4">Add Party</Button>
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
