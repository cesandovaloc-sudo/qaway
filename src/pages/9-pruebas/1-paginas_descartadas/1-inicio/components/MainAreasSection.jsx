import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Bot, GraduationCap,
  Puzzle, BookOpen, Cpu, ChevronRight, CheckCircle,
  Palette, Target, TrendingUp,
  MessageSquare,
  Camera, Pen, Share2, BrainCircuit, Rocket,
  Layers, ShoppingCart, Zap, Package, Settings,
  Play, BarChart3, LayoutTemplate, Workflow, Network, Box, PenTool,
} from 'lucide-react'
import { SectionTitle } from '@/components/ui'
import { WHATSAPP_LINK } from '@/data/navigation'

// ═══════════════════════════════════════════════════════════
// ■ DARK BLOCK 1 — HERO
// ═══════════════════════════════════════════════════════════

export function MainAreasSection() {
  return (
    <section className="pt-20 pb-12 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black pointer-events-none" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="mb-12 md:w-2/3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
            Tres pilares.<br />
            Una forma de{' '}
            <span className="italic text-qaway-accent">avanzar</span>
          </h2>
          <p className="mt-6 text-zinc-300 text-lg font-light leading-relaxed">
            Nuestras capacidades integradas cubren desde la estrategia y apariencia de un proyecto hasta los sistemas operativos que lo hacen funcionar de manera eficiente.
          </p>
        </div>

        <div className="space-y-8">
          {/* Area 1 */}
          <Link to="/estudio/visual-lab" className="block">
            <div className="group bg-zinc-950/50 border border-white/10 hover:border-white/20 rounded-[2rem] p-8 md:p-12 overflow-hidden relative transition-all duration-500 shadow-2xl transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#A855F7]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/5">
                    <PenTool size={24} className="text-[#A855F7]" />
                  </div>
                  <h3 className="text-3xl font-sans font-medium mb-4 tracking-[-0.01em] text-white">Estudio & Estrategia</h3>
                  <p className="text-zinc-300 mb-8 leading-relaxed">
                    Estrategia, branding digital, contenido y diseno visual para fortalecer proyectos, marcas y profesionales, dandoles estructura y una comunicacion clara.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Estrategia Digital', 'Visual Lab', 'Branding', 'Contenido', 'Presencia Profesional'].map((tag) => (
                      <span key={tag} className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center text-qaway-accent font-bold hover:text-qaway-accent-light transition-colors">
                    Explorar Estudio <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="relative h-64 md:h-auto rounded-2xl border border-white/15 bg-black overflow-hidden p-6 flex flex-col gap-4 shadow-inner">
                  <div className="flex justify-between items-center opacity-70">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1">
<div className="bg-zinc-900 rounded-xl overflow-hidden relative border border-white/5">
                      <img src="/assets/pages/1-inicio/inicio_bloque3_estudio_img1.webp" alt="Estudio & Estrategia" className="absolute inset-0 w-full h-full object-cover transition-all duration-700 [filter:grayscale(100%)_saturate(0)_brightness(0.9)] group-hover:[filter:grayscale(0)_saturate(1)_brightness(0.8)]" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-900 rounded-xl flex-1 relative overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-linear-to-b from-[#A855F7]/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-serif font-light tracking-[0.08em] text-white/95 leading-none" style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}>
                            Aa
                          </span>
                          <div className="mt-3 w-6 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
                          <span className="mt-2 text-[9px] font-sans tracking-[0.25em] uppercase text-zinc-400/60">
                            Branding
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-900 rounded-xl flex-1 relative overflow-hidden border border-white/5">
                        <img src="/assets/pages/1-inicio/inicio_bloque3_estudio_img2.webp" alt="Estudio & Estrategia adicional" className="absolute inset-0 w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Area 2 */}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="block">
            <div className="group bg-zinc-950/50 border border-white/10 hover:border-qaway-accent/30 rounded-[2rem] p-8 md:p-12 overflow-hidden relative transition-all duration-500 shadow-2xl transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-qaway-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                <div className="order-2 md:order-1 relative h-64 md:h-auto rounded-2xl border border-white/15 bg-black overflow-hidden shadow-inner">
                  <img src="/assets/pages/1-inicio/inicio_bloque3_operaciones_img1.webp" alt="Sistemas Digitales" className="absolute inset-0 w-full h-full object-contain" />
                </div>

                <div className="order-1 md:order-2">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/5">
                    <Workflow size={24} className="text-qaway-accent" />
                  </div>
                  <h3 className="text-3xl font-sans font-medium mb-4 tracking-[-0.01em] text-white">Sistemas Digitales</h3>
                  <p className="text-zinc-300 mb-8 leading-relaxed">
                    Automatizacion, workflows, agentes IA, CRM, dashboards y soluciones digitales para mejorar procesos y acelerar la operacion diaria.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Automatizacion', 'Agentes IA', 'Workflows', 'Soluciones', 'Dashboards'].map((tag) => (
                      <span key={tag} className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center text-qaway-accent font-bold hover:text-qaway-accent-light transition-colors">
                    Explorar Sistemas Digitales <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </a>

          {/* Area 3 */}
          <Link to="/academy" className="block">
            <div className="group bg-zinc-950/50 border border-white/10 hover:border-white/20 rounded-[2rem] p-8 md:p-12 overflow-hidden relative transition-all duration-500 shadow-2xl transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#F43FB9]/20 rounded-full blur-[100px] -translate-y-1/2" />

              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/5">
                    <GraduationCap size={24} className="text-[#F43FB9]" />
                  </div>
                  <h3 className="text-3xl font-sans font-medium mb-4 tracking-[-0.01em] text-white">Academy</h3>
                  <p className="text-zinc-300 mb-8 leading-relaxed">
                    Cursos, talleres, programas e incubadora para aprender habilidades digitales, IA aplicada, marketing, estrategia y operacion.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Cursos', 'Talleres', 'Programas', 'Incubadora', 'Membresias'].map((tag) => (
                      <span key={tag} className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center text-qaway-accent font-bold hover:text-qaway-accent-light transition-colors">
                    Explorar Academy <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="relative h-64 md:h-auto rounded-2xl border border-white/15 bg-black overflow-hidden p-6 flex flex-col justify-center shadow-inner">
                  <div className="space-y-4">
                    {[1, 2, 3].map((mod, i) => (
                      <div
                        key={mod}
                        className={`bg-white/5 border p-4 rounded-xl flex items-center justify-between ${
                          i === 1
                            ? 'border-white/30 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'border-white/5'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-xs font-bold ${
                              i === 0
                                ? 'bg-qaway-accent text-black shadow-[0_0_10px_rgba(255,170,0,0.5)]'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {i === 0 ? <CheckCircle size={14} /> : mod}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white mb-1">Modulo {mod}</div>
                            <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
                              {i === 0 && <div className="h-full w-full bg-qaway-accent rounded-full" />}
                              {i === 1 && (
                                <div className="h-full w-1/2 bg-[#A855F7] rounded-full shadow-[0_0_5px_#A855F7]" />
                              )}
                            </div>
                          </div>
                        </div>
                        {i === 1 && <Play size={16} className="text-white" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE — Alternating Dark / Light blocks
// ═══════════════════════════════════════════════════════════
