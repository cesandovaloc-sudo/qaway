import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBlog } from '../../context/BlogContext'

export default function BlogCategoriesManager() {
  const { categories, posts, addCategory } = useBlog()
  const [newCatName, setNewCatName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCatName.trim()) {
      await addCategory(newCatName.trim())
      setNewCatName('')
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h3 className="text-base font-display font-bold text-primary">Gestión de Categorías</h3>
          <p className="text-xs text-muted-light">
            Estructura los temas y taxonomías que organizan los artículos del blog.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 bg-[#24262e] hover:bg-[#2f323c] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-line rounded-xl p-4 shadow-xs space-y-3"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Crear Nueva Categoría
          </h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              autoFocus
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Nombre de la categoría (ej: E-commerce, SEO, Ventas...)"
              className="flex-1 bg-surface-muted border border-line rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 text-xs font-semibold text-muted hover:text-primary cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(cat => {
          const postCount = posts.filter(
            p => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length

          return (
            <div
              key={cat.id}
              className="bg-white border border-line rounded-xl p-4 shadow-xs flex items-center justify-between hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#ff4b0b' }}
                />
                <div>
                  <h4 className="text-sm font-bold text-primary">{cat.name}</h4>
                  <p className="text-[11px] font-mono text-muted-light">/categoria/{cat.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-surface-muted text-primary border border-line">
                  {postCount} {postCount === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
