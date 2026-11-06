/**
 * QAWAY LAB · Servicio de Persistencia en Supabase para el Gestor de Proyectos
 * Maneja la sincronización bidireccional entre la base de datos Supabase y el estado local.
 */
import { supabase } from './supabaseClient';
import { isLegacyCronogramaItem, sortWbsHierarchy } from '../modules/cronograma-gantt/edtPmbokModel';

export type EdtNodeType =
  | 'FASE'
  | 'COMPONENTE'
  | 'SUBCOMPONENTE'
  | 'PAQUETE_TRABAJO'
  | 'ENTREGABLE'
  | 'HITO';

export interface Fase {
  id: string;
  code: string;
  name: string;
  description?: string;
  order: number;
}

export interface GanttItemData {
  id: string;
  code: string;
  name: string;
  kind: 'hito' | 'subproceso';
  /** Clasificación metodológica oficial PMI/PMBOK (EDT/WBS) */
  edtType?: EdtNodeType;
  /** Identificador opcional de la Fase del ciclo de vida (nullable) */
  faseId?: string | null;
  parentId?: string;
  children?: GanttItemData[];
  start: string;
  end: string;
  progress: number;
  status: string;
  expanded?: boolean;
  description?: string;
  deliverable?: string;
  deliverables?: any[];
  attachments?: any[];
  reportType?: string;
  region?: string;
  gestor?: string;
  gestores?: string[];
  tasks?: number;
  done?: number;
  unit?: string;
  phase?: string | null;
  /** Línea base aprobada y fechas reales (Fase 1 de control de plazos). */
  baselineStart?: string;
  baselineEnd?: string;
  actualStart?: string;
  actualEnd?: string;
}

// Convertidor de modelo de frontend hacia columnas de base de datos Supabase
const toSupabaseRow = (projectId: string, item: GanttItemData) => ({
  id: item.id,
  project_id: projectId,
  code: item.code,
  name: item.name,
  kind: item.kind,
  parent_id: item.parentId || null,
  start_date: item.start,
  end_date: item.end,
  progress: item.progress ?? 0,
  status: item.status || 'Pendiente',
  expanded: item.expanded ?? true,
  description: item.description || '',
  deliverable: item.deliverable || '',
  deliverables: item.deliverables || [],
  attachments: item.attachments || [],
  report_type: item.reportType || 'Línea de tiempo',
  region: item.region || 'Todas',
  gestor: item.gestor || 'Sin asignar',
  gestores: item.gestores || [],
  tasks: item.tasks || 0,
  done: item.done || 0,
  baseline_start: item.baselineStart || null,
  baseline_end: item.baselineEnd || null,
  actual_start: item.actualStart || null,
  actual_end: item.actualEnd || null,
  updated_at: new Date().toISOString(),
});

// Convertidor de fila de Supabase hacia modelo del frontend
const fromSupabaseRow = (row: any): GanttItemData => ({
  id: row.id,
  code: row.code,
  name: row.name,
  kind: row.kind,
  parentId: row.parent_id || undefined,
  start: row.start_date,
  end: row.end_date,
  progress: row.progress ?? 0,
  status: row.status || 'Pendiente',
  expanded: row.expanded ?? true,
  description: row.description || '',
  deliverable: row.deliverable || '',
  deliverables: row.deliverables || [],
  attachments: row.attachments || [],
  reportType: row.report_type || 'Línea de tiempo',
  region: row.region || 'Todas',
  gestor: row.gestor || 'Sin asignar',
  gestores: row.gestores || [],
  tasks: row.tasks || 0,
  done: row.done || 0,
  baselineStart: row.baseline_start || undefined,
  baselineEnd: row.baseline_end || undefined,
  actualStart: row.actual_start || undefined,
  actualEnd: row.actual_end || undefined,
});

/* Columnas de la Fase 1 (supabase/02_gestor_cronograma_linea_base.sql). */
const SCHEDULE_COLUMNS = ['baseline_start', 'baseline_end', 'actual_start', 'actual_end'] as const;
const SCHEDULE_FIELDS = ['baselineStart', 'baselineEnd', 'actualStart', 'actualEnd', 'edtType', 'faseId', 'phase', 'dependencies'] as const;

/**
 * Upsert tolerante al esquema: si la BD aún no tiene las columnas de línea base/fechas reales,
 * reintenta sin ellas para no romper la sincronización del resto de campos
 * (esos datos siguen en el respaldo local hasta ejecutar el SQL).
 */
async function upsertRows(rows: Record<string, any>[]): Promise<{ message: string } | null> {
  const first = await supabase!.from('gestor_cronograma_items').upsert(rows);
  if (!first.error) return null;
  if (SCHEDULE_COLUMNS.some((col) => first.error!.message.includes(col))) {
    console.warn('[Supabase Cronograma] Falta ejecutar supabase/02_gestor_cronograma_linea_base.sql; se sincroniza sin línea base ni fechas reales.');
    const stripped = rows.map((r) => {
      const copy = { ...r };
      SCHEDULE_COLUMNS.forEach((col) => delete copy[col]);
      return copy;
    });
    const retry = await supabase!.from('gestor_cronograma_items').upsert(stripped);
    return retry.error ? { message: retry.error.message } : null;
  }
  return { message: first.error.message };
}

