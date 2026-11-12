# Modelo Relacional v2 · Gestor de Proyectos 2 (ETAPA 2 — propuesta)

> **Estado:** documento de diseño previo a migraciones.  
> **Alcance:** define nomenclatura, entidades, claves, relaciones, RLS y estrategia de migración versionada para la persistencia canónica de la EDT/WBS y sus artefactos asociados.  
> **Restricciones explícitas:** no ejecutar `DROP`, no eliminar tablas existentes, no retirar `localStorage` como respaldo/compatibilidad hasta que la nueva persistencia esté implementada, migrada y verificada.

## 1. Principios

1. **Fuente única de verdad:** la clasificación EDT se deriva por reglas canónicas del dominio (`resolveEdtNodeType` / motor WBS único). La persistencia almacena atributos fuente; no duplica reglas de clasificación en múltiples tablas.
2. **Identidad estable:** todas las entidades de negocio usan `id uuid` como clave primaria.
3. **Trazabilidad completa:** toda fila de negocio relevante conserva autoría y marcas temporales (`created_at`, `updated_at`, `created_by`, `updated_by`) y, cuando aplique, referencia al proyecto y a la migración/origen.
4. **Compatibilidad progresiva:** `kind` de dominio (`hito | subproceso`) se mantiene hasta la migración que lo sustituya; los valores heredados de EDT (`FASE`, `SUBCOMPONENTE`, `SUBPROCESO`) solo existen en capa de normalización de lectura, nunca como valores funcionales nuevos.
5. **Sin destructividad:** tablas/columnas legadas se conservan hasta respaldo, migración de datos y verificación de dependencias.

## 2. Taxonomía canónica (EDT)

Tipos vigentes (única enumeración funcional):

| Tipo | Nivel / rol | Derivación |
|---|---|---|
| `COMPONENTE` | Nivel 1 (raíz del alcance) | Siempre que `parent_id IS NULL`, incluso sin hijos |
| `PRODUCTO` | Agrupador intermedio | Nodo no raíz con hijos, no declarado entregable |
| `ENTREGABLE` | Agrupador declarado | Nodo no raíz con hijos con `is_entregable = true` (único atributo no derivable) |
| `PAQUETE_TRABAJO` | Hoja ejecutable | Nodo sin hijos (no raíz) que no es hito |
| `HITO` | Evento (duración cero) | Nodo sin hijos, no raíz, con `start_date = end_date` o marcado como hito de dominio |

> **Regla:** `is_entregable` es el único indicador persistido que altera la clasificación derivada (PRODUCTO → ENTREGABLE). El tipo EDT efectivo se recalcula en lectura/servicio; no debe existir una segunda “verdad” manual de nivel.

## 3. Entidades y nomenclatura (propuesta)

### 3.1 `gp_projects` (proyecto)
- `id uuid primary key default gen_random_uuid()`
- `code text not null` (código visible, único por organización/contexto)
- `name text not null`
- `description text`
- `status text not null default 'active'`
- `start_date date`, `end_date date`
- `owner_id uuid` (FK a identidad/usuario según esquema auth vigente)
- `organization_id uuid` (si aplica multitenencia)
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `created_by uuid`, `updated_by uuid`

### 3.2 `gp_wbs_nodes` (nodo EDT/WBS — entidad central)
- `id uuid primary key default gen_random_uuid()`
- `project_id uuid not null references gp_projects(id)`
- `parent_id uuid references gp_wbs_nodes(id)` (null = raíz/COMPONENTE)
- `wbs_code text` (código WBS decimal, ej. `1.`, `1.1`, `1.7.1`; único dentro del proyecto cuando no nulo)
- `name text not null`
- `description text`
- `kind text not null check (kind in ('hito','subproceso'))` — **dominio vigente; se mantiene hasta migración v2 del dominio**
- `is_entregable boolean not null default false` — único atributo declarable que afecta clasificación (ENTREGABLE)
- `fase_id text` (FK/referencia a catálogo de fases si se materializa; nullable)
- `status text` (vocabulario oficial: Completado, En curso, En proceso, Pendiente, Con retraso, Cumple)
- `progress numeric(5,2)` (0–100; en contenedores puede ser calculado/derivado por servicio)
- `start_date date`, `end_date date`
- `actual_end_date date`
- `gestor text` / `responsible_id uuid` (según modelo de responsables definitivo)
- `region text`, `distrito text`, `sede text` (campos territoriales; evaluar normalización a tablas de referencia en iteración posterior)
- `sort_order integer` (orden estable dentro del padre, complemento de `wbs_code`)
- `legacy_source_id text` (trazabilidad desde ids/keys heredadas: localStorage, semillas antiguas)
- `metadata jsonb not null default '{}'::jsonb` (extensión controlada)
- `is_deleted boolean not null default false` (borrado lógico, si se requiere auditoría)
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `created_by uuid`, `updated_by uuid`

