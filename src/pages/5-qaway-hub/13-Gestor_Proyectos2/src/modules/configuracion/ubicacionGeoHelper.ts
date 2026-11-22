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

function getHereApiKey(): string {
  const env = (import.meta as any).env || {};
  return String(env.VITE_HERE_API_KEY || '').trim();
}

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
  const candidatosDist = [a.city_district, a.municipality, a.town, a.village, a.suburb, a.city].filter(
    (x): x is string => Boolean(x && x.trim()),
  );
  const rawDist = candidatosDist[0] || '';

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
      const distMatch = candidatosDist
        .map((c) => buscarPorNombre(dists, c))
        .find((m): m is NonNullable<typeof m> => Boolean(m));
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

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    postcode?: string;
  };
}

function photonAFeatureSugerencia(f: PhotonFeature, idx: number): NominatimSugerencia | null {
  const coords = f.geometry?.coordinates;
  const p = f.properties;
  if (!coords || coords.length < 2 || !p) return null;
  const via = [p.street, p.housenumber].filter(Boolean).join(' ').trim();
  const partes = [
    p.name && p.name !== via ? p.name : '',
    via,
    p.district || p.locality || '',
    p.city || p.county || '',
    p.state || '',
    p.country || '',
  ].filter(Boolean);
  const display_name = Array.from(new Set(partes)).join(', ');
  if (!display_name) return null;

  return {
    place_id: p.osm_id || idx + 1,
    display_name,
    lat: String(coords[1]),
    lon: String(coords[0]),
    address: {
      country: p.country,
      state: p.state,
      county: p.county,
      city: p.city,
      suburb: p.district || p.locality,
      postcode: p.postcode,
    },
  };
}

async function buscarConHere(
  query: string,
  opts: { contexto?: string; latNum: number; lonNum: number; tieneCoords: boolean; signal?: AbortSignal },
): Promise<NominatimSugerencia[]> {
  const apiKey = getHereApiKey();
  if (!apiKey) return [];
  const qFinal = opts.contexto ? `${query}, ${opts.contexto}` : query;
  const params = new URLSearchParams({
    q: qFinal,
    lang: 'es',
    limit: '6',
    apiKey,
  });
  if (opts.tieneCoords) {
    params.set('at', `${opts.latNum},${opts.lonNum}`);
  }
  const res = await fetch(`https://geocode.search.hereapi.com/v1/geocode?${params.toString()}`, { signal: opts.signal });
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: any[] };
  const items = Array.isArray(json?.items) ? json.items : [];
  return items
    .filter((it) => it?.position?.lat != null && it?.position?.lng != null)
    .map((it, idx) => {
      const a = it.address || {};
      const via = [a.street, a.houseNumber].filter(Boolean).join(' ').trim();
      const labelCorto = [via || it.title, a.district || a.city, a.countryName].filter(Boolean).join(', ');
      return {
        place_id: idx + 1,
        display_name: labelCorto || a.label || it.title,
        lat: String(it.position.lat),
        lon: String(it.position.lng),
        address: {
          country: a.countryName,
          state: a.state,
          county: a.county,
          city: a.city,
          suburb: a.district,
          postcode: a.postalCode,
        },
      };
    });
}

