import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentsPanel } from '@qawaylab/pago'

function makePending(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay-000001',
    product_title: 'Curso de Marketing',
    amount: '249.9',
    currency: 'PEN',
    provider: 'manual',
    user_id: 'user-12345678',
    created_at: new Date().toISOString(),
    proof_url: 'https://cdn.qawaylab.com/voucher.png',
    notes: 'Cliente envió comprobante',
    ...overrides,
  }
}

function makeAll(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay-000002',
    user_id: 'user-12345678',
    product_title: 'Plantilla Notion',
    amount: '39.9',
    currency: 'PEN',
    provider: 'stripe',
    status: 'completed',
    created_at: new Date(2026, 6, 5, 10, 0, 0).toISOString(),
    proof_url: 'https://cdn.qawaylab.com/p.png',
    ...overrides,
  }
}

function defaultPanel(overrides: Record<string, unknown> = {}) {
  const getPendingPayments = vi.fn().mockResolvedValue([makePending()])
  const getAllPayments = vi.fn().mockResolvedValue([makeAll()])
  const updatePaymentStatus = vi.fn().mockResolvedValue({})
  const paymentsService = { getPendingPayments, getAllPayments, updatePaymentStatus }
  const supabase = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-session' } }, error: null }) },
  }
  return {
    getPendingPayments,
    getAllPayments,
    updatePaymentStatus,
    paymentsService,
    supabase,
    render: () => render(<PaymentsPanel paymentsService={paymentsService} supabase={supabase} {...overrides} />),
  }
}

