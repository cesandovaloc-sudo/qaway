import { describe, it, expect } from 'vitest'

describe('quotationService', () => {
  it('should export quotationService object', async () => {
    const { quotationService } = await import('../quotationService')
    expect(quotationService).toBeDefined()
    expect(typeof quotationService.getQuotations).toBe('function')
    expect(typeof quotationService.getQuotationById).toBe('function')
    expect(typeof quotationService.createQuotation).toBe('function')
    expect(typeof quotationService.updateStatus).toBe('function')
    expect(typeof quotationService.deleteQuotation).toBe('function')
  })

  it('should export statusConfig', async () => {
    const { statusConfig } = await import('../quotationService')
    expect(statusConfig).toBeDefined()
    expect(statusConfig.draft).toBeDefined()
    expect(statusConfig.sent).toBeDefined()
    expect(statusConfig.accepted).toBeDefined()
    expect(statusConfig.rejected).toBeDefined()
    expect(statusConfig.expired).toBeDefined()
  })

  it('should have correct status labels', async () => {
    const { statusConfig } = await import('../quotationService')
    expect(statusConfig.draft.label).toBe('Borrador')
    expect(statusConfig.sent.label).toBe('Enviada')
    expect(statusConfig.accepted.label).toBe('Aceptada')
    expect(statusConfig.rejected.label).toBe('Rechazada')
    expect(statusConfig.expired.label).toBe('Expirada')
  })

  it('should have colors for each status', async () => {
    const { statusConfig } = await import('../quotationService')
    Object.values(statusConfig).forEach(config => {
      expect(config.color).toBeDefined()
      expect(config.bgColor).toBeDefined()
    })
  })
})
