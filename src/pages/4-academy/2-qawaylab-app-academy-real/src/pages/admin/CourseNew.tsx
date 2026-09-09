import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { createCourse, getCategories } from '@/lib/services'
import type { Category } from '@/lib/types'

const STATUS_MAP: Record<string, string> = {
  'Borrador': 'draft',
  'Revisión': 'review',
  'Publicado': 'published',
}

export default function CourseNew() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const fromTeacher = location.pathname.startsWith('/academy/app/docente')
  const returnPath = fromTeacher ? '/academy/app/docente/cursos' : '/academy/app/admin/cursos'

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    level: 'Principiante',
    category: 'Desarrollo',
    image_url: '',
    price: '',
    status: 'Borrador',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories({ activeOnly: true })
      .then(data => {
        setCategories(data || [])
        if (data?.length > 0) {
          setForm(prev => ({ ...prev, category: data[0].name }))
        }
      })
      .catch(() => {})
  }, [])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setError('')
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'title') {
      setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setError('')

    const isFree = !form.price || form.price.trim().toLowerCase() === 'gratis'
    const price = isFree ? null : parseFloat(form.price.replace(/[^0-9.]/g, ''))

    try {
      await createCourse({
        title: form.title.trim(),
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description.trim(),
        instructor_id: user.id,
        level: form.level,
        category: form.category,
        image_url: form.image_url?.trim() || null,
        price: price !== null && !isNaN(price) ? price : null,
        is_free: isFree,
        status: STATUS_MAP[form.status] || 'draft',
      })
      navigate(returnPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al crear el curso. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
          {fromTeacher ? (
            <>
              <Link to="/academy/app/docente" className="hover:text-surface-600">Panel</Link>
              <span>/</span>
              <Link to="/academy/app/docente/cursos" className="hover:text-surface-600">Mis Cursos</Link>
            </>
          ) : (
            <>
              <Link to="/academy/app/admin" className="hover:text-surface-600">Admin</Link>
              <span>/</span>
              <Link to="/academy/app/admin/cursos" className="hover:text-surface-600">Cursos</Link>
            </>
          )}
          <span>/</span>
          <span className="text-surface-900 font-medium">Nuevo Curso</span>
        </nav>
        <h1 className="section-title">Nuevo Curso</h1>
        <p className="section-subtitle mt-1">Crea un nuevo curso en la plataforma</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-surface-900">Información Básica</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-field">Título del curso</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="input-field text-surface-400" />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Descripción</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[100px]" rows={4} />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Descripción Corta</label>
              <input name="short_description" value={form.short_description} onChange={handleChange} className="input-field" placeholder="Resumen breve para tarjetas" />
            </div>

            <div>
              <label className="label-field">Nivel</label>
              <select name="level" value={form.level} onChange={handleChange} className="input-field">
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </div>

            <div>
              <label className="label-field">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {categories.length > 0 ? categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                )) : (
                  <>
                    <option>Inteligencia Artificial</option>
                    <option>Productividad</option>
                    <option>Marketing</option>
                    <option>Diseño</option>
                    <option>Automatización</option>
                    <option>Desarrollo</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="label-field">URL de imagen de portada</label>
              <input name="image_url" value={form.image_url} onChange={handleChange} className="input-field" placeholder="https://picsum.photos/id/1/640/360" />
            </div>

            <div>
              <label className="label-field">Precio</label>
              <input name="price" value={form.price} onChange={handleChange} className="input-field" placeholder="Gratis o $49.99" />
            </div>

            <div>
              <label className="label-field">Estado</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option>Borrador</option>
                <option>Revisión</option>
                <option>Publicado</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link to={returnPath} className="btn-secondary" tabIndex={saving ? -1 : 0}>Cancelar</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </span>
            ) : 'Crear Curso'}
          </button>
        </div>
      </form>
    </div>
  )
}
