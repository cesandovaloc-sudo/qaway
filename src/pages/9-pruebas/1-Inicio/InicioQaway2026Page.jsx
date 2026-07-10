import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  Camera,
  Check,
  ChevronRight,
  Compass,
  GraduationCap,
  Menu,
  PenTool,
  Send,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import '@/pages/4-academy/academy.css'

const base = '/assets/pages/9-pruebas/inicio-qaway-2026/'
const displayFont = {
  fontFamily: "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif",
  fontStretch: 'condensed',
  fontWeight: 700,
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const growX = {
  hidden: { scaleX: 0, opacity: 0 },
  show: (delay = 0) => ({
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const primaryAreas = [
  {
    title: 'Estudio',
    description: 'Identidad, contenido y presencia digital con una dirección visual clara.',
    link: '/estudio',
    icon: PenTool,
  },
  {
    title: 'Sistemas digitales',
    description: 'Automatización, IA y herramientas conectadas para operar con más orden.',
    link: '/sistemas-digitales',
    icon: Workflow,
  },
  {
    title: 'Academy',
    description: 'Formación práctica para convertir herramientas nuevas en capacidades reales.',
    link: '/academy',
    icon: GraduationCap,
  },
]

const ecosystemAreas = [
  {
    title: 'Qaway Hub',
    description: 'Rutas guiadas, herramientas y módulos para construir paso a paso.',
    link: '/hub',
    icon: Boxes,
  },
  {
    title: 'Recursos',
    description: 'Plantillas, guías, prompts y materiales listos para aplicar.',
    link: '/recursos',
    icon: BookOpen,
  },
  {
    title: 'Blog',
    description: 'Análisis, tutoriales y tendencias para decidir con más criterio.',
    link: '/blog',
    icon: Compass,
  },
]

const process = [
  ['Entender', 'Partimos del contexto, no de una solución prefabricada.'],
  ['Ordenar', 'Convertimos ideas y necesidades en una ruta concreta.'],
  ['Construir', 'Diseñamos las piezas y conectamos lo que debe trabajar junto.'],
  ['Mejorar', 'Medimos, ajustamos y dejamos capacidad para seguir avanzando.'],
]

const heroCapabilities = [
  {
    icon: GraduationCap,
    title: 'Academy',
    description: 'Aprendizaje aplicado',
    link: '/academy',
    placement: 'left-6 bottom-28 w-[15.5rem]',
  },
  {
    icon: Workflow,
    title: 'Procesos',
    description: 'Flujos y automatizacion',
    link: '/sistemas-digitales/automatizacion',
    placement: '-left-10 top-24 w-[14.5rem]',
  },
  {
    icon: BrainCircuit,
    title: 'CRM',
    description: 'Relacion y seguimiento',
    link: '/hub/crm',
    placement: '-right-12 top-16 w-[14rem]',
  },
  {
    icon: Compass,
    title: 'Operacion',
    description: 'Orden para crecer',
    link: '/hub',
    placement: 'right-8 bottom-32 w-[14rem]',
  },
]

const brandNames = [
  { name: 'Mesa Selecta', style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: 'Andes Norte', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: '-0.04em' } },
  { name: 'Lima Forma', style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: 'Croma Patio', style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: '-0.03em' } },
  { name: 'Nativa Studio', style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, letterSpacing: '-0.02em' } },
  { name: 'Punto Claro', style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: 'Marea Capital', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: '-0.05em' } },
  { name: 'Casa Bruma', style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontWeight: 400, textTransform: 'none', letterSpacing: '-0.01em' } },
  { name: 'Senda Legal', style: { fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 600, letterSpacing: '-0.03em', fontStyle: 'italic' } },
  { name: 'Rumbo Vivo', style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: '-0.02em' } },
  { name: 'Altura Cafe', style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: 'Brava Textil', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: '-0.05em' } },
  { name: 'Nexo Salud', style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, letterSpacing: '-0.01em' } },
  { name: 'Tierra Uno', style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: 'Solar Finca', style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: '-0.02em' } },
  { name: 'Nodo Urbano', style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: '-0.04em' } },
  { name: 'Ayni Foods', style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontWeight: 400, textTransform: 'none', letterSpacing: '0' } },
  { name: 'Vertice Lab', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: '-0.04em' } },
]

