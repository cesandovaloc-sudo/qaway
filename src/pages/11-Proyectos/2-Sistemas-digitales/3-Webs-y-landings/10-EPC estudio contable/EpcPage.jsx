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

function EpcSEO() {
  const { pathname } = useLocation()
  useEffect(() => {
    const entry = SEO_MAP[pathname]
    document.title = entry ? entry[0] : 'Estudio Contable Pro'
    if (entry) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', entry[1])
    }
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
