# TAYPI — Implementación

## 1. Finalidad

Este documento registra la implementación y validación realizada para integrar TAYPI como pasarela de pagos de Qaway Lab, dejando documentados:

- La nomenclatura utilizada.
- Las funciones Edge creadas.
- Los secrets utilizados.
- De dónde obtener cada dato.
- La configuración Sandbox y Producción.
- Los códigos implementados y validados.
- Las pruebas realizadas.
- El flujo seguro previsto para carrito, pago y confirmación.
- Los puntos pendientes antes de considerar terminada la integración web.

> Regla: Mercado Pago es independiente de esta implementación. Sus funciones y secrets existentes no deben modificarse durante la integración TAYPI.

---

## 2. Proyecto Supabase

**Proyecto:** Qaway Lab Project  
**Branch:** `main`  
**Estado:** Production  
**Project Ref:** `qrusdsqgygfolxfrafyd`

### URLs base

**Supabase Functions:**

`https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/{nombre-function}`

**TAYPI Sandbox:**

`https://sandbox.taypi.pe`

**TAYPI Producción:**

`https://app.taypi.pe`

---

# 3. Nomenclatura oficial utilizada

## Edge Functions

### Sandbox / pruebas

- `taypi-pago-test`
- `taypi-webhook-test`

### Producción

- `taypi-pago-prod`
- `taypi-webhook-prod`

## Secrets Sandbox

- `TAYPI_TEST_PUBLIC_KEY`
- `TAYPI_TEST_SECRET_KEY`
- `TAYPI_TEST_WEBHOOK_SECRET`

## Secrets Producción

- `TAYPI_PROD_PUBLIC_KEY`
- `TAYPI_PROD_SECRET_KEY`
- `TAYPI_PROD_WEBHOOK_SECRET`

### Regla de nomenclatura

No utilizar nuevamente nombres genéricos como:

- `TAYPI_PUBLIC_KEY`
- `TAYPI_SECRET_KEY`
- `TAYPI_WEBHOOK_SECRET`

Estos pertenecen a una configuración anterior y deben mantenerse únicamente mientras sea necesario para una migración segura.

Supabase no permite renombrar secrets: para cambiar un nombre se crea el nuevo secret y posteriormente se elimina el antiguo cuando ya no sea utilizado.

---

# 4. De dónde obtener las credenciales TAYPI

## 4.1 Public Key

En el panel correspondiente al ambiente TAYPI:

- Sandbox → credencial de prueba.
- Producción → credencial de producción.

La nomenclatura esperada por ambiente es:

- Sandbox: `taypi_pk_test_*`
- Producción: `taypi_pk_live_*`

Guardar cada valor en Supabase como:

- Sandbox → `TAYPI_TEST_PUBLIC_KEY`
- Producción → `TAYPI_PROD_PUBLIC_KEY`

## 4.2 Secret Key

Obtenerla del mismo ambiente TAYPI correspondiente.

- Sandbox → `taypi_sk_test_*`
- Producción → `taypi_sk_live_*`

Guardar:

- Sandbox → `TAYPI_TEST_SECRET_KEY`
- Producción → `TAYPI_PROD_SECRET_KEY`

## 4.3 Webhook Secret

El secret debe corresponder al webhook configurado en el ambiente correspondiente.

Guardar:

- Sandbox → `TAYPI_TEST_WEBHOOK_SECRET`
- Producción → `TAYPI_PROD_WEBHOOK_SECRET`

### Importante

No confundir:

- Secret Key de API
- Webhook Secret

Son credenciales diferentes y cumplen funciones diferentes.

---

# 5. Documentación oficial consultada

Referencias TAYPI utilizadas durante la implementación:

- Ambientes: https://docs.taypi.pe/ambientes
- Integración: https://docs.taypi.pe/integracion
- SDK JavaScript: https://docs.taypi.pe/sdks/javascript
- Checkout: https://docs.taypi.pe/checkout
- Personalización de Checkout: https://docs.taypi.pe/checkout-personalizacion

Puntos relevantes documentados por TAYPI:

- Sandbox y Producción son ambientes separados.
- Las credenciales también son independientes.
- Los webhooks funcionan en ambos ambientes.
- La firma del webhook utiliza HMAC-SHA256.
- El webhook debe recibir el cuerpo original (`raw body`) antes de hacer `JSON.parse`.
- En producción se recomienda verificar el monto recibido contra el monto original de la orden.
- Las solicitudes POST deben utilizar `Idempotency-Key`.
- La confirmación definitiva del pago debe basarse en el webhook y no únicamente en el callback visual de Checkout.
- El Checkout.js de TAYPI muestra el QR y permite el pago mediante Yape, Plin o una aplicación bancaria compatible.

