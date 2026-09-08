import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Camera, Search, Filter, Grid3X3, List, X, FileSpreadsheet } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductTable from '@/components/products/ProductTable'
import ProductGrid from '@/components/products/ProductGrid'
import ProductImport from '@/components/products/ProductImport'
import type { Product, ProductFilters } from '@/types'

type ViewMode = 'table' | 'grid'

export default function ProductsPage() {
  const navigate = useNavigate()
  const { products, loading, total, page, totalPages, setPage, setFilters, refresh } = useProducts()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeFilters, setActiveFilters] = useState<ProductFilters>({})
  const [importOpen, setImportOpen] = useState(false)

  const handleProductClick = useCallback((product: Product) => {
    navigate(`/inventario/${product.id}`)
  }, [navigate])

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      setFilters({ ...activeFilters, search: value || undefined })
    },
    [activeFilters, setFilters]
  )

  const handleFilter = useCallback(
    (newFilters: ProductFilters) => {
      setActiveFilters(newFilters)
      setFilters({ ...newFilters, search: search || undefined })
      setShowFilters(false)
    },
    [search, setFilters]
  )

  const handleSort = useCallback(
    (field: string, order: 'asc' | 'desc') => {
      setSortField(field)
      setSortOrder(order)
      // Note: sorting would be handled by the adapter in a real implementation
    },
    []
  )

  const clearFilters = () => {
    setActiveFilters({})
    setSearch('')
    setFilters({})
  }

  const hasActiveFilters = Object.keys(activeFilters).some((k) => activeFilters[k as keyof ProductFilters] !== undefined)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
            Productos
          </h1>
          <p className="text-sm text-muted mt-1">
            {total} producto{total !== 1 ? 's' : ''} en tu inventario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white text-ink border border-surface-muted rounded-lg text-sm font-medium hover:border-brand/30 transition-colors"
          >
            <FileSpreadsheet size={14} />
            Importar
          </button>
          <a
            href="/captura"
            className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
          >
            <Camera size={14} />
            Capturar
          </a>
          <a
            href="/inventario/nuevo"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white text-ink border border-surface-muted rounded-lg text-sm font-medium hover:border-brand/30 transition-colors"
          >
            <Plus size={14} />
            Nuevo
          </a>
        </div>
      </div>

      {/* Importación desde Excel/CSV */}
      {importOpen && (
        <ProductImport
          onClose={() => setImportOpen(false)}
          onImported={() => {
            // El modal muestra el mensaje de éxito; el usuario lo cierra. La lista ya se refresca.
            refresh()
          }}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-white border border-surface-muted rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-ink text-white'
              : 'bg-white text-muted border border-surface-muted hover:text-ink hover:border-brand/30'
          }`}
        >
          <Filter size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center">
              {Object.keys(activeFilters).filter((k) => activeFilters[k as keyof ProductFilters] !== undefined).length}
            </span>
          )}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-ink transition-colors"
          >
            <X size={12} />
            Limpiar
          </button>
        )}

        {/* View toggle */}
        <div className="flex items-center bg-white border border-surface-muted rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors ${
              viewMode === 'table' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            <Grid3X3 size={14} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel filters={activeFilters} onApply={handleFilter} onClose={() => setShowFilters(false)} />
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.status && (
            <FilterChip
              label={`Estado: ${activeFilters.status}`}
              onRemove={() => handleFilter({ ...activeFilters, status: undefined })}
            />
          )}
          {activeFilters.commercial_status && (
            <FilterChip
              label={`Comercial: ${activeFilters.commercial_status}`}
              onRemove={() => handleFilter({ ...activeFilters, commercial_status: undefined })}
            />
          )}
          {activeFilters.brand && (
            <FilterChip
              label={`Marca: ${activeFilters.brand}`}
              onRemove={() => handleFilter({ ...activeFilters, brand: undefined })}
            />
          )}
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      ) : (
        <ProductGrid products={products} loading={loading} onProductClick={handleProductClick} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm text-muted bg-white border border-surface-muted rounded-lg hover:text-ink hover:border-brand/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm text-muted bg-white border border-surface-muted rounded-lg hover:text-ink hover:border-brand/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filter Panel ──
function FilterPanel({
  filters,
  onApply,
  onClose,
}: {
  filters: ProductFilters
  onApply: (filters: ProductFilters) => void
  onClose: () => void
}) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)

  return (
    <div className="bg-white rounded-xl border border-surface-muted p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            Estado
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        {/* Commercial status */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            Estado comercial
          </label>
          <select
            value={localFilters.commercial_status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, commercial_status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
            <option value="out_of_stock">Agotado</option>
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            Marca
          </label>
          <input
            type="text"
            value={localFilters.brand || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value || undefined })}
            placeholder="Buscar marca..."
            className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Price range */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            Precio
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localFilters.min_price || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Min"
              className="w-full px-2 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              value={localFilters.max_price || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Max"
              className="w-full px-2 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-surface-muted">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => onApply(localFilters)}
          className="px-4 py-1.5 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-light transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  )
}

// ── Filter Chip ──
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-light transition-colors">
        <X size={12} />
      </button>
    </span>
  )
}
