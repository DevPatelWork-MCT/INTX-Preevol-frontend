"use client"

import { ProtectedLayout } from "@/components/protected-layout"

export default function ProformaInvoicePage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Proforma Invoice</h1>
        <p className="text-muted-foreground">Create preliminary invoices for customer approval before final billing.</p>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Proforma Invoice creation form coming soon.</p>
          <p className="text-sm text-muted-foreground mt-2">This will use the same structure as the Sales Invoice but marked as &quot;Proforma&quot;.</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
