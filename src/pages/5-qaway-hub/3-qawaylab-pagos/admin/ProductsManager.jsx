import { useState, useEffect } from 'react'

const PRODUCT_TYPES = [
  { value: 'course', label: 'Curso' },
  { value: 'digital', label: 'Digital (descargable)' },
  { value: 'service', label: 'Servicio / Consultoría' },
  { value: 'physical', label: 'Físico (merchandising)' },
]

export default function ProductsManager({ productsService, title = 'Productos' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '', slug: '', description: '', price: '', type: 'physical', category: '',
    image_url: '', compare_price: '', stock: '', status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await productsService.getProducts({ status: undefined })
      setProducts(data || [])
    } catch (err) {
      setError(err?.message || 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  function resetForm() {
    setForm({ title: '', slug: '', description: '', price: '', type: 'physical', category: '', image_url: '', compare_price: '', stock: '', status: 'draft' })
    setEditingId(null)
    setFormError('')
  }

  function handleEdit(product) {
    setForm({
      title: product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price ? String(product.price) : '',
      type: product.type || 'physical',
      category: product.category || '',
      image_url: product.image_url || '',
      compare_price: product.compare_price ? String(product.compare_price) : '',
      stock: product.stock !== undefined ? String(product.stock) : '',
      status: product.status || 'draft',
    })
    setEditingId(product.id)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'title' && !editingId) {
      setForm(prev => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setFormError('')
    try {
      const data = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        type: form.type,
        category: form.category || null,
        image_url: form.image_url || null,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock) || 0,
        status: form.status,
      }
      if (editingId) {
        await productsService.updateProduct(editingId, data)
      } else {
        await productsService.createProduct(data)
      }
      resetForm()
      await loadProducts()
    } catch (err) {
      setFormError(err?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Archivar este producto?')) return
    try {
      await productsService.deleteProduct(id)
      await loadProducts()
    } catch (err) {
      alert('Error: ' + err?.message)
    }
  }

  return (
    <div>
      <h1 className="section-title mb-6">{title}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-surface-900 mb-4">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field text-sm" htmlFor="pm-title">Título</label>
              <input id="pm-title" name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label-field text-sm" htmlFor="pm-slug">Slug</label>
              <input id="pm-slug" name="slug" value={form.slug} onChange={handleChange} className="input-field text-surface-400" required />
            </div>
            <div>
              <label className="label-field text-sm" htmlFor="pm-description">Descripción</label>
              <textarea id="pm-description" name="description" value={form.description} onChange={handleChange} className="input-field min-h-[60px] text-sm" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field text-sm" htmlFor="pm-price">Precio</label>
                <input id="pm-price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label-field text-sm" htmlFor="pm-type">Tipo</label>
                <select id="pm-type" name="type" value={form.type} onChange={handleChange} className="input-field">
                  {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field text-sm" htmlFor="pm-category">Categoría</label>
                <input id="pm-category" name="category" value={form.category} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label-field text-sm" htmlFor="pm-stock">Stock</label>
                <input id="pm-stock" name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field text-sm" htmlFor="pm-status">Estado</label>
                <select id="pm-status" name="status" value={form.status} onChange={handleChange} className="input-field">
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div>
                <label className="label-field text-sm" htmlFor="pm-compare-price">Precio comparativo</label>
                <input id="pm-compare-price" name="compare_price" type="number" step="0.01" value={form.compare_price} onChange={handleChange} className="input-field" placeholder="S/ 99.90" />
              </div>
            </div>
            <div>
              <label className="label-field text-sm" htmlFor="pm-image-url">URL imagen</label>
              <input id="pm-image-url" name="image_url" value={form.image_url} onChange={handleChange} className="input-field" placeholder="https://..." />
            </div>

            {formError && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{formError}</div>}

            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear producto'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="btn-ghost text-sm">Cancelar</button>}
            </div>
          </form>
        </div>

        <div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>
          ) : error ? (
            <div className="card p-12 text-center text-surface-500">{error}</div>
          ) : products.length > 0 ? (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="card-hover flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-surface-900 truncate">{p.title}</p>
                    <p className="text-xs text-surface-400">
                      {PRODUCT_TYPES.find(t => t.value === p.type)?.label || p.type}
                      {p.price ? ` · S/${parseFloat(p.price).toFixed(2)}` : ''}
                      {p.stock !== undefined ? ` · Stock: ${p.stock}` : ''}
                      {p.category ? ` · ${p.category}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                      p.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      p.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-surface-100 text-surface-500'
                    }`}>
                      {p.status === 'active' ? 'Activo' : p.status === 'draft' ? 'Borrador' : 'Archivado'}
                    </span>
                    <button onClick={() => handleEdit(p)} className="text-xs text-surface-600 hover:text-surface-900 px-2 py-1">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1">Archivar</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-surface-500">No hay productos. Crea el primero.</div>
          )}
        </div>
      </div>
    </div>
  )
}
