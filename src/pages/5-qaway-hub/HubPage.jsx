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
  PenSquare,
  Star,
  FolderKanban,
  Target,
  FileImage,
  Search,
  Instagram,
  CreditCard,
  Package,
  Bot,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { WHATSAPP_LINK } from '@/data/navigation'
import { isPublicSiteMode } from '@/config/siteVisibility'
import '@/pages/11-Proyectos/proyectos.css'

const routes = [
  {
    icon: Bot,
    title: 'Agentes de IA Responsable (Ley 31814)',
    description: 'Configuracion, entrenamiento y simulacion en vivo de Agentes IA Consultivos para WhatsApp y Web. Gobernanza etica en 3 capas, derivacion humana y anti-alucinacion.',
    path: '/hub/agentes',
    access: 'pro',
    badge: 'Ley 31814 & PAIR',
    category: 'Inteligencia Artificial',
    pillar: 'IA',
    tone: 'bg-indigo-600/10 text-indigo-600',
    preview: '/assets/hub-previews/preview-agentes.png',
    published: true,
  },
  {
    icon: Calendar,
    title: 'Qaway Agenda & Sistema de Citas',
    description: 'Software de reservas y calendario estilo Calendly: Agendamiento publico, gestion de horarios, recordatorios y panel de control de citas.',
    path: '/hub/agenda',
    access: 'pro',
    badge: 'Nuevo SaaS',
    category: 'Gestion & Productividad',
    pillar: 'Automatizacion',
    tone: 'bg-indigo-500/10 text-indigo-500',
    preview: '/assets/hub-previews/preview-agenda.png',
    published: true,
  },
  {
    icon: CreditCard,
    title: 'Qaway Pagos & Checkout Multi-metodo',
    description: 'Pasarela de pagos multi-metodo: Tarjeta Stripe, Yape, Plin, PagoEfectivo, transferencias, catalogo de productos y gestion de ordenes.',
    path: '/hub/pagos',
    access: 'pro',
    badge: 'Modulo Pagos',
    category: 'Comercio & Finanzas',
    pillar: 'Marketing',
    tone: 'bg-emerald-500/10 text-emerald-500',
    preview: '/assets/hub-previews/preview-pagos.png',
    published: true,
  },
  {
    icon: Package,
    title: 'Qaway Inventario & ERP Comercial',
    description: 'Sistema integral de gestion de productos, stock, almacenes, movimientos Kardex, captura con IA, facturacion y cotizaciones.',
    path: '/hub/inventario',
    access: 'pro',
    badge: 'SaaS ERP',
    category: 'Logistica & Almacenes',
    pillar: 'Automatizacion',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    preview: '/assets/hub-previews/preview-inventario.png',
    published: true,
  },
  {
    icon: Star,
    title: 'Qaway Academy (LMS Cursos & Certificaciones)',
    description: 'Plataforma educativa integral: Catalogo de cursos, reproductor de lecciones, tareas, quizzes, certificados, panel de estudiante y docente.',
    path: '/hub/academy',
    access: 'pro',
    badge: 'LMS Real',
    category: 'Educacion & Cursos',
    pillar: 'Creacion',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    preview: '/assets/hub-previews/preview-academy.png',
    published: true,
  },
  {
    icon: Sparkles,
    title: 'Creador de Contenido Modular (5 Skills)',
    description: 'Fabrica de contenidos con IA: Radar viral, Guiones con retencion medida, Matriz de hooks, Calendario 30 dias, Disenador de Carruseles, Blog y Posts.',
    path: '/hub/creador-contenido',
    access: 'pro',
    badge: 'Nuevo',
    category: 'Marketing & Creacion',
    pillar: 'Creacion',
    tone: 'bg-[#fe6612]/10 text-[#fe6612]',
    preview: '/assets/hub-previews/preview-creador.png',
    published: true,
  },
  {
    icon: FileImage,
    title: 'Optimizador de Imagenes WebP',
    description: 'Herramienta interactiva para comprimir y convertir imagenes PNG y JPG a WebP con hasta 95% de ahorro en tu navegador.',
    path: '/hub/optimizador-webp',
    access: 'free',
    badge: 'Gratis',
    category: 'Herramientas',
    pillar: 'Automatizacion',
    tone: 'bg-[#fe6612]/10 text-[#fe6612]',
    preview: '/assets/hub-previews/preview-inventario.png',
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
    pillar: 'Marketing',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    preview: '/assets/hub-previews/preview-creador.png',
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
    pillar: 'Automatizacion',
    tone: 'bg-[#fe6612]/10 text-[#fe6612]',
    preview: '/assets/hub-previews/preview-agenda.png',
    published: false,
  },
  {
    icon: PenSquare,
    title: 'Editor de Blog',
    description: 'Plataforma editorial para crear, estructurar y publicar articulos con categorias, portadas y CTAs en tiempo real.',
    path: '/hub/blog-editor',
    access: 'pro',
    badge: 'Listo',
    category: 'Herramientas',
    pillar: 'Creacion',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    preview: '/assets/hub-previews/preview-academy.png',
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
    pillar: 'IA',
    tone: 'bg-[#191918] text-white',
    preview: '/assets/hub-previews/preview-agentes.png',
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
    pillar: 'Marketing',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
    preview: '/assets/hub-previews/preview-pagos.png',
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
    pillar: 'Marketing',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
    preview: '/assets/hub-previews/preview-creador.png',
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
    pillar: 'Automatizacion',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
    preview: '/assets/hub-previews/preview-inventario.png',
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
    pillar: 'IA',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
    preview: '/assets/hub-previews/preview-agentes.png',
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
    pillar: 'Automatizacion',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
    preview: '/assets/hub-previews/preview-agenda.png',
    published: false,
  },
  {
    icon: BarChart3,
    title: 'Centro de Analitica & Graficos',
    description: 'Suite de metricas estilo PowerBI y Google Analytics con galeria Recharts completa y presets por industria.',
    path: '/hub/analytics',
    access: 'pro',
    badge: 'Pro',
    category: 'Herramientas',
    pillar: 'Marketing',
    tone: 'bg-[#0080FF]/10 text-[#0080FF]',
    preview: '/assets/hub-previews/preview-pagos.png',
    published: false,
  },
  {
    icon: Target,
    title: 'Marketing Studio OS (Revolut UI)',
    description: 'Estrategia y arquitectura: Buyer Persona (JTBD), Content Mapping Editorial, Auditoria POEM y Simulador de Funnel.',
    path: '/hub/marketing',
    access: 'pro',
    badge: 'v1.0',
    category: 'Herramientas',
    pillar: 'Marketing',
    tone: 'bg-[#0075FF]/10 text-[#0075FF]',
    preview: '/assets/hub-previews/preview-creador.png',
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
    pillar: 'Automatizacion',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
    preview: '/assets/hub-previews/preview-agenda.png',
    published: false,
  },
]

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

