/**
 * gpTareasService.ts — Tareas operativas tenant-scoped en public.gp_tareas.
 * ==========================================================================
 * Sustituye al almacén global `localStorage['qaway-tasks-v1']` en los módulos
 * Tareas y Reportes. La fuente de verdad pasa a ser la BD: RLS por empresa_id
 * garantiza que un tenant nuevo arranque sin tareas y que DIGERE conserve las
 * suyas (migradas una sola vez desde el storage legado).
 *
 * El modelo del frontend es dinámico (checklist, comments, history, ...). Esos
 * campos se conservan íntegros en `metadata`; las columnas canónicas de
 * gp_tareas se derivan de ellos para reportes/auditoría.
 */

import { supabase } from './supabaseClient';
import { exigirContextoLectura, exigirContextoEscritura } from './contextoSesion';
import { esTenantMineduPrincipal } from './gestorTareasLocalService';

export interface TareaOperativa {
  id: string | number;
  [clave: string]: any;
}

const CLAVE_LEGADA = 'qaway-tasks-v1';
const SELECT = 'id,legacy_source_id,titulo,descripcion,estado_codigo,prioridad_codigo,fecha_vencimiento,progreso,orden,metadata,is_deleted';

const cacheUuidProyecto = new Map<string, Promise<string | null>>();
const migracionesEnCurso = new Map<string, Promise<void>>();

const esUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const fechaIso = (v: unknown): string | null => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(v)) return null;
  return v.slice(0, 10);
};

const ESTADOS: Record<string, string> = {
  pendiente: 'pendiente',
  'en curso': 'en_proceso',
  en_proceso: 'en_proceso',
  'en proceso': 'en_proceso',
  'en revisión': 'en_revision',
  en_revision: 'en_revision',
  cumple: 'completado',
  completado: 'completado',
  completada: 'completado',
  bloqueada: 'bloqueada',
  cancelada: 'cancelada',
};
const PRIORIDADES: Record<string, string> = {
  alta: 'alta',
  media: 'media',
  baja: 'baja',
  urgente: 'urgente',
};

function codigoEstado(v: unknown): string | null {
  const s = texto(v)?.toLowerCase();
  return (s && ESTADOS[s]) || null;
}
function codigoPrioridad(v: unknown): string | null {
  const s = texto(v)?.toLowerCase();
  return (s && PRIORIDADES[s]) || null;
}
function progresoDe(t: TareaOperativa): number {
  const checklist = Array.isArray(t.checklist) ? t.checklist : [];
  if (!checklist.length) return typeof t.progreso === 'number' ? t.progreso : 0;
  const hechos = checklist.filter((c: any) => c && c.done === true).length;
  return Math.round((hechos / checklist.length) * 100);
}

/** id del proyecto gp_proyectos (UUID) a partir del id del frontend (legacy_source_id='p1'). */
function resolverUuidProyecto(proyectoId: string): Promise<string | null> {
  if (!proyectoId) return Promise.resolve(null);
  const existente = cacheUuidProyecto.get(proyectoId);
  if (existente) return existente;
  if (esUuid(proyectoId)) {
    cacheUuidProyecto.set(proyectoId, Promise.resolve(proyectoId));
    return Promise.resolve(proyectoId);
  }
  if (!supabase) return Promise.resolve(null);
  const db = supabase;
  const promesa = (async () => {
    const { data, error } = await db
      .from('gp_proyectos')
      .select('id')
      .or(`legacy_source_id.eq.${proyectoId},id.eq.${proyectoId}`)
      .is('is_deleted', false)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return String(data.id);
  })().then((uuid) => {
    // No cachear un "no existe": el proyecto puede crearse justo después.
    if (uuid) cacheUuidProyecto.set(proyectoId, Promise.resolve(uuid));
    else cacheUuidProyecto.delete(proyectoId);
    return uuid;
  });
  cacheUuidProyecto.set(proyectoId, promesa);
  return promesa;
}

export function invalidarCacheTareasGp(): void {
  cacheUuidProyecto.clear();
  migracionesEnCurso.clear();
}

function deFila(row: any): TareaOperativa {
  const meta = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  const legacy = row.legacy_source_id ?? meta.id ?? row.id;
  // El legado usa ids numéricos y los handlers comparan con ===; conservar el tipo.
  const id = typeof legacy === 'string' && /^\d+$/.test(legacy) ? Number(legacy) : legacy;
  return {
    ...meta,
    id,
    title: meta.title ?? row.titulo ?? '',
    status: meta.status ?? row.estado_codigo ?? 'Pendiente',
    priority: meta.priority ?? row.prioridad_codigo ?? 'Media',
    due: meta.due ?? row.fecha_vencimiento ?? undefined,
    description: meta.description ?? row.descripcion ?? '',
    _dbId: row.id,
  };
}

