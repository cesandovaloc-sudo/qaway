import type { PublicCourseV1 } from '../../contracts/courses/v1.types'
import { academyClient, academyConfigured } from './academy.client'
import { mapAcademyCourseRowsToV1, type AcademyCourseRow } from './academy-courses.mapper'
import {
  AcademyCatalogInvalidResponseError,
  AcademyCatalogNotConfiguredError,
} from './academy-courses.errors'

/** Contrato de acceso al catálogo público de Academy (backend intercambiable). */
export interface CoursesCatalogAdapter {
  getFeaturedCourses(limit: number): Promise<PublicCourseV1[]>
  getCoursesByCategory(category: string, limit?: number): Promise<PublicCourseV1[]>
  getLatestCourses(limit: number): Promise<PublicCourseV1[]>
}

/** Tipo mínimo del query builder de Supabase (la vista no tiene tipos conocidos). */
interface CatalogQuery {
  eq(column: string, value: unknown): CatalogQuery
  order(column: string, opts: { ascending: boolean; nullsFirst?: boolean }): CatalogQuery
  limit(count: number): CatalogQuery
}

const CATALOG_VIEW = 'public_course_catalog'

/**
 * Adaptador Supabase del catálogo de Academy.
 * Solo lectura pública (anon key) de la vista; nunca escribe ni usa service_role.
 */
export class SupabaseAcademyCoursesAdapter implements CoursesCatalogAdapter {
  async fetchRows(buildQuery: (q: CatalogQuery) => CatalogQuery): Promise<PublicCourseV1[]> {
    if (!academyConfigured || !academyClient) {
      throw new AcademyCatalogNotConfiguredError()
    }
    const base = academyClient.from(CATALOG_VIEW).select('*') as unknown as CatalogQuery
    const result = (await buildQuery(base)) as unknown as {
      data: unknown[] | null
      error: { message: string } | null
    }
    if (result.error) throw result.error
    if (!Array.isArray(result.data)) {
      throw new AcademyCatalogInvalidResponseError()
    }
    return mapAcademyCourseRowsToV1(result.data as unknown as AcademyCourseRow[])
  }

  getFeaturedCourses(limit: number): Promise<PublicCourseV1[]> {
    return this.fetchRows((q) =>
      q
        .eq('featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit),
    )
  }

  getCoursesByCategory(category: string, limit?: number): Promise<PublicCourseV1[]> {
    return this.fetchRows((q) => {
      let query = q.eq('category', category)
      if (limit !== undefined) query = query.limit(limit)
      return query
    })
  }

  getLatestCourses(limit: number): Promise<PublicCourseV1[]> {
    return this.fetchRows((q) => q.order('created_at', { ascending: false }).limit(limit))
  }
}
