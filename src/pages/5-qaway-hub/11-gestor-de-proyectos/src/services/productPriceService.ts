import { supabase } from '@/config/supabase'
import type { ProductPrice } from '@/types'

// ── Interface ──
export interface ProductPricesAdapter {
  getProductPrices(productId: string): Promise<ProductPrice[]>
  setProductPrice(productId: string, priceListId: string, price: number, minQuantity?: number): Promise<ProductPrice | null>
  removeProductPrice(productId: string, priceListId: string): Promise<boolean>
  bulkSetPrices(productId: string, prices: { priceListId: string; price: number; minQuantity?: number }[]): Promise<boolean>
}

// ── Supabase Implementation ──
export const supabaseProductPriceAdapter: ProductPricesAdapter = {
  async getProductPrices(productId) {
    const { data, error } = await supabase
      .from('product_prices')
      .select('*')
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching product prices:', error)
      return []
    }
    return data || []
  },

  async setProductPrice(productId, priceListId, price, minQuantity = 1) {
    // Upsert: update if exists, insert if not
    const { data, error } = await supabase
      .from('product_prices')
      .upsert(
        {
          product_id: productId,
          price_list_id: priceListId,
          price,
          min_quantity: minQuantity,
        },
        { onConflict: 'product_id,price_list_id,min_quantity' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error setting product price:', error)
      return null
    }
    return data
  },

  async removeProductPrice(productId, priceListId) {
    const { error } = await supabase
      .from('product_prices')
      .delete()
      .eq('product_id', productId)
      .eq('price_list_id', priceListId)

    return !error
  },

  async bulkSetPrices(productId, prices) {
    const records = prices.map((p) => ({
      product_id: productId,
      price_list_id: p.priceListId,
      price: p.price,
      min_quantity: p.minQuantity || 1,
    }))

    const { error } = await supabase
      .from('product_prices')
      .upsert(records, { onConflict: 'product_id,price_list_id,min_quantity' })

    return !error
  },
}

// ── Service ──
let adapter: ProductPricesAdapter = supabaseProductPriceAdapter

export function setProductPriceAdapter(newAdapter: ProductPricesAdapter) {
  adapter = newAdapter
}

export const productPriceService = {
  async getProductPrices(productId: string): Promise<ProductPrice[]> {
    return adapter.getProductPrices(productId)
  },

  async setProductPrice(
    productId: string,
    priceListId: string,
    price: number,
    minQuantity?: number
  ): Promise<ProductPrice | null> {
    return adapter.setProductPrice(productId, priceListId, price, minQuantity)
  },

  async removeProductPrice(productId: string, priceListId: string): Promise<boolean> {
    return adapter.removeProductPrice(productId, priceListId)
  },

  async bulkSetPrices(
    productId: string,
    prices: { priceListId: string; price: number; minQuantity?: number }[]
  ): Promise<boolean> {
    return adapter.bulkSetPrices(productId, prices)
  },

  // Helper: calculate discount percentage
  calculateDiscount(originalPrice: number, discountedPrice: number): number {
    if (originalPrice <= 0) return 0
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
  },

  // Helper: calculate price after discount
  applyDiscount(price: number, discountPercent: number): number {
    return Math.round(price * (1 - discountPercent / 100) * 100) / 100
  },

  // Helper: format price
  formatPrice(price: number, currency = 'S/'): string {
    return `${currency} ${price.toFixed(2)}`
  },
}
