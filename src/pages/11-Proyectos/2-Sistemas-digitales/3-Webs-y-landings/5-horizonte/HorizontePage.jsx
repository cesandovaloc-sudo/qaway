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

      {/* — HERO EDITORIAL — */}
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

      {/* — HERO INMERSIVO CON VIDEO — */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-end pt-12 pb-12 md:pb-24 px-6 md:px-12">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <img 
            src="/assets/horizonte/bg-real-estate.jpg" 
            alt="Fondo edificio"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-end">
          
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
              { img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
            ].map((mock, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`${i % 2 !== 0 ? 'md:mt-16' : ''}`}
              >
                <div className="rounded-[2rem] p-[5px] border border-[#111210]/10 bg-[#1a1a1a] shadow-lg w-[170px] lg:w-[210px] hover:shadow-xl transition-shadow duration-500">
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
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="rounded-xl overflow-hidden bg-white border border-[#111210]/5 shadow-sm group cursor-pointer hover:-translate-y-1 transition-all duration-500 ease-out">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={item.img} alt={`Propiedad Horizonte — ${item.type}`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
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
