# ETAPA 2 — Mapeo legacy/localStorage → modelo relacional v2 y plan de migración (preparación)

> **Estado:** propuesta técnica de preparación (sin ejecución).  
> **Restricciones:** no ejecutar `DROP`, no eliminar/alterar destructivamente tablas existentes en Supabase, **no retirar `localStorage`** (`qaway-gantt-items-<pid>` y atributos EDT asociados) hasta que la nueva persistencia esté implementada, migrada, verificada y aprobada para cutover. Migraciones solo **aditivas** en esta etapa.

## 1. Fuentes actuales (legado / vigentes)

| Fuente | Ubicación / clave | Contenido relevante |
|---|---|---|
| Estado local del cronograma | `localStorage` key `qaway-gantt-items-<projectId>` (y variantes por vista/módulo según implementación vigente) | Árbol/lista de `Item` (id, code, name, kind, parentId, fechas, progreso, estado, dependencias, faseId, edtType/is_entregable implícito, territoriales, gestores, entregables, baseline/actual, etc.) |
| Tipos de dominio (UI/servicio) | `src/modules/cronograma-core/types.ts` (`Item`, `DeliverableItem`, `AttachmentItem`, `Status`, `Kind`) | Contrato canónico en memoria |
| Clasificación EDT | `src/modules/cronograma-core/edtPmbokModel.ts`, `src/modules/cronograma-core/wbsHierarchy.ts` | Tipo EDT **derivado** (`resolveEdtNodeType`); `is_entregable` único declarable; raíz siempre `COMPONENTE` |
| Seeds / catálogos | `src/modules/cronograma-core/sedesCatalogSeeds.ts`, `src/modules/cronograma-gantt/sedesCatalogSeeds.ts` | Semillas y jerarquías de referencia |
| Servicio cronograma | `src/services/gestorCronogramaService.ts` | Punto de acceso/normalización actual hacia persistencia (revisar en implementación para cutover) |

> **Nota:** los nombres exactos de claves/estructuras en `localStorage` deben confirmarse en el servicio/hook de persistencia antes del script de backfill (lectura-only en análisis).

## 2. Mapeo campo-a-campo (propuesta)

### 2.1 Proyecto → `gp_projects`

| Origen (actual) | Destino v2 | Tipo | Transformación / reglas |
|---|---|---|---|
| `projectId` (contexto/ruta/store) | `gp_projects.id` | uuid | Si el id actual no es UUID, generar UUID nuevo y conservar original en `metadata.legacy_project_id` y/o tabla de mapeo de migración |
| código/nombre de proyecto (catálogo/contexto) | `code`, `name` | text | Normalizar unicidad por organización |
| fechas de proyecto (si existen) | `start_date`, `end_date` | date | ISO `YYYY-MM-DD` |
| — | `created_at/updated_at` | timestamptz | `now()` en inserción; preservar origen en `metadata` si existe |
| — | `created_by/updated_by` | uuid | Según sesión disponible en migración; nullable si no determinable |

### 2.2 `Item` → `gp_wbs_nodes`

| Campo `Item` (core) | Destino `gp_wbs_nodes` | Tipo | Transformación / reglas |
|---|---|---|---|
| `id` | `id` | uuid | Preferir conservar si ya es UUID; si no, nuevo UUID y guardar original en `legacy_source_id` |
| (contexto proyecto) | `project_id` | uuid (FK) | Obligatorio; nodo y proyecto deben corresponder |
| `parentId` | `parent_id` | uuid (FK self) | `null` para raíz. Mapear id heredado → UUID v2 vía diccionario de migración |
| `code` | `wbs_code` | text | Conservar código WBS decimal (`1.`, `1.1`, `1.7.1`); validar unicidad por proyecto |
| `name` | `name` | text | Trim; no vacío |
| `description` | `description` | text | Directo |
| `kind` (`hito` \| `subproceso`) | `kind` | text | **Se mantiene** según dominio vigente; check constraint en v2 |
| `edtType` / derivación | *(no fuente manual)* | — | **No persistir como verdad**; derivar con motor canónico. Opcional `edt_type_cached` solo como caché regenerable. `is_entregable` gobierna ENTREGABLE |
| clasificación ENTREGABLE (declarada) | `is_entregable` | boolean | `true` solo cuando el nodo es contenedor declarado entregable; en caso contrario `false` |
| `faseId` | `fase_id` | text/uuid | Directo; materializar catálogo `gp_fases` solo si se aprueba |
| `status` | `status` | text | Vocabulario oficial (Completado, En curso, En proceso, Pendiente, Con retraso, Cumple); normalizar valores heredados |
| `progress` | `progress` | numeric(5,2) | Clamp 0–100; para contenedores puede recalcularse por servicio |
| `start`, `end` | `start_date`, `end_date` | date | Parse seguro; inválidos → null + registro en reporte de migración |
| `actualEnd` | `actual_end_date` | date | Directo si existe |
| `gestor` / `gestores` | `gestor` o `responsible_id` (según modelo final) | text/uuid | Decisión pendiente: texto vs FK a tabla de responsables/equipo |
| `region`, `distrito`, `sede` | `region`, `distrito`, `sede` | text | Directo; normalización a tablas de referencia en iteración posterior si aplica |
| orden visual/lista | `sort_order` | integer | Preservar orden relativo dentro de cada `parent_id` |
| `id` heredado / clave origen | `legacy_source_id` | text | **Trazabilidad obligatoria** del origen (ej. id localStorage) |
| `entidadResponsable`, `blockerInfo`, `taskType`, `icon`, `phase`, `unit`, `tasks`, `done`, `baselineStart/End`, `actualStart`, etc. | `metadata` (jsonb) o columnas dedicadas según prioridad | jsonb / columnas | Campos no críticos para la clasificación EDT pasan a `metadata` en Fase 1 aditiva; promover a columnas en iteraciones posteriores con aprobación |
| (borrado lógico) | `is_deleted` | boolean | `false` por defecto |

