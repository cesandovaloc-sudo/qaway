import { describe, it, expect } from 'vitest'

describe('customerService', () => {
  it('should export customerService object', async () => {
    const { customerService } = await import('../customerService')
    expect(customerService).toBeDefined()
    expect(typeof customerService.getCustomers).toBe('function')
    expect(typeof customerService.getCustomerById).toBe('function')
    expect(typeof customerService.searchCustomers).toBe('function')
    expect(typeof customerService.createCustomer).toBe('function')
    expect(typeof customerService.updateCustomer).toBe('function')
    expect(typeof customerService.deleteCustomer).toBe('function')
    expect(typeof customerService.lookupFiscalDoc).toBe('function')
  })

  it('should export customerTypeConfig', async () => {
    const { customerTypeConfig } = await import('../customerService')
    expect(customerTypeConfig).toBeDefined()
    expect(customerTypeConfig.individual).toBeDefined()
    expect(customerTypeConfig.company).toBeDefined()
    expect(customerTypeConfig.wholesale).toBeDefined()
    expect(customerTypeConfig.reseller).toBeDefined()
  })

  it('should export docTypeConfig with all fiscal doc types', async () => {
    const { docTypeConfig } = await import('../customerService')
    expect(docTypeConfig).toBeDefined()
    expect(docTypeConfig.DNI.label).toBe('DNI')
    expect(docTypeConfig.RUC.label).toBe('RUC')
    expect(docTypeConfig.SIN_DOC.label).toBe('Sin doc.')
    Object.values(docTypeConfig).forEach(config => {
      expect(config.color).toBeDefined()
      expect(config.bgColor).toBeDefined()
    })
  })
})
