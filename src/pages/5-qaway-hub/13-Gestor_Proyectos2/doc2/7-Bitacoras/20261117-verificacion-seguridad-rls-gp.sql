-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · SCRIPT DE VERIFICACIÓN DE SEGURIDAD / RLS
-- Fecha: 2026-11-17
-- Uso: pegar en Supabase SQL Editor (rol postgres). Solo LECTURA: no modifica datos.
-- Valida: RLS habilitado, políticas por tabla, alias sin NULL, helpers existentes,
--         ausencia de políticas permisivas (qual=true) y de políticas para anon.
-- ==============================================================================

-- 0. Helpers requeridos por el patrón de RLS
SELECT 'helpers' AS seccion, routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('user_can_use_app', 'is_platform_admin', 'gp_is_empresa_member', 'gp_is_project_member')
ORDER BY routine_name;

-- 1. Resumen por tabla gp_*: columnas, filas, políticas, RLS, alias_nulos
SELECT t.tablename AS tabla,
       (SELECT count(*) FROM information_schema.columns c
         WHERE c.table_schema='public' AND c.table_name=t.tablename) AS columnas,
       (SELECT count(*) FROM pg_policies p
         WHERE p.schemaname='public' AND p.tablename=t.tablename) AS politicas,
       c.relrowsecurity AS rls,
       (SELECT count(*) FROM information_schema.columns c2
         WHERE c2.table_schema='public' AND c2.table_name=t.tablename AND c2.column_name='alias') AS tiene_alias
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname='public')
WHERE t.schemaname='public' AND t.tablename LIKE 'gp_%'
ORDER BY t.tablename;

-- 2. Filas por tabla (solo catálogos con seed)
SELECT 'gp_estados_proyecto_c' AS tabla, count(*) AS filas FROM public.gp_estados_proyecto_c
UNION ALL SELECT 'gp_tipos_proyecto_c', count(*) FROM public.gp_tipos_proyecto_c
UNION ALL SELECT 'gp_estados_ejecucion_c', count(*) FROM public.gp_estados_ejecucion_c
UNION ALL SELECT 'gp_prioridades_c', count(*) FROM public.gp_prioridades_c
UNION ALL SELECT 'gp_roles_proyecto_c', count(*) FROM public.gp_roles_proyecto_c
UNION ALL SELECT 'gp_roles_proyecto_v2_c', count(*) FROM public.gp_roles_proyecto_v2_c
UNION ALL SELECT 'gp_tipos_dependencia_c', count(*) FROM public.gp_tipos_dependencia_c
UNION ALL SELECT 'gp_tipos_entregable_c', count(*) FROM public.gp_tipos_entregable_c
UNION ALL SELECT 'gp_categorias_entregable_c', count(*) FROM public.gp_categorias_entregable_c
UNION ALL SELECT 'gp_estados_entregable_c', count(*) FROM public.gp_estados_entregable_c
ORDER BY tabla;

-- 3. Tablas gp_* SIN RLS habilitado (debe devolver 0 filas)
SELECT tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname='public' AND t.tablename LIKE 'gp_%' AND c.relrowsecurity = false;

-- 4. Políticas permisivas: qual = 'true' o with_check = 'true' (lectura/escritura abierta)
--    Debe devolver 0 filas en catálogos simples; si devuelve filas, revisar cuáles.
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename LIKE 'gp_%'
  AND (qual = 'true' OR with_check = 'true');

-- 5. Políticas para rol anon (no debe haber ninguna en tablas gp_*)
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE schemaname='public' AND tablename LIKE 'gp_%'
  AND 'anon' = ANY(roles);

-- 6. Alias NULL en catálogos (debe devolver 0 filas)
SELECT 'gp_estados_proyecto_c' AS tabla, count(*) AS alias_nulos FROM public.gp_estados_proyecto_c WHERE alias IS NULL
UNION ALL SELECT 'gp_tipos_proyecto_c', count(*) FROM public.gp_tipos_proyecto_c WHERE alias IS NULL
UNION ALL SELECT 'gp_estados_ejecucion_c', count(*) FROM public.gp_estados_ejecucion_c WHERE alias IS NULL
UNION ALL SELECT 'gp_prioridades_c', count(*) FROM public.gp_prioridades_c WHERE alias IS NULL
UNION ALL SELECT 'gp_roles_proyecto_c', count(*) FROM public.gp_roles_proyecto_c WHERE alias IS NULL
UNION ALL SELECT 'gp_roles_proyecto_v2_c', count(*) FROM public.gp_roles_proyecto_v2_c WHERE alias IS NULL
UNION ALL SELECT 'gp_tipos_dependencia_c', count(*) FROM public.gp_tipos_dependencia_c WHERE alias IS NULL
UNION ALL SELECT 'gp_tipos_entregable_c', count(*) FROM public.gp_tipos_entregable_c WHERE alias IS NULL
UNION ALL SELECT 'gp_categorias_entregable_c', count(*) FROM public.gp_categorias_entregable_c WHERE alias IS NULL
UNION ALL SELECT 'gp_estados_entregable_c', count(*) FROM public.gp_estados_entregable_c WHERE alias IS NULL;

-- 7. Detalle de políticas por tabla (para auditoría manual)
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename LIKE 'gp_%'
ORDER BY tablename, policyname;

-- 8. Orphan check: tipos entregable sin categoría válida
SELECT count(*) AS huerfanos_tipos_entregable
FROM public.gp_tipos_entregable_c t
LEFT JOIN public.gp_categorias_entregable_c c ON c.codigo = t.categoria_codigo
WHERE t.categoria_codigo IS NOT NULL AND c.codigo IS NULL;

-- 9. Resumen final de salud (una sola fila)
SELECT
  (SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'gp_%') AS tablas_gp,
  (SELECT count(*) FROM pg_tables t JOIN pg_class c ON c.relname=t.tablename WHERE t.schemaname='public' AND t.tablename LIKE 'gp_%' AND c.relrowsecurity=false) AS sin_rls,
  (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename LIKE 'gp_%' AND (qual='true' OR with_check='true')) AS politicas_permisivas,
  (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename LIKE 'gp_%' AND 'anon'=ANY(roles)) AS politicas_anon;
