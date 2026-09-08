import { Package, Edit2, Trash2, Eye } from 'lucide-react'
import type { Bundle } from '@/types'

interface BundleCardProps {
  bundle: Bundle
  onEdit?: (bundle: Bundle) => void
  onDelete?: (bundle: Bundle) => void
  onView?: (bundle: Bundle) => void
}

export function BundleCard({ bundle, onEdit, onDelete, onView }: BundleCardProps) {
  const discountPercent = bundle.total_individual_price > 0
    ? Math.round((bundle.discount / bundle.total_individual_price) * 100)
    : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{bundle.name}</h3>
            <p className="text-xs text-gray-500">{bundle.sku}</p>
          </div>
        </div>
        
        {discountPercent > 0 && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Description */}
      {bundle.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bundle.description}</p>
      )}

      {/* Pricing */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-lg font-semibold text-gray-900">
          S/ {bundle.bundle_price.toFixed(2)}
        </span>
        {bundle.total_individual_price > bundle.bundle_price && (
          <span className="text-sm text-gray-500 line-through">
            S/ {bundle.total_individual_price.toFixed(2)}
          </span>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          bundle.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : bundle.status === 'inactive'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {bundle.status === 'active' ? 'Activo' : bundle.status === 'inactive' ? 'Inactivo' : 'Borrador'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(bundle)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(bundle)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(bundle)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
