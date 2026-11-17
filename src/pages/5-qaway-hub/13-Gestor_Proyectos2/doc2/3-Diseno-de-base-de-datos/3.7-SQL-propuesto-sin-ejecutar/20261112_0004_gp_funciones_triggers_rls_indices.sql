-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0004
-- Fecha: 2026-11-12 | Funciones, triggers, RLS, índices complementarios
-- SIN DROP/TRUNCATE. SOLO ADITIVO/REEMPLAZO CONTROLADO DE FUNCIONES (CREATE OR REPLACE).
-- ==============================================================================
-- v2 (2026-11-13, auditoría final · hallazgos C-1/C-2):
--   · C-1 (CRÍTICO): gp_auth_empresa_id / gp_is_empresa_member / gp_is_project_member
--     consultaban gp_empresa_miembros_r y gp_persona_cuentas_r, tablas ELIMINADAS por
--     0003 (membresía la gobierna public.user_app_roles; la cuenta vive en
--     gp_personas.user_id). El CREATE FUNCTION abortaba al validar referencias.
--     Reescritas: user_app_roles + gp_proyecto_miembros_r + gp_personas.user_id.
--   · C-2 (CRÍTICO): rel_tables incluía 4 tablas inexistentes (gp_persona_cuentas_r,
--     gp_empresa_miembros_r, gp_unidades_territoriales, gp_sedes) → CREATE POLICY
--     abortaba. Se retiran del array + guardia to_regclass. gp_corridas_migracion
--     (sin columna empresa_id) recibe bloque de políticas dedicado.
-- v3 (2026-11-14, Etapa 4 · correcciones FUNCIONALES, no solo de texto):
--   · F1 (CRÍTICO): public.user_app_roles usa tenant_id, NO empresa_id
--     (verificado en 20260921130000:39-48: user_id, tenant_id, app_id, role).
--     La v2 habría abortado al crear gp_is_empresa_member (LANGUAGE sql valida
--     columnas en creación) y degradado gp_auth_empresa_id a NULL en runtime.
--   · F2: la membresía de empresa exige rol de ESTA app (join app_catalog,
--     slug 'gestor-proyectos') + user_can_use_app (suscripción active/trialing
--     o legacy abierto). Un rol de OTRA app (p. ej. crm) ya no abre datos gp_*,
--     ni una suscripción expirada.
--   · F3: gp_is_project_member pierde la rama OR que trataba a CUALQUIER
--     miembro de la empresa del proyecto como miembro del proyecto (bypass).
--     La lectura de empresa completa se decide en las POLICIES con
--     gp_is_empresa_member(empresa_id); el helper "project member" queda
--     estricto: gp_proyecto_miembros_r activo + gp_personas.user_id.
-- ==============================================================================

-- ---------------------------
-- Función genérica updated_at
-- ---------------------------
CREATE OR REPLACE FUNCTION public.gp_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger updated_at a tablas con columna updated_at (idempotente vía DO)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name LIKE 'gp_%'
      AND c.column_name = 'updated_at'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class cl ON cl.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
      WHERE t.tgname = ('trg_' || r.table_name || '_updated_at')
        AND cl.relname = r.table_name
        AND n.nspname = 'public'
        AND NOT t.tgisinternal
    ) THEN
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.gp_set_updated_at()',
        'trg_' || r.table_name || '_updated_at', r.table_name);
    END IF;
  END LOOP;
END $$;

-- ---------------------------
-- Helpers de gobernanza/RLS
-- ---------------------------
-- Admin plataforma (reutiliza public.is_admin() si existe; fallback false)
CREATE OR REPLACE FUNCTION public.gp_is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NOT NULL THEN
    RETURN public.is_admin();
  END IF;
  RETURN false;
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$;

-- Empresa/tenant del usuario autenticado (reutiliza get_auth_tenant_id si existe)
-- (C-1) SIN gp_empresa_miembros_r / gp_persona_cuentas_r (eliminadas por 0003):
--   fuente = get_auth_tenant_id() si existe; fallback public.user_app_roles
--   (F1: columnas verificadas user_id/tenant_id/app_id/role; F2: solo filas de
--   'gestor-proyectos' — un rol de otra app no define empresa para gp_*).
CREATE OR REPLACE FUNCTION public.gp_auth_empresa_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v uuid;
BEGIN
  IF to_regprocedure('public.get_auth_tenant_id()') IS NOT NULL THEN
    v := public.get_auth_tenant_id();
    IF v IS NOT NULL THEN RETURN v; END IF;
  END IF;
  -- fallback: empresa del usuario autenticado CON rol de esta app
  SELECT r.tenant_id INTO v
  FROM public.user_app_roles r
  JOIN public.app_catalog a ON a.id = r.app_id
  WHERE r.user_id = auth.uid()
    AND a.slug = 'gestor-proyectos'
  ORDER BY r.tenant_id
  LIMIT 1;
  RETURN v;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- (C-1/F2) Miembro de empresa: rol en user_app_roles (columna tenant_id) para
