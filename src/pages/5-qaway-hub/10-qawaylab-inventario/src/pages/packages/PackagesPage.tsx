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

  const activeCount = bundles.filter(b => b.status === 'active').length
  const discountCount = bundles.filter(b => b.discount > 0).length

  return (
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <Package size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Paquetes y Combos
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Agrupa productos para ofrecer soluciones completas y combos comerciales.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={() => setShowForm(true)}
                  className="pxp-btn primary"
                  title="Crear nuevo paquete"
                >
                  <Plus size={15} /> Nuevo Paquete
                </button>
              </div>
            </div>

            {/* Resumen Métricas oficiales pxp */}
            <section className="pxp-metrics" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Total Paquetes</span>
                  <div className="pxp-metric-icon" style={{ color: '#0284c7', background: '#f0f9ff' }}><Package size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: '#0284c7' }}>{bundles.length}</div>
                <div className="pxp-metric-note">En catálogo</div>
              </div>

              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Paquetes Activos</span>
                  <div className="pxp-metric-icon" style={{ color: '#059669', background: '#ecfdf5' }}><Package size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: '#059669' }}>{activeCount}</div>
                <div className="pxp-metric-note">Listos para vender</div>
              </div>

              <div className="pxp-metric">
                <div className="pxp-metric-top">
                  <span className="pxp-metric-label">Con Descuento</span>
                  <div className="pxp-metric-icon" style={{ color: '#7c3aed', background: '#f5f3ff' }}><Package size={16} /></div>
                </div>
                <div className="pxp-metric-value" style={{ color: '#7c3aed' }}>{discountCount}</div>
                <div className="pxp-metric-note">En promoción</div>
              </div>
            </section>

            {/* Toolbar oficial pxp */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="pxp-table-wrap" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Package size={48} className="mx-auto text-muted mb-4" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111b2d', marginBottom: '4px' }}>No hay paquetes</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                  Crea tu primer paquete para agrupar productos relacionados
                </p>
                <button onClick={() => setShowForm(true)} className="pxp-btn primary" style={{ margin: '0 auto' }}>
                  <Plus size={15} /> Crear paquete
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
                  <div className="pxp-toolbar" style={{ marginTop: '16px', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                      Mostrando {filteredBundles.length} de {pagination.total} paquetes
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="pxp-btn secondary"
                        style={{ height: '32px', fontSize: '12px' }}
                      >
                        Anterior
                      </button>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                        {pagination.page} / {pagination.total_pages}
                      </span>
                      <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                        className="pxp-btn secondary"
                        style={{ height: '32px', fontSize: '12px' }}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal Nuevo Paquete */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <form onSubmit={handleCreate} className="w-full max-w-md space-y-4 rounded-2xl bg-surface border border-zinc-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-lg font-bold text-ink">Nuevo Paquete</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Nombre del paquete *</label>
              <input required placeholder="Ej: Combo Gamer Pro" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">SKU *</label>
              <input required placeholder="Ej: PKG-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Descripción</label>
              <textarea placeholder="Detalle de los productos incluidos..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Precio del paquete (S/)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.bundle_price} onChange={e => setForm({ ...form, bundle_price: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200">
              <button type="button" onClick={() => setShowForm(false)} className="pxp-btn secondary" style={{ height: '36px' }}>Cancelar</button>
              <button disabled={saving} className="pxp-btn primary" style={{ height: '36px' }}>{saving ? 'Guardando...' : 'Guardar Paquete'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
