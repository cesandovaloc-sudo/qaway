# Handoff: subir ubicaciones (`src/data`) a Supabase (`gestor_unidades`)

> **Fecha:** 2026-11-18  
> **Módulo:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2`  
> **Objetivo:** subir/alinear en Supabase las ubicaciones existentes en `src/data` con las configuraciones desarrolladas para `public.gestor_unidades`, **posponiendo** Fase 2/3 (cutover a `gp_*`) y 6-C.  
> **Supabase project_ref:** `qrusdsqgygfolxfrafyd` · **App slug:** `gestor-proyectos` (`5003ed7a-c97b-4956-a0d0-9ddd5dc9dd44`).  
> **Regla crítica:** **NO ejecutar DDL/DML sin “aplica/procede” explícito del usuario.** Exponer primero el plan + SQL/DML exacto + reporte de mapeo; ejecutar solo tras confirmación. No declarar RLS validada hasta ejecutar y anotar `3.9` §6.2.

---

## 1. Contexto y estado conocido
- **Fase 1 (Etapa 7) aplicada y verificada** (ver `doc2/7-Bitacoras/20261118-etapa7-fase1-backfill-0100-aplicado.md`): `gp_*` pobladas parcialmente (1 proyecto, 6704 nodos). **`gestor_unidades` ya tiene 251 filas estampadas** (catálogo nacional, `tenant_id NULL`, `id` `unit-001`…`unit-251`).
- Configuraciones desarrolladas vigentes en `gestor_unidades`: **0005** (columna `orden` + índice `idx_gestor_unidades_parent`) y **0006b** (RLS definitiva, 5 políticas). Ambas aplicadas.
- `/hub/gestor_proyectos/proyecto` sigue en **híbrido legado/localStorage** (no `gp_*`). **No tocar cutover Fase 2/3.**
- Trabajo local puede tener cambios no commiteados ajenos a esta tarea (`cronograma-gantt/CronogramaGanttView.tsx`, `gantt.css`) y ediciones previas de doc2; no revertir nada ajeno. Siguiente commit del asistente en curso histórico: **456** (no hacer commit/push salvo que el usuario lo pida explícitamente).

## 2. Fuentes locales a usar (`src/data`)
| Archivo | Rol |
|---|---|
| `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/data/mineduUnidades.ts` | **Catálogo principal a subir/alinear** (44 206 B). `export const MINEDU_UNIDADES = [...] as const;` **251** registros `unit-001`…`unit-251`, 26 regiones. Campos base: `id,name,code,unitType,region,status`. Coords: 2 spreads `...UGEL_COORDINATES['DRE AMAZONAS'/'UGEL BAGUA']`, 13 `lat/lng` inline (Junín `unit-124`…`unit-136`), resto sin coords propias. `unitType` ∈ `{dre,ugel}`; nombres `GRE AREQUIPA (unit-042)`, `GRE LA LIBERTAD (unit-137)`, `GRE LAMBAYEQUE (unit-153)`, `RED HUEPETUHE (unit-185)` están tipados como `ugel`. `unit-126` tiene `code` `UGEL-CONCEPCIÓN` (con tilde) a diferencia de semilla base histórica. |
| `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/data/ugel-coordinates.ts` | **Enriquecimiento de coords** (21 200 B). `UGEL_COORDINATES: Record<string,{lat,lng,observacion}>` ~248 entradas. **No calza 1:1 por nombre** con el catálogo (variantes guion/espacio, tildes/case, entradas faltantes/sobrantes, algunas genéricas/APROXIMADAS). Usar por matching normalizado con reporte de no-coincidencias; no forzar matches dudosos. |
| `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/data/peru_departamental_simple.json` | GeoJSON de polígonos departamentales (mapa). **No son filas de `gestor_unidades`**; excluir del upsert salvo instrucción explícita. |

> Nota: la carga debe reflejar el **contenido completo/desarrollado** de `mineduUnidades.ts` (y coords enriquecidas) respetando la config vigente.

## 3. Esquema y configuración vigente de `public.gestor_unidades`
- **Base** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/supabase/03_gestor_unidades.sql`:
  - Columnas: `id text PK`, `tenant_id text NULL`, `parent_unit_id text FK→gestor_unidades(id) ON DELETE SET NULL`, `name text not null`, `code text not null UNIQUE`, `unit_type text not null default 'ugel'`, `region text`, `macroregion text`, `address text`, `status text not null default 'active'`, `metadata jsonb default '{}'`, `created_at/updated_at timestamptz`.
  - Índices base: `uq_gestor_unidades_code`, `idx_gestor_unidades_region`, `idx_gestor_unidades_type`, `idx_gestor_unidades_tenant`.
  - Semilla 251 (`unit-001..251`, `tenant_id NULL`, `metadata {"source":"REGION_UGEL.xlsx"}`) con `ON CONFLICT(id) DO UPDATE` que sobrescribe `name,code,unit_type,region,status,metadata,updated_at`.
