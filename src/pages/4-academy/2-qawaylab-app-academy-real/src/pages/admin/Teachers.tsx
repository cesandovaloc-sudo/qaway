import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useData } from '@/hooks/useData'

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Docente' },
  { value: 'editor', label: 'Editor' },
  { value: 'support', label: 'Soporte' },
]

interface TeacherRow {
  id: string
  full_name: string | null
  role: string | null
  totalCourses: number
  activeCourses: number
  totalStudents: number
  created_at: string | null
}

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Docente',
  editor: 'Editor',
  support: 'Soporte',
  admin: 'Admin',
  student: 'Alumno',
}

const ROLE_BADGE: Record<string, string> = {
  teacher: 'badge-warning',
  editor: 'badge-info',
  support: 'badge',
  admin: 'badge-danger',
  student: 'badge-success',
}

async function loadTeachers(): Promise<TeacherRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role, created_at,
      courses:courses!instructor_id (id, title, status,
        students:enrollments (id)
      )
    `)
    .in('role', ['teacher', 'editor'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(t => {
        const totalCourses = t.courses?.length || 0
        const activeCourses = t.courses?.filter(c => c.status === 'published')?.length || 0
        const totalStudents = [...new Set(
          (t.courses || []).flatMap(c => c.students?.map(s => s.id) || [])
        )].length
        return {
          id: t.id,
          full_name: t.full_name,
          role: t.role,
          totalCourses,
          activeCourses,
          totalStudents,
          created_at: t.created_at,
        }
    })
}

export default function Teachers() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const { data: teachers, loading, refetch } = useData(loadTeachers, [])

  const filtered = (teachers || []).filter(t =>
    t.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleRoleChange(userId: string, userName: string | null, currentRole: string | null, newRole: string) {
    if (newRole === currentRole) return
    if (!confirm(`¿Cambiar rol de "${userName}" de "${ROLE_LABEL[currentRole || ''] || currentRole}" a "${ROLE_LABEL[newRole || ''] || newRole}"?`)) return

    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      refetch()
    } catch (err) {
      alert('Error al cambiar rol: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUpdating(null)
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) return

    setCreating(true)
    setCreateError('')
    try {
      const { data: _data, error } = await supabase.rpc('admin_create_teacher', {
        p_email: form.email,
        p_password: form.password,
        p_full_name: form.full_name || null,
      })
      if (error) throw error
      setShowModal(false)
      setForm({ email: '', password: '', full_name: '' })
      refetch()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err) || 'Error al crear docente')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Docentes</h1>
          <p className="section-subtitle mt-1">Gestiona los docentes y editores de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/alumnos" className="btn-ghost text-sm">
            Gestionar todos los usuarios
          </Link>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
            + Nuevo Docente
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-surface-100 p-4">
          <input
            type="text"
            placeholder="Buscar docentes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 text-surface-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">Nombre</th>
                    <th className="text-center px-6 py-4 font-medium">Rol</th>
                    <th className="text-center px-6 py-4 font-medium">Cursos</th>
                    <th className="text-center px-6 py-4 font-medium">Alumnos</th>
                    <th className="text-left px-6 py-4 font-medium">Registro</th>
                    <th className="text-center px-6 py-4 font-medium">Cambiar rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                            {(t.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-surface-900">{t.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${ROLE_BADGE[t.role || ''] || 'bg-surface-100 text-surface-600'}`}>
                          {ROLE_LABEL[t.role || ''] || t.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-surface-700">
                        {t.totalCourses}
                        {t.activeCourses > 0 && (
                          <span className="ml-1 text-xs text-surface-400">({t.activeCourses} activos)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-surface-700">{t.totalStudents}</td>
                      <td className="px-6 py-4 text-surface-500 text-sm">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={t.role || ''}
                          disabled={updating === t.id}
                          onChange={(e) => handleRoleChange(t.id, t.full_name, t.role, e.target.value)}
                          className={`input-field w-auto text-xs py-1.5 ${updating === t.id ? 'opacity-50' : ''}`}
                        >
                          {ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {updating === t.id && (
                          <span className="ml-2 text-xs text-surface-400">guardando...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="p-12 text-center text-sm text-surface-400">
                {search ? 'No se encontraron docentes' : 'No hay docentes o editores registrados'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-none bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-surface-900">Nuevo Docente</h2>
              <p className="text-sm text-surface-500 mt-1">Crea una cuenta de docente en la plataforma</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label-field">Nombre completo</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="input-field"
                  placeholder="Ej: Carlos López"
                />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="docente@ejemplo.com"
                />
              </div>
              <div>
                <label className="label-field">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {createError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setCreateError('') }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary"
                >
                  {creating ? 'Creando...' : 'Crear Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
