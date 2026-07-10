import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  BrainCircuit,
  Brush,
  Check,
  CircleUserRound,
  Clock3,
  Compass,
  Cpu,
  GraduationCap,
  Image as ImageIcon,
  MessageCircle,
  PenTool,
  ScanSearch,
  Send,
  Settings,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import '@/pages/4-academy/academy.css'
import { supabase } from '@/config/supabase'

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

const heroCapabilities = [
  {
    icon: PenTool,
    title: 'Estudio',
    description: 'Identidad y presencia',
    link: '#estudio',
    placement: 'left-6 bottom-28 w-[15.5rem]',
  },
  {
    icon: Workflow,
    title: 'Sistemas',
    description: 'Automatización y procesos',
    link: '#sistemas',
    placement: '-left-10 top-24 w-[14.5rem]',
  },
  {
    icon: GraduationCap,
    title: 'Academy',
    description: 'Cursos y formación',
    link: '#academy',
    placement: '-right-12 top-16 w-[14rem]',
  },
  {
    icon: MessageCircle,
    title: 'Contacto',
    description: 'Resolver dudas',
    link: '#formulario',
    placement: 'right-8 bottom-32 w-[14rem]',
  },
]

const brandNames = [
  { name: 'Mesa Selecta', style: { fontFamily: "'The Seasons', 'Georgia', 'Times New Roman', serif", fontWeight: 400 } },
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

function ArrowLink({ to, children, light = false, newTab = false }) {
  const classes = `group inline-flex items-center gap-4 border-b pb-2 text-sm font-medium transition-colors ${
    light
      ? 'border-[#ff4b0b] text-white/78 hover:text-white'
      : 'border-[#ff4b0b] text-[#20201f]/72 hover:text-[#20201f]'
  }`

  if (newTab) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
      </a>
    )
  }

  return (
    <Link to={to} className={classes}>
      {children}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
    </Link>
  )
}

