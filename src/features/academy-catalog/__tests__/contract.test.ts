import { describe, it, expect } from 'vitest'
import { publicCourseV1Schema, publicCourseListV1Schema } from '../../../contracts/courses/v1.schema'
import { examplePublicCoursesV1 } from '../../../contracts/courses/v1.examples'

describe('courses contract v1 (copia web)', () => {
  it('acepta los ejemplos válidos de Academy', () => {
    const parsed = publicCourseListV1Schema.safeParse(examplePublicCoursesV1)
    expect(parsed.success).toBe(true)
  })

  it('rechaza datos corruptos (sin título)', () => {
    const bad = { ...examplePublicCoursesV1[0], title: '' }
    expect(publicCourseV1Schema.safeParse(bad).success).toBe(false)
  })

  it('rechaza price como string (debe ser number tras mapear)', () => {
    const bad = { ...examplePublicCoursesV1[0], price: '149.00' }
    expect(publicCourseV1Schema.safeParse(bad).success).toBe(false)
  })

  it('rechaza respuestas incompletas (sin href)', () => {
    const bad = { ...examplePublicCoursesV1[0] }
    delete (bad as Record<string, unknown>).href
    expect(publicCourseV1Schema.safeParse(bad).success).toBe(false)
  })

  it('acepta campos opcionales nulos', () => {
    expect(publicCourseV1Schema.safeParse(examplePublicCoursesV1[2]).success).toBe(true)
  })
})
