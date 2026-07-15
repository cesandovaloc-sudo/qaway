import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPublicPathAllowed } from '@/config/siteVisibility'

const SITE_URL = 'https://qawaylab.com'

const seoByPath = {
  '/': {
    title: 'Qaway Lab | IA, estudio creativo y sistemas digitales',
    description: 'Qaway Lab integra estudio creativo, sistemas digitales, automatizacion, marketing, formacion y recursos con IA aplicada.',
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

function setJsonLd(id, data) {
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove()
}

export default function RouteSeo() {
  const location = useLocation()

  useEffect(() => {
    const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '')
    const seo = seoByPath[normalizedPath] || seoByPath['/']
    const canonicalPath = isPublicPathAllowed(normalizedPath) ? normalizedPath : '/'
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`

    document.title = seo.title
    setMeta('description', seo.description)
    setMeta('robots', isPublicPathAllowed(normalizedPath) ? 'index,follow' : 'noindex,nofollow')
    setCanonical(canonicalUrl)

    if (normalizedPath === '/') {
      setJsonLd('qaway-home-schema', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Qaway Lab',
            url: SITE_URL,
            description: 'Ecosistema de IA aplicada, estudio creativo, sistemas digitales, automatizacion, marketing, formacion y recursos.',
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'Qaway Lab',
            url: SITE_URL,
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
          {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/#webpage`,
            url: SITE_URL,
            name: seo.title,
            description: seo.description,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            about: { '@id': `${SITE_URL}/#organization` },
          },
        ],
      })
    } else {
      removeJsonLd('qaway-home-schema')
    }
  }, [location.pathname])

  return null
}
