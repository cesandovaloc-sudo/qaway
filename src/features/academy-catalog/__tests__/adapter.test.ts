import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { SupabaseAcademyCoursesAdapter } from '../../../integrations/academy/academy-courses.adapter'

/** Builder fake: encadena eq/order/limit y resuelve como una query de Supabase. */
function fakeBuilder(rows: unknown[], error: unknown = null) {
  const q = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(() => q),
    then: (resolve: (v: unknown) => void) => resolve({ data: rows, error }),
  }
  return q
}

const catalogRow = {
  id: 'c1',
  title: 'Curso A',
  slug: 'curso-a',
  category: 'Diseño',
  level: null,
  duration: '4 módulos',
  price: '99.00',
  is_free: false,
  image_url: null,
  short_description: 'Desc',
  featured: true,
  badge_text: null,
  display_order: 1,
  created_at: '2026-07-01T10:00:00.000Z',
}

describe('SupabaseAcademyCoursesAdapter', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    // Configurar el cliente de Academy como si estuviera presente.
    Object.assign(import.meta.env, {
      VITE_ACADEMY_SUPABASE_URL: 'https://academy.example.supabase.co',
      VITE_ACADEMY_SUPABASE_ANON_KEY: 'anon-key-fake',
      VITE_ACADEMY_URL: 'https://academy.qawaylab.com',
      VITE_PUBLIC_ASSETS_URL: '',
    })
  })

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv)
    vi.resetModules()
  })

  async function makeAdapter(rows: unknown[], error: unknown = null) {
    const builder = fakeBuilder(rows, error)
    // Re-importar los módulos para que lean las env vars recién asignadas.
    const { SupabaseAcademyCoursesAdapter: AdapterClass } = await import(
      '../../../integrations/academy/academy-courses.adapter'
    )
    const clientMod = await import('../../../integrations/academy/academy.client')
    // Forzar el cliente fake: el adapter usa academyClient del módulo.
    ;(clientMod.academyClient as unknown as { from: unknown }).from = vi.fn(() => builder)
    const adapter = new AdapterClass()
    return { adapter, builder, clientMod }
  }

  it('getFeaturedCourses consulta la vista con featured=true y mapea al contrato', async () => {
    const { adapter, builder, clientMod } = await makeAdapter([catalogRow])
    const result = await adapter.getFeaturedCourses(4)
    expect((clientMod.academyClient as unknown as { from: ReturnType<typeof vi.fn> }).from).toHaveBeenCalledWith('public_course_catalog')
    expect(builder.eq).toHaveBeenCalledWith('featured', true)
    expect(builder.limit).toHaveBeenCalledWith(4)
    expect(result).toHaveLength(1)
    expect(result[0].price).toBe(99)
    expect(result[0].href).toBe('https://academy.qawaylab.com/cursos/curso-a')
  })

  it('getCoursesByCategory filtra por categoría', async () => {
    const { adapter, builder } = await makeAdapter([catalogRow])
    await adapter.getCoursesByCategory('Diseño', 3)
    expect(builder.eq).toHaveBeenCalledWith('category', 'Diseño')
    expect(builder.limit).toHaveBeenCalledWith(3)
  })

  it('getLatestCourses no filtra por featured', async () => {
    const { adapter, builder } = await makeAdapter([catalogRow])
    await adapter.getLatestCourses(2)
    expect(builder.eq).not.toHaveBeenCalledWith('featured', true)
    expect(builder.limit).toHaveBeenCalledWith(2)
  })

  it('propaga errores de Supabase', async () => {
    const { adapter } = await makeAdapter([], { message: 'boom' })
    await expect(adapter.getFeaturedCourses(1)).rejects.toThrow('boom')
  })
})
