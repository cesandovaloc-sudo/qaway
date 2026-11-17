-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · ETAPA 5 · CREACIÓN POR TABLA (Modo B del tracker 5.2)
-- Archivo: 20261114_0007_gp_prioridades_c.sql
-- Fecha: 2026-11-14 | TABLA 4 del tracker: public.gp_prioridades_c
-- Fuente: 20261112_0001_gp_catalogos_base.sql (DDL L68-79 literal · seed L197-198
--   con AJUSTE 15-nov aprobado: 4º valor 'urgente', no 'critica' — ver bloque 3)
-- SIN DROP/TRUNCATE. IDEMPOTENTE (re-ejecutable). Sin columnas ni campos nuevos.
-- ==============================================================================
-- POR QUÉ ESTA TABLA AHORA (Etapa 5, primera tabla pendiente):
--   · Paso 1 (catálogos): tablas 1-3 ya creadas (14-nov: gp_estados_proyecto_c,
--     gp_tipos_proyecto_c vacía por diseño, gp_estados_ejecucion_c).
--     La tabla 4 del tracker es gp_prioridades_c y NO tiene discrepancias
--     estructurales pendientes.
--   · NO es gp_roles_proyecto_c (tabla 5): auditoría del 16-nov confirmó que
--     NO existe en vivo, así que la discrepancia de 5.4 §3 queda disuelta: se
--     creará desde 0001 tal cual (10 columnas). No se toca aquí.
--   · REVISIÓN 16-nov: la tabla YA existe en vivo con 10 columnas (extra
--     'descripcion', NULL-able) y el seed exacto esperado. Se adopta la columna:
--     esta versión del archivo ya la incluye y la guardia la espera.
--   · Catálogo INDEPENDIENTE: sin FK de entrada ni salida. Primer consumidor
--     futuro: gp_tareas.prioridad_codigo REFERENCES gp_prioridades_c(codigo)
--     ON UPDATE CASCADE (0002:199) — por eso el UNIQUE(codigo) es imprescindible
--     y viene exactamente como en 0001.
-- SEGURIDAD (REVISADO 16-nov · patrón VIVO adoptado; la versión anterior creaba
--   _select USING(true), que abría la lectura a cualquier rol autenticado):
--   · RLS ENABLE ya aquí (0004 lo re-habilita después de forma idempotente).
--   · _select FOR SELECT USING (user_can_use_app('gestor-proyectos')).
--   · Escritura por operación (_insert/_update/_delete) con is_platform_admin() del
--     Hub o, si no existe, gp_is_platform_admin() de 0004. Si aún no hay helper,
--     queda DIFERIDO con aviso: ESCRITURA CERRADA (fail-closed).
--   · REGLA NUEVA: si la tabla ya tiene políticas, este archivo NO toca ninguna.
--   · Trigger updated_at: alcance del Paso 4 (0004, función gp_set_updated_at).
--     NO se pre-crea aquí para no duplicar la gobernanza aprobada.
-- ==============================================================================

-- Paridad con 0001 (idempotente; en Supabase gen_random_uuid() también es core PG13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) Guardia de forma: si la tabla YA existe, debe coincidir EXACTAMENTE con la
--    fuente (columna + tipo, vía udt_name). Divergencia ⇒ ABORTA sin cambios.
--    Tipos esperados (udt_name): uuid, text, text, int4, bool, int4, jsonb,
--    timestamptz, timestamptz.
-- -----------------------------------------------------------------------------
DO $$
DECLARE v_faltan int; v_noticia text;
BEGIN
  IF to_regclass('public.gp_prioridades_c') IS NOT NULL THEN
    SELECT count(*) INTO v_faltan
    FROM (VALUES
      ('id','uuid'), ('codigo','text'), ('nombre','text'), ('descripcion','text'),
      ('activo','bool'), ('orden','int4'), ('metadata','jsonb'),
      ('created_at','timestamptz'), ('updated_at','timestamptz'), ('nivel','int4')
    ) AS esperado(nombre_col, tipo)
    WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
       WHERE c.table_schema = 'public'
         AND c.table_name   = 'gp_prioridades_c'
         AND c.column_name  = esperado.nombre_col
         AND c.udt_name     = esperado.tipo
    );
    IF v_faltan > 0 THEN
      RAISE EXCEPTION
        '0007: public.gp_prioridades_c ya existe y NO coincide con la fuente 0001 (% columna(s) ausente(s) o de otro tipo). ABORTADO SIN CAMBIOS — contrastar con la fuente 0001 (L68-79) antes de actuar.',
        v_faltan;
    END IF;
    RAISE NOTICE '0007 · gp_prioridades_c ya existe con la forma esperada de 0001: NO se recrea; se completa seed/comentarios/RLS.';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2) Tabla — COPIA LITERAL de 0001 (L68-79). Sin columnas nuevas, sin CHECKs
