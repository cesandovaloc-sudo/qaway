// ── Tipos ambiente para @qawaylab/pago (módulo JS sin tipos propios) ──
// El contrato tipado de datos de carrito vive en contracts/commerce/v1.
// Aquí solo se declara la superficie del módulo para poder importarlo en TS.

declare module '@qawaylab/pago' {
  type ComponentType<P = Record<string, unknown>> = import('react').ComponentType<P>

  export interface QawaServices {
    products: Record<string, unknown>
    orders: Record<string, unknown>
    payments: Record<string, unknown>
  }

  export function createQawaServices(
    supabase: unknown,
    options?: Record<string, unknown>
  ): QawaServices

  export const Checkout: ComponentType
  export const PurchaseHistory: ComponentType
  export const PaymentsPanel: ComponentType
  export const ProductsManager: ComponentType
}

// Helpers de normalización del storefront (utils.js) — named exports.
// La declaración exacta tiene precedencia sobre la wildcard de abajo.
declare module '@qawaylab/pago/components/storefront/utils' {
  export function itemId(item: unknown): string | null
  export function itemTitle(item: unknown): string
  export function itemPrice(item: unknown): number
  export function itemQty(item: unknown): number
  export function itemImage(item: unknown): string | null
  export function itemCategory(item: unknown): string
  export function money(value: unknown, currency?: string): string
}

// Componentes del storefront (piel de tienda) — JS sin tipos propios.
// Props tipadas de forma laxa (Record<string, unknown>) para poder importarlos
// y renderizarlos en TS; el contrato de datos vive en contracts/commerce/v1.
declare module '@qawaylab/pago/components/storefront/*' {
  const Component: import('react').ComponentType<Record<string, unknown>>
  export default Component
}
