import React, { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Layout, MapPin, X } from 'lucide-react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import SEO from '@/components/seo/SEO'
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
      <SEO
        title="Horizonte Inmobiliaria — Caso de Estudio | Qaway Lab"
        description="Caso de estudio: sitio web corporativo y plataforma de captación para Horizonte Inmobiliaria. Diseño, desarrollo e integración con CRM y WhatsApp."
        canonical="https://qawaylab.com/proyectos/horizonte"
        type="website"
        schema={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "Horizonte Inmobiliaria — Sitio Web Corporativo",
          "description": "Sitio web corporativo y plataforma de captación para proyectos inmobiliarios. Diseño, desarrollo e integración con CRM y WhatsApp.",
          "author": {
            "@type": "Organization",
            "name": "Qaway Lab"
          },
          "provider": {
            "@type": "Organization",
            "name": "Qaway Lab"
          },
          "dateCreated": "2024",
          "keywords": ["inmobiliaria", "sitio web", "React", "Tailwind", "Supabase", "WhatsApp"]
        }}
      />
      
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
        
        {/* 1. HERO EDITORIAL */}
        <section className="bg-[#f8f9f7] text-[#111210] py-20 md:py-32 px-6">
          <div className="max-w-[1000px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Caso de Estudio</span>
                <span className="w-8 h-px bg-[#ff4b0b]"></span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-8">
                Horizonte<br/>Inmobiliaria
              </h1>
              <p className="text-sm md:text-base text-[#111210]/60 leading-relaxed max-w-xl mb-10">
                Sitio web corporativo y plataforma de captación para proyectos inmobiliarios premium. Diseño, desarrollo e integración con CRM y WhatsApp.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#111210]/10 pt-8">
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Cliente</div>
                  <div className="text-xs font-medium text-[#111210]">Horizonte Inmobiliaria</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Servicio</div>
                  <div className="text-xs font-medium text-[#111210]">Web · CRM · WhatsApp</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Año</div>
                  <div className="text-xs font-medium text-[#111210]">2024</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Stack</div>
                  <div className="text-xs font-medium text-[#111210]">React · Tailwind · Supabase</div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#111210] text-white text-xs font-bold tracking-wider hover:bg-[#111210]/80 transition-colors">
                  Ver sitio en vivo <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>



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

        {/* 3. CONTEXTO Y DESAFÍO (Fondo Blanco de Marca) */}
        <section id="proceso" className="bg-[#f8f9f7] text-[#111210] py-12 md:py-16 px-6 border-t border-[#111210]/5">
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
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
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
                className="border-t border-[#111210]/10 pt-8"
              >
                <div className="font-serif text-4xl md:text-5xl mb-6 text-[#111210]">01</div>
                <h4 className="font-sans font-bold text-sm mb-4 uppercase tracking-widest text-[#111210]">El Problema</h4>
                <p className="text-sm text-[#111210]/70 leading-relaxed font-sans pr-4">
                  Horizonte Inmobiliaria dependía de métodos de ventas manuales. La falta de presencia digital generaba un embudo lento, donde los prospectos perdían el interés antes de recibir el primer contacto comercial.
                </p>
              </motion.div>

              {/* La Solución */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-t border-[#111210]/10 pt-8"
              >
                <div className="font-serif text-4xl md:text-5xl mb-6 text-[#111210]">02</div>
                <h4 className="font-sans font-bold text-sm mb-4 uppercase tracking-widest text-[#111210]">La Solución Qaway</h4>
                <p className="text-sm text-[#111210]/70 leading-relaxed font-sans pr-4">
                  Diseñamos y desarrollamos una plataforma web de alta conversión orientada a resultados. Esto nos permitió estructurar un canal digital sólido para perfilar prospectos de forma eficiente desde el primer clic.
                </p>
              </motion.div>
            </div>

          </div>
        </section>

        {/* 4. IDENTIDAD VISUAL INMERSIVA (Lógica inmersiva de pantalla completa) */}
        <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white">
          {/* Fondo inmersivo (Fijo al hacer scroll) */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-50"
            style={{ backgroundImage: 'url("/assets/horizonte/bg-real-estate.jpg")' }}
          />

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
                  <div className="font-sans text-4xl md:text-5xl text-[#F6F4F1] font-medium tracking-tight">DM Sans</div>
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

        {/* 5. PREÁMBULO SELECCIÓN FOTOGRÁFICA (Fondo Blanco) */}
        <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
          <div className="max-w-[1200px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">05</span>
                <span className="w-8 h-px bg-[#ff4b0b]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                  Dirección de Arte
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
                Selección Fotográfica
              </h2>
            </motion.div>
          </div>
        </section>

        {/* 5. SELECCIÓN FOTOGRÁFICA INMERSIVA */}
        <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
          {/* Fondo inmersivo parallax (Fotografía principal) */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
          />

          {/* Contenedor central flotante oscuro */}
          <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
            
            <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-50" />
            </div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-[#C49A44]"></span>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                    Estilo de vida & Arquitectura
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="col-span-1">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                    <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 md:gap-8">
                  <div className="col-span-2 aspect-[21/9] rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                    <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                  </div>
                  <div className="col-span-1 aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                  </div>
                  <div className="col-span-1 aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                    <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fotografía" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PREÁMBULO SHOWCASE VISUAL (Fondo Blanco) */}
        <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
          <div className="max-w-[1200px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-2"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">06</span>
                <span className="w-8 h-px bg-[#ff4b0b]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                  Ecosistema Digital
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
                Visualización de interfaces
              </h2>
            </motion.div>
          </div>
        </section>

        {/* 6. SHOWCASE VISUAL INMERSIVO (Mismo formato que Identidad Visual) */}
        <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
          {/* Fondo inmersivo parallax (Usando una imagen abstracta/arquitectónica elegante) */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
          />

          {/* Contenedor central flotante oscuro */}
          <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
            
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
                    Diseño UI / UX
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Desktop Mockup Principal */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-8 relative">
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                    <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      </div>
                      <div className="mx-auto font-mono text-[9px] text-white/30 tracking-widest">horizonte-inmobiliaria.com</div>
                    </div>
                    <div className="aspect-[16/10] relative bg-[#0D1B17]">
                      <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Desktop UI" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700" />
                    </div>
                  </div>
                </motion.div>

                {/* Mobile Mockup */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="lg:col-span-4 lg:-ml-12 z-10 mt-8 lg:mt-0">
                  <div className="rounded-[2rem] p-2 border border-white/10 bg-[#1a1a1a] shadow-2xl w-[220px] lg:w-[260px] mx-auto">
                    <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                      <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mobile UI" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 07. PREÁMBULO SHOWCASE MÓVIL (Fondo Blanco) */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">07</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Estrategia de Navegación
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Cada pantalla tiene un propósito claro.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* 07. SHOWCASE MÓVIL INMERSIVO */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5 overflow-hidden">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
          
          <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E2A25]/50 to-transparent opacity-80" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center w-full"
            >
              <div className="inline-flex items-center justify-center gap-3 w-full">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Arquitectura de Flujos Móviles
                </span>
                <span className="w-8 h-px bg-[#C49A44]"></span>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
              {[
                { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0 },
                { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.2 },
                { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.4 },
                { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.6 }
              ].map((mock, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.8, delay: mock.delay, type: "spring", bounce: 0.4 }} 
                  className={`z-10 ${i % 2 !== 0 ? 'md:mt-24' : ''}`}
                >
                  <div className="rounded-[2rem] p-2 border border-white/10 bg-[#1a1a1a] shadow-2xl w-[200px] lg:w-[240px] hover:-translate-y-4 transition-transform duration-500 cursor-pointer">
                    <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                      <img src={mock.img} alt={`Mobile UI ${i+1}`} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500 hover:scale-105" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 08. PREÁMBULO APLICACIÓN DE MARCA (Fondo Blanco) */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">08</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Aplicación de Marca
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Presencia editorial y materialidad.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* 08. EDITORIAL & BRAND MOCKUPS INMERSIVO */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5 overflow-hidden">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
          
          <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/95 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-60" />
          </div>

          <div className="relative z-10 p-4 md:p-8 lg:p-10 h-full flex flex-col justify-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 px-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Identidad Editorial & Señalética
                </span>
              </div>
            </motion.div>

            {/* Grid Editorial Monumental que cubre prácticamente todo el contenedor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              
              {/* Bloque Superior Panorámico / Portada con Tipografía Monumental */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-12 relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[24/9] border border-white/10 bg-black group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                  alt="Editorial Horizonte" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6 md:p-10">
                  <div className="text-right">
                    <span className="font-mono text-[9px] md:text-[11px] tracking-[0.25em] text-white/70 uppercase">Colección Residencial 2026</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-4xl sm:text-6xl md:text-8xl tracking-tight text-white font-light leading-none">
                      HORIZONTE
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-white/70 tracking-widest uppercase mt-2">
                      Arquitectura • Sofisticación • Lima
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Columna Izquierda: Mockup Tótem / Mupi Urbano Exterior */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/10] border border-white/10 bg-black group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Totem & Mupi Branding" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                  <div className="border-l-2 border-[#C49A44] pl-4">
                    <span className="font-mono text-[9px] tracking-widest text-[#C49A44] uppercase">Señalética Urbana</span>
                    <h4 className="font-serif text-xl md:text-2xl text-white mt-1">Presencia en Punto de Venta</h4>
                    <p className="font-sans text-xs text-white/60 mt-1 max-w-sm">Tótems interactivos de alta definición instalados en salas de venta y avenidas principales.</p>
                  </div>
                </div>
              </motion.div>

              {/* Columna Derecha: Detalle de Materialidad & Tag Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/10] border border-white/10 bg-black group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Detalle de Materiales y Marca" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                  <div className="border-l-2 border-white/40 pl-4">
                    <span className="font-mono text-[9px] tracking-widest text-white/50 uppercase">Materialidad & Texturas</span>
                    <h4 className="font-serif text-xl md:text-2xl text-white mt-1">Acabados y Papelería Premium</h4>
                    <p className="font-sans text-xs text-white/60 mt-1 max-w-sm">Muestrarios de acabados, brochures de lujo y certificados de propiedad grabados en relieve.</p>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* 09. PREÁMBULO EXPERIENCIA INTERACTIVA (Fondo Blanco) */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">09</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Experiencia Interactiva
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Diseño de tarjetas y micro-interacciones.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* 09. SISTEMA DE COMPONENTES INMERSIVO */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
          
          <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A44]/10 to-transparent opacity-50" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Sistema de Componentes UI
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {[
                { id: 1, type: "Apartamento", beds: "2 Hab", loc: "San Isidro", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                { id: 2, type: "Penthouse", beds: "3 Hab", loc: "Miraflores", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                { id: 3, type: "Estudio", beds: "1 Hab", loc: "Barranco", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
              ].map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: 0.2 * i }} 
                  className="col-span-1"
                >
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a] shadow-2xl relative group cursor-pointer hover:-translate-y-2 transition-transform duration-500">
                    <div className="aspect-[4/3] bg-black overflow-hidden relative">
                      <img src={item.img} alt="Propiedad" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-6 relative">
                      <div className="absolute top-0 right-6 -translate-y-1/2 w-10 h-10 bg-[#C49A44] rounded-full flex items-center justify-center text-[#0D1B17] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      </div>
                      <h4 className="font-serif text-xl mb-3 text-white group-hover:text-[#C49A44] transition-colors">{item.type}</h4>
                      <div className="flex gap-4 text-[10px] font-mono tracking-wider text-white/50 uppercase">
                        <span className="flex items-center gap-1.5"><HomeIcon /> {item.beds}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} strokeWidth={1.5} /> {item.loc}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. PREÁMBULO STACK TECNOLÓGICO (Fondo Blanco) */}
      <section className="bg-[#f8f9f7] text-[#111210] py-12 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">10</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">
                Ingeniería
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl text-[#111210]">
              Stack Tecnológico y Rendimiento.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* 10. RENDIMIENTO Y MÉTRICAS INMERSIVO */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center pt-12 pb-12 md:pb-24 px-6 md:px-12 text-white border-y border-white/5">
        {/* Fondo inmersivo parallax */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />

        {/* Contenedor central flotante oscuro */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center mt-12">
          
          <div className="absolute inset-0 z-0 overflow-hidden ring-1 ring-white/10 bg-[#0D1B17]/90 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E2A25] to-transparent opacity-80" />
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 h-full flex flex-col justify-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#C49A44]"></span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">
                  Métricas de Carga & Lighthouse
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Métricas Visuales */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-4">
                {[
                  { label: "Performance", score: "100", color: "text-green-400" },
                  { label: "Accessibility", score: "100", color: "text-green-400" },
                  { label: "Best Practices", score: "100", color: "text-green-400" },
                  { label: "SEO", score: "100", color: "text-green-400" }
                ].map((metric, i) => (
                  <div key={metric.label} className="bg-black/50 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <svg className="w-20 h-20 mb-4 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={metric.color}
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="22.5" className={`text-xs font-mono font-bold ${metric.color}`} textAnchor="middle">{metric.score}</text>
                    </svg>
                    <div className="font-mono text-[10px] tracking-widest text-white/50 uppercase">{metric.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Stack Info */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-serif text-2xl text-white">Velocidad que convierte.</h4>
                  <p className="text-white/60 text-sm leading-relaxed max-w-md">
                    El sitio carga en menos de 0.8 segundos. Utilizamos una arquitectura de componentes moderna y generación de sitios estáticos para garantizar un rendimiento óptimo y un SEO impecable.
                  </p>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-4">TECNOLOGÍAS IMPLEMENTADAS</div>
                  <div className="flex flex-wrap gap-3">
                    {['React', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Supabase', 'Vercel'].map(tech => (
                      <div key={tech} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-white/80">
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
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

      {/* ═══════════════════════════════════════════════════════════════════
          NUEVA VERSIÓN — CASE STUDY EDITORIAL QAWAY LAB
          Versión alternativa estilo Behance/Dribbble: editorial, compacto,
          fondos neutros, trabajo dentro de mockups.
          ═══════════════════════════════════════════════════════════════════ */}

      {/* — HERO EDITORIAL — */}
      <section className="bg-[#f8f9f7] text-[#111210] py-20 md:py-32 px-6">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Caso de Estudio</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-8">
              Horizonte<br/>Inmobiliaria
            </h1>
            <p className="text-sm md:text-base text-[#111210]/60 leading-relaxed max-w-xl mb-10">
              Sitio web corporativo y plataforma de captación para proyectos inmobiliarios premium. Diseño, desarrollo e integración con CRM y WhatsApp.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#111210]/10 pt-8">
              <div>
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Cliente</div>
                <div className="text-xs font-medium text-[#111210]">Horizonte Inmobiliaria</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Servicio</div>
                <div className="text-xs font-medium text-[#111210]">Web · CRM · WhatsApp</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Año</div>
                <div className="text-xs font-medium text-[#111210]">2024</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-2">Stack</div>
                <div className="text-xs font-medium text-[#111210]">React · Tailwind · Supabase</div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#111210] text-white text-xs font-bold tracking-wider hover:bg-[#111210]/80 transition-colors">
                Ver sitio en vivo <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* — MOCKUP HERO (Browser frame) — */}
      <section className="bg-[#f8f9f7] px-6 pb-20 md:pb-32">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl overflow-hidden border border-[#111210]/10 bg-white shadow-2xl"
          >
            <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-2 border-b border-[#111210]/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
              </div>
              <div className="mx-auto font-mono text-[9px] text-[#111210]/30 tracking-widest">horizonte-inmobiliaria.com</div>
            </div>
            <div className="aspect-[16/9] relative bg-[#0D1B17]">
              <img 
                src="/assets/horizonte/bg-real-estate.jpg" 
                alt="Sitio web de Horizonte Inmobiliaria — vista general" 
                loading="lazy" 
                decoding="async" 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* — CONTEXTO: EL PROBLEMA Y LA SOLUCIÓN — */}
      <section className="bg-white text-[#111210] py-20 md:py-28 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1000px] mx-auto">
          <motion.div {...fade}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">El Problema</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl leading-tight max-w-2xl mb-6">
              Dependía de métodos de venta manuales. La falta de presencia digital generaba un embudo lento, donde los prospectos perdían interés antes de recibir el primer contacto.
            </h2>
          </motion.div>

          <motion.div {...fade} className="mt-16 border-t border-[#111210]/10 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">La Solución</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl leading-tight max-w-2xl mb-6">
              Diseñamos y desarrollamos una plataforma web de alta conversión. Un canal digital sólido para perfilar prospectos de forma eficiente desde el primer clic.
            </h2>
            <div className="flex flex-wrap gap-2 mt-8">
              {['React', 'Tailwind CSS', 'Supabase', 'WhatsApp API'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full border border-[#111210]/10 text-[10px] font-mono text-[#111210]/60">{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* — IDENTIDAD VISUAL (Dentro de mockup, no inmersivo) — */}
      <section className="bg-[#f8f9f7] py-20 md:py-28 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1000px] mx-auto">
          <motion.div {...fade} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">01</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Identidad Visual</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight">Creación basada en su identidad de marca.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Tipografía */}
            <motion.div {...fade} transition={{ delay: 0.1 }}>
              <div className="mb-8">
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-3 border-b border-[#111210]/10 pb-3">Primaria</div>
                <div className="font-serif text-5xl md:text-6xl text-[#111210]">Playfair Display</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-3 border-b border-[#111210]/10 pb-3">Secundaria</div>
                <div className="font-sans text-3xl md:text-4xl text-[#111210] font-medium tracking-tight">DM Sans</div>
              </div>
            </motion.div>

            {/* Paleta */}
            <motion.div {...fade} transition={{ delay: 0.2 }}>
              <div className="font-mono text-[9px] tracking-widest text-[#111210]/40 uppercase mb-4 border-b border-[#111210]/10 pb-3">Paleta de Color</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Bosque', hex: '#0D1B17', bg: '#0D1B17', text: '#F6F4F1' },
                  { name: 'Oliva', hex: '#1E2A25', bg: '#1E2A25', text: '#F6F4F1' },
                  { name: 'Dorado', hex: '#C49A44', bg: '#C49A44', text: '#0D1B17' },
                  { name: 'Crema', hex: '#F6F4F1', bg: '#F6F4F1', text: '#0D1B17' },
                ].map(c => (
                  <div key={c.hex} className="aspect-[4/3] rounded-xl p-4 flex flex-col justify-between border border-[#111210]/5" style={{ background: c.bg }}>
                    <span className="font-serif text-xs" style={{ color: c.text }}>{c.name}</span>
                    <span className="font-mono text-[10px] uppercase" style={{ color: c.text, opacity: 0.6 }}>{c.hex}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* — SHOWCASE DESKTOP + MÓVIL (Enmarcado en fondo neutro) — */}
      <section className="bg-white py-20 md:py-28 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fade} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">02</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Ecosistema Digital</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight">Interfaces diseñadas para convertir.</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Desktop */}
            <motion.div {...fade} transition={{ delay: 0.1 }} className="lg:col-span-8">
              <div className="rounded-2xl overflow-hidden border border-[#111210]/10 bg-[#f0f0f0] shadow-xl">
                <div className="bg-[#e8e8e8] px-4 py-3 flex items-center gap-2 border-b border-[#111210]/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111210]/15" />
                  </div>
                  <div className="mx-auto font-mono text-[9px] text-[#111210]/30 tracking-widest">horizonte-inmobiliaria.com</div>
                </div>
                <div className="aspect-[16/10] relative bg-[#0D1B17]">
                  <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Vista del sitio web de Horizonte en escritorio" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
                </div>
              </div>
            </motion.div>

            {/* Mobile */}
            <motion.div {...fade} transition={{ delay: 0.2 }} className="lg:col-span-4 lg:-ml-8 z-10 mt-8 lg:mt-0">
              <div className="rounded-[2rem] p-2 border border-[#111210]/10 bg-[#1a1a1a] shadow-2xl w-[220px] lg:w-[260px] mx-auto">
                <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                  <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Vista del sitio web de Horizonte en móvil" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* — FLUJOS MÓVILES (4 mockups en fila) — */}
      <section className="bg-[#f8f9f7] py-20 md:py-28 px-6 border-t border-[#111210]/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fade} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">03</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Estrategia de Navegación</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight">Cada pantalla tiene un propósito claro.</h2>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {[
              { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0 },
              { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.1 },
              { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.2 },
              { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.3 }
            ].map((mock, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: mock.delay }}
                className={`${i % 2 !== 0 ? 'md:mt-16' : ''}`}
              >
                <div className="rounded-[2rem] p-2 border border-[#111210]/10 bg-[#1a1a1a] shadow-xl w-[180px] lg:w-[220px]">
                  <div className="aspect-[9/19] rounded-[1.5rem] overflow-hidden relative bg-[#0D1B17]">
                    <img src={mock.img} alt={`Pantalla móvil ${i + 1} del sitio Horizonte`} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* — APLICACIÓN DE MARCA (Mockups editoriales) — */}
      <section className="bg-white py-20 md:py-28 px-6 border-t border-[#111210]/5">
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fade} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">04</span>
              <span className="w-8 h-px bg-[#ff4b0b]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ff4b0b]">Aplicación de Marca</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight">Presencia editorial y materialidad.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panorámico */}
            <motion.div {...fade} transition={{ delay: 0.1 }} className="md:col-span-2 relative rounded-2xl overflow-hidden aspect-[21/9] bg-[#0D1B17] group">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Pieza editorial de marca Horizonte" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                <h3 className="font-serif text-3xl md:text-5xl text-white tracking-tight">HORIZONTE</h3>
                <p className="font-sans text-xs text-white/60 tracking-widest uppercase mt-2">Arquitectura · Sofisticación · Lima</p>
              </div>
            </motion.div>

            {/* Tótem */}
            <motion.div {...fade} transition={{ delay: 0.2 }} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0D1B17] group">
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Mockup de señalética urbana Horizonte" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="border-l-2 border-[#C49A44] pl-4">
                  <span className="font-mono text-[9px] tracking-widest text-[#C49A44] uppercase">Señalética Urbana</span>
                  <h4 className="font-serif text-lg text-white mt-1">Presencia en Punto de Venta</h4>
                </div>
              </div>
            </motion.div>

            {/* Materialidad */}
            <motion.div {...fade} transition={{ delay: 0.3 }} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0D1B17] group">
              <img src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Detalle de acabados y materiales premium Horizonte" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="border-l-2 border-white/40 pl-4">
                  <span className="font-mono text-[9px] tracking-widest text-white/50 uppercase">Materialidad</span>
                  <h4 className="font-serif text-lg text-white mt-1">Acabados y Papelería Premium</h4>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* — RESULTADOS Y MÉTRICAS — */}
      <section className="bg-[#111210] text-white py-20 md:py-28 px-6">
        <div className="max-w-[1000px] mx-auto">
          <motion.div {...fade} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">05</span>
              <span className="w-8 h-px bg-[#C49A44]"></span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C49A44]">Resultados</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight">Impacto medible.</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '3x', label: 'Aumento de leads', desc: 'En los primeros 3 meses' },
              { value: '100%', label: 'Atención automatizada', desc: 'Vía WhatsApp API' },
              { value: '-60%', label: 'Carga operativa', desc: 'Agentes enfocados en cierre' },
              { value: '<0.8s', label: 'Tiempo de carga', desc: 'Lighthouse 100/100' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border-t border-white/10 pt-6"
              >
                <div className="font-serif text-4xl md:text-5xl mb-3 text-[#C49A44]">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-[11px] text-white/50">{stat.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="mt-16 border-t border-white/10 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-serif text-2xl mb-3">Velocidad que convierte.</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  El sitio carga en menos de 0.8 segundos. Arquitectura de componentes moderna, generación estática y SEO impecable.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['React', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Supabase', 'Vercel'].map(tech => (
                  <span key={tech} className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-white/70">{tech}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* — CTA FINAL EDITORIAL — */}
      <section className="bg-[#f8f9f7] text-[#111210] py-20 md:py-28 px-6 border-t border-[#111210]/5">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div {...fade}>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
              ¿Tienes un proyecto similar en mente?
            </h2>
            <p className="text-sm text-[#111210]/60 mb-8 max-w-md mx-auto">
              Creamos sitios web, identidades y sistemas digitales adaptados a las necesidades de cada proyecto.
            </p>
            <a href="#contacto" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#111210] text-white text-xs font-bold tracking-wider hover:bg-[#111210]/80 transition-colors">
              HABLEMOS DE TU PROYECTO <ArrowUpRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VERSIÓN BEHANCE — FULL-BLEED, NARRATIVA VISUAL
          Mockups a pantalla completa, sin frames, sin numeración.
          El trabajo habla por sí solo.
          ═══════════════════════════════════════════════════════════════════ */}

      {/* — HERO FULL-BLEED — */}
      <section className="relative h-[85vh] md:h-screen w-full flex items-end">
        <img 
          src="/assets/horizonte/bg-real-estate.jpg" 
          alt="Horizonte Inmobiliaria — proyecto web corporativo" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-16 md:pb-24 max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase mb-4">Caso de Estudio</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[0.9] mb-6">
              Horizonte<br/>Inmobiliaria
            </h1>
            <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] tracking-widest text-white/50 uppercase">
              <span>Web Corporativo</span>
              <span>2024</span>
              <span>React · Tailwind · Supabase</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* — METADATA STRIP — */}
      <section className="bg-white py-10 md:py-14 px-6 md:px-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-mono text-[9px] tracking-widest text-[#111210]/30 uppercase mb-2">Cliente</div>
            <div className="text-xs text-[#111210]">Horizonte Inmobiliaria</div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest text-[#111210]/30 uppercase mb-2">Servicio</div>
            <div className="text-xs text-[#111210]">Diseño, desarrollo e integración</div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest text-[#111210]/30 uppercase mb-2">Año</div>
            <div className="text-xs text-[#111210]">2024</div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest text-[#111210]/30 uppercase mb-2">Stack</div>
            <div className="text-xs text-[#111210]">React, Tailwind, Supabase, WhatsApp</div>
          </div>
        </div>
      </section>

      {/* — TEXTO: CONTEXTO — */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-[680px] mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-[#111210] leading-relaxed"
          >
            Horizonte dependía de métodos de venta manuales. La falta de presencia digital generaba un embudo lento, donde los prospectos perdían interés antes de recibir el primer contacto. Diseñamos y desarrollamos una plataforma web de alta conversión orientada a resultados.
          </motion.p>
        </div>
      </section>

      {/* — FULL-BLEED: SITIO EN ESCRITORIO — */}
      <section className="bg-[#f0f0f0]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Sitio web de Horizonte Inmobiliaria — vista de escritorio" 
            loading="lazy" 
            decoding="async" 
            className="w-full h-auto" 
          />
        </motion.div>
      </section>

      {/* — FULL-BLEED: SITIO EN MÓVIL — */}
      <section className="bg-[#111210] py-16 md:py-24">
        <div className="max-w-[400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] p-[6px] border border-white/10 bg-[#1a1a1a] shadow-2xl"
          >
            <div className="rounded-[2rem] overflow-hidden aspect-[9/19.5] bg-[#0D1B17]">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sitio web de Horizonte Inmobiliaria — vista móvil" 
                loading="lazy" 
                decoding="async" 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* — TEXTO: IDENTIDAD — */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-[680px] mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-[#111210] leading-relaxed"
          >
            La identidad visual combina tipografía serif con una paleta de bosque profundo y dorado, transmitiendo confianza y sofisticación en cada punto de contacto.
          </motion.p>
        </div>
      </section>

      {/* — SELECCIÓN FOTOGRÁFICA (Grid 4 imágenes) — */}
      <section className="bg-[#f0f0f0]">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", span: "col-span-2 row-span-2" },
            { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", span: "" },
            { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", span: "" },
            { img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", span: "col-span-2" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`${item.span} aspect-square overflow-hidden`}
            >
              <img 
                src={item.img} 
                alt={`Arquitectura y estilo de vida Horizonte ${i + 1}`} 
                loading="lazy" 
                decoding="async" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* — FULL-BLEED: IDENTIDAD VISUAL — */}
      <section className="bg-[#0D1B17] py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="font-serif text-7xl md:text-8xl text-[#F6F4F1] leading-none mb-6">Ag</div>
            <div className="font-serif text-2xl text-[#F6F4F1] mb-2">Playfair Display</div>
            <div className="font-sans text-lg text-white/50">DM Sans</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-square rounded-2xl bg-[#0D1B17] border border-white/10 flex items-center justify-center">
              <span className="font-mono text-[10px] text-white/40">#0D1B17</span>
            </div>
            <div className="aspect-square rounded-2xl bg-[#1E2A25] border border-white/10 flex items-center justify-center">
              <span className="font-mono text-[10px] text-white/40">#1E2A25</span>
            </div>
            <div className="aspect-square rounded-2xl bg-[#C49A44] flex items-center justify-center">
              <span className="font-mono text-[10px] text-[#0D1B17]/60">#C49A44</span>
            </div>
            <div className="aspect-square rounded-2xl bg-[#F6F4F1] flex items-center justify-center">
              <span className="font-mono text-[10px] text-[#0D1B17]/60">#F6F4F1</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* — FULL-BLEED: SHOWCASE PANORÁMICO — */}
      <section className="bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Horizonte Inmobiliaria — identidad de marca aplicada" 
            loading="lazy" 
            decoding="async" 
            className="w-full h-auto" 
          />
        </motion.div>
      </section>

      {/* — FULL-BLEED: APLICACIÓN DE MARCA — */}
      <section className="bg-[#f8f9f7]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-square md:aspect-auto md:h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Señalética urbana Horizonte" 
              loading="lazy" 
              decoding="async" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="aspect-square md:aspect-auto md:h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Detalle de acabados y materiales Horizonte" 
              loading="lazy" 
              decoding="async" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        </div>
      </section>

      {/* — SHOWCASE VISUAL (Desktop + Mobile juntos) — */}
      <section className="bg-[#111210] py-20 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a]">
              <div className="bg-[#222] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/15" />
                  <div className="w-2 h-2 rounded-full bg-white/15" />
                  <div className="w-2 h-2 rounded-full bg-white/15" />
                </div>
                <div className="mx-auto font-mono text-[8px] text-white/20 tracking-widest">horizonte-inmobiliaria.com</div>
              </div>
              <div className="aspect-[16/10] relative bg-[#0D1B17]">
                <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="Vista del sitio Horizonte en escritorio" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 lg:-ml-12 z-10 mt-8 lg:mt-0"
          >
            <div className="rounded-[2.5rem] p-[6px] border border-white/10 bg-[#1a1a1a] shadow-2xl w-[220px] lg:w-[260px] mx-auto">
              <div className="rounded-[2rem] overflow-hidden aspect-[9/19.5] bg-[#0D1B17]">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Vista del sitio Horizonte en móvil" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* — FLUJOS MÓVILES (4 phones en fila) — */}
      <section className="bg-white py-20 md:py-28 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {[
              { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0 },
              { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.1 },
              { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.2 },
              { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", delay: 0.3 },
            ].map((mock, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: mock.delay }}
                className={`${i % 2 !== 0 ? 'md:mt-16' : ''}`}
              >
                <div className="rounded-[2rem] p-[5px] border border-[#111210]/10 bg-[#1a1a1a] shadow-lg w-[170px] lg:w-[210px]">
                  <div className="rounded-[1.5rem] overflow-hidden aspect-[9/19.5] bg-[#0D1B17]">
                    <img src={mock.img} alt={`Pantalla móvil ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* — EXPERIENCIA INTERACTIVA (Tarjetas de propiedades) — */}
      <section className="bg-[#f8f9f7] py-20 md:py-28 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: "Apartamento", beds: "2 Hab", loc: "San Isidro", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { type: "Penthouse", beds: "3 Hab", loc: "Miraflores", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { type: "Estudio", beds: "1 Hab", loc: "Barranco", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * i }}
              >
                <div className="rounded-xl overflow-hidden bg-white border border-[#111210]/5 shadow-sm group cursor-pointer hover:-translate-y-2 transition-transform duration-500">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={item.img} alt={`Propiedad Horizonte — ${item.type}`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5">
                    <h4 className="font-serif text-lg text-[#111210] mb-2 group-hover:text-[#C49A44] transition-colors">{item.type}</h4>
                    <div className="flex gap-4 text-[10px] font-mono tracking-wider text-[#111210]/40 uppercase">
                      <span>{item.beds}</span>
                      <span>{item.loc}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* — MÉTRICAS (Minimalistas) — */}
      <section className="bg-[#111210] py-20 md:py-28 px-6">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '3x', label: 'Leads' },
            { value: '100%', label: 'Automatización' },
            { value: '-60%', label: 'Carga operativa' },
            { value: '<0.8s', label: 'Carga' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="font-serif text-4xl md:text-5xl text-[#C49A44] mb-2">{stat.value}</div>
              <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* — STACK TECNOLÓGICO — */}
      <section className="bg-white py-16 md:py-24 px-6 border-t border-[#111210]/5">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="font-serif text-2xl md:text-3xl text-[#111210] mb-3">Velocidad que convierte.</h3>
            <p className="text-sm text-[#111210]/50">El sitio carga en menos de 0.8 segundos. Lighthouse 100/100 en todas las categorías.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {['React', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Supabase', 'Vercel', 'WhatsApp API'].map(tech => (
              <span key={tech} className="px-4 py-2 rounded-full border border-[#111210]/10 text-xs font-mono text-[#111210]/60">{tech}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* — CTA BEHANCE — */}
      <section className="bg-white py-24 md:py-32 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#111210] leading-tight mb-6">
              ¿Tienes un proyecto similar?
            </h2>
            <a href="#contacto" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#111210] text-white text-xs font-bold tracking-wider hover:bg-[#111210]/80 transition-colors">
              Hablemos <ArrowUpRight size={14} />
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

function HomeIcon() { return <div className="w-8 h-8 border border-white/40 flex items-center justify-center rounded"><Layout size={16} /></div> }
