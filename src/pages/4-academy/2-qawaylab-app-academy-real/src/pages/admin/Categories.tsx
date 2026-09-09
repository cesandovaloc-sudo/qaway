import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/services'
import type { Category } from '@/lib/types'
import type { ChangeEvent, FormEvent } from 'react'

export default function AdminCategories() {
  const { data: categories, loading, error, refetch } = useData(() => getCategories(), [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; slug: string; description: string; sort_order: number }>({ name: '', slug: '', description: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function resetForm() {
    setForm({ name: '', slug: '', description: '', sort_order: 0 })
    setEditingId(null)
    setFormError('')
  }

  function handleEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      sort_order: cat.sort_order || 0,
    })
    setEditingId(cat.id)
    setFormError('')
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'name' && !editingId) {
      setForm(prev => ({
        ...prev,
        name: value,
        slug: value.toLowerCase()
          .replace(/[^a-z0-9áéíóúñü ]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          sort_order: Number(form.sort_order) || 0,
        })
      } else {
        await createCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          sort_order: Number(form.sort_order) || 0,
        })
      }
      resetForm()
      await refetch()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err) || 'Error al guardar la categoría')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los cursos existentes conservarán su categoría actual.')) return
    try {
      await deleteCategory(id)
      await refetch()
    } catch (err) {
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
          <Link to="/academy/app/admin" className="hover:text-surface-600">Admin</Link>
          <span>/</span>
          <span className="text-surface-900 font-medium">Categorías</span>
        </nav>
        <h1 className="section-title">Categorías</h1>
        <p className="section-subtitle mt-1">Gestiona las categorías de cursos. Se reflejan en Academy y en Qaway Lab Web automáticamente.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Form */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-surface-900 mb-4">
            {editingId ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field text-sm">Nombre</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Ej: No-Code"
              />
            </div>
            <div>
              <label className="label-field text-sm">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="input-field text-surface-400"
                required
                placeholder="no-code"
              />
            </div>
            <div>
              <label className="label-field text-sm">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field min-h-[60px] text-sm"
                rows={2}
                placeholder="Breve descripción de la categoría"
              />
            </div>
            <div>
              <label className="label-field text-sm">Orden</label>
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={handleChange}
                className="input-field w-20"
                min={0}
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {formError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary text-sm" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear categoría'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-ghost text-sm">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : error ? (
            <div className="card p-12 text-center text-surface-500">
              Error al cargar categorías
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="card-hover flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-none bg-surface-100 text-xs font-bold text-surface-500 shrink-0">
                        {cat.sort_order || '-'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 truncate">{cat.name}</p>
                        <p className="text-xs text-surface-400 truncate">
                          /{cat.slug}
                          {cat.description && <span className="ml-2">· {cat.description}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="rounded-none px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-none px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-surface-500">
              No hay categorías. Crea la primera desde el formulario.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
