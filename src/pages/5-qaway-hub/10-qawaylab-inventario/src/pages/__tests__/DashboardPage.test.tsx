import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/pages/DashboardPage'
import { useDashboard } from '@/hooks/useDashboard'

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
      totalCustomers: 8,
      pendingQuotations: 2,
      activeCampaigns: 1,
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
  return render(<DashboardPage />)
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el estado de carga cuando loading y sin stats', () => {
    vi.mocked(useDashboard).mockReturnValue(makeDashboard({ loading: true, stats: null }) as never)

    renderPage()

    expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument()
    expect(screen.queryByText('Métricas principales')).not.toBeInTheDocument()
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

  it('renderiza el dashboard completo: stats, comercial, acciones, actividad, top y gráficos', () => {
    const dashboard = makeDashboard()
    vi.mocked(useDashboard).mockReturnValue(dashboard as never)

    renderPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Métricas principales')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Stock total')).toBeInTheDocument()
    expect(screen.getByText('320')).toBeInTheDocument()
    // El formato es-PE usa un espacio no separable (NBSP) que el normalizador no colapsa
    expect(screen.getByText((content: string) => content.replace(/\u00A0/g, ' ').trim() === 'S/ 48,500')).toBeInTheDocument()
    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    // Comercial
    expect(screen.getByText('Comercial')).toBeInTheDocument()
    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Cotizaciones pendientes')).toBeInTheDocument()
    expect(screen.getByText('Campañas activas')).toBeInTheDocument()

    // Acciones rápidas
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Nuevo producto/ })).toHaveAttribute('href', '/inventario')
    expect(screen.getByRole('link', { name: /Capturar con IA/ })).toHaveAttribute('href', '/captura')

    // Actividad y top productos
    expect(screen.getByText('Actividad reciente')).toBeInTheDocument()
    expect(screen.getByText('Producto agregado')).toBeInTheDocument()
    expect(screen.getByText('Productos más valiosos')).toBeInTheDocument()
    // Aparece en la actividad reciente y en el top products
    expect(screen.getAllByText('Zapatillas Running Pro')).toHaveLength(2)
    expect(screen.getByText('S/ 249.90')).toBeInTheDocument()

    // Stock bajo
    expect(screen.getByText('Productos con stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Bajo')).toBeInTheDocument()

    // Gráficos
    expect(screen.getByText('Análisis de ventas')).toBeInTheDocument()
    expect(screen.getByText('Resumen de Ventas')).toBeInTheDocument()
    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Distribución por Categoría')).toBeInTheDocument()
    expect(screen.getByText('Tendencias de Inventario')).toBeInTheDocument()
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
      stats: { totalProducts: 0, totalStock: 0, inventoryValue: 0, lowStockCount: 0, totalCustomers: 0, pendingQuotations: 0, activeCampaigns: 0 },
      recentActivity: [],
      topProducts: [],
      lowStockProducts: [],
      salesData: [],
    }) as never)

    renderPage()

    expect(screen.getByText('Tu inventario está vacío')).toBeInTheDocument()
    // El link existe en QuickActions y en el estado vacío
    expect(screen.getAllByRole('link', { name: /Capturar con IA/ })[0]).toHaveAttribute('href', '/captura')
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
    expect(screen.getByText('Sin actividad reciente')).toBeInTheDocument()
    expect(screen.getByText('Sin productos')).toBeInTheDocument()
    // El dashboard principal sigue visible
    expect(screen.getByText('Métricas principales')).toBeInTheDocument()
  })
})
