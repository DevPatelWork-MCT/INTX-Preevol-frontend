export interface IndianState {
  code: number
  name: string
  label: string
}

export const INDIAN_STATES: IndianState[] = [
  { code: 1, name: "Jammu & Kashmir", label: "1 - Jammu & Kashmir" },
  { code: 2, name: "Himachal Pradesh", label: "2 - Himachal Pradesh" },
  { code: 3, name: "Punjab", label: "3 - Punjab" },
  { code: 4, name: "Chandigarh", label: "4 - Chandigarh" },
  { code: 5, name: "Uttarakhand", label: "5 - Uttarakhand" },
  { code: 6, name: "Haryana", label: "6 - Haryana" },
  { code: 7, name: "Delhi", label: "7 - Delhi" },
  { code: 8, name: "Rajasthan", label: "8 - Rajasthan" },
  { code: 9, name: "Uttar Pradesh", label: "9 - Uttar Pradesh" },
  { code: 10, name: "Bihar", label: "10 - Bihar" },
  { code: 11, name: "Sikkim", label: "11 - Sikkim" },
  { code: 12, name: "Arunachal Pradesh", label: "12 - Arunachal Pradesh" },
  { code: 13, name: "Nagaland", label: "13 - Nagaland" },
  { code: 14, name: "Manipur", label: "14 - Manipur" },
  { code: 15, name: "Mizoram", label: "15 - Mizoram" },
  { code: 16, name: "Tripura", label: "16 - Tripura" },
  { code: 17, name: "Meghalaya", label: "17 - Meghalaya" },
  { code: 18, name: "Assam", label: "18 - Assam" },
  { code: 19, name: "West Bengal", label: "19 - West Bengal" },
  { code: 20, name: "Jharkhand", label: "20 - Jharkhand" },
  { code: 21, name: "Odisha", label: "21 - Odisha" },
  { code: 22, name: "Chhattisgarh", label: "22 - Chhattisgarh" },
  { code: 23, name: "Madhya Pradesh", label: "23 - Madhya Pradesh" },
  { code: 24, name: "Gujarat", label: "24 - Gujarat" },
  { code: 25, name: "Daman & Diu", label: "25 - Daman & Diu" },
  { code: 26, name: "Dadra & Nagar Haveli", label: "26 - Dadra & Nagar Haveli" },
  { code: 27, name: "Maharashtra", label: "27 - Maharashtra" },
  { code: 28, name: "Andhra Pradesh", label: "28 - Andhra Pradesh" },
  { code: 29, name: "Karnataka", label: "29 - Karnataka" },
  { code: 30, name: "Goa", label: "30 - Goa" },
  { code: 31, name: "Lakshadweep", label: "31 - Lakshadweep" },
  { code: 32, name: "Kerala", label: "32 - Kerala" },
  { code: 33, name: "Tamil Nadu", label: "33 - Tamil Nadu" },
  { code: 34, name: "Puducherry", label: "34 - Puducherry" },
  { code: 35, name: "Andaman & Nicobar Islands", label: "35 - Andaman & Nicobar Islands" },
  { code: 36, name: "Telangana", label: "36 - Telangana" },
  { code: 37, name: "Ladakh", label: "37 - Ladakh" },
]

export function getStateByCode(code: number | string | null | undefined): IndianState | undefined {
  if (code === null || code === undefined || code === "") return undefined
  const numCode = typeof code === "string" ? parseInt(code, 10) : code
  return INDIAN_STATES.find(s => s.code === numCode)
}

export function getStateNameByCode(code: number | string | null | undefined): string {
  const state = getStateByCode(code)
  return state ? state.name : String(code || "")
}
