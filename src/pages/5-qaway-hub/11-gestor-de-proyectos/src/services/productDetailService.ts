import { supabase } from '@/config/supabase'
import type { 
  Product, 
  ProductImage, 
  ProductVariant, 
  ProductPrice, 
  InventoryMovement, 
  PriceList,
  Category,
  InventoryLocation 
} from '@/types'

// ── Product Detail with relations ──
export interface ProductDetail extends Product {
  images: ProductImage[]
  variants: ProductVariant[]
  prices: (ProductPrice & { price_list: PriceList })[]
  movements: InventoryMovement[]
  category?: Category
  location?: InventoryLocation
  bundles?: { id: string; name: string; bundle_price: number }[]
  campaigns?: { id: string; name: string; liquidation_price: number }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseResult = Record<string, any>

// ── Product Detail Service ──
export const productDetailService = {
  // Get product by ID with all relations
  async getProductById(id: string): Promise<ProductDetail> {
    // Get main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError) throw productError

    // Get images
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order')

    // Get variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)

    // Get prices with price lists
    const { data: prices } = await supabase
      .from('product_prices')
      .select('*, price_list:price_lists(*)')
      .eq('product_id', id)

    // Get recent movements
    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get category
    let category = undefined
    if (product.category_id) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('id', product.category_id)
        .single()
      category = data || undefined
    }

    // Get location
    let location = undefined
    if (product.location_id) {
      const { data } = await supabase
        .from('inventory_locations')
        .select('*')
        .eq('id', product.location_id)
        .single()
      location = data || undefined
    }

    // Get bundles containing this product
    const { data: bundleItems } = await supabase
      .from('bundle_items')
      .select('bundle:bundles(id, name, bundle_price)')
      .eq('product_id', id)

    const bundles: { id: string; name: string; bundle_price: number }[] = []
    if (bundleItems) {
      for (const item of bundleItems) {
        const bundle = item.bundle as SupabaseResult | null
        if (bundle && bundle.id) {
          bundles.push({
            id: bundle.id,
            name: bundle.name,
            bundle_price: bundle.bundle_price,
          })
        }
      }
    }

    // Get campaigns containing this product
    const { data: campaignItems } = await supabase
      .from('liquidation_items')
      .select('campaign:liquidation_campaigns(id, name), liquidation_price')
      .eq('product_id', id)

    const campaigns: { id: string; name: string; liquidation_price: number }[] = []
    if (campaignItems) {
      for (const item of campaignItems) {
        const campaign = item.campaign as SupabaseResult | null
        if (campaign && campaign.id) {
          campaigns.push({
            id: campaign.id,
            name: campaign.name,
            liquidation_price: item.liquidation_price || 0,
          })
        }
      }
    }

    return {
      ...product,
      images: images || [],
      variants: variants || [],
      prices: (prices || []) as (ProductPrice & { price_list: PriceList })[],
      movements: movements || [],
      category,
      location,
      bundles,
      campaigns,
    }
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const { data: product, error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error || !product) return null
    return this.getProductById(product.id)
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    // Delete related data
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('product_variants').delete().eq('product_id', id)
    await supabase.from('product_prices').delete().eq('product_id', id)
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add image
  async addImage(image: Omit<ProductImage, 'id' | 'created_at'>): Promise<ProductImage> {
    const { data, error } = await supabase
      .from('product_images')
      .insert(image)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete image
  async deleteImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error
  },

  // Set primary image
  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    // Remove primary from all images
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    // Set new primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (error) throw error
  },
}