-- la app 'gestor-proyectos' + gate comercial user_can_use_app (suscripción
-- active/trialing vigente o legacy abierto). Plataforma siempre pasa.
CREATE OR REPLACE FUNCTION public.gp_is_empresa_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.gp_is_platform_admin()
  OR (
    EXISTS (
      SELECT 1 FROM public.user_app_roles r
      JOIN public.app_catalog a ON a.id = r.app_id
      WHERE r.user_id = auth.uid()
        AND r.tenant_id = p_tenant_id
        AND a.slug = 'gestor-proyectos'
    )
    AND public.user_can_use_app('gestor-proyectos')
  );
$$;

-- (C-1/F3) Miembro de proyecto: gp_proyecto_miembros_r (rol DENTRO del proyecto,
-- 0003) + gp_personas.user_id (cuenta de la persona; empresa alineada a pm).
-- F3: SIN rama "miembro de la empresa ⇒ miembro de cualquier proyecto de la
-- empresa" (bypass retirado). La lectura amplia de empresa la dan las POLICIES
-- con gp_is_empresa_member(empresa_id), no este helper.
CREATE OR REPLACE FUNCTION public.gp_is_project_member(p_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.gp_is_platform_admin()
  OR EXISTS (
    SELECT 1
    FROM public.gp_proyecto_miembros_r pm
    JOIN public.gp_personas pe ON pe.id = pm.persona_id
    WHERE pm.proyecto_id = p_proyecto_id
      AND pm.estado = 'activo'
      AND pe.user_id = auth.uid()
      AND pe.empresa_id = pm.empresa_id
  );
$$;

-- ---------------------------
-- Habilitar RLS en todas las tablas gp_*
-- ---------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'gp_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ---------------------------
-- Políticas base (patrón: admin plataforma OR miembro empresa/proyecto)
-- Nota: se crean solo si no existen; políticas nombradas de forma estable.
-- ---------------------------

-- Catálogos _c: lectura para autenticados/miembros, escritura admin plataforma (ajustable)
-- (v2 2026-11-13) El array conservaba 3 catálogos ELIMINADOS por 3.6 §2.1
-- (gp_roles_empresa_c, gp_ambitos_gobernanza_c, gp_tipos_unidad_territorial_c);
-- 0001 no los crea y CREATE POLICY fallaría sobre tablas inexistentes.
-- Se añade guardia to_regclass: solo se politizan catálogos que existan.
-- (v2.1 2026-11-14) gp_estados_tarea_c → gp_estados_ejecucion_c (catálogo
-- unificado de estados de ejecución tareas + nodos EDT; ya creado en el proyecto).
-- (v3 2026-11-16) PATRÓN ADOPTADO = el que está VIVO y auditado en Supabase:
--   · _select  → user_can_use_app('gestor-proyectos')  (lectura solo con la app)
--   · _insert / _update / _delete → is_platform_admin() (escritura solo plataforma)
--   Esto sustituye al par anterior (_select USING(true) + _write_admin), que habría
--   AMPLIADO la lectura a cualquier rol autenticado (USING true) y duplicado
--   políticas ya existentes (PERMISSIVE = OR). Regla nueva: si la tabla YA tiene
--   políticas, el bucle NO la toca (se omite con aviso).
DO $$
DECLARE t text; v_sel text; v_adm text;
DECLARE cat_tables text[] := ARRAY[
  'gp_estados_proyecto_c','gp_tipos_proyecto_c','gp_estados_ejecucion_c','gp_prioridades_c',
  'gp_roles_empresa_c','gp_roles_proyecto_c','gp_ambitos_gobernanza_c','gp_tipos_dependencia_c',
  'gp_tipos_entregable_c','gp_estados_entregable_c','gp_tipos_reunion_c','gp_estados_reunion_c',
  'gp_tipos_unidad_territorial_c','gp_tipos_avance_c','gp_tipos_archivo_c'
];
BEGIN
  v_sel := CASE WHEN to_regprocedure('public.user_can_use_app(text)') IS NOT NULL
                THEN 'public.user_can_use_app(''gestor-proyectos'')'
                ELSE 'public.gp_is_platform_admin()' END;
  v_adm := CASE WHEN to_regprocedure('public.is_platform_admin()') IS NOT NULL
                THEN 'public.is_platform_admin()'
                ELSE 'public.gp_is_platform_admin()' END;
  FOREACH t IN ARRAY cat_tables LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      CONTINUE; -- catálogo no creado (eliminado por 3.6 §2.1): omitir sin fallar
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t) THEN
      RAISE NOTICE '0004: % ya tiene políticas propias — se omite (no se duplica ni se amplía)', t;
      CONTINUE; -- RLS vivo manda: no se crea un segundo juego de políticas
    END IF;
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (%s)', t||'_select', t, v_sel);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (%s)', t||'_insert', t, v_adm);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (%s) WITH CHECK (%s)', t||'_update', t, v_adm, v_adm);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (%s)', t||'_delete', t, v_adm);
  END LOOP;
END $$;

