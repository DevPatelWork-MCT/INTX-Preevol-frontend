"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconFileInvoice } from "@tabler/icons-react"

export default function ProformaInvoicePage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

            {/* Header */}
            <Card className="mx-4 lg:mx-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <IconFileInvoice className="h-5 w-5" /> Proforma Invoice
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create preliminary invoices for customer approval before final billing
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Placeholder */}
            <Card className="mx-4 lg:mx-6">
              <CardContent className="p-12 text-center">
                <IconFileInvoice className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Proforma Invoice creation form coming soon.</p>
                <p className="text-sm text-muted-foreground mt-2">This will use the same structure as the Sales Invoice but marked as &quot;Proforma&quot;.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
