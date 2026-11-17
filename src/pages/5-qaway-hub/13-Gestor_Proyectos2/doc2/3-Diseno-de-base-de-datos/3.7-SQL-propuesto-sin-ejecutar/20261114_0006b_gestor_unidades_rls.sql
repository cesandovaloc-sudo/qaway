-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0006b
-- Archivo: 20261114_0006b_gestor_unidades_rls.sql
-- Fecha: 2026-11-14 | RLS DEFINITIVA de public.gestor_unidades
-- SIN DDL de tabla, SIN datos, SIN drop de columnas/índices. Solo políticas.
-- Re-ejecutable (drop policy if exists + create). Orden de aplicación:
--   0006a (registro en app_catalog) → 0005 (columna orden) → 0006b (esta).
-- ==============================================================================
-- Modelo VIVO verificado (Etapa 3/4; fuente: supabase/03_gestor_unidades.sql del
-- módulo, ya aplicado):
--   gestor_unidades ( id text primary key,            -- NUNCA convertir a uuid
--                     tenant_id text NULL,            -- TEXT: ver cast abajo
--                     parent_unit_id text → gestor_unidades(id),
--                     name text not null, code text not null,
--                     unit_type text, region, macroregion, address,
--                     status text, metadata jsonb,
--                     created_at/updated_at timestamptz )
--   uq_gestor_unidades_code UNIQUE (code) GLOBAL (se MANTIENE en esta etapa).
--   251 semillas DRE/UGEL/GRE: ids 'unit-001'..'unit-251', tenant_id NULL.
--
-- ARQUITECTURA DEL HUB (obligatoria; sin mecanismos paralelos):
--   identidad = auth.users · empresa activa = get_auth_tenant_id()
--     (20260919153000:20-28, SECURITY DEFINER, returns uuid)
--   acceso a la app = user_can_use_app('gestor-proyectos')
--     (20260921134000: v2 — rol propio en user_app_roles para el tenant activo
--      y suscripción 'active'/'trialing' vigente, o is_platform_admin())
--   rol de app = user_app_role('gestor-proyectos') (admin|editor|viewer|guest)
--   plataforma = is_platform_admin() (20260921133000:18-29)
--
-- CAST SEGURO (requisito Etapa 4): gestor_unidades.tenant_id es TEXT y
-- users.tenant_id es UUID. En TODAS las políticas la comparación es
--   tenant_id = public.get_auth_tenant_id()::text
-- dirección uuid→text: NUNCA puede fallar el cast. Queda PROHIBIDO lo inverso
-- (text→uuid) porque las filas legacy pueden contener basura no-uuid.
-- La regex uuid adicional blinda que las filas de EMPRESA lleven un uuid real
-- (evita emparejar basura histórica) y blinda INSERT/UPDATE con tenant basura.
--
-- MATRIZ DE ACCESO implementada (RLS = garantía final, independiente del front):
--   LECTURA: plataforma → TODO · empresa autorizada → lo PROPIO + catálogo
--     nacional (tenant NULL, solo lectura compartida) · nada cross-tenant.
--   ESCRITURA: plataforma → TODO (incluidas las 251 y otras empresas) ·
--     empresa con rol admin|editor → SOLO filas propias (INSERT exige tenant
--     propio: imposible crear 'sin tenant') · viewer/guest → nada.
--   INVARIANTES: ninguna operación de empresa puede (a) tocar las 251
--     (tenant NULL no matchea el USING/WITH CHECK de empresa), (b) cambiar una
--     unidad a tenant_id NULL, ni (c) trasladarla a otra empresa
--     (el WITH CHECK de UPDATE lo bloquea).
--   SOLAPAMIENTOS: la ÚNICA política amplia es la de plataforma. Las de
--     empresa son por operación y restrictivas; Postgres combina políticas
--     PERMISSIVE con OR, pero ninguna de empresa amplía a otra empresa ni
--     da escritura a viewer/guest. No re-agregar políticas permisivas.
--
-- NOTA: la coherencia jerárquica (no colgar unidad de empresa bajo una semilla
-- de otra empresa/catálogo) la aplica el servicio del módulo
-- (organizacionEscritura.exigirPadreDelTenant). Un CHECK en RLS que consultara
-- la misma tabla causaría recursión de políticas (error de Postgres) y queda
-- fuera de esta migración por diseño.
--
-- Alcance EXCLUIDO (etapas futuras): gestor_unidad_miembros, gp_personas,
-- gp_roles_proyecto_c, tablas gp_* (sus políticas van en 0004 v3), ReactFlow,
-- plantillas, y CUALQUIER cambio de tipo de columnas.
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- 0) Guardias previas: aborta SIN cambios si el entorno no es el esperado.
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_tipo text; v_pol record;
BEGIN
  IF to_regclass('public.gestor_unidades') IS NULL THEN
    RAISE EXCEPTION
      '0006b: public.gestor_unidades no existe. Aplica supabase/03_gestor_unidades.sql del módulo antes. Migración abortada SIN cambios.';
  END IF;
  SELECT data_type INTO v_tipo
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'gestor_unidades'
     AND column_name = 'tenant_id';
  IF v_tipo IS NULL THEN
    RAISE EXCEPTION
      '0006b: gestor_unidades sin columna tenant_id. Migración abortada SIN cambios.';
  ELSIF v_tipo <> 'text' THEN
    RAISE EXCEPTION
      '0006b: se esperaba gestor_unidades.tenant_id de tipo TEXT y es % (no se cambia el tipo en esta etapa). Migración abortada SIN cambios.', v_tipo;
  END IF;
  IF to_regprocedure('public.get_auth_tenant_id()') IS NULL
     OR to_regprocedure('public.user_can_use_app(text)') IS NULL
     OR to_regprocedure('public.user_app_role(text)') IS NULL
     OR to_regprocedure('public.is_platform_admin()') IS NULL THEN
    RAISE EXCEPTION
      '0006b: faltan helpers del Hub (get_auth_tenant_id / user_can_use_app / user_app_role / is_platform_admin). Aplica las migraciones del Hub 20260919153000/20260921130000/20260921133000/20260921134000 antes. Migración abortada SIN cambios.';
  END IF;
  FOR v_pol IN
    SELECT policyname, cmd FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'gestor_unidades'
  LOOP
    RAISE NOTICE '0006b · política previa detectada (se retira o reemplaza): % (%)', v_pol.policyname, v_pol.cmd;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 1) Retirar la política permisiva vigente (único drop: if exists, nombrada).