- **0005** `supabase/migrations/20261118154545_0005_gestor_unidades_orden_idx.sql` (aplicada): `orden integer` (posición entre hermanos, `NULL` = orden de inserción; cache de presentación, verdad jerárquica = `parent_unit_id`) + `idx_gestor_unidades_parent(parent_unit_id)`.
- **0006b** `supabase/migrations/20261118154612_0006b_gestor_unidades_rls.sql` (aplicada), RLS (5 políticas, `tenant_id` comparado como `...::text` con regex UUID para filas propias):
  - `gestor_unidades_plataforma_all` (ALL, `is_platform_admin()`): acceso total.
  - `gestor_unidades_select_empresa` (SELECT, `user_can_use_app('gestor-proyectos')`): `tenant_id IS NULL` (catálogo) **o** propio.
  - `insert/update/delete_empresa`: solo `admin|editor`, solo filas **propias** con `tenant_id` UUID del tenant autenticado.
  - **Implicación directa:** actualizar el catálogo `tenant_id NULL` (las 251 semillas) **requiere contexto plataforma/admin de BD** (p.ej. ejecución SQL con privilegios adecuados en Supabase). Una cuenta empresa no puede escribir `tenant_id NULL`.
- **Consumo app** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/services/gestorOrganizacionService.ts`: mapea `id,tenant_id,parent_unit_id,name,code,unit_type,region,macroregion,address,status,metadata` (y lee de metadata `progress, compliance_status, gestor, start_date, end_date`). **No hay columnas ni mapeo para `lat/lng/observacion`** → si se persisten coords, la opción compatible es **`metadata` (merge)** salvo decisión/DDL explícita aprobada.
- Copias de referencia: `doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/20261114_0005_gestor_unidades_orden_idx.sql`, `20261114_0006b_gestor_unidades_rls.sql`.

## 4. Tareas para el agente (en orden)

### 4.1 Relevar estado vivo (obligatorio, con MCP)
```sql
-- columnas/tipos/defaults
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='gestor_unidades'
order by ordinal_position;

-- conteo, muestra, distribución
select count(*) total,
       count(*) filter (where tenant_id is null) catalogo_null,
       count(*) filter (where tenant_id is not null) con_tenant,
       count(*) filter (where parent_unit_id is not null) con_parent,
       count(*) filter (where orden is not null) con_orden
from public.gestor_unidades;

select id,name,code,unit_type,region,tenant_id,parent_unit_id,orden,status,metadata
from public.gestor_unidades
where id like 'unit-%'
order by id
limit 20;

-- constraints/índices/FKs
select tc.constraint_name, tc.constraint_type, kcu.column_name,
       ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema
left join information_schema.constraint_column_usage ccu on ccu.constraint_name=tc.constraint_name and ccu.table_schema=tc.table_schema
where tc.table_schema='public' and tc.table_name='gestor_unidades'
order by tc.constraint_type, tc.constraint_name;

select indexname, indexdef from pg_indexes where schemaname='public' and tablename='gestor_unidades';

