import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/useCart'
import type { CartItem } from '../../../contracts/commerce/v1.types'

const STORAGE_KEY = 'qaway-cart-v1'

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

function serviceItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-one-web',
    title: 'One Web (Landing Page de Alto Impacto)',
    unit_price: 79.9,
    quantity: 1,
    product_type: 'service',
    ...overrides,
  }
}

function physicalItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-zap',
    title: 'Zapatillas Running Pro',
    unit_price: 249.9,
    quantity: 1,
    product_type: 'physical',
    ...overrides,
  }
}

/**
 * Regla de negocio ya establecida: los servicios y cursos son intangibles de
 * compra única. El candado debe vivir en el modelo del carrito —no solo en la
 * vista—, porque si no, el resumen del pedido muestra "3 × One Web" mientras la
 * fila dice "1 (Servicio único)" y el subtotal cobra de más.
 */
describe('useCart — servicios y cursos cuentan una sola vez', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    })
  })

  afterAll(() => {
    // El stub vive en `window`; no se restaura para no romper el aislamiento
    // del resto de la suite, que define el suyo propio.
  })

  beforeEach(() => {
    storage.clear()
  })

  it('agregar el mismo servicio tres veces deja la cantidad en 1', () => {
    const { result } = renderHook(() => useCart())

    act(() => result.current.add(serviceItem()))
    act(() => result.current.add(serviceItem()))
    act(() => result.current.add(serviceItem()))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.count).toBe(1)
    expect(result.current.subtotal).toBe(79.9)
  })

  it('normaliza un carrito ya persistido con la cantidad inflada', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify([serviceItem({ quantity: 3 })]))

    const { result } = renderHook(() => useCart())

    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.count).toBe(1)
    expect(result.current.subtotal).toBe(79.9)
  })

  it('subir la cantidad de un servicio la mantiene en 1', () => {
    const { result } = renderHook(() => useCart())

    act(() => result.current.add(serviceItem()))
    act(() => result.current.updateQuantity('prod-one-web', 5))

    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.subtotal).toBe(79.9)
  })

  it('un producto físico sí acumula cantidad (la regla no lo alcanza)', () => {
    const { result } = renderHook(() => useCart())

    act(() => result.current.add(physicalItem()))
    act(() => result.current.add(physicalItem()))

    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.subtotal).toBe(499.8)
  })

  it('dos servicios distintos se cuentan una vez cada uno', () => {
    const { result } = renderHook(() => useCart())

    act(() => result.current.add(serviceItem()))
    act(() =>
      result.current.add(
        serviceItem({
          product_id: 'prod-web-comercial',
          title: 'Web Comercial Corporativa',
          unit_price: 290,
        }),
      ),
    )
    act(() => result.current.add(serviceItem()))

    expect(result.current.items).toHaveLength(2)
    expect(result.current.count).toBe(2)
    expect(result.current.subtotal).toBe(369.9)
  })
})
