import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPublicPathAllowed } from '@/config/siteVisibility'

const SITE_URL = 'https://qawaylab.com'

const seoByPath = {
  '/': {
    title: 'Qaway Lab | Marca, sistemas digitales e IA aplicada',
    description: 'Qaway Lab construye marca, sistemas digitales, recursos y aprendizaje con IA para profesionales, negocios y proyectos.',
  },
  '/estudio': {
    title: 'Estudio Qaway | Direccion visual, marca y contenido',
    description: 'Disena una presencia visual clara para tu marca con identidad, contenido, imagen profesional y criterio digital.',
  },
  '/sistemas-digitales': {
    title: 'Sistemas Digitales | Automatizacion, CRM e IA para negocios',
    description: 'Implementa automatizacion, dashboards, CRM, canales digitales y sistemas con IA para ordenar la operacion de tu negocio.',
  },
  '/academy': {
    title: 'Qaway Academy | Aprende IA, sistemas y contenido aplicado',
    description: 'Cursos practicos para aprender IA, automatizacion, contenido y herramientas digitales aplicadas a proyectos reales.',
  },
  '/recursos': {
    title: 'Recursos Qaway | Plantillas, ebooks y herramientas digitales',
    description: 'Descarga recursos practicos de Qaway Lab para productividad, IA, sistemas digitales y organizacion del trabajo.',
  },
  '/recursos/ebooks/google-calendar-dominado': {
    title: 'Google Calendar Dominado | Ebook gratuito de productividad',
    description: 'Aprende a ordenar tu agenda, tareas y calendarios con Google Calendar, IA y un metodo practico de productividad.',
  },
  '/blog': {
    title: 'Blog Qaway | Guias sobre IA, productividad y sistemas',
    description: 'Lee guias practicas de Qaway Lab sobre IA, productividad, automatizacion, marketing y sistemas digitales.',
  },
  '/blog/articulo/google-calendar-dominado-guia-productividad': {
    title: 'Google Calendar Dominado | Guia de productividad e IA',
    description: 'Guia para usar Google Calendar con metodo, IA y automatizacion para ordenar tu semana y reducir friccion operativa.',
  },
  '/landings/sistema-contenido-notion': {
    title: 'Sistema de Contenidos en Notion | Qaway Lab',
    description: 'Organiza un mes de contenido con un sistema estrategico en Notion para planificar, producir y publicar con claridad.',
  },
  '/landings/identidad-visual': {
    title: 'Curso Identidad Visual con IA | Qaway Lab',
    description: 'Aprende a crear logos, paletas y un kit de marca con inteligencia artificial y criterio visual aplicado.',
  },
}

function setMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export default function RouteSeo() {
  const location = useLocation()

  useEffect(() => {
    const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '')
    const seo = seoByPath[normalizedPath] || seoByPath['/']
    const canonicalPath = isPublicPathAllowed(normalizedPath) ? normalizedPath : '/'

    document.title = seo.title
    setMeta('description', seo.description)
    setMeta('robots', isPublicPathAllowed(normalizedPath) ? 'index,follow' : 'noindex,nofollow')
    setCanonical(`${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`)
  }, [location.pathname])

  return null
}
