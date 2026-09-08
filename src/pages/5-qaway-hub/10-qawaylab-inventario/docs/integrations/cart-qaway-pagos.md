# Acople con app de carrito — Validación

> **Estado:** conectado (método A) y **validado end-to-end contra Postgres/RLS reales**
> (PostgreSQL 17.6 + PostgREST + GoTrue + Storage, vía Supabase local en Docker).
> Los 3 flujos (invitado, usuario, admin) pasan 16/16. Ver «Validación del envío
> real de un pedido» más abajo.

## Qué se validó

Se inspeccionó (solo lectura) el repo `3-qawaylab-pagos`. Conclusión: **no es una app
standalone sino un módulo npm reutilizable** (`@qawaylab/pago`, v0.2.0, JavaScript,
React 18+, Supabase) que se instala dentro de otra app. Ya fue acoplado en otra app
del ecosistema, así que este acople es una validación adicional.

### Exports del módulo

```js
import { createQawaServices, Checkout, PurchaseHistory, PaymentsPanel, ProductsManager } from '@qawaylab/pago'

const { products, orders, payments } = createQawaServices(supabase, options)
```

- `Checkout` — flujo de pago completo (Mercado Pago, Yape/Plin, Stripe, transferencia).
- `orders`/`payments` — servicios de pedidos y pagos sobre Supabase.
- `schema.sql` — crea `profiles`, `products`, `orders`, `order_items`, `payments`.

### Contrato del carrito (lo que `<Checkout items={} />` consume)

| Campo canónico (adaptador) | Campos que lee el módulo |
|---|---|
| `product_id` | `id \|\| product_id` |
| `title` | `title \|\| product_title \|\| name` |
| `unit_price` | `price \|\| unit_price` |
| `quantity` | `quantity` (default 1) |
| `product_type` | `product_type` (`course\|digital\|service\|physical`) |
| `image_url` | `image_url` (opcional) |

Ese shape quedó fijado como **contrato `contracts/commerce/v1`** (types + schema con
validación en runtime + examples) y el mapeo desde el inventario en
**`src/services/adapters/commerceAdapter.ts`** (con tests).

## Estado de la conexión

- ✅ Contrato `commerce v1` definido y validado en runtime.
- ✅ Adaptador `qawaCommerceAdapter` con `toCartItem` / `toCartItems` / `createCheckout`.
- ✅ Config por entorno: `VITE_CART_APP_URL` (checkout desactivado si está vacío).
- ✅ Módulo `@qawaylab/pago` alineado a React 19 + Vite 8 (repo `3-qawaylab-pagos`, commit `8f82e43`).
- ✅ Inventario migrado a TypeScript 7.0.2 (baseline ecosistema, commit `160477f`).
- ✅ **CONECTADO (método A)**: módulo instalado como dependencia `file:../3-qawaylab-pagos`,
  `preserveSymlinks` en Vite, ruta pública `/carrito` con `<Checkout>`, botón "Agregar al
  carrito" en el catálogo público (gated por `VITE_CART_ENABLED=true`), carrito en
  localStorage validado contra el contrato v1. Validado: typecheck, lint, tests, build y
  smoke test en browser (checkout renderiza con métodos de pago).
- ✅ **Schema aplicado**: `supabase/migrations/20260812_qawa_pagos_commerce.sql` (migración
  idempotente de integración — dominio commerce + bucket `resources` + RLS con soporte
  de pedidos de invitado). NO toca `products` (dominio del inventario).
- ✅ **Piel de tienda unificada en el módulo (v0.4.0)**: la skin “papel y tinta” del
  checkout/tienda vive en `@qawaylab/pago/styles/storefront.css` (scoped bajo
  `.qawa-storefront`). El inventario la importa desde el módulo y eliminó su copia
  local `src/styles/qaway-pago.css` — una sola fuente para demo e inventario. Además
  el módulo expone componentes storefront (`ProductCard`, `ProductGrid`, `ProductDetail`,
  `CartItems`, `OrderSummary`, `CartView`) para no duplicar páginas de tienda.