---

# 6. Edge Function: `taypi-pago-test`

## Finalidad

Crear pagos TAYPI en Sandbox para realizar pruebas sin utilizar dinero real.

Configuración utilizada:

```ts
const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_TEST_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_TEST_SECRET_KEY");
const TAYPI_BASE_URL = "https://sandbox.taypi.pe";
```

## Firma de la petición

La integración REST utiliza:

```text
{timestamp}
{method}
{path}
{body}
```

y HMAC-SHA256 con la Secret Key.

La petición utiliza:

```text
Authorization: Bearer {public_key}
Taypi-Signature
Taypi-Timestamp
Idempotency-Key
```

Endpoint utilizado:

```text
/api/v1/payments
```

## Resultado Sandbox validado

La función consiguió crear pagos correctamente y TAYPI devolvió:

- `payment_id`
- `status`
- `amount`
- `currency`
- `reference`
- `checkout_token`
- `checkout_url`
- `qr_code`
- `qr_image`
- `expires_at`
- `created_at`

Ejemplo de referencia utilizada:

```text
TEST-SANDBOX-001
```

---

# 7. Edge Function: `taypi-pago-prod`

## Finalidad

Crear pagos reales en TAYPI Producción.

Configuración:

```ts
const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_PROD_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_PROD_SECRET_KEY");
const TAYPI_BASE_URL = "https://app.taypi.pe";
```

Utiliza la misma estructura REST y de firma que Sandbox, cambiando únicamente:

- Credenciales.
- URL base.
- Ambiente TAYPI.

## Prueba real realizada

Se realizó una prueba de producción por:

```text
S/ 2.00
```

Referencia:

```text
TEST-PROD-WEBHOOK-001
```

Descripción:

```text
Prueba integración TAYPI Producción
```

El pago fue completado correctamente utilizando Yape.

Esto confirmó que `taypi-pago-prod` puede crear pagos reales en TAYPI Producción.

> No repetir pruebas de producción innecesariamente porque generan operaciones monetarias reales.

---

# 8. Edge Function: `taypi-webhook-test`

## Finalidad

Recibir y verificar las notificaciones de TAYPI Sandbox.

Configuración:

```ts
import { Taypi } from "npm:taypi.pe";

const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_TEST_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_TEST_SECRET_KEY");
const TAYPI_WEBHOOK_SECRET = Deno.env.get("TAYPI_TEST_WEBHOOK_SECRET");
```

El webhook utiliza:

```ts
const rawBody = await req.text();
const signature = req.headers.get("taypi-signature") || "";
```

Luego:

```ts
const taypi = new Taypi(
  TAYPI_PUBLIC_KEY,
  TAYPI_SECRET_KEY,
  {
    sandbox: true,
  },
);

const isValid = taypi.verifyWebhook(
  rawBody,
  signature,
  TAYPI_WEBHOOK_SECRET,
);
```

Si la firma no es válida:

```ts
return new Response("Firma inválida", {
  status: 401,
  headers: corsHeaders,
});
```

Si es válida:

```ts
const event = JSON.parse(rawBody);
```

## Validación realizada

Sandbox fue probado mediante un pago real de prueba/simulador.

El webhook recibió correctamente eventos como:

```text
payment.completed
```

y mostró correctamente:

```text
Pago completado:
payment_id
amount
reference
```

Por tanto:

**`taypi-webhook-test` quedó verificado funcionalmente.**

---

# 9. Edge Function: `taypi-webhook-prod`

## Finalidad

Recibir las confirmaciones de pagos TAYPI Producción y verificar su autenticidad.

Código actualmente validado:

