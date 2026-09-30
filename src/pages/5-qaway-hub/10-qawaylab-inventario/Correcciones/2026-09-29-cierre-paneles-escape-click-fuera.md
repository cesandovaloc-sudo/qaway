# Correcciones: cierre de paneles desplegables con Escape o click fuera

**Fecha:** 2026-09-29
**Alcance:** `/hub/panel/*` (HubShell + módulos del panel) y paneles desplegables de inventario.
**Requisito:** todo panel que se despliega (p. ej. menús de tres puntos) debe cerrarse al presionar **Escape** o al **hacer click fuera** de él.

---

## Resumen

Ninguno de los módulos `HubSuper*` tiene listener de click fuera ni de Escape. Solo `HubPanelPage.jsx` cierra 9 dropdowns por click fuera (sin Escape), y únicamente `AppSwitcherDropdown.jsx` cumple Escape + click fuera. Los modales con fondo oscuro no cierran al hacer click en el fondo ni con Escape (solo con su botón X / Cancelar).

---

## Observaciones por módulo

### 1. HubPanelPage.jsx (shell del panel / Inicio)
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 1 | Menú Acciones Rápidas (zapato) | `showActionsMenu` | toggle 911–918, render 920–950 | ❌ | ✔ |
| 2 | Selector de rango de tiempo | `showTimeMenu` | toggle 955–963, render 965–984 | ❌ | ✔ |
| 3 | Filtro Categoría/Rubro | `showCategoryMenu` | toggle 994–1017, render 1019–1051 | ❌ | ✔ |
| 4 | Filtro Empresas | `showTenantMenu` | toggle 1058–1081, render 1083–1143 | ❌ | ✔ |
| 5 | Filtro Aplicaciones | `showAppMenu` | toggle 1150–1173, render 1175–1207 | ❌ | ✔ |
| 6 | Filtro Planes | `showPlanMenu` | toggle 1214–1237, render 1239–1271 | ❌ | ✔ |
| 7 | Rango Rendimiento Comercial | `showRendimientoMenu` | toggle 1561–1572, render 1574–1592 | ❌ | ✔ |
| 8 | Timeframe Aplicaciones | `showAppTimeframeMenu` | toggle 1623–1634, render 1636–1654 | ❌ | ✔ |
| 9 | Timeframe Planes | `showPlanTimeframeMenu` | toggle 1683–1694, render 1696–1714 | ❌ | ✔ |
| 10 | Modal Nueva Métrica | `isMetricModalOpen` | trigger 894–902, render 1799–1905 | ❌ | ❌ fondo sin onClick |
| 11 | Popover de búsqueda global | `globalSearchQuery` | render 2776–2879 (etiqueta "Esc para cerrar" 2874 no funcional) | ❌ | ❌ |
| 12 | Overlay switcher de empresa | `isTenantSwitcherOpen` | trigger 2598–2607, render 2608–2663 | ❌ | ✔ (fondo 2611) |
| 13 | Overlay usuarios de marca | `isBrandUsersOpen` | trigger 2667–2676, render 2677–2750 | ❌ | ✔ (fondo 2680) |
| 14 | Dropdown de perfil | `isProfileOpen` | trigger 2890–2914, render 2915–2966 | ❌ | ✔ (fondo 2918) |

### 2. HubSuperEmpresasModule.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 15 | Menú de fila (tres puntos) | `openMenu` | toggle 1108–1119, render 1121–1155 | ❌ | ❌ |
| 16 | Modal Importar Excel | `showImportModal` | trigger 743–750, render 764–901 (fondo 765) | ❌ | ❌ |
| 17 | Modal Editar empresa | `editModal` | render 1368–1456 (fondo 1369) | ❌ | ❌ |
| 18 | Modal Confirmar eliminar | `deleteModal` | render 1459–1494 (fondo 1460) | ❌ | ❌ |
| 19 | Modal Detalle de empresa | `viewModal` | render 1497–1591 (fondo 1498) | ❌ | ❌ |

