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

export function ServicesSection() {
  const services = [
    {
      icon: Palette,
      title: 'Visual Lab',
      items: ['Identidad visual', 'Imagen profesional IA', 'Producción visual', 'Video con IA', 'Assets creativos'],
      path: '/estudio/visual-lab',
    },
    {
      icon: Bot,
      title: 'Automatización IA',
      items: ['Workflows inteligentes', 'Agentes IA', 'Automatización de procesos', 'Integraciones', 'Dashboards'],
      path: '/sistemas-digitales/automatizacion',
    },
    {
      icon: Target,
      title: 'Estrategia Digital',
      items: ['Branding digital', 'Sistemas de contenido', 'Customer Systems', 'Growth', 'Analytics'],
      path: '/estudio/estrategia-digital',
    },
    {
      icon: Rocket,
      title: 'Productos Digitales',
      items: ['Kits Notion', 'Plantillas', 'Dashboards', 'Frameworks', 'Herramientas IA'],
      path: '/hub',
    },
  ]

  return (
    <section className="pt-6 pb-10 bg-white relative overflow-hidden">
      {/* Premium gradients so black isn't flat */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-qaway-accent/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-[620px] h-[620px] bg-black/[0.03] blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-linear-to-b from-black/[0.02] via-transparent to-black/[0.01]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(232,168,48,0.03)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(232,168,48,0.02)_0%,_transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <SectionTitle
          badge="Servicios"
          title="Soluciones que se conectan"
          description="No trabajamos servicios aislados. Construimos sistemas donde estrategia, produccion, automatizacion y medicion funcionan integrados."
          light
        />

        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <Link key={i} to={service.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-white border border-black/10 hover:border-qaway-accent/30 rounded-2xl p-8 transition-all duration-500 shadow-card"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-qaway-accent/20 to-transparent border border-qaway-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-7 h-7 text-qaway-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-qaway-accent transition-colors">
                      {service.title}
                    </h3>
                    <ul className="space-y-2">
                      {service.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-black/60">
                          <CheckCircle className="w-3.5 h-3.5 text-qaway-accent/80 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// ▢ LIGHT BLOCK 2 — ARCHITECTURE
// ═══════════════════════════════════════════════════════════
