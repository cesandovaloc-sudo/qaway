/**
 * Saneamiento del DSL de filtros de PostgREST.
 *
 * Hallazgo run-2 `inventario.postgrest.or-dsl-filter-injection`:
 * postgrest-js (2.112.1) concatena el string crudo en el parámetro `or=`
 * sin escaping (`searchParams.append(key, `(${filters})`)`, ver
 * node_modules/@supabase/postgrest-js/dist/index.cjs:1980) y su
 * documentación delega el saneamiento en el caller.
 *
 * Un término sin saneamiento permite alterar la estructura del predicate
 * (cerrar el `or(`, añadir condiciones, cambiar el field-scope) y usar el
 * parseo como oráculo. Este helper neutraliza los caracteres estructurales
 * antes de cualquier interpolación.
 */

/** Longitud máxima del término de búsqueda aceptado. */
const MAX_TERM_LENGTH = 120

/**
 * Escapa caracteres con significado estructural en el DSL de PostgREST:
 * - `(` `)` delimitan grupos del predicate
 * - `,` separa condiciones dentro de or()
 * - `"` `'` delimitan valores literales
 * - `\` escape de LIKE
 *
 * `%` y `_` (wildcards de ilike) se conservan: no alteran la estructura
 * del predicate, solo el comportamiento de búsqueda.
 */
export function escapeOrFilterTerm(value: unknown): string {
  return String(value ?? '')
    .replace(/[(),"'\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TERM_LENGTH)
}

/**
 * Construye un filtro `or=` seguro para búsqueda `ilike` en varias columnas.
 * Retorna string vacío si el término saneado queda vacío — el caller debe
 * omitir la llamada a `.or()` en ese caso (un `or()` vacío genera `(())`,
 * que PostgREST rechaza).
 *
 * @example
 * const orFilter = ilikeOr(['name', 'sku'], filters.search)
 * if (orFilter) query = query.or(orFilter)
 */
export function ilikeOr(columns: readonly string[], term: unknown): string {
  const safe = escapeOrFilterTerm(term)
  if (!safe) return ''
  return columns.map((c) => `${c}.ilike.%${safe}%`).join(',')
}
