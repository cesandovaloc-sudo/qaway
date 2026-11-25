-- ============================================================================
-- Gestor de Proyectos 2 · Blindaje RLS de Permisos Especiales (LLAVES_V1)
-- ============================================================================
-- Fuente única en BD alineada con src/services/gpPermisosService.ts:
--   · Plataforma (is_platform_admin()) -> todo permitido.
--   · Tenant admin (user_app_roles.role = 'admin') -> todo permitido en su tenant.
--   · editor / operativo -> solo si tiene la llave curable en user_app_roles.permissions.
--   · visor / viewer / guest / sin rol -> denegado.
--
-- Usa políticas RESTRICTIVE para exigir la llave especial SIN alterar ni
-- debilitar las políticas permisivas de aislamiento por tenant ya existentes.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.gp_has_permission(p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_platform_admin()
    OR (
      public.user_can_use_app('gestor-proyectos')
      AND EXISTS (
        SELECT 1
        FROM public.user_app_roles uar
        JOIN public.app_catalog ac ON ac.id = uar.app_id
        WHERE uar.user_id = auth.uid()
          AND ac.slug = 'gestor-proyectos'
          AND (
            uar.role = 'admin'
            OR (
              uar.role IN ('editor', 'operativo')
              AND (
                (jsonb_typeof(uar.permissions) = 'object' AND COALESCE((uar.permissions ->> p_key)::boolean, false))
                OR (jsonb_typeof(uar.permissions) = 'array' AND uar.permissions ? p_key)
              )
            )
          )
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.gp_has_permission(text) TO authenticated;

DO $$
BEGIN
  IF to_regclass('public.gestor_cronograma_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS "gp_cronograma_insert_edt_key" ON public.gestor_cronograma_items;
    CREATE POLICY "gp_cronograma_insert_edt_key"
      ON public.gestor_cronograma_items AS RESTRICTIVE
      FOR INSERT TO authenticated
      WITH CHECK (public.gp_has_permission('gp.administrar_edt'));

    DROP POLICY IF EXISTS "gp_cronograma_delete_edt_key" ON public.gestor_cronograma_items;
    CREATE POLICY "gp_cronograma_delete_edt_key"
      ON public.gestor_cronograma_items AS RESTRICTIVE
      FOR DELETE TO authenticated
      USING (public.gp_has_permission('gp.administrar_edt'));
  END IF;

  IF to_regclass('public.gestor_proyectos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "gp_proyectos_insert_key" ON public.gestor_proyectos;
    CREATE POLICY "gp_proyectos_insert_key"
      ON public.gestor_proyectos AS RESTRICTIVE
      FOR INSERT TO authenticated
      WITH CHECK (public.gp_has_permission('gp.crear_proyecto'));

    DROP POLICY IF EXISTS "gp_proyectos_update_key" ON public.gestor_proyectos;
    CREATE POLICY "gp_proyectos_update_key"
      ON public.gestor_proyectos AS RESTRICTIVE
      FOR UPDATE TO authenticated
      USING (public.gp_has_permission('gp.editar_proyecto'))
      WITH CHECK (public.gp_has_permission('gp.editar_proyecto'));

    DROP POLICY IF EXISTS "gp_proyectos_delete_key" ON public.gestor_proyectos;
    CREATE POLICY "gp_proyectos_delete_key"
      ON public.gestor_proyectos AS RESTRICTIVE
      FOR DELETE TO authenticated
      USING (public.gp_has_permission('gp.eliminar_proyecto'));
  END IF;
END $$;
