# Bitácora · 18-nov-2026 · Etapa 6-D — Identidad real del shell y “Crear nuevo proyecto” por capacidad

**Proyecto:** `qrusdsqgygfolxfrafyd` · **Módulo:** Gestor de Proyectos 2 (`src/pages/5-qaway-hub/13-Gestor_Proyectos2`)
**Rama:** `main-web` · **HEAD previo:** `1c95721c` (`454_10:52 18-11-2026`)
**Autorización:** “procede 6d completo” del responsable (18-nov), tras exposición previa en chat del diff/código exacto.
**Alcance:** solo código de app (UI/perspectiva). **Sin DDL/DML.** No se modifican RLS, RPCs, `PanelCicloVidaProyecto` ni infraestructura compartida del Hub.

---

## 1 · Objetivo

Reemplazar el placeholder de identidad del shell (`readStoredRole`/`userRole` simulado) por identidad real del Hub (`perfilGp`/capacidades vía `gpPermisosService`/`contextoSesion`) **manteniendo fallback demo sin sesión**. Alinear “Crear nuevo proyecto” a capacidad real de UI. `UserRole` se trata como **perspectiva UI**, no autorización (6-B/RLS mandan).

## 2 · Cambios aplicados

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | `readStoredRole` ahora lee `USER_ROLE_STORAGE_KEY` (fallback `coordinador`) para preservar demo; `usePerfilGp` expone `cargandoPerfilGp`; `sesionReal = !cargandoPerfilGp && perfilGp !== null`; efecto que deriva perspectiva desde sesión real (`admin`/`editor`/plataforma o capacidades elevadas ⇒ `coordinador`, si no ⇒ `gestor`) y sincroniza `cronogramaPerspective`; `puedeCrearProyectoUi = sesionReal ? capGp.crearProyecto : userRole === 'coordinador'`; `handleChangeRole` no-op con aviso en sesión real; persistencia de `USER_ROLE_STORAGE_KEY` solo en modo demo; props `canCreateProject` a `Sidebar` y `canCreateProject`+`sesionReal` a `ResumenProyectoView`. Handler de creación sigue fail-closed en sesión real (`perfilGp && !capGp.crearProyecto`). |
| `src/components/Sidebar.tsx` | Nuevo prop `canCreateProject?: boolean`; `puedeCrearProyecto = canCreateProject ?? (userRole === 'coordinador')`; botón “Crear nuevo proyecto” gateado por capacidad real/fallback demo (perspectiva visual `userRole` conservada). |
| `src/modules/resumen/ResumenProyectoView.tsx` | Nuevos props `canCreateProject?: boolean`, `sesionReal?: boolean`; `puedeCrearProyecto` para acciones de creación; banner demo “VISTA DE COORDINACIÓN GENERAL / Carlos Sandoval” solo en `!sesionReal && userRole === 'coordinador'`; botón de cabecera “Nuevo Proyecto Regional” alineado a capacidad real. |

## 3 · Comportamiento resultante

- **Con sesión real del Hub:** la perspectiva UI deriva del perfil/capacidades reales; no se permite alternarla manualmente ni persistirla como simulada; “Crear nuevo proyecto” solo si `capGp.crearProyecto` (y el handler ya lo exigía). La identidad real de usuario sigue mostrándose en `Topbar`.
- **Sin sesión (modo demo/local):** se conserva el fallback demo, incluida preferencia local de perspectiva y la UI/banners demo existentes; la creación se mantiene condicionada a perspectiva `coordinador` en demo.
- **Autorización:** sin cambios; 6-B/RLS/DB siguen siendo el mando real.

## 4 · Validación

| Verificación | Resultado |
|---|---|
| `npm run typecheck` (`tsc --noEmit -p tsconfig.json`) | ✅ OK (salida limpia) |
| `npx vitest run src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/services/gpPermisosService.test.ts` | ✅ 14/14 pruebas aprobadas |

## 5 · Pendiente / no incluido

- **6-C “Mis asignaciones”:** alcance no definido (requiere decisión del responsable: C1 local, C2 sobre `gp_*`/cutover, o C3 por módulo).
- **Etapa 7:** `0100` backfill + cutover `gestor_*`/localStorage→`gp_*` (requiere revisión/plan y “aplica/procede” por fases).
- **`3.9` §6.2:** RLS con identidades reales sigue pendiente de ejecución manual y registro; no declarar RLS validada.
- Sin commit/push en este paso de edición; commit registrado aparte como `455_11:30 18-11-2026_ etapa 6-D identidad real shell y crear proyecto por capacidad`.
