import { FileText, Edit2, Trash2, Eye, Globe, Lock } from 'lucide-react'
import type { Catalog } from '@/types'

interface CatalogCardProps {
  catalog: Catalog
  itemCount?: number
  onEdit?: (catalog: Catalog) => void
  onDelete?: (catalog: Catalog) => void
  onView?: (catalog: Catalog) => void
}

const templateLabels: Record<string, string> = {
  minimal: 'Minimalista',
  professional: 'Profesional',
  premium: 'Premium',
}

export function CatalogCard({ catalog, itemCount = 0, onEdit, onDelete, onView }: CatalogCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{catalog.name}</h3>
            <p className="text-xs text-gray-500">{templateLabels[catalog.template] || catalog.template}</p>
          </div>
        </div>
        
        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          catalog.is_public 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {catalog.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {catalog.is_public ? 'Público' : 'Privado'}
        </span>
      </div>

      {/* Description */}
      {catalog.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{catalog.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span>{itemCount} artículos</span>
        {catalog.campaign_id && <span>Vinculado a campaña</span>}
      </div>

      {/* URL */}
      {catalog.is_public && catalog.slug && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-500 truncate">
          /remates/{catalog.slug}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(catalog)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(catalog)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(catalog)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
