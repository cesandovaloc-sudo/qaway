# 11 · Plan de Columnas Dinámicas (estilo Notion) y Adecuación Cronograma DIGERE

## 1. Objetivo
Cerrar la tabla maestra de cronograma en Supabase (`public.gestor_cronograma_items` + `public.gestor_proyectos`) para que:
1. Soporte **todos los campos mínimos del Excel DIGERE** sin pérdida al sincronizar.
2. Permita **columnas dinámicas estilo Notion por tenant/proyecto** persistidas en Supabase (nunca solo en `localStorage`, y sin contaminar a otros tenants).
3. Resuelva la **fecha oficial vs. fecha de seguimiento** siguiendo el estándar PMBOK / MS Project / Smartsheet.
4. Añada la columna **Observaciones** y verifique el registro automático de **Fecha de cumplimiento (`actual_end`)**.

---

## 2. Mapeo de Columnas del Excel DIGERE vs. Base de Datos

| Columna Excel DIGERE | Campo en Frontend (`Item`) | Columna en Supabase (`gestor_cronograma_items`) | Estado actual y acción |
|---|---|---|---|
| **N° / Hito** | `code`, `parentId`, `kind`, `edtType` | `code`, `parent_id`, `kind`, `edt_type` | ✅ Ya existe. Filas agrupadoras (`1. PLANIFICACIÓN...`, `2. GESTIÓN...`) son `COMPONENTE` (`parent_id = NULL`) y `1.1`, `1.2` son `PAQUETE_TRABAJO` con `parent_id`. |
| **Subproceso** | `subprocesoGroup` (opcional) | `custom_fields` (o columna opcional) | ⚠️ Existe solo en semilla local `OfficialEdtReferenceRow`. Se habilitará como columna informativa/agrupadora opcional por proyecto/tenant (`select` / `text`). |
| **Actividades / Hitos Normativos** | `name` | `name` | ✅ Ya existe. |
| **DIGERE (Fecha oficial / normativa)** | `baselineEnd` (Línea Base oficial) | `baseline_end` | ✅ **Ya existe el criterio estándar** en `scheduleMetrics.ts` (`Línea base` = fecha oficial aprobada; `end` = fecha de seguimiento operativo con holgura/buffer interno). **Acción**: mapear la columna `DIGERE` del CSV a `baseline_end` (cuando no sea `"Sin fecha"`) y exponerla en Configuración / Vista Tabla como fecha oficial normativa. |
| **Inicio / Fin (Seguimiento)** | `start`, `end` | `start_date`, `end_date` | ⚠️ En `3.1`, `3.2`, `3.3` y `6.5` el CSV trae `"-"` o `"En cada llegada de ME"`. **Acción**: conciliar fila por fila contra `edtPmbokModel.ts` y guardar regla continua en `custom_fields` / `metadata` sin romper fechas ISO. |
| **Etapas** | `faseId` / `phase` | `fase_id` / `custom_fields` | ✅ Ya existe en el modelo (`FASE-PLANIFICACION`, `FASE-EJECUCION`, etc.); asegurar persistencia en `gestorCronogramaService.ts`. |
| **Entidad** | `entidadResponsable` | `entidad_responsable` (declarativa) | ❌ **Falta persistencia en Supabase**. **Acción**: agregar columna `entidad_responsable text` en `gestor_cronograma_items` (declarativa por ahora, sin acoplar aún a RLS) y mapearla en `toSupabaseRow` / `fromSupabaseRow`. |
| **Evidencia / Documento Sustentatorio** | `deliverable`, `deliverables` | `deliverable`, `deliverables` | ✅ Ya existe y persiste en Supabase. |
| **Observaciones** *(nueva)* | `observaciones` | `observaciones text` (o `description` / columna dedicada) | ❌ **Nueva solicitud**. **Acción**: agregar columna `observaciones text DEFAULT ''` en `gestor_cronograma_items` y exponerla en Vista Tabla / Drawer. |
| **Fecha de cumplimiento** | `actualStart`, `actualEnd` | `actual_start`, `actual_end` | ✅ Ya existe `applyActuals()` en `scheduleMetrics.ts` (completa `actualEnd` automáticamente al marcar `100%` / `Completado` / `Cumple`). **Acción**: verificar que se dispare también en edición inline de tabla y en cambios de estado rápidos. |
| **Columnas dinámicas del Tenant (Notion)** | `customCols` + `customValues` | `gestor_proyectos.custom_columns` (`jsonb`) + `gestor_cronograma_items.custom_fields` (`jsonb`) | ❌ **Hoy solo viven en `localStorage`**. **Acción**: persistir definiciones en `gestor_proyectos` y valores por fila en `gestor_cronograma_items`, aislados por `tenant_id` y sincronizados cada `2.5s`. |

