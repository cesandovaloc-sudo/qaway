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

export function SystemRoadmapSection() {
  const steps = [
    {
      num: '01',
      title: 'Construccion de proyectos',
      desc: 'Estructuramos ideas, marcas y propuestas para generar presencia digital con proposito y claridad.',
      tag: 'Diagnostico y estrategia',
      icon: LayoutTemplate,
    },
    {
      num: '02',
      title: 'Automatizacion y procesos',
      desc: 'Detectamos tareas repetitivas y disenamos flujos para optimizar tiempo, reducir errores y mejorar la operacion.',
      tag: 'Orden y eficiencia',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Formacion estructurada',
      desc: 'Te acompanamos a entender, aplicar y dominar herramientas digitales e IA con un enfoque practico y real.',
      tag: 'Aprendizaje aplicado',
      icon: GraduationCap,
    },
    {
      num: '04',
      title: 'Analisis y Resultados',
      desc: 'Centralizamos tus metricas en dashboards interactivos para que midas impacto y tomes mejores decisiones.',
      tag: 'Medicion y control',
      icon: BarChart3,
    },
  ]

  const benefits = [
    { icon: Target, title: 'Enfoque estrategico', desc: 'Cada proyecto comienza con un objetivo claro.' },
    { icon: BarChart3, title: 'Resultados medibles', desc: 'Medimos impacto para mejorar continuamente.' },
    { icon: Workflow, title: 'Eficiencia operativa', desc: 'Automatizamos para liberar tiempo y recursos.' },
    { icon: TrendingUp, title: 'Crecimiento sostenible', desc: 'Construimos sistemas que se adaptan y escalan.' },
  ]

  // Controls the perceived “sequence”: top cards first, then bottom connectors + benefits.
  const BOTTOM_SEQUENCE_DELAY_S = 0.3

  return (
    <section id="ecosistema" className="relative bg-white pt-12 pb-20 overflow-hidden">
      {/* Subtle dotted accents */}
      <div
        className="pointer-events-none absolute left-10 top-14 hidden md:block opacity-40"
        style={{
          width: 120,
          height: 60,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,138,32,0.55) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 top-14 hidden md:block opacity-40"
        style={{
          width: 120,
          height: 60,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,138,32,0.55) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black text-balance">
            Un sistema para construir presencia, operacion y aprendizaje combinando estrategia,{' '}
            <span className="text-qaway-accent">IA aplicada</span> y diseno.
          </h2>
        </motion.div>

        <div className="mt-12 relative">
          {/* top connector line */}
          <div className="absolute left-0 right-0 top-6 hidden lg:block" aria-hidden="true">
            <motion.div
              className="h-px w-full bg-qaway-accent/35 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.num}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: idx * 0.1 }}
              >
                {/* icon node (sequence: left -> right) */}
                <div
                  className="relative z-10 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-white border border-qaway-accent/20 shadow-[0_10px_30px_rgba(200,138,32,0.18)] grid place-items-center transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_42px_rgba(200,138,32,0.25)] group-hover:border-qaway-accent/45 group-hover:bg-qaway-accent/10">
                    <s.icon className="w-8 h-8 text-black transition-all duration-300 group-hover:brightness-90" />
                  </div>

                  {/* chevron between nodes */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center absolute left-[calc(100%-8px)] top-1/2 -translate-y-1/2 text-black/40">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* card (follows its icon) */}
                <div
                  className="mt-6 rounded-2xl bg-white border border-black/5 shadow-[0_18px_55px_rgba(0,0,0,0.10)] px-8 pt-8 pb-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="h-full flex flex-col lg:min-h-[340px]">
                    <div className="text-qaway-accent font-black tracking-tighter text-4xl opacity-50 mb-1">{s.num}</div>
                    <div className="mt-3 text-xl font-bold text-black leading-snug">{s.title}</div>
                    <div className="mt-4 text-sm text-black/60 leading-relaxed">{s.desc}</div>

                    <div className="mt-6 flex items-center justify-center">
                      <div className="h-px w-12 bg-qaway-accent/70" />
                    </div>

                    <div className="mt-auto pt-6 flex items-center gap-2 text-sm text-black/70">
                      <span className="w-2 h-2 rounded-full bg-qaway-accent" />
                      <span>{s.tag}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-14 rounded-2xl bg-white border border-black/5 shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/5">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="p-7 flex gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-full bg-qaway-accent/10 grid place-items-center shrink-0">
                  <b.icon className="w-6 h-6 text-black" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-black">{b.title}</div>
                  <div className="mt-1 text-sm text-black/60 leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
