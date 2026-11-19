# Bitácora · 18-nov-2026 · Etapa 7 — Fase 1 backfill 0100 aplicado (gp_* pobladas desde legado)

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Módulo:** Gestor de Proyectos 2 (`src/pages/5-qaway-hub/13-Gestor_Proyectos2`)
**Rama:** `main-web` · **HEAD al momento:** `951abbb2` (`455_11:30 18-11-2026`) · **sin push**
**Autorización (DML):** “opcion a” del responsable (18-nov) para aplicar Etapa 7 Fase 1 con tenant **DIGERE MINEDU** (`8bbc04cb-f030-48cc-904e-954c5b5af813`).
**Alcance:** ejecución DML de backfill idempotente legado → `gp_*` (solo aditivo, sin DROP/TRUNCATE). No se modificó código de app. Sin commit/push en este paso.

---

## 1 · Script ejecutado

- **Base:** `doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/backfill/20261112_0100_backfill_idempotente.sql` (v3.1).
- **Ajustes de ejecución (18-nov), autorizados dentro de “opcion a”:**
  - `v_empresa_default` = `8bbc04cb-f030-48cc-904e-954c5b5af813` (tenant **DIGERE MINEDU**, `digere-minedu`) para `p1` “MINEDU · Dotación 2026”.
  - **WBS efectivo único por proyecto** para cumplir `uq_gp_nodos_edt_wbs` sin mutar legado (datos legados: 6614 ítems con `code` vacío y 3 con `code='1.8'` duplicado en `p1`): `code` vacío → `id`; `code` duplicado en su `(project_id, btrim(code))` → `btrim(code)||'::'||id`; resto → `btrim(code)`. Prevalidación A-6 de nodos alineada al WBS efectivo. Trazabilidad preservada: `metadata.legacy.code` conserva el `code` original; se añade `metadata.wbs_code_original` y `metadata.wbs_code_desambiguado`.
- **Corrida:** `gp_backfill_v3_20261113_0100` (clave conservada, idempotente por `legacy_source_id`/`ON CONFLICT`).

## 2 · Intentos y resolución

| Intento | Resultado | Causa / acción |
|---|---|---|
| 1 | **Fallida** (EXCEPTION P0001) | PREVALIDACION A-6: `gestor_cronograma_items` con códigos duplicados por proyecto (`wbs_code ''`=6614 filas, `'1.8'`=3). Corrida registrada `fallida` (metadata vacía de filas). Sin inserciones efectivas. |
| 2 | **Fallida** (23505 `uq_gp_nodos_edt_wbs`) | Ajuste inicial con `count(*) OVER` en lateral por fila no desambiguó `'1.8'` correctamente (colisión `(proyecto_id,wbs_code)=(..., '1.8')`). Rollback de la transacción DO. |
| 3 | **Completada** | WBS efectivo calculado sobre el conjunto completo (`count(*) OVER (PARTITION BY project_id, btrim(code))` en subconsulta de ítems) + prevalidación alineada. Ejecución exitosa. |

## 3 · Verificación post-backfill (lectura, 18-nov-2026)

**Corrida `gp_corridas_migracion` (`gp_backfill_v3_20261113_0100`):**
- `estado=completada`, `errores=[]`, `filas_leidas=0`, `filas_escritas=6956`, `filas_omitidas=0`.
- `iniciado_at/finalizado_at=2026-11-18 17:35:39.216778+00`.
- `metadata={empresa_default:"8bbc04cb-f030-48cc-904e-954c5b5af813", nodos_insertados:6704, unidades_estampadas:251, proyectos_insertados:1, ajuste_wbs_efectivo:true}`.

**Conteos legado vs gp_*:**

| Entidad | Legado | `gp_*` (no borrados) | Con `legacy_source_id` |
|---|---:|---:|---:|
| Proyectos | 1 (`gestor_proyectos`) | 1 (`gp_proyectos`) | 1 |
| Ítems/nodos cronograma | 6704 (`gestor_cronograma_items`, todos `project_id='p1'`) | 6704 (`gp_nodos_edt`) | 6704 |
| Unidades | 251 (`gestor_unidades`) | 251 estampadas | 251 (todas con `legacy_source_id`, 0 borradas) |

