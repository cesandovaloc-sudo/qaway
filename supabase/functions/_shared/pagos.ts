/**
 * Núcleo de seguridad de pagos.
 *
 * Implementa REGLAS-PAGOS-SEGUROS.md. Ninguna ruta de cobro debe saltarse estas
 * funciones: son la única barrera entre un navegador (no confiable) y el estado
 * "pagado" de un pedido (confiable).
 *
 * Se ejecuta ÚNICAMENTE en el servidor, con `SUPABASE_SERVICE_ROLE_KEY`. Nunca
 * importar este archivo desde el cliente.
 */

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Pasarela activa ──────────────────────────────────────────────────────────
/** Cambia aquí cuando se decida la pasarela: 'mercadopago' | 'culqi' | 'taypi'. */
export const PASARELA = Deno.env.get('PASARELA') ?? ''

/** Nombre del header de firma de cada pasarela. */
export const HEADER_FIRMA: Record<string, string> = {
  mercadopago: 'x-signature',
  culqi: 'x-culqi-signature',
  taypi: 'x-taypi-signature',
}

export class ErrorPago extends Error {
  constructor(message: string, readonly status = 400) {
    super(message)
  }
}

// ── R1 · El total se recalcula en el servidor ────────────────────────────────
/**
 * Suma los subtotales reales de `order_items`. Es la ÚNICA fuente válida del
 * importe: cualquier monto que llegue del navegador se ignora o se compara.
 */
export async function recalcularTotal(supabase: any, orderId: string): Promise<number> {
  const { data, error } = await supabase
    .from('order_items')
    .select('subtotal')
    .eq('order_id', orderId)

  if (error) throw new ErrorPago(`No se pudo leer el pedido: ${error.message}`, 500)
  if (!data || data.length === 0) throw new ErrorPago('El pedido no tiene ítems', 409)

  const total = data.reduce((sum: number, row: any) => sum + Number(row.subtotal || 0), 0)
  if (!(total > 0)) throw new ErrorPago('El pedido no tiene importe válido', 409)

  // Redondeo a 2 decimales, igual que la columna decimal(10,2).
  return Math.round((total + Number.EPSILON) * 100) / 100
}

// ── R5 · Coincidencia de montos ──────────────────────────────────────────────
export function montosCoinciden(esperado: number, recibido: unknown): boolean {
  const a = Math.round(Number(esperado) * 100)
  const b = Math.round(Number(recibido) * 100)
  return Number.isFinite(b) && a === b
}

// ── R3 · Firma del webhook ───────────────────────────────────────────────────
/**
 * Verifica una firma HMAC-SHA256 (hex) en **tiempo constante**, para no filtrar
 * información por diferencia de tiempos.
 */
export async function firmaValida(
  secret: string | undefined,
  rawBody: string,
  recibida: string | null,
): Promise<boolean> {
  if (!secret || !recibida) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const hex = [...new Uint8Array(mac)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  if (hex.length !== recibida.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ recibida.charCodeAt(i)
  return diff === 0
}

// ── R4 · Idempotencia ────────────────────────────────────────────────────────
/** ¿Este evento de la pasarela ya fue aplicado? */
export async function yaProcesado(supabase: any, providerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  return Boolean(data && data.length > 0)
}

// ── Punto de extensión de pasarela ───────────────────────────────────────────
export type Cobro = { providerId: string; qrImage?: string; redirectUrl?: string }

/**
 * SEAM DE PASARELA. Aquí se conecta Mercado Pago, Culqi o TAYPI (QR
 * interoperable). Reglas que debe respetar la implementación:
 *
 *   1. Usar la clave SECRETA desde `Deno.env` — jamás desde el cliente (R2).
 *   2. Enviar `total` (el recalculado en el servidor), nunca un monto recibido
 *      del navegador (R1).
 *   3. Devolver el identificador de la transacción para poder deduplicar (R4).
 *
 * Mientras `PASARELA` no esté configurada se falla de forma explícita: no se
 * simula un cobro ni se devuelve un identificador falso.
 */
export async function crearCobroEnPasarela(
  _args: { orderId: string; total: number; currency: string },
): Promise<Cobro> {
  throw new ErrorPago(
    PASARELA
      ? `La pasarela "${PASARELA}" aún no está implementada en este seam`
      : 'PASARELA_NO_CONFIGURADA',
    501,
  )
}
