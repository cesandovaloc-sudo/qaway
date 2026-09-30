import { useState } from 'react'
import { Package, Plus, Search, Loader2, AlertCircle, X } from 'lucide-react'
import { useBundles } from '@/hooks/useBundles'
import { BundleCard } from '@/components/bundles/BundleCard'

export default function PackagesPage() {
  const { bundles, loading, error, pagination, setPage, deleteBundle, createBundle } = useBundles()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', description: '', bundle_price: '' })

  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (bundle: typeof bundles[0]) => {
    if (window.confirm(`¿Eliminar el paquete "${bundle.name}"?`)) {
      await deleteBundle(bundle.id)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.sku.trim()) return
    try {
      setSaving(true)
      await createBundle({
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || null,
        bundle_price: Number(form.bundle_price) || 0,
        discount: 0,
        status: 'active',
        image_url: null,
        total_individual_price: 0,
        items: [],
      })
      setForm({ name: '', sku: '', description: '', bundle_price: '' })
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Paquetes</h1>
          <p className="text-sm text-gray-500">Agrupa productos para ofrecer soluciones completas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo paquete
        </button>
      </div>

      {/* Search — sticky anti-scroll (ref HubPanelPage.jsx:990) */}
      <div className="sticky top-0 z-30 relative bg-white/95 backdrop-blur-md border border-zinc-200 py-1 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
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
           <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo paquete</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <input required placeholder="Nombre del paquete" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <input required placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <input type="number" min="0" step="0.01" placeholder="Precio del paquete" value={form.bundle_price} onChange={e => setForm({ ...form, bundle_price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <button disabled={saving} className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar paquete'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
