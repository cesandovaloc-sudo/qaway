import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkout } from '@qawaylab/pago'

const items = [
  { id: 'prod-1', title: 'Zapatillas Running Pro', unit_price: 249.9, quantity: 2, product_type: 'physical' },
  { id: 'prod-2', title: 'Medias Deportivas', unit_price: 29.9, quantity: 1, product_type: 'physical' },
]

// 249.9×2 + 29.9 = 529.7
const SUBTOTAL = 529.7

function defaultServices(overrides: Record<string, unknown> = {}) {
  const createOrder = vi.fn().mockResolvedValue({ id: 'ord-1234567890' })
  const createPayment = vi.fn().mockResolvedValue({ id: 'pay-1', status: 'pending' })
  const onSuccess = vi.fn()
  const onError = vi.fn()
  return {
    createOrder,
    createPayment,
    onSuccess,
    onError,
    services: {
      ordersService: { createOrder },
      paymentsService: { createPayment },
      onSuccess,
      onError,
      ...overrides,
    },
  }
}

async function fillContactForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez')
  await user.type(screen.getByLabelText('WhatsApp / Celular'), '999 888 777')
  await user.type(screen.getByLabelText('Distrito / Ciudad'), 'Miraflores')
  await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 123')
}

function renderCheckout(props: Record<string, unknown> = {}) {
  return render(<Checkout items={items} {...props} />)
}