// 5 pilares de marca
const PILLARS = [
  { label: 'Todas',                 match: null },
  { label: 'Marketing',             match: 'Marketing' },
  { label: 'Automatizacion',        match: 'Automatizacion' },
  { label: 'IA',                    match: 'IA' },
  { label: 'Creacion de Contenido', match: 'Creacion' },
]

// Gama Arquitectónica con Presencia Visual: Tonos pasteles refinados y sedosos (no blancos)
// Garantiza que la tarjeta se distinga de inmediato sobre el fondo #f8f9fc de la página
const PILLAR_GRADIENTS = {
  // IA: Lavanda técnico / Slate frío sofisticado
  'IA': 'bg-[linear-gradient(135deg,#f1f0fb_0%,#e4e1f7_45%,#d5d0f3_100%)]',
  // Automatización: Menta / Sage técnico ultra limpio
  'Automatizacion': 'bg-[linear-gradient(135deg,#eef8f6_0%,#dcf1ec_45%,#cbeae3_100%)]',
  // Marketing: Arena cálida / Crema suave
  'Marketing': 'bg-[linear-gradient(135deg,#fdf6ec_0%,#f9ebd4_45%,#f3dec0_100%)]',
  // Creación de Contenido: Rosa perla / Muted Berry editorial
  'Creacion': 'bg-[linear-gradient(135deg,#faf0f4_0%,#f5dee8_45%,#eeccdc_100%)]',
  // Herramientas generales: Zinc cálido arquitectónico
  'Herramientas': 'bg-[linear-gradient(135deg,#f4f4f5_0%,#e4e4e7_45%,#d4d4d8_100%)]',
}

