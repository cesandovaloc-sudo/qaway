import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  Camera, Video, Image, FileText, Music,
  Edit3, Play, Smartphone, Monitor, ArrowRight,
} from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'

const services = [
  {
    icon: Play,
    title: 'Reels y Shorts',
    description: 'Creamos videos cortos de alto impacto para Instagram, TikTok y YouTube Shorts con narrativa visual.',
  },
  {
    icon: Image,
    title: 'Carruseles estratégicos',
    description: 'Diseñamos carruseles informativos y visuales que educan, enganchan y convierten.',
  },
  {
    icon: Edit3,
    title: 'Edición visual profesional',
    description: 'Edición y post-producción de contenido visual con calidad profesional y estilo moderno.',
  },
  {
    icon: Video,
    title: 'Contenido multimedia',
    description: 'Producimos piezas que integran video, imagen, texto y motion graphics en un solo formato.',
  },
  {
    icon: FileText,
    title: 'Contenido educativo',
    description: 'Transformamos conocimiento en contenido visual claro, didáctico y atractivo para tu audiencia.',
  },
  {
    icon: Smartphone,
    title: 'Contenido para captación',
    description: 'Piezas visuales diseñadas específicamente para atraer, retener y convertir tu audiencia.',
  },
  {
    icon: Monitor,
    title: 'Formatos visuales modernos',
    description: 'Exploramos y aplicamos los formatos visuales más efectivos del momento en cada plataforma.',
  },
  {
    icon: Music,
    title: 'Audio y sonido',
    description: 'Selección y edición de audio, música y efectos sonoros que potencian el contenido visual.',
  },
]

const formats = [
  { name: 'Reels', time: '15-60 seg', platform: 'Instagram / TikTok' },
  { name: 'Shorts', time: '15-60 seg', platform: 'YouTube' },
  { name: 'Carruseles', time: '5-10 slides', platform: 'Instagram / LinkedIn' },
  { name: 'Video Corporativo', time: '1-3 min', platform: 'Web / YouTube' },
  { name: 'Motion Graphics', time: '15-30 seg', platform: 'Todas las plataformas' },
  { name: 'Contenido Estático', time: 'Formato único', platform: 'Redes / Web' },
]

export default function ContenidoVisualPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-600/10 via-qaway-accent/5 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionTitle
              badge="Contenido Visual"
              title="Creación estratégica de contenido para plataformas digitales"
              description="No solo producimos piezas visuales. Construimos formatos claros, modernos y adaptables que conectan con tu audiencia y generan resultados."
            />
            <div className="flex flex-wrap gap-4 mt-8">
// <Button variant="primary" size="lg" href="#servicios">Ver formatos</Button> (Hidden until services page ready)
              <Button variant="secondary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20crear%20contenido%20visual%20para%20mis%20redes">Comenzar proyecto</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '50+', label: 'Formatos disponibles' },
              { value: '10×', label: 'Más engagement' },
              { value: '24h', label: 'Entrega rápida' },
              { value: '100%', label: 'Personalizado' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-qaway-accent mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Formats Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Formatos" title="Tipos de contenido que creamos" description="Cada formato está diseñado para maximizar el impacto en su plataforma." align="center" size="qw" />
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-3 gap-px bg-white/5">
              {['Formato', 'Duración', 'Plataforma'].map((h, i) => (
                <div key={i} className="bg-[#1a1a1a] px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">{h}</div>
              ))}
              {formats.map((f, i) => (
                <Fragment key={i}>
                  <div className="bg-[#1a1a1a] px-6 py-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-qaway-accent/40" />
                    <span className="text-sm text-white">{f.name}</span>
                  </div>
                  <div className="bg-[#1a1a1a] px-6 py-4 text-sm text-zinc-400">{f.time}</div>
                  <div className="bg-[#1a1a1a] px-6 py-4 text-sm text-zinc-400">{f.platform}</div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Servicios" title="Todo lo que necesitas para tu contenido" align="center" size="qw" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group bg-[#1a1a1a] border border-white/5 hover:border-qaway-accent/20 rounded-2xl p-6 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-qaway-accent/20 to-transparent border border-qaway-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-5 h-5 text-qaway-accent" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{service.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-qaway-accent/10 via-transparent to-rose-600/10 border border-white/5 p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                ¿Tu contenido necesita un <span className="text-qaway-accent">refresh visual</span>?
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Creamos contenido visual que conecta, educa y convierte. Cuéntanos qué necesitas.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20impulsar%20mi%20contenido%20visual">Empezar ahora</Button>
                <Button variant="secondary" size="lg" to="/estudio">Volver a Estudio</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
