import { ProtectedLayout } from "@/components/protected-layout";

export default function QuotationPage() {
  return (
    <ProtectedLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Quotation</h1>
        <p className="text-muted-foreground">Create and manage quotations.</p>
      </div>
    </ProtectedLayout>
  );
}
