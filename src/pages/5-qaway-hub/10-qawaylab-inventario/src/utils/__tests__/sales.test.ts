import { describe, it, expect } from 'vitest'
import { calcSaleTotals, calcLineSubtotal, round2 } from '../sales'

describe('utils/sales', () => {
  it('should calculate totals with no discount', () => {
    const totals = calcSaleTotals([
      { quantity: 2, unit_price: 100 },
      { quantity: 1, unit_price: 49.5 },
    ])
    expect(totals.subtotal).toBe(249.5)
    expect(totals.discount).toBe(0)
    expect(totals.total).toBe(249.5)
  })

  it('should apply a global discount', () => {
    const totals = calcSaleTotals([{ quantity: 3, unit_price: 10 }], 5)
    expect(totals.subtotal).toBe(30)
    expect(totals.discount).toBe(5)
    expect(totals.total).toBe(25)
  })

  it('should clamp discount to subtotal', () => {
    const totals = calcSaleTotals([{ quantity: 1, unit_price: 10 }], 99)
    expect(totals.discount).toBe(10)
    expect(totals.total).toBe(0)
  })

  it('should clamp negative discount to zero', () => {
    const totals = calcSaleTotals([{ quantity: 1, unit_price: 10 }], -5)
    expect(totals.discount).toBe(0)
    expect(totals.total).toBe(10)
  })

  it('should round to 2 decimals', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3)
    expect(calcLineSubtotal(3, 0.333)).toBe(1)
    expect(calcLineSubtotal(2, 1.005)).toBe(2.01)
  })

  it('should return zeros for empty lines', () => {
    const totals = calcSaleTotals([])
    expect(totals).toEqual({ subtotal: 0, discount: 0, total: 0 })
  })
})
