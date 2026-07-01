export default function BodyText({
  as: Tag = 'p',
  children,
  size = 'default',
  muted = true,
  className = '',
}) {
  const sizeClass = size === 'sm'
    ? 'text-sm'
    : size === 'lg'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base'

  const colorClass = muted ? 'text-black/55' : ''

  return (
    <Tag className={`${sizeClass} leading-relaxed ${colorClass} ${className}`}>
      {children}
    </Tag>
  )
}
