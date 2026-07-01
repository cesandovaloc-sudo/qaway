import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Lesson() {
  const { slug, lessonId } = useParams()

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#f5f5f4]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={`/cursos/${slug}`}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity"
          >
            ← Volver al curso
          </Link>

          <h1 className="mt-6 text-2xl md:text-3xl font-bold text-[#0d0f0d]">
            Lección {lessonId}
          </h1>
          <p className="mt-3 text-[#666860]">
            Contenido de la lección próximamente.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