describe('Checkout (módulo @qawaylab/pago)', () => {
  it('renderiza el formulario completo con contacto, beneficio, métodos de pago y resumen', () => {
    renderCheckout()

    expect(screen.getByText('Datos de contacto y entrega')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp / Celular')).toBeInTheDocument()
    expect(screen.getByLabelText('Distrito / Ciudad')).toBeInTheDocument()
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument()
    expect(screen.getByText('Beneficio de compra')).toBeInTheDocument()
    expect(screen.getByText('Forma de pago')).toBeInTheDocument()

    // 4 métodos de pago + 2 beneficios = 6 radios
    expect(screen.getAllByRole('radio')).toHaveLength(6)
    expect(screen.getByText('Mercado Pago (Tarjetas, Yape, Cuotas)')).toBeInTheDocument()
    expect(screen.getByText('Yape / Plin Directo')).toBeInTheDocument()
    expect(screen.getByText('Tarjeta Internacional (Stripe)')).toBeInTheDocument()
    expect(screen.getByText('Transferencia bancaria / Pago Directo')).toBeInTheDocument()

    expect(screen.getByText('Tu pedido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeInTheDocument()
  })

  it('muestra el resumen con los ítems y el total a pagar', () => {
    renderCheckout()

    expect(screen.getByText('2 × Zapatillas Running Pro')).toBeInTheDocument()
    expect(screen.getByText('S/ 499.80')).toBeInTheDocument()
    expect(screen.getByText('1 × Medias Deportivas')).toBeInTheDocument()
    expect(screen.getByText('Total a pagar')).toBeInTheDocument()
    expect(screen.getByText(`S/ ${SUBTOTAL.toFixed(2)}`)).toBeInTheDocument()
  })

  it('por defecto el método seleccionado es Mercado Pago y no muestra el voucher', () => {
    renderCheckout()

    const mercadoPago = screen.getByRole('radio', { name: /Mercado Pago/ })
    expect(mercadoPago).toBeChecked()
    expect(screen.queryByLabelText(/Voucher/)).not.toBeInTheDocument()
    expect(screen.queryByText(/BCP Cuenta/)).not.toBeInTheDocument()
  })

  it('al elegir Yape muestra los datos bancarios y el input de voucher', async () => {
    const user = userEvent.setup()
    renderCheckout()

    await user.click(screen.getByRole('radio', { name: /Yape \/ Plin Directo/ }))

    expect(screen.getByLabelText(/Voucher/)).toBeInTheDocument()
    expect(screen.getByText(/BCP Cuenta/)).toBeInTheDocument()
    expect(screen.getByText('Yape / Plin:')).toBeInTheDocument()
  })

  it('permite cambiar el beneficio de compra a Soporte Prioritario', async () => {
    const user = userEvent.setup()
    const { createOrder, services } = defaultServices()
    renderCheckout(services)

    await user.click(screen.getByRole('radio', { name: /Soporte Prioritario/ }))
    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrder).toHaveBeenCalledWith(
      null,
      expect.any(Array),
      expect.objectContaining({
        shippingAddress: expect.objectContaining({ promotion: 'delivery' }),
      }),
    )
  })

  it('submit con carrito vacío muestra error y no llama a los servicios', async () => {
    const user = userEvent.setup()
    const { createOrder, onSuccess, onError } = defaultServices()
    render(<Checkout items={[]} ordersService={{ createOrder }} onSuccess={onSuccess} onError={onError} />)

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByText('El carrito está vacío. Agrega productos antes de confirmar.')).toBeInTheDocument()
    expect(createOrder).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('submit exitoso crea la orden y el pago con los servicios inyectados', async () => {
    const user = userEvent.setup()
    const { createOrder, createPayment, onSuccess, services } = defaultServices()
    renderCheckout(services)

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrder).toHaveBeenCalledWith(
      null, // uid sin userId ni user
      [
        { product_id: 'prod-1', product_title: 'Zapatillas Running Pro', product_type: 'physical', unit_price: 249.9, quantity: 2 },
        { product_id: 'prod-2', product_title: 'Medias Deportivas', product_type: 'physical', unit_price: 29.9, quantity: 1 },
      ],
      expect.objectContaining({
        paymentMethod: 'mercadopago',
        shippingAddress: expect.objectContaining({
          name: 'Juan Pérez',
          phone: '999 888 777',
          district: 'Miraflores',
          address: 'Av. Principal 123',
          promotion: 'discount',
        }),
        notes: '',
      }),
    )

    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        orderId: 'ord-1234567890',
        amount: SUBTOTAL,
        currency: 'PEN',
        provider: 'mercadopago',
        proofUrl: null,
      }),
    )

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ order: expect.objectContaining({ id: 'ord-1234567890' }) }),
    )
    expect(screen.getByText('Pedido registrado con éxito')).toBeInTheDocument()
  })

  it('usa userId cuando se provee (pedidos de usuario autenticado)', async () => {
    const user = userEvent.setup()
    const { createOrder, services } = defaultServices()
    renderCheckout({ ...services, userId: 'user-123' })

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrder).toHaveBeenCalledWith('user-123', expect.any(Array), expect.any(Object))
  })

  it('mueve provider manual y muestra datos bancarios en la pantalla de éxito con Yape', async () => {
    const user = userEvent.setup()
    const { createPayment, services } = defaultServices()
    renderCheckout(services)

    await fillContactForm(user)
    await user.click(screen.getByRole('radio', { name: /Yape \/ Plin Directo/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'manual', proofUrl: null }),
    )
    expect(screen.getByText('Pedido registrado con éxito')).toBeInTheDocument()
    expect(screen.getByText('Datos para completar tu pago:')).toBeInTheDocument()
  })

  it('sube el voucher al bucket cuando hay archivo con Yape/Pago Directo', async () => {
    const user = userEvent.setup()
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn.qawaylab.com/voucher.png' } }))
    const supabaseMock = { storage: { from: vi.fn(() => ({ upload, getPublicUrl })) } }
    const { createPayment, services } = defaultServices()
    renderCheckout({ ...services, supabase: supabaseMock })

    const file = new File(['contenido'], 'voucher.png', { type: 'image/png' })

    await fillContactForm(user)
    await user.click(screen.getByRole('radio', { name: /Yape \/ Plin Directo/ }))
    await user.upload(screen.getByLabelText(/Voucher/), file)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(supabaseMock.storage.from).toHaveBeenCalledWith('resources')
    const filePath = expect.stringMatching(/^vouchers\/.+\.png$/)
    expect(upload).toHaveBeenCalledWith(filePath, file)
    expect(getPublicUrl).toHaveBeenCalledWith(filePath)
    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ proofUrl: 'https://cdn.qawaylab.com/voucher.png' }),
    )
  })

  it('mapea provider stripe al elegir Tarjeta Internacional', async () => {
    const user = userEvent.setup()
    const { createPayment, services } = defaultServices()
    renderCheckout(services)

    await fillContactForm(user)
    await user.click(screen.getByRole('radio', { name: /Tarjeta Internacional/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'stripe' }),
    )
  })

  it('error de createPayment (tras crear la orden) muestra el mensaje y llama onError', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const createOrder = vi.fn().mockResolvedValue({ id: 'ord-1234567890' })
    const createPayment = vi.fn().mockRejectedValue(new Error('La pasarela no respondió'))
    const onError = vi.fn()
    renderCheckout({ ordersService: { createOrder }, paymentsService: { createPayment }, onError })

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(createOrder).toHaveBeenCalled()
    expect(screen.getByText('La pasarela no respondió')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('sin servicios de orden/pago usa el fallback simulado y completa el pedido', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderCheckout({ onSuccess })

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByText('Pedido registrado con éxito')).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({ status: 'pending' }),
        payment: expect.objectContaining({ status: 'pending' }),
      }),
    )
  })

  it('error al crear la orden muestra el mensaje y llama onError', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const createOrder = vi.fn().mockRejectedValue(new Error('No se pudo registrar el pedido'))
    const onError = vi.fn()
    renderCheckout({ ordersService: { createOrder }, onError })

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByText('No se pudo registrar el pedido')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('deshabilita el botón y muestra "Procesando pedido..." mientras se envía', async () => {
    const user = userEvent.setup()
    let resolveOrder!: (value: unknown) => void
    const createOrder = vi.fn(
      () => new Promise((resolve) => { resolveOrder = resolve }),
    )
    const createPayment = vi.fn().mockResolvedValue({ id: 'pay-1' })
    renderCheckout({ ordersService: { createOrder }, paymentsService: { createPayment } })

    await fillContactForm(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(screen.getByRole('button', { name: 'Procesando pedido...' })).toBeDisabled()

    await act(async () => { resolveOrder({ id: 'ord-1234567890' }) })

    expect(screen.getByText('Pedido registrado con éxito')).toBeInTheDocument()
  })
})
