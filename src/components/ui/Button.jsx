import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { forwardRef } from 'react'

const variants = {
  primary: 'bg-qaway-accent text-black hover:bg-qaway-accent-light shadow-lg shadow-qaway-accent/20 hover:shadow-qaway-accent/30',
  secondary: 'border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white',
  ghost: 'text-zinc-400 hover:text-white bg-transparent',
  outline: 'border border-qaway-accent/30 text-qaway-accent hover:bg-qaway-accent/10',
}

const sizes = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-8 py-3.5 text-sm',
  lg: 'px-10 py-4 text-sm',
}

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  icon: Icon,
  className = '',
  ...props
}, ref) {
  const baseClass = `inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`

  const content = (
    <>
      {children}
      {Icon && <Icon className="w-4 h-4" />}
    </>
  )

  if (to) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{ display: 'inline-flex' }}
      >
        <Link to={to} className={baseClass} ref={ref} {...props}>
          {content}
        </Link>
      </motion.div>
    )
  }

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={baseClass}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        ref={ref}
        {...props}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      className={baseClass}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      ref={ref}
      {...props}
    >
      {content}
    </motion.button>
  )
})

export default Button