-- políticas RLS vigentes
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename='gestor_unidades'
order by policyname;
```
Confirmar: 251 filas `unit-001..251` con `tenant_id NULL`, columnas `orden` presente, 5 políticas 0006b, y si ya existen `lat/lng`/`parent_unit_id`/`orden` poblados o metadata con coords.

### 4.2 Construir y exponer el mapeo (antes de SQL de escritura)
1. **Fuente canónica:** parsear `mineduUnidades.ts` (251) y extraer `id,name,code,unitType,region,status,lat,lng` efectivos (resolviendo spreads/inline).
2. **Enriquecer coords:** para filas sin coords efectivas, buscar en `ugel-coordinates.ts` por nombre **normalizado** (trim, colapsar espacios, comparar insensible a mayúsculas/tildes y tolerar variantes ` - ` vs espacio/guion según convenga). Prioridad sugerida: `inline en minedu > spread resuelto > match ugel-coordinates`. Registrar por unidad: `match_ok / match_ambiguo / sin_match` + `observacion` + origen. **No inventar ni forzar** coincidencias dudosas.
3. **Jerarquía y orden (propuesta, confirmar con usuario):** por `region`, detectar raíz(es) regional(es) (`unit_type/name` DRE o GRE). Si hay 1 raíz clara, `parent_unit_id` de las demás unidades de la región = raíz, raíz `NULL`; `orden` secuencial estable entre hermanos (p.ej. por `id` numérico o nombre) para todas las de la región. Casos a validar: regiones con GRE como raíz (AREQUIPA 042, LA LIBERTAD 137, LAMBAYEQUE 153) y `RED HUEPETUHE` (185) en MADRE DE DIOS (DRE 184).
4. **`unit_type`:** documentar valores actuales (local/semilla = `dre|ugel`, GRE/RED como `ugel`) y proponer solo cambio si el usuario lo aprueba (ver decisiones).
5. **`metadata` (merge, no destructivo):** conservar claves existentes (p.ej. `gestor, progress, compliance_status, start_date, end_date` u otras presentes en vivo) y **añadir/actualizar** solo claves de ubicación, p.ej. `lat`, `lng`, `geo_observacion`, `coords_source`, `source_catalog` (`mineduUnidades.ts`), sin borrar lo demás. Ejemplo de patrón: `metadata = coalesce(gestor_unidades.metadata,'{}'::jsonb) || $meta_patch::jsonb`.
6. **Entregar al usuario (en chat) antes de aplicar:** resumen de conteos, diff relevante vs vivo (name/code/type/region/status/coords/parent/orden), tabla/lista de no-coincidencias de coords, y decisiones pendientes.

### 4.3 Decisiones que el usuario debe confirmar (“aplica/procede”)
Pedir confirmación explícita de:
- [ ] **Scope:** alinear las 251 del catálogo (`tenant_id NULL`, `unit-001..251`). ¿Alguna otra unidad/tenant?
- [ ] **`unit_type` para `GRE*` y `RED HUEPETUHE`:** (A) mantener `ugel` como hoy/semilla/local, o (B) corregir (¿a qué valor? el tipo debe ser compatible con esquema/app).
- [ ] **`parent_unit_id` y `orden`:** ¿aplicar jerarquía por región (raíz DRE/GRE) y asignar `orden` ahora? ¿excepciones?
- [ ] **Coords en `metadata` (merge) + reporte de no-match:** ¿OK? (no hay columnas `lat/lng`; alternativa requeriría DDL aprobado).
- [ ] **Conflictos con datos vivos:** si una fila difiere, ¿prevalece `mineduUnidades.ts` para `name/code/region/status` (y campos acordados)? ¿se preserva siempre `metadata` ajeno?
- [ ] **Contexto de ejecución:** ejecutar como plataforma/admin (necesario por RLS 0006b para `tenant_id NULL`).

### 4.4 SQL/DML propuesto (plantilla orientativa, ajustar a datos vivos y decisiones)
- Idempotente por `id`. No crear ids nuevos; no tocar `tenant_id` de catálogo.
- Usar `INSERT ... ON CONFLICT (id) DO UPDATE SET ...` o `UPDATE ... FROM (VALUES ...)` limitado a `id IN (...)` y `tenant_id IS NULL` (cinturón de seguridad).
- **No** reemplazar `metadata` completo a ciegas si hay claves vivas: usar merge `coalesce(metadata,'{}') || '<patch>'::jsonb`.
- Actualizar `updated_at = now()`.
- Si se setea jerarquía, respetar FK self (`parent_unit_id` debe existir) y considerar orden de aplicación (raíces primero o en una sola sentencia consistente).
- Ejecutar en una transacción; ante error, `ROLLBACK`.

*Boceto de forma (rellenar con valores reales generados del mapeo aprobado):*
```sql
begin;

-- ejemplo por lotes / VALUES; ajustar columnas según decisiones
update public.gestor_unidades u
set
  name = v.name,
  code = v.code,
  unit_type = v.unit_type,
  region = v.region,
  status = v.status,
  parent_unit_id = v.parent_unit_id, -- si aplica
  orden = v.orden,                   -- si aplica
  metadata = coalesce(u.metadata,'{}'::jsonb) || v.metadata_patch::jsonb,
  updated_at = now()
