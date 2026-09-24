import { lazy, useEffect, useState } from 'react'
import { RouteSuspense, RouteLoading } from './RouteSuspense'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ScrollToTop from '@/components/layout/ScrollToTop'
import AuthLinkHandler from '@/router/AuthLinkHandler'
import InicioPage from '@/pages/1-inicio/InicioPage.jsx'
import InicioPageV3 from '@/pages/1-inicio/InicioPageV3.jsx'
import LoginPage from '@/pages/auth/LoginPage'
import UpdatePasswordPage from '@/pages/auth/UpdatePasswordPage'
import RegisterPage from '@/pages/auth/RegisterPage'
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
import RecursosPage from '@/pages/6-recursos/RecursosPage'
import BlogPage from '@/pages/7-blog/BlogPage'
import ArticleDetailPage from '@/pages/7-blog/ArticleDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Code-splitting para herramientas administrativas del Hub y páginas secundarias
const AcademyPage = lazy(() => import('@/pages/4-academy/AcademyPage'))
const AcademyRealAppPage = lazy(() => import('@/pages/4-academy/2-qawaylab-app-academy-real/AcademyAppPage'))
const HubPage = lazy(() => import('@/pages/5-qaway-hub/HubPage'))
const HubPanelPage = lazy(() => import('@/pages/5-qaway-hub/HubPanelPage'))
const BlogEditorPage = lazy(() => import('@/pages/5-qaway-hub/blog-editor/BlogEditorPage'))
const CRMPage = lazy(() => import('@/pages/5-qaway-hub/1-qawayLab-CRM/CRMPage'))
const WabaCrmConsolePage = lazy(() => import('@/pages/5-qaway-hub/waba-crm/WabaCrmConsolePage'))
const GestorProyectosHubPage = lazy(() => import('@/pages/5-qaway-hub/5-gestor-de-proyectos/GestorProyectosHubPage'))
const GestorProyectosV2Page = lazy(() => import('@/pages/5-qaway-hub/5-gestor-de-proyectos/GestorProyectosV2Page'))
const ProjectTimelineViewerPage = lazy(() => import('@/pages/5-qaway-hub/5-gestor-de-proyectos/ProjectTimelineViewerPage'))
const AnalyticsStudioPage = lazy(() => import('@/pages/5-qaway-hub/analytics/AnalyticsStudioPage'))
const OptimizadorWebpHubPage = lazy(() => import('@/pages/5-qaway-hub/optimizador-webp/OptimizadorWebpHubPage'))
const InstagramExtractorPage = lazy(() => import('@/pages/5-qaway-hub/4-descargadores/1-IG/InstagramExtractorPage'))
const MarketingStudioPage = lazy(() => import('@/pages/5-qaway-hub/6-marketing/MarketingStudioPage'))
const CreadorContenidoPage = lazy(() => import('@/pages/5-qaway-hub/8-Creador de Contenido/CreadorContenidoPage'))
const AgentesHubPage = lazy(() => import('@/pages/5-qaway-hub/2-Agentes/AgentesHubPage'))
const MascotaPage = lazy(() => import('@/pages/5-qaway-hub/0-Estructuras SaaS/3- Tutorial/qaway-mascota-react/MascotaPage'))
const TutorialOnboardingPage = lazy(() => import('@/pages/5-qaway-hub/0-Estructuras SaaS/3- Tutorial/TutorialOnboardingPage'))
const AgendaAppPage = lazy(() => import('@/pages/5-qaway-hub/8-qawaylab-agenda/AgendaAppPage'))
// PagosAppPage archivado como backup — checkout vive 100% en 10-qawaylab-inventario
const InventarioAppPage = lazy(() => import('@/pages/5-qaway-hub/10-qawaylab-inventario/InventarioAppPage'))
// Tienda de cliente: las páginas viven en inventario y se sirven aquí, dentro
// del Layout, para que lleven el navbar oficial de Qaway Lab.
const TiendaClientePage = lazy(() => import('@/pages/5-qaway-hub/10-qawaylab-inventario/TiendaClientePage'))
const TiendaCarritoPage = lazy(() => import('@/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage'))
const TiendaCheckoutPage = lazy(() => import('@/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CheckoutPage'))
const TiendaComprasPage = lazy(() => import('@/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/PurchasesPage'))

