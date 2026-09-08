import { supabase } from '@/config/supabase'
import type { Bundle, BundleItem, Product, PaginatedResponse, PaginationParams } from '@/types'

// ── Extended Bundle with items ──
export interface BundleWithItems extends Bundle {
  items?: BundleItemInput[]
}

export interface BundleItemInput {
  product_id: string
  variant_id?: string | null
  quantity: number
}

// ── Bundle Service ──
export const bundleService = {
  // Get all bundles
  async getBundles(params?: PaginationParams): Promise<PaginatedResponse<Bundle>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const { count } = await supabase
      .from('bundles')
      .select('*', { count: 'exact', head: true })

    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    }
  },

  // Get bundle by ID with items
  async getBundleById(id: string): Promise<Bundle & { items: (BundleItem & { product: Product })[] }> {
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .select('*')
      .eq('id', id)
      .single()

    if (bundleError) throw bundleError

    const { data: items, error: itemsError } = await supabase
      .from('bundle_items')
      .select('*, product:products(*)')
      .eq('bundle_id', id)

    if (itemsError) throw itemsError

    return { ...bundle, items: items || [] }
  },

  // Create bundle with items
  async createBundle(bundle: BundleWithItems): Promise<Bundle> {
    const items = bundle.items || []
    
    // Calculate total individual price from items
    let totalIndividual = 0
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('base_price')
        .eq('id', item.product_id)
        .single()
      
      if (product?.base_price) {
        totalIndividual += product.base_price * item.quantity
      }
    }

    const { data, error } = await supabase
      .from('bundles')
      .insert({
        name: bundle.name,
        sku: bundle.sku,
        description: bundle.description,
        image_url: bundle.image_url,
        bundle_price: bundle.bundle_price,
        discount: bundle.discount,
        status: bundle.status,
        total_individual_price: totalIndividual,
      })
      .select()
      .single()

    if (error) throw error

    // Insert items if provided
    if (items.length > 0) {
      const bundleItems = items.map((item: BundleItemInput) => ({
        bundle_id: data.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
      }))

      await supabase.from('bundle_items').insert(bundleItems)
    }

    return data
  },

  // Update bundle
  async updateBundle(id: string, updates: Partial<Bundle>): Promise<Bundle> {
    const { data, error } = await supabase
      .from('bundles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete bundle
  async deleteBundle(id: string): Promise<void> {
    // Delete items first
    await supabase.from('bundle_items').delete().eq('bundle_id', id)
    
    const { error } = await supabase
      .from('bundles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add item to bundle
  async addItem(bundleId: string, item: Omit<BundleItem, 'id' | 'bundle_id'>): Promise<BundleItem> {
    const { data, error } = await supabase
      .from('bundle_items')
      .insert({
        bundle_id: bundleId,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })
      .select()
      .single()

    if (error) throw error
    
    // Recalculate total price
    await this.recalculateTotal(bundleId)
    
    return data
  },

  // Remove item from bundle
  async removeItem(bundleId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('bundle_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    
    // Recalculate total price
    await this.recalculateTotal(bundleId)
  },

  // Update item quantity
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    const { data: item, error: itemError } = await supabase
      .from('bundle_items')
      .select('bundle_id')
      .eq('id', itemId)
      .single()

    if (itemError) throw itemError

    const { error } = await supabase
      .from('bundle_items')
      .update({ quantity })
      .eq('id', itemId)

    if (error) throw error
    
    // Recalculate total price
    if (item?.bundle_id) {
      await this.recalculateTotal(item.bundle_id)
    }
  },

  // Recalculate bundle total price
  async recalculateTotal(bundleId: string): Promise<void> {
    const { data: items } = await supabase
      .from('bundle_items')
      .select('product_id, quantity')
      .eq('bundle_id', bundleId)

    if (!items || items.length === 0) return

    let total = 0
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('base_price')
        .eq('id', item.product_id)
        .single()
      
      if (product?.base_price) {
        total += product.base_price * item.quantity
      }
    }

    await supabase
      .from('bundles')
      .update({ total_individual_price: total })
      .eq('id', bundleId)
  },

  // Calculate available stock for bundle
  async getAvailableStock(bundleId: string): Promise<number> {
    const { data: items } = await supabase
      .from('bundle_items')
      .select('product_id, quantity')
      .eq('bundle_id', bundleId)

    if (!items || items.length === 0) return 0

    let minStock = Infinity
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('min_stock')
        .eq('id', item.product_id)
        .single()
      
      const stock = product?.min_stock || 0
      const possibleSets = Math.floor(stock / item.quantity)
      minStock = Math.min(minStock, possibleSets)
    }

    return minStock === Infinity ? 0 : minStock
  },
}
