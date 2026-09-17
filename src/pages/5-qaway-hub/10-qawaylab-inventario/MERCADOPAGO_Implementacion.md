# MERCADO PAGO — Implementación Oficial

## 1. Finalidad

Este documento registra la arquitectura, nomenclatura y validaciones oficiales para integrar **Mercado Pago** como pasarela de cobros con tarjeta y cuotas en Qaway Lab, dejando documentados con el mismo rigor que TAYPI:

- La nomenclatura simétrica y uniforme.
- Las **4 Edge Functions** oficiales (2 para Test y 2 para Producción).
- La auditoría y lista de **Secrets en Supabase** necesarios.
- De dónde obtener cada credencial en el panel de Mercado Pago Developers.
- Los códigos completos de las 4 funciones (R1 a R6).
- El procedimiento de migración desde las funciones genéricas anteriores.

---

## 2. Proyecto Supabase

**Proyecto:** Qaway Lab Project  
**Branch:** `main`  
**Estado:** Production  
**Project Ref:** `qrusdsqgygfolxfrafyd`  

### URLs base de invocación

**Supabase Functions:**
```
https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/{nombre-function}
```

**Mercado Pago Sandbox API:**
```
https://sandbox.mercadopago.com.pe
```

**Mercado Pago Producción API:**
```
https://api.mercadopago.com
```

---

## 3. Nomenclatura oficial utilizada (Espejo de TAYPI)

Para garantizar consistencia de lectura, orden y aislamiento absoluto de entornos:

### Las 4 Edge Functions en Supabase

#### Sandbox / Pruebas
- `mercadopago-pago-test` ➔ Genera la preferencia y devuelve la URL de pago Sandbox (`sandbox_init_point`).
- `mercadopago-webhook-test` ➔ Recibe la notificación de prueba, valida firma HMAC y confirma el pedido.

#### Producción
- `mercadopago-pago-prod` ➔ Genera la preferencia oficial con cobro real (`init_point`).
- `mercadopago-webhook-prod` ➔ Recibe la notificación bancaria real, valida firma HMAC y confirma el pedido.

---

### Los Secrets requeridos en Supabase

En Supabase se crean exactamente **6 secrets propios de Mercado Pago** (3 para Sandbox y 3 para Producción) + 1 secret de URL general:

#### Secrets Sandbox (3 secrets)
1. `MERCADOPAGO_TEST_PUBLIC_KEY`: Clave pública de prueba de Mercado Pago.
2. `MERCADOPAGO_TEST_ACCESS_TOKEN`: Token de acceso privado de prueba (`APP_USR-...` o `TEST-...`).
3. `MERCADOPAGO_TEST_WEBHOOK_SECRET`: Secreto de firma de webhook para notificaciones de prueba.

#### Secrets Producción (3 secrets)
4. `MERCADOPAGO_PROD_PUBLIC_KEY`: Clave pública real de Mercado Pago.
5. `MERCADOPAGO_PROD_ACCESS_TOKEN`: Token de acceso privado real de producción (`APP_USR-...`).
6. `MERCADOPAGO_PROD_WEBHOOK_SECRET`: Secreto de firma de webhook para notificaciones de cobro real.

#### Secret General (1 secret compartido)
7. `PUBLIC_SITE_URL`: `https://www.qawaylab.com` (URL HTTPS canónica a la que Mercado Pago redirige tras el pago).

---

## 4. De dónde obtener cada credencial (Mercado Pago Developers)

