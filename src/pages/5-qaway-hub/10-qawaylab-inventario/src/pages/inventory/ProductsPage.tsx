import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plus,
  Camera,
  Search,
  Filter,
  Grid3X3,
  List,
  X,
  FileSpreadsheet,
  Download,
  SlidersHorizontal,
  Check,
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductTable from '@/components/products/ProductTable'
import ProductGrid from '@/components/products/ProductGrid'
import ProductImport from '@/components/products/ProductImport'
import type { Product, ProductFilters } from '@/types'

type ViewMode = 'table' | 'grid'

const AVAILABLE_COLUMNS = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Producto y Marca' },
  { key: 'barcode', label: 'Código de barras' },
  { key: 'category', label: 'Categoría' },
  { key: 'stock', label: 'Stock' },
  { key: 'location', label: 'Ubicación' },
  { key: 'price', label: 'Precio base' },
  { key: 'min_price', label: 'Precio mínimo' },
  { key: 'status', label: 'Estado comercial' },
]

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
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'sku',
    'name',
    'category',
    'stock',
    'location',
    'price',
    'status',
  ])

  const columnPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target as Node)) {
        setShowColumnPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHub = typeof window !== 'undefined' && window.location.pathname.startsWith('/hub/inventario')

  const handleProductClick = useCallback((product: Product) => {
    navigate(isHub ? `/hub/inventario/logistica/${product.id}` : `/inventario/${product.id}`)
  }, [navigate, isHub])

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
    },
    []
  )

  const clearFilters = () => {
    setActiveFilters({})
    setSearch('')
    setFilters({})
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleExportCSV = () => {
    if (!products || products.length === 0) return
    const headers = ['SKU', 'Producto', 'Categoría', 'Stock', 'Ubicación', 'Precio', 'Estado']
    const rows = products.map((p) => [
      `"${p.sku || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category_id || ''}"`,
      p.stock || 0,
      `"${p.location_id || ''}"`,
      p.base_price || 0,
      `"${p.commercial_status || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventario_productos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const hasActiveFilters = Object.keys(activeFilters).some((k) => activeFilters[k as keyof ProductFilters] !== undefined)

  return (
    <div className="space-y-6">
      {/* Header Superior con Tipografía y Botones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Productos
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {total} producto{total !== 1 ? 's' : ''} en tu inventario.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-ink border border-zinc-200 rounded-xl text-xs md:text-sm font-semibold hover:border-brand/40 hover:bg-zinc-50/50 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-zinc-600" />
            Importar
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-ink border border-zinc-200 rounded-xl text-xs md:text-sm font-semibold hover:border-brand/40 hover:bg-zinc-50/50 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={15} className="text-zinc-600" />
            Exportar
          </button>
          <Link
            to={isHub ? '/hub/inventario/captura' : '/captura'}
            className="inline-flex items-center gap-2 h-9 md:h-10 px-4 md:px-5 bg-brand text-white rounded-xl text-xs md:text-sm font-bold hover:bg-brand-hover transition-colors shadow-xs"
          >
            <Camera size={15} />
            Capturar
          </Link>
          <Link
            to={isHub ? '/hub/inventario/logistica/nuevo' : '/inventario/nuevo'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-ink border border-zinc-200 rounded-xl text-xs md:text-sm font-semibold hover:border-brand/40 hover:bg-zinc-50/50 transition-colors shadow-xs"
          >
            <Plus size={15} className="text-zinc-700" />
            Nuevo
          </Link>
        </div>
      </div>

      {/* Importación desde Excel/CSV */}
      {importOpen && (
        <ProductImport
          onClose={() => setImportOpen(false)}
          onImported={() => {
            refresh()
          }}
        />
      )}

      {/* Toolbar */}
      <div className="sticky top-0 z-30 flex items-center flex-wrap gap-2.5 bg-white/95 backdrop-blur-md border border-zinc-200 py-2 px-3.5 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
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
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors cursor-pointer ${
            showFilters || hasActiveFilters
              ? 'bg-ink text-white'
              : 'bg-white text-muted border border-surface-muted hover:text-ink hover:border-brand/30'
          }`}
        >
          <Filter size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
              {Object.keys(activeFilters).filter((k) => activeFilters[k as keyof ProductFilters] !== undefined).length}
            </span>
          )}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={12} />
            Limpiar
          </button>
        )}

        {/* Column Picker Button & Popover */}
        <div className="relative" ref={columnPickerRef}>
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            title="Seleccionar datos y columnas visibles"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-muted border border-surface-muted rounded-lg text-xs md:text-sm font-semibold hover:text-ink hover:border-brand/30 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Columnas</span>
          </button>

          {showColumnPicker && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg p-2.5 z-40 space-y-1">
              <div className="px-2 py-1 border-b border-zinc-100 mb-1">
                <span className="text-xs font-bold text-zinc-800">Columnas visibles</span>
              </div>
              {AVAILABLE_COLUMNS.map((col) => {
                const checked = visibleColumns.includes(col.key)
                return (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <span className={checked ? 'text-zinc-900 font-medium' : 'text-zinc-500'}>
                      {col.label}
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked ? 'bg-brand border-brand text-white' : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-surface-muted rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('table')}
            title="Vista de lista / tabla"
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Vista de cuadrícula"
            className={`p-2 transition-colors cursor-pointer ${
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
          {(activeFilters.min_price !== undefined || activeFilters.max_price !== undefined) && (
            <FilterChip
              label={`Precio: S/ ${activeFilters.min_price ?? 0} - S/ ${activeFilters.max_price ?? '∞'}`}
              onRemove={() => handleFilter({ ...activeFilters, min_price: undefined, max_price: undefined })}
            />
          )}
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          loading={loading}
          visibleColumns={visibleColumns}
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
          className="h-10 px-5 text-sm font-bold text-white bg-brand rounded-xl hover:bg-brand-hover transition-colors"
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