/**
 * Carga los ítems del cronograma desde Supabase para el proyecto dado.
 * Si la tabla o conexión no está disponible, retorna null para activar el fallback local.
 */
export async function fetchCronogramaFromSupabase(projectId: string): Promise<GanttItemData[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('gestor_cronograma_items')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.warn('[Supabase Cronograma] Aviso al leer (se usará respaldo local):', error.message);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      // Reconciliación de integridad referencial: validar y depurar huérfanos sin padre
      const validIds = new Set(data.map((r) => r.id));
      const validRows = data.filter((row) => !row.parent_id || validIds.has(row.parent_id));

      if (validRows.length < data.length) {
        const orphanIds = data
          .filter((r) => r.parent_id && !validIds.has(r.parent_id))
          .map((r) => r.id);
        if (orphanIds.length > 0) {
          void Promise.resolve(
            supabase
              .from('gestor_cronograma_items')
              .delete()
              .in('id', orphanIds)
              .eq('project_id', projectId)
          )
            .then(() => {})
            .catch(() => {});
        }
      }

      const mapped = sortWbsHierarchy(validRows.map(fromSupabaseRow));
      // Si la BD aún no guarda línea base/fechas reales, se conservan las del respaldo local.
      try {
        const local = JSON.parse(localStorage.getItem(`qaway-gantt-items-${projectId}`) || '[]');
        if (Array.isArray(local)) {
          const byId = new Map(local.map((l: any) => [l.id, l]));
          mapped.forEach((m: any) => {
            const l: any = byId.get(m.id);
            if (!l) return;
            SCHEDULE_FIELDS.forEach((f) => {
              if (!m[f] && l[f]) m[f] = l[f];
            });
          });
        }
      } catch {
        /* respaldo local no disponible */
      }
      try {
        localStorage.setItem(`qaway-gantt-items-${projectId}`, JSON.stringify(mapped));
      } catch {
        /* fallback */
      }
      return mapped;
    }

    return [];
  } catch (err) {
    console.warn('[Supabase Cronograma] Excepción de conexión:', err);
    return null;
  }
}

/**
 * Sincroniza un ítem individual (creación o actualización) en Supabase.
 */
export async function upsertCronogramaItemInSupabase(projectId: string, item: GanttItemData): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = toSupabaseRow(projectId, item);
    const error = await upsertRows([row]);

    if (error) {
      console.warn('[Supabase Cronograma] No se pudo sincronizar ítem en BD:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Cronograma] Error al sincronizar ítem:', err);
    return false;
  }
}

/**
 * Sincroniza en lote toda la lista de ítems de un proyecto a Supabase con reconciliación bidireccional:
 * 1. Inserta o actualiza los ítems presentes en el estado local.
 * 2. Elimina de Supabase cualquier ítem existente en BD que ya no figure en la lista local (soporte de borrado real y sin parches).
 */
export async function syncAllCronogramaItemsToSupabase(projectId: string, items: GanttItemData[]): Promise<boolean> {
  if (!supabase || !items) return true;
  try {
    const currentIds = new Set(items.map((it) => it.id));

    // Reconciliación: detectar y eliminar en Supabase los registros que fueron eliminados localmente
    const { data: existingRows } = await supabase
      .from('gestor_cronograma_items')
      .select('id')
      .eq('project_id', projectId);

    if (Array.isArray(existingRows)) {
      const toDelete = existingRows
        .filter((r) => !currentIds.has(r.id))
        .map((r) => r.id);

      if (toDelete.length > 0) {
        await supabase
          .from('gestor_cronograma_items')
          .delete()
          .in('id', toDelete)
          .eq('project_id', projectId);
      }
    }

    if (items.length > 0) {
      const rows = items.map((it) => toSupabaseRow(projectId, it));
      const error = await upsertRows(rows);

      if (error) {
        console.warn('[Supabase Cronograma] No se pudo sincronizar lote en BD:', error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Cronograma] Error al sincronizar lote:', err);
    return false;
  }
}

/**
 * Elimina un ítem de Supabase (por id) y opcionalmente todos sus descendientes en cascada.
 */
export async function deleteCronogramaItemFromSupabase(
  projectId: string,
  itemId: string,
  descendantIds: string[] = []
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const allIds = Array.from(new Set([itemId, ...descendantIds]));
    const { error } = await supabase
      .from('gestor_cronograma_items')
      .delete()
      .eq('project_id', projectId)
      .in('id', allIds);

    if (error) {
      console.warn('[Supabase Cronograma] No se pudo eliminar ítem en BD:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Cronograma] Error al eliminar ítem:', err);
    return false;
  }
}
