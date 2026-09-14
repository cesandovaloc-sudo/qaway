import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CartPage from '@/pages/CartPage'
import type { CartItem } from '../../../contracts/commerce/v1.types'

const STORAGE_KEY = 'qaway-cart-v1'

// Supabase se mockea: el carrito consulta `products` al resolver `?add=`.
const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }))

vi.mock('@/config/supabase', () => ({
  supabase: { from: fromMock },
}))

type EqCall = [string, unknown]
const eqCalls: EqCall[] = []

/** Cadena fluida mínima de PostgREST: select().eq().limit() → resultado. */
function makeQuery(result: { data: unknown[] }) {
  const query = {
    select: () => query,
    eq: (column: string, value: unknown) => {
      eqCalls.push([column, value])
      return query
    },
    limit: () => Promise.resolve(result),
  }
  return query
}

function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '3f6a1c92-0f4e-4a1b-9c2d-7e5b8a1d0c33',
    slug: 'one-web',
    sku: 'QW-ONE-WEB',
    title: 'One Web (Landing Page de Alto Impacto)',
    name: 'One Web',
    base_price: 79.9,
    price: 79.9,
    type: 'service',
    images: [],
    image_url: null,
    ...overrides,
  }
}

// Stub de localStorage: en este entorno el global de Node pisa al de jsdom
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
    title: 'Zapatillas Running Pro',
    unit_price: 249.9,
    quantity: 2,
    product_type: 'physical',
    ...overrides,
  }
}

function seedCart(items: CartItem[]) {
  storage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function renderPage(entry = '/carrito') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <CartPage />
    </MemoryRouter>,
  )
}

describe('CartPage — tienda · «Mi pedido» (storefront)', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('localStorage', storage)
  })

  beforeEach(() => {
    storage.clear()
    eqCalls.length = 0
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('carrito vacío: encabezado del storefront y CTA al catálogo', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Mi pedido.' })).toBeInTheDocument()
    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
      'href',
      '/landings/desarrollo-web-qaway#precios',
    )

    // Misma cabecera que el checkout, con las migas arriba del kicker
    const steps = screen.getByRole('list', { name: 'Pasos de la compra' })
    const kicker = screen.getByText('Compra')
    expect(
      Boolean(steps.compareDocumentPosition(kicker) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true)
  })

  it('restaura el carrito de localStorage y muestra ítems, resumen y CTA al checkout', () => {
    seedCart([
      makeItem(),
      makeItem({ product_id: 'prod-2', title: 'Medias Deportivas', unit_price: 29.9, quantity: 1 }),
    ])
    renderPage()

    // Ítems (CartItems)
    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90 c/u')).toBeInTheDocument()
    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()

    // Resumen (OrderSummary): productos + subtotal 2×249.9 + 29.9 = 529.70
    expect(screen.getByRole('heading', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('S/ 529.70')).toBeInTheDocument()

    // El pago ya no vive en el carrito: es el paso 2
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continuar con el pedido' })).toHaveAttribute(
      'href',
      '/carrito/checkout',
    )

    // La cabecera vive DENTRO de la rejilla: así el resumen arranca a su misma
    // altura y el total se ve de entrada, sin bajar por la lista.
    const rejilla = screen
      .getByRole('heading', { name: 'Mi pedido.' })
      .closest('.cart-layout--cabecera')
    expect(rejilla).not.toBeNull()
    expect(rejilla).toContainElement(screen.getByRole('heading', { name: 'Resumen' }))
  })

  it('los controles +/− actualizan la cantidad y persisten en localStorage', async () => {
    const user = userEvent.setup()
    seedCart([makeItem()])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].quantity).toBe(3)
    expect(screen.getAllByText('S/ 749.70').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].quantity).toBe(2)
  })

  it('restar en cantidad 1 elimina el ítem y muestra el estado vacío', async () => {
    const user = userEvent.setup()
    seedCart([makeItem({ quantity: 1 })])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Restar uno' }))

    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
  })

  it('Retirar elimina el ítem del carrito', async () => {
    const user = userEvent.setup()
    seedCart([makeItem()])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Retirar' }))

    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
  })

  it('un servicio se cobra una sola vez aunque el carrito guardado traiga cantidad 3', () => {
    seedCart([
      makeItem({
        product_id: 'prod-one-web',
        title: 'One Web (Landing Page de Alto Impacto)',
        unit_price: 79.9,
        quantity: 3,
        product_type: 'service',
      }),
    ])
    renderPage()

    // La fila y el resumen deben decir lo mismo: 1 unidad
    expect(screen.getByText('1 (Servicio único)')).toBeInTheDocument()
    expect(screen.getByText('1 × One Web (Landing Page de Alto Impacto)')).toBeInTheDocument()
    expect(screen.queryByText('3 × One Web (Landing Page de Alto Impacto)')).not.toBeInTheDocument()
    // Y el subtotal, el real: 79.90 y no 239.70
    expect(screen.getAllByText('S/ 79.90').length).toBeGreaterThan(0)
    expect(screen.queryByText('S/ 239.70')).not.toBeInTheDocument()
  })

  // ── Regresión: el filtro mezclaba uuid con text y Postgres devolvía 22P02,
  // dejando el pedido vacío al entrar desde la landing. ──
  describe('resolución del producto entrante (?add=)', () => {
    it('con un slug de texto consulta por slug, nunca por id', async () => {
      fromMock.mockReturnValue(makeQuery({ data: [productRow()] }))

      renderPage('/carrito?add=one-web')

      expect(await screen.findByText('One Web (Landing Page de Alto Impacto)')).toBeInTheDocument()
      expect(eqCalls).toEqual([['slug', 'one-web']])
    })

    it('con un UUID consulta por id, nunca por slug', async () => {
      const uuid = '3f6a1c92-0f4e-4a1b-9c2d-7e5b8a1d0c33'
      fromMock.mockReturnValue(makeQuery({ data: [productRow()] }))

      renderPage(`/carrito?add=${uuid}`)

      expect(await screen.findByText('One Web (Landing Page de Alto Impacto)')).toBeInTheDocument()
      expect(eqCalls).toEqual([['id', uuid]])
    })

    it('si el slug no existe, cae al sku (mismo tipo text)', async () => {
      fromMock
        .mockReturnValueOnce(makeQuery({ data: [] }))
        .mockReturnValueOnce(makeQuery({ data: [productRow({ slug: null, sku: 'QW-ONE-WEB' })] }))

      renderPage('/carrito?add=QW-ONE-WEB')

      expect(await screen.findByText('One Web (Landing Page de Alto Impacto)')).toBeInTheDocument()
      expect(eqCalls).toEqual([
        ['slug', 'QW-ONE-WEB'],
        ['sku', 'QW-ONE-WEB'],
      ])
    })
  })
})
