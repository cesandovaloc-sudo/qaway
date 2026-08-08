import { z } from 'zod'

/**
 * courses contract v1 — Catálogo público de cursos.
 *
 * Propietario lógico: Qaway Academy (2-qawaylab-app-academy).
 * La Web principal y webs de clientes consumen este contrato; nunca duplican
 * el esquema ni escriben sobre `courses`.
 *
 * Nota: `href` no es una columna de base de datos; se construye en el adaptador
 * a partir de la ruta real /cursos/:slug y VITE_PUBLIC_SITE_URL.
 */
export const publicCourseV1Schema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().nullable(),
  level: z.enum(['Principiante', 'Intermedio', 'Avanzado']).nullable(),
  duration: z.string().nullable(),
  price: z.number().nullable(),
  isFree: z.boolean(),
  imageUrl: z.string().nullable(),
  shortDescription: z.string().nullable(),
  featured: z.boolean(),
  badgeText: z.string().nullable(),
  displayOrder: z.number().int().nullable(),
  createdAt: z.string().min(1),
  href: z.string().min(1),
})

export const publicCourseListV1Schema = z.array(publicCourseV1Schema)
