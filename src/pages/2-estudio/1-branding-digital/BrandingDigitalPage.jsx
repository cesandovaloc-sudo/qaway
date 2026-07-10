import { motion } from 'framer-motion'
import {
  Palette, Target, PenLine, Eye, Layers,
  Grid3X3, Share2, ArrowRight, CheckCircle2,
  Lightbulb, Compass, Star,
} from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'

const services = [
  {
    icon: Palette,
    title: 'Identidad visual',
    description: 'Creamos sistemas visuales completos: logotipo, paleta, tipografía, iconografía y guías de uso.',
  },
  {
    icon: Target,
    title: 'Posicionamiento digital',
    description: 'Definimos cómo tu marca debe ser percibida en el entorno digital para destacar.',
  },
  {
    icon: PenLine,
    title: 'Narrativa de marca',
    description: 'Construimos la historia, tono y personalidad de tu marca para conectar con tu audiencia.',
  },
  {
    icon: Eye,
    title: 'Dirección estética',
    description: 'Definimos y supervisamos la línea visual de tu marca en todos los puntos de contacto.',
  },
  {
    icon: Layers,
    title: 'Coherencia visual',
    description: 'Aseguramos que cada pieza visual de tu marca hable el mismo lenguaje en todas las plataformas.',
  },
  {
    icon: Grid3X3,
    title: 'Sistemas visuales',
    description: 'Diseñamos sistemas modulares que permiten escalar tu identidad visual sin perder calidad.',
  },
  {
    icon: Share2,
    title: 'Branding para redes',
    description: 'Adaptamos tu identidad a cada red social manteniendo coherencia y optimizando el impacto.',
  },
  {
    icon: Star,
    title: 'Branding personal',
    description: 'Construcción de marca personal para profesionales, creadores y líderes de opinión.',
  },
]

const process = [
  { step: '01', title: 'Descubrimiento', description: 'Investigamos tu mercado, audiencia y competencia para entender tu posición.' },
  { step: '02', title: 'Concepto', description: 'Definimos la esencia de tu marca: personalidad, valores y dirección visual.' },
  { step: '03', title: 'Creación', description: 'Diseñamos el sistema visual completo con iteraciones guiadas.' },
  { step: '04', title: 'Implementación', description: 'Aplicamos la identidad a todos los puntos de contacto digitales.' },
]

export default function BrandingDigitalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-qaway-accent/5 to-transparent" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SectionTitle
              badge="Branding Digital"
              title="Identidad digital moderna para tu marca"
              description="Construimos la percepción, diferenciación y coherencia visual que tu negocio necesita para destacar en el entorno digital."
              as="h1"
              size="hero"
            />
            <div className="flex flex-wrap gap-4 mt-8">
// <Button variant="primary" size="lg" href="#servicios">Ver servicios</Button> (Hidden until services page ready)
              <Button variant="secondary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20construir%20mi%20identidad%20digital%20con%20Branding%20Digital">Iniciar proyecto</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '4×', label: 'Mayor recordación' },
              { value: '70%', label: 'Más confianza visual' },
              { value: '100%', label: 'Coherencia garantizada' },
              { value: '360°', label: 'Cobertura de marca' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-qaway-accent mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle
            badge="Servicios"
            title="Todo para construir una identidad digital sólida"
            description="Desde la conceptualización hasta la implementación completa de tu identidad de marca."
            align="center"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
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

      {/* Process */}
      <section className="py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle
            badge="Proceso"
            title="Cómo construimos tu identidad"
            description="Un proceso estructurado que garantiza resultados profesionales."
            align="center"
          />
          <div className="grid md:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-4xl font-black text-qaway-accent/20 mb-3">{p.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{p.description}</p>
                {i < 3 && <div className="hidden md:block absolute top-3 left-12 w-full h-px bg-gradient-to-r from-qaway-accent/20 to-transparent" />}
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-qaway-accent/10 via-transparent to-amber-600/10 border border-white/5 p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Tu marca merece una <span className="text-qaway-accent">identidad única</span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Empecemos a construir la identidad digital que lleve tu marca al siguiente nivel.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20construir%20mi%20marca%20con%20Branding%20Digital">Empezar ahora</Button>
                <Button variant="secondary" size="lg" to="/estudio">Volver a Estudio</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
