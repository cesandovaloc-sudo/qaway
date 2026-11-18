-- GESTOR DE PROYECTOS 2 · ETAPA 6.3 · 0010 (aplicada 18-nov-2026)
-- Barrera REAL del ciclo de vida. SECURITY DEFINER, atómicas. SIN DROP/TRUNCATE.
-- Origen: doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/20261115_0010_gp_ciclo_vida_rpc.sql

-- §1 · PRE-CHECKS: abortar SIN CAMBIOS si falta cualquier pieza.
DO $$
DECLARE
  v_faltan text := '';
BEGIN
  IF to_regclass('public.gp_proyectos')           IS NULL THEN v_faltan := v_faltan || ' gp_proyectos'; END IF;
  IF to_regclass('public.gp_estados_proyecto_c')  IS NULL THEN v_faltan := v_faltan || ' gp_estados_proyecto_c'; END IF;
  IF to_regclass('public.gp_roles_proyecto_c')    IS NULL THEN v_faltan := v_faltan || ' gp_roles_proyecto_c'; END IF;
  IF to_regclass('public.gp_personas')            IS NULL THEN v_faltan := v_faltan || ' gp_personas'; END IF;
  IF to_regclass('public.gp_proyecto_miembros_r') IS NULL THEN v_faltan := v_faltan || ' gp_proyecto_miembros_r'; END IF;
  IF to_regclass('public.gp_eventos_auditoria')   IS NULL THEN v_faltan := v_faltan || ' gp_eventos_auditoria'; END IF;
  IF v_faltan <> '' THEN
    RAISE EXCEPTION '0010 §1: faltan tabla(s) del dominio:%. ABORTADO SIN CAMBIOS.', v_faltan;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_personas' AND column_name='user_id') THEN
    v_faltan := v_faltan || ' gp_personas.user_id';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_proyecto_miembros_r' AND column_name='proyecto_id') THEN
    v_faltan := v_faltan || ' gp_proyecto_miembros_r.proyecto_id';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_proyecto_miembros_r' AND column_name='persona_id') THEN
    v_faltan := v_faltan || ' gp_proyecto_miembros_r.persona_id';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_proyecto_miembros_r' AND column_name='rol_proyecto_codigo') THEN
    v_faltan := v_faltan || ' gp_proyecto_miembros_r.rol_proyecto_codigo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_proyecto_miembros_r' AND column_name='estado') THEN
    v_faltan := v_faltan || ' gp_proyecto_miembros_r.estado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_proyectos' AND column_name='estado_codigo') THEN
    v_faltan := v_faltan || ' gp_proyectos.estado_codigo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gp_eventos_auditoria' AND column_name='accion') THEN
    v_faltan := v_faltan || ' gp_eventos_auditoria.accion';
  END IF;
  IF v_faltan <> '' THEN
    RAISE EXCEPTION '0010 §1: columnas requeridas ausentes:%. ABORTADO SIN CAMBIOS.', v_faltan;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gp_is_platform_admin'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION '0010 §1: falta public.gp_is_platform_admin() — ABORTADO SIN CAMBIOS.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_auth_tenant_id'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION '0010 §1: falta public.get_auth_tenant_id() — ABORTADO SIN CAMBIOS.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_app_role'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION '0010 §1: falta public.user_app_role(p_app_slug) — ABORTADO SIN CAMBIOS.';
  END IF;

  RAISE NOTICE '0010 §1: prerrequisitos completos — se crean las funciones.';
END $$;

