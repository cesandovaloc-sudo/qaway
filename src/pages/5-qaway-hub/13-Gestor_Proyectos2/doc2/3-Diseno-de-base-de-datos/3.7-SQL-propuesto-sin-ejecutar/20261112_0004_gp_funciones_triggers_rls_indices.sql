-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0004
-- Fecha: 2026-11-12 | Funciones, triggers, RLS, índices complementarios
-- SIN DROP/TRUNCATE. SOLO ADITIVO/REEMPLAZO CONTROLADO DE FUNCIONES (CREATE OR REPLACE).
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
  -- fallback: membresía activa en gp_empresa_miembros_r
  SELECT m.empresa_id INTO v
  FROM public.gp_empresa_miembros_r m
  WHERE (m.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.gp_persona_cuentas_r pc
      WHERE pc.persona_id = m.persona_id AND pc.user_id = auth.uid() AND pc.activo = true
    ))
    AND m.estado = 'activo'
  ORDER BY m.es_owner DESC, m.created_at ASC
  LIMIT 1;
  RETURN v;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.gp_is_empresa_member(p_empresa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.gp_is_platform_admin()
  OR EXISTS (
    SELECT 1 FROM public.gp_empresa_miembros_r m
    WHERE m.empresa_id = p_empresa_id
      AND m.estado = 'activo'
      AND (
        m.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.gp_persona_cuentas_r pc
          WHERE pc.persona_id = m.persona_id AND pc.user_id = auth.uid() AND pc.activo = true
        )
      )
  );
$$;

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
    JOIN public.gp_persona_cuentas_r pc ON pc.persona_id = pm.persona_id AND pc.activo = true
    WHERE pm.proyecto_id = p_proyecto_id
      AND pm.estado = 'activo'
      AND pc.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.gp_proyectos p
    WHERE p.id = p_proyecto_id AND public.gp_is_empresa_member(p.empresa_id)
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
DO $$
DECLARE t text;
DECLARE cat_tables text[] := ARRAY[
  'gp_estados_proyecto_c','gp_tipos_proyecto_c','gp_estados_tarea_c','gp_prioridades_c',
  'gp_roles_empresa_c','gp_roles_proyecto_c','gp_ambitos_gobernanza_c','gp_tipos_dependencia_c',
  'gp_tipos_entregable_c','gp_estados_entregable_c','gp_tipos_reunion_c','gp_estados_reunion_c',
  'gp_tipos_unidad_territorial_c','gp_tipos_avance_c','gp_tipos_archivo_c'
];
BEGIN
  FOREACH t IN ARRAY cat_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_select') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', t||'_select', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_write_admin') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (public.gp_is_platform_admin()) WITH CHECK (public.gp_is_platform_admin())', t||'_write_admin', t);
    END IF;
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

-- Tablas relacionales _r y territoriales
DO $$
DECLARE t text;
DECLARE rel_tables text[] := ARRAY[
  'gp_persona_cuentas_r','gp_empresa_miembros_r','gp_proyecto_miembros_r','gp_equipo_miembros_r',
  'gp_edt_responsables_r','gp_tarea_responsables_r','gp_nodo_dependencias_r','gp_tarea_dependencias_r',
  'gp_reunion_participantes_r','gp_proyecto_unidades_r','gp_unidades_territoriales','gp_sedes','gp_corridas_migracion'
];
BEGIN
  FOREACH t IN ARRAY rel_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_select') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id))', t||'_select', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_modify') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id)) WITH CHECK (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id))', t||'_modify', t);
    END IF;
  END LOOP;
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
