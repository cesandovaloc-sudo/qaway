import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LessonCard({ lesson, moduleIndex, lessonIndex, courseSlug, completed = false, locked = false }) {
  const isPremium = !lesson.isFree && !locked

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: lessonIndex * 0.03 }}
    >
      <Link
        to={locked ? '#' : `/panel/cursos/${courseSlug}/leccion/${lesson.id}`}
        className={`flex items-center gap-3 py-2.5 px-3 transition-colors ${
          locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#0d0f0d]/4'
        }`}
        onClick={locked ? (e) => e.preventDefault() : undefined}
      >
        {/* Status icon */}
        <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 ${
          completed
            ? 'bg-[#ff4b0b] text-white'
            : locked
              ? 'border border-[#0d0f0d]/20 text-[#0d0f0d]/20'
              : 'border border-[#0d0f0d]/20 text-[#666860]'
        }`}>
          {completed ? '✓' : locked ? '🔒' : lessonIndex + 1}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-medium block truncate ${
            completed ? 'text-[#666860] line-through' : 'text-[#0d0f0d]'
          }`}>
            {lesson.title}
          </span>
          {lesson.description && (
            <span className="text-[10px] text-[#666860] mt-0.5 block truncate">
              {lesson.description}
            </span>
          )}
        </div>

        {/* Duration */}
        <span className="text-[10px] text-[#666860] tabular-nums shrink-0">
          {lesson.duration}
        </span>

        {/* Premium badge */}
        {isPremium && (
          <span className="text-[8px] font-bold uppercase tracking-wider text-[#ff4b0b] shrink-0">
            Premium
          </span>
        )}
      </Link>
    </motion.div>
  )
}
