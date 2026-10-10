import { useState } from 'react'
import { Plus, Tag, Loader2, Search } from 'lucide-react'
import { usePriceLists } from '@/hooks/usePriceLists'
import PriceListCard from '@/components/pricing/PriceListCard'
import PriceListForm from '@/components/pricing/PriceListForm'
import type { PriceList } from '@/types'

export default function PriceListsPage() {
  const { lists, loading, error, createList, updateList, deleteList, toggleActive } = usePriceLists()
  const [showForm, setShowForm] = useState(false)
  const [editingList, setEditingList] = useState<PriceList | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const handleCreate = () => {
    setEditingList(null)
    setShowForm(true)
  }

  const handleEdit = (list: PriceList) => {
    setEditingList(list)
    setShowForm(true)
  }

  const handleSave = async (data: Partial<PriceList>) => {
    setSaving(true)
    try {
      if (editingList) {
        await updateList(editingList.id, data)
      } else {
        await createList(data)
      }
      setShowForm(false)
      setEditingList(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta lista de precios?')) {
      await deleteList(id)
    }
  }

  const filteredLists = lists.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="pxp-root">
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* Header oficial pxp */}
            <div className="pxp-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pxp-heading-icon">
                  <Tag size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 2px', color: '#111b2d' }}>
                    Listas de precios
                  </h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    {lists.length} lista{lists.length !== 1 ? 's' : ''} configurada{lists.length !== 1 ? 's' : ''} para tus tarifas comerciales.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  onClick={handleCreate}
                  className="pxp-btn primary"
                  title="Crear nueva lista de precios"
                >
                  <Plus size={15} /> Nueva lista
                </button>
              </div>
            </div>

            {/* Toolbar oficial */}
            <div className="pxp-toolbar">
              <div className="pxp-search">
                <Search size={15} style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar listas de precios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
                No se pudo guardar o cargar la lista: {error}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-[#ff4b0b] animate-spin" />
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e7] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#f4f4f5] text-[#52525b] grid place-items-center mx-auto mb-3 text-xl">
                  <Tag size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#111b2d] mb-1">
                  {search ? 'Sin coincidencias' : 'Sin listas de precios'}
                </h3>
                <p className="text-sm text-[#71809e] mb-6 max-w-md mx-auto">
                  {search 
                    ? 'No se encontraron listas que coincidan con tu búsqueda.' 
                    : 'Crea listas de precios para gestionar diferentes tarifas: normal, mayorista, oferta, liquidación, etc.'}
                </p>
                {!search && (
                  <button
                    onClick={handleCreate}
                    className="pxp-btn primary"
                  >
                    <Plus size={15} /> Crear primera lista
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLists.map((list) => (
                  <PriceListCard
                    key={list.id}
                    list={list}
                    onToggleActive={toggleActive}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Form modal */}
            {showForm && (
              <PriceListForm
                list={editingList}
                onSave={handleSave}
                onClose={() => {
                  setShowForm(false)
                  setEditingList(null)
                }}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
