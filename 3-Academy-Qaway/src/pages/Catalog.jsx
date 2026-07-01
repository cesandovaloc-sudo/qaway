import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '@/data/courses'

export default function Catalog() {
  return (
    <div>
      {/* ─── Header ─── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#f5f5f4]">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b]">
              Academy
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#0d0f0d]">
              Catálogo de cursos
            </h1>
            <p className="mt-3 text-[#666860] max-w-lg">
              Explora nuestra oferta formativa y encuentra el curso ideal para tu
              próximo nivel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Grid ─── */}
      <section className="pb-section bg-[#f5f5f4]">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/cursos/${course.slug}`}
                  className="group block p-8 bg-white rounded-sm border border-[#0d0f0d]/6 hover:border-[#ff4b0b]/30 transition-all"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#ff4b0b]/10 text-[#ff4b0b] text-lg font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#0d0f0d] group-hover:text-[#ff4b0b] transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#666860] leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#666860]">
                    <span className="inline-block px-2 py-0.5 bg-[#ff4b0b]/10 text-[#ff4b0b] text-[10px] font-semibold uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span>{course.duration}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
