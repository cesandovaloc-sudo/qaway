# Cómo habilitar las pasarelas — guía paso a paso

**Para quién es esto:** quien administra la cuenta del negocio. No hace falta saber programar. Cada paso dice **quién lo hace**: `TÚ` (en la web del proveedor) o `AGENTE` (código).

**Regla que no se rompe:** las claves secretas **nunca** van al código ni al navegador. Se cargan como *secrets* en el servidor. Ver `REGLAS-PAGOS-SEGUROS.md` (R2).

---

## ESTADO ACTUAL (2026-09-14)

| Proveedor | Estado |
|---|---|
| **Manual** (Yape/Transferencia) | Funciona en pantalla, **pero con datos de ejemplo** → ver PASO 0 |
| **Mercado Pago** | **Servidor YA implementado.** Falta: crear la cuenta y darme el Access Token |
| **TAYPI** | **Bloqueado por TAYPI:** su registro devuelve *"Registro no disponible — el registro se encuentra deshabilitado por el momento"*. No es un error nuestro. Se reintenta más adelante |

### Lo que ya quedó hecho para Mercado Pago (no hay que volver a pedirlo)

1. **Adaptador de cobro** (`_shared/pagos.ts` → `crearCobroMercadoPago`): crea la preferencia de Checkout Pro **desde el servidor** contra `POST /checkout/preferences`, con los ítems y el **importe recalculados desde la base** (R1), `external_reference` = id del pedido, `metadata.order_id`, `back_urls`, `notification_url` y `X-Idempotency-Key` para no duplicar el cobro si el navegador reintenta. Usa `sandbox_init_point` automáticamente cuando el token empieza con `TEST-`.
2. **Webhook real de Mercado Pago** (`pago-webhook`):
   - Verifica su firma como corresponde: MP **no firma el cuerpo**, firma el *manifest* `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` con HMAC-SHA256, y se compara contra `v1` del header `x-signature`.
   - **Consulta el pago contra la API** (`GET /v1/payments/{id}`) porque el webhook de MP **no incluye el monto** — sin ese paso, la validación de importe (R5) sería inaplicable.
   - Mantiene el orden firma → evento aprobatorio → idempotencia → monto → marcar pagado.
   - Detecta un detalle que rompe integraciones: al crear el cobro el id es el de la **preferencia**, y en el webhook llega el del **pago**. Se resuelve por `external_reference` y se guarda el id del pago para que un reintento se reconozca como repetido.
3. **El navegador ya sabe cobrar por pasarela** (`Checkout.jsx`): si el método elegido tiene proveedor distinto de `manual`, llama a la Edge Function `pago-crear` — **sin enviar el importe** — y redirige a la URL de pago. Si la pasarela devuelve un QR, lo muestra en la confirmación.

### Lo que falta para que Mercado Pago cobre de verdad

Solo tres cosas, y las dos primeras son tuyas:

1. Crear la cuenta de vendedor y la aplicación → **Access Token** (Parte 2, pasos 1 a 5).
2. Copiar también el **secreto de webhook** que genera el panel de Mercado Pago.
3. Yo: cargar los secrets, desplegar y correr las 4 pruebas de la Parte 4. Recién ahí `enabled: true`.

**Secrets exactos que voy a cargar cuando me pases las claves** (no las pegues en un chat compartido):

```
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=… MERCADOPAGO_WEBHOOK_SECRET=… MERCADOPAGO_MODO=test PUBLIC_SITE_URL=https://www.qawaylab.com
```

### ⚠️ HALLAZGO IMPORTANTE: `MERCADOPAGO_MODO` es OBLIGATORIO

Verificado en el panel nuevo: **las credenciales de la pestaña `Prueba` empiezan con `APP_USR-`**, exactamente igual que las de producción. Históricamente las de prueba empezaban con `TEST-`, así que **el prefijo ya no sirve para distinguirlas**.

Consecuencia si no se declara el modo: el código tomaría el token de prueba como producción y devolvería `init_point` → **le cobraría de verdad a quien esté probando**.

Por eso:
- El modo se declara con `MERCADOPAGO_MODO=test` (o `produccion`). **No se adivina.**
- Si estamos en modo prueba y MP no devuelve `sandbox_init_point`, el sistema **falla con un mensaje explícito** en lugar de caer a `init_point`. Nunca se cobra por accidente.

