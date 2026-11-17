-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · ETAPA 6.3 · SQL PROPUESTO — SIN EJECUTAR
-- Archivo: 20261115_0008_gp_roles_proyecto_resolucion_discrepancia.sql
-- Fecha: 2026-11-15 | Tabla 5 del tracker: public.gp_roles_proyecto_c
-- Discrepancia detectada: tabla VIVA con 9 columnas vs 10 en la fuente
--   0001 (L82-94). Resolución ADITIVA y NO DESTRUCTIVA (opción B de 5.4 §3):
--   se AÑADEN las columnas faltantes con IF NOT EXISTS (nunca se borra ni se
--   renombra nada) y se siembran los 6 roles con la matriz de permisos jsonb.
--   Query de contraste y análisis: doc2/5-Creacion-guiada-en-Supabase-v2/
--   5.4-Verificacion-previa-etapa5-y-discrepancia-gp-roles.md §3.
-- SIN DROP / TRUNCATE / DELETE. IDEMPOTENTE (re-ejecutable).
-- ==============================================================================
-- POR QUÉ AHORA (Etapa 6.3):
--   · La autorización del ciclo de vida vive en `permisos jsonb` (0001 L87): la
--     RPC 20261115_0010 lee `permisos ->> <accion>` de este catálogo para
--     autorizar iniciar/pausar/reanudar/completar/cancelar/reabrir. Sin columna
--     o sin seed, la RPC devuelve PERMISO_INSUFICIENTE con instrucción de
--     aplicar ESTE archivo (mensaje honesto, no falso negativo).
--   · La FK gp_proyecto_miembros_r.rol_proyecto_codigo →
--     gp_roles_proyecto_c(codigo) (0003 L221) exige UNIQUE(codigo): sin esa
--     unicidad, 0003 no puede aplicarse.
--   · Configuración > Equipo y accesos queda desbloqueado tras aplicarlo
--     (banner de bloqueo honesto visible hoy en ConfiguracionView).
-- ORDEN GLOBAL DE APLICACIÓN (prerrequisitos primero):
--   0006a → 0005 → 0006b → 0004  (cadena base del cutover)
--   → 0008 (este) → 0009 → 0010.
-- REGLA (tracker 5.2): si un paso falla, NO se avanza.
-- ==============================================================================

-- ==============================================================================
-- §0 · PRE-VERIFICACIÓN MANUAL (antes de ejecutar §1): dump de la forma viva
--      para CONTRASTAR contra 5.4 §3. Ejecutar estas consultas y conservar la
--      salida en la bitácora. El script es aditivo con IF NOT EXISTS, por lo
--      que SABER qué columna falta es informativo, no bloqueante.
-- ==============================================================================
-- select ordinal_position, column_name, data_type, udt_name, is_nullable,
--        column_default
--   from information_schema.columns
--  where table_schema = 'public' and table_name = 'gp_roles_proyecto_c'
--  order by ordinal_position;
--
-- -- Unicidad viva de codigo (el FK de 0003 la exige; puede ser constraint o índice)
-- select conname, contype from pg_constraint
--  where conrelid = 'public.gp_roles_proyecto_c'::regclass order by conname;
-- select indexname, indexdef from pg_indexes
--  where schemaname = 'public' and tablename = 'gp_roles_proyecto_c';
--
-- -- Filas vivas (si las hay) para no pisar datos con el seed
-- select id, codigo, nombre, activo from public.gp_roles_proyecto_c order by codigo;

-- ==============================================================================
-- §1 · GUARDIA + ALTER ADITIVO (solo columnas faltantes, defaults de 0001)
--      Fuente de verdad: 0001 L82-94 (10 columnas). Las 9 no-PK:
--      codigo, nombre, descripcion, permisos, activo, orden, metadata,
--      created_at, updated_at.
-- ==============================================================================
DO $$
DECLARE
  v_faltan int;
BEGIN
  -- Guardia dura: si la tabla NO existe, abortar (no se inventa la tabla viva).
  IF to_regclass('public.gp_roles_proyecto_c') IS NULL THEN
    RAISE EXCEPTION
      '0008 §1: public.gp_roles_proyecto_c NO existe en vivo. Este archivo resuelve la DISCREPANCIA (9↔10 columnas), no la ausencia. ABORTADO SIN CAMBIOS — aplicarlo solo si la tabla existe.';
  END IF;

  -- Contraste de forma (informativo): columnas de la fuente ausentes o de otro tipo.
  SELECT count(*) INTO v_faltan
  FROM (VALUES
    ('codigo','text'), ('nombre','text'), ('descripcion','text'),
    ('permisos','jsonb'), ('activo','bool'), ('orden','int4'),
    ('metadata','jsonb'), ('created_at','timestamptz'), ('updated_at','timestamptz')
  ) AS esperado(nombre_col, tipo)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
     WHERE c.table_schema = 'public'
       AND c.table_name   = 'gp_roles_proyecto_c'
       AND c.column_name  = esperado.nombre_col
       AND c.udt_name     = esperado.tipo
  );
  IF v_faltan > 0 THEN
    RAISE NOTICE
      '0008 §1: % columna(s) de la fuente 0001 ausente(s) o de otro tipo en vivo. Se aplicará ALTER aditivo (IF NOT EXISTS): nada se borra ni se renombra.', v_faltan;
  ELSE
    RAISE NOTICE
      '0008 §1: la tabla ya coincide con la forma de 0001 (10 columnas). No se altera estructura; se refuerza unicidad/NOT NULL condicionalmente y se refresca el seed.';
  END IF;
