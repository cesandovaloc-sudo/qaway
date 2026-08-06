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

export function ArchitectureSection() {
  const layers = [
    {
      title: 'Estrategia & Branding',
      description: 'Definimos tu marca, propuesta de valor y arquitectura de comunicación.',
      icon: Target,
      color: 'from-qaway-accent/20',
    },
    {
      title: 'Sistemas de Contenido',
      description: 'Creamos pipelines editoriales con IA para contenido constante y estratégico.',
      icon: Pen,
      color: 'from-blue-500/20',
    },
    {
      title: 'Visual Lab',
      description: 'Producimos activos visuales profesionales con IA y dirección creativa.',
      icon: Camera,
      color: 'from-purple-500/20',
    },
    {
      title: 'Automatización & IA',
      description: 'Implementamos workflows, agentes y soluciones IA para optimizar operaciones.',
      icon: BrainCircuit,
      color: 'from-green-500/20',
    },
    {
      title: 'Customer Systems',
      description: 'Configuramos canales de presencia, atención y conversión digital.',
      icon: Share2,
      color: 'from-amber-500/20',
    },
    {
      title: 'Growth & Analytics',
      description: 'Diseñamos funnels, medimos resultados y optimizamos para escalar.',
      icon: TrendingUp,
      color: 'from-cyan-500/20',
    },
  ]

  return (
    <section className="pt-10 pb-10 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/[0.02] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <SectionTitle
          badge="Arquitectura"
          title="Proyectos, contenido visual, automatizacion e IA"
          description="Que trabajan juntos — no por separado. Disenamos soluciones digitales para marcas, negocios y proyectos que buscan mejorar su productividad y comunicar mejor."
          align="center"
          light
        />

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200/70 text-[11px] font-bold tracking-[0.14em] uppercase text-gray-600">
            La arquitectura de la claridad
          </div>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layers.map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative"
              >
                <div className="bg-white border border-gray-200/60 rounded-2xl p-6 transition-all duration-300 hover:border-qaway-accent/30 hover:shadow-lg hover:shadow-qaway-accent/10 group cursor-default">
                  <div className={`absolute inset-0 bg-linear-to-br ${layer.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                  
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-qaway-accent/10 flex items-center justify-center mb-4">
                      <layer.icon className="w-5 h-5 text-qaway-accent-dark" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{layer.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{layer.description}</p>
                  </div>
                </div>

                {i < layers.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// ▢ LIGHT BLOCK 2 — LANDINGS
// ═══════════════════════════════════════════════════════════
