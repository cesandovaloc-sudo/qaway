import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewSalePage from '@/pages/sales/NewSalePage'
import { saleService } from '@/services/saleService'
import { customerService } from '@/services/customerService'
import { supabase } from '@/config/supabase'

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

vi.mock('@/services/customerService', () => ({
  customerService: {
    searchCustomers: vi.fn(),
  },
}))

vi.mock('@/config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockedCreateSale = saleService.createSale as ReturnType<typeof vi.fn>
const mockedSearchCustomers = customerService.searchCustomers as ReturnType<typeof vi.fn>
const mockedFrom = supabase.from as ReturnType<typeof vi.fn>

function mockProductQuery() {
  mockedFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        or: () => ({
          order: () => ({
            limit: () => ({
              data: [
                {
                  id: 'prod-1',
                  name: 'Zapatillas Running Pro',
                  sku: 'ZAP-001',
                  base_price: 249.9,
                  stock: 10,
                  unit: 'NIU',
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedCreateSale.mockResolvedValue({ id: 'sale-1', sale_number: 'V-000001' })
  mockedSearchCustomers.mockResolvedValue([])
})

describe('NewSalePage', () => {
  it('should render the POS form', () => {
    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Nueva venta')).toBeDefined()
    expect(screen.getByText('Vender al contado')).toBeDefined()
    expect(screen.getByText('Guardar como deuda')).toBeDefined()
    expect(screen.getByText('Vender con abono')).toBeDefined()
  })

  it('should add a product line and update totals', async () => {
    mockProductQuery()
    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    )

    const search = screen.getByPlaceholderText('Buscar producto por nombre o SKU...')
    fireEvent.change(search, { target: { value: 'zapatillas' } })

    await waitFor(() => {
      expect(screen.getByText('Zapatillas Running Pro')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Zapatillas Running Pro'))

    await waitFor(() => {
      expect(screen.getAllByText(/249\.9/).length).toBeGreaterThan(0)
    })
  })

  it('should create a sale when selling cash', async () => {
    mockProductQuery()
    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    )

    const search = screen.getByPlaceholderText('Buscar producto por nombre o SKU...')
    fireEvent.change(search, { target: { value: 'zapatillas' } })
    await waitFor(() => {
      expect(screen.getByText('Zapatillas Running Pro')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Zapatillas Running Pro'))

    fireEvent.click(screen.getByText('Vender al contado'))

    await waitFor(() => {
      expect(mockedCreateSale).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ product_id: 'prod-1', quantity: 1, unit_price: 249.9 }),
          ]),
          payment_amount: 249.9,
        })
      )
    })
  })

  it('should save as debt with zero payment', async () => {
    mockProductQuery()
    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    )

    const search = screen.getByPlaceholderText('Buscar producto por nombre o SKU...')
    fireEvent.change(search, { target: { value: 'zapatillas' } })
    await waitFor(() => {
      expect(screen.getByText('Zapatillas Running Pro')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Zapatillas Running Pro'))

    fireEvent.click(screen.getByText('Guardar como deuda'))

    await waitFor(() => {
      expect(mockedCreateSale).toHaveBeenCalledWith(
        expect.objectContaining({ payment_amount: 0 })
      )
    })
  })
})