**Índices sugeridos:** `(project_id)`, `(project_id, parent_id)`, `(project_id, wbs_code)`, `(project_id, sort_order)`.

> **Nota:** el `edt_type` efectivo (COMPONENTE/PRODUCTO/ENTREGABLE/PAQUETE_TRABAJO/HITO) es **derivado** por el motor canónico a partir de estructura (`parent_id`, existencia de hijos), fechas (hito) e `is_entregable`. Si se persiste una columna `edt_type_cached`, debe tratarse como caché regenerable, nunca como fuente de verdad manual.

### 3.3 `gp_wbs_dependencies` (dependencias entre nodos)
- `id uuid primary key default gen_random_uuid()`
- `project_id uuid not null references gp_projects(id)`
- `predecessor_id uuid not null references gp_wbs_nodes(id)`
- `successor_id uuid not null references gp_wbs_nodes(id)`
- `dependency_type text not null default 'FS'` (FS/SS/FF/SF)
- `lag_days integer not null default 0`
- `created_at timestamptz not null default now()`
- Restricción: evitar autodependencia y duplicados `(project_id, predecessor_id, successor_id, dependency_type)`.

### 3.4 `gp_wbs_deliverables` (entregables verificables asociados)
- `id uuid primary key default gen_random_uuid()`
- `node_id uuid not null references gp_wbs_nodes(id)`
- `name text not null`
- `deliverable_type text`, `format text`
- `status text`
- `url text`, `notes text`
- `sort_order integer`
- `created_at timestamptz`, `updated_at timestamptz`

### 3.5 `gp_wbs_baselines` / `gp_wbs_baseline_nodes` (líneas base, opcional por fase)
- Baseline: `id uuid`, `project_id uuid`, `name`, `frozen_at timestamptz`, `created_by`.
- Snapshot por nodo: fechas/avance/estado congelados para comparación de desviación.

## 4. RLS (Row Level Security) — lineamientos

- Habilitar RLS en todas las tablas `gp_*`.
- Políticas basadas en pertenencia/autorización al `project_id` (y `organization_id` si aplica), usando el sujeto autenticado (`auth.uid()` en Supabase o mecanismo equivalente vigente).
- Separar permisos por operación: `select`, `insert`, `update`, `delete` (preferir borrado lógico donde haya trazabilidad).
- Restringir `insert/update` para que `project_id`/`parent_id` pertenezcan al mismo proyecto autorizado.
- Validar en políticas o constraints que dependencias y jerarquías no crucen proyectos.

## 5. Migraciones versionadas

- Usar migraciones secuenciales e idempotentes donde sea posible (`YYYYMMDDHHMMSS_descripcion.sql` o convención del repositorio).
- **Fase 1 (aditiva):** crear tablas/índices/constraints/RLS nuevas sin tocar las existentes.
- **Fase 2 (backfill):** scripts de migración de datos desde fuente legada/localStorage/export, conservando `legacy_source_id` y registro de ejecución.
- **Fase 3 (cutover):** redirigir lecturas/escrituras del servicio a `gp_*`; mantener compatibilidad de lectura legada temporal y feature flag si aplica.
- **Fase 4 (retiro diferido):** solo tras verificación y respaldo, planificar retiro de estructuras legadas; **ningún `DROP` en ETAPA 2**.
- Cada migración debe incluir verificación (conteos, integridad FK, huérfanos, códigos WBS únicos) y rollback documentado.

## 6. Trazabilidad y auditoría

- `created_at/updated_at/created_by/updated_by` en entidades mutables.
- `legacy_source_id` y/o tabla `gp_migration_runs` (`id`, `migration_key`, `started_at`, `finished_at`, `status`, `rows_read`, `rows_written`, `notes`) para auditar backfills.
- Registro de eventos relevantes (cambios de estado, reprogramaciones, congelación de baseline) en `gp_wbs_events` si se requiere historial fino.

## 7. Relación con el estado actual (ETAPA 1)

- La UI y los motores de las 4 vistas ya consumen una **clasificación EDT centralizada** (`cronograma-core/edtPmbokModel.ts` + `cronograma-core/wbsHierarchy.ts`).
- `localStorage` permanece como mecanismo vigente de respaldo/estado local hasta que esta persistencia v2 esté definida, implementada y verificada (no retirar antes).
- `kind` (`hito | subproceso`) permanece en dominio/BD hasta la migración que lo evolucione coherentemente con el modelo v2.

## 8. Criterios de aceptación para iniciar implementación (ETAPA 3+)

- [ ] Revisión y aprobación de este modelo (nombres finales, multitenencia, modelo de usuarios/responsables).
- [ ] Definición de mapeo campo-a-campo desde estructuras actuales/legadas a `gp_*`.
- [ ] Scripts de migración aditiva + backfill en entorno de prueba con verificación.
- [ ] Plan de cutover y compatibilidad de lectura sin pérdida de datos.
- [ ] Autorización explícita para cualquier retiro de estructuras legadas (sin `DROP` implícito).
