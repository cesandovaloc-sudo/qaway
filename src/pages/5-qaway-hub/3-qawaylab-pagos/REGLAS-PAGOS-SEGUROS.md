# Reglas de Pagos Seguros — `3-qawaylab-pagos`

**Naturaleza:** regla obligatoria del módulo. Toda integración de cobro (Mercado Pago, Culqi, TAYPI, QR interoperable o cualquier pasarela futura) debe cumplirla **antes de pasar a producción**. No es una guía: es un requisito de aceptación.

**Por qué existe:** todo cobro conectado a internet recibe intentos de fraude. Los vectores reales, en orden de frecuencia, son: (1) el cliente envía un monto menor, (2) alguien llama al webhook fingiendo ser la pasarela, (3) el webhook se repite y el pedido se marca pagado varias veces o se entrega dos veces. Estas reglas cierran los tres.

---

## R1 · El monto NUNCA lo define el cliente

El navegador **no** envía el precio, ni el total, ni el descuento aplicado. Solo envía **qué** quiere comprar (ids de producto y cantidades).

El servidor recalcula el total desde `products` / `order_items` en la base y **usa ese número**. Si el monto que llega del cliente no coincide con el recalculado, se **aborta** y se registra el intento.

*Motivo:* es el vector más simple y más común. Un total enviado por el navegador es un total que el atacante controla.

## R2 · La clave secreta nunca toca el navegador

`*_SECRET_KEY` / `*_ACCESS_TOKEN` viven **solo** como secreto de la Edge Function (`supabase secrets set`). En el cliente únicamente puede existir la llave pública.

*Verificación:* si una clave secreta aparece en `src/`, en `dist/` o en un `.env` con prefijo `VITE_`, es una fuga: `VITE_*` se compila y viaja al navegador.

## R3 · Todo webhook verifica firma antes de procesar

Ningún evento se procesa sin validar la firma o el token del emisor. Sin firma válida → **401 y descartar**, sin tocar la base.

*Motivo:* el endpoint del webhook es público por diseño. Sin verificación, cualquiera puede declarar "pagado" un pedido.

## R4 · Idempotencia obligatoria

Cada evento se procesa **una sola vez**, identificado por el `provider_id` de la pasarela. Si el evento ya fue procesado, se responde `200` y **no se vuelve a aplicar**.

*Motivo:* las pasarelas reintentan webhooks ante cualquier timeout. Sin idempotencia, un reintento duplica el efecto (doble entrega, doble correo, doble desbloqueo).

## R5 · El monto pagado debe coincidir con el esperado

Se compara el monto confirmado por la pasarela contra el total del pedido. Si no coincide, **no** se marca pagado: se registra la discrepancia y se alerta para revisión manual.

## R6 · El estado "pagado" solo lo escribe el webhook o un admin

El cliente **nunca** puede marcar un pedido como pagado. La RLS ya lo impide (`orders` solo permite `update` al dueño del pedido, y `payments` no tiene política de `update` para `anon`); esta regla prohíbe además añadir cualquier atajo que lo permita.

## R7 · El pedido se crea en estado pendiente y sin datos de pago sensibles

No se almacenan números de tarjeta, CVV ni credenciales. Solo el identificador de la transacción de la pasarela (`provider_id`).

---

## Checklist de aceptación (obligatorio antes de producción)

- [ ] El cliente no envía montos en ninguna petición de cobro (R1).
- [ ] La Edge Function recalcula el total desde la base y compara (R1, R5).
- [ ] Ninguna clave secreta tiene prefijo `VITE_` ni aparece en `src/` (R2).
- [ ] El webhook rechaza peticiones sin firma válida (R3).
- [ ] El webhook es idempotente por `provider_id` (R4).
- [ ] Un monto distinto al esperado no marca el pedido como pagado (R5).
- [ ] Ninguna ruta del cliente puede escribir `status = 'paid'` (R6).
- [ ] Se registra el intento cuando falla una validación, para auditoría (R1, R5).

## Estado actual del módulo frente a estas reglas

| Regla | Estado al 2026-09-13 |
|---|---|
| R1 | **NO cumple.** El total del pedido lo calcula el navegador (`lib/services/orders.js:27`) y el monto del pago también (`Checkout.jsx`). Hoy el impacto es limitado porque no hay cobro real conectado, pero **es la primera regla que debe cerrarse** antes de habilitar cualquier pasarela |
| R2 | **Cumple:** no hay claves secretas en el cliente (`.env.example` del módulo solo tiene `VITE_APP_NAME`) |
| R3–R5 | **Pendiente:** no existe webhook todavía |
| R6 | **Cumple:** la RLS lo impide (`orders` solo permite `update` al dueño; `payments` no tiene política de `update` para `anon`) y no hay atajo en el cliente |
| R7 | **Cumple:** solo se guarda `provider_id` |

> **Deuda registrada:** R1 es la única violación abierta y es estructural: el total viaja desde el navegador. Se cierra cuando el total y el monto se calculen en la Edge Function `pago-crear`, que ya está creada aplicando la regla.

---

## Implementación de referencia

Las reglas están implementadas en código, no solo escritas:

| Archivo | Rol |
|---|---|
| `supabase/functions/_shared/pagos.ts` | Núcleo: recálculo del total, verificación de firma HMAC en tiempo constante, detección de eventos ya procesados |
| `supabase/functions/pago-crear/index.ts` | Crea el cobro. **Recalcula el total en el servidor** y aborta si el cliente insiste en mandar un monto distinto |
| `supabase/functions/pago-webhook/index.ts` | Confirma el pago. Firma → idempotencia → coincidencia de monto → recién ahí marca pagado |

**Punto de extensión de pasarela:** `_shared/pagos.ts` expone `PASARELA` y el seam `crearCobroEnPasarela`. Mientras no se configure, la función responde `PASARELA_NO_CONFIGURADA` en lugar de simular un cobro — no se finge que funciona.
