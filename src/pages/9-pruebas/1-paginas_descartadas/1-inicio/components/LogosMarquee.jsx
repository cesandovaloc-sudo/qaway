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

export function LogosMarquee() {
  const logos = ['Mercado Libre', 'Rappi', 'Globant', 'PedidosYa', 'Falabella', 'Tiendanube', 'BBVA']
  const row = [...logos, ...logos]

  return (
    <section className="bg-white pb-10">
      <div className="max-w-7xl mx-auto px-8">
        {/* Intentionally minimal: let logos speak */}

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

          <div className="flex gap-10 whitespace-nowrap will-change-transform animate-[qaway-marquee_28s_linear_infinite]">
            {row.map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center justify-center min-w-[140px] h-10">
                <span className="text-black/35 font-semibold tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
