import { Package, MapPin } from 'lucide-react'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  onProductClick?: (product: Product) => void
}

export default function ProductGrid({ products, loading, onProductClick }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-surface-muted p-4 animate-pulse">
            <div className="aspect-square bg-surface rounded-lg mb-3" />
            <div className="h-4 bg-surface rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-muted p-12 text-center">
        <Package size={40} className="mx-auto text-muted-light mb-3" />
        <p className="text-sm text-muted">No hay productos que mostrar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductClick?.(product)}
          className="bg-white rounded-xl border border-surface-muted overflow-hidden cursor-pointer transition-all hover:shadow-card hover:-translate-y-0.5"
        >
          {/* Image */}
          <div className="aspect-[4/3] bg-surface flex items-center justify-center">
            <Package size={32} className="text-muted-light" />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* SKU */}
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
              {product.sku}
            </span>

            {/* Name */}
            <h3 className="text-sm font-medium text-ink mt-1 line-clamp-2">
              {product.name}
            </h3>

            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-muted mt-0.5">{product.brand}</p>
            )}

            {/* Stock & Price */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  product.min_stock > 0 && product.min_stock <= 5
                    ? 'bg-amber-500'
                    : product.min_stock > 5
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted">
                  Stock: {product.min_stock || 0}
                </span>
              </div>
              <span className="text-sm font-semibold text-ink">
                {product.base_price ? `S/ ${product.base_price.toFixed(2)}` : '—'}
              </span>
            </div>

            {/* Location */}
            {product.location_id && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface-muted">
                <MapPin size={12} className="text-muted-light" />
                <span className="text-xs text-muted truncate">{product.location_id}</span>
              </div>
            )}

            {/* Status badge */}
            <div className="mt-3">
              {(() => {
                const statusStyles: Record<string, string> = {
                  available: 'bg-emerald-50 text-emerald-700',
                  reserved: 'bg-amber-50 text-amber-700',
                  sold: 'bg-blue-50 text-blue-700',
                  out_of_stock: 'bg-red-50 text-red-700',
                  unavailable: 'bg-gray-50 text-gray-700',
                }
                const statusLabels: Record<string, string> = {
                  available: 'Disponible',
                  reserved: 'Reservado',
                  sold: 'Vendido',
                  out_of_stock: 'Agotado',
                  unavailable: 'No disponible',
                }
                return (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[product.commercial_status] || statusStyles.unavailable}`}>
                    {statusLabels[product.commercial_status] || product.commercial_status}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
