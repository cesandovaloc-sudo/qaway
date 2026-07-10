import { motion } from 'framer-motion'

export default function SectionTitle({
  badge,
  title,
  description,
  align = 'left',
  className = '',
  light = false,
  size = 'lg',
  as = 'h2',
}) {
  const titleClass =
    size === 'sm'
      ? 'text-2xl md:text-3xl'
      : size === 'md'
        ? 'text-3xl md:text-4xl'
        : size === 'hero'
          ? 'text-5xl sm:text-6xl lg:text-7xl'
          : 'text-display-sm md:text-display-md'

  const descClass =
    size === 'sm'
      ? 'text-[15px] md:text-base'
      : size === 'md'
        ? 'text-base md:text-lg'
        : 'text-lg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${align === 'center' ? 'text-center mx-auto' : ''} mb-16 ${className}`}
    >
      {badge && (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[10px] font-bold uppercase tracking-widest ${
          light
            ? 'bg-qaway-accent/15 border border-qaway-accent/25 text-qaway-accent-dark'
            : 'bg-white/5 border border-white/10 text-qaway-accent'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            light ? 'bg-qaway-accent-dark' : 'bg-qaway-accent'
          }`} />
          {badge}
        </span>
      )}
      {as === 'h1' ? (
        <h1 className={`${titleClass} font-bold tracking-tight leading-[1.1] mb-5 ${
          light ? 'text-gray-900' : 'text-white'
        }`}>
          {title}
        </h1>
      ) : (
        <h2 className={`${titleClass} font-bold tracking-tight leading-[1.1] mb-5 ${
          light ? 'text-gray-900' : 'text-white'
        }`}>
          {title}
        </h2>
      )}
      {description && (
        <p className={`${descClass} leading-relaxed max-w-2xl text-balance ${
          light ? 'text-gray-500' : 'text-zinc-400'
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
