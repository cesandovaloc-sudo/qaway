import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const routes = [
  {
    icon: FileImage,
    title: 'Optimizador de Imágenes WebP',
    description: 'Herramienta interactiva para comprimir y convertir imágenes PNG y JPG a WebP con hasta 95% de ahorro en tu navegador.',
    path: '/hub/optimizador-webp',
    access: 'free',
    badge: 'Gratis',
    category: 'Herramientas',
    featured: true,
  },
  {
    icon: FolderKanban,
    title: 'Gestor de Proyectos & Entregas',
    description: 'Trazabilidad y portal de cliente: ciclo de 6 hitos para Desarrollo Web, Branding, CRM y Marketing.',
    path: '/hub/gestor-proyectos',
    access: 'pro',
    badge: 'Pro',
    category: 'Product Management',
    featured: true,
  },
  {
    icon: PenSquare,
    title: 'Editor Interno de Blog',
    description: 'Herramienta interna para crear artículos con categoría real, portada, bloques y snippet listo para integración.',
    path: '/hub/blog-editor',
    access: 'pro',
    badge: 'Pro',
    category: 'Herramientas',
    featured: false,
  },
  {
    icon: Calendar,
    title: 'Consola WABA + CRM',
    description: 'Panel ejecutivo para campañas: integración WhatsApp API, payloads, checklist y pruebas E2E en un solo lugar.',
    path: '/hub/waba-crm',
    access: 'pro',
    badge: 'Destacado',
    category: 'Panel de control',
    featured: true,
  },
  {
    icon: MessageSquare,
    title: 'Consola CRM Comercial',
    description: 'Bandeja multiagente de WhatsApp, atribución en tiempo real de Meta Ads y analíticas estilo Power BI.',
    path: '/hub/crm',
    access: 'pro',
    badge: 'Nuevo',
    category: 'Panel de control',
    featured: true,
  },
  {
    icon: Route,
    title: 'Ruta Marca / Emprendimiento',
    description: 'Desde la idea hasta tu estructura digital básica. Naming, logo, identidad, redes, landing y captación.',
    path: '/hub/ruta-marca',
    access: 'free',
    badge: null,
    category: 'Rutas de Marca',
    featured: false,
  },
  {
    icon: Briefcase,
    title: 'Ruta Profesional / Oficina',
    description: 'Organización, reportes, dashboards, automatización y productividad para equipos y oficinas.',
    path: '/hub/ruta-profesional',
    access: 'free',
    badge: null,
    category: 'Ruta Profesional',
    featured: false,
  },
  {
    icon: FlaskConical,
    title: 'Ruta Incubadora',
    description: 'Acompañamiento para validar ideas, proyectos o negocios con herramientas y módulos progresivos.',
    path: '/hub/ruta-incubadora',
    access: 'free',
    badge: null,
    category: 'Rutas de Marca',
    featured: false,
  },
  {
    icon: Wrench,
    title: 'Herramientas Guiadas',
    description: 'Soluciones modulares paso a paso para construir, organizar y mejorar tu operación digital.',
    path: '/hub/herramientas',
    access: 'free',
    badge: null,
    category: 'Herramientas',
    featured: false,
  },
  {
    icon: BarChart3,
    title: 'Centro de Analítica & Gráficos',
    description: 'Suite de métricas estilo PowerBI y Google Analytics con galería Recharts completa y presets por industria.',
    path: '/hub/analytics',
    access: 'pro',
    badge: 'Pro',
    category: 'Herramientas',
    featured: false,
  },
  {
    icon: Target,
    title: 'Marketing Studio OS (Revolut UI)',
    description: 'Estrategia y arquitectura: Buyer Persona (JTBD), Content Mapping HubSpot, Auditoría POEM y Simulador de Funnel.',
    path: '/hub/marketing',
    access: 'pro',
    badge: 'v1.0',
    category: 'Herramientas',
    featured: false,
  },
  {
    icon: Kanban,
    title: 'Twenty Revenue OS (Pipeline CRM)',
    description: 'CRM y Pipeline visual estilo Twenty CRM: Vista Kanban, Tablas Relacionales, Atribución HubSpot y Drawer Lateral.',
    path: '/hub/marketing2',
    access: 'pro',
    badge: 'Twenty UI',
    category: 'Herramientas',
    featured: false,
  },
  {
    icon: Zap,
    title: 'Automatizaciones',
    description: 'Flujos automáticos y conectores para optimizar procesos repetitivos y ganar productividad.',
    path: '/hub/automatizaciones',
    access: 'free',
    badge: null,
    category: 'Herramientas',
    featured: false,
  },
]

