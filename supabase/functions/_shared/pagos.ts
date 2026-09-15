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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

export class ErrorPago extends Error {
  constructor(message: string, readonly status = 400) {
    super(message)
  }
}

// ── Pasarelas soportadas ─────────────────────────────────────────────────────
/**
 * Proveedores permitidos. El activo se resuelve **por petición** (query
 * `?provider=...` en el webhook, campo `provider` en `pago-crear`), nunca por
 * una constante global: así pueden convivir varias pasarelas a la vez.
 */
export const PROVEEDORES = ['mercadopago', 'taypi'] as const
export type Proveedor = (typeof PROVEEDORES)[number]

export function esProveedorValido(valor: unknown): valor is Proveedor {
  return typeof valor === 'string' && (PROVEEDORES as readonly string[]).includes(valor)
}

/** Proveedor de la petición actual, o `null` si falta o es desconocido. */
export function proveedorDeRequest(req: Request): Proveedor | null {
  const valor = new URL(req.url).searchParams.get('provider') ?? ''
  return esProveedorValido(valor) ? valor : null
}

/** Header donde cada pasarela envía la firma del webhook. */
export const HEADER_FIRMA: Record<string, string> = {
  mercadopago: 'x-signature',
  taypi: 'x-taypi-signature',
}

/** Variable de entorno que guarda el secreto de webhook de cada pasarela. */
export const ENV_WEBHOOK_SECRET: Record<string, string> = {
  mercadopago: 'MERCADOPAGO_WEBHOOK_SECRET',
  taypi: 'TAYPI_WEBHOOK_SECRET',
}

export function secretWebhookDe(provider: string): string | undefined {
  const nombre = ENV_WEBHOOK_SECRET[provider]
  return nombre ? Deno.env.get(nombre) : undefined
}

// ── R1 · El pedido y su importe se leen del servidor ─────────────────────────
export type ItemPedido = { titulo: string; cantidad: number; precioUnitario: number }
export type Pedido = { items: ItemPedido[]; total: number }

function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

/**
 * Lee los ítems REALES del pedido desde `order_items`. Es la única fuente válida
 * del importe: cualquier monto que llegue del navegador se ignora o se compara.
 */
export async function leerPedido(supabase: any, orderId: string): Promise<Pedido> {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_title, quantity, unit_price')
    .eq('order_id', orderId)

  if (error) throw new ErrorPago(`No se pudo leer el pedido: ${error.message}`, 500)
  if (!data || data.length === 0) throw new ErrorPago('El pedido no tiene ítems', 409)

  const items: ItemPedido[] = data.map((fila: any) => ({
    titulo: String(fila.product_title ?? 'Producto'),
    cantidad: Number(fila.quantity ?? 1),
    precioUnitario: Number(fila.unit_price ?? 0),
  }))

  const total = redondear2(
    items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0),
  )
  if (!(total > 0)) throw new ErrorPago('El pedido no tiene importe válido', 409)

  return { items, total }
}

// ── R5 · Coincidencia de montos ──────────────────────────────────────────────
export function montosCoinciden(esperado: number, recibido: unknown): boolean {
  const a = Math.round(Number(esperado) * 100)
  const b = Math.round(Number(recibido) * 100)
  return Number.isFinite(b) && a === b
}

// ── R3 · Verificación de firma ───────────────────────────────────────────────
/** HMAC-SHA256 en hex, comparado en tiempo constante (no filtra por tiempos). */
async function hmacHex(secret: string, mensaje: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(mensaje))
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function compararTiempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Firma sobre el cuerpo crudo. La usan los proveedores que firman el payload. */
export async function firmaValida(
  secret: string | undefined,
  rawBody: string,
  recibida: string | null,
): Promise<boolean> {
  if (!secret || !recibida) return false
  return compararTiempoConstante(await hmacHex(secret, rawBody), recibida)
}

/**
 * Firma de Mercado Pago. **No se calcula sobre el cuerpo**: MP firma un
 * "manifest" armado con el id del recurso, el request-id y el timestamp.
 *
 * Header recibido:  `x-signature: ts=1704908010,v1=<hmac>`
 * Manifest firmado: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 *
 * `data.id` se toma del query string (MP lo envía ahí) y, si es alfanumérico,
 * se pasa a minúsculas — así lo especifica su documentación.
 */
export async function firmaMercadoPagoValida(
  req: Request,
  dataId: string,
  secret: string | undefined,
): Promise<boolean> {
  if (!secret || !dataId) return false

  const header = req.headers.get('x-signature') ?? ''
  const partes = Object.fromEntries(
    header.split(',').map((trozo) => {
      const [k, v] = trozo.split('=')
      return [String(k).trim(), String(v ?? '').trim()]
    }),
  )
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false

  const requestId = req.headers.get('x-request-id') ?? ''
  const idNormalizado = /^\d+$/.test(dataId) ? dataId : dataId.toLowerCase()
  const manifest = `id:${idNormalizado};request-id:${requestId};ts:${ts};`

  return compararTiempoConstante(await hmacHex(secret, manifest), v1)
}

// ── R4 · Idempotencia ────────────────────────────────────────────────────────
/** ¿Este evento ya fue aplicado? El id solo es único DENTRO de su proveedor. */
export async function yaProcesado(
  supabase: any,
  providerId: string,
  provider: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', provider)
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  return Boolean(data && data.length > 0)
}

// ── Mercado Pago ─────────────────────────────────────────────────────────────
const MP_API = 'https://api.mercadopago.com'

