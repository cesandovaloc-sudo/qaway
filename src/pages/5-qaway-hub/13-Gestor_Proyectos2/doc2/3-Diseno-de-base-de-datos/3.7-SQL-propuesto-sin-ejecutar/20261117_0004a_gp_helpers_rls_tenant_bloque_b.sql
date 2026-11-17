-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · PROPUESTA 0004a — Helpers tenant + RLS tenant-scoped
-- (adelanto del bloque RLS de entidades de 0004, aplicado a las tablas 13–18)
-- Fecha: 2026-11-17 | Estado: PROPUESTO — espera la palabra "aplica" del responsable
-- ==============================================================================
-- Modelo declarado por el responsable (17-nov):
--   · Admin de plataforma: acceso a TODO.
--   · Tenant: ve SOLO los datos de su empresa, crea usuarios de su tenant,
--     crea nuevos proyectos, personas, tareas, equipos y demás (escritura del
--     tenant dentro de su empresa).
--
-- FUENTES (nada inventado):
--   · Helpers: 0004 líneas 75–145 VERBATIM
--     (3.7-SQL-propuesto-sin-ejecutar/20261112_0004_gp_funciones_triggers_rls_indices.sql)
--   · Expresiones de políticas: patrón de 0004 líneas 234–286 (gp_proyectos,
--     gp_personas, bucle genérico proj_tables), adaptado a la convención de
--     nombres de las tablas 1–9 (_select/_insert/_update/_delete, 4 por tabla,
--     TO authenticated, anon sin política) para mantener el script de
--     verificación §0–§9 y las pruebas idénticas.
--
-- PRERREQUISITOS VERIFICADOS EN VIVO (17-nov):
--   is_admin() ✅ · get_auth_tenant_id() ✅ · is_platform_admin() ✅ ·
--   user_can_use_app ✅ · user_app_roles(user_id,tenant_id,app_id,role) ✅
--   (en vivo hoy: 1 fila, role='admin', app 'gestor-proyectos')
--
-- SECUENCIA (documentada, sin ambigüedad):
--   · gp_is_project_member NO se crea aquí: referencia gp_proyecto_miembros_r
--     (tabla 27 del 0003, aún no creada) y CREATE FUNCTION abortaría al validar
--     (mismo mecanismo del hallazgo C-1 de 0004). Llega con 0004 completo tras
--     0003; la rama OR gp_is_project_member(...) de las _select se añade
--     ENTONCES como ajuste explícito (tracker PASO 4).
--   · Cuando 0004 se aplique completo (tras 0003), estos helpers se
--     re-crearán idénticos (CREATE OR REPLACE) → sin conflicto.
--
-- VARIANTE A (abajo): cualquier usuario registrado del tenant escribe su empresa
--   (diseño verbatim de 0004). VARIANTE B: solo roles admin|editor escriben
--   (ÚNICO cambio: filtro r.role IN ('admin','editor') en gp_is_empresa_member;
--   ver bloque alternativo al final). ELEGIR UNA — el resto del paquete es idéntico.
-- ==============================================================================


-- ##############################################################################
-- #######                        VARIANTE A (0004 verbatim)            #########
-- ##############################################################################

-- ---------------------------
-- 1 · Helpers verbatim de 0004
-- ---------------------------

-- gp_is_platform_admin (0004 líneas 75–90, verbatim): reutiliza is_admin()
-- si existe; fallback false (fail-closed).
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

-- gp_auth_empresa_id (0004 líneas 97–122, verbatim): tenant del usuario
-- autenticado (get_auth_tenant_id si existe; fallback user_app_roles de la app).
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

-- gp_is_empresa_member (0004 líneas 127–145, VERBATIM — Variante A):
-- plataforma pasa; si no, rol en user_app_roles para ESTE tenant + app
-- 'gestor-proyectos' + gate comercial user_can_use_app. CUALQUIER rol
-- registrado cuenta (el filtro fino lo hace el Hub al decidir a quién registra).
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

-- ---------------------------
-- 2 · RLS (idempotente; ya estaba habilitado)
-- ---------------------------
ALTER TABLE public.gp_proyectos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gp_personas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gp_fases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gp_nodos_edt   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gp_tareas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gp_equipos     ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- 3 · Políticas de las 6 entidades
-- Mismos nombres (convención 1–9) y conteo (4 por tabla). Expresiones de 0004.
-- Los DROP reemplazan la versión de catálogo creada el 17-nov (mismo nombre).
-- ---------------------------

-- gp_proyectos (empresa_id NOT NULL)
-- 0004 trae select/insert/update; NO trae delete para proyectos: el borrado de
-- un proyecto es LÓGICO (is_deleted) y el hard delete queda solo en plataforma
-- (se conserva la expresión is_platform_admin() ya en vigor).
DROP POLICY IF EXISTS gp_proyectos_select ON public.gp_proyectos;
CREATE POLICY gp_proyectos_select ON public.gp_proyectos
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
  -- Nota: 0004 añade OR public.gp_is_project_member(id) — se incorpora tras 0003.
