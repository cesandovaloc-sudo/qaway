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
      .select('id,code,name,region,subtext,budget,sponsor,risk_level,metodologia,created_at,updated_at')
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
    return (respuesta.data ?? []).map((row) => fromRow(row as ProjectRow));
  })();
  inFlightProjects.set(key, run);
  try {
    return await run;
  } finally {
    inFlightProjects.delete(key);
  }
}

export async function upsertGestorProject(project: ProjectItem, tenantId?: string | null): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('gestor_proyectos').upsert(toRow(project, tenantId));
  if (error) throw error;
  return true;
}

export async function deleteGestorProject(projectId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('gestor_proyectos').delete().eq('id', projectId);
  if (error) throw error;
  return true;
}
