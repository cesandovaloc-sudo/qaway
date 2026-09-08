import { supabase } from '@/config/supabase'
import type {
  Product,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
  DashboardStats,
} from '@/types'

// ── Interface ──
export interface ProductsAdapter {
  getProducts(filters?: ProductFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Product>>
  getProductById(id: string): Promise<Product | null>
  getProductBySku(sku: string): Promise<Product | null>
  createProduct(data: Partial<Product>): Promise<Product | null>
  createProducts(data: Partial<Product>[]): Promise<Product[]>
  updateProduct(id: string, data: Partial<Product>): Promise<Product | null>
  deleteProduct(id: string): Promise<boolean>
  getDashboardStats(): Promise<DashboardStats>
  searchProducts(query: string): Promise<Product[]>
}

// ── Supabase Implementation ──
export const supabaseProductAdapter: ProductsAdapter = {
  async getProducts(filters = {}, pagination = { page: 1, per_page: 20 }) {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.commercial_status) {
      query = query.eq('commercial_status', filters.commercial_status)
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id)
    }
    if (filters.min_price !== undefined) {
      query = query.gte('base_price', filters.min_price)
    }
    if (filters.max_price !== undefined) {
      query = query.lte('base_price', filters.max_price)
    }
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`)
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.per_page
    const to = from + pagination.per_page - 1

    query = query
      .range(from, to)
      .order(pagination.sort_by || 'created_at', { ascending: pagination.sort_order === 'asc' })

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return { data: [], total: 0, page: pagination.page, per_page: pagination.per_page, total_pages: 0 }
    }

    return {
      data: data || [],
      total: count || 0,
      page: pagination.page,
      per_page: pagination.per_page,
      total_pages: Math.ceil((count || 0) / pagination.per_page),
    }
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }
    return data
  },

  async getProductBySku(sku) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single()

    if (error) return null
    return data
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return null
    }
    return data
  },

  async createProducts(productsData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productsData)
      .select()

    if (error) {
      console.error('Error creating products:', error)
      throw new Error(error.message)
    }
    return data || []
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return null
    }
    return data
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return false
    }
    return true
  },

  async getDashboardStats() {
    const { count: total_products } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { count: active_products } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: low_stock_count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .filter('min_stock', 'gt', 0)
      .filter('stock', 'lte', 'min_stock')

    return {
      total_products: total_products || 0,
      total_stock: 0,
      inventory_value: 0,
      low_stock_count: low_stock_count || 0,
      out_of_stock_count: 0,
      active_products: active_products || 0,
      products_in_offer: 0,
      products_in_liquidation: 0,
    }
  },

  async searchProducts(query) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(10)

    if (error) return []
    return data || []
  },
}