--    inventados, sin defaults cambiados.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gp_prioridades_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,          -- ADOPTADO 16-nov: existe en vivo (opcional, NULL-able)
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nivel integer,             -- orden real en vivo: última columna
  UNIQUE(codigo)
);

-- -----------------------------------------------------------------------------
-- 3) Seed — del bloque Seeds de 0001 (L197-198) con AJUSTE 15-nov aprobado por
--    el responsable: 4º valor 'urgente' (NO 'critica'), que es el valor REAL
--    vigente en las tablas ya creadas en Supabase y en la app (fuente de verdad;
--    mismo patrón del ajuste v2.1 de 0001). El nivel 4 se mantiene. Idempotente:
--    ON CONFLICT (codigo) DO NOTHING jamás toca filas ya existentes.
-- -----------------------------------------------------------------------------
INSERT INTO public.gp_prioridades_c (codigo, nombre, nivel) VALUES ('baja','Baja',1),('media','Media',2),('alta','Alta',3),('urgente','Urgente',4)
ON CONFLICT (codigo) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4) Comentarios (aditivos; esta tabla no tenía COMMENT previo)
-- -----------------------------------------------------------------------------
COMMENT ON TABLE   public.gp_prioridades_c IS 'Catálogo de prioridades de tareas/nodos EDT (tabla 4 del tracker 5.2, Etapa 5). Fuente literal: 0001.';
COMMENT ON COLUMN  public.gp_prioridades_c.id        IS 'Identificador técnico (uuid generado por gen_random_uuid()).';
COMMENT ON COLUMN  public.gp_prioridades_c.codigo   IS 'Código único del catálogo (UNIQUE). Clave referenciada por gp_tareas.prioridad_codigo (0002) con ON UPDATE CASCADE.';
COMMENT ON COLUMN  public.gp_prioridades_c.nombre   IS 'Etiqueta visible del valor del catálogo.';
COMMENT ON COLUMN  public.gp_prioridades_c.descripcion IS 'Texto libre opcional (adoptada 16-nov: ya existía en vivo).';
COMMENT ON COLUMN  public.gp_prioridades_c.nivel    IS 'Peso numérico de la prioridad (seed: baja=1, media=2, alta=3, urgente=4 — ajuste 15-nov).';
COMMENT ON COLUMN  public.gp_prioridades_c.activo   IS 'Baja lógica del valor (true = vigente).';
COMMENT ON COLUMN  public.gp_prioridades_c.orden    IS 'Orden de presentación (default 0).';
COMMENT ON COLUMN  public.gp_prioridades_c.metadata IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN  public.gp_prioridades_c.created_at IS 'Creación de la fila.';
COMMENT ON COLUMN  public.gp_prioridades_c.updated_at IS 'Última modificación (el trigger trg_gp_prioridades_c_updated_at llega con 0004).';

-- -----------------------------------------------------------------------------
-- 5) RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.gp_prioridades_c ENABLE ROW LEVEL SECURITY;

-- 5a) Lectura: SOLO usuarios con la app contratada (patrón VIVO, auditado 16-nov).
--     Regla: si la tabla YA tiene políticas, no se toca ninguna (RLS vivo manda).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'gp_prioridades_c'
  ) THEN
    IF to_regprocedure('public.user_can_use_app(text)') IS NOT NULL THEN
      CREATE POLICY gp_prioridades_c_select ON public.gp_prioridades_c
        FOR SELECT USING (public.user_can_use_app('gestor-proyectos'));
    ELSE
      RAISE NOTICE
        '0007 · user_can_use_app() no existe aún: la política de lectura queda DIFERIDA (nadie lee el catálogo mientras tanto; fail-closed).';
    END IF;
  END IF;
END $$;

