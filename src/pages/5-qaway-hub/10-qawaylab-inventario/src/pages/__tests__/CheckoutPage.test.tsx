import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CheckoutPage from '@/pages/CheckoutPage'
import type { Session } from '@supabase/supabase-js'
import { useAuth } from '@/context/AuthContext'
import { siteConfig } from '@/config/site'
import { firstEnabledMethod } from '@/components/checkout/paymentConfig'
import type { CartItem } from '../../../contracts/commerce/v1.types'

// Los servicios reales tocan supabase: se mockean para el flujo de compra.
const { createOrderMock, createPaymentMock } = vi.hoisted(() => ({
  createOrderMock: vi.fn(),
  createPaymentMock: vi.fn(),
}))

vi.mock('@/services/qawaService', () => ({
  qawaServices: {
    orders: { createOrder: createOrderMock },
    payments: { createPayment: createPaymentMock },
  },
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/config/site', () => ({
  siteConfig: {
    siteUrl: 'https://inventario.qawaylab.test',
    appUrl: 'https://app.qawaylab.test',
    whatsapp: null,
    phone: null,
    cart: { appUrl: null, enabled: true },
  },
}))

vi.mock('@/config/supabase', () => {
  const emptyQuery = {
    select: () => emptyQuery,
    eq: () => emptyQuery,
    limit: () => Promise.resolve({ data: [] }),
  }
  return {
    supabase: {
      from: () => emptyQuery,
      storage: {
        from: () => ({
          upload: vi.fn(async () => ({ error: null })),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      functions: { invoke: vi.fn(async () => ({ data: null, error: null })) },
    },
  }
})

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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/carrito/checkout']}>
      <CheckoutPage />
    </MemoryRouter>,
  )
}

async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
  await user.type(screen.getByLabelText('WhatsApp / Celular'), '999 888 777')
  await user.type(screen.getByLabelText('Distrito / Ciudad'), 'Miraflores')
  await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 123')
}

describe('CheckoutPage — tienda · «Completar Datos y Pago» (paso 2)', () => {
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
    vi.clearAllMocks()
    siteConfig.cart.enabled = true
    createOrderMock.mockResolvedValue({ id: 'ord-1234567890' })
    createPaymentMock.mockResolvedValue({ id: 'pay-1' })
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('muestra los pasos de la compra y el formulario de pago', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify([makeItem()]))
    renderPage()

    expect(screen.getByText('Finalizar Pedido')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Completar Datos y Pago' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Pasos de la compra' })).toBeInTheDocument()
    expect(screen.getByText('Datos y pago')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeInTheDocument()
  })

  it('la cabecera va en orden: migas → kicker → título → párrafo', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify([makeItem()]))
    renderPage()

    const steps = screen.getByRole('list', { name: 'Pasos de la compra' })
    const kicker = screen.getByText('Finalizar Pedido')
    const title = screen.getByRole('heading', { name: 'Completar Datos y Pago' })
    const copy = screen.getByText(/Ingresa tus datos de contacto/)

    const vaAntes = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

    expect(vaAntes(steps, kicker)).toBe(true)
    expect(vaAntes(kicker, title)).toBe(true)
    expect(vaAntes(title, copy)).toBe(true)
  })

  it('sin ítems en el carrito no ofrece el pago (vuelve a Mi pedido)', () => {
    renderPage()

    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
  })

  it('con el carrito desactivado no se renderiza el checkout', () => {
    siteConfig.cart.enabled = false
    storage.setItem(STORAGE_KEY, JSON.stringify([makeItem()]))
    renderPage()

    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
  })

  it('flujo completo: confirmar → éxito, carrito limpio y localStorage vacío', async () => {
    const user = userEvent.setup()
    storage.setItem(STORAGE_KEY, JSON.stringify([makeItem()]))
    renderPage()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    // El método por defecto lo decide paymentConfig, no el test: así la
    // expectativa no se queda obsoleta si cambia el orden de los métodos.
    const defaultMethod = firstEnabledMethod()?.id

    expect(createOrderMock).toHaveBeenCalledWith(
      null,
      [
        {
          product_id: 'prod-1',
          product_title: 'Zapatillas Running Pro',
          product_type: 'physical',
          unit_price: 249.9,
          quantity: 2,
        },
      ],
      expect.objectContaining({ paymentMethod: defaultMethod }),
    )
    expect(createPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, orderId: 'ord-1234567890', amount: 499.8 }),
    )

    expect(screen.getByText('Pedido registrado con éxito')).toBeInTheDocument()
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual([])
  })

  it('asocia el pedido al userId de la sesión autenticada', async () => {
    const user = userEvent.setup()
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'user-123' } } as unknown as Session,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPassword: vi.fn(),
    })
    storage.setItem(STORAGE_KEY, JSON.stringify([makeItem()]))
    renderPage()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrderMock).toHaveBeenCalledWith('user-123', expect.any(Array), expect.any(Object))
    expect(createPaymentMock).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-123' }))
  })
})
