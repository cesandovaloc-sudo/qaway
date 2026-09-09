import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourseBySlug, updateCourse, getCategories } from '@/lib/services'
import { getLessonResources, type StudentResource } from '@/lib/services/resources'
import type { Course, Category, Resource } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'review', label: 'Revisión' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  review: 'Revisión',
  archived: 'Archivado',
}

const STATUS_COLORS: Record<string, string> = {
  published: 'badge-success',
  draft: 'badge-warning',
  review: 'badge',
  archived: 'badge-danger',
}

interface CourseForm {
  title: string
  slug: string
  description: string
  short_description: string
  category: string
  level: string
  image_url: string
  price: string
  status: string
  featured: boolean
  free_preview_lessons: number
}

export default function CourseEdit() {
  const { slug } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [resources, setResources] = useState<Record<string, StudentResource[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [form, setForm] = useState<CourseForm>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    level: '',
    image_url: '',
    price: '',
    status: 'draft',
    featured: false,
    free_preview_lessons: 1,
  })

  const loadCourse = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCourseBySlug(slug as string)
      if (!data) return
      setCourse(data)
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        short_description: data.short_description || '',
        category: data.category || '',
        level: data.level || '',
        image_url: data.image_url || '',
        price: data.is_free ? '' : (data.price ? String(data.price) : ''),
        status: data.status || 'draft',
        featured: data.featured || false,
        free_preview_lessons: data.free_preview_lessons || 1,
      })

      // Load resources per lesson
      const map: Record<string, StudentResource[]> = {}
      for (const mod of data.modules || []) {
        for (const lesson of mod.lessons || []) {
          const r = await getLessonResources(lesson.id)
          map[lesson.id] = r || []
        }
      }
      setResources(map)
    } catch {
      // Silently handle - component shows "not found" state
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    loadCourse()
    getCategories({ activeOnly: true })
      .then(data => setCategories(data || []))
      .catch(() => {})
  }, [slug, loadCourse])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    const checked = target.checked
    setError('')
    setSaved(false)
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (name === 'title') {
      setForm(prev => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }))
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!course?.id) return

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const isFree = !form.price || form.price.trim().toLowerCase() === 'gratis'
      const price = isFree ? null : parseFloat(form.price.replace(/[^0-9.]/g, ''))

      await updateCourse(course.id, {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        short_description: form.short_description.trim(),
        category: form.category,
        level: form.level,
        image_url: form.image_url?.trim() || null,
        price: price !== null && !isNaN(price) ? price : null,
        is_free: isFree,
        status: form.status,
        featured: form.featured,
        free_preview_lessons: parseInt(String(form.free_preview_lessons)) || 1,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const totalResources = Object.values(resources).reduce((s, arr) => s + arr.length, 0)
  const totalLessons = course?.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="card p-12 text-center text-surface-500">Curso no encontrado</div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
          <Link to="/academy/app/admin" className="hover:text-surface-600">Admin</Link>
          <span>/</span>
          <Link to="/academy/app/admin/cursos" className="hover:text-surface-600">Cursos</Link>
          <span>/</span>
          <span className="text-surface-900 font-medium">Editar: {course.title}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">{course.title}</h1>
            <p className="section-subtitle mt-1">Modifica la información y recursos del curso</p>
          </div>
          <span className={`badge text-xs ${STATUS_COLORS[course.status || ''] || 'badge'}`}>
            {STATUS_LABELS[course.status || ''] || course.status}
          </span>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* Edit Form */}
        <form onSubmit={handleSave} className="card p-6 space-y-5">
          <h2 className="font-semibold text-surface-900">Información del Curso</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-field">Título</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="input-field text-surface-400" required />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Descripción Corta</label>
              <input name="short_description" value={form.short_description} onChange={handleChange} className="input-field" placeholder="Resumen breve para tarjetas" />
            </div>

            <div className="sm:col-span-2">
              <label className="label-field">Descripción Completa</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[100px]" rows={4} />
            </div>

            <div>
              <label className="label-field">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                <option value="">Seleccionar</option>
                {categories.length > 0 ? categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                )) : (
                  <>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Productividad">Productividad</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Automatización">Automatización</option>
                    <option value="Desarrollo">Desarrollo</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="label-field">Nivel</label>
              <select name="level" value={form.level} onChange={handleChange} className="input-field">
                <option value="">Seleccionar</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
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
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-surface-700">Curso destacado</label>
            </div>

            <div>
              <label className="label-field">Lecciones de vista previa gratis</label>
              <input
                type="number"
                name="free_preview_lessons"
                value={form.free_preview_lessons}
                onChange={handleChange}
                className="input-field w-24"
                min={0}
                max={99}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </span>
              ) : 'Guardar Cambios'}
            </button>
            {saved && (
              <span className="text-sm font-medium text-emerald-600">✓ Cambios guardados</span>
            )}
          </div>
        </form>

        {/* Modules & Lessons */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 mb-2">Módulos y Lecciones</h2>
          <p className="text-sm text-surface-500 mb-4">
            {course.modules?.length || 0} módulos · {totalLessons} lecciones · {totalResources} recursos
          </p>
          <Link to={`/docente/cursos/${slug}`} className="btn-secondary text-sm">
            Gestionar contenido y recursos
          </Link>
        </div>

        {/* Resources Overview */}
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 mb-4">Recursos del Curso</h2>

          {totalResources === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">📎</span>
              <p className="text-sm text-surface-500 mb-4">Este curso aún no tiene recursos</p>
              <Link to={`/docente/cursos/${slug}`} className="btn-primary text-sm">
                Subir recursos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(course.modules || [])
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((mod) => {
                  const hasResources = mod.lessons?.some(l => (resources[l.id]?.length || 0) > 0)
                  if (!hasResources) return null
                  return (
                    <div key={mod.id}>
                      <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">
                        {mod.title}
                      </h3>
                      <div className="space-y-2">
                        {(mod.lessons || [])
                          .filter(l => (resources[l.id]?.length || 0) > 0)
                          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                          .map((lesson) => (
                            <div key={lesson.id} className="rounded-none bg-surface-50 p-3">
                              <p className="text-xs font-medium text-surface-700 mb-2">
                                📖 {lesson.title}
                              </p>
                              <div className="space-y-1">
                                {(resources[lesson.id] || []).map((r) => (
                                  <div key={r.id} className="flex items-center gap-2 text-xs text-surface-500">
                                    <span>{r.type === 'PDF' ? '📄' : r.type === 'Excel' ? '📊' : r.type === 'Word' ? '📝' : '📎'}</span>
                                    <span>{r.title}</span>
                                    {r.file_size && <span>· {r.file_size}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}

              <div className="pt-3 border-t border-surface-100">
                <Link to={`/docente/cursos/${slug}`} className="btn-primary text-sm">
                  Gestionar recursos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
