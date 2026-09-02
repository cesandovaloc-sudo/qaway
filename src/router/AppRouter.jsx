import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ScrollToTop from '@/components/layout/ScrollToTop'
import InicioPage from '@/pages/1-inicio/InicioPage.jsx'
import InicioPageV2 from '@/pages/1-inicio/InicioPageV2.jsx'
import InicioPageV3 from '@/pages/1-inicio/InicioPageV3.jsx'
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
import BlogEditorPage from '@/pages/5-qaway-hub/blog-editor/BlogEditorPage'
import CRMPage from '@/pages/5-qaway-hub/crm/CRMPage'
import WabaCrmConsolePage from '@/pages/5-qaway-hub/waba-crm/WabaCrmConsolePage'
import GestorProyectosHubPage from '@/pages/5-qaway-hub/5-gestor-de-proyectos/GestorProyectosHubPage'
import ProjectTimelineViewerPage from '@/pages/5-qaway-hub/5-gestor-de-proyectos/ProjectTimelineViewerPage'
import AnalyticsStudioPage from '@/pages/5-qaway-hub/analytics/AnalyticsStudioPage'
import MarketingStudioPage from '@/pages/5-qaway-hub/6-marketing/MarketingStudioPage'
import MarketingStudioTwentyPage from '@/pages/5-qaway-hub/7-marketing2/MarketingStudioTwentyPage'
import RecursosPage from '@/pages/6-recursos/RecursosPage'
import EbookDigitalPage from '@/pages/6-recursos/EbookDigitalPage'
import RecursoVisorPage from '@/pages/6-recursos/RecursoVisorPage'
import PrimerosFlujosIAPage from '@/pages/6-recursos/1-primeros-flujos IA/PrimerosFlujosIAPage'
import BlogPage from '@/pages/7-blog/BlogPage'
import ArticleDetailPage from '@/pages/7-blog/ArticleDetailPage'
import LandingsPage from '@/pages/8-landings/LandingsPage'
import SistemaContenidosNotionLandingPage from '@/pages/8-landings/1-sistema-contenido-notion/SistemaContenidosNotionLandingPage'
import IdentidadVisualLandingPage from '@/pages/8-landings/2-identidad-visual/IdentidadVisualLandingPage'
import ContableLandingPage from '@/pages/8-landings/3-contable/ContableLandingPage'
import RestauracionFotograficaPage from '@/pages/8-landings/4-restauracion-fotografica/RestauracionFotograficaPage'
import FotografiaLinkedinPage from '@/pages/8-landings/5-fotografia-linkedin/FotografiaLinkedinPage'
import RestauracionFotografica2Page from '@/pages/8-landings/6-restauracion-fotografica2/RestauracionFotografica2Page'
import DesarrolloWebQawayPage from '@/pages/8-landings/8-desarollo web/DesarrolloWebQawayPage.jsx'
import BriefBrandingPage from '@/pages/10-briefs/BriefBrandingPage.jsx'
import ProyectosPage from '@/pages/11-Proyectos/ProyectosPage.jsx'
import DiscardedInicioPage from '@/pages/9-pruebas/1-paginas_descartadas/1-inicio/InicioPage.jsx'
import RutasPage from '@/pages/12-rutas/RutasPage.jsx'
import TemplateDemo from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/TemplateDemo'
import HorizontePage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizontePage'
import HorizontePageReal from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizontePageReal'
import EpcPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/10-EPC estudio contable/EpcPage'
import HorizonteBackupPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizonteBackupPage'
import PlantoraPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/8_Planta/PlantoraPage'
import AureaSkincarePage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/7-skin-care/aurea-skincare-web/AureaSkincarePage'
import PanaderiaPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/4-Panadería Josué/PanaderiaPage'
import SaniclickPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/9-Saniclck/SaniclickPage'
import DentalPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/3-Dental/DentalPage'
import MesaSelectaPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/2-MesaSelecta/MesaSelectaPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { isPublicSiteMode, isRouteEnabled, isPublicPathAllowed } from '@/config/siteVisibility'

