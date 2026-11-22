-- 20261122000000_gp_updated_at_triggers.sql
-- Estándar GP de "fecha de modificación" para tablas que quedaron sin trigger.
-- Misma función y nomenclatura que 20261112_0004_gp_funciones_triggers_rls_indices.sql:45-69.
-- users y tenants ya tienen su propio trigger (set_users_updated_at / on_tenant_updated_at)
-- y NO se tocan aquí.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'updated_at'
      AND (
        c.table_name LIKE 'gp_%'
        OR c.table_name IN ('gestor_unidades', 'gestor_proyectos', 'gestor_cronograma_items')
      )
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger t
      JOIN pg_class cl ON cl.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
      WHERE n.nspname = 'public'
        AND cl.relname = r.table_name
        AND t.tgname = 'trg_' || r.table_name || '_updated_at'
        AND NOT t.tgisinternal
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.gp_set_updated_at()',
        'trg_' || r.table_name || '_updated_at',
        r.table_name
      );
    END IF;
  END LOOP;
END $$;

COMMENT ON FUNCTION public.gp_set_updated_at() IS
  'Estándar GP: actualiza NEW.updated_at = now() en toda tabla con columna updated_at.';
