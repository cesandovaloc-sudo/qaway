-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · ETAPA 6.3 · SQL PROPUESTO — SIN EJECUTAR
-- Archivo: 20261115_0010_gp_ciclo_vida_rpc.sql
-- Fecha: 2026-11-15 | Barrera REAL del ciclo de vida (servidor, no React)
-- Crea DOS funciones SECURITY DEFINER (transaccionales por definición en PG:
--   toda la ejecución de cada función es UNA transacción — si RAISE aborta,
--   NO queda nada a medias ⇒ imposibilidad estructural de cambios parciales):
--   1) gp_rol_proyecto_actual(p_proyecto_id uuid) → text
--      Rol del usuario en el proyecto (gp_proyecto_miembros_r activo) para la
--      UI (fail-closed: NULL ⇒ solo consulta). SOLO LECTURA.
--   2) gp_cambiar_estado_proyecto(p_proyecto_id uuid, p_estado_nuevo text,
--      p_motivo text DEFAULT NULL) → jsonb
--      ÚNICO camino de cambio de estado: valida sesión, tenant, destino activo,
--      transición aprobada (mapa VALUES), motivo obligatorio y autorización
--      (plataforma → admin de empresa → rol del proyecto con
--      gp_roles_proyecto_c.permisos jsonb). Hace UPDATE + auditoría en la MISMA
--      transacción (gp_eventos_auditoria, accion='STATE_CHANGE').
-- ==============================================================================
-- POR QUÉ UNA RPC (decisión aprobada 6.2/6.3):
--   · El frontend NO es la seguridad: ocultar botones en React solo refleja
--     permisos; aquí se re-valida TODO del lado del servidor (incluso una
--     llamada forjada con PostgREST respetará las reglas).
--   · UPDATE y auditoría deben ser atómicos (requisito 6.3 §2 Paso 2): una
--     función PL/pgSQL lo garantiza sin tablas auxiliares ni jobs.
--   · El frontend (gpCicloVidaService.cambiarEstadoCicloVida) llama EXACTAMENTE
--     esta firma: { p_proyecto_id, p_estado_nuevo, p_motivo } y mapea los
--     mensajes PERMISO_INSUFICIENTE / TRANSICION_INVALIDA / MOTIVO_REQUERIDO.
--   · La RPC devuelve PERMISO_INSUFICIENTE con instrucción de aplicar 0008 si
--     falta la columna `permisos` (discrepancia 9↔10) o el seed de roles.
-- ORDEN DE APLICACIÓN: cadena base 0006a → 0005 → 0006b → 0004 (necesaria:
--   gp_is_platform_admin y RLS del dominio) y → 0008 → 0009 → 0010 (este).
-- SIN DROP/TRUNCATE. IDEMPOTENTE (CREATE OR REPLACE + guardias).
-- ==============================================================================

-- ==============================================================================
-- §1 · PRE-CHECKS: abortar SIN CAMBIOS si falta cualquier pieza (no se inventan
--      tablas ni columnas). Fallar aquí es claro; fallar en runtime es críptico.
-- ==============================================================================
DO $$
DECLARE
  v_faltan text := '';
