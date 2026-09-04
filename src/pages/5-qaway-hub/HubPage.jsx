import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Route,
  Briefcase,
  FlaskConical,
  Wrench,
  BarChart3,
  Zap,
  ArrowRight,
  MessageSquare,
  Calendar,
  Sparkles,
  TrendingUp,
  Layers,
  PenSquare,
  Star,
  FolderKanban,
  Target,
  Kanban,
  FileImage,
  Search,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import '@/pages/11-Proyectos/proyectos.css'

const routes = [
  {
    icon: FileImage,
    title: 'Optimizador de Imágenes WebP',
    description: 'Herramienta interactiva para comprimir y convertir imágenes PNG y JPG a WebP con hasta 95% de ahorro en tu navegador.',
    path: '/hub/optimizador-webp',
    access: 'free',
    badge: 'Gratis',
    category: 'Herramientas',
    tone: 'bg-[#fe6612]/10 text-[#fe6612]',
  },
  {
    icon: FolderKanban,
    title: 'Gestor de Proyectos & Entregas',
    description: 'Trazabilidad y portal de cliente: ciclo de 6 hitos para Desarrollo Web, Branding, CRM y Marketing.',
    path: '/hub/gestor-proyectos',
    access: 'pro',
    badge: 'Pro',
    category: 'Product Management',
    tone: 'bg-[#fe6612]/10 text-[#fe6612]',
  },
  {
    icon: PenSquare,
    title: 'Editor Interno de Blog',
    description: 'Herramienta interna para crear articulos con categoria real, portada, bloques y snippet listo para integracion.',
    path: '/hub/blog-editor',
    access: 'pro',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  },
  {
    icon: Calendar,
    title: 'Consola WABA + CRM',
    description: 'Panel ejecutivo para campana: integracion WhatsApp API, payloads, checklist y pruebas E2E en un solo lugar.',
    path: '/hub/waba-crm',
    access: 'pro',
    badge: 'Destacado',
    category: 'Panel de control',
    tone: 'bg-[#191918] text-white',
  },
  {
    icon: MessageSquare,
    title: 'Consola CRM Comercial',
    description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real de Meta Ads y analiticas estilo Power BI.',
    path: '/hub/crm',
    access: 'pro',
    badge: 'Nuevo',
    category: 'Panel de control',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  },
  {
    icon: Route,
    title: 'Ruta Marca / Emprendimiento',
    description: 'Desde la idea hasta tu estructura digital basica. Naming, logo, identidad, redes, landing y captacion.',
    path: '/hub/ruta-marca',
    access: 'free',
    badge: null,
    category: 'Rutas de Marca',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: Briefcase,
    title: 'Ruta Profesional / Oficina',
    description: 'Organizacion, reportes, dashboards, automatizacion y productividad para equipos y oficinas.',
    path: '/hub/ruta-profesional',
    access: 'free',
    badge: null,
    category: 'Ruta Profesional',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: FlaskConical,
    title: 'Ruta Incubadora',
    description: 'Acompanamiento para validar ideas, proyectos o negocios con herramientas y modulos progresivos.',
    path: '/hub/ruta-incubadora',
    access: 'free',
    badge: null,
    category: 'Rutas de Marca',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: Wrench,
    title: 'Herramientas Guiadas',
    description: 'Soluciones modulares paso a paso para construir, organizar y mejorar tu operacion digital.',
    path: '/hub/herramientas',
    access: 'free',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: BarChart3,
    title: 'Centro de Analítica & Gráficos',
    description: 'Suite de métricas estilo PowerBI y Google Analytics con galería Recharts completa y presets por industria.',
    path: '/hub/analytics',
    access: 'pro',
    badge: 'Pro',
    category: 'Herramientas',
    tone: 'bg-[#0080FF]/10 text-[#0080FF]',
  },
  {
    icon: Target,
    title: 'Marketing Studio OS (Revolut UI)',
    description: 'Estrategia y arquitectura: Buyer Persona (JTBD), Content Mapping HubSpot, Auditoría POEM y Simulador de Funnel.',
    path: '/hub/marketing',
    access: 'pro',
    badge: 'v1.0',
    category: 'Herramientas',
    tone: 'bg-[#0075FF]/10 text-[#0075FF]',
  },
  {
    icon: Kanban,
    title: 'Twenty Revenue OS (Pipeline CRM)',
    description: 'CRM y Pipeline visual estilo Twenty CRM: Vista Kanban, Tablas Relacionales, Atribución HubSpot y Drawer Lateral.',
    path: '/hub/marketing2',
    access: 'pro',
    badge: 'Twenty UI',
    category: 'Herramientas',
    tone: 'bg-slate-900 text-white',
  },
  {
    icon: Zap,
    title: 'Automatizaciones',
    description: 'Flujos automaticos y conectores para optimizar procesos repetitivos y ganar productividad.',
    path: '/hub/automatizaciones',
    access: 'free',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
]

const areas = [
  { icon: Route, title: 'Rutas de Marca', description: 'Construye y lanza tu presencia digital desde cero.' },
  { icon: Briefcase, title: 'Ruta Profesional', description: 'Organiza y optimiza tu operacion diaria.' },
  { icon: Layers, title: 'Herramientas y Paneles', description: 'Soluciones modulares y dashboards de control.' },
]

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

export default function HubPage() {
  useSetNavbarVariant('transparent')
  const [accessFilter, setAccessFilter] = useState('all') // 'all' | 'free' | 'pro'
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')

  const thematicFilters = [
    'Todas',
    'Herramientas',
    'Product Management',
    'Panel de control',
    'Rutas de Marca',
    'Ruta Profesional',
  ]

  const filteredRoutes = routes.filter((route) => {
    const matchAccess = accessFilter === 'all' || route.access === accessFilter
    const matchCat = categoryFilter === 'Todas' || route.category === categoryFilter
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      (route.title && route.title.toLowerCase().includes(q)) ||
      (route.description && route.description.toLowerCase().includes(q)) ||
      (route.category && route.category.toLowerCase().includes(q)) ||
      (route.badge && route.badge.toLowerCase().includes(q))
    return matchAccess && matchCat && matchSearch
  })

  const featured = filteredRoutes.filter((route) => route.badge)
  const regularRoutes = filteredRoutes.filter((route) => !route.badge)

  const FeaturedCard = ({ route, idx }) => {
    const Icon = route.icon
    const isPrimary = idx === 0

    return (
      <Link to={route.path} className="block">
        <motion.article
          className={`group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl p-10 transition-all ${
            isPrimary
              ? 'bg-[linear-gradient(135deg,#ede9fe_0%,#ddd6fe_42%,#c4b5fd_100%)]'
              : 'bg-[linear-gradient(135deg,#e0f7fa_0%,#b2ebf2_42%,#80deea_100%)]'
          }`}
          initial={{ opacity: 0, x: isPrimary ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
        >
          <div className="absolute -right-8 top-1/2 flex h-52 w-52 -translate-y-1/2 rotate-3 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-[#191918]/25 shadow-2xl transition-transform duration-500 group-hover:-translate-y-1/2 group-hover:rotate-0 group-hover:scale-105">
            <Icon className="h-24 w-24" strokeWidth={1.4} />
          </div>
          <div className="relative z-10 max-w-[68%]">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#191918]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#191918]">
              {isPrimary ? <TrendingUp size={12} strokeWidth={3} /> : <Star size={12} strokeWidth={3} />}
              {route.badge}
            </span>
            <p className="mb-1 text-[13px] font-medium text-[#191918]/60">{route.category}</p>
            <h3 className="text-[clamp(1.4rem,3vw,1.8rem)] font-bold leading-[1.15] text-[#191918]">
              {route.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#191918]/65">{route.description}</p>
          </div>
        </motion.article>
      </Link>
    )
  }

  const ModuleCard = ({ route, idx }) => {
    const Icon = route.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, delay: idx * 0.06 }}
      >
        <Link to={route.path} className="group flex h-full flex-col justify-between overflow-hidden rounded-md border border-black/10 bg-white p-5 transition-all hover:border-[#fe6612]/40 hover:shadow-lg">
          <div>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-black/10 bg-[#f8f9fc] text-[#191918]/55 transition-colors group-hover:border-[#fe6612]/30 group-hover:bg-[#fe6612]/10 group-hover:text-[#fe6612]">
                <Icon size={20} />
              </div>
              <span className={`rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${route.tone}`}>
                {route.category}
              </span>
            </div>
            <h3 className="text-[15px] font-bold leading-snug text-[#191918] transition-colors group-hover:text-[#fe6612]">
              {route.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-black/60">{route.description}</p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs font-bold uppercase tracking-widest text-[#191918] transition-colors group-hover:text-[#fe6612]">
            <span>Abrir</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] selection:bg-[#fe6612] selection:text-white">
      {/* ========================================================================= */}
      {/* HERO DE PROYECTOS (ESTILO LIMPIO Y TECNOLÓGICO) */}
      {/* ========================================================================= */}
      <section className="projects-hero border-b border-black/10">
        <div className="projects-shell">
          <motion.div
            className="projects-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Kicker en Cápsula Blanca translúcida */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs shadow-xs">
              <span>/ Hub</span>
            </div>

            {/* Título Principal Centrado */}
            <h1
              className="text-[clamp(2.4rem,4vw,3.4rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Qaway Hub<span className="text-white/70">.</span>
            </h1>

            {/* Bajada Centrada */}
            <p className="text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Accede a rutas, paneles y herramientas internas para organizar la operación digital de Qaway.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[10px] border border-white/40 bg-white px-4 py-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.14)] transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="h-5 w-5 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar módulos, paneles o herramientas..."
                  className="w-full bg-transparent text-sm text-[#191918] outline-none placeholder:text-black/40 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-black/40 hover:text-[#fe6612]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Botonera de Filtros Integrada (Acceso + Temática) */}
            <div className="mt-8 flex flex-col items-center gap-3.5 w-full max-w-4xl">
              {/* Fila 1: Acceso */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-white/95 mr-1">
                  ACCESO:
                </span>
                <button
                  type="button"
                  onClick={() => setAccessFilter('all')}
                  className={`rounded-full px-5 py-2 text-[13px] font-bold transition-all ${
                    accessFilter === 'all'
                      ? 'bg-white text-[#191918] shadow-md'
                      : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  Todos los módulos
                </button>
                <button
                  type="button"
                  onClick={() => setAccessFilter('free')}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold transition-all ${
                    accessFilter === 'free'
                      ? 'bg-white text-[#191918] shadow-md'
                      : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Herramientas Gratuitas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessFilter('pro')}
                  className={`rounded-full px-5 py-2 text-[13px] font-bold transition-all ${
                    accessFilter === 'pro'
                      ? 'bg-white text-[#191918] shadow-md'
                      : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  Suscripción Pro
                </button>
              </div>

              {/* Fila 2: Temática */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/95 mr-1">
                  TEMÁTICA:
                </span>
                {thematicFilters.map((filter) => {
                  const isActive = categoryFilter === filter
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setCategoryFilter(filter)}
                      className={`rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-[#191918] shadow-sm'
                          : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                })}

                {(accessFilter !== 'all' || categoryFilter !== 'Todas' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => { setAccessFilter('all'); setCategoryFilter('Todas'); setSearchQuery('') }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/40 transition-colors"
                    title="Restablecer filtros"
                  >
                    <span>Limpiar</span>
                    <RotateCcw size={11} className="text-white/80" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HERO ORIGINAL DE HUB (PRESERVADO INTACTO) */}
      {/* ========================================================================= */}
      <section className="relative z-20 overflow-hidden border-b border-black/10 bg-[#ffffff] pb-16 pt-28 text-[#191918] sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-[#ffffff]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7),transparent_70%)]" />
          <div
            className="absolute bottom-0 right-0 top-0 w-[42%] bg-[#1a1918] shadow-2xl transition-all duration-300 md:w-[34%] lg:w-[28%]"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:55px_75px] opacity-[0.14]" />
            <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.5),transparent_70%)]" />
            <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[94rem] px-6 text-left sm:px-10 lg:px-14">
          <div className="min-h-[190px] sm:h-[220px]">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
              <span>/ Hub</span>
            </div>
            <motion.h1
              className="text-[clamp(3rem,6.5vw,5rem)] font-bold uppercase leading-[0.85] text-[#191918]"
              style={displayFont}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Qaway Hub<span className="text-[#ff4b0b]">.</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#191918]/70 sm:text-base"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Accede a rutas, paneles y herramientas internas para organizar la operacion digital de Qaway.
            </motion.p>
          </div>

          <div className="mt-12 grid max-w-5xl gap-3 sm:grid-cols-3">
            {areas.map((area) => {
              const Icon = area.icon
              return (
                <div key={area.title} className="flex items-center gap-3 rounded-md border border-black/10 bg-white px-5 py-4">
                  <Icon size={18} className="shrink-0 text-[#ff4b0b]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#191918]">{area.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#191918]/55">{area.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          <div className="mb-8 border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />
              Bloques destacados
            </div>
          </div>

          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {featured.map((route, idx) => (
              <FeaturedCard key={route.title} route={route} idx={idx} />
            ))}
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-4">
            <h2 className="qw-section-title--sm uppercase text-[#191918]" style={displayFont}>
              Rutas y herramientas
            </h2>
            <span className="flex items-center gap-2 text-sm font-bold text-[#191918]/60">
              {filteredRoutes.length} modulos <ArrowRight size={16} />
            </span>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {regularRoutes.map((route, idx) => (
              <ModuleCard key={route.title} route={route} idx={idx} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-10 rounded-md border border-[#ff4b0b]/20 bg-[#ff4b0b]/5 px-10 py-12">
            <div className="min-w-[300px] flex-1">
              <h2 className="qw-section-title--sm mb-3 uppercase text-[#ff4b0b]" style={displayFont}>
                Domina el ecosistema Qaway Hub
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#191918]/70">
                Aprende a usar cada herramienta, ruta y dashboard con tutoriales guiados. De basico a avanzado, paso a paso.
              </p>
              <Link to="/academy" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                Ir a Academy <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-md border border-[#ff4b0b]/20 bg-white/70 text-[#ff4b0b]">
              <Sparkles className="h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}