import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import InicioPage from '@/pages/1-inicio/InicioPage.jsx'
import {
  EstudioPage,
  EstudioLayout,
  BrandingDigitalPage,
  ContenidoVisualPage,
  PresenciaProfesionalPage,
  EstrategiaDigitalPage,
  ConsultoriaPage
} from '@/pages/2-estudio'
import ScrollToTop from '@/components/layout/ScrollToTop'

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route index element={<InicioPage />} />

        <Route element={<Layout />}>
          <Route path="estudio" element={<EstudioLayout />}>
            <Route index element={<EstudioPage />} />
            <Route path="branding-digital" element={<BrandingDigitalPage />} />
            <Route path="contenido-visual" element={<ContenidoVisualPage />} />
            <Route path="presencia-profesional" element={<PresenciaProfesionalPage />} />
            <Route path="estrategia-digital" element={<EstrategiaDigitalPage />} />
            <Route path="consultoria" element={<ConsultoriaPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}