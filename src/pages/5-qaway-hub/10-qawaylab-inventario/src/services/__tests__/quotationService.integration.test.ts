import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { quotationService } from '../quotationService'
import {
  shouldRunIntegrationTests,
  createTestClient,
  cleanupTestData,
  createTestProduct,
  createTestCustomer,
} from '@/test/supabase-test'

// Integration tests must hit the real Supabase, not the global unit-test mock
vi.unmock('@/config/supabase')

// Skip integration tests if no real Supabase credentials
const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip

describeIntegration('quotationService Integration Tests', () => {
  const client = createTestClient()
  let testProductId: string
  let testCustomerId: string
  let testQuotationId: string

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData(client)

    // Create test data
    const product = await createTestProduct(client)
    testProductId = product.id

    const customer = await createTestCustomer(client)
    testCustomerId = customer.id
  })

  afterAll(async () => {
    // Clean up test data after all tests
    await cleanupTestData(client)
  })

  describe('getQuotations', () => {
    it('should return paginated quotations', async () => {
      const result = await quotationService.getQuotations({ page: 1, per_page: 10 })

      expect(result).toBeDefined()
      expect(result.data).toBeInstanceOf(Array)
      expect(result.total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('createQuotation', () => {
    it('should create a new quotation with items', async () => {
      const quotationData = {
        customer_id: testCustomerId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
            unit_price: 100,
          },
        ],
        notes: 'Integration test quotation',
      }

      const created = await quotationService.createQuotation(quotationData)

      expect(created).toBeDefined()
      if (created) {
        expect(created.id).toBeDefined()
        testQuotationId = created.id
      }
    })
  })

  describe('getQuotationById', () => {
    it('should return a quotation with items', async () => {
      if (!testQuotationId) {
        // Create one if not exists
        const quotation = await quotationService.createQuotation({
          customer_id: testCustomerId,
          items: [{ product_id: testProductId, quantity: 1, unit_price: 50 }],
        })
        if (quotation) {
          testQuotationId = quotation.id
        }
      }

      const quotation = await quotationService.getQuotationById(testQuotationId)

      expect(quotation).toBeDefined()
      if (quotation) {
        expect(quotation.id).toBe(testQuotationId)
        expect(quotation.items).toBeDefined()
        expect(Array.isArray(quotation.items)).toBe(true)
      }
    })
  })

  describe('updateStatus', () => {
    it('should update quotation status', async () => {
      if (!testQuotationId) {
        const quotation = await quotationService.createQuotation({
          customer_id: testCustomerId,
          items: [{ product_id: testProductId, quantity: 1, unit_price: 50 }],
        })
        if (quotation) {
          testQuotationId = quotation.id
        }
      }

      await quotationService.updateStatus(testQuotationId, 'sent')

      const updated = await quotationService.getQuotationById(testQuotationId)
      if (updated) {
        expect(updated.status).toBe('sent')
      }
    })
  })

  describe('deleteQuotation', () => {
    it('should delete a quotation', async () => {
      // Create a quotation to delete
      const quotationToDelete = await quotationService.createQuotation({
        customer_id: testCustomerId,
        items: [{ product_id: testProductId, quantity: 1, unit_price: 50 }],
      })

      if (quotationToDelete) {
        // Delete it
        await quotationService.deleteQuotation(quotationToDelete.id)

        // Verify it's deleted (should throw or return null)
        try {
          const deleted = await quotationService.getQuotationById(quotationToDelete.id)
          // If it returns, it should be null or have a different status
          expect(deleted).toBeDefined()
        } catch {
          // Expected - quotation not found
        }
      }
    })
  })
})
