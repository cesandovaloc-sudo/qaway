-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · BACKFILL IDEMPOTENTE v3 (ETAPA 2B)
-- Archivo: 20261112_0100_backfill_idempotente.sql
-- Objetivo: migrar/conciliar datos de tablas legadas gestor_* hacia gp_*.
-- Reglas: SOLO ADITIVO, IDEMPOTENTE, CON TRAZABILIDAD. SIN DROP/TRUNCATE.
-- Ejecución prevista: entorno separado/pruebas, tras aplicar migraciones 0001-0004.
-- ==============================================================================
-- NOTAS:
-- - empresa_id por defecto (contexto Qaway Lab/tenant master): ajustar si corresponde.
-- - IDs legados (text) se conservan en legacy_source_id/metadata; se generan UUIDs nuevos.
-- - localStorage es complemento por cliente: su merge se realiza desde app/servicio
--   en proceso controlado (comparación por legacy_source_id + completitud) y debe
--   registrar resultados en gp_corridas_migracion. Este script cubre BD legada.
-- - Reejecutable: usa corrida_key y ON CONFLICT/NOT EXISTS para evitar duplicados.
--
-- ==============================================================================
-- v3 (2026-11-13) · MAPEO CORREGIDO según las 6 correcciones aprobadas:
--   1. subtext NO migra a cliente_entidad (significado no confirmado): queda
--      solo en metadata.legacy + bandera 'subtext' en metadata.revision_pendiente.
--      descripcion se deja NULL (no se concatena subtext/metodologia).
--   2. Sin valores por defecto sin evidencia en registros históricos:
--      · estado_codigo = NULL (NO 'en_curso') + bandera 'estado'.
--      · nivel_riesgo = valor ORIGINAL normalizado SOLO si pertenece al dominio
--        (bajo/medio/alto/critico); en caso contrario NULL (NO 'medio')
--        + banderas 'riesgo' (valor no clasificable) / 'riesgo_vacio'.
--   3. Presupuesto: conversión VALIDADA (extracción estricta decimal, > 0);
--      dato original conservado en metadata.legacy.budget y
--      metadata.presupuesto_original. moneda SOLO si el texto la evidencia
--      (S/|pen|sol → PEN, usd|$ → USD); sin PEN por defecto.
--   4. Conteo corregido: gp_proyectos recibe 5 columnas nuevas (cliente_entidad,
--      ambito, metodologia, nivel_riesgo, patrocinador). Equivalentes confirmadas
--      que SÍ se migran: region→ambito, metodologia→metodologia, sponsor→patrocinador.
--   5. Subtítulos de módulos: NO se tocan en este script (viven en localStorage);
--      su persistencia se conectará desde el servicio en metadata.subtitulos_modulos
--      conservando TODAS las claves de CONFIGURABLE_MODULES.
--   6. gp_tipos_proyecto_c: sin seed; tipo_proyecto_codigo queda NULL en migración.
--   · Sección 2 reescrita: ya NO inserta en gp_unidades_territoriales (tabla
--     ELIMINADA por 3.6 §2.2 y encabezado de 0002); estampa legacy_source_id y
--     is_deleted de forma aditiva en public.gestor_unidades.
--   · Si la versión 20261112 ya se ejecutó en un entorno de pruebas: las filas
--     migradas con estado/riesgo asignados por el mapeo antiguo deben AUDITARSE
--     (ver verificación 7). Este script no destruye datos.
--   · (A-3) corrida_key = 'gp_backfill_v3_20261113_0100' (antes 'gp_backfill_v2_
--     20261112_0100'): clave NUEVA para NO sobrescribir el registro de una corrida
--     previa en gp_corridas_migracion; el historial anterior queda como evidencia.
-- ==============================================================================
-- v3.1 (2026-11-13, tarde) · CORRECCIÓN CONTRASTADA CON LA BD VIVA (evidencia
-- reportada por el usuario; el agente NO tiene acceso de lectura a Supabase):
--   · Evidencia viva: gestor_cronograma_items ≈ 6.699 filas, 1 proyecto,
--     kind ∈ {hito, subproceso}. NO existen en vivo las columnas task_type, icon,
--     fase_id, metadata, edt_type ni empresa_id (la migración 04 no tiene evidencia
--     de aplicación). SÍ existen: columnas base de 01 + baseline_start/baseline_end/
--     actual_start/actual_end (02). El detector de filas del mapeo antiguo (v3
--     siempre escribe revision_pendiente) sigue siendo fiable.
--   · (Punto 2 → opción b) task_type/icon NO se leen de legacy: el SELECT usa
--     NULL::text. Los valores reales llegan por el MERGE P-1 desde localStorage
--     (SCHEDULE_FIELDS en gestorCronogramaService.ts) por legacy_source_id.
--     NO se agregan columnas a la legacy (no destructivo, no aditivo aquí).
--   · (Punto 3) is_entregable = false en todos los nodos + bandera 'is_entregable'
--     en metadata.revision_pendiente del nodo. El merge P-1 (edtType='ENTREGABLE'
--     del checkbox de GanttEditorDrawer) la resuelve y la limpia.
--   · (Punto 4) edt_type_cached NO se popula por SQL: es cache regenerable (0002).
--     Se llena en 2ª pasada post-backfill con resolveEdtNodeType (P-2).
--   · (Puntos 5/6/7) responsables, deliverable(s) y attachments solo quedan
--     conservados en metadata.legacy; su promoción (gp_personas + gp_edt_responsables_r,
--     gp_entregables, gp_archivos) queda como deudas P-3/P-4/P-5 (sección 3d),
--     sin SQL automático. (Punto 14: no se crean tablas/columnas nuevas.)
--   · (Punto 8) sede_unidad_id queda NULL (legacy sin id de unidad; match por
--     región ambiguo → deuda P-6). region se migra a la columna region; sede_texto NULL.
--   · (Punto 9) expanded (boolean de UI) se DESCARTA: es estado de UI, no está en
--     SCHEDULE_FIELDS y gp_nodos_edt no tiene columna para él.
--   · (Puntos 11/12/13) ya cubiertos — confirmaciones: unicidad WBS → prevalidación
--     A-6 §0 (aborta ANTES de insertar); RLS → ejecutar con service_role (M-7.4);
--     updated_at → explícito en cada INSERT/UPDATE (no depende de triggers de 0004).
-- ==============================================================================
-- REQUISITOS PREVIOS (M-7) — verificar TODO antes de ejecutar este script:
--   1. Migraciones 0001 → 0002 → 0003 → 0004 aplicadas EN ORDEN en el entorno destino.
--   2. Esquema legacy vigente aplicado (supabase\01…02 mínimo): gestor_proyectos,
--      gestor_cronograma_items (columnas base de 01 + baseline_start/baseline_end/
--      actual_start/actual_end de 02), gestor_unidades. Las FK de
--      gp_nodos_edt.sede_unidad_id y gp_proyecto_unidades_r apuntan a
--      public.gestor_unidades.
--      (v3.1) La migración 04 NO es requisito: en la BD viva NO existen las columnas
--      task_type/icon (sin evidencia de aplicación de 04) y este script NO las lee
--      — usa NULL::text y el merge P-1 las completa (ver bloque v3.1).
--   3. Tablas de plataforma existentes: tenants, users (FK de gp_proyectos/gp_personas),
--      public.user_app_roles (helpers RLS de 0004 v2) y auth.uid() disponible.
--   4. Ejecutar con service_role (bypassa RLS) y con v_empresa_default ajustada al
--      tenant real (placeholder 00000000-0000-0000-0000-000000000001).
-- ==============================================================================

DO $$
DECLARE
  v_corrida_key text := 'gp_backfill_v3_20261113_0100'; -- (A-3) clave nueva: preserva el registro de corridas previas
  v_corrida_id uuid;
  v_empresa_default uuid := '00000000-0000-0000-0000-000000000001'; -- AJUSTAR tenant/empresa real
  v_proyectos_ins bigint := 0;
  v_unidades_ins bigint := 0; -- unidades ESTAMPADAS (legacy_source_id/is_deleted), no insertadas
  v_nodos_ins bigint := 0;
BEGIN
  -- Registrar corrida (idempotente)
  INSERT INTO public.gp_corridas_migracion (corrida_key, descripcion, origen, destino, estado)
  VALUES (v_corrida_key, 'Backfill gestor_* -> gp_* (v3, mapeo corregido 2026-11-13)', 'gestor_proyectos,gestor_cronograma_items,gestor_unidades', 'gp_proyectos,gp_nodos_edt + estampado aditivo en gestor_unidades', 'iniciada')
  ON CONFLICT (corrida_key) DO UPDATE SET estado = 'iniciada', iniciado_at = now(), finalizado_at = NULL;

  SELECT id INTO v_corrida_id FROM public.gp_corridas_migracion WHERE corrida_key = v_corrida_key;

  -- 0) PRE-validación de duplicados (A-6): las restricciones UNIQUE uq_gp_proyectos_
  --    empresa_codigo y uq_gp_nodos_edt_wbs abortarían la corrida a mitad de camino
  --    (transacción revertida). Detectarlas ANTES de insertar y fallar con reporte
  --    claro: la corrida queda 'fallida' vía el handler de excepciones y NADA se inserta.
  IF to_regclass('public.gestor_proyectos') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.gestor_proyectos
      GROUP BY COALESCE(code, id)
      HAVING count(*) > 1
    ) THEN
      RAISE EXCEPTION 'PREVALIDACION [A-6]: codigos duplicados ENTRE filas de gestor_proyectos colisionarian con uq_gp_proyectos_empresa_codigo. Consolidar/corregir los code en origen antes de ejecutar el backfill.';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.gestor_proyectos p
      WHERE EXISTS (
        SELECT 1 FROM public.gp_proyectos gp
        WHERE gp.empresa_id = v_empresa_default
          AND gp.is_deleted = false
          AND gp.codigo_proyecto = COALESCE(p.code, p.id)
      )
    ) THEN
      RAISE EXCEPTION 'PREVALIDACION [A-6]: hay codes de gestor_proyectos que YA EXISTEN como codigo_proyecto en gp_proyectos (uq_gp_proyectos_empresa_codigo). Resolver la colision (p. ej. filas de corridas previas) antes de ejecutar.';
    END IF;
  END IF;

  IF to_regclass('public.gestor_cronograma_items') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.gestor_cronograma_items
      GROUP BY project_id, COALESCE(code, id)
      HAVING count(*) > 1
    ) THEN
      RAISE EXCEPTION 'PREVALIDACION [A-6]: codigos duplicados por proyecto en gestor_cronograma_items colisionarian con uq_gp_nodos_edt_wbs (proyecto_id, wbs_code). Consolidar/corregir los code en origen antes de ejecutar el backfill.';
    END IF;
  END IF;

  -- 1) Proyectos (si existe tabla legada)
  IF to_regclass('public.gestor_proyectos') IS NOT NULL THEN
    WITH mapped AS (
      SELECT
        p.id AS legacy_id,
        p.code AS legacy_code,
        p.created_at, p.updated_at,
        COALESCE(p.code, p.id) AS codigo_proyecto,
        COALESCE(p.name, p.code, p.id) AS nombre,
        p.subtext, p.region, p.budget, p.sponsor, p.risk_level, p.metodologia,
        -- (corr. 2) nivel_riesgo: SOLO el valor original, normalizado, si pertenece al dominio.
        -- Sin default 'medio'; sin reinterprete de estados ('Completado' → NULL + revisión).
        CASE lower(btrim(COALESCE(p.risk_level,'')))
          WHEN 'bajo'    THEN 'bajo'
          WHEN 'medio'   THEN 'medio'
          WHEN 'alto'    THEN 'alto'
          WHEN 'crítico' THEN 'critico'
          WHEN 'critico' THEN 'critico'
          ELSE NULL
        END AS nivel_riesgo,
        -- (corr. 3/A-4/A-5) presupuesto: conversión VALIDADA en 2 pasos (coma decimal
        -- internacional vs. comas de miles PEN, ver laterales br/bc), guardia de
        -- overflow (>=17 dígitos no cabe en numeric(18,2)) y > 0; si no valida →
        -- NULL (el original se conserva en metadata.presupuesto_original).
        CASE
          WHEN bc.b_num ~ '^\d+(\.\d{1,2})?$'
               AND bc.b_num !~ '\d{17,}'
               AND bc.b_num::numeric(18,2) > 0
            THEN bc.b_num::numeric(18,2)
          ELSE NULL
        END AS presupuesto,
        -- (corr. 3) moneda: SOLO si el texto original la evidencia. Sin PEN por defecto.
        CASE
          WHEN lower(COALESCE(p.budget,'')) ~ 's/|pen|sol(es)?' THEN 'PEN'
          WHEN lower(COALESCE(p.budget,'')) ~ 'usd|\$'          THEN 'USD'
          ELSE NULL
        END AS moneda,
        -- (corr. 1/2/3) Bandera de revisión por campo, SOLO cuando falta evidencia:
        (
          SELECT COALESCE(jsonb_agg(t.item ORDER BY t.ord), '[]'::jsonb)
          FROM (
            SELECT 1 AS ord, 'estado'::text AS item
            UNION ALL SELECT 2, 'subtext'      -- significado no confirmado: no se migra [corr. 1]
            UNION ALL SELECT 3, 'riesgo'
                     WHERE btrim(COALESCE(p.risk_level,'')) <> ''
                       AND lower(btrim(COALESCE(p.risk_level,''))) NOT IN ('bajo','medio','alto','crítico','critico')
            UNION ALL SELECT 4, 'riesgo_vacio' WHERE btrim(COALESCE(p.risk_level,'')) = ''
            UNION ALL SELECT 5, 'presupuesto'
                     WHERE NOT (bc.b_num ~ '^\d+(\.\d{1,2})?$'
                                AND bc.b_num !~ '\d{17,}'
                                AND bc.b_num::numeric(18,2) > 0)
            UNION ALL SELECT 6, 'moneda'
                     WHERE NOT (lower(COALESCE(p.budget,'')) ~ 's/|pen|sol(es)?'
                                OR lower(COALESCE(p.budget,'')) ~ 'usd|\$')
          ) t
        ) AS revision
      FROM public.gestor_proyectos p
      -- (A-4/B-9) Lateral en 2 pasos: detectar coma decimal ANTES de eliminar comas;
      -- signo negativo o texto con '-' = ambiguo → sin conversión (NULL + bandera).
      CROSS JOIN LATERAL (
        SELECT regexp_replace(COALESCE(p.budget,''), '[^\d.,]', '', 'g') AS b_raw,
               COALESCE(p.budget,'') ~ '-' AS tiene_guion
      ) br
      CROSS JOIN LATERAL (
        SELECT CASE
                 WHEN br.b_raw = '' OR br.tiene_guion
                   THEN NULL::text                                -- sin valor o ambiguo: NO convertir [B-9]
                 WHEN br.b_raw ~ '^\d{1,3}(\.\d{3})*,\d{1,2}$'    -- miles con punto + coma decimal (1.850.000,50)
                   OR br.b_raw ~ '^\d+,\d{1,2}$'                  -- coma decimal simple (850,50)
                   THEN replace(replace(br.b_raw, '.', ''), ',', '.')
                 ELSE regexp_replace(br.b_raw, ',', '', 'g')      -- comas = miles PEN (850,000)
               END AS b_num
      ) bc
    )
    INSERT INTO public.gp_proyectos (
      id, empresa_id, codigo_proyecto, nombre, descripcion, estado_codigo,
      ambito, metodologia, nivel_riesgo, patrocinador,
      presupuesto, moneda, fecha_inicio, fecha_fin,
      metadata, legacy_source_id, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      v_empresa_default,
      m.codigo_proyecto,
      m.nombre,
      NULL,                       -- descripcion: no se inventa ni concatena [corr. 1]
      NULL,                       -- estado_codigo: sin evidencia; revisión manual [corr. 2]
      m.region,                   -- ambito: equivalencia confirmada ("Zona/Ámbito Operativo" en modal y edición)
      m.metodologia,              -- metodologia: equivalencia confirmada (mismo concepto en modal y legacy)
      m.nivel_riesgo,             -- valor original conservado o NULL [corr. 2]
      m.sponsor,                  -- patrocinador: equivalencia confirmada ("Patrocinador/Stakeholder" en modal)
      m.presupuesto,              -- validado [corr. 3]
      m.moneda,                   -- evidenciada o NULL [corr. 3]
      NULL::date, NULL::date,
      jsonb_build_object(
        'legacy', jsonb_build_object(
          'id', m.legacy_id, 'code', m.legacy_code, 'region', m.region,
          'subtext', m.subtext, 'budget', m.budget, 'sponsor', m.sponsor,
          'risk_level', m.risk_level, 'metodologia', m.metodologia
        ),
        'presupuesto_original', m.budget,   -- dato original conservado a nivel raíz [corr. 3]
        'revision_pendiente', m.revision,   -- bandera por campo [corr. 1/2/3]
        'corrida_key', v_corrida_key
      ),
      m.legacy_id,
      COALESCE(m.created_at, now()), COALESCE(m.updated_at, now())
    FROM mapped m
    WHERE NOT EXISTS (
      SELECT 1 FROM public.gp_proyectos gp WHERE gp.legacy_source_id = m.legacy_id
    );
    GET DIAGNOSTICS v_proyectos_ins = ROW_COUNT;
  END IF;

  -- 2) Unidades territoriales (v3): NO existe gp_unidades_territoriales
  --    (decisión 3.6 §2.2 y encabezado de 0002: la jerarquía territorial vive en
  --    public.gestor_unidades). Acción: estampado ADITIVO para borrado lógico y
  --    trazabilidad del backfill. Sin inserts, sin cambios de datos existentes.
  IF to_regclass('public.gestor_unidades') IS NOT NULL THEN
    ALTER TABLE public.gestor_unidades ADD COLUMN IF NOT EXISTS legacy_source_id text;
    ALTER TABLE public.gestor_unidades ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
    UPDATE public.gestor_unidades
       SET legacy_source_id = id
     WHERE legacy_source_id IS NULL;
    GET DIAGNOSTICS v_unidades_ins = ROW_COUNT; -- unidades estampadas (no insertadas)
    -- Nota: la jerarquía (parent_unit_id) ya es nativa; no requiere resolución de padres.
  END IF;

  -- 3) Nodos EDT desde cronograma legado (dos pasadas: nodos, luego padres)
  IF to_regclass('public.gestor_cronograma_items') IS NOT NULL AND to_regclass('public.gestor_proyectos') IS NOT NULL THEN
    -- 3a) Insertar nodos (sin padre aún, se resuelve después)
    INSERT INTO public.gp_nodos_edt (
      id, proyecto_id, empresa_id, nodo_padre_id, wbs_code, nombre, descripcion, kind,
      is_entregable, estado, progreso, fecha_inicio, fecha_fin, fecha_inicio_real, fecha_fin_real,
      region, sede_texto, task_type, icon, metadata, legacy_source_id, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      gp.id,
      gp.empresa_id,
      NULL,
      ci.code,
      COALESCE(ci.name, ci.code, ci.id),
      NULLIF(ci.description,''),
      CASE WHEN ci.kind IN ('hito','subproceso') THEN ci.kind ELSE 'subproceso' END,
      -- (v3.1, punto 3) is_entregable: SOLO la UI lo declara (checkbox edtType='ENTREGABLE'
      -- en GanttEditorDrawer; persiste en localStorage). Sin el mapa localStorage se
      -- deja false + bandera 'is_entregable' en metadata.revision_pendiente (abajo);
      -- el merge P-1 la resuelve (true) y la limpia. Nada se fuerza a true sin evidencia.
      false,
      ci.status,
      LEAST(GREATEST(COALESCE(ci.progress,0),0),100)::numeric(5,2),
      ci.start_date, ci.end_date,
      ci.actual_start, ci.actual_end,
      ci.region,
      NULL,
      -- (v3.1, punto 2 → opción b) BD viva SIN columnas task_type/icon (migración 04
      -- sin evidencia de aplicación). Se escribe NULL y el merge P-1 desde localStorage
      -- (SCHEDULE_FIELDS: taskType, icon) las completa por legacy_source_id.
      NULL::text, NULL::text,
      jsonb_build_object(
        'legacy', jsonb_build_object(
          'id', ci.id, 'project_id', ci.project_id, 'parent_id', ci.parent_id,
          'deliverable', ci.deliverable, 'deliverables', ci.deliverables, 'attachments', ci.attachments,
          'gestor', ci.gestor, 'gestores', ci.gestores, 'report_type', ci.report_type,
          'baseline_start', ci.baseline_start, 'baseline_end', ci.baseline_end, 'tasks', ci.tasks, 'done', ci.done
        ),
        -- (v3.1) bandera de revisión del NODO: v3 siempre escribe revision_pendiente
        -- (proyectos: [] o sus banderas de campo; nodos: ['is_entregable']). Así el
        -- detector de filas de corridas previas (metadata ? 'revision_pendiente')
        -- sigue siendo fiable. El merge P-1 la resuelve y la limpia.
        'revision_pendiente', '["is_entregable"]'::jsonb,
        'corrida_key', v_corrida_key
      ),
      ci.id,
      COALESCE(ci.created_at, now()), COALESCE(ci.updated_at, now())
    FROM public.gestor_cronograma_items ci
    JOIN public.gestor_proyectos lp ON lp.id = ci.project_id
    JOIN public.gp_proyectos gp ON gp.legacy_source_id = lp.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.gp_nodos_edt n WHERE n.legacy_source_id = ci.id
    );
    GET DIAGNOSTICS v_nodos_ins = ROW_COUNT;

    -- 3b) Resolver jerarquía padre por legacy_source_id
    UPDATE public.gp_nodos_edt child
    SET nodo_padre_id = parent.id, updated_at = now()
    FROM public.gestor_cronograma_items ci
    JOIN public.gp_nodos_edt parent ON parent.legacy_source_id = ci.parent_id
    WHERE child.legacy_source_id = ci.id
      AND ci.parent_id IS NOT NULL
      AND child.nodo_padre_id IS DISTINCT FROM parent.id;

    -- 3c) Dependencias FS desde metadata legacy si existieran (complemento app/localStorage se mergea aparte)
    -- (placeholder idempotente: no-op si no hay fuente estructurada en BD legada)
  END IF;

  -- 3d) MERGES POST-BACKFILL DOCUMENTADOS (NO ejecutables desde este script).
  --     Corren desde app/servicio (P-1/P-2) o como merges controlados caso por caso
  --     (P-3/P-4), registrando su propia corrida en gp_corridas_migracion (p. ej.
  --     gp_merge_p1_<fecha>). Regla (punto 14): NADA crea tablas/columnas nuevas;
  --     lo no promovido a columna permanece en metadata.legacy.
  --
  --     P-1 · localStorage -> gp_nodos_edt (obligatorio tras esta corrida):
  --       fuente SCHEDULE_FIELDS (gestorCronogramaService.ts): taskType, icon,
  --       edtType, faseId, phase, dependencies (baseline/actual ya están en
  --       columnas de la migración 02). task_type/icon quedan NULL aquí; el merge
  --       escribe por legacy_source_id (= id legacy del ítem). edtType='ENTREGABLE'
  --       (checkbox GanttEditorDrawer) -> is_entregable=true + LIMPIAR la bandera
  --       'is_entregable' de metadata.revision_pendiente. 'expanded' se descarta.
  --     P-2 · edt_type_cached: 2ª pasada con resolveEdtNodeType
  --       (cronograma-core/edtPmbokModel.ts) sobre el árbol ya migrado (padres
  --       resueltos en 3b). Cache regenerable (0002): NO es fuente de verdad.
  --     P-3 · responsables (metadata.legacy.gestor/gestores, texto/array): merge
  --       controlado -> dedup en gp_personas + gp_edt_responsables_r. Sin SQL
  --       automático (match por nombre requiere revisión humana).
  --     P-4 · entregables embebidos (metadata.legacy.deliverable/deliverables):
  --       merge controlado -> gp_entregables (nodo_edt_id, proyecto_id); tipo/estado
  --       de catálogo NULL hasta definición funcional.
  --     P-5 · attachments: permanecen en metadata.legacy (decisión); migración a
  --       gp_archivos solo si las URLs se estructuran en la fase de integración.
  --     P-6 · sede_unidad_id: queda NULL (legacy sin id de unidad; match por región
  --       ambiguo) -> revisión humana contra public.gestor_unidades.
  --     P-7 · faseId/phase/dependencies (localStorage): fase -> gp_nodos_edt.fase_id
  --       vía gp_fases.legacy_source_id; dependencias -> gp_nodo_dependencias_r
  --       resolviendo los nodos por legacy_source_id.

  UPDATE public.gp_corridas_migracion
  SET estado = 'completada',
      filas_escritas = COALESCE(v_proyectos_ins,0) + COALESCE(v_unidades_ins,0) + COALESCE(v_nodos_ins,0),
      finalizado_at = now(),
      metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object(
        'proyectos_insertados', v_proyectos_ins,
        'unidades_estampadas', v_unidades_ins,
        'nodos_insertados', v_nodos_ins,
        'empresa_default', v_empresa_default
      )
  WHERE id = v_corrida_id;

