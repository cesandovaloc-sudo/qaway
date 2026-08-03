import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  MessageCircle,
  MousePointer2,
  Network,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const WHATSAPP_URL = WHATSAPP_LINK

const pillars = [
  {
    icon: Workflow,
    label: 'Workflows',
    title: 'Procesos que dejan de depender de memoria humana',
    text: 'Mapeamos tu operación, quitamos fricción y convertimos pasos repetitivos en flujos visibles, medibles y accionables.',
  },
  {
    icon: Bot,
    label: 'Agentes IA',
    title: 'Asistentes que ejecutan tareas con criterio operativo',
    text: 'Agentes para ordenar información, responder, resumir, clasificar, preparar reportes y acelerar decisiones.',
  },
  {
    icon: BarChart3,
    label: 'Dashboards',
    title: 'Paneles que muestran lo que antes estaba disperso',
    text: 'Indicadores, tableros y reportes para controlar avance, cuellos de botella, oportunidades y seguimiento comercial.',
  },
]

const systems = [
  'Automatización administrativa',
  'CRM y seguimiento comercial',
  'Dashboards operativos',
  'Agentes para atención y soporte',
  'Sistemas de contenido con IA',
  'Procesos internos documentados',
]

const flow = [
  { step: '01', title: 'Diagnóstico', text: 'Entendemos cómo trabaja tu equipo y dónde se pierde tiempo.' },
  { step: '02', title: 'Arquitectura', text: 'Diseñamos el mapa operativo, herramientas y responsables.' },
  { step: '03', title: 'Automatización', text: 'Conectamos flujos, IA, tableros y rutinas de ejecución.' },
  { step: '04', title: 'Optimización', text: 'Medimos, ajustamos y dejamos una operación más clara.' },
]

const stack = ['Notion', 'Make', 'Zapier', 'Airtable', 'Google Workspace', 'ChatGPT', 'WhatsApp', 'Looker Studio']

const visualDeck = [
  {
    title: 'Identificar lo repetitivo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero1.webp',
    className: 'left-0 top-0 w-[60%] rotate-[-4deg] z-10',
    yPath: [0, -5, 0],
    duration: 4.5,
  },
  {
    title: 'Automatización interna',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero2.webp',
    className: 'left-[50%] top-[25%] w-[60%] rotate-[2deg] z-20',
    yPath: [2, -3, 2],
    duration: 5.8,
  },
  {
    title: 'El proceso ya corre solo',
    src: '/assets/pages/3-sistemas-digitales/1-automatizacion/automatizacion_hero3.webp',
    className: 'left-[15%] bottom-0 w-[60%] rotate-[-2deg] z-30',
    yPath: [-2, 2, -2],
    duration: 5.2,
  },
]

function AnimatedCounter({ value, duration = 1.5, delay = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return

    let startTime = null
    const startValue = 0
    const endValue = value

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing: easeOutQuad
      const easeProgress = progress * (2 - progress)
      
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeProgress)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(animateCount)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [isInView, value, duration, delay])

  return <span ref={ref}>{count}</span>
}

function MetricCard({ label, value, detail, delay = 0, reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="mt-3 text-4xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm leading-relaxed text-zinc-400">{detail}</div>
    </motion.div>
  )
}

function OpsImageStage({ reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      className="relative hidden lg:block"
    >
      <div className="absolute -inset-10 rounded-[44px] bg-qaway-accent/10 blur-3xl" />
      <div className="relative h-[620px]">
        {visualDeck.map((image, idx) => (
          <motion.figure
            key={image.title}
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: image.yPath }}
            transition={
              reduceMotion ? undefined : {
                opacity: { duration: 0.8, delay: 0.4 + idx * 0.4, ease: 'easeOut' },
                y: { duration: 0.8, delay: 0.4 + idx * 0.4, ease: 'easeOut' }
              }
            }
            className={`absolute transform-gpu will-change-transform ${image.className}`}
          >
            <div className="rounded-[30px] border border-white/10 bg-white/5 p-2 shadow-[0_32px_120px_rgba(0,0,0,0.55)]">
              <div className="relative overflow-hidden rounded-[24px]">
                <img
                  src={image.src}
                  alt={image.title}
                  className="h-[260px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
            </div>
          </motion.figure>
        ))}

        <div
          className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-qaway-accent to-transparent opacity-60"
        />
      </div>
    </motion.div>
  )
}


