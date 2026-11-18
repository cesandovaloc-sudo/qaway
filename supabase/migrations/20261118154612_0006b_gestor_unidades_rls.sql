-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0006b (aplicada 18-nov-2026)
-- RLS DEFINITIVA de public.gestor_unidades. SIN DDL de tabla, SIN datos. Re-ejecutable.
-- Origen: doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/20261114_0006b_gestor_unidades_rls.sql
-- Requiere: 0006a (slug en app_catalog, ya vivo) + 0005 + suscripción activa y rol admin (D-7).
DO $$
DECLARE v_tipo text; v_pol record;
BEGIN
  IF to_regclass('public.gestor_unidades') IS NULL THEN
    RAISE EXCEPTION '0006b: public.gestor_unidades no existe. Migración abortada SIN cambios.';
  END IF;
  SELECT data_type INTO v_tipo
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'gestor_unidades'
     AND column_name = 'tenant_id';
  IF v_tipo IS NULL THEN
    RAISE EXCEPTION '0006b: gestor_unidades sin columna tenant_id. Migración abortada SIN cambios.';
  ELSIF v_tipo <> 'text' THEN
    RAISE EXCEPTION '0006b: se esperaba tenant_id TEXT y es % (no se cambia el tipo). Migración abortada SIN cambios.', v_tipo;
  END IF;
  IF to_regprocedure('public.get_auth_tenant_id()') IS NULL
     OR to_regprocedure('public.user_can_use_app(text)') IS NULL
     OR to_regprocedure('public.user_app_role(text)') IS NULL
     OR to_regprocedure('public.is_platform_admin()') IS NULL THEN
    RAISE EXCEPTION '0006b: faltan helpers del Hub. Migración abortada SIN cambios.';
  END IF;
  FOR v_pol IN
    SELECT policyname, cmd FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'gestor_unidades'
  LOOP
    RAISE NOTICE '0006b · política previa detectada (se retira o reemplaza): % (%)', v_pol.policyname, v_pol.cmd;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Permitir todo en gestor_unidades" ON public.gestor_unidades;

DROP POLICY IF EXISTS "gestor_unidades_plataforma_all" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_plataforma_all"
  ON public.gestor_unidades FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "gestor_unidades_select_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_select_empresa"
  ON public.gestor_unidades FOR SELECT TO authenticated
  USING (
    public.user_can_use_app('gestor-proyectos')
    AND ( tenant_id IS NULL OR (
        tenant_id = public.get_auth_tenant_id()::text
        AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    ) )
  );

DROP POLICY IF EXISTS "gestor_unidades_insert_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_insert_empresa"
  ON public.gestor_unidades FOR INSERT TO authenticated
  WITH CHECK (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  );

DROP POLICY IF EXISTS "gestor_unidades_update_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_update_empresa"
  ON public.gestor_unidades FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    AND public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
  )
  WITH CHECK (
    tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    AND public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "gestor_unidades_delete_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_delete_empresa"
  ON public.gestor_unidades FOR DELETE TO authenticated
  USING (
    tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    AND public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
  );

DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'gestor_unidades';
  RAISE NOTICE '0006b aplicado · políticas vigentes en gestor_unidades: % (esperadas: 5)', v_n;
END $$;
