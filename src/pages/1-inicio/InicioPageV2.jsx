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
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Cpu,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  MessageCircle,
  PenTool,
  Play,
  Quote,
  ScanSearch,
  Send,
  Settings,
  Sparkles,
  Star,
  Users,
  Workflow,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { carouselLandings } from '@/data/academyCourses'
import { useFeaturedCourses } from '@/features/academy-catalog'
import { getLocalFallbackCourseImage } from '@/integrations/academy'
import '@/pages/4-academy/academy.css'
import '@/pages/1-inicio/inicio.css'
import { supabase } from '@/config/supabase'

const base = '/assets/pages/1-inicio/'
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
    title: 'Estudio creativo',
    description: 'Branding, contenido y presencia digital para marcas, profesionales y negocios.',
    link: '/estudio',
    ctaLabel: 'Ver estudio creativo',
    icon: PenTool,
  },
  {
    title: 'Sistemas digitales',
    description: 'Organiza procesos, automatiza tareas y conecta herramientas para trabajar mejor.',
    link: '/sistemas-digitales',
    ctaLabel: 'Ver sistemas digitales',
    icon: Workflow,
  },
  {
    title: 'Academy',
    description: 'Aprende a usar IA, sistemas y herramientas digitales de forma práctica.',
    link: '/academy',
    ctaLabel: 'Ver Academy',
    icon: GraduationCap,
  },
]

const ecosystemAreas = [
  {
    title: 'Qaway Hub',
    description: 'Ruta interna de herramientas y módulos para organizar mejor tu trabajo.',
    link: '/hub',
    icon: Boxes,
  },
  {
    title: 'Recursos',
    description: 'Plantillas, guías y materiales listos para aplicar en tu trabajo.',
    link: '/recursos',
    icon: BookOpen,
  },
  {
    title: 'Blog',
    description: 'Guías y artículos para entender mejor IA, sistemas, marketing y productividad.',
    link: '/blog',
    icon: Compass,
  },
]

