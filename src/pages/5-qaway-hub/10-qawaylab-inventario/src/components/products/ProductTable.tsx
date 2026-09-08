import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Package } from 'lucide-react'
import type { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onProductClick?: (product: Product) => void
  onSort?: (field: string, order: 'asc' | 'desc') => void
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

type Column = {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (product: Product) => React.ReactNode
}

const columns: Column[] = [
  {
    key: 'sku',
    label: 'SKU',
    sortable: true,
    width: 'w-28',
    render: (p) => (
      <span className="font-mono text-xs text-muted">{p.sku}</span>
    ),
  },
  {
    key: 'name',
    label: 'Producto',
    sortable: true,
    render: (p) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
          <Package size={16} className="text-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{p.name}</p>
          {p.brand && (
            <p className="text-xs text-muted truncate">{p.brand}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Categoría',
    width: 'w-36',
    render: (p) => (
      <span className="text-sm text-muted">{p.category_id || '—'}</span>
    ),
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    width: 'w-20',
    render: (p) => (
      <span className={`text-sm font-medium ${p.min_stock > 0 && p.min_stock <= 5 ? 'text-amber-600' : 'text-ink'}`}>
        {p.min_stock || 0}
      </span>
    ),
  },
  {
    key: 'location',
    label: 'Ubicación',
    width: 'w-32',
    render: (p) => (
      <span className="text-sm text-muted">{p.location_id || '—'}</span>
    ),
  },
  {
    key: 'price',
    label: 'Precio',
    sortable: true,
    width: 'w-24',
    render: (p) => (
      <span className="text-sm font-medium text-ink">
        {p.base_price ? `S/ ${p.base_price.toFixed(2)}` : '—'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    width: 'w-28',
    render: (p) => {
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
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.commercial_status] || statusStyles.unavailable}`}>
          {statusLabels[p.commercial_status] || p.commercial_status}
        </span>
      )
    },
  },
  {
    key: 'actions',
    label: '',
    width: 'w-12',
    render: () => (
      <button className="p-1 rounded hover:bg-surface transition-colors">
        <MoreHorizontal size={16} className="text-muted" />
      </button>
    ),
  },
]

export default function ProductTable({
  products,
  loading,
  onProductClick,
  onSort,
  sortField,
  sortOrder,
}: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleSort = (key: string) => {
    if (!onSort) return
    const newOrder = sortField === key && sortOrder === 'asc' ? 'desc' : 'asc'
    onSort(key, newOrder)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-muted-light" />
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-brand" />
      : <ArrowDown size={12} className="text-brand" />
  }

  return (
    <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-muted">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.size === products.length && products.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-surface-muted text-brand focus:ring-brand/30"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted ${col.width || ''}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                  >
                    {col.label}
                    <SortIcon field={col.key} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-surface-muted last:border-0">
                <td className="px-4 py-3"><div className="w-4 h-4 bg-surface rounded animate-pulse" /></td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className={`h-4 bg-surface rounded animate-pulse ${col.width === 'w-9' ? 'w-9' : 'w-3/4'}`} />
                  </td>
                ))}
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                <Package size={40} className="mx-auto text-muted-light mb-3" />
                <p className="text-sm text-muted">No hay productos que mostrar.</p>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                onClick={() => onProductClick?.(product)}
                className={`border-b border-surface-muted last:border-0 cursor-pointer transition-colors ${
                  selectedIds.has(product.id) ? 'bg-brand/5' : 'hover:bg-surface/50'
                }`}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => handleSelect(product.id)}
                    className="w-4 h-4 rounded border-surface-muted text-brand focus:ring-brand/30"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(product) : String(product[col.key as keyof Product] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-ink/5 border-t border-surface-muted">
          <span className="text-sm text-muted">
            {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-ink bg-white border border-surface-muted rounded-lg hover:border-brand/30 transition-colors">
              Cambiar estado
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-ink bg-white border border-surface-muted rounded-lg hover:border-brand/30 transition-colors">
              Agregar a campaña
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-lg hover:bg-brand-light transition-colors">
              Exportar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
