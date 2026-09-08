import { supabase } from '@/config/supabase'
import type { 
  Catalog, 
  CatalogItem, 
  CatalogTemplate,
  LiquidationCampaign, 
  Product, 
  PaginatedResponse, 
  PaginationParams 
} from '@/types'

// ── Catalog with items ──
export interface CatalogWithItems {
  campaign_id?: string | null
  name: string
  description?: string | null
  is_public?: boolean
  template?: CatalogTemplate
  items?: CatalogItemInput[]
}

export interface CatalogItemInput {
  product_id: string
  bundle_id?: string | null
  sort_order?: number
  show_price?: boolean
  show_description?: boolean
}

// ── Catalog with full data ──
export interface CatalogFull extends Catalog {
  campaign?: LiquidationCampaign
  items: (CatalogItem & {
    product?: Product
    bundle?: { name: string; bundle_price: number }
  })[]
}

// ── Catalog Stats ──
export interface CatalogStats {
  total_items: number
  total_products: number
  total_bundles: number
  total_value: number
}

// ── Catalog Service ──
export const catalogService = {
  // Get all catalogs
  async getCatalogs(params?: PaginationParams): Promise<PaginatedResponse<Catalog>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const { count } = await supabase
      .from('catalogs')
      .select('*', { count: 'exact', head: true })

    const { data, error } = await supabase
      .from('catalogs')
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

  // Get catalog by ID with items
  async getCatalogById(id: string): Promise<CatalogFull> {
    const { data: catalog, error: catalogError } = await supabase
      .from('catalogs')
      .select('*')
      .eq('id', id)
      .single()

    if (catalogError) throw catalogError

    // Get items with products and bundles
    const { data: items, error: itemsError } = await supabase
      .from('catalog_items')
      .select(`
        *,
        product:products(*),
        bundle:bundles(name, bundle_price)
      `)
      .eq('catalog_id', id)
      .order('sort_order')

    if (itemsError) throw itemsError

    // Get campaign if linked
    let campaign = undefined
    if (catalog.campaign_id) {
      const { data } = await supabase
        .from('liquidation_campaigns')
        .select('*')
        .eq('id', catalog.campaign_id)
        .single()
      campaign = data || undefined
    }

    return {
      ...catalog,
      campaign,
      items: items || [],
    }
  },

  // Get catalog by slug (public)
  async getCatalogBySlug(slug: string): Promise<CatalogFull | null> {
    const { data: catalog, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (error || !catalog) return null

    return this.getCatalogById(catalog.id)
  },

  // Create catalog
  async createCatalog(catalog: CatalogWithItems): Promise<Catalog> {
    const items = catalog.items || []

    const { data, error } = await supabase
      .from('catalogs')
      .insert({
        campaign_id: catalog.campaign_id || null,
        name: catalog.name,
        slug: generateSlug(catalog.name),
        description: catalog.description || null,
        is_public: catalog.is_public || false,
        template: catalog.template || 'professional',
      })
      .select()
      .single()

    if (error) throw error

    // Insert items if provided
    if (items.length > 0) {
      const catalogItems = items.map((item: CatalogItemInput, index: number) => ({
        catalog_id: data.id,
        product_id: item.product_id,
        bundle_id: item.bundle_id || null,
        sort_order: item.sort_order ?? index,
        show_price: item.show_price ?? true,
        show_description: item.show_description ?? true,
      }))

      await supabase.from('catalog_items').insert(catalogItems)
    }

    return data
  },

  // Update catalog
  async updateCatalog(id: string, updates: Partial<Catalog>): Promise<Catalog> {
    const { data, error } = await supabase
      .from('catalogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete catalog
  async deleteCatalog(id: string): Promise<void> {
    // Delete items first
    await supabase.from('catalog_items').delete().eq('catalog_id', id)
    
    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add item to catalog
  async addItem(catalogId: string, item: CatalogItemInput): Promise<CatalogItem> {
    const { data, error } = await supabase
      .from('catalog_items')
      .insert({
        catalog_id: catalogId,
        product_id: item.product_id,
        bundle_id: item.bundle_id || null,
        sort_order: item.sort_order || 0,
        show_price: item.show_price ?? true,
        show_description: item.show_description ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove item from catalog
  async removeItem(catalogId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', itemId)
      .eq('catalog_id', catalogId)

    if (error) throw error
  },

  // Reorder items
  async reorderItems(_catalogId: string, itemIds: string[]): Promise<void> {
    const updates = itemIds.map((id, index) => 
      supabase
        .from('catalog_items')
        .update({ sort_order: index })
        .eq('id', id)
    )

    await Promise.all(updates)
  },

  // Get catalog stats
  async getCatalogStats(catalogId: string): Promise<CatalogStats> {
    const { data: items } = await supabase
      .from('catalog_items')
      .select('product_id, bundle_id')
      .eq('catalog_id', catalogId)

    if (!items || items.length === 0) {
      return {
        total_items: 0,
        total_products: 0,
        total_bundles: 0,
        total_value: 0,
      }
    }

    const productIds = items.filter(i => i.product_id).map(i => i.product_id)
    const bundleIds = items.filter(i => i.bundle_id).map(i => i.bundle_id)

    let totalValue = 0

    // Get product prices
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('base_price')
        .in('id', productIds)

      if (products) {
        totalValue += products.reduce((sum, p) => sum + (p.base_price || 0), 0)
      }
    }

    // Get bundle prices
    if (bundleIds.length > 0) {
      const { data: bundles } = await supabase
        .from('bundles')
        .select('bundle_price')
        .in('id', bundleIds)

      if (bundles) {
        totalValue += bundles.reduce((sum, b) => sum + (b.bundle_price || 0), 0)
      }
    }

    return {
      total_items: items.length,
      total_products: productIds.length,
      total_bundles: bundleIds.length,
      total_value: totalValue,
    }
  },

  // Generate public URL
  getPublicUrl(catalog: Catalog): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/remates/${catalog.slug}`
  },

  // Generate WhatsApp share text
  getWhatsAppShareText(catalog: Catalog, url: string): string {
    return `📋 *${catalog.name}*\n\n${catalog.description || 'Catálogo de productos disponibles'}\n\n🔗 Ver catálogo: ${url}`
  },
}

// ── Helpers ──
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)
}
