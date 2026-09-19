import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Search, Bell, Plus, ChevronDown, Home, Clock3, Settings2, Globe,
  ArrowRight, ArrowUpRight, KanbanSquare, BarChart3, Bot, CalendarDays, Package,
  Clapperboard, PenLine, GraduationCap, MessageSquareText, CreditCard, X, Menu,
} from 'lucide-react'
import { getAuthUser, logoutUser } from '@/config/auth'
import { AppSwitcherDropdown } from './5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'
const CARD_HOVER = `transition-all duration-300 ${EASE} hover:scale-[1.015] hover:border-white/20 hover:bg-white/[0.06]`

const APPS = [
  { id: 'crm', title: 'Qaway CRM Comercial & Leads', desc: 'WhatsApp multiagente, atribucion Meta Ads, pipeline kanban y tareas.', path: '/hub/crm', badge: 'Pro', category: 'Ventas', pillar: 'Ventas & CRM', icon: BarChart3, tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', metric: '14 Leads activos' },
  { id: 'gestor', title: 'Gestor de Proyectos & Entregas V2', desc: 'Frameworks Agile, hitos PMB, SOW y entregas trazables.', path: '/hub/gestor-proyectos-v2', badge: 'V2 Activa', category: 'Gestión', pillar: 'Operaciones & Proyectos', icon: KanbanSquare, tone: 'bg-blue-500/10 text-blue-400', metric: '3 Proyectos en curso' },
  { id: 'agentes', title: 'Agentes de IA Responsable', desc: 'Agentes consultivos para WhatsApp con Ley 31814 y Google PAIR.', path: '/hub/agentes', badge: 'Nuevo', category: 'IA', pillar: 'Inteligencia Artificial', icon: Bot, tone: 'bg-indigo-500/10 text-indigo-400', metric: '5 Agentes listos' },
  { id: 'agenda', title: 'Qaway Agenda & Sistema de Citas', desc: 'Reservas estilo Calendly con recordatorios y panel de citas.', path: '/hub/agenda', badge: 'Nuevo', category: 'Gestión', pillar: 'Operaciones & Proyectos', icon: CalendarDays, tone: 'bg-indigo-500/10 text-indigo-300', metric: 'Hoy: 6 citas' },
  { id: 'inventario', title: 'Qaway Inventario & ERP Comercial', desc: 'Stock, almacenes, Kardex, captura con IA y cotizaciones.', path: '/hub/inventario', badge: 'Pro', category: 'Finanzas', pillar: 'Comercio & Finanzas', icon: Package, tone: 'bg-amber-500/10 text-amber-400', metric: 'Stock al 92%' },
  { id: 'creador', title: 'Creador de Contenido Modular', desc: 'Radar viral, guiones con retencion, matriz de hooks y carruseles.', path: '/hub/creador-contenido', badge: 'Nuevo', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: Clapperboard, tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]', metric: '12 Guiones este mes' },
  { id: 'blog', title: 'Editor de Blog & Articulos', desc: 'Redactor visual Tiptap con SEO, metadatos y publicacion directa.', path: '/hub/blog-editor', badge: 'Pro', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: PenLine, tone: 'bg-emerald-500/10 text-emerald-400', metric: '4 Borradores' },
  { id: 'academy', title: 'Qaway Academy', desc: 'LMS de cursos, lecciones interactivas y certificados.', path: '/hub/academy', badge: 'LMS', category: 'Contenido', pillar: 'Creacion & Contenidos', icon: GraduationCap, tone: 'bg-blue-500/10 text-blue-300', metric: '8 Cursos activos' },
  { id: 'waba', title: 'Consola WABA + CRM', desc: 'Integracion WhatsApp Cloud API y checklist de pruebas.', path: '/hub/waba-crm', badge: '72h Gratis', category: 'Ventas', pillar: 'Ventas & CRM', icon: MessageSquareText, tone: 'bg-emerald-500/10 text-emerald-300', metric: 'API conectada' },
  { id: 'pagos', title: 'Qaway Pagos & Carrito', desc: 'Checkout multi metodo, catalogo y gestion de ordenes.', path: '/carrito', badge: 'Nuevo', category: 'Finanzas', pillar: 'Comercio & Finanzas', icon: CreditCard, tone: 'bg-amber-500/10 text-amber-300', metric: 'Pagos al dia' },
]

const TABS = ['Todas', 'Gestión', 'Ventas', 'IA', 'Contenido', 'Finanzas']

const SIDEBAR_GROUPS = [
  { label: 'Ventas & CRM', items: ['crm', 'waba'] },
  { label: 'Operaciones & Proyectos', items: ['gestor', 'agenda'] },
  { label: 'Inteligencia Artificial', items: ['agentes'] },
  { label: 'Creación & Contenidos', items: ['creador', 'blog', 'academy'] },
  { label: 'Comercio & Finanzas', items: ['inventario', 'pagos'] },
]

const QUICK_CREATE = [
  { label: 'Nuevo Lead', path: '/hub/crm' },
  { label: 'Nuevo Proyecto', path: '/hub/gestor-proyectos-v2' },
  { label: 'Agendar Cita', path: '/hub/agenda' },
  { label: 'Nuevo Contenido', path: '/hub/creador-contenido' },
]

function displayName(email) {
  if (!email) return 'Equipo Qaway'
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return 'Equipo Qaway'
  return base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function HubWorkspacePage() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('Todas')
  const [waffle, setWaffle] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)
  const user = useMemo(() => getAuthUser(), [])
  const name = displayName(user?.email)
  const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') { setCreateOpen(false); setProfileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return APPS.filter((a) => {
      const okTab = tab === 'Todas' || a.category === tab
      const okQ = !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.pillar.toLowerCase().includes(q)
      return okTab && okQ
    })
  }, [query, tab])

  const recent = [APPS[0], APPS[1], APPS[2]]

  const handleLogout = () => {
    logoutUser()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen w-full bg-[#0c0c0c] text-white font-sans selection:bg-[#ff4b0b] selection:text-white [scrollbar-gutter:stable]">
      {/* TOPBAR 72px */}
      <header className="h-[72px] sticky top-0 z-50 bg-[#111111] border-b border-white/5 flex items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <button type="button" onClick={() => setWaffle(!waffle)} title="Ecosistema de Aplicaciones"
              className={`flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition-all duration-300 ${EASE}`}>
              <LayoutGrid className="w-4 h-4" />
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </button>
            <AppSwitcherDropdown isOpen={waffle} onClose={() => setWaffle(false)} />
          </div>
          <Link to="/hub" className="flex items-center gap-2.5 min-w-0 rounded-full pr-3 hover:bg-white/5 transition-all duration-300">
            <span className="w-9 h-9 rounded-xl bg-[#ff4b0b] flex items-center justify-center font-black text-lg shrink-0">Q</span>
            <span className="hidden sm:block leading-tight text-left">
              <span className="block text-sm font-bold truncate">Qaway Hub</span>
              <span className="block text-xs text-white/50 truncate">Qaway Lab • Workspace Principal</span>
            </span>
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300" title="Colapsar sidebar">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:block flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar apps, herramientas y modulos..."
              className="w-full bg-[#18181b] border border-white/10 rounded-full pl-11 pr-20 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff4b0b]/60 transition-all duration-300" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">Ctrl</kbd>
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">K</kbd>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setCreateOpen(!createOpen)} className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#ff4b0b] hover:bg-[#ff5c1f] text-white text-sm font-bold transition-all duration-300">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Crear</span><ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {createOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-white/10 bg-[#18181b] p-2 shadow-2xl z-[90]">
                {QUICK_CREATE.map((c) => (
                  <Link key={c.label} to={c.path} onClick={() => setCreateOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all duration-300">
                    {c.label}<ArrowUpRight className="w-4 h-4 text-white/40" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button title="Notificaciones" className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#ff4b0b]" />
          </button>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4b0b] to-amber-500 flex items-center justify-center font-bold text-sm" title={user?.email || 'Usuario'}>
              {name.charAt(0).toUpperCase()}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl border border-white/10 bg-[#18181b] p-3 shadow-2xl z-[90]">
                <p className="px-2 text-sm font-bold truncate">{name}</p>
                <p className="px-2 text-xs text-white/50 truncate mb-2">{user?.email || 'Sesión activa'}</p>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-all duration-300">Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* SIDEBAR */}
        <aside className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} hidden md:flex shrink-0 flex-col border-r border-white/5 bg-[#111111] transition-all duration-300 ${EASE}`}>
          <nav className={`flex-1 py-5 ${collapsed ? 'px-2' : 'px-3'} flex flex-col gap-1 overflow-y-auto`}>
            <Link to="/hub" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white text-[15px] font-semibold">
              <Home className="w-4 h-4 text-[#ff4b0b] shrink-0" />{!collapsed && <span>Inicio del Ecosistema</span>}
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-[15px] font-medium transition-all duration-300 cursor-pointer">
              <Clock3 className="w-4 h-4 shrink-0" />{!collapsed && <span>Visto recientemente</span>}
            </div>
            {!collapsed && <p className="px-3 pt-5 pb-1 text-[11px] font-bold uppercase tracking-widest text-white/35">Espacios de trabajo</p>}
            {SIDEBAR_GROUPS.map((g) => (
              <div key={g.label}>
                {!collapsed && <p className="px-3 pt-3 pb-1 text-xs font-semibold text-white/45 truncate">{g.label}</p>}
                {g.items.map((id) => {
                  const app = APPS.find((a) => a.id === id)
                  if (!app) return null
                  const Icon = app.icon
                  return (
                    <Link key={id} to={app.path} title={app.title}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[15px] text-white/65 hover:text-white hover:bg-white/5 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${app.tone}`}><Icon className="w-4 h-4" /></span>
                      {!collapsed && <span className="truncate">{app.title.split('&')[0]}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className={`p-3 border-t border-white/5 flex flex-col gap-1 ${collapsed ? 'items-center' : ''}`}>
            <Link to="/hub/explorar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all duration-300">
              <Settings2 className="w-4 h-4 shrink-0" />{!collapsed && <span>Ajustes de Organización</span>}
            </Link>
            <a href="https://www.qawaylab.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all duration-300">
              <Globe className="w-4 h-4 shrink-0" />{!collapsed && <span className="truncate">www.qawaylab.com</span>}
            </a>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full px-5 lg:px-10 py-8">
            {/* Buscador movil */}
            <div className="md:hidden relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en el Hub..."
                className="w-full bg-[#18181b] border border-white/10 rounded-full pl-11 pr-10 py-2.5 text-[15px] placeholder:text-white/40 focus:outline-none focus:border-[#ff4b0b]/60" />
              {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"><X className="w-4 h-4" /></button>}
            </div>

            {/* HERO */}
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <p className="text-sm text-white/50 capitalize">{fecha}</p>
              <h1 className="mt-1 text-3xl lg:text-[40px] leading-tight font-extrabold tracking-tight">Hola de nuevo, {name}</h1>
              <p className="mt-2 text-[15px] lg:text-base text-white/65 max-w-[62ch]">Tu anillo central para operar todo Qaway Lab sin friccion. Entra a cualquier app con un clic.</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Todos los sistemas operativos • 10 aplicaciones conectadas
              </div>
            </motion.section>

            {/* SPOTLIGHT */}
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 relative overflow-hidden rounded-3xl border border-[#ff4b0b]/25 bg-gradient-to-br from-[#1a0e06] via-[#141414] to-[#101828] p-6 lg:p-8">
              <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#ff4b0b]/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#ff8a3d]">Destacado del ecosistema</p>
              <h2 className="mt-2 text-xl lg:text-2xl font-bold leading-snug max-w-[38ch]">Potencia tu conversion: conecta WhatsApp Cloud API con el CRM y automatiza hasta el 70% de tus consultas.</h2>
              <p className="mt-2 text-[15px] text-white/70 max-w-[60ch]">Bandeja multiagente, atribucion Meta Ads y checklist guiado de pruebas en un solo flujo.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/hub/crm" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#ff4b0b] hover:bg-[#ff5c1f] font-bold text-[15px] transition-all duration-300">Ir al CRM <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/hub/waba-crm" className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 font-semibold text-[15px] transition-all duration-300">Ver checklist WABA</Link>
              </div>
            </motion.section>

            {/* ACCESO RAPIDO */}
            <section className="mt-9">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-lg font-bold">Acceso rapido</h2>
                <span className="text-sm text-white/45">Visto recientemente</span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recent.map((app, i) => {
                  const Icon = app.icon
                  return (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
                      <Link to={app.path} className={`block rounded-2xl border border-white/10 bg-[#141414] p-4 ${CARD_HOVER}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${app.tone}`}><Icon className="w-5 h-5" /></span>
                          <div className="min-w-0">
                            <p className="text-[15px] font-bold truncate">{app.title}</p>
                            <p className="text-sm text-white/55 truncate">{app.metric}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            {/* ECOSISTEMA */}
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Ecosistema de Aplicaciones Qaway</h2>
                <div className="flex flex-wrap gap-2">
                  {TABS.map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`h-9 px-4 rounded-full text-sm font-semibold border transition-all duration-300 ${tab === t ? 'bg-white text-zinc-950 border-white' : 'border-white/10 bg-white/5 text-white/65 hover:text-white hover:bg-white/10'}`}>{t}</button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-[#141414] p-8 text-center">
                  <p className="text-[15px] font-semibold">Sin resultados para “{query}”</p>
                  <p className="mt-1 text-[15px] text-white/60">Prueba con CRM, agenda, inventario o contenido.</p>
                  <button onClick={() => { setQuery(''); setTab('Todas') }} className="mt-4 h-10 px-5 rounded-full bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-all duration-300">Limpiar filtros</button>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((app, i) => {
                    const Icon = app.icon
                    return (
                      <motion.article key={app.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                        className={`rounded-2xl border border-white/10 bg-[#141414] p-5 flex flex-col ${CARD_HOVER}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${app.tone}`}><Icon className="w-5 h-5" /></span>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/70 shrink-0">{app.badge}</span>
                        </div>
                        <h3 className="mt-4 text-[17px] font-bold leading-snug">{app.title}</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">{app.desc}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/40">{app.pillar}</p>
                        <Link to={app.path} className="mt-4 inline-flex items-center justify-between h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#ff4b0b] hover:border-[#ff4b0b] font-bold text-[15px] transition-all duration-300 group">
                          Abrir aplicacion<ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                        </Link>
                      </motion.article>
                    )
                  })}
                </div>
              )}
            </section>

            <footer className="mt-10 pb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-white/40">
              <span>Qaway Lab • Hub Workspace Central</span>
              <a href="https://www.qawaylab.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">www.qawaylab.com</a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
