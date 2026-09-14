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
 * Secrets requeridos: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PASARELA y
 * PASARELA_WEBHOOK_SECRET.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  HEADER_FIRMA,
  PASARELA,
  firmaValida,
  json,
  montosCoinciden,
  yaProcesado,
} from '../_shared/pagos.ts'

serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // R3 — la firma se calcula sobre el CUERPO CRUDO: hay que leer texto antes de
  // parsear, porque `req.json()` consumiría el stream y cambiaría los bytes.
  const rawBody = await req.text()
  const header = HEADER_FIRMA[PASARELA] ?? ''
  const recibida = header ? req.headers.get(header) : null

  if (!(await firmaValida(Deno.env.get('PASARELA_WEBHOOK_SECRET'), rawBody, recibida))) {
    console.warn('[pago-webhook] R3 firma inválida o ausente', { header, pasarela: PASARELA })
    return json({ error: 'Firma inválida' }, 401)
  }

  let evento: Record<string, any>
  try {
    evento = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }

  // ── NORMALIZACIÓN POR PASARELA ───────────────────────────────────────────
  // Único bloque que cambia entre Mercado Pago, Culqi y TAYPI.
  const datos = evento?.data ?? {}
  const providerId = String(datos.id ?? evento.id ?? '')
  const orderId = String(datos.metadata?.order_id ?? evento.metadata?.order_id ?? '')
  const montoPagado = datos.transaction_amount ?? datos.amount ?? evento.amount
  const aprobado =
    evento?.type === 'payment' || evento?.type === 'order'
      ? datos.status === 'approved' || datos.status === 'paid'
      : evento?.status === 'succeeded' || evento?.status === 'paid'

  if (!providerId) {
    console.warn('[pago-webhook] evento sin identificador')
    return json({ error: 'Evento sin identificador' }, 400)
  }

  // 2. Evento no aprobatorio (rechazo, reembolso, notificación de estado): se
  //    confirma la recepción para que la pasarela no reintente.
  if (!aprobado) return json({ ok: true, ignorado: 'evento no aprobatorio' })

  // 3. R4 — idempotencia.
  if (await yaProcesado(supabase, providerId)) {
    console.log('[pago-webhook] R4 evento ya procesado, se ignora', { providerId })
    return json({ ok: true, repetido: true })
  }

  // 4. R5 — se busca el intento registrado y se compara el importe.
  const { data: porProvider } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider_id', providerId)
    .limit(1)

  let intento = porProvider?.[0] ?? null

  if (!intento && orderId) {
    const { data: porOrden } = await supabase
      .from('payments')
      .select('id, amount, order_id')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .limit(1)
    intento = porOrden?.[0] ?? null
  }

  if (!intento) {
    console.error('[pago-webhook] no hay intento registrado para este evento', { providerId, orderId })
    return json({ error: 'Pago no registrado' }, 409)
  }

  if (!montosCoinciden(intento.amount, montoPagado)) {
    console.error('[pago-webhook] R5 MONTO DISCREPANTE — no se marca pagado', {
      providerId,
      esperado: intento.amount,
      montoPagado,
    })
    return json({ error: 'El monto no coincide con el pedido' }, 409)
  }

  // 5. R6 — único punto autorizado a marcar pagado.
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

  console.log('[pago-webhook] pago confirmado', { providerId, orderId: intento.order_id })
  return json({ ok: true, orderId: intento.order_id })
})