- ✅ **Pedidos de invitado (checkout público sin login)**: `user_id` NULL en orders/payments
  + políticas RLS de inserción que lo permiten; id generado client-side y sin `.select()`
  (módulo v0.3.0) para no exponer datos. Con sesión, el pedido se asocia al usuario real
  (`CartPage` pasa `session.user.id`).
- ✅ **Roles**: `get_user_role()` adaptado a la identidad del inventario (`public.users`),
  así el admin del inventario ve TODAS las orders/payments.
- ⏳ **Claves de pago**: `VITE_STRIPE_PUBLISHABLE_KEY` / `VITE_MERCADOPAGO_PUBLIC_KEY`
  opcionales: el `<Checkout>` v0.3.0 registra el pedido como `pending` (sin llamar a la
  pasarela) y muestra los datos bancarios — **no las consume aún** (props sin uso). Las
  pasarelas reales (preferencia MP / PaymentIntent + webhooks) son el siguiente hito
  (Edge Function).
- ⚠️ Nota: el módulo calcula totales client-side (suma `unit_price` de los ítems). Para
  venta real conviene re-validar precios en servidor (RPC/Edge Function).

## Validación del envío real de un pedido (16/16)

Ejecutada contra **Supabase local (PostgreSQL 17.6 + PostgREST + GoTrue + Storage)**
con las migraciones del proyecto aplicadas en orden. Resultado: **16 PASS / 0 FAIL**.

| # | Escenario | Resultado |
|---|---|---|
| 1 | `orders` / `order_items` / `payments` accesibles (RLS on) | ✅ |
| 2 | Invitado crea `order` (user_id NULL, id generado client-side, sin `.select()`) | ✅ |
| 3 | Invitado crea `order_items` (verificado con helper `security definer`) | ✅ |
| 4 | Invitado crea `payment` | ✅ |
| 5 | **Anónimo NO puede leer ninguna order (PII protegida)** | ✅ |
| 6 | Usuario autenticado crea su order (con `.select()`) | ✅ |
| 7 | Usuario ve SOLO sus orders (aislamiento) | ✅ |
| 8 | Promoción a admin vía service role (trigger de escalada lo permite) | ✅ |
| 9 | Admin ve TODAS las orders/payments | ✅ |
| 10 | anon sube voucher al bucket `resources` + URL pública responde | ✅ |

### Bugs reales destapados por la validación (todos corregidos)

1. **`new.role` en política RLS** de la migración auth (`20260812_auth_roles_rls.sql`):
   en políticas RLS la fila nueva se referencia sin prefijo `new.` (solo existe en
   triggers). Corregido a `role = 'viewer'`. La migración fallaba en el proyecto real
   a mitad (tabla creada, políticas posteriores nunca aplicadas): al re-ejecutar la
   versión corregida (idempotente) se completan.
2. **`create trigger if not exists`** en el schema del módulo: Postgres < 18 no lo
   soporta (error de sintaxis). Corregido a `drop trigger if exists` + `create trigger`.
3. **Grants ausentes** en tablas nuevas: `anon`/`authenticated`/`service_role` no
   podían tocar `orders`/`order_items`/`payments`/`users` (error `permission denied`).
   Añadidos explícitamente (no depender de default privileges de la plataforma).
4. **Trigger de escalada bloqueaba al primer admin**: `prevent_role_escalation`
   rechazaba incluso al service role / SQL editor. Ahora solo bloquea a usuarios
   autenticados no-admin (`auth.uid() is not null and not is_admin()`), permitiendo
   promover al primer admin.
5. **`INSERT...RETURNING` vs políticas SELECT**: el `.select()` del servicio aplica
   la política SELECT a las filas devueltas; sin política para filas de invitado el
   `.select()` fallaba. Se resolvió (módulo v0.3.0) generando el id client-side y
   **omitiendo `.select()` para invitados**, manteniendo las políticas SELECT estrictas.
