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
  Instagram,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { WHATSAPP_LINK } from '@/data/navigation'
import { isPublicSiteMode } from '@/config/siteVisibility'
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
    published: false,
  },
  {
    icon: Instagram,
    title: 'Descargador & Extractor de Instagram',
    description: 'Extractor y descargador multimedia de publicaciones, carruseles y reels de Instagram en alta calidad.',
    path: '/hub/descargador-ig',
    access: 'free',
    badge: 'Borrador',
    category: 'Herramientas',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    published: false,
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
    published: false,
  },
  {
    icon: PenSquare,
    title: 'Editor Interno de Blog',
    description: 'Herramienta interna para crear articulos con categoria real, portada, bloques y snippet listo para integracion.',
    path: '/hub/blog-editor',
    access: 'pro',
    badge: 'Listo',
    category: 'Herramientas',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    published: true,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
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
    published: false,
  },
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

  const activeRoutes = routes.filter((route) => route.published)

  const thematicFilters = [
    'Todas',
    ...Array.from(new Set(activeRoutes.map((r) => r.category).filter(Boolean))),
  ]

  const filteredRoutes = activeRoutes.filter((route) => {
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

  const cardGradients = [
    'bg-[linear-gradient(135deg,#ede9fe_0%,#ddd6fe_42%,#c4b5fd_100%)]', // Lavender
    'bg-[linear-gradient(135deg,#e0f7fa_0%,#b2ebf2_42%,#80deea_100%)]', // Cyan
    'bg-[linear-gradient(135deg,#fef3c7_0%,#fde68a_42%,#fcd34d_100%)]', // Amber
    'bg-[linear-gradient(135deg,#e0e7ff_0%,#c7d2fe_42%,#a5b4fc_100%)]', // Indigo
    'bg-[linear-gradient(135deg,#dcfce7_0%,#bbf7d0_42%,#86efac_100%)]', // Mint
    'bg-[linear-gradient(135deg,#fee2e2_0%,#fecaca_42%,#fca5a5_100%)]', // Rose
    'bg-[linear-gradient(135deg,#ffedd5_0%,#fed7aa_42%,#fdba74_100%)]', // Peach
  ]

  const FeaturedCard = ({ route, idx }) => {
    const Icon = route.icon
    const gradient = cardGradients[idx % cardGradients.length]

    return (
      <Link to={route.path} className="group block">
        <motion.article
          className={`relative flex min-h-[290px] flex-col justify-end overflow-hidden rounded-2xl p-8 sm:p-10 transition-all ${gradient}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: (idx % 6) * 0.04 }}
          whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
        >
          {/* Marca de agua translúcida con icono grande */}
          <div className="absolute -right-8 top-1/2 flex h-52 w-52 -translate-y-1/2 rotate-3 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-[#191918]/25 shadow-2xl transition-transform duration-500 group-hover:-translate-y-1/2 group-hover:rotate-0 group-hover:scale-105">
            <Icon className="h-24 w-24" strokeWidth={1.4} />
          </div>

          {/* Contenido */}
          <div className="relative z-10 max-w-[74%]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#191918]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#191918]">
                {route.access === 'free' ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    <span>Gratis</span>
                  </>
                ) : (
                  <>
                    <Star size={11} strokeWidth={3} />
                    <span>{route.badge || 'Pro'}</span>
                  </>
                )}
              </span>
              <span className="text-[12px] font-semibold text-[#191918]/65">
                {route.category}
              </span>
            </div>

            <h3 className="text-[clamp(1.3rem,2.4vw,1.65rem)] font-bold leading-[1.2] text-[#191918]">
              {route.title}
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#191918]/70">
              {route.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#191918] transition-transform group-hover:translate-x-1">
              <span>Explorar</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </motion.article>
      </Link>
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
            <div className="mt-8 flex flex-col items-start sm:items-center gap-3.5 w-full max-w-4xl text-left sm:text-center">
              {/* Fila 1: Acceso */}
              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2.5 w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-white/95 mr-1 shrink-0">
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
              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-white/95 mr-1 shrink-0">
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

      <section className="pb-12 pt-6 sm:pt-8 lg:pb-20 lg:pt-10">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          {filteredRoutes.length === 0 ? (
            <div className="my-16 flex flex-col items-center justify-center text-center">
              <p className="text-base font-bold text-[#191918]">No se encontraron herramientas</p>
              <p className="mt-1 text-sm text-[#191918]/60">Intenta con otro término de búsqueda o limpia los filtros.</p>
              <button
                type="button"
                onClick={() => { setAccessFilter('all'); setCategoryFilter('Todas'); setSearchQuery('') }}
                className="mt-4 rounded-full bg-[#fe6612] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e05508] transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRoutes.map((route, idx) => (
                <FeaturedCard key={route.title} route={route} idx={idx} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-10 rounded-md border border-[#ff4b0b]/20 bg-[#ff4b0b]/5 px-10 py-12">
            <div className="min-w-[300px] flex-1">
              <h2 className="qw-section-title--sm mb-3 uppercase text-[#ff4b0b]" style={displayFont}>
                Domina el ecosistema Qaway Hub
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#191918]/70">
                Aprende a usar cada herramienta, ruta y dashboard con tutoriales guiados. De basico a avanzado, paso a paso.
              </p>
              {isPublicSiteMode ? (
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                  Consultar Academy <ArrowRight size={16} />
                </a>
              ) : (
                <Link to="/academy" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                  Ir a Academy <ArrowRight size={16} />
                </Link>
              )}
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