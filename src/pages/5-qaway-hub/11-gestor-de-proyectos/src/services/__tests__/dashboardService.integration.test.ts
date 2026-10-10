import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { dashboardService } from '../dashboardService'
import {
  shouldRunIntegrationTests,
  createTestClient,
  cleanupTestData,
} from '@/test/supabase-test'

// Integration tests must hit the real Supabase, not the global unit-test mock
vi.unmock('@/config/supabase')

// Skip integration tests if no real Supabase credentials
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip

describeIntegration('dashboardService Integration Tests', () => {
  const client = createTestClient()

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData(client)
  })

  afterAll(async () => {
    // Clean up test data after all tests
    await cleanupTestData(client)
  })

  describe('getStats', () => {
    it('should return dashboard stats from database', async () => {
      const stats = await dashboardService.getStats()

      expect(stats).toBeDefined()
      expect(typeof stats.totalProducts).toBe('number')
      expect(typeof stats.totalStock).toBe('number')
      expect(typeof stats.inventoryValue).toBe('number')
      expect(typeof stats.lowStockCount).toBe('number')
      expect(typeof stats.outOfStockCount).toBe('number')
      expect(typeof stats.activeProducts).toBe('number')
      expect(typeof stats.totalCustomers).toBe('number')
      expect(typeof stats.pendingQuotations).toBe('number')
      expect(typeof stats.activeCampaigns).toBe('number')
    })
  })

  describe('getRecentActivity', () => {
    it('should return recent activity', async () => {
      const activity = await dashboardService.getRecentActivity(5)

      expect(activity).toBeDefined()
      expect(Array.isArray(activity)).toBe(true)
      expect(activity.length).toBeLessThanOrEqual(5)

      if (activity.length > 0) {
        expect(activity[0]).toHaveProperty('id')
        expect(activity[0]).toHaveProperty('type')
        expect(activity[0]).toHaveProperty('title')
        expect(activity[0]).toHaveProperty('description')
        expect(activity[0]).toHaveProperty('timestamp')
      }
    })
  })

  describe('getTopProducts', () => {
    it('should return top products', async () => {
      const products = await dashboardService.getTopProducts(5)

      expect(products).toBeDefined()
      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBeLessThanOrEqual(5)

      if (products.length > 0) {
        expect(products[0]).toHaveProperty('id')
        expect(products[0]).toHaveProperty('name')
        expect(products[0]).toHaveProperty('sku')
        expect(products[0]).toHaveProperty('stock')
        expect(products[0]).toHaveProperty('price')
      }
    })
  })

  describe('getLowStockProducts', () => {
    it('should return low stock products', async () => {
      const products = await dashboardService.getLowStockProducts(5)

      expect(products).toBeDefined()
      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getSalesData', () => {
    it('should return sales data for last 6 months', async () => {
      const salesData = await dashboardService.getSalesData()

      expect(salesData).toBeDefined()
      expect(Array.isArray(salesData)).toBe(true)
      expect(salesData.length).toBe(6)

      salesData.forEach(month => {
        expect(month).toHaveProperty('month')
        expect(month).toHaveProperty('ventas')
        expect(month).toHaveProperty('cotizaciones')
        expect(month).toHaveProperty('ingresos')
        expect(typeof month.ventas).toBe('number')
        expect(typeof month.cotizaciones).toBe('number')
        expect(typeof month.ingresos).toBe('number')
      })
    })
  })

  describe('getCategoryData', () => {
    it('should return category distribution', async () => {
      const categoryData = await dashboardService.getCategoryData()

      expect(categoryData).toBeDefined()
      expect(Array.isArray(categoryData)).toBe(true)

      categoryData.forEach(category => {
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('value')
        expect(category).toHaveProperty('color')
        expect(typeof category.value).toBe('number')
      })
    })
  })

  describe('getTrendData', () => {
    it('should return trend data for last 7 days', async () => {
      const trendData = await dashboardService.getTrendData()

      expect(trendData).toBeDefined()
      expect(Array.isArray(trendData)).toBe(true)
      expect(trendData.length).toBe(7)

      trendData.forEach(day => {
        expect(day).toHaveProperty('day')
        expect(day).toHaveProperty('productos')
        expect(day).toHaveProperty('stock')
        expect(day).toHaveProperty('valor')
        expect(typeof day.productos).toBe('number')
        expect(typeof day.stock).toBe('number')
        expect(typeof day.valor).toBe('number')
      })
    })
  })
})
