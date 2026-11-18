# Bitácora · 17-nov-2026 · Etapa 6-B — Permisos granulares en UI (gating con sesión real + Permisos curables)

**Proyecto:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode · **Autorización:** "Procede" del responsable (17-nov) tras exposición previa en chat del plan (5 archivos).
**Modelo codificado (decisiones del responsable, 17-nov):** plataforma todo · tenant admin único admin de su empresa · roles `admin | editor | operativo | visor` · llaves delicadas SOLO en `user_app_roles.permissions` jsonb (`gp.crear_proyecto`, `gp.editar_proyecto`, `gp.administrar_edt`, `gp.registrar_personas`) · "totales" = editor + llaves · tareas: admin/editor/operativo crean, editor edita ajenas, operativo lo propio · EDT delicado (admin o llave) · `visor|viewer|guest` / rol nulo o desconocido ⇒ fail-closed solo lectura.

---

## 1 · Archivos nuevos (3)

| Archivo | Contenido |
|---|---|
| `src/services/gpPermisosService.ts` | Capa PURA (`permisosDesdeJsonb` shape objeto vivo `{}` y array por robustez; `capacidadesDe(rol, permisos, esPlataforma, conSesion)` matriz del modelo) + loader `cargarPerfilGp()` (fila PROPIA de `user_app_roles` vía RLS `uar_own_read`, `app_id` de `app_catalog` slug `gestor-proyectos`; caché + `invalidarPerfilGp`) + hook `usePerfilGp()` + `listarUsuariosEmpresa()` (directorio del tenant: `users_tenant_read` + `uar_tenant_admin_manage`) + `guardarRolGp()` (upsert jsonb shape objeto). Sesión reutilizada de `resolverContextoSesion()` (Etapa 4) — sin mecanismos paralelos. Normaliza vocabulario Hub (`viewer|guest` ⇒ solo lectura). |
| `src/services/gpPermisosService.test.ts` | Vitest SIN RED (patrón `gpCicloVidaService.test.ts`, mock `supabaseClient → null`): jsonb (objeto/array/basura), matriz completa (sin sesión, plataforma, admin, editor ± llaves, operativo ± llaves, visor/viewer/guest, rol nulo/desconocido). **14/14 en verde.** |
| `src/modules/configuracion/PermisosTab.tsx` | Pestaña "Permisos del Equipo" (estética propia del Gestor — prohibido lo "Jira", sin nombres ni layouts de productos ajenos): admin-only; por usuario rol (select 4 roles) + 4 llaves (checkboxes) + botón Guardar deshabilitado si no hay cambios; estados honestos: sin sesión (inicia sesión en el Hub), sin permiso, cargando, error + Reintentar, directorio vacío. Escritura directa a `user_app_roles` (la DB manda). |

## 2 · Cableado (3 archivos existentes, 15 edits)

**`src/App.tsx` (3):** import del servicio · hook + `handleOpenCreateProject` tras `gestorTenantId` (gating: con sesión y SIN `crearProyecto` ⇒ `notifyActive('No tienes permiso para crear proyectos (requiere rol admin o la llave gp.crear_proyecto).')` y no abre; `notifyActive` de 1 argumento) · Sidebar y Resumen usan el nuevo handler (2 openers).

**`src/modules/configuracion/ConfiguracionView.tsx` (5):** import de `PermisosTab` + `usePerfilGp` · unión de tabs + `'permisos'` · botón de tab "Permisos del Equipo" (entre Auditoría y Asistente) · panel `{activeTab === 'permisos' && <PermisosTab />}` · gate en `handleSaveCurrentProject` (con sesión y sin `editarProyecto` ⇒ notify y return).

**`src/modules/cronograma-gantt/GanttEditorDrawer.tsx` (7):** import del servicio · hooks tras los estados del drawer (`aplicarPermisos = Boolean(perfilGp)`, `puedeEstructura = !aplicarPermisos || capGp.administrarEdt`, `puedeOperar = !aplicarPermisos || capGp.crearTarea || capGp.editarPropio`) · disabled + título honesto en: "Agregar entregable", "Eliminar entregable", "Agregar Sub-elemento" **y también "Crear primer sub-elemento/subcomponente"** (botón de estado vacío L1945–1953 — también crea estructura EDT; añadido por coherencia sobre lo expuesto) · footer: nota "Solo lectura" antes del footer cuando el rol no puede ni estructurar ni operar, delete `disabled={!puedeEstructura && !isNewDraft}` (cancelar borrador siempre) y guardar `disabled={!puedeEstructura && !puedeOperar}` con títulos.

## 3 · Regla honesta del gating

- **El gating SOLO aplica con sesión real** (`perfilGp` no nulo). En modo local (sin sesión de Qaway Hub) se conserva la edición demo actual — el shell hoy es pre-login (`gestorTenantId = null`) y el gating silencioso rompería la demo. Documentado aquí y en comentarios de código.
- **La DB sigue siendo el mando real** (RLS granular aplicada y verificada en Etapa 5): el gating de UI es UX, no seguridad.
- `PanelCicloVidaProyecto` (6.3) **queda intacto**: sus capacidades dependen de los RPCs de ciclo de vida (`20261115_0010`, sin aplicar — 6-E), no del rol de empresa.
- Borrado de proyecto: **fuera de alcance** (mantengo `@ts-nocheck` intacto en el flujo existente).

## 4 · Verificación

| Check | Resultado |
|---|---|
| `npm run typecheck` (tsc --noEmit, bundle completo) | ✅ **0 errores** (drawer tipado pasa; Configuración/Reuniones siguen con su `@ts-nocheck` histórico) |
| `npx vitest run src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/services/gpPermisosService.test.ts` | ✅ **14/14** |
| Ajuste durante pruebas | El test inicial exigía "operativo + llaves ⇒ delicados NO" — demasiado estricto: el modelo dice "EDT delicado = admin **o llave**" y la llave es curada deliberadamente por el admin ⇒ **la llave manda**. Test corregido a 2 casos (operativo SIN llaves ⇒ delicados NO; operativo CON llaves ⇒ la llave aplica, ajenas sigue NO). El servicio NO cambió. |
| DDL | **Ninguno** — RLS `uar_own_read` + `uar_tenant_admin_manage` + `users_tenant_read` (verificadas vivas 17-nov) bastan para leer perfil, curar permisos y listar el directorio con nombres (`full_name, last_name, email`). |

## 5 · Nota de prueba manual (pendiente de sesión real)

La verificación viva del panel (admin ve directorio, cura una llave, el afectado ve el cambio tras `invalidarPerfilGp`) requiere sesión real de Qaway Hub: procedimiento igual que `3.9` §6.2 cuando se pruebe con usuarios. Hoy el dato vivo es 1 fila `role='admin', permissions={}` (el responsable ve todo).

## 6 · Estado resultante

- El modelo granular tiene **cara visible**: create/edit de proyecto, estructura EDT y guardados del drawer respetan rol + llaves cuando hay sesión; el admin cura roles y llaves en Configuración → "Permisos del Equipo".
- Persistencia sin cambio: legacy `gestor_*` + localStorage (cutover Etapa 7). El gating viaja intacto al cutover porque las llaves ya son las del modelo.
- Siguiente propuesto: **6-C** (Mis asignaciones), **6-D** (identidad real en shell) o **6-E** (RPCs `0006a`+`0005`+`0006b`+`0010` — DDL, requiere "aplica" y verificación `3.9` §6.2).
