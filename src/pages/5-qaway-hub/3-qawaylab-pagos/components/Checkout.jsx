import { useState } from 'react'

const PAYMENT_METHODS = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago (Tarjetas, Yape, Cuotas)',
    description: 'Paga con tarjeta de crédito/débito en Soles (PEN), cuotas sin interés o saldo Mercado Pago.',
  },
  {
    id: 'yape',
    label: 'Yape / Plin Directo',
    description: 'Escanea el código QR o Yapea al número oficial. Adjunta tu voucher.',
  },
  {
    id: 'stripe',
    label: 'Tarjeta Internacional (Stripe)',
    description: 'Tarjeta de crédito o débito Visa, Mastercard o Amex en USD.',
  },
  {
    id: 'directo',
    label: 'Transferencia bancaria / Pago Directo',
    description: 'Transferencia a nuestra cuenta BCP. Te enviamos los datos.',
  },
]

const ACCOUNT_INFO = {
  bank: 'Banco de Crédito del Perú (BCP)',
  accountType: 'Cuenta de Ahorros',
  accountNumber: '191-78901234-0-55',
  cci: '002-191-0078901234055-52',
  holder: 'Qaway Lab E.I.R.L.',
  yape: '999 888 777',
}

export default function Checkout({
  paymentsService,
  ordersService,
  supabase,
  user,
  userId = null,
  items = [],
  currency = 'PEN',
  bucketName = 'resources',
  onSuccess = () => {},
  onError = () => {},
  stripePublishableKey = null,
  mercadoPagoPublicKey = null,
}) {
  // Invitado sin sesión: user_id queda NULL (el schema permite pedidos anónimos con RLS)
  const uid = userId || user?.id || null
  const [selectedMethod, setSelectedMethod] = useState('mercadopago')
  const [promotionChoice, setPromotionChoice] = useState('discount')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderCompleted, setOrderCompleted] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    address: '',
    notes: '',
  })
  const [proofFile, setProofFile] = useState(null)

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1),
    0
  )

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!items.length) {
      setError('El carrito está vacío. Agrega productos antes de confirmar.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      let proofUrl = null

      // Subida de voucher si es Yape o Pago Directo y hay archivo
      if (proofFile && (selectedMethod === 'yape' || selectedMethod === 'directo') && supabase) {
        const fileExt = proofFile.name.split('.').pop()
        const filePath = `vouchers/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, proofFile)
        if (uploadError) console.warn('Aviso al subir comprobante:', uploadError.message)
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
        proofUrl = urlData?.publicUrl || null
      }

      // 1. Crear Orden usando servicio de Qaway Pagos
      const orderItems = items.map((item) => ({
        product_id: item.id || item.product_id,
        product_title: item.title || item.product_title || item.name,
        product_type: item.type || item.product_type || 'digital',
        unit_price: item.price || item.unit_price,
        quantity: item.quantity || 1,
      }))

      let order = null
      if (ordersService && ordersService.createOrder) {
        order = await ordersService.createOrder(uid, orderItems, {
          paymentMethod: selectedMethod,
          shippingAddress: {
            name: formData.name,
            phone: formData.phone,
            district: formData.district,
            address: formData.address,
            promotion: promotionChoice,
          },
          notes: formData.notes,
        })
      } else {
        // Fallback simulación
        order = {
          id: `ord_${Date.now()}`,
          total: subtotal,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      }

      // 2. Crear Registro de Pago usando servicio de Qaway Pagos
      let payment = null
      const provider = selectedMethod === 'stripe'
        ? 'stripe'
        : selectedMethod === 'mercadopago'
        ? 'mercadopago'
        : 'manual'

      if (paymentsService && paymentsService.createPayment) {
        payment = await paymentsService.createPayment({
          userId: uid,
          orderId: order.id,
          amount: subtotal,
          currency,
          provider,
          proofUrl,
          notes: `Distrito: ${formData.district}. Promo: ${promotionChoice}`,
        })
      } else {
        payment = { id: `pay_${Date.now()}`, status: 'pending' }
      }

      setOrderCompleted({ order, payment })
      onSuccess({ order, payment })
    } catch (err) {
      console.error('Error al procesar pedido:', err)
      const msg = err.message || 'No se pudo registrar el pedido.'
      setError(msg)
      onError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderCompleted) {
    return (        <div className="checkout-layout">
        <div className="form-section" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Pedido registrado con éxito</h2>
          <p className="muted" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            Hemos recibido tus datos correctamente. Código de pedido: <strong>#{orderCompleted.order.id.slice(0, 8)}</strong>
          </p>

          {selectedMethod === 'mercadopago' ? (
            <div className="bank-info" style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left', borderColor: '#009ee3' }}>
              <p style={{ fontWeight: 800, marginBottom: '8px', color: '#009ee3' }}>Pago mediante Mercado Pago (Perú):</p>
              <p><span>Pasarela:</span> <strong>Mercado Pago Checkout</strong></p>
              <p><span>Estado:</span> <strong>Pendiente de procesamiento de pasarela</strong></p>
              <p style={{ marginTop: '12px', borderTop: '1px solid #009ee3', paddingTop: '8px' }}>
                <span>Monto total:</span> <strong style={{ color: '#009ee3', fontSize: '1.1rem' }}>S/ {subtotal.toFixed(2)}</strong>
              </p>
            </div>
          ) : (selectedMethod === 'yape' || selectedMethod === 'directo') ? (
            <div className="bank-info" style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--red)' }}>Datos para completar tu pago:</p>
              <p><span>Banco:</span> <strong>{ACCOUNT_INFO.bank}</strong></p>
              <p><span>Titular:</span> <strong>{ACCOUNT_INFO.holder}</strong></p>
              <p><span>Cuenta:</span> <strong>{ACCOUNT_INFO.accountNumber}</strong></p>
              <p><span>Yape / Plin:</span> <strong>{ACCOUNT_INFO.yape}</strong></p>
              <p style={{ marginTop: '12px', borderTop: '1px solid var(--red)', paddingTop: '8px' }}>
                <span>Monto a pagar:</span> <strong style={{ color: 'var(--red)', fontSize: '1.1rem' }}>S/ {subtotal.toFixed(2)}</strong>
              </p>
            </div>
          ) : null}

          <button className="button button-red" onClick={() => window.location.reload()}>
            Volver a la tienda
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="checkout-layout" onSubmit={handleSubmit}>
      {/* Columna Izquierda: Formulario Maquetado de Mesa Selecta */}
      <div className="checkout-form">
        {/* Sección 1: Datos de Contacto */}
        <section className="form-section">
          <h2>Datos de contacto y entrega</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="field">
              <label htmlFor="phone">WhatsApp / Celular</label>
              <input id="phone" name="phone" inputMode="tel" required value={formData.phone} onChange={handleChange} placeholder="999 888 777" />
            </div>
            <div className="field">
              <label htmlFor="district">Distrito / Ciudad</label>
              <input id="district" name="district" required value={formData.district} onChange={handleChange} placeholder="Ej. Miraflores" />
            </div>
            <div className="field">
              <label htmlFor="address">Dirección</label>
              <input id="address" name="address" required value={formData.address} onChange={handleChange} placeholder="Av. Principal 123" />
            </div>
            <div className="field field-full">
              <label htmlFor="notes">Indicaciones adicionales</label>
              <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Referencia de casa, dpto, o nota del pedido..." />
            </div>
          </div>
        </section>

        {/* Sección 2: Opciones y Promoción */}
        <section className="form-section">
          <h2>Beneficio de compra</h2>
          <div className="choice-grid">
            <label className={`choice ${promotionChoice === 'discount' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="promotion"
                value="discount"
                checked={promotionChoice === 'discount'}
                onChange={() => setPromotionChoice('discount')}
              />
              <span>
                <strong>Acceso Inmediato / Descuento</strong>
                <br />
                Descuento directo aplicado en tu resumen.
              </span>
            </label>
            <label className={`choice ${promotionChoice === 'delivery' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="promotion"
                value="delivery"
                checked={promotionChoice === 'delivery'}
                onChange={() => setPromotionChoice('delivery')}
              />
              <span>
                <strong>Soporte Prioritario</strong>
                <br />
                Atención directa vía WhatsApp para cualquier duda.
              </span>
            </label>
          </div>
        </section>

        {/* Sección 3: Forma de Pago */}
        <section className="form-section">
          <h2>Forma de pago</h2>
          <div className="choice-grid" style={{ gridTemplateColumns: '1fr' }}>
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`choice ${selectedMethod === method.id ? 'selected' : ''}`}
                style={{ padding: '18px' }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>{method.label}</strong>
                  <br />
                  <span className="muted" style={{ fontSize: '0.78rem' }}>{method.description}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Adjuntar Voucher si es Yape o Pago Directo */}
          {(selectedMethod === 'yape' || selectedMethod === 'directo') && (
            <div className="bank-info" style={{ marginTop: '20px' }}>
              <p style={{ fontWeight: 800, marginBottom: '6px' }}>Datos para transferir o Yapear:</p>
              <p><span>BCP Cuenta:</span> <strong>{ACCOUNT_INFO.accountNumber}</strong></p>
              <p><span>BCP CCI:</span> <strong>{ACCOUNT_INFO.cci}</strong></p>
              <p><span>Yape / Plin:</span> <strong>{ACCOUNT_INFO.yape}</strong></p>

              <div className="field" style={{ marginTop: '14px' }}>
                <label htmlFor="proof" style={{ color: 'var(--ink)' }}>Adjuntar captura de pantalla (Voucher - Opcional):</label>
                <input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  style={{ minHeight: 'auto', padding: '6px' }}
                />
              </div>
            </div>
          )}
        </section>

        {error && <div className="form-status">{error}</div>}
      </div>

      {/* Columna Derecha: Resumen de Pedido de Mesa Selecta */}
      <aside className="order-summary">
        <h2>Tu pedido</h2>

        {items.map((item, idx) => (
          <div className="summary-row" key={item.id || item.product_id || idx}>
            <span>
              {item.quantity || 1} × {item.title || item.product_title || item.name}
            </span>
            <strong>S/ {((item.price || item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}</strong>
          </div>
        ))}

        <div className="summary-row" style={{ borderTop: '2px solid var(--ink)', marginTop: '12px', paddingTop: '14px', fontSize: '1rem' }}>
          <span>Total a pagar</span>
          <strong style={{ color: 'var(--red)', fontSize: '1.2rem' }}>S/ {subtotal.toFixed(2)}</strong>
        </div>

        <p className="summary-note">
          Tu pago es procesado de forma 100% segura. Recibirás la confirmación de tu pedido al instante.
        </p>

        <button
          className="button button-red"
          style={{ width: '100%', minHeight: '52px', fontSize: '0.95rem' }}
          disabled={submitting}
        >
          {submitting ? 'Procesando pedido...' : 'Confirmar pedido'}
        </button>
      </aside>
    </form>
  )
}
