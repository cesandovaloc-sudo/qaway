# Bitácora — Bloque 1 de remediación (run-2 · 10-qawaylab-inventario)

**Fecha:** 2026-09-26 · 16:15 (act. 16:40) · **Agente:** Buffy (Codebuff) · **Rama:** `main-web`
**Alcance:** Fixes frontend/código de los hallazgos confirmados de la auditoría `security-audit` run-2. Supabase (RLS/policies/RPCs) queda para el Bloque 2 (agente especializado).

## CIERRE C-4 (16:40) — `RequirePermission` unificado con el Hub

Con la aprobación del otro agente se implementó el gate de autorización por ruta replicando el comportamiento del panel principal Hub (`HubPanelPage.jsx`):

- **`src/app/router/RequirePermission.tsx` (nuevo):** sesión habilita, permiso habilita la sección, denegación fail-closed con la tarjeta "Acceso restringido" y el MISMO copy del Hub ("es una sección administrativa. Solicita acceso a tu administrador"). La decisión usa la resolución efectiva de la app (`userService.getEffectivePermissions`: rol base + overrides de `permissions`), jamás `session` sola. Sin perfil resuelto → denegado.
- **`AppRouter.tsx` reestructurado con grupos por permiso:**
  - `can_create_products` → /logistica/nuevo, /inventario/nuevo, /nuevo
  - `can_view_sales` → /ventas, /ventas/pedidos-web, /ventas/:id
  - `can_create_sales` → /ventas/nueva
  - `can_access_fiscal_settings` → /caja, /gastos, /contabilidad (sección fiscal)
  - `can_access_settings` → /config, /config/enlaces (exclusivo admin, igual que `ADMIN_ONLY_NAV` del Hub)
  - Lectura de inventario/clientes/compras: autenticados (el dato lo decide el RLS del Bloque 2) — misma filosofía del Hub ("Mi espacio" vs secciones administrativas).
- **Test nuevo** `RequirePermission.test.tsx` (5 casos: sin sesión, viewer denegado, viewer con override permitido, admin permitido, sesión sin perfil fail-closed) — **5/5 passed**. `purchaseFlow` sigue 7/7. Typecheck limpio en archivos tocados.
- **Pendiente opcional de UX (no seguridad):** el `Sidebar.tsx` es estático y muestra todos los enlaces; filtrarlos por permiso (como la nav del Hub) es pulido visual — al hacer clic en una sección no permitida se ve la tarjeta restringida, comportamiento correcto e informativo.

## Archivos nuevos

| Archivo | Propósito |
|---|---|
| `src/lib/postgrestFilters.ts` | Helper `ilikeOr()`/`escapeOrFilterTerm()`: sanea el DSL `or=` de PostgREST (C-2). |

## Archivos modificados (por hallazgo)

| Hallazgo | Archivo | Cambio |
|---|---|---|
| **C-2** inyección DSL `or=` | `services/adapters/supabaseProductAdapter.ts` | `getProducts`/`searchProducts` usan `ilikeOr`; **allowlist** de columnas en `.order(sort_by)` (sink dormido) |
| C-2 | `services/customerService.ts` | `searchCustomers` saneado |
| C-2 | `services/saleService.ts` | `getSales` saneado |
| C-2 | `services/purchaseService.ts` | `getOrders` saneado |
| C-2 | `pages/purchases/NewPurchaseOrderPage.tsx` | 2 búsquedas saneadas |
| C-2 | `pages/sales/NewSalePage.tsx` | búsqueda saneada |
| **C-7** pagos sin filtro de usuario | `services/qawa/payments.js` | el fallback local filtra por `user_id` (igual que `orders.js`) |
| **C-4** rutas solo-sesión | *(parcial)* | la denegación por permiso se aplica al cargar `profile`; refuerzo de RLS en Bloque 2 |
| **C-5** fuga cost/stock | `services/catalogService.ts` | `getCatalogById` proyecta columnas públicas (sin `cost/stock/notes`) |
| C-5 | `pages/GuestAccessPage.tsx` | proyección pública explícita |
| C-5 | `pages/CartPage.tsx` | `resolveProductByRef` con `PUBLIC_PRODUCT_COLUMNS` |
| **N-04** checkout fail-open | `services/qawa/orders.js` | los 2 inserts de orden propagan el error (sin éxito falso) |
| N-04 | `components/checkout/Checkout.jsx` | sin orden local ficticia; el error real llega al comprador vía catch de `submit()` |
| **C-6** fallback DEMO | `pages/sales/WebOrdersPage.tsx` | `DEMO_WEB_ORDERS` eliminado; banner de error con "Reintentar"; mapeo de estados reales (`refunded`→UI `cancelled`; `shipped/delivered`→DB `paid` al actualizar) |
| **N-05** env embebido | `config/site.ts` | acceso punteado estático (`import.meta.env.VITE_X`), sin `import.meta.env[key]` |
| **N-06/07/08** Edge Function | `supabase/functions/consulta-ruc-dni/index.ts` | pin exacto `esm.sh@2.112.1`; check de rol `user_app_role` fail-closed; rate-limit por usuario (30/min ventana en memoria); validación RUC (11 dígitos)/DNI (8); allowlist `doc_type`; sin reflejo del error del proveedor |
| **N-16** credenciales publicadas | `scripts/validate-order-flow.sh` | guard solo-localhost (exit 78); contraseñas por env (`TEST_BUYER_PASSWORD`/`TEST_ADMIN_PASSWORD`), sin fallback hardcodeado |

## Verificación

- **Typecheck** (`tsc --noEmit -p tsconfig.app.json`): 0 errores en archivos tocados. Errores restantes preexistentes (tests con mocks desactualizados, `qawa/*.js` sin `.d.ts`, `userService`, `commerceAdapter`).
- **Tests** (`vitest run`): **266 passed / 2 failed / 19 skipped**. Las 2 fallas (`CartPage.test` "S/ 529.70 duplicado", `DashboardPage.test` "Métricas principales") y las 12 suites no-recolectadas (`@qawaylab/pago` ausente en monorepo) son **preexistentes**: `CartPage.test` verificado fallando también contra `HEAD` (código original). El test `purchaseFlow` (7/7) cubre el flujo del checkout modificado.
- Regresiones introducidas por el Bloque 1: **0**.

## Notas

- `Checkout.jsx`/`orders.js`: el flujo ahora es fail-closed — si la DB rechaza la orden (p.ej. CHECK de `payment_method` con `taypi`), el comprador ve el error real. **La corrección definitiva del dominio del CHECK es del Bloque 2** (migración), pendiente de confirmar el estado vivo.
- El rate-limit de la Edge Function es por-isolate (memoria): el refuerzo a nivel gateway/quotas también es Bloque 2.
- Estos cambios NO requieren cambios en Supabase para desplegarse, pero el Bloque 2 debe ejecutarse **antes de exponer el sistema a clientes** (ver mensaje para el agente Supabase en `_docs/BLOQUE2-MENSAJE-AGENTE-SUPABASE.md`).
