# Cierre de desplegables, combos y modales con Escape y click fuera — /hub/inventario

Fecha: 2026-09-30

Revisión de la app de inventario (`/hub/inventario`) para que **todos los paneles, combos y modales** se cierren con la tecla **Escape** o con un **click fuera**, replicando el estándar ya aplicado en `/hub/panel/*`. Solo se añadió lógica de cierre: **cero cambios de diseño, layout o datos**.

## Patrón aplicado

- Nuevo hook compartido del subproyecto: `10-qawaylab-inventario/src/hooks/useDismissOnEscapeOrOutside.ts`.
  - Escucha `keydown` (Escape), `mousedown` y `touchstart` a nivel de `window` mientras está activo.
  - Cierra cuando el foco de ratón/touch queda fuera del `ref` adjunto (`ref.contains(e.target)`).
  - El callback de cierre se guarda en una ref para no re-suscribirse en cada render.
- Uso: `const ref = useDismissOnEscapeOrOutside(abierto, cerrar)` + `ref={ref}` en el panel del modal o en el contenedor `relative` del combo.

## Acciones aplicadas

| # | Archivo | Qué se corrigió |
|---|---------|-----------------|
| 1 | `src/hooks/useDismissOnEscapeOrOutside.ts` | **Nuevo hook** compartido (Escape + click/touch fuera). |
| 2 | `src/components/reports/ColumnPickerModal.tsx` | Modal de columnas: antes solo se cerraba con X/Cancelar. Ahora Escape + click fuera (ref en panel). |
| 3 | `src/components/customers/CustomerForm.tsx` | Form de cliente: Escape + click fuera (ref en panel). |
| 4 | `src/components/pricing/PriceListForm.tsx` | Form de lista de precios: ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 5 | `src/components/quotations/QuotationForm.tsx` | Form de cotización: Escape + click fuera (ref en panel) **+ cierre de ambos combos** cliente y producto (Escape + click fuera). |
| 6 | `src/components/shared/SharedLinkForm.tsx` | Form y vista "Enlace creado": Escape + click fuera (ref en panel). |
| 7 | `src/components/liquidation/ProductSelector.tsx` | Selector de productos: Escape + click fuera (ref en panel). |
| 8 | `src/components/liquidation/CampaignForm.tsx` | Form de campaña: Escape + click fuera (ref en panel). |
| 9 | `src/components/products/ProductImport.tsx` | Import de Excel: ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 10 | `src/pages/DashboardPage.tsx` | Modal "Nueva operación": ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 11 | `src/pages/finance/PettyCashPage.tsx` | Modal "Nuevo movimiento": ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 12 | `src/pages/finance/ExpensesPage.tsx` | Modal "Nuevo gasto": ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 13 | `src/pages/finance/AccountingPage.tsx` | Modal "Nuevo asiento": ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 14 | `src/pages/suppliers/SuppliersPage.tsx` | Modal "Nuevo proveedor": ya cerraba con backdrop; se añadió Escape (ref en panel). |
| 15 | `src/pages/sales/WebOrdersPage.tsx` | Modal de detalle de pedido web: no cerraba por backdrop ni Escape; ahora ambos. |
| 16 | `src/pages/sales/NewSalePage.tsx` | Combos de buscador **cliente** y **producto**: no se cerraban hasta seleccionar; ahora Escape + click fuera. |
| 17 | `src/pages/purchases/NewPurchaseOrderPage.tsx` | Modal "Crear proveedor rápido": se añadió Escape + click fuera; combos de **proveedor** y **producto**: ahora Escape + click fuera. |

## Ya cubierto (sin cambios requeridos)

- `src/components/header/Header.tsx`: los 5 desplegables (empresa, sede, almacén, perfil, waffle) ya cerraban con Escape (`closeAllDropdowns`) y con cortinas `fixed inset-0` de click fuera.
- `src/components/products/ProductTable.tsx` y `src/components/pricing/PriceListCard.tsx`: su botón `MoreHorizontal` no abre menú desplegable (sin `onClick` / invoca acción directa), por lo que no aplica cierre.

## Verificación

- `npm run typecheck` del subproyecto (`tsconfig.app.json`): los archivos modificados compilan sin errores. Quedan **2 errores pre-existentes ajenos** en `src/context/TenantContext.tsx` (sin relación con este cambio).
- `npm run typecheck` y `npm run lint` (`oxlint .`) de la raíz: sin errores nuevos; solo warnings pre-existentes en `dist/` y otros proyectos.