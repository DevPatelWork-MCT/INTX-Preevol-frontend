/**
 * Format a number as Indian Rupees (INR) with ₹ symbol and comma separators.
 * Example: formatINR(1250000) => "₹12,50,000.00"
 */
export function formatINR(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "₹0.00"
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "₹0.00"

  // Format with Indian numbering system (lakhs, crores)
  const [intPart, decPart] = num.toFixed(2).split(".")
  const lastThree = intPart.slice(-3)
  const otherNumbers = intPart.slice(0, -3)
  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherNumbers ? "," : "") +
    lastThree
  return `₹${formatted}${decPart ? `.${decPart}` : ""}`
}

/**
 * Short format for large numbers (K, L, Cr)
 * Example: formatINRShort(1250000) => "₹12.50 L"
 */
export function formatINRShort(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "₹0"
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "₹0"

  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`
  return `₹${num.toFixed(0)}`
}
