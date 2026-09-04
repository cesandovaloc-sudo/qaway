import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './src/components/Layout'
import Home from './src/pages/Home'
import Servicios from './src/pages/Servicios'
import Nosotros from './src/pages/Nosotros'
import Recursos from './src/pages/Recursos'
import Contacto from './src/pages/Contacto'
import NotFound from './src/pages/NotFound'
import { BASE } from './src/config/site'
import './epc-landing.css'

const SEO_MAP = {
  [`${BASE}/`]: ['Estudio Contable Pro | Contabilidad clara para decisiones más seguras', 'Soluciones contables y tributarias integrales para empresas y profesionales.'],
  [`${BASE}/servicios`]: ['Servicios contables y tributarios | Estudio Contable Pro', 'Contabilidad general, declaraciones, asesoría tributaria, planillas, estados financieros y asesoría empresarial.'],
  [`${BASE}/nosotros`]: ['Nosotros | Estudio Contable Pro', 'Conoce el enfoque profesional de Estudio Contable Pro para ordenar, explicar y acompañar tu contabilidad.'],
  [`${BASE}/recursos`]: ['Recursos contables | Estudio Contable Pro', 'Información práctica para obligaciones, indicadores financieros y novedades contables.'],
  [`${BASE}/contacto`]: ['Contacto | Estudio Contable Pro', 'Solicita una evaluación y conversa con nuestro equipo sobre las necesidades de tu negocio.'],
}

const SITE_INFO = {
  name: 'Estudio Contable Pro',
  shortName: 'ECP',
  url: 'https://www.estudiocontablepro.pe',
  phone: '+51 998 888 777',
  whatsapp: '+51 930 756 781',
  email: 'hola@ecpcontablepro.pe',
  address: {
    streetAddress: 'Av. Caminos del Inca 1234, Oficina 502',
    addressLocality: 'Santiago de Surco',
    addressRegion: 'Lima',
    addressCountry: 'PE'
  },
  image: 'https://www.estudiocontablepro.pe/images/hero-contadora-duotono.png'
}

function EpcSEO() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.lang = 'es'
    const entry = SEO_MAP[pathname] || ['Estudio Contable Pro | Contabilidad clara para decisiones más seguras', 'Soluciones contables y tributarias integrales para empresas y profesionales.']
    const [title, description] = entry
    const currentUrl = `${window.location.origin}${pathname}`

    document.title = title

    // Meta tags helper
    const updateMeta = (attr, key, content) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, key)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateMeta('name', 'description', description)
    updateMeta('property', 'og:title', title)
    updateMeta('property', 'og:description', description)
    updateMeta('property', 'og:url', currentUrl)
    updateMeta('property', 'og:type', 'website')
    updateMeta('property', 'og:locale', 'es_PE')
    updateMeta('property', 'og:site_name', SITE_INFO.name)
    updateMeta('property', 'og:image', SITE_INFO.image)
    updateMeta('name', 'twitter:card', 'summary_large_image')
    updateMeta('name', 'twitter:title', title)
    updateMeta('name', 'twitter:description', description)
    updateMeta('name', 'twitter:image', SITE_INFO.image)

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)

    // Schema JSON-LD
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'AccountingService',
        '@id': `${SITE_INFO.url}/#organization`,
        name: SITE_INFO.name,
        alternateName: SITE_INFO.shortName,
        url: SITE_INFO.url,
        logo: `${SITE_INFO.url}/images/hero-contadora-duotono.png`,
        image: SITE_INFO.image,
        description: 'Servicios contables, declaraciones tributarias, planillas y asesoría financiera para empresas y profesionales en Lima, Perú.',
        telephone: SITE_INFO.phone,
        email: SITE_INFO.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE_INFO.address.streetAddress,
          addressLocality: SITE_INFO.address.addressLocality,
          addressRegion: SITE_INFO.address.addressRegion,
          addressCountry: SITE_INFO.address.addressCountry
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '-12.1384',
          longitude: '-76.9942'
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:30',
          closes: '18:30'
        },
        priceRange: '$$',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios Contables y Tributarios',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Contabilidad General' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Declaraciones Tributarias SUNAT' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asesoría y Planeamiento Tributario' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Gestión de Planillas y Recursos Humanos' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Estados Financieros y Auditoría' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asesoría Empresarial Estratégica' } }
          ]
        }
      }
    ]

    // Add BreadcrumbList if on subpage
    if (pathname !== BASE && pathname !== `${BASE}/`) {
      const pageName = pathname.replace(`${BASE}/`, '').replace(`${BASE}`, '')
      const formattedName = pageName.charAt(0).toUpperCase() + pageName.slice(1)
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${window.location.origin}${BASE}`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: formattedName,
            item: currentUrl
          }
        ]
      })
    }

    let script = document.getElementById('epc-schema-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'epc-schema-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schemas)

    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function EpcPage() {
  return (
    <div className="epc-landing">
      <EpcSEO />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="recursos" element={<Recursos />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}
