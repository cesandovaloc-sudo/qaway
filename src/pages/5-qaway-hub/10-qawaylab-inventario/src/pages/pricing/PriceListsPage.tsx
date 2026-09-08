import { useState } from 'react'
import { Plus, Tag, Loader2 } from 'lucide-react'
import { usePriceLists } from '@/hooks/usePriceLists'
import PriceListCard from '@/components/pricing/PriceListCard'
import PriceListForm from '@/components/pricing/PriceListForm'
import type { PriceList } from '@/types'

export default function PriceListsPage() {
  const { lists, loading, createList, updateList, deleteList, toggleActive } = usePriceLists()
  const [showForm, setShowForm] = useState(false)
  const [editingList, setEditingList] = useState<PriceList | null>(null)
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
            Listas de precios
          </h1>
          <p className="text-sm text-muted mt-1">
            {lists.length} lista{lists.length !== 1 ? 's' : ''} configurada{lists.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
        >
          <Plus size={14} />
          Nueva lista
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-brand animate-spin" />
        </div>
      ) : lists.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-muted p-12 text-center">
          <Tag size={40} className="mx-auto text-muted-light mb-3" />
          <h3 className="font-display text-lg font-semibold text-ink mb-2">
            Sin listas de precios
          </h3>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Crea listas de precios para gestionar diferentes tarifas: normal, mayorista,
            oferta, liquidación, etc.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light transition-colors"
          >
            <Plus size={14} />
            Crear primera lista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
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
  )
}
