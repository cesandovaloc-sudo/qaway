import React, { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CircleDot, Compass, Database, Eye, Layout, MapPin, MessageCircle, MousePointer2, Palette, Smartphone, Target, Users, Play, Monitor, CheckCircle, Search, PenTool, Code, LineChart, X } from 'lucide-react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import './horizonte.css'
import '../../../proyectos.css'

/* ── Data ────────────────────────────────────────────────── */
const project = {
  client: 'Horizonte Inmobiliaria',
  service: 'Diseño y desarrollo web · Integración con CRM y WhatsApp',
  year: '2024',
  technologies: 'React, Tailwind, Supabase, Integración con WhatsApp',
  liveUrl: '#',
  brand: {
    forest: '#0D1B17',
    forest2: '#1E2A25',
    gold: '#C49A44',
    cream: '#F6F4F1',
    white: '#FFFFFF'
  },
  pages: ['Inicio', 'Proyectos', 'Detalle de proyecto', 'Beneficios', 'Contacto'],
}

/* ── Animation preset ────────────────────────────────────── */
const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

/* ── Micro-components ────────────────────────────────────── */
function SectionLabel({ n, title, color = "text-[#c9a35a]" }) {
  return (
    <div className={`flex items-center gap-4 text-xs font-mono tracking-widest uppercase ${color}`}>
      <span>{n}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{title}</span>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function HorizontePage() {
  const { scrollY } = useScroll()
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isDismissed) return
    const previous = scrollY.getPrevious()
    // Mostrar si scrollea hacia arriba más de 300px
    if (latest > 300 && latest < previous) {
      setShowFloatingCTA(true)
    } else if (latest > previous || latest < 300) {
      // Ocultar si scrollea hacia abajo o está muy arriba
      setShowFloatingCTA(false)
    }
  })

  return (
    <main className="min-h-screen bg-[#0D1B17] text-[#F6F4F1] font-sans selection:bg-[#C49A44] selection:text-[#0D1B17]">
      
      {/* Header Sticky */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14 relative">
          <div 
            className="text-xl font-semibold tracking-[-0.055em] text-white opacity-70 transition-opacity hover:opacity-100"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Qaway <span className="text-[#a3a3a3]">Lab</span>
          </div>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/60">
            Sistemas digitales que conectan, organizan y convierten.
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* NUEVA VERSIÓN MAESTRA — LA PLANTILLA OFICIAL DE QAWAY LAB                  */}
      {/* Esta estructura está diseñada para recibir datos dinámicos (JSON) y        */}
      {/* escalar a decenas de proyectos sin esfuerzo, manteniendo un nivel premium. */}
      {/* ========================================================================= */}
      
      <div className="bg-[#050505] text-white selection:bg-[#ff4b0b] selection:text-white">
        
        {/* 1. HERO ESTILO PÁGINA DE PROYECTOS (CENTRADO) */}
        <div className="projects-page bg-[#f8f9f7]">
          <section className="projects-hero flex flex-col justify-center items-center" style={{ paddingBottom: '64px', paddingTop: '120px' }}>
            <div className="projects-shell w-full flex flex-col items-center justify-center">
              
              <motion.div
                className="projects-hero__copy flex flex-col items-center text-center !m-0 !max-w-[800px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="projects-kicker">PROYECTO</p>
                <h1 className="qw-hero-title">Website Proyecto Inmobiliario</h1>
                
                <div className="flex gap-4 mt-4 flex-wrap justify-center">
                  <a className="projects-button" href={project.liveUrl} target="_blank" rel="noreferrer" style={{ background: '#111210', color: '#ffffff' }}>
                    Ver sitio web <ArrowUpRight size={16} />
                  </a>
                  <a className="projects-button" href="#proceso" style={{ background: 'transparent', color: '#111210', border: '1px solid #111210' }}>
                    Conocer el proceso <ArrowDown size={16} />
                  </a>
                </div>
              </motion.div>

            </div>
          </section>
        </div>



        {/* 2. PRESENTACIÓN DEL PROYECTO (Hero Dinámico con fondo inmersivo) */}
        <section className="relative min-h-[90vh] w-full flex flex-col justify-end pt-12 pb-12 md:pb-24 px-6 md:px-12">
          {/* Fondo del edificio a pantalla completa (detrás de todo) */}
          <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
            <img 
              src="/assets/horizonte/bg-real-estate.jpg" 
              alt="Fondo edificio"
              className="w-full h-full object-cover opacity-30"
            />
            {/* Gradiente sutil solo abajo para fusionar con la siguiente sección */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
          </div>

          {/* Contenedor central (1440px) */}
          <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-end">
            
            {/* Caja del Video (SIN bordes redondeados) */}
            <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10">
              <video 
                autoPlay loop muted playsInline 
                className="absolute inset-0 w-full h-full object-cover scale-105"
                src="/assets/horizonte/hero-urban-apartment.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/40 to-transparent" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end p-8 md:p-12 lg:p-16">
            <motion.div {...fade} className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-white/20 rounded-full bg-white/5 backdrop-blur-md">
                  Proyecto Web
                </span>
                <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-white/20 rounded-full bg-white/5 backdrop-blur-md">
                  {project.year}
                </span>
              </div>
              
              <h1 className="font-serif text-5xl md:text-7xl lg:text-[7rem] leading-[0.9] tracking-tight mb-8">
                {project.client.split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    {word}<br/>
                  </React.Fragment>
                ))}
              </h1>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.2 }} className="lg:col-span-4 lg:pb-4">
              <div className="grid grid-cols-2 gap-8 border-l border-white/10 pl-8">
                <div>
                  <h4 className="font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">Servicio</h4>
                  <p className="text-xs leading-relaxed text-white/80">{project.service}</p>
                </div>
                <div>
                  <h4 className="font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">Tecnologías</h4>
                  <p className="text-xs leading-relaxed text-white/80">{project.technologies}</p>
                </div>
              </div>
            </motion.div>
          </div>
          </div>
        </section>

        {/* 3. CONTEXTO Y DESAFÍO (Formato oscuro tipo Impacto) */}
        <section id="proceso" className="bg-[#050505] text-white py-12 md:py-16 px-6 border-t border-white/5">
          <div className="max-w-[1200px] mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#ff4b0b]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                  Nuestra Tarea
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#F6F4F1]">
                Crear un ecosistema digital para automatizar la captación de leads.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
              {/* El Problema */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-t border-white/10 pt-8"
              >
                <div className="font-serif text-4xl md:text-5xl mb-6 text-[#F6F4F1]">01</div>
                <h4 className="font-sans font-bold text-sm mb-4 uppercase tracking-widest text-[#F6F4F1]">El Problema</h4>
                <p className="text-sm text-white/50 leading-relaxed font-sans pr-4">
                  Horizonte Inmobiliaria dependía de métodos de ventas manuales. La falta de presencia digital generaba un embudo lento, donde los prospectos perdían el interés antes de recibir el primer contacto comercial.
                </p>
              </motion.div>

              {/* La Solución */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-t border-white/10 pt-8"
              >
                <div className="font-serif text-4xl md:text-5xl mb-6 text-[#F6F4F1]">02</div>
                <h4 className="font-sans font-bold text-sm mb-4 uppercase tracking-widest text-[#F6F4F1]">La Solución Qaway</h4>
                <p className="text-sm text-white/50 leading-relaxed font-sans pr-4">
                  Diseñamos y desarrollamos una plataforma web de alta conversión orientada a resultados. Esto nos permitió estructurar un canal digital sólido para perfilar prospectos de forma eficiente desde el primer clic.
                </p>
              </motion.div>
            </div>

          </div>
        </section>

        {/* 4. IDENTIDAD VISUAL (Lógica inmersiva de pantalla completa) */}
        <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 bg-[#050505] text-white">
          {/* Fondo inmersivo */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/horizonte/bg-real-estate.jpg" 
              alt="Fondo Textura"
              className="w-full h-full object-cover fixed"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px 70px rgba(0,0,0,0.3)' }} />
          </div>

          {/* Contenedor central */}
          <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
            
            {/* Caja de contenido inmersivo (misma lógica que la caja del video) */}
            <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-50" />
            </div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-[#C49A44]"></span>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                    Identidad Visual
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Tipografía */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-5"
                >
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-8 border-b border-white/10 pb-4">Tipografía Primaria</h4>
                  <div className="font-serif text-6xl md:text-7xl mb-16 text-[#F6F4F1]">Playfair Display</div>

                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-8 border-b border-white/10 pb-4">Tipografía Secundaria</h4>
                  <div className="font-sans text-4xl md:text-5xl text-[#F6F4F1] font-medium tracking-tight">Inter</div>
                </motion.div>

                {/* Paleta de Color */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="lg:col-span-7"
                >
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-8 border-b border-white/10 pb-4">Patrones de Color</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Bosque */}
                    <div className="aspect-square bg-[#0D1B17] rounded-xl p-4 flex flex-col justify-between border border-white/5 shadow-xl">
                      <span className="font-serif text-white/80 text-xs">Bosque</span>
                      <span className="font-mono text-[10px] text-white/40 uppercase">#0D1B17</span>
                    </div>
                    {/* Verde Oscuro */}
                    <div className="aspect-square bg-[#1E2A25] rounded-xl p-4 flex flex-col justify-between border border-white/5 shadow-xl">
                      <span className="font-serif text-white/80 text-xs">Oliva</span>
                      <span className="font-mono text-[10px] text-white/40 uppercase">#1E2A25</span>
                    </div>
                    {/* Dorado */}
                    <div className="aspect-square bg-[#C49A44] rounded-xl p-4 flex flex-col justify-between border border-[#0D1B17]/10 shadow-xl">
                      <span className="font-serif text-[#0D1B17] font-medium text-xs">Dorado</span>
                      <span className="font-mono text-[10px] text-[#0D1B17]/60 uppercase">#C49A44</span>
                    </div>
                    {/* Crema */}
                    <div className="aspect-square bg-[#F6F4F1] rounded-xl p-4 flex flex-col justify-between shadow-xl">
                      <span className="font-serif text-[#0D1B17] font-medium text-xs">Crema</span>
                      <span className="font-mono text-[10px] text-[#0D1B17]/60 uppercase">#F6F4F1</span>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* 4b. IMPACTO OPERATIVO (duplicado bajo Identidad Visual) */}
        <section className="py-8 md:py-12 px-6 max-w-[1440px] mx-auto">
          <SectionLabel n="04" title="Impacto Operativo" color="text-[#ff4b0b]" />
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-6">
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">3x</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Aumento de leads</h4>
              <p className="text-xs text-white/50 leading-relaxed">La nueva estructura optimizada para conversión triplicó el ingreso de prospectos calificados en 3 meses.</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">100%</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Atención automatizada</h4>
              <p className="text-xs text-white/50 leading-relaxed">Integración total con WhatsApp Business API, pre-filtrando clientes antes de llegar a ventas.</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">-60%</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Carga operativa</h4>
              <p className="text-xs text-white/50 leading-relaxed">Los agentes inmobiliarios dejaron de responder preguntas frecuentes, enfocándose solo en cierres.</p>
            </div>
          </div>
        </section>

        {/* 5. SHOWCASE VISUAL (Escalable y Premium) */}
        <section className="py-24 bg-[#111] border-y border-white/5">
          <div className="max-w-[1440px] mx-auto px-6 mb-16 flex items-center justify-between">
            <SectionLabel n="02" title="Ecosistema Digital" color="text-white" />
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">Visualización de interfaces</div>
          </div>

          <div className="relative max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Desktop Mockup Principal */}
            <motion.div {...fade} className="lg:col-span-8 relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="mx-auto font-mono text-[9px] text-white/30 tracking-widest">horizonte-inmobiliaria.com</div>
                </div>
                <div className="aspect-[16/10] relative bg-[#0D1B17]">
                  {/* Este img recibiría la foto real del proyecto */}
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Desktop UI" className="w-full h-full object-cover opacity-50 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B17] to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* Mobile Mockup o Detalles */}
            <motion.div {...fade} transition={{ delay: 0.2 }} className="lg:col-span-4 lg:-ml-16 z-10 mt-8 lg:mt-32">
              <div className="rounded-[2rem] p-2 border border-white/10 bg-[#1a1a1a] shadow-[0_30px_100px_rgba(0,0,0,0.8)] w-[240px] mx-auto lg:mx-0">
                <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                  <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mobile UI" className="w-full h-full object-cover opacity-60" />
                  {/* Faux UI Header */}
                  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent flex justify-between items-center">
                    <span className="font-serif text-white font-bold text-xs">HORIZONTE</span>
                    <div className="w-6 h-px bg-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4. IMPACTO / RESULTADOS (El valor de Qaway Lab) */}
        <section className="py-8 md:py-12 px-6 max-w-[1440px] mx-auto">
          <SectionLabel n="03" title="Impacto Operativo" color="text-[#ff4b0b]" />
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-6">
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">3x</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Aumento de leads</h4>
              <p className="text-xs text-white/50 leading-relaxed">La nueva estructura optimizada para conversión triplicó el ingreso de prospectos calificados en 3 meses.</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">100%</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Atención automatizada</h4>
              <p className="text-xs text-white/50 leading-relaxed">Integración total con WhatsApp Business API, pre-filtrando clientes antes de llegar a ventas.</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="font-serif text-5xl md:text-6xl mb-4">-60%</div>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-widest">Carga operativa</h4>
              <p className="text-xs text-white/50 leading-relaxed">Los agentes inmobiliarios dejaron de responder preguntas frecuentes, enfocándose solo en cierres.</p>
            </div>
          </div>
        </section>

      </div>

      {/* 01 — Hero */}
      <section className="relative min-h-screen flex items-end pt-32 pb-16 md:pb-24 px-6 overflow-hidden bg-[#0a0a0a]">
        <video 
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
          src="/assets/horizonte/hero-urban-apartment.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B17] via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-end">
            <motion.div {...fade} className="md:col-span-8">
              <div className="font-mono text-xs tracking-widest text-[#C49A44] mb-6 uppercase">PROYECTO WEB</div>
              <h1 className="font-serif text-5xl md:text-[6.5rem] leading-[0.9] tracking-tight mb-6">
                Horizonte<br />Inmobiliaria
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10">
                Sitio web corporativo y plataforma de captación para proyectos inmobiliarios.
              </p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <a href={project.liveUrl} className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold tracking-wider hover:opacity-90 transition-opacity" style={{ background: project.brand.gold, color: project.brand.forest }}>
                  VER SITIO EN VIVO <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
            
            <motion.div {...fade} transition={{ delay: 0.2, duration: 0.6 }} className="md:col-span-4">
              <div className="flex flex-col gap-6 text-sm text-white/80">
                {[
                  [Users, 'CLIENTE', project.client],
                  [Target, 'SERVICIO', project.service],
                  [CircleDot, 'AÑO', project.year],
                  [Code, 'TECNOLOGÍAS', project.technologies],
                ].map(([Icon, k, v]) => (
                  <div key={k} className="flex gap-4">
                    <div className="mt-1 text-[#C49A44]"><Icon size={20} strokeWidth={1.5} /></div>
                    <div>
                      <div className="font-mono text-[10px] tracking-widest text-white/50 mb-1 uppercase">{k}</div>
                      <div className="font-medium text-[13px] leading-snug">{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* NUEVAS SECCIONES BASADAS EN EL DISEÑO BEHANCE */}
      {/* ========================================================================= */}

      {/* 01. EL PROYECTO (Flujo Horizontal) */}
      <section className="py-24 px-6 bg-[#F6F4F1] text-[#0D1B17]">
        <div className="max-w-[1440px] mx-auto">
          <SectionLabel n="01" title="EL PROYECTO" color="text-[#0D1B17]/50" />
          <motion.h2 {...fade} className="font-serif text-4xl md:text-5xl mt-8 max-w-3xl leading-tight">
            Creamos una experiencia digital para convertir visitantes en oportunidades.
          </motion.h2>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Línea conectora */}
            <div className="hidden lg:block absolute top-6 left-12 right-12 h-px border-t border-dashed border-[#0D1B17]/20" />
            
            {[
              [Users, 'PROBLEMA', 'La empresa no contaba con presencia digital ni canales eficientes de captación.'],
              [Target, 'DIRECCIÓN', 'Diseñamos una identidad y experiencia enfocada en transmitir confianza y valor de cada proyecto.'],
              [Monitor, 'SOLUCIÓN', 'Desarrollo de sitio web corporativo con integración WhatsApp y formularios estratégicos.'],
              [LineChart, 'RESULTADO', 'Más consultas calificadas, procesos automatizados y mayor presencia digital.']
            ].map(([Icon, title, desc], i) => (
              <motion.div variants={fade} initial="initial" whileInView="whileInView" transition={{ delay: i * 0.1 }} key={title} className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-[#0D1B17]/20 bg-[#F6F4F1] flex items-center justify-center mb-6">
                  <Icon size={20} className="text-[#0D1B17]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[11px] font-mono tracking-widest mb-3">{title}</h3>
                <p className="text-[#0D1B17]/70 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 02. EXPERIENCIA DIGITAL (Mockups) */}
      <section className="relative py-24 px-6 bg-[#0D1B17] text-white overflow-hidden">
        {/* Background Image Parallax */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed opacity-40"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />
        {/* Overlay más suave para no tapar tanto la imagen */}
        <div className="absolute inset-0 bg-[#0D1B17]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B17]/90 via-transparent to-[#0D1B17]/40" />
        
        <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div {...fade} className="lg:col-span-4 z-10 relative">
            <SectionLabel n="02" title="EXPERIENCIA DIGITAL" />
            <h2 className="font-serif text-4xl md:text-5xl mt-8 leading-tight mb-12">
              Diseñada para inspirar<br />y convertir.
            </h2>
            
            <div className="flex gap-8">
              {[
                [Smartphone, 'Responsive'],
                [Eye, 'Intuitiva'],
                [Target, 'Estratégica'],
                [Database, 'Conectada']
              ].map(([Icon, label]) => (
                <div key={label} className="text-center">
                  <Icon size={24} className="mx-auto mb-3 text-[#C49A44]" strokeWidth={1.5} />
                  <div className="text-[10px] font-mono tracking-wider text-white/50">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade} className="lg:col-span-8 relative">
            {/* Desktop Mockup */}
            <div className="relative w-full max-w-[800px] ml-auto">
              <div className="bg-[#1a1a1a] p-2 md:p-4 rounded-t-xl border-x border-t border-white/10 shadow-2xl relative z-10">
                <div className="aspect-[16/10] bg-black rounded overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Web Desktop" className="w-full h-full object-cover opacity-80" />
                  {/* Faux UI overlay to look like the design */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-8">
                    <h3 className="font-serif text-3xl md:text-5xl mb-4">Vive en la mejor<br/>zona de la ciudad</h3>
                    <div className="w-12 h-1 bg-[#C49A44] mb-6" />
                  </div>
                </div>
              </div>
              <div className="h-4 bg-[#2a2a2a] rounded-b-xl border border-white/10 shadow-2xl relative z-10" />
              
              {/* Mobile Mockup overlapping */}
              <div className="absolute -bottom-10 -right-4 md:-right-10 w-[140px] md:w-[220px] z-20">
                <div className="bg-black p-2 md:p-3 rounded-[2rem] border-4 border-[#2a2a2a] shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-[#2a2a2a] rounded-b-xl z-30" />
                  <div className="aspect-[9/19] bg-[#0D1B17] rounded-[1.5rem] overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Web Mobile" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-b from-black/80 to-transparent">
                       <h3 className="font-serif text-lg mt-8 leading-tight">Vive en la mejor<br/>zona</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 03. IDENTIDAD VISUAL */}
      <section className="py-24 px-6 bg-[#1E2A25] text-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div {...fade} className="lg:col-span-3">
            <SectionLabel n="03" title="IDENTIDAD VISUAL" />
            <h2 className="font-serif text-4xl mt-8 leading-tight">Una identidad que refleja solidez, elegancia y confianza.</h2>
          </motion.div>

          <motion.div {...fade} className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-white/50 mb-4 uppercase">Logotipo</div>
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-[#0D1B17] flex flex-col items-center justify-center border border-white/5">
                    <div className="w-10 h-10 border border-[#C49A44] mb-2" />
                  </div>
                  <div className="w-32 h-32 bg-white flex flex-col items-center justify-center text-[#0D1B17]">
                    <div className="w-10 h-10 border border-[#0D1B17] mb-2" />
                    <span className="font-serif text-[10px] font-bold">HORIZONTE</span>
                  </div>
                  <div className="w-32 h-32 bg-[#0D1B17] flex flex-col items-center justify-center border border-white/5 text-white">
                    <div className="w-10 h-10 border border-[#C49A44] mb-2" />
                    <span className="font-serif text-[10px] font-bold">HORIZONTE</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest text-white/50 mb-4 uppercase">Tipografías</div>
                <div className="font-serif text-4xl mb-2">Playfair Display</div>
                <div className="font-sans text-2xl">Inter</div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-white/50 mb-4 uppercase">Paleta de color</div>
                <div className="flex text-[9px] font-mono">
                  {[['#0D1B17', 'white'], ['#1E2A25', 'white'], ['#C49A44', 'black'], ['#F6F4F1', 'black'], ['#FFFFFF', 'black']].map(([hex, txt]) => (
                    <div key={hex} className="w-20 h-20 flex items-end p-2" style={{ backgroundColor: hex, color: txt }}>
                      {hex}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <img src="https://images.unsplash.com/photo-1542382103-6258ff093c8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="w-full aspect-[4/3] object-cover" alt="Stationery" />
                <img src="https://images.unsplash.com/photo-1579737119028-eb2874de30e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="w-full aspect-[4/3] object-cover" alt="Stationery" />
                <img src="https://images.unsplash.com/photo-1621021443714-3658dc76e82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="w-full aspect-[4/3] object-cover" alt="Stationery" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 04. CÓMO CONSTRUIMOS LA EXPERIENCIA */}
      <section className="py-24 px-6 bg-[#F6F4F1] text-[#0D1B17]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          <motion.div {...fade} className="lg:col-span-1">
            <SectionLabel n="04" title="CÓMO CONSTRUIMOS LA EXPERIENCIA" color="text-[#0D1B17]/50" />
            <h2 className="font-serif text-3xl mt-8 leading-tight">Un proceso estratégico centrado en las personas y los resultados.</h2>
          </motion.div>
          
          <motion.div {...fade} className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-6 relative">
            <div className="hidden md:block absolute top-6 left-6 right-6 h-px border-t border-dashed border-[#0D1B17]/20" />
            {[
              [Search, 'INVESTIGACIÓN', 'Entendemos al usuario y al negocio.'],
              [Target, 'ESTRATEGIA', 'Definimos objetivos, estructura y mensajes clave.'],
              [PenTool, 'DISEÑO', 'Creamos una experiencia visual alineada a la identidad.'],
              [Code, 'DESARROLLO', 'Construimos soluciones rápidas, seguras y escalables.'],
              [Users, 'CONVERSIÓN', 'Implementamos canales que generan resultados medibles.']
            ].map(([Icon, title, desc]) => (
              <div key={title} className="relative z-10">
                <div className="w-12 h-12 rounded-full border border-[#0D1B17]/20 bg-[#F6F4F1] flex items-center justify-center mb-4">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[10px] font-mono tracking-widest mb-2">{title}</h3>
                <p className="text-[#0D1B17]/60 text-xs leading-relaxed pr-4">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 05. PÁGINAS PRINCIPALES */}
      <section className="py-24 px-6 bg-[#0a0a0a] text-white">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-12">
          <motion.div {...fade} className="w-full md:w-1/4">
            <SectionLabel n="05" title="PÁGINAS PRINCIPALES" />
            <h2 className="font-serif text-4xl mt-8 leading-tight">Cada página cumple un propósito.</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {project.pages.map((page, i) => (
              <motion.div variants={fade} key={page} className="text-center">
                <div className="font-mono text-[9px] tracking-widest uppercase mb-3 opacity-50">{page}</div>
                <div className="aspect-[1/2] rounded-md overflow-hidden bg-[#1a1a1a] border border-white/10">
                  <img src={`https://picsum.photos/seed/fullpage${i}/400/800`} alt={page} className="w-full h-full object-cover opacity-80" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 06. DETALLES QUE MARCAN LA DIFERENCIA (Bento Grid) */}
      <section className="py-24 px-6 bg-[#0D1B17] text-white border-y border-white/5">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div {...fade} className="lg:col-span-1 p-6 flex flex-col justify-center">
            <SectionLabel n="06" title="DETALLES QUE MARCAN LA DIFERENCIA" />
            <h2 className="font-serif text-4xl mt-6 leading-tight">Pensamos en cada detalle para ofrecer una experiencia superior.</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Top row */}
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Navegación Intuitiva</div>
              <div className="flex-1 w-full bg-[#1a1a1a] rounded border border-white/10 mt-auto flex items-center justify-center min-h-[100px]">
                 <MenuIcon />
              </div>
            </motion.div>
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Llamadas a la acción</div>
              <div className="flex-1 w-full flex items-center justify-center min-h-[100px]">
                <button className="bg-[#C49A44] text-[#0D1B17] px-6 py-2 rounded text-xs font-bold">AGENDAR VISITA</button>
              </div>
            </motion.div>
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Formularios Optimizados</div>
              <div className="flex-1 w-full space-y-2 mt-auto">
                <div className="h-6 bg-white/10 rounded w-full" />
                <div className="h-6 bg-white/10 rounded w-full" />
                <div className="h-6 bg-white/10 rounded w-full" />
              </div>
            </motion.div>
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Integración WhatsApp</div>
              <div className="flex-1 w-full flex items-center justify-center min-h-[100px]">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><MessageCircle /></div>
              </div>
            </motion.div>
            
            {/* Bottom row */}
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col md:col-span-2">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Galería Inmersiva</div>
              <div className="flex-1 w-full bg-[#1a1a1a] min-h-[140px] rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover opacity-70" alt="Galeria" />
              </div>
            </motion.div>
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Mapa Interactivo</div>
              <div className="flex-1 w-full bg-white/10 min-h-[140px] rounded flex items-center justify-center relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="Map" />
                <MapPin className="text-[#C49A44] relative z-10" size={32} />
              </div>
            </motion.div>
            <motion.div variants={fade} className="border border-white/10 bg-white/5 p-6 flex flex-col items-center">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-4 opacity-50">Iconografía</div>
              <div className="flex-1 w-full grid grid-cols-2 gap-4 place-items-center opacity-70 mt-4 min-h-[100px]">
                <HomeIcon /> <TreeIcon /> <PoolIcon /> <SecurityIcon />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 07. ASÍ FUNCIONA EL PROYECTO (Video) */}
      <section className="py-24 px-6 bg-[#0a0a0a] text-white overflow-hidden relative">
        <img 
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Bg" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        
        <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div {...fade} className="lg:col-span-4">
            <SectionLabel n="07" title="ASÍ FUNCIONA EL PROYECTO" />
            <h2 className="font-serif text-4xl md:text-5xl mt-6 leading-tight mb-8">
              Recorrido completo por la experiencia digital.
            </h2>
            <button className="inline-flex items-center gap-3 text-xs tracking-widest font-mono uppercase hover:text-[#C49A44] transition-colors border border-white/20 rounded-full pl-2 pr-6 py-2">
              <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
                <Play size={12} fill="currentColor" />
              </div>
              VER VIDEO
            </button>
          </motion.div>
          
          <motion.div {...fade} className="lg:col-span-8 flex items-center justify-end relative">
            <div className="w-full max-w-[700px] bg-[#1a1a1a] p-2 md:p-3 rounded-xl border border-white/10 shadow-2xl relative">
              <div className="aspect-[16/10] bg-black rounded overflow-hidden">
                <video 
                  autoPlay loop muted playsInline 
                  className="w-full h-full object-cover opacity-80"
                  src="/assets/horizonte/hero-urban-apartment.mp4"
                />
              </div>
              <div className="h-3 w-1/4 mx-auto bg-[#2a2a2a] rounded-b-xl" />
            </div>
            
            <div className="absolute -right-4 md:right-10 w-[100px] md:w-[160px] bg-black p-2 rounded-[1.5rem] border-2 border-[#2a2a2a] shadow-2xl">
              <div className="aspect-[9/19] bg-[#0D1B17] rounded-xl overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Web Mobile" className="w-full h-full object-cover opacity-60" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 08. APLICACIONES DE MARCA */}
      <section className="py-24 px-6 bg-[#1E2A25] text-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div {...fade} className="lg:col-span-1 p-6">
            <SectionLabel n="08" title="APLICACIONES DE MARCA" />
            <h2 className="font-serif text-3xl mt-6 leading-tight">La identidad se expande en todos los puntos de contacto.</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.img variants={fade} src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full aspect-square object-cover" />
            <motion.img variants={fade} src="https://images.unsplash.com/photo-1542382103-6258ff093c8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full aspect-square object-cover" />
            <motion.img variants={fade} src="https://images.unsplash.com/photo-1579737119028-eb2874de30e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full aspect-[2/1] md:aspect-square object-cover col-span-2 md:col-span-1" />
            <motion.img variants={fade} src="https://images.unsplash.com/photo-1621021443714-3658dc76e82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full aspect-[2/1] md:aspect-square object-cover col-span-2 md:col-span-1" />
          </motion.div>
        </div>
      </section>

      {/* 09. RESULTADOS */}
      <section className="py-24 px-6 bg-[#0D1B17] text-white border-t border-white/5">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-12">
          <motion.div {...fade} className="w-full md:w-1/3">
            <SectionLabel n="09" title="RESULTADOS" />
            <h2 className="font-serif text-4xl mt-6 leading-tight">Una solución digital que genera impacto.</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              [Layout, 'PRESENTACIÓN CLARA', 'Información organizada para facilitar la decisión.'],
              [Users, 'MAYOR CAPTACIÓN', 'Formularios y canales de contacto que generan más consultas.'],
              [Smartphone, 'EXPERIENCIA RESPONSIVE', 'Diseño adaptado a todos los dispositivos para mejor navegación.'],
              [Database, 'CONEXIÓN DIGITAL', 'Integración con WhatsApp, formularios y CRM para una gestión eficiente.']
            ].map(([Icon, title, desc]) => (
              <motion.div variants={fade} key={title} className="text-left">
                <Icon size={32} className="text-[#C49A44] mb-4" strokeWidth={1} />
                <h3 className="font-bold text-[10px] font-mono tracking-widest mb-3 uppercase">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed pr-4">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. CIERRE / CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Cierre visual" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B17] to-[#0D1B17]/60" />
        <div className="relative z-10 max-w-[1440px] mx-auto">
          <motion.div {...fade} className="max-w-2xl">
            <div className="inline-flex items-center gap-4 text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-6">
              <span>10 / ¿TIENES UN PROYECTO SIMILAR EN MENTE?</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-white mb-8">
              Creamos sitios web, identidades y sistemas digitales adaptados a las necesidades de cada proyecto.
            </h2>
            <a href="#contacto" className="inline-flex items-center gap-3 rounded px-8 py-4 text-xs font-bold tracking-wider hover:opacity-90 transition-opacity" style={{ background: project.brand.gold, color: project.brand.forest }}>
              HABLEMOS DE TU PROYECTO <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer / Navegación */}
      <footer id="contacto" className="bg-[#0a0a0a] text-white py-12 px-6 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <a href="#" className="flex items-center gap-4 hover:text-[#C49A44] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <div className="text-left hidden sm:block">
              <div className="text-white/50 mb-1">PROYECTO ANTERIOR</div>
              <div className="text-white">Clínica Bienestar</div>
            </div>
          </a>
          
          <a href="/proyectos" className="flex items-center gap-2 hover:text-[#C49A44] transition-colors">
            <Layout size={14} /> TODOS LOS PROYECTOS
          </a>
          
          <a href="#" className="flex items-center gap-4 hover:text-[#C49A44] transition-colors group">
            <div className="text-right hidden sm:block">
              <div className="text-white/50 mb-1">SIGUIENTE PROYECTO</div>
              <div className="text-white">Estudio Contable</div>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* SECCIONES ANTIGUAS (Mantenidas por seguridad abajo, ocultas o separadas) */}
      {/* ========================================================================= */}
      <div className="hidden">
        {/* Aquí podrían ir las secciones viejas si quieres mantener el código, 
            pero al reescribir toda la página hemos integrado el contenido anterior en 
            las nuevas secciones. Si realmente necesitas verlas en el DOM, quita el 'hidden'. */}
      </div>

      {/* Floating CTA (Aparece al hacer scroll hacia arriba) */}
      <AnimatePresence>
        {showFloatingCTA && !isDismissed && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[100] md:w-max w-[calc(100%-48px)] mx-auto"
          >
            <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 md:gap-8">
              {/* Profile / Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C49A44] flex items-center justify-center text-[#0D1B17] font-bold text-lg overflow-hidden shrink-0 border-2 border-[#1a1a1a]">
                  QW
                </div>
                <div className="text-sm font-medium text-white/90">
                  <span className="font-bold">Qaway Lab</span> está disponible para nuevos proyectos
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                <a href="#contacto" className="flex-1 md:flex-none text-center bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-white/90 transition-colors">
                  Hablemos de tu proyecto
                </a>
                <button 
                  onClick={() => setIsDismissed(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}

/* Micro icons for features */
function MenuIcon() {
  return <div className="space-y-1 w-8"><div className="h-1 bg-white/40 w-full rounded" /><div className="h-1 bg-white/40 w-full rounded" /><div className="h-1 bg-white/40 w-2/3 rounded" /></div>
}
function HomeIcon() { return <div className="w-8 h-8 border border-white/40 flex items-center justify-center rounded"><Layout size={16} /></div> }
function TreeIcon() { return <div className="w-8 h-8 border border-white/40 flex items-center justify-center rounded"><CircleDot size={16} /></div> }
function PoolIcon() { return <div className="w-8 h-8 border border-white/40 flex items-center justify-center rounded"><Database size={16} /></div> }
function SecurityIcon() { return <div className="w-8 h-8 border border-white/40 flex items-center justify-center rounded"><Target size={16} /></div> }