const areas = [
  { icon: Route, title: 'Rutas de Marca', description: 'Construye y lanza tu presencia digital desde cero.' },
  { icon: Briefcase, title: 'Ruta Profesional', description: 'Organiza y optimiza tu operación diaria.' },
  { icon: Layers, title: 'Herramientas y Paneles', description: 'Soluciones modulares y dashboards de control.' },
]

export default function HubPage() {
  useSetNavbarVariant('dark')
  const [accessFilter, setAccessFilter] = useState('all') // 'all' | 'free' | 'pro'
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')

  // Extraer categorías únicas dinámicamente
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(routes.map((r) => r.category))).filter(Boolean)
    return ['Todas', ...cats]
  }, [])

  // Conteo dinámico por acceso
  const counts = useMemo(() => {
    return {
      all: routes.length,
      free: routes.filter((r) => r.access === 'free').length,
      pro: routes.filter((r) => r.access === 'pro').length,
    }
  }, [])

  // Filtrado reactivo integral
  const filteredRoutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return routes.filter((route) => {
      const matchAccess = accessFilter === 'all' || route.access === accessFilter
      const matchCat = categoryFilter === 'Todas' || route.category === categoryFilter
      const matchSearch =
        !q ||
        route.title.toLowerCase().includes(q) ||
        route.description.toLowerCase().includes(q) ||
        route.category.toLowerCase().includes(q) ||
        (route.badge && route.badge.toLowerCase().includes(q))
      return matchAccess && matchCat && matchSearch
    })
  }, [accessFilter, categoryFilter, searchQuery])

  const featuredList = filteredRoutes.filter((r) => r.featured)
  const regularList = filteredRoutes.filter((r) => !r.featured)

  return (
    <div className="relative min-h-screen bg-[#090a0d] text-white selection:bg-[#fe6612] selection:text-white">
      {/* ========================================================================= */}
      {/* ATMÓSFERA DARK LUXURY (DIFUMINADOS ULTRA-PREMIUM SIN IA BARATA) */}
      {/* ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Iluminación difusa superior central */}
        <div
          className="absolute -top-[20%] left-1/2 h-[750px] w-[1100px] -translate-x-1/2 rounded-full opacity-60 blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(254, 102, 18, 0.16) 0%, rgba(30, 34, 44, 0.45) 45%, transparent 75%)',
          }}
        />

        {/* Halo lateral frío tenue */}
        <div
          className="absolute top-[35%] -right-[15%] h-[600px] w-[600px] rounded-full opacity-30 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(20, 24, 33, 0.3) 50%, transparent 75%)',
          }}
        />

        {/* Micro-rejilla geométrica ultra sutil */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Viñeta perimetral de contraste */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#090a0d]/90" />
      </div>

      {/* ========================================================================= */}
      {/* HERO PRINCIPAL */}
      {/* ========================================================================= */}
      <section className="relative z-10 border-b border-white/10 pt-[148px] pb-[48px]">
        <div className="mx-auto w-[min(100%-48px,1240px)]">
          <motion.div
            className="mx-auto flex max-w-[840px] flex-col items-center text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Kicker Cápsula Translúcida con micro-resplandor */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fe6612] shadow-[0_0_8px_#fe6612]" />
              <span>/ Qaway Hub · Ecosistema Digital</span>
            </div>

            {/* Título Principal */}
            <h1
              className="mb-4 text-[clamp(2.4rem,4.5vw,3.6rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white text-balance"
              style={{ fontWeight: 800 }}
            >
              Qaway Hub<span className="text-[#fe6612]">.</span>
            </h1>

            {/* Bajada Editorial */}
            <p className="mb-8 max-w-2xl text-base font-normal leading-relaxed text-zinc-300/90 text-balance sm:text-lg">
              Accede a rutas de marca, herramientas interactivas y consolas de gestión para organizar, acelerar y escalar la operación de tu negocio.
            </p>

            {/* ===================================================================== */}
            {/* BUSCADOR DARK GLASS INTEGRADO */}
            {/* ===================================================================== */}
            <div className="w-full max-w-xl">
              <div className="group flex items-center gap-3 rounded-[12px] border border-white/15 bg-[#12141a]/90 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all focus-within:border-[#fe6612] focus-within:ring-2 focus-within:ring-[#fe6612]/20">
                <Search className="h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-[#fe6612]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por herramienta, temática o palabra clave..."
                  className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="rounded-full bg-white/10 p-1 text-xs font-bold text-zinc-400 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 3 Tarjetas de Áreas / Resumen bajo el buscador */}
            <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
              {areas.map((area) => {
                const Icon = area.icon
                return (
                  <div
                    key={area.title}
                    className="flex items-center gap-3.5 rounded-[12px] border border-white/8 bg-white/[0.03] p-4 text-left backdrop-blur-sm transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#fe6612]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-white">{area.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{area.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE FILTROS: NIVEL 1 (ACCESO: TODOS / GRATIS / PRO) + NIVEL 2 (TEMÁTICA) */}
      {/* ========================================================================= */}
      <div className="sticky top-[72px] z-30 border-b border-white/10 bg-[#090a0d]/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-[min(100%-48px,1240px)] flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          
          {/* NIVEL 1: FILTRO DE ACCESO (PÍLDORAS PRINCIPALES) */}
          <div className="flex items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hidden sm:inline-block">
              Acceso:
            </span>
            <div className="inline-flex rounded-[10px] border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setAccessFilter('all')}
                className={`flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition-all ${
                  accessFilter === 'all'
                    ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Todos</span>
                <span className="rounded-full bg-black/25 px-1.5 py-0.2 text-[10px] font-semibold">{counts.all}</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter('free')}
                className={`flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition-all ${
                  accessFilter === 'free'
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-zinc-400 hover:text-emerald-400'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Gratuitas</span>
                <span className="rounded-full bg-black/25 px-1.5 py-0.2 text-[10px] font-semibold">{counts.free}</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter('pro')}
                className={`flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition-all ${
                  accessFilter === 'pro'
                    ? 'bg-gradient-to-r from-[#fe6612] to-[#ff8533] text-white shadow-sm shadow-[#fe6612]/30'
                    : 'text-zinc-400 hover:text-[#fe6612]'
                }`}
              >
                <Sparkles size={12} className={accessFilter === 'pro' ? 'text-white' : 'text-[#fe6612]'} />
                <span>Suscripción Pro</span>
                <span className="rounded-full bg-black/25 px-1.5 py-0.2 text-[10px] font-semibold">{counts.pro}</span>
              </button>
            </div>
          </div>

          {/* NIVEL 2: FILTRO POR TEMÁTICA (SCROLL HORIZONTAL) */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-none lg:justify-end lg:pb-0">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hidden xl:inline-block">
              Temática:
            </span>
            {uniqueCategories.map((cat) => {
              const isActive = categoryFilter === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border border-[#fe6612]/60 bg-[#fe6612]/15 text-[#fe6612]'
                      : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTENIDO PRINCIPAL: MÓDULOS FILTRADOS */}
      {/* ========================================================================= */}
      <main className="relative z-10 py-12 lg:py-16">
        <div className="mx-auto w-[min(100%-48px,1240px)]">

          {/* Estado sin resultados */}
          {filteredRoutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12141a]/60 py-16 text-center">
              <Search className="mb-3 h-10 w-10 text-zinc-600" />
              <h3 className="text-lg font-bold text-white">No se encontraron herramientas</h3>
              <p className="mt-1 text-sm text-zinc-400">Intenta cambiar los filtros de acceso o el término de búsqueda.</p>
              <button
                type="button"
                onClick={() => {
                  setAccessFilter('all')
                  setCategoryFilter('Todas')
                  setSearchQuery('')
                }}
                className="mt-5 rounded-lg bg-[#fe6612] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e0550a]"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <>
              {/* BLOQUE 1: DESTACADOS (SI APLICA) */}
              {featuredList.length > 0 && !searchQuery && (
                <div className="mb-14">
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#fe6612] shadow-[0_0_8px_#fe6612]" />
                      Herramientas destacadas
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {featuredList.map((route, idx) => {
                      const Icon = route.icon
                      const isPro = route.access === 'pro'
                      return (
                        <Link to={route.path} key={route.title} className="group block">
                          <motion.article
                            className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[16px] border border-white/10 bg-gradient-to-b from-[#161821] to-[#101219] p-7 transition-all duration-300 hover:border-[#fe6612]/50 hover:shadow-[0_12px_40px_rgba(254,102,18,0.12)]"
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                          >
                            <div className="absolute -right-6 -top-6 flex h-44 w-44 items-center justify-center rounded-full bg-white/[0.02] text-white/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:text-[#fe6612]/10">
                              <Icon className="h-28 w-28" strokeWidth={1} />
                            </div>

                            <div className="relative z-10 flex items-start justify-between gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[#fe6612] shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <Icon size={22} />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                  {route.category}
                                </span>
                                {isPro ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#fe6612]/40 bg-[#fe6612]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#fe6612]">
                                    <Sparkles size={11} /> Pro
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    <CheckCircle2 size={11} /> Gratis
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="relative z-10 mt-6">
                              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-[#fe6612]">
                                {route.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{route.description}</p>
                            </div>

                            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors group-hover:text-white">
                              <span>Abrir módulo</span>
                              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#fe6612]" />
                            </div>
                          </motion.article>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* BLOQUE 2: CATÁLOGO COMPLETO DE MÓDULOS */}
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
                    {searchQuery ? 'Resultados de búsqueda' : 'Todos los módulos & herramientas'}
                  </h2>
                  <span className="text-xs font-semibold text-zinc-500">
                    {filteredRoutes.length} disponible{filteredRoutes.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredRoutes.map((route, idx) => {
                    const Icon = route.icon
                    const isPro = route.access === 'pro'
                    return (
                      <motion.div
                        key={route.title}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.2) }}
                      >
                        <Link
                          to={route.path}
                          className="group flex h-full flex-col justify-between rounded-[14px] border border-white/10 bg-[#12141a]/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#fe6612]/50 hover:bg-[#161822] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                        >
                          <div>
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors group-hover:border-[#fe6612]/40 group-hover:bg-[#fe6612]/10 group-hover:text-[#fe6612]">
                                <Icon size={20} />
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                {isPro ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#fe6612]/30 bg-[#fe6612]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#fe6612]">
                                    <Sparkles size={10} /> Pro
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                    Gratis
                                  </span>
                                )}
                                <span className="text-[10px] font-medium text-zinc-500">{route.category}</span>
                              </div>
                            </div>

                            <h3 className="text-[15px] font-bold leading-snug text-white transition-colors group-hover:text-[#fe6612]">
                              {route.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{route.description}</p>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3.5 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-white">
                            <span>Ingresar</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:text-[#fe6612]" />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* BANNER INFORMATIVO ACADEMY */}
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[16px] border border-white/10 bg-gradient-to-r from-[#161821] via-[#12141a] to-[#19151c] p-8 sm:p-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fe6612]/30 bg-[#fe6612]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#fe6612]">
                <Compass size={12} /> Academia & Tutoriales
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Aprende a dominar cada herramienta del Hub
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Accede a guías paso a paso, flujos de automatización y documentación para aprovechar al máximo las consolas y módulos.
              </p>
            </div>
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 rounded-xl bg-[#fe6612] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#fe6612]/20 transition-all hover:bg-[#e0550a] hover:shadow-[#fe6612]/30"
            >
              <span>Explorar Academy</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}