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
// ─────────────────────────────────────────────────────────────
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_BASE = Deno.env.get('SUNAT_LOOKUP_API_BASE') ?? 'https://api.apis.net.pe/v2'
const API_TOKEN = Deno.env.get('SUNAT_LOOKUP_API_TOKEN')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

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
  // DNI / CE / pasaporte → nombres completos
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

  // Solo autenticados (evita abuso anónimo del token pagado del proveedor)
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ success: false, error: 'Supabase no configurado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!API_TOKEN) {
    return new Response(
      JSON.stringify({ success: false, error: 'SUNAT_LOOKUP_API_TOKEN no configurado (secrets)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  let body: LookupBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Body inválido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const docType = readString(body.doc_type).toUpperCase()
  const docNumber = readString(body.doc_number).replace(/[\s-]/g, '')

  if (!docType || !docNumber) {
    return new Response(JSON.stringify({ success: false, error: 'doc_type y doc_number son obligatorios' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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
      const detail = await res.text().catch(() => '')
      return new Response(
        JSON.stringify({
          success: false,
          error: `El proveedor respondió ${res.status}: ${detail.slice(0, 200) || 'error de consulta'}`,
        }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const payload = await res.json()
    const data = normalizeResponse(isRuc ? 'RUC' : 'DNI', payload)
    if (!data.fiscal_name) {
      return new Response(JSON.stringify({ success: false, error: 'Documento no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Error de red' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
