# Bitácora · 17-nov-2026 · Aplicación `0004a` — RLS tenant-scoped + granularidad (tablas 13–18)

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
**Autorización:** "Con todo eso claro, procede" del responsable (17-nov), tras exposición y refinamiento del modelo.
**Fuente:** propuesta `3.7-SQL-propuesto-sin-ejecutar/20261117_0004a_gp_helpers_rls_tenant_bloque_b.sql`
+ refinamientos del responsable en chat (variante C + permisos delicados + adscripción organizacional).

---

## 1 · Modelo del responsable implementado (refinado durante la sesión)

- **Plataforma:** acceso a todo. **Tenant:** único administrador de su empresa.
- **Roles de empresa** (`user_app_roles.role`, vocabulario definido): `admin` (tier tenant) · `editor` (gestión operativa) · `operativo` (crea sus tareas) · `visor` (solo lectura, NO modifica nada).
- **Permisos DELICADOS granulares** (nunca en rol grueso; se conceden uno por uno en UI, llaves v1 curadas por el responsable): `gp.crear_proyecto`, `gp.editar_proyecto`, `gp.administrar_edt`, `gp.registrar_personas` — viven en `user_app_roles.permissions jsonb`.
- **Invitación delegada:** un Director con `gp.registrar_personas` registra personas (solo roles operativo/visor; backend valida el permiso). Adscripción organizacional vía `gp_personas.unidad_id` → `gestor_unidades` (sede principal → direcciones de línea → regionales/distritales; estatal/particular en `unit_type`).
- **El árbol NO implica mando:** la autoridad de asignar la dan las responsabilidades EDT (`gp_edt_responsables_r.tipo_responsabilidad` = responsable/apoyo/**supervisor** — mando vs monitoreo, catálogos vivos `owner/manager/member/viewer` y `supervisor/coordinador`). Visibilidad matricial: subárbol propio ∪ nodos asignados, nunca ancestros; hijos suman 100%.
- **gp_tareas:** TODOS los miembros con rol de escritura (`admin/editor/operativo`) crean tareas (herramienta de supervisión del usuario más bajo); las no-EDT pasan por el tenant para acreditación (lo marca la app en `metadata`); cada quien edita/borra las SUYAS (`created_by`).
- **gp_proyectos:** crear/editar es DELICADO (`admin` de empresa o permiso granular); hard delete solo plataforma (borrado lógico `is_deleted`).
- **gp_nodos_edt (EDT):** DELICADO — `admin` o `gp.administrar_edt`. Los jefes de línea NO tocan EDT.

## 2 · Aplicación (vía `apply_migration`)

| Migración | Contenido | Resultado |
|---|---|---|
| `gp_rls_tenant_capas` | `user_app_roles.permissions jsonb DEFAULT '{}'` · `gp_personas.unidad_id` FK→`gestor_unidades` + índice · helpers verbatim `0004` (`gp_is_platform_admin`, `gp_auth_empresa_id`, `gp_is_empresa_member`) + nuevos con el mismo patrón (`gp_empresa_has_role`, `gp_empresa_has_permission`, ambos con gate comercial `user_can_use_app`) | ✅ success |
| `gp_rls_tenant_politicas_entidades` | 24 políticas (4 por tabla × 6 entidades), nombres idénticos a convención 1–9, DROP+CREATE idempotente | ✅ success |

## 3 · Verificación viva (17-nov) — script §0–§9 en verde

**§0 Helpers (7 vivos):** `gp_auth_empresa_id` ✅ · `gp_empresa_has_permission` ✅ · `gp_empresa_has_role` ✅ · `gp_is_empresa_member` ✅ · `gp_is_platform_admin` ✅ · `is_platform_admin` ✅ · `user_can_use_app` ✅ — `gp_is_project_member` ⏳ llega tras `0003` (depende de `gp_proyecto_miembros_r`, tabla 27).

**§1 Resumen:** 6/6 tablas con **4 políticas** y **RLS true** (24/24). **§3 sin_rls = 0** ✅ · **§4 permisivas = 0** ✅ · **§5 anon = 0** ✅

**§7 Expresiones clave (reales en pg_policies):**
- `_select` (6/6): `gp_is_platform_admin() OR gp_is_empresa_member(empresa_id)` (+ rama `empresa_id IS NULL` verbatim en `gp_personas`).
- `gp_proyectos_insert`: `gp_is_platform_admin() OR gp_empresa_has_role(empresa_id, ARRAY['admin']) OR gp_empresa_has_permission(empresa_id, 'gp.crear_proyecto')` · update idem con `gp.editar_proyecto` · delete: `is_platform_admin()`.
- `gp_nodos_edt` (insert/update/delete): `... OR has_role(['admin']) OR has_permission('gp.administrar_edt')`.
- `gp_personas_insert`: `... OR has_role(['admin','editor']) OR has_permission('gp.registrar_personas')`.
- `gp_tareas_insert`: `... OR has_role(['admin','editor','operativo'])` · update/delete: `... OR (gp_is_empresa_member(empresa_id) AND created_by = auth.uid())`.
- `gp_fases`/`gp_equipos` (escritura): `... OR has_role(['admin','editor'])`.

**§9 Salud final:** `tablas_gp = 20 · sin_rls = 0 ✅ · permisivas = 0 ✅ · anon = 0 ✅`

**Prueba anon (PostgREST):** las 6 → **`200` + `[]`** (`gp_proyectos`, `gp_personas`, `gp_fases`, `gp_nodos_edt`, `gp_tareas`, `gp_equipos`) ✅

**Estructura nueva verificada:** `user_app_roles.permissions` jsonb (default `'{}'`) ✅ · `gp_personas_unidad_id_fkey` → `gestor_unidades(id) ON UPDATE CASCADE ON DELETE SET NULL` ✅ · `idx_gp_personas_unidad` ✅

## 4 · Pendientes derivados (documentados, no bloquean)

1. `gp_is_project_member` + rama `OR gp_is_project_member(id/proyecto_id)` en las `_select` → tras `0003` (con el `0004` completo).
2. Vocabulario de roles y llaves de permisos: lo curó el responsable en UI (Pantalla A del brief del agente de UI). "Totales" = `editor` + todas las llaves delicadas concedidas (el tenant es el único `admin`).
3. Cambiador de empresa activa (multi-empresa, `get_auth_tenant_id()` = una activa) y flujo de invitado con contraseña → capa Hub/frontend, ya especificados al agente de UI.
4. Las pruebas de identidad reales (procedimiento `3.9` §6.2) se corren cuando haya usuarios invitados con roles y suscripciones de prueba.

## 5 · Siguiente paso

**PASO 3 · BLOQUES C+D** — `0003` (tablas 19–34), con exposición previa de cada tabla antes de aplicar, como exige el responsable.
