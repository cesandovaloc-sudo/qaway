import { motion } from 'framer-motion'

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  dark = false,
  className = '',
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${alignClass} ${className}`}
    >
      {eyebrow && (
        <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 ${
          dark ? 'text-[#ff4b0b]' : 'text-[#ff4b0b]'
        }`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance max-w-2xl ${
        dark ? 'text-white' : 'text-[#0d0f0d]'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base leading-relaxed max-w-xl ${
          dark ? 'text-[#666860]' : 'text-[#666860]'
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
