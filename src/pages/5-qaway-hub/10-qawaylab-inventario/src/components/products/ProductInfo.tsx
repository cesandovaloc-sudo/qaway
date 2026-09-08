import { Package, Tag, MapPin, Calendar, Edit2, Trash2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ProductDetail } from '@/services/productDetailService'
import { getConditionLabel, getConditionColor } from '@/types/product'

interface ProductInfoProps {
  product: ProductDetail
  onEdit?: () => void
  onDelete?: () => void
}

const commercialStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Disponible', color: 'text-green-700', bgColor: 'bg-green-100' },
  reserved: { label: 'Reservado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  sold: { label: 'Vendido', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  out_of_stock: { label: 'Agotado', color: 'text-red-700', bgColor: 'bg-red-100' },
  unavailable: { label: 'No disponible', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

export function ProductInfo({ product, onEdit, onDelete }: ProductInfoProps) {
  const navigate = useNavigate()
  const status = commercialStatusConfig[product.commercial_status] || commercialStatusConfig.available
  const condition = getConditionLabel(product.condition as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)
  const conditionColor = getConditionColor(product.condition as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/inventario')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inventario
      </button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{product.sku}</p>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color} ${status.bgColor}`}>
            {status.label}
          </span>
        </div>
        
        {product.description && (
          <p className="mt-3 text-gray-600">{product.description}</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Precio base</p>
          <p className="text-xl font-bold text-gray-900">
            {product.base_price ? `S/ ${product.base_price.toFixed(2)}` : '—'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
          <p className="text-xl font-bold text-gray-900">{product.min_stock}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Condición</p>
          <p className={`text-xl font-bold ${conditionColor}`}>{condition}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Costo</p>
          <p className="text-xl font-bold text-gray-900">
            {product.cost ? `S/ ${product.cost.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Tipo:</span>
          <span className="font-medium text-gray-900 capitalize">{product.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Marca:</span>
          <span className="font-medium text-gray-900">{product.brand || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Ubicación:</span>
          <span className="font-medium text-gray-900">{product.location?.name || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Creado:</span>
          <span className="font-medium text-gray-900">{formatDate(product.created_at)}</span>
        </div>
      </div>

      {/* Notes */}
      {product.notes && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-1">Notas</p>
          <p className="text-sm text-yellow-700">{product.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
