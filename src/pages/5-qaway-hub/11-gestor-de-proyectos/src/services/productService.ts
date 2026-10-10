import { supabaseProductAdapter, type ProductsAdapter } from './adapters/supabaseProductAdapter'
import type {
  Product,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
  DashboardStats,
} from '@/types'

// Default adapter (Supabase)
let adapter: ProductsAdapter = supabaseProductAdapter

// Allow swapping adapter for testing or different backends
export function setProductAdapter(newAdapter: ProductsAdapter) {
  adapter = newAdapter
}

export const productService = {
  async getProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return adapter.getProducts(filters, pagination)
  },

  async getProductById(id: string): Promise<Product | null> {
    return adapter.getProductById(id)
  },

  async getProductBySku(sku: string): Promise<Product | null> {
    return adapter.getProductBySku(sku)
  },

  async createProduct(data: Partial<Product>): Promise<Product | null> {
    // Generate SKU if not provided
    if (!data.sku) {
      data.sku = generateSku(data.name || 'PROD')
    }
    // Generate slug from name
    if (data.name && !data.slug) {
      data.slug = slugify(data.name)
    }
    return adapter.createProduct(data)
  },

  /** Insert masivo (importación Excel/CSV). Genera SKU/slug faltantes y devuelve cuántos se insertaron. */
  async createProducts(products: Partial<Product>[]): Promise<number> {
    if (!products.length) return 0 // supabase insert([]) falla
    const rows = products.map((data, i) => {
      const row = { ...data }
      if (!row.sku) {
        row.sku = generateSku(row.name || 'PROD', i)
      }
      if (row.name && !row.slug) {
        row.slug = slugify(row.name) + (i > 0 ? `-${i}` : '')
      }
      return row
    })
    const inserted = await adapter.createProducts(rows)
    return inserted.length
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    return adapter.updateProduct(id, data)
  },

  async deleteProduct(id: string): Promise<boolean> {
    return adapter.deleteProduct(id)
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return adapter.getDashboardStats()
  },

  async searchProducts(query: string): Promise<Product[]> {
    return adapter.searchProducts(query)
  },
}

// ── Helpers ──
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function generateSku(name: string, index: number = 0): string {
  const prefix = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  return `${prefix}-${timestamp}-${index}`
}
