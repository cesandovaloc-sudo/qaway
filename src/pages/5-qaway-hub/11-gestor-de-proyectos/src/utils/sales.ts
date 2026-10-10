export interface SaleLineInput {
  quantity: number
  unit_price: number
}

export interface SaleTotals {
  subtotal: number
  discount: number
  total: number
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function calcSaleTotals(lines: SaleLineInput[], discount = 0): SaleTotals {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0))
  const safeDiscount = Math.max(0, Math.min(discount, subtotal))
  return { subtotal, discount: safeDiscount, total: round2(subtotal - safeDiscount) }
}

export function calcLineSubtotal(quantity: number, unitPrice: number): number {
  return round2(quantity * unitPrice)
}