describe('PaymentsPanel (módulo @qawaylab/pago)', () => {
  let alertMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra el spinner mientras carga', async () => {
    let resolve!: (value: unknown) => void
    const getPendingPayments = vi.fn(() => new Promise((res) => { resolve = res }))
    const getAllPayments = vi.fn().mockResolvedValue([])
    render(<PaymentsPanel paymentsService={{ getPendingPayments, getAllPayments, updatePaymentStatus: vi.fn() }} supabase={{}} />)

    expect(document.querySelector('.animate-spin')).not.toBeNull()

    await act(async () => { resolve([makePending()]) })
    expect(screen.getByText('Curso de Marketing')).toBeInTheDocument()
  })

  it('muestra el error si la carga falla', async () => {
    const getPendingPayments = vi.fn().mockRejectedValue(new Error('Error al cargar pagos'))
    render(<PaymentsPanel paymentsService={{ getPendingPayments, getAllPayments: vi.fn(), updatePaymentStatus: vi.fn() }} supabase={{}} />)

    expect(await screen.findByText('Error al cargar pagos')).toBeInTheDocument()
  })

  it('renderiza título, subtítulo y las tarjetas pendientes con sus datos', async () => {
    defaultPanel({ title: 'Panel de Pagos', subtitle: 'Gestiona todo' }).render()

    expect(await screen.findByText('Panel de Pagos')).toBeInTheDocument()
    expect(screen.getByText('Gestiona todo')).toBeInTheDocument()
    expect(screen.getByText('Pendientes (1)')).toBeInTheDocument()
    expect(screen.getByText('Todas (1)')).toBeInTheDocument()

    expect(screen.getByText('Curso de Marketing')).toBeInTheDocument()
    expect(screen.getByText('S/249.90 — Pago Directo')).toBeInTheDocument()
    expect(screen.getByText('ID: user-123...')).toBeInTheDocument()
    expect(screen.getByText('Ahora')).toBeInTheDocument()
    expect(screen.getByText('📋 Pago Directo')).toBeInTheDocument()
    expect(screen.getByText('Nota: Cliente envió comprobante')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '📎 Ver comprobante' })).toHaveAttribute('href', 'https://cdn.qawaylab.com/voucher.png')
    expect(screen.getByRole('button', { name: '✅ Aprobar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '❌ Rechazar' })).toBeInTheDocument()
  })

  it('muestra el estado vacío de pendientes', async () => {
    const getPendingPayments = vi.fn().mockResolvedValue([])
    const getAllPayments = vi.fn().mockResolvedValue([makeAll()])
    render(<PaymentsPanel paymentsService={{ getPendingPayments, getAllPayments, updatePaymentStatus: vi.fn() }} supabase={{}} />)

    expect(await screen.findByText('No hay pagos pendientes')).toBeInTheDocument()
  })

  it('en la pestaña Todas renderiza la tabla con estado, método y comprobante', async () => {
    const user = userEvent.setup()
    defaultPanel().render()

    await user.click(await screen.findByRole('button', { name: 'Todas (1)' }))

    expect(screen.getByRole('columnheader', { name: 'Usuario' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Producto' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Monto' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Método' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Fecha' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Comprobante' })).toBeInTheDocument()

    expect(screen.getByText('user-123...')).toBeInTheDocument()
    expect(screen.getByText('Plantilla Notion')).toBeInTheDocument()
    expect(screen.getByText('S/39.90')).toBeInTheDocument()
    expect(screen.getByText('💳 Stripe')).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '📎 Ver' })).toHaveAttribute('href', 'https://cdn.qawaylab.com/p.png')
  })

  it('formatea montos en USD y estados/proveedores no mapeados con el valor crudo', async () => {
    const user = userEvent.setup()
    const getAllPayments = vi.fn().mockResolvedValue([
      makeAll({ currency: 'USD', amount: '19.99', status: 'refunded', provider: 'woocommerce' }),
    ])
    render(<PaymentsPanel paymentsService={{ getPendingPayments: vi.fn().mockResolvedValue([]), getAllPayments, updatePaymentStatus: vi.fn() }} supabase={{}} />)

    await user.click(await screen.findByRole('button', { name: 'Todas (1)' }))

    expect(screen.getByText('$19.99')).toBeInTheDocument()
    expect(screen.getByText('Reembolsado')).toBeInTheDocument()
    expect(screen.getByText('🛒 WooCommerce')).toBeInTheDocument()
  })

  it('muestra el estado vacío de Todas', async () => {
    const user = userEvent.setup()
    render(<PaymentsPanel paymentsService={{ getPendingPayments: vi.fn().mockResolvedValue([makePending()]), getAllPayments: vi.fn().mockResolvedValue([]), updatePaymentStatus: vi.fn() }} supabase={{}} />)

    await user.click(await screen.findByRole('button', { name: 'Todas (0)' }))
    expect(screen.getByText('No hay pagos registrados')).toBeInTheDocument()
  })

  it('aprobar con adminUser actualiza a completed con providerId y recarga sin consultar la sesión', async () => {
    const user = userEvent.setup()
    const { getPendingPayments, getAllPayments, updatePaymentStatus, supabase, render } =
      defaultPanel({ adminUser: { id: 'admin-1' } })
    render()

    await user.click(await screen.findByRole('button', { name: '✅ Aprobar' }))

    expect(updatePaymentStatus).toHaveBeenCalledWith(
      'pay-000001',
      'completed',
      expect.objectContaining({
        providerId: expect.stringMatching(/^manual_\d+$/),
        notes: 'Aprobado por administrador',
      }),
    )
    expect(supabase.auth.getUser).not.toHaveBeenCalled()
    expect(getPendingPayments).toHaveBeenCalledTimes(2)
    expect(getAllPayments).toHaveBeenCalledTimes(2)
  })

  it('aprobar sin adminUser obtiene el id desde supabase.auth.getUser', async () => {
    const user = userEvent.setup()
    const { updatePaymentStatus, supabase, render } = defaultPanel()
    render()

    await user.click(await screen.findByRole('button', { name: '✅ Aprobar' }))

    expect(supabase.auth.getUser).toHaveBeenCalled()
    expect(updatePaymentStatus).toHaveBeenCalledWith('pay-000001', 'completed', expect.any(Object))
  })

  it('error al aprobar muestra alert con el mensaje', async () => {
    const user = userEvent.setup()
    const { updatePaymentStatus, render } = defaultPanel()
    updatePaymentStatus.mockRejectedValueOnce(new Error('RLS denegado'))
    render()

    await user.click(await screen.findByRole('button', { name: '✅ Aprobar' }))

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Error al aprobar: RLS denegado'))
  })

  it('rechazar actualiza a failed con la nota del administrador y recarga', async () => {
    const user = userEvent.setup()
    const { getPendingPayments, updatePaymentStatus, render } = defaultPanel()
    render()

    await user.click(await screen.findByRole('button', { name: '❌ Rechazar' }))

    expect(updatePaymentStatus).toHaveBeenCalledWith('pay-000001', 'failed', {
      notes: 'Rechazado por administrador',
    })
    expect(getPendingPayments).toHaveBeenCalledTimes(2)
  })

  it('muestra "..." y deshabilita los botones mientras procesa la aprobación', async () => {
    const user = userEvent.setup()
    let resolveStatus!: (value: unknown) => void
    const updatePaymentStatus = vi.fn(() => new Promise((res) => { resolveStatus = res }))
    const getPendingPayments = vi.fn().mockResolvedValue([makePending()])
    const getAllPayments = vi.fn().mockResolvedValue([])
    render(<PaymentsPanel paymentsService={{ getPendingPayments, getAllPayments, updatePaymentStatus }} supabase={{}} adminUser={{ id: 'admin-1' }} />)

    await user.click(await screen.findByRole('button', { name: '✅ Aprobar' }))

    expect(screen.getByRole('button', { name: '...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '❌ Rechazar' })).toBeDisabled()

    await act(async () => { resolveStatus({}) })
    expect(getPendingPayments).toHaveBeenCalledTimes(2)
  })
})
