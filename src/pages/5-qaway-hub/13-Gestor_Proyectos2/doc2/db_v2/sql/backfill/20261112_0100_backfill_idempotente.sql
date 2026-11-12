-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · BACKFILL IDEMPOTENTE v2 (ETAPA 2B)
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
-- ==============================================================================

DO $$
DECLARE
  v_corrida_key text := 'gp_backfill_v2_20261112_0100';
  v_corrida_id uuid;
  v_empresa_default uuid := '00000000-0000-0000-0000-000000000001'; -- AJUSTAR tenant/empresa real
  v_proyectos_ins bigint := 0;
  v_unidades_ins bigint := 0;
  v_nodos_ins bigint := 0;
BEGIN
  -- Registrar corrida (idempotente)
  INSERT INTO public.gp_corridas_migracion (corrida_key, descripcion, origen, destino, estado)
  VALUES (v_corrida_key, 'Backfill inicial gestor_* -> gp_*', 'gestor_proyectos,gestor_cronograma_items,gestor_unidades', 'gp_proyectos,gp_nodos_edt,gp_unidades_territoriales', 'iniciada')
  ON CONFLICT (corrida_key) DO UPDATE SET estado = 'iniciada', iniciado_at = now(), finalizado_at = NULL;

  SELECT id INTO v_corrida_id FROM public.gp_corridas_migracion WHERE corrida_key = v_corrida_key;

  -- 1) Proyectos (si existe tabla legada)
  IF to_regclass('public.gestor_proyectos') IS NOT NULL THEN
    INSERT INTO public.gp_proyectos (
      id, empresa_id, codigo_proyecto, nombre, descripcion, estado_codigo,
      fecha_inicio, fecha_fin, presupuesto, metadata, legacy_source_id, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      v_empresa_default,
      COALESCE(p.code, p.id),
      COALESCE(p.name, p.code, p.id),
      NULLIF(trim(COALESCE(p.subtext,'') || CASE WHEN p.metodologia IS NOT NULL AND p.metodologia <> '' THEN E'\nMetodología: '||p.metodologia ELSE '' END), ''),
      CASE lower(COALESCE(p.risk_level,''))
        WHEN 'completado' THEN 'completado'
        ELSE 'en_curso'
      END,
      NULL::date, NULL::date,
      NULLIF(regexp_replace(COALESCE(p.budget,''), '[^0-9\.]', '', 'g'), '')::numeric(18,2),
      jsonb_build_object(
        'legacy', jsonb_build_object('id', p.id, 'code', p.code, 'region', p.region, 'subtext', p.subtext, 'budget', p.budget, 'sponsor', p.sponsor, 'risk_level', p.risk_level, 'metodologia', p.metodologia),
        'corrida_key', v_corrida_key
      ),
      p.id,
      COALESCE(p.created_at, now()), COALESCE(p.updated_at, now())
    FROM public.gestor_proyectos p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.gp_proyectos gp WHERE gp.legacy_source_id = p.id
    );
    GET DIAGNOSTICS v_proyectos_ins = ROW_COUNT;
  END IF;

  -- 2) Unidades territoriales (si existe tabla legada)
  IF to_regclass('public.gestor_unidades') IS NOT NULL THEN
    INSERT INTO public.gp_unidades_territoriales (
      id, empresa_id, unidad_padre_id, tipo_codigo, codigo, nombre, region, macroregion, direccion, estado, metadata, legacy_source_id, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      COALESCE(NULLIF(u.tenant_id,'')::uuid, v_empresa_default),
      NULL, -- parent se resuelve en segunda pasada
      CASE lower(COALESCE(u.unit_type,'ugel'))
        WHEN 'dre' THEN 'dre' WHEN 'ugel' THEN 'ugel' WHEN 'red' THEN 'red' WHEN 'gre' THEN 'gre' ELSE 'otro' END,
      COALESCE(NULLIF(u.code,''), u.id),
      COALESCE(u.name, u.code, u.id),
      u.region, u.macroregion, u.address,
      COALESCE(NULLIF(u.status,''), 'activo'),
      COALESCE(u.metadata,'{}'::jsonb) || jsonb_build_object('legacy_id', u.id, 'legacy_parent_unit_id', u.parent_unit_id, 'corrida_key', v_corrida_key),
      u.id,
      COALESCE(u.created_at, now()), COALESCE(u.updated_at, now())
    FROM public.gestor_unidades u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.gp_unidades_territoriales gu WHERE gu.legacy_source_id = u.id OR gu.codigo = COALESCE(NULLIF(u.code,''), u.id)
    )
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      region = EXCLUDED.region,
      metadata = public.gp_unidades_territoriales.metadata || EXCLUDED.metadata,
      updated_at = now();
    GET DIAGNOSTICS v_unidades_ins = ROW_COUNT;

    -- Segunda pasada: resolver unidad_padre_id por legacy
    UPDATE public.gp_unidades_territoriales child
    SET unidad_padre_id = parent.id, updated_at = now()
    FROM public.gestor_unidades lu
    JOIN public.gp_unidades_territoriales parent ON parent.legacy_source_id = lu.parent_unit_id
    WHERE child.legacy_source_id = lu.id
      AND lu.parent_unit_id IS NOT NULL
      AND child.unidad_padre_id IS DISTINCT FROM parent.id;
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
      false, -- is_entregable declarado: ajustar en merge/controlado
      ci.status,
      LEAST(GREATEST(COALESCE(ci.progress,0),0),100)::numeric(5,2),
      ci.start_date, ci.end_date,
      ci.actual_start, ci.actual_end,
      ci.region,
      NULL,
      ci.task_type, ci.icon,
      jsonb_build_object(
        'legacy', jsonb_build_object(
          'id', ci.id, 'project_id', ci.project_id, 'parent_id', ci.parent_id,
          'deliverable', ci.deliverable, 'deliverables', ci.deliverables, 'attachments', ci.attachments,
          'gestor', ci.gestor, 'gestores', ci.gestores, 'report_type', ci.report_type,
          'baseline_start', ci.baseline_start, 'baseline_end', ci.baseline_end, 'tasks', ci.tasks, 'done', ci.done
        ),
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

  UPDATE public.gp_corridas_migracion
  SET estado = 'completada',
      filas_escritas = COALESCE(v_proyectos_ins,0) + COALESCE(v_unidades_ins,0) + COALESCE(v_nodos_ins,0),
      finalizado_at = now(),
      metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object(
        'proyectos_insertados', v_proyectos_ins,
        'unidades_insertadas', v_unidades_ins,
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
-- ==============================================================================