export function mpAccessToken(): string | undefined {
  return Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? undefined
}

/** ¿Las credenciales son de prueba? */
export function mpEsTest(): boolean {
  // El modo se declara EXPLÍCITAMENTE antes que adivinarlo: Mercado Pago ha
  // cambiado el prefijo de sus credenciales de prueba, así que depender solo de
  // `TEST-` puede mandar a un cobro real sin querer.
  //   MERCADOPAGO_MODO=test       → sandbox_init_point
  //   MERCADOPAGO_MODO=produccion → init_point
  // Sin la variable se usa la heurística por prefijo como respaldo.
  const modo = (Deno.env.get('MERCADOPAGO_MODO') ?? '').toLowerCase()
  if (modo === 'test' || modo === 'prueba' || modo === 'sandbox') return true
  if (modo === 'produccion' || modo === 'production' || modo === 'live') return false
  return (mpAccessToken() ?? '').startsWith('TEST-')
}

export type PagoMercadoPago = {
  providerId: string
  estado: string
  monto: number
  orderId: string | null
}

/**
 * MP **no envía el monto en el webhook**: solo el id de la notificación. Hay que
 * consultar el pago contra su API para conocer estado, importe y pedido.
 */
export async function obtenerPagoMercadoPago(paymentId: string): Promise<PagoMercadoPago> {
  const token = mpAccessToken()
  if (!token) throw new ErrorPago('Falta MERCADOPAGO_ACCESS_TOKEN', 501)

  const respuesta = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw new ErrorPago(`MP rechazó la consulta del pago (${respuesta.status}): ${detalle}`, 502)
  }

  const pago = await respuesta.json()
  return {
    providerId: String(pago.id ?? paymentId),
    estado: String(pago.status ?? ''),
    monto: Number(pago.transaction_amount ?? 0),
    orderId: pago?.metadata?.order_id ?? pago?.external_reference ?? null,
  }
}

/** Crea la preferencia de Checkout Pro. Se llama SIEMPRE desde el servidor. */
async function crearCobroMercadoPago(args: {
  orderId: string
  items: ItemPedido[]
  total: number
  currency: string
}): Promise<Cobro> {
  const token = mpAccessToken()
  if (!token) throw new ErrorPago('Falta MERCADOPAGO_ACCESS_TOKEN', 501)

  const base = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.qawaylab.com'
  const webhookBase = Deno.env.get('SUPABASE_URL') ?? ''

  const cuerpo = {
    items: args.items.map((item) => ({
      title: item.titulo,
      quantity: item.cantidad,
      unit_price: item.precioUnitario,
      currency_id: args.currency,
    })),
    // El importe ya viene recalculado del servidor: MP nunca recibe un monto del cliente.
    external_reference: args.orderId,
    metadata: { order_id: args.orderId },
    back_urls: {
      success: `${base}/carrito/compras`,
      failure: `${base}/carrito/checkout`,
      pending: `${base}/carrito/compras`,
    },
    auto_return: 'approved',
    notification_url: webhookBase
      ? `${webhookBase}/functions/v1/pago-webhook?provider=mercadopago`
      : undefined,
    statement_descriptor: 'QAWAYLAB',
  }

  const respuesta = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      // Clave de idempotencia: evita crear dos preferencias si el navegador reintenta.
      'X-Idempotency-Key': `pref-${args.orderId}`,
    },
    body: JSON.stringify(cuerpo),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw new ErrorPago(`MP rechazó la creación del cobro (${respuesta.status}): ${detalle}`, 502)
  }

  const preferencia = await respuesta.json()
  const esTest = mpEsTest()
  const url = esTest ? preferencia.sandbox_init_point : preferencia.init_point

  if (!url) {
    // No se cae a `init_point` a propósito: en modo prueba eso significaría
    // cobrarle de verdad a alguien. Mejor fallar y decirlo.
    throw new ErrorPago(
      esTest
        ? 'Modo PRUEBA pero MP no devolvió sandbox_init_point. Revisa que el token sea el de la pestaña "Prueba" y que MERCADOPAGO_MODO=test.'
        : 'MP no devolvió init_point para el cobro.',
      502,
    )
  }

  return { providerId: String(preferencia.id), redirectUrl: String(url) }
}

// ── Punto de extensión de pasarela ───────────────────────────────────────────
export type Cobro = { providerId: string; qrImage?: string; redirectUrl?: string }

/**
 * SEAM DE PASARELA. Reglas que respeta cada implementación:
 *   1. Clave SECRETA desde `Deno.env` — jamás desde el cliente (R2).
 *   2. `total` e `items` vienen recalculados del servidor (R1).
 *   3. Devuelve el identificador de la transacción para poder deduplicar (R4).
 *
 * Proveedores sin implementar fallan de forma explícita: no se simula un cobro
 * ni se devuelve un identificador falso.
 */
export async function crearCobroEnPasarela(args: {
  provider: Proveedor
  orderId: string
  items: ItemPedido[]
  total: number
  currency: string
}): Promise<Cobro> {
  if (args.provider === 'mercadopago') {
    return crearCobroMercadoPago(args)
  }

  // TAYPI: su registro de comercios está deshabilitado y su firma de webhook no
  // está especificada en la documentación pública consultada. No se implementa a
  // ciegas: se falla de forma explícita.
  throw new ErrorPago(
    `La pasarela "${args.provider}" aún no está implementada en este seam`,
    501,
  )
}
