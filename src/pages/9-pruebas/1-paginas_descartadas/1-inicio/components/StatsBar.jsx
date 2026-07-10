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

export function StatsBar() {
  const stats = [
    { value: '+5', suffix: 'anos de experiencia' },
    { value: '24/7', suffix: 'Atencion' },
    { value: '+120', suffix: 'Assets y producciones' },
    { value: '98%', suffix: 'Satisfaccion de clientes' },
  ]

  return (
    <section className="relative z-30 bg-transparent -mt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Straddle between hero and next block using negative margin */}
        <div className="relative">
          {/* Border like a premium card (subtle gradient) */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-transparent shadow-elevated">
            <div className="relative rounded-3xl overflow-hidden bg-[#1b1b1f]">
              {/* Soft surface + noise */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.10] via-white/[0.06] to-transparent" />
              <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(1100px_420px_at_15%_0%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(900px_360px_at_85%_120%,rgba(255,255,255,0.10),transparent_55%)]" />
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.20) 1px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              />

              <div className="relative grid lg:grid-cols-12 gap-8 items-center px-8 py-8">
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.suffix} className="min-w-0">
                  <div className="text-white font-black tracking-tight text-[32px]">
                    <span className="tabular-nums" data-qaway-count="true" data-qaway-to={s.value}>
                      0
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/55 mt-1 leading-snug">{s.suffix}</div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 flex items-center gap-4 border-t border-white/10 pt-5 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-6">
              {/* Realistic avatar */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80"
                  alt="Cliente"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="relative text-[12px] text-white/80 leading-snug">
                  <span
                    className="absolute left-0 top-0 -translate-x-1 -translate-y-5 text-[64px] leading-none text-qaway-accent/95 select-none font-sans"
                    aria-hidden="true"
                  >
                    “
                  </span>
                  <span className="block pl-7">
                    Pasamos a operar nuestra marca de forma mas organizada y aplicando IA
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-[11px] text-white/85 font-semibold truncate">Diana Soto</div>
                  <span className="text-white/20">•</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
)
}