function VisualProofSection({ reduceMotion }) {
  return (
    <section className="relative border-t border-white/5 bg-black py-24 text-white overflow-hidden">
      {/* Abstract light background representing data flow lines */}
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_20%,rgba(255,210,0,0.12),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-8">
        {/* Section Header: Structured like Home and Visual Lab block headers */}
        <div className="mb-16 md:w-2/3">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qaway-accent">Estructura & Flujo</div>
          <h2 className="qw-section-title text-white">
            La IA no se ve como magia.<br />
            Se ve como <span className="italic text-qaway-accent">orden.</span>
          </h2>
          <p className="mt-6 text-zinc-300 text-lg font-light leading-relaxed">
            Conectamos tus aplicaciones para eliminar el trabajo manual, creando caminos automatizados donde cada evento desencadena la acción correcta.
          </p>
        </div>

        {/* Main Card Container representing the structured block */}
        <div className="group bg-zinc-950/40 border border-white/10 hover:border-qaway-accent/20 rounded-[2rem] p-8 md:p-12 overflow-hidden relative transition-all duration-500 shadow-2xl transform-gpu">
          {/* Ambient glow inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-qaway-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center relative z-10">
            {/* Left Column: Clean features list with large icon boxes */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {[
                { 
                  icon: Database, 
                  title: 'Centralización de Datos', 
                  desc: 'Conexión directa entre tu CRM, bases de datos y canales de comunicación.' 
                },
                { 
                  icon: BrainCircuit, 
                  title: 'Criterio en Ejecución', 
                  desc: 'Agentes inteligentes que filtran y evalúan datos antes de guardarlos.' 
                }
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center text-qaway-accent rounded-sm shrink-0">
                      <Icon className="h-5 w-5 text-qaway-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-1 text-white">{item.title}</h4>
                      <p className="text-zinc-400 text-xs font-normal leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column: Workflow Mockup (Translucent window frame) */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f11]/5 p-6 backdrop-blur-sm">
                {/* Windows dots header */}
                <div className="flex justify-between items-center opacity-70 mb-6">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono tracking-widest">WORKFLOW SIMULATION</div>
                </div>

                {/* Decorative grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none mt-8" />

                {/* Workflow simulation diagram */}
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4 py-8 px-4 min-h-[220px]">
                  {/* SVG connection lines in background */}
                  <div className="absolute inset-0 hidden md:block pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 90 100 Q 195 20 300 100" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 300 100 Q 405 180 510 100" fill="none" stroke="rgba(255,210,0,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                      {/* Glowing pulse indicator */}
                      <circle r="4" fill="#FFD200">
                        <animateMotion dur="4s" repeatCount="indefinite" path="M 90 100 Q 195 20 300 100" />
                      </circle>
                      <circle r="4" fill="#FFD200">
                        <animateMotion dur="4s" begin="2s" repeatCount="indefinite" path="M 300 100 Q 405 180 510 100" />
                      </circle>
                    </svg>
                  </div>

                  {/* Node 1: Input (Google Sheets) */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/40 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)] backdrop-blur-md">
                      <Database className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">Nuevas Filas</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Google Sheets</div>
                    </div>
                  </div>

                  {/* Node 2: Processing (Agent IA) */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-qaway-accent/20 border-2 border-qaway-accent text-qaway-accent shadow-[0_0_30px_rgba(255,210,0,0.35)] backdrop-blur-md">
                      <Bot className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">Filtro & Criterio</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Qaway Assistant IA</div>
                    </div>
                  </div>

                  {/* Node 3: Output (Notion / CRM) */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/20 text-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-md">
                      <Layers3 className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">Actualizar CRM</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Notion Database</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


function SystemsInteractiveSection({ reduceMotion }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const items = [
    {
      title: 'Automatización administrativa',
      desc: 'Crea facturas, registra gastos, archiva documentos y gestiona correos de forma automática.',
      icon: Database,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_1.webp',
    },
    {
      title: 'Dashboards operativos',
      desc: 'Mide tiempos de entrega, cuellos de botella y rendimiento del equipo en tiempo real.',
      icon: Gauge,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_3.webp',
    },
    {
      title: 'CRM y seguimiento comercial',
      desc: 'Asigna prospectos, envía recordatorios automatizados por WhatsApp y actualiza estados de venta.',
      icon: GitBranch,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_2.webp',
    },
    {
      title: 'Agentes para atención y soporte',
      desc: 'IA que responde preguntas frecuentes, califica leads y deriva casos complejos a humanos.',
      icon: BrainCircuit,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_4.webp',
    },
    {
      title: 'Sistemas de contenido con IA',
      desc: 'Estructura calendarios, genera borradores para posts y optimiza tus activos de marketing.',
      icon: Layers3,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_5.webp',
    },
    {
      title: 'Procesos internos documentados',
      desc: 'SOPs en Notion para que tu equipo ejecute cada automatización sin depender de ti.',
      icon: Network,
      image: '/assets/pages/3-sistemas-digitales/1-automatizacion/bloque4_6.webp',
    },
  ]

  return (
    <section className="relative bg-black py-24 text-white overflow-hidden border-t border-white/5">
      {/* Decorative radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_80%,rgba(255,210,0,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <div className="mb-12 text-center mx-auto max-w-3xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qaway-accent">Sistema Completo</div>
          <h2 className="qw-section-title text-white mx-auto">
            Lo que puede quedar funcionando <br />
            dentro de <span className="italic text-qaway-accent">tu proyecto.</span>
          </h2>
          <p className="mt-6 text-zinc-300 text-lg font-light leading-relaxed mx-auto max-w-2xl">
            Cada bloque se puede implementar de manera independiente o conectarse en una arquitectura compacta y fácil de usar.
          </p>
        </div>

        {/* Interactive Split-Screen Layout */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Systems selection list (Minimalist Vercel-style Accordion) */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            {/* Continuous vertical timeline track on the left of the list */}
            <div className="relative border-l border-white/10 flex flex-col gap-3 pl-0">
              {items.map((item, idx) => {
                const Icon = item.icon
                const isActive = idx === activeIdx
                return (
                  <button
                    key={item.title}
                    onClick={() => setActiveIdx(idx)}
                    className={`text-left flex items-start gap-4 py-4 pl-6 border-l-2 -ml-[1.5px] transition-all duration-300 ${
                      isActive
                        ? 'border-qaway-accent bg-white/[0.02] text-white font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-1 shrink-0 transition-colors ${isActive ? 'text-qaway-accent' : 'text-zinc-500'}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500 font-medium'}`}>
                        {item.title}
                      </h3>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isActive ? 'auto' : 0,
                          opacity: isActive ? 1 : 0,
                          marginTop: isActive ? 8 : 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm font-light leading-relaxed text-zinc-400">
                          {item.desc}
                        </p>
                      </motion.div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Dynamic visual preview container */}
          <div className="lg:col-span-6">
            <div className="sticky top-28 h-full flex items-start justify-center rounded-3xl border border-white/10 bg-zinc-950/40 p-4 md:p-6 shadow-2xl overflow-hidden relative pt-2">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-qaway-accent/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 w-full flex items-center justify-center min-h-[500px]" style={{ perspective: 1000 }}>
                {/* Perspective stack container */}
                <div className="relative w-full max-w-[360px]" style={{ aspectRatio: '1080/1350' }}>
                  {items.map((item, idx) => {
                    const isPast = idx < activeIdx
                    const isActive = idx === activeIdx
                    const isNext = idx === activeIdx + 1
                    
                    let x = 0
                    let y = 0
                    let scale = 1
                    let opacity = 0
                    let rotate = 0
                    let pointerEvents = 'none'
                    
                    if (isPast) {
                      x = 0
                      y = 12
                      scale = 1.10
                      rotate = 0
                      opacity = 0
                    } else if (isActive) {
                      x = 0
                      y = 0
                      scale = 1
                      rotate = 0
                      opacity = 1
                      pointerEvents = 'auto'
                    } else if (isNext) {
                      x = 0
                      y = -32
                      scale = 0.88
                      rotate = 0
                      opacity = 0.75
                      pointerEvents = 'none'
                    } else {
                      x = 0
                      y = -32
                      scale = 0.82
                      rotate = 0
                      opacity = 0
                      pointerEvents = 'none'
                    }

                    return (
                      <motion.div
                        key={item.title}
                        className="absolute inset-0 rounded-[12px] border border-white/10 bg-black/80 p-2.5 shadow-2xl overflow-hidden"
                        style={{
                          transformOrigin: 'top center',
                          pointerEvents,
                          zIndex: items.length - idx, // Static z-index determines rendering order (lower index = on top)
                        }}
                        animate={{
                          x,
                          y,
                          scale,
                          opacity,
                          rotate,
                        }}
                        transition={{
                          default: {
                            type: 'spring',
                            stiffness: 110,
                            damping: 18,
                            mass: 1.0
                          },
                          opacity: { duration: 0.45, ease: 'easeInOut' }
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                          style={{
                            aspectRatio: '1080/1350',
                          }}
                        />
                        {/* Hardware-accelerated dimming overlay for depth styling */}
                        <div
                          className="absolute inset-0 bg-black pointer-events-none rounded-[8px] transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{
                            opacity: isActive ? 0 : (isNext ? 0.3 : 0.55),
                          }}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AutomatizacionPage() {
  useSetNavbarVariant('dark')
  const reduceMotion = useReducedMotion()

  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="relative min-h-screen pt-32">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 grayscale"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1800")',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_72%_30%,rgba(255,210,0,0.20),transparent_60%),linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.68)_48%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-qaway-accent/60 to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl grid-cols-1 items-center gap-14 px-8 py-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <Radio className="h-4 w-4 text-qaway-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-300">Automatización IA</span>
              </div>

              <h1 className="max-w-5xl text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-white text-balance sm:text-6xl lg:text-[5.25rem]">
                Si se{' '}
                <span className="text-qaway-accent [text-shadow:0_0_34px_rgba(250,204,21,0.38)]">repite,</span>
                <span className="block">
                  se{' '}
                  <span className="text-qaway-accent [text-shadow:0_0_34px_rgba(250,204,21,0.38)]">automatiza.</span>
                </span>
                <span className="mt-4 block text-3xl tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
                  Nosotros te ayudamos.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-zinc-300 sm:text-xl">
                Diseñamos sistemas operativos con IA para profesionales, negocios y equipos: Simplificamos tus tareas diarias, y conectamos tus herramientas para multiplicar tu capacidad operativa.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 rounded-2xl bg-qaway-accent px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-black shadow-[0_20px_80px_rgba(255,210,0,0.25)] transition-all hover:bg-qaway-accent-light hover:shadow-[0_26px_110px_rgba(255,210,0,0.35)]"
              >
                Diagnosticar operación
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                to="/sistemas-digitales"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl transition-all hover:bg-white/10"
              >
                Ver todos los sistemas
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <OpsImageStage reduceMotion={reduceMotion} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ■ BANDA DE MÉTRICAS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 p-8 md:p-12 shadow-2xl">
            {/* Subtle background glow inside the panel */}
            <div className="absolute -left-1/4 -top-1/2 h-96 w-96 rounded-full bg-qaway-accent/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
              {[
                { label: 'Velocidad', prefix: '-', value: 42, suffix: '%', detail: 'Reducción directa de tiempo en tareas repetitivas y seguimiento manual.' },
                { label: 'Control', prefix: '', value: 24, suffix: '/7', detail: 'Flujos visibles y tableros en tiempo real para control de tu operación.' },
                { label: 'Sistema', prefix: '', value: 1, suffix: '', detail: 'Una única arquitectura operativa documentada y conectada.' }
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`flex flex-col px-6 ${
                    idx < 2 ? 'md:border-r md:border-white/10' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">{stat.label}</span>
                  <span className="mt-4 text-5xl md:text-6xl font-bold tracking-tight text-white leading-none font-sans">
                    {stat.prefix}
                    <AnimatedCounter value={stat.value} duration={1.5} delay={idx * 0.15} />
                    {stat.suffix}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      <VisualProofSection reduceMotion={reduceMotion} />

      <section className="relative bg-white py-24 text-black">
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Arquitectura operativa</div>
            <h2 className="qw-section-title text-black">
              No instalamos herramientas. Diseñamos una forma de operar.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-black/60">
              Sistemas Digitales conecta estrategia, procesos, automatización y criterio humano para que tu equipo trabaje con menos caos y más claridad.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <motion.article
                key={pillar.title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-shadow duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.08)]"
                whileHover={reduceMotion ? undefined : { y: -8 }}
              >
                <div className="relative z-10">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-qaway-warm">
                      <pillar.icon className="h-6 w-6 text-black/80" />
                    </div>
                    <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/45">
                      {pillar.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight tracking-tight text-black">{pillar.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-black/58">{pillar.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <SystemsInteractiveSection reduceMotion={reduceMotion} />

      <section className="relative overflow-hidden bg-qaway-warm py-24 text-black">
        <div className="mx-auto max-w-7xl px-8">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Método</div>
            <h2 className="qw-section-title mx-auto">
              De caos operativo a sistema repetible.
            </h2>
          </div>

          <div className="relative mt-16 grid gap-5 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-black/20 to-transparent lg:block" />
            {flow.map((item, i) => (
              <motion.div
                key={item.step}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-xl">
                  <span className="font-mono text-sm font-bold text-qaway-accent">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/58">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-black">
        <div className="mx-auto max-w-7xl px-8">
          <div className="rounded-[40px] border border-black/10 bg-black p-8 text-white shadow-[0_34px_110px_rgba(0,0,0,0.22)] lg:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qaway-accent">Stack operativo</div>
                <h2 className="qw-section-title">Herramientas conectadas con criterio.</h2>
              </div>
              <div className="lg:col-span-7">
                <div className="flex flex-wrap gap-3">
                  {stack.map((item) => (
                    <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-zinc-200">
                      <Check className="h-4 w-4 text-qaway-accent" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-8 pb-24 text-black">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[44px] bg-qaway-accent p-10 shadow-[0_34px_110px_rgba(255,210,0,0.30)] lg:p-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h2 className="qw-section-title">Tu operación puede sentirse más simple.</h2>
              <p className="mt-4 max-w-2xl text-lg text-black/70">
                Empecemos con un diagnóstico y definamos qué sistema conviene automatizar primero.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl bg-black px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85"
              >
                Agendar diagnóstico
                <MousePointer2 className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
