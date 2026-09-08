import { describe, it, expect } from 'vitest'

describe('Hooks exports', () => {
  it('should export useProducts function', async () => {
    const { useProducts } = await import('../useProducts')
    expect(useProducts).toBeDefined()
    expect(typeof useProducts).toBe('function')
  })

  it('should export useQuotations function', async () => {
    const { useQuotations } = await import('../useQuotations')
    expect(useQuotations).toBeDefined()
    expect(typeof useQuotations).toBe('function')
  })

  it('should export useDashboard function', async () => {
    const { useDashboard } = await import('../useDashboard')
    expect(useDashboard).toBeDefined()
    expect(typeof useDashboard).toBe('function')
  })

  it('should export useBundles function', async () => {
    const { useBundles } = await import('../useBundles')
    expect(useBundles).toBeDefined()
    expect(typeof useBundles).toBe('function')
  })

  it('should export useCampaigns function', async () => {
    const { useCampaigns } = await import('../useCampaigns')
    expect(useCampaigns).toBeDefined()
    expect(typeof useCampaigns).toBe('function')
  })

  it('should export useCustomers function', async () => {
    const { useCustomers } = await import('../useCustomers')
    expect(useCustomers).toBeDefined()
    expect(typeof useCustomers).toBe('function')
  })
})
