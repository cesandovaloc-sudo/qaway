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
    <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Package size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111b2d', margin: 0 }} className="line-clamp-1">{bundle.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>{bundle.sku}</p>
            </div>
          </div>
          
          {discountPercent > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Description */}
        {bundle.description && (
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }} className="line-clamp-2">{bundle.description}</p>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#111b2d' }}>
            S/ {bundle.bundle_price.toFixed(2)}
          </span>
          {bundle.total_individual_price > bundle.bundle_price && (
            <span style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'line-through' }}>
              S/ {bundle.total_individual_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            bundle.status === 'active' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : bundle.status === 'inactive'
              ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {bundle.status === 'active' ? 'Activo' : bundle.status === 'inactive' ? 'Inactivo' : 'Borrador'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
        {onView && (
          <button
            onClick={() => onView(bundle)}
            className="flex-1 pxp-btn secondary"
            style={{ height: '34px', fontSize: '12px', gap: 4 }}
          >
            <Eye size={14} />
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(bundle)}
            className="flex-1 pxp-btn secondary"
            style={{ height: '34px', fontSize: '12px', gap: 4, color: '#0284c7' }}
          >
            <Edit2 size={14} />
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(bundle)}
            className="pxp-btn secondary"
            style={{ height: '34px', width: '34px', padding: 0, color: '#e11d48' }}
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
