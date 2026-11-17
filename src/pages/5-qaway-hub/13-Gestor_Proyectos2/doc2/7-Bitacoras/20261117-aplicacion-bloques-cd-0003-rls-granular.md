# Bitácora · 17-nov-2026 · Aplicación BLOQUES C+D — `0003` (tablas 19–34) + infra `0004` + RLS granular

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
**Autorización:** "crea todo primero has un commit total, luego crea todo" del responsable (17-nov), tras exposición previa de las 16 tablas.
**Fuente SQL:** `3.7-SQL-propuesto-sin-ejecutar/20261112_0003_gp_entidades_operativas_y_relaciones.sql` — aplicado **VERBATIM**.
**Commit previo:** `447_16:59` (b96223c3) — checkpoint total del repo antes de crear.

---

## 1 · Aplicación (4 migraciones vía `apply_migration`)

| Migración | Contenido | Resultado |
|---|---|---|
| `gp_entidades_operativas_relaciones` | `0003` VERBATIM: 16 tablas (8 operativas 19–26 + 8 relacionales 27–34) + índices + FK diferida `gp_archivos_reunion_fk` | ✅ success |
| `gp_entidades_operativas_relaciones_comentarios` | 16 `COMMENT ON TABLE` (regla de la casa: uno por tabla, todas las columnas) | ✅ success |
| `gp_0004_infra_triggers_indices_corridas` | Infra de `0004`: `gp_set_updated_at` + triggers `updated_at` en todas las `gp_*` con esa columna + 7 índices complementarios + 4 políticas de `gp_corridas_migracion`. **OMITE los bloques de políticas gruesas de entidades/relaciones de `0004`** (su `_modify FOR ALL` con cualquier miembro rompería el modelo delicado — avisado al responsable antes de aplicar) | ✅ success |
| `gp_rls_tenant_operativas_relaciones` | RLS granular para 15 tablas (corridas ya traía las suyas): 60 políticas (4 por tabla, convención 1–9, `authenticated`, `anon` fuera) | ✅ success |

## 2 · Modelo granular aplicado a 19–34 (mismo criterio del responsable)

- **SELECT (todas):** plataforma O miembro de la empresa (+ rama `empresa_id IS NULL` verbatim de `0004` en las `_r`).
- **Escritura `admin/editor`:** entregables, líneas base, snapshot de LB, reuniones, membresías (proyecto/equipo), responsables de tarea, dependencias de tarea, participantes de reunión, alcance territorial.
- **`operativo` además:** registra avances y sube archivos (y cada quien edita lo suyo vía `created_by`), como con tareas.
- **EDT = DELICADO:** `gp_edt_responsables_r` y `gp_nodo_dependencias_r` solo `admin` o permiso granular `gp.administrar_edt` (jefes de línea no tocan EDT).
- **`gp_eventos_auditoria`:** escritura SOLO plataforma (la app escribe auditoría con `service_role` que bypassa RLS; un autenticado no forja auditoría). Lectura: empresa (+ rama IS NULL verbatim).
- **`gp_corridas_migracion`:** lectura para autenticados; escritura solo plataforma (expresiones verbatim de `0004`, nombres en convención 4-políticas).
- `visor` no modifica nada en ninguna tabla. `anon` sin políticas.

## 3 · Verificación viva (17-nov)

| Tabla | # | Cols | Políticas | Trigger | FKs/Únicos/Checks | COMMENT |
|---|---|---|---|---|---|---|
| `gp_entregables` | 19 | 21 | 4 | 1 | 6/0/0 | 791 ✅ |
| `gp_lineas_base` | 20 | 17 | 4 | 1 | 3/0/0 | 699 ✅ |
| `gp_linea_base_nodos` | 21 | 12 | 4 | 0* | 4/1/0 | 588 ✅ |
| `gp_avances` | 22 | 17 | 4 | 0* | 6/0/1 | 763 ✅ |
| `gp_archivos` | 23 | 24 | 4 | 1 | **7**/0/0 (incl. FK diferida a reuniones) | 819 ✅ |
| `gp_reuniones` | 24 | 22 | 4 | 1 | 6/0/0 | 658 ✅ |
| `gp_eventos_auditoria` | 25 | 13 | 4 | 0* | 2/0/0 | 749 ✅ |
| `gp_corridas_migracion` | 26 | 14 | 4 | 0* | 0/**1**/0 | 658 ✅ |
| `gp_proyecto_miembros_r` | 27 | 12 | 4 | 1 | 4/**1**/0 | 818 ✅ |
| `gp_equipo_miembros_r` | 28 | 10 | 4 | 1 | 3/**1**/0 | 455 ✅ |
| `gp_edt_responsables_r` | 29 | 11 | 4 | 1 | 4/**1**/0 | 825 ✅ |
| `gp_tarea_responsables_r` | 30 | 11 | 4 | 1 | 4/**1**/0 | 522 ✅ |
| `gp_nodo_dependencias_r` | 31 | 10 | 4 | 0* | 5/**1**/**1** (no-self) | 514 ✅ |
| `gp_tarea_dependencias_r` | 32 | 10 | 4 | 0* | 5/**1**/**1** (no-self) | 482 ✅ |
| `gp_reunion_participantes_r` | 33 | 9 | 4 | 0* | 4/**1**/0 | 434 ✅ |
| `gp_proyecto_unidades_r` | 34 | 7 | 4 | 0* | 3/**1**/0 | 570 ✅ |

\* Sin trigger `updated_at` porque no tienen columna `updated_at` (inmutables o sin auditoría completa, por diseño de `0003`).

**Salud §9:** `tablas_gp = 36` (34 numeradas + extras `5b` y `7.1`) · `sin_rls = 0` ✅ · `permisivas = 0` ✅ · `anon = 0` ✅ · total políticas `gp_*` = **145**.

**Prueba anon (PostgREST):** las **16** → **`200` + `[]`** ✅ (accesibles, vacías, RLS filtra todo a anon).

## 4 · Estado resultante

- **34/34 numeradas** (+ 2 extras `5b`/`7.1` = 36 físicas). TODAS con RLS del patrón del responsable.
- Helpers vivos: `gp_is_platform_admin`, `gp_auth_empresa_id`, `gp_is_empresa_member`, `gp_empresa_has_role`, `gp_empresa_has_permission` ✅. **`gp_is_project_member` ya puede crearse** (su tabla `gp_proyecto_miembros_r` existe) — llega con la aplicación del bloque de helpers de `0004` (solo esa función queda pendiente) o se crea explícitamente; tras crearse, añadir la rama `OR gp_is_project_member(...)` a las `_select` de entidades (ajuste explícito documentado).
- Regla operativa: datos reales solo vía backfill `0100` (Etapa 7, con `gp_corridas_migracion` registrando corridas) o desde la app con los roles/permisos del modelo.

## 5 · Siguiente

- Crear `gp_is_project_member` + ramas de miembro de proyecto en `_select` (pequeño ajuste, requiere orden del responsable).
- Etapa 6 → app; Etapa 7 → backfill `0100`.