```ts
import { Taypi } from "npm:taypi.pe";

const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_PROD_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_PROD_SECRET_KEY");
const TAYPI_WEBHOOK_SECRET = Deno.env.get("TAYPI_PROD_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, taypi-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Método no permitido", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    if (!TAYPI_PUBLIC_KEY || !TAYPI_SECRET_KEY) {
      console.error("Faltan credenciales TAYPI PROD");

      return new Response("Configuración incompleta", {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!TAYPI_WEBHOOK_SECRET) {
      console.error("Falta TAYPI_PROD_WEBHOOK_SECRET");

      return new Response("Webhook secret faltante", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("taypi-signature") || "";

    if (!signature) {
      console.error("Falta Taypi-Signature");

      return new Response("Firma requerida", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const taypi = new Taypi(
      TAYPI_PUBLIC_KEY,
      TAYPI_SECRET_KEY,
      {
        sandbox: false,
      },
    );

    const isValid = taypi.verifyWebhook(
      rawBody,
      signature,
      TAYPI_WEBHOOK_SECRET,
    );

    if (!isValid) {
      console.error("Firma TAYPI inválida");

      return new Response("Firma inválida", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(rawBody);

    console.log("TAYPI WEBHOOK PROD:", event);

    if (event.event === "payment.completed") {
      console.log(
        "Pago completado:",
        event.payment_id,
        event.amount,
        event.reference,
      );
    }

    return new Response(
      JSON.stringify({
        received: true,
        event: event.event || null,
        payment_id: event.payment_id || null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("TAYPI WEBHOOK PROD ERROR:", error);

    return new Response(
      JSON.stringify({
        received: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
```

## Estado actual

La función está desplegada y configurada con:

```text
Verify JWT with legacy secret: OFF
```

URL configurada en TAYPI Producción:

```text
https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/taypi-webhook-prod
```

El webhook secret de Producción corresponde al webhook mostrado por TAYPI.

### Pendiente

Actualmente esta función verifica la autenticidad del webhook y registra el evento, pero todavía debe conectarse con la orden/pago de nuestra base de datos para realizar las validaciones comerciales antes de marcar una orden como pagada.

---

# 10. Estructura de base de datos

La aplicación ya dispone de una tabla:

```text
orders
```

y una tabla:

```text
payments
```

La tabla `payments` está diseñada para manejar diferentes proveedores.

Campos relevantes:

```text
provider
provider_id
amount
currency
status
order_id
```

## Para TAYPI

El registro debe utilizar:

```text
provider = taypi
provider_id = payment_id de TAYPI
amount = monto real de la orden
currency = PEN
status = pending
order_id = ID de la orden
```

Cuando el webhook confirme correctamente:

```text
status = completed
```

y la orden correspondiente debe pasar a su estado de pago confirmado.

---

# 11. Flujo seguro definitivo

El flujo esperado es:

```text
CLIENTE
   ↓
CARRITO
   ↓
CREACIÓN DE ORDEN
   ↓
taypi-pago-test / taypi-pago-prod
   ↓
TAYPI
   ↓
CHECKOUT / QR
   ↓
CLIENTE PAGA
   ↓
TAYPI
   ↓
taypi-webhook-test / taypi-webhook-prod
   ↓
VERIFICAR FIRMA
   ↓
VERIFICAR EVENTO
   ↓
VERIFICAR payment_id
   ↓
BUSCAR payment/order
   ↓
VERIFICAR reference
   ↓
VERIFICAR amount
   ↓
VERIFICAR QUE NO ESTÉ PAGADO
   ↓
payment = completed
   ↓
order = paid
```

## Regla crítica

Nunca confiar únicamente en:

- el frontend;
- el precio enviado desde el navegador;
- el callback visual de Checkout;
- una pantalla que diga "Pago exitoso".

El servidor debe determinar si el pago corresponde realmente a la orden.

---

# 12. Protección contra monto incorrecto

El escenario que debemos impedir es:

```text
Orden real: S/ 100
       ↓
Cliente intenta pagar S/ 1
       ↓
Webhook TAYPI
       ↓
Servidor compara:
monto recibido = 1
monto orden = 100
       ↓
RECHAZAR CONFIRMACIÓN
```

La comparación debe hacerse en backend.

El navegador nunca debe ser la autoridad final sobre el monto.

---

# 13. Idempotencia

El sistema debe soportar que TAYPI entregue el mismo evento más de una vez.

Debe comprobarse:

```text
payment_id
provider
provider_id
estado actual
```

La tabla `payments` ya dispone de un índice único para:

```text
(provider, provider_id)
```

Esto ayuda a evitar duplicación del mismo pago.

---

# 14. Checkout.js

TAYPI recomienda Checkout.js para integrar el pago en una web.

Script oficial:

```html
<script src="https://app.taypi.pe/v1/checkout.js"></script>
```

El backend crea el pago y devuelve:

```text
checkout_token
```

El frontend abre:

