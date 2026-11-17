# Bitácora · 17-nov-2026 · Helper `gp_is_project_member` creado y conectado a las `_select` de entidades

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
**Autorización:** orden del responsable (17-nov): "Sí, crea y conecta" (pregunta expuesta en chat).
**Fuente SQL:** `3.7-SQL-propuesto-sin-ejecutar/20261112_0004_gp_funciones_triggers_rls_indices.sql` — helper **VERBATIM** (líneas 147–169) y ramas del patrón aprobado (línea 238 para `gp_proyectos`, macro líneas 276–278 para tablas con `proyecto_id`).
**Commit previo:** `448_17:14` (ab363ece) — checkpoint antes de crear.

---

## 1 · Aplicación (2 migraciones vía `apply_migration`)

| Migración | Contenido | Resultado |
|---|---|---|
| `gp_helper_is_project_member` | Función `gp_is_project_member(p_proyecto_id uuid)` verbatim de `0004`: `STABLE`, `SECURITY DEFINER`, `SET search_path = public`; `gp_is_platform_admin()` OR EXISTS en `gp_proyecto_miembros_r` (estado='activo') JOIN `gp_personas` (user_id = auth.uid(), empresa alineada a pm). **Sin rama "miembro de empresa ⇒ miembro de todo"** (F3: bypass retirado) | ✅ success |
| `gp_rls_select_miembro_proyecto` | 12 `DROP POLICY` + `CREATE POLICY` de las `_select` de entidades con la rama añadida (expresiones vivas previas intactas + `OR public.gp_is_project_member(...)`). Insert/update/delete SIN tocar | ✅ success |

## 2 · Alcance de la conexión (patrón aprobado de `0004`, no ampliado)

- **`gp_proyectos_select`:** `... OR public.gp_is_project_member(id)` (verbatim 0004 línea 238).
- **10 tablas con `proyecto_id`:** `gp_fases`, `gp_nodos_edt`, `gp_tareas`, `gp_equipos`, `gp_entregables`, `gp_lineas_base`, `gp_linea_base_nodos`, `gp_avances`, `gp_archivos`, `gp_reuniones` → `... OR public.gp_is_project_member(proyecto_id)` (verbatim macro 0004 líneas 276–278; el CASE-guard del macro era solo robustez del bucle genérico — las columnas existen, verificado en vivo).
- **`gp_eventos_auditoria_select`:** conserva su rama `empresa_id IS NULL` verbatim y añade la de miembro de proyecto.
- **Las `_r` NO reciben la rama** (0004 líneas 307–311 no la trae: su lectura ya es por empresa). **Catálogos, `gp_personas` y `gp_corridas_migracion` sin cambio** (0004 tampoco se los da).

## 3 · Efecto real (honesto)

- Para quien **ya es miembro de la empresa** (cualquier rol, incluido `visor`): sin cambio — la rama `gp_is_empresa_member(empresa_id)` ya le daba lectura.
- Para quien es **miembro activo de un proyecto pero NO tiene rol de empresa** (estados transicionales: persona invitada/creada sin fila en `user_app_roles` aún, o post-backfill antes de asignar roles): GANA lectura de las entidades de SU proyecto. Falta-cerrada: nadie fuera de la empresa ni de los proyectos ve nada.
- `gp_is_platform_admin()` dentro del helper mantiene el acceso plataforma a todo.
- La escritura NO cambia: sigue el modelo granular (roles + permisos delicados).

## 4 · Verificación viva (17-nov)

| Check | Resultado |
|---|---|
| 12 `_select` con rama (`qual LIKE '%gp_is_project_member%'`) | ✅ 12/12 (`gp_proyectos` sobre `id`; 11 sobre `proyecto_id`) |
| Salud §9 | ✅ `tablas_gp=36 · sin_rls=0 · permisivas=0 · anon=0` |
| Total políticas `gp_*` | ✅ **145** (drop+create 1:1, sin duplicados) |
| Función | ✅ `STABLE` (volatile='s'), `SECURITY DEFINER`, usa `gp_proyecto_miembros_r`, filtra `estado='activo'` |
| Helpers `gp_*` vivos | ✅ **7**: `gp_is_platform_admin`, `gp_auth_empresa_id`, `gp_is_empresa_member`, `gp_empresa_has_role`, `gp_empresa_has_permission`, **`gp_is_project_member`**, `gp_set_updated_at` |
| Prueba anon PostgREST (12 tablas tocadas) | ✅ 12/12 → **`200` + `[]`** |

## 5 · Estado resultante

- Los 5 helpers pendientes de `0004` ya están vivos (los 6 del modelo + `gp_is_project_member`); lo único de `0004` que queda omitido a propósito son sus **bloques gruesos de políticas** (conflicto con el modelo granular — no ejecutar el archivo completo).
- El backfill `0100` (Etapa 7) correrá con `service_role` y registra corridas en `gp_corridas_migracion`.
- Siguiente: Etapa 6 (conexiones app/UI) y Etapa 7 (backfill `0100`), más pruebas de identidad reales (`3.9` §6.2) cuando haya usuarios con roles y suscripciones.
