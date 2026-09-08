import { describe, it, expect } from 'vitest'
import {
  itemId,
  itemTitle,
  itemPrice,
  itemQty,
  itemImage,
  itemCategory,
  money,
} from '@qawaylab/pago/components/storefront/utils'

describe('storefront utils · itemId', () => {
  it('prioriza id sobre product_id y uid', () => {
    expect(itemId({ id: 'a', product_id: 'b', uid: 'c' })).toBe('a')
  })

  it('cae a product_id y luego a uid', () => {
    expect(itemId({ product_id: 'b' })).toBe('b')
    expect(itemId({ uid: 'c' })).toBe('c')
  })

  it('devuelve null sin id, vacío o con undefined', () => {
    expect(itemId({})).toBeNull()
    expect(itemId({ id: '' })).toBeNull()
    expect(itemId(undefined)).toBeNull()
  })
})

describe('storefront utils · itemTitle', () => {
  it('prioriza title sobre product_title y name', () => {
    expect(itemTitle({ title: 'T', product_title: 'P', name: 'N' })).toBe('T')
  })

  it('cae a product_title y luego a name', () => {
    expect(itemTitle({ product_title: 'P' })).toBe('P')
    expect(itemTitle({ name: 'N' })).toBe('N')
  })

  it('no usa title vacío y cae al siguiente', () => {
    expect(itemTitle({ title: '', name: 'N' })).toBe('N')
  })

  it('devuelve el fallback "Producto" sin nombre', () => {
    expect(itemTitle({})).toBe('Producto')
    expect(itemTitle(undefined)).toBe('Producto')
  })
})

describe('storefront utils · itemPrice', () => {
  it('prioriza price sobre unit_price y base_price', () => {
    expect(itemPrice({ price: 10, unit_price: 20, base_price: 30 })).toBe(10)
  })

  it('cae a unit_price y luego a base_price', () => {
    expect(itemPrice({ unit_price: 20 })).toBe(20)
    expect(itemPrice({ base_price: 30 })).toBe(30)
  })

  it('conserva el 0 (0 ?? x no pisa)', () => {
    expect(itemPrice({ price: 0, unit_price: 20 })).toBe(0)
  })

  it('devuelve 0 para valores ausentes o no numéricos', () => {
    expect(itemPrice({})).toBe(0)
    expect(itemPrice(undefined)).toBe(0)
    expect(itemPrice({ price: '10' })).toBe(0)
    expect(itemPrice({ price: null })).toBe(0)
  })
})

describe('storefront utils · itemQty', () => {
  it('devuelve la cantidad válida', () => {
    expect(itemQty({ quantity: 5 })).toBe(5)
  })

  it('devuelve 1 para ausente, inválida o <= 0', () => {
    expect(itemQty({})).toBe(1)
    expect(itemQty(undefined)).toBe(1)
    expect(itemQty({ quantity: 0 })).toBe(1)
    expect(itemQty({ quantity: -2 })).toBe(1)
    expect(itemQty({ quantity: '3' })).toBe(1)
  })
})

describe('storefront utils · itemImage', () => {
  it('prioriza image_url sobre image e images[]', () => {
    expect(
      itemImage({
        image_url: 'https://cdn/q/url.jpg',
        image: 'https://cdn/q/img.jpg',
        images: [{ processed_url: 'https://cdn/q/proc.jpg' }],
      }),
    ).toBe('https://cdn/q/url.jpg')
  })

  it('cae a image, processed_url y original_url', () => {
    expect(itemImage({ image: 'https://cdn/q/img.jpg' })).toBe('https://cdn/q/img.jpg')
    expect(itemImage({ images: [{ processed_url: 'https://cdn/q/proc.jpg' }] })).toBe(
      'https://cdn/q/proc.jpg',
    )
    expect(itemImage({ images: [{ original_url: 'https://cdn/q/orig.jpg' }] })).toBe(
      'https://cdn/q/orig.jpg',
    )
  })

  it('devuelve null sin imágenes', () => {
    expect(itemImage({})).toBeNull()
    expect(itemImage(undefined)).toBeNull()
    expect(itemImage({ images: [] })).toBeNull()
  })
})

describe('storefront utils · itemCategory', () => {
  it('devuelve la categoría', () => {
    expect(itemCategory({ category: 'Ropa' })).toBe('Ropa')
  })

  it('devuelve string vacío sin categoría o vacía', () => {
    expect(itemCategory({})).toBe('')
    expect(itemCategory({ category: '' })).toBe('')
    expect(itemCategory(undefined)).toBe('')
  })
})

describe('storefront utils · money', () => {
  it('formatea con S/ y 2 decimales', () => {
    expect(money(249.9)).toBe('S/ 249.90')
    expect(money(10)).toBe('S/ 10.00')
  })

  it('acepta una moneda custom', () => {
    expect(money(10, '$')).toBe('$ 10.00')
    // el currency se concatena tal cual: 'USD ' + ' ' + valor
    expect(money(10, 'USD ')).toBe('USD  10.00')
  })

  it('formatea valores negativos', () => {
    expect(money(-5)).toBe('S/ -5.00')
  })

  it('usa 0 para valores inválidos', () => {
    expect(money(NaN)).toBe('S/ 0.00')
    expect(money(Infinity)).toBe('S/ 0.00')
    expect(money('10' as unknown as number)).toBe('S/ 0.00')
    expect(money(null as unknown as number)).toBe('S/ 0.00')
    expect(money(undefined as unknown as number)).toBe('S/ 0.00')
  })
})
