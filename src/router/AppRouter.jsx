import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ScrollToTop from '@/components/layout/ScrollToTop'
import InicioPage from '@/pages/1-inicio/InicioPage.jsx'
import LoginPage from '@/pages/auth/LoginPage'
import {
  EstudioPage,
  EstudioLayout,
  BrandingDigitalPage,
  ContenidoVisualPage,
  PresenciaProfesionalPage,
  EstrategiaDigitalPage as EstudioEstrategiaDigitalPage,
  ConsultoriaPage,
} from '@/pages/2-estudio'
import SistemasDigitalesPage from '@/pages/3-sistemas-digitales/SistemasDigitalesPage'
import { AutomatizacionPage } from '@/pages/3-sistemas-digitales/1-automatizacion'
import { CanalesDigitalesPage } from '@/pages/3-sistemas-digitales/2-canales-digitales'
import { WebsYLandingsPage } from '@/pages/3-sistemas-digitales/3-webs-y-landings'
import { CRMDatosDashboardsPage } from '@/pages/3-sistemas-digitales/4-crm-datos-dashboards'
import { AgentesIAPage } from '@/pages/3-sistemas-digitales/5-agentes-ia'
import { HerramientasInternasPage } from '@/pages/3-sistemas-digitales/6-herramientas-internas'
import { EstrategiaDigitalPage as SistemasEstrategiaDigitalPage } from '@/pages/3-sistemas-digitales/7-estrategia-digital'
import AcademyPage from '@/pages/4-academy/AcademyPage'
import HubPage from '@/pages/5-qaway-hub/HubPage'
import CRMPage from '@/pages/5-qaway-hub/crm/CRMPage'
import WabaCrmConsolePage from '@/pages/5-qaway-hub/waba-crm/WabaCrmConsolePage'
import RecursosPage from '@/pages/6-recursos/RecursosPage'
import EbookDigitalPage from '@/pages/6-recursos/EbookDigitalPage'
import RecursoVisorPage from '@/pages/6-recursos/RecursoVisorPage'
import BlogPage from '@/pages/7-blog/BlogPage'
import ArticleDetailPage from '@/pages/7-blog/ArticleDetailPage'
import LandingsPage from '@/pages/8-landings/LandingsPage'
import SistemaContenidosNotionLandingPage from '@/pages/8-landings/1-sistema-contenido-notion/SistemaContenidosNotionLandingPage'
import IdentidadVisualLandingPage from '@/pages/8-landings/2-identidad-visual/IdentidadVisualLandingPage'
import ContableLandingPage from '@/pages/8-landings/3-contable/ContableLandingPage'
import RestauracionFotograficaPage from '@/pages/8-landings/4-restauracion-fotografica/RestauracionFotograficaPage'
import FotografiaLinkedinPage from '@/pages/8-landings/5-fotografia-linkedin/FotografiaLinkedinPage'
import BriefBrandingPage from '@/pages/10-briefs/BriefBrandingPage.jsx'
import DiscardedInicioPage from '@/pages/9-pruebas/1-paginas_descartadas/1-inicio/InicioPage.jsx'
import NotFoundPage from '@/pages/NotFoundPage'
import { isPublicSiteMode, isRouteEnabled } from '@/config/siteVisibility'

function ProtectedRoute({ children }) {
  return children
}

function renderRoute(routeKey, element) {
  if (isRouteEnabled(routeKey)) return element
  return <Navigate to="/" replace />
}

