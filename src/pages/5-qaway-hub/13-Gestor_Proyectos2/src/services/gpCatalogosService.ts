/**
 * gpCatalogosService.ts
 * =====================
 * Etapa 6 · Lectura SOLO-LECTURA de los catálogos gp_*_c de Supabase
 * (gp_estados_proyecto_c · gp_tipos_proyecto_c · gp_estados_ejecucion_c ·
 * gp_prioridades_c), reutilizando el cliente COMPARTIDO con Qaway Hub
 * (supabaseClient.ts, Etapa 4). NO crea mecanismos paralelos ni catálogos
 * duplicados: los valores vivos son la única fuente de verdad.
 *
 * Alcance honesto (evaluación Etapa 6):
 *   · Los catálogos son GLOBALES (sin tenant): la política de lectura acordada
 *     en 0004 para catálogos es USING (true) ⇒ la lectura no exige sesión de
 *     app (no pasa por contextoSesion/exigirContextoLectura, que es para datos
 *     por-empresa). Si el live tiene RLS activa SIN esa política (0004 sin
 *     aplicar), la lectura fallará ⇒ estado 'error' (nada se inventa).
 *   · SOLO LEE `activo = true` (baja lógica del modelo 0001).
 *   · Escritura: NO existe aquí. La escritura de catálogos es admin plataforma
 *     vía SQL (0004/0007); la app no escribe catálogos en esta etapa.
 *   · Resiliencia: el resultado se cachea solo en 'lista'/'vacio'; un 'error'
 *     NUNCA se cachea (reintento natural al reabrir el formulario).
 *
 * Estados declarados (exigidos por la Etapa 6 §3): 'lista' | 'vacio' | 'error'.
 * El llamador (componentes) decide el fallback con su vocabulario operativo
 * VIGENTE — nunca se sustituye el catálogo por valores inventados.
 */

import { supabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Catálogos del dominio GP (tablas v2 · 0001, creadas por partes)
// ---------------------------------------------------------------------------
export const TABLA_ESTADOS_PROYECTO = 'gp_estados_proyecto_c';
export const TABLA_TIPOS_PROYECTO = 'gp_tipos_proyecto_c';
export const TABLA_ESTADOS_EJECUCION = 'gp_estados_ejecucion_c';
export const TABLA_PRIORIDADES = 'gp_prioridades_c';
export const TABLA_TIPOS_DEPENDENCIA = 'gp_tipos_dependencia_c';
export const TABLA_CATEGORIAS_ENTREGABLE = 'gp_categorias_entregable_c';
export const TABLA_TIPOS_ENTREGABLE = 'gp_tipos_entregable_c';
export const TABLA_ESTADOS_ENTREGABLE = 'gp_estados_entregable_c';

/** Columnas por tabla (no todas comparten esquema: nivel solo existe en prioridades, alias en dependencias/entregables). */
const COLUMNAS_POR_TABLA: Record<string, string> = {
  [TABLA_PRIORIDADES]: 'codigo,nombre,nivel,orden,activo',
  [TABLA_ESTADOS_PROYECTO]: 'codigo,nombre,orden,activo',
  [TABLA_TIPOS_PROYECTO]: 'codigo,nombre,orden,activo',
  [TABLA_ESTADOS_EJECUCION]: 'codigo,nombre,orden,activo',
  [TABLA_TIPOS_DEPENDENCIA]: 'codigo,nombre,alias,orden,activo',
  [TABLA_CATEGORIAS_ENTREGABLE]: 'codigo,nombre,alias,icono,alcance,orden,activo',
  [TABLA_TIPOS_ENTREGABLE]: 'codigo,categoria_codigo,nombre,alias,icono,orden,activo',
  [TABLA_ESTADOS_ENTREGABLE]: 'codigo,nombre,alias,icono,orden,activo',
};

/** Valor de catálogo normalizado para la UI (solo lo que un selector necesita). */
export interface ValorCatalogo {
  /** Código estable (PK lógica; UNIQUE(codigo) en 0001). Persistirá en gp_tareas/gp_proyectos. */
  codigo: string;
  /** Etiqueta visible (= nombre del valor vivo). */
  nombre: string;
  /** Alias amigable en español (ej. en gp_tipos_dependencia_c: 'Fin a comienzo'). */
  alias?: string | null;
  /** Icono Lucide en kebab-case (usado en categorías/tipos de entregable). */
  icono?: string | null;
  /** FK a categoría padre (usado en gp_tipos_entregable_c). */
  categoriaCodigo?: string | null;
  /** Alcance de la categoría (Transversal / Proyectos / Sectorial). */
  alcance?: string | null;
  /** Peso (solo gp_prioridades_c tiene columna nivel; seed 0001: baja=1..urgente=4). */
  nivel: number | null;
  /** Orden de presentación (default 0 en 0001). */
  orden: number | null;
}

export type ResultadoCatalogo =
  | { estado: 'lista'; valores: ValorCatalogo[] }
  | { estado: 'vacio'; mensaje: string }
  | { estado: 'error'; mensaje: string };

/** Salida cruda del adaptador de lectura. */
export interface FetchCatalogo {
  filas: unknown;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Núcleo PURO (sin red): evalúa la respuesta cruda y produce el estado.
// ---------------------------------------------------------------------------
export function evaluarFilasCatalogo(filas: unknown, error: string | null): ResultadoCatalogo {
  if (error) {
    return { estado: 'error', mensaje: `No se pudo leer el catálogo desde Supabase: ${error}` };
  }
  if (!Array.isArray(filas) || filas.length === 0) {
    return { estado: 'vacio', mensaje: 'El catálogo no tiene valores activos todavía (catálogo vacío por diseño o sin seed).' };
  }

  const valores: ValorCatalogo[] = [];
  filas.forEach((fila) => {
    if (typeof fila !== 'object' || fila === null) return;
    const r = fila as Record<string, unknown>;
    if (typeof r.codigo !== 'string' || r.codigo.trim() === '') return;
    if (typeof r.nombre !== 'string' || r.nombre.trim() === '') return;
    valores.push({
      codigo: r.codigo,
      nombre: r.nombre,
      alias: typeof r.alias === 'string' ? r.alias : null,
      icono: typeof r.icono === 'string' ? r.icono : null,
      categoriaCodigo: typeof r.categoria_codigo === 'string' ? r.categoria_codigo : null,
      alcance: typeof r.alcance === 'string' ? r.alcance : null,
      nivel: typeof r.nivel === 'number' ? r.nivel : null,
      orden: typeof r.orden === 'number' ? r.orden : null,
    });
  });

  if (valores.length === 0) {
    return { estado: 'vacio', mensaje: 'El catálogo respondió filas sin codigo/nombre válidos.' };
  }

  // Orden de presentación estable: orden → nivel (prioridades 1..4) → orden de
  // llegada. Con orden=0 y nivel NULL en estados, se conserva el orden vivo.
  const conIndice = valores.map((v, i) => ({ v, i }));
  conIndice.sort((a, b) => {
    const oa = a.v.orden ?? 0;
    const ob = b.v.orden ?? 0;
    if (oa !== ob) return oa - ob;
    const na = a.v.nivel ?? Number.MAX_SAFE_INTEGER;
    const nb = b.v.nivel ?? Number.MAX_SAFE_INTEGER;
    if (na !== nb) return na - nb;
    return a.i - b.i;
  });

  return { estado: 'lista', valores: conIndice.map((x) => x.v) };
}

// ---------------------------------------------------------------------------
// Adaptador SOLO-LECTURA sobre el cliente compartido del Hub (Etapa 4)
// ---------------------------------------------------------------------------
export async function fetchFilasSupabase(tabla: string): Promise<FetchCatalogo> {
  if (!supabase) {
    return { filas: null, error: 'Cliente Supabase no disponible (modo local fail-closed, sin VITE_SUPABASE_URL/ANON_KEY).' };
  }
  const columnas = COLUMNAS_POR_TABLA[tabla] ?? 'codigo,nombre,orden,activo';
  try {
    const respuesta = await supabase.from(tabla).select(columnas).eq('activo', true);
    if (respuesta.error) {
      // Típico sin prerrequisitos: PGRST205 (tabla inexistente, p.ej. gp_prioridades_c
      // sin 0007) o PGRST301/42501 (RLS activa sin política de lectura, 0004 sin aplicar).
      return { filas: null, error: respuesta.error.message };
    }
    return { filas: respuesta.data, error: null };
  } catch (e) {
    return { filas: null, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Listador con caché de sesión + dedup de peticiones en vuelo (patrón P1 de
// gestorProjectService). El error NO se cachea: reintenta en el próximo uso.
// ---------------------------------------------------------------------------
export type ListadorCatalogo = (tabla: string) => Promise<ResultadoCatalogo>;

export function crearListadorCatalogo(fetchFilas: (tabla: string) => Promise<FetchCatalogo>): {
  listar: ListadorCatalogo;
  invalidar: () => void;
} {
  const cache = new Map<string, ResultadoCatalogo>();
  const enVuelo = new Map<string, Promise<ResultadoCatalogo>>();

  const listar = (tabla: string): Promise<ResultadoCatalogo> => {
    const cacheado = cache.get(tabla);
    if (cacheado) return Promise.resolve(cacheado);
    const promesa = enVuelo.get(tabla);
    if (promesa) return promesa;

    const tarea = fetchFilas(tabla)
      .then((bruta) => {
        const resultado = evaluarFilasCatalogo(bruta.filas, bruta.error);
        if (resultado.estado === 'error') {
          console.warn(`[Gestor Proyectos] Catálogo ${tabla} no disponible: ${resultado.mensaje}`);
        } else {
          cache.set(tabla, resultado);
        }
        return resultado;
      })
      .finally(() => {
        enVuelo.delete(tabla);
      });
    enVuelo.set(tabla, tarea);
    return tarea;
  };

  const invalidar = (): void => {
    cache.clear();
    enVuelo.clear();
  };

  return { listar, invalidar };
}

/** Instancia de la app (cliente compartido del Hub). */
const instanciaApp = crearListadorCatalogo(fetchFilasSupabase);

/** Fuerza re-lectura de todos los catálogos (cambios de seed en Supabase, pruebas). */
export const invalidarCatalogos = instanciaApp.invalidar;

/** Lectura genérica de un catálogo gp_*_c. */
export const listarCatalogo: ListadorCatalogo = instanciaApp.listar;

/** Atajo: prioridades de tarea (gp_prioridades_c). */
export function listarPrioridadesGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_PRIORIDADES);
}

/** Atajo: estados de ejecución activos (gp_estados_ejecucion_c). */
export function listarEstadosEjecucionGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_ESTADOS_EJECUCION);
}

/** Atajo: tipos de dependencia activos (gp_tipos_dependencia_c). */
export function listarTiposDependenciaGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_TIPOS_DEPENDENCIA);
}

/** Atajo: categorías de entregable activas (gp_categorias_entregable_c, ordenadas con GEN primero). */
export function listarCategoriasEntregableGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_CATEGORIAS_ENTREGABLE);
}

/** Atajo: tipos de entregable activos (gp_tipos_entregable_c). */
export function listarTiposEntregableGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_TIPOS_ENTREGABLE);
}

/** Atajo: estados de entregable activos (gp_estados_entregable_c). */
export function listarEstadosEntregableGestor(): Promise<ResultadoCatalogo> {
  return listarCatalogo(TABLA_ESTADOS_ENTREGABLE);
}
