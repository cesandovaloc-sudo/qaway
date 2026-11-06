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
 * Project persistence before Hub login integration.
 * tenantId is intentionally explicit and optional; it must not be inferred
 * from a session until the authentication phase is approved.
 */
export async function listGestorProjects(tenantId?: string | null): Promise<ProjectItem[]> {
  if (!supabase) return [];
  let query = supabase.from('gestor_proyectos').select('*').order('created_at', { ascending: true });
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => fromRow(row as ProjectRow));
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
