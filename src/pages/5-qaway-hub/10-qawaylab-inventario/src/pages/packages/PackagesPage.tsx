import { useState } from 'react'
import { Package, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useBundles } from '@/hooks/useBundles'
import { BundleCard } from '@/components/bundles/BundleCard'

export default function PackagesPage() {
  const { bundles, loading, error, pagination, setPage, deleteBundle } = useBundles()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (bundle: typeof bundles[0]) => {
    if (window.confirm(`¿Eliminar el paquete "${bundle.name}"?`)) {
      await deleteBundle(bundle.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paquetes</h1>
          <p className="text-sm text-gray-500">Agrupa productos para ofrecer soluciones completas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo paquete
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay paquetes</h3>
          <p className="text-sm text-gray-500 mb-4">
            Crea tu primer paquete para agrupar productos relacionados
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            Crear paquete
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBundles.map(bundle => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onView={(b) => console.log('View bundle:', b)}
                onEdit={(b) => console.log('Edit bundle:', b)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {filteredBundles.length} de {pagination.total} paquetes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