**Proyecto migrado (`gp_proyectos`):** `id=c9a1f5ee-c3af-4771-ba2c-66b3e343e770`, `empresa_id=8bbc04cb-f030-48cc-904e-954c5b5af813` (DIGERE MINEDU), `codigo_proyecto='PRJ-MIN-2027-01'`, `nombre='MINEDU · Dotación 2026'`, `legacy_source_id='p1'`, `estado_codigo=NULL`, `ambito='Nacional'`, `metodologia=''`, `nivel_riesgo='medio'`, `patrocinador='Comité Directivo'`, `presupuesto=850000.00`, `moneda='PEN'`, `presupuesto_original='S/ 850,000'`, `revision_pendiente=["estado","subtext"]`.

**Integridad/huérfanos:**
- Huérfanos de padre no resuelto (`nodo_padre_id` null con `legacy.parent_id` no vacío): **0**.
- Nodos sin proyecto válido: **0**.
- Duplicados WBS `(proyecto_id,wbs_code)` en `gp_nodos_edt`: **0**.

**WBS efectivo / desambiguación:**
- `nodos_wbs_desambiguado=true`: **6617** (6614 con `code` legado vacío → `wbs_code=id`; 3 del grupo `'1.8'` → `wbs_code='1.8::'||id`).
- `nodos_code_legacy_vacio`: **6614**. Muestra (vacíos): ids tipo `pt-1.1-unit-*` con `wbs_code` igual al `legacy_source_id` y `legacy_code=''`. Los 3 `'1.8'` conservan `legacy_code='1.8'` y `wbs_code_desambiguado=true`.

**Flags/pendientes esperados (Fase 2):**
- `nodos_con_revision_pendiente` (no vacía): **6704**; con bandera `["is_entregable"]`: **6704** (pendiente P-1, merge localStorage).
- `edt_type_cached IS NULL`: **6704** (pendiente P-2, derivación post-backfill).
- `task_type IS NULL`: **6704**, `icon IS NULL`: **6704** (pendiente P-1, opción b v3.1: no leídos de legado).

**Unidades (`gestor_unidades`):** 251 totales, 251 con `legacy_source_id`, 0 `is_deleted=true` (estampado aditivo).

## 4 · Merges / deudas post-backfill (pendientes, según 0100/3.4)

- **P-1 (cliente, crítico para fidelidad UI):** merge `localStorage` (`SCHEDULE_FIELDS`: taskType/icon/edtType/faseId/phase/dependencies) por `legacy_source_id`; resuelve `is_entregable` y limpia bandera; `expanded` descartado. Requiere mecanismo desde navegador/servicio y registro en `gp_corridas_migracion`.
- **P-2 (derivable):** poblar `edt_type_cached` con `resolveEdtNodeType` sobre árbol migrado.
- **P-3..P-7 (controlados/revisión humana):** responsables→`gp_personas`+`gp_edt_responsables_r`, entregables embebidos→`gp_entregables`, adjuntos (permanecen en metadata salvo estructuración), `sede_unidad_id` (sin match fiable por región), fases/dependencias→`gp_fases`/`gp_nodo_dependencias_r`.
- **Revisión pendiente proyecto:** `estado` y `subtext` (sin evidencia; no asignados por diseño).

## 5 · Pendientes siguientes

- **Etapa 7 Fase 2:** ejecutar/planificar P-2 y definir mecanismo P-1 (con aprobación/“aplica” para DML/operación controlada).
- **Etapa 7 Fase 3:** cutover app por módulos a `gp_*` (exponer código exacto antes de escribir; aprobar por fases) para revisión módulo por módulo.
- **6-C “Mis asignaciones”:** alcance no definido (C1 local, C2 sobre `gp_*`/cutover, C3 por módulo) — decisión pendiente.
- **`3.9` §6.2:** RLS con identidades reales no ejecutada/registrada; no declarar validada.

## 6 · Archivos relacionados

- `doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/backfill/20261112_0100_backfill_idempotente.sql` (actualizado para reflejar ejecución real: tenant y WBS efectivo).
- `doc2/0-INDICE-Y-BITACORA.md` (estado actualizado).
- Script efectivamente ejecutado (vía MCP `execute_sql`, intento 3): equivalente al archivo ajustado con cálculo de WBS sobre conjunto completo.
