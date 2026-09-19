import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { HubIcon } from '@/components/ui/icons'
import {
  BarChart3, MessageSquare, Layers, Briefcase, Search, Bell, Plus,
  Settings, ChevronDown, AlertCircle, X, Menu, Home,
  Bot, CalendarDays, Package, Clapperboard, PenLine, GraduationCap,
  MessageSquareText, CreditCard, KanbanSquare, ArrowRight, ArrowUpRight, Sparkles,
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

const APPS = [
  { id: 'crm', title: 'Qaway CRM Comercial & Leads', desc: 'WhatsApp multiagente, atribucion Meta Ads, pipeline kanban y tareas.', path: '/hub/crm', badge: 'Pro', category: 'Ventas', pillar: 'Ventas & CRM', icon: BarChart3, tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', metric: '14 Leads activos' },
  { id: 'gestor', title: 'Gestor de Proyectos & Entregas V2', desc: 'Frameworks Agile, hitos PMB, SOW y entregas trazables.', path: '/hub/gestor-proyectos-v2', badge: 'V2 Activa', category: 'Gestión', pillar: 'Operaciones & Proyectos', icon: KanbanSquare, tone: 'bg-blue-500/10 text-blue-600', metric: '3 Proyectos en curso' },
  { id: 'agentes', title: 'Agentes de IA Responsable', desc: 'Agentes consultivos para WhatsApp con Ley 31814 y Google PAIR.', path: '/hub/agentes', badge: 'Nuevo', category: 'IA', pillar: 'Inteligencia Artificial', icon: Bot, tone: 'bg-indigo-500/10 text-indigo-600', metric: '5 Agentes listos' },
  { id: 'agenda', title: 'Qaway Agenda & Sistema de Citas', desc: 'Reservas estilo Calendly con recordatorios y panel de citas.', path: '/hub/agenda', badge: 'Nuevo', category: 'Gestión', pillar: 'Operaciones & Proyectos', icon: CalendarDays, tone: 'bg-indigo-500/10 text-indigo-600', metric: 'Hoy: 6 citas' },
  { id: 'inventario', title: 'Qaway Inventario & ERP Comercial', desc: 'Stock, almacenes, Kardex, captura con IA y cotizaciones.', path: '/hub/inventario', badge: 'Pro', category: 'Finanzas', pillar: 'Comercio & Finanzas', icon: Package, tone: 'bg-amber-500/10 text-amber-600', metric: 'Stock al 92%' },
  { id: 'creador', title: 'Creador de Contenido Modular', desc: 'Radar viral, guiones con retencion, matriz de hooks y carruseles.', path: '/hub/creador-contenido', badge: 'Nuevo', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: Clapperboard, tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', metric: '12 Guiones este mes' },
  { id: 'blog', title: 'Editor de Blog & Articulos', desc: 'Redactor visual Tiptap con SEO, metadatos y publicacion directa.', path: '/hub/blog-editor', badge: 'Pro', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: PenLine, tone: 'bg-emerald-500/10 text-emerald-600', metric: '4 Borradores' },
  { id: 'academy', title: 'Qaway Academy', desc: 'LMS de cursos, lecciones interactivas y certificados.', path: '/hub/academy', badge: 'LMS', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: GraduationCap, tone: 'bg-blue-500/10 text-blue-600', metric: '8 Cursos activos' },
  { id: 'waba', title: 'Consola WABA + CRM', desc: 'Integracion WhatsApp Cloud API y checklist de pruebas.', path: '/hub/waba-crm', badge: '72h Gratis', category: 'Ventas', pillar: 'Ventas & CRM', icon: MessageSquareText, tone: 'bg-emerald-500/10 text-emerald-600', metric: 'API conectada' },
  { id: 'pagos', title: 'Qaway Pagos & Carrito', desc: 'Checkout multi metodo, catalogo y gestion de ordenes.', path: '/carrito', badge: 'Nuevo', category: 'Finanzas', pillar: 'Comercio & Finanzas', icon: CreditCard, tone: 'bg-amber-500/10 text-amber-600', metric: 'Pagos al dia' },
]

const HUB_TABS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'ventas', label: 'Ventas & CRM', icon: BarChart3 },
  { id: 'proyectos', label: 'Proyectos', icon: Layers },
  { id: 'ia', label: 'IA', icon: Bot },
  { id: 'contenidos', label: 'Contenidos', icon: Clapperboard },
  { id: 'finanzas', label: 'Finanzas', icon: Briefcase },
]

const TAB_FILTER = { inicio: null, ventas: 'Ventas', proyectos: 'Gestión', ia: 'IA', contenidos: 'Contenido', finanzas: 'Finanzas' }

function displayName(email) {
  if (!email) return 'Equipo Qaway'
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return 'Equipo Qaway'
  return base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function HubV2Content() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inicio')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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
    const q = globalSearchQuery.trim().toLowerCase()
    const cat = TAB_FILTER[activeTab]
    return APPS.filter((a) => {
      const okTab = !cat || a.category === cat
      const okQ = !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.pillar.toLowerCase().includes(q)
      return okTab && okQ
    })
  }, [globalSearchQuery, activeTab])

  const handleLogout = () => { logoutUser(); navigate('/login', { replace: true }) }

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden font-sans text-white selection:bg-[#ff4b0b] selection:text-white">
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-white/10 bg-[#111111] transition-all duration-300 ease-in-out`}>
        {/* LOGO - Redirección a Inicio */}
        <button onClick={() => setActiveTab('inicio')} className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 shrink-0 cursor-pointer hover:bg-white/5 transition-colors group w-full`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide text-lg">
              {isSidebarCollapsed ? (<span className="text-[#ff4b0b]">Q</span>) : (<>Qaway <span className="text-[#ff4b0b]">Hub</span></>)}
            </span>
          </div>
        </button>
        {/* NAVIGATION */}
        <nav className={`flex-1 py-6 ${isSidebarCollapsed ? 'px-2' : 'px-4'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          {HUB_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={isSidebarCollapsed ? tab.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all w-full text-left ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <HubIcon icon={tab.icon} size={16} className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b0b]' : ''}`} />
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            )
          })}
        </nav>
        {/* ZONA INFERIOR DEL SIDEBAR */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <button onClick={() => setActiveTab('inicio')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 ${isSidebarCollapsed ? "justify-center" : ""}`} title={isSidebarCollapsed ? "Configuración" : undefined}>
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
              <button onClick={() => setActiveTab('inicio')} className="group flex items-center gap-2 h-10 px-3 rounded-full border border-transparent hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 ease-out cursor-pointer" title="Ir al Inicio del Hub">
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
                              <li key={app.id}>
                                <Link to={app.path} onClick={() => setGlobalSearchQuery('')} className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-4 text-left group">
                                  <div className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[13px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20"><HubIcon icon={Icon} size={16} className="w-4 h-4" /></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{app.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1"><span className="truncate">{app.pillar}</span><span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50">{app.badge}</span></div>
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
            <div className="h-6 w-px bg-white/10" />
            <Link to="/hub/crm" className="flex items-center gap-2 bg-[#ff4b0b] hover:bg-[#dc3d00] text-white px-3.5 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-[0_0_15px_rgba(255,75,11,0.2)] whitespace-nowrap">
              <HubIcon icon={Plus} size={16} className="w-4 h-4 shrink-0" /><span className="hidden sm:block">Nueva oportunidad</span>
            </Link>
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
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ transform: 'none' }}>
                <p className="text-sm text-zinc-500 capitalize">{fecha}</p>
                <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">Hola de nuevo, {name}</h1>
                <p className="mt-2 text-[15px] text-zinc-600 max-w-[62ch]">Tu anillo central para operar todo Qaway Lab sin friccion. Entra a cualquier app con un clic.</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-sm font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Todos los sistemas operativos • 10 aplicaciones conectadas
                </div>
                <div className="mt-6 rounded-3xl border border-orange-500/25 bg-gradient-to-br from-[#1a0e06] via-[#141414] to-[#101828] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#ff8a3d]">Destacado del ecosistema</p>
                  <h2 className="mt-2 text-xl font-bold max-w-[38ch]">Potencia tu conversion: conecta WhatsApp Cloud API con el CRM y automatiza hasta el 70% de tus consultas.</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to="/hub/crm" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#ff4b0b] hover:bg-[#ff5c1f] font-bold text-[15px] transition-all duration-300">Ir al CRM <HubIcon icon={ArrowRight} size={16} className="w-4 h-4" /></Link>
                    <Link to="/hub/waba-crm" className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 font-semibold text-[15px] transition-all duration-300">Ver checklist WABA</Link>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((app) => {
                    const Icon = app.icon
                    return (
                      <article key={app.id} className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${app.tone}`}><HubIcon icon={Icon} size={20} className="w-5 h-5" /></span>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 shrink-0">{app.badge}</span>
                        </div>
                        <h3 className="mt-4 text-[17px] font-bold text-zinc-950">{app.title}</h3>
                        <p className="mt-1.5 text-[15px] text-zinc-600">{app.desc}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{app.pillar} • {app.metric}</p>
                        <Link to={app.path} className="mt-4 inline-flex items-center justify-between h-11 px-4 rounded-xl bg-zinc-950 text-white hover:bg-[#ff4b0b] font-bold text-[15px] transition-all duration-300 group">Abrir aplicacion<HubIcon icon={ArrowUpRight} size={16} className="w-4 h-4" /></Link>
                      </article>
                    )
                  })}
                </div>
                {filtered.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                    <p className="text-[15px] font-semibold text-zinc-900">Sin resultados</p>
                    <button onClick={() => { setGlobalSearchQuery(''); setActiveTab('inicio') }} className="mt-4 h-10 px-5 rounded-full bg-zinc-950 text-white text-sm font-bold">Limpiar filtros</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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

export default function HubWorkspacePageV2() {
  return (<ErrorBoundary><HubV2Content /></ErrorBoundary>)
}
