import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { PurchaseHistory } from '@qawaylab/pago'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => { resolve = res })
  return { promise, resolve }
}

function makePurchase(overrides: Record<string, unknown> = {}) {
  return {
    id: 'abcdefgh1234',
    product_title: 'Curso de Ventas',
    provider: 'manual',
    status: 'completed',
    amount: '149.9',
    created_at: new Date(2026, 7, 10, 12, 0, 0).toISOString(),
    ...overrides,
  }
}

function renderHistory(props: Record<string, unknown> = {}) {
  const paymentsService = { getUserPayments: vi.fn().mockResolvedValue([makePurchase()]) }
  return {
    paymentsService,
    ...render(<PurchaseHistory paymentsService={paymentsService} userId="user-1" {...props} />),
  }
}

describe('PurchaseHistory (módulo @qawaylab/pago)', () => {
  it('sin userId no consulta y muestra el estado vacío por defecto', () => {
    const paymentsService = { getUserPayments: vi.fn() }
    render(<PurchaseHistory paymentsService={paymentsService} />)

    expect(paymentsService.getUserPayments).not.toHaveBeenCalled()
    expect(screen.getByText('No tienes compras registradas aún.')).toBeInTheDocument()
  })

  it('muestra "Cargando tus compras..." mientras resuelve y luego la lista', async () => {
    const d = deferred<unknown[]>()
    const paymentsService = { getUserPayments: vi.fn().mockReturnValue(d.promise) }
    render(<PurchaseHistory paymentsService={paymentsService} userId="user-1" />)

    expect(screen.getByText('Cargando tus compras...')).toBeInTheDocument()

    await act(async () => { d.resolve([makePurchase()]) })
    expect(screen.getByText('Curso de Ventas')).toBeInTheDocument()
  })

  it('muestra el mensaje de error si la consulta falla', async () => {
    const paymentsService = { getUserPayments: vi.fn().mockRejectedValue(new Error('No hay conexión')) }
    render(<PurchaseHistory paymentsService={paymentsService} userId="user-1" />)

    expect(await screen.findByText('No hay conexión')).toBeInTheDocument()
  })

  it('usa el emptyMessage personalizado cuando no hay compras', async () => {
    const paymentsService = { getUserPayments: vi.fn().mockResolvedValue([]) }
    render(<PurchaseHistory paymentsService={paymentsService} userId="user-1" emptyMessage="Aún no has comprado nada" />)

    expect(await screen.findByText('Aún no has comprado nada')).toBeInTheDocument()
  })

  it('renderiza la compra: badge de estado, proveedor, título, ID, monto y fecha', async () => {
    renderHistory()
    await screen.findByText('Curso de Ventas')

    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByText('Pago Directo / Yape')).toBeInTheDocument()
    expect(screen.getByText('ID: #abcdefgh')).toBeInTheDocument()
    expect(screen.getByText('S/ 149.90')).toBeInTheDocument()

    const expectedDate = new Date(2026, 7, 10, 12, 0, 0)
      .toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })
    expect(screen.getByText(expectedDate)).toBeInTheDocument()
  })

  it('proveedor no manual muestra "Tarjeta Stripe"', async () => {
    renderHistory({
      paymentsService: { getUserPayments: vi.fn().mockResolvedValue([makePurchase({ provider: 'stripe' })]) },
    })
    expect(await screen.findByText('Tarjeta Stripe')).toBeInTheDocument()
  })

  it('status desconocido cae al badge "Pendiente de Validación"', async () => {
    renderHistory({
      paymentsService: { getUserPayments: vi.fn().mockResolvedValue([makePurchase({ status: 'weird' })]) },
    })
    expect(await screen.findByText('Pendiente de Validación')).toBeInTheDocument()
  })

  it('sin product_title usa el fallback', async () => {
    renderHistory({
      paymentsService: { getUserPayments: vi.fn().mockResolvedValue([makePurchase({ product_title: '' })]) },
    })
    expect(await screen.findByText('Pedido de Formación / Producto')).toBeInTheDocument()
  })

  it('sin amount muestra "—"', async () => {
    renderHistory({
      paymentsService: { getUserPayments: vi.fn().mockResolvedValue([makePurchase({ amount: null })]) },
    })
    expect(await screen.findByText('—')).toBeInTheDocument()
  })

  it('con proof_url muestra el link "Ver Comprobante"', async () => {
    renderHistory({
      paymentsService: {
        getUserPayments: vi.fn().mockResolvedValue([makePurchase({ proof_url: 'https://cdn.qawaylab.com/v.png' })]),
      },
    })

    const link = await screen.findByRole('link', { name: 'Ver Comprobante' })
    expect(link).toHaveAttribute('href', 'https://cdn.qawaylab.com/v.png')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('al cambiar el userId vuelve a consultar', async () => {
    const paymentsService = { getUserPayments: vi.fn().mockResolvedValue([makePurchase()]) }
    const { rerender } = render(<PurchaseHistory paymentsService={paymentsService} userId="user-1" />)
    await screen.findByText('Curso de Ventas')

    rerender(<PurchaseHistory paymentsService={paymentsService} userId="user-2" />)
    await screen.findByText('Curso de Ventas')

    expect(paymentsService.getUserPayments).toHaveBeenCalledTimes(2)
    expect(paymentsService.getUserPayments).toHaveBeenLastCalledWith('user-2')
  })
})