// Recursos y Landings secundarias
const EbookDigitalPage = lazy(() => import('@/pages/6-recursos/EbookDigitalPage'))
const RecursoVisorPage = lazy(() => import('@/pages/6-recursos/RecursoVisorPage'))
const PrimerosFlujosIAPage = lazy(() => import('@/pages/6-recursos/1-primeros-flujos IA/PrimerosFlujosIAPage'))
const OptimizadorImagenesWebpPage = lazy(() => import('@/pages/6-recursos/2-optimizador-imagenes-webp/OptimizadorImagenesWebpPage'))
const LandingsPage = lazy(() => import('@/pages/8-landings/LandingsPage'))
const SistemaContenidosNotionLandingPage = lazy(() => import('@/pages/8-landings/1-sistema-contenido-notion/SistemaContenidosNotionLandingPage'))
const IdentidadVisualLandingPage = lazy(() => import('@/pages/8-landings/2-identidad-visual/IdentidadVisualLandingPage'))
const ContableLandingPage = lazy(() => import('@/pages/8-landings/3-contable/ContableLandingPage'))
const RestauracionFotograficaPage = lazy(() => import('@/pages/8-landings/4-restauracion-fotografica/RestauracionFotograficaPage'))
const FotografiaLinkedinPage = lazy(() => import('@/pages/8-landings/5-fotografia-linkedin/FotografiaLinkedinPage'))
const RestauracionFotografica2Page = lazy(() => import('@/pages/8-landings/6-restauracion-fotografica2/RestauracionFotografica2Page'))
const DesarrolloWebQawayPage = lazy(() => import('@/pages/8-landings/8-desarollo web/DesarrolloWebQawayPage.jsx'))
const BriefBrandingPage = lazy(() => import('@/pages/10-briefs/BriefBrandingPage.jsx'))
import RutasPage from '@/pages/12-rutas/RutasPage.jsx'
import BibliotecaPage from '@/pages/5-qaway-hub/biblioteca/BibliotecaPage.jsx'
import UsuariosPage from '@/pages/5-qaway-hub/usuarios/UsuariosPage.jsx'
import InvitarPage from '@/pages/5-qaway-hub/invitar/InvitarPage.jsx'
import EmpresasPage from '@/pages/5-qaway-hub/empresas/EmpresasPage.jsx'
import HubOnboardingPage from '@/pages/5-qaway-hub/HubOnboardingPage.jsx'

// Suite de Formularios & Tests Interactivos (10-briefs/1- Formularios)
const FormulariosShowcasePage = lazy(() => import('@/pages/10-briefs/1- Formularios/FormulariosShowcasePage.jsx'))
const DiagnosticoSplitStudio = lazy(() => import('@/pages/10-briefs/1- Formularios/1-DiagnosticoSplitStudio.jsx'))
const AsistenteConversacionalHub = lazy(() => import('@/pages/10-briefs/1- Formularios/2-AsistenteConversacionalHub.jsx'))
const TypeformFluidExperience = lazy(() => import('@/pages/10-briefs/1- Formularios/3-TypeformFluidExperience.jsx'))
const TrelloInteractiveBoardForm = lazy(() => import('@/pages/10-briefs/1- Formularios/4-TrelloInteractiveBoardForm.jsx'))
const NotionInteractiveWorkspaceForm = lazy(() => import('@/pages/10-briefs/1- Formularios/5-NotionInteractiveWorkspaceForm.jsx'))
const AirbnbWizardCardDeck = lazy(() => import('@/pages/10-briefs/1- Formularios/6-AirbnbWizardCardDeck.jsx'))
const TestPreparacionDigital = lazy(() => import('@/pages/10-briefs/1- Formularios/7-TestPreparacionDigital.jsx'))

