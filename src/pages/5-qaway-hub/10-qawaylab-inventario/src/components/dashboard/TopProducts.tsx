import { Package, AlertTriangle, TrendingUp, Star } from 'lucide-react'
import type { TopProduct } from '@/services/dashboardService'

interface TopProductsProps {
  products: TopProduct[]
  title?: string
  showLowStock?: boolean
}

export function TopProducts({ products, title = 'Productos destacados', showLowStock = false }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Package size={18} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl mb-4">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Sin productos</p>
          <p className="text-xs text-gray-400 mt-1">Los productos aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Star size={18} className="text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
          {products.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {products.map((product, index) => {
          const isTop = index === 0
          const isLowStock = showLowStock && product.stock <= 5

          return (
            <div
              key={product.id}
              className={`
                relative flex items-center gap-4 
                p-4 rounded-xl
                transition-all duration-200
                group cursor-pointer
                ${isTop 
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:border-orange-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                }
                ${isLowStock ? 'ring-2 ring-amber-200 ring-offset-1' : ''}
              `}
            >
              {/* Rank badge */}
              <div className={`
                absolute -top-1.5 -left-1.5
                w-6 h-6 rounded-full 
                flex items-center justify-center
                text-xs font-bold
                ${isTop 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>

              {/* Product image */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                overflow-hidden
                ${isTop ? 'bg-orange-100' : 'bg-gray-200'}
                group-hover:scale-105
                transition-transform duration-200
              `}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className={`w-6 h-6 ${isTop ? 'text-orange-500' : 'text-gray-400'}`} />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-semibold truncate
                  ${isTop ? 'text-orange-900' : 'text-gray-900'}
                `}>
                  {product.name}
                </p>
                <p className={`
                  text-xs mt-0.5
                  ${isTop ? 'text-orange-600/70' : 'text-gray-500'}
                `}>
                  {product.sku}
                </p>
              </div>

              {/* Price and stock */}
              <div className="text-right">
                <p className={`
                  text-sm font-bold tabular-nums
                  ${isTop ? 'text-orange-700' : 'text-gray-900'}
                `}>
                  S/ {product.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  {isLowStock && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span className="text-[10px] font-semibold text-amber-700">Bajo</span>
                    </div>
                  )}
                  <span className={`
                    text-xs font-medium tabular-nums
                    ${isLowStock ? 'text-amber-600' : isTop ? 'text-orange-600' : 'text-gray-500'}
                  `}>
                    ×{product.stock}
                  </span>
                </div>
              </div>

              {/* Hover indicator */}
              <div className={`
                absolute right-4 opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              `}>
                <TrendingUp size={16} className={isTop ? 'text-orange-400' : 'text-gray-400'} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
