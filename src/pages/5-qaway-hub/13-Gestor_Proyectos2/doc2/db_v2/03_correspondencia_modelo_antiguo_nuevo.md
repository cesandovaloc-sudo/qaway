# Correspondencia modelo antiguo → nuevo (ETAPA 2B)

> Trazabilidad para revisión y backfill. Sin ejecución de cutover ni retiro de estructuras antiguas.

## 1. Tablas Supabase actuales (`gestor_*`) → `gp_*`

| Antiguo | Nuevo | Tipo mapeo | Notas clave |
|---|---|---|---|
| `public.gestor_proyectos` (`id` text, `code`, `name`, `region`, `subtext`, `budget`, `sponsor`, `risk_level`, `metodologia`, timestamps) | `public.gp_proyectos` | 1:1 (por proyecto) | `id` text → nuevo `id` uuid (conservar original en `legacy_source_id` y `metadata.legacy_id`); `code`→`codigo_proyecto`; `name`→`nombre`; `budget`→`presupuesto` (parse numérico si aplica); campos extra a `metadata`; asignar `empresa_id` = tenant de contexto (p.ej. Qaway Lab `00000000-0000-0000-0000-000000000001`) según pertenencia real. |
| `public.gestor_cronograma_items` (`id` text, `project_id`, `code`, `name`, `kind`, `parent_id`, fechas, progreso/estado, `deliverable*`, `attachments`, `gestor/gestores`, `region`, `tasks/done`, baseline/actual, `task_type/icon`, etc.) | `public.gp_nodos_edt` (núcleo jerárquico) + tablas satélite | 1:N descompuesto | Item cronograma → nodo EDT (jerarquía, fechas, estado, kind, `is_entregable` inferido/declarado, fase si aplica). Entregables embebidos → `gp_entregables`. Adjuntos → `gp_archivos`/metadata. Responsables texto/array → `gp_personas` (deduplicadas) + `gp_edt_responsables_r`. Dependencias (campo de app/local) → `gp_nodo_dependencias_r`. Línea base/actual → columnas/snapshots (`gp_lineas_base`, `gp_linea_base_nodos`) o campos reales. `parent_id` text remapeado a UUID vía diccionario de migración. |
| `public.gestor_unidades` (`id` text, `tenant_id`, `parent_unit_id`, `name`, `code`, `unit_type`, `region`, `macroregion`, `address`, `status`, `metadata`) | `public.gp_unidades_territoriales` | 1:1 catálogo | `id`/`parent_unit_id` → UUIDs nuevos + `legacy_source_id`; `unit_type`→`tipo_codigo` (catálogo `gp_tipos_unidad_territorial_c`); `tenant_id`→`empresa_id` (uuid si convertible); seed idempotente preservado. |
| Columnas agregadas por 02/04 (`baseline_*`, `actual_*`, `task_type`, `icon`) | `gp_nodos_edt` (campos reales/cache) y/o `gp_linea_base_nodos` | directo/parcial | Mantener compatibilidad de lectura; baseline formal en entidad de línea base cuando se congele versión. |

## 2. `localStorage` y estado de aplicación → `gp_*`

