import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { getRolePermissions, updatePermission } from '@/lib/services/permissions'
import { useState } from 'react'

const ROLE_CONFIG = [
  { role: 'admin',     name: 'Administrador', color: 'badge-danger', desc: 'Acceso total a todas las funcionalidades. Gestiona usuarios, cursos, roles y pagos.' },
  { role: 'teacher',   name: 'Docente',       color: 'badge-warning', desc: 'Gestión de cursos asignados y revisión de tareas de sus alumnos.' },
  { role: 'editor',    name: 'Editor',        color: 'bg-surface-100 text-surface-600', desc: 'Creación y edición de contenido sin capacidad de publicar.' },
  { role: 'support',   name: 'Soporte',       color: 'bg-surface-100 text-surface-600', desc: 'Gestión de usuarios y consultas básicas de la plataforma.' },
  { role: 'student',   name: 'Alumno',        color: 'badge-success', desc: 'Acceso a cursos, seguimiento de progreso y certificados.' },
]

const ACTION_CONFIG = [
  { action: 'view_courses',     label: 'Ver cursos' },
  { action: 'create_courses',   label: 'Crear cursos' },
  { action: 'edit_courses',     label: 'Editar cursos' },
  { action: 'publish_courses',  label: 'Publicar cursos' },
  { action: 'archive_courses',  label: 'Archivar cursos' },
  { action: 'manage_users',     label: 'Gestionar usuarios' },
  { action: 'view_reports',     label: 'Ver reportes' },
  { action: 'manage_roles',     label: 'Gestionar roles' },
]

export default function Permissions() {
  const { data: permissions, loading, refetch } = useData(getRolePermissions, [])
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Build a matrix: { role_action: true/false }
  const matrix: Record<string, boolean> = {}
  if (permissions) {
    for (const p of permissions) {
      matrix[`${p.role}_${p.action}`] = p.allowed
    }
  }

  async function handleToggle(role: string, action: string, currentValue: boolean) {
    setSaving(`${role}_${action}`)
    setError('')
    try {
      await updatePermission(role, action, !currentValue)
      await refetch()
    } catch (err) {
      setError('Error al actualizar permiso: ' + (err instanceof Error ? err.message : String(err) || 'Error desconocido'))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Roles y Permisos</h1>
        <p className="section-subtitle mt-1">Matriz de permisos por rol en la plataforma</p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link to="/admin/alumnos" className="btn-primary text-sm">
          Gestionar usuarios y roles
        </Link>
        <Link to="/admin/docentes" className="btn-secondary text-sm">
          Crear nuevo docente
        </Link>
        {error && (
          <span className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">{error}</span>
        )}
      </div>

      {/* Roles Overview */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_CONFIG.map((role) => (
          <div key={role.role} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`rounded-none px-3 py-1 text-xs font-semibold ${role.color}`}>
                {role.name}
              </span>
            </div>
            <p className="text-xs text-surface-500">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="card overflow-hidden">
        <div className="border-b border-surface-100 px-6 py-4">
          <h2 className="font-semibold text-surface-900">Matriz de Permisos</h2>
          <p className="text-xs text-surface-400 mt-1">Haz clic en cualquier celda para cambiar el permiso. Los cambios se guardan automáticamente.</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Acción</th>
                  {ROLE_CONFIG.map((role) => (
                    <th key={role.role} className="text-center px-4 py-4 font-medium">{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {ACTION_CONFIG.map((action) => (
                  <tr key={action.action} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 text-surface-900 font-medium text-sm">{action.label}</td>
                    {ROLE_CONFIG.map((role) => {
                      const key = `${role.role}_${action.action}`
                      const allowed = matrix[key]
                      const isSaving = saving === key

                      return (
                        <td key={role.role} className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(role.role, action.action, allowed)}
                            disabled={isSaving}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-none transition-all duration-200 ${
                              allowed
                                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 hover:scale-110'
                                : 'bg-surface-50 text-surface-300 hover:bg-surface-100 hover:text-surface-400 hover:scale-110'
                            } ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                            title={`${allowed ? 'Desactivar' : 'Activar'} "${action.label}" para ${role.name}`}
                          >
                            {isSaving ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                            ) : allowed ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
