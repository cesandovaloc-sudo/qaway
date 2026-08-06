import { motion } from 'framer-motion'
import {
  MessageCircle, ClipboardCheck, Compass,
  TrendingUp, BarChart3, FileText, ArrowRight,
  Lightbulb, Zap, Shield,
} from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'

const services = [
  {
    icon: ClipboardCheck,
    title: 'Diagnóstico de marca',
    description: 'Evaluamos el estado actual de tu marca, presencia digital y comunicación visual para identificar oportunidades.',
  },
  {
    icon: Lightbulb,
    title: 'Estrategia visual',
    description: 'Definimos el rumbo visual de tu marca con decisiones basadas en análisis y criterio estratégico.',
  },
  {
    icon: FileText,
    title: 'Plan de contenido',
    description: 'Diseñamos un plan de contenido personalizado alineado a tus objetivos de negocio y recursos.',
  },
  {
    icon: Compass,
    title: 'Optimización de canales',
    description: 'Analizamos y optimizamos tus canales digitales actuales para mejorar su rendimiento y coherencia.',
  },
  {
    icon: BarChart3,
    title: 'Métrica y medición',
    description: 'Establecemos KPIs claros y sistemas de medición para evaluar el impacto de tus decisiones.',
  },
  {
    icon: Zap,
    title: 'Consultoría en campañas',
    description: 'Acompañamos la planificación y ejecución de campañas digitales con criterio estratégico.',
  },
  {
    icon: Shield,
    title: 'Acompañamiento continuo',
    description: 'Sesiones periódicas de consultoría para mantener el rumbo y ajustar la estrategia según resultados.',
  },
  {
    icon: TrendingUp,
    title: 'Crecimiento digital',
    description: 'Identificamos oportunidades de crecimiento y expansión digital para tu marca o negocio.',
  },
]

const approach = [
  { title: 'Escuchar y diagnosticar', description: 'Primero entendemos tu situación actual, objetivos y desafíos antes de proponer cualquier solución.' },
  { title: 'Analizar y priorizar', description: 'Identificamos las acciones de mayor impacto según tu momento, recursos y objetivos.' },
  { title: 'Acompañar y ajustar', description: 'No solo recomendamos, te acompañamos en la implementación y ajustamos según resultados.' },
]

export default function ConsultoriaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-cyan-600/10 via-qaway-accent/5 to-transparent" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionTitle
              badge="Consultoría Estratégica"
              title="Acompañamiento experto en decisiones de marca y comunicación"
              description="No solo te decimos qué hacer. Te acompañamos en el proceso de transformación digital de tu marca con criterio estratégico y visión práctica."
            />
            <div className="flex flex-wrap gap-4 mt-8">
// <Button variant="primary" size="lg" href="#servicios">Ver servicios</Button> (Hidden until services page ready)
              <Button variant="secondary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20consultor%C3%ADa%20estrat%C3%A9gica%20para%20mi%20marca">Agendar diagnóstico</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '100%', label: 'Enfoque personalizado' },
              { value: '90%', label: 'Decisiones acertadas' },
              { value: '1:1', label: 'Acompañamiento' },
              { value: '360°', label: 'Visión completa' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-qaway-accent mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Enfoque" title="Nuestra forma de consultoría" description="No damos recetas. Construimos soluciones contigo." align="center" size="qw" />
          <div className="grid md:grid-cols-3 gap-6">
            {approach.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-qaway-accent/20 to-transparent border border-qaway-accent/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-lg font-bold text-qaway-accent">{i + 1}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-3">{a.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{a.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Servicios" title="Áreas de consultoría estratégica" description="Acompañamiento profesional en cada aspecto de tu presencia digital." align="center" size="qw" />
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
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-qaway-accent/10 via-transparent to-cyan-600/10 border border-white/5 p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Conversemos sobre tu <span className="text-qaway-accent">próximo paso</span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Un diagnóstico claro es el primer paso para tomar mejores decisiones. Agendemos una sesión sin compromiso.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20agendar%20una%20sesi%C3%B3n%20de%20consultor%C3%ADa%20estrat%C3%A9gica">Agendar sesión gratuita</Button>
                <Button variant="secondary" size="lg" to="/estudio">Volver a Estudio</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
