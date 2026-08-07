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

export function CTASection() {
  return (
    <section className="pt-10 pb-10 relative bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] bg-qaway-accent/10 blur-[140px] rounded-full" />
        <div className="absolute -bottom-44 -right-44 w-[640px] h-[640px] bg-white/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-linear-to-b from-white/[0.04] via-transparent to-white/[0.02]" />
      </div>

      <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-black/70 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-12 md:p-20 relative overflow-hidden"
        >
          {/* Top glow — gold */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-linear-to-r from-transparent via-qaway-accent/40 to-transparent" />

          {/* Gold glow orb */}
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-qaway-accent/5 rounded-full blur-[100px]" />

          <h2 className="text-display-sm md:text-display-md font-bold text-white tracking-tight mb-6 text-balance relative z-10">
            ¿Listo para construir<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-qaway-accent via-[#F5D44A] to-qaway-accent">
              tu ecosistema digital
            </span>
            ?
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed relative z-10">
            Conversemos sobre lo que tu negocio necesita para mejorar su productividad, 
            comunicación y operación digital.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-qaway-accent text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-[#F5D44A] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-qaway-accent/25 hover:shadow-qaway-accent/40 hover:scale-[1.02]"
            >
              Agendar llamada
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/recursos"
              className="px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm text-zinc-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              Explorar recursos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Positioning + structure blocks