// Proyectos (importación estática directa para máxima estabilidad y cero riesgo de carga diferida)
import ProyectosPage from '@/pages/11-Proyectos/ProyectosPage.jsx'
import ProyectosPageV2 from '@/pages/11-Proyectos/ProyectosPageV2.jsx'
import TemplateDemo from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/TemplateDemo'
import HorizontePage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizontePage'
import HorizontePageReal from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizontePageReal'
import EpcPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/10-EPC estudio contable/EpcPage'
import CoraVetAppPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/CoraVet/CoraVetAppPage'
import HorizonteBackupPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/5-horizonte/HorizonteBackupPage'
import PlantoraPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/8_Planta/PlantoraPage'
import AureaSkincarePage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/7-skin-care/aurea-skincare-web/AureaSkincarePage'
import PanaderiaPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/4-Panadería Josué/PanaderiaPage'
import SaniclickPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/9-Saniclck/SaniclickPage'
import DentalPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/3-Dental/DentalPage'
import MesaSelectaPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/2-MesaSelecta/MesaSelectaPage'
import ValletInmobiliariaPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria/ValletInmobiliariaPage'
import ValletPropertyDetailPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria/ValletPropertyDetailPage'
import ValletCatalogPage from '@/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria/ValletCatalogPage'
import { isPublicSiteMode, isRouteEnabled, isPublicPathAllowed } from '@/config/siteVisibility'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    let alive = true
    const resolve = (ok) => { if (alive) { setAuthed(ok); setChecking(false) } }
    const sb = getSupabaseClient()
    if (!sb) {
      const token = sessionStorage.getItem('qaway_auth_token') || localStorage.getItem('qaway_auth_token')
      resolve(Boolean(token))
      return
    }
    sb.auth.getSession()
      .then(({ data }) => resolve(Boolean(data.session)))
      .catch(() => resolve(false))
    return () => { alive = false }
  }, [])

  if (checking) return <RouteLoading />
  if (!authed) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  return children
}

function renderRoute(routeKey, element) {
  if (isRouteEnabled(routeKey)) return <RouteSuspense>{element}</RouteSuspense>
  return <Navigate to="/" replace />
}

function renderPublicPathRoute(routeKey, pathname, element) {
  if (isRouteEnabled(routeKey) && isPublicPathAllowed(pathname)) return <RouteSuspense>{element}</RouteSuspense>
  return <Navigate to="/" replace />
}

function PublicPathRoute({ routeKey, children, fallback = '/' }) {
  const location = useLocation()
  if (isRouteEnabled(routeKey) && isPublicPathAllowed(location.pathname)) return <RouteSuspense>{children}</RouteSuspense>
  return <Navigate to={fallback} replace />
}

/**
 * Redirección canónica que CONSERVA el query string.
 *
 * Es imprescindible en dos casos: la vuelta de la pasarela
 * (`?payment_id=…&status=…`) y los enlaces de la landing (`?add=<plan>`).
 * Con un `<Navigate>` pelado esos parámetros se perdían.
 */
