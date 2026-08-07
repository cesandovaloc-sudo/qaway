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

export function ServicesArchitectureSection() {
  const blocks = [
    {
      title: 'Visual Lab',
      eyebrow: 'CENTRAL CORE',
      description:
        'Identidad visual y produccion de activos con un sistema de diseno que proyecta autoridad y vanguardia.',
      items: ['Identidad visual', 'Imagen profesional IA', 'Produccion visual', 'Video con IA', 'Assets creativos'],
      icon: Palette,
      to: '/estudio/visual-lab',
      bgImage:
        'url("https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=900")',
      variant: 'tall',
    },
    {
      title: 'Automatizacion IA',
      eyebrow: 'OPERACIONES',
      description:
        'Workflows inteligentes, agentes e integraciones para reducir tareas repetitivas y ordenar la operacion.',
      items: ['Workflows inteligentes', 'Agentes IA', 'Automatizacion de procesos', 'Integraciones', 'Dashboards'],
      icon: Bot,
      to: '/sistemas-digitales/automatizacion',
      bgImage:
        'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=900")',
      variant: 'wide',
    },
    {
      title: 'Estrategia Digital',
      eyebrow: 'ESTRATEGIA',
      description:
        'Sistemas de contenido, arquitectura de comunicacion y medicion para crecer con claridad.',
      items: ['Branding digital', 'Sistemas de contenido', 'Customer Systems', 'Growth', 'Analytics'],
      icon: Target,
      to: '/estudio/estrategia-digital',
      bgImage:
        'url("https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=900")',
      variant: 'small',
    },
    {
      title: 'Productos Digitales',
      eyebrow: 'PLUG AND PLAY',
      description:
        'Kits y plantillas listas para implementar y acelerar tu ejecucion.',
      items: ['Kits Notion', 'Plantillas', 'Dashboards', 'Frameworks', 'Herramientas IA'],
      icon: ShoppingCart,
      to: '/hub',
      bgImage:
        'url("https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&q=80&w=900")',
      variant: 'accent',
    },
  ]

  return (
    <section className="pt-10 pb-10 bg-black relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[680px] h-[680px] bg-qaway-accent/10 blur-[160px] rounded-full" />
        <div className="absolute -bottom-52 -left-48 w-[740px] h-[740px] bg-white/5 blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-linear-to-b from-white/[0.03] via-transparent to-white/[0.02]" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <SectionTitle
          badge="Servicios"
          title="Soluciones que se conectan"
          description="No trabajamos servicios aislados. Construimos sistemas donde estrategia, produccion, automatizacion y medicion funcionan integrados."
        />

        <div className="mt-10 grid md:grid-cols-3 gap-4 auto-rows-[280px]">
          {blocks.map((b, idx) => {
            const className =
              b.variant === 'tall'
                ? 'md:col-span-1 md:row-span-2'
                : b.variant === 'wide'
                  ? 'md:col-span-2 md:row-span-1'
                  : 'md:col-span-1 md:row-span-1'

            const base =
              b.variant === 'accent'
                ? 'bg-qaway-accent hover:bg-qaway-accent-light border border-qaway-accent/30'
                : 'bg-[#101012] border border-white/10 hover:border-white/20'

            const textTitle = b.variant === 'accent' ? 'text-black' : 'text-white'
            const textBody = b.variant === 'accent' ? 'text-black/80' : 'text-white/70'
            const eyebrow = b.variant === 'accent' ? 'text-black/60' : 'text-qaway-accent'

            return (
              <Link key={b.title} to={b.to} className={className}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.06 }}
                  whileHover={{ y: -6 }}
                  className={`group p-8 rounded-[15px] ${base} transition-all duration-500 flex flex-col relative overflow-hidden h-full`}
                >
                {b.variant !== 'accent' && (
                  <>
                    <div className="absolute inset-0 z-0 grayscale opacity-15" style={{ backgroundImage: b.bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0 bg-linear-to-b from-black/85 via-black/55 to-black/90 z-10" />
                    <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-black/40 z-10" />
                  </>
                )}

                <div className="relative z-20 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase mb-4 block ${eyebrow}`}>{b.eyebrow}</span>
                      <h3 className={`font-bold mb-3 ${textTitle} ${b.variant === 'tall' ? 'text-3xl' : 'text-2xl'}`}>{b.title}</h3>
                      <p className={`text-sm leading-relaxed mb-5 ${textBody}`}>{b.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${b.variant === 'accent' ? 'bg-black/10' : 'bg-white/5 border border-white/10'}`}>
                      <b.icon className={`w-6 h-6 ${b.variant === 'accent' ? 'text-black' : 'text-qaway-accent'}`} />
                    </div>
                  </div>

                  <ul className={`mt-2 space-y-2 ${b.variant === 'accent' ? 'text-black/80' : 'text-white/70'}`}>
                    {(b.variant === 'tall' ? b.items : b.items.slice(0, 2)).map((it) => (
                      <li key={it} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${b.variant === 'accent' ? 'text-black/60' : 'text-qaway-accent/70'}`} />
                        <span className="truncate">{it}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-auto pt-6 text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 ${b.variant === 'accent' ? 'text-black/70 group-hover:text-black' : 'text-white/50 group-hover:text-qaway-accent'}`}>
                    Explorar <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}


// ═══════════════════════════════════════════════════════════
// ▢ LIGHT BLOCK 1 — STATS
// ═══════════════════════════════════════════════════════════