**Por tanto, al cargar las credenciales hay que decir SIEMPRE cuál es la pestaña de origen**: `Prueba` → `MERCADOPAGO_MODO=test`; `Producción` → `MERCADOPAGO_MODO=produccion`.

---

## PASO 0 · Lo primero, y es de un minuto (TÚ)

El método manual (Yape / Transferencia) **ya funciona en pantalla pero con datos de ejemplo**: hoy muestra `999 888 777` y la cuenta `191-78901234-0-55`. Con eso **nadie puede pagarte**.

**Envíame estos 4 datos reales:**

| Dato | Ejemplo |
|---|---|
| Número de Yape / Plin | `9XX XXX XXX` |
| Cuenta BCP (cuenta de ahorros) | `XXX-XXXXXXXX-X-XX` |
| CCI | `XXX-XXX-XXXXXXXXXX-XX` |
| Titular exacto | Como figura en el banco |

Con eso, el cobro por Yape/transferencia + voucher queda **100% operativo hoy**, sin depender de ninguna pasarela.

---

## PARTE 1 · TAYPI (el QR) — va primero porque es el de menor fricción

### 1.A · Crear la cuenta (TÚ)

1. Entra a **https://app.taypi.pe/register** y crea la cuenta.
2. Completa los datos del comercio. Puedes usar **RUC o DNI** (según su proceso de afiliación).
3. La **cuenta bancaria debe estar a nombre del mismo titular** del RUC/DNI que registres. Si no coincide, la afiliación suele quedar observada.
4. Verifica el correo (código de verificación).
5. Si algo se traba o quieres afiliación asistida, su canal oficial es **WhatsApp https://wa.me/51946134761**.

**Resultado:** cuenta creada.

### 1.B · Generar las claves (TÚ)

6. En el panel de TAYPI, entra a la sección de **Developers / API**.
7. Genera las claves. Verás dos juegos:
   - **Sandbox (pruebas):** empieza con `taypi_sk_test_…` (secreta) y `taypi_pk_test_…` (pública).
   - **Producción:** `taypi_sk_live_…` (secreta) y `taypi_pk_live_…` (pública).
8. **Copia la clave secreta de sandbox** (`taypi_sk_test_…`). Esa la usaremos primero para probar sin mover dinero real.
9. En el panel, busca la opción de **Webhook URL** y déjala lista para pegar (la URL exacta te la paso yo en el paso 1.C, porque depende de tu proyecto de Supabase).
10. Si el panel te da un **secreto de webhook** aparte, cópialo también. Si no lo da, la firma se hace con la clave secreta y usaremos esa.

**Resultado:** tienes 1 o 2 claves en la mano. **No me las pegues en el chat si es un canal compartido; mejor me las pasas por un medio privado.**

### 1.C · Lo que hago yo (AGENTE)

11. Implemento el adaptador contra su API real:
    - `POST https://app.taypi.pe/api/v1/payments`
    - Cabeceras: `Authorization: Bearer <clave secreta>`, `Taypi-Timestamp`, `Taypi-Signature` (HMAC-SHA256), `Idempotency-Key`
    - Cuerpo: `{ "amount": "79.90", "reference": "<id del pedido>" }`
    - Respuesta esperada: `{ data: { payment_id, status, qr_image, checkout_url, expires_at } }`
    - `qr_image` viene en **base64** (un SVG). Lo convierto a imagen visible para el comprador.
12. Cargo las claves como *secrets* del servidor (nunca en el código):
    ```
    supabase secrets set TAYPI_SECRET_KEY=… TAYPI_WEBHOOK_SECRET=…
    ```
13. Te paso la **Webhook URL** definitiva para que la peguen en el panel:
    ```
    https://<tu-proyecto>.supabase.co/functions/v1/pago-webhook?provider=taypi
    ```
14. Despliego las funciones y hacemos la **prueba de sandbox**: un pago simulado debe marcar el pedido como **Pagado** solo.

### 1.D · Habilitar en pantalla (AGENTE)

15. Recién cuando la prueba de sandbox pase: cambio `enabled: false` → `true` en `lib/paymentConfig.js` para el método `taypi`.
16. Efecto automático: el QR **sube al primer puesto** de la lista, pasa a ser el **método preseleccionado**, y los otros dos quedan debajo.
17. Ajusto los 3 tests que fijan el método por defecto (hoy esperan `manual`). Es el mismo ajuste que ya hicimos dos veces.

---

## PARTE 2 · MERCADO PAGO (tarjetas, Yape y cuotas)

