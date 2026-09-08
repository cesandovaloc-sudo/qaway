// ─────────────────────────────────────────────────────────────
// Adaptador de comercio — conecta la app de inventario con el
// módulo de carrito/pagos `@qawaylab/pago` (3-qawaylab-pagos).
// La UI depende de esta interfaz, no del proveedor concreto
// (estándar §21.5 / §49).
// ─────────────────────────────────────────────────────────────
import type { CartItem, CheckoutRequest } from '../../../contracts/commerce/v1.types'
import { parseCheckoutRequest } from '../../../contracts/commerce/v1.schema'
import { siteConfig } from '@/config/site'

/**
 * Fuente de producto aceptada por el adaptador.
 * Tipo estructural: cualquier objeto con estos campos mapea al
 * carrito (el `Product` del inventario cumple este contrato).
 */
export interface CommerceProductSource {
  id: string
  name: string
  sku?: string | null
  base_price?: number | null
  images?: Array<{ processed_url?: string | null; original_url?: string | null }> | null
}

export interface ToCartOptions {
  quantity?: number
  /** Precio distinto al base (p. ej. precio de liquidación) */
  priceOverride?: number
}

export interface CommerceAdapter {
  /** true cuando el carrito está configurado (VITE_CART_APP_URL) */
  isConfigured(): boolean
  /** Convierte un producto del inventario a ítem de carrito (contrato commerce v1) */
  toCartItem(product: CommerceProductSource, options?: ToCartOptions): CartItem
  /** Convierte varios productos del inventario a ítems de carrito */
  toCartItems(products: CommerceProductSource[], options?: ToCartOptions): CartItem[]
  /** Valida y prepara la solicitud de checkout que consumirá el módulo @qawaylab/pago */
  createCheckout(items: CartItem[], options?: Partial<CheckoutRequest>): CheckoutRequest
}

function productImageUrl(product: CommerceProductSource): string | null {
  const image = product.images?.[0]
  if (!image) return null
  return image.processed_url || image.original_url || null
}

export const qawaCommerceAdapter: CommerceAdapter = {
  isConfigured: () => siteConfig.cart.enabled,

  toCartItem(product, options = {}) {
    const price = options.priceOverride ?? product.base_price ?? 0
    return {
      product_id: product.id,
      title: product.name,
      unit_price: price,
      quantity: options.quantity ?? 1,
      product_type: 'physical',
      image_url: productImageUrl(product),
      metadata: { sku: product.sku ?? null },
    }
  },

  toCartItems(products, options = {}) {
    return products.map((product) => qawaCommerceAdapter.toCartItem(product, options))
  },

  createCheckout(items, options = {}) {
    const request: CheckoutRequest = {
      items,
      currency: options.currency ?? 'PEN',
      bucketName: options.bucketName ?? 'resources',
      userId: options.userId ?? null,
      returnUrl: options.returnUrl ?? siteConfig.siteUrl,
    }
    const parsed = parseCheckoutRequest(request)
    if (!parsed.ok) throw new Error(parsed.error)
    return parsed.data
  },
}
