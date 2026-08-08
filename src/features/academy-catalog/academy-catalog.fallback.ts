import { getAcademyUrl } from '../../integrations/academy'

/** Tarjeta neutral de contingencia. NO inventa precios, duraciones ni badges. */
export interface NeutralCard {
  title: string
  text: string
  cta: string
  href: string
  icon: 'graduation' | 'compass'
}

/**
 * Fallback neutral: se muestra cuando no hay datos en vivo ni caché válida.
 * No finge ser un curso real (sin precio, duración, badge ni categoría falsos).
 */
export function getAcademyFallbackCards(): NeutralCard[] {
  const base = getAcademyUrl().replace(/\/+$/, '')
  const academyHref = base || '/academy'
  return [
    {
      title: 'Cursos aplicados',
      text: 'Explora formación práctica para desarrollar tu marca, tus procesos y tus sistemas digitales.',
      cta: 'Ver Academy',
      href: `${academyHref}/cursos`,
      icon: 'graduation',
    },
    {
      title: 'Academy Qaway',
      text: 'Conoce el catálogo de cursos y recursos disponibles en nuestra plataforma.',
      cta: 'Explorar cursos',
      href: `${academyHref}/cursos`,
      icon: 'compass',
    },
  ]
}
