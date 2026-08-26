import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Brush,
  Check,
  CheckCircle2,
  CircleUserRound,
  Compass,
  Cpu,
  GraduationCap,
  Image as ImageIcon,
  Layers3,
  MessageCircle,
  PenTool,
  ScanSearch,
  Send,
  Settings,
  Sparkles,
  Workflow,
  Zap,
  ShieldCheck,
  Globe,
  ChevronRight
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { carouselLandings } from '@/data/academyCourses'
import { useFeaturedCourses } from '@/features/academy-catalog'
import { getLocalFallbackCourseImage } from '@/integrations/academy'
import '@/pages/4-academy/academy.css'
import '@/pages/1-inicio/inicio.css'
import { supabase } from '@/config/supabase'

const base = '/assets/pages/1-inicio/'
const VLAB = '/assets/pages/1-inicio'

const displayFont = {
  fontFamily: "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif",
  fontStretch: 'condensed',
  fontWeight: 700,
}

const primaryAreas = [
  {
    number: '01',
    title: 'Estudio creativo',
    tag: 'Branding & Visual',
    description: 'Branding, sistemas visuales, contenido y dirección de arte para marcas y negocios.',
    link: '/estudio',
    ctaLabel: 'Explorar Estudio',
    icon: PenTool,
    accent: '#ff4b0b',
  },
  {
    number: '02',
    title: 'Sistemas digitales',
    tag: 'Automatización & IA',
    description: 'Automatiza tareas repetitivas, implementa CRM y conecta herramientas operativas con IA.',
    link: '/sistemas-digitales',
    ctaLabel: 'Ver Sistemas Digitales',
    icon: Workflow,
    accent: '#ff4b0b',
  },
  {
    number: '03',
    title: 'Qaway Academy',
    tag: 'Formación Práctica',
    description: 'Aprende a usar Inteligencia Artificial, automatizaciones y software moderno en tus proyectos.',
    link: '/academy',
    ctaLabel: 'Ir a Academy',
    icon: GraduationCap,
    accent: '#ff4b0b',
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

const estudioServices = [
  {
    title: 'Branding Digital',
    tag: 'Identidad & Manual',
    icon: Brush,
    description: 'Logotipos vectoriales, tipografías corporativas, paletas cromáticas y manual de identidad para destacar en el mercado.',
    image: `${VLAB}/inicio-branding-hospitality-moodboard2.webp`
  },
  {
    title: 'Contenido Visual',
    tag: 'Dirección de Arte',
    icon: ImageIcon,
    description: 'Fotografía comercial, piezas de comunicación y producción gráfica coherente con la personalidad de tu marca.',
    image: `${VLAB}/inicio-servicio-contenido.webp`
  },
  {
    title: 'Presencia Profesional',
    tag: 'Autoridad Digital',
    icon: CircleUserRound,
    description: 'Estructuración visual para consultores, profesionales y equipos ejecutivos que requieren proyectar alta confianza.',
    image: `${VLAB}/estudio_portada_identidad_ejecutiva2.webp`
  },
  {
    title: 'Estrategia Digital',
    tag: 'Posicionamiento',
    icon: ScanSearch,
    description: 'Auditoría de canales, arquitectura de marca y planes de comunicación para conectar con tu audiencia ideal.',
    image: `${VLAB}/inicio-servicio-estrategia.webp`
  },
]

const sistemasSubsections = [
  {
    icon: Settings,
    title: 'Automatización administrativa',
    description: 'Automatiza facturas, gastos, archivos y correos en un solo flujo continuo.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards operativos',
    description: 'Visualiza métricas, conversiones y reportes clave en un solo panel centralizado.',
  },
  {
    icon: CircleUserRound,
    title: 'CRM y seguimiento comercial',
    description: 'Organiza prospectos y asegura que ningún contacto de venta quede desatendido.',
  },
  {
    icon: Bot,
    title: 'Agentes para atención y soporte',
    description: 'Automatiza respuestas en WhatsApp y clasifica consultas con lógica operativa.',
  },
  {
    icon: PenTool,
    title: 'Sistemas de contenido con IA',
    description: 'Crea, organiza y distribuye contenido comercial de alto impacto con apoyo de IA.',
  },
  {
    icon: BookOpen,
    title: 'Procesos internos documentados',
    description: 'Estandariza procedimientos y manuales operativos para escalar tu negocio con orden.',
  },
]

const visualDeck = [
  {
    title: 'Identificar lo repetitivo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero1.webp',
    className: 'left-[8%] top-0 w-[62%] z-10',
    rotation: -3,
  },
  {
    title: 'Automatización interna',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero2.webp',
    className: 'left-[46%] top-[22%] w-[60%] z-20',
    rotation: 2,
  },
  {
    title: 'El proceso ya corre solo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero3.webp',
    className: 'left-[14%] bottom-0 w-[62%] z-30',
    rotation: -1,
  },
]

function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function useCarouselTick(intervalMs = 7000) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
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
      <div className="relative mt-2" aria-busy="true">
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
            transition={{ duration: 0.3, ease: 'linear' }}
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
              <p className="text-[#ff4b0b]" style={{ fontSize: '0.69rem', color: '#ff4b0b', marginTop: '1.2rem' }}>
                {course.category || 'Curso'}
              </p>
              <h3 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.7rem)', marginTop: '0.7rem', marginBottom: '0.6rem' }}>
                {course.title}
              </h3>
            </div>
          </motion.a>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative mt-2">
      <div style={{ gridTemplateRows: '14rem 1fr', minHeight: '14rem' }} className="academy-course-card is-compact">
        <div style={{ minHeight: '14rem' }} className="academy-course-image">
          <span className="grid h-full w-full place-items-center bg-[#20201f]/5 text-[#20201f]/30">
            <GraduationCap size={40} strokeWidth={1.2} />
          </span>
        </div>
        <div style={{ padding: '1.3rem 1.3rem 1.9rem', justifyContent: 'center' }} className="academy-course-content">
          <p className="text-[#ff4b0b]" style={{ fontSize: '0.69rem', color: '#ff4b0b', marginTop: '1.2rem' }}>
            Formación
          </p>
          <h3 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.7rem)', marginTop: '0.7rem', marginBottom: '0.6rem' }}>
            {neutral.title}
          </h3>
          <p className="text-[0.95rem] leading-relaxed text-[#20201f]/72" style={{ marginBottom: '0.6rem' }}>
            {neutral.text}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InicioPageV2() {
  const [activeEstudio, setActiveEstudio] = useState(0)
  const activeService = estudioServices[activeEstudio]
  const tick = useCarouselTick(7000)
  const landingIdx = tick % carouselLandings.length
  const landing = carouselLandings[landingIdx]
  const academyHref = (import.meta.env.VITE_ACADEMY_URL || '').replace(/\/+$/, '')
  const cursosHref = academyHref ? `${academyHref}/cursos` : '/academy'

  // Form State
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleContactSubmit(event) {
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
      const { error } = await supabase.from('leads').insert([
        {
          client_name: lead.name,
          contact_info: lead.phone,
          source: 'Inicio V2',
          stage: 'new',
          metadata: {
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || 'Sin mensaje adicional',
          },
        },
      ])
      if (error) throw error

      setSubmitted(true)
      formElement.reset()

      const contactMsg = encodeURIComponent(
        `Hola Qaway Lab, mi nombre es ${lead.name}, mi perfil es: ${lead.profile}. Me interesa: ${lead.interest}. ${
          lead.message ? 'Mensaje: ' + lead.message : ''
        }`
      )
      window.open(`https://wa.me/51930756781?text=${contactMsg}`, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Error al registrar lead:', err)
      setSubmitError('No pudimos enviar tu consulta. Por favor contáctanos directo a WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#111210] font-sans antialiased">
      <Helmet>
        <title>Qaway Lab | Estudio Creativo, Sistemas con IA y Formación</title>
        <meta
          name="description"
          content="Construimos marcas memorables, automatizamos procesos operativos con IA y formamos a equipos con tecnología práctica en Perú."
        />
      </Helmet>

      {/* 1. NAVBAR OFICIAL */}
      <Navbar variant="light" />

      {/* 2. HERO SAAS MODERNO & FLUIDO */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-b from-white via-[#f8f9fc] to-[#f8f9fc] border-b border-zinc-200/80">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            
            {/* Columna Izquierda: Headline & Value Proposition */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff4b0b]/10 border border-[#ff4b0b]/20 text-[#ff4b0b] text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles size={14} />
                <span>Estudio Digital & Sistemas con IA</span>
              </div>

              <h1
                className="text-[clamp(2.6rem,4.8vw,4.4rem)] font-bold text-[#111210] tracking-[-0.035em] leading-[1.03] mb-5"
                style={{ ...displayFont, fontWeight: 760 }}
              >
                Construimos marcas, sistemas y{' '}
                <span className="text-[#ff4b0b]">formamos con IA.</span>
              </h1>

              <p className="text-[#52525b] text-lg leading-relaxed mb-7 max-w-[540px]">
                El ecosistema integral para negocios, profesionales y equipos en crecimiento: diseño visual sólido, automatización de procesos y formación práctica en un solo lugar.
              </p>

              {/* Bullets de Valor Editoriales y Finos */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-[14.5px] text-[#27272a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] shrink-0" />
                  <span className="font-semibold">Branding, presencia digital y piezas de alta conversión</span>
                </div>
                <div className="flex items-center gap-3 text-[14.5px] text-[#27272a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] shrink-0" />
                  <span className="font-semibold">Flujos automáticos conectados a WhatsApp, CRM y bases de datos</span>
                </div>
                <div className="flex items-center gap-3 text-[14.5px] text-[#27272a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] shrink-0" />
                  <span className="font-semibold">Capacitación aplicada para dominar herramientas de Inteligencia Artificial</span>
                </div>
              </div>

              {/* Botones SaaS Modernos */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#contacto-v2"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#ff4b0b] to-[#ff632b] text-white font-bold text-[13px] uppercase tracking-wider rounded-full shadow-[0_10px_26px_rgba(255,75,11,0.28)] hover:shadow-[0_14px_32px_rgba(255,75,11,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Iniciar proyecto</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#areas-principales"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/90 backdrop-blur-sm border border-zinc-200 text-[#18181b] font-bold text-[13px] uppercase tracking-wider rounded-full hover:bg-white hover:border-zinc-300 shadow-sm hover:shadow transition-all duration-200"
                >
                  <span>Explorar divisiones</span>
                </a>
              </div>
            </div>

            {/* Columna Derecha: Presentación Editorial y Limpia de la Imagen Principal */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200/90 shadow-[0_24px_60px_rgba(0,0,0,0.09)] bg-white">
                <div className="aspect-[4/3.8] sm:aspect-[4/3.5] relative overflow-hidden bg-zinc-900">
                  <img
                    src={`${base}hero-qaway-vision-lab.webp`}
                    alt="Qaway Lab Vision"
                    className="w-full h-full object-cover grayscale object-[50%_18%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
                  
                  {/* Micro Tag Glassmorphism Flotante en la esquina inferior */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl text-white flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#ff4b0b]">Laboratorio Digital</span>
                      <span className="text-xs font-semibold text-white/95">Estrategia, Tecnología y Operaciones</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#00b090] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MARQUESINA DE MARCAS AUTÉNTICAS DE QAWAY */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-[#151514] py-6 text-white">
        <style>{`
          @keyframes qawayBrandMarqueeFast {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }
          .qaway-track-fast {
            animation: qawayBrandMarqueeFast 90s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .qaway-track-fast { animation: none; transform: none; }
          }
        `}</style>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#151514] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#151514] to-transparent" />
        
        <div className="max-w-[1280px] mx-auto px-6 mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Marcas y proyectos desarrollados en el laboratorio</p>
          <div className="hidden sm:block h-px flex-1 bg-white/10 ml-6" />
        </div>

        <div className="flex w-max qaway-track-fast">
          {[...brandNames, ...brandNames].map((brand, idx) => (
            <span
              key={`${brand.name}-${idx}`}
              className="mx-6 inline-flex items-center gap-4 whitespace-nowrap text-[clamp(1rem,2vw,1.8rem)] text-white/40 hover:text-white transition-colors"
              style={brand.style}
            >
              {brand.name}
              <span className="h-4 w-px bg-[#ff4b0b]/60" />
            </span>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN ÁREAS PRINCIPALES (ESTUDIO / SISTEMAS / ACADEMY) */}
      <section id="areas-principales" className="py-20 md:py-28 bg-[#191918] text-white">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff4b0b] mb-3">Empieza aquí</p>
            <h2 className="text-[clamp(2.2rem,3.8vw,3.4rem)] font-bold tracking-tight leading-[1.05]" style={{ ...displayFont, fontWeight: 760 }}>
              <span className="text-[#8b8c88]">Elige el área que hoy</span><br />
              <span>necesitas fortalecer.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {primaryAreas.map((area) => {
              const Icon = area.icon
              return (
                <div
                  key={area.number}
                  className="group relative rounded-2xl bg-zinc-900/90 border border-white/10 p-8 flex flex-col justify-between hover:border-[#ff4b0b]/50 hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#ff4b0b] bg-[#ff4b0b]/10 px-3 py-1 rounded-full border border-[#ff4b0b]/20">
                        {area.tag}
                      </span>
                      <span className="text-3xl font-black text-white/10 group-hover:text-white/25 transition-colors">
                        {area.number}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center text-[#ff4b0b] group-hover:bg-[#ff4b0b] group-hover:text-white transition-colors mb-6">
                      <Icon size={22} strokeWidth={1.75} />
                    </div>

                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-3 text-white" style={{ ...displayFont, fontWeight: 760 }}>
                      {area.title}
                    </h3>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      {area.description}
                    </p>
                  </div>

                  <Link
                    to={area.link}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#ff4b0b] transition-colors border-t border-white/10 pt-5"
                  >
                    <span>{area.ctaLabel}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. ESTUDIO CREATIVO (TABULADO ESTILO HOSTINGER CON ASSETS REALES) */}
      <section id="estudio" className="py-20 md:py-28 bg-[#f8f9fc] border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/80 text-zinc-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Brush size={13} color="#ff4b0b" />
              <span>01 · Estudio Creativo</span>
            </div>
            <h2 className="text-[clamp(2.2rem,3.6vw,3.2rem)] font-bold text-[#111210] tracking-tight leading-[1.08] mb-3" style={{ ...displayFont, fontWeight: 760 }}>
              Haz que tu marca se vea <span className="text-[#ff4b0b]">clara, sólida y profesional.</span>
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed">
              Define tu identidad, unifica tu contenido y construye una presencia digital de alto nivel con dirección de arte estratégica.
            </p>
          </div>

          {/* Grid de 2 Columnas: Selector de Pestañas + Showcase Visual */}
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            
            {/* Lista de Servicios Interactiva */}
            <div className="space-y-3">
              {estudioServices.map((srv, idx) => {
                const Icon = srv.icon
                const isActive = activeEstudio === idx
                return (
                  <button
                    key={srv.title}
                    type="button"
                    onClick={() => setActiveEstudio(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                      isActive
                        ? 'border-[#ff4b0b] bg-[#fff7f2] shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-[#ff4b0b] text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-base font-bold uppercase tracking-tight ${isActive ? 'text-[#ff4b0b]' : 'text-zinc-900'}`}>
                          {srv.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase bg-zinc-200/60 text-zinc-700 px-2 py-0.5 rounded">
                          {srv.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                  </button>
                )
              })}

              <div className="pt-2">
                <Link
                  to="/estudio"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ff4b0b] hover:text-[#e03e04]"
                >
                  <span>Ver portafolio de Estudio</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Showcase Visual Dinámico */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-[4/3] lg:aspect-[16/11]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeService.title}
                  src={activeService.image}
                  alt={activeService.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                {activeService.title}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SISTEMAS DIGITALES CON IA (MATRIZ DE 6 CAPACIDADES + VISUAL DECK) */}
      <section id="sistemas" className="py-20 md:py-28 bg-white border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Workflow size={13} color="#ff4b0b" />
              <span>02 · Sistemas Digitales</span>
            </div>
            <h2 className="text-[clamp(2.2rem,3.6vw,3.2rem)] font-bold text-[#111210] tracking-tight leading-[1.08] mb-3" style={{ ...displayFont, fontWeight: 760 }}>
              Automatiza tus procesos y <span className="text-[#ff4b0b]">reduce la carga manual.</span>
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed">
              Organiza tus herramientas, automatiza tareas operativas y conecta tus canales con apoyo de Inteligencia Artificial.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            
            {/* Grid 3x2 de Capacidades Operativas */}
            <div className="grid sm:grid-cols-2 gap-4">
              {sistemasSubsections.map((sub, i) => {
                const Icon = sub.icon
                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-zinc-200 bg-[#f8f9fc] hover:bg-white hover:border-[#ff4b0b]/40 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#ff4b0b] text-white flex items-center justify-center mb-3">
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-tight text-zinc-900 mb-1.5">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Visual Deck de Automatizaciones */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 p-6 min-h-[380px] flex flex-col justify-between text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff4b0b]">Control de Flujos</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Operando 24/7
                </span>
              </div>

              <div className="relative h-[240px] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                {visualDeck.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute ${img.className} rounded-lg overflow-hidden border border-white/15 shadow-xl`}
                    style={{ transform: `rotate(${img.rotation}deg)` }}
                  >
                    <img src={img.src} alt={img.title} className="w-full h-[120px] object-cover" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">WhatsApp API · CRM · Google Workspace</span>
                <Link to="/sistemas-digitales" className="text-xs font-bold text-[#ff4b0b] hover:underline flex items-center gap-1">
                  <span>Ver sistemas</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. ACADEMY & CURSOS EN VIVO (CATÁLOGO DINÁMICO SUPABASE) */}
      <section id="academy" className="py-20 md:py-28 bg-[#f8f9fc] border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-wider mb-3">
              <GraduationCap size={13} color="#ff4b0b" />
              <span>03 · Qaway Academy</span>
            </div>
            <h2 className="text-[clamp(2.2rem,3.6vw,3.2rem)] font-bold text-[#111210] tracking-tight leading-[1.08] mb-3" style={{ ...displayFont, fontWeight: 760 }}>
              Aprende a usar <span className="text-[#ff4b0b]">IA y herramientas digitales.</span>
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed">
              Formación práctica y recursos listos para aplicar en tus proyectos, negocios y flujos de trabajo profesionales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tarjeta 1: Soluciones Digitales / Landings */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-lg bg-[#ff4b0b] text-white grid place-items-center">
                    <Compass size={18} />
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900" style={{ ...displayFont, fontWeight: 760 }}>
                    Soluciones digitales
                  </h3>
                </div>

                <div className="relative mt-3">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={landing.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ gridTemplateRows: '14rem 1fr' }}
                      className="academy-course-card is-compact"
                    >
                      <div style={{ minHeight: '14rem' }} className="academy-course-image">
                        <img src={landing.image} alt={landing.title} loading="lazy" decoding="async" />
                        {landing.featured && <span>{landing.featured}</span>}
                      </div>
                      <div style={{ padding: '1.3rem', justifyContent: 'center' }} className="academy-course-content">
                        <p className="text-[#ff4b0b]" style={{ fontSize: '0.69rem', color: '#ff4b0b', marginTop: '0.8rem' }}>
                          {landing.category}
                        </p>
                        <h4 className="no-qw text-[#20201f]" style={{ fontSize: 'clamp(1.1rem,1.4vw,1.4rem)', marginTop: '0.5rem', marginBottom: '0.4rem' }}>
                          {landing.title}
                        </h4>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
              </div>

              <Link
                to={landing.link}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff4b0b] hover:text-[#e03e04] border-t border-zinc-100 pt-4"
              >
                <span>Explorar solución</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Tarjeta 2: Cursos Aplicados (Catálogo Supabase) */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-lg bg-[#ff4b0b] text-white grid place-items-center">
                    <GraduationCap size={18} />
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900" style={{ ...displayFont, fontWeight: 760 }}>
                    Cursos aplicados
                  </h3>
                </div>

                <AcademyCoursesInner tick={tick} />
              </div>

              <a
                href={cursosHref}
                target={academyHref ? '_blank' : undefined}
                rel={academyHref ? 'noopener noreferrer' : undefined}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#ff4b0b] hover:text-[#e03e04] border-t border-zinc-100 pt-4"
              >
                <span>Ver todos los cursos</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FORMULARIO DE CONTACTO OFICIAL DE INICIO */}
      <section id="contacto-v2" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
            
            {/* Columna Izquierda: Garantías */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] text-xs font-bold uppercase tracking-wider mb-4">
                Contacto Directo
              </span>
              <h2 className="text-[clamp(2.2rem,3.6vw,3.2rem)] font-bold text-[#111210] tracking-tight leading-[1.08] mb-4" style={{ ...displayFont, fontWeight: 760 }}>
                Cuéntanos <span className="text-[#ff4b0b]">qué necesitas.</span>
              </h2>
              <p className="text-zinc-600 text-base leading-relaxed mb-8">
                Escríbenos para orientarte sobre el servicio, sistema automatizado o formación que mejor encaja con tus objetivos.
              </p>

              <div className="space-y-4 text-sm font-medium text-zinc-800">
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-[#ff4b0b] shrink-0" />
                  <span>Te respondemos en menos de 24 horas hábiles</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-[#ff4b0b] shrink-0" />
                  <span>Recibe orientación sin compromiso de contratación</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-[#ff4b0b] shrink-0" />
                  <span>Soluciones personalizadas para profesionales y empresas</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Formulario */}
            <div className="bg-[#f8f9fc] rounded-2xl border border-zinc-200 p-8 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-4">
                    <Check size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">¡Consulta enviada con éxito!</h3>
                  <p className="text-zinc-600 text-sm mb-6">
                    Te responderemos a la brevedad para coordinar la mejor solución.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      ¿Cómo te llamas? *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Tu nombre completo"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+51 930 756 781"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="tu@empresa.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        ¿A qué te dedicas?
                      </label>
                      <select
                        name="profile"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b]"
                      >
                        <option value="Profesional / Consultor">Profesional / Consultor</option>
                        <option value="Emprendedor / Dueño de negocio">Emprendedor / Dueño de negocio</option>
                        <option value="Creador de contenido / Freelancer">Creador de contenido / Freelancer</option>
                        <option value="Equipo de empresa">Equipo de empresa</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Interés principal
                      </label>
                      <select
                        name="interest"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b]"
                      >
                        <option value="Identidad visual / Branding">Identidad visual / Branding</option>
                        <option value="Creación de sitios web y landings">Creación de sitios web y landings</option>
                        <option value="Automatización de procesos con IA">Automatización de procesos con IA</option>
                        <option value="CRM y seguimiento comercial">CRM y seguimiento comercial</option>
                        <option value="Formación / Cursos (Academy)">Formación / Cursos (Academy)</option>
                        <option value="Orientación general / Proyecto a medida">Orientación general / Proyecto a medida</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Cuéntanos un poco más
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="¿Qué objetivo o dificultad buscas resolver?"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-[#ff4b0b] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#ff4b0b] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_12px_24px_rgba(255,75,11,0.22)] hover:bg-[#e03e04] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'ENVIANDO...' : 'QUIERO ORIENTACIÓN'}</span>
                    <Send size={15} />
                  </button>

                  {submitError && <p className="text-xs text-red-600 mt-2">{submitError}</p>}
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 9. FOOTER OFICIAL */}
      <Footer />
    </div>
  )
}
