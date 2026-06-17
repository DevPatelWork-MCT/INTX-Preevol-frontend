"use client"

import * as React from "react"
import Link from "next/link"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconFileInvoice, IconArrowLeft, IconPlus } from "@tabler/icons-react"

export default function ProformaInvoicePage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/sales"><IconArrowLeft className="h-4 w-4" /></Link>
                  </Button>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <IconFileInvoice className="h-5 w-5" /> Proforma Invoices
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create preliminary invoices for customer approval
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/sales/proforma-invoice/create">
                    <IconPlus className="mr-2 h-4 w-4" /> New Proforma
                  </Link>
                </Button>
              </CardHeader>
            </Card>
            <Card className="mx-4 lg:mx-6">
              <CardContent className="p-12 text-center">
                <IconFileInvoice className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Proforma invoice list coming soon.</p>
                <p className="text-sm text-muted-foreground mt-2">Use the Sales Invoice form and select &quot;Proforma Invoice&quot; as the type.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
