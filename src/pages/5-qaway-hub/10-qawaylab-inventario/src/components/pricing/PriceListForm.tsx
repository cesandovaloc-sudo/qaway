import { useState } from 'react'
import { X, Tag } from 'lucide-react'
import type { PriceList, PriceListType } from '@/types'
import { priceListTypeLabels } from '@/services/priceListService'

interface PriceListFormProps {
  list?: PriceList | null
  onSave: (data: Partial<PriceList>) => void
  onClose: () => void
  saving?: boolean
}

export default function PriceListForm({ list, onSave, onClose, saving }: PriceListFormProps) {
  const [formData, setFormData] = useState({
    name: list?.name || '',
    type: (list?.type || 'normal') as PriceListType,
    description: list?.description || '',
    is_active: list?.is_active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-muted">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-brand" />
            <h2 className="font-display text-lg font-semibold text-ink">
              {list ? 'Editar lista' : 'Nueva lista de precios'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Nombre <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="Ej: Precio mayorista"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PriceListType })}
              className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {(Object.keys(priceListTypeLabels) as PriceListType[]).map((type) => (
                <option key={type} value={type}>
                  {priceListTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-surface border border-surface-muted rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
              placeholder="Descripción opcional de la lista"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-ink">Activa por defecto</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.is_active ? 'bg-brand' : 'bg-surface-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  formData.is_active ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-muted">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.name || saving}
              className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : list ? 'Guardar cambios' : 'Crear lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