---

## 3. Fases de Ejecución

0. **Fase 0 · Adelanto / Colchón Interno sobre Fecha Oficial (Solo Administrador)** *(IMPLEMENTADO)*:
   - `gpCronogramaConfigService.ts`: `diasColchonAdelanto`, `ocultarFechaOficialANoAdmin`, `subtractWorkingDays()` (respeta `semanaLaboral` y `diasLaboralesCustom` personalizados) y `aplicarColchonAdelantoItems()` (protege paquetes cortos dejando mínimo 2 días hábiles y reportándolos en `alertas` para ajuste manual).
   - `ConfiguracionView.tsx`: controles solo para `admin`, botón **"Aplicar adelanto al proyecto activo"** y panel de alerta con la lista exacta de paquetes omitidos.
   - `CronogramaGanttView.tsx`: oculta `baselineStart`, `baselineEnd` y `deviation` a usuarios no-admin cuando `ocultarFechaOficialANoAdmin` está activo.

1. **Fase 1 · Migración SQL en Supabase (`20261125xxxxxx_gp_cronograma_columnas_notion.sql`)**:
   - Añadir a `public.gestor_cronograma_items`: `entidad_responsable text`, `observaciones text DEFAULT ''`, `custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb`.
   - Añadir a `public.gestor_proyectos`: `custom_columns jsonb NOT NULL DEFAULT '[]'::jsonb`.
   - Todo aislado por `tenant_id` (sin afectar a otros tenants).
2. **Fase 2 · Servicio `gestorCronogramaService.ts`**:
   - Incluir `entidad_responsable`, `observaciones`, `custom_fields` en `CRONOGRAMA_SELECT`, `toSupabaseRow` y `fromSupabaseRow` (manteniendo tolerancia a esquema).
   - Añadir lectura/guardado de `custom_columns` por proyecto en `gestor_proyectos`.
3. **Fase 3 · UI en `CronogramaGanttView.tsx` (Tabla + Drawer + Compliance)**:
   - Sincronizar `customCols` y `customValues` con Supabase en el ciclo de `2.5s` (dejando `localStorage` solo como caché de arranque rápido).
   - Exponer columnas **Entidad**, **Observaciones**, **Fecha Oficial (DIGERE / Línea Base)** y **Fecha de Cumplimiento (`actualEnd`)** en Vista Tabla y `GanttEditorDrawer`.
   - Verificar que `applyActuals` registre `actualEnd` tanto desde el Drawer como desde edición inline de porcentaje/estado en tabla.
   - Cargar en el proyecto DIGERE (solo para su tenant) las columnas informativas (`Subproceso`, `DIGERE`, `Entidad`, `Observaciones`) con su tipo correspondiente (`select` / `date` / `text`).
4. **Fase 4 · Auditoría y Conciliación de Datos CSV vs `DRE_JUNIN_DOTACION_2027_EDT`**:
   - Revisar las 35+ actividades (`1.1` a `11.2`) del CSV contra `edtPmbokModel.ts` para corregir cualquier fecha, título, entidad o evidencia desfasada.
5. **Fase 5 · Validación**:
   - `npx tsc --noEmit` (0 errores), revisión de `git diff` y bitácora de cierre en `doc2/11-Columnas-dinamicas-y-cronograma-digere/`.
