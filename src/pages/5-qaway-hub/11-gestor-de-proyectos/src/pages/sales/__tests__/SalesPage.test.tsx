import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SalesPage, { formatPEN } from '@/pages/sales/SalesPage'
import { saleService } from '@/services/saleService'

vi.mock('@/services/saleService', () => ({
  saleService: {
    getSales: vi.fn(),
    getSaleById: vi.fn(),
    createSale: vi.fn(),
    registerPayment: vi.fn(),
    getDebts: vi.fn(),
    cancelSale: vi.fn(),
    assertStock: vi.fn(),
  },
}))

vi.mock('@/utils/salesExport', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils/salesExport')>()
  return { ...actual, exportSalesReport: vi.fn() }
})

import { exportSalesReport, enabledReportColumnKeys } from '@/utils/salesExport'

const mockedService = saleService as unknown as { getSales: ReturnType<typeof vi.fn> }
const mockedExport = exportSalesReport as ReturnType<typeof vi.fn>

const sale = {
  id: 'sale-1',
  sale_number: 'V-000001',
  customer_id: null,
  customer_name: 'Juan Pérez',
  doc_type: 'DNI',
  doc_number: '12345678',
  fiscal_name: null,
  fiscal_address: null,
  subtotal: 100,
  discount: 0,
  igv_total: 0,
  total: 100,
  currency: 'PEN',
  payment_status: 'deuda' as const,
  status: 'active' as const,
  payment_method: 'efectivo',
  notes: null,
  created_by: null,
  created_at: new Date().toISOString(),
  paid_at: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedService.getSales.mockResolvedValue({
    data: [sale],
    total: 1,
    page: 1,
    per_page: 20,
    total_pages: 1,
  })
})

describe('SalesPage', () => {
  it('should render the sales header', async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Ventas')).toBeDefined()
    await waitFor(() => {
      expect(screen.getByText('V-000001')).toBeDefined()
    })
  })

  it('should show sale rows with status badge', async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeDefined()
      expect(screen.getAllByText('Deuda').length).toBeGreaterThan(0)
      expect(screen.getByText(/100\.00/)).toBeDefined()
    })
  })

  it('should filter by payment status', async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('V-000001')).toBeDefined()
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pagado' } })
    await waitFor(() => {
      expect(mockedService.getSales).toHaveBeenCalledWith(
        expect.objectContaining({ payment_status: 'pagado' })
      )
    })
  })

  it('should link to new sale page', async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('V-000001')).toBeDefined()
    })
    expect(screen.getByText('Nueva venta').closest('a')?.getAttribute('href')).toBe('/ventas/nueva')
  })

  it('should export the sales report with the selected columns', async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('V-000001')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Descargar reporte'))
    await waitFor(() => {
      expect(screen.getByText('Descargar reporte de ventas')).toBeDefined()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    await waitFor(() => {
      expect(mockedExport).toHaveBeenCalledWith(enabledReportColumnKeys())
    })
  })

  it('should show an error when the export fails', async () => {
    mockedExport.mockRejectedValueOnce(new Error('Sin conexión'))
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('V-000001')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Descargar reporte'))
    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeDefined()
    })
  })
})

describe('formatPEN', () => {
  it('should format as PEN currency', () => {
    expect(formatPEN(100)).toContain('100')
    expect(formatPEN(1234.5)).toContain('1,234.50')
  })
})
