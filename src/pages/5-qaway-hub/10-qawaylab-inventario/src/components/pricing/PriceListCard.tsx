import { Tag, ToggleLeft, ToggleRight, MoreHorizontal } from 'lucide-react'
import type { PriceList } from '@/types'
import { priceListTypeLabels, priceListTypeColors } from '@/services/priceListService'

interface PriceListCardProps {
  list: PriceList
  productCount?: number
  onToggleActive?: (id: string, isActive: boolean) => void
  onEdit?: (list: PriceList) => void
  onDelete?: (id: string) => void
  onClick?: (list: PriceList) => void
}

export default function PriceListCard({
  list,
  productCount,
  onToggleActive,
  onEdit,
// onDelete,
  onClick,
}: PriceListCardProps) {
  const typeColor = priceListTypeColors[list.type] || priceListTypeColors.normal
  const typeLabel = priceListTypeLabels[list.type] || list.type

  return (
    <div
      onClick={() => onClick?.(list)}
      className="bg-white rounded-xl border border-surface-muted p-5 hover:shadow-card transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${typeColor.bg} flex items-center justify-center`}>
            <Tag size={18} className={typeColor.text} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">
              {list.name}
            </h3>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor.bg} ${typeColor.text}`}>
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.(list.id, !list.is_active)
            }}
            className="p-1 rounded hover:bg-surface transition-colors"
          >
            {list.is_active ? (
              <ToggleRight size={18} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={18} className="text-muted-light" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(list)
            }}
            className="p-1 rounded hover:bg-surface transition-colors"
          >
            <MoreHorizontal size={16} className="text-muted" />
          </button>
        </div>
      </div>

      {/* Description */}
      {list.description && (
        <p className="text-xs text-muted mb-3 line-clamp-2">
          {list.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-muted">
        <span className="text-xs text-muted">
          {productCount !== undefined ? `${productCount} productos` : '—'}
        </span>
        <span className={`text-xs font-medium ${list.is_active ? 'text-emerald-600' : 'text-muted'}`}>
          {list.is_active ? 'Activa' : 'Inactiva'}
        </span>
      </div>
    </div>
  )
}
