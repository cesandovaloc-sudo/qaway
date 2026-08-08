import type { PublicCourseListV1 } from '../../contracts/courses/v1.types'
import { publicCourseListV1Schema } from '../../contracts/courses/v1.schema'

/**
 * Caché versionada del catálogo de Academy (última respuesta válida).
 * Solo para contingencia: nunca es fuente de verdad.
 * Vigencia: 1 hora.
 */
export const ACADEMY_CACHE_KEY = 'qaway_academy_featured_courses_v1'
export const ACADEMY_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora

export interface AcademyCatalogCacheEntry {
  version: 1
  cachedAt: string
  courses: PublicCourseListV1
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function readAcademyCatalogCache(): AcademyCatalogCacheEntry | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(ACADEMY_CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    const entry = parsed as AcademyCatalogCacheEntry
    if (entry?.version !== 1 || !entry.cachedAt || !Array.isArray(entry.courses)) return null
    const validated = publicCourseListV1Schema.safeParse(entry.courses)
    if (!validated.success) return null
    return { ...entry, courses: validated.data }
  } catch {
    return null
  }
}

export function writeAcademyCatalogCache(courses: PublicCourseListV1): void {
  if (!isBrowser()) return
  try {
    const entry: AcademyCatalogCacheEntry = {
      version: 1,
      cachedAt: new Date().toISOString(),
      courses,
    }
    window.localStorage.setItem(ACADEMY_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Los errores de almacenamiento nunca rompen la página.
  }
}

export function isAcademyCatalogCacheFresh(entry: AcademyCatalogCacheEntry | null): boolean {
  if (!entry) return false
  const age = Date.now() - new Date(entry.cachedAt).getTime()
  return Number.isFinite(age) && age <= ACADEMY_CACHE_TTL_MS
}
