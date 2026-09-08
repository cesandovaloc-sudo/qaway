import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { productService } from '../productService'
import {
  shouldRunIntegrationTests,
  createTestClient,
  cleanupTestData,
  createTestProduct,
} from '@/test/supabase-test'

// Integration tests must hit the real Supabase, not the global unit-test mock
vi.unmock('@/config/supabase')

// Skip integration tests if no real Supabase credentials
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip

describeIntegration('productService Integration Tests', () => {
  const client = createTestClient()
  let testProductId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData(client)
  })

  afterAll(async () => {
    // Clean up test data after all tests
    await cleanupTestData(client)
  })

  beforeEach(async () => {
    // Create a fresh test product for each test
    const product = await createTestProduct(client)
    testProductId = product.id
  })

  describe('getProducts', () => {
    it('should return paginated products from database', async () => {
      const result = await productService.getProducts({}, { page: 1, per_page: 10 })

      expect(result).toBeDefined()
      expect(result.data).toBeInstanceOf(Array)
      expect(result.total).toBeGreaterThanOrEqual(0)
      expect(result.page).toBe(1)
      expect(result.per_page).toBe(10)
    })

    it('should handle pagination correctly', async () => {
      const page1 = await productService.getProducts({}, { page: 1, per_page: 5 })
      const page2 = await productService.getProducts({}, { page: 2, per_page: 5 })

      expect(page1.data.length).toBeLessThanOrEqual(5)
      expect(page2.page).toBe(2)
    })
  })

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const product = await productService.getProductById(testProductId)

      expect(product).toBeDefined()
      if (product) {
        expect(product.id).toBe(testProductId)
        expect(product.name).toContain('Test Product')
      }
    })

    it('should return null for non-existent product', async () => {
      const product = await productService.getProductById('non-existent-id-12345')

      expect(product).toBeNull()
    })
  })

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: `Integration Test Product ${Date.now()}`,
        sku: `INT-TEST-${Date.now()}`,
        slug: `integration-test-${Date.now()}`,
        category: 'Test Category',
        status: 'active' as const,
        stock: 5,
        min_stock: 2,
        base_price: 250,
      }

      const created = await productService.createProduct(newProduct)

      expect(created).toBeDefined()
      if (created) {
        expect(created.id).toBeDefined()
        expect(created.name).toBe(newProduct.name)
        expect(created.sku).toBe(newProduct.sku)
      }
    })
  })

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updates = {
        name: `Updated Test Product ${Date.now()}`,
        base_price: 999,
      }

      const updated = await productService.updateProduct(testProductId, updates)

      expect(updated).toBeDefined()
      if (updated) {
        expect(updated.name).toBe(updates.name)
        expect(updated.base_price).toBe(updates.base_price)
      }
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      // Create a product to delete
      const productToDelete = await createTestProduct(client)

      // Delete it
      await productService.deleteProduct(productToDelete.id)

      // Verify it's deleted
      const deleted = await productService.getProductById(productToDelete.id)
      expect(deleted).toBeNull()
    })
  })
})