function ProtectedRoute({ children }) {
  return children
}

function renderRoute(routeKey, element) {
  if (isRouteEnabled(routeKey)) return element
  return <Navigate to="/" replace />
}

function renderPublicPathRoute(routeKey, pathname, element) {
  if (isRouteEnabled(routeKey) && isPublicPathAllowed(pathname)) return element
  return <Navigate to="/" replace />
}

function PublicPathRoute({ routeKey, children, fallback = '/' }) {
  const location = useLocation()
  if (isRouteEnabled(routeKey) && isPublicPathAllowed(location.pathname)) return children
  return <Navigate to={fallback} replace />
}

export default function AppRouter() {
  const notFoundElement = isPublicSiteMode ? <Navigate to="/" replace /> : <NotFoundPage />

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/landings/sistema-contenido-notion"
          element={renderPublicPathRoute('landings', '/landings/sistema-contenido-notion', <SistemaContenidosNotionLandingPage />)}
        />
        <Route
          path="/landings/identidad-visual"
          element={renderPublicPathRoute('landings', '/landings/identidad-visual', <IdentidadVisualLandingPage />)}
        />
        <Route
          path="/landings/contable"
          element={renderPublicPathRoute('landings', '/landings/contable', <ContableLandingPage />)}
        />
        <Route
          path="/landings/restauracion-fotografica"
          element={renderPublicPathRoute('landings', '/landings/restauracion-fotografica', <RestauracionFotograficaPage />)}
        />
        <Route
          path="/landings/fotografia-linkedin"
          element={renderPublicPathRoute('landings', '/landings/fotografia-linkedin', <FotografiaLinkedinPage />)}
        />
        <Route
          path="/landings/restauracion-fotografica2"
          element={renderPublicPathRoute('landings', '/landings/restauracion-fotografica2', <RestauracionFotografica2Page />)}
        />
        <Route
          path="/landings/desarrollo-web"
          element={renderPublicPathRoute('landings', '/landings/desarrollo-web', <DesarrolloWebQawayPage />)}
        />
        <Route
          path="/landings/desarrollo-web-superpower"
          element={renderPublicPathRoute('landings', '/landings/desarrollo-web-superpower', <DesarrolloWebQawayPage />)}
        />
        <Route
          path="/landings/hostinger"
          element={renderPublicPathRoute('landings', '/landings/hostinger', <DesarrolloWebQawayPage />)}
        />
        <Route
          path="/landings/desarrollo-web-hostinger"
          element={renderPublicPathRoute('landings', '/landings/desarrollo-web-hostinger', <DesarrolloWebQawayPage />)}
        />
        <Route
          path="/landings/desarrollo-web-qaway"
          element={renderPublicPathRoute('landings', '/landings/desarrollo-web-qaway', <DesarrolloWebQawayPage />)}
        />
        <Route
          path="/inicio-v2"
          element={<InicioPageV2 />}
        />
        <Route
          path="/inicio-v3"
          element={<InicioPageV3 />}
        />
        <Route
          path="/proyectos/panaderia-josue"
          element={renderRoute('proyectos', <PanaderiaPage />)}
        />
        <Route
          path="/proyectos/aurea-skincare"
          element={renderRoute('proyectos', <AureaSkincarePage />)}
        />
        <Route
          path="/proyectos/plantora"
          element={renderRoute('proyectos', <PlantoraPage />)}
        />
        <Route
          path="/proyectos/saniclick"
          element={renderRoute('proyectos', <SaniclickPage />)}
        />
        <Route
          path="/proyectos/dental"
          element={renderRoute('proyectos', <DentalPage />)}
        />
        <Route
          path="/proyectos/mesa-selecta"
          element={renderRoute('proyectos', <MesaSelectaPage />)}
        />
        <Route
          path="/proyectos/epc/*"
          element={<EpcPage />}
        />
        <Route
          path="/pruebas/inicio-descartado"
          element={renderRoute('pruebas', <DiscardedInicioPage />)}
        />
        <Route
          path="/hub/blog-editor"
          element={renderRoute('hub', <ProtectedRoute><BlogEditorPage /></ProtectedRoute>)}
        />
        <Route
          path="/hub/blog-editor/editor/:id"
          element={renderRoute('hub', <ProtectedRoute><BlogEditorPage /></ProtectedRoute>)}
        />
        <Route
          path="/editor/:id"
          element={renderRoute('hub', <ProtectedRoute><BlogEditorPage /></ProtectedRoute>)}
        />
        <Route
          path="/editor/new"
          element={renderRoute('hub', <ProtectedRoute><BlogEditorPage /></ProtectedRoute>)}
        />
        <Route
          path="/hub/marketing"
          element={renderRoute('hub', <ProtectedRoute><MarketingStudioPage /></ProtectedRoute>)}
        />
        <Route
          path="/hub/marketing2"
          element={renderRoute('hub', <ProtectedRoute><MarketingStudioTwentyPage /></ProtectedRoute>)}
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
            path="hub/gestor-proyectos"
            element={renderRoute('hub', <ProtectedRoute><GestorProyectosHubPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/gestor-proyectos/:serviceType/:projectSlug"
            element={renderRoute('hub', <ProtectedRoute><ProjectTimelineViewerPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/analytics"
            element={renderRoute('hub', <ProtectedRoute><AnalyticsStudioPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/dashboards"
            element={renderRoute('hub', <ProtectedRoute><AnalyticsStudioPage /></ProtectedRoute>)}
          />
          <Route
            path="portal/:slug"
            element={<ProjectTimelineViewerPage isPortalMode={true} />}
          />
          <Route
            path="proyectos/recorrido/:slug"
            element={<ProjectTimelineViewerPage isPortalMode={false} />}
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
          <Route path="proyectos" element={renderRoute('proyectos', <ProyectosPage />)} />
          <Route path="proyectos/horizonte" element={renderRoute('proyectos', <HorizontePage />)} />
          <Route path="proyectos/horizonte-real" element={renderRoute('proyectos', <HorizontePageReal />)} />
          <Route path="proyectos/horizonte-backup" element={renderRoute('proyectos', <HorizonteBackupPage />)} />
          <Route path="proyectos/*" element={renderRoute('proyectos', <ProyectosPage />)} />

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

          <Route path="recursos" element={renderPublicPathRoute('recursos', '/recursos', <RecursosPage />)} />
          <Route path="recursos/:category" element={<PublicPathRoute routeKey="recursos" fallback="/recursos"><RecursosPage /></PublicPathRoute>} />
          <Route
            path="recursos/primeros-flujos-ia"
            element={renderPublicPathRoute('recursos', '/recursos/primeros-flujos-ia', <PrimerosFlujosIAPage />)}
          />
          <Route
            path="recursos/ebooks/google-calendar-dominado"
            element={renderPublicPathRoute('recursos', '/recursos/ebooks/google-calendar-dominado', <EbookDigitalPage />)}
          />
          <Route
            path="recursos/:resourceType/:id"
            element={<PublicPathRoute routeKey="recursos" fallback="/recursos"><RecursoVisorPage /></PublicPathRoute>}
          />
          <Route path="blog" element={renderPublicPathRoute('blog', '/blog', <BlogPage />)} />
          <Route path="blog/:category" element={<PublicPathRoute routeKey="blog" fallback="/blog"><BlogPage /></PublicPathRoute>} />
          <Route
            path="blog/articulo/:id"
            element={<PublicPathRoute routeKey="blog" fallback="/blog"><ArticleDetailPage /></PublicPathRoute>}
          />

          <Route path="landings" element={renderPublicPathRoute('landings', '/landings', <LandingsPage />)} />
          <Route path="landings/*" element={<PublicPathRoute routeKey="landings"><LandingsPage /></PublicPathRoute>} />

          <Route path="rutas" element={<RutasPage />} />

          <Route path="*" element={notFoundElement} />
        </Route>

        <Route path="/login" element={renderRoute('auth', <LoginPage />)} />
        <Route path="*" element={notFoundElement} />
      </Routes>
    </>
  )
}
