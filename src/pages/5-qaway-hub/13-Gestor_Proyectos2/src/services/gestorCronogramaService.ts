/**
 * QAWAY LAB · Servicio de Persistencia en Supabase para el Gestor de Proyectos
 * Maneja la sincronización bidireccional entre la base de datos Supabase y el estado local.
 */
import { supabase } from './supabaseClient';
import { cargarPerfilGp } from './gpPermisosService';
import { isLegacyCronogramaItem, sortWbsHierarchy } from '../modules/cronograma-gantt/edtPmbokModel';

/** Re-export del catálogo único de tipos de nodo EDT (no redefinir aquí). */
export type { EdtNodeType, Fase } from '../modules/cronograma-core/edtPmbokModel';
import type { EdtNodeType } from '../modules/cronograma-core/edtPmbokModel';

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
  /** Predecesores de la cadena de prelación (ids de otros ítems del proyecto). */
  dependencies?: string[];
  /** Línea base aprobada y fechas reales (Fase 1 de control de plazos). */
  baselineStart?: string;
  baselineEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  /** Tipo oficial de tarea (Reunión, Asistencia técnica, Informe, etc.) e icono Lucide */
  taskType?: string;
  icon?: string;
}

// Convertidor de modelo de frontend hacia columnas de base de datos Supabase
const toSupabaseRow = (projectId: string, item: GanttItemData, tenantId?: string | null) => ({
  id: item.id,
  project_id: projectId,
  ...(tenantId ? { tenant_id: tenantId } : {}),
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
  task_type: item.taskType || null,
  icon: item.icon || null,
  edt_type: item.edtType || null,
  dependencies: item.dependencies || [],
  updated_at: new Date().toISOString(),
});

// Convertidor de fila de Supabase hacia modelo del frontend
const fromSupabaseRow = (row: any): GanttItemData => ({
  id: row.id,
  code: row.code,
  name: row.name,
  kind: row.kind,
  edtType: (row.edt_type as EdtNodeType | null) || undefined,
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
  dependencies: Array.isArray(row.dependencies) ? row.dependencies : undefined,
  baselineStart: row.baseline_start || undefined,
  baselineEnd: row.baseline_end || undefined,
  actualStart: row.actual_start || undefined,
  actualEnd: row.actual_end || undefined,
  taskType: row.task_type || undefined,
  icon: row.icon || undefined,
});

/* Columnas de la Fase 1 (supabase/02_gestor_cronograma_linea_base.sql) y Tipo/Icono. */
const SCHEDULE_COLUMNS = ['baseline_start', 'baseline_end', 'actual_start', 'actual_end', 'task_type', 'icon', 'edt_type', 'dependencies'] as const;
const SCHEDULE_FIELDS = ['baselineStart', 'baselineEnd', 'actualStart', 'actualEnd', 'taskType', 'icon', 'edtType', 'faseId', 'phase', 'dependencies'] as const;

/**
 * Tenant dueño de la fila del cronograma. La RLS de `gestor_cronograma_items` exige
 * `tenant_id = get_auth_tenant_id()`, y el default de la columna es justamente ese valor:
 * una cuenta de plataforma sin empresa propia guardaba filas con tenant NULL (huérfanas).
 *   1. Tenant de la sesión (public.users.tenant_id).
 *   2. Cuenta plataforma sin empresa: el del proyecto, que es el dueño real de sus ítems.
 * Si no se resuelve ninguno, se omite la columna y manda el default de la BD (comportamiento previo).
 */
