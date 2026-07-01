import { Routes, Route, Navigate } from 'react-router-dom'
import AutomatizacionPage from '@/pages/3-sistemas-digitales/1-automatizacion/AutomatizacionPage'
import Layout from '@/components/layout/Layout'
import InicioPage from '@/pages/1-inicio/InicioPage.jsx'
import LoginPage from '@/pages/auth/LoginPage'

// Wrapper simple para rutas protegidas (Temporalmente liberado para pruebas en localhost)
function ProtectedRoute({ children }) {
  return children
}

import {
  EstudioPage,
  EstudioLayout,
  BrandingDigitalPage,
  ContenidoVisualPage,
  PresenciaProfesionalPage,
  EstrategiaDigitalPage,
  ConsultoriaPage
} from '@/pages/2-estudio'
import SistemasDigitalesPage from '@/pages/3-sistemas-digitales/SistemasDigitalesPage'
import AcademyPage from '@/pages/4-academy/AcademyPage'
import BriefBrandingPage from '@/pages/10-briefs/BriefBrandingPage'
import HubPage from '@/pages/5-qaway-hub/HubPage'
import CRMPage from '@/pages/5-qaway-hub/crm/CRMPage'
import WabaCrmConsolePage from '@/pages/5-qaway-hub/waba-crm/WabaCrmConsolePage'
import RecursosPage from '@/pages/6-recursos/RecursosPage'

import RecursosV2Page from '@/pages/6-recursos/RecursosV2Page'
import EbookVisorV2Page from '@/pages/6-recursos/EbookVisorV2Page'
import RecursoVisorPage from '@/pages/6-recursos/RecursoVisorPage'
import BlogPage from '@/pages/7-blog/BlogPage'
import ArticleDetailPage from '@/pages/7-blog/ArticleDetailPage'
import LandingsPage from '@/pages/8-landings/LandingsPage'
import SistemaContenidosNotionLandingPage from '@/pages/8-landings/1-sistema-contenido-notion/SistemaContenidosNotionLandingPage'
import IdentidadVisualLandingPage from '@/pages/8-landings/2-identidad-visual/IdentidadVisualLandingPage'
import ContableLandingPage from '@/pages/8-landings/3-contable/ContableLandingPage'
import RestauracionFotograficaPage from '@/pages/8-landings/4-restauración-fotográfica/RestauracionFotograficaPage'
import FotografiaLinkedinPage from '@/pages/8-landings/5-fotografia-linkedin/FotografiaLinkedinPage'

import RecursosPruebaPage from '@/pages/9-pruebas/5-Recursos/RecursosPruebaPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ScrollToTop from '@/components/layout/ScrollToTop'
import DiscardedInicioPage from '@/pages/9-pruebas/1-páginas_descartadas/1-inicio/InicioPage.jsx'

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Landing pages — standalone, outside main Layout */}
      <Route path="/landings/sistema-contenido-notion" element={<SistemaContenidosNotionLandingPage />} />
      <Route path="/landings/identidad-visual" element={<IdentidadVisualLandingPage />} />
      <Route path="/landings/contable" element={<ContableLandingPage />} />
      <Route path="/landings/restauracion-fotografica" element={<RestauracionFotograficaPage />} />
      <Route path="/landings/fotografia-linkedin" element={<FotografiaLinkedinPage />} />
      <Route path="/pruebas/inicio-descartado" element={<DiscardedInicioPage />} />


      {/* Rutas de prueba sin Layout */}

      <Route path="/pruebas/recursos" element={<RecursosPruebaPage />} />
      <Route path="/pruebas/recursos/:category" element={<RecursosPruebaPage />} />

      <Route index element={<InicioPage />} />

      <Route element={<Layout />}>
        {/* Rutas Protegidas del CRM / Hub (DENTRO DEL LAYOUT PÃšBLICO COMO SE SOLICITÃ“) */}
        <Route path="hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
        <Route path="hub/crm" element={<ProtectedRoute><CRMPage /></ProtectedRoute>} />
        <Route path="hub/waba-crm" element={<ProtectedRoute><WabaCrmConsolePage /></ProtectedRoute>} />
        <Route path="hub/*" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
        <Route path="estudio" element={<EstudioLayout />}>
          <Route index element={<EstudioPage />} />
          <Route path="branding-digital" element={<BrandingDigitalPage />} />
          <Route path="contenido-visual" element={<ContenidoVisualPage />} />
          <Route path="presencia-profesional" element={<PresenciaProfesionalPage />} />
          <Route path="estrategia-digital" element={<EstrategiaDigitalPage />} />
          <Route path="consultoria" element={<ConsultoriaPage />} />
        </Route>
        <Route path="/brief" element={<BriefBrandingPage />} />

        <Route path="sistemas-digitales" element={<SistemasDigitalesPage />} />
        <Route path="sistemas-digitales/automatizacion" element={<AutomatizacionPage />} />
        <Route path="sistemas-digitales/*" element={<SistemasDigitalesPage />} />
        
        {/* Redirecciones de retrocompatibilidad */}
        <Route path="ops-ia" element={<Navigate to="/sistemas-digitales" replace />} />
        <Route path="ops-ia/automatizacion" element={<Navigate to="/sistemas-digitales/automatizacion" replace />} />
        <Route path="ops-ia/*" element={<Navigate to="/sistemas-digitales" replace />} />
        <Route path="ops-ia-v2" element={<Navigate to="/sistemas-digitales/automatizacion" replace />} />
        <Route path="academy" element={<AcademyPage />} />
        <Route path="academy/*" element={<AcademyPage />} />
        
        <Route path="recursos" element={<RecursosPage />} />
        <Route path="recursos/visor/:id" element={<RecursoVisorPage />} />
        <Route path="recursos/*" element={<RecursosPage />} />
        
        {/* Rutas de prueba aisladas V2 */}
        <Route path="recursos-v2" element={<RecursosV2Page />} />
        <Route path="recursos-v2/visor" element={<EbookVisorV2Page />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:category" element={<BlogPage />} />
        <Route path="blog/articulo/:id" element={<ArticleDetailPage />} />
        <Route path="landings" element={<LandingsPage />} />
        <Route path="landings/*" element={<LandingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth Route */}
      <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}
