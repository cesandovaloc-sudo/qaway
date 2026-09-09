import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'

async function loadAllCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, category, level, status, price, is_free,
      instructor:instructor_id (id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

const STATUS_MAP: Record<string, string> = {
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

export default function AdminCourses() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: courses, loading, error } = useData(loadAllCourses, [])

  const filtered = (courses || []).filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Cursos</h1>
          <p className="section-subtitle mt-1">Gestiona todos los cursos de la plataforma</p>
        </div>
        <Link to="/admin/cursos/nuevo" className="btn-primary text-sm">+ Nuevo Curso</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-surface-100 p-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-sm"
          />
          <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="review">Revisión</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        {error ? (
          <div className="p-12 text-center text-sm text-red-500">
            Error al cargar cursos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Curso</th>
                  <th className="text-left px-6 py-4 font-medium">Instructor</th>
                  <th className="text-center px-6 py-4 font-medium">Estado</th>
                  <th className="text-left px-6 py-4 font-medium">Precio</th>
                  <th className="text-right px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/cursos/${c.slug}/editar`} className="font-medium text-surface-900 hover:text-primary-600 transition-colors">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-surface-500">{c.instructor?.[0]?.full_name || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge text-xs ${STATUS_COLORS[String(c.status)] || 'badge'}`}>
                        {STATUS_MAP[String(c.status)] || c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-700">
                      {c.is_free ? 'Gratis' : c.price ? `$${parseFloat(c.price).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/cursos/${c.slug}/editar`} className="btn-ghost text-xs">Editar</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-surface-400">
            {search ? 'No se encontraron cursos' : 'No hay cursos registrados'}
          </div>
        )}
      </div>
    </div>
  )
}