### 3. HubSuperUsersModule.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 20 | Menú de fila (tres puntos) | `openMenu` | toggle 974–985, render 987–1022 | ❌ | ❌ |
| 21 | Panel de filtros | `showFilters` | toggle 763–774, render 778–822 | ❌ | ❌ |
| 22 | Panel inline permisos por fila | `permUserId` | toggle 999–1008, render 1026–1039 | ❌ | ❌ |

### 4. HubSuperPagosPanel.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 23 | Menú de fila (tres puntos) | `openMenu` | toggle 695–705, render 707–724 | ❌ | ❌ |
| 24 | Panel de filtros | `showFilters` | toggle 572–583, render 587–620 | ❌ | ❌ |

### 5. HubsuperAplicacionesModule.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 25 | Menú de fila (tres puntos) | `menuId` | toggle 615–626, render 628–661 | ❌ | ❌ |
| 26 | Panel de filtros | `showFilters` | toggle 495–506, render 510–535 | ❌ | ❌ |
| 27 | Modal Nueva aplicación | `showNewApp` | trigger 418–425, render 886–934 (fondo 887) | ❌ | ❌ |
| 28 | Modal Detalle de app | `selectedApp` | render 812–883 (fondo 813) | ❌ | ❌ |

### 6. HubSuperSuscripcionesPanel.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 29 | Panel de filtros | `showFilters` | toggle 573–584, render 588–627 | ❌ | ❌ |

### 7. HubSuperPlanesPreciosPage.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 30 | Modal crear/editar plan | `modalPlan` | render 791–797; PlanModal fondo 503 | ❌ | ❌ |
| 31 | Modal página pública de precios | `showPublic` | trigger 680–687, render 799–824 (fondo 800) | ❌ | ❌ |
| 32 | Botón "Nueva plan" (línea 688–695) hace `setModalPlan(null)` — no abre el modal (bug de apertura) | `modalPlan` | rotto | — | — |

### 8. HubSuperReportesPanel.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 33 | Botón Filtros sin `onClick` | — | 338 | — | — |
| 34 | Botón "more" (tres puntos) sin `onClick` | — | 354 | — | — |

### 9. HubSuperSupportPanel.jsx
| # | Elemento | Estado | Líneas | Escape | Click fuera |
|---|----------|--------|--------|:------:|:-----------:|
| 35 | Panel de filtros (tiene X pero no Escape/click fuera) | `showFilters` | toggle 378–388, render 392–399 | ❌ | ❌ |
| 36 | Tip descartable (no es overlay click) | `showTip` | 588–609 | ✔ (X) | — |

### 10. HubSuperConfiguracionPanel.jsx / HubSuperAdminProfilePanel.jsx
- Sin menús desplegables ni modales: solo pestañas inline. No requiere cambios.

---

## Inventario — paneles de diseño (`imagen-diseño/1-ResumenPanel`)
| # | Archivo | Elemento | Líneas | Escape | Click fuera |
|---|---------|----------|--------|:------:|:-----------:|
| 37 | 5-ClientsPage.jsx | Menú 3pts por cliente | trigger 317, render 317 | ❌ | ❌ |
| 38 | 8-PedidosPanel.jsx | Menú 3pts por pedido | trigger 87, render 87 | ❌ | ❌ |
| 39 | 7-PanelVentas1.jsx | Menú 3pts por venta | trigger 52, render 52 | ❌ | ❌ |
| 40 | 13-SedesModule.jsx | Modal (fondo apaga ✔, sin Escape) | 246–266 | ❌ | ✔ |
| 41 | 12-Liquidaciones.jsx | Panel detalle (sin Escape/click fuera) | `showDetail` 54, render 137 | ❌ | ❌ |

