// ─────────────────────────────────────────────────────────────
// Edge Function: consulta RUC (SUNAT) y DNI (RENIEC)
// -------------------------------------------------------------
// Autocompleta la razón social / nombres y el domicilio fiscal
// de un cliente desde el proveedor configurado. El token del
// proveedor vive SOLO aquí (secrets de la Edge Function), nunca
// en el bundle del frontend.
//
// Proveedor por defecto: apis.net.pe v2 (plan free).
//   RUC:  GET {BASE}/sunat/ruc?numero={ruc}&token={TOKEN}
//   DNI:  GET {BASE}/reniec/dni?numero={dni}&token={TOKEN}
// Configurable por env sin tocar código:
//   SUNAT_LOOKUP_API_BASE  (default: https://api.apis.net.pe/v2)
//   SUNAT_LOOKUP_API_TOKEN (obligatorio)
//
// Uso desde el cliente:
//   supabase.functions.invoke('consulta-ruc-dni', {
//     body: { doc_type: 'RUC', doc_number: '20131312955' },
//   })
//
// Endurecimiento run-2 (N-06/N-07/N-08):
//   - N-08: import de supabase-js pineado a versión exacta (sin tag mayor).
//   - N-06: capability ligada al rol de la app (user_app_role), no solo a
//     la existencia de sesión. guest → 403.
//   - N-07: rate-limit por usuario (ventana fija en memoria del isolate) y
//     validación estricta de doc_type/doc_number antes de gastar el token.
//     NOTA: el límite en memoria se reinicia en cold start; el límite a
//     nivel plataforma (gateway/quotas) es refuerzo del Bloque 2.
// ─────────────────────────────────────────────────────────────
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// N-08: versión exacta pineada (lockfile del repo: 2.112.1). Actualizar el
// pin junto con package.json, nunca dejar tag mayor suelto.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.1'

const API_BASE = Deno.env.get('SUNAT_LOOKUP_API_BASE') ?? 'https://api.apis.net.pe/v2'
const API_TOKEN = Deno.env.get('SUNAT_LOOKUP_API_TOKEN')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

// N-07: límite de uso por principal (ventana fija de 60s en memoria).
const RATE_LIMIT_MAX = Number(Deno.env.get('SUNAT_LOOKUP_RATE_LIMIT') ?? '30')
const RATE_LIMIT_WINDOW_MS = 60_000
const rateBuckets = new Map<string, { count: number; windowStart: number }>()

function rateLimitAllow(userId: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(userId)
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // Poda defensiva para no crecer sin límite con usuarios distintos.
    if (rateBuckets.size > 5_000) rateBuckets.clear()
    rateBuckets.set(userId, { count: 1, windowStart: now })
    return { allowed: true, retryAfterSec: 0 }
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((bucket.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfterSec }
  }
  bucket.count += 1
  return { allowed: true, retryAfterSec: 0 }
}

// N-07: formatos oficiales antes de contactar al proveedor pagado.
const RUC_RE = /^\d{11}$/
const DNI_RE = /^\d{8}$/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LookupBody {
  doc_type?: string
  doc_number?: string
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeResponse(docType: string, payload: Record<string, unknown>) {
  if (docType === 'RUC') {
    return {
      fiscal_name:
        readString(payload['razonSocial']) ||
        readString(payload['nombreLegal']) ||
        readString(payload['nombre_comercial']),
      address:
        readString(payload['direccionCompleta']) ||
        readString(payload['direccion']) ||
        null,
      raw: payload,
    }
  }
  // DNI → nombres completos
  const names = [
    readString(payload['nombres']),
    readString(payload['apellidoPaterno']),
    readString(payload['apellidoMaterno']),
  ].filter(Boolean)
  return {
    fiscal_name: names.join(' ') || readString(payload['nombre']),
    address: null,
    raw: payload,
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ success: false, error: 'Supabase no configurado' }, 500)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })

  // N-06: autenticación + rol de la app. La capability gasta el token pagado
  // del proveedor y devuelve PII fiscal: no puede quedar disponible para todo
  // principal autenticado del proyecto compartido (hub/academy/web incluidos).
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return json({ success: false, error: 'No autorizado' }, 401)
  }

  const { data: canUseCustomers, error: featureError } = await supabase.rpc('user_can_use_feature', {
    p_app_slug: 'inventario',
    p_feature_key: 'customers',
  })
  if (featureError || canUseCustomers !== true) {
    return json({ success: false, error: 'No autorizado para consultas fiscales' }, 403)
  }

  // N-07: presupuesto medido protegido por principal.
  const rate = rateLimitAllow(user.id)
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ success: false, error: 'Límite de consultas alcanzado, intenta más tarde' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rate.retryAfterSec) },
      },
    )
  }

  if (!API_TOKEN) {
    return json({ success: false, error: 'SUNAT_LOOKUP_API_TOKEN no configurado (secrets)' }, 500)
  }

  let body: LookupBody
  try {
    body = await req.json()
  } catch {
    return json({ success: false, error: 'Body inválido' }, 400)
  }

  // N-07: allowlist de doc_type (antes cualquier valor caía a /reniec/dni).
  const docType = readString(body.doc_type).toUpperCase()
  const docNumber = readString(body.doc_number).replace(/[\s-]/g, '')

  if (!docType || !docNumber) {
    return json({ success: false, error: 'doc_type y doc_number son obligatorios' }, 400)
  }
  if (docType !== 'RUC' && docType !== 'DNI') {
    return json({ success: false, error: 'doc_type debe ser RUC o DNI' }, 400)
  }
  if (docType === 'RUC' ? !RUC_RE.test(docNumber) : !DNI_RE.test(docNumber)) {
    return json({ success: false, error: 'Formato de documento inválido' }, 400)
  }

  // apis.net.pe v2 usa el token como query param; se envía además como
  // Bearer para compatibilidad con proveedores que lo exigen por header.
  const isRuc = docType === 'RUC'
  const endpoint = isRuc ? `${API_BASE}/sunat/ruc` : `${API_BASE}/reniec/dni`
  const url = `${endpoint}?numero=${encodeURIComponent(docNumber)}&token=${encodeURIComponent(API_TOKEN)}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    })

    if (!res.ok) {
      // Endurecimiento: no se refleja el cuerpo del proveedor al cliente.
      return json(
        { success: false, error: `El proveedor respondió ${res.status}: error de consulta` },
        res.status === 404 ? 404 : 502,
      )
    }

    const payload = await res.json()
    const data = normalizeResponse(isRuc ? 'RUC' : 'DNI', payload)
    if (!data.fiscal_name) {
      return json({ success: false, error: 'Documento no encontrado' }, 404)
    }
    return json({ success: true, data }, 200)
  } catch {
    return json({ success: false, error: 'Error consultando al proveedor' }, 502)
  }
})
