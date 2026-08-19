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

const LOCAL_COURSE_FALLBACK_IMAGES: Record<string, string> = {
  'identidad-visual-con-ia': '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
  'whatsapp-business-para-negocios': '/assets/pages/4-academy/curso-whatsapp-business2.png',
  'antigravity-desde-cero': '/assets/pages/4-academy/curso-antigravity-youtube2.png',
  'ia-para-equipos-pequenos': '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
  'sistema-de-contenido-con-ia': '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
  'workflows-sin-codigo': '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
  'presencia-digital-para-emprender': '/assets/pages/4-academy/curso-whatsapp-business2.png',
}

/** Obtiene la ruta de imagen local empaquetada como contingencia pasiva. */
export function getLocalFallbackCourseImage(slug?: string | null, title?: string | null): string {
  if (slug && LOCAL_COURSE_FALLBACK_IMAGES[slug]) {
    return LOCAL_COURSE_FALLBACK_IMAGES[slug]
  }
  const clean = `${slug || ''} ${title || ''}`.toLowerCase()
  
  if (clean.includes('whatsapp')) {
    return '/assets/pages/4-academy/curso-whatsapp-business2.png'
  }
  if (clean.includes('identidad') || clean.includes('visual') || clean.includes('marca')) {
    return '/assets/pages/4-academy/curso-identidad-visual-ia2.png'
  }
  if (clean.includes('antigravity') || clean.includes('youtube')) {
    return '/assets/pages/4-academy/curso-antigravity-youtube2.png'
  }
  if (clean.includes('productividad') || clean.includes('equipo') || clean.includes('workflow')) {
    return '/assets/pages/4-academy/curso-productividad-ia.png'
  }
  return '/assets/pages/4-academy/curso-whatsapp-business2.png'
}

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
