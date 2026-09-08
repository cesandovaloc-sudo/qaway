// ─────────────────────────────────────────────────────────────
// CONTRATO commerce v1
// Define el shape de datos que consume el módulo de carrito/pagos
// `@qawaylab/pago` (repo 3-qawaylab-pagos) desde la app de
// inventario. Ambos lados deben cumplir este contrato.
// Versionado semver: v1.0.0
// ─────────────────────────────────────────────────────────────

export type CommerceProductType = 'course' | 'digital' | 'service' | 'physical'

/**
 * Ítem de carrito compatible con `<Checkout items={} />` de
 * @qawaylab/pago. El componente lee de forma flexible:
 *   - id || product_id            → product_id
 *   - title || product_title || name → product_title
 *   - price || unit_price         → unit_price
 *   - quantity (default 1)
 * El adaptador normaliza SIEMPRE los campos canónicos
 * (product_id, title, unit_price, quantity, product_type).
 */
export interface CartItem {
  /** id del producto en la app origen (inventario) */
  product_id: string
  /** nombre visible en el checkout */
  title: string
  /** precio unitario en la moneda configurada */
  unit_price: number
  quantity: number
  product_type: CommerceProductType
  /** imagen de referencia (opcional) */
  image_url?: string | null
  /** metadatos libres de la app origen */
  metadata?: Record<string, unknown>
}

export interface CheckoutRequest {
  items: CartItem[]
  currency: string
  bucketName: string
  userId: string | null
  returnUrl: string
}