> El sitio de documentación de Mercado Pago no me renderiza para leer el detalle de cada pantalla, así que te doy **el flujo oficial en orden**, con el enlace exacto de cada etapa. Son 7 pantallas; el orden importa.

### 2.A · Crear la cuenta de vendedor (TÚ)

1. Entra a **https://www.mercadopago.com.pe** y crea la cuenta de vendedor.
2. Completa la verificación de identidad con **RUC o DNI**.
3. Asocia tu **cuenta bancaria** para recibir el dinero (debe estar a nombre del mismo titular).

### 2.B · Crear la aplicación y sacar las credenciales (TÚ)

Sigue estas etapas, en este orden (son las etapas oficiales):

| # | Etapa | Enlace |
|---|---|---|
| 1 | Crear la aplicación | https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/create-application |
| 2 | Configurar el entorno de desarrollo | https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/configure-development-enviroment |
| 3 | **Credenciales** (aquí salen las claves) | https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/additional-content/credentials |

4. En tus integraciones verás dos claves: **Public Key** (pública) y **Access Token** (secreta). Hay juego de **prueba** y de **producción**.
5. Copia el **Access Token de prueba** para empezar.

**Buenas prácticas oficiales** (léelas, son cortas): https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/best-practices/credentials-best-practices/introduction

### 2.C · Lo que hago yo (AGENTE)

6. Implemento el adaptador: creo la **preferencia de pago desde el servidor** con el Access Token (jamás desde el navegador), con:
   - `items` con el **monto recalculado en el servidor** (regla R1),
   - `external_reference` = id del pedido,
   - `back_urls` a las páginas reales de éxito / error / pendiente.
7. Configuro el webhook:
   ```
   https://<tu-proyecto>.supabase.co/functions/v1/pago-webhook?provider=mercadopago
   ```
   y cargo `MERCADOPAGO_WEBHOOK_SECRET`.
8. **Prueba:** con **cuentas de prueba** (usuarios de test) hacemos una compra simulada. Documentación: https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/integration-test/introduction
9. Ya en producción: https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-preferences/go-to-production

### 2.D · Habilitar en pantalla (AGENTE)

10. `enabled: true` para `mercadopago` y ajuste de tests.

---

## PARTE 3 · Pasos técnicos compartidos (AGENTE)

Se hacen una sola vez, sirven para las dos pasarelas:

1. **Aplicar la migración SQL** (ya está escrita): `supabase/migrations/20260914000001_pagos_multipasarela.sql`
   - Permite los proveedores `taypi` y `manual`,
   - crea el **índice único `(provider, provider_id)`** que evita que un pago se confunda con el de otra pasarela.
2. **Desplegar las Edge Functions:** `pago-crear` y `pago-webhook`.
3. **Cargar los secrets** de cada proveedor (nunca en el código).
4. **Registrar la Webhook URL** en el panel de cada proveedor.
5. **Probar en sandbox** antes de tocar producción.

---

## PARTE 4 · Cómo comprobar que quedó bien

Estas 4 pruebas las hago yo y te paso el resultado. Si alguna falla, **no se habilita**:

| Prueba | Resultado correcto |
|---|---|
| Pago de S/ 79.90 en sandbox | El pedido pasa a **Pagado** solo, sin tocar nada |
| Reenviar el mismo webhook 2 veces | La segunda responde *repetido* y **no** duplica el pago |
| Enviar un webhook **sin firma** | Responde **401** y no cambia nada |
| Enviar un webhook con **monto alterado** | Responde **409** y el pedido **no** se marca pagado |

---

## PARTE 5 · Lo que nadie debe hacer

- ❌ Poner la clave secreta o el Access Token en el navegador o en un `.env` con prefijo `VITE_` (eso lo publica al mundo).
- ❌ Marcar un pedido como pagado a mano "para probar".
- ❌ Habilitar en pantalla antes de pasar las 4 pruebas de la Parte 4.

---

## Resumen: qué necesito de ti, en orden

1. **Los 4 datos de cobro manual** (Paso 0) → desbloquea el cobro inmediato.
2. **Cuenta TAYPI creada** + clave secreta de sandbox.
3. **Cuenta Mercado Pago creada** + Access Token de prueba.
4. Confirmarme en qué proyecto de Supabase desplegamos (para darte la Webhook URL exacta).

Con el punto 1 ya puedes cobrar por Yape/transferencia. Los puntos 2 y 3 habilitan el cobro automático.
