import { useCallback, useEffect, useRef, useState } from 'react'
import type { PublicCourseV1 } from '../../contracts/courses/v1.types'
import { academyCatalogService } from './academy-catalog.service'
import {
  isAcademyCatalogCacheFresh,
  readAcademyCatalogCache,
  writeAcademyCatalogCache,
} from './academy-catalog.cache'
import { getAcademyFallbackCards } from './academy-catalog.fallback'

export type FeaturedCoursesStatus = 'loading' | 'success' | 'empty' | 'cached' | 'fallback' | 'error'

export interface UseFeaturedCoursesResult {
  status: FeaturedCoursesStatus
  courses: PublicCourseV1[]
  fallbackCards: ReturnType<typeof getAcademyFallbackCards>
  error: string | null
  reload: () => void
}

/**
 * Cursos destacados de Academy para la sección "Cursos aplicados".
 * Cascada de contingencia:
 *   1. Datos en vivo (valida contrato + actualiza caché).
 *   2. Última respuesta válida (caché versionada, 1h).
 *   3. Fallback neutral (sin datos inventados).
 * Una respuesta VÁLIDA sin destacados NO muestra caché antigua.
 */
export function useFeaturedCourses(limit = 4): UseFeaturedCoursesResult {
  const [status, setStatus] = useState<FeaturedCoursesStatus>('loading')
  const [courses, setCourses] = useState<PublicCourseV1[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const active = useRef(true)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    active.current = true
    let cancelled = false

    async function load() {
      setStatus('loading')
      setError(null)
      const state = await academyCatalogService.getFeaturedCourses(limit)

      if (cancelled || !active.current) return

      if (state.status === 'success') {
        writeAcademyCatalogCache(state.courses)
        setCourses(state.courses)
        setStatus('success')
        return
      }

      if (state.status === 'empty') {
        // Respuesta válida sin destacados: NUNCA mostrar caché antigua.
        setCourses([])
        setStatus('empty')
        return
      }

      // Error técnico: intentar la última respuesta válida (caché).
      const cached = readAcademyCatalogCache()
      if (cached && isAcademyCatalogCacheFresh(cached) && cached.courses.length > 0) {
        setCourses(cached.courses)
        setStatus('cached')
        setError(state.error)
        return
      }

      // Sin conexión ni caché: fallback neutral.
      setCourses([])
      setStatus('fallback')
      setError(state.error)
    }

    load()
    return () => {
      cancelled = true
      active.current = false
    }
  }, [limit, tick])

  return {
    status,
    courses,
    fallbackCards: getAcademyFallbackCards(),
    error,
    reload,
  }
}
