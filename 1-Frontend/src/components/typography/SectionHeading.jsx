const sizes = {
  hero: 'text-[clamp(3.2rem,5.5vw,6.5rem)]',
  default: 'text-[clamp(3.6rem,5.3vw,6rem)]',
  sm: 'text-[clamp(1.8rem,2.8vw,3.6rem)]',
  md: 'text-[clamp(1.4rem,3.8vw,2.5rem)]',
}

export default function SectionHeading({
  as: Tag = 'h2',
  children,
  size = 'default',
  tracking = '-0.055em',
  leading = '0.87',
  className = '',
}) {
  const sizeClass = sizes[size] || sizes.default

  return (
    <Tag
      className={`font-display-condensed font-bold ${sizeClass} ${className}`}
      style={{ letterSpacing: tracking, lineHeight: leading }}
    >
      {children}
    </Tag>
  )
}