1. Ingresa a **[Mercado Pago Developers](https://www.mercadopago.com.pe/developers)** con tu cuenta de negocio.
2. Ve a **Tus integraciones** ➔ Selecciona tu aplicación (ej. `Qaway Lab`).
3. En el menú lateral izquierdo:
   - **Credenciales de prueba:**
     - Copia `Public Key` ➔ Guárdalo en Supabase como `MERCADOPAGO_TEST_PUBLIC_KEY`.
     - Copia `Access Token` ➔ Guárdalo en Supabase como `MERCADOPAGO_TEST_ACCESS_TOKEN`.
   - **Credenciales de producción:**
     - Copia `Public Key` ➔ Guárdalo en Supabase como `MERCADOPAGO_PROD_PUBLIC_KEY`.
     - Copia `Access Token` ➔ Guárdalo en Supabase como `MERCADOPAGO_PROD_ACCESS_TOKEN`.
4. En **Notificaciones Webhook** (Configurar Webhook):
   - **URL para Pruebas:**
     `https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/mercadopago-webhook-test?provider=mercadopago`
     Copia el secreto generado ➔ Guárdalo como `MERCADOPAGO_TEST_WEBHOOK_SECRET`.
   - **URL para Producción:**
     `https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/mercadopago-webhook-prod?provider=mercadopago`
     Copia el secreto generado ➔ Guárdalo como `MERCADOPAGO_PROD_WEBHOOK_SECRET`.
   - **Eventos a escuchar:** Marcar casilla `Pagos` (`payment`).

---

## 5. Código Fuente de las 4 Edge Functions

### 5.1. `mercadopago-pago-test` (index.ts)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MP_API = 'https://api.mercadopago.com'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { orderId } = await req.json().catch(() => ({}))
    if (!orderId) return json({ error: 'Falta orderId' }, 400)

    // R1: Leer ítems y monto desde la BD (servidor)
    const { data: orden, error: errOrden } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('id', orderId)
      .single()

    if (errOrden || !orden) return json({ error: 'Pedido no encontrado' }, 404)

    const { data: itemsBd, error: errItems } = await supabase
      .from('order_items')
      .select('product_title, quantity, unit_price')
      .eq('order_id', orderId)

    if (errItems || !itemsBd?.length) return json({ error: 'El pedido no tiene ítems' }, 400)

    const items = itemsBd.map((it: any) => ({
      title: it.product_title,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      currency_id: 'PEN',
    }))

    const totalCalculado = items.reduce((acc: number, it: any) => acc + it.unit_price * it.quantity, 0)
    const total = Math.round(totalCalculado * 100) / 100

    const token =
      Deno.env.get('MERCADOPAGO_TEST_ACCESS_TOKEN') ??
      Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (!token) return json({ error: 'Falta MERCADOPAGO_TEST_ACCESS_TOKEN' }, 501)

    const base = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.qawaylab.com'
    const webhookBase = Deno.env.get('SUPABASE_URL') ?? ''

    const cuerpo = {
      items,
      external_reference: orderId,
      metadata: { order_id: orderId },
      back_urls: {
        success: `${base}/carrito/compras`,
        failure: `${base}/carrito/checkout`,
        pending: `${base}/carrito/compras`,
      },
      auto_return: 'approved',
      notification_url: webhookBase
        ? `${webhookBase}/functions/v1/mercadopago-webhook-test?provider=mercadopago`
        : undefined,
      statement_descriptor: 'QAWAYLAB-TEST',
    }

    const respuestaMp = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pref-test-${orderId}`,
      },
      body: JSON.stringify(cuerpo),
    })

    if (!respuestaMp.ok) {
      const detalle = await respuestaMp.text().catch(() => '')
      return json({ error: `MP Test rechazó el cobro (${respuestaMp.status}): ${detalle}` }, 502)
    }

    const preferencia = await respuestaMp.json()
    const url = preferencia.sandbox_init_point ?? preferencia.init_point

    await supabase.from('payments').insert({
      order_id: orderId,
      amount: total,
      currency: 'PEN',
      status: 'pending',
      provider: 'mercadopago',
      provider_id: String(preferencia.id),
    })

    return json({
      orderId,
      provider: 'mercadopago',
      amount: total,
      currency: 'PEN',
      providerId: String(preferencia.id),
      redirectUrl: String(url),
    })
  } catch (err: any) {
    return json({ error: err?.message || 'Error interno en Test' }, 500)
  }
})
```

---

### 5.2. `mercadopago-pago-prod` (index.ts)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MP_API = 'https://api.mercadopago.com'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { orderId } = await req.json().catch(() => ({}))
    if (!orderId) return json({ error: 'Falta orderId' }, 400)

    // R1: Leer ítems y monto desde la BD
    const { data: orden, error: errOrden } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('id', orderId)
      .single()

    if (errOrden || !orden) return json({ error: 'Pedido no encontrado' }, 404)

    const { data: itemsBd, error: errItems } = await supabase
      .from('order_items')
      .select('product_title, quantity, unit_price')
      .eq('order_id', orderId)

    if (errItems || !itemsBd?.length) return json({ error: 'El pedido no tiene ítems' }, 400)

    const items = itemsBd.map((it: any) => ({
      title: it.product_title,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      currency_id: 'PEN',
    }))

    const totalCalculado = items.reduce((acc: number, it: any) => acc + it.unit_price * it.quantity, 0)
    const total = Math.round(totalCalculado * 100) / 100

    const token =
      Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
      Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (!token) return json({ error: 'Falta MERCADOPAGO_PROD_ACCESS_TOKEN' }, 501)

    const base = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.qawaylab.com'
    const webhookBase = Deno.env.get('SUPABASE_URL') ?? ''

    const cuerpo = {
      items,
      external_reference: orderId,
      metadata: { order_id: orderId },
      back_urls: {
        success: `${base}/carrito/compras`,
        failure: `${base}/carrito/checkout`,
        pending: `${base}/carrito/compras`,
      },
      auto_return: 'approved',
      notification_url: webhookBase
        ? `${webhookBase}/functions/v1/mercadopago-webhook-prod?provider=mercadopago`
        : undefined,
      statement_descriptor: 'QAWAYLAB',
    }

    const respuestaMp = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pref-${orderId}`,
      },
      body: JSON.stringify(cuerpo),
    })

    if (!respuestaMp.ok) {
      const detalle = await respuestaMp.text().catch(() => '')
      console.error('[MP Prod] Error creando cobro:', respuestaMp.status, detalle)
      return json({ error: `Mercado Pago rechazó el cobro (${respuestaMp.status}): ${detalle}` }, 502)
    }

    const preferencia = await respuestaMp.json()
    const url = preferencia.init_point ?? preferencia.sandbox_init_point

    if (!url) return json({ error: 'MP no devolvió URL de cobro oficial' }, 502)

    await supabase.from('payments').insert({
      order_id: orderId,
      amount: total,
      currency: 'PEN',
      status: 'pending',
      provider: 'mercadopago',
      provider_id: String(preferencia.id),
    })

    return json({
      orderId,
      provider: 'mercadopago',
      amount: total,
      currency: 'PEN',
      providerId: String(preferencia.id),
      redirectUrl: String(url),
    })
  } catch (err: any) {
    console.error('[mercadopago-pago-prod]', err)
    return json({ error: err?.message || 'Error interno' }, 500)
  }
})
```

---

### 5.3. `mercadopago-webhook-test` (index.ts)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function firmaMpValida(req: Request, dataId: string, secret: string): Promise<boolean> {
  if (!secret) return false
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.trim().split('=')
      return [k, v]
    }),
  )
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const firmaBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest))
  const hashHex = Array.from(new Uint8Array(firmaBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hashHex === v1
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const rawBody = await req.text()
  let evento: any = {}
  try {
    evento = JSON.parse(rawBody || '{}')
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }

  const dataId = new URL(req.url).searchParams.get('data.id') ?? String(evento?.data?.id ?? '')
  const secret =
    Deno.env.get('MERCADOPAGO_TEST_WEBHOOK_SECRET') ??
    Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? ''

  // R3: Firma de Sandbox
  const valida = await firmaMpValida(req, dataId, secret)
  if (!valida) return json({ error: 'Firma de Test inválida' }, 401)

  if (evento?.type && evento.type !== 'payment') {
    return json({ ok: true, ignorado: `evento ${evento.type}` })
  }

  const token =
    Deno.env.get('MERCADOPAGO_TEST_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''

  const respMp = await fetch(`${MP_API}/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respMp.ok) return json({ error: 'No se pudo consultar pago en MP Test' }, 502)

  const pago = await respMp.json()
  const providerId = String(pago.id ?? dataId)
  const montoPagado = Number(pago.transaction_amount ?? 0)
  const orderId = pago?.metadata?.order_id ?? pago?.external_reference ?? null
  const aprobado = pago.status === 'approved'

  if (!aprobado) return json({ ok: true, ignorado: `estado ${pago.status}` })

  // R4: Idempotencia
  const { data: yaProcesado } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'mercadopago')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  if (yaProcesado?.length) return json({ ok: true, repetido: true })

  // R5: Verificación de monto
  const { data: intento } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', 'mercadopago')
    .eq('order_id', orderId)
    .eq('status', 'pending')
    .limit(1)

  const intentoValido = intento?.[0]
  if (!intentoValido) return json({ error: 'No se encontró intento pendiente' }, 409)

  if (Math.abs(Number(intentoValido.amount) - montoPagado) > 0.01) {
    return json({ error: 'Monto discrepante en Test' }, 409)
  }

  // R6: Marcar como pagado
  await supabase
    .from('payments')
    .update({ status: 'completed', provider_id: providerId })
    .eq('id', intentoValido.id)

  await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', intentoValido.order_id)

  console.log('[Webhook MP Test] Pedido de prueba pagado:', intentoValido.order_id)
  return json({ ok: true, orderId: intentoValido.order_id })
})
```

---

### 5.4. `mercadopago-webhook-prod` (index.ts)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function firmaMpValida(req: Request, dataId: string, secret: string): Promise<boolean> {
  if (!secret) return false
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.trim().split('=')
      return [k, v]
    }),
  )
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const firmaBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest))
  const hashHex = Array.from(new Uint8Array(firmaBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hashHex === v1
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const rawBody = await req.text()
  let evento: any = {}
  try {
    evento = JSON.parse(rawBody || '{}')
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }

  const dataId = new URL(req.url).searchParams.get('data.id') ?? String(evento?.data?.id ?? '')
  const secret =
    Deno.env.get('MERCADOPAGO_PROD_WEBHOOK_SECRET') ??
    Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? ''

  // R3: Firma de Producción
  const valida = await firmaMpValida(req, dataId, secret)
  if (!valida) {
    console.warn('[Webhook MP Prod] Firma inválida para data.id:', dataId)
    return json({ error: 'Firma inválida' }, 401)
  }

  if (evento?.type && evento.type !== 'payment') {
    return json({ ok: true, ignorado: `evento ${evento.type}` })
  }

  const token =
    Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''

  const respMp = await fetch(`${MP_API}/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respMp.ok) return json({ error: 'No se pudo consultar pago en MP Prod' }, 502)

  const pago = await respMp.json()
  const providerId = String(pago.id ?? dataId)
  const montoPagado = Number(pago.transaction_amount ?? 0)
  const orderId = pago?.metadata?.order_id ?? pago?.external_reference ?? null
  const aprobado = pago.status === 'approved'

  if (!aprobado) return json({ ok: true, ignorado: `estado ${pago.status}` })

  // R4: Idempotencia
  const { data: yaProcesado } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'mercadopago')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  if (yaProcesado?.length) return json({ ok: true, repetido: true })

  // R5: Verificación de monto
  const { data: intento } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', 'mercadopago')
    .eq('order_id', orderId)
    .eq('status', 'pending')
    .limit(1)

  const intentoValido = intento?.[0]
  if (!intentoValido) return json({ error: 'No se encontró intento pendiente' }, 409)

  if (Math.abs(Number(intentoValido.amount) - montoPagado) > 0.01) {
    console.error('[Webhook MP Prod] R5 MONTO DISCREPANTE:', { esperado: intentoValido.amount, recibido: montoPagado })
    return json({ error: 'Monto discrepante' }, 409)
  }

  // R6: Marcar como pagado
  await supabase
    .from('payments')
    .update({ status: 'completed', provider_id: providerId })
    .eq('id', intentoValido.id)

  await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', intentoValido.order_id)

  console.log('[Webhook MP Prod] Pedido pagado con éxito:', intentoValido.order_id)
  return json({ ok: true, orderId: intentoValido.order_id })
})
```

---

## 6. Estado Actual de la Transición

| Componente | Estado Anterior | Estado Uniformizado |
| :--- | :--- | :--- |
| Función de Pago Sandbox | `pago-crear` (modo test) | `mercadopago-pago-test` |
| Función de Pago Producción | `pago-crear` (modo prod) | `mercadopago-pago-prod` |
| Webhook Sandbox | `pago-webhook` | `mercadopago-webhook-test` |
| Webhook Producción | `pago-webhook` | `mercadopago-webhook-prod` |
| Frontend `Checkout.jsx` | Invoca `pago-crear` | Invoca `mercadopago-pago-prod` (o `mercadopago-pago-test`) |

---

## 7. Próximo Paso en el Frontend

Una vez que las 4 funciones estén creadas en Supabase:
En [`Checkout.jsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/10-qawaylab-inventario/src/components/checkout/Checkout.jsx#L317), la llamada se actualiza:

```javascript
// Para Producción:
const funcionPago = provider === 'taypi' ? 'taypi-pago-prod' : 'mercadopago-pago-prod'
```

Y las dos funciones genéricas antiguas (`pago-crear` y `pago-webhook`) se eliminan de Supabase para dejar la lista 100% limpia.