END $$;

ALTER TABLE public.gp_roles_proyecto_c
  ADD COLUMN IF NOT EXISTS codigo     text,
  ADD COLUMN IF NOT EXISTS nombre     text,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS permisos   jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS activo     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS orden      integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- NOT NULL de codigo/nombre (fuente 0001): SOLO si no hay filas que lo violen.
-- Filas nulas ⇒ ABORT con instrucción manual (resolución no destructiva).
DO $$
DECLARE
  v_nulos_codigo int;
  v_nulos_nombre int;
BEGIN
  SELECT count(*) INTO v_nulos_codigo
    FROM public.gp_roles_proyecto_c WHERE codigo IS NULL;
  SELECT count(*) INTO v_nulos_nombre
    FROM public.gp_roles_proyecto_c WHERE nombre IS NULL;

  IF v_nulos_codigo > 0 THEN
    RAISE EXCEPTION
      '0008 §1: existen % fila(s) con codigo NULL. Resolución no destructiva: definirlas manualmente (o archivarlas) ANTES de re-ejecutar. ABORTADO SIN CAMBIOS — nunca se autocompleta un codigo.',
      v_nulos_codigo;
  END IF;
  IF v_nulos_nombre > 0 THEN
    RAISE EXCEPTION
      '0008 §1: existen % fila(s) con nombre NULL. Resolución no destructiva: nombrarlas manualmente antes de re-ejecutar. ABORTADO SIN CAMBIOS.',
      v_nulos_nombre;
  END IF;

  -- SET NOT NULL condicional (idempotente: si ya es NOT NULL, no se toca).
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'gp_roles_proyecto_c'
       AND column_name = 'codigo' AND is_nullable = 'YES'
  ) THEN
    EXECUTE 'ALTER TABLE public.gp_roles_proyecto_c ALTER COLUMN codigo SET NOT NULL';
    RAISE NOTICE '0008 §1: codigo → NOT NULL aplicado.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'gp_roles_proyecto_c'
       AND column_name = 'nombre' AND is_nullable = 'YES'
  ) THEN
    EXECUTE 'ALTER TABLE public.gp_roles_proyecto_c ALTER COLUMN nombre SET NOT NULL';
    RAISE NOTICE '0008 §1: nombre → NOT NULL aplicado.';
  END IF;
END $$;

-- ==============================================================================
-- §2 · UNIQUE(codigo) — REQUISITO de la FK de gp_proyecto_miembros_r (0003 L221).
--      Guard: si ya existe un constraint/índice UNIQUE sobre codigo, no se toca.
--      Duplicados de codigo ⇒ ABORT (nunca se borra/mergea una fila viva).
-- ==============================================================================
DO $$
DECLARE
  v_attnum     smallint;
  v_duplicados int;
  v_tiene_uniq boolean;
BEGIN
  -- Duplicados vivos: incompatibles con UNIQUE. Se reportan y se aborta.
  SELECT count(*) INTO v_duplicados
  FROM (
    SELECT codigo FROM public.gp_roles_proyecto_c
     WHERE codigo IS NOT NULL
     GROUP BY codigo HAVING count(*) > 1
  ) d;
  IF v_duplicados > 0 THEN
    RAISE EXCEPTION
      '0008 §2: existen % codigo(s) duplicado(s) en gp_roles_proyecto_c. La unicidad es requisito del FK de gp_proyecto_miembros_r (0003 L221). Resolver manualmente (no destructivo) y re-ejecutar. ABORTADO SIN CAMBIOS.',
      v_duplicados;
  END IF;

  SELECT attnum INTO v_attnum
    FROM pg_attribute
   WHERE attrelid = 'public.gp_roles_proyecto_c'::regclass
     AND attname = 'codigo' AND NOT attisdropped;

  IF v_attnum IS NULL THEN
    RAISE EXCEPTION '0008 §2: la columna codigo no existe tras el ALTER §1 — imposible garantizar UNIQUE(codigo). ABORTADO.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.gp_roles_proyecto_c'::regclass
       AND contype = 'u'
       AND v_attnum = ANY (conkey)
  ) INTO v_tiene_uniq;

  IF NOT v_tiene_uniq THEN
    BEGIN
      ALTER TABLE public.gp_roles_proyecto_c
        ADD CONSTRAINT gp_roles_proyecto_c_codigo_key UNIQUE (codigo);
      RAISE NOTICE '0008 §2: UNIQUE(codigo) creado (gp_roles_proyecto_c_codigo_key).';
    EXCEPTION
      WHEN duplicate_table THEN
        -- El nombre ya lo ocupa un índice UNIQUE con otra forma de crearlo.
        RAISE NOTICE
          '0008 §2: el nombre gp_roles_proyecto_c_codigo_key ya existía (índice previo). Se asume unicidad viva; verificar en §4.';
    END;
  ELSE
    RAISE NOTICE '0008 §2: UNIQUE sobre codigo ya existe. Sin cambios.';
  END IF;