async function resolverTenantId(projectId: string): Promise<string | null> {
  try {
    const perfil = await cargarPerfilGp();
    if (perfil?.tenantId) return perfil.tenantId;
  } catch {
    /* sin sesión legible: se intenta por proyecto */
  }
  if (!supabase || !projectId) return null;
  try {
    const { data } = await supabase
      .from('gestor_proyectos')
      .select('tenant_id')
      .eq('id', projectId)
      .maybeSingle();
    return (data as { tenant_id?: string | null } | null)?.tenant_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Upsert tolerante al esquema: si la BD aún no tiene las columnas de línea base/fechas reales,
 * reintenta sin ellas para no romper la sincronización del resto de campos
 * (esos datos siguen en el respaldo local hasta ejecutar el SQL).
 */
async function upsertRows(rows: Record<string, any>[]): Promise<{ message: string } | null> {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const first = await supabase!.from('gestor_cronograma_items').upsert(chunk);
    if (first.error) {
      if (SCHEDULE_COLUMNS.some((col) => first.error!.message.includes(col))) {
        console.warn('[Supabase Cronograma] Faltan columnas opcionales (02_gestor_cronograma_linea_base.sql / 04_gestor_tareas_tipo_icono.sql / 05_gestor_cronograma_edt_dependencias.sql); se sincroniza sin ellas.');
        const stripped = chunk.map((r) => {
          const copy = { ...r };
          SCHEDULE_COLUMNS.forEach((col) => delete copy[col]);
          return copy;
        });
        const retry = await supabase!.from('gestor_cronograma_items').upsert(stripped);
        if (retry.error) return { message: retry.error.message };
      } else {
        return { message: first.error.message };
      }
    }
  }
  return null;
}

/* P2 (gstack 08): columnas explícitas de la lectura (superset exacto de los campos que mapea fromSupabaseRow). */
const CRONOGRAMA_SELECT =
  'id,code,name,kind,parent_id,start_date,end_date,progress,status,expanded,description,deliverable,deliverables,attachments,report_type,region,gestor,gestores,tasks,done,baseline_start,baseline_end,actual_start,actual_end,edt_type,dependencies';

/**
 * P1 (gstack 08): dedup de promesas en vuelo por proyecto — evita la doble lectura del gantt
 * causada por el doble montaje (StrictMode) y por consumidores múltiples en carga fría.
 */
const inFlightCronograma = new Map<string, Promise<GanttItemData[] | null>>();

/**
 * Carga los ítems del cronograma desde Supabase para el proyecto dado.
 * Si la tabla o conexión no está disponible, retorna null para activar el fallback local.
 */
export async function fetchCronogramaFromSupabase(projectId: string): Promise<GanttItemData[] | null> {
  if (!supabase) return null;
  const db = supabase;
  const key = `project:${projectId}`;
  const existing = inFlightCronograma.get(key);
  if (existing) return existing;
  const run = (async (): Promise<GanttItemData[] | null> => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    try {
      let respuesta = await db
        .from('gestor_cronograma_items')
        .select(CRONOGRAMA_SELECT)
        .eq('project_id', projectId)
        .limit(15000)
        .abortSignal(controller.signal);

      // Tolerante al esquema (mismo criterio de upsertRows): si una columna de la lista explícita
      // aún no existe en la BD, relee con select=* para no romper la carga del cronograma.
      if (respuesta.error) {
        respuesta = await db
          .from('gestor_cronograma_items')
          .select('*')
          .eq('project_id', projectId)
          .limit(15000)
          .abortSignal(controller.signal);
      }

      if (respuesta.error) {
        console.warn('[Supabase Cronograma] Aviso al leer (se usará respaldo local):', respuesta.error.message);
        return null;
      }

      const data = respuesta.data;
      if (Array.isArray(data) && data.length > 0) {
        const mapped = sortWbsHierarchy(data.map(fromSupabaseRow));
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
        // F3 (auditoría 08): persistencia de respaldo NO bloqueante — el stringify de ~6,000 filas
        // se pospone al idle del hilo (antes detenía el render final con un paso síncrono).
        const programarEscritura =
          typeof (globalThis as { requestIdleCallback?: unknown }).requestIdleCallback === 'function'
            ? (cb: () => void) => (globalThis as unknown as { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(cb, { timeout: 2000 })
            : (cb: () => void) => window.setTimeout(cb, 1500);
        programarEscritura(() => {
          try {
            localStorage.setItem(`qaway-gantt-items-${projectId}`, JSON.stringify(mapped));
          } catch {
            /* fallback */
          }
        });
        return mapped;
      }

      return [];
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        console.warn('[Supabase Cronograma] Excepción de conexión:', err);
      }
      return null;
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();
  inFlightCronograma.set(key, run);
  try {
    return await run;
  } finally {
    inFlightCronograma.delete(key);
  }
}

/**
 * Sincroniza un ítem individual (creación o actualización) en Supabase.
 */
export async function upsertCronogramaItemInSupabase(projectId: string, item: GanttItemData): Promise<boolean> {
  if (!supabase) return false;
  try {
    const tenantId = await resolverTenantId(projectId);
    const row = toSupabaseRow(projectId, item, tenantId);
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
  if (!supabase || !items || items.length === 0) return true;
  try {
    const tenantId = await resolverTenantId(projectId);
    const rows = items.map((it) => toSupabaseRow(projectId, it, tenantId));
    const error = await upsertRows(rows);

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

/**
 * [DESHABILITADO - NO USAR HASTA INDICACIÓN DIRECTA DE ADMIN DE PLATAFORMA]
 * Suscripción en tiempo real (Supabase Realtime).
 * Desactivado intencionalmente para evitar costos innecesarios por conexiones WebSocket
 * y multiplicación de mensajes (Fan-Out). Ningún agente debe activarlo sin autorización explícita.
 */
export function subscribeCronogramaRealtime(
  _projectId: string,
  _onRemoteChange: () => void
): () => void {
  return () => {};
}