-- 5b) Escritura por operación, solo admin de plataforma (patrón vivo).
--     is_platform_admin() es el helper del Hub; si no existiera, gp_is_platform_admin()
--     de 0004. Con guardia: en el orden normal (Paso 1 antes del Paso 4) se difiere
--     con aviso (escritura fail-closed) y se completa al re-ejecutar tras el Paso 4.
DO $$
DECLARE v_adm text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'gp_prioridades_c'
  ) THEN
    RETURN; -- ya hay políticas: no se añade nada
  END IF;
  v_adm := CASE WHEN to_regprocedure('public.is_platform_admin()') IS NOT NULL
                THEN 'public.is_platform_admin()'
                WHEN to_regprocedure('public.gp_is_platform_admin()') IS NOT NULL
                THEN 'public.gp_is_platform_admin()'
                ELSE NULL END;
  IF v_adm IS NULL THEN
    RAISE NOTICE
      '0007 · no existe helper de admin (0004/Paso 4 pendiente): las políticas de escritura quedan DIFERIDAS. Escritura CERRADA mientras tanto (fail-closed); re-ejecutar este archivo tras 0004 para completarlas.';
    RETURN;
  END IF;
  EXECUTE format('CREATE POLICY %I ON public.gp_prioridades_c FOR INSERT WITH CHECK (%s)', 'gp_prioridades_c_insert', v_adm);
  EXECUTE format('CREATE POLICY %I ON public.gp_prioridades_c FOR UPDATE USING (%s) WITH CHECK (%s)', 'gp_prioridades_c_update', v_adm, v_adm);
  EXECUTE format('CREATE POLICY %I ON public.gp_prioridades_c FOR DELETE USING (%s)', 'gp_prioridades_c_delete', v_adm);
END $$;

-- ==============================================================================
-- VERIFICACIÓN POSTERIOR (ejecutar tras aplicar; nada modifica datos)
--
-- a) Forma exacta (esperado: 10 filas — las 10 columnas de 0001 v2.3 — en este orden):
--    select column_name, data_type, is_nullable
--      from information_schema.columns
--     where table_schema='public' and table_name='gp_prioridades_c'
--     order by ordinal_position;
--
-- b) PK y UNIQUE:
--    select con.conname, pg_get_constraintdef(con.oid)
--      from pg_constraint con
--      join pg_class cl on cl.oid = con.conrelid
--      join pg_namespace n on n.oid = cl.relnamespace
--     where n.nspname='public' and cl.relname='gp_prioridades_c'
--     order by con.conname;
--    → gp_prioridades_c_pkey (PRIMARY KEY (id))
--    → gp_prioridades_c_codigo_key (UNIQUE (codigo))   [base de la FK de 0002]
--
-- c) Seed (re-ejecutar el archivo NO duplica):
--    select codigo, nombre, nivel, activo from public.gp_prioridades_c order by nivel;
--    → baja/Baja/1 · media/Media/2 · alta/Alta/3 · urgente/Urgente/4  (4 filas)
--
-- d) RLS y políticas:
--    select relrowsecurity from pg_class where oid = 'public.gp_prioridades_c'::regclass;
--    → true
--    select policyname, cmd, qual, with_check from pg_policies
--     where schemaname='public' and tablename='gp_prioridades_c' order by policyname;
--    REAL (auditado 16-nov) — 4 políticas por operación, patrón del Hub:
--    → gp_prioridades_c_select  (SELECT, user_can_use_app('gestor-proyectos'))
--    → gp_prioridades_c_insert  (INSERT, WITH CHECK is_platform_admin())
--    → gp_prioridades_c_update  (UPDATE, USING/CHECK is_platform_admin())
--    → gp_prioridades_c_delete  (DELETE, USING is_platform_admin())
--    Ese patrón es el adoptado (5.2, Paso 1). El par _select USING(true) +
--    _write_admin de 0004 ya NO se crea sobre tablas que tengan políticas.
--
-- e) Conteo del tracker (tras esta tabla: total gp_* = 4):
--    select count(*) from pg_tables
--     where schemaname='public' and tablename like 'gp\_%';
--
-- f) Comentarios:
--    select obj_description('public.gp_prioridades_c'::regclass) as tabla;
--
-- NO TOCA: otras tablas gp_*, gestor_unidades (251 semillas), gp_roles_proyecto_c
-- (congelada), infraestructura del Hub. No hay DROP ni datos destructivos.
-- ==============================================================================
