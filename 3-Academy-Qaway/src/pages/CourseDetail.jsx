import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '@/data/courses'

export default function CourseDetail() {
  const { slug } = useParams()
  const course = courses.find((c) => c.slug === slug)

  if (!course) {
    return (
      <div className="pt-32 pb-20 section-container">
        <p className="text-[#666860]">Curso no encontrado.</p>
        <Link to="/cursos" className="text-[#ff4b0b] hover:underline mt-4 inline-block">
          ← Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#0d0f0d]">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/cursos"
              className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity"
            >
              ← Catálogo
            </Link>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-white">
              {course.title}
            </h1>
            <p className="mt-4 text-[#666860] max-w-2xl">
              {course.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <span className="inline-block px-3 py-1 bg-[#ff4b0b]/10 text-[#ff4b0b] font-semibold uppercase tracking-wider">
                {course.level}
              </span>
              <span className="inline-block px-3 py-1 bg-white/10 text-white/70">
                {course.duration}
              </span>
            </div>
            <div className="mt-8">
              <Link
                to="/registro"
                className="inline-flex items-center px-6 py-3 bg-[#ff4b0b] text-white text-sm font-semibold rounded-sm hover:bg-[#e03e00] transition-all"
              >
                Inscribirme ahora
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="py-section bg-[#f5f5f4]">
        <div className="section-container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-[#0d0f0d]">Contenido del curso</h2>
            <div className="mt-8 space-y-4">
              {course.modules.map((mod, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-5 bg-white rounded-sm border border-[#0d0f0d]/6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-[#ff4b0b] mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#0d0f0d]">
                        {mod.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#666860]">
                        {mod.lessons} lecciones
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


