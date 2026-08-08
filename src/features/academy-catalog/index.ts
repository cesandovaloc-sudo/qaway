export { useFeaturedCourses } from './use-featured-courses'
export type { UseFeaturedCoursesResult, FeaturedCoursesStatus } from './use-featured-courses'
export { AcademyCatalogService, academyCatalogService } from './academy-catalog.service'
export { getAcademyFallbackCards } from './academy-catalog.fallback'
export type { NeutralCard } from './academy-catalog.fallback'
export {
  ACADEMY_CACHE_KEY,
  ACADEMY_CACHE_TTL_MS,
  readAcademyCatalogCache,
  writeAcademyCatalogCache,
  isAcademyCatalogCacheFresh,
} from './academy-catalog.cache'
export type { AcademyCatalogCacheEntry } from './academy-catalog.cache'
