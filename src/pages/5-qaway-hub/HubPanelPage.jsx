import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { HubIcon } from '@/components/ui/icons'
import {
  AlertCircle, ArrowRight, BarChart3, Bell, Bot, Briefcase, Calendar, CreditCard,
  FileImage, FlaskConical, FolderKanban, Home, Instagram, Menu, MessageSquare,
  Package, PenSquare, Plus, Route, Search, Settings, ChevronDown, Sparkles,
  Star, Target, Wrench, X, Zap,
} from '@/components/ui/icons/hubIcons'
import { getAuthUser, logoutUser } from '@/config/auth'
import { AppSwitcherDropdown } from './5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#111111] text-zinc-200 flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-amber-400/90">
              <HubIcon icon={AlertCircle} size={24} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Ocurrió un inconveniente temporal en el Hub</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-xs">Recargar módulo</button>
              <a href="/hub" className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700/50">Volver al Hub</a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Catálogo literal de HubPage: mismas tarjetas con preview y gradiente de pilar.
const ROUTES = [
  { icon: Bot, title: 'Agentes de IA Responsable (Ley 31814)', description: 'Configuracion, entrenamiento y simulacion en vivo de Agentes IA Consultivos para WhatsApp y Web. Gobernanza etica en 3 capas, derivacion humana y anti-alucinacion.', path: '/hub/agentes', access: 'pro', badge: 'Ley 31814 & PAIR', category: 'Inteligencia Artificial', pillar: 'IA', tone: 'bg-indigo-600/10 text-indigo-600', preview: '/assets/hub-previews/preview-agentes.png', published: true },
  { icon: Calendar, title: 'Qaway Agenda & Sistema de Citas', description: 'Software de reservas y calendario estilo Calendly: Agendamiento publico, gestion de horarios, recordatorios y panel de control de citas.', path: '/hub/agenda', access: 'pro', badge: 'Nuevo SaaS', category: 'Gestion & Productividad', pillar: 'Automatizacion', tone: 'bg-indigo-500/10 text-indigo-500', preview: '/assets/hub-previews/preview-agenda.png', published: true },
  { icon: CreditCard, title: 'Qaway Pagos & Checkout Multi-metodo', description: 'Pasarela de pagos multi-metodo: Tarjeta Stripe, Yape, Plin, PagoEfectivo, transferencias, catalogo de productos y gestion de ordenes.', path: '/hub/pagos', access: 'pro', badge: 'Modulo Pagos', category: 'Comercio & Finanzas', pillar: 'Marketing', tone: 'bg-emerald-500/10 text-emerald-500', preview: '/assets/hub-previews/preview-pagos.png', published: true },
  { icon: Package, title: 'Qaway Inventario & ERP Comercial', description: 'Sistema integral de gestion de productos, stock, almacenes, movimientos Kardex, captura con IA, facturacion y cotizaciones.', path: '/hub/inventario', access: 'pro', badge: 'SaaS ERP', category: 'Logistica & Almacenes', pillar: 'Automatizacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-inventario.png', published: true },
  { icon: Star, title: 'Qaway Academy (LMS Cursos & Certificaciones)', description: 'Plataforma educativa integral: Catalogo de cursos, reproductor de lecciones, tareas, quizzes, certificados, panel de estudiante y docente.', path: '/hub/academy', access: 'pro', badge: 'LMS Real', category: 'Educacion & Cursos', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-academy.png', published: true },
  { icon: Sparkles, title: 'Creador de Contenido Modular (5 Skills)', description: 'Fabrica de contenidos con IA: Radar viral, Guiones con retencion medida, Matriz de hooks, Calendario 30 dias, Disenador de Carruseles, Blog y Posts.', path: '/hub/creador-contenido', access: 'pro', badge: 'Nuevo', category: 'Marketing & Creacion', pillar: 'Creacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-creador.png', published: true },
  { icon: FileImage, title: 'Optimizador de Imagenes WebP', description: 'Herramienta interactiva para comprimir y convertir imagenes PNG y JPG a WebP con hasta 95% de ahorro en tu navegador.', path: '/hub/optimizador-webp', access: 'free', badge: 'Gratis', category: 'Herramientas', pillar: 'Automatizacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-inventario.png', published: false },
  { icon: Instagram, title: 'Descargador & Extractor de Instagram', description: 'Extractor y descargador multimedia de publicaciones, carruseles y reels de Instagram en alta calidad.', path: '/hub/descargador-ig', access: 'free', badge: 'Borrador', category: 'Herramientas', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-creador.png', published: false },
  { icon: FolderKanban, title: 'Gestor de Proyectos & Entregas', description: 'Trazabilidad y portal de cliente: ciclo de 6 hitos para Desarrollo Web, Branding, CRM y Marketing.', path: '/hub/gestor-proyectos', access: 'pro', badge: 'Pro', category: 'Product Management', pillar: 'Automatizacion', tone: 'bg-[#fe6612]/10 text-[#fe6612]', preview: '/assets/hub-previews/preview-agenda.png', published: false },
  { icon: PenSquare, title: 'Editor de Blog', description: 'Plataforma editorial para crear, estructurar y publicar articulos con categorias, portadas y CTAs en tiempo real.', path: '/hub/blog-editor', access: 'pro', badge: 'Listo', category: 'Herramientas', pillar: 'Creacion', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-academy.png', published: true },
  { icon: Calendar, title: 'Consola WABA + CRM', description: 'Panel ejecutivo para campana: integracion WhatsApp API, payloads, checklist y pruebas E2E en un solo lugar.', path: '/hub/waba-crm', access: 'pro', badge: 'Destacado', category: 'Panel de control', pillar: 'IA', tone: 'bg-[#191918] text-white', preview: '/assets/hub-previews/preview-agentes.png', published: false },
  { icon: MessageSquare, title: 'Consola CRM Comercial', description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real de Meta Ads y analiticas estilo Power BI.', path: '/hub/crm', access: 'pro', badge: 'Nuevo', category: 'Panel de control', pillar: 'Marketing', tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', preview: '/assets/hub-previews/preview-crm.jpg', published: false },
  { icon: Route, title: 'Ruta Marca / Emprendimiento', description: 'Desde la idea hasta tu estructura digital basica. Naming, logo, identidad, redes, landing y captacion.', path: '/hub/ruta-marca', access: 'free', badge: null, category: 'Rutas de Marca', pillar: 'Marketing', tone: 'bg-[#191918]/5 text-[#191918]/70', preview: '/assets/hub-previews/preview-creador.png', published: false },
  { icon: Briefcase, title: 'Ruta Profesional / Oficina', description: 'Organizacion, reportes, dashboards, automatizacion y productividad para equipos y oficinas.', path: '/hub/ruta-profesional', access: 'free', badge: null, category: 'Ruta Profesional', pillar: 'Automatizacion', tone: 'bg-[#191918]/5 text-[#191918]/70', preview: '/assets/hub-previews/preview-inventario.png', published: false },
  { icon: FlaskConical, title: 'Ruta Incubadora', description: 'Acompanamiento para validar ideas, proyectos o negocios con herramientas y modulos progresivos.', path: '/hub/ruta-incubadora', access: 'free', badge: null, category: 'Rutas de Marca', pillar: 'IA', tone: 'bg-[#191918]/5 text-[#191918]/70', preview: '/assets/hub-previews/preview-agentes.png', published: false },
  { icon: Wrench, title: 'Herramientas Guiadas', description: 'Soluciones modulares paso a paso para construir, organizar y mejorar tu operacion digital.', path: '/hub/herramientas', access: 'free', badge: null, category: 'Herramientas', pillar: 'Automatizacion', tone: 'bg-[#191918]/5 text-[#191918]/70', preview: '/assets/hub-previews/preview-agenda.png', published: false },
  { icon: BarChart3, title: 'Centro de Analitica & Graficos', description: 'Suite de metricas estilo PowerBI y Google Analytics con galeria Recharts completa y presets por industria.', path: '/hub/analytics', access: 'pro', badge: 'Pro', category: 'Herramientas', pillar: 'Marketing', tone: 'bg-[#0080FF]/10 text-[#0080FF]', preview: '/assets/hub-previews/preview-pagos.png', published: false },
  { icon: Target, title: 'Marketing Studio OS (Revolut UI)', description: 'Estrategia y arquitectura: Buyer Persona (JTBD), Content Mapping Editorial, Auditoria POEM y Simulador de Funnel.', path: '/hub/marketing', access: 'pro', badge: 'v1.0', category: 'Herramientas', pillar: 'Marketing', tone: 'bg-[#0075FF]/10 text-[#0075FF]', preview: '/assets/hub-previews/preview-creador.png', published: false },
  { icon: Zap, title: 'Automatizaciones', description: 'Flujos automaticos y conectores para optimizar procesos repetitivos y ganar productividad.', path: '/hub/automatizaciones', access: 'free', badge: null, category: 'Herramientas', pillar: 'Automatizacion', tone: 'bg-[#191918]/5 text-[#191918]/70', preview: '/assets/hub-previews/preview-agenda.png', published: false },
]

// Pilares literales de HubPage.
const PILLARS = [
  { label: 'Todas', match: null },
  { label: 'Marketing', match: 'Marketing' },
  { label: 'Automatizacion', match: 'Automatizacion' },
  { label: 'IA', match: 'IA' },
  { label: 'Creacion de Contenido', match: 'Creacion' },
]

// Gradientes de pilar: misma paleta que HubPage (SaaS azulado tenue)
const PILLAR_GRADIENTS = {
  'IA':            'bg-[linear-gradient(135deg,#ffffff_0%,#f5f7ff_50%,#eef2ff_100%)]',
  'Automatizacion':'bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_50%,#e0f2fe_100%)]',
  'Marketing':     'bg-[linear-gradient(135deg,#ffffff_0%,#f8faff_50%,#e8f0fe_100%)]',
  'Creacion':      'bg-[linear-gradient(135deg,#ffffff_0%,#faf5ff_50%,#f3e8ff_100%)]',
  'Herramientas':  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_50%,#f1f5f9_100%)]',
}

function displayName(email) {
  if (!email) return 'Equipo Qaway'
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return 'Equipo Qaway'
  return base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function HubPanelContent() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Todas')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const searchInputRef = useRef(null)
  const authUser = useMemo(() => getAuthUser(), [])
  const name = displayName(authUser?.email)
  const avatar = 'https://i.pravatar.cc/150?img=11'
  const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInputRef.current?.focus() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const activePillar = PILLARS.find((p) => p.label === activeTab)
    const q = globalSearchQuery.trim().toLowerCase()
    return ROUTES.filter((route) => {
      const okQ = !q ||
        (route.title && route.title.toLowerCase().includes(q)) ||
        (route.description && route.description.toLowerCase().includes(q)) ||
        (route.category && route.category.toLowerCase().includes(q)) ||
        (route.badge && route.badge.toLowerCase().includes(q))
      // Si hay término de búsqueda, ignoramos la pestaña actual
      const okPillar = q ? true : (!activePillar?.match || (route.pillar && route.pillar.includes(activePillar.match)))
      return okPillar && okQ
    })
  }, [globalSearchQuery, activeTab])

  const handleLogout = () => { logoutUser(); navigate('/login', { replace: true }) }

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden font-sans text-white selection:bg-[#ff4b0b] selection:text-white">
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-white/10 bg-[#111111] transition-all duration-300 ease-in-out`}>
        {/* LOGO - Redirección a Inicio */}
        <button onClick={() => setActiveTab('Todas')} className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 shrink-0 cursor-pointer hover:bg-white/5 transition-colors group w-full`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide text-lg">
              {isSidebarCollapsed ? (<span className="text-[#ff4b0b]">Q</span>) : (<>Qaway <span className="text-[#ff4b0b]">Hub</span></>)}
            </span>
          </div>
        </button>
        {/* NAVIGATION */}
        <nav className={`flex-1 py-6 ${isSidebarCollapsed ? 'px-2' : 'px-4'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          <button onClick={() => setActiveTab('Todas')} title={isSidebarCollapsed ? 'Panel' : ''}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all w-full text-left ${activeTab === 'Todas' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <HubIcon icon={Home} size={16} className={`w-4 h-4 shrink-0 ${activeTab === 'Todas' ? 'text-[#ff4b0b]' : ''}`} />
            {!isSidebarCollapsed && <span className="truncate">Panel</span>}
          </button>
          {PILLARS.filter(p => p.match !== null).map(pillar => {
            const items = ROUTES.filter(r => r.pillar && r.pillar.includes(pillar.match))
            if (items.length === 0) return null
            return (
              <div key={pillar.label}>
                {!isSidebarCollapsed && <p className="px-3 pt-3 pb-1 text-xs font-semibold text-white/45 truncate">{pillar.label}</p>}
                {items.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link key={route.path} to={route.path} title={route.title}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-lg text-sm font-medium transition-all w-full text-left text-white/60 hover:text-white hover:bg-white/5`}>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${route.tone}`}><HubIcon icon={Icon} size={16} className="w-4 h-4" /></span>
                      {!isSidebarCollapsed && <span className="truncate">{route.title}</span>}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
        {/* ZONA INFERIOR DEL SIDEBAR */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <button onClick={() => setActiveTab('Todas')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 ${isSidebarCollapsed ? "justify-center" : ""}`} title={isSidebarCollapsed ? "Configuración" : undefined}>
            <HubIcon icon={Settings} size={20} className="w-5 h-5 transition-colors text-white/40 group-hover:text-white/80" />
            {!isSidebarCollapsed && (<span className="truncate">Configuración</span>)}
          </button>
        </div>
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER TOPBAR */}
        <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-5 lg:px-6 shrink-0 bg-[#111111] relative z-50 shadow-sm">
          {/* Lado Izquierdo */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors" title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}>
              <HubIcon icon={Menu} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            </button>
            <div className="relative">
              <button type="button" onClick={() => setIsWaffleOpen(!isWaffleOpen)} className="group flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 transition-all duration-300 ease-out cursor-pointer" title="Ecosistema de Aplicaciones">
                <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
                  {[...Array(9)].map((_, i) => (<span key={i} className="w-[3px] h-[3px] rounded-full bg-white/70 group-hover:bg-[#ff4b0b] transition-colors" />))}
                </div>
                <span className="text-sm font-bold text-white max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">Apps</span>
                <HubIcon icon={ChevronDown} size={14} className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-transform duration-200" />
              </button>
              <AppSwitcherDropdown isOpen={isWaffleOpen} onClose={() => setIsWaffleOpen(false)} />
            </div>
            <div className="hidden sm:block">
              <button onClick={() => setActiveTab('Todas')} className="group flex items-center gap-2 h-10 px-3 rounded-full border border-transparent hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 ease-out cursor-pointer" title="Ir al Inicio del Hub">
                <HubIcon icon={Home} size={20} className="w-5 h-5 shrink-0 group-hover:text-[#ff4b0b] transition-colors" />
                <span className="text-sm font-bold text-white max-w-0 overflow-hidden group-hover:max-w-[48px] transition-all duration-350 ease-out whitespace-nowrap">Inicio</span>
              </button>
            </div>
          </div>
          {/* Search, CTA, Notifications & User */}
          <div className="flex items-center gap-3 lg:gap-5 relative">
            <div className="relative block">
              <HubIcon icon={Search} size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
              <input ref={searchInputRef} type="text" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} placeholder="Buscar en base de datos..."
                className="bg-[#18181b] border border-white/10 rounded-full pl-10 pr-16 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff4b0b]/50 focus:bg-[#202024] w-[240px] md:w-[320px] lg:w-[420px] transition-all shadow-inner" />
              {globalSearchQuery ? (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"><HubIcon icon={X} size={16} className="w-4 h-4" /></button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">⌘</kbd>
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">K</kbd>
                </div>
              )}
              <AnimatePresence>
                {globalSearchQuery.trim() !== '' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#1c1c1f] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                    {filtered.length === 0 ? (
                      <div className="p-6 text-center"><p className="text-sm text-white/50 font-medium">No se encontraron resultados para "{globalSearchQuery}"</p></div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5"><span className="text-xs font-bold text-white/50 uppercase tracking-wider">Resultados Rápidos</span></div>
                        <ul className="py-2">
                          {filtered.slice(0, 5).map(app => {
                            const Icon = app.icon
                            return (
                              <li key={app.path}>
                                <Link to={app.path} onClick={() => setGlobalSearchQuery('')} className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-4 text-left group">
                                  <div className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[13px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20"><HubIcon icon={Icon} size={16} className="w-4 h-4" /></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{app.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1"><span className="truncate">{app.pillar}</span><span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50">{app.badge || 'Pro'}</span></div>
                                  </div>
                                  <HubIcon icon={MessageSquare} size={20} className="w-5 h-5 text-white/20 group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-white/40"><span>Saltar directo a la app</span><span>Esc para cerrar</span></div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 cursor-pointer" title="Notificaciones (0)">
              <HubIcon icon={Bell} size={20} className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-[#111111]" />
            </button>
            <div className="relative z-[100] ml-1">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer p-1 lg:p-1.5 rounded-full hover:bg-white/5 transition-colors text-left border border-transparent focus:outline-none">
                <img src={avatar} alt={name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/10 object-cover" />
                <div className="hidden lg:flex flex-col justify-center"><span className="text-white text-sm font-bold leading-none">{name}</span></div>
                <HubIcon icon={ChevronDown} size={16} className={`w-4 h-4 text-white/50 hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-label="Cerrar perfil" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, originY: 0, originX: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[#18181b] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden">
                      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-4">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full border border-white/10 object-cover shrink-0" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{name}</p><p className="text-xs text-white/50 truncate mt-0.5">{authUser?.email || 'admin@qaway.pe'}</p></div>
                      </div>
                      <div className="p-2 border-t border-white/5 bg-black/20">
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors font-bold">Cerrar Sesión</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (Lienzo Maestro CRM: #fafafa) ────────────────── */}
        <main className="flex-1 bg-[#fafafa] overflow-y-auto text-zinc-900 relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.007] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 p-6 md:p-8 min-h-full max-w-[1200px] mx-auto">
            <div>
              <p className="text-sm text-zinc-500 capitalize">{fecha}</p>
                <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">Hola de nuevo, {name}</h1>
                <p className="mt-2 text-[15px] text-zinc-600 max-w-[62ch]">Tu anillo central para operar todo Qaway Lab sin friccion. Entra a cualquier app con un clic.</p>
                {/* Tarjetas literales de HubPage en presentación disminuida */}
                <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-[#fafafa]/90 backdrop-blur-md py-4 -mx-6 px-6 md:-mx-8 md:px-8 border-b border-zinc-200/50 mt-4 mb-2">
                  {PILLARS.map((p) => (
                    <button key={p.label} onClick={() => setActiveTab(p.label)}
                      className={`h-9 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 outline-none focus:outline-none focus:ring-0 select-none [-webkit-tap-highlight-color:transparent] ${activeTab === p.label ? 'bg-zinc-950 text-white border-zinc-950' : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'}`}>{p.label}</button>
                  ))}
                  <span className="ml-auto text-xs font-mono text-zinc-400">{filtered.length} herramientas</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                    <p className="text-[15px] font-semibold text-zinc-900">Sin resultados</p>
                    <button onClick={() => { setGlobalSearchQuery(''); setActiveTab('Todas') }} className="mt-4 h-10 px-5 rounded-full bg-zinc-950 text-white text-sm font-bold">Limpiar filtros</button>
                  </div>
                ) : (activeTab === 'Todas' && !globalSearchQuery.trim() ? (
                  <div className="mt-6 space-y-8">
                    {PILLARS.filter(p => p.match !== null).map((pillar) => {
                      const items = filtered.filter(r => r.pillar && r.pillar.includes(pillar.match))
                      if (items.length === 0) return null
                      return (
                        <div key={pillar.label}>
                          <div className="flex items-center gap-2.5 pb-3">
                            <span className="h-2 w-2 rounded-full bg-[#ff4b0b]" />
                            <h2 className="text-base font-bold tracking-tight text-zinc-950">{pillar.label.toUpperCase()}</h2>
                            <span className="text-[11px] font-mono text-zinc-400">({items.length})</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {items.map((route) => {
                              const Icon = route.icon
                              const gradient = PILLAR_GRADIENTS[route.pillar] || PILLAR_GRADIENTS['Herramientas']
                              const hasPreview = Boolean(route.preview)
                              return (
                                <Link key={route.path} to={route.path} className="group block">
                                  <article className={`relative flex min-h-[156px] overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] ${gradient}`}>
                                    {/* Preview image — right side */}
                                    {hasPreview ? (
                                      <div className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none">
                                        <div className="h-full w-full rounded-l-xl bg-white/60 overflow-hidden border-l border-black/[0.04]">
                                          <img src={route.preview} alt={route.title} className="h-full w-full object-cover object-left-top" loading="lazy" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center opacity-10">
                                        <Icon className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                                      </div>
                                    )}
                                    {/* Text content — left side, max-w to avoid overlap */}
                                    <div className="relative z-10 flex flex-col p-5 max-w-[58%]">
                                      <span className={`w-8 h-8 mb-3 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/[0.03] ${route.tone}`}>
                                        <HubIcon icon={Icon} size={16} className="w-4 h-4" />
                                      </span>
                                      <h3 className="text-[14px] font-extrabold leading-snug text-zinc-900 tracking-tight pr-2">{route.title}</h3>
                                    </div>
                                  </article>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map((route) => {
                      const Icon = route.icon
                      const gradient = PILLAR_GRADIENTS[route.pillar] || PILLAR_GRADIENTS['Herramientas']
                      const hasPreview = Boolean(route.preview)
                      return (
                        <Link key={route.path} to={route.path} className="group block">
                          <article className={`relative flex min-h-[156px] overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] ${gradient}`}>
                            {hasPreview ? (
                              <div className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none">
                                <div className="h-full w-full rounded-l-xl bg-white/60 overflow-hidden border-l border-black/[0.04]">
                                  <img src={route.preview} alt={route.title} className="h-full w-full object-cover object-left-top" loading="lazy" />
                                </div>
                              </div>
                            ) : (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center opacity-10">
                                <Icon className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                              </div>
                            )}
                            <div className="relative z-10 flex flex-col p-5 max-w-[58%]">
                              <span className={`w-8 h-8 mb-3 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/[0.03] ${route.tone}`}>
                                <HubIcon icon={Icon} size={16} className="w-4 h-4" />
                              </span>
                              <h3 className="text-[14px] font-extrabold leading-snug text-zinc-900 tracking-tight pr-2">{route.title}</h3>
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                  </div>
                ))}
            </div>
          </div>
        </main>

        {/* FLOATING ACTION BUTTONS */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/10" title="Qaway IA Insights">
            <HubIcon icon={Sparkles} size={24} className="w-6 h-6 animate-pulse" />
          </button>
          <button className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#ff4b0b] to-[#ff8c00] text-white shadow-[0_8px_30px_rgba(255,75,11,0.4)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/20" title="Chatbot de Ayuda">
            <HubIcon icon={MessageSquare} size={24} className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HubPanelPage() {
  return (<ErrorBoundary><HubPanelContent /></ErrorBoundary>)
}