DROP POLICY IF EXISTS gp_proyectos_insert ON public.gp_proyectos;
CREATE POLICY gp_proyectos_insert ON public.gp_proyectos
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_proyectos_update ON public.gp_proyectos;
CREATE POLICY gp_proyectos_update ON public.gp_proyectos
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_proyectos_delete ON public.gp_proyectos;
CREATE POLICY gp_proyectos_delete ON public.gp_proyectos
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- gp_personas (0004: _select + _modify FOR ALL; expresión con rama
-- empresa_id IS NULL — es NOT NULL aquí, rama inofensiva, se mantiene verbatim)
DROP POLICY IF EXISTS gp_personas_select ON public.gp_personas;
CREATE POLICY gp_personas_select ON public.gp_personas
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_personas_insert ON public.gp_personas;
CREATE POLICY gp_personas_insert ON public.gp_personas
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_personas_update ON public.gp_personas;
CREATE POLICY gp_personas_update ON public.gp_personas
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_personas_delete ON public.gp_personas;
CREATE POLICY gp_personas_delete ON public.gp_personas
  FOR DELETE TO authenticated
  USING (public.gp_is_platform_admin() OR empresa_id IS NULL OR public.gp_is_empresa_member(empresa_id));

-- gp_fases / gp_nodos_edt / gp_tareas / gp_equipos
-- (patrón genérico proj_tables de 0004; empresa_id NULL-able: filas con
-- empresa_id NULL solo las ve la plataforma; la rama project_member se añade tras 0003)

DROP POLICY IF EXISTS gp_fases_select ON public.gp_fases;
CREATE POLICY gp_fases_select ON public.gp_fases
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_fases_insert ON public.gp_fases;
CREATE POLICY gp_fases_insert ON public.gp_fases
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_fases_update ON public.gp_fases;
CREATE POLICY gp_fases_update ON public.gp_fases
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_fases_delete ON public.gp_fases;
CREATE POLICY gp_fases_delete ON public.gp_fases
  FOR DELETE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));

DROP POLICY IF EXISTS gp_nodos_edt_select ON public.gp_nodos_edt;
CREATE POLICY gp_nodos_edt_select ON public.gp_nodos_edt
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_nodos_edt_insert ON public.gp_nodos_edt;
CREATE POLICY gp_nodos_edt_insert ON public.gp_nodos_edt
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_nodos_edt_update ON public.gp_nodos_edt;
CREATE POLICY gp_nodos_edt_update ON public.gp_nodos_edt
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_nodos_edt_delete ON public.gp_nodos_edt;
CREATE POLICY gp_nodos_edt_delete ON public.gp_nodos_edt
  FOR DELETE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));

DROP POLICY IF EXISTS gp_tareas_select ON public.gp_tareas;
CREATE POLICY gp_tareas_select ON public.gp_tareas
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_tareas_insert ON public.gp_tareas;
CREATE POLICY gp_tareas_insert ON public.gp_tareas
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_tareas_update ON public.gp_tareas;
CREATE POLICY gp_tareas_update ON public.gp_tareas
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_tareas_delete ON public.gp_tareas;
CREATE POLICY gp_tareas_delete ON public.gp_tareas
  FOR DELETE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));

DROP POLICY IF EXISTS gp_equipos_select ON public.gp_equipos;
CREATE POLICY gp_equipos_select ON public.gp_equipos
  FOR SELECT TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_equipos_insert ON public.gp_equipos;
CREATE POLICY gp_equipos_insert ON public.gp_equipos
  FOR INSERT TO authenticated
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_equipos_update ON public.gp_equipos;
CREATE POLICY gp_equipos_update ON public.gp_equipos
  FOR UPDATE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id))
  WITH CHECK (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));
DROP POLICY IF EXISTS gp_equipos_delete ON public.gp_equipos;
CREATE POLICY gp_equipos_delete ON public.gp_equipos
  FOR DELETE TO authenticated
  USING (public.gp_is_platform_admin() OR public.gp_is_empresa_member(empresa_id));


-- ##############################################################################
-- #######               VARIANTE B (solo admin|editor escriben)        #########
-- ##############################################################################
-- Si el responsable elige B: se aplica el paquete completo de arriba PERO
-- sustituyendo SOLO gp_is_empresa_member por esta versión (único cambio:
-- el filtro de rol). Los valores del vocabulario son los que el Hub use al
-- registrar usuarios en user_app_roles (en vivo hoy solo existe 'admin';
-- 'editor' queda propuesto — si el vocabulario real es otro, se ajusta la lista):
--
-- CREATE OR REPLACE FUNCTION public.gp_is_empresa_member(p_tenant_id uuid)
-- RETURNS boolean
-- LANGUAGE sql
-- STABLE
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT public.gp_is_platform_admin()
--   OR (
--     EXISTS (
--       SELECT 1 FROM public.user_app_roles r
--       JOIN public.app_catalog a ON a.id = r.app_id
--       WHERE r.user_id = auth.uid()
--         AND r.tenant_id = p_tenant_id
--         AND a.slug = 'gestor-proyectos'
--         AND r.role IN ('admin','editor')   -- ← ÚNICO cambio vs Variante A
--     )
--     AND public.user_can_use_app('gestor-proyectos')
--   );
-- $$;
--
-- Efecto de B: los usuarios registrados con rol 'viewer' (u otros no listados)
-- solo LEEN los datos de su empresa; no pueden crear ni editar. Los de rol
-- admin/editor pueden escribir dentro de su empresa. La LECTURA aislada por
-- empresa es idéntica en A y B.
-- ##############################################################################