function aFila(t: TareaOperativa, proyectoUuid: string, empresaId: string, userId: string, orden: number) {
  const { id, _dbId, ...meta } = t;
  return {
    proyecto_id: proyectoUuid,
    empresa_id: empresaId,
    titulo: String(t.title ?? t.titulo ?? 'Sin título'),
    descripcion: texto(t.description) ?? null,
    estado_codigo: codigoEstado(t.status),
    prioridad_codigo: codigoPrioridad(t.priority),
    fecha_vencimiento: fechaIso(t.due),
    progreso: progresoDe(t),
    orden,
    metadata: { ...meta, id, title: t.title ?? '' },
    legacy_source_id: String(id),
    is_deleted: false,
    created_by: userId,
    updated_by: userId,
  };
}

/** Migración única del storage legado de DIGERE → gp_tareas (idempotente por legacy_source_id). */
async function migrarLegado(proyectoId: string, proyectoUuid: string, tenantId: string, userId: string): Promise<void> {
  if (!esTenantMineduPrincipal(tenantId) || !supabase) return;
  const clave = `${tenantId}::${proyectoId}`;
  const enCurso = migracionesEnCurso.get(clave);
  if (enCurso) return enCurso;

  const promesa = (async () => {
    let legado: TareaOperativa[] = [];
    try {
      const raw = localStorage.getItem(CLAVE_LEGADA);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) legado = parsed;
    } catch {
      return;
    }
    if (!legado.length) return;

    const db = supabase!;
    const { data: existentes } = await db
      .from('gp_tareas')
      .select('legacy_source_id')
      .eq('empresa_id', tenantId)
      .eq('proyecto_id', proyectoUuid);
    const ya = new Set((existentes ?? []).map((r: any) => String(r.legacy_source_id)));
    const nuevos = legado
      .filter((t) => t && t.id != null && !ya.has(String(t.id)))
      .map((t, i) => aFila(t, proyectoUuid, tenantId, userId, i));
    if (!nuevos.length) return;
    const { error } = await db.from('gp_tareas').insert(nuevos);
    if (error) {
      console.warn('[gpTareas] no se pudo migrar el legado de DIGERE:', error.message);
    }
  })();
  migracionesEnCurso.set(clave, promesa);
  try {
    await promesa;
  } finally {
    migracionesEnCurso.delete(clave);
  }
}

/** Lee todas las tareas del tenant+proyecto. Lanza fail-closed si no hay sesión válida. */
export async function leerTareasGp(proyectoId: string): Promise<TareaOperativa[]> {
  const ctx = await exigirContextoLectura();
  if (!supabase || !ctx.tenantId) return [];
  const uuid = await resolverUuidProyecto(proyectoId);
  if (!uuid) return [];
  await migrarLegado(proyectoId, uuid, ctx.tenantId, ctx.userId);
  const { data, error } = await supabase
    .from('gp_tareas')
    .select(SELECT)
    .eq('empresa_id', ctx.tenantId)
    .eq('proyecto_id', uuid)
    .eq('is_deleted', false)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(5000);
  if (error) {
    console.warn('[gpTareas] aviso al leer:', error.message);
    return [];
  }
  return (data ?? []).map(deFila);
}

/** Persiste la lista completa (upsert por legacy_source_id; soft-delete de las ausentes). */
export async function guardarTareasGp(proyectoId: string, tareas: TareaOperativa[]): Promise<void> {
  const ctx = await exigirContextoEscritura();
  if (!supabase || !ctx.tenantId) return;
  const uuid = await resolverUuidProyecto(proyectoId);
  if (!uuid) return;
  const db = supabase;

  const { data: existentes } = await db
    .from('gp_tareas')
    .select('id,legacy_source_id')
    .eq('empresa_id', ctx.tenantId)
    .eq('proyecto_id', uuid)
    .eq('is_deleted', false);
  const porLegacy = new Map((existentes ?? []).map((r: any) => [String(r.legacy_source_id), String(r.id)]));

  const ids = new Set<string>();
  for (let i = 0; i < tareas.length; i += 1) {
    const t = tareas[i];
    if (t == null || t.id == null) continue;
    const legacy = String(t.id);
    ids.add(legacy);
    const fila = aFila(t, uuid, ctx.tenantId, ctx.userId, i);
    const dbId = porLegacy.get(legacy);
    if (dbId) {
      const { created_by: _creado, ...filaUpdate } = fila;
      const { error } = await db.from('gp_tareas').update({ ...filaUpdate, updated_by: ctx.userId }).eq('id', dbId);
      if (error) console.warn('[gpTareas] no se pudo actualizar:', error.message);
    } else {
      const { error } = await db.from('gp_tareas').insert(fila);
      if (error) console.warn('[gpTareas] no se pudo insertar:', error.message);
    }
  }

  const aBorrar = [...porLegacy.entries()].filter(([legacy]) => !ids.has(legacy)).map(([, dbId]) => dbId);
  if (aBorrar.length) {
    const { error } = await db.from('gp_tareas').update({ is_deleted: true, updated_by: ctx.userId }).in('id', aBorrar);
    if (error) console.warn('[gpTareas] no se pudo marcar como eliminadas:', error.message);
  }
}