| Origen (app/local) | Nuevo destino | Regla |
|---|---|---|
| `qaway-gantt-items-<projectId>` (array/árbol `Item`) | `gp_nodos_edt` + relaciones | Fuente rica de UI: puede contener `edtType`, `faseId`, `dependencies`, `gestores`, `deliverables`, `attachments`, `baseline/actual` no siempre persistidos en BD antigua. **Merge controlado** (completar huecos) con trazabilidad; no asumir única verdad. |
| `Item.id` / `parentId` / `dependencies[]` (ids heredados) | UUIDs + `legacy_source_id` + tablas `_r` | Diccionario de mapeo id_legacy→uuid por corrida; dependencias resueltas a FKs reales. |
| `Item.kind` (`hito|subproceso`) | `gp_nodos_edt.kind` | Se mantiene en dominio v2. |
| `Item.edtType` / estructura / `is_entregable` | derivado + `is_entregable` | `tipo_edt` efectivo se deriva por motor canónico; persistir solo atributos fuente (`nodo_padre_id`, hijos, `is_entregable`, fechas). `edt_type_cached` opcional regenerable. |
| `Item.faseId` / `phase` | `gp_fases` + `gp_nodos_edt.fase_id` | Fase como **dimensión independiente** (entidad), no tipo EDT. |
| `Item.start/end/progress/status` | fechas/`progreso`/`estado` | Normalizar estados al vocabulario oficial. |
| `Item.gestor` / `gestores[]` (texto) | `gp_personas` + `gp_edt_responsables_r` | Deduplicar por empresa/nombre normalizado/documento cuando exista; **no** almacenar responsables como arrays de texto. |
| `Item.deliverables[]` / `deliverable` | `gp_entregables` | Un registro por entregable verificable. |
| `Item.attachments[]` | `gp_archivos` (metadata) | Preservar nombre/url/tipo; archivo físico permanece en storage/origen. |
| `Item.region/distrito/sede` | `sede_id`/`unidad_territorial_id` o texto legado | Resolver contra `gp_sedes`/`gp_unidades_territoriales` cuando sea determinístico; conservar texto original en columnas/metadata. |
| `Item.baseline*` / `actual*` | `gp_nodos_edt` (reales) + `gp_lineas_base(_nodos)` | Actual en nodo; baseline aprobada como snapshot versionado. |

## 3. Semillas y catálogos de referencia

| Origen | Nuevo destino | Regla |
|---|---|---|
| Seed `gestor_unidades` (251 DRE/UGEL) | `gp_unidades_territoriales` + `gp_tipos_unidad_territorial_c` | Carga idempotente por `codigo`/`legacy_source_id`; sin duplicar. |
| `sedesCatalogSeeds.ts` (core/gantt) | `gp_sedes`, `gp_unidades_territoriales` (si aplica), `gp_nodos_edt` de referencia solo si corresponde a proyecto | Usar como referencia para normalizar nombres/códigos; no mezclar semilla de catálogo con datos transaccionales sin criterio de proyecto. |
| Catálogos implícitos en UI (estados, prioridades, roles, tipos reunión/archivo/avance) | `gp_*_c` | Sembrar vocabularios iniciales idempotentes (migración 0001). |

## 4. Objetos no modelados antes (nuevos en v2)

| Nuevo | Propósito | Origen de datos inicial |
|---|---|---|
| `gp_personas`, `gp_persona_cuentas_r` | Separar identidad/cuenta | Derivado de responsables/miembros existentes + vínculo a `auth.users` cuando corresponda |
| `gp_empresa_miembros_r`, `gp_proyecto_miembros_r` | Membresías y gobernanza por ámbito | Configuración inicial por empresa/proyecto (manual o backfill asistido) |
| `gp_fases` | Dimensión temporal independiente | `faseId/phase` actuales → entidades fase por proyecto |
| `gp_tareas` | Gestión operativa tipo tablero/gestor | Si hoy conviven en cronograma, migrar/derivar según `kind`/uso; mantener trazabilidad |
| `gp_equipos`, `gp_equipo_miembros_r` | Estructura de equipos | Módulo equipo/organigrama existente como referencia |
| `gp_reuniones`, `gp_reunion_participantes_r` | Gestión de reuniones | Datos/artefactos de reuniones si existen; si no, estructura preparada |
| `gp_avances` | Historial de avance | Generar snapshot inicial desde estado actual + capturas futuras |
| `gp_eventos_auditoria`, `gp_corridas_migracion` | Auditoría y trazabilidad de migración | Se poblan desde operaciones y backfill |

## 5. Reglas de no pérdida y conciliación

- Conservar **siempre** `legacy_source_id`/`metadata.legacy_*`.
- Prioridad de merge por campo: valor no nulo más completo y consistente; ante conflicto, registrar en `gp_corridas_migracion.errores`/reporte sin sobrescritura silenciosa.
- Ninguna estructura antigua se elimina ni se trunca en esta etapa.
