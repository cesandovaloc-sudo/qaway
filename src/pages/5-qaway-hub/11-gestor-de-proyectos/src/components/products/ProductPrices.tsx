import { Tag, TrendingDown, Edit2 } from 'lucide-react'
import type { ProductPrice, PriceList } from '@/types'

interface ProductPricesProps {
  prices: (ProductPrice & { price_list: PriceList })[]
  basePrice: number | null
  onEdit?: () => void
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700',
  wholesale: 'bg-blue-100 text-blue-700',
  offer: 'bg-green-100 text-green-700',
  liquidation: 'bg-red-100 text-red-700',
  institutional: 'bg-purple-100 text-purple-700',
  campaign: 'bg-orange-100 text-orange-700',
}

export function ProductPrices({ prices, basePrice, onEdit }: ProductPricesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Precios</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {/* Base Price */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Precio base</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {basePrice ? `S/ ${basePrice.toFixed(2)}` : 'No definido'}
        </p>
      </div>

      {/* Price Lists */}
      {prices.length > 0 ? (
        <div className="space-y-2">
          {prices.map((price) => (
            <div
              key={price.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[price.price_list.type] || typeColors.normal}`}>
                  {price.price_list.name}
                </span>
                {price.min_quantity > 1 && (
                  <span className="text-xs text-gray-500">
                    Mín. {price.min_quantity} uds.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  S/ {price.price.toFixed(2)}
                </span>
                {basePrice && price.price < basePrice && (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay precios configurados en listas
        </p>
      )}
    </div>
  )
}
