import { motion } from 'framer-motion'

const cardVariants = {
  default: 'bg-[#1a1a1a] border border-white/5 hover:border-white/10',
  glass: 'glass-card',
  gradient: 'bg-linear-to-br from-white/[0.03] to-transparent border border-white/5',
  accent: 'bg-qaway-accent text-black border border-qaway-accent/20',
}

export default function Card({
  children,
  variant = 'default',
  hover = true,
  className = '',
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl p-6 md:p-8 transition-all duration-300 ${cardVariants[variant]} ${hover ? 'hover:shadow-elevated cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
