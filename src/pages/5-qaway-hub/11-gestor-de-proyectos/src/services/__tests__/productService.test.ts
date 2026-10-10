import { describe, it, expect } from 'vitest'

describe('productService', () => {
  it('should export productService object', async () => {
    const { productService } = await import('../productService')
    expect(productService).toBeDefined()
    expect(typeof productService.getProducts).toBe('function')
    expect(typeof productService.getProductById).toBe('function')
    expect(typeof productService.createProduct).toBe('function')
    expect(typeof productService.updateProduct).toBe('function')
    expect(typeof productService.deleteProduct).toBe('function')
  })
})

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
})

describe('dashboardService', () => {
  it('should export dashboardService object', async () => {
    const { dashboardService } = await import('../dashboardService')
    expect(dashboardService).toBeDefined()
    expect(typeof dashboardService.getStats).toBe('function')
    expect(typeof dashboardService.getRecentActivity).toBe('function')
    expect(typeof dashboardService.getTopProducts).toBe('function')
    expect(typeof dashboardService.getLowStockProducts).toBe('function')
    expect(typeof dashboardService.getSalesData).toBe('function')
    expect(typeof dashboardService.getCategoryData).toBe('function')
    expect(typeof dashboardService.getTrendData).toBe('function')
  })
})