```js
Taypi.publicKey = "...";

Taypi.open({
  sessionToken: checkout_token,
  onSuccess: ...,
  onExpired: ...,
  onClose: ...,
  onError: ...
});
```

El `checkout_token` es de uso único y está asociado al pago.

La web debe mostrar el Checkout/QR mediante este flujo, en lugar de intentar construir manualmente todo el proceso de pago.

---

# 15. Pruebas realizadas

## Sandbox

Confirmado:

- Creación de pago TAYPI.
- Obtención de QR/checkout.
- Pago mediante simulador.
- Pago marcado como completado en TAYPI.
- Recepción del webhook.
- Verificación de firma.
- Lectura del evento `payment.completed`.

## Producción

Confirmado:

- Creación de pago real.
- Pago real por S/ 2.00.
- Pago completado correctamente en TAYPI Producción.
- Uso de Yape.
- Configuración del webhook de producción.

Pendiente de confirmación/documentación:

- Verificación explícita del log de `taypi-webhook-prod` correspondiente al pago real de S/2.

---

# 16. Estado del proyecto

| Componente | Estado |
|---|---|
| TAYPI Sandbox | OK |
| `taypi-pago-test` | OK |
| `taypi-webhook-test` | OK |
| TAYPI Producción | OK |
| `taypi-pago-prod` | OK |
| `taypi-webhook-prod` | Configurado |
| Pago real de producción | OK |
| Integración con `payments` | Pendiente |
| Validación referencia ↔ orden | Pendiente |
| Validación monto ↔ orden | Pendiente |
| Idempotencia completa del webhook | Pendiente |
| Checkout.js en frontend | Pendiente |
| Flujo completo web → TAYPI → webhook → DB | Pendiente |
| Limpieza de secrets antiguos | Pendiente |
| Eliminación de webhook antiguo | Pendiente |

---

# 17. Próximos pasos, en orden

### Paso 1
El agente local debe revisar el checkout actual y localizar:

- creación de `orders`;
- creación de `payments`;
- archivos del carrito;
- archivos del checkout;
- funciones que llaman a Supabase.

### Paso 2
Conectar `taypi-pago-test` al flujo real del carrito.

### Paso 3
Al crear el pago, registrar correctamente el pago pendiente en `payments`.

### Paso 4
Conectar `taypi-webhook-test` con `payments` y `orders`.

### Paso 5
Implementar:

- validación de referencia;
- validación de monto;
- validación de estado;
- prevención de duplicados.

### Paso 6
Integrar Checkout.js y mostrar el QR/modal en la web.

### Paso 7
Realizar una prueba Sandbox completa desde la web.

### Paso 8
Confirmar webhook de Producción.

### Paso 9
Cambiar el flujo del frontend a:

```text
taypi-pago-prod
```

cuando se autorice la salida a producción.

### Paso 10
Después de confirmar que todo funciona:

- eliminar secrets TAYPI genéricos antiguos;
- retirar `taypi-webhook` antiguo;
- mantener las cuatro funciones oficiales.

---

# 18. Regla para agentes IA

Antes de modificar TAYPI, el agente debe:

1. Revisar el código existente.
2. Identificar qué archivos participan.
3. No modificar Mercado Pago.
4. No crear tablas duplicadas.
5. No crear una segunda tabla de pagos.
6. Utilizar `payments` existente.
7. Respetar exactamente la nomenclatura definida en este documento.
8. No reemplazar las Edge Functions TAYPI ya verificadas sin una razón técnica.
9. No eliminar secrets antiguos hasta comprobar que ningún código los utiliza.
10. Probar primero en Sandbox.
11. No ejecutar pruebas de producción que generen pagos reales sin autorización.

---

# 19. Criterio de finalización

La integración TAYPI se considerará terminada cuando una compra real desde la web pueda recorrer:

```text
Carrito
→ Orden
→ payments (pending)
→ taypi-pago-prod
→ Checkout/QR
→ Pago
→ taypi-webhook-prod
→ validación de firma
→ validación de payment_id
→ validación de referencia
→ validación de monto
→ validación de estado
→ payments (completed)
→ orders (paid)
```

Sin depender de información manipulable desde el navegador.

---

## 20. Nota final

La infraestructura TAYPI ya fue separada correctamente entre Sandbox y Producción. La siguiente fase no consiste en volver a crear la integración, sino en **conectar la integración ya validada con el flujo real de carrito, órdenes, pagos y Checkout de la web**.
