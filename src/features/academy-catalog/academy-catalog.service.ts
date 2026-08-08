import type { CoursesCatalogAdapter } from '../../integrations/academy'
import { SupabaseAcademyCoursesAdapter } from '../../integrations/academy'
import { createAcademyCatalogRepository } from './academy-catalog.repository'
import type { AcademyCatalogRepository } from './academy-catalog.repository'
import type { AcademyCatalogState } from './academy-catalog.repository'

/**
 * Servicio del catálogo de Academy.
 * Capa intermedia entre la UI y el backend: los componentes nunca conocen
 * Supabase ni los nombres internos de columnas.
 */
export class AcademyCatalogService {
  private readonly repository: AcademyCatalogRepository

  constructor(adapter: CoursesCatalogAdapter = new SupabaseAcademyCoursesAdapter()) {
    this.repository = createAcademyCatalogRepository(adapter)
  }

  getFeaturedCourses(limit = 4): Promise<AcademyCatalogState> {
    return this.repository.getFeatured(limit)
  }

  getCoursesByCategory(category: string, limit?: number): Promise<AcademyCatalogState> {
    return this.repository.getByCategory(category, limit)
  }

  getLatestCourses(limit = 4): Promise<AcademyCatalogState> {
    return this.repository.getLatest(limit)
  }
}

/** Instancia singleton reutilizable en toda la Web. */
export const academyCatalogService = new AcademyCatalogService()
