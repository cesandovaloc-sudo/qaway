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
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const routes = [
  {
    icon: PenSquare,
    title: 'Editor Interno de Blog',
    description: 'Herramienta interna para crear articulos con categoria real, portada, bloques y snippet listo para integracion.',
    path: '/hub/blog-editor',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  },
  {
    icon: Calendar,
    title: 'Consola WABA + CRM',
    description: 'Panel ejecutivo para campana: integracion WhatsApp API, payloads, checklist y pruebas E2E en un solo lugar.',
    path: '/hub/waba-crm',
    badge: 'Destacado',
    category: 'Panel de control',
    tone: 'bg-[#191918] text-white',
  },
  {
    icon: MessageSquare,
    title: 'Consola CRM Comercial',
    description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real de Meta Ads y analiticas estilo Power BI.',
    path: '/hub/crm',
    badge: 'Nuevo',
    category: 'Panel de control',
    tone: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  },
  {
    icon: Route,
    title: 'Ruta Marca / Emprendimiento',
    description: 'Desde la idea hasta tu estructura digital basica. Naming, logo, identidad, redes, landing y captacion.',
    path: '/hub/ruta-marca',
    badge: null,
    category: 'Rutas de Marca',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: Briefcase,
    title: 'Ruta Profesional / Oficina',
    description: 'Organizacion, reportes, dashboards, automatizacion y productividad para equipos y oficinas.',
    path: '/hub/ruta-profesional',
    badge: null,
    category: 'Ruta Profesional',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: FlaskConical,
    title: 'Ruta Incubadora',
    description: 'Acompanamiento para validar ideas, proyectos o negocios con herramientas y modulos progresivos.',
    path: '/hub/ruta-incubadora',
    badge: null,
    category: 'Rutas de Marca',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: Wrench,
    title: 'Herramientas Guiadas',
    description: 'Soluciones modulares paso a paso para construir, organizar y mejorar tu operacion digital.',
    path: '/hub/herramientas',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: BarChart3,
    title: 'Dashboards',
    description: 'Paneles de control para medir, analizar y optimizar tu presencia y operacion digital.',
    path: '/hub/dashboards',
    badge: null,
    category: 'Herramientas',
    tone: 'bg-[#191918]/5 text-[#191918]/70',
  },
  {
    icon: Zap,
    title: 'Automatizaciones',
    description: 'Flujos automaticos y conectores para optimizar procesos repetitivos y ganar productividad.',
    path: '/hub/automatizaciones',
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
  useSetNavbarVariant('light')

  const featured = routes.filter((route) => route.badge)
  const regularRoutes = routes.filter((route) => !route.badge)

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
        <Link to={route.path} className="group flex h-full flex-col justify-between overflow-hidden rounded-md border border-black/10 bg-white p-5 transition-all hover:border-[#ff4b0b]/40 hover:shadow-lg">
          <div>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-black/10 bg-[#f2f1ef] text-[#191918]/55 transition-colors group-hover:border-[#ff4b0b]/30 group-hover:bg-[#ff4b0b]/10 group-hover:text-[#ff4b0b]">
                <Icon size={20} />
              </div>
              <span className={`rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${route.tone}`}>
                {route.category}
              </span>
            </div>
            <h3 className="text-[15px] font-bold leading-snug text-[#191918] transition-colors group-hover:text-[#ff4b0b]">
              {route.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-black/60">{route.description}</p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs font-bold uppercase tracking-widest text-[#191918] transition-colors group-hover:text-[#ff4b0b]">
            <span>Abrir</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f1ef] selection:bg-[#ff4b0b] selection:text-white">
      <section className="relative z-20 overflow-hidden border-b border-black/10 bg-[#f5f5f4] pb-16 pt-28 text-[#191918] sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-[#f5f5f4]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7),transparent_70%)]" />
          <div
            className="absolute bottom-0 right-0 top-0 w-[42%] bg-[#1a1918] shadow-2xl transition-all duration-300 md:w-[34%] lg:w-[28%]"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:55px_75px] opacity-[0.14]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
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
              {routes.length} modulos <ArrowRight size={16} />
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