import { describe, it, expect } from 'vitest'
import { createAcademyCatalogRepository } from '../academy-catalog.repository'
import type { CoursesCatalogAdapter } from '../../../integrations/academy'
import type { PublicCourseV1 } from '../../../contracts/courses/v1.types'

function makeAdapter(overrides: Partial<CoursesCatalogAdapter> = {}): CoursesCatalogAdapter {
  return {
    getFeaturedCourses: () => Promise.resolve([]),
    getCoursesByCategory: () => Promise.resolve([]),
    getLatestCourses: () => Promise.resolve([]),
    ...overrides,
  }
}

const course: PublicCourseV1 = {
  id: 'c1',
  title: 'Curso A',
  slug: 'curso-a',
  category: 'Diseño',
  level: null,
  duration: null,
  price: null,
  isFree: true,
  imageUrl: null,
  shortDescription: null,
  featured: true,
  badgeText: 'Nuevo',
  displayOrder: 1,
  createdAt: '2026-07-01T10:00:00.000Z',
  href: 'https://academy.qawaylab.com/cursos/curso-a',
}

describe('academy-catalog.repository', () => {
  it('success con cursos destacados', async () => {
    const repo = createAcademyCatalogRepository(makeAdapter({ getFeaturedCourses: () => Promise.resolve([course]) }))
    const state = await repo.getFeatured(4)
    expect(state.status).toBe('success')
    expect(state.courses).toHaveLength(1)
  })

  it('respuesta válida sin destacados → empty (no mezcla no-destacados)', async () => {
    const repo = createAcademyCatalogRepository(makeAdapter())
    const state = await repo.getFeatured(4)
    expect(state.status).toBe('empty')
    expect(state.courses).toHaveLength(0)
  })

  it('error técnico → error', async () => {
    const repo = createAcademyCatalogRepository(
      makeAdapter({ getFeaturedCourses: () => Promise.reject(new Error('boom')) }),
    )
    const state = await repo.getFeatured(4)
    expect(state.status).toBe('error')
    expect(state.error).toContain('boom')
  })

  it('timeout → error de timeout', async () => {
    const never = new Promise<PublicCourseV1[]>(() => {})
    const repo = createAcademyCatalogRepository(makeAdapter({ getFeaturedCourses: () => never }), 50)
    const state = await repo.getFeatured(4)
    expect(state.status).toBe('error')
    expect(state.error).toContain('tiempo límite')
  })

  it('variables ausentes → fallback', async () => {
    const repo = createAcademyCatalogRepository(
      makeAdapter({ getFeaturedCourses: () => Promise.reject(new Error('Faltan las variables de Academy')) }),
    )
    const state = await repo.getFeatured(4)
    expect(state.status).toBe('error')
  })

  it('por categoría con límite', async () => {
    const repo = createAcademyCatalogRepository(
      makeAdapter({ getCoursesByCategory: () => Promise.resolve([course]) }),
    )
    const state = await repo.getByCategory('Diseño', 2)
    expect(state.status).toBe('success')
  })
})