-- §2 · gp_rol_proyecto_actual — ROL DEL USUARIO EN EL PROYECTO (solo lectura)
CREATE OR REPLACE FUNCTION public.gp_rol_proyecto_actual(p_proyecto_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user    uuid;
  v_tenant  uuid;
  v_empresa uuid;
  v_borrado boolean;
  v_persona uuid;
  v_rol     text;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT empresa_id, is_deleted INTO v_empresa, v_borrado
    FROM public.gp_proyectos
   WHERE id = p_proyecto_id;
  IF NOT FOUND OR v_borrado THEN
    RETURN NULL;
  END IF;

  v_tenant := public.get_auth_tenant_id();
  IF v_tenant IS NULL OR v_tenant <> v_empresa THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_persona
    FROM public.gp_personas
   WHERE user_id = v_user
     AND empresa_id = v_empresa
     AND is_deleted = false
   LIMIT 1;
  IF v_persona IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT rol_proyecto_codigo INTO v_rol
    FROM public.gp_proyecto_miembros_r
   WHERE proyecto_id = p_proyecto_id
     AND persona_id  = v_persona
     AND empresa_id  = v_empresa
     AND estado      = 'activo'
   LIMIT 1;

  RETURN v_rol;
END;
$$;

-- §3 · gp_cambiar_estado_proyecto — ÚNICO CAMINO DE CAMBIO (UPDATE + AUDITORÍA ATÓMICOS)
CREATE OR REPLACE FUNCTION public.gp_cambiar_estado_proyecto(
  p_proyecto_id   uuid,
  p_estado_nuevo  text,
  p_motivo        text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user               uuid;
  v_tenant             uuid;
  v_actual             text;
  v_empresa            uuid;
  v_borrado            boolean;
  v_accion             text;
  v_motivo_obligatorio boolean;
  v_motivo             text;
  v_persona            uuid;
  v_rol                text;
  v_permisos           jsonb;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'PERMISO_INSUFICIENTE: sin sesión activa (auth.uid() NULL). Inicia sesión en Qaway Hub para cambiar el estado del proyecto.';
  END IF;

  SELECT estado_codigo, empresa_id, is_deleted
    INTO v_actual, v_empresa, v_borrado
    FROM public.gp_proyectos
   WHERE id = p_proyecto_id
   FOR UPDATE;
  IF NOT FOUND OR v_borrado THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: proyecto no encontrado o eliminado (gp_proyectos.id = %).', p_proyecto_id;
  END IF;

  v_tenant := public.get_auth_tenant_id();
  IF v_tenant IS NULL OR v_tenant <> v_empresa THEN
    RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el proyecto pertenece a otra empresa (guard de tenant get_auth_tenant_id).';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.gp_estados_proyecto_c
     WHERE codigo = p_estado_nuevo AND activo = true
  ) THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: el estado destino "%" no existe o no está activo en gp_estados_proyecto_c.', p_estado_nuevo;
  END IF;

  IF v_actual IS NULL THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: el proyecto está "Sin clasificar" (estado NULL, B-8): asigna su estado en la migración/cutover antes de acciones de dirección.';
  END IF;

  SELECT t.accion, t.motivo_obligatorio
    INTO v_accion, v_motivo_obligatorio
  FROM (VALUES
    ('planificacion','en_curso',     'iniciar',  false),
    ('en_curso',     'pausado',      'pausar',   false),
    ('pausado',      'en_curso',     'reanudar', false),
    ('en_curso',     'completado',   'completar', true),
    ('pausado',      'completado',   'completar', true),
    ('planificacion','cancelado',    'cancelar',  true),
    ('en_curso',     'cancelado',    'cancelar',  true),
    ('pausado',      'cancelado',    'cancelar',  true),
    ('completado',   'en_curso',     'reabrir',   true),
    ('cancelado',    'planificacion','reabrir',   true)
  ) AS t(estado_origen, estado_destino, accion, motivo_obligatorio)
   WHERE t.estado_origen  = v_actual
     AND t.estado_destino = p_estado_nuevo;

  IF v_accion IS NULL THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: la transición "%" → "%" no es válida según las reglas aprobadas (Etapa 6.3).', v_actual, p_estado_nuevo;
  END IF;

  v_motivo := CASE WHEN p_motivo IS NULL THEN NULL ELSE btrim(p_motivo) END;
  IF v_motivo = '' THEN v_motivo := NULL; END IF;
  IF v_motivo_obligatorio AND v_motivo IS NULL THEN
    RAISE EXCEPTION 'MOTIVO_REQUERIDO: la acción "%" exige un motivo obligatorio (queda registrado en gp_eventos_auditoria).', v_accion;
  END IF;

  IF COALESCE(public.gp_is_platform_admin(), false) OR COALESCE(public.user_app_role('gestor-proyectos'), '') = 'admin' THEN
    v_persona := NULL;
  ELSE
    SELECT id INTO v_persona
      FROM public.gp_personas
     WHERE user_id = v_user
       AND empresa_id = v_empresa
       AND is_deleted = false
     LIMIT 1;
    IF v_persona IS NULL THEN
      RAISE EXCEPTION 'PERMISO_INSUFICIENTE: no estás registrado como persona de esta empresa (gp_personas.user_id) y no tienes rol de plataforma/admin de empresa.';
    END IF;

    SELECT rol_proyecto_codigo INTO v_rol
      FROM public.gp_proyecto_miembros_r
     WHERE proyecto_id = p_proyecto_id
       AND persona_id  = v_persona
       AND empresa_id  = v_empresa
       AND estado      = 'activo'
     LIMIT 1;
    IF v_rol IS NULL THEN
      RAISE EXCEPTION 'PERMISO_INSUFICIENTE: la pertenencia al proyecto NO otorga permisos administrativos (sin rol activo en gp_proyecto_miembros_r).';
    END IF;

    BEGIN
      SELECT permisos INTO v_permisos
        FROM public.gp_roles_proyecto_c
       WHERE codigo = v_rol AND activo = true;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el rol "%" no existe o está inactivo en gp_roles_proyecto_c — aplica el seed 20261115_0008.', v_rol;
      END IF;
    EXCEPTION
      WHEN undefined_column THEN
        RAISE EXCEPTION 'PERMISO_INSUFICIENTE: gp_roles_proyecto_c no tiene la columna permisos — aplica 20261115_0008.';
    END;

    IF COALESCE(v_permisos ->> v_accion, 'false') <> 'true' THEN
      RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el rol "%" no permite la acción "%" (gp_roles_proyecto_c.permisos).', v_rol, v_accion;
    END IF;
  END IF;

  UPDATE public.gp_proyectos
     SET estado_codigo = p_estado_nuevo,
         updated_at    = now()
   WHERE id = p_proyecto_id;

  INSERT INTO public.gp_eventos_auditoria
    (empresa_id, proyecto_id, entidad, entidad_id, accion,
     payload_antes, payload_despues, actor_user_id, actor_persona_id, origen)
  VALUES
    (v_empresa,
     p_proyecto_id,
     'gp_proyectos',
     p_proyecto_id,
     'STATE_CHANGE',
     jsonb_build_object('estado_codigo', v_actual),
     jsonb_build_object('estado_codigo', p_estado_nuevo, 'accion', v_accion, 'motivo', v_motivo),
     v_user,
     v_persona,
     'app');

  RETURN jsonb_build_object(
    'proyecto_id',      p_proyecto_id,
    'estado_anterior',  v_actual,
    'estado_nuevo',     p_estado_nuevo,
    'accion',           v_accion,
    'motivo',           v_motivo
  );
END;
$$;

-- §4 · PERMISOS DE EJECUCIÓN (fail-closed: solo authenticated; nunca anon)
REVOKE ALL ON FUNCTION public.gp_rol_proyecto_actual(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gp_rol_proyecto_actual(uuid) FROM anon;
GRANT  EXECUTE ON FUNCTION public.gp_rol_proyecto_actual(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) TO authenticated;
