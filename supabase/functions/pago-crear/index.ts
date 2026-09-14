/**
 * `pago-crear` — crea el cobro de un pedido.
 *
 * REGLA R1: el navegador solo envía QUÉ quiere pagar (`orderId`). El importe se
 * recalcula aquí, desde la base. Si el cliente insiste en mandar un monto, se
 * compara y se aborta (R5).
 *
 * Secrets requeridos: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PASARELA y las
 * credenciales de la pasarela elegida.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  CORS,
  ErrorPago,
  PASARELA,
  crearCobroEnPasarela,
  json,
  montosCoinciden,
  recalcularTotal,
} from '../_shared/pagos.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { orderId, montoCliente } = await req.json().catch(() => ({}))
    if (!orderId) throw new ErrorPago('Falta orderId')

    // R1 — el importe sale de la base, nunca del navegador.
    const total = await recalcularTotal(supabase, orderId)

    // R5 — si el cliente manda un monto, se compara; si difiere, se aborta.
    if (montoCliente != null && !montosCoinciden(total, montoCliente)) {
      console.warn('[pago-crear] R5 monto discrepante', { orderId, total, montoCliente })
      throw new ErrorPago('El monto no coincide con el pedido', 409)
    }

    if (!PASARELA) throw new ErrorPago('PASARELA_NO_CONFIGURADA', 501)

    const cobro = await crearCobroEnPasarela({ orderId, total, currency: 'PEN' })

    // Se registra el intento con el importe del SERVIDOR, para poder deduplicar
    // y comparar cuando llegue el webhook (R4, R5).
    const { error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount: total,
      currency: 'PEN',
      status: 'pending',
      provider: PASARELA,
      provider_id: cobro.providerId,
    })
    if (error) console.warn('[pago-crear] no se pudo registrar el intento:', error.message)

    return json({
      orderId,
      amount: total,
      currency: 'PEN',
      providerId: cobro.providerId,
      qrImage: cobro.qrImage ?? null,
      redirectUrl: cobro.redirectUrl ?? null,
    })
  } catch (err) {
    const status = err instanceof ErrorPago ? err.status : 500
    console.error('[pago-crear]', err)
    return json(
      { error: err instanceof Error ? err.message : 'No se pudo crear el cobro' },
      status,
    )
  }
})