6. **Exposición de PII** (detectada en review): una política SELECT que permitiera
   filas de invitado habría dejado leer TODOS los pedidos de invitados (nombre,
   teléfono, dirección) a cualquier anónimo. Evitado con el punto 5 + helper
   `public.is_guest_order()` (`security definer`) para validar la orden en la
   política de inserción de `order_items` sin abrir la lectura.

## Pasos para conectar (cuando haya backup)

1. **Instalar el módulo** (local):
   ```bash
   npm install ../3-qawaylab-pagos
   ```
   > El módulo ya acepta React 18 **o** 19 (peerDeps `^18 || ^19`) — sin
   > `--legacy-peer-deps`. Su demo fue alineada y validada en React 19.2.8 +
   > Vite 8.2.1 (build + dev server OK).
   >
   > ⚠️ `npm install ../ruta` con `file:` crea un symlink; el Vite de la app
   > anfitriona debe resolver desde node_modules con
   > `resolve: { preserveSymlinks: true }` en `vite.config` (así quedó en el
   > demo del módulo).
2. **Schema**: ejecutar `supabase/00001_schema.sql` del módulo en el proyecto
   Supabase de inventario (crea `orders`, `order_items`, `payments`).
3. **Env** (`.env`):
   ```
   VITE_CART_APP_URL=<url o flag de activación>
   VITE_STRIPE_PUBLISHABLE_KEY=
   VITE_MERCADOPAGO_PUBLIC_KEY=
   ```
4. **UI**: crear ruta pública `/carrito` que renderice `<Checkout>` con
   `qawaCommerceAdapter.createCheckout(items)` → `items` del checkout y el
   `supabase` client de `@/config/supabase`.
5. **Catálogo público**: botón "Agregar al carrito" por producto (gated por
   `siteConfig.cart.enabled`) → `qawaCommerceAdapter.toCartItem(product)`.

## Consideraciones / riesgos reales detectados

1. **Colisión de tabla `products`**: el `schema.sql` del módulo crea
   `public.products` (con `title`, `type`, `price`) que colisiona con la tabla
   `products` del inventario (`name`, `base_price`, `sku`) si se usa el mismo
   proyecto Supabase. **Mitigación:** para este acople solo se necesitan
   `orders`, `order_items` y `payments` + el componente `Checkout`. NO usar el
   `productsService` del módulo (lee `title`) ni el `ProductsManager` contra la
   tabla del inventario. El checkout recibe los ítems ya mapeados por el adaptador.
2. **Cliente Supabase compartido**: `<Checkout>` recibe el client; verificar que
   el bucket de storage (`resources` por defecto, configurable en `Checkout
   bucketName`) exista en el proyecto de inventario para subida de vouchers.
3. ~~**Pedidos de invitados**~~ **RESUELTO (módulo v0.3.0)**: `Checkout` ya no usa
   `'demo-user-id'`; sin sesión pasa `user_id = null` y el schema + RLS lo permiten
   (`orders_insert_user_or_guest`). Con sesión (`CartPage` → `session.user.id`), el
   pedido queda asociado al usuario y RLS lo protege.
4. ~~React 19 vs peer deps `^18`~~ **RESUELTO**: el módulo declara `^18 || ^19`
   y su demo corre React 19.2.8 + Vite 8.2.1 (commit `8f82e43` en
   `3-qawaylab-pagos`).
5. **Datos bancarios hardcodeados** en `Checkout` (`ACCOUNT_INFO` del módulo):
   son datos demo del módulo; pasarlos a config/entorno antes de producción (pendiente).
6. El adaptador normaliza `product_type = 'physical'` para todo el inventario
   (los ítems son productos físicos). Si en el futuro se venden digitales/servicios,
   extender el mapeo con una regla por categoría.