export default function AppRouter() {
  const notFoundElement = isPublicSiteMode ? <Navigate to="/" replace /> : <NotFoundPage />

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/landings/sistema-contenido-notion"
          element={renderRoute('landings', <SistemaContenidosNotionLandingPage />)}
        />
        <Route
          path="/landings/identidad-visual"
          element={renderRoute('landings', <IdentidadVisualLandingPage />)}
        />
        <Route
          path="/landings/contable"
          element={renderRoute('landings', <ContableLandingPage />)}
        />
        <Route
          path="/landings/restauracion-fotografica"
          element={renderRoute('landings', <RestauracionFotograficaPage />)}
        />
        <Route
          path="/landings/fotografia-linkedin"
          element={renderRoute('landings', <FotografiaLinkedinPage />)}
        />
        <Route
          path="/pruebas/inicio-descartado"
          element={renderRoute('pruebas', <DiscardedInicioPage />)}
        />
        <Route index element={<InicioPage />} />

        <Route element={<Layout />}>
          <Route
            path="hub"
            element={renderRoute('hub', <ProtectedRoute><HubPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/crm"
            element={renderRoute('hub', <ProtectedRoute><CRMPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/waba-crm"
            element={renderRoute('hub', <ProtectedRoute><WabaCrmConsolePage /></ProtectedRoute>)}
          />
          <Route
            path="hub/*"
            element={renderRoute('hub', <ProtectedRoute><HubPage /></ProtectedRoute>)}
          />

          <Route path="estudio" element={renderRoute('estudio', <EstudioLayout />)}>
            <Route index element={<EstudioPage />} />
            <Route path="branding-digital" element={<BrandingDigitalPage />} />
            <Route path="contenido-visual" element={<ContenidoVisualPage />} />
            <Route path="presencia-profesional" element={<PresenciaProfesionalPage />} />
            <Route path="estrategia-digital" element={<EstudioEstrategiaDigitalPage />} />
            <Route path="consultoria" element={<ConsultoriaPage />} />
          </Route>

          <Route path="brief" element={renderRoute('brief', <BriefBrandingPage />)} />

          <Route
            path="sistemas-digitales"
            element={renderRoute('sistemasDigitales', <SistemasDigitalesPage />)}
          />
          <Route
            path="sistemas-digitales/automatizacion"
            element={renderRoute('sistemasDigitales', <AutomatizacionPage />)}
          />
          <Route
            path="sistemas-digitales/canales-digitales"
            element={renderRoute('sistemasDigitales', <CanalesDigitalesPage />)}
          />
          <Route
            path="sistemas-digitales/webs-y-landings"
            element={renderRoute('sistemasDigitales', <WebsYLandingsPage />)}
          />
          <Route
            path="sistemas-digitales/crm-datos-dashboards"
            element={renderRoute('sistemasDigitales', <CRMDatosDashboardsPage />)}
          />
          <Route
            path="sistemas-digitales/agentes-ia"
            element={renderRoute('sistemasDigitales', <AgentesIAPage />)}
          />
          <Route
            path="sistemas-digitales/herramientas-internas"
            element={renderRoute('sistemasDigitales', <HerramientasInternasPage />)}
          />
          <Route
            path="sistemas-digitales/estrategia-digital"
            element={renderRoute('sistemasDigitales', <SistemasEstrategiaDigitalPage />)}
          />
          <Route
            path="sistemas-digitales/*"
            element={renderRoute('sistemasDigitales', <SistemasDigitalesPage />)}
          />

          <Route path="ops-ia" element={<Navigate to="/sistemas-digitales" replace />} />
          <Route
            path="ops-ia/automatizacion"
            element={<Navigate to="/sistemas-digitales/automatizacion" replace />}
          />
          <Route path="ops-ia/*" element={<Navigate to="/sistemas-digitales" replace />} />
          <Route
            path="ops-ia-v2"
            element={<Navigate to="/sistemas-digitales/automatizacion" replace />}
          />

          <Route path="academy" element={renderRoute('academy', <AcademyPage />)} />
          <Route path="academy/*" element={renderRoute('academy', <AcademyPage />)} />

          <Route path="recursos" element={renderRoute('recursos', <RecursosPage />)} />
          <Route path="recursos/:category" element={renderRoute('recursos', <RecursosPage />)} />
          <Route
            path="recursos/ebooks/google-calendar-dominado"
            element={renderRoute('recursos', <EbookDigitalPage />)}
          />
          <Route
            path="recursos/:resourceType/:id"
            element={renderRoute('recursos', <RecursoVisorPage />)}
          />
          <Route path="blog" element={renderRoute('blog', <BlogPage />)} />
          <Route path="blog/:category" element={renderRoute('blog', <BlogPage />)} />
          <Route
            path="blog/articulo/:id"
            element={renderRoute('blog', <ArticleDetailPage />)}
          />

          <Route path="landings" element={renderRoute('landings', <LandingsPage />)} />
          <Route path="landings/*" element={renderRoute('landings', <LandingsPage />)} />

          <Route path="*" element={notFoundElement} />
        </Route>

        <Route path="/login" element={renderRoute('auth', <LoginPage />)} />
        <Route path="*" element={notFoundElement} />
      </Routes>
    </>
  )
}
