import { Fragment, useRef, useState } from 'react'
import BenefitIcon from './storefront/BenefitIcon.jsx'
import {
  BENEFIT_NOTE,
  computeBenefitTotals,
  resolveBenefits,
} from './benefits.js'
import {
  ACCOUNT_INFO,
  MANUAL_CONTACT,
  PAYMENT_METHODS,
  findPaymentMethod,
  firstEnabledMethod,
  paymentSteps,
  whatsappOrderLink,
} from './paymentConfig.js'
import { formatBytes } from './storefront/utils.js'

// ── Interruptor del programa de beneficios ───────────────────────────────────
// DECISIÓN DE PRODUCTO (2026-09-13): el bloque queda OCULTO, no eliminado.
// Todo su material sigue en el repo y se reutilizará en otro servicio:
//   · lib/benefits.js                        (catálogo y motor de totales)
//   · components/storefront/BenefitIcon.jsx  (iconos SVG)
//   · styles/storefront.css                  (reglas .benefit-* y .section-hint)
//   · el JSX de este archivo, ya montado y gateado por esta constante
// Para reencender la sección completa basta poner `true` aquí: no hay que
// reescribir nada. Con `false` tampoco se aplica ningún descuento, para que un
// beneficio oculto no altere precios en silencio.
const SHOW_BENEFITS = false

/**
 * Construye el `src` del QR a partir de lo que devuelve la pasarela.
 *
 * TAYPI no garantiza un formato único en `qr_image`, así que se aceptan los tres
 * casos reales:
 *   · data URI ya completo → se usa tal cual (antes se le anteponía OTRO
 *     prefijo, y el navegador mostraba la imagen rota)
 *   · base64 de SVG        → `data:image/svg+xml;base64,…`
 *   · base64 de PNG        → `data:image/png;base64,…`
 *
 * El MIME se deduce del CONTENIDO decodificado, nunca de una lista de prefijos:
 * un SVG puede empezar por "<svg" (base64 "PHN2…") o por la declaración
 * "<?xml" (base64 "PD94…"), y asumir uno solo deja la imagen rota. Ese caso se
 * detectó probando la función con los tres formatos reales.
 */
function qrSrc(valor) {
  if (typeof valor !== 'string') return null

  const v = valor.trim()
  if (!v) return null
  if (v.startsWith('data:')) return v

  let mime = 'image/png'
  try {
    // 16 caracteres de base64 = 12 bytes exactos: basta para ver la firma.
    const muestra = atob(v.slice(0, 16))
    if (muestra.includes('<')) mime = 'image/svg+xml'
    else if (muestra.charCodeAt(0) === 0x89) mime = 'image/png'
  } catch {
    // base64 inválido: se deja PNG y el navegador decide.
  }

  return `data:${mime};base64,${v}`
}

/**
 * Normaliza la respuesta de la pasarela a la forma que usa la confirmación.
 *
 * TAYPI responde en snake_case (`payment_id`, `qr_image`, `checkout_token`);
 * Mercado Pago devuelve `redirectUrl`. Sin esta normalización, `qrImage` y
 * `redirectUrl` se leerían como `undefined`.
 *
 * `qrImage` sale ya listo para usar como `src` (ver `qrSrc`), de modo que el
 * componente no tenga que adivinar el formato.
 *
 * `checkout_url` NO se usa como redirección en esta fase: se guarda en
 * `checkoutUrl` para la Fase 2 (integración de Checkout.js).
 */