END $$;

-- ==============================================================================
-- §3 · SEED DE LOS 6 ROLES (códigos YA planificados en el tracker 5.2 · fila 5 —
--      no se inventan roles) con la MATRIZ APROBADA de la Etapa 6.3 en permisos:
--      administrador = gerente del proyecto (dirección completa + clasificación)
--      gestor        = jefe/responsable (iniciar/pausar/reanudar/completar)
--      coordinador / supervisor / colaborador / lector = solo consulta
-- ON CONFLICT (codigo) DO UPDATE refresca nombre/descripcion/permisos/orden sin
-- re-crear filas (conserva id y created_at). Requiere §2 (unicidad) aplicada.
-- ==============================================================================
INSERT INTO public.gp_roles_proyecto_c
  (codigo, nombre, descripcion, permisos, activo, orden, metadata)
VALUES
  ('administrador',
   'Administrador del Proyecto (Gerente)',
   'Control total del proyecto: dirección del ciclo de vida (iniciar, pausar, reanudar, completar, cancelar, reabrir) y edición de la clasificación (tipo). Es el rol de GERENTE aprobado en la Etapa 6.3.',
   '{"iniciar":true,"pausar":true,"reanudar":true,"completar":true,"cancelar":true,"reabrir":true,"editar_tipo":true}'::jsonb,
   true, 1, '{}'::jsonb),
  ('gestor',
   'Gestor / Jefe Responsable',
   'Responsable operativo del proyecto: puede iniciar, pausar, reanudar y completar. NO puede cancelar ni reabrir (acciones reservadas al gerente o superiores).',
   '{"iniciar":true,"pausar":true,"reanudar":true,"completar":true}'::jsonb,
   true, 2, '{}'::jsonb),
  ('coordinador',
   'Coordinador',
   'Consulta del estado general y del historial del proyecto. Sin acciones de dirección (matriz aprobada 6.3).',
   '{}'::jsonb,
   true, 3, '{}'::jsonb),
  ('supervisor',
   'Supervisor',
   'Consulta del estado general y del historial del proyecto. Sin acciones de dirección (matriz aprobada 6.3).',
   '{}'::jsonb,
   true, 4, '{}'::jsonb),
  ('colaborador',
   'Colaborador',
   'Participante del proyecto: solo consulta de estado e historial. La pertenencia NO otorga permisos administrativos.',
   '{}'::jsonb,
   true, 5, '{}'::jsonb),
  ('lector',
   'Lector / Observador',
   'Acceso de solo lectura al proyecto (consulta de estado e historial). Sin acciones de dirección.',
   '{}'::jsonb,
   true, 6, '{}'::jsonb)
ON CONFLICT (codigo) DO UPDATE
SET nombre         = EXCLUDED.nombre,
    descripcion    = EXCLUDED.descripcion,
    permisos       = EXCLUDED.permisos,
    activo         = EXCLUDED.activo,
    orden          = EXCLUDED.orden,
    updated_at     = now();

-- ==============================================================================
-- §4 · POST-VERIFICACIONES (ejecutar y contrastar; conservar salida en bitácora)
-- ==============================================================================
-- a) Forma final: 10 columnas (esperado: 10)
-- select count(*) as columnas from information_schema.columns
--  where table_schema='public' and table_name='gp_roles_proyecto_c';
--
-- b) Unicidad de codigo (esperado: >=1 índice/constraint UNIQUE que la cubra)
-- select conname from pg_constraint
--  where conrelid='public.gp_roles_proyecto_c'::regclass and contype='u'
--    and 'codigo'::name = ANY (conkey::name[]);
--
-- c) Los 6 roles con su matriz (esperado: 6 filas; administrador 7 permisos,
--    gestor 4, el resto {})
-- select codigo, nombre, orden, activo, permisos
--   from public.gp_roles_proyecto_c order by orden, codigo;
--
-- d) Cobertura del FK (0003 L221): todo rol de membresía apunta a un código
--    activo del catálogo (esperado: 0)
-- select count(*) as huerfanos from public.gp_proyecto_miembros_r m
--  where not exists (
--    select 1 from public.gp_roles_proyecto_c r
--     where r.codigo = m.rol_proyecto_codigo and r.activo);
--
-- e) Contraste con la fuente (esperado: 0 diferencias de tipo/orden)
-- select ordinal_position, column_name, udt_name
--   from information_schema.columns
--  where table_schema='public' and table_name='gp_roles_proyecto_c'
--  order by ordinal_position;
