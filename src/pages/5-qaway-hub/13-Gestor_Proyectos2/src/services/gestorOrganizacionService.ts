import { supabase } from './supabaseClient';

export type GestorUnitType =
  | 'central'
  | 'dre'
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
  progress?: number;
  complianceStatus?: string;
  gestor?: string;
  startDate?: string;
  endDate?: string;
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
  progress: typeof row.metadata?.progress === 'number' ? row.metadata.progress : undefined,
  complianceStatus: row.metadata?.compliance_status,
  gestor: row.metadata?.gestor,
  startDate: row.metadata?.start_date,
  endDate: row.metadata?.end_date,
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
/**
 * P1 (gstack 08): dedup de peticiones en vuelo por recurso (misma firma ⇒ misma promesa compartida).
 */
const inFlightUnits = new Map<string, Promise<GestorUnit[]>>();
const inFlightUnitMembers = new Map<string, Promise<GestorUnitMember[]>>();
const inFlightProjectUnits = new Map<string, Promise<GestorProjectUnit[]>>();

export async function listGestorUnits(tenantId?: string | null): Promise<GestorUnit[]> {
  if (!supabase) return [];
  const db = supabase;
  const key = `tenant:${tenantId ?? 'all'}`;
  const existing = inFlightUnits.get(key);
  if (existing) return existing;
  const run = (async (): Promise<GestorUnit[]> => {
    // P2 (gstack 08): columnas explícitas (superset de los campos que mapea mapUnit) en lugar de select=*
    let query = db
      .from('gestor_unidades')
      .select('id,tenant_id,parent_unit_id,name,code,unit_type,region,macroregion,address,status,metadata')
      .order('name');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapUnit);
  })();
  inFlightUnits.set(key, run);
  try {
    return await run;
  } finally {
    inFlightUnits.delete(key);
  }
}

export async function listGestorUnitMembers(unitId: string): Promise<GestorUnitMember[]> {
  if (!supabase) return [];
  const db = supabase;
  const key = `unit:${unitId}`;
  const existing = inFlightUnitMembers.get(key);
  if (existing) return existing;
  const run = (async (): Promise<GestorUnitMember[]> => {
    // P2 (gstack 08): columnas explícitas (superset de los campos que mapea mapMember + created_at del orden)
    // Tolerante al esquema: si alguna columna aún no existe en la BD, relee con select=*.
    let respuesta = await db
      .from('gestor_unidad_miembros')
      .select('id,tenant_id,unit_id,user_id,responsibility,is_primary,status,created_at')
      .eq('unit_id', unitId)
      .order('created_at');
    if (respuesta.error) {
      respuesta = await db
        .from('gestor_unidad_miembros')
        .select('*')
        .eq('unit_id', unitId)
        .order('created_at');
    }
    if (respuesta.error) throw respuesta.error;
    return (respuesta.data ?? []).map(mapMember);
  })();
  inFlightUnitMembers.set(key, run);
  try {
    return await run;
  } finally {
    inFlightUnitMembers.delete(key);
  }
}

export async function listGestorProjectUnits(projectId: string): Promise<GestorProjectUnit[]> {
  if (!supabase) return [];
  const db = supabase;
  const key = `project:${projectId}`;
  const existing = inFlightProjectUnits.get(key);
  if (existing) return existing;
  const run = (async (): Promise<GestorProjectUnit[]> => {
    const { data, error } = await db
      .from('gestor_proyecto_unidades')
      .select('project_id, unit_id, responsibility')
      .eq('project_id', projectId);
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      projectId: row.project_id,
      unitId: row.unit_id,
      responsibility: row.responsibility ?? null,
    }));
  })();
  inFlightProjectUnits.set(key, run);
  try {
    return await run;
  } finally {
    inFlightProjectUnits.delete(key);
  }
}
