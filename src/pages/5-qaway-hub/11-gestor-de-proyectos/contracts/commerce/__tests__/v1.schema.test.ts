import { describe, it, expect } from 'vitest'
import {
  isRecord,
  isValidCartItem,
  isValidCheckoutRequest,
  parseCheckoutRequest,
} from '../v1.schema'
import { cartItemExample, checkoutRequestExample } from '../v1.examples'
import type { CartItem, CheckoutRequest } from '../v1.types'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'p-1',
    title: 'Producto Test',
    unit_price: 10,
    quantity: 1,
    product_type: 'physical',
    ...overrides,
  }
}

function makeCheckout(overrides: Partial<CheckoutRequest> = {}): CheckoutRequest {
  return {
    items: [makeItem()],
    currency: 'PEN',
    bucketName: 'resources',
    userId: null,
    returnUrl: 'https://inventario.qawaylab.test',
    ...overrides,
  }
}

describe('commerce v1 · isRecord', () => {
  it('acepta objetos planos', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
  })

  it('rechaza null, arrays y primitivos', () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord([])).toBe(false)
    expect(isRecord('x')).toBe(false)
    expect(isRecord(42)).toBe(false)
    expect(isRecord(true)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })
})

describe('commerce v1 · isValidCartItem', () => {
  it('acepta el ejemplo canónico del contrato', () => {
    expect(isValidCartItem(cartItemExample)).toBe(true)
  })

  it('acepta un ítem mínimo sin campos opcionales', () => {
    expect(
      isValidCartItem({
        product_id: 'p-1',
        title: 'Producto',
        unit_price: 10,
        quantity: 1,
        product_type: 'physical',
      }),
    ).toBe(true)
  })

  it('rechaza valores que no son objetos', () => {
    expect(isValidCartItem(null)).toBe(false)
    expect(isValidCartItem([])).toBe(false)
    expect(isValidCartItem('item')).toBe(false)
  })

  it('rechaza product_id ausente o vacío', () => {
    expect(isValidCartItem(makeItem({ product_id: undefined }))).toBe(false)
    expect(isValidCartItem(makeItem({ product_id: '' }))).toBe(false)
    expect(isValidCartItem(makeItem({ product_id: 42 as unknown as string }))).toBe(false)
  })

  it('rechaza title ausente o vacío', () => {
    expect(isValidCartItem(makeItem({ title: undefined }))).toBe(false)
    expect(isValidCartItem(makeItem({ title: '' }))).toBe(false)
  })

  it('rechaza unit_price ausente, no numérico o no finito', () => {
    expect(isValidCartItem(makeItem({ unit_price: undefined }))).toBe(false)
    expect(isValidCartItem(makeItem({ unit_price: '99' as unknown as number }))).toBe(false)
    expect(isValidCartItem(makeItem({ unit_price: NaN }))).toBe(false)
    expect(isValidCartItem(makeItem({ unit_price: Infinity }))).toBe(false)
  })

  it('rechaza quantity ausente, no numérica o menor/igual a 0', () => {
    expect(isValidCartItem(makeItem({ quantity: undefined }))).toBe(false)
    expect(isValidCartItem(makeItem({ quantity: 0 }))).toBe(false)
    expect(isValidCartItem(makeItem({ quantity: -1 }))).toBe(false)
    expect(isValidCartItem(makeItem({ quantity: NaN }))).toBe(false)
    expect(isValidCartItem(makeItem({ quantity: '2' as unknown as number }))).toBe(false)
  })

  it('acepta solo los product_type del enum del contrato', () => {
    for (const type of ['course', 'digital', 'service', 'physical']) {
      expect(isValidCartItem(makeItem({ product_type: type as CartItem['product_type'] }))).toBe(true)
    }
    expect(isValidCartItem(makeItem({ product_type: 'fisico' as CartItem['product_type'] }))).toBe(false)
    expect(isValidCartItem(makeItem({ product_type: undefined }))).toBe(false)
  })
})

describe('commerce v1 · isValidCheckoutRequest', () => {
  it('acepta el ejemplo canónico del contrato', () => {
    expect(isValidCheckoutRequest(checkoutRequestExample)).toBe(true)
  })

  it('rechaza values que no son objetos', () => {
    expect(isValidCheckoutRequest(null)).toBe(false)
    expect(isValidCheckoutRequest([])).toBe(false)
  })

  it('rechaza items ausente, no array o vacío', () => {
    expect(isValidCheckoutRequest(makeCheckout({ items: undefined }))).toBe(false)
    expect(
      isValidCheckoutRequest(makeCheckout({ items: {} as unknown as CheckoutRequest['items'] })),
    ).toBe(false)
    expect(isValidCheckoutRequest(makeCheckout({ items: [] }))).toBe(false)
  })

  it('rechaza si cualquier ítem es inválido', () => {
    expect(isValidCheckoutRequest(makeCheckout({ items: [makeItem({ quantity: 0 })] }))).toBe(false)
  })

  it('rechaza currency ausente o vacío', () => {
    expect(isValidCheckoutRequest(makeCheckout({ currency: undefined }))).toBe(false)
    expect(isValidCheckoutRequest(makeCheckout({ currency: '' }))).toBe(false)
  })

  it('rechaza bucketName ausente o vacío', () => {
    expect(isValidCheckoutRequest(makeCheckout({ bucketName: undefined }))).toBe(false)
    expect(isValidCheckoutRequest(makeCheckout({ bucketName: '' }))).toBe(false)
  })

  it('userId solo admite string o null', () => {
    expect(isValidCheckoutRequest(makeCheckout({ userId: 'uuid-de-usuario' }))).toBe(true)
    expect(isValidCheckoutRequest(makeCheckout({ userId: null }))).toBe(true)
    expect(isValidCheckoutRequest(makeCheckout({ userId: 123 as unknown as CheckoutRequest['userId'] }))).toBe(false)
    expect(isValidCheckoutRequest(makeCheckout({ userId: undefined }))).toBe(false)
  })

  it('rechaza returnUrl ausente o vacío', () => {
    expect(isValidCheckoutRequest(makeCheckout({ returnUrl: undefined }))).toBe(false)
    expect(isValidCheckoutRequest(makeCheckout({ returnUrl: '' }))).toBe(false)
  })
})

describe('commerce v1 · parseCheckoutRequest', () => {
  it('devuelve ok con los datos cuando el payload es válido', () => {
    const result = parseCheckoutRequest(checkoutRequestExample)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual(checkoutRequestExample)
  })

  it('devuelve ok:false con mensaje de error para payload inválido', () => {
    const result = parseCheckoutRequest(makeCheckout({ items: [] }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('commerce v1')
  })
})
