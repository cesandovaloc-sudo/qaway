import { describe, it, expect } from 'vitest'

describe('QuotationCard', () => {
  it('should export QuotationCard component', async () => {
    const { QuotationCard } = await import('../quotations/QuotationCard')
    expect(QuotationCard).toBeDefined()
    expect(typeof QuotationCard).toBe('function')
  })
})

describe('QuotationForm', () => {
  it('should export QuotationForm component', async () => {
    const { QuotationForm } = await import('../quotations/QuotationForm')
    expect(QuotationForm).toBeDefined()
    expect(typeof QuotationForm).toBe('function')
  })
})

describe('QuotationPDF', () => {
  it('should export QuotationPDF component', async () => {
    const { QuotationPDF } = await import('../quotations/QuotationPDF')
    expect(QuotationPDF).toBeDefined()
    expect(typeof QuotationPDF).toBe('function')
  })
})
