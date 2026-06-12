"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INDIAN_STATES } from "@/lib/indian-states"

interface StateCodeSelectProps {
  value?: string | number | null
  onChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export function StateCodeSelect({ value, onChange, placeholder = "Select state", disabled }: StateCodeSelectProps) {
  const handleValueChange = (val: string) => {
    if (val === "" || val === "none") {
      onChange?.(null)
    } else {
      onChange?.(Number(val))
    }
  }

  const currentValue = value !== null && value !== undefined && value !== "" ? String(value) : ""

  return (
    <Select value={currentValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {INDIAN_STATES.map((state) => (
          <SelectItem key={state.code} value={String(state.code)}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
