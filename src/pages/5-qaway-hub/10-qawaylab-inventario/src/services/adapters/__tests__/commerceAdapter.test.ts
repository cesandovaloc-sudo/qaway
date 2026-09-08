import { describe, it, expect } from 'vitest'
import { qawaCommerceAdapter, type CommerceProductSource } from '../commerceAdapter'
import { isValidCartItem, isValidCheckoutRequest, parseCheckoutRequest } from '../../../../contracts/commerce/v1.schema'
import { checkoutRequestExample } from '../../../../contracts/commerce/v1.examples'

const product: CommerceProductSource = {
  id: 'prod-1',
  name: 'Zapatillas Running Pro',
  sku: 'RUN-001',
  base_price: 249.9,
  images: [{ processed_url: 'https://cdn.ejemplo.com/procesada.jpg', original_url: 'https://cdn.ejemplo.com/original.jpg' }],
}

describe('commerceAdapter', () => {
  it('mapea un producto del inventario a un ítem de carrito (contrato v1)', () => {
    const item = qawaCommerceAdapter.toCartItem(product)

    expect(item).toEqual({
      product_id: 'prod-1',
      title: 'Zapatillas Running Pro',
      unit_price: 249.9,
      quantity: 1,
      product_type: 'physical',
      image_url: 'https://cdn.ejemplo.com/procesada.jpg',
      metadata: { sku: 'RUN-001' },
    })
    expect(isValidCartItem(item)).toBe(true)
  })

  it('aplica cantidad y precio override', () => {
    const item = qawaCommerceAdapter.toCartItem(product, {
      quantity: 3,
      priceOverride: 199.9,
    })
    expect(item.quantity).toBe(3)
    expect(item.unit_price).toBe(199.9)
  })

  it('usa precio 0 cuando el producto no tiene base_price', () => {
    const item = qawaCommerceAdapter.toCartItem({ id: 'x', name: 'Sin precio' })
    expect(item.unit_price).toBe(0)
  })

  it('mapea varios productos a ítems válidos', () => {
    const items = qawaCommerceAdapter.toCartItems([product, { id: 'p2', name: 'Medias', base_price: 29.9 }])
    expect(items).toHaveLength(2)
    expect(items.every(isValidCartItem)).toBe(true)
  })

  it('construye un checkout válido con defaults (PEN, bucket resources)', () => {
    const items = qawaCommerceAdapter.toCartItems([product])
    const checkout = qawaCommerceAdapter.createCheckout(items)

    expect(checkout.currency).toBe('PEN')
    expect(checkout.bucketName).toBe('resources')
    expect(isValidCheckoutRequest(checkout)).toBe(true)
    const parsed = parseCheckoutRequest(checkout)
    expect(parsed.ok).toBe(true)
  })

  it('rechaza un checkout con carrito vacío', () => {
    expect(() => qawaCommerceAdapter.createCheckout([])).toThrow('Payload inválido')
  })
})

describe('contrato commerce v1 (schema)', () => {
  it('valida el ejemplo del contrato', () => {
    expect(isValidCheckoutRequest(checkoutRequestExample)).toBe(true)
  })

  it('rechaza ítems con campos inválidos', () => {
    expect(isValidCartItem({ product_id: '', title: 'x', unit_price: 1, quantity: 1, product_type: 'physical' })).toBe(false)
    expect(isValidCartItem({ product_id: 'a', title: 'x', unit_price: 1, quantity: 0, product_type: 'physical' })).toBe(false)
    expect(isValidCartItem({ product_id: 'a', title: 'x', unit_price: 1, quantity: 1, product_type: 'nave' })).toBe(false)
    expect(isValidCartItem(null)).toBe(false)
    expect(isValidCartItem('x')).toBe(false)
  })

  it('rechaza payloads que no son checkout', () => {
    expect(isValidCheckoutRequest(null)).toBe(false)
    expect(isValidCheckoutRequest({})).toBe(false)
    expect(isValidCheckoutRequest({ items: [], currency: 'PEN', bucketName: 'b', userId: null, returnUrl: 'u' })).toBe(false)
  })
})
