# Estructura y Plan de Mejoras Integrado — Qaway Pagos (`3-qawaylab-pagos`)

> **Estado del Módulo:** Acoplado a la Web Principal, sin duplicidad de catálogo, resiliencia Failsafe activa.
> **Última actualización:** 2026-09-13

---

## 1. Lo Que Ya Tenemos (100% Implementado y Verificado)

### A. Integración Comercial desde Landings
- [x] **Conexión de Tarifario:** Los botones de selección de planes en `/landings/desarrollo-web-qaway#precios` (`Web Comercial`, `One Web`, `Tienda Online`) mapean automáticamente el producto e inician el flujo hacia el carrito.
- [x] **Persistencia Inicial:** El producto seleccionado se guarda en `qaway_cart` (`localStorage`) y redirige automáticamente a `/hub/pagos/carrito?add={id}`.

### B. Navegación y Acoplamiento Estético (Layout Único)
- [x] **Layout Oficial:** Se trasladaron las rutas de `/hub/pagos/*` dentro del bloque `<Route element={<Layout />}>` en `AppRouter.jsx`.
- [x] **Sin Navbar Duplicado:** Se suprimió el `<header className="site-header">` interno del módulo mediante `style={{ display: 'none' }}` para consumir exclusivamente el Header y Footer oficial de Qaway Lab.
- [x] **Cero Duplicidad:** Se eliminó la ruta redundante de catálogo interno (`/hub/pagos` redirige a `/hub/pagos/carrito`) y la ruta `/admin` no utilizada.

### C. Flujo de Compra y Checkout
- [x] **Vista de Carrito (`/hub/pagos/carrito`):** Muestra ítems, desglose de precios, selección de cantidades y botón directo a checkout. Si el carrito está vacío, redirige al tarifario de la landing.
- [x] **Vista de Checkout (`/hub/pagos/checkout`):** Captura datos de cliente (Nombre, Teléfono, Dirección), ofrece selección de pago (Yape/Plin, Mercado Pago, Transferencia) y adjunto de comprobantes.
- [x] **Resumen y WhatsApp:** Al confirmar, se genera el pedido con ID único, se vacía el carrito y se muestra la pantalla de éxito con el botón directo a WhatsApp pre-redactado.
- [x] **Historial (`/hub/pagos/purchases`):** Vista de consulta de compras realizadas y estado de validación.

### D. Resiliencia Failsafe en Cliente
- [x] **Tolerancia a fallos:** `orders.js`, `payments.js` y `Checkout.jsx` implementan `try/catch` con persistencia en `localStorage` (`qaway_orders`, `qaway_payments`) para evitar bloqueos o mensajes de error de base de datos en pantalla.

---

## 2. Estructura de Rutas Oficiales del Módulo

| Ruta | Vista / Componente | Propósito |
| :--- | :--- | :--- |
| `/hub/pagos` | `<Navigate to="carrito" />` | Redirección automática a la vista de pedido. |
| `/hub/pagos/carrito` | `<CartView />` | Resumen del pedido y botón para avanzar a checkout. |
| `/hub/pagos/checkout` | `<Checkout />` | Formulario de datos + pasarela Yape / Tarjeta + confirmación. |
| `/hub/pagos/purchases` | `<PurchaseHistory />` | Historial de compras del cliente. |
| `/hub/pagos/producto/:slug` | `<ProductDetailRoute />` | Ficha descriptiva opcional para enlaces individuales. |

---

## 3. Lo Que Nos Falta (Puntos para Completar al 100%)

### 1. Migración SQL en Supabase (Backend Real)
- **Falta:** Aplicar el esquema en la base de datos remota de Supabase (`qrusdsqgygfolxfrafyd`).
- **Archivo SQL preparado:**  
  `src/pages/5-qaway-hub/3-qawaylab-pagos/supabase/00001_schema.sql` (o la migración de integración idempotente `20260812000001_qawa_pagos_commerce.sql`).
- **Resultado esperado:** Las tablas `public.orders`, `public.order_items` y `public.payments` existirán formalmente en PostgreSQL, eliminando la necesidad del fallback local y guardando todos los pedidos en la nube.

### 2. Autocompletado Automático de Datos de Cliente
- **Falta:** Si el usuario ya ingresó sus datos en un formulario de contacto o en un pedido previo (`localStorage.getItem('qaway_checkout_user')`), autocompletar Nombre, Teléfono y Correo en el formulario de Checkout.

### 3. Verificación de Bucket de Comprobantes (`resources`)
- **Falta:** Confirmar que el bucket de storage `resources` en Supabase esté creado y configurado con políticas públicas de carga (`anon insert`) para los vouchers de Yape/Plin.

---

## 4. Guía de Ejecución de la Migración en Supabase

Para aplicar las tablas pendientes en Supabase, ejecutar en terminal:

```bash
# Opción A: Mediante Supabase CLI (proyecto vinculado)
supabase db push --linked

# Opción B: Copiar el contenido de 00001_schema.sql y pegarlo directamente
# en el SQL Editor del dashboard de Supabase (https://supabase.com/dashboard).
```
