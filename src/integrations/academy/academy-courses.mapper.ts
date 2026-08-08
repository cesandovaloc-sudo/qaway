import { publicCourseV1Schema } from '../../contracts/courses/v1.schema'
import type { PublicCourseV1 } from '../../contracts/courses/v1.types'
import { getAcademyAssetsUrl, getAcademyUrl } from './academy.client'

/** Fila devuelta por la vista public_course_catalog de Academy. */
export interface AcademyCourseRow {
  id: string
  title: string
  slug: string
  category: string | null
  level: string | null
  duration: string | null
  price: number | string | null
  is_free: boolean
  image_url: string | null
  short_description: string | null
  featured: boolean
  badge_text: string | null
  display_order: number | null
  created_at: string
}

const VALID_LEVELS = ['Principiante', 'Intermedio', 'Avanzado'] as const

/** Resuelve rutas relativas de imagen a URLs públicas estables de Academy. */
export function resolveAcademyImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  if (/^https?:\/\//.test(imageUrl)) return imageUrl
  const base = (getAcademyAssetsUrl() || getAcademyUrl()).replace(/\/+$/, '')
  if (!base) return imageUrl
  return `${base}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

/** Construye el href del detalle de curso usando la ruta real de Academy. */
export function buildAcademyCourseHref(slug: string): string {
  const base = getAcademyUrl().replace(/\/+$/, '')
  return base ? `${base}/cursos/${slug}` : `/cursos/${slug}`
}

/**
 * Convierte una fila de la vista al contrato público v1 (validado en runtime).
 * Tolerante: niveles no estándar se degradan a null; un curso sin título se omite.
 */
export function mapAcademyCourseRowToV1(row: AcademyCourseRow): PublicCourseV1 {
  const candidate = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category ?? null,
    level: VALID_LEVELS.includes(row.level as (typeof VALID_LEVELS)[number]) ? row.level : null,
    duration: row.duration ?? null,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    isFree: Boolean(row.is_free),
    imageUrl: resolveAcademyImageUrl(row.image_url),
    shortDescription: row.short_description ?? null,
    featured: Boolean(row.featured),
    badgeText: row.badge_text ?? null,
    displayOrder: row.display_order ?? null,
    createdAt: row.created_at,
    href: buildAcademyCourseHref(row.slug),
  }

  const parsed = publicCourseV1Schema.safeParse(candidate)
  if (!parsed.success) {
    if (!row.title) throw parsed.error
    return publicCourseV1Schema.parse({ ...candidate, title: String(row.title) || 'Curso' })
  }
  return parsed.data
}

export function mapAcademyCourseRowsToV1(rows: AcademyCourseRow[]): PublicCourseV1[] {
  return rows.map(mapAcademyCourseRowToV1)
}
