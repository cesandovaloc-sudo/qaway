import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
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

export function HeroSection() {
  // Optimización: Usar variables de movimiento de framer para evitar re-renders
  const mouseX = useMotionValue(80)
  const mouseY = useMotionValue(50)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(400px circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.95) 10%, rgba(255,255,255,0.6) 40%, transparent 50%)`

  return (
    <section
      className="min-h-screen relative flex items-center pt-32 bg-[#0a0a0c] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Base Background Image: Oscuridad en 0.2 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}assets/pages/1-inicio/inicio_hero_bg.webp")`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.2)', // Oscuridad solicitada (0.2)
          }}
        />
      </div>

      {/* Spotlight Effect (Soft light overlay con bordes más definidos) */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none mix-blend-overlay transition-opacity duration-150"
        style={{
          background: spotlightBackground,
        }}
      />

      {/* Gradient to ensure text readability on the left */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.6) 40%, transparent 100%)',
        }}
      />

      {/* Noise texture for cinematic feel */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.25] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

		<div className="max-w-7xl mx-auto px-8 relative z-10 w-full pt-10 pb-28">
		<div className="flex items-center">
          {/* Main Copy */}
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <span className="text-xs font-medium tracking-[0.1em] text-zinc-400">PROYECTOS DIGITALES</span>
                </div>
              </div>

			<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8 text-balance">
				Creamos{' '}
				<span className="text-qaway-accent">
					Proyectos Digitales
				</span>
				y Soluciones con{' '}
				<span className="text-qaway-accent">
					IA
				</span>
			</h1>
            </motion.div>

			<motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.25 }}
              className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed font-light"
            >
				Para profesionales, marcas, negocios y proyectos que buscan eficiencia, mejor comunicacion y procesos digitales mas claros.
			</motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.4 }}
              className="flex flex-wrap gap-5 mt-8"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-qaway-accent text-black px-8 py-4 rounded-[12px] font-semibold transition-all duration-300 flex items-center gap-3 active:scale-[0.97] hover:bg-[#eab308]/90"
              >
                <span className="relative z-10 text-[13px] tracking-wider uppercase font-bold">Agenda una llamada</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 relative z-10 transition-transform duration-300" />
              </a>

              <a
                href="#ecosistema"
                className="px-8 py-4 rounded-[12px] font-semibold text-zinc-300 border border-white/10 hover:bg-white/[0.04] transition-all duration-300 text-[13px] tracking-wider uppercase active:scale-[0.97] bg-black/40 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                Conocer el ecosistema
              </a>
            </motion.div>
          </div>
        </div>
		</div>
	</section>
	)
}