-- gp_tareas: garantiza que la migración única del storage legado
-- (localStorage['qaway-tasks-v1']) sea idempotente por tenant.
-- Aplica el 2026-11-19 al proyecto qrusdsqgygfolxfrafyd.
create unique index if not exists uq_gp_tareas_empresa_legacy
  on public.gp_tareas (empresa_id, legacy_source_id)
  where legacy_source_id is not null and is_deleted = false;
