import {
  getDepartments,
  getDistricts,
  getProvinces,
  getUbigeoData,
  searchByName,
  validateUbigeo,
} from 'ubigeo-fns';
import { PAISES } from '@/config/paises';

export interface NominatimSugerencia {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
}

const cacheBusqueda = new Map<string, NominatimSugerencia[]>();
const cacheReversa = new Map<string, NominatimSugerencia | null>();

export function normalizarTextoGeo(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(departamento|provincia|distrito|region|metropolitana)\s+(de|del)\s+/g, '')
    .replace(/\b(metropolitana|provincia)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function esPaisPeru(pais: string): boolean {
  const n = normalizarTextoGeo(pais);
  return !n || n === 'peru';
}

export function codigoIsoPais(pais: string): string {
  const n = normalizarTextoGeo(pais);
  if (!n) return 'pe';
  const encontrado = PAISES.find((p: any) => normalizarTextoGeo(p.nombre) === n);
  return encontrado?.codigo ? String(encontrado.codigo).toLowerCase() : '';
}

export function obtenerDepartamentosPeru() {
  return getDepartments();
}

export function obtenerProvinciasPeru(nombreDepto: string) {
  const depto = buscarPorNombre(getDepartments(), nombreDepto);
  return depto ? getProvinces(depto.code) : [];
}

export function obtenerDistritosPeru(nombreDepto: string, nombreProv: string) {
  const depto = buscarPorNombre(getDepartments(), nombreDepto);
  if (!depto) return [];
  const prov = buscarPorNombre(getProvinces(depto.code), nombreProv);
  return prov ? getDistricts(prov.code) : [];
}

export function datosDistritoPeru(nombreDepto: string, nombreProv: string, nombreDist: string) {
  const distritos = obtenerDistritosPeru(nombreDepto, nombreProv);
  const dist = buscarPorNombre(distritos, nombreDist);
  return dist ? getUbigeoData(dist.code) : null;
}

export function datosPorUbigeoPeru(codigo: string) {
  const limpio = codigo.replace(/\D/g, '');
  if (limpio.length !== 6 || !validateUbigeo(limpio)) return null;
  return getUbigeoData(limpio);
}

function buscarPorNombre<T extends { code: string; name: string }>(lista: T[], objetivo: string): T | undefined {
  const norm = normalizarTextoGeo(objetivo);
  if (!norm) return undefined;
  return (
    lista.find((item) => normalizarTextoGeo(item.name) === norm)
    || lista.find((item) => normalizarTextoGeo(item.name).includes(norm) || norm.includes(normalizarTextoGeo(item.name)))
  );
}

export function resolverUbicacionDesdeAddress(
  address: Record<string, string | undefined> | undefined,
  paisActual: string,
): {
  pais?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ubigeo?: string;
} {
  const a = address || {};
  const paisResp = a.country || paisActual || 'Perú';
  const enPeru = esPaisPeru(paisResp);

  const rawDepto = a.state || a.region || '';
  const rawProv = a.county || a.province || a.state_district || a.city || '';
  const rawDist = a.city_district || a.suburb || a.town || a.village || a.municipality || a.city || '';

  if (!enPeru) {
    return {
      pais: paisResp,
      departamento: rawDepto || undefined,
      provincia: rawProv || undefined,
      distrito: rawDist || undefined,
      ubigeo: a.postcode || undefined,
    };
  }

  // En Perú: empatar con el catálogo oficial INEI para mantener las listas vinculadas sincronizadas.
  const deptos = getDepartments();
  const deptoMatch = buscarPorNombre(deptos, rawDepto)
    || (normalizarTextoGeo(rawProv).includes('lima') ? buscarPorNombre(deptos, 'Lima') : undefined)
    || (normalizarTextoGeo(rawDepto).includes('callao') || normalizarTextoGeo(rawProv).includes('callao')
      ? buscarPorNombre(deptos, 'Callao')
      : undefined);

  if (deptoMatch) {
    const provs = getProvinces(deptoMatch.code);
    const provMatch = buscarPorNombre(provs, rawProv)
      || (deptoMatch.name === 'Lima' && !rawProv ? buscarPorNombre(provs, 'Lima') : undefined);

    if (provMatch) {
      const dists = getDistricts(provMatch.code);
      const distMatch = buscarPorNombre(dists, rawDist);
      if (distMatch) {
        return {
          pais: 'Perú',
          departamento: deptoMatch.name,
          provincia: provMatch.name,
          distrito: distMatch.name,
          ubigeo: distMatch.code,
        };
      }
      return {
        pais: 'Perú',
        departamento: deptoMatch.name,
        provincia: provMatch.name,
      };
    }

    return {
      pais: 'Perú',
      departamento: deptoMatch.name,
    };
  }

  // Fallback por nombre de distrito si Nominatim omitió el departamento
  if (rawDist) {
    const hits = searchByName(rawDist, { limit: 3 });
    if (hits.length === 1) {
      return {
        pais: 'Perú',
        departamento: hits[0].department,
        provincia: hits[0].province,
        distrito: hits[0].district,
        ubigeo: hits[0].ubigeo,
      };
    }
  }

  return {
    pais: 'Perú',
    departamento: rawDepto || undefined,
    provincia: rawProv || undefined,
    distrito: rawDist || undefined,
  };
}

export async function buscarDireccionesNominatim(
  query: string,
  opts: { pais: string; contexto?: string; signal?: AbortSignal },
): Promise<NominatimSugerencia[]> {
  const iso = codigoIsoPais(opts.pais);
  const qFinal = opts.contexto ? `${query}, ${opts.contexto}` : query;
  const cacheKey = `${iso}|${qFinal.toLowerCase()}`;
  const cached = cacheBusqueda.get(cacheKey);
  if (cached) return cached;

  const parametros = new URLSearchParams({
    q: qFinal,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    'accept-language': 'es',
  });
  if (iso) parametros.set('countrycodes', iso);

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${parametros.toString()}`, {
    signal: opts.signal,
  });
  if (!res.ok) throw new Error('Sin resultados');
  const datos = (await res.json()) as NominatimSugerencia[];
  cacheBusqueda.set(cacheKey, datos);
  return datos;
}

export async function geocodificarInversaNominatim(
  lat: string,
  lon: string,
  signal?: AbortSignal,
): Promise<NominatimSugerencia | null> {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;

  const cacheKey = `${latNum.toFixed(5)},${lonNum.toFixed(5)}`;
  if (cacheReversa.has(cacheKey)) {
    return cacheReversa.get(cacheKey) ?? null;
  }

  const parametros = new URLSearchParams({
    lat: String(latNum),
    lon: String(lonNum),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '18',
    'accept-language': 'es',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${parametros.toString()}`, {
    signal,
  });
  if (!res.ok) return null;
  const dato = (await res.json()) as NominatimSugerencia;
  const resultado = dato?.display_name ? dato : null;
  cacheReversa.set(cacheKey, resultado);
  return resultado;
}