function RedirectTo({ to }) {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}`} replace />
}

/** Envuelve una página de la tienda con el AuthProvider que `useAuth` exige. */
function Tienda({ children }) {
  return <RouteSuspense><TiendaClientePage>{children}</TiendaClientePage></RouteSuspense>
}

function CoursesCanonicalRedirect() {
  const { slug } = useParams()
  return <Navigate to={slug ? `/academy/app/cursos/${slug}` : '/academy/app/cursos'} replace />
}

function AdminCanonicalRedirect() {
  const location = useLocation()
  const subpath = location.pathname.replace(/^\/admin\/?/, '')
  return <Navigate to={`/academy/app/admin/${subpath}${location.search}`} replace />
}

export default function AppRouter() {
  const notFoundElement = <NotFoundPage />

  return (
    <>
      <AuthLinkHandler />
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
          path="/inicio-v3"
          element={renderPublicPathRoute('inicio', '/inicio-v3', <InicioPageV3 />)}
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
          path="/proyectos/vallet-inmobiliaria"
          element={renderRoute('proyectos', <ValletInmobiliariaPage />)}
        />
        <Route
          path="/proyectos/veller-inmobiliaria"
          element={renderRoute('proyectos', <ValletInmobiliariaPage />)}
        />
        <Route
          path="/proyectos/vallet"
          element={renderRoute('proyectos', <ValletInmobiliariaPage />)}
        />
        <Route
          path="/proyectos/vallet/propiedades"
          element={renderRoute('proyectos', <ValletCatalogPage />)}
        />
        <Route
          path="/proyectos/vallet-inmobiliaria/propiedades"
          element={renderRoute('proyectos', <ValletCatalogPage />)}
        />
        <Route
          path="/proyectos/vallet/propiedad/:slug"
          element={renderRoute('proyectos', <ValletPropertyDetailPage />)}
        />
        <Route
          path="/proyectos/vallet-inmobiliaria/propiedad/:slug"
          element={renderRoute('proyectos', <ValletPropertyDetailPage />)}
        />
        <Route
          path="/proyectos/veller"
          element={renderRoute('proyectos', <ValletInmobiliariaPage />)}
        />
        <Route
          path="/proyectos/epc/*"
          element={<EpcPage />}
        />
        <Route
          path="/proyectos/coravet/*"
          element={<CoraVetAppPage />}
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
          element={<MarketingStudioPage />}
        />
        <Route
          path="hub/marketing"
          element={<MarketingStudioPage />}
        />
        <Route
          path="hub/agenda/*"
          element={<AgendaAppPage />}
        />
        <Route
          path="hub/agenda"
          element={<AgendaAppPage />}
        />
        <Route
          path="/hub/inventario/*"
          element={<InventarioAppPage />}
        />
        <Route
          path="/hub/inventario"
          element={<InventarioAppPage />}
        />
        <Route
          path="hub/inventario/*"
          element={<InventarioAppPage />}
        />
        <Route
          path="hub/inventario"
          element={<InventarioAppPage />}
        />
        <Route
          path="/inventario/*"
          element={<InventarioAppPage />}
        />
        <Route
          path="/inventario"
          element={<InventarioAppPage />}
        />
        <Route
          path="inventario/*"
          element={<InventarioAppPage />}
        />
        <Route
          path="inventario"
          element={<InventarioAppPage />}
        />
        <Route
          path="hub/gestor-proyectos-v2"
          element={renderRoute('hub', <ProtectedRoute><GestorProyectosV2Page /></ProtectedRoute>)}
        />
        {/* Biblioteca: standalone FUERA del Layout → sin navbar, solo logo interno */}
        <Route
          path="/hub/biblioteca"
          element={renderRoute('hub', <BibliotecaPage />)}
        />
        <Route
          path="hub/biblioteca"
          element={renderRoute('hub', <BibliotecaPage />)}
        />
        {/* Mascota interactiva (React 19 + Framer Motion + SVG) */}
        <Route
          path="hub/mascota"
          element={renderRoute('hub', <MascotaPage />)}
        />
        {/* Tutorial Onboarding Interactivo React (Recreación exacta de Trello & Qaway Lab) */}
        <Route
          path="hub/tutorial"
          element={renderRoute('hub', <TutorialOnboardingPage />)}
        />
        <Route
          path="hub/onboarding"
          element={renderRoute('hub', <TutorialOnboardingPage />)}
        />
        {/* Creador de Contenido: standalone FUERA del Layout → sin navbar de marca */}
          <Route
            path="hub/creador-contenido"
            element={renderRoute('hub', <CreadorContenidoPage />)}
          />
          <Route
            path="hub/usuarios"
            element={renderRoute('hub', <ProtectedRoute><UsuariosPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/invitar"
            element={renderRoute('hub', <ProtectedRoute><InvitarPage /></ProtectedRoute>)}
          />
          <Route
            path="hub/empresas"
            element={renderRoute('hub', <ProtectedRoute><EmpresasPage /></ProtectedRoute>)}
          />
          {/* Onboarding canónico ÚNICO (2026-09-23): /onboarding es el wizard del Hub
              (HubOnboardingPage). /hub/bienvenida redirige ahí (conserva query) y no duplica flujos. */}
          <Route
            path="hub/bienvenida"
            element={<RedirectTo to="/onboarding" />}
          />
        {/* Agentes de IA Responsable (Ley 31814 & Google PAIR): standalone FUERA del Layout */}
        <Route
          path="hub/agentes"
          element={renderRoute('hub', <AgentesHubPage />)}
        />
        <Route
          path="/hub/agentes"
          element={renderRoute('hub', <AgentesHubPage />)}
        />
        {/* CRM: standalone FUERA del Layout → sin navbar de marca */}
        <Route
          path="hub/crm"
          element={renderRoute('hub', <ProtectedRoute><CRMPage /></ProtectedRoute>)}
        />
        {/* Hub Panel portada (carcasa CRM, sin navbar/footer públicos) */}
          <Route
            path="hub/panel/*"
            element={renderRoute('hub', <ProtectedRoute><HubPanelPage /></ProtectedRoute>)}
          />
        <Route element={<Layout />}>
          <Route index element={<InicioPage />} />
          {/* Tienda de cliente (páginas de 10-qawaylab-inventario).
              Carrito y checkout son las dos páginas de cliente y se sirven
              aquí para que lleven el navbar oficial, igual que el flujo
              original. La app de pagos antigua sigue fuera del router. */}
          <Route path="carrito" element={<Tienda><TiendaCarritoPage /></Tienda>} />
          <Route path="carrito/checkout" element={<Tienda><TiendaCheckoutPage /></Tienda>} />
          <Route path="carrito/compras" element={<Tienda><TiendaComprasPage /></Tienda>} />
          {/* Alias heredados: no rompen enlaces ya emitidos (incluida la vuelta
              de la pasarela, que trae sus parámetros en el query). */}
          <Route path="checkout" element={<RedirectTo to="/carrito/checkout" />} />
          <Route path="purchases" element={<RedirectTo to="/carrito/compras" />} />
          <Route path="hub/pagos/checkout" element={<RedirectTo to="/carrito/checkout" />} />
          <Route path="hub/pagos/purchases" element={<RedirectTo to="/carrito/compras" />} />
          <Route path="hub/pagos/*" element={<RedirectTo to="/carrito" />} />
          <Route path="hub/pagos" element={<RedirectTo to="/carrito" />} />
          <Route
            path="hub"
            element={renderRoute('hub', <HubPage />)}
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
            path="hub/optimizador-webp"
            element={renderPublicPathRoute('hub', '/hub/optimizador-webp', <OptimizadorWebpHubPage />)}
          />
        <Route
          path="hub/descargador-ig"
          element={renderRoute('hub', <ProtectedRoute><InstagramExtractorPage /></ProtectedRoute>)}
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

          <Route path="estudio" element={renderRoute('estudio', <EstudioLayout />)}>
            <Route index element={<EstudioPage />} />
            <Route path="branding-digital" element={<BrandingDigitalPage />} />
            <Route path="contenido-visual" element={<ContenidoVisualPage />} />
            <Route path="presencia-profesional" element={<PresenciaProfesionalPage />} />
            <Route path="estrategia-digital" element={<EstudioEstrategiaDigitalPage />} />
            <Route path="consultoria" element={<ConsultoriaPage />} />
          </Route>

          <Route path="brief" element={renderRoute('brief', <BriefBrandingPage />)} />
          <Route path="formularios" element={<FormulariosShowcasePage />} />
          <Route path="formularios/diagnostico-split" element={<DiagnosticoSplitStudio />} />
          <Route path="formularios/asistente-conversacional" element={<AsistenteConversacionalHub />} />
          <Route path="formularios/typeform-fluid" element={<TypeformFluidExperience />} />
          <Route path="formularios/trello-board" element={<TrelloInteractiveBoardForm />} />
          <Route path="formularios/notion-workspace" element={<NotionInteractiveWorkspaceForm />} />
          <Route path="formularios/airbnb-card-deck" element={<AirbnbWizardCardDeck />} />
          <Route path="formularios/test-preparacion-digital" element={<TestPreparacionDigital />} />
          <Route path="formularios/diagnostico-gamificado" element={<TestPreparacionDigital />} />
          <Route path="diagnostico" element={<DiagnosticoSplitStudio />} />
          <Route path="proyectos" element={renderRoute('proyectos', <ProyectosPage />)} />
          <Route path="proyectos-v2" element={renderRoute('proyectos', <ProyectosPageV2 />)} />
          <Route path="proyectos/horizonte" element={renderRoute('proyectos', <HorizontePage />)} />
          <Route path="proyectos/horizonte-real" element={renderRoute('proyectos', <HorizontePageReal />)} />
          <Route path="proyectos/horizonte-backup" element={renderRoute('proyectos', <HorizonteBackupPage />)} />

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

          <Route path="ops-ia" element={<Navigate to="/sistemas-digitales" replace />} />
          <Route
            path="ops-ia/automatizacion"
            element={<Navigate to="/sistemas-digitales/automatizacion" replace />}
          />
          <Route
            path="ops-ia-v2"
            element={<Navigate to="/sistemas-digitales/automatizacion" replace />}
          />

          <Route path="academy" element={renderRoute('academy', <AcademyPage />)} />
          <Route path="academy-legacy" element={renderRoute('academy', <AcademyPage />)} />
          <Route path="academy/app/*" element={renderRoute('academy', <AcademyRealAppPage />)} />
          <Route path="hub/academy/*" element={renderRoute('academy', <AcademyRealAppPage />)} />
          <Route path="cursos" element={<Navigate to="/academy/app/cursos" replace />} />
          <Route path="cursos/:slug" element={<CoursesCanonicalRedirect />} />
          <Route path="admin" element={<Navigate to="/academy/app/admin" replace />} />
          <Route path="admin/*" element={<AdminCanonicalRedirect />} />

          <Route path="recursos" element={renderPublicPathRoute('recursos', '/recursos', <RecursosPage />)} />
          <Route path="recursos/:category" element={<PublicPathRoute routeKey="recursos" fallback="/recursos"><RecursosPage /></PublicPathRoute>} />
          <Route
            path="recursos/primeros-flujos-ia"
            element={renderPublicPathRoute('recursos', '/recursos/primeros-flujos-ia', <PrimerosFlujosIAPage />)}
          />
          <Route
            path="recursos/optimizador-webp"
            element={<Navigate to="/hub/optimizador-webp" replace />}
          />
          <Route
            path="recursos/optimizador-imagenes-webp"
            element={renderPublicPathRoute('recursos', '/recursos/optimizador-imagenes-webp', <OptimizadorImagenesWebpPage />)}
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

          <Route path="rutas" element={<RutasPage />} />

          <Route path="*" element={notFoundElement} />
        </Route>

        <Route path="/login" element={renderRoute('auth', <LoginPage />)} />
        <Route path="/update-password" element={renderRoute('auth', <UpdatePasswordPage />)} />
        <Route path="/registrarse" element={renderRoute('auth', <RegisterPage />)} />
        {/* Onboarding: standalone FUERA del Layout (sin navbar/footer de marca). */}
        <Route path="/onboarding" element={renderPublicPathRoute('onboarding', '/onboarding', <HubOnboardingPage />)} />
        <Route path="*" element={notFoundElement} />
      </Routes>
    </>
  )
}
