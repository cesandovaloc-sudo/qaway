export default function ProgressBar({ value = 0, size = 'sm', showLabel = true, className = '' }) {
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-[#0d0f0d]/8 ${heights[size]}`}>
        <div
          className={`bg-[#ff4b0b] transition-all duration-700 ease-out ${heights[size]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-semibold text-[#666860] tabular-nums whitespace-nowrap">
          {value}%
        </span>
      )}
    </div>
  )
}