const heroCapabilities = [
  {
    icon: PenTool,
    title: 'Estudio creativo',
    description: 'Branding y Contenido',
    link: '#estudio',
    placement: 'left-[4.5%] bottom-[25%] w-[14rem]',
  },
  {
    icon: Workflow,
    title: 'Sistemas',
    description: 'Automatización e IA',
    link: '#sistemas',
    placement: 'right-[3%] bottom-[21%] w-[13rem]',
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
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const scaleUpImage = {
  hidden: { opacity: 0, scale: 0.95, y: 28 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

function ArrowLink({ to, children, light = false, newTab = false }) {
  const classes = `group inline-flex items-center gap-4 border-b pb-2 text-sm font-medium transition-colors ${light
    ? 'border-[#fe6612] text-white/78 hover:text-white'
    : 'border-[#fe6612] text-[#20201f]/72 hover:text-[#20201f]'
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

/* 
================================================================================
GUÍA DE ALINEACIÓN Y MAQUETACIÓN DE SECCIONES HERO (QAWAY LAB):
================================================================================
Para asegurar la consistencia visual y estabilidad responsiva en todas las 
páginas del ecosistema (Inicio, Estudio, Sistemas Digitales, Academy), 
se deben seguir estrictamente las siguientes reglas en la sección Hero:

1. SANGRADO / ALINEACIÓN HORIZONTAL:
   - El contenedor principal de la cuadrícula o rejilla (grid) debe tener un 
     ancho máximo de 96rem (max-w-[96rem] o max-width: 96rem) y estar centrado 
     horizontalmente (mx-auto o margin: 0 auto).
   - El sangrado izquierdo de la columna de texto debe ser de 2.5rem (px-10 o 
     padding-left: 2.5rem) en escritorio para alinearse exactamente con el 
     logotipo del Navbar. Evitar el uso de paddings fluidos en vw (ej. 3.5vw).

2. TAMAÑO E INTERLINEADO DEL TÍTULO (H1):
   - El título principal debe usar un tamaño controlado de font-size:
     clamp(3.2rem, 5.5vw, 6.5rem)
   - El interlineado (line-height) debe ser ajustado a 0.82 (leading-[0.82]).
   - El ancho máximo del título debe estar limitado (ej. max-w-[58rem] o 
     max-width: 58rem) para evitar invadir las imágenes adyacentes.

3. COMPORTAMIENTO FLEXIBLE DE LÍNEAS:
   - Evitar el uso de 'white-space: nowrap' en las líneas o spans del título,
     permitiendo saltos de línea naturales (responsive) para que el texto no 
     se desborde sobre el rostro de las imágenes.

4. ESTRUCTURA DE 3 COLUMNAS INTEGRADAS Y AJUSTE FLEXIBLE DE PROPORCIONES:
   - El Hero de cada página se estructura en un contenedor grid de 3 columnas integradas
     con base de referencia `lg:grid-cols-[.95fr_1.05fr_.7fr] max-w-[96rem] mx-auto`.
   - Las tarjetas flotantes NUNCA deben posicionarse con 'right: calc(X% + Ypx)' sueltas 
     respecto a la pantalla global. DEBEN ir ancladas dentro de la columna central.
   - REGLA FLEXIBLE DE PROPORCIÓN: El ratio de las columnas no es una regla rígida e imperativa;
     dependerá de la longitud del título H1 y del encuadre de la imagen de cada página. 
     Si un título genera saltos de línea aislados o torre de filas (ej. "la" o "y" solas),
     se debe aplicar un micro-desplazamiento del 1% al 3% a la derecha (ej. `lg:grid-cols-[1.03fr_0.97fr_0.70fr]`)
     para dar aire al texto manteniendo intacta la escala tipográfica referente de Inicio.

5. COMPORTAMIENTO RESPONSIVO EN MÓVILES Y TABLETS (< 1024px):
   - El contenedor de la imagen principal debe llevar una restricción de altura en móviles 
     (ej. `max-h-[50vh]` o `min-h-[40vh]`) con `overflow-hidden` o la imagen en `object-cover` 
     para que la foto se recorte estratégicamente y no crezca desproporcionadamente. 
     En pantallas grandes recupera su tamaño (ej. `lg:max-h-none`).
   - El panel de contenido secundario (la tercera columna, si existe) debe ocultarse en 
     móviles usando las clases de Tailwind `hidden lg:flex` o `hidden lg:grid` para evitar 
     que se apile al final y rompa la fluidez del Hero.
============================================================================= */

function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative min-h-[100dvh] overflow-hidden pt-20 text-[#191918] bg-white border-b border-black/5">
      <Navbar variant="light" />

      <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
        <div className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.22fr] gap-8 lg:gap-12 items-center min-h-[calc(100dvh-5rem)]">
          
          {/* Columna Izquierda: Textos y Botones contenidos antes de la línea de la imagen */}
          <div className="flex flex-col items-start max-w-[36rem] py-10">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#fe6612]">
              <span>/ MARCAS, SISTEMAS Y FORMACIÓN</span>
            </div>

            <motion.h1
              className="text-4xl font-bold tracking-tight text-[#191918] sm:text-5xl lg:text-6xl"
              style={displayFont}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Construimos marcas, sistemas y{' '}
              <span className="text-[#fe6612]">formamos con&nbsp;IA.</span>
            </motion.h1>

            <motion.p
              className="mt-4 max-w-[30rem] text-base leading-relaxed text-[#52525b] sm:text-lg mb-8"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Mejora tu marca, organiza tus sistemas y aprende a usar IA con claridad.
            </motion.p>

            {/* Botones de acción */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 bg-[#fe6612] px-7 py-3.5 text-[14.5px] font-bold text-white rounded-lg shadow-sm shadow-[#fe6612]/25 hover:bg-[#e05508] active:translate-y-px transition-all"
              >
                <span>Cuéntanos tu proyecto</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#primary-areas"
                className="inline-flex min-h-[48px] items-center justify-center px-6 py-3.5 border border-black/10 bg-white text-[14px] font-semibold text-[#191918] rounded-lg hover:border-[#fe6612]/40 hover:text-[#fe6612] transition-colors shadow-xs"
              >
                <span>Elige por dónde empezar</span>
              </a>
            </motion.div>
          </div>

          {/* Columna Derecha: Imagen Principal expandida hacia la izquierda y de top a top */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 1.01 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[calc(100dvh-5rem)] min-h-[34rem] overflow-hidden border-x border-[#20201f]/10 shadow-sm bg-zinc-100"
          >
            <img
              src={`${base}hero-qaway-vision-lab.webp`}
              alt="Profesional creativo de Qaway Lab mirando hacia el horizonte en un estudio digital"
              className="absolute inset-0 h-full w-full object-cover object-[52%_18%] grayscale"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />

            {/* Botón Flotante interactivo sobre la imagen */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-8 right-6 z-20"
            >
              <a
                href="#sistemas"
                className="group inline-flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-white/70 hover:bg-white hover:scale-[1.02] transition-all"
              >
                <span className="grid h-[2.7rem] w-[2.7rem] shrink-0 place-items-center bg-[#fe6612] text-white rounded-[10px] shadow-[0_8px_20px_rgba(254,102,18,0.3)]">
                  <Workflow size={19} strokeWidth={1.8} />
                </span>
                <span className="text-left pr-1.5">
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#5c5a57]">
                    Sistemas
                  </span>
                  <span className="block text-xs font-bold text-[#1e2026]">
                    Automatización e IA
                  </span>
                </span>
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function BrandMarquee() {
  const track = [...brandNames, ...brandNames]

  return (
    <section className="relative overflow-hidden border-y border-[#fe6612]/20 bg-[#151514] py-8 text-white sm:py-10">
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
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#151514] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#151514] to-transparent" />
      <div className="mx-auto mb-5 flex max-w-[94rem] items-center justify-between gap-6 px-6 sm:px-10 lg:px-14">
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fe6612]">Marcas que toman forma</p>
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
            <span className="h-8 w-px bg-[#fe6612]" />
          </span>
        ))}
      </div>
    </section>
  )
}

function EcosystemPhoto() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
      variants={scaleUpImage}
      className="group relative min-h-[31rem] overflow-visible border-[#20201f]/10 lg:min-h-[38rem]"
    >
      <div
        className="absolute inset-0 overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_38px_92px_rgba(32,32,31,0.18)]"
        style={{ boxShadow: '0 24px 64px rgba(32, 32, 31, 0.10)' }}
      >
        <img
          src={`${base}equipo-colaborando2.webp`}
          alt="Equipo multidisciplinario colaborando en un proyecto"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/8 via-transparent to-white/8" />
        <div className="absolute inset-y-10 left-0 w-2 bg-[#fe6612]" />
      </div>
    </motion.div>
  )
}

function EcosystemIntro() {
  return (
    <section id="ecosistema" className="flex min-h-[100dvh] items-center bg-[#ffffff] px-6 py-18 text-[#20201f] sm:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[94rem]">
        <Reveal className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="qw-section-kicker">Todo conectado</p>
            <h2
              className="qw-section-title mx-auto lg:mx-0 max-w-[42rem]"
              style={{ ...displayFont, fontWeight: 760 }}
            >
              Tu proyecto y aprendizaje funcionan mejor cuando <span className="text-[#fe6612]">se conectan.</span>
            </h2>
            <p className="qw-section-copy mx-auto lg:mx-0">
              No necesitas piezas sueltas. Necesitas que tu marca, tus procesos y tus herramientas trabajen juntos.
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
  { title: 'Branding Digital', icon: Brush, image: `${VLAB}/inicio-branding-hospitality-moodboard2.webp` },
  { title: 'Contenido Visual', icon: ImageIcon, image: `${VLAB}/inicio-servicio-contenido.webp` },
  { title: 'Presencia Profesional', icon: CircleUserRound, image: `${VLAB}/estudio_portada_identidad_ejecutiva2.webp` },
  { title: 'Estrategia Digital', icon: ScanSearch, image: `${VLAB}/inicio-servicio-estrategia.webp` },
]

function EstudioSection() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const activeService = estudioServices[active]

  return (
    <section id="estudio" className="relative flex flex-col justify-center min-h-[100dvh] bg-[#f8f9fc] px-6 py-12 text-[#20201f] sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="flex flex-col">
            <Reveal>
              <div>
                <p className="qw-section-kicker">
                  Estudio creativo
                </p>
                <h2
                  className="qw-section-title"
                  style={{ ...displayFont, fontWeight: 760 }}
                >
                  Haz que tu marca se vea<br /><span className="text-[#fe6612]">clara, sólida y profesional.</span>
                </h2>
                <p className="qw-section-copy">
                  Define tu marca, mejora tu contenido y construye una presencia digital más clara con apoyo de IA.
                </p>
              </div>
            </Reveal>

            {/* En móvil: la imagen se ubica inmediatamente debajo del título */}
            <div className="mt-6 block lg:hidden">
              <Reveal delay={0.15} className="relative mx-auto aspect-[4/3] w-full overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={activeService.title}
                    src={activeService.image}
                    alt={activeService.title}
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.26, ease: 'easeInOut' }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </Reveal>
            </div>

            <div className="mt-8 grid min-h-0 grid-cols-2 content-stretch gap-2 sm:gap-3">
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
                    className={`group flex h-full w-full items-center gap-2.5 border px-3.5 py-2.5 text-left transition-all duration-300 sm:px-4 sm:py-2.5 ${active === index
                      ? 'border-[#fe6612] bg-white shadow-[0_4px_16px_rgba(255,75,11,0.08)]'
                      : 'border-black/10 bg-white/40 hover:bg-white hover:border-[#fe6612]/30'
                      }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center transition-colors duration-300 ${active === index
                      ? 'bg-[#fe6612] text-white shadow-[0_4px_12px_rgba(255,75,11,0.18)]'
                      : 'border border-black/10 text-[#20201f] group-hover:border-[#fe6612]/30 group-hover:text-[#fe6612]'
                      }`}>
                      <Icon size={17} strokeWidth={1.5} />
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-[-0.01em] leading-tight transition-colors ${active === index ? 'text-[#fe6612]' : 'text-[#20201f]'
                      }`}>
                      {title}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="mt-8 flex justify-start">
                <ArrowLink to="/estudio">Ver estudio creativo</ArrowLink>
              </div>
            </Reveal>
          </div>

          {/* En desktop: la imagen se muestra en la columna derecha */}
          <Reveal delay={0.3} className="hidden lg:block relative mx-auto aspect-[4/3] w-full overflow-hidden lg:aspect-[3/2] lg:w-[90%]">
            <AnimatePresence initial={false}>
              <motion.img
                key={activeService.title}
                src={activeService.image}
                alt={activeService.title}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.26, ease: 'easeInOut' }}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-linear-to-t from-white/5 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 drop-shadow-lg">
              {activeService.title}
            </span>
          </Reveal>

          {/* Precarga de imágenes: transición instantánea sin destello blanco */}
          <div style={{ display: 'none' }} aria-hidden="true">
            {estudioServices.map(service => (
              <img key={service.title} src={service.image} alt="" loading="eager" decoding="async" />
            ))}
          </div>
        </div>
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
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[#fe6612]">Empieza aquí</p>
          <h2
            className="qw-section-title qw-section-title--impact"
            style={{ ...displayFont, fontWeight: 680 }}
          >
            <span className="text-[#8b8c88]">Elige el área que hoy</span><br />
            <span className="text-white">necesitas fortalecer.</span>
          </h2>
        </Reveal>

        <div className="grid border-t border-white/18 lg:grid-cols-3">
          {primaryAreas.map(({ title, description, link, ctaLabel, icon: Icon }, index) => {
            const dir = index === 0 ? { x: -50 } : index === 1 ? { y: 50 } : { x: 50 }
            return (
              <motion.div
                key={title}
                initial={reduceMotion ? false : { opacity: 0, ...dir }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col overflow-hidden border-b border-white/18 py-6 transition-all duration-500 lg:border-b-0 lg:px-12 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,75,11,0.1),inset_0_0_0_1px_rgba(255,75,11,0.25)] ${index ? 'lg:border-l' : ''
                  } ${index === 0 ? 'lg:pl-12' : ''}`}
              >
                <span className="pointer-events-none absolute -top-6 left-4 select-none text-[10rem] font-bold leading-none text-white/[0.04]">
                  0{index + 1}
                </span>
                <div className="relative mb-10 flex justify-end">
                  <span className="grid h-12 w-12 place-items-center rounded-[6px] border border-white/15 text-[#fe6612] transition-all duration-500 group-hover:border-[#fe6612] group-hover:bg-[#fe6612] group-hover:text-white group-hover:shadow-[0_0_24px_rgba(255,75,11,0.25)]">
                    <Icon size={21} strokeWidth={1.45} />
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col justify-end pt-[3.25rem]">
                  <h3 className="text-[clamp(1.8rem,2.8vw,3.6rem)] uppercase leading-[0.85] tracking-[-0.035em]" style={{ ...displayFont, fontWeight: 760 }}>
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">{description}</p>
                  <div className="mt-2">
                    <ArrowLink to={link} light>
                      {ctaLabel}
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
    className: 'left-[12%] top-0 w-[58%] z-10',
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
            className={`absolute transform-gpu will-change-transform ${image.className} ${idx === 2 ? 'academy-ops-solution' : ''
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
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent" />
            </div>
          </motion.figure>
        ))}

        <motion.div
          animate={reduceMotion ? undefined : { x: ['-20%', '120%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 top-1/2 h-px w-full bg-linear-to-r from-transparent via-[#fe6612] to-transparent opacity-50"
        />
      </div>
    </div>
  )
}

const sistemasSubsections = [
  {
    icon: Settings,
    title: 'Automatización administrativa',
    description: 'Automatiza facturas, gastos, archivos y correos en un solo flujo.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards operativos',
    description: 'Visualiza indicadores y reportes clave en un solo panel.',
  },
  {
    icon: CircleUserRound,
    title: 'CRM y seguimiento comercial',
    description: 'Organiza clientes y seguimiento comercial en un solo lugar.',
  },
  {
    icon: Bot,
    title: 'Agentes para atención y soporte',
    description: 'Automatiza respuestas y clasifica consultas con lógica operativa.',
  },
  {
    icon: PenTool,
    title: 'Sistemas de contenido con IA',
    description: 'Crea, organiza y distribuye contenido con apoyo de IA.',
  },
  {
    icon: BookOpen,
    title: 'Procesos internos documentados',
    description: 'Documenta y estandariza procesos para operar con más orden.',
  },
]

function SistemasDigitalesSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="sistemas" className="relative flex flex-col justify-center min-h-[100dvh] bg-[#ffffff] px-6 py-16 text-[#20201f] sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="qw-section-kicker">
                Sistemas digitales con IA
              </p>
              <h2
                className="qw-section-title"
                style={{ ...displayFont, fontWeight: 760 }}
              >
                Automatiza tus procesos y <span className="text-[#fe6612]">reduce</span>
                <br />
                <span className="text-[#fe6612]">la carga manual.</span>
              </h2>
              <p className="qw-section-copy">
                Organiza tus herramientas, automatiza tareas repetitivas y conecta tus procesos con apoyo de IA.
              </p>
            </Reveal>

            <div className="mt-6 grid gap-x-6 gap-y-11 pb-10 sm:grid-cols-2">
              {sistemasSubsections.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex cursor-pointer items-start gap-3 border-t border-black/8 pt-3"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border border-[#fe6612]/15 bg-[#fe6612] text-white transition-colors duration-300 group-hover:bg-[#fe6612]/80">
                    <Icon size={13} strokeWidth={1.5} />
                  </span>
                  <div className="relative">
                    <h3 className="no-qw text-sm font-bold uppercase tracking-[-0.01em] leading-tight text-[#414140] sm:text-[#20201f]">
                      {title}
                    </h3>
                    <div className="transition-all duration-300 sm:pointer-events-none sm:absolute sm:left-0 sm:top-full sm:z-10 sm:w-[min(20rem,100%)] sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <p className="pt-2 text-[11px] leading-relaxed text-[#414140] sm:text-[#20201f]">
                        {description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Reveal className="mt-10 flex items-center gap-4 pt-4">
              <ArrowLink to="/sistemas-digitales">Ver sistemas digitales</ArrowLink>
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
    <section id="academy" className="flex flex-col justify-center bg-[#ffffff] text-[#20201f] py-12 lg:min-h-[100dvh] lg:py-0">
      <div className="mx-auto w-full max-w-[96rem]">
      <div className="grid items-center w-full lg:grid-cols-[55%_45%]">
        <div className="order-1 flex flex-col justify-center px-6 py-4 sm:px-10 lg:order-2 lg:px-14 lg:py-16">
        <motion.p
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="qw-section-kicker"
        >
          Academy
        </motion.p>
        <motion.h2
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0.1}
          className="qw-section-title"
          style={{ ...displayFont, fontWeight: 760 }}
        >
          <span className="text-[#fe6612]">Aprende</span> a usar IA y herramientas digitales en tus Proyectos<span className="text-[#fe6612]">.</span>
        </motion.h2>
        <motion.p
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0.2}
          className="qw-section-copy"
        >
          Accede a cursos, talleres y recursos para aplicar Inteligencia Artificial, sistemas, herramientas de productividad, diseño y comunicación digital de forma práctica.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0.3}
          className="mt-6 flex flex-wrap gap-7"
        >
          <ArrowLink to="/academy">Ver Academy</ArrowLink>
          <ArrowLink to={`${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/cursos`} newTab>
            Ver todos los cursos
          </ArrowLink>
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        viewport={{ once: true, amount: 0.2 }}
        variants={scaleUpImage}
        className="order-2 relative mt-4 aspect-[4/3] w-full max-w-[92%] mx-auto overflow-hidden cursor-pointer lg:order-1 lg:mt-0 lg:self-center lg:w-[88%] xl:w-[84%]"
      >
        <img
          src={`${base}aprendizaje-aplicado2.webp`}
          alt="Profesional aprendiendo y prototipando en un espacio de trabajo"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/18" />
      </motion.div>
      </div>
      </div>
    </section>
  )
}

function AcademyContactSection({ submitted, submitting, submitError, onSubmit, onReset }) {
  return (
    <section id="formulario" className="flex min-h-[100dvh] items-center bg-[#f8f9fc] px-6 py-16 text-[#20201f] sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 items-center">
          <Reveal>
            <p className="qw-section-kicker">Contacto</p>
            <h2 className="qw-section-title" style={{ ...displayFont, fontWeight: 760 }}>
              Cuéntanos <span className="text-[#fe6612]">qué necesitas</span><span className="text-[#fe6612]">.</span>
            </h2>
            <p className="qw-section-copy">
              Escríbenos para ayudarte a elegir el servicio, sistema o formación que mejor encaja contigo.
            </p>
            <div className="qw-form-points mt-6">
              <span><Check size={16} /> Te respondemos en menos de 24 horas</span>
              <span><Check size={16} /> Recibe orientación sin compromiso</span>
              <span><Check size={16} /> Explora opciones para tu equipo o negocio</span>
            </div>
          </Reveal>

          <Reveal>
            <form
              onSubmit={onSubmit}
              className="qw-form"
            >
              {submitted ? (
                <div className="qw-form-success">
                  <div><Check size={28} /></div>
                  <h3>¡Consulta enviada!</h3>
                  <p>Te responderemos pronto para ayudarte a elegir lo que mejor necesitas.</p>
                  <button type="button" onClick={onReset}>Enviar otro mensaje</button>
                </div>
              ) : (
                <>
                  <div className="qw-field">
                    <label htmlFor="qw-name">¿Cómo te llamas?</label>
                    <input
                      type="text"
                      id="qw-name"
                      name="name"
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="qw-field-row">
                    <div className="qw-field">
                      <label htmlFor="qw-phone">Teléfono</label>
                      <input
                        type="tel"
                        id="qw-phone"
                        name="phone"
                        required
                        placeholder="+51 999 999 999"
                      />
                    </div>
                    <div className="qw-field">
                      <label htmlFor="qw-email">Correo</label>
                      <input
                        type="email"
                        id="qw-email"
                        name="email"
                        required
                        placeholder="tucorreo@empresa.com"
                      />
                    </div>
                  </div>

                  <div className="qw-field-row">
                    <div className="qw-field">
                      <label htmlFor="qw-profile">¿A qué te dedicas?</label>
                      <select id="qw-profile" name="profile" required>
                        <option value="">Selecciona tu perfil</option>
                        <option value="Profesional / Consultor">Profesional / Consultor</option>
                        <option value="Emprendedor / Dueño de negocio">Emprendedor / Dueño de negocio</option>
                        <option value="Creador de contenido / Freelancer">Creador de contenido / Freelancer</option>
                        <option value="Equipo de empresa">Equipo de empresa</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="qw-field">
                      <label htmlFor="qw-interest">¿Qué Servicio o Curso te interesa?</label>
                      <select id="qw-interest" name="interest" required>
                        <option value="">Selecciona un interés</option>
                        <option value="Identidad visual / Branding">Identidad visual / Branding</option>
                        <option value="Creación de sitios web y landings">Creación de sitios web y landings</option>
                        <option value="Automatización de procesos">Automatización de procesos</option>
                        <option value="CRM y seguimiento comercial">CRM y seguimiento comercial</option>
                        <option value="Formación / Cursos (Academy)">Formación / Cursos (Academy)</option>
                        <option value="Orientación general / Otro">Orientación general / Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="qw-field">
                    <label htmlFor="qw-message">Cuéntanos un poco más</label>
                    <textarea
                      id="qw-message"
                      name="message"
                      rows="4"
                      placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver?"
                    />
                  </div>
                  <button type="submit" className="qw-submit-button" disabled={submitting}>
                    {submitting ? 'ENVIANDO CONSULTA...' : 'QUIERO ORIENTACIÓN'}
                    <Send size={17} />
                  </button>
                  {submitError && <p className="qw-form-error" role="alert">{submitError}</p>}
                  <small>Usaremos esta información únicamente para responder tu consulta.</small>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}


function useCarouselTick(intervalMs = 7000) {
  // Tick ÚNICO y compartido: ambas tarjetas derivan su índice de este mismo
  // contador, por lo que sus imágenes rotan al mismo tiempo.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return tick
}

function AcademyCoursesInner({ tick }) {
  const { status, courses, fallbackCards, error } = useFeaturedCourses(4)
  const course = status === 'success' && courses.length > 0 ? courses[tick % courses.length] : null
  const neutral = fallbackCards[0]

  if (status === 'loading') {
    return (
      <div className="relative mt-2" aria-busy="true" aria-label="Cargando cursos">
        <div style={{ minHeight: '14rem' }} className="academy-course-card is-compact animate-pulse bg-[#20201f]/5" />
      </div>
    )
  }

  if (course) {
    return (
      <div className="relative mt-2">
        <AnimatePresence mode="wait">
          <motion.a
            key={course.slug}
            href={course.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.30, ease: "linear" }}
            style={{ gridTemplateRows: '14rem 1fr', display: 'grid' }}
            className="academy-course-card is-compact"
          >
            <div style={{ minHeight: '14rem' }} className="academy-course-image">
              {(() => {
                const fallback = getLocalFallbackCourseImage(course.slug, course.title)
                const imgSource = course.imageUrl || fallback
                return imgSource ? (
                  <img
                    src={imgSource}
                    alt={course.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.hasFallback && fallback) {
                        e.currentTarget.dataset.hasFallback = 'true'
                        e.currentTarget.src = fallback
                      }
                    }}
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[#20201f]/5 text-[#20201f]/30">
                    <GraduationCap size={40} strokeWidth={1.2} />
                  </span>
                )
              })()}
              {course.badgeText && <span>{course.badgeText}</span>}
            </div>
            <div style={{ padding: '1.3rem 1.3rem 1.9rem', justifyContent: 'center' }} className="academy-course-content">
              <p className="text-[#fe6612]" style={{ fontSize: '0.69rem', color: '#fe6612', marginTop: '1.2rem' }}>{course.category || 'Curso'}</p>
              <h3 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.7rem)', marginTop: '0.7rem', marginBottom: '0.6rem' }}>{course.title}</h3>
            </div>
          </motion.a>
        </AnimatePresence>
      </div>
    )
  }

  // Respuesta válida sin destacados, caché caducada o error sin caché:
  // tarjeta NEUTRAL (sin precios, duraciones ni badges inventados).
  return (
    <div className="relative mt-2" role="status">
      <div style={{ gridTemplateRows: '14rem 1fr', minHeight: '14rem' }} className="academy-course-card is-compact">
        <div style={{ minHeight: '14rem' }} className="academy-course-image">
          <span className="grid h-full w-full place-items-center bg-[#20201f]/5 text-[#20201f]/30">
            <GraduationCap size={40} strokeWidth={1.2} />
          </span>
        </div>
        <div style={{ padding: '1.3rem 1.3rem 1.9rem', justifyContent: 'center' }} className="academy-course-content">
          <p className="text-[#fe6612]" style={{ fontSize: '0.69rem', color: '#fe6612', marginTop: '1.2rem' }}>Formación</p>
          <h3 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.7rem)', marginTop: '0.7rem', marginBottom: '0.6rem' }}>{neutral.title}</h3>
          <p className="text-[0.95rem] leading-relaxed text-[#20201f]/72" style={{ marginBottom: '0.6rem' }}>{neutral.text}</p>
        </div>
      </div>
      {status === 'error' && error && (
        <p className="mt-2 text-[0.75rem] text-[#20201f]/50">{error}</p>
      )}
    </div>
  )
}

function CoursesLandings() {
  const tick = useCarouselTick(7000)
  const landingIdx = tick % carouselLandings.length
  const landing = carouselLandings[landingIdx]
  const academyHref = (import.meta.env.VITE_ACADEMY_URL || '').replace(/\/+$/, '')
  const cursosHref = academyHref ? `${academyHref}/cursos` : '/academy'

  return (
    <section className="bg-[#ffffff] px-6 py-10 sm:py-14 text-[#20201f] sm:px-10 lg:px-14 min-h-[100dvh] flex flex-col justify-center">
      <div className="mx-auto flex w-full max-w-[94rem] flex-col">
        <Reveal className="mb-3 lg:mb-4 text-center">
          <p className="qw-section-kicker">Formación y soluciones</p>
          <h2
            className="qw-section-title mx-auto"
            style={{ ...displayFont, fontWeight: 760 }}
          >
            Aprende y <span className="text-[#fe6612]">aplica.</span>
          </h2>
        </Reveal>

        <div className="grid flex-1 gap-5 sm:gap-6 md:gap-8 px-0 sm:px-8 md:px-12 lg:gap-10 lg:px-[8%] sm:grid-cols-2">
          <Reveal delay={0}>
            <Link
              to={landing.link}
              style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}
              className="academy-outer-card group flex flex-col justify-between border border-[#20201f]/12 bg-white/40 px-6 pt-7 pb-3"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-[#fe6612] text-white shadow-[0_12px_28px_rgba(255,75,11,0.18)]">
                  <Compass size={19} strokeWidth={1.45} />
                </span>
                <h3 className="no-qw text-[clamp(1.25rem,2.1vw,2.25rem)] font-bold tracking-[-0.03em]" style={{ ...displayFont, fontWeight: 760 }}>
                  Soluciones digitales
                </h3>
              </div>
              <div>
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
                      <div style={{ padding: '1.3rem 1.3rem 1.9rem', justifyContent: 'center' }} className="academy-course-content">
                        <p className="text-[#fe6612]" style={{ fontSize: '0.69rem', color: '#fe6612', marginTop: '1.2rem' }}>{landing.category}</p>
                        <h3 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.7rem)', marginTop: '0.7rem', marginBottom: '0.6rem' }}>{landing.title}</h3>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
                <span className="mt-3 mb-1 inline-flex w-max items-center gap-[1.2rem] border-b-[1.5px] border-[#fe6612] pb-[0.6rem] text-[1.05rem] font-medium text-[#20201f]/72 transition-colors group-hover:text-[#20201f]">
                  Explorar
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <div
              style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}
              className="academy-outer-card group flex flex-col justify-between border border-[#20201f]/12 bg-white/40 px-6 pt-7 pb-3"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-[#fe6612] text-white shadow-[0_12px_28px_rgba(255,75,11,0.18)]">
                  <GraduationCap size={19} strokeWidth={1.45} />
                </span>
                <h3 className="no-qw text-[clamp(1.25rem,2.1vw,2.25rem)] font-bold tracking-[-0.03em]" style={{ ...displayFont, fontWeight: 760 }}>
                  Cursos aplicados
                </h3>
              </div>
              <div>
                <AcademyCoursesInner tick={tick} />
                <a
                  href={cursosHref}
                  target={academyHref ? '_blank' : undefined}
                  rel={academyHref ? 'noopener noreferrer' : undefined}
                  className="mt-3 mb-1 inline-flex w-max items-center gap-[1.2rem] border-b-[1.5px] border-[#fe6612] pb-[0.6rem] text-[1.05rem] font-medium text-[#20201f]/72 transition-colors group-hover:text-[#20201f]"
                >
                  Ver formación
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </a>
              </div>
            </div>
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

      const academyKey = import.meta.env.VITE_WEB3FORMS_PROYECTOS_KEY || ''
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
      
      const contactMsg = encodeURIComponent(`Hola Qaway, mi nombre es ${lead.name}, mi perfil es: ${lead.profile}. Me interesa: ${lead.interest}. ${lead.message ? 'Mensaje: ' + lead.message : ''}`)
      const waUrl = `https://wa.me/51930756781?text=${contactMsg}`
      window.location.href = waUrl
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
