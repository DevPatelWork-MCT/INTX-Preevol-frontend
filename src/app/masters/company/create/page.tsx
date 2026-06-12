"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
// Removed unused Label import; using shadcn Field components instead.
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import { useCompanyApi } from "@/hooks/useCompanyApi";

/**
 * Page for creating a new company.
 * Fields are based on the OpenAPI schema `CreateCompanyRequest`.
 */
export default function CreateCompanyPage() {
  const router = useRouter();
  const { createCompany } = useCompanyApi();
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState({
    Name: "",
    Address: "",
    GSTIN: "",
    PANNo: "",
    Phone1: "",
    Phone2: "",
    state: "",
    Statecode: "",
    EmailID1: "",
    EmailID2: "",
    Website: "",
    VATno: "",
    CSTNo: "",
    ECCNo: "",
    IECCode: "",
    SupplyFrom: "",
    Loc: "",
    Pin: "",
    SignatureImage: "",
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert numeric fields to numbers as backend expects integers
      const payload = {
        ...form,
        Statecode: form.Statecode ? Number(form.Statecode) : undefined,
        VATno: form.VATno ? Number(form.VATno) : undefined,
        CSTNo: form.CSTNo ? Number(form.CSTNo) : undefined,
      };
      await createCompany(payload);
      router.push("/masters/company");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message ?? "An unexpected error occurred");
    }
  };

  return (
    <ProtectedLayout>
      <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-xl">Create New Company</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <FieldSet>
                <FieldLegend>Company Details</FieldLegend>
                <FieldGroup className="@container/field-group grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="Name">Name *</FieldLabel>
                    <Input id="Name" required placeholder="Name" value={form.Name} onChange={handleChange("Name")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="Address">Address</FieldLabel>
                    <Input id="Address" placeholder="Address" value={form.Address} onChange={handleChange("Address")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="GSTIN">GSTIN</FieldLabel>
                    <Input id="GSTIN" placeholder="GSTIN" value={form.GSTIN} onChange={handleChange("GSTIN")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="PANNo">PAN No</FieldLabel>
                    <Input id="PANNo" placeholder="PAN No" value={form.PANNo} onChange={handleChange("PANNo")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="Phone1">Phone 1</FieldLabel>
                    <Input id="Phone1" placeholder="Phone 1" value={form.Phone1} onChange={handleChange("Phone1")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="Phone2">Phone 2</FieldLabel>
                    <Input id="Phone2" placeholder="Phone 2" value={form.Phone2} onChange={handleChange("Phone2")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="state">State *</FieldLabel>
                    <Input id="state" required placeholder="State" value={form.state} onChange={handleChange("state")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="Statecode">State Code *</FieldLabel>
                    <Input id="Statecode" required placeholder="State Code" value={form.Statecode} onChange={handleChange("Statecode")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="SupplyFrom">Supply From *</FieldLabel>
                    <Input id="SupplyFrom" required placeholder="Supply From" value={form.SupplyFrom} onChange={handleChange("SupplyFrom")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="EmailID1">Email 1 *</FieldLabel>
                    <Input id="EmailID1" required placeholder="Email 1" value={form.EmailID1} onChange={handleChange("EmailID1")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="EmailID2">Email 2</FieldLabel>
                    <Input id="EmailID2" placeholder="Email 2" value={form.EmailID2} onChange={handleChange("EmailID2")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="Website">Website</FieldLabel>
                    <Input id="Website" placeholder="Website" value={form.Website} onChange={handleChange("Website")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="VATno">VAT No</FieldLabel>
                    <Input id="VATno" placeholder="VAT No" value={form.VATno} onChange={handleChange("VATno")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="CSTNo">CST No</FieldLabel>
                    <Input id="CSTNo" placeholder="CST No" value={form.CSTNo} onChange={handleChange("CSTNo")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ECCNo">ECC No</FieldLabel>
                    <Input id="ECCNo" placeholder="ECC No" value={form.ECCNo} onChange={handleChange("ECCNo")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="IECCode">IEC Code</FieldLabel>
                    <Input id="IECCode" placeholder="IEC Code" value={form.IECCode} onChange={handleChange("IECCode")} />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Separator className="my-4" />
              {apiError && (
                <div className="flex justify-center mb-4">
                  <Alert variant="destructive" className="relative max-w-md w-full">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{apiError}</AlertDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setApiError(null)}
                    >
                      ✕
                    </Button>
                  </Alert>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </ProtectedLayout>
  );
}
