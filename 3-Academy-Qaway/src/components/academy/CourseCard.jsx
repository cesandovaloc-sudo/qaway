import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const levelStyles = {
  basico: 'bg-[#0d0f0d]/6 text-[#0d0f0d]',
  intermedio: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  avanzado: 'bg-[#0d0f0d] text-white',
}

export default function CourseCard({ course, index = 0 }) {
  const levelLabel = { basico: 'Basico', intermedio: 'Intermedio', avanzado: 'Avanzado' }[course.level]

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/cursos/${course.slug}`} className="group block">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#efede8] border border-[#0d0f0d]/8">
          <img
            src={course.coverUrl}
            alt={course.title}
            className="w-full aspect-[16/9] object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          {course.isFree && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#ff4b0b] text-white text-[9px] font-bold tracking-[0.12em] uppercase">
              Gratis
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 text-[10px] text-[#666860] tracking-wider uppercase">
            <span className={`px-2 py-0.5 text-[9px] font-semibold ${levelStyles[course.level]}`}>
              {levelLabel}
            </span>
            <span>{course.duration}</span>
          </div>

          <h3 className="text-sm font-semibold text-[#0d0f0d] leading-snug group-hover:text-[#ff4b0b] transition-colors">
            {course.title}
          </h3>

          <p className="text-xs text-[#666860] leading-relaxed line-clamp-2">
            {course.summary}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#666860] pt-1">
            <span>{course.modules} modulos</span>
            <span className="w-px h-3 bg-[#0d0f0d]/10" />
            <span>{course.lessons} lecciones</span>
          </div>

          {!course.isFree && (
            <div className="pt-1">
              <span className="text-sm font-bold text-[#ff4b0b]">${course.price}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
