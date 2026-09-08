import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CartPage from '@/pages/CartPage'
import type { Session } from '@supabase/supabase-js'
import { useAuth } from '@/context/AuthContext'
import { siteConfig } from '@/config/site'
import type { CartItem } from '../../../contracts/commerce/v1.types'

// Los servicios reales de @qawaylab/pago tocan supabase: se mockean para el flujo
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

const STORAGE_KEY = 'qaway-cart-v1'

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

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  )
}

async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
  await user.type(screen.getByLabelText('WhatsApp / Celular'), '999 888 777')
  await user.type(screen.getByLabelText('Distrito / Ciudad'), 'Miraflores')
  await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 123')
}

describe('CartPage (useCart + Checkout integrados)', () => {
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
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('carrito vacío: header, estado vacío con link al catálogo y sin checkout', () => {
    renderPage()

    expect(screen.getByText('Mi pedido')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
  })

  it('restaura el carrito de localStorage y renderiza los ítems con el checkout', () => {
    seedCart([
      makeItem(),
      makeItem({ product_id: 'prod-2', title: 'Medias Deportivas', unit_price: 29.9, quantity: 1 }),
    ])
    renderPage()

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90 c/u')).toBeInTheDocument()
    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    // 2 + 1 = 3 ítems; 2×249.9 + 1×29.9 = 529.70
    expect(screen.getByText('3 ítems')).toBeInTheDocument()
    expect(screen.getByText('Subtotal S/ 529.70')).toBeInTheDocument()

    // Checkout del módulo integrado
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeInTheDocument()
    expect(screen.getByText('Tu pedido')).toBeInTheDocument()
  })

  it('los controles +/− actualizan la cantidad y persisten en localStorage', async () => {
    const user = userEvent.setup()
    seedCart([makeItem()])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(screen.getByText('3 ítems')).toBeInTheDocument()
    expect(screen.getByText('Subtotal S/ 749.70')).toBeInTheDocument()
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].quantity).toBe(3)

    await user.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(screen.getByText('2 ítems')).toBeInTheDocument()
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].quantity).toBe(2)
  })

  it('restar en cantidad 1 elimina el ítem y muestra el estado vacío', async () => {
    const user = userEvent.setup()
    seedCart([makeItem({ quantity: 1 })])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Restar uno' }))

    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
  })

  it('Quitar elimina el ítem del carrito', async () => {
    const user = userEvent.setup()
    seedCart([makeItem()])
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Quitar' }))

    expect(screen.getByText('Tu pedido está vacío')).toBeInTheDocument()
  })

  it('flujo completo: confirmar el pedido en el checkout → éxito, carrito limpio y localStorage vacío', async () => {
    const user = userEvent.setup()
    seedCart([makeItem()])
    renderPage()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    // Orden creada con los ítems del carrito mapeados (userId null sin sesión)
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
      expect.objectContaining({ paymentMethod: 'mercadopago' }),
    )
    expect(createPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, orderId: 'ord-1234567890', amount: 499.8 }),
    )

    // Pantalla de éxito y carrito limpio (useCart.clear + persistencia)
    expect(screen.getByText('¡Pedido registrado!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
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
    })
    seedCart([makeItem()])
    renderPage()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrderMock).toHaveBeenCalledWith('user-123', expect.any(Array), expect.any(Object))
    expect(createPaymentMock).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-123' }))
  })

  it('con el carrito desactivado (VITE_CART_ENABLED=false) no se renderiza el checkout', () => {
    siteConfig.cart.enabled = false
    seedCart([makeItem()])
    renderPage()

    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
  })
})
