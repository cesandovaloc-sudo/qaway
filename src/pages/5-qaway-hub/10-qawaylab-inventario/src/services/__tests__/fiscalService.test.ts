import { describe, it, expect } from 'vitest'

describe('fiscalService', () => {
  it('should export fiscalService with all methods', async () => {
    const { fiscalService } = await import('../fiscalService')
    expect(fiscalService).toBeDefined()
    expect(typeof fiscalService.getBusinessSettings).toBe('function')
    expect(typeof fiscalService.updateBusinessSettings).toBe('function')
    expect(typeof fiscalService.getTaxes).toBe('function')
    expect(typeof fiscalService.createTax).toBe('function')
    expect(typeof fiscalService.updateTax).toBe('function')
    expect(typeof fiscalService.deleteTax).toBe('function')
    expect(typeof fiscalService.getUnits).toBe('function')
    expect(typeof fiscalService.createUnit).toBe('function')
    expect(typeof fiscalService.updateUnit).toBe('function')
    expect(typeof fiscalService.deleteUnit).toBe('function')
    expect(typeof fiscalService.getSeries).toBe('function')
    expect(typeof fiscalService.createSeries).toBe('function')
    expect(typeof fiscalService.updateSeries).toBe('function')
    expect(typeof fiscalService.deleteSeries).toBe('function')
    expect(typeof fiscalService.nextCorrelativo).toBe('function')
  })
})