function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ArrowLink({ to, children, light = false }) {
  const classes = `group inline-flex items-center gap-4 border-b pb-2 text-sm font-medium transition-colors ${
    light
      ? 'border-[#ff4b0b] text-white/78 hover:text-white'
      : 'border-[#ff4b0b] text-[#20201f]/72 hover:text-[#20201f]'
  }`

  return (
    <Link to={to} className={classes}>
      {children}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
    </Link>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ['Estudio', '/estudio'],
    ['Sistemas digitales', '/sistemas-digitales'],
    ['Academy', '/academy'],
    ['Recursos', '/recursos'],
  ]

  return (
    <header className="absolute inset-x-0 top-0 z-30 h-20 border-b border-[#20201f]/10 bg-[#f8f7f4]/84 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link to="/pruebas" className="text-xl font-bold tracking-[-0.065em] text-[#20201f]">
          Qaway <span className="text-[#ff4b0b]">Lab</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-10">
          {links.map(([label, href]) => (
            <Link key={label} to={href} className="text-[0.86rem] text-[#292927] transition-colors hover:text-[#ff4b0b]">
              {label}
            </Link>
          ))}
        </nav>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden min-h-12 rounded-none bg-[#ff4b0b] px-5 py-3 text-[0.84rem] font-bold text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] transition-colors hover:bg-[#df3900] active:translate-y-px sm:inline-flex"
        >
          Cuéntanos tu proyecto
        </a>

        <button
          type="button"
          aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="text-[#20201f] sm:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-b border-[#20201f]/10 bg-[#f8f7f4] px-6 py-5 sm:hidden"
          >
            <div className="flex flex-col">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-[#20201f]/10 py-3 text-sm text-[#292927] last:border-b-0"
                >
                  {label}
                </Link>
              ))}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex justify-center rounded-none bg-[#ff4b0b] px-5 py-3 text-sm font-bold text-white"
              >
                Cuéntanos tu proyecto
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden pt-20 text-[#20201f]"
      style={{
        background:
          'radial-gradient(circle at 76% 14%, rgba(255, 75, 11, 0.05), transparent 24rem), linear-gradient(135deg, #f8f7f4 0%, #efeeeb 100%)',
      }}
    >
      <Header />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.74%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.44%22/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[96rem] lg:grid-cols-[.95fr_1.05fr_.7fr]">
        <div className="relative flex min-h-[58vh] flex-col justify-center px-6 py-14 sm:min-h-[64vh] sm:px-10 lg:min-h-[38rem] lg:px-14 lg:py-16">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
            variants={fadeUp}
            custom={0}
            className="relative z-10"
          >
            <p className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.015em] text-[#73716d]">
              Estrategia, creatividad y tecnología
            </p>
            <h1
              className="max-w-[58rem] text-[clamp(4rem,6.7vw,7.75rem)] leading-[0.85] tracking-[-0.055em] text-[#20201f]"
              style={displayFont}
            >
              <span className="block">Ideas que toman forma.</span>
              <span className="block text-[#ff4b0b]">Sistemas que avanzan.</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.55] text-[#4e4d4a]">
              Construimos presencia, operación y aprendizaje digital para marcas, profesionales y equipos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[54px] items-center gap-3 bg-[#ff4b0b] px-7 py-4 text-[0.84rem] font-bold text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] transition-colors hover:bg-[#df3900] active:translate-y-px"
              >
                Empezar una conversación
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#ecosistema"
                className="inline-flex items-center gap-4 border-b-2 border-[#ff4b0b] pb-2 text-sm font-bold text-[#20201f] transition-colors hover:text-[#ff4b0b]"
              >
                Conocer el ecosistema
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[44vh] overflow-visible border-[#20201f]/10 sm:min-h-[52vh] lg:min-h-[44rem] lg:border-x"
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={`${base}hero-retrato-editorial.webp`}
              alt="Profesional creativo retratado con dirección editorial"
              className="absolute inset-0 h-full w-full object-cover object-[52%_18%] grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/12" />
          </div>

          <div className="absolute inset-0 z-10 hidden lg:block">
            {heroCapabilities.map(({ icon: Icon, title, description, link, placement }, index) => (
              <Link
                key={title}
                to={link}
                className={`group absolute ${placement} border border-[#ff4b0b]/50 bg-[#fbfaf8]/92 p-3 text-[#20201f] shadow-[0_24px_70px_rgba(32,32,31,0.16)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:border-[#ff4b0b] hover:bg-white`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center bg-[#ff4b0b] text-white shadow-[0_16px_34px_rgba(255,75,11,0.22)]">
                    <Icon size={22} strokeWidth={1.65} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em]">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-[#6d6b68]">
                      {description}
                    </span>
                  </span>
                </span>
                <span
                  className={`absolute h-px bg-[#ff4b0b]/80 ${
                    index % 2 === 0 ? '-right-10 top-1/2 w-10' : '-left-10 top-1/2 w-10'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="relative z-10 mt-[calc(44vh-1rem)] grid gap-2 px-4 pb-4 sm:mt-[calc(52vh-1rem)] sm:grid-cols-2 lg:hidden">
            {heroCapabilities.map(({ icon: Icon, title, description, link }) => (
              <Link
                key={title}
                to={link}
                className="flex items-center gap-3 border border-[#ff4b0b]/45 bg-[#fbfaf8]/95 p-3 text-[#20201f] shadow-[0_16px_45px_rgba(32,32,31,0.12)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#ff4b0b] text-white">
                  <Icon size={21} strokeWidth={1.65} />
                </span>
                <span>
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em]">{title}</span>
                  <span className="mt-1 block text-xs text-[#6d6b68]">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        <aside className="relative grid min-h-auto overflow-visible bg-[#f4f3f0] text-[#20201f] lg:min-h-[34rem]">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            custom={0.22}
            className="flex flex-col justify-center px-7 py-14 sm:px-10 lg:px-9"
          >
            <p className="mb-8 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Qaway Lab</p>
            <h2
              className="text-[clamp(1.75rem,4.2vw,3.2rem)] leading-[0.9] tracking-[-0.022em] text-balance"
              style={displayFont}
            >
              Un ecosistema para construir,
              <span className="block">ordenar y crecer<span className="text-[#ff4b0b]">.</span></span>
            </h2>
            <div className="mt-7 h-[3px] w-8 bg-[#ff4b0b]" />
            <p className="mt-6 text-sm leading-relaxed text-black/56">
              Unimos dirección visual, sistemas digitales, formación y herramientas en una misma ruta.
            </p>
          </motion.div>
        </aside>
      </div>
    </section>
  )
}

function BrandMarquee() {
  const track = [...brandNames, ...brandNames]

  return (
    <section className="relative overflow-hidden border-y border-[#ff4b0b]/20 bg-[#151514] py-8 text-white sm:py-10">
      <style>
        {`
          @keyframes qawayBrandMarquee {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }

          .qaway-brand-track {
            animation: qawayBrandMarquee 120s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .qaway-brand-track {
              animation: none;
              transform: none;
            }
          }
        `}
      </style>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#151514] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#151514] to-transparent" />
      <div className="mx-auto mb-5 flex max-w-[94rem] items-center justify-between gap-6 px-6 sm:px-10 lg:px-14">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Marcas que toman forma</p>
        <div className="hidden h-px flex-1 bg-white/10 sm:block" />
      </div>
      <div className="flex w-max qaway-brand-track">
        {track.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            className="mx-7 inline-flex items-center gap-5 whitespace-nowrap text-[clamp(1.35rem,2.6vw,2.95rem)] leading-none text-white/40"
            style={brand.style}
          >
            {brand.name}
            <span className="h-8 w-px bg-[#ff4b0b]" />
          </span>
        ))}
      </div>
    </section>
  )
}

function EcosystemPhoto() {
  return (
    <div className="group relative min-h-[34rem] overflow-visible border-[#20201f]/10 lg:min-h-[42rem]">
      <div
        className="absolute inset-0 overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_38px_92px_rgba(32,32,31,0.18)]"
        style={{ boxShadow: '0 24px 64px rgba(32, 32, 31, 0.10)' }}
      >
        <img
          src={`${base}equipo-colaborando.webp`}
          alt="Equipo multidisciplinario colaborando en un proyecto"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-white/8" />
        <div className="absolute inset-y-10 left-0 w-2 bg-[#ff4b0b]" />
      </div>
    </div>
  )
}

function EcosystemIntro() {
  return (
    <section id="ecosistema" className="bg-[#f4f3f0] px-6 py-18 text-[#20201f] sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">La visión completa</p>
            <h2
              className="text-[clamp(3.5rem,6vw,6.6rem)] uppercase leading-[0.88] tracking-[-0.022em]"
              style={displayFont}
            >
              Lo digital funciona mejor cuando <span className="text-[#ff4b0b]">todo se conecta.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/55 sm:text-lg">
              No trabajamos piezas aisladas. Diseñamos un sistema donde marca, procesos, conocimiento y herramientas se apoyan entre sí.
            </p>
          </div>

          <EcosystemPhoto />
        </Reveal>
      </div>
    </section>
  )
}

function PrimaryAreas() {
  return (
    <section className="bg-[#191918] px-6 py-20 text-white sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="mb-12 max-w-5xl">
          <p className="mb-5 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Tres puertas de entrada</p>
          <h2
            className="max-w-[13ch] text-[clamp(3.3rem,5.4vw,5.9rem)] uppercase leading-[0.86] tracking-[-0.03em]"
            style={displayFont}
          >
            Empieza por lo que hoy necesita avanzar<span className="text-[#ff4b0b]">.</span>
          </h2>
        </Reveal>

        <div className="grid border-t border-white/18 lg:grid-cols-[1.2fr_.9fr_.9fr]">
          {primaryAreas.map(({ title, description, link, icon: Icon }, index) => (
            <Reveal
              key={title}
              delay={index * 0.04}
              className={`group flex min-h-[26rem] flex-col justify-between rounded-[6px] border-b border-white/18 py-8 lg:border-b-0 lg:px-9 ${
                index ? 'lg:border-l' : ''
              } ${index === 0 ? 'lg:pl-0' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-white/28">0{index + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-[6px] border border-white/15 text-[#ff4b0b] transition-colors group-hover:bg-[#ff4b0b] group-hover:text-white">
                  <Icon size={21} strokeWidth={1.45} />
                </span>
              </div>
              <div>
                <h3 className="text-[clamp(2.7rem,4vw,4.8rem)] uppercase tracking-[-0.035em]" style={displayFont}>
                  {title}
                </h3>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">{description}</p>
                <div className="mt-8">
                  <ArrowLink to={link} light>
                    Explorar {title}
                  </ArrowLink>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function AcademyFeature() {
  return (
    <section className="grid min-h-[40rem] bg-[#f4f3f0] text-[#20201f] lg:grid-cols-[55%_45%]">
      <div className="relative min-h-[30rem] overflow-hidden">
        <img
          src={`${base}aprendizaje-aplicado.webp`}
          alt="Profesional aprendiendo y prototipando en un espacio de trabajo"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/18" />
      </div>

      <Reveal className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-14">
        <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff4b0b]">Aprendizaje aplicado</p>
        <h2
          className="text-[clamp(3rem,4.8vw,5.6rem)] uppercase leading-[0.88] tracking-[-0.022em]"
          style={displayFont}
        >
          <span className="text-[#ff4b0b]">Aprender</span> para aplicar mejor<span className="text-[#ff4b0b]">.</span>
        </h2>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-black/55">
          Cursos, talleres, asesorías y recursos para incorporar IA, sistemas y comunicación digital con criterio práctico.
        </p>
        <div className="mt-7 flex flex-wrap gap-7">
          <ArrowLink to="/academy">Conocer Academy</ArrowLink>
          <ArrowLink to="/recursos">Explorar recursos</ArrowLink>
        </div>
      </Reveal>
    </section>
  )
}

function ExtendedEcosystem() {
  return (
    <section className="bg-[#f4f3f0] px-6 py-20 text-[#20201f] sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="mb-7 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#ff4b0b]">C?mo trabajamos</p>
            <h2
              className="text-[clamp(4rem,7vw,7rem)] leading-[0.88] tracking-[-0.022em]"
              style={displayFont}
            >
              Claridad antes de <span className="text-[#ff4b0b]">construir.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-white/48">
            Cada proyecto cambia, pero la lógica se mantiene: entender, ordenar, construir y mejorar.
          </p>
        </Reveal>

        <div className="mt-16 grid border-t border-white/18 md:grid-cols-2 xl:grid-cols-4">
          {process.map(([title, description], index) => (
            <Reveal
              key={title}
              delay={index * 0.05}
              className={`flex min-h-72 flex-col justify-between rounded-[6px] border-b border-white/18 py-8 xl:border-b-0 xl:px-8 ${
                index ? 'xl:border-l' : ''
              } ${index === 0 ? 'xl:pl-0' : ''}`}
            >
              <span className="font-mono text-xs text-[#ff4b0b]">0{index + 1}</span>
              <div>
                <h3 className="text-4xl uppercase tracking-[-0.03em]" style={displayFont}>
                  {title}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/48">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function AcademyContactSection({ submitted, submitting, submitError, onSubmit, onReset }) {
  return (
    <div className="academy-page">
      <section id="formulario" className="academy-section academy-form-section">
        <Reveal className="academy-form-intro">
          <p className="academy-kicker">Contacto</p>
          <h2 style={displayFont}>Resuelve tus <span className="academy-title-emphasis">dudas</span><span className="academy-title-punct">.</span></h2>
          <p>Escríbenos para consultar detalles sobre los programas, metodologías o coordinar capacitación para tu equipo.</p>
          <div className="academy-form-points">
            <span><Check size={16} /> Respuesta en menos de 24 horas útiles</span>
            <span><Check size={16} /> Orientación sin compromiso</span>
            <span><Check size={16} /> Opciones personalizadas para empresas</span>
          </div>
        </Reveal>

        <Reveal>
        <form
          onSubmit={onSubmit}
          className="academy-interest-form"
        >
          {submitted ? (
            <div className="academy-form-success">
              <div><Check size={28} /></div>
              <h3>¡Consulta enviada!</h3>
              <p>Te responderemos lo antes posible para ayudarte a elegir tu siguiente paso.</p>
              <button type="button" onClick={onReset}>Enviar otro mensaje</button>
            </div>
          ) : (
            <>
              <div className="academy-field-row">
                <div className="academy-field">
                  <label htmlFor="academy-name">¿Cómo te llamas?</label>
                  <input
                    type="text"
                    id="academy-name"
                    name="name"
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="academy-field">
                  <label htmlFor="academy-email">Tu correo de contacto</label>
                  <input
                    type="email"
                    id="academy-email"
                    name="email"
                    required
                    placeholder="tucorreo@empresa.com"
                  />
                </div>
              </div>

              <div className="academy-field-row">
                <div className="academy-field">
                  <label htmlFor="academy-profile">¿A qué te dedicas?</label>
                  <select id="academy-profile" name="profile" required>
                    <option value="">Selecciona tu perfil</option>
                    <option value="Profesional / Consultor">Profesional / Consultor</option>
                    <option value="Emprendedor / Dueño de negocio">Emprendedor / Dueño de negocio</option>
                    <option value="Creador de contenido / Freelancer">Creador de contenido / Freelancer</option>
                    <option value="Equipo de empresa">Equipo de empresa</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="academy-field">
                  <label htmlFor="academy-interest">¿Qué tema o curso te interesa?</label>
                  <select id="academy-interest" name="interest" required>
                    <option value="">Selecciona un interés</option>
                    <option value="Identidad Visual con IA">Identidad Visual con IA</option>
                    <option value="WhatsApp Business para negocios">WhatsApp Business para negocios</option>
                    <option value="IA para equipos pequeños">IA para equipos pequeños</option>
                    <option value="Sistema de contenido con IA">Sistema de contenido con IA</option>
                    <option value="Workflows sin código">Workflows sin código</option>
                    <option value="Orientación general / Otro">Orientación general / Otro</option>
                  </select>
                </div>
              </div>

              <div className="academy-field">
                <label htmlFor="academy-message">Cuéntanos un poco más</label>
                <textarea
                  id="academy-message"
                  name="message"
                  rows="4"
                  placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver?"
                />
              </div>
              <button type="submit" className="academy-submit-button" disabled={submitting}>
                {submitting ? 'Enviando consulta...' : 'Solicitar orientación'}
                <Send size={17} />
              </button>
              {submitError && <p className="academy-form-error" role="alert">{submitError}</p>}
              <small>Usaremos esta información únicamente para responder tu consulta.</small>
            </>
          )}
        </form>
        </Reveal>
      </section>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#111111] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_.9fr_.9fr_.9fr]">
          <div>
            <Link to="/pruebas" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em]">
              Qaway <span className="text-[#ff4b0b]">Lab</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/56">
              Un ecosistema para construir marca, ordenar operación y activar aprendizaje con IA.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Áreas</p>
            <div className="grid gap-3 text-sm text-white/72">
              <Link to="/estudio" className="hover:text-white">Estudio</Link>
              <Link to="/sistemas-digitales" className="hover:text-white">Sistemas digitales</Link>
              <Link to="/academy" className="hover:text-white">Academy</Link>
              <Link to="/hub" className="hover:text-white">Qaway Hub</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Recursos</p>
            <div className="grid gap-3 text-sm text-white/72">
              <Link to="/recursos" className="hover:text-white">Recursos</Link>
              <Link to="/blog" className="hover:text-white">Blog</Link>
              <Link to="/landings" className="hover:text-white">Landings</Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</p>
            <div className="grid gap-3 text-sm text-white/72">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white">Escribir por WhatsApp</a>
              <span>Lima, Perú</span>
              <span>Atención remota</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/38 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Qaway Lab</span>
          <span className="inline-flex items-center gap-2 uppercase tracking-[0.16em]">
            <Check size={13} className="text-[#ff4b0b]" />
            Propuesta de Inicio
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function InicioQaway2026Page() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function submitInterest(event) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const lead = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim().toLowerCase(),
      profile: String(form.get('profile') || '').trim(),
      interest: String(form.get('interest') || '').trim(),
      message: String(form.get('message') || '').trim(),
    }

    try {
      const academyKey = import.meta.env.VITE_WEB3FORMS_ACADEMY_KEY || ''
      if (!academyKey.trim()) {
        throw new Error('El canal de recepción de Academy no está configurado.')
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: academyKey.trim(),
          subject: `Nueva consulta Academy: ${lead.interest || 'Orientación'}`,
          from_name: 'Qaway Lab Academy',
          name: lead.name,
          email: lead.email,
          profile: lead.profile,
          interest: lead.interest,
          message: lead.message || 'Sin mensaje adicional',
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No se pudo enviar la consulta.')
      }

      setSubmitted(true)
      formElement.reset()
    } catch (error) {
      console.error('Error al enviar consulta de Academy:', error)
      setSubmitError(error.message || 'No pudimos enviar tu consulta. Inténtalo nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#191918]">
        <Hero />
        <BrandMarquee />
        <EcosystemIntro />
        <PrimaryAreas />
        <AcademyFeature />
        <ExtendedEcosystem />
      </main>
      <AcademyContactSection
        submitted={submitted}
        submitting={submitting}
        submitError={submitError}
        onSubmit={submitInterest}
        onReset={() => setSubmitted(false)}
      />
      <Footer />
    </>
  )
}