from (values
  -- ('unit-001'::text, 'DRE AMAZONAS'::text, 'DRE-AMAZONAS'::text, 'dre'::text, 'AMAZONAS'::text, 'active'::text, null::text, 1::int, '{"lat":-6.230733,"lng":-77.873392,"geo_observacion":"EXACTO - OSM city","coords_source":"ugel-coordinates","source_catalog":"mineduUnidades.ts"}'::jsonb)
  -- , ...
) as v(id,name,code,unit_type,region,status,parent_unit_id,orden,metadata_patch)
where u.id = v.id
  and u.tenant_id is null; -- cinturón: solo catálogo nacional

commit;
```
> Generar el SQL final completo (251 filas) a partir del mapeo aprobado y **mostrarlo íntegro o de forma auditable** antes de ejecutar.

### 4.5 Verificación posterior (ejecutar y reportar)
```sql
select count(*) total,
       count(*) filter (where id like 'unit-%') semillas,
       count(*) filter (where tenant_id is null) catalogo_null,
       count(*) filter (where parent_unit_id is not null) con_parent,
       count(*) filter (where orden is not null) con_orden
from public.gestor_unidades;

-- huérfanos de jerarquía
select u.id, u.parent_unit_id from public.gestor_unidades u
left join public.gestor_unidades p on p.id = u.parent_unit_id
where u.parent_unit_id is not null and p.id is null;

-- muestra coords en metadata y jerarquía
select id,name,region,unit_type,parent_unit_id,orden,metadata->>'lat' lat,metadata->>'lng' lng,metadata->>'geo_observacion' obs
from public.gestor_unidades where id like 'unit-%' order by region, orden nulls last, id limit 40;

-- discrepancias puntuales (ej. unit-126)
select id,code,unit_type,parent_unit_id,orden,metadata from public.gestor_unidades where id in ('unit-042','unit-126','unit-137','unit-153','unit-185') order by id;
```
Comparar conteos/distribución contra `mineduUnidades.ts` (251, regiones, GRE/RED) y adjuntar reporte de coords no matcheadas.

### 4.6 Registro documental (tras ejecutar)
- Crear bitácora en `doc2/7-Bitacoras/` (p.ej. `20261118-subida-ubicaciones-gestor-unidades.md`) con: fecha/hora, decisiones confirmadas, SQL/DML aplicado (o referencia), conteos antes/después, diffs, coords no matcheadas, verificaciones e incidencias.
- Actualizar `doc2/0-INDICE-Y-BITACORA.md` con el estado y hallazgos.
- Si se infiere algo sobre RLS real, **no** marcar §6.2 como validada sin evidencia de prueba con identidades reales (`doc2/3-Diseno-de-base-de-datos/3.9-Resolucion-migracion-20261106000000-y-dependencias-hub.md`).

## 5. Riesgos y notas
- **RLS 0006b:** escritura a catálogo `tenant_id NULL` = solo plataforma. Planificar ejecución con rol adecuado.
- **`UNIQUE(code)`:** cualquier cambio de `code` debe mantener unicidad global (251 valores). `unit-126` difiere en tilde vs semilla histórica (`UGEL-CONCEPCIÓN` vs `UGEL-CONCEPCION`) → confirmar prevalencia.
- **No hay `lat/lng` en esquema:** meter en `metadata` (merge) evita DDL; requiere que consumidores futuros lean de metadata si lo necesitan.
- **Matching de coords imperfecto:** `ugel-coordinates.ts` tiene claves no alineadas al 100% con `mineduUnidades.ts`; priorizar trazabilidad (`coords_source`, `geo_observacion`) y reporte de huecos.
- **`ON CONFLICT` de semilla 03** sobreescribe `metadata`; el upsert nuevo debe ser deliberado (merge) para no perder datos.
- **No ejecutar sin “aplica/procede”.** No hacer push/reset/destructivo.

## 6. Fuera de alcance (pospuesto por el usuario)
- Etapa 7 **Fase 2/3** (merge localStorage, `edt_type_cached`, P-3..P-7, cutover app a `gp_*`).
- **6-C “Mis asignaciones”** (alcance C1/C2/C3 pendiente).
- **`3.9` §6.2** validación RLS con identidades reales.
- `peru_departamental_simple.json` como carga tabular a `gestor_unidades`.
