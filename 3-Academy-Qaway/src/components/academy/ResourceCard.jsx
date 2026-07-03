export default function ResourceCard({ resource, className = '' }) {
  const fileIcons = {
    pdf: '📄',
    zip: '📦',
    doc: '📝',
    xls: '📊',
    mp4: '🎬',
  }

  return (
    <a
      href={resource.fileUrl}
      download
      className={`flex items-center gap-3 p-3 border border-[#0d0f0d]/8 hover:border-[#ff4b0b]/30 transition-all group ${className}`}
    >
      <span className="text-lg shrink-0">
        {fileIcons[resource.fileType] || '📁'}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-[#0d0f0d] group-hover:text-[#ff4b0b] transition-colors block truncate">
          {resource.title}
        </span>
        {resource.description && (
          <span className="text-[10px] text-[#666860] mt-0.5 block truncate">
            {resource.description}
          </span>
        )}
      </div>
      <span className="text-[10px] text-[#666860] tabular-nums shrink-0">
        {resource.fileSize}
      </span>
    </a>
  )
}
