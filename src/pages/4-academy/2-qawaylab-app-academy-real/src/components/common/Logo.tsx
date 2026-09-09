// Logo único de la app QawayLab Academy — misma letra, peso, espaciado y color en toda la app.
// Cambios aquí se reflejan en todas las vistas (navbar, sidebars, footers, páginas).
const sizes: Record<string, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  target?: string
  rel?: string
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', className = '', href = '/', target, rel, variant = 'light' }: LogoProps) {
  const onDark = variant === 'dark'
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`flex items-center gap-2 ${sizes[size] || sizes.md} font-semibold tracking-[-0.055em] ${className}`}
      aria-label="QawayLab"
    >
      <span className={onDark ? 'text-white' : 'text-[#20201f]'}>Qaway</span>
      <span className="text-[#ff4b0b]">Lab</span>
    </a>
  )
}
