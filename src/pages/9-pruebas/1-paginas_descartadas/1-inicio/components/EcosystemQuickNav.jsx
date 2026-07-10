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

export function EcosystemQuickNav() {
  const items = [
    {
      title: 'Estudio',
      desc: 'Identidad, contenido y presencia.',
      to: '/estudio',
      accent: 'from-black/[0.06]',
      icon: Palette,
    },
    {
      title: 'Sistemas Digitales',
      desc: 'Automatizacion, workflows, agentes.',
      to: '/sistemas-digitales',
      accent: 'from-black/[0.06]',
      icon: Cpu,
    },
    {
      title: 'Academy',
      desc: 'Cursos, talleres y programas.',
      to: '/academy',
      accent: 'from-black/[0.06]',
      icon: GraduationCap,
    },
    {
      title: 'Qaway Hub',
      desc: 'Rutas guiadas y dashboards.',
      to: '/hub',
      accent: 'from-black/[0.06]',
      icon: Puzzle,
    },
    {
      title: 'Recursos',
      desc: 'Plantillas, guias y prompts.',
      to: '/recursos',
      accent: 'from-black/[0.06]',
      icon: BookOpen,
    },
    {
      title: 'Blog',
      desc: 'Ideas, analisis y tutoriales.',
      to: '/blog',
      accent: 'from-black/[0.06]',
      icon: MessageSquare,
    },
  ]

  return (
    <section className="pt-10 pb-10 bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] bg-qaway-accent/10 blur-[140px] rounded-full" />
        <div className="absolute -bottom-48 -left-40 w-[680px] h-[680px] bg-black/[0.03] blur-[160px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.10) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black text-balance">
            Elige tu siguiente paso
          </h2>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed text-black/60 max-w-2xl mx-auto">
            No es un catalogo de servicios. Es una estructura para construir, ordenar y operar tu presencia digital.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {items.map((it) => (
            <Link
              key={it.title}
              to={it.to}
              className="group relative overflow-hidden rounded-[15px] border border-black/10 bg-[#f3f4f6] text-black p-6 transition-all duration-500 shadow-card hover:-translate-y-1 hover:bg-white"
            >
              {/* Soft gradient + subtle pattern */}
              <div className={`absolute inset-0 bg-gradient-to-br ${it.accent} to-transparent opacity-60`} />
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.16) 1px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[16px] font-black tracking-tight">{it.title}</div>
                    <div className="mt-1 text-[13px] text-black/60 leading-snug">{it.desc}</div>
                  </div>
                  <div className="w-11 h-11 rounded-[14px] bg-white/60 border border-black/10 flex items-center justify-center text-qaway-accent group-hover:scale-110 transition-transform duration-300">
                    <it.icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/50 group-hover:text-qaway-accent transition-colors">
                  Ver area <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
