
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Brain, Layout, Zap, Users, Menu, X, Target, Settings, TrendingUp,
  Sparkles, FileText, BookOpen, Calendar, PenTool, Rocket, Megaphone, Compass,
  UserPlus, Check, ChevronDown, ShieldCheck,
} from 'lucide-react'

const waMsg = encodeURIComponent("Hola, estoy interesado por el Kit Notion, desde la web")
const waLink = `https://wa.me/51930756781?text=${waMsg}`

// ─── Feature Tag ─────────────────────────────────────────
function FeatureTag({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center">
        <Icon size={14} />
      </div>
      <span className="text-lg font-medium text-white tracking-tight">{text}</span>
    </div>
  )
}

// ─── Section Title ───────────────────────────────────────
function SectionTitle({ title, subtitle, light = false, mb = 'mb-10', subtitleSize = 'text-lg', icon: Icon }) {
  return (
    <div className={`${mb} text-center`}>
      {Icon && (
        <div className={`inline-flex items-center justify-center mb-6 ${light ? 'text-white/40' : 'text-gray-300'}`}>
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <h2 className={`text-5xl md:text-6xl font-bold tracking-tighter mb-4 ${light ? 'text-white' : 'text-black'}`}>
        {title}
      </h2>
      <p className={`${subtitleSize} max-w-2xl mx-auto ${light ? 'text-white/70' : 'text-gray-500 font-medium'}`}>
        {subtitle}
      </p>
    </div>
  )
}

// ─── Data ────────────────────────────────────────────────
const tools = [
  {
    id: 0, title: "Centro de Control", desc: "Control total 360°.",
    longDesc: "Visualización centralizada del sistema para supervisar organización, accesos y flujo operativo.",
    icon: Target, color: "#f35a37",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_control.webp",
    benefits: ["Acceso rápido a cada módulo desde una sola vista organizada.", "Supervisión general del flujo de trabajo y estructura operativa."]
  },
  {
    id: 1, title: "Generador Estratégico IA", desc: "IA y fórmulas de alto valor.",
    longDesc: "Sistema estratégico impulsado por IA para desarrollar ideas alineadas a objetivos específicos.",
    icon: Sparkles, color: "#9333ea",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_generador.webp",
    benefits: ["Genera ideas estructuradas mediante prompts optimizados y lógica estratégica.", "Reduce tiempos de ideación y aces procesos creativos."]
  },
  {
    id: 2, title: "Laboratorio de Ideas", desc: "Ponderación de ideas.",
    longDesc: "Espacio diseñado para evaluar, organizar y desarrollar ideas antes de producción.",
    icon: FileText, color: "#eab308",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_laboratorio.webp",
    benefits: ["Prioriza contenidos mediante valoración estratégica y análisis colaborativo.", "Convierte ideas dispersas en contenido estructurado y accionable."]
  },
  {
    id: 3, title: "Centro de Planificación", desc: "Organización estructurada.",
    longDesc: "Espacio central para coordinar responsables, formatos y estados del contenido.",
    icon: BookOpen, color: "#3b82f6",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_planificacion.webp",
    benefits: ["Organiza publicaciones antes de ejecución mediante planificación visual estructurada.", "Mantiene sincronización operativa entre contenido, responsables y fechas."]
  },
  {
    id: 4, title: "Centro de Ejecución", desc: "Control de tiempos y Gantt.",
    longDesc: "Sistema operativo diseñado para supervisar progreso, tiempos y etapas de producción.",
    icon: Settings, color: "#ef4444",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_ejecucion.webp",
    benefits: ["Visualización dinámica del avance mediante cronogramas y seguimiento porcentual.", "Coordinación operativa de tareas, responsables y procesos activos."]
  },
  {
    id: 5, title: "Calendario", desc: "Programación de lanzamientos.",
    longDesc: "Vista temporal para visualizar publicaciones, entregas y lanzamientos programados.",
    icon: Calendar, color: "#10b981",
    image: "/assets/pages/8-landings/1-sistema-contenido-notion/notion_modulo_calendario.webp",
    benefits: ["Supervisa contenidos programados dentro de una línea temporal organizada.", "Acceso rápido al estado y avance de cada contenido."]
  }
]

const teams = [
  { id: 0, title: "Creadores", moduleName: "Content Workflow", icon: Settings, benefit: "Organiza ideas, publicaciones y producción desde un flujo visual centralizado." },
  { id: 1, title: "Equipos", moduleName: "Team Coordination", icon: PenTool, benefit: "Coordina responsables, avances y entregas dentro de un espacio compartido." },
  { id: 2, title: "Marcas", moduleName: "Content System", icon: Rocket, benefit: "Centraliza campañas, planificación y contenido dentro de una estructura organizada." },
  { id: 3, title: "Consultoría", moduleName: "Strategic Planning", icon: Megaphone, benefit: "Estructura procesos, seguimiento y planificación desde un entorno conectado." },
  { id: 4, title: "Educación", moduleName: "Knowledge Hub", icon: Compass, benefit: "Organiza recursos, contenido formativo y planificación educativa en un solo lugar." },
  { id: 5, title: "Productividad", moduleName: "Workflow Automation", icon: UserPlus, benefit: "Optimiza tiempos y automatiza procesos repetitivos dentro del flujo operativo." }
]

const faqs = [
  { q: <>¿Necesito una cuenta de Notion paga?</>, a: <>No, el sistema funciona perfectamente en la versión gratuita de Notion. Solo necesitas una cuenta activa para duplicar la plantilla.</> },
  { q: <>¿Necesito saber usar Notion avanzado para que esto funcione?</>, a: <>En absoluto. El sistema está diseñado para que solo tengas que hacer clic en «Duplicar» y empezar a usarlo. Además, incluimos un video tutorial de 15 minutos donde te llevo de la mano para que domines el tablero desde el primer día, incluso si nunca has abierto Notion.</> },
  { q: "¿El acceso es permanente?", a: "Sí, un solo pago te da acceso de por vida a la arquitectura. No hay cobros recurrentes ni letras chiquitas." },
  { q: "¿Realmente puedo planificar 30 días en solo una hora?", a: "Sí, y es por el flujo de trabajo que hemos creado. El Prompt de Ideación te da las 30 ideas en segundos; tú solo eliges las mejores, las pegas en el Dashboard y el sistema las organiza por fechas y estados. El tiempo se pierde en «pensar qué hacer», y este sistema elimina ese proceso por completo." }
]

// ─── Navbar ──────────────────────────────────────────────
function NotionNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: "#herramientas", label: "Módulos" },
    { href: "#metodo", label: "Flujo" },
    { href: "#precios", label: "Inversión" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? 'py-4 bg-gray-900/95 backdrop-blur-xl shadow-sm border-b border-gray-800'
          : 'py-10 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-white">Qaway</span>
          <span className="text-xl font-bold tracking-tight text-[#ff4b0b] ml-1">LAB</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-orange-400 transition-colors">
              {l.label}
            </a>
          ))}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 px-6 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white transition-colors shadow-lg uppercase text-[10px] font-bold tracking-widest inline-block">
            Conversemos
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors" aria-label="Menú">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setIsOpen(false)} className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-orange-500 transition-colors py-2">
                  {l.label}
                </a>
              ))}
              <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="bg-black text-white px-6 py-3 rounded-lg hover:bg-[#f35a37] transition-colors shadow-lg uppercase text-[13px] tracking-widest mt-2 text-center">
                Conversemos
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────
function NotionHero() {
  return (
    <section className="bg-[#f35a37] min-h-screen flex items-center relative overflow-hidden px-6 pt-32 pb-10">
      {/* Background Blobs para profundidad */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white opacity-[0.10] blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-black opacity-[0.03] blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-5 gap-12 items-center relative z-10">
        <div className="lg:col-span-3 text-white">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-black text-white text-[11px] md:text-[13px] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-sm">KIT NOTION SYSTEM PARA PROYECTOS</span>
            </div>
            <h1 className="text-6xl md:text-[90px] font-bold text-white leading-[0.9] tracking-tighter mb-4">
              Sistema Estratégico <br />
              de Contenidos
            </h1>
            <p className="text-orange-50/90 text-[22px] md:text-[36px] font-medium leading-tight mb-8 tracking-tight mt-6">
              Sistematiza <span className="font-black">UN MES</span> de contenido en menos de <span className="font-black bg-black/8 px-2 rounded">UNA HORA</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-12">
              <FeatureTag icon={Brain} text="IA Aplicada" />
              <FeatureTag icon={Layout} text="Organización Estratégica" />
              <FeatureTag icon={Zap} text="Flujos Automatizados" />
              <FeatureTag icon={Users} text="Flujo Colaborativo" />
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-black" fill="currentColor">
                  <path d="M4.459 4.208c.739-.108 1.492-.186 2.253-.232.761-.047 1.526-.069 2.296-.069 1.433 0 2.835.074 4.206.223 1.371.148 2.378.336 3.023.564l.111.042c.116.042.174.122.174.24v14.072c0 .093-.037.164-.111.213a.47.47 0 01-.264.074c-.093 0-.174-.016-.24-.047l-.111-.042c-.645-.228-1.652-.416-3.023-.564-1.371-.148-2.773-.223-4.206-.223-.77 0-1.535.022-2.296.069-.761.046-1.514.124-2.253.232l-.111.016a.185.185 0 01-.139-.047.21.21 0 01-.069-.153V4.423c0-.093.037-.164.111-.213.074-.048.162-.064.264-.048l.111.046zm14.247.935c.083 0 .152.029.208.088.056.059.083.132.083.218v14.072c0 .086-.027.159-.083.218-.056.059-.125.088-.208.088-.13 0-.255-.021-.375-.065l-.083-.028c-.62-.213-1.426-.375-2.417-.486-.991-.111-2.111-.167-3.361-.167-.13 0-.255.004-.375.014v-14.1c.12.009.245.014.375.014 1.25 0 2.37.056 3.361.167.991.111 1.797.273 2.417.486l.083.028c.12.044.245.065.375.065zM8.333 6.389c-.537 0-1.019.037-1.444.111-.426.074-.75.167-.972.278v10.5c.222-.111.546-.204.972-.278.425-.074.907-.111 1.444-.111.444 0 .917.028 1.417.083.5.056.88.13 1.139.222V6.694c-.259-.092-.639-.166-1.139-.222-.5-.055-.973-.083-1.417-.083z"/>
                </svg>
              </div>
              <div className="h-10 w-[2px] bg-white/20" />
              <a href="#herramientas" className="bg-black text-white px-10 py-5 rounded-lg font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl uppercase tracking-tighter">
                EXPLORAR EL SISTEMA <ArrowRight size={22} />
              </a>
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="cursor-pointer"
          >
            <img 
              src="/assets/pages/8-landings/1-sistema-contenido-notion/notion_hero.webp" 
              alt="Sistema Notion Qaway" 
              className="w-full h-auto object-cover block drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Herramientas ────────────────────────────────────────
function NotionHerramientas() {
  const [activeTool, setActiveTool] = useState(0)

  return (
    <section id="herramientas" className="pt-16 pb-16 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title={<><span className="text-3xl md:text-4xl block font-medium opacity-80 mb-2">Lo que te llevas Hoy:</span> <span className="text-[#f35a37] font-extrabold block">Tu Sistema de Contenido</span></>}
          subtitle="Un sistema completo para tu proyecto, listo para planificar, producir y controlar contenido de forma escalable."
        />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {tools.map((tool) => (
            <motion.button key={tool.id} onClick={() => setActiveTool(tool.id)}
              className={`py-4 px-6 rounded-xl border text-left transition-all relative ${
                activeTool === tool.id ? 'border-gray-200 bg-gray-50 shadow-sm' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 shadow-sm">
                <tool.icon size={22} className={activeTool === tool.id ? "text-gray-800" : "text-gray-400"} />
              </div>
              <h4 className={`font-bold text-[13px] md:text-sm uppercase tracking-tight leading-tight mt-1 ${
                activeTool === tool.id ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {tool.title}
              </h4>
              {activeTool === tool.id && (
                <motion.div layoutId="tool-active" className="absolute bottom-0 left-0 w-full h-1 bg-[#f35a37] rounded-full" />
              )}
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-8 min-h-[400px] flex items-center"
            >
              <div className="grid md:grid-cols-[1.8fr_1fr] gap-8 md:gap-14 items-center w-full">
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                  <motion.img 
                    key={activeTool}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    src={tools[activeTool].image} 
                    alt={tools[activeTool].title} 
                    className="w-full h-auto object-cover block"
                  />
                </div>
                <div className="text-center md:text-left flex flex-col items-center md:items-start md:pl-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: `${tools[activeTool].color}10` }}>
                    {(() => {
                      const Icon = tools[activeTool].icon
                      return <Icon size={24} style={{ color: tools[activeTool].color }} />
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tighter uppercase text-black leading-tight">
                    Módulo: <br />
                    {tools[activeTool].title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-base max-w-sm mb-5">
                    {tools[activeTool].longDesc}
                  </p>
                  {tools[activeTool].benefits && (
                    <ul className="space-y-3 w-full">
                      {tools[activeTool].benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-left">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${tools[activeTool].color}15` }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6L5 8.5L9.5 3.5" stroke={tools[activeTool].color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="text-sm text-gray-600 font-medium leading-snug">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// ─── Método ──────────────────────────────────────────────
function NotionMetodo() {
  const phases = [
    { title: "Fase 1: Planificación", desc: "Definición de objetivos, enfoque y estructura del contenido.", icon: Target },
    { title: "Fase 2: Ejecución", desc: "Producción, coordinación y desarrollo operativo del contenido.", icon: Settings },
    { title: "Fase 3: Optimización", desc: "Análisis de resultados y ajustes dentro del flujo de trabajo.", icon: TrendingUp }
  ]

  return (
    <section id="metodo" className="py-28 px-6 bg-[#1a1a2e] border-y border-gray-800">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title={<>Workflow Estratégico</>}
          subtitle="Un flujo diseñado para organizar, ejecutar y supervisar contenido de forma estructurada."
          light
        />
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0" />
          {phases.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.3, ease: "easeOut" }}
              className="relative z-10 bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-[#f35a37] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
                <m.icon size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight uppercase text-white">{m.title}</h3>
              <p className="text-white/50 font-medium text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Equipos ─────────────────────────────────────────────
function NotionEquipos() {
  return (
    <section id="equipos" className="py-28 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="¿Para quién es este sistema?"
          subtitle="Cada área de tu marca o equipo tiene un espacio diseñado para su forma de trabajar."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-2xl border border-gray-100 p-8 group hover:border-[#f35a37]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0 group-hover:bg-[#f35a37] transition-colors duration-300 shadow-md">
                  {(() => {
                    const Icon = team.icon
                    return <Icon size={22} className="text-white" />
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-black mb-1">
                    {team.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f35a37]">
                    {team.moduleName}
                  </span>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed mt-3">
                    {team.benefit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Precios ─────────────────────────────────────────────
function NotionPrecios() {
  return (
    <section id="precios" className="py-20 px-6 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#FF5733] opacity-10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <SectionTitle
          light
          mb="mb-12"
          title="Convierte el Caos en un Sistema Estratégico de Contenido"
          subtitle="Un solo pago para organizar, planificar y ejecutar contenido desde un entorno centralizado."
        />

        <div className="max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-b from-[#FF5733] to-transparent opacity-30 blur-2xl transition-all duration-700 group-hover:opacity-60 group-hover:blur-xl" />
            <div className="absolute -inset-[2px] rounded-2xl bg-[#FF5733] opacity-25 blur-md transition-all duration-700 group-hover:opacity-70" />

            <div className="relative p-10 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-white/10 text-center transition-all duration-700 group-hover:border-[#FF5733]/40">
              <h3 className="text-2xl font-extrabold mb-2 tracking-tight uppercase leading-[0.9]">
                Sistema Estratégico de Contenidos
              </h3>
              <p className="text-white/40 mb-8 font-medium text-sm leading-tight">
                Diseñado para proyectos, marcas y equipos que necesitan más claridad, organización y control operativo.
              </p>

              <div className="mb-8">
                <span className="text-lg font-black text-white/30 line-through tracking-tighter">60 SOLES</span>
                <div className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] mt-1">
                  <span className="text-2xl font-black text-white/40 align-top">S/.</span>
                  29 <span className="text-lg md:text-xl text-white/30 font-normal uppercase align-middle">SOLES</span>
                </div>
              </div>

              <p className="text-sm font-black text-white/60 mb-4 uppercase tracking-tight">Incluye:</p>
              <ul className="space-y-4 mb-10 text-sm text-left max-w-xs mx-auto">
                {[
                  "Sistema Estratégico de Contenidos",
                  "Centro de Planificación",
                  "Workflow de Producción",
                  "Calendario Operativo",
                  "Organización de procesos",
                  "Tutorial de implementación"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 leading-tight">
                    <Check size={18} className="text-[#FF5733] shrink-0" /> {item}
                  </li>
                ))}
              </ul>

              <a href="https://qawaylab.com/checkout/?add-to-cart=2971" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-[#FF5733] text-white rounded-lg font-black shadow-xl shadow-orange-500/30 hover:scale-[1.02] transition-transform uppercase text-xs tracking-widest leading-tight text-center">
                Implementar mi Sistema
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────
function NotionFaq() {
  const [activeFaq, setActiveFaq] = useState(null)

  return (
    <section id="faq" className="pt-[40px] pb-[48px] px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Preguntas Frecuentes" subtitle="Resolvemos tus dudas sobre implementación y escalabilidad." />
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 group transition-colors">
                <span className="font-bold text-lg text-black tracking-tight group-hover:text-[#f35a37] transition-colors">{faq.q}</span>
                <ChevronDown className={`transition-transform duration-300 flex-shrink-0 ml-4 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${activeFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden min-h-0">
                  <div className="px-6 pb-6 text-gray-500 font-medium text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Banner ──────────────────────────────────────────────
function NotionBanner() {
  return (
    <section className="bg-black py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f35a37] opacity-10 blur-[100px] -mr-32 -mt-32" />
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.3] tracking-tighter">
          Tu equipo <span className="text-[#f35a37] italic">No Necesita</span> más creatividad, <br className="hidden md:block" />
          <span className="text-[#f35a37] italic">Necesita Estructura.</span>
        </h2>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────
function NotionCta() {
  return (
    <section className="py-16 px-6 bg-[#f35a37]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
          <ShieldCheck size={18} /> Satisfacción Garantizada
        </div>
        <h2 className="text-5xl md:text-6xl font-bold mb-12 tracking-tighter text-white leading-none">
          ¿Listo para Transformar <br />
          tu Contenido en un <br />
          <span>WORKFLOW ESTRATÉGICO</span>?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="https://qawaylab.com/checkout/?add-to-cart=2971" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-black text-white px-12 py-5 rounded-lg font-bold text-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-tight inline-block text-center">
            Implementar mi Sistema
          </a>
          <span className="text-white/40 font-black uppercase text-[10px] tracking-widest px-4">ó</span>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-12 py-5 rounded-lg font-bold hover:bg-white/10 transition-colors uppercase tracking-tight inline-block text-center">
            Háblame de tu Proyecto
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────
function NotionFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#111111] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[94rem]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="lg:pr-16">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em]">
              Qaway <span className="text-[#ff4b0b]">Lab</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/56">
              Un ecosistema para construir marca, ordenar operación y activar aprendizaje con IA.
            </p>
          </div>
          <nav className="flex flex-wrap gap-8 text-[15px] font-semibold text-white/80">
            <a href="#herramientas" className="hover:text-white transition-colors">Módulos</a>
            <a href="#metodo" className="hover:text-white transition-colors">Flujo</a>
            <a href="#precios" className="text-[#ff4b0b] font-bold hover:text-[#df3900] transition-colors">Inversión</a>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">&copy; 2026 Qaway Lab</span>
        </div>
      </div>
    </footer>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────
export default function SistemaContenidosNotionLandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white scroll-smooth">
      <NotionNavbar />
      <NotionHero />
      <NotionHerramientas />
      <NotionMetodo />
      <NotionEquipos />
      <NotionPrecios />
      <NotionBanner />
      <NotionFaq />
      <NotionCta />
      <NotionFooter />
    </div>
  )
}