function normalizarCobro(data) {
  if (!data) return null

  return {
    providerId: data.providerId ?? data.payment_id ?? null,
    qrImage: qrSrc(data.qrImage ?? data.qr_image),
    redirectUrl: data.redirectUrl ?? null,
    checkoutToken: data.checkoutToken ?? data.checkout_token ?? null,
    checkoutUrl: data.checkout_url ?? null,
  }
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
  // Se invoca cuando el comprador sale de la confirmación por un CTA final.
  // NO significa "pago confirmado": el host decide si corresponde limpiar el
  // carrito (hoy solo en el flujo MANUAL). Para pasarelas el punto queda
  // preparado y sin conectar hasta tener la confirmación real del webhook.
  onFinish = () => {},
  // El módulo no conoce herramientas de analítica: el host inyecta aquí su
  // emisor de conversión (ej. Meta Pixel). Por defecto no hace nada.
  onOrderCompleted = () => {},
  header = null,
}) {
  // Invitado sin sesión: user_id queda NULL (el schema permite pedidos anónimos con RLS)
  const uid = userId || user?.id || null
  // Arranca en el primer método habilitado: nunca se preselecciona uno que no
  // pueda completarse. Al habilitar una pasarela, pasa a ser el default solo.
  const [selectedMethod, setSelectedMethod] = useState(
    () => firstEnabledMethod()?.id ?? 'manual'
  )

  // Programa de beneficios (oculto por SHOW_BENEFITS). Con el interruptor
  // apagado no se resuelve el catálogo, así que `selectedBenefit` es null y el
  // descuento queda en 0.
  const availableBenefits = SHOW_BENEFITS ? resolveBenefits(items) : []
  const [benefitChoice, setBenefitChoice] = useState(
    () => availableBenefits[0]?.id ?? null
  )
  const selectedBenefit = SHOW_BENEFITS
    ? availableBenefits.find((benefit) => benefit.id === benefitChoice) ||
      availableBenefits[0] ||
      null
    : null
  const activeBenefitId = selectedBenefit?.id ?? null
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderCompleted, setOrderCompleted] = useState(null)

  // Form State
  const [formData, setFormData] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('qaway_checkout_user') || '{}')
      return {
        name: savedUser.name || '',
        phone: savedUser.phone || '',
        email: savedUser.email || '',
        contactSchedule: '',
        district: '',
        address: '',
        notes: '',
      }
    } catch {
      return {
        name: '',
        phone: '',
        email: '',
        contactSchedule: '',
        district: '',
        address: '',
        notes: '',
      }
    }
  })
  const [proofFile, setProofFile] = useState(null)
  const proofInputRef = useRef(null)
  // Resalta la zona de voucher mientras se arrastra un archivo encima.
  const [dragging, setDragging] = useState(false)
  // Panel de datos de cobro: arranca COLAPSADO para permitir el recorrido visual del comprador.
  const [expandedMethod, setExpandedMethod] = useState(null)
  // Estado para el cobro inline de TAYPI (desplegable en la misma página)
  const [taypiCobro, setTaypiCobro] = useState(null)
  // Interruptor para desplegable en la misma página (true: inline desplegable; false: página final original)
  const INLINE_QR_MODE = true

  /**
   * Clic en una tarjeta de método: si no estaba elegida, la elige y la expande;
   * si ya estaba elegida, alterna el panel (abrir/cerrar).
   */
  function handleMethodClick(method) {
    if (!method.enabled && method.id !== selectedMethod) return

    if (method.id !== selectedMethod) {
      setSelectedMethod(method.id)
      setExpandedMethod(method.id)
      setTimeout(() => {
        const el = document.getElementById(`method-card-${method.id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 50)
      return
    }
    setExpandedMethod((prev) => (prev === method.id ? null : method.id))
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || item.unit_price || 0) * (item.quantity || 1),
    0
  )
  // Con el programa oculto `selectedBenefit` es null y el descuento es 0, así
  // que el total coincide con el subtotal. Al reencender el bloque, el motor de
  // descuento vuelve a operar sin tocar nada más.
  const { discount, total } = computeBenefitTotals(subtotal, selectedBenefit)

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
      // El voucher solo aplica al método manual (Yape / Plin / Transferencia).
      if (proofFile && selectedMethod === 'manual' && supabase) {
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
        try {
          order = await ordersService.createOrder(uid, orderItems, {
            paymentMethod: selectedMethod,
            shippingAddress: {
              name: formData.name,
              phone: formData.phone,
              district: formData.district,
              address: formData.address,
              // Fallback neutro mientras el programa está oculto: la columna de
              // `orders` recibe null explícito. Al reencenderlo vuelve a viajar
              // el id del beneficio elegido.
              promotion: SHOW_BENEFITS ? activeBenefitId : null,
              promotionLabel: SHOW_BENEFITS ? selectedBenefit?.label ?? null : null,
              email: formData.email || null,
              // Necesitamos llamar para afinar detalles: se guarda la franja
              // horaria preferida por el cliente.
              contactSchedule: formData.contactSchedule || null,
            },
            notes: formData.notes,
          })
        } catch (err) {
          console.warn('[Checkout] Error en createOrder, usando fallback:', err)
          order = {
            id: `ord_${Date.now()}`,
            total: subtotal,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        }
      } else {
        // Fallback simulación
        order = {
          id: `ord_${Date.now()}`,
          total: subtotal,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      }

      // 2. Registro del pago.
      // Modelo A: para pasarelas (taypi, mercadopago) el pago lo escribe la Edge
      // Function — único escritor, con el importe recalculado en el servidor.
      // El servicio del cliente registra únicamente el pago MANUAL.
      let payment = null
      // El proveedor lo declara cada método en paymentConfig.
      const provider = selectedMethodInfo?.provider ?? 'manual'

      if (provider === 'manual') {
        if (paymentsService && paymentsService.createPayment) {
          try {
            payment = await paymentsService.createPayment({
              userId: uid,
              orderId: order?.id,
              amount: total,
              currency,
              provider,
              proofUrl,
              notes: SHOW_BENEFITS
                ? `Distrito: ${formData.district}. Beneficio: ${selectedBenefit?.label ?? 'sin beneficio'}`
                : `Distrito: ${formData.district}.`,
            })
          } catch (err) {
            console.warn('[Checkout] Error en createPayment, usando fallback:', err)
            payment = { id: `pay_${Date.now()}`, status: 'pending' }
          }
        } else {
          payment = { id: `pay_${Date.now()}`, status: 'pending' }
        }
      }

      // Cobro por pasarela: el navegador NO manda el importe. El servidor lee el
      // pedido, lo recalcula (regla R1) y devuelve el QR o la URL de pago.
      let cobro = null
      if (provider !== 'manual' && supabase?.functions) {
        // TEST/SANDBOX: Mercado Pago en modo prueba. Taypi sigue en prod.
        const funcionPago = provider === 'taypi' ? 'taypi-pago-prod' : 'mercadopago-pago-test'
        const cuerpoPago =
          provider === 'taypi'
            ? { orderId: order?.id } // TAYPI: SOLO orderId, nunca el monto
            : { orderId: order?.id, provider }

        const { data, error: errCobro } = await supabase.functions.invoke(funcionPago, {
          body: cuerpoPago,
        })
        if (errCobro) throw new Error('No pudimos iniciar el pago. Intenta de nuevo en un momento.')
        cobro = normalizarCobro(data)
      }

      const finalOrder = {
        ...order,
        payment_method: order?.payment_method || selectedMethod,
      }
      onSuccess({ order: finalOrder, payment })
      // Se avisa al host para que registre la conversión (disparo único allá).
      onOrderCompleted({ order: finalOrder, payment, total, currency, items: orderItems })

      // Modo Desplegable Inline para TAYPI: en lugar de salir de la página o
      // reemplazar el checkout, el QR se despliega en la misma opción elegida.
      if (provider === 'taypi' && INLINE_QR_MODE && (cobro?.qrImage || cobro?.checkoutUrl)) {
        setTaypiCobro(cobro)
        setExpandedMethod('taypi')
        return
      }

      // Si la pasarela devuelve URL de pago, se sale del sitio hacia su checkout.
      if (cobro?.redirectUrl) {
        window.location.href = cobro.redirectUrl
        return
      }

      // Snapshot congelado: la confirmación no puede leer del carrito, porque
      // `onSuccess` lo vacía y los montos caían a "S/ 0.00".
      setOrderCompleted({
        order,
        payment,
        subtotal,
        discount,
        total,
        benefitLabel: selectedBenefit?.label ?? null,
        checkoutToken: cobro?.checkoutToken ?? null,
        methodId: selectedMethod,
        qrImage: cobro?.qrImage ?? null,
        orderCode: String(order?.id || payment?.id || '').slice(0, 8),
        steps: paymentSteps(selectedMethod),
      })
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
    // El cierre del flujo cambia según el método: en los manuales el comprador
    // todavía debe enviarnos el voucher, así que el CTA lo dice explícitamente.
    const isManualPayment = orderCompleted.methodId === 'manual'

    return (        <div className="checkout-layout">
        <div className="form-section" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Pedido registrado con éxito</h2>
          <p className="muted" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            Hemos recibido tus datos correctamente. Código de pedido: <strong>#{orderCompleted.orderCode}</strong>
          </p>

          {orderCompleted.methodId === 'mercadopago' ? (
            <div className="bank-info" style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left', borderColor: '#009ee3' }}>
              <p style={{ fontWeight: 800, marginBottom: '8px', color: '#009ee3' }}>Pago mediante Mercado Pago (Perú):</p>
              <p><span>Pasarela:</span> <strong>Mercado Pago Checkout</strong></p>
              <p><span>Estado:</span> <strong>Pendiente de procesamiento de pasarela</strong></p>
              {orderCompleted.benefitLabel ? (
                <p><span>Beneficio:</span> <strong>{orderCompleted.benefitLabel}</strong></p>
              ) : null}
              {orderCompleted.discount > 0 ? (
                <p><span>Descuento:</span> <strong style={{ color: 'var(--green)' }}>− S/ {orderCompleted.discount.toFixed(2)}</strong></p>
              ) : null}
              <p style={{ marginTop: '12px', borderTop: '1px solid #009ee3', paddingTop: '8px' }}>
                <span>Monto total:</span> <strong style={{ color: '#009ee3', fontSize: '1.1rem' }}>S/ {orderCompleted.total.toFixed(2)}</strong>
              </p>
            </div>
          ) : orderCompleted.methodId === 'manual' ? (
            <div className="bank-info" style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--red)' }}>Datos para completar tu pago:</p>
              <p><span>Banco:</span> <strong>{ACCOUNT_INFO.bank}</strong></p>
              <p><span>Titular:</span> <strong>{ACCOUNT_INFO.holder}</strong></p>
              <p><span>Cuenta:</span> <strong>{ACCOUNT_INFO.accountNumber}</strong></p>
              <p><span>Yape / Plin:</span> <strong>{ACCOUNT_INFO.yape}</strong></p>
              {orderCompleted.benefitLabel ? (
                <p><span>Beneficio:</span> <strong>{orderCompleted.benefitLabel}</strong></p>
              ) : null}
              {orderCompleted.discount > 0 ? (
                <p><span>Descuento:</span> <strong style={{ color: 'var(--green)' }}>− S/ {orderCompleted.discount.toFixed(2)}</strong></p>
              ) : null}
              <p style={{ marginTop: '12px', borderTop: '1px solid var(--red)', paddingTop: '8px' }}>
                <span>Monto a pagar:</span> <strong style={{ color: 'var(--red)', fontSize: '1.1rem' }}>S/ {orderCompleted.total.toFixed(2)}</strong>
              </p>
            </div>
          ) : orderCompleted.methodId === 'taypi' ? (
            <div className="bank-info" style={{ maxWidth: '480px', margin: '0 auto 24px', textAlign: 'left' }}>
              <p style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--red)' }}>Pago con código QR:</p>
              <p><span>Pasarela:</span> <strong>QR interoperable (Yape, Plin y bancos)</strong></p>
              <p><span>Estado:</span> <strong>Pendiente de pago</strong></p>
              {orderCompleted.qrImage ? (
                <img
                  className="qr-image"
                  alt="Código QR para completar el pago"
                  src={orderCompleted.qrImage}
                />
              ) : null}
              {orderCompleted.benefitLabel ? (
                <p><span>Beneficio:</span> <strong>{orderCompleted.benefitLabel}</strong></p>
              ) : null}
              <p style={{ marginTop: '12px', borderTop: '1px solid var(--red)', paddingTop: '8px' }}>
                <span>Monto total:</span> <strong style={{ color: 'var(--red)', fontSize: '1.1rem' }}>S/ {orderCompleted.total.toFixed(2)}</strong>
              </p>
            </div>
          ) : null}

          {/* Próximos pasos: es lo que evita que el comprador quede sin saber
              qué hacer después de confirmar. Se calcula por método en
              lib/paymentConfig.js y viaja congelado en el snapshot. */}
          <div className="next-steps" style={{ maxWidth: '560px', margin: '0 auto 24px', textAlign: 'left' }}>
            <p className="next-steps-title">Qué sigue ahora</p>
            <ol className="next-steps-list">
              {orderCompleted.steps.map((step, index) => (
                <li className="next-step" key={step.title}>
                  <span className="next-step-num" aria-hidden="true">{index + 1}</span>
                  <span>
                    <strong className="next-step-title">{step.title}</strong>
                    <span className="next-step-detail">{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <a
              className="button button-red next-steps-cta"
              href={whatsappOrderLink({
                code: orderCompleted.orderCode,
                amount: orderCompleted.total.toFixed(2),
                intent: isManualPayment ? 'voucher' : 'pago',
              })}
              target="_blank"
              rel="noreferrer"
              onClick={onFinish}
            >
              {isManualPayment ? 'Enviar mi voucher por WhatsApp' : MANUAL_CONTACT.label}
            </a>
            <p className="muted" style={{ fontSize: '0.72rem', marginTop: '8px', textAlign: 'center' }}>
              {MANUAL_CONTACT.hours}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="button button-red" href="/landings/desarrollo-web-qaway#precios" onClick={onFinish}>
              Volver a la tienda
            </a>
            <a className="button button-secondary" href="/carrito/compras" onClick={onFinish}>
              Ver mis pedidos
            </a>
          </div>
        </div>
      </div>
    )
  }

  const selectedMethodInfo = findPaymentMethod(selectedMethod)

  return (
    <form className={`checkout-layout ${header ? 'checkout-layout--cabecera' : ''}`} onSubmit={handleSubmit}>
      {/* Columna Izquierda: Formulario Maquetado de Mesa Selecta */}
      <div className="checkout-form">
        <div className="checkout-header-wrap">
          {header}
        </div>
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
            <div className="field">
              <label htmlFor="email">Correo electrónico (para tu comprobante)</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@correo.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="contactSchedule">Horario de comunicación</label>
              <select id="contactSchedule" name="contactSchedule" value={formData.contactSchedule} onChange={handleChange}>
                <option value="">Cualquier horario</option>
                <option value="morning">Mañana (9:00 – 12:00)</option>
                <option value="afternoon">Tarde (12:00 – 17:00)</option>
                <option value="evening">Noche (17:00 – 20:00)</option>
              </select>
            </div>
            <div className="field field-full">
              <label htmlFor="notes">Notas adicionales (opcional)</label>
              <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Detalles que debamos considerar" />
            </div>
          </div>
        </section>

        {/* Sección 2: Programa de beneficios — OCULTO por SHOW_BENEFITS, no
            eliminado. Plantilla configurable en lib/benefits.js; estilos en
            styles/storefront.css. Reencenderlo = poner SHOW_BENEFITS en true. */}
        {SHOW_BENEFITS ? (
          <section className="form-section">
            <h2>Beneficio de compra</h2>
            <p className="section-hint">
              Elige un beneficio y lo aplicamos a tu pedido.
            </p>
            <div
              className="benefit-grid"
              role="radiogroup"
              aria-label="Beneficio de compra"
            >
              {availableBenefits.map((benefit) => {
                const isSelected = benefit.id === activeBenefitId
                return (
                  <label
                    key={benefit.id}
                    className={`benefit-card${isSelected ? ' is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="benefit"
                      value={benefit.id}
                      checked={isSelected}
                      onChange={() => setBenefitChoice(benefit.id)}
                      className="benefit-input"
                    />
                    <span className="benefit-head">
                      <span className="benefit-icon">
                        <BenefitIcon name={benefit.icon} />
                      </span>
                      <span className="benefit-tag">{benefit.tag}</span>
                    </span>
                    <span className="benefit-label">{benefit.label}</span>
                    <span className="benefit-copy">{benefit.description}</span>
                    {benefit.discountPercent > 0 ? (
                      <span className="benefit-discount">
                        −{benefit.discountPercent}% sobre tu subtotal
                      </span>
                    ) : null}
                    <span className="benefit-foot">
                      <span className="benefit-dot" aria-hidden="true" />
                      {isSelected ? 'Seleccionado' : 'Elegir'}
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="summary-note">{BENEFIT_NOTE}</p>
          </section>
        ) : null}

        {/* Sección 3: Forma de Pago */}
        <section className="form-section">
          <h2>Forma de pago</h2>
          <div className="choice-grid" style={{ gridTemplateColumns: '1fr' }}>
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                id={`method-card-${method.id}`}
                className={`payment-method-item ${selectedMethod === method.id ? 'is-selected' : ''}`}
              >
                <label
                  className={`choice ${selectedMethod === method.id ? 'selected' : ''}`}
                  style={{ padding: '18px' }}
                  onClick={(e) => {
                    // El clic en la etiqueta lo reenvía el navegador al radio, y ese
                    // clic reenviado vuelve a subir hasta aquí: el manejador corría
                    // DOS veces y el panel se abría y se cerraba en el mismo toque
                    // (se veía como "no despliega"). preventDefault cancela el
                    // reenvío, así que el toque cuenta una sola vez.
                    e.preventDefault()
                    handleMethodClick(method)
                  }}
                >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  /* El método YA seleccionado nunca se deshabilita: así la UI no
                     puede quedar en un estado sin salida si cambia la config. */
                  disabled={!method.enabled && method.id !== selectedMethod}
                  aria-expanded={method.showAccounts || method.showQr ? expandedMethod === method.id : undefined}
                  aria-controls={method.showAccounts || method.showQr ? `panel-${method.id}` : undefined}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="method-head">
                    <strong style={{ fontSize: '0.95rem' }}>{method.label}</strong>
                    <span className={`method-tag${method.enabled ? ' is-ready' : ''}`}>
                      {method.enabled ? 'Disponible' : 'En habilitación'}
                    </span>
                  </span>
                  <br />
                  <span className="muted" style={{ fontSize: '0.78rem' }}>{method.description}</span>
                  {/* El aviso vive DENTRO de la tarjeta no habilitada: explica por
                      qué no se puede elegir. Nunca se ofrece sin decirlo. */}
                  {!method.enabled && method.notice ? (
                    <span className="method-notice">{method.notice}</span>
                  ) : null}
                  {/* Señal de que la tarjeta despliega contenido: sin esto, un
                      panel colapsado no se descubre. */}
                  {method.showAccounts || method.showQr || method.showInfo ? (
                    <span className="method-toggle">
                      <span
                        className={`method-toggle-icon${expandedMethod === method.id ? ' is-open' : ''}`}
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                      {expandedMethod === method.id
                        ? (method.showQr ? 'Ocultar código QR' : method.showInfo ? 'Ocultar información' : 'Ocultar datos de pago')
                        : (method.showQr ? (taypiCobro ? 'Ver código QR' : 'Ver información de pago') : method.showInfo ? 'Ver opciones y tarjetas aceptadas' : 'Ver datos de pago')}
                    </span>
                  ) : null}
                </div>
                </label>

                {/* Datos de cobro DENTRO del ítem elegido: la divulgación
                    progresiva debe quedar junto a su disparador.
                    El panel lo declara el método (`showAccounts`), no un id
                    escrito aquí, y arranca COLAPSADO. */}
                {expandedMethod === method.id && method.showAccounts ? (
                  <div className="payment-method-drawer" id={`panel-${method.id}`}>
                    <p style={{ fontWeight: 800, marginBottom: '6px' }}>Datos para transferir o Yapear:</p>
                    <p><span>BCP Cuenta:</span> <strong>{ACCOUNT_INFO.accountNumber}</strong></p>
                    <p><span>BCP CCI:</span> <strong>{ACCOUNT_INFO.cci}</strong></p>
                    <p><span>Yape / Plin:</span> <strong>{ACCOUNT_INFO.yape}</strong></p>

                <label
                  className={`upload-zone${dragging ? ' is-dragging' : ''}`}
                  htmlFor="proof"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const dropped = e.dataTransfer?.files?.[0]
                    if (dropped) setProofFile(dropped)
                  }}
                >
                  <input
                    id="proof"
                    ref={proofInputRef}
                    className="upload-zone-input"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0] || null)}
                  />
                  <span className="upload-zone-title">Subir captura o Voucher de pago</span>
                  <span className="upload-zone-action">
                    <span className="upload-zone-button">Elegir archivo</span>
                    <span className="upload-zone-hint">o arrastra el archivo aquí</span>
                  </span>
                  <span className="upload-zone-hint">
                    JPG, PNG o PDF · Opcional, pero acelera la verificación de tu pago.
                  </span>
                  {proofFile ? (
                    <span className="upload-zone-file">
                      <strong>{proofFile.name}</strong>
                      <span className="upload-zone-size">{formatBytes(proofFile.size)}</span>
                    </span>
                  ) : null}
                </label>
                {proofFile ? (
                  <button
                    type="button"
                    className="remove-link"
                    style={{ justifySelf: 'start' }}
                    onClick={() => {
                      setProofFile(null)
                      if (proofInputRef.current) proofInputRef.current.value = ''
                    }}
                  >
                    Quitar archivo
                  </button>
                ) : null}
                  </div>
                ) : null}

                {/* Panel desplegable de TAYPI: se expande al seleccionar el método */}
                {expandedMethod === method.id && method.id === 'taypi' && method.showQr ? (
                  <div
                    className="payment-method-drawer taypi-panel"
                    id={`panel-${method.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <p style={{ fontWeight: 800, margin: 0, color: '#1e293b', fontSize: '0.88rem' }}>
                        Billeteras y bancos compatibles:
                      </p>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ background: '#742284', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Yape</span>
                        <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Plin</span>
                        <span style={{ background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Bancos</span>
                      </div>
                    </div>

                    {!taypiCobro ? (
                      <div style={{ padding: '6px 0', textAlign: 'left' }}>
                        <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                          Al confirmar tu pedido, aquí mismo se desplegará tu código QR oficial en tiempo real para que lo escanees y pagues al instante sin comisiones.
                        </p>
                        <button
                          type="button"
                          className="button button-red"
                          style={{ minHeight: '38px', fontSize: '0.8rem', padding: '0 16px', width: '100%' }}
                          onClick={handleSubmit}
                          disabled={submitting}
                        >
                          {submitting ? 'Generando QR oficial...' : `Generar QR para pagar S/ ${total.toFixed(2)}`}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                          QR Activo · Esperando tu pago
                        </div>

                        {taypiCobro.qrImage ? (
                          <div style={{ margin: '0 auto 12px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                            <img
                              src={taypiCobro.qrImage}
                              alt="Código QR TAYPI"
                              style={{ width: '210px', height: '210px', display: 'block' }}
                            />
                          </div>
                        ) : null}

                        <p style={{ display: 'block', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0', width: '100%' }}>
                          Total a pagar: S/ {total.toFixed(2)}
                        </p>
                        <p style={{ display: 'block', textAlign: 'center', fontSize: '0.78rem', color: '#64748b', margin: '0 0 12px 0', width: '100%' }}>
                          Abre Yape, Plin o tu banca móvil, escanea el código y listo.
                        </p>

                        {taypiCobro.checkoutUrl ? (
                          <a
                            href={taypiCobro.checkoutUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="button button-secondary"
                            style={{ minHeight: '38px', fontSize: '0.78rem', padding: '0 14px', width: '100%', maxWidth: '320px', margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ¿Pagas desde este mismo celular? Toca aquí
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Panel desplegable de MERCADO PAGO: información y opciones aceptadas */}
                {expandedMethod === method.id && method.id === 'mercadopago' && method.showInfo ? (
                  <div
                    className="payment-method-drawer mercadopago-panel"
                    id={`panel-${method.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <p style={{ fontWeight: 800, margin: 0, color: '#18181b', fontSize: '0.88rem' }}>
                        Tarjetas y opciones aceptadas:
                      </p>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: '#1e3a8a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Visa</span>
                        <span style={{ background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Mastercard</span>
                        <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Amex</span>
                        <span style={{ background: '#742284', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>Yape</span>
                        <span style={{ background: '#15803d', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Cuotas</span>
                      </div>
                    </div>
                    <div style={{ padding: '6px 0', textAlign: 'left' }}>
                      <p style={{ color: '#52525b', fontSize: '0.82rem', margin: '0 0 14px 0', lineHeight: 1.55 }}>
                        Al confirmar tu pedido, se conectará con la plataforma segura y encriptada de <strong>Mercado Pago</strong> para completar tu transacción al instante. Puedes pagar al contado o en cuotas sin interés.
                      </p>
                      <button
                        type="button"
                        className="button button-red"
                        style={{ minHeight: '38px', fontSize: '0.8rem', padding: '0 16px', width: '100%' }}
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Procesando...' : `Pagar con Mercado Pago S/ ${total.toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
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

        {SHOW_BENEFITS && discount > 0 ? (
          <>
            <div className="summary-row" style={{ marginTop: '12px' }}>
              <span>Subtotal</span>
              <strong>S/ {subtotal.toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Descuento ({selectedBenefit?.discountPercent}%)</span>
              <strong style={{ color: 'var(--green)' }}>− S/ {discount.toFixed(2)}</strong>
            </div>
          </>
        ) : null}

        {SHOW_BENEFITS && selectedBenefit ? (
          <div className="summary-row">
            <span>Beneficio</span>
            <strong style={{ fontSize: '0.8rem' }}>{selectedBenefit.label}</strong>
          </div>
        ) : null}

        <div className="summary-row" style={{ borderTop: '2px solid var(--ink)', marginTop: '12px', paddingTop: '14px', fontSize: '1rem' }}>
          <span>Total a pagar</span>
          <strong style={{ color: 'var(--red)', fontSize: '1.2rem' }}>S/ {total.toFixed(2)}</strong>
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
