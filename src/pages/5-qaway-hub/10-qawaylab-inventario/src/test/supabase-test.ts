import { expect } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Test Supabase Configuration ──
// These should be set in .env.test or environment variables
const TEST_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const TEST_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ── Check if integration tests should run ──
export const shouldRunIntegrationTests = (): boolean => {
  // Only run integration tests if real credentials are provided
  return (
    TEST_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    TEST_SUPABASE_ANON_KEY !== 'placeholder-key' &&
    TEST_SUPABASE_URL.length > 0 &&
    TEST_SUPABASE_ANON_KEY.length > 0
  )
}

// ── Create test Supabase client ──
export const createTestClient = (): SupabaseClient => {
  return createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY)
}

// ── Test Data Cleanup ──
export const cleanupTestData = async (client: SupabaseClient): Promise<void> => {
  // Resolve parent ids first so fk-only children can be deleted through their
  // foreign key column
  const [quotationsRes, productsRes, bundlesRes, catalogsRes, campaignsRes] = await Promise.all([
    client.from('quotations').select('id').ilike('notes', '%integration test%'),
    client.from('products').select('id').or('name.ilike.%test%,sku.ilike.%TEST%,slug.ilike.%test%'),
    client.from('bundles').select('id').ilike('name', '%test%'),
    client.from('catalogs').select('id').ilike('name', '%test%'),
    client.from('liquidation_campaigns').select('id').ilike('name', '%test%'),
  ])

  const ids = {
    quotation: (quotationsRes.data || []).map((row) => row.id),
    product: (productsRes.data || []).map((row) => row.id),
    bundle: (bundlesRes.data || []).map((row) => row.id),
    catalog: (catalogsRes.data || []).map((row) => row.id),
    campaign: (campaignsRes.data || []).map((row) => row.id),
  }

  // Child tables first (reverse dependency order)
  const children: Array<[string, string, string[]]> = [
    ['quotation_items', 'quotation_id', ids.quotation],
    ['liquidation_items', 'campaign_id', ids.campaign],
    ['catalog_items', 'catalog_id', ids.catalog],
    ['bundle_items', 'bundle_id', ids.bundle],
    ['product_prices', 'product_id', ids.product],
    ['inventory_movements', 'product_id', ids.product],
    ['product_images', 'product_id', ids.product],
  ]

  for (const [table, column, rowIds] of children) {
    if (rowIds.length === 0) continue
    await client.from(table).delete().in(column, rowIds)
  }

  // Parent tables last, filtering only on columns each table actually has
  const parents: Array<[string, string]> = [
    ['quotations', 'notes.ilike.%integration test%'],
    ['liquidation_campaigns', 'name.ilike.%test%'],
    ['catalogs', 'name.ilike.%test%'],
    ['bundles', 'name.ilike.%test%'],
    ['price_lists', 'name.ilike.%test%'],
    ['products', 'name.ilike.%test%,sku.ilike.%TEST%,slug.ilike.%test%'],
    ['customers', 'name.ilike.%test%'],
    ['categories', 'name.ilike.%test%,slug.ilike.%test%'],
    ['inventory_locations', 'name.ilike.%test%,slug.ilike.%test%'],
  ]

  for (const [table, filter] of parents) {
    try {
      await client.from(table).delete().or(filter)
    } catch {
      // Ignore errors for tables that don't exist or lack the filter column
    }
  }
}

// ── Test Data Factories ──
export const createTestCategory = async (client: SupabaseClient, name: string) => {
  const { data, error } = await client
    .from('categories')
    .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
    .select()
    .single()

  if (error) throw error
  return data
}

export const createTestLocation = async (client: SupabaseClient, name: string) => {
  const { data, error } = await client
    .from('inventory_locations')
    .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
    .select()
    .single()

  if (error) throw error
  return data
}

export const createTestProduct = async (client: SupabaseClient, overrides: Record<string, any> = {}) => {
  const productData = {
    name: `Test Product ${Date.now()}`,
    sku: `TEST-${Date.now()}`,
    slug: `test-product-${Date.now()}`,
    category: 'Test Category',
    status: 'active' as const,
    stock: 10,
    min_stock: 5,
    base_price: 100,
    ...overrides,
  }

  const { data, error } = await client
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createTestCustomer = async (client: SupabaseClient, overrides: Record<string, any> = {}) => {
  const customerData = {
    name: `Test Customer ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    type: 'individual' as const,
    ...overrides,
  }

  const { data, error } = await client
    .from('customers')
    .insert(customerData)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Assertion Helpers ──
export const assertSupabaseError = (error: any, expectedCode?: string) => {
  expect(error).not.toBeNull()
  if (expectedCode) {
    expect(error.code).toBe(expectedCode)
  }
}

export const assertSupabaseSuccess = (error: any) => {
  expect(error).toBeNull()
}