--    Requisito explícito de Etapa 4: eliminar "Permitir todo".
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir todo en gestor_unidades" ON public.gestor_unidades;

-- ---------------------------------------------------------------------------
-- 2) Plataforma: TODO sobre TODAS las filas (única política amplia).
--    (Los scripts de administración con service_role no usan JWT y bypassean
--    RLS a nivel de rol; esta política gobierna a usuarios autenticados.)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "gestor_unidades_plataforma_all" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_plataforma_all"
  ON public.gestor_unidades
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- 3) Lectura de empresa: lo PROPIO + catálogo nacional (tenant NULL).
--    · Exige acceso a la app (rol + suscripción: user_can_use_app).
--    · Nada de otras empresas; basura no-uuid en tenant_id solo visible a plataforma.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "gestor_unidades_select_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_select_empresa"
  ON public.gestor_unidades
  FOR SELECT
  TO authenticated
  USING (
    public.user_can_use_app('gestor-proyectos')
    AND (
      tenant_id IS NULL
      OR (
        tenant_id = public.get_auth_tenant_id()::text
        AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 4) Insert de empresa: rol admin|editor + tenant PROPIO OBLIGATORIO.
--    (Imposible crear unidades 'sin tenant' desde una cuenta de empresa;
--    las filas con tenant NULL solo puede crearlas la plataforma.)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "gestor_unidades_insert_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_insert_empresa"
  ON public.gestor_unidades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
    AND tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  );

-- ---------------------------------------------------------------------------
-- 5) Update de empresa: USING acota filas propias (excluye las 251 con tenant
--    NULL); WITH CHECK prohíbe mover la unidad a NULL o a otra empresa.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "gestor_unidades_update_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_update_empresa"
  ON public.gestor_unidades
  FOR UPDATE
  TO authenticated
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

-- ---------------------------------------------------------------------------
-- 6) Delete de empresa: SOLO filas propias, rol admin|editor. Las 251
--    (tenant NULL) jamás matchean → intocables desde cuentas de empresa.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "gestor_unidades_delete_empresa" ON public.gestor_unidades;
CREATE POLICY "gestor_unidades_delete_empresa"
  ON public.gestor_unidades
  FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_auth_tenant_id()::text
    AND tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    AND public.user_can_use_app('gestor-proyectos')
    AND public.user_app_role('gestor-proyectos') IN ('admin', 'editor')
  );

-- ---------------------------------------------------------------------------
-- 7) Cierre informativo (no modifica nada).
-- ---------------------------------------------------------------------------
DO $$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'gestor_unidades';
  RAISE NOTICE '0006b aplicado · políticas vigentes en gestor_unidades: % (esperadas: 5)', v_n;
END $$;

-- ==============================================================================
-- VERIFICACIÓN POSTERIOR (ejecutar tras aplicar):
--   SELECT policyname, cmd, roles, qual, with_check
--     FROM pg_policies
--    WHERE schemaname='public' AND tablename='gestor_unidades'
--    ORDER BY policyname;
--   → 5 políticas: gestor_unidades_plataforma_all (ALL),
--     gestor_unidades_select_empresa (SELECT),
--     gestor_unidades_insert_empresa (INSERT),
--     gestor_unidades_update_empresa (UPDATE),
--     gestor_unidades_delete_empresa (DELETE). La permisiva ya NO aparece.
--   SELECT count(*) FROM public.gestor_unidades
--    WHERE id LIKE 'unit-%' AND tenant_id IS NULL;  → 251 (intacto).
--
-- Pruebas de RLS con IDENTIDADES REALES: procedimiento manual en
-- doc2/3-Diseno-de-base-de-datos/3.9 (§4). NO está automatizado aquí y NO se
-- declara validado hasta ejecutarlo contra Supabase.
-- ==============================================================================