BEGIN
  -- Tablas requeridas (todas del dominio gp_* ya diseñadas, no nuevas).
  IF to_regclass('public.gp_proyectos')           IS NULL THEN v_faltan := v_faltan || ' gp_proyectos'; END IF;
  IF to_regclass('public.gp_estados_proyecto_c')  IS NULL THEN v_faltan := v_faltan || ' gp_estados_proyecto_c'; END IF;
  IF to_regclass('public.gp_roles_proyecto_c')    IS NULL THEN v_faltan := v_faltan || ' gp_roles_proyecto_c'; END IF;
  IF to_regclass('public.gp_personas')            IS NULL THEN v_faltan := v_faltan || ' gp_personas'; END IF;
  IF to_regclass('public.gp_proyecto_miembros_r') IS NULL THEN v_faltan := v_faltan || ' gp_proyecto_miembros_r'; END IF;
  IF to_regclass('public.gp_eventos_auditoria')   IS NULL THEN v_faltan := v_faltan || ' gp_eventos_auditoria'; END IF;
  IF v_faltan <> '' THEN
    RAISE EXCEPTION
      '0010 §1: faltan tabla(s) del dominio:%. Aplicar primero la cadena base (0006a → 0005 → 0006b → 0004) y 0003. ABORTADO SIN CAMBIOS.', v_faltan;
  END IF;

  -- Columnas usadas por las funciones (las críticas; `permisos` se tolera
  -- ausente y se degrada a PERMISO_INSUFICIENTE con instrucción 0008).
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
    RAISE EXCEPTION
      '0010 §1: columnas requeridas ausentes:%. Contrastar con 0002/0003 antes de actuar. ABORTADO SIN CAMBIOS.', v_faltan;
  END IF;

  -- Helpers de autorización (Hub 20260919153000 / 20260921130000 y dominio 0004).
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gp_is_platform_admin'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION
      '0010 §1: falta public.gp_is_platform_admin() — aplicar 0004 (Paso 4) ANTES. ABORTADO SIN CAMBIOS.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_auth_tenant_id'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION
      '0010 §1: falta public.get_auth_tenant_id() (helper del Hub) — aplicar su migración (20260919153000) ANTES. ABORTADO SIN CAMBIOS.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_app_role'
    AND pronamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION
      '0010 §1: falta public.user_app_role(p_app_slug) (helper del Hub) — aplicar su migración (20260921130000) ANTES. ABORTADO SIN CAMBIOS.';
  END IF;

  RAISE NOTICE '0010 §1: prerrequisitos completos — se crean las funciones.';
END $$;

-- ==============================================================================
-- §2 · gp_rol_proyecto_actual — ROL DEL USUARIO EN EL PROYECTO (solo lectura)
-- ==============================================================================
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
    RETURN NULL; -- sin sesión: fail-closed (la UI muestra "sin sesión/consulta")
  END IF;

  SELECT empresa_id, is_deleted INTO v_empresa, v_borrado
    FROM public.gp_proyectos
   WHERE id = p_proyecto_id;
  IF NOT FOUND OR v_borrado THEN
    RETURN NULL; -- proyecto inexistente/eliminado: sin rol (no revela existencia)
  END IF;

  -- Guard de tenant: el usuario debe pertenecer a la EMPRESA del proyecto.
  v_tenant := public.get_auth_tenant_id();
  IF v_tenant IS NULL OR v_tenant <> v_empresa THEN
    RETURN NULL;
  END IF;

  -- Persona del usuario en esa empresa (gp_personas.user_id, 0002 L86/L108).
  SELECT id INTO v_persona
    FROM public.gp_personas
   WHERE user_id = v_user
     AND empresa_id = v_empresa
     AND is_deleted = false
   LIMIT 1;
  IF v_persona IS NULL THEN
    RETURN NULL;
  END IF;

  -- Membresía ACTIVA del proyecto (0003 L216-232).
  SELECT rol_proyecto_codigo INTO v_rol
    FROM public.gp_proyecto_miembros_r
   WHERE proyecto_id = p_proyecto_id
     AND persona_id  = v_persona
     AND empresa_id  = v_empresa
     AND estado      = 'activo'
   LIMIT 1;

  RETURN v_rol; -- NULL ⇒ sin rol ⇒ la UI deriva "solo consulta" (fail-closed)
END;
$$;

