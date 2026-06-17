"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyApi } from "@/hooks/useCompanyApi";
import { useFinancialApi, type FinancialYearRow } from "@/hooks/useFinancialApi";
import { toast } from "sonner";

// ── Email regex matching VB.NET pattern ───────────────────────────
const emailRegex = /^[a-zA-Z0-9\._-]+@([a-zA-Z0-9_-]+\.)+([a-zA-Z]{2,3})$/

interface CompanyFormState {
  Name: string;
  Address: string;
  GSTIN: string;
  PANNo: string;
  Phone1: string;
  Phone2: string;
  state: string;
  Statecode: string;
  EmailID1: string;
  EmailID2: string;
  Website: string;
  VATno: string;
  CSTNo: string;
  ECCNo: string;
  IECCode: string;
  SupplyFrom: string;
  FinancialYear: string;
  StartDate: string;
  EndDate: string;
  SalesInvoiceStarts: string;
  ServiceInvoiceStarts: string;
  ProformaSalesInvoiceStarts: string;
  ProformaServiceInvoiceStarts: string;
  SalesInvoicePrefix: string;
  ServiceInvoicePrefix: string;
  ProformaSalesInvoicePrefix: string;
  ProformaServiceInvoicePrefix: string;
  QuotationStarts: string;
  QuotationPrefix: string;
  ProposalStarts: string;
  ProposalPrefix: string;
  ISOText: string;
  Loc: string;
  Pin: string;
  SignatureImage: string;
}