### Inventario — app real (`10-qawaylab-inventario/src`)
| # | Archivo | Elemento | Líneas | Escape | Click fuera |
|---|---------|----------|--------|:------:|:-----------:|
| 42 | components/products/ProductTable.tsx | Botón `MoreHorizontal` (revisar si abre menú) | 120 | — | — |
| 43 | components/pricing/PriceListCard.tsx | Botón `MoreHorizontal` (revisar si abre menú) | 68 | — | — |

---

## Acciones aplicadas

Se creó el hook compartido `src/pages/5-qaway-hub/hooks/useDismissOnEscapeOrOutside.js`: escucha `mousedown`, `touchstart` y `keydown` (Escape), y cierra el overlay cuando el click ocurre fuera de cualquier elemento marcado con `data-dismissable`. Integrado en los módulos `HubSuper*`; en el shell (`HubPanelPage.jsx`) y en los paneles de diseño `imagen-diseño` se usó el mismo patrón local (ref + listeners).

| # | Elemento | Corrección |
|---|----------|------------|
| 1–9 | Dropdowns del dashboard (SuperAdminDashboard) | ✔ Escape añadido al listener global existente (`HubPanelPage.jsx`) |
| 10 | Modal Nueva Métrica | ✔ Escape (mismo listener) + cierre al hacer click en el backdrop |
| 11 | Popover de búsqueda global | ✔ Escape cierra (limpia `globalSearchQuery`) + click fuera vía `data-dismissable`. "Esc para cerrar" ahora funcional |
| 12–14 | Overlays switcher de empresa / usuarios de marca / perfil | ✔ Escape cierra todos; click fuera vía panel `data-dismissable` |
| 15–19 | HubSuperEmpresasModule | ✔ Menú de fila + modales (Importar/Editar/Eliminar/Ficha) con hook `useDismissOnEscapeOrOutside` |
| 20–22 | HubSuperUsersModule | ✔ Menú de fila + panel de filtros + permisos inline |
| 23–24 | HubSuperPagosPanel | ✔ Menú de fila + panel de filtros |
| 25–28 | HubsuperAplicacionesModule | ✔ Menú de fila + filtros + modales Nueva app / Detalle |
| 29 | HubSuperSuscripcionesPanel | ✔ Panel de filtros |
| 30–32 | HubSuperPlanesPreciosPage | ✔ Modales Plan / Página pública; bug arreglado: botón "Nueva plan" ahora hace `setModalPlan({})` (abría/cerraba el modal con `null`) |
| 33–34 | HubSuperReportesPanel | Sin cambio: botones sin `onClick` (no despliegan nada) |
| 35 | HubSuperSupportPanel | ✔ Panel de filtros |
| 36 | HubSuperSupportPanel tip | Sin cambio: se cierra con su X |
| 37 | 5-ClientsPage.jsx | ✔ Menú 3pts por cliente: ref + Escape y click fuera |
| 38 | 8-PedidosPanel.jsx | ✔ Menú 3pts por pedido: ref + Escape y click fuera |
| 39 | 7-PanelVentas1.jsx | ✔ Menú 3pts por venta: ref + Escape y click fuera |
| 40 | 13-SedesModule.jsx | ✔ Modal: Escape añadido (fondo ya cerraba) |
| 41 | 12-Liquidaciones.jsx | ✔ Panel detalle: Escape + click fuera sobre el contenedor |
| 42 | ProductTable.tsx | Sin cambio: `MoreHorizontal` no abre menú (no tiene `onClick`) |
| 43 | PriceListCard.tsx | Sin cambio: `MoreHorizontal` llama a `onEdit` directamente (no abre menú) |

## Verificación

- `npm run lint` → sin errores en los archivos tocados (warnings pre-existentes solo).
- `npm run typecheck` → sin errores.
- Commit total (`git add -A`) incluyendo los cambios previos de `ESTANDAR-VISUAL-TABLEROS.md` y `3-CategoriasPanel.jsx`.