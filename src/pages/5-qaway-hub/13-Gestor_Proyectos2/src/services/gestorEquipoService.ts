import type { Integrante, SedeFrente } from '../modules/equipo/types';
import { listGestorUnits } from './gestorOrganizacionService';
import type { GestorUnit } from './gestorOrganizacionService';

// Cache en memoria para navegación instantánea sin descargas duplicadas
let cachedIntegrantes: Integrante[] | null = null;
let cachedSedes: SedeFrente[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * F1 (auditoría 08) — ruta ÚNICA de unidades: este servicio ya no abre su propia consulta a
 * gestor_unidades; consume la promesa compartida de gestorOrganizacionService.listGestorUnits
 * (dedup en vuelo + columnas explícitas). Un solo viaje de red para TODO el módulo de equipo.
 */
let inFlightIntegrantes: Promise<Integrante[]> | null = null;

/**
 * Carga el directorio completo de integrantes desde Supabase (tabla gestor_unidades).
 * Cero hardcodeo local: la fuente única de verdad es Supabase.
 */
export async function fetchEquipoIntegrantesFromSupabase(forceRefresh = false): Promise<Integrante[]> {
  const now = Date.now();
  if (!forceRefresh && cachedIntegrantes && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedIntegrantes;
  }
  if (inFlightIntegrantes) return inFlightIntegrantes;

  const run = (async (): Promise<Integrante[]> => {
    try {
      const units = await listGestorUnits();

      if (!units || units.length === 0) {
        console.warn('[gestorEquipoService] No se pudieron obtener unidades de Supabase');
        return cachedIntegrantes || [];
      }

      const allMembers: Integrante[] = [];
      const allSedes: SedeFrente[] = [];

      for (const unit of units) {
        const meta = (unit.metadata ?? {}) as Record<string, any>;
        const directorio = meta.directorio;
        const firstMember = Array.isArray(directorio) && directorio.length > 0 ? directorio[0] : null;

        allSedes.push({
          id: unit.id,
          codigo: unit.id.toUpperCase(),
          nombre: unit.name,
          ambito: unit.region ? `Región ${unit.region}` : 'Ámbito Nacional',
          region: unit.region || '',
          tipoEntidad: unit.unitType === 'dre' ? 'dre' : 'ugel',
          responsableNombre: firstMember?.nombreCompleto || meta.gestor || 'Director',
          dotacionRequerida: Array.isArray(directorio) ? directorio.length : 7,
        });

        if (Array.isArray(directorio) && directorio.length > 0) {
          for (const item of directorio) {
            allMembers.push({
              id: item.id || `usr-${unit.id}-${allMembers.length + 1}`,
              codigo: item.codigo || `USR-${unit.id}`,
              nombre: item.nombre || '',
              apellidos: item.apellidos || '',
              nombreCompleto: item.nombreCompleto || `${item.nombre} ${item.apellidos}`.trim(),
              email: item.email || '',
              telefono: item.telefono || '',
              documentoIdentidad: item.documentoIdentidad || '',
              iniciales: item.iniciales || 'PE',
              estadoOperativo: item.estadoOperativo || 'En funciones',
              estadoCuenta: item.estadoCuenta || 'Habilitada',
              rolSeguridad: item.rolSeguridad || 'Gestor',
              cargo: item.cargo || 'Especialista',
              areaId: 'area-01',
              areaNombre: 'Dirección y Coordinación Territorial',
              sedeId: unit.id,
              sedeNombre: unit.name,
              capacidadNominalHorasSemana: 40,
              fechaIngreso: item.fechaIngreso || '2026-10-01',
            });
          }
        }
      }

      if (allSedes.length > 0) {
        cachedSedes = allSedes;
      }

      if (allMembers.length > 0) {
        cachedIntegrantes = allMembers;
        lastFetchTime = now;
        return allMembers;
      }

      return [];
    } catch (err) {
      console.error('[gestorEquipoService] Error inesperado consultando unidades:', err);
      return cachedIntegrantes || [];
    }
  })();

  inFlightIntegrantes = run;
  try {
    return await run;
  } finally {
    inFlightIntegrantes = null;
  }
}

/**
 * Obtiene las sedes territoriales desde Supabase
 */
export async function fetchEquipoSedesFromSupabase(): Promise<SedeFrente[]> {
  if (cachedSedes && cachedSedes.length > 0) return cachedSedes;
  await fetchEquipoIntegrantesFromSupabase();
  return cachedSedes || [];
}

/**
 * Actualiza un integrante en la caché en memoria viva
 */
export function updateCachedIntegrante(updated: Integrante): void {
  if (cachedIntegrantes) {
    cachedIntegrantes = cachedIntegrantes.map((i) => (i.id === updated.id ? updated : i));
  }
}

/**
 * Obtiene integrantes filtrados por sede o región directamente
 */
export async function fetchIntegrantesPorSede(sedeIdOrName: string): Promise<Integrante[]> {
  const all = await fetchEquipoIntegrantesFromSupabase();
  const search = sedeIdOrName.toLowerCase().trim();
  return all.filter((i) =>
    i.sedeId.toLowerCase() === search ||
    i.sedeNombre.toLowerCase().includes(search) ||
    search.includes(i.sedeNombre.toLowerCase())
  );
}
