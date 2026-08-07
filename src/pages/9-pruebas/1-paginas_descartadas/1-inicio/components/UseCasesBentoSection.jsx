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

export function UseCasesBentoSection() {
  const cards = [
    {
      title: 'Profesionales que quieren trabajar mejor',
      desc: 'Aprende IA, productividad, automatizacion y herramientas digitales para ahorrar tiempo y aumentar tu valor profesional.',
      tag: 'Habilidades',
      icon: Zap,
    },
    {
      title: 'Profesionales que quieren construir marca personal',
      desc: 'Mejora tu presencia digital, contenido, perfil profesional y posicionamiento sin depender de promesas vacias de viralidad.',
      tag: 'Posicionamiento',
      icon: Target,
    },
    {
      title: 'Emprendedores que quieren lanzar una idea',
      desc: 'Ordena tu propuesta, identidad, contenido, landing, herramientas y primeros sistemas de captacion.',
      tag: 'Lanzamiento',
      icon: Layers,
    },
    {
      title: 'Negocios que necesitan ordenar procesos',
      desc: 'Automatiza tareas, centraliza informacion, crea flujos de trabajo y reduce friccion operativa.',
      tag: 'Sistemas Digitales',
      icon: Workflow,
    },
    {
      title: 'Marcas que necesitan contenido y presencia',
      desc: 'Crea piezas visuales, guiones, carruseles, videos, recursos y sistemas de contenido con apoyo de IA.',
      tag: 'Estudio + IA',
      icon: PenTool,
    },
    {
      title: 'Equipos que necesitan datos y control',
      desc: 'Implementa CRM, dashboards, reportes e indicadores para tomar mejores decisiones.',
      tag: 'Sistemas',
      icon: BarChart3,
    },
  ]

  return (
    <section className="pt-12 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black text-balance">
            Qaway Lab se adapta a la etapa de tu proyecto.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-8 group hover:border-qaway-accent/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0 group-hover:bg-qaway-accent transition-colors duration-300 shadow-md">
                  <card.icon size={22} className="text-white group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-black mb-1">
                    {card.tag}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-qaway-accent-dark">
                    {card.title}
                  </span>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed mt-3">
                    {card.desc}
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

