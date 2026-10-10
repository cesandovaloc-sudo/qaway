import { Zap, Edit2, Trash2, Eye, Calendar } from 'lucide-react'
import type { LiquidationCampaign } from '@/types'

interface CampaignCardProps {
  campaign: LiquidationCampaign
  productCount?: number
  onEdit?: (campaign: LiquidationCampaign) => void
  onDelete?: (campaign: LiquidationCampaign) => void
  onView?: (campaign: LiquidationCampaign) => void
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  preparing: { label: 'Preparando', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  active: { label: 'Activa', color: 'text-green-600', bgColor: 'bg-green-100' },
  paused: { label: 'Pausada', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  finished: { label: 'Finalizada', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  archived: { label: 'Archivada', color: 'text-gray-500', bgColor: 'bg-gray-50' },
}

export function CampaignCard({ campaign, productCount = 0, onEdit, onDelete, onView }: CampaignCardProps) {
  const status = statusConfig[campaign.status] || statusConfig.draft

  const formatDate = (date: string | null) => {
    if (!date) return 'Sin fecha'
    return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const isActive = campaign.status === 'active'
  const isUpcoming = campaign.start_date && new Date(campaign.start_date) > new Date()

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isActive ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-orange-100'}`}>
            <Zap className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{campaign.name}</h3>
            {campaign.description && (
              <p className="text-xs text-gray-500 line-clamp-1">{campaign.description}</p>
            )}
          </div>
        </div>
        
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color} ${status.bgColor}`}>
          {status.label}
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(campaign.start_date)}</span>
        </div>
        {campaign.end_date && (
          <span className="text-gray-400">→ {formatDate(campaign.end_date)}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Productos</p>
          <p className="text-lg font-semibold text-gray-900">{productCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Estado</p>
          <p className={`text-lg font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
            {isActive ? 'En curso' : isUpcoming ? 'Próxima' : 'Inactiva'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(campaign)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(campaign)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(campaign)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