export default function HubPage() {
  useSetNavbarVariant('transparent')
  const [pillarFilter, setPillarFilter] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')

  const activeRoutes = routes.filter((route) => {
    if (isPublicSiteMode) return route.path === '/hub/blog-editor'
    return true
  })

  const filteredRoutes = activeRoutes.filter((route) => {
    const activePillar = PILLARS.find((p) => p.label === pillarFilter)
    const matchPillar =
      !activePillar?.match ||
      (route.pillar && route.pillar.includes(activePillar.match))
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      (route.title && route.title.toLowerCase().includes(q)) ||
      (route.description && route.description.toLowerCase().includes(q)) ||
      (route.category && route.category.toLowerCase().includes(q)) ||
      (route.badge && route.badge.toLowerCase().includes(q))
    return matchPillar && matchSearch
  })

  // Tarjeta con estilo calcado de Recursos: delimitación perimetral clara, gradiente sedoso, imagen flotante
  const FeaturedCard = ({ route }) => {
    const Icon = route.icon
    // Asignación de tono distintivo según el eje temático
    const gradient = PILLAR_GRADIENTS[route.pillar] || PILLAR_GRADIENTS['Herramientas']
    const hasPreview = Boolean(route.preview)

    return (
      <Link to={route.path} className="group block h-full">
        <motion.article
          className={`relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-[14px] border border-black/[0.06] p-7 sm:p-9 shadow-sm ${gradient}`}
          initial={false}
          whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Mockup vertical alto: Marco ultra aclarado casi imperceptible (border-black/[0.03]) y sin zoom jitter */}
          {hasPreview ? (
            <div className="absolute right-0 top-3 bottom-3 w-[48%] flex items-center">
              <div className="h-full w-full rounded-l-2xl bg-white p-1.5 shadow-xl border-y border-l border-black/[0.03] overflow-hidden">
                <img
                  src={route.preview}
                  alt={route.title}
                  className="h-full w-full rounded-l-xl object-cover object-left-top"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            /* Icono en marca de agua para las filas siguientes (FOTO 3) */
            <div className="absolute -right-8 top-1/2 flex h-52 w-52 -translate-y-1/2 rotate-2 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-[#191918]/25 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2 group-hover:rotate-0 group-hover:scale-[1.02]">
              <Icon className="h-24 w-24" strokeWidth={1.4} />
            </div>
          )}

          {/* Contenido de texto: max-w-[48%] para garantizar que nunca colisione con la imagen */}
          <div className="relative z-10 max-w-[48%]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#191918]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#191918]">
                {route.access === 'free' ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>Gratis</span>
                  </>
                ) : (
                  <>
                    <Star size={11} strokeWidth={3} />
                    <span>{route.badge || 'Pro'}</span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-semibold text-[#191918]/65 truncate">
                {route.category}
              </span>
            </div>

            <h3 className="text-[clamp(1.15rem,2vw,1.4rem)] font-bold leading-[1.22] text-[#191918] break-words">
              {route.title}
            </h3>
            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#191918]/70">
              {route.description}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#191918] transition-transform group-hover:translate-x-1">
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
      {/* HERO */}
      <section className="projects-hero border-b border-black/10">
        <div className="projects-shell">
          <motion.div
            className="projects-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs shadow-xs">
              <span>/ Hub</span>
            </div>

            <h1
              className="text-[clamp(2.4rem,4vw,3.4rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Qaway Hub<span className="text-white/70">.</span>
            </h1>

            <p className="text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Accede a rutas, paneles y herramientas internas para organizar la operacion digital de Qaway.
            </p>

            {/* Buscador: unificado a rounded-lg (estilo Blog) */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-lg border border-white/40 bg-white px-4 py-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.14)] transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="h-5 w-5 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar modulos, paneles o herramientas..."
                  className="w-full bg-transparent text-sm text-[#191918] outline-none placeholder:text-black/40 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-black/40 hover:text-[#fe6612]"
                  >
                    x
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ENCABEZADO STICKY EN SCROLL: Filtro de 5 Pilares anclado al tope con backdrop-blur limpio */}
      <div className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#f8f9fc]/95 py-3 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-[94rem] items-center justify-between px-6 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            {PILLARS.map((pillar) => {
              const isActive = pillarFilter === pillar.label
              return (
                <button
                  key={pillar.label}
                  type="button"
                  onClick={() => setPillarFilter(pillar.label)}
                  className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs sm:text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#191918] text-white shadow-sm'
                      : 'border border-black/10 bg-white text-[#191918]/80 hover:border-black/20 hover:text-[#191918]'
                  }`}
                >
                  {pillar.label}
                </button>
              )
            })}
          </div>

          <span className="hidden sm:block text-[11px] font-mono font-medium text-black/40">
            {filteredRoutes.length} herramientas
          </span>
        </div>
      </div>

      <section className="pb-12 pt-6 sm:pt-8 lg:pb-20 lg:pt-8">
        <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
          {filteredRoutes.length === 0 ? (
            <div className="my-16 flex flex-col items-center justify-center text-center">
              <p className="text-base font-bold text-[#191918]">No se encontraron herramientas</p>
              <p className="mt-1 text-sm text-[#191918]/60">Intenta con otro termino de busqueda o limpia los filtros.</p>
              <button
                type="button"
                onClick={() => { setPillarFilter('Todas'); setSearchQuery('') }}
                className="mt-4 rounded-full bg-[#fe6612] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e05508] transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          ) : pillarFilter === 'Todas' && !searchQuery ? (
            /* VISTA PRINCIPAL AGRUPADA POR EJE TEMÁTICO CON SUBTÍTULOS CLAROS */
            <div className="mb-16 space-y-12">
              {PILLARS.filter(p => p.match !== null).map((pillar) => {
                const routesInPillar = filteredRoutes.filter(r => r.pillar && r.pillar.includes(pillar.match))
                if (routesInPillar.length === 0) return null

                return (
                  <div key={pillar.label} className="space-y-4">
                    {/* Encabezado del Eje Temático */}
                    <div className="flex items-center gap-3 border-b border-black/[0.06] pb-3">
                      <div className="h-2 w-2 rounded-full bg-[#ff4b0b]" />
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#191918]" style={displayFont}>
                        {pillar.label.toUpperCase()}
                      </h2>
                      <span className="text-[11px] font-mono text-black/40">
                        ({routesInPillar.length})
                      </span>
                    </div>

                    {/* Grid del Eje */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {routesInPillar.map((route, idx) => (
                        <FeaturedCard key={route.title} route={route} idx={idx} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* VISTA FILTRADA DIRECTA */
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