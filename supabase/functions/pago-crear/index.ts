/**
 * `pago-crear` — crea el cobro de un pedido.
 *
 * REGLA R1: el navegador solo envía QUÉ quiere pagar (`orderId`). El importe se
 * recalcula aquí, desde la base. Si el cliente insiste en mandar un monto, se
 * compara y se aborta (R5).
 *
 * Secrets requeridos: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y las
 * credenciales del proveedor (para Mercado Pago: MERCADOPAGO_ACCESS_TOKEN).
 * Opcional: PUBLIC_SITE_URL para las URLs de retorno.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  CORS,
  ErrorPago,
  crearCobroEnPasarela,
  esProveedorValido,
  json,
  leerPedido,
  montosCoinciden,
} from '../_shared/pagos.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { orderId, provider, montoCliente } = await req.json().catch(() => ({}))
    if (!orderId) throw new ErrorPago('Falta orderId')

    // El proveedor viene por petición: permite tener varias pasarelas
    // habilitadas a la vez, y solo hay que quitarlo de PROVEEDORES para
    // desactivarlo.
    if (!esProveedorValido(provider)) {
      throw new ErrorPago('Proveedor no especificado o no soportado', 400)
    }

    // R1 — los ítems y el importe salen de la base, nunca del navegador.
    const { items, total } = await leerPedido(supabase, orderId)

    // R5 — si el cliente manda un monto, se compara; si difiere, se aborta.
    if (montoCliente != null && !montosCoinciden(total, montoCliente)) {
      console.warn('[pago-crear] R5 monto discrepante', { orderId, provider, total, montoCliente })
      throw new ErrorPago('El monto no coincide con el pedido', 409)
    }

    const cobro = await crearCobroEnPasarela({ provider, orderId, items, total, currency: 'PEN' })

    // Se registra el intento con el importe del SERVIDOR, para poder deduplicar
    // y comparar cuando llegue el webhook (R4, R5).
    const { error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount: total,
      currency: 'PEN',
      status: 'pending',
      provider,
      provider_id: cobro.providerId,
    })
    if (error) console.warn('[pago-crear] no se pudo registrar el intento:', error.message)

    return json({
      orderId,
      provider,
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
