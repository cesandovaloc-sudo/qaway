import type { PublicCourseListV1 } from './v1.types'

/**
 * Ejemplos realistas y válidos de courses contract v1.
 * No contienen datos privados ni administrativos.
 */
export const examplePublicCoursesV1: PublicCourseListV1 = [
  {
    id: 'c1000000-0001-0000-0000-000000000001',
    title: 'Identidad Visual con IA',
    slug: 'identidad-visual-con-ia',
    category: 'Diseño',
    level: 'Principiante',
    duration: '6 módulos',
    price: 149,
    isFree: false,
    imageUrl: 'https://academy.qawaylab.com/assets/pages/4-academy/curso-identidad-visual-ia2.png',
    shortDescription: 'Construye una identidad coherente usando criterio visual y herramientas de IA.',
    featured: true,
    badgeText: 'Más solicitado',
    displayOrder: 1,
    createdAt: '2026-07-01T10:00:00.000Z',
    href: 'https://academy.qawaylab.com/cursos/identidad-visual-con-ia',
  },
  {
    id: 'c1000000-0002-0000-0000-000000000002',
    title: 'WhatsApp Business para negocios',
    slug: 'whatsapp-business-para-negocios',
    category: 'Marketing',
    level: null,
    duration: '4 sesiones',
    price: null,
    isFree: true,
    imageUrl: null,
    shortDescription: 'Organiza consultas, respuestas y catálogo para una mejor experiencia comercial.',
    featured: true,
    badgeText: 'Nuevo',
    displayOrder: 2,
    createdAt: '2026-07-02T10:00:00.000Z',
    href: 'https://academy.qawaylab.com/cursos/whatsapp-business-para-negocios',
  },
  {
    id: 'c1000000-0003-0000-0000-000000000003',
    title: 'Curso sin datos opcionales',
    slug: 'curso-sin-datos-opcionales',
    category: null,
    level: null,
    duration: null,
    price: null,
    isFree: true,
    imageUrl: null,
    shortDescription: null,
    featured: false,
    badgeText: null,
    displayOrder: null,
    createdAt: '2026-07-03T10:00:00.000Z',
    href: 'https://academy.qawaylab.com/cursos/curso-sin-datos-opcionales',
  },
]
