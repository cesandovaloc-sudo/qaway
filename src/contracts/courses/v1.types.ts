import type { z } from 'zod'
import { publicCourseV1Schema } from './v1.schema'

/** Curso público individual — courses contract v1 */
export type PublicCourseV1 = z.infer<typeof publicCourseV1Schema>

/** Lista de cursos públicos — courses contract v1 */
export type PublicCourseListV1 = z.infer<typeof publicCourseV1Schema>[]