EXCEPTION WHEN others THEN
  UPDATE public.gp_corridas_migracion
  SET estado = 'fallida', finalizado_at = now(),
      errores = COALESCE(errores,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE))
  WHERE corrida_key = v_corrida_key;
  RAISE;
END $$;

-- ==============================================================================
-- POST-BACKFILL (verificaciones sugeridas, solo lectura)
-- 1) Conteos: gestor_proyectos vs gp_proyectos(legacy), gestor_cronograma_items vs gp_nodos_edt(legacy)
-- 2) Huérfanos: nodos con nodo_padre_id inexistente, proyecto_id inexistente
-- 3) WBS únicos: duplicados (proyecto_id,wbs_code)
-- 4) Clasificación: validar con resolveEdtNodeType en capa app/servicio
-- 5) Merge localStorage: comparar por legacy_source_id y registrar en gp_corridas_migracion
-- 6) (v3, corr. 1/2/3) Revisión pendiente: listar filas con metadata->'revision_pendiente'
--    no vacía (estado / subtext / riesgo / riesgo_vacio / presupuesto / moneda) y decidir
--    caso por caso. El backfill NO asigna valores sin evidencia.
-- 7) (v3) Si la versión 20261112 se ejecutó antes: auditar filas con
--    metadata->>'corrida_key' = 'gp_backfill_v2_20261112_0100' cuyo estado_codigo o
--    nivel_riesgo hayan sido asignados por el mapeo antiguo ('en_curso', 'completado',
--    'medio'); reevaluar antes de dar por válida la migración. El detector fiable:
--    corrida_key v2 + metadata SIN 'revision_pendiente' (v3 siempre la escribe).
-- 8) (A-3) La corrida v3 se registra con key 'gp_backfill_v3_20261113_0100': el
--    registro de una corrida v2 previa en gp_corridas_migracion queda intacto como
--    evidencia (ON CONFLICT de v3 ya no toca esa fila). Filas nuevas escriben
--    metadata->>'corrida_key' = 'gp_backfill_v3_20261113_0100'.
-- 9) (v3.1) Pendiente P-1: nodos con la bandera 'is_entregable' sin resolver
--    (esperado: TODOS los nodos migrados, hasta ejecutar el merge localStorage):
--    select count(*) from public.gp_nodos_edt
--    where metadata->'revision_pendiente' @> '["is_entregable"]'::jsonb;
--    task_type/icon quedarán NULL hasta ese mismo merge (opción b del punto 2).
-- 10) (v3.1) Pendiente P-2: cache de clasificación EDT sin llenar (esperado: total
--    de nodos insertados; se llena en 2ª pasada con resolveEdtNodeType):
--    select count(*) from public.gp_nodos_edt where edt_type_cached is null;
-- 11) (v3.1) Huérfanos por parent_id legacy: nodos cuyo padre declarado no existe
--    (quedan nodo_padre_id NULL por diseño de 3b; reportar para revisión):
--    select n.legacy_source_id, n.wbs_code, n.nombre,
--           n.metadata->'legacy'->>'parent_id' as parent_legacy
--    from public.gp_nodos_edt n
--    where coalesce(n.metadata->'legacy'->>'parent_id','') <> ''
--      and not exists (select 1 from public.gp_nodos_edt p
--                      where p.legacy_source_id = n.metadata->'legacy'->>'parent_id');
-- ==============================================================================