-- ==============================================================================
-- §3 · gp_cambiar_estado_proyecto — ÚNICO CAMINO DE CAMBIO (UPDATE + AUDITORÍA
--      ATÓMICOS). Espejo exacto del núcleo de gpCicloVidaService (validarAccion).
-- ==============================================================================
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
  -- 1) Sesión obligatoria (fail-closed).
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'PERMISO_INSUFICIENTE: sin sesión activa (auth.uid() NULL). Inicia sesión en Qaway Hub para cambiar el estado del proyecto.';
  END IF;

  -- 2) Proyecto EXISTENTE + bloqueo de fila (FOR UPDATE) hasta el fin de la fn.
  SELECT estado_codigo, empresa_id, is_deleted
    INTO v_actual, v_empresa, v_borrado
    FROM public.gp_proyectos
   WHERE id = p_proyecto_id
   FOR UPDATE;
  IF NOT FOUND OR v_borrado THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: proyecto no encontrado o eliminado (gp_proyectos.id = %).', p_proyecto_id;
  END IF;

  -- 3) Guard de tenant.
  v_tenant := public.get_auth_tenant_id();
  IF v_tenant IS NULL OR v_tenant <> v_empresa THEN
    RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el proyecto pertenece a otra empresa (guard de tenant get_auth_tenant_id).';
  END IF;

  -- 4) Destino activo en el catálogo (gp_estados_proyecto_c — 0004 deja RLS
  --    select para todos; aquí es servidor, sin RLS: validación explícita).
  IF NOT EXISTS (
    SELECT 1 FROM public.gp_estados_proyecto_c
     WHERE codigo = p_estado_nuevo AND activo = true
  ) THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: el estado destino "%" no existe o no está activo en gp_estados_proyecto_c.', p_estado_nuevo;
  END IF;

  -- 5) Estado actual NULL ⇒ "Sin clasificar" (B-8): NO transiciona.
  IF v_actual IS NULL THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: el proyecto está "Sin clasificar" (estado NULL, B-8): asigna su estado en la migración/cutover antes de acciones de dirección.';
  END IF;

  -- 6) Transición aprobada (mapa EXACTO de la Etapa 6.3, igual a
  --    TRANSICIONES_VALIDAS del servicio). Sin match ⇒ inválida (incluye
  --    destino = origen, que nunca está listado).
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
    ('completado',   'en_curso',     'reabrir',   true),  -- reapertura → en_curso
    ('cancelado',    'planificacion','reabrir',   true)   -- reapertura → planificacion
  ) AS t(estado_origen, estado_destino, accion, motivo_obligatorio)
   WHERE t.estado_origen  = v_actual
     AND t.estado_destino = p_estado_nuevo;

  IF v_accion IS NULL THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: la transición "%" → "%" no es válida según las reglas aprobadas (Etapa 6.3).', v_actual, p_estado_nuevo;
  END IF;

  -- 7) Motivo obligatorio para completar / cancelar / reabrir.
  v_motivo := CASE WHEN p_motivo IS NULL THEN NULL ELSE btrim(p_motivo) END;
  IF v_motivo = '' THEN v_motivo := NULL; END IF;
  IF v_motivo_obligatorio AND v_motivo IS NULL THEN
    RAISE EXCEPTION 'MOTIVO_REQUERIDO: la acción "%" exige un motivo obligatorio (queda registrado en gp_eventos_auditoria).', v_accion;
  END IF;

  -- 8) AUTORIZACIÓN (fail-closed, sin confiar en la UI):
  --    a) plataforma (gp_is_platform_admin, 0004) ⇒ todas;
  --    b) admin de la app en el Hub (user_app_role('gestor-proyectos')='admin') ⇒ todas;
  --    c) resto: SOLO con rol ACTIVO del proyecto cuyo permiso de la acción esté
  --       a 'true' en gp_roles_proyecto_c.permisos. Pertenecer NO es permiso.
  IF COALESCE(public.gp_is_platform_admin(), false) OR COALESCE(public.user_app_role('gestor-proyectos'), '') = 'admin' THEN
    v_persona := NULL; -- la auditoría registra actor_user_id (admin sin persona)
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

    -- `permisos` jsonb (0001 L87). Si la columna falta en vivo (discrepancia
    -- 9↔10) o el seed 0008 no está aplicado ⇒ error EXPLICÍTO, nunca falso OK.
    BEGIN
      SELECT permisos INTO v_permisos
        FROM public.gp_roles_proyecto_c
       WHERE codigo = v_rol AND activo = true;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el rol "%" no existe o está inactivo en gp_roles_proyecto_c — aplica el seed 20261115_0008.', v_rol;
      END IF;
    EXCEPTION
      WHEN undefined_column THEN
        RAISE EXCEPTION 'PERMISO_INSUFICIENTE: gp_roles_proyecto_c no tiene la columna permisos (discrepancia 9↔10 columnas) — aplica 20261115_0008.';
    END;

    IF COALESCE(v_permisos ->> v_accion, 'false') <> 'true' THEN
      RAISE EXCEPTION 'PERMISO_INSUFICIENTE: el rol "%" no permite la acción "%" (gp_roles_proyecto_c.permisos).', v_rol, v_accion;
    END IF;
  END IF;

  -- 9) UPDATE del estado (fila YA bloqueada con FOR UPDATE desde el paso 2).
  UPDATE public.gp_proyectos
     SET estado_codigo = p_estado_nuevo,
         updated_at    = now()
   WHERE id = p_proyecto_id;

  -- 10) AUDITORÍA en la MISMA transacción (0003 L172-186): STATE_CHANGE con
  --     motivo en payload_despues (contrato leído por listarHistorialEstado).
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

  -- 11) Resultado contractual (el frontend mapea estos campos en su modelo local).
  RETURN jsonb_build_object(
    'proyecto_id',      p_proyecto_id,
    'estado_anterior',  v_actual,
    'estado_nuevo',     p_estado_nuevo,
    'accion',           v_accion,
    'motivo',           v_motivo
  );