async function consultarProveedores(
  query: string,
  opts: { iso: string; contexto?: string; latNum: number; lonNum: number; tieneCoords: boolean; signal?: AbortSignal },
): Promise<NominatimSugerencia[]> {
  // 0) HERE Geocoding (si VITE_HERE_API_KEY está configurada): numeración a puerta e interpolación exacta
  try {
    const hereRes = await buscarConHere(query, opts);
    if (hereRes.length > 0) return hereRes;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
  }

  // 1) Photon (Komoot): más rápido y tolerante para nombres de lugares y direcciones parciales
  try {
    const pParams = new URLSearchParams({
      q: opts.contexto ? `${query} ${opts.contexto}` : query,
      limit: '8',
    });
    if (opts.tieneCoords) {
      pParams.set('lat', String(opts.latNum));
      pParams.set('lon', String(opts.lonNum));
    }
    const pRes = await fetch(`https://photon.komoot.io/api/?${pParams.toString()}`, { signal: opts.signal });
    if (pRes.ok) {
      const json = (await pRes.json()) as { features?: PhotonFeature[] };
      const features = Array.isArray(json?.features) ? json.features : [];
      const filtradas = opts.iso
        ? features.filter((f) => !f.properties?.countrycode || f.properties.countrycode.toLowerCase() === opts.iso)
        : features;
      const lista = (filtradas.length > 0 ? filtradas : features)
        .slice(0, 6)
        .map(photonAFeatureSugerencia)
        .filter((x): x is NominatimSugerencia => Boolean(x));
      if (lista.length > 0) return lista;
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
  }

  // 2) Fallback a Nominatim si Photon no devolvió resultados
  const qFinal = opts.contexto ? `${query}, ${opts.contexto}` : query;
  const parametros = new URLSearchParams({
    q: qFinal,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    'accept-language': 'es',
  });
  if (opts.iso) parametros.set('countrycodes', opts.iso);

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${parametros.toString()}`, {
    signal: opts.signal,
  });
  if (!res.ok) return [];
  return (await res.json()) as NominatimSugerencia[];
}

function quitarNumeroPuerta(query: string): string {
  return query
    .replace(/\b(nro\.?|n°|num\.?|mz\.?|lt\.?|lote|manzana|dpto\.?|int\.?|piso)\b\s*[a-z0-9-]*/gi, '')
    .replace(/[#]\s*[a-z0-9-]+/gi, '')
    .replace(/\b\d{1,5}[a-zA-Z]?\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();
}

export async function buscarDireccionesNominatim(
  query: string,
  opts: { pais: string; contexto?: string; lat?: string; lon?: string; signal?: AbortSignal },
): Promise<NominatimSugerencia[]> {
  const iso = codigoIsoPais(opts.pais);
  const latNum = Number(opts.lat);
  const lonNum = Number(opts.lon);
  const tieneCoords = Boolean(opts.lat?.trim() && opts.lon?.trim() && Number.isFinite(latNum) && Number.isFinite(lonNum));
  const cacheKey = `${iso}|${tieneCoords ? `${latNum.toFixed(2)},${lonNum.toFixed(2)}` : ''}|${opts.contexto || ''}|${query.toLowerCase()}`;
  const cached = cacheBusqueda.get(cacheKey);
  if (cached) return cached;

  const provOpts = { iso, contexto: opts.contexto, latNum, lonNum, tieneCoords, signal: opts.signal };
  let datos = await consultarProveedores(query, provOpts);

  // Si incluye número de puerta/lote no mapeado en OSM, buscar la vía sin el número para ubicar la calle en el mapa
  if (datos.length === 0) {
    const sinNumero = quitarNumeroPuerta(query);
    if (sinNumero && sinNumero.length >= 3 && sinNumero.toLowerCase() !== query.toLowerCase()) {
      datos = await consultarProveedores(sinNumero, provOpts);
    }
  }

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

  const hereKey = getHereApiKey();
  if (hereKey) {
    try {
      const hParams = new URLSearchParams({
        at: `${latNum},${lonNum}`,
        lang: 'es',
        limit: '1',
        apiKey: hereKey,
      });
      const hRes = await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?${hParams.toString()}`, { signal });
      if (hRes.ok) {
        const hJson = (await hRes.json()) as { items?: any[] };
        const it = hJson?.items?.[0];
        if (it?.address) {
          const a = it.address;
          const via = [a.street, a.houseNumber].filter(Boolean).join(' ').trim();
          const direccionLimpia = [via, a.district || a.city].filter(Boolean).join(', ') || a.label;
          const resultado: NominatimSugerencia = {
            place_id: 1,
            display_name: direccionLimpia,
            lat: String(latNum),
            lon: String(lonNum),
            address: {
              country: a.countryName,
              state: a.state,
              county: a.county,
              city: a.city,
              suburb: a.district,
              postcode: a.postalCode,
            },
          };
          cacheReversa.set(cacheKey, resultado);
          return resultado;
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
    }
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
  if (!dato?.display_name) return null;

  // Limpiar dirección inversa para evitar números de lotes vecinos o duplicados ("Lima Metropolitana, Callao, 07016")
  const a = dato.address || {};
  const via = a.road || a.pedestrian || a.footway || '';
  const distrito = a.city_district || a.suburb || a.town || a.village || '';
  const direccionLimpia = [via, distrito].filter(Boolean).join(', ') || dato.display_name;
  const resultado: NominatimSugerencia = { ...dato, display_name: direccionLimpia };

  cacheReversa.set(cacheKey, resultado);
  return resultado;
}