function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden pt-20 text-[#20201f]"
      style={{
        background:
          'radial-gradient(circle at 76% 14%, rgba(255, 75, 11, 0.05), transparent 24rem), linear-gradient(135deg, #f8f9f7 0%, #efeeeb 100%)',
      }}
    >
      <Navbar variant="light" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.74%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.44%22/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[96rem] lg:grid-cols-[.95fr_1.05fr_.7fr]">
        <div className="relative flex flex-col justify-center bg-[#f8f9f7] px-6 py-10 sm:px-10 lg:min-h-[28rem] lg:justify-center lg:py-10 lg:px-10 before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-[50vw] before:bg-[#f8f9f7] before:content-['']">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
            variants={fadeUp}
            custom={0}
            className="relative z-10"
          >
            <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.015em] text-[#73716d]">
              Estrategia, creatividad y tecnología
            </p>
            <h1
              className="max-w-[58rem] text-[clamp(3.2rem,5.5vw,6.5rem)] leading-[0.82] tracking-[-0.055em] text-[#20201f]"
              style={displayFont}
            >
              <span className="block">Ideas que toman forma.</span>
              <span className="block text-[#ff4b0b]">Sistemas que avanzan.</span>
            </h1>
            <p className="mt-4 max-w-[34rem] text-[clamp(0.88rem,1vw,1rem)] leading-[1.5] text-[#4e4d4a]">
              Construimos presencia, operación y aprendizaje digital para marcas, profesionales y equipos.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[46px] items-center gap-2.5 bg-[#ff4b0b] px-6 py-3 text-[0.82rem] font-bold text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] transition-colors hover:bg-[#df3900] active:translate-y-px"
              >
                Empezar una conversación
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#primary-areas"
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
          className="relative min-h-[40vh] overflow-visible border-[#20201f]/10 lg:min-h-[30rem] lg:border-x"
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
              <a
                key={title}
                href={link}
                className={`group absolute ${placement} border border-[#ff4b0b]/50 bg-[#fbfaf8]/92 p-3 text-[#20201f] shadow-[0_24px_70px_rgba(32,32,31,0.16)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:border-[#ff4b0b] hover:bg-white`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center bg-[#ff4b0b] text-white shadow-[0_16px_34px_rgba(255,75,11,0.22)]">
                    <Icon size={22} strokeWidth={1.65} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#8b8c88]">
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
              </a>
            ))}
          </div>

          <div className="relative z-10 mt-[calc(44vh-1rem)] grid gap-2 px-4 pb-4 sm:mt-[calc(52vh-1rem)] sm:grid-cols-2 lg:hidden">
            {heroCapabilities.map(({ icon: Icon, title, description, link }) => (
              <a
                key={title}
                href={link}
                className="flex items-center gap-3 border border-[#ff4b0b]/45 bg-[#fbfaf8]/95 p-3 text-[#20201f] shadow-[0_16px_45px_rgba(32,32,31,0.12)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center bg-[#ff4b0b] text-white">
                  <Icon size={21} strokeWidth={1.65} />
                </span>
                <span>
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#8b8c88]">{title}</span>
                  <span className="mt-1 block text-xs text-[#6d6b68]">{description}</span>
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        <aside className="relative grid min-h-auto overflow-visible bg-[#f8f9f7] text-[#20201f] lg:min-h-[26rem] after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[50vw] after:bg-[#f8f9f7] after:content-['']">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            custom={0.22}
            className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-9"
          >
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Qaway Lab</p>
            <h2
              className="text-[clamp(1.4rem,3.8vw,2.5rem)] leading-[0.9] tracking-[-0.022em] text-balance"
              style={displayFont}
            >
              Un ecosistema para construir,
              <span className="block">ordenar y crecer<span className="text-[#ff4b0b]">.</span></span>
            </h2>
            <div className="mt-5 h-[3px] w-8 bg-[#ff4b0b]" />
            <p className="mt-4 text-sm leading-relaxed text-black/56">
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
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Marcas que toman forma</p>
        <div className="hidden h-px flex-1 bg-white/10 sm:block" />
      </div>
      <div className="flex w-max qaway-brand-track">
        {track.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            className="mx-7 inline-flex items-center gap-5 whitespace-nowrap text-[clamp(0.95rem,2.2vw,2.35rem)] leading-none text-white/30"
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
    <section id="ecosistema" className="bg-[#f8f9f7] px-6 py-18 text-[#20201f] sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">La visión completa</p>
            <h2
              className="text-[clamp(3.3rem,5.8vw,6.4rem)] uppercase leading-[0.88] tracking-[-0.022em]"
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

const VLAB = '/assets/pages/1-inicio'

const estudioServices = [
  { title: 'Branding Digital', icon: Brush, image: `${VLAB}/inicio-branding-hospitality-moodboard.webp` },
  { title: 'Contenido Visual', icon: ImageIcon, image: `${VLAB}/inicio-servicio-contenido.webp` },
  { title: 'Presencia Profesional', icon: CircleUserRound, image: `${VLAB}/estudio_portada_identidad_ejecutiva.webp` },
  { title: 'Estrategia Digital', icon: ScanSearch, image: `${VLAB}/inicio-servicio-estrategia.webp` },
]

function EstudioSection() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const activeService = estudioServices[active]

  return (
    <section id="estudio" className="relative flex flex-col justify-center min-h-[100dvh] bg-[#f8f9f7] px-6 py-12 text-[#20201f] sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[96rem]">
        <Reveal className="mb-6 grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div>
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
                Dirección visual y contenido
              </p>
              <h2
                className="text-[clamp(3.6rem,5.3vw,6rem)] leading-[0.81] tracking-[-0.08em]"
                style={displayFont}
              >
                Una Marca que se ve,<br /><span className="text-[#ff4b0b]">Se Reconoce.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-black/55">
              Construimos dirección visual, contenido y presencia digital con un método híbrido entre criterio humano y herramientas de IA.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-[42vh]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeService.title}
                src={activeService.image}
                alt={activeService.title}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 drop-shadow-lg">
              {activeService.title}
            </span>
          </div>
        </Reveal>

        <div className="grid min-h-0 grid-cols-2 content-stretch gap-2 sm:gap-3">
          {estudioServices.map(({ title, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => setActive(index)}
                className={`group flex h-full w-full items-center gap-4 border px-5 py-4 text-left transition-all duration-300 sm:px-6 sm:py-5 ${
                  active === index
                    ? 'border-[#ff4b0b] bg-white shadow-[0_4px_16px_rgba(255,75,11,0.08)]'
                    : 'border-black/10 bg-white/40 hover:bg-white hover:border-[#ff4b0b]/30'
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center transition-colors duration-300 ${
                  active === index
                    ? 'bg-[#ff4b0b] text-white shadow-[0_4px_12px_rgba(255,75,11,0.18)]'
                    : 'border border-black/10 text-[#20201f] group-hover:border-[#ff4b0b]/30 group-hover:text-[#ff4b0b]'
                }`}>
                  <Icon size={17} strokeWidth={1.5} />
                </span>
                <span className={`text-sm font-bold uppercase tracking-[-0.01em] leading-tight transition-colors ${
                  active === index ? 'text-[#ff4b0b]' : 'text-[#20201f]'
                }`}>
                  {title}
                </span>
              </button>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-3 flex items-center justify-between border-t border-black/10 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-[#ff4b0b]/30 text-[#ff4b0b]">
              <Sparkles size={15} strokeWidth={1.5} />
            </span>
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.06em]">Consultoría Estratégica</span>
              <span className="ml-3 hidden text-xs text-black/40 lg:inline">Diagnóstico, metodología y plan con criterio humano + IA</span>
            </div>
          </div>
          <ArrowLink to="/estudio">Ir al estudio</ArrowLink>
        </Reveal>
      </div>
    </section>
  )
}

function PrimaryAreas() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="primary-areas" className="bg-[#191918] px-6 py-18 text-white sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="mb-12 lg:mb-16">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Tres puertas de entrada</p>
          <h2
            className="text-[clamp(3.3rem,5.4vw,5.9rem)] leading-[0.86] tracking-[-0.03em]"
            style={{ ...displayFont, fontWeight: 680 }}
          >
            <span className="text-[#8b8c88]">Empieza por lo que Hoy</span><br />
            <span className="text-white">Necesitas Avanzar.</span>
          </h2>
        </Reveal>

        <div className="grid border-t border-white/18 lg:grid-cols-3">
          {primaryAreas.map(({ title, description, link, icon: Icon }, index) => {
            const dir = index === 0 ? { x: -50 } : index === 1 ? { y: 50 } : { x: 50 }
            return (
              <motion.div
                key={title}
                initial={reduceMotion ? false : { opacity: 0, ...dir }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col overflow-hidden border-b border-white/18 py-6 transition-all duration-500 lg:border-b-0 lg:px-12 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,75,11,0.1),inset_0_0_0_1px_rgba(255,75,11,0.25)] ${
                  index ? 'lg:border-l' : ''
                } ${index === 0 ? 'lg:pl-12' : ''}`}
              >
<span className="pointer-events-none absolute -top-6 left-4 select-none text-[10rem] font-bold leading-none text-white/[0.04]">
  0{index + 1}
</span>
<div className="relative mb-10 flex justify-end">
                  <span className="grid h-12 w-12 place-items-center rounded-[6px] border border-white/15 text-[#ff4b0b] transition-all duration-500 group-hover:border-[#ff4b0b] group-hover:bg-[#ff4b0b] group-hover:text-white group-hover:shadow-[0_0_24px_rgba(255,75,11,0.25)]">
                    <Icon size={21} strokeWidth={1.45} />
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col justify-end pt-[3.25rem]">
                  <h3 className="text-[clamp(1.8rem,2.8vw,3.6rem)] uppercase leading-[0.85] tracking-[-0.035em]" style={displayFont}>
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">{description}</p>
                  <div className="mt-2">
                    <ArrowLink to={link} light newTab>
                      Explorar {title}
                    </ArrowLink>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const visualDeck = [
  {
    title: 'Identificar lo repetitivo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero1.webp',
    className: 'left-0 top-0 w-[60%] z-10',
    rotation: -4,
    yPath: [0, -5, 0],
    duration: 4.5,
  },
  {
    title: 'Automatización interna',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero2.webp',
    className: 'left-[50%] top-[25%] w-[60%] z-20',
    rotation: 2,
    yPath: [2, -3, 2],
    duration: 5.8,
  },
  {
    title: 'El proceso ya corre solo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero3.webp',
    className: 'left-[15%] bottom-0 w-[60%] z-30',
    rotation: 0,
    yPath: [-2, 2, -2],
    duration: 5.2,
  },
]

function OpsImageStage({ reduceMotion }) {
  return (
    <div className="relative hidden lg:block">
      <div className="relative h-[620px]">
        {visualDeck.map((image, idx) => (
          <motion.figure
            key={image.title}
            initial={reduceMotion ? false : { opacity: 0, y: 35, rotate: image.rotation }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: image.rotation }}
            viewport={{ once: true, amount: 0.15 }}
            transition={
              reduceMotion ? undefined : {
                duration: 0.85,
                delay: 0.2 + idx * 0.45,
                ease: [0.22, 1, 0.36, 1]
              }
            }
            className={`absolute transform-gpu will-change-transform ${image.className} ${
              idx === 2 ? 'academy-ops-solution' : ''
            }`}
          >
            <div className="relative overflow-hidden">
              <img
                src={image.src}
                alt={image.title}
                className="h-[260px] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
            </div>
          </motion.figure>
        ))}

        <motion.div
          animate={reduceMotion ? undefined : { x: ['-20%', '120%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[#ff4b0b] to-transparent opacity-50"
        />
      </div>
    </div>
  )
}

const sistemasSubsections = [
  {
    icon: Settings,
    title: 'Automatización administrativa',
    description: 'Crea facturas, registra gastos, archiva documentos y gestiona correos de forma automática.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards operativos',
    description: 'Paneles que muestran lo que antes estaba disperso, con indicadores y reportes para controlar avance.',
  },
  {
    icon: CircleUserRound,
    title: 'CRM y seguimiento comercial',
    description: 'Gestiona clientes, oportunidades y seguimiento comercial desde un solo lugar.',
  },
  {
    icon: Bot,
    title: 'Agentes para atención y soporte',
    description: 'Agentes que responden, clasifican y resuelven consultas con criterio operativo.',
  },
  {
    icon: PenTool,
    title: 'Sistemas de contenido con IA',
    description: 'Crea, gestiona y distribuye contenido asistido por inteligencia artificial.',
  },
  {
    icon: BookOpen,
    title: 'Procesos internos documentados',
    description: 'Documenta, estandariza y mejora tus procesos operativos internos.',
  },
]

function SistemasDigitalesSection() {
  const reduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(null)

  const toggle = (i) => setExpanded(expanded === i ? null : i)

  return (
    <section id="sistemas" className="relative flex flex-col justify-center min-h-[100dvh] bg-[#f0f2ee] px-6 py-10 text-[#20201f] sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
                Sistema completo
              </p>
              <h2
                className="text-[clamp(3.6rem,5.3vw,6rem)] leading-[0.87] tracking-[-0.055em]"
                style={displayFont}
              >
                Sistemas que trabajan sin ti<span className="text-[#ff4b0b]">.</span>
                <br />
                <span className="text-[#ff4b0b]">Para ti</span>
              </h2>
            </Reveal>

            <div className="mt-6 grid gap-x-6 gap-y-11 pb-10 sm:grid-cols-2">
              {sistemasSubsections.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => toggle(index)}
                  className="group flex cursor-pointer items-start gap-3 border-t border-black/8 pt-3"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border border-[#ff4b0b]/15 bg-[#ff4b0b] text-white transition-colors duration-300 group-hover:bg-[#ff4b0b]/80">
                    <Icon size={13} strokeWidth={1.5} />
                  </span>
                  <div className="relative">
                    <h3 className="text-sm font-bold uppercase tracking-[-0.01em] leading-tight text-[#20201f]">
                      {title}
                    </h3>
                    <div
                      className={`absolute left-0 top-full z-10 transition-all duration-300 ${
                        expanded === index
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-1 opacity-0 pointer-events-none lg:group-hover:translate-y-0 lg:group-hover:opacity-100'
                      }`}
                    >
                      <p className="pt-0.5 text-[11px] leading-relaxed text-black/50">
                        {description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Reveal className="mt-10 flex items-center gap-4 border-t border-black/10 pt-4">
              <ArrowLink to="/sistemas-digitales">Explorar sistemas digitales</ArrowLink>
            </Reveal>
          </div>

          <OpsImageStage reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  )
}

function AcademyFeature() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="academy" className="grid min-h-[40rem] bg-[#f8f9f7] text-[#20201f] lg:grid-cols-[55%_45%]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[30rem] overflow-hidden cursor-pointer"
      >
        <img
          src={`${base}aprendizaje-aplicado.webp`}
          alt="Profesional aprendiendo y prototipando en un espacio de trabajo"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/18" />
      </motion.div>

      <Reveal className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-14">
        <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.24em] text-[#ff4b0b]">Aprendizaje aplicado</p>
        <h2
          className="text-[clamp(3.6rem,5.3vw,6rem)] leading-[0.87] tracking-[-0.055em]"
          style={displayFont}
        >
          <span className="text-[#ff4b0b]">Aprender</span> para Construir Mejor<span className="text-[#ff4b0b]">.</span>
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

function AcademyContactSection({ submitted, submitting, submitError, onSubmit, onReset }) {
  return (
    <div className="academy-page">
      <section id="formulario" className="academy-section academy-form-section">
        <Reveal className="academy-form-intro">
          <p className="academy-kicker font-bold">Contacto</p>
          <h2 style={displayFont}>Resuelve tus <span className="academy-title-emphasis">dudas</span><span className="academy-title-punct">.</span></h2>
          <p>Escríbenos para consultar detalles sobre los programas, metodologías o coordinar capacitación para tu equipo.</p>
          <div className="academy-form-points">
            <span><Check size={16} /> Respuesta en menos de 24 horas</span>
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
              <div className="academy-field-row">
                <div className="academy-field">
                  <label htmlFor="academy-phone">Teléfono</label>
                  <input
                    type="tel"
                    id="academy-phone"
                    name="phone"
                    required
                    placeholder="+51 999 999 999"
                  />
                </div>
                <div className="academy-field">
                  <label htmlFor="academy-email">Correo</label>
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
                  <label htmlFor="academy-interest">¿Qué Servicio o Curso te interesa?</label>
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
                {submitting ? 'ENVIANDO CONSULTA...' : 'SOLICITAR ORIENTACIÓN'}
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

const carouselCourses = [
  {
    image: '/assets/pages/9-pruebas/academy/curso-identidad-visual-ia.png',
    category: 'Diseño e IA',
    title: 'Identidad visual con IA',
    text: 'Construye una identidad coherente usando criterio visual, herramientas de IA y un sistema que puedas seguir aplicando.',
    format: 'Curso práctico',
    duration: '6 módulos',
    featured: 'Más solicitado',
  },
  {
    image: '/assets/pages/9-pruebas/academy/curso-whatsapp-business.png',
    category: 'Ventas y atención',
    title: 'WhatsApp B. para Negocios',
    text: 'Organiza consultas, respuestas, catálogo y seguimiento para convertir conversaciones en una mejor experiencia comercial.',
    format: 'Taller guiado',
    duration: '4 sesiones',
    featured: 'Aplicación inmediata',
  },
  {
    image: '/assets/pages/9-pruebas/academy/curso-antigravity-youtube.png',
    category: 'YouTube',
    title: 'Antigravity desde cero',
    text: 'Una ruta audiovisual para comprender la herramienta, experimentar con ella y llevarla a proyectos creativos reales.',
    format: 'Serie gratuita',
    duration: 'En YouTube',
    featured: 'Nuevo',
  },
  {
    image: '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
    category: 'Productividad',
    title: 'IA para equipos pequeños',
    text: 'Organiza tareas, reuniones e información con un sistema sencillo y colaborativo.',
    format: 'Programa',
    duration: '5 semanas',
    featured: null,
  },
]

const carouselLandings = [
  {
    image: '/assets/pages/8-landings/2-identidad-visual/2.webp',
    category: 'Landing',
    title: 'Identidad visual con IA',
    text: 'Construye una identidad coherente con criterio visual, herramientas de IA y un sistema que puedas seguir aplicando.',
    format: 'Landing',
    duration: 'Página web',
    link: '/landings/identidad-visual',
    featured: null,
  },
  {
    image: '/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_control.webp',
    category: 'Landing',
    title: 'Notion para agencias',
    text: 'Sistema de gestión y productividad para equipos creativos, con plantillas y flujos optimizados.',
    format: 'Landing',
    duration: 'Página web',
    link: '/landings/sistema-contenidos-notion',
    featured: null,
  },
]

function useCarousel(items) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), 4000)
    return () => clearInterval(id)
  }, [items.length])

  return index
}

function CoursesLandings() {
  const courseIdx = useCarousel(carouselCourses)
  const landingIdx = useCarousel(carouselLandings)
  const course = carouselCourses[courseIdx]
  const landing = carouselLandings[landingIdx]

  return (
    <section className="bg-[#f8f9f7] px-6 py-10 sm:py-14 text-[#20201f] sm:px-10 lg:px-14 min-h-[100dvh] flex flex-col">
      <div className="mx-auto flex w-full max-w-[94rem] flex-col flex-1">
        <Reveal className="mb-3 lg:mb-4 text-center">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Cursos y landings</p>
          <h2
            className="text-[clamp(3.6rem,5.3vw,6rem)] leading-[0.87] tracking-[-0.055em]"
            style={displayFont}
          >
            Aprende y <span className="text-[#ff4b0b]">Convierte.</span>
          </h2>
        </Reveal>

        <div className="grid flex-1 gap-5 sm:gap-6 md:gap-8 px-0 sm:px-8 md:px-12 lg:gap-[60px] lg:px-[14%] sm:grid-cols-2">
          <Reveal delay={0}>
            <Link
              to={landing.link}
              style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}
              className="academy-outer-card group flex flex-col justify-between border border-[#20201f]/12 bg-white/40 px-6 py-7"
            >
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-[6px] bg-[#ff4b0b] text-white shadow-[0_12px_28px_rgba(255,75,11,0.18)]">
                <Compass size={21} strokeWidth={1.45} />
              </span>
              <div>
                <h3 className="text-[clamp(1.6rem,2.5vw,2.6rem)] font-bold tracking-[-0.03em]" style={displayFont}>
                  Productos digitales
                </h3>
                <div className="relative mt-2">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={landing.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.30, ease: "linear" }}
                      style={{ gridTemplateRows: '14rem 1fr' }}
                      className="academy-course-card is-compact"
                    >
                      <div style={{ minHeight: '14rem' }} className="academy-course-image">
                        <img src={landing.image} alt="" loading="lazy" decoding="async" />
                        {landing.featured && <span>{landing.featured}</span>}
                      </div>
                      <div style={{ padding: '3.8rem 1.3rem', justifyContent: 'center' }} className="academy-course-content">
                        <p>{landing.category}</p>
                        <h3>{landing.title}</h3>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
                <span className="my-5 inline-flex w-max items-center gap-[1.2rem] border-b-[1.5px] border-[#ff4b0b] pb-[0.6rem] text-[1.05rem] font-medium text-[#20201f]/72 transition-colors group-hover:text-[#20201f]">
                  Explorar
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <Link
              to="/academy"
              style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}
              className="academy-outer-card group flex flex-col justify-between border border-[#20201f]/12 bg-white/40 px-6 py-7"
            >
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-[6px] bg-[#ff4b0b] text-white shadow-[0_12px_28px_rgba(255,75,11,0.18)]">
                <GraduationCap size={21} strokeWidth={1.45} />
              </span>
              <div>
                <h3 className="text-[clamp(1.6rem,2.5vw,2.6rem)] font-bold tracking-[-0.03em]" style={displayFont}>
                  Cursos y formación
                </h3>
                <div className="relative mt-2">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={course.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.30, ease: "linear" }}
                      style={{ gridTemplateRows: '14rem 1fr' }}
                      className="academy-course-card is-compact"
                    >
                      <div style={{ minHeight: '14rem' }} className="academy-course-image">
                        <img src={course.image} alt="" loading="lazy" decoding="async" />
                        {course.featured && <span>{course.featured}</span>}
                      </div>
                      <div style={{ padding: '3.8rem 1.3rem', justifyContent: 'center' }} className="academy-course-content">
                        <p>{course.category}</p>
                        <h3>{course.title}</h3>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
                <span className="my-5 inline-flex w-max items-center gap-[1.2rem] border-b-[1.5px] border-[#ff4b0b] pb-[0.6rem] text-[1.05rem] font-medium text-[#20201f]/72 transition-colors group-hover:text-[#20201f]">
                  Ver todos
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function InicioPage() {
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
      phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim().toLowerCase(),
      profile: String(form.get('profile') || '').trim(),
      interest: String(form.get('interest') || '').trim(),
      message: String(form.get('message') || '').trim(),
    }

    try {
      const { error } = await supabase.from('leads').insert([{
        client_name: lead.name,
        contact_info: lead.phone,
        source: 'Academy',
        stage: 'new',
        metadata: {
          email: lead.email,
          profile: lead.profile,
          interest: lead.interest,
          message: lead.message || 'Sin mensaje adicional',
        },
      }])
      if (error) throw error

      const academyKey = import.meta.env.VITE_WEB3FORMS_VENTAS_KEY || ''
      if (academyKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: academyKey.trim(),
            subject: `Nueva consulta Web: ${lead.interest || 'Orientación'}`,
            from_name: 'Qaway Lab Academy',
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || 'Sin mensaje adicional',
          }),
        })
      }

      const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || ''
      if (backupKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: backupKey.trim(),
            subject: `[Copia] Nueva consulta Web: ${lead.interest || 'Orientación'}`,
            from_name: 'Qaway Lab Web',
            to_email: 'qaway.myc@gmail.com',
          }),
        })
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
        <EstudioSection />
        <SistemasDigitalesSection />
        <AcademyFeature />
        <CoursesLandings />
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
