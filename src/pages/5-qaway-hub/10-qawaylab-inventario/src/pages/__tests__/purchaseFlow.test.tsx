import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AppRouter from '@/app/router/AppRouter'
import { catalogService } from '@/services/catalogService'
import type { CatalogFull } from '@/services/catalogService'
import { useAuth } from '@/context/AuthContext'
import { siteConfig } from '@/config/site'

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

vi.mock('@/services/catalogService', () => ({
  catalogService: { getCatalogBySlug: vi.fn() },
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

function makeCatalog() {
  return {
    id: 'cat-1',
    slug: 'mi-catalogo',
    name: 'Remate de Verano',
    description: 'Ofertas seleccionadas',
    campaign: { start_date: '2026-08-01', end_date: '2026-08-31' },
    items: [
      {
        id: 'item-1',
        product: {
          id: 'prod-1',
          name: 'Zapatillas Running Pro',
          sku: 'ZAP-001',
          description: 'Zapatillas ligeras',
          base_price: 249.9,
          images: [{ processed_url: 'https://cdn.x.com/zap.jpg', original_url: 'https://cdn.x.com/zap-og.jpg' }],
        },
        show_price: true,
        show_description: true,
      },
      {
        id: 'item-2',
        product: {
          id: 'prod-2',
          name: 'Medias Deportivas',
          sku: 'MED-002',
          description: 'Par de medias',
          base_price: 29.9,
          images: [],
        },
        show_price: true,
        show_description: true,
      },
    ],
  }
}

function renderApp(initialPath = '/remates/mi-catalogo') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRouter />
    </MemoryRouter>,
  )
}

async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
  await user.type(screen.getByLabelText('WhatsApp / Celular'), '999 888 777')
  await user.type(screen.getByLabelText('Distrito / Ciudad'), 'Miraflores')
  await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 123')
}

describe('Flujo de compra completo (catálogo → agregar → carrito → checkout)', () => {
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
    vi.mocked(catalogService.getCatalogBySlug).mockResolvedValue(makeCatalog() as unknown as CatalogFull)
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

  it('el catálogo público renderiza los productos con precio y el botón de agregar, sin mini carrito', async () => {
    renderApp()

    expect(await screen.findByText('Remate de Verano')).toBeInTheDocument()
    expect(screen.getByText('Ofertas seleccionadas')).toBeInTheDocument()
    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90')).toBeInTheDocument()
    expect(screen.getByText('Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('S/ 29.90')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Agregar al carrito' })).toHaveLength(2)
    // Sin ítems no aparece el mini carrito flotante
    expect(screen.queryByRole('button', { name: 'Ver carrito' })).not.toBeInTheDocument()
  })

  it('agregar un producto muestra "Agregado" y el mini carrito con el subtotal', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Remate de Verano')

    await user.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])

    expect(screen.getByRole('button', { name: 'Agregado' })).toBeInTheDocument()
    expect(screen.getByText('1 ítems')).toBeInTheDocument()
    // El precio aparece en la card del producto y en el subtotal del mini carrito
    expect(screen.getAllByText('S/ 249.90')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Ver carrito' })).toBeInTheDocument()
    // El ítem se persiste para que el carrito lo restaure al navegar
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].product_id).toBe('prod-1')
  })

  it('agregar el mismo producto dos veces lo fusiona (cantidad 2) en el mini carrito', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Remate de Verano')

    await user.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])
    await user.click(screen.getByRole('button', { name: 'Agregado' }))

    expect(screen.getByText('2 ítems')).toBeInTheDocument()
    expect(screen.getByText('S/ 499.80')).toBeInTheDocument()
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toHaveLength(1)
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)[0].quantity).toBe(2)
  })

  it('agregar dos productos distintos suma el subtotal', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Remate de Verano')

    const buttons = screen.getAllByRole('button', { name: 'Agregar al carrito' })
    await user.click(buttons[0])
    await user.click(buttons[1])

    expect(screen.getByText('2 ítems')).toBeInTheDocument()
    // 249.9 + 29.9 = 279.8
    expect(screen.getByText('S/ 279.80')).toBeInTheDocument()
  })

  it('flujo completo: agregar → ver carrito → checkout → pedido registrado y carrito limpio', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Remate de Verano')

    // 1. Agregar desde el catálogo
    await user.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])

    // 2. Ir al carrito desde el mini carrito (navegación real del router)
    await user.click(screen.getByRole('button', { name: 'Ver carrito' }))

    // 3. El carrito restaura el ítem y muestra el checkout integrado
    expect(await screen.findByText('Mi pedido')).toBeInTheDocument()
    expect(screen.getByText('Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 249.90 c/u')).toBeInTheDocument()
    expect(screen.getByText('1 ítems')).toBeInTheDocument()
    expect(screen.getByText('Subtotal S/ 249.90')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeInTheDocument()

    // 4. Checkout del módulo: pedido exitoso con el ítem mapeado por el adaptador
    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrderMock).toHaveBeenCalledWith(
      null, // sin sesión
      [
        {
          product_id: 'prod-1',
          product_title: 'Zapatillas Running Pro',
          product_type: 'physical',
          unit_price: 249.9,
          quantity: 1,
        },
      ],
      expect.objectContaining({ paymentMethod: 'mercadopago' }),
    )
    expect(createPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, orderId: 'ord-1234567890', amount: 249.9 }),
    )

    // 5. Éxito y carrito vacío persistido
    expect(await screen.findByText('¡Pedido registrado!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual([])
  })

  it('con el carrito desactivado no aparecen los botones de agregar ni el mini carrito', async () => {
    siteConfig.cart.enabled = false
    renderApp()

    await screen.findByText('Remate de Verano')
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver carrito' })).not.toBeInTheDocument()
  })

  it('un catálogo inexistente muestra el estado "Catálogo no encontrado"', async () => {
    vi.mocked(catalogService.getCatalogBySlug).mockResolvedValue(null)
    renderApp('/remates/inexistente')

    expect(await screen.findByText('Catálogo no encontrado')).toBeInTheDocument()
  })
})
