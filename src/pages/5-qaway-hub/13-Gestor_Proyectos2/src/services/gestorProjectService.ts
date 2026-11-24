import { supabase } from './supabaseClient';
import type { ProjectItem } from '../App';

type ProjectRow = {
  id: string;
  code: string;
  name: string;
  region?: string | null;
  subtext?: string | null;
  budget?: string | null;
  sponsor?: string | null;
  risk_level?: string | null;
  metodologia?: string | null;
  tenant_id?: string | null;
  central_unit_id?: string | null;
};

const fromRow = (row: ProjectRow): ProjectItem => ({
  id: row.id,
  code: row.code,
  name: row.name,
  region: row.region || 'Nacional',
  subtext: row.subtext || '',
  budget: row.budget || '',
  sponsor: row.sponsor || '',
  riskLevel: row.risk_level || 'Medio',
  metodologia: row.metodologia || '',
});

const toRow = (project: ProjectItem, tenantId?: string | null) => ({
  id: project.id,
  code: project.code,
  name: project.name,
  region: project.region,
  subtext: project.subtext || '',
  budget: project.budget || '',
  sponsor: project.sponsor || '',
  risk_level: project.riskLevel || 'Medio',
  metodologia: project.metodologia || '',
  ...(tenantId ? { tenant_id: tenantId } : {}),
  updated_at: new Date().toISOString(),
});

/**
 * P1 (gstack 08): dedup de peticiones en vuelo — si una lectura idéntica ya está
 * en curso, se comparte su promesa (evita duplicados por StrictMode/doble montaje
 * y por consumidores múltiples del mismo recurso en carga fría).
 */
const inFlightProjects = new Map<string, Promise<ProjectItem[]>>();

/**
 * Project persistence before Hub login integration.
 * tenantId is intentionally explicit and optional; it must not be inferred
 * from a session until the authentication phase is approved.
 */
export async function listGestorProjects(tenantId?: string | null): Promise<ProjectItem[]> {
  if (!supabase) return [];
  const db = supabase;
  const key = `tenant:${tenantId ?? 'all'}`;
  const existing = inFlightProjects.get(key);
  if (existing) return existing;
  const run = (async (): Promise<ProjectItem[]> => {
    // P2 (gstack 08): columnas explícitas (superset de todo campo que mapea fromRow) en lugar de select=*
    // Tolerante al esquema: si alguna columna aún no existe en la BD, relee con select=* (siempre válido).
    let query = db
      .from('gestor_proyectos')
      .select('id,tenant_id,code,name,region,subtext,budget,sponsor,risk_level,metodologia,created_at,updated_at')
      .order('created_at', { ascending: true });
    // Defensa en profundidad: el filtro va a la BD, no solo al array en memoria.
    if (tenantId) query = query.eq('tenant_id', tenantId);
    let respuesta = await query;
    if (respuesta.error) {
      let fallbackQuery = db
        .from('gestor_proyectos')
        .select('*')
        .order('created_at', { ascending: true });
      if (tenantId) fallbackQuery = fallbackQuery.eq('tenant_id', tenantId);
      respuesta = await fallbackQuery;
    }
    if (tenantId) {
      respuesta.data = (respuesta.data ?? []).filter((row: any) => row.tenant_id === tenantId);
    }
    if (respuesta.error) throw respuesta.error;
    const baseProjects = (respuesta.data ?? []).map((row) => fromRow(row as ProjectRow));
    if (baseProjects.length === 0) return baseProjects;

    // Enriquecer con tipo_proyecto_codigo y estado_codigo desde gp_proyectos
    let gpQuery = db
      .from('gp_proyectos')
      .select('legacy_source_id,tipo_proyecto_codigo,estado_codigo')
      .is('is_deleted', false);
    if (tenantId) gpQuery = gpQuery.eq('empresa_id', tenantId);
    const { data: gpRows } = await gpQuery;
    if (!gpRows || gpRows.length === 0) return baseProjects;

    const gpMap = new Map<string, { tipo?: string | undefined; estado?: string | undefined }>();
    for (const r of gpRows as Array<{ legacy_source_id?: string | null; tipo_proyecto_codigo?: string | null; estado_codigo?: string | null }>) {
      if (r.legacy_source_id) {
        gpMap.set(r.legacy_source_id, {
          tipo: r.tipo_proyecto_codigo || undefined,
          estado: r.estado_codigo || undefined,
        });
      }
    }
    return baseProjects.map((p) => {
      const extra = gpMap.get(p.id);
      if (!extra) return p;
      return {
        ...p,
        tipoProyectoCodigo: extra.tipo ?? p.tipoProyectoCodigo,
        estadoCodigo: (extra.estado as ProjectItem['estadoCodigo']) ?? p.estadoCodigo,
      };
    });
  })();
  inFlightProjects.set(key, run);
  try {
    return await run;
  } finally {
    inFlightProjects.delete(key);
  }
}

/**
 * Espejo mínimo en gp_proyectos. gp_tareas exige un proyecto_id UUID con RLS por
 * empresa; el id del frontend (`pX`) se guarda como legacy_source_id para que
 * gpTareasService pueda resolverlo. No siembra sedes ni datos operativos.
 */
async function asegurarGpProyecto(project: ProjectItem, tenantId?: string | null): Promise<void> {
  if (!supabase || !tenantId || !project.id) return;
  const db = supabase;
  const { data: existente } = await db
    .from('gp_proyectos')
    .select('id')
    .eq('empresa_id', tenantId)
    .eq('legacy_source_id', project.id)
    .is('is_deleted', false)
    .limit(1)
    .maybeSingle();
  if (existente) {
    const { error: updErr } = await db
      .from('gp_proyectos')
      .update({
        codigo_proyecto: project.code || project.id,
        nombre: project.name || project.code || project.id,
        tipo_proyecto_codigo: project.tipoProyectoCodigo ?? null,
      })
      .eq('id', existente.id);
    if (updErr) {
      console.warn('[Gestor Projects] no se pudo actualizar gp_proyectos:', updErr.message);
    }
    return;
  }
  const { error } = await db.from('gp_proyectos').insert({
    empresa_id: tenantId,
    codigo_proyecto: project.code || project.id,
    nombre: project.name || project.code || project.id,
    tipo_proyecto_codigo: project.tipoProyectoCodigo ?? null,
    legacy_source_id: project.id,
    metadata: { origen: 'gestor_proyectos' },
  });
  if (error) {
    console.warn('[Gestor Projects] no se pudo preparar gp_proyectos para tareas:', error.message);
  }
}

export async function upsertGestorProject(project: ProjectItem, tenantId?: string | null): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('gestor_proyectos').upsert(toRow(project, tenantId));
  if (error) throw error;
  await asegurarGpProyecto(project, tenantId);
  return true;
}

export async function deleteGestorProject(projectId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('gestor_proyectos').delete().eq('id', projectId);
  if (error) throw error;
  return true;
}
