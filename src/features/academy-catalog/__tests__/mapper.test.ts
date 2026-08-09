import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mapAcademyCourseRowToV1,
  mapAcademyCourseRowsToV1,
  resolveAcademyImageUrl,
  buildAcademyCourseHref,
  type AcademyCourseRow,
} from '../../../integrations/academy/academy-courses.mapper'

const row: AcademyCourseRow = {
  id: 'c1000000-0001-0000-0000-000000000001',
  title: 'Identidad Visual con IA',
  slug: 'identidad-visual-con-ia',
  category: 'Diseño',
  level: 'Principiante',
  duration: '6 módulos',
  price: '149.00',
  is_free: false,
  image_url: '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
  short_description: 'Descripción corta',
  featured: true,
  badge_text: 'Más solicitado',
  display_order: 1,
  created_at: '2026-07-01T10:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('academy-courses.mapper', () => {
  it('convierte price string→number, resuelve imagen y href', () => {
    vi.stubEnv('VITE_ACADEMY_URL', 'https://academy.qawaylab.com')
    vi.stubEnv('VITE_PUBLIC_ASSETS_URL', 'https://cdn.qawaylab.com')
    const v1 = mapAcademyCourseRowToV1(row)
    expect(v1.price).toBe(149)
    expect(v1.imageUrl).toBe('https://cdn.qawaylab.com/assets/pages/4-academy/curso-identidad-visual-ia2.png')
    expect(v1.href).toBe('https://academy.qawaylab.com/cursos/identidad-visual-con-ia')
    expect(v1.badgeText).toBe('Más solicitado')
  })

  it('degrada level no estándar a null (no rompe la lista)', () => {
    vi.stubEnv('VITE_ACADEMY_URL', 'https://academy.qawaylab.com')
    const v1 = mapAcademyCourseRowToV1({ ...row, level: 'Experto' })
    expect(v1.level).toBeNull()
  })

  it('usa ACADEMY_URL como fallback de assets', () => {
    vi.stubEnv('VITE_ACADEMY_URL', 'https://academy.qawaylab.com')
    vi.stubEnv('VITE_PUBLIC_ASSETS_URL', '')
    expect(resolveAcademyImageUrl('/assets/x.png')).toBe('https://academy.qawaylab.com/assets/x.png')
  })

  it('mapea nulos correctamente', () => {
    vi.stubEnv('VITE_ACADEMY_URL', 'https://academy.qawaylab.com')
    const sparse = { ...row, price: null, image_url: null, badge_text: null, display_order: null }
    const v1 = mapAcademyCourseRowToV1(sparse)
    expect(v1.price).toBeNull()
    expect(v1.imageUrl).toBeNull()
    expect(v1.badgeText).toBeNull()
  })

  it('construye href relativo cuando no hay VITE_ACADEMY_URL', () => {
    vi.stubEnv('VITE_ACADEMY_URL', '')
    expect(buildAcademyCourseHref('mi-curso')).toBe('/cursos/mi-curso')
  })

  it('mapea listas', () => {
    vi.stubEnv('VITE_ACADEMY_URL', 'https://academy.qawaylab.com')
    const list = mapAcademyCourseRowsToV1([row, { ...row, id: 'x', slug: 'otro', title: 'Otro' }])
    expect(list).toHaveLength(2)
    expect(list[1].slug).toBe('otro')
  })
})
