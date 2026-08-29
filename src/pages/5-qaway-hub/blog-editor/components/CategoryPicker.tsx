import React, { useState } from 'react'
import { Plus, Check, Tag } from 'lucide-react'
import { useBlog } from '../context/BlogContext'

interface CategoryPickerProps {
  value: string
  onChange: (category: string) => void
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { categories, addCategory } = useBlog()
  const [isOpen, setIsOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCatName.trim()) {
      const created = await addCategory(newCatName.trim())
      onChange(created.name)
      setNewCatName('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  const selectedCategory = categories.find(c => c.name.toLowerCase() === value?.toLowerCase())

  return (
    <div className="relative">
      <label className="text-[11px] font-bold uppercase tracking-wider text-primary/50 mb-1.5 block">
        Categoría
      </label>

      {/* Botón selector principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-line hover:border-primary/30 rounded-lg px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <Tag className="w-4 h-4 text-accent shrink-0" />
          <span className="font-semibold text-primary truncate">
            {value || 'Seleccionar categoría...'}
          </span>
        </div>
        {selectedCategory?.color && (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ml-2"
            style={{ backgroundColor: selectedCategory.color }}
          />
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-line rounded-xl shadow-xl z-30 p-2 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="space-y-1 mb-2">
              {categories.map(cat => {
                const isSelected = cat.name.toLowerCase() === value?.toLowerCase()
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onChange(cat.name)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-accent/10 text-accent font-bold'
                        : 'text-primary/70 hover:bg-surface hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color || '#ff4b0b' }}
                      />
                      <span>{cat.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>
                )
              })}
            </div>

            {/* Crear nueva categoría */}
            <div className="pt-2 border-t border-line">
              {isCreating ? (
                <form onSubmit={handleCreate} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Nombre categoría"
                    className="flex-1 bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-accent-dark transition-colors"
                  >
                    Añadir
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-accent hover:bg-accent/5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva categoría
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
