import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Layout, Megaphone, GraduationCap, FlaskConical,
  Users, Zap, ArrowRight,
} from 'lucide-react'
import { SectionTitle } from '@/components/ui'

const landings = [
  { icon: Layout, title: 'Landing de Servicio', description: 'Páginas específicas para presentar y vender servicios profesionales.', path: '#' },
  { icon: Megaphone, title: 'Landing de Campaña', description: 'Páginas optimizadas para campañas publicitarias y captación.', path: '#' },
  { icon: GraduationCap, title: 'Landing de Curso', description: 'Páginas de venta para cursos, talleres y programas educativos.', path: '#' },
  { icon: FlaskConical, title: 'Landing de Incubadora', description: 'Páginas para programas de incubación y acompañamiento.', path: '#' },
  { icon: Users, title: 'Landing de Captación', description: 'Páginas diseñadas para convertir visitantes en leads.', path: '#' },
  { icon: Zap, title: 'Landing de Automatización', description: 'Páginas para soluciones de automatización y productividad.', path: '#' },
]

export default function LandingsPage() {
  return (
    <>
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-pink-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <SectionTitle
            badge="Landings"
            title="Páginas enfocadas en conversión"
            description="Landings diseñadas para vender, captar leads o promocionar campañas con control visual total."
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landings.map((landing, i) => (
              <Link key={i} to={landing.path}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500/20 to-transparent border border-pink-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <landing.icon className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">{landing.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{landing.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-pink-400 transition-colors">
                    Ver landing <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
