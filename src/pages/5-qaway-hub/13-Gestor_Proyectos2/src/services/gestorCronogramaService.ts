/**
 * QAWAY LAB · Servicio de Persistencia en Supabase para el Gestor de Proyectos
 * Maneja la sincronización bidireccional entre la base de datos Supabase y el estado local.
 */
import { supabase } from './supabaseClient';

export interface GanttItemData {
  id: string;
  code: string;
  name: string;
  kind: 'hito' | 'subproceso';
  parentId?: string;
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
  phase?: string;
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
});

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
      .eq('project_id', projectId)
      .order('code', { ascending: true });

    if (error) {
      console.warn('[Supabase Cronograma] Aviso al leer (se usará respaldo local):', error.message);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(fromSupabaseRow);
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
    const { error } = await supabase.from('gestor_cronograma_items').upsert(row);

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
 * Sincroniza en lote toda la lista de ítems de un proyecto a Supabase.
 */
export async function syncAllCronogramaItemsToSupabase(projectId: string, items: GanttItemData[]): Promise<boolean> {
  if (!supabase || !items || items.length === 0) return true;
  try {
    const rows = items.map((it) => toSupabaseRow(projectId, it));
    const { error } = await supabase.from('gestor_cronograma_items').upsert(rows);

    if (error) {
      console.warn('[Supabase Cronograma] No se pudo sincronizar lote en BD:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Cronograma] Error al sincronizar lote:', err);
    return false;
  }
}

/**
 * Elimina un ítem de Supabase (por id).
 */
export async function deleteCronogramaItemFromSupabase(itemId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('gestor_cronograma_items').delete().eq('id', itemId);

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
