import { motion } from 'framer-motion'
import {
  UserCircle, Linkedin, Instagram, Building2,
  Briefcase, BadgeCheck, Globe, ArrowRight,
  Sparkles, Users,
} from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'

const services = [
  {
    icon: UserCircle,
    title: 'Optimización de perfiles',
    description: 'Auditamos y optimizamos tu perfil profesional completo: bio, foto, experiencia y tono de comunicación.',
  },
  {
    icon: Linkedin,
    title: 'Imagen para LinkedIn',
    description: 'Construimos una presencia profesional sólida en LinkedIn con perfil, contenido y estrategia de red.',
  },
  {
    icon: Instagram,
    title: 'Instagram profesional',
    description: 'Transformamos tu Instagram personal en una vitrina profesional coherente con tu marca.',
  },
  {
    icon: Building2,
    title: 'Adaptación visual corporativa',
    description: 'Alineamos tu imagen personal con la identidad visual de tu empresa o negocio.',
  },
  {
    icon: Briefcase,
    title: 'Presentación digital',
    description: 'Creamos tu presentación digital profesional: portfolio, press kit, one-page y links de presentación.',
  },
  {
    icon: BadgeCheck,
    title: 'Imagen profesional moderna',
    description: 'Desarrollamos una imagen actual, coherente y profesional que genere confianza y autoridad.',
  },
  {
    icon: Globe,
    title: 'Presencia multiplataforma',
    description: 'Gestionamos tu coherencia visual y narrativa en todas las plataformas donde tu marca está presente.',
  },
  {
    icon: Sparkles,
    title: 'Personal branding visual',
    description: 'Construcción completa de marca personal con identidad visual, contenido y estrategia de presencia.',
  },
]

const platforms = [
  { name: 'LinkedIn', users: '1B+', focus: 'Red profesional' },
  { name: 'Instagram', users: '2B+', focus: 'Presencia visual' },
  { name: 'TikTok', users: '1.5B+', focus: 'Alcance orgánico' },
  { name: 'Twitter/X', users: '500M+', focus: 'Autoridad y pensamiento' },
]

export default function PresenciaProfesionalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-sky-600/10 via-qaway-accent/5 to-transparent" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionTitle
              badge="Presencia Profesional"
              title="Construye una imagen digital que abra puertas"
              description="Optimizamos tu presencia digital profesional para generar confianza, autoridad y oportunidades. Tu perfil es tu nueva tarjeta de presentación."
            />
            <div className="flex flex-wrap gap-4 mt-8">
// <Button variant="primary" size="lg" href="#servicios">Ver servicios</Button> (Hidden until services page ready)
              <Button variant="secondary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20mejorar%20mi%20presencia%20profesional">Optimizar mi perfil</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { value: '3×', label: 'Más oportunidades' },
              { value: '80%', label: 'Mejora percepción' },
              { value: '5', label: 'Plataformas clave' },
              { value: '14 días', label: 'Transformación' },
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
          <SectionTitle badge="Servicios" title="Todo para tu presencia profesional" description="Cada servicio está diseñado para potenciar tu imagen y abrirte oportunidades." align="center" size="qw" />
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

      {/* Platforms */}
      <section className="py-20 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle badge="Plataformas" title="Presencia en las plataformas correctas" description="Cada plataforma tiene su propio lenguaje. Te ayudamos a dominarlas todas." align="center" size="qw" />
          <div className="grid md:grid-cols-4 gap-4">
            {platforms.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 text-center"
              >
                <div className="text-sm font-bold text-white mb-1">{p.name}</div>
                <div className="text-xs text-qaway-accent mb-2">{p.users} usuarios</div>
                <div className="text-xs text-zinc-500">{p.focus}</div>
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
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-qaway-accent/10 via-transparent to-sky-600/10 border border-white/5 p-10 md:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Tu presencia digital dice más de lo que crees
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Descubre cómo una imagen profesional optimizada puede transformar las oportunidades que recibes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="primary" size="lg" href="https://wa.me/51930756781?text=hola%20quiero%20optimizar%20mi%20presencia%20profesional">Diagnóstico gratuito</Button>
                <Button variant="secondary" size="lg" to="/estudio">Volver a Estudio</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
