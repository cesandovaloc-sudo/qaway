import { supabase } from './supabaseClient';

export type GestorUnitType =
  | 'central'
  | 'ugel'
  | 'obra'
  | 'jefatura'
  | 'tienda'
  | 'oficina'
  | 'departamento'
  | 'other';

export interface GestorUnit {
  id: string;
  tenantId: string | null;
  parentUnitId: string | null;
  name: string;
  code: string | null;
  unitType: GestorUnitType;
  region: string | null;
  macroregion: string | null;
  address: string | null;
  status: 'active' | 'inactive' | 'archived';
  metadata: Record<string, unknown>;
}

export interface GestorUnitMember {
  id: string;
  tenantId: string | null;
  unitId: string;
  userId: string | null;
  responsibility: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive';
}

export interface GestorProjectUnit {
  projectId: string;
  unitId: string;
  responsibility: string | null;
}

const mapUnit = (row: any): GestorUnit => ({
  id: row.id,
  tenantId: row.tenant_id ?? null,
  parentUnitId: row.parent_unit_id ?? null,
  name: row.name,
  code: row.code ?? null,
  unitType: row.unit_type ?? 'other',
  region: row.region ?? null,
  macroregion: row.macroregion ?? null,
  address: row.address ?? null,
  status: row.status ?? 'active',
  metadata: row.metadata ?? {},
});

const mapMember = (row: any): GestorUnitMember => ({
  id: row.id,
  tenantId: row.tenant_id ?? null,
  unitId: row.unit_id,
  userId: row.user_id ?? null,
  responsibility: row.responsibility ?? null,
  isPrimary: Boolean(row.is_primary),
  status: row.status ?? 'active',
});

/**
 * Data-only organization service. It intentionally receives tenantId explicitly
 * until the Hub authentication/context integration is approved.
 */
export async function listGestorUnits(tenantId?: string | null): Promise<GestorUnit[]> {
  if (!supabase) return [];
  let query = supabase.from('gestor_unidades').select('*').order('name');
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapUnit);
}

export async function listGestorUnitMembers(unitId: string): Promise<GestorUnitMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gestor_unidad_miembros')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapMember);
}

export async function listGestorProjectUnits(projectId: string): Promise<GestorProjectUnit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gestor_proyecto_unidades')
    .select('project_id, unit_id, responsibility')
    .eq('project_id', projectId);
  if (error) throw error;
  return (data ?? []) as GestorProjectUnit[];
}