const emptyForm: CompanyFormState = {
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
  FinancialYear: "",
  StartDate: "",
  EndDate: "",
  SalesInvoiceStarts: "",
  ServiceInvoiceStarts: "",
  ProformaSalesInvoiceStarts: "",
  ProformaServiceInvoiceStarts: "",
  SalesInvoicePrefix: "",
  ServiceInvoicePrefix: "",
  ProformaSalesInvoicePrefix: "",
  ProformaServiceInvoicePrefix: "",
  QuotationStarts: "",
  QuotationPrefix: "",
  ProposalStarts: "",
  ProposalPrefix: "",
  ISOText: "",
  Loc: "",
  Pin: "",
  SignatureImage: "",
};

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = String(params.id);
  const { getCompany, updateCompany } = useCompanyApi();
  const { listFinancialYears } = useFinancialApi();

  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [financialYears, setFinancialYears] = useState<FinancialYearRow[]>([]);
  const [companyExists, setCompanyExists] = useState(false);

  // ── Load company data on mount ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCompany(companyId)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? res;
        if (data) {
          setCompanyExists(true);
          setForm({
            Name: data.Name ?? "",
            Address: data.Address ?? "",
            GSTIN: data.GSTIN ?? "",
            PANNo: data.PANNo ?? "",
            Phone1: data.Phone1 ?? "",
            Phone2: data.Phone2 ?? "",
            state: data.state ?? "",
            Statecode: data.Statecode != null ? String(data.Statecode) : "",
            EmailID1: data.EmailID1 ?? "",
            EmailID2: data.EmailID2 ?? "",
            Website: data.Website ?? "",
            VATno: data.VATno != null ? String(data.VATno) : "",
            CSTNo: data.CSTNo != null ? String(data.CSTNo) : "",
            ECCNo: data.ECCNo ?? "",
            IECCode: data.IECCode ?? "",
            SupplyFrom: data.SupplyFrom ?? "",
            FinancialYear: data.FinancialYear ?? "",
            StartDate: data.StartDate ? String(data.StartDate).slice(0, 10) : "",
            EndDate: data.EndDate ? String(data.EndDate).slice(0, 10) : "",
            SalesInvoiceStarts: data.SalesInvoiceStarts ?? "",
            ServiceInvoiceStarts: data.ServiceInvoiceStarts ?? "",
            ProformaSalesInvoiceStarts: data.ProformaSalesInvoiceStarts ?? "",
            ProformaServiceInvoiceStarts: data.ProformaServiceInvoiceStarts ?? "",
            SalesInvoicePrefix: data.SalesInvoicePrefix ?? "",
            ServiceInvoicePrefix: data.ServiceInvoicePrefix ?? "",
            ProformaSalesInvoicePrefix: data.ProformaSalesInvoicePrefix ?? "",
            ProformaServiceInvoicePrefix: data.ProformaServiceInvoicePrefix ?? "",
            QuotationStarts: data.QuotationStarts ?? "",
            QuotationPrefix: data.QuotationPrefix ?? "",
            ProposalStarts: data.ProposalStarts ?? "",
            ProposalPrefix: data.ProposalPrefix ?? "",
            ISOText: data.ISOText ?? "",
            Loc: data.Loc ?? "",
            Pin: data.Pin ?? "",
            SignatureImage: data.SignatureImage ?? "",
          });

          // Load financial years for this company
          const cId = data.CompanyID ?? Number(companyId);
          listFinancialYears(cId)
            .then((fyRes) => {
              if (cancelled) return;
              const fyData = Array.isArray(fyRes?.data) ? fyRes.data : [];
              setFinancialYears(fyData);
            })
            .catch(() => {});
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load company";
        setApiError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true };
  }, [companyId, getCompany, listFinancialYears]);

  // ── Handle form field changes ──────────────────────────────────
  const handleChange = (field: keyof CompanyFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ── Financial Year selection change → auto-fill (VB.NET behavior) ──
  const handleFinancialYearChange = useCallback((fyLabel: string) => {
    setForm((prev) => ({ ...prev, FinancialYear: fyLabel }));

    // Find the matching financial year record
    const fy = financialYears.find((f) => f.FinancialYear === fyLabel);
    if (fy) {
      // Auto-fill dates and invoice counters from FinancialSettings
      setForm((prev) => ({
        ...prev,
        FinancialYear: fyLabel,
        StartDate: fy.StartDate ? String(fy.StartDate).slice(0, 10) : prev.StartDate,
        EndDate: fy.EndDate ? String(fy.EndDate).slice(0, 10) : prev.EndDate,
        SalesInvoiceStarts: fy.SalesInvoiceCount ?? prev.SalesInvoiceStarts,
        ServiceInvoiceStarts: fy.ServiceInvoiceCount ?? prev.ServiceInvoiceStarts,
        ProformaSalesInvoiceStarts: fy.ProformaSalesInvoiceCount ?? prev.ProformaSalesInvoiceStarts,
        ProformaServiceInvoiceStarts: fy.ProformaServiceInvoiceCount ?? prev.ProformaServiceInvoiceStarts,
        QuotationStarts: fy.QuotationCount ?? prev.QuotationStarts,
        ProposalStarts: fy.ProposalCount ?? prev.ProposalStarts,
      }));
    }
  }, [financialYears]);

  // ── Field-level validations (matching VB.NET) ──────────────────
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "GSTIN":
        if (value && value.length !== 15) return "Please Enter Valid 15 Character GSTIN";
        return null;
      case "PANNo":
        if (value && value.length !== 10) return "Please Enter Valid 10 Character PAN No";
        return null;
      case "EmailID1":
        if (value && !emailRegex.test(value)) return "Not an Email! Enter Valid Email Address";
        return null;
      case "EmailID2":
        if (value && !emailRegex.test(value)) return "Not an Email! Enter Valid Email Address";
        return null;
      default:
        return null;
    }
  };

  // ── Full form validation (20 mandatory fields like VB.NET) ─────
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const mandatoryFields: (keyof CompanyFormState)[] = [
      "Name", "Phone1", "Address", "state", "Statecode",
      "EmailID1", "GSTIN", "PANNo", "SupplyFrom", "FinancialYear",
      "SalesInvoiceStarts", "ServiceInvoiceStarts",
      "ProformaSalesInvoiceStarts", "ProformaServiceInvoiceStarts",
      "SalesInvoicePrefix", "ServiceInvoicePrefix",
      "ProformaSalesInvoicePrefix", "ProformaServiceInvoicePrefix",
      "QuotationStarts", "QuotationPrefix",
    ];

    for (const f of mandatoryFields) {
      if (!form[f] || String(form[f]).trim() === "") {
        errors[f] = "This field is required";
      }
    }

    // Format validations
    const gstinErr = validateField("GSTIN", form.GSTIN);
    if (gstinErr) errors.GSTIN = gstinErr;

    const panErr = validateField("PANNo", form.PANNo);
    if (panErr) errors.PANNo = panErr;

    const email1Err = validateField("EmailID1", form.EmailID1);
    if (email1Err) errors.EmailID1 = email1Err;

    const email2Err = validateField("EmailID2", form.EmailID2);
    if (email2Err) errors.EmailID2 = email2Err;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit handler ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        Name: form.Name,
        Address: form.Address,
        GSTIN: form.GSTIN,
        PANNo: form.PANNo,
        Phone1: form.Phone1,
        state: form.state,
        Statecode: form.Statecode ? Number(form.Statecode) : undefined,
        EmailID1: form.EmailID1,
        SupplyFrom: form.SupplyFrom,
        FinancialYear: form.FinancialYear,
        SalesInvoiceStarts: form.SalesInvoiceStarts,
        ServiceInvoiceStarts: form.ServiceInvoiceStarts,
        ProformaSalesInvoiceStarts: form.ProformaSalesInvoiceStarts,
        ProformaServiceInvoiceStarts: form.ProformaServiceInvoiceStarts,
        SalesInvoicePrefix: form.SalesInvoicePrefix,
        ServiceInvoicePrefix: form.ServiceInvoicePrefix,
        ProformaSalesInvoicePrefix: form.ProformaSalesInvoicePrefix,
        ProformaServiceInvoicePrefix: form.ProformaServiceInvoicePrefix,
        QuotationStarts: form.QuotationStarts,
        QuotationPrefix: form.QuotationPrefix,
      };

      // Optional fields
      if (form.Phone2) payload.Phone2 = form.Phone2;
      if (form.EmailID2) payload.EmailID2 = form.EmailID2;
      if (form.Website) payload.Website = form.Website;
      if (form.VATno) payload.VATno = Number(form.VATno);
      if (form.CSTNo) payload.CSTNo = Number(form.CSTNo);
      if (form.ECCNo) payload.ECCNo = form.ECCNo;
      if (form.IECCode) payload.IECCode = form.IECCode;
      if (form.StartDate) payload.StartDate = new Date(form.StartDate).toISOString();
      if (form.EndDate) payload.EndDate = new Date(form.EndDate).toISOString();
      if (form.Loc) payload.Loc = form.Loc;
      if (form.Pin) payload.Pin = form.Pin;
      if (form.ISOText) payload.ISOText = form.ISOText;
      if (form.SignatureImage) payload.SignatureImage = form.SignatureImage;
      if (form.ProposalStarts) payload.ProposalStarts = form.ProposalStarts;
      if (form.ProposalPrefix) payload.ProposalPrefix = form.ProposalPrefix;

      await updateCompany(companyId, payload);
      toast.success("Company updated successfully");
      router.push("/masters/company");
    } catch (err: any) {
      console.error(err);
      // Handle duplicate name error from backend
      if (err?.message?.includes("Value Exist") || err?.message?.includes("unique")) {
        setFieldErrors((prev) => ({ ...prev, Name: "Value Exist! Enter Unique Value." }));
      }
      setApiError(err.message ?? "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading company data…</p>
        </div>
      </ProtectedLayout>
    );
  }

  if (!companyExists && !loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-20">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>Company not found.</AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    );
  }

  const fieldError = (field: string) => fieldErrors[field] ? (
    <p className="text-xs text-destructive mt-1">{fieldErrors[field]}</p>
  ) : null;

  return (
    <ProtectedLayout>
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-xl">Edit Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ── Section 1: Company Identity ─────────────────── */}
            <FieldSet>
              <FieldLegend>Company Details</FieldLegend>
              <FieldGroup className="@container/field-group grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="Name">Name *</FieldLabel>
                  <Input id="Name" required placeholder="Company Name" value={form.Name} onChange={handleChange("Name")} />
                  {fieldError("Name")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="Address">Address *</FieldLabel>
                  <Input id="Address" required placeholder="Address" value={form.Address} onChange={handleChange("Address")} />
                  {fieldError("Address")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="GSTIN">GSTIN * <span className="text-muted-foreground font-normal">(15 characters)</span></FieldLabel>
                  <Input id="GSTIN" required placeholder="GSTIN (15 chars)" maxLength={15} value={form.GSTIN} onChange={handleChange("GSTIN")} />
                  {fieldError("GSTIN")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="PANNo">PAN No * <span className="text-muted-foreground font-normal">(10 characters)</span></FieldLabel>
                  <Input id="PANNo" required placeholder="PAN No (10 chars)" maxLength={10} value={form.PANNo} onChange={handleChange("PANNo")} />
                  {fieldError("PANNo")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="Phone1">Phone 1 *</FieldLabel>
                  <Input id="Phone1" required placeholder="Phone 1" value={form.Phone1} onChange={handleChange("Phone1")} />
                  {fieldError("Phone1")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="Phone2">Phone 2</FieldLabel>
                  <Input id="Phone2" placeholder="Phone 2" value={form.Phone2} onChange={handleChange("Phone2")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">State *</FieldLabel>
                  <Input id="state" required placeholder="State" value={form.state} onChange={handleChange("state")} />
                  {fieldError("state")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="Statecode">State Code *</FieldLabel>
                  <Input id="Statecode" required placeholder="State Code" value={form.Statecode} onChange={handleChange("Statecode")} />
                  {fieldError("Statecode")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="SupplyFrom">Supply From *</FieldLabel>
                  <Input id="SupplyFrom" required placeholder="Supply From" value={form.SupplyFrom} onChange={handleChange("SupplyFrom")} />
                  {fieldError("SupplyFrom")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="EmailID1">Email 1 *</FieldLabel>
                  <Input id="EmailID1" required type="email" placeholder="Email 1" value={form.EmailID1} onChange={handleChange("EmailID1")} />
                  {fieldError("EmailID1")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="EmailID2">Email 2</FieldLabel>
                  <Input id="EmailID2" type="email" placeholder="Email 2" value={form.EmailID2} onChange={handleChange("EmailID2")} />
                  {fieldError("EmailID2")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="Website">Website</FieldLabel>
                  <Input id="Website" placeholder="Website" value={form.Website} onChange={handleChange("Website")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="Loc">Location</FieldLabel>
                  <Input id="Loc" placeholder="Location" value={form.Loc} onChange={handleChange("Loc")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="Pin">PIN Code</FieldLabel>
                  <Input id="Pin" placeholder="PIN Code" value={form.Pin} onChange={handleChange("Pin")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ISOText">ISO Text</FieldLabel>
                  <Input id="ISOText" placeholder="ISO Certification Text" value={form.ISOText} onChange={handleChange("ISOText")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <Separator className="my-4" />

            {/* ── Section 2: Tax & Legal ──────────────────────── */}
            <FieldSet>
              <FieldLegend>Tax & Legal Registration</FieldLegend>
              <FieldGroup className="@container/field-group grid gap-4 md:grid-cols-2">
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

            {/* ── Section 3: Financial Year ───────────────────── */}
            <FieldSet>
              <FieldLegend>Financial Year</FieldLegend>
              <FieldDescription>
                Select a financial year to auto-fill dates and invoice counters. Select &quot;-- Custom --&quot; to enter manually.
              </FieldDescription>
              <FieldGroup className="@container/field-group grid gap-4 md:grid-cols-3 mt-2">
                <Field>
                  <FieldLabel htmlFor="FinancialYear">Financial Year *</FieldLabel>
                  <Select value={form.FinancialYear} onValueChange={handleFinancialYearChange}>
                    <SelectTrigger id="FinancialYear">
                      <SelectValue placeholder="Select Financial Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__custom__">-- Custom --</SelectItem>
                      {financialYears.map((fy) => (
                        <SelectItem key={fy.FinancialYearID} value={fy.FinancialYear}>
                          {fy.FinancialYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("FinancialYear")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="StartDate">Start Date</FieldLabel>
                  <Input id="StartDate" type="date" value={form.StartDate} onChange={handleChange("StartDate")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="EndDate">End Date</FieldLabel>
                  <Input id="EndDate" type="date" value={form.EndDate} onChange={handleChange("EndDate")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <Separator className="my-4" />

            {/* ── Section 4: Invoice Numbering ────────────────── */}
            <FieldSet>
              <FieldLegend>Invoice Numbering</FieldLegend>
              <FieldDescription>Configure prefixes and starting numbers for each document type.</FieldDescription>
              <FieldGroup className="@container/field-group grid gap-4 md:grid-cols-2 mt-2">
                <Field>
                  <FieldLabel htmlFor="SalesInvoicePrefix">Sales Invoice Prefix *</FieldLabel>
                  <Input id="SalesInvoicePrefix" required placeholder="e.g., SI/" value={form.SalesInvoicePrefix} onChange={handleChange("SalesInvoicePrefix")} />
                  {fieldError("SalesInvoicePrefix")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="SalesInvoiceStarts">Sales Invoice Start No. *</FieldLabel>
                  <Input id="SalesInvoiceStarts" required placeholder="e.g., 1" value={form.SalesInvoiceStarts} onChange={handleChange("SalesInvoiceStarts")} />
                  {fieldError("SalesInvoiceStarts")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ServiceInvoicePrefix">Service Invoice Prefix *</FieldLabel>
                  <Input id="ServiceInvoicePrefix" required placeholder="e.g., SVI/" value={form.ServiceInvoicePrefix} onChange={handleChange("ServiceInvoicePrefix")} />
                  {fieldError("ServiceInvoicePrefix")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ServiceInvoiceStarts">Service Invoice Start No. *</FieldLabel>
                  <Input id="ServiceInvoiceStarts" required placeholder="e.g., 1" value={form.ServiceInvoiceStarts} onChange={handleChange("ServiceInvoiceStarts")} />
                  {fieldError("ServiceInvoiceStarts")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProformaSalesInvoicePrefix">Proforma Sales Prefix *</FieldLabel>
                  <Input id="ProformaSalesInvoicePrefix" required placeholder="e.g., PSI/" value={form.ProformaSalesInvoicePrefix} onChange={handleChange("ProformaSalesInvoicePrefix")} />
                  {fieldError("ProformaSalesInvoicePrefix")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProformaSalesInvoiceStarts">Proforma Sales Start No. *</FieldLabel>
                  <Input id="ProformaSalesInvoiceStarts" required placeholder="e.g., 1" value={form.ProformaSalesInvoiceStarts} onChange={handleChange("ProformaSalesInvoiceStarts")} />
                  {fieldError("ProformaSalesInvoiceStarts")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProformaServiceInvoicePrefix">Proforma Service Prefix *</FieldLabel>
                  <Input id="ProformaServiceInvoicePrefix" required placeholder="e.g., PVS/" value={form.ProformaServiceInvoicePrefix} onChange={handleChange("ProformaServiceInvoicePrefix")} />
                  {fieldError("ProformaServiceInvoicePrefix")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProformaServiceInvoiceStarts">Proforma Service Start No. *</FieldLabel>
                  <Input id="ProformaServiceInvoiceStarts" required placeholder="e.g., 1" value={form.ProformaServiceInvoiceStarts} onChange={handleChange("ProformaServiceInvoiceStarts")} />
                  {fieldError("ProformaServiceInvoiceStarts")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="QuotationPrefix">Quotation Prefix *</FieldLabel>
                  <Input id="QuotationPrefix" required placeholder="e.g., QT/" value={form.QuotationPrefix} onChange={handleChange("QuotationPrefix")} />
                  {fieldError("QuotationPrefix")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="QuotationStarts">Quotation Start No. *</FieldLabel>
                  <Input id="QuotationStarts" required placeholder="e.g., 1" value={form.QuotationStarts} onChange={handleChange("QuotationStarts")} />
                  {fieldError("QuotationStarts")}
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProposalPrefix">Proposal Prefix</FieldLabel>
                  <Input id="ProposalPrefix" placeholder="e.g., PR/" value={form.ProposalPrefix} onChange={handleChange("ProposalPrefix")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ProposalStarts">Proposal Start No.</FieldLabel>
                  <Input id="ProposalStarts" placeholder="e.g., 1" value={form.ProposalStarts} onChange={handleChange("ProposalStarts")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <Separator className="my-4" />

            {/* ── Error banner ───────────────────────────────── */}
            {apiError && (
              <div className="flex justify-center">
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

            {/* ── Action buttons ────────────────────────────── */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ProtectedLayout>
  );
}
