// ─────────────────────────────────────────────────────────────
// Validación en runtime del contrato commerce v1.
// Sin dependencias externas: guardas manuales con tipos inferidos.
// ─────────────────────────────────────────────────────────────
import type { CartItem, CheckoutRequest, CommerceProductType } from './v1.types'

export const COMMERCE_PRODUCT_TYPES: CommerceProductType[] = [
  'course',
  'digital',
  'service',
  'physical',
]

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isValidCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false
  if (typeof value.product_id !== 'string' || value.product_id.length === 0) return false
  if (typeof value.title !== 'string' || value.title.length === 0) return false
  if (typeof value.unit_price !== 'number' || !Number.isFinite(value.unit_price)) return false
  if (
    typeof value.quantity !== 'number' ||
    !Number.isFinite(value.quantity) ||
    value.quantity <= 0
  ) {
    return false
  }
  if (
    typeof value.product_type !== 'string' ||
    !COMMERCE_PRODUCT_TYPES.includes(value.product_type as CommerceProductType)
  ) {
    return false
  }
  return true
}

export function isValidCheckoutRequest(value: unknown): value is CheckoutRequest {
  if (!isRecord(value)) return false
  if (!Array.isArray(value.items) || value.items.length === 0) return false
  if (!value.items.every(isValidCartItem)) return false
  if (typeof value.currency !== 'string' || value.currency.length === 0) return false
  if (typeof value.bucketName !== 'string' || value.bucketName.length === 0) return false
  if (typeof value.userId !== 'string' && value.userId !== null) return false
  if (typeof value.returnUrl !== 'string' || value.returnUrl.length === 0) return false
  return true
}

export type CheckoutParseResult =
  | { ok: true; data: CheckoutRequest }
  | { ok: false; error: string }

export function parseCheckoutRequest(value: unknown): CheckoutParseResult {
  if (isValidCheckoutRequest(value)) return { ok: true, data: value }
  return { ok: false, error: 'Payload inválido según contrato commerce v1' }
}
