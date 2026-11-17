import { supabase } from './supabaseClient';
import { exigirContextoEscritura, exigirContextoLectura, ErrorSesion } from './contextoSesion';

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
 * Etapa 4: la identidad ya NO se recibe por parámetro. El parámetro `tenantId`
 * es solo un FILTRO opcional validado contra la sesión real del Hub:
 *  · Plataforma (public.users.is_platform_admin): todas las unidades, o las del
 *    tenant pedido si se filtra.
 *  · Empresa autorizada (user_can_use_app 'gestor-proyectos'): SUS unidades +
 *    el catálogo nacional (251 semillas con tenant_id NULL, solo lectura).
 *    Nunca unidades privadas de otra empresa.
 *  · Sin sesión / sin acceso a la app / filtro ajeno: ErrorSesion (fail-closed).
 */
/**
 * P1 (gstack 08): dedup de peticiones en vuelo por recurso (misma firma ⇒ misma promesa compartida).
 */
const inFlightUnits = new Map<string, Promise<GestorUnit[]>>();
const inFlightUnitMembers = new Map<string, Promise<GestorUnitMember[]>>();
const inFlightProjectUnits = new Map<string, Promise<GestorProjectUnit[]>>();

export async function listGestorUnits(tenantId?: string | null): Promise<GestorUnit[]> {
  if (!supabase) return []; // modo local explícito: no hay datos que filtrar (fail-closed)
  const db = supabase;
  const ctx = await exigirContextoLectura();
  const pedido = typeof tenantId === 'string' && tenantId.trim() !== '' ? tenantId.trim() : null;
  if (!ctx.esPlataforma) {
    if (pedido !== null && pedido !== ctx.tenantId) {
      throw new ErrorSesion(
        'TENANT_AJENO',
        `El tenantId solicitado ("${pedido}") no es la empresa autenticada ("${ctx.tenantId ?? 'sin tenant'}"): ` +
        'la identidad real no puede sustituirse por parámetro.',
      );
    }
  }
  const key = `tenant:${tenantId ?? 'all'}`;
  const existing = inFlightUnits.get(key);
  if (existing) return existing;
  const run = (async (): Promise<GestorUnit[]> => {
    // P2 (gstack 08): columnas explícitas (superset de los campos que mapea mapUnit) en lugar de select=*
    let query = db
      .from('gestor_unidades')
      .select('id,tenant_id,parent_unit_id,name,code,unit_type,region,macroregion,address,status,metadata')
      .order('name');
    if (ctx.esPlataforma) {
      if (pedido !== null) query = query.eq('tenant_id', pedido);
    } else if (ctx.tenantId !== null) {
      // Empresa: propias + catálogo nacional (tenant NULL). Filtro complementario
      // a RLS (defensa en profundidad + UX); la garantía final es RLS (0006b).
      // tenant_id es uuid-text del perfil: sin caracteres que rompan el filtro or.
      query = query.or(`tenant_id.is.null,tenant_id.eq.${ctx.tenantId}`);
    } else {
      // Inalcanzable (evaluarLectura lo deniega), guardia explícita fail-closed.
      throw new ErrorSesion('SIN_ACCESO_APP', 'La cuenta autenticada no tiene empresa asignada.');
    }
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

/** Id NUEVO con randomUUID (colisión ⇒ error explícito; jamás reutiliza ids). */
function generarIdUnidad(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `unit-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e12).toString(36)}`;
}

/**
 * Etapa 4 — creación con la sesión real del Hub:
 *  · INSERT puro (NUNCA upsert): jamás sobrescribe una unidad existente
 *    (p. ej. una de las 251 semillas); colisión de id/code ⇒ error explícito.
 *  · Empresa: tenant_id = empresa AUTENTICADA (obligatorio). El tenantId del
 *    parámetro, si viene, solo se acepta si COINCIDE — nunca lo sustituye.
 *  · Plataforma: puede fijar tenant explícito (o NULL ⇒ catálogo nacional).
 *  · Sin cliente / sin sesión / sin acceso / rol insuficiente: ErrorSesion.
 *  · Fallo de BD: se PROPAGA. Sin fallback local silencioso: la operación debía
 *    persistir; fingir éxito dejaría datos huérfanos en la UI.
 */
export async function createGestorUnit(unit: Partial<GestorUnit>): Promise<GestorUnit> {
  if (!supabase) {
    throw new ErrorSesion(
      'CLIENTE_INDISPONIBLE',
      'No hay cliente Supabase disponible: la unidad no puede persistirse.',
    );
  }
  const tenantParam = typeof unit.tenantId === 'string' && unit.tenantId.trim() !== '' ? unit.tenantId.trim() : null;
  const ctx = await exigirContextoEscritura(tenantParam);
  const tenantIdFinal = ctx.esPlataforma ? tenantParam : ctx.tenantId;
  if (!ctx.esPlataforma && tenantIdFinal === null) {
    throw new ErrorSesion(
      'SIN_ACCESO_APP',
      'La empresa autenticada no tiene tenant asignado: no se puede crear la unidad.',
    );
  }

  const newId = typeof unit.id === 'string' && unit.id.trim() !== '' ? unit.id.trim() : generarIdUnidad();
  const cleanCode = (unit.code || unit.name?.replace(/\s+/g, '-').toUpperCase() || `UNIT-${Date.now()}`).trim();

  const row = {
    id: newId,
    tenant_id: tenantIdFinal,
    parent_unit_id: unit.parentUnitId ?? null,
    name: unit.name?.trim() || 'Nueva Sede',
    code: cleanCode,
    unit_type: unit.unitType || 'ugel',
    region: unit.region ?? null,
    macroregion: unit.macroregion ?? null,
    address: unit.address ?? null,
    status: unit.status || 'active',
    metadata: {
      ...(unit.metadata || {}),
      ...(unit.gestor ? { gestor: unit.gestor } : {}),
      ...(typeof unit.progress === 'number' ? { progress: unit.progress } : {}),
      ...(unit.complianceStatus ? { compliance_status: unit.complianceStatus } : {}),
    },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('gestor_unidades')
    .insert(row)
    .select('id,tenant_id,parent_unit_id,name,code,unit_type,region,macroregion,address,status,metadata')
    .single();
  if (error) {
    throw new Error(`No se pudo crear la unidad: ${error.message}`);
  }
  if (!data) {
    throw new Error('No se pudo crear la unidad: la base de datos no devolvió la fila insertada.');
  }

  inFlightUnits.clear();
  return mapUnit(data);
}

