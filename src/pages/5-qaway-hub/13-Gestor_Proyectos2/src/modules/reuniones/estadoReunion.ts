/**
 * estadoReunion.ts (reuniones) — Alineación al catálogo `gp_estados_reunion_c`
 * ============================================================================
 * DECISIÓN (17-nov-2026): el vocabulario VÁLIDO es el del catálogo real de
 * Supabase. El vocabulario previo de esta pantalla se ALINEA a él, mapeando lo
 * existente a lo más parecido:
 *
 *   'Programada'      → PROGRAMADA
 *   'En preparación'  → EN_CURSO     (es la etapa previa a realizarse)
 *   'Por confirmar'   → PROGRAMADA   (aún sin confirmar; el catálogo no tiene código equivalente)
 *   'Realizada'       → REALIZADA
 *
 * El catálogo añade CANCELADA, POSPUESTA y REPROGRAMADA, que la pantalla hereda.
 *
 * PILLS: el CSS de la vista define solo 4 variantes (scheduled / prep / pending /
 * done); los 6 códigos se pintan sobre esas 4 sin tocar la hoja de estilos, para
 * no destruir el diseño existente.
 *
 * Fuente: `gp_estados_reunion_c` (6 filas activas, seed PMI/PMBOK) leída con
 * `listarEstadosReunionGestor`. Este módulo es la verdad LOCAL: orden, etiquetas
 * de respaldo y normalización de lo ya guardado en localStorage.
 */

export type EstadoReunionCodigo =
  | 'PROGRAMADA'
  | 'EN_CURSO'
  | 'REALIZADA'
  | 'CANCELADA'
  | 'POSPUESTA'
  | 'REPROGRAMADA';

type ClasePill = 'scheduled' | 'prep' | 'pending' | 'done';

export interface EstadoReunionDef {
  codigo: EstadoReunionCodigo;
  /** `alias` del catálogo vivo (español). */
  etiqueta: string;
  /** Variante visual existente en la hoja de estilos de la vista. */
  clase: ClasePill;
}

/** Orden del catálogo (columna `orden`), con los alias reales de Supabase. */
export const ESTADOS_REUNION: readonly EstadoReunionDef[] = [
  { codigo: 'PROGRAMADA', etiqueta: 'Programada', clase: 'scheduled' },
  { codigo: 'EN_CURSO', etiqueta: 'En curso', clase: 'prep' },
  { codigo: 'REALIZADA', etiqueta: 'Realizada', clase: 'done' },
  { codigo: 'CANCELADA', etiqueta: 'Cancelada', clase: 'pending' },
  { codigo: 'POSPUESTA', etiqueta: 'Pospuesta', clase: 'pending' },
  { codigo: 'REPROGRAMADA', etiqueta: 'Reprogramada', clase: 'scheduled' },
];

export const CODIGOS_ESTADO_REUNION: readonly EstadoReunionCodigo[] = ESTADOS_REUNION.map(
  (e) => e.codigo,
);

/** Etiquetas del vocabulario anterior → código del catálogo (lo más parecido). */
const LEGACY_A_CODIGO: Record<string, EstadoReunionCodigo> = {
  Programada: 'PROGRAMADA',
  'En preparación': 'EN_CURSO',
  'Por confirmar': 'PROGRAMADA',
  Realizada: 'REALIZADA',
};

const DEF_POR_CODIGO: Record<string, EstadoReunionDef> = ESTADOS_REUNION.reduce(
  (acc, e) => {
    acc[e.codigo] = e;
    return acc;
  },
  {} as Record<string, EstadoReunionDef>,
);

/**
 * Acepta un código del catálogo, un valor viejo de la pantalla o basura de
 * localStorage y devuelve SIEMPRE un código válido (nunca `undefined`).
 */
export function normalizarEstadoReunion(valor: unknown): EstadoReunionCodigo {
  if (typeof valor !== 'string') return 'PROGRAMADA';
  const crudo = valor.trim();
  if (!crudo) return 'PROGRAMADA';
  const legacy = LEGACY_A_CODIGO[crudo];
  if (legacy) return legacy;
  const codigo = crudo.toUpperCase().replace(/[\s-]+/g, '_');
  if (codigo in DEF_POR_CODIGO) return codigo as EstadoReunionCodigo;
  return 'PROGRAMADA';
}

/** Etiqueta en español del estado (alias del catálogo / respaldo local). */
export function etiquetaEstadoReunion(valor: unknown): string {
  return DEF_POR_CODIGO[normalizarEstadoReunion(valor)]!.etiqueta;
}

/** Variante visual del pill (una de las 4 clases ya existentes en el CSS). */
export function claseEstadoReunion(valor: unknown): ClasePill {
  return DEF_POR_CODIGO[normalizarEstadoReunion(valor)]!.clase;
}
