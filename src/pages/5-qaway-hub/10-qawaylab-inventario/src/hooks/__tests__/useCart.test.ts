import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCart } from '../useCart'
import type { CartItem } from '../../../contracts/commerce/v1.types'

const STORAGE_KEY = 'qaway-cart-v1'

/** Stub de localStorage: en este entorno el global de Node (experimental)
 *  pisa al de jsdom y queda undefined. Lo definimos explícitamente. */
class LocalStorageMock {
  private store = new Map<string, string>()

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

const storage = new LocalStorageMock()

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-1',
    title: 'Producto Test',
    unit_price: 100,
    quantity: 1,
    product_type: 'digital',
    ...overrides,
  }
}

describe('useCart', () => {
  beforeAll(() => {
    // window.localStorage es lo que usa el hook; el global es el que usan los tests
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('localStorage', storage)
  })

  beforeEach(() => {
    storage.clear()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('arranca con el carrito vacío', () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('add: agrega un ítem nuevo y calcula count/subtotal', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem({ quantity: 2 }))
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product_id).toBe('prod-1')
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.count).toBe(2)
    expect(result.current.subtotal).toBe(200)
  })

  it('add: suma cantidades cuando el producto ya existe (merge por product_id)', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.add(makeItem({ quantity: 3 }))
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(4)
    expect(result.current.count).toBe(4)
    expect(result.current.subtotal).toBe(400)
  })

  it('add: al repetir un producto conserva el precio del ítem original', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.add(makeItem({ unit_price: 999 }))
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.items[0].unit_price).toBe(100)
    expect(result.current.subtotal).toBe(200)
  })

  it('add: mantiene productos distintos como ítems separados', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.add(makeItem({ product_id: 'prod-2', title: 'Otro', unit_price: 50 }))
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.count).toBe(2)
    expect(result.current.subtotal).toBe(150)
  })

  it('updateQuantity: cambia la cantidad de un ítem existente', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.updateQuantity('prod-1', 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.count).toBe(5)
    expect(result.current.subtotal).toBe(500)
  })

  it('updateQuantity: con cantidad <= 0 elimina el ítem', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.updateQuantity('prod-1', 0)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it('remove: elimina el ítem por product_id', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.add(makeItem({ product_id: 'prod-2', title: 'Otro' }))
      result.current.remove('prod-1')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product_id).toBe('prod-2')
  })

  it('clear: vacía el carrito por completo', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem())
      result.current.add(makeItem({ product_id: 'prod-2', title: 'Otro' }))
      result.current.clear()
    })

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('persiste cada cambio en localStorage', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.add(makeItem({ quantity: 2 }))
    })
    // flush del efecto de persistencia
    act(() => {})

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      product_id: 'prod-1',
      quantity: 2,
      unit_price: 100,
    })

    act(() => {
      result.current.remove('prod-1')
    })
    act(() => {})
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([])
  })

  it('restaura el carrito desde localStorage al montar', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([makeItem({ quantity: 3 })]))

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.count).toBe(3)
    expect(result.current.subtotal).toBe(300)
  })

  it('descarta los datos corruptos que no cumplen el contrato commerce v1', () => {
    const valid = makeItem()
    const invalid = {
      product_id: 'prod-2',
      title: 'Sin precio válido',
      unit_price: 'no-numero',
      quantity: 1,
      product_type: 'digital',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, invalid]))

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product_id).toBe('prod-1')
  })

  it('arranca vacío si el JSON guardado está corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{json-roto')

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])
  })

  it('no se rompe si localStorage no está disponible', () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('storage denied')
    })
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('storage denied')
    })

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])

    act(() => {
      result.current.add(makeItem())
    })
    act(() => {})

    // El carrito sigue funcionando en memoria aunque falle la persistencia
    expect(result.current.items).toHaveLength(1)
    expect(result.current.count).toBe(1)
  })
})
