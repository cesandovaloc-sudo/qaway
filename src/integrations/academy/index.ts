export { SupabaseAcademyCoursesAdapter } from './academy-courses.adapter'
export type { CoursesCatalogAdapter } from './academy-courses.adapter'
export {
  mapAcademyCourseRowToV1,
  mapAcademyCourseRowsToV1,
  resolveAcademyImageUrl,
  buildAcademyCourseHref,
  getLocalFallbackCourseImage,
} from './academy-courses.mapper'
export type { AcademyCourseRow } from './academy-courses.mapper'
export { academyClient, academyConfigured, getAcademyUrl, getAcademyAssetsUrl } from './academy.client'
export {
  AcademyCatalogError,
  AcademyCatalogTimeoutError,
  AcademyCatalogInvalidResponseError,
  AcademyCatalogNotConfiguredError,
} from './academy-courses.errors'
