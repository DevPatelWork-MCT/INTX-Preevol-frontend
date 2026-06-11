"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconBuildingBank,
  IconPlus,
  IconPencil,
  IconX,
} from "@tabler/icons-react"
import { useBankApi } from "@/hooks/useBankApi"
import { useCompany } from "@/contexts/company-context"
import { IconBuilding, IconAlertTriangle } from "@tabler/icons-react"

interface BankDialogProps {
  bank: { BankID: number; BankName: string | null; AccountNo: string | null; IFSCCode: string | null; SwiftCode: string | null; Company: string | null; CompanyID: number | null } | null
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

export function BankDialog({ bank, open, onClose, onRefresh }: BankDialogProps) {
  const { createBank, updateBank, loading } = useBankApi()
  const { selectedCompany } = useCompany()
  const isEditing = !!bank

  const [bankName, setBankName] = React.useState("")
  const [accountNo, setAccountNo] = React.useState("")
  const [ifscCode, setIfscCode] = React.useState("")
  const [swiftCode, setSwiftCode] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")

  React.useEffect(() => {
    if (open) {
      if (bank) {
        setBankName(bank.BankName ?? "")
        setAccountNo(bank.AccountNo ?? "")
        setIfscCode(bank.IFSCCode ?? "")
        setSwiftCode(bank.SwiftCode ?? "")
        setCompanyName(bank.Company ?? "")
      } else {
        setBankName("")
        setAccountNo("")
        setIfscCode("")
        setSwiftCode("")
        setCompanyName(selectedCompany?.Name ?? "")
      }
    }
  }, [open, bank, selectedCompany])

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      toast.error("Bank name is required")
      return
    }
    if (!companyName.trim()) {
      toast.error("Please select a company first. Switch company from the sidebar.")
      return
    }
    try {
      const payload = {
        BankName: bankName.trim(),
        AccountNo: accountNo.trim() || undefined,
        IFSCCode: ifscCode.trim() || undefined,
        SwiftCode: swiftCode.trim() || undefined,
        Company: companyName.trim() || undefined,
      }
      if (isEditing && bank) {
        await updateBank(String(bank.BankID), payload)
        toast.success("Bank updated")
      } else {
        await createBank(payload)
        toast.success("Bank created")
      }
      onClose()
      onRefresh()
    } catch {
      toast.error(isEditing ? "Failed to update bank" : "Failed to create bank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <IconPencil className="h-5 w-5 text-primary" /> : <IconPlus className="h-5 w-5 text-primary" />}
            {isEditing ? "Edit Bank" : "Add New Bank"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update bank account details" : "Add a new bank account to your masters"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="bank-name" className="text-xs">Bank Name *</Label>
            <Input
              id="bank-name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="h-9 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bank-account" className="text-xs">Account Number</Label>
            <Input
              id="bank-account"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder="e.g. 1234567890"
              className="h-9 mt-1 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bank-ifsc" className="text-xs">IFSC Code</Label>
              <Input
                id="bank-ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="h-9 mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="bank-swift" className="text-xs">SWIFT Code</Label>
              <Input
                id="bank-swift"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFCINBB"
                className="h-9 mt-1 font-mono"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bank-company" className="text-xs">Company Name</Label>
            <Input
              id="bank-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. ABC Pvt Ltd"
              className="h-9 mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="gap-1">
            <IconX className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-1">
            {isEditing ? <IconPencil className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
            {isEditing ? "Save Changes" : "Add Bank"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