END;
$$;

-- ==============================================================================
-- §4 · PERMISOS DE EJECUCIÓN (fail-closed: solo usuarios autenticados; nunca anon)
-- ==============================================================================
REVOKE ALL ON FUNCTION public.gp_rol_proyecto_actual(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gp_rol_proyecto_actual(uuid) FROM anon;
GRANT  EXECUTE ON FUNCTION public.gp_rol_proyecto_actual(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION public.gp_cambiar_estado_proyecto(uuid, text, text) TO authenticated;

-- ==============================================================================
-- §5 · POST-VERIFICACIONES (ejecutar y contrastar; conservar salida en bitácora)
-- ==============================================================================
-- a) Funciones creadas con security definer (esperado: 2 filas, procsecdef='t')
-- select proname, pronargs, procsecdef, provolatile
--   from pg_proc
--  where pronamespace = 'public'::regnamespace
--    and proname in ('gp_rol_proyecto_actual','gp_cambiar_estado_proyecto');
--
-- b) Sin sesión anónima ⇒ NULL/PERMISO (probar desde un cliente sin JWT)
-- select public.gp_rol_proyecto_actual('00000000-0000-0000-0000-000000000000'::uuid);
-- select public.gp_cambiar_estado_proyecto(
--          '00000000-0000-0000-0000-000000000000'::uuid, 'en_curso', null);
--
-- c) Con sesión REAL y proyecto real (probar por rol):
--    · gerente/administrador: iniciar desde planificacion → ok (200 + evento)
--    · jefe/gestor: cancelar → PERMISO_INSUFICIENTE (no cancela ni reabre)
--    · coordinador/lector: iniciar → PERMISO_INSUFICIENTE (solo consulta)
--    · completar/cancelar/reabrir sin motivo → MOTIVO_REQUERIDO
--    · pausado → iniciar → TRANSICION_INVALIDA
-- select public.gp_cambiar_estado_proyecto('<proyecto_id>'::uuid, 'en_curso', null);
--
-- d) Auditoría escrita (esperado: 1 fila STATE_CHANGE por cambio real)
-- select ocurrido_at, entidad, accion, payload_antes, payload_despues,
--        actor_user_id, origen
--   from public.gp_eventos_auditoria
--  where entidad = 'gp_proyectos' and accion = 'STATE_CHANGE'
--  order by ocurrido_at desc limit 5;
--
-- e) Atomicidad: ante cualquier excepción NO debe quedar UPDATE sin evento
--    (ni evento sin UPDATE). Contrastar estados vs eventos:
-- select p.id, p.estado_codigo,
--        (select count(*) from public.gp_eventos_auditoria e
--          where e.proyecto_id = p.id and e.accion = 'STATE_CHANGE') as eventos
--   from public.gp_proyectos p
--  where p.estado_codigo is distinct from
--        coalesce((select (e.payload_despues->>'estado_codigo')
--                    from public.gp_eventos_auditoria e
--                   where e.proyecto_id = p.id and e.accion = 'STATE_CHANGE'
--                   order by e.ocurrido_at desc limit 1), p.estado_codigo);
-- -- Esperado: 0 filas.
