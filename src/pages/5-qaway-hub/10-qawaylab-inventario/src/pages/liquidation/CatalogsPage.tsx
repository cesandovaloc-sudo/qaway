import { useState } from 'react'
import { FileText, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useCatalogs } from '@/hooks/useCatalogs'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import type { Catalog } from '@/types'

export default function CatalogsPage() {
  const { catalogs, loading, error, pagination, setPage, deleteCatalog } = useCatalogs()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCatalogs = catalogs.filter(catalog =>
    catalog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (catalog.description && catalog.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (catalog: Catalog) => {
    if (window.confirm(`¿Eliminar el catálogo "${catalog.name}"?`)) {
      await deleteCatalog(catalog.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
          <p className="text-sm text-gray-500">Genera catálogos PDF y vistas públicas de tus productos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo catálogo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar catálogos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : filteredCatalogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay catálogos</h3>
          <p className="text-sm text-gray-500 mb-4">
            Crea tu primer catálogo para generar PDFs y compartir productos
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Plus className="w-4 h-4" />
            Crear catálogo
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogs.map(catalog => (
              <CatalogCard
                key={catalog.id}
                catalog={catalog}
                onEdit={(c) => console.log('Edit:', c)}
                onDelete={handleDelete}
                onView={(c) => console.log('View:', c)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {filteredCatalogs.length} de {pagination.total} catálogos
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
