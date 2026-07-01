import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center bg-[#0d0f0d] overflow-hidden">
        <div className="section-container w-full pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] mb-6"
            >
              Qaway Academy
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white text-balance"
            >
              Aprende a construir
              <br />
              <span className="text-[#ff4b0b]">tu ecosistema digital</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base md:text-lg text-[#666860] max-w-xl leading-relaxed"
            >
              Cursos, talleres y programas sobre IA aplicada, marketing digital,
              automatización y branding. Aprende a tu ritmo con herramientas reales.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/cursos"
                className="inline-flex items-center px-6 py-3 bg-[#ff4b0b] text-white text-sm font-semibold rounded-sm hover:bg-[#e03e00] transition-all"
              >
                Explorar cursos
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/10 transition-all"
              >
                Crear cuenta gratis
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-section bg-[#f5f5f4]">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b]">
              Por qué Qaway Academy
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-[#0d0f0d]">
              Formación que realmente
              <br />
              transforma tu trabajo
            </h2>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 bg-white rounded-sm border border-[#0d0f0d]/6"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#ff4b0b]/10 text-[#ff4b0b] text-lg font-bold">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#0d0f0d]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#666860] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-section bg-[#0d0f0d]">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              ¿Listo para empezar?
            </h2>
            <p className="mt-4 text-[#666860] max-w-md mx-auto">
              Únete a Qaway Academy y accede a cursos diseñados para la era digital.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/registro"
                className="inline-flex items-center px-6 py-3 bg-[#ff4b0b] text-white text-sm font-semibold rounded-sm hover:bg-[#e03e00] transition-all"
              >
                Crear cuenta gratis
              </Link>
              <Link
                to="/cursos"
                className="inline-flex items-center px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/10 transition-all"
              >
                Ver cursos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'IA Aplicada',
    description: 'Aprende a usar inteligencia artificial en tu trabajo diario con herramientas y flujos reales que multiplican tu productividad.',
  },
  {
    title: 'Estrategia Digital',
    description: 'Domina marketing digital, branding, automatización y canales para construir presencia y captar clientes.',
  },
  {
    title: 'Proyectos Reales',
    description: 'Cada curso incluye ejemplos prácticos, plantillas y casos reales para que apliques lo aprendido de inmediato.',
  },
]
