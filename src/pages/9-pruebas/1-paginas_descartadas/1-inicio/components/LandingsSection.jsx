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

export function LandingsSection() {
  const landings = [
    {
      icon: BookOpen,
      title: 'Kit Notion — Sistema de Contenidos',
      description: 'Planifica, ejecuta y controla 30 días de contenido en menos de 1 hora con nuestro sistema estratégico en Notion.',
      path: '/landings/notion',
    },
    {
      icon: Palette,
      title: 'Curso — Identidad Visual con IA',
      description: 'Aprende a crear logos, paletas de colores y tu kit de marca profesional usando las mejores herramientas de IA y diseño.',
      path: '/landings/identidad-visual',
    },
  ]

  return (
    <section className="pt-10 pb-10 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <SectionTitle
          badge="Destacados"
          title="Productos y recursos destacados"
          description="Accesos directos a lo mas importante del ecosistema: kits, cursos y paginas clave."
          align="center"
          light
          size="sm"
        />

        <div className="mt-10 relative max-w-5xl mx-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {landings.map((landing, i) => (
              <Link key={i} to={landing.path} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  whileHover={{ y: -6, transition: { duration: 0.15, ease: "easeOut" } }}
                  className="group relative bg-white border border-gray-200/60 hover:border-gray-300 rounded-2xl p-6 transition-all duration-150 h-full overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-qaway-accent/10 border border-qaway-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <landing.icon className="w-6 h-6 text-qaway-accent-dark" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-qaway-accent-dark transition-colors" />
                    </div>

                    <h3 className="mt-5 text-[16px] font-bold text-gray-900 leading-snug group-hover:text-qaway-accent-dark transition-colors">
                      {landing.title}
                    </h3>
                    <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                      {landing.description}
                    </p>
                    <div className="mt-5 text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-qaway-accent-dark transition-colors">
                      Ir a la landing
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-qaway-accent/[0.03] to-transparent rounded-bl-[100px]" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// ■ DARK BLOCK 3 — CTA
// ═══════════════════════════════════════════════════════════