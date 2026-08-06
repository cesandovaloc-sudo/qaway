import { motion } from 'framer-motion'
import {
  Target, TrendingUp, Filter, Layout,
  BarChart3, Radio, MessageCircle, ArrowRight,
  Search, Zap, Users,
} from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'

const services = [
  {
    icon: Target,
    title: 'Planificación de contenido',
    description: 'Diseñamos calendarios editoriales y sistemas de contenido alineados a tus objetivos de negocio.',
  },
  {
    icon: TrendingUp,
    title: 'Sistemas de contenido',
    description: 'Creamos estructuras replicables que generan contenido de forma consistente y escalable.',
  },
  {
    icon: Filter,
    title: 'Funnels y rutas de captación',
    description: 'Diseñamos embudos digitales desde la atracción hasta la conversión con contenido estratégico.',
  },
  {
    icon: Layout,
    title: 'Landing pages',
    description: 'Creamos páginas de alto impacto orientadas a conversión con diseño moderno y copy persuasivo.',
  },
  {
    icon: Radio,
    title: 'Campañas digitales',
    description: 'Estructuramos campañas multicanal con contenido adaptado a cada plataforma y audiencia.',
  },
  {
    icon: MessageCircle,
    title: 'Estrategia para redes sociales',
    description: 'Definimos qué decir, dónde decirlo y cómo medirlo en cada red social relevante.',
  },
  {
    icon: BarChart3,
    title: 'Arquitectura de comunicación',
    description: 'Diseñamos la estructura de comunicación de tu marca: canales, tonos, mensajes y frecuencia.',
  },
  {
    icon: Search,
    title: 'Contenido orientado a conversión',
    description: 'Creamos contenido que no solo informa, sino que guía al usuario hacia una acción específica.',
  },
  {
    icon: Users,
    title: 'Organización de formatos',
    description: 'Definimos qué formatos funcionan mejor para cada etapa del customer journey.',
  },
  {
    icon: Zap,
    title: 'Estrategias de posicionamiento',
    description: 'Desarrollamos estrategias digitales para mejorar tu visibilidad y autoridad en el mercado.',
  },
]

const funnelStages = [
  { stage: 'TOFU', name: 'Descubrimiento', objective: 'Atraer tráfico y generar awareness', tactics: 'SEO, redes sociales, contenido educativo' },
  { stage: 'MOFU', name: 'Consideración', objective: 'Educar y generar confianza', tactics: 'Email marketing, webinars, casos de estudio' },
  { stage: 'BOFU', name: 'Conversión', objective: 'Cerrar ventas y captar leads', tactics: 'Landing pages, CTAs, ofertas específicas' },
  { stage: 'Post', name: 'Fidelización', objective: 'Retener y upsell', tactics: 'Contenido exclusivo, comunidad, soporte' },
]

export default function EstrategiaDigitalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-600/10 via-qaway-accent/5 to-transparent" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionTitle
              badge="Estrategia Digital"
              title="Estructuras digitales que generan resultados"
              description="Diseñamos estrategias completas de posicionamiento, captación y crecimiento integrando contenido, comunicación, funnels y experiencia digital en un solo sistema."
            />
            <div className="flex flex-wrap gap-4 mt-8">
// <Button variant="primary" size="lg" href="#servicios">Ver servicios</Button> (Hidden until services page ready)
              <Button variant="secondary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20una%20estrategia%20digital%20para%20mi%20negocio">Diseñar estrategia</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '3×', label: 'Más tráfico orgánico' },
              { value: '60%', label: 'Mejora en conversión' },
              { value: '10+', label: 'Canales integrados' },
              { value: '360°', label: 'Visión estratégica' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-qaway-accent mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Funnel */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Embudo" title="Estrategia para cada etapa del funnel" description="Cada fase del customer journey requiere un enfoque y contenido diferente." align="center" size="qw" />
          <div className="grid md:grid-cols-4 gap-4">
            {funnelStages.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-qaway-accent/10 border border-qaway-accent/20 mb-4">
                  <span className="text-[10px] font-bold text-qaway-accent uppercase tracking-wider">{f.stage}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.name}</h3>
                <p className="text-xs text-zinc-400 mb-3">{f.objective}</p>
                <p className="text-[10px] text-zinc-500">{f.tactics}</p>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-4 border-t-2 border-r-2 border-qaway-accent/20 rotate-45" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Servicios" title="Todo lo que necesitas para tu estrategia digital" description="Desde la planificación hasta la ejecución y medición de resultados." align="center" size="qw" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                className="group bg-[#1a1a1a] border border-white/5 hover:border-qaway-accent/20 rounded-2xl p-6 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-qaway-accent/20 to-transparent border border-qaway-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-qaway-accent/10 via-transparent to-emerald-600/10 border border-white/5 p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                ¿Tu estrategia digital necesita <span className="text-qaway-accent">orden y dirección</span>?
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Diseñemos juntos la estructura digital que lleve tu marca al siguiente nivel.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20una%20estrategia%20digital%20completa">Crear estrategia</Button>
                <Button variant="secondary" size="lg" to="/estudio">Volver a Estudio</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
