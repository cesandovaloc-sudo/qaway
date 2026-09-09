import { useState, type ChangeEvent } from 'react'
import { useData } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Alumno', color: 'badge-success' },
  { value: 'teacher', label: 'Docente', color: 'badge-warning' },
  { value: 'editor', label: 'Editor', color: 'badge-info' },
  { value: 'support', label: 'Soporte', color: 'badge' },
  { value: 'admin', label: 'Admin', color: 'badge-danger' },
]

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map(r => [r.value, r.label]))
const ROLE_COLOR = Object.fromEntries(ROLE_OPTIONS.map(r => [r.value, r.color]))

async function loadUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default function Students() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const { data: users, loading, error, refetch } = useData(loadUsers, [])

  const filtered = (users || []).filter(s => {
    const matchName = s.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || s.role === roleFilter
    return matchName && matchRole
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-surface-500">
        Error al cargar usuarios
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Usuarios</h1>
          <p className="section-subtitle mt-1">Gestiona todos los usuarios y sus roles en la plataforma</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-surface-100 p-4 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="all">Todos los roles</option>
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 text-surface-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-4 font-medium">Nombre</th>
                <th className="text-center px-6 py-4 font-medium">Rol actual</th>
                <th className="text-center px-6 py-4 font-medium">Cambiar rol</th>
                <th className="text-left px-6 py-4 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        s.role === 'admin' ? 'badge-danger' :
                        s.role === 'teacher' ? 'badge-warning' :
                        s.role === 'editor' ? 'bg-surface-100 text-surface-600' :
                        s.role === 'support' ? 'bg-surface-100 text-surface-600' :
                        'badge-success'
                      }`}>
                        {(s.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-surface-900">{s.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      ROLE_COLOR[s.role] || 'bg-surface-100 text-surface-600'
                    }`}>
                      {ROLE_LABEL[s.role] || s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={s.role}
                      disabled={updating === s.id}
                      onChange={(e) => handleRoleChange(s.id, s.full_name, s.role, e.target.value)}
                      className={`input-field w-auto text-xs py-1.5 ${updating === s.id ? 'opacity-50' : ''}`}
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {updating === s.id && (
                      <span className="ml-2 text-xs text-surface-400">guardando...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-surface-500 text-sm">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString('es-PE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-surface-400">
            {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </div>
        )}
      </div>
    </div>
  )
}
