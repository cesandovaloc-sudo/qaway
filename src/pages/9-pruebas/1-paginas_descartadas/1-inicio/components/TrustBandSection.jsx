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

export function TrustBandSection() {
  return (
    <section className="bg-white pt-10 pb-10 border-b border-black/5 relative z-20">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-center text-xl md:text-2xl font-display text-black font-medium tracking-[-0.015em] mb-10 max-w-3xl mx-auto">
          Un sistema para construir presencia, operacion y aprendizaje combinando estrategia, IA aplicada y diseno.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: LayoutTemplate, text: 'Construccion de proyectos' },
            { icon: Zap, text: 'Automatizacion y procesos' },
            { icon: GraduationCap, text: 'Formacion estructurada' },
            { icon: Network, text: 'Sistemas digitales' },
          ].map((item) => (
            <div key={item.text} className="flex flex-col items-center justify-center text-center group">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-black/10 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                <item.icon size={20} className="text-black" />
              </div>
              <span className="text-sm font-bold text-black/80">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