-- gp_proyectos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gp_proyectos' AND policyname='gp_proyectos_select') THEN
    CREATE POLICY gp_proyectos_select ON public.gp_proyectos FOR SELECT
      USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id) OR public.gp_is_project_member(id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gp_proyectos' AND policyname='gp_proyectos_insert') THEN
    CREATE POLICY gp_proyectos_insert ON public.gp_proyectos FOR INSERT
      WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gp_proyectos' AND policyname='gp_proyectos_update') THEN
    CREATE POLICY gp_proyectos_update ON public.gp_proyectos FOR UPDATE
      USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
      WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
  END IF;
END $$;

-- Tablas con empresa_id/proyecto_id (patrón genérico por tabla clave)
-- gp_personas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gp_personas' AND policyname='gp_personas_select') THEN
    CREATE POLICY gp_personas_select ON public.gp_personas FOR SELECT
      USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gp_personas' AND policyname='gp_personas_modify') THEN
    CREATE POLICY gp_personas_modify ON public.gp_personas FOR ALL
      USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
      WITH CHECK (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));
  END IF;
END $$;

-- Helper macro: aplicar políticas estándar a tablas (empresa_id, proyecto_id)
-- gp_fases, gp_nodos_edt, gp_tareas, gp_equipos, gp_entregables, gp_lineas_base, gp_linea_base_nodos, gp_avances, gp_archivos, gp_reuniones, gp_eventos_auditoria
DO $$
DECLARE t text;
DECLARE proj_tables text[] := ARRAY[
  'gp_fases','gp_nodos_edt','gp_tareas','gp_equipos','gp_entregables',
  'gp_lineas_base','gp_linea_base_nodos','gp_avances','gp_archivos','gp_reuniones','gp_eventos_auditoria'
];
BEGIN
  FOREACH t IN ARRAY proj_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_select') THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id) OR (CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns c WHERE c.table_schema=''public'' AND c.table_name=%L AND c.column_name=''proyecto_id'') THEN public.gp_is_project_member(proyecto_id) ELSE false END))',
        t||'_select', t, t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_modify') THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id)) WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))',
        t||'_modify', t);
    END IF;
  END LOOP;
END $$;

-- Tablas relacionales _r
-- (C-2) Se retiran del array: gp_persona_cuentas_r y gp_empresa_miembros_r
-- (ELIMINADAS por 0003), gp_unidades_territoriales y gp_sedes (NO se crean: la
-- territorialidad vive en public.gestor_unidades, 3.6 §2.2) y gp_corridas_migracion
-- (sin columna empresa_id: bloque de políticas dedicado más abajo). Se añade
-- guardia to_regclass: CREATE POLICY no se intenta sobre tablas inexistentes.
DO $$
DECLARE t text;
DECLARE rel_tables text[] := ARRAY[
  'gp_proyecto_miembros_r','gp_equipo_miembros_r',
  'gp_edt_responsables_r','gp_tarea_responsables_r','gp_nodo_dependencias_r','gp_tarea_dependencias_r',
  'gp_reunion_participantes_r','gp_proyecto_unidades_r'
];
BEGIN
  FOREACH t IN ARRAY rel_tables LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      CONTINUE; -- tabla no creada: omitir sin fallar (robustez ante cambios futuros)
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_select') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id))', t||'_select', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_modify') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id)) WITH CHECK (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id))', t||'_modify', t);
    END IF;
  END LOOP;
END $$;

-- gp_corridas_migracion (C-2): metadata de migración SIN columna empresa_id, por lo
-- que el patrón genérico (empresa_id IS NULL OR ...) no le aplica. Lectura para
-- autenticados (historial de corridas visible); modificación solo admin plataforma.
-- El backfill 0100 ejecuta con service_role (bypassa RLS).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_corridas_migracion' AND policyname='gp_corridas_migracion_select') THEN
    CREATE POLICY gp_corridas_migracion_select ON public.gp_corridas_migracion FOR SELECT
      USING (auth.uid() IS NOT NULL OR public.gp_is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_corridas_migracion' AND policyname='gp_corridas_migracion_modify') THEN
    CREATE POLICY gp_corridas_migracion_modify ON public.gp_corridas_migracion FOR ALL
      USING (public.gp_is_platform_admin())
      WITH CHECK (public.gp_is_platform_admin());
  END IF;
END $$;

-- Índices complementarios de crecimiento/consultas
CREATE INDEX IF NOT EXISTS idx_gp_entregables_empresa ON public.gp_entregables (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_lineas_base_empresa ON public.gp_lineas_base (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_archivos_empresa ON public.gp_archivos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_reuniones_empresa ON public.gp_reuniones (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_eventos_auditoria_actor ON public.gp_eventos_auditoria (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_estado ON public.gp_nodos_edt (estado);
CREATE INDEX IF NOT EXISTS idx_gp_tareas_fase ON public.gp_tareas (fase_id);

-- Comentarios de trazabilidad de convención
COMMENT ON SCHEMA public IS 'Esquema público; tablas gp_* pertenecen a Gestor de Proyectos 2 (v2). Convención: sin sufijo=entidad principal/operativa, _c=catálogo, _r=relacional.';
