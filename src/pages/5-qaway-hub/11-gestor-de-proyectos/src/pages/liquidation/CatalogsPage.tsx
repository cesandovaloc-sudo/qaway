import { useState } from 'react'
import { FileText, Plus, Search, Loader2, AlertCircle, X } from 'lucide-react'
import { useCatalogs } from '@/hooks/useCatalogs'
import { CatalogCard } from '@/components/catalog/CatalogCard'
import type { Catalog } from '@/types'

export default function CatalogsPage() {
  const { catalogs, loading, error, pagination, setPage, deleteCatalog, createCatalog } = useCatalogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', is_public: false })

  const filteredCatalogs = catalogs.filter(catalog =>
    catalog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (catalog.description && catalog.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (catalog: Catalog) => {
    if (window.confirm(`¿Eliminar el catálogo "${catalog.name}"?`)) {
      await deleteCatalog(catalog.id)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) return
    try {
      setSaving(true)
      await createCatalog({
        name: form.name.trim(),
        description: form.description.trim() || null,
        is_public: form.is_public,
        template: 'professional',
        campaign_id: null,
      })
      setForm({ name: '', description: '', is_public: false })
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <FileText size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Catálogos Digitales
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Genera catálogos PDF y vistas públicas de tus productos para clientes.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => setShowForm(true)}
                  className="pxp-btn primary"
                  title="Crear nuevo catálogo"
                >
                  <Plus size={15} /> Nuevo catálogo
                </button>
              </div>
            </div>

            {/* Toolbar oficial */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar catálogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-[#ff4b0b] animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ) : filteredCatalogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {searchTerm ? 'Sin coincidencias' : 'No hay catálogos creados'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No se encontraron catálogos que coincidan con tu búsqueda.' 
                    : 'Crea tu primer catálogo para generar enlaces públicos o PDFs descargables.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Crear catálogo
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredCatalogs.map(catalog => (
                    <CatalogCard
                      key={catalog.id}
                      catalog={catalog}
                      onEdit={(c) => console.log('Edit:', c)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5ebf4]">
                    <p className="text-sm text-[#71809e]">
                      Mostrando {filteredCatalogs.length} de {pagination.total} catálogos
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-[#34415b] font-medium px-2">
                        {pagination.page} / {pagination.total_pages}
                      </span>
                      <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                        className="pxp-btn"
                        style={{ height: '32px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal Form */}
            {showForm && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setShowForm(false)}
              >
                <form
                  onSubmit={handleCreate}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl border border-[#e4e4e7]"
                >
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <h2 className="text-lg font-bold text-[#111b2d]">Nuevo catálogo</h2>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-[#71809e] hover:text-[#111b2d] font-bold text-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#52525b] mb-1.5">Nombre del catálogo</label>
                    <input
                      required
                      placeholder="Ej. Colección Verano 2026"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none focus:border-[#ff4b0b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#52525b] mb-1.5">Descripción (opcional)</label>
                    <textarea
                      placeholder="Detalles del catálogo o tarifas..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none focus:border-[#ff4b0b] min-h-[80px]"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 text-sm text-[#34415b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={e => setForm({ ...form, is_public: e.target.checked })}
                      className="w-4 h-4 rounded text-[#ff4b0b] focus:ring-[#ff4b0b]"
                    />
                    <span>Publicar catálogo (acceso público para clientes)</span>
                  </label>
                  <button
                    disabled={saving}
                    className="w-full pxp-btn primary justify-center"
                    style={{ height: '42px', marginTop: '14px' }}
                  >
                    {saving ? 'Guardando catálogo...' : 'Guardar catálogo'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
