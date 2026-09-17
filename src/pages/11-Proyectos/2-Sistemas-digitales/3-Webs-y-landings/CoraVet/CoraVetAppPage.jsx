import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './coravet-web-v4/src/components/Header'
import { Footer } from './coravet-web-v4/src/components/Footer'
import { Home } from './coravet-web-v4/src/pages/Home'
import { Services } from './coravet-web-v4/src/pages/Services'
import { UviVet } from './coravet-web-v4/src/pages/UviVet'
import { Team } from './coravet-web-v4/src/pages/Team'
import { PetShop } from './coravet-web-v4/src/pages/PetShop'
import { Blog } from './coravet-web-v4/src/pages/Blog'
import { Contact } from './coravet-web-v4/src/pages/Contact'
import { Booking } from './coravet-web-v4/src/pages/Booking'
import './coravet-landing.css'

const SEO_MAP = {
  '': 'CoraVet | Clínica Veterinaria Integral & Pet Shop',
  '/': 'CoraVet | Clínica Veterinaria Integral & Pet Shop',
  'veterinaria': 'Servicios Veterinarios | CoraVet',
  'uvivet': 'UviVet - Cuidados Intensivos y Hospitalización | CoraVet',
  'equipo': 'Nuestro Equipo Médico Especializado | CoraVet',
  'pet-shop': 'Pet Shop & Farmacia Veterinaria | CoraVet',
  'blog': 'Recursos, Consejos y Salud de Mascotas | CoraVet',
  'contacto': 'Contacto, Ubicación y Emergencias | CoraVet',
  'reservar-cita': 'Reservar Cita Veterinaria Online | CoraVet',
}

function CoraVetScrollAndSEO() {
  const { pathname } = useLocation()

  useEffect(() => {
    const subRoute = pathname
      .replace(/^\/proyectos\/coravet\/?/, '')
      .split('/')[0]

    const title = SEO_MAP[subRoute] || 'CoraVet | Clínica Veterinaria Integral'
    document.title = title

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function CoraVetAppPage() {
  return (
    <div className="coravet-app">
      <CoraVetScrollAndSEO />
      <Header />
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="veterinaria" element={<Services />} />
          <Route path="uvivet" element={<UviVet />} />
          <Route path="equipo" element={<Team />} />
          <Route path="pet-shop" element={<PetShop />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="reservar-cita" element={<Booking />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
