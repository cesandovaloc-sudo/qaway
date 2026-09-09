import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const { user, profile } = useAuth()

  const fullName = profile?.full_name || ''
  const [editName, setEditName] = useState(fullName)
  const [editBio, setEditBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync form when profile loads (e.g. after first fetch)
  useEffect(() => {
    setEditName(profile?.full_name || '')
    setEditBio(profile?.bio || '')
  }, [profile?.full_name, profile?.bio])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current)
    }
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim(),
          bio: editBio.trim(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      setSaved(true)
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Configuración</h1>
        <p className="section-subtitle mt-1">Personaliza tu experiencia en Qaway Lab Academy</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Datos Personales */}
        <form onSubmit={handleSave} className="rounded-none border border-surface-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">👤</span>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Datos Personales</h2>
              <p className="text-sm text-surface-500">Nombre, correo electrónico y biografía</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-field">Nombre completo</label>
              <input
                type="text"
                value={editName}
                onChange={e => { setEditName(e.target.value); setSaved(false) }}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">Correo electrónico</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field text-surface-400"
                disabled
              />
              <p className="mt-1 text-xs text-surface-400">El correo no se puede cambiar desde aquí</p>
            </div>

            <div>
              <label className="label-field">Biografía</label>
              <textarea
                value={editBio}
                onChange={e => { setEditBio(e.target.value); setSaved(false) }}
                className="input-field min-h-[80px]"
                rows={3}
                placeholder="Cuéntanos sobre ti..."
              />
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
          </div>
        </form>

        {/* Preferencias */}
        <div className="rounded-none border border-surface-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Preferencias</h2>
              <p className="text-sm text-surface-500">Idioma, zona horaria y apariencia</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3">
              <span className="text-sm font-medium text-surface-700">Idioma</span>
              <span className="rounded-none bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">Español (Latinoamérica)</span>
            </div>
            <div className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3">
              <span className="text-sm font-medium text-surface-700">Zona Horaria</span>
              <span className="rounded-none bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">America/Lima (UTC-5)</span>
            </div>
            <div className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3">
              <span className="text-sm font-medium text-surface-700">Apariencia</span>
              <span className="rounded-none bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">Claro / Oscuro / Sistema</span>
            </div>
          </div>
        </div>

        {/* Foto de Perfil */}
        <div className="rounded-none border border-surface-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">📷</span>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Foto de Perfil</h2>
              <p className="text-sm text-surface-500">Sube o cambia tu foto de perfil</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-none bg-surface-50 px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
              {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <button className="rounded-none bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700">
              Subir foto
            </button>
            <button className="rounded-none bg-surface-200 px-3 py-1.5 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-300">
              Eliminar
            </button>
          </div>
        </div>

        {/* Cuentas Vinculadas */}
        <div className="rounded-none border border-surface-200 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">🔗</span>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Cuentas Vinculadas</h2>
              <p className="text-sm text-surface-500">Conecta tu cuenta con servicios externos</p>
            </div>
          </div>
          <div className="space-y-3">
            {['Google', 'Facebook', 'GitHub'].map((provider) => (
              <div key={provider} className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3">
                <span className="text-sm font-medium text-surface-700">{provider}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-400">No conectado</span>
                  <button className="rounded-none bg-surface-200 px-3 py-1 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-300">
                    Conectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eliminar Cuenta */}
        <div className="rounded-none border border-red-200 bg-red-50/50 p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">⚠️</span>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Eliminar Cuenta</h2>
              <p className="text-sm text-red-600">Elimina permanentemente tu cuenta y todos tus datos</p>
            </div>
          </div>
          <button className="rounded-none border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            Eliminar mi cuenta
          </button>
          <p className="mt-2 text-xs text-red-500">
            Esta acción es irreversible. Se eliminarán todos tus cursos, certificados y datos personales.
          </p>
        </div>

      </div>
    </div>
  )
}
