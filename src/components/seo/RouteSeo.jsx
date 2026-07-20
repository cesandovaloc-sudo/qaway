import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPublicPathAllowed } from '@/config/siteVisibility'

const SITE_URL = 'https://qawaylab.com'
const DEFAULT_IMAGE = `${SITE_URL}/assets/pages/1-inicio/hero-qaway-vision-lab.webp`

const seoByPath = {
  '/': {
    title: 'Qaway Lab | Marcas, sistemas digitales y formacion con IA',
    description: 'Qaway Lab integra estudio creativo, sistemas digitales, automatizacion, marketing, formacion y recursos con IA aplicada para marcas, negocios y proyectos.',
  },
  '/estudio': {
    title: 'Estudio Qaway | Marca, contenido e identidad visual',
    description: 'Crea una presencia visual clara para tu marca con identidad, contenido, imagen profesional y direccion creativa aplicada.',
  },
  '/proyectos': {
    title: 'Proyectos Qaway | Branding, contenido y sistemas digitales',
    description: 'Explora proyectos de branding, contenido visual, presencia digital, automatizacion, CRM, webs y sistemas digitales desarrollados por Qaway Lab.',
  },
  '/sistemas-digitales': {
    title: 'Sistemas Digitales | Automatizacion, CRM e IA para negocios',
    description: 'Implementa automatizacion, dashboards, CRM, canales digitales y sistemas con IA para ordenar la operacion de tu negocio.',
  },
  '/academy': {
    title: 'Qaway Academy | Formacion aplicada en IA y sistemas digitales',
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

function setPropertyMeta(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
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

export default function RouteSeo() {
  const location = useLocation()

  useEffect(() => {
    const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '')
    const seo = seoByPath[normalizedPath] || seoByPath['/']
    const isAllowed = isPublicPathAllowed(normalizedPath)
    const canonicalPath = isAllowed ? normalizedPath : '/'
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`
    const pageId = `${canonicalUrl}#webpage`

    document.title = seo.title
    setMeta('description', seo.description)
    setMeta('robots', isAllowed ? 'index,follow' : 'noindex,nofollow')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', seo.title)
    setMeta('twitter:description', seo.description)
    setMeta('twitter:image', DEFAULT_IMAGE)
    setPropertyMeta('og:locale', 'es_PE')
    setPropertyMeta('og:type', 'website')
    setPropertyMeta('og:site_name', 'Qaway Lab')
    setPropertyMeta('og:title', seo.title)
    setPropertyMeta('og:description', seo.description)
    setPropertyMeta('og:url', canonicalUrl)
    setPropertyMeta('og:image', DEFAULT_IMAGE)
    setCanonical(canonicalUrl)

    setJsonLd('qaway-route-schema', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'Qaway Lab',
          url: SITE_URL,
          description: 'Estudio creativo, sistemas digitales, automatizacion, marketing, formacion y recursos con IA aplicada.',
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'Qaway Lab',
          url: SITE_URL,
          inLanguage: 'es-PE',
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': pageId,
          url: canonicalUrl,
          name: seo.title,
          description: seo.description,
          inLanguage: 'es-PE',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${SITE_URL}/#organization` },
        },
      ],
    })
  }, [location.pathname])

  return null
}
