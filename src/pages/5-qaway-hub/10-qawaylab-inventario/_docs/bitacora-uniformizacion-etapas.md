# Bitácora — Uniformización de maquetación con el panel principal (inventario)

**Fecha:** 2026-09-26 16:50–17:20 · **Agente:** Buffy (Codebuff) · **Rama:** `main-web`
**Referencia:** panel principal Hub (`src/pages/5-qaway-hub/HubPanelPage.jsx`) — SOLO referencia, no se modificó.
**Plan rector:** `C:\Users\csand\security-audit-skill\qawaylab-hub\run-2-diseno\PLAN-DISENO-POR-FASES-v3.xlsx` (v3 generada de la v2: columna de referencia actualizada + filas 34–41 de identidad del shell).

## Reglas respetadas

- Solo se trabajó en `10-qawaylab-inventario` (el Hub es referencia).
- **Una etapa = un commit** (permite regresar por etapas sin tocar commits anteriores).
- Sin reset, sin revert, sin operaciones destructivas. Commits totales.
- Aspectos exclusivos del inventario (captura IA, campana propia, navegación ERP) se conservaron — solo cambió la maquetación.

## Etapas ejecutadas (commit por etapa)

| Etapa | Commit | Contenido (filas del plan) |
|---|---|---|
| **1** | `d0c171c6` | Topbar 72px cromo oscuro `bg-ink`, buscador rounded-full responsivo, campana redonda con badge marca+ring, hamburguesa de colapso en topbar (estado en AppLayout), Sidebar recibe prop (filas 1-3, 4, 37, 41) |
| **2** | `71575f60` | Dropdown de perfil completo (iniciales + punto naranja, panel w-72: identidad/Mi cuenta/Seguridad Próximamente/Cerrar Sesión) + activo sobrio del sidebar: fondo blanco/10 + solo icono naranja (filas 34/36/5) |
| **3** | `6479fc09` | Token `--color-brand-hover: #e03f06` + receta única de botón primario `h-10 px-5 rounded-xl text-sm font-bold` en 10 archivos + migración de 17 hovers sueltos en 7 archivos (filas 9-12) |
| **4** | `de8744bb` | Píldora de marca/empresa estática (dot verde pulsante + nombre), informativa como corresponde a una app (fila 38) |
| **5** | `f2f6d4c5` | Waffle de Apps (9 puntos + label al hover → `/hub`) + H1 unificados a `text-2xl md:text-3xl font-extrabold tracking-tight` en ~20 páginas admin (filas 39/13) |
| **6** | `75a44a54` | Verificación global + bitácora |

## Corrección de contraste — fila 24 del plan (sep-26, post-Etapa 6)

El usuario detectó "páginas con texto claro y fondo claro" (fila 24: contraste de texto
sobre color). Causa: páginas/componentes del inventario conservaban utilidades del tema
oscuro original (text-white, text-muted-light, bg-white/5-10, border-white/10, bg-ink)
sobre las tarjetas blancas del tema claro.

**Mapeo aplicado** (solo sobre fondos claros; el cromo oscuro del Header/Sidebar y los
botones de color con texto blanco son intencionales, iguales que en el Hub):

- `text-white` → `text-ink`; `text-white/N` → `text-muted`; `text-muted-light[/N]` → `text-muted`
- `bg-white/5` → `bg-zinc-50`; `bg-white/10` → `bg-zinc-100`; `bg-ink` (en claro) → `bg-white`
- `border-white/10` → `border-zinc-200`; `border-white/15` → `border-zinc-300`; `divide-white/5` → `divide-zinc-100`
- Chips/iconos color-400 sobre fondo claro → color-600 (azul/ámbar/rose/emerald)
- Re-forzado `text-white` en botones que quedan sobre fondo de color (brand/red/blue/etc.)

