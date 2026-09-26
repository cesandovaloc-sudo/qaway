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
| **6** | (este commit) | Verificación global + bitácora |

## Verificación global final

- **Typecheck:** 0 errores en archivos tocados (errores restantes = preexistentes documentados: tests con mocks viejos, `qawa/*.js` sin `.d.ts`, `userService`, `commerceAdapter`).
- **Suite completa:** **271 passed / 2 failed / 19 skipped** — las 2 fallidas (`CartPage.test`, `DashboardPage.test`) y las 12 suites no-recolectadas (`@qawaylab/pago` ausente) son **preexistentes y verificadas contra HEAD** en la fase de auditoría. 0 regresiones; +5 tests nuevos del gate.
- Los 12 tests del gate (`RequirePermission` 5 + `RequireAuth` 5 + flujo de compra 7 en sus corridas) siguen en verde tras la maquetación.

## Pendiente consciente (no de esta etapa)

- Filtrado del Sidebar por permiso (pulido UX; la frontera de seguridad ya está en el gate de rutas).
- Selector de Tema en el dropdown de perfil (el Hub lo tiene; inventario usa tema único claro — requiere decisión de tokens oscuros).
- `RequirePermission` en el resto de apps (CRM/agenda/academy) con el MISMO componente/copy — replicar el patrón de `RequirePermission.tsx`.
- QA funcional gstack-qa → al final, después del Bloque 2 (Supabase), como se acordó.
