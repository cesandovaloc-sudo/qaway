import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  qawaCommerceAdapter,
  type CommerceProductSource,
} from '../adapters/commerceAdapter'
import { isValidCartItem, isValidCheckoutRequest } from '../../../contracts/commerce/v1.schema'
import type { CartItem } from '../../../contracts/commerce/v1.types'
import { siteConfig } from '@/config/site'

// siteConfig se calcula al importar desde import.meta.env; lo fijamos para
// que las pruebas sean deterministas (isConfigured y returnUrl por defecto).
vi.mock('@/config/site', () => ({
  siteConfig: {
    siteUrl: 'https://inventario.qawaylab.test',
    appUrl: 'https://app.qawaylab.test',
    whatsapp: null,
    phone: null,
    cart: { appUrl: 'https://carrito.qawaylab.test', enabled: true },
  },
}))

function makeProduct(overrides: Partial<CommerceProductSource> = {}): CommerceProductSource {
  return {
    id: 'prod-123',
    name: 'Zapatillas Running Pro',
    sku: 'RUN-001',
    base_price: 249.9,
    images: [
      {
        processed_url: 'https://cdn.qawaylab.com/processed.jpg',
        original_url: 'https://cdn.qawaylab.com/original.jpg',
      },
    ],
    ...overrides,
  }
}

const product = makeProduct()

const expectedItem: CartItem = {
  product_id: 'prod-123',
  title: 'Zapatillas Running Pro',
  unit_price: 249.9,
  quantity: 1,
  product_type: 'physical',
  image_url: 'https://cdn.qawaylab.com/processed.jpg',
  metadata: { sku: 'RUN-001' },
}

describe('qawaCommerceAdapter', () => {
  beforeEach(() => {
    siteConfig.cart.enabled = true
  })

  describe('isConfigured', () => {
    it('true cuando el carrito está activo', () => {
      expect(qawaCommerceAdapter.isConfigured()).toBe(true)
    })

    it('false cuando el carrito está desactivado', () => {
      siteConfig.cart.enabled = false
      expect(qawaCommerceAdapter.isConfigured()).toBe(false)
    })
  })

  describe('toCartItem', () => {
    it('convierte un producto del inventario al ítem canónico del contrato v1', () => {
      expect(qawaCommerceAdapter.toCartItem(product)).toEqual(expectedItem)
    })

    it('el ítem resultante cumple el contrato v1', () => {
      expect(isValidCartItem(qawaCommerceAdapter.toCartItem(product))).toBe(true)
    })

    it('aplica la cantidad desde las opciones', () => {
      expect(qawaCommerceAdapter.toCartItem(product, { quantity: 3 }).quantity).toBe(3)
    })

    it('priceOverride gana sobre base_price', () => {
      const item = qawaCommerceAdapter.toCartItem(product, { priceOverride: 199.9 })
      expect(item.unit_price).toBe(199.9)
    })

    it('priceOverride en 0 se respeta (0 ?? base_price conserva el 0)', () => {
      const item = qawaCommerceAdapter.toCartItem(product, { priceOverride: 0 })
      expect(item.unit_price).toBe(0)
    })

    it('usa 0 como precio cuando base_price es nulo', () => {
      const item = qawaCommerceAdapter.toCartItem(makeProduct({ base_price: null }))
      expect(item.unit_price).toBe(0)
    })

    it('toma processed_url como imagen de referencia', () => {
      expect(qawaCommerceAdapter.toCartItem(product).image_url).toBe(
        'https://cdn.qawaylab.com/processed.jpg',
      )
    })

    it('cae a original_url cuando no hay processed_url', () => {
      const item = qawaCommerceAdapter.toCartItem(
        makeProduct({ images: [{ original_url: 'https://cdn.qawaylab.com/original.jpg' }] }),
      )
      expect(item.image_url).toBe('https://cdn.qawaylab.com/original.jpg')
    })

    it('deja image_url en null cuando no hay imágenes', () => {
      const item = qawaCommerceAdapter.toCartItem(makeProduct({ images: null }))
      expect(item.image_url).toBeNull()
    })

    it('mapea sku nulo a metadata.sku null', () => {
      const item = qawaCommerceAdapter.toCartItem(makeProduct({ sku: null }))
      expect(item.metadata).toEqual({ sku: null })
    })
  })

  describe('toCartItems', () => {
    it('mapea todos los productos preservando el orden y aplicando opciones', () => {
      const items = qawaCommerceAdapter.toCartItems(
        [product, makeProduct({ id: 'prod-456', name: 'Medias Deportivas', base_price: 29.9 })],
        { quantity: 2 },
      )

      expect(items).toHaveLength(2)
      expect(items[0].product_id).toBe('prod-123')
      expect(items[0].quantity).toBe(2)
      expect(items[1].product_id).toBe('prod-456')
      expect(items[1].title).toBe('Medias Deportivas')
      expect(items[1].unit_price).toBe(29.9)
      expect(items[1].quantity).toBe(2)
    })

    it('devuelve array vacío sin productos', () => {
      expect(qawaCommerceAdapter.toCartItems([])).toEqual([])
    })

    it('cada ítem resultante cumple el contrato v1', () => {
      const items = qawaCommerceAdapter.toCartItems([
        product,
        makeProduct({ id: 'prod-456', name: 'Medias Deportivas' }),
      ])
      expect(items.every(isValidCartItem)).toBe(true)
    })
  })

  describe('createCheckout', () => {
    it('aplica los defaults del contrato (PEN, resources, userId null, returnUrl del sitio)', () => {
      const checkout = qawaCommerceAdapter.createCheckout([expectedItem])

      expect(checkout).toEqual({
        items: [expectedItem],
        currency: 'PEN',
        bucketName: 'resources',
        userId: null,
        returnUrl: siteConfig.siteUrl,
      })
    })

    it('permite sobrescribir currency, bucketName, userId y returnUrl', () => {
      const checkout = qawaCommerceAdapter.createCheckout([expectedItem], {
        currency: 'USD',
        bucketName: 'vouchers',
        userId: 'user-123',
        returnUrl: 'https://inventario.qawaylab.test/gracias',
      })

      expect(checkout.currency).toBe('USD')
      expect(checkout.bucketName).toBe('vouchers')
      expect(checkout.userId).toBe('user-123')
      expect(checkout.returnUrl).toBe('https://inventario.qawaylab.test/gracias')
    })

    it('el resultado cumple el contrato v1', () => {
      const checkout = qawaCommerceAdapter.createCheckout([expectedItem])
      expect(isValidCheckoutRequest(checkout)).toBe(true)
    })

    it('lanza error si algún ítem no cumple el contrato', () => {
      const invalido = { ...expectedItem, quantity: 0 }
      expect(() => qawaCommerceAdapter.createCheckout([invalido])).toThrow('commerce v1')
    })

    it('lanza error con items vacíos', () => {
      expect(() => qawaCommerceAdapter.createCheckout([])).toThrow('commerce v1')
    })
  })
})