### 2.3 Dependencias → `gp_wbs_dependencies`

| Origen | Destino | Transformación |
|---|---|---|
| `Item.dependencies[]` (ids de predecesores) | `predecessor_id` (FK) + `successor_id` (FK, el item actual) | Resolver ids heredados → UUID v2; `dependency_type='FS'`, `lag_days=0` por defecto si no hay detalle; descartar duplicados/autorreferencias con reporte |
| (alcance) | `project_id` | Debe coincidir con ambos nodos |

### 2.4 Entregables adjuntos → `gp_wbs_deliverables`

| `DeliverableItem` | Destino | Transformación |
|---|---|---|
| `id` | `id` | UUID (conservar/generar + traza si aplica) |
| (item padre) | `node_id` | FK al nodo migrado |
| `name` | `name` | Directo |
| `type` (formato) | `deliverable_type` / `format` | Mapear `DeliverableFormat` a vocabulario v2 |
| `url`, `fileName` | `url`, `notes/metadata` | Directo; validar URLs si aplica |

### 2.5 Adjuntos (`AttachmentItem`) → `metadata` / tabla futura

- Fase aditiva inicial: persistir en `gp_wbs_nodes.metadata.attachments` (jsonb) o tabla `gp_wbs_attachments` si se define en migración aprobada. **No** eliminar adjuntos de origen.

## 3. Reglas de integridad y normalización (backfill)

- **Clasificación:** recalcular/validar tipo EDT con `resolveEdtNodeType` tras reconstruir jerarquía (`parent_id`, hijos, `is_entregable`, fechas hito). Registrar discrepancias sin “corregir” silenciosamente datos de negocio ambiguos.
- **Raíz:** todo nodo con `parent_id IS NULL` debe resultar `COMPONENTE`.
- **Compatibilidad heredada:** normalizar valores legados (`FASE`, `SUBCOMPONENTE`, `SUBPROCESO`) solo en lectura/migración vía `normalizeEdtType`/reglas canónicas; no escribir valores legados como clasificación funcional nueva.
- **Jerarquía:** verificar ausencia de ciclos, huérfanos y referencias cruzadas de proyecto.
- **Códigos WBS:** unicidad `(project_id, wbs_code)` cuando no nulo; detectar colisiones.
- **Fechas:** `start_date <= end_date` cuando ambas existan; hito consistente con regla de duración cero si aplica.
- **Idempotencia:** el backfill debe poder reejecutarse usando `legacy_source_id`/clave natural para upsert controlado (sin duplicar filas).

## 4. Plan de migración versionada (aditiva, sin destructividad)

### Fase 2A — Diseño aprobado (esta etapa)
- [x] Modelo relacional v2 documentado (`doc2/modelo_datos_v2.md`).
- [x] Mapeo campo-a-campo y reglas de integridad (este documento).
- [ ] Revisión/aprobación de nombres finales, multitenencia, responsables (`gestor` texto vs FK) y alcance de `metadata` vs columnas.
- [ ] Confirmación del origen exacto de datos a migrar (claves `localStorage`, servicio, tablas Supabase legadas si existen) y volumen.

### Fase 2B — Migración aditiva (solo tras aprobación explícita “aplica”)
- [ ] Crear migraciones **solo aditivas**: tablas `gp_*`, índices, constraints, RLS (sin `DROP`, sin `ALTER` destructivo sobre legado).
- [ ] Script/servicio de backfill en entorno de prueba: lectura de origen → transformación (mapeo + normalización EDT) → inserción/upsert en `gp_*` → `gp_migration_runs`/reporte.
- [ ] Verificación: conteos origen/destino, FK válidas, sin huérfanos/ciclos, unicidad WBS, muestreo de jerarquías y dependencias, clasificación derivada coherente.

### Fase 2C — Cutover controlado (posterior, con aprobación)
- [ ] Lectura/escritura dirigida a `gp_*` detrás de flag/configuración; **mantener `localStorage` y estructuras legadas como respaldo**.
- [ ] Pruebas funcionales en las 4 vistas (cronograma-gantt, tareas-2, reportes-2, reuniones-2).
- [ ] Plan de rollback operativo (volver a fuente previa) documentado.

### Fase 2D — Retiro diferido (solo con autorización explícita)
- [ ] Respaldo/export verificado.
- [ ] Retiro de `localStorage`/legado **solo si se autoriza**; **ningún `DROP` implícito**.

## 5. Riesgos y decisiones abiertas

| Tema | Riesgo | Decisión requerida |
|---|---|---|
| Identidad de proyecto/usuario | `projectId` o responsables no UUID | Definir estrategia de mapeo y tablas de referencia |
| `gestor/gestores` | Texto libre vs identidad normalizada | Modelo de responsables/equipo definitivo |
| `edt_type` persistido | Doble fuente de verdad | Mantener derivado; cache opcional regenerable |
| `dependencies` | Referencias rotas/heredadas | Política de descarte con reporte vs corrección asistida |
| Multitenencia/organización | Aislamiento insuficiente | Confirmar `organization_id` y políticas RLS |
| Volumen y consistencia localStorage | Datos incompletos/heterogéneos por cliente | Definir fuente canónica para backfill (export, BD legada, o ambos) |

## 6. Entregables de esta preparación

- Modelo: `doc2/modelo_datos_v2.md`
- Mapeo y plan: `doc2/mapeo_y_plan_migracion_v2.md` (este documento)
- **Sin** scripts SQL ejecutados, **sin** cambios en Supabase, **sin** retiro de `localStorage`.
