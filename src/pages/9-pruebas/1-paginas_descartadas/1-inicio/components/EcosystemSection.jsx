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

export function EcosystemSection() {
  const areas = [
    {
      icon: Palette,
      title: 'Estudio',
      description: 'Construcción visual, branding digital, contenido, dirección creativa y estrategia digital para marcas modernas.',
      path: '/estudio',
      gradient: 'from-qaway-accent/20',
      light: 'bg-qaway-accent/10',
    },
    {
      icon: Cpu,
      title: 'Sistemas Digitales',
      description: 'Automatización, workflows, agentes IA, soluciones inteligentes y operación digital para optimizar procesos.',
      path: '/sistemas-digitales',
      gradient: 'from-purple-500/20',
      light: 'bg-purple-500/10',
    },
    {
      icon: GraduationCap,
      title: 'Academy',
      description: 'Plataforma educativa con cursos, talleres, programas e incubadora para formación digital práctica.',
      path: '/academy',
      gradient: 'from-blue-500/20',
      light: 'bg-blue-500/10',
    },
    {
      icon: Puzzle,
      title: 'Qaway Hub',
      description: 'Herramientas guiadas, rutas progresivas, dashboards y soluciones modulares para tu ecosistema digital.',
      path: '/hub',
      gradient: 'from-green-500/20',
      light: 'bg-green-500/10',
    },
    {
      icon: BookOpen,
      title: 'Recursos',
      description: 'Plantillas, guías, prompts, checklists y scripts prácticos para acelerar tu operación digital.',
      path: '/recursos',
      gradient: 'from-amber-500/20',
      light: 'bg-amber-500/10',
    },
    {
      icon: MessageSquare,
      title: 'Blog',
      description: 'Análisis, tendencias, tutoriales y estrategia sobre IA, marketing, branding y automatización.',
      path: '/blog',
      gradient: 'from-cyan-500/20',
      light: 'bg-cyan-500/10',
    },
  ]

  return (
    <section className="pt-10 pb-10 bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header removed: redundant with La Arquitectura block */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {areas.map((area, i) => (
            <Link key={i} to={area.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative bg-white border border-gray-200/60 hover:border-qaway-accent/30 rounded-2xl p-6 md:p-8 transition-all duration-500 h-full shadow-sm hover:shadow-qaway-accent/10 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${area.light} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <area.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-qaway-accent-dark transition-colors">
                    {area.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {area.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-qaway-accent-dark transition-colors">
                    Explorar <ChevronRight className="w-3 h-3" />
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
// ■ DARK BLOCK 2 — SERVICES
// ═══════════════════════════════════════════════════════════