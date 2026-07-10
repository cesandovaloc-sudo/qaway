export default function Kicker({ as: Tag = 'p', children, className = '' }) {
  return (
    <Tag className={`text-[12px] font-bold uppercase tracking-[0.22em] text-qaway-accent ${className}`}>
      {children}
    </Tag>
  )
}
