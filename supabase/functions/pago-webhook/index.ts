/**
 * `pago-webhook` — confirma un pago y marca el pedido como pagado.
 *
 * Es el ÚNICO punto del sistema autorizado a escribir `status = 'paid'` (R6) y
 * usa `service_role`, por lo que se salta la RLS. Por eso TODO el flujo está
 * detrás de la verificación de firma (R3).
 *
 * Orden obligatorio de las validaciones — no reordenar:
 *   1. Firma válida (R3)  → si no, 401 y se descarta.
 *   2. Evento aprobatorio  → si no lo es, 200 y se ignora (evita reintentos).
 *   3. Ya procesado (R4)   → si lo está, 200 y no se vuelve a aplicar.
 *   4. Monto coincide (R5) → si no, 409 y NO se marca pagado.
 *   5. Recién aquí se marca pagado (R6).
 *
 * El proveedor llega por query: `?provider=mercadopago`.
 * Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MERCADOPAGO_ACCESS_TOKEN,
 * MERCADOPAGO_WEBHOOK_SECRET.
 *
 * DETALLE CLAVE DE MERCADO PAGO: su webhook **no incluye el monto**, solo el id
 * de la notificación. Por eso aquí se consulta el pago contra su API para
 * obtener estado, importe y pedido (R5 sería inaplicable sin ese paso).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  HEADER_FIRMA,
  firmaMercadoPagoValida,
  firmaValida,
  json,
  montosCoinciden,
  obtenerPagoMercadoPago,
  proveedorDeRequest,
  secretWebhookDe,
  yaProcesado,
} from '../_shared/pagos.ts'

serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const provider = proveedorDeRequest(req)
  if (!provider) {
    console.warn('[pago-webhook] proveedor ausente o no soportado')
    return json({ error: 'Proveedor no especificado o no soportado' }, 400)
  }

  // El cuerpo CRUDO se lee antes de parsear: la firma se calcula sobre los bytes
  // originales y `req.json()` consumiría el stream.
  const rawBody = await req.text()

  let evento: Record<string, any>
  try {
    evento = JSON.parse(rawBody || '{}')
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }

  // ── VERIFICACIÓN DE FIRMA + NORMALIZACIÓN (lo único propio de cada pasarela) ─
  let providerId = ''
  let montoPagado: unknown = null
  let orderIdDelEvento: string | null = null
  let aprobado = false

  if (provider === 'mercadopago') {
    // Mercado Pago firma un "manifest", no el cuerpo, y manda el id en el query.
    const dataId =
      new URL(req.url).searchParams.get('data.id') ?? String(evento?.data?.id ?? '')

    if (!(await firmaMercadoPagoValida(req, dataId, secretWebhookDe(provider)))) {
      console.warn('[pago-webhook] R3 firma de Mercado Pago inválida o ausente', { dataId })
      return json({ error: 'Firma inválida' }, 401)
    }

    if (evento?.type && evento.type !== 'payment') {
      return json({ ok: true, ignorado: `evento ${evento.type}` })
    }

    // Sin este paso no hay monto ni estado: MP no los manda en el webhook.
    const pago = await obtenerPagoMercadoPago(dataId)
    providerId = pago.providerId
    montoPagado = pago.monto
    aprobado = pago.estado === 'approved'
    orderIdDelEvento = pago.orderId ? String(pago.orderId) : null
  } else {
    // Proveedores que firman el cuerpo crudo.
    const header = HEADER_FIRMA[provider] ?? ''
    const recibida = header ? req.headers.get(header) : null

    if (!(await firmaValida(secretWebhookDe(provider), rawBody, recibida))) {
      console.warn('[pago-webhook] R3 firma inválida o ausente', { provider, header })
      return json({ error: 'Firma inválida' }, 401)
    }

    const datos = evento?.data ?? evento
    providerId = String(datos.payment_id ?? datos.id ?? '')
    montoPagado = datos.amount ?? datos.transaction_amount
    orderIdDelEvento = datos.reference ?? datos.metadata?.order_id ?? null
    const estado = String(datos.status ?? '')
    aprobado = estado === 'completed' || estado === 'paid' || estado === 'approved'
  }

  if (!providerId) {
    console.warn('[pago-webhook] evento sin identificador')
    return json({ error: 'Evento sin identificador' }, 400)
  }

  // 2. Evento no aprobatorio (pendiente, rechazado, reembolsado): se confirma la
  //    recepción para que la pasarela no reintente.
  if (!aprobado) return json({ ok: true, ignorado: 'evento no aprobatorio' })

  // 3. R4 — idempotencia por (proveedor, identificador).
  if (await yaProcesado(supabase, providerId, provider)) {
    console.log('[pago-webhook] R4 evento ya procesado, se ignora', { provider, providerId })
    return json({ ok: true, repetido: true })
  }

  // 4. R5 — se busca el intento registrado y se compara el importe.
  //
  // En Mercado Pago el id al crear el cobro es el de la PREFERENCIA, y el del
  // webhook es el del PAGO: son distintos. Por eso el respaldo por `order_id`
  // (que viaja en `external_reference`) es el camino normal en el primer aviso.
  const { data: porProvider } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', provider)
    .eq('provider_id', providerId)
    .limit(1)

  let intento = porProvider?.[0] ?? null

  if (!intento && orderIdDelEvento) {
    const { data: porOrden } = await supabase
      .from('payments')
      .select('id, amount, order_id')
      .eq('provider', provider)
      .eq('order_id', orderIdDelEvento)
      .eq('status', 'pending')
      .limit(1)
    intento = porOrden?.[0] ?? null
  }

  if (!intento) {
    console.error('[pago-webhook] no hay intento registrado para este evento', {
      provider,
      providerId,
      orderIdDelEvento,
    })
    return json({ error: 'Pago no registrado' }, 409)
  }

  if (!montosCoinciden(intento.amount, montoPagado)) {
    console.error('[pago-webhook] R5 MONTO DISCREPANTE — no se marca pagado', {
      provider,
      providerId,
      esperado: intento.amount,
      montoPagado,
    })
    return json({ error: 'El monto no coincide con el pedido' }, 409)
  }

  // 5. R6 — único punto autorizado a marcar pagado. Se guarda el id del pago
  //    (no el de la preferencia) para que un reintento sea reconocido como
  //    repetido por R4.
  const { error: errPago } = await supabase
    .from('payments')
    .update({ status: 'completed', provider_id: providerId })
    .eq('id', intento.id)

  if (errPago) {
    console.error('[pago-webhook] no se pudo actualizar el pago:', errPago.message)
    return json({ error: 'No se pudo confirmar el pago' }, 500)
  }

  const { error: errOrden } = await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', intento.order_id)

  if (errOrden) console.error('[pago-webhook] no se pudo marcar el pedido:', errOrden.message)

  console.log('[pago-webhook] pago confirmado', {
    provider,
    providerId,
    orderId: intento.order_id,
  })
  return json({ ok: true, orderId: intento.order_id })
})
