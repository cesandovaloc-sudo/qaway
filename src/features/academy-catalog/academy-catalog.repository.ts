import type { PublicCourseV1 } from '../../contracts/courses/v1.types'
import type { CoursesCatalogAdapter } from '../../integrations/academy'
import {
  AcademyCatalogNotConfiguredError,
  AcademyCatalogTimeoutError,
} from '../../integrations/academy'

/** Timeout razonable para consultas públicas del catálogo. */
export const ACADEMY_CATALOG_TIMEOUT_MS = 8000

/**
 * Repositorio: orquesta la cadena datos en vivo → caché → fallback.
 * El componente solo recibe estados y datos preparados.
 */
export interface AcademyCatalogState {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'cached' | 'fallback' | 'error'
  courses: PublicCourseV1[]
  error: string | null
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AcademyCatalogTimeoutError()), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (reason) => {
        clearTimeout(timer)
        reject(reason)
      },
    )
  })
}

export function createAcademyCatalogRepository(
  adapter: CoursesCatalogAdapter,
  timeoutMs: number = ACADEMY_CATALOG_TIMEOUT_MS,
) {
  async function getFeatured(limit: number): Promise<AcademyCatalogState> {
    try {
      const live = await withTimeout(adapter.getFeaturedCourses(limit), timeoutMs)

      if (live.length === 0) {
        // Respuesta válida sin destacados: NO mostrar caché antigua como si
        // siguieran destacados. Estado vacío controlado.
        return { status: 'empty', courses: [], error: null }
      }
      return { status: 'success', courses: live, error: null }
    } catch (error) {
      if (error instanceof AcademyCatalogNotConfiguredError) {
        return { status: 'fallback', courses: [], error: error.message }
      }
      return { status: 'error', courses: [], error: error instanceof Error ? error.message : String(error) }
    }
  }

  async function getByCategory(category: string, limit?: number): Promise<AcademyCatalogState> {
    try {
      const live = await withTimeout(adapter.getCoursesByCategory(category, limit), timeoutMs)
      return live.length === 0
        ? { status: 'empty', courses: [], error: null }
        : { status: 'success', courses: live, error: null }
    } catch (error) {
      return {
        status: 'error',
        courses: [],
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  async function getLatest(limit: number): Promise<AcademyCatalogState> {
    try {
      const live = await withTimeout(adapter.getLatestCourses(limit), timeoutMs)
      return live.length === 0
        ? { status: 'empty', courses: [], error: null }
        : { status: 'success', courses: live, error: null }
    } catch (error) {
      return {
        status: 'error',
        courses: [],
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  return { getFeatured, getByCategory, getLatest }
}

export type AcademyCatalogRepository = ReturnType<typeof createAcademyCatalogRepository>
