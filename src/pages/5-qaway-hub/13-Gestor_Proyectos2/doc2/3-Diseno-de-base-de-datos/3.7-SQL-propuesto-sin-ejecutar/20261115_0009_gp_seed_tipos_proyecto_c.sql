-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · ETAPA 6.3 · SQL PROPUESTO — SIN EJECUTAR
-- Archivo: 20261115_0009_gp_seed_tipos_proyecto_c.sql
-- Fecha: 2026-11-15 | Tabla 3 del tracker: public.gp_tipos_proyecto_c
-- Estado vivo HOY: la tabla EXISTE y está VACÍA por diseño (0001 L36: "SIN SEED
--   por diseño: clasificación funcional pendiente del negocio"). La Etapa 6.3
--   APROBÓ las seis categorías definitivas ⇒ este seed las materializa.
-- SIN DROP/TRUNCATE/DELETE. IDEMPOTENTE (re-ejecutable). Sin columnas nuevas:
--   la tabla ya tiene la forma exacta de 0001 L38-49 (10 columnas).
-- ==============================================================================
-- POR QUÉ AHORA (Etapa 6.3):
--   · Paso 1: selector de tipo en el formulario de creación y en
--     Configuración > Clasificación. Con el catálogo vacío, el componente
--     TipoProyectoCatalogoSelect muestra el estado honesto
--     "catálogo de tipos vacío (SQL 20261115_0009 pendiente)" y la creación
--     NO se bloquea. Tras aplicar este seed, el selector lista las 6 categorías.
--   · El tipo se persiste en gp_proyectos.tipo_proyecto_codigo (0002 L38, FK por
--     codigo — exige UNIQUE(codigo), presente en la forma de 0001 L49).
--   · La clasificación es ADMINISTRATIVA (filtros/grupos/reportes): NO modifica
--     la EDT ni el cronograma (restricción aprobada 6.3 §4).
-- ORDEN DE APLICACIÓN: 0008 → 0009 (este) → 0010.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- §1 · GUARDIA DE FORMA: si la tabla vive, debe coincidir EXACTAMENTE con la
--      fuente 0001 (columna + tipo vía udt_name). Divergencia ⇒ ABORTA sin
--      cambios. Tabla ausente ⇒ ABORTA (no se inventa creación aquí: la tabla
--      viva existe; crearla es trabajo del Modo A/B del tracker).
--      Tipos esperados (udt_name): uuid, text, text, text, bool, int4, jsonb,
--      timestamptz, timestamptz (+ id uuid PK).
-- -----------------------------------------------------------------------------
DO $$
DECLARE v_faltan int; v_noticia text;
BEGIN
  IF to_regclass('public.gp_tipos_proyecto_c') IS NULL THEN
    RAISE EXCEPTION
      '0009 §1: public.gp_tipos_proyecto_c NO existe en vivo. Crear la tabla primero (0001 L38-49 / Modo B del tracker 5.2). ABORTADO SIN CAMBIOS.';
  END IF;

  SELECT count(*) INTO v_faltan
  FROM (VALUES
    ('id','uuid'), ('codigo','text'), ('nombre','text'), ('descripcion','text'),
    ('activo','bool'), ('orden','int4'), ('metadata','jsonb'),
    ('created_at','timestamptz'), ('updated_at','timestamptz')
  ) AS esperado(nombre_col, tipo)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
     WHERE c.table_schema = 'public'
       AND c.table_name   = 'gp_tipos_proyecto_c'
       AND c.column_name  = esperado.nombre_col
       AND c.udt_name     = esperado.tipo
  );
  IF v_faltan > 0 THEN
    RAISE EXCEPTION
      '0009 §1: public.gp_tipos_proyecto_c ya existe y NO coincide con la fuente 0001 (% columna(s) ausente(s) o de otro tipo). ABORTADO SIN CAMBIOS — contrastar con la fuente 0001 (L38-49) antes de actuar.',
      v_faltan;
  END IF;

  SELECT count(*) INTO v_noticia FROM public.gp_tipos_proyecto_c;
  IF v_noticia > 0 THEN
    RAISE NOTICE
      '0009 §1: el catálogo ya tiene % fila(s) vivas. El seed es idempotente (ON CONFLICT DO UPDATE): solo refresca codigo duplicados, no toca ids ni created_at.', v_noticia;
  ELSE
    RAISE NOTICE '0009 §1: catálogo vacío por diseño — se sembrarán las 6 categorías aprobadas.';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- §2 · SEED DE LAS 6 CATEGORÍAS APROBADAS (Etapa 6.3 §2.A — sin sustitutos)
--   obra_publica · inversion · mantenimiento · servicio · mejora_interna · otro
-- ON CONFLICT (codigo) DO UPDATE: re-ejecutable; conserva id/created_at.
-- -----------------------------------------------------------------------------
INSERT INTO public.gp_tipos_proyecto_c
  (codigo, nombre, descripcion, activo, orden, metadata)
VALUES
  ('obra_publica',
   'Obra pública',
   'Ejecución de infraestructura u obra civil con entidad pública: expediente, partidas y supervisión de campo.',
   true, 1, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb),
  ('inversion',
   'Inversión',
   'Proyecto de inversión (CAPEX) con caso de negocio, techo presupuestal y seguimiento de desembolsos.',
   true, 2, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb),
  ('mantenimiento',
   'Mantenimiento',
   'Mantenimiento correctivo/preventivo de activos y servicios con planes de frecuencia y ventanas de ejecución.',
   true, 3, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb),
  ('servicio',
   'Servicio',
   'Prestación continua de servicios (contratos de operación, soporte u outsourcing) con hitos de nivel de servicio.',
   true, 4, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb),
  ('mejora_interna',
   'Mejora interna',
   'Iniciativa interna de mejora de procesos, sistemas u organización (proyecto de eficiencia).',
   true, 5, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb),
  ('otro',
   'Otro',
   'Categoría residual para proyectos que no califican en las cinco anteriores.',
   true, 6, '{"aprobada_por":"Etapa 6.3 §2.A"}'::jsonb)
ON CONFLICT (codigo) DO UPDATE
SET nombre      = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo      = EXCLUDED.activo,
    orden       = EXCLUDED.orden,
    metadata    = EXCLUDED.metadata,
    updated_at  = now();

-- -----------------------------------------------------------------------------
-- §3 · POST-VERIFICACIONES (ejecutar y contrastar; conservar salida en bitácora)
-- -----------------------------------------------------------------------------
-- a) Las 6 categorías activas (esperado: 6 filas, orden 1..6)
-- select codigo, nombre, activo, orden
--   from public.gp_tipos_proyecto_c order by orden, codigo;
--
-- b) Ningún proyecto apuntando a un tipo inexistente/inactivo (esperado: 0)
-- select count(*) as huerfanos from public.gp_proyectos p
--  where p.tipo_proyecto_codigo is not null
--    and not exists (
--      select 1 from public.gp_tipos_proyecto_c t
--       where t.codigo = p.tipo_proyecto_codigo and t.activo);
--
-- c) Unicidad de codigo intacta (requisito de la FK de gp_proyectos, 0002 L38)
-- select conname from pg_constraint
--  where conrelid='public.gp_tipos_proyecto_c'::regclass and contype='u'
--    and 'codigo'::name = ANY (conkey::name[]);
