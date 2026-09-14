// ── Tipos ambiente para los componentes de la tienda interna de inventario ──
// Son .jsx sin tipos propios: se declara su superficie para poder importarlos
// desde TypeScript. El contrato tipado de datos del carrito vive en
// contracts/commerce/v1 y las props se declaran laxas a propósito.

declare module '@/components/checkout/Checkout' {
  const Component: import('react').ComponentType<Record<string, unknown>>
  export default Component
}

declare module '@/components/checkout/TiendaShell' {
  const Component: import('react').ComponentType<Record<string, unknown>>
  export default Component
}

declare module '@/components/checkout/PurchaseHistory' {
  const Component: import('react').ComponentType<Record<string, unknown>>
  export default Component
}

declare module '@/components/checkout/paymentConfig' {
  export interface PaymentMethod {
    id: string
    provider: string
    label: string
    description: string
    enabled: boolean
    notice?: string
    showAccounts?: boolean
  }

  export const ACCOUNT_INFO: Record<string, unknown>
  export const MANUAL_CONTACT: Record<string, unknown>
  export const PAYMENT_METHODS: PaymentMethod[]

  export function findPaymentMethod(id: unknown): PaymentMethod | null
  export function firstEnabledMethod(): PaymentMethod | null
  export function paymentSteps(id: unknown): Array<Record<string, unknown>>
  export function whatsappOrderLink(args: Record<string, unknown>): string
}

// Componentes del storefront (piel de tienda): CartView, CartItems,
// OrderSummary, CheckoutSteps, ProductCard, ProductGrid, ProductDetail.
declare module '@/components/checkout/storefront/*' {
  const Component: import('react').ComponentType<Record<string, unknown>>
  export default Component
}

// Helpers del storefront. Reglas del carrito compartidas (identidad canónica,
// compra única de servicios y cursos, normalización de carritos persistidos).
// La declaración exacta tiene precedencia sobre la wildcard de arriba.
declare module '@/components/checkout/storefront/utils' {
  export function itemKey(item: unknown): string
  export function itemTitle(item: unknown): string
  export function itemPrice(item: unknown): number
  export function itemQty(item: unknown): number
  export function itemImage(item: unknown): string | null
  export function itemCategory(item: unknown): string
  export function isSingleInstance(item: unknown): boolean
  export function normalizeCart(items: unknown): unknown[]
  export function money(value: unknown, currency?: string): string
  export function formatBytes(bytes: unknown): string
}
