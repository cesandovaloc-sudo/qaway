import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/pages/DashboardPage'
import { useDashboard } from '@/hooks/useDashboard'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

function makeDashboard(overrides: Record<string, unknown> = {}) {
  return {
    stats: {
      totalProducts: 25,
      totalStock: 320,
      inventoryValue: 48500,
      lowStockCount: 3,
      outOfStockCount: 1,
      activeProducts: 22,
      productsInOffer: 2,
      productsInLiquidation: 1,
      totalCustomers: 8,
      pendingQuotations: 2,
      activeCampaigns: 1,
      salesToday: 4,
      salesWeek: 18,
      salesMonth: 64,
      revenueToday: 420,
      revenueWeek: 2100,
      revenueMonth: 48320,
      pendingPayments: 3,
      pendingPaymentsAmount: 1250,
      purchasesMonth: 9,
      purchasesMonthAmount: 21450,
    },
    recentActivity: [
      {
        id: 'a1',
        icon: 'package',
        type: 'product',
        title: 'Producto agregado',
        description: 'Zapatillas Running Pro',
        timestamp: new Date().toISOString(),
      },
    ],
    topProducts: [
      { id: 'p1', name: 'Zapatillas Running Pro', sku: 'ZAP-001', price: 249.9, stock: 12, image_url: null },
    ],
    lowStockProducts: [
      { id: 'p2', name: 'Medias Deportivas', sku: 'MED-002', price: 29.9, stock: 3, image_url: null },
    ],
    salesData: [{ month: 'Ene', ventas: 10, cotizaciones: 4, ingresos: 1500 }],
    categoryData: [{ name: 'Calzado', value: 5, color: '#f97316' }],
    trendData: [{ day: 'Lun', productos: 25, stock: 320, valor: 1000 }],
    loading: false,
    error: null,
    refresh: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

/** Lee el store de colapsables de forma segura (localStorage puede no existir en el entorno) */
function readCollapsedStore(): Record<string, boolean> {
  try {
    return JSON.parse(window.localStorage?.getItem('dashboard-collapsed') ?? '{}')
  } catch {
    return {}
  }
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    try {
      window.localStorage?.clear()
    } catch {
      /* entorno sin localStorage */
    }
  })

  it('muestra el estado de carga cuando loading y sin stats', () => {
    vi.mocked(useDashboard).mockReturnValue(makeDashboard({ loading: true, stats: null }) as never)

    renderPage()

    expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument()
    expect(screen.queryByText('Ventas y Flujo de Caja')).not.toBeInTheDocument()
  })

  it('muestra el error y Reintentar llama a refresh', async () => {
    const user = userEvent.setup()
    const dashboard = makeDashboard({ error: 'No hay conexión', stats: null })
    vi.mocked(useDashboard).mockReturnValue(dashboard as never)

    renderPage()

    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
    expect(screen.getByText('No hay conexión')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(dashboard.refresh).toHaveBeenCalledTimes(1)
  })

  it('renderiza cabecera Resumen, KPIs reales y secciones colapsables', () => {
    const dashboard = makeDashboard()
    vi.mocked(useDashboard).mockReturnValue(dashboard as never)

    renderPage()

    // Cabecera fusionada
    expect(screen.getByText('Resumen')).toBeInTheDocument()

    // KPIs con data real
    expect(screen.getByText('Productos activos')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Ventas del mes')).toBeInTheDocument()
    expect(screen.getByText('Compras del mes')).toBeInTheDocument()
    expect(screen.getByText('Stock disponible')).toBeInTheDocument()
    expect(screen.getByText('320 un.')).toBeInTheDocument()

    // Secciones colapsables presentes
    expect(screen.getByText('Ventas y Flujo de Caja')).toBeInTheDocument()
    expect(screen.getByText('Inventario')).toBeInTheDocument()
    expect(screen.getByText('Comercial')).toBeInTheDocument()
    expect(screen.getByText('Análisis de ventas')).toBeInTheDocument()
  })

  it('las secciones colapsables se pliegan y despliegan, persistiendo en localStorage', async () => {
    const user = userEvent.setup()
    vi.mocked(useDashboard).mockReturnValue(makeDashboard() as never)

    renderPage()

    // "Inventario" inicia comprimido (defaultOpen={false})
    expect(screen.queryByText('Valor inventario')).not.toBeInTheDocument()

    // Expandir
    await user.click(screen.getByText('Inventario'))
    expect(screen.getByText('Valor inventario')).toBeInTheDocument()
    if (window.localStorage) {
      expect(readCollapsedStore().inventario).toBe(true)
    }

    // Comprimir
    await user.click(screen.getByText('Inventario'))
    expect(screen.queryByText('Valor inventario')).not.toBeInTheDocument()
    if (window.localStorage) {
      expect(readCollapsedStore().inventario).toBe(false)
    }
  })

  it('renderiza QuickAccessCards y accesos rápidos', () => {
    vi.mocked(useDashboard).mockReturnValue(makeDashboard() as never)

    renderPage()

    expect(screen.getByText('Accesos Rápidos Prioritarios')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pedidos Web/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Punto de Venta/ })).toBeInTheDocument()
  })

  it('el botón Actualizar llama a refresh', async () => {
    const user = userEvent.setup()
    const dashboard = makeDashboard()
    vi.mocked(useDashboard).mockReturnValue(dashboard as never)

    renderPage()

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(dashboard.refresh).toHaveBeenCalledTimes(1)
  })

  it('con inventario vacío muestra el estado vacío con links de acción', () => {
    vi.mocked(useDashboard).mockReturnValue(makeDashboard({
      stats: {
        totalProducts: 0, totalStock: 0, inventoryValue: 0, lowStockCount: 0,
        outOfStockCount: 0, activeProducts: 0, productsInOffer: 0, productsInLiquidation: 0,
        totalCustomers: 0, pendingQuotations: 0, activeCampaigns: 0,
        salesToday: 0, salesWeek: 0, salesMonth: 0, revenueToday: 0, revenueWeek: 0,
        revenueMonth: 0, pendingPayments: 0, pendingPaymentsAmount: 0,
        purchasesMonth: 0, purchasesMonthAmount: 0,
      },
      recentActivity: [],
      topProducts: [],
      lowStockProducts: [],
      salesData: [],
    }) as never)

    renderPage()

    expect(screen.getByText('Tu inventario está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver inventario' })).toHaveAttribute('href', '/inventario')
  })

  it('sin datos no renderiza gráficos ni secciones de productos', () => {
    vi.mocked(useDashboard).mockReturnValue(makeDashboard({
      recentActivity: [],
      topProducts: [],
      lowStockProducts: [],
      salesData: [],
      categoryData: [],
      trendData: [],
    }) as never)

    renderPage()

    expect(screen.queryByText('Análisis de ventas')).not.toBeInTheDocument()
    expect(screen.queryByText('Productos con stock bajo')).not.toBeInTheDocument()
  })
})