**Archivos corregidos en esta pasada:** `app/router/RequirePermission.tsx` (tarjeta
"Acceso restringido" ahora blanco sobre claro, copy intacto), `dashboard/QuickAccessCards.tsx`,
`settings/BrandingSettings.tsx`, `pricing/PriceListCard.tsx`, `products/ProductTable.tsx`,
`products/ProductGrid.tsx`, `inventory/CategoriesPage.tsx`, `inventory/LocationsPage.tsx`,
`inventory/MovementsPage.tsx`, `pricing/PriceListsPage.tsx`, `finance/AccountingPage.tsx`
(hover de botón secundario) — junto con las páginas ya corregidas en la pasada previa
(Dashboard, WebOrders, Accounting, Expenses, PettyCash, Suppliers, PurchaseOrders,
NewPurchaseOrder, Reports, Products). `PublicCatalogPage` y `GuestAccessPage` quedan como
están (storefront público fuera del alcance de la uniformización admin).

**Verificación:** scan final = 0 residuos claro-sobre-claro (solo quedan los oscuros
intencionales del Header/Sidebar/chips sobre color, idénticos al Hub); typecheck 0 errores;
tests 17/17 en verde (el aviso `scrollIntoView` de Checkout.jsx es preexistente en jsdom).
Plan v3 regenerado con fila 24 actualizada a "corregido y verificado".

## Anti-scroll de barras de filtros — fila 42 del plan (sep-26)

Pedido del usuario: replicar el "anti-scroll" del panel principal — al scrollear una
lista, la barra de filtros/búsqueda se ancla arriba y sigue usable. Referencia verificada:
`HubPanelPage.jsx:990` (`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-zinc-200
rounded-xl`), misma receta que ya usan los paneles del CRM (ClientesView:266,
LeadsView:163, TareasView:292, DashboardView:283).

**Aplicado en 13 paneles del inventario** (los que tienen barra de búsqueda/filtros):
ProductsPage (toolbar), SalesPage, WebOrdersPage, CustomersPage, SuppliersPage,
PurchaseOrdersPage, AccountingPage, ExpensesPage, ReportsPage (filtros de fecha),
QuotationsPage, PackagesPage, CatalogsPage, LiquidationPage.

**Fuera de alcance (sin barra o no son listas):** Dashboard, Caja Chica, Enlaces
compartidos, Categorías/Ubicaciones/Movimientos ("Próximamente"), Configuración, wizards
(Nueva Venta / Nueva Compra) y storefront (GuestAccess/PublicCatalog). El topbar del
shell NO es sticky (igual que en el Hub): al anclar en top-0, la barra de filtros es el
único elemento fijo durante el scroll, que es el comportamiento pedido.

**Verificación:** typecheck 0 errores; tests 17/17 en verde. Plan v3 regenerado con la
fila 42 ("Anti-scroll") en Aplicado (solo inventario).

## Verificación global final

- **Typecheck:** 0 errores en archivos tocados (errores restantes = preexistentes documentados: tests con mocks viejos, `qawa/*.js` sin `.d.ts`, `userService`, `commerceAdapter`).
- **Suite completa:** **271 passed / 2 failed / 19 skipped** — las 2 fallidas (`CartPage.test`, `DashboardPage.test`) y las 12 suites no-recolectadas (`@qawaylab/pago` ausente) son **preexistentes y verificadas contra HEAD** en la fase de auditoría. 0 regresiones; +5 tests nuevos del gate.
- Los 12 tests del gate (`RequirePermission` 5 + `RequireAuth` 5 + flujo de compra 7 en sus corridas) siguen en verde tras la maquetación.

## Pendiente consciente (no de esta etapa)

- Filtrado del Sidebar por permiso (pulido UX; la frontera de seguridad ya está en el gate de rutas).
- Selector de Tema en el dropdown de perfil (el Hub lo tiene; inventario usa tema único claro — requiere decisión de tokens oscuros).
- `RequirePermission` en el resto de apps (CRM/agenda/academy) con el MISMO componente/copy — replicar el patrón de `RequirePermission.tsx`.
- QA funcional gstack-qa → al final, después del Bloque 2 (Supabase), como se acordó.
