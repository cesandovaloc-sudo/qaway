import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductsPage from '@/pages/inventory/ProductsPage'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/types'

vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}))

vi.mock('@/components/products/ProductTable', () => ({
  default: () => <div data-testid="product-table">Tabla de productos</div>,
}))

vi.mock('@/components/products/ProductGrid', () => ({
  default: () => <div data-testid="product-grid">Grid de productos</div>,
}))

vi.mock('@/components/products/ProductImport', () => ({
  default: ({ onImported }: { onImported: (count: number) => void }) => (
    <div data-testid="product-import">
      <button onClick={() => onImported(2)}>Simular importación</button>
    </div>
  ),
}))

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    sku: 'ZAP-001',
    name: 'Zapatillas Running Pro',
    slug: 'zapatillas-running-pro',
    description: 'Zapatillas ligeras',
    category_id: null,
    subcategory_id: null,
    brand: 'Nike',
    type: 'simple',
    status: 'active',
    condition: 9,
    unit: 'unidad',
    min_stock: 0,
    location_id: null,
    cost: null,
    base_price: 249.9,
    commercial_status: 'available',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeProductsState(overrides: Record<string, unknown> = {}) {
  return {
    products: [makeProduct()],
    total: 1,
    page: 1,
    perPage: 20,
    totalPages: 1,
    loading: false,
    error: null,
    fetchProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn(),
    setPage: vi.fn(),
    setFilters: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>,
  )
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el header con el conteo, la tabla por defecto y los links de acción', () => {
    const state = makeProductsState()
    vi.mocked(useProducts).mockReturnValue(state as never)

    renderPage()

    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('1 producto en tu inventario.')).toBeInTheDocument()
    expect(screen.getByTestId('product-table')).toBeInTheDocument()
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Capturar/ })).toHaveAttribute('href', '/captura')
    expect(screen.getByRole('link', { name: /Nuevo/ })).toHaveAttribute('href', '/inventario/nuevo')
    expect(screen.getByRole('button', { name: 'Importar' })).toBeInTheDocument()
  })

  it('alterna entre vista tabla y grid', async () => {
    const user = userEvent.setup()
    vi.mocked(useProducts).mockReturnValue(makeProductsState() as never)

    const { container } = renderPage()

    // El contenedor de toggle usa ml-auto
    const toggle = container.querySelector('.ml-auto') as HTMLElement
    const [tableButton, gridButton] = within(toggle).getAllByRole('button')

    await user.click(gridButton)
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('product-table')).not.toBeInTheDocument()

    await user.click(tableButton)
    expect(screen.getByTestId('product-table')).toBeInTheDocument()
  })

  it('la búsqueda aplica el filtro de búsqueda', async () => {
    const user = userEvent.setup()
    const state = makeProductsState()
    vi.mocked(useProducts).mockReturnValue(state as never)

    renderPage()

    await user.type(screen.getByPlaceholderText('Buscar por nombre, SKU...'), 'zapatillas')

    expect(state.setFilters).toHaveBeenCalledWith({ search: 'zapatillas' })
  })

  it('abre el panel de filtros, aplica el estado y limpia los filtros', async () => {
    const user = userEvent.setup()
    const state = makeProductsState()
    vi.mocked(useProducts).mockReturnValue(state as never)

    renderPage()

    // Abrir panel
    await user.click(screen.getByRole('button', { name: 'Filtros' }))
    expect(screen.getByText('Estado comercial')).toBeInTheDocument()

    // Aplicar estado Activo (el primer combobox es Estado)
    const statusSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(statusSelect, 'active')
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(state.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
    )

    // Ahora hay filtros activos → chip + Limpiar
    expect(screen.getByText('Estado: active')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Limpiar/ }))
    expect(state.setFilters).toHaveBeenCalledWith({})
  })

  it('con paginación muestra los controles y setPage navega', async () => {
    const user = userEvent.setup()
    const state = makeProductsState({
      total: 45,
      totalPages: 3,
      page: 2,
      products: [makeProduct(), makeProduct({ id: 'prod-2', sku: 'MED-001', name: 'Medias' })],
    })
    vi.mocked(useProducts).mockReturnValue(state as never)

    renderPage()

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(state.setPage).toHaveBeenCalledWith(1)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(state.setPage).toHaveBeenCalledWith(3)
  })

  it('el botón Importar abre el modal y al importar refresca la lista', async () => {
    const user = userEvent.setup()
    const state = makeProductsState()
    vi.mocked(useProducts).mockReturnValue(state as never)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'Importar' }))
    expect(screen.getByTestId('product-import')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Simular importación' }))
    expect(state.refresh).toHaveBeenCalledTimes(1)
  })
})
