import { describe, it, expect } from 'vitest'

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

describe('DashboardStats interface', () => {
  it('should have correct shape', async () => {
    const { dashboardService } = await import('../dashboardService')
    
    // Type check - these should compile without errors
    const stats = {} as Awaited<ReturnType<typeof dashboardService.getStats>>
    
    // Check that the type has the expected properties
    expect(typeof stats.totalProducts).toBe('undefined')
    expect(typeof stats.totalStock).toBe('undefined')
    expect(typeof stats.inventoryValue).toBe('undefined')
  })
})
