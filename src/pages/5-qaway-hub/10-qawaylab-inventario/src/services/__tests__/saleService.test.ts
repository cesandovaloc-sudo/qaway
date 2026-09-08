import { describe, it, expect } from 'vitest'

describe('saleService', () => {
  it('should export saleService with all methods', async () => {
    const { saleService } = await import('../saleService')
    expect(saleService).toBeDefined()
    expect(typeof saleService.getSales).toBe('function')
    expect(typeof saleService.getSaleById).toBe('function')
    expect(typeof saleService.createSale).toBe('function')
    expect(typeof saleService.registerPayment).toBe('function')
    expect(typeof saleService.getDebts).toBe('function')
    expect(typeof saleService.cancelSale).toBe('function')
    expect(typeof saleService.assertStock).toBe('function')
  })
})
