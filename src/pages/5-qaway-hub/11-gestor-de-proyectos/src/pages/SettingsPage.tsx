import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  Building2,
  Users,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Link2,
  ChevronDown,
  X,
  ShieldCheck,
} from 'lucide-react'
import { fiscalService } from '@/services/fiscalService'
import { governanceService } from '@/services/governanceService'
import { useTenant } from '@/context/TenantContext'
import type { BusinessSettings } from '@/types'
import type { OrganizationRoleDefinition, ProjectModulePermissions } from '@/types/project.types'
import { EMPTY_PROJECT_PERMISSIONS, PROJECT_PERMISSION_MODULES } from '@/types/project.types'

type Tab = 'negocio' | 'usuarios'

const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: 'negocio', label: 'Negocio', icon: Building2 },
  { key: 'usuarios', label: 'Usuarios & Cargos', icon: Users },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('usuarios')
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Configuración</h1>
        <p className="text-sm text-muted mt-1">
          Gobernanza de la organización: usuarios, cargos dinámicos y datos del negocio.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'negocio' && <BusinessTab onError={setError} />}
      {tab === 'usuarios' && <UsersRolesTab />}
    </div>
  )
}

// ── Negocio ──
function BusinessTab({ onError }: { onError: (e: string | null) => void }) {
  const { activeTenantId } = useTenant()
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let alive = true
    if (!activeTenantId) {
      setLoading(false)
      setSettings(null)
      return
    }
    setLoading(true)
    onError(null)
    fiscalService
      .getBusinessSettings(activeTenantId)
      .then(value => {
        if (alive) setSettings(value)
      })
      .catch(err => {
        if (alive) onError(err instanceof Error ? err.message : 'Error al cargar la configuración')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [activeTenantId, onError])

  const update = (patch: Partial<BusinessSettings>) => {
    setSettings(prev => (prev ? { ...prev, ...patch } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await fiscalService.updateBusinessSettings(activeTenantId!, {
        ruc: settings.ruc,
        razon_social: settings.razon_social,
        nombre_comercial: settings.nombre_comercial,
        direccion: settings.direccion,
        regimen: settings.regimen,
        igv_rate: Number(settings.igv_rate),
        moneda: settings.moneda,
      })
      setSettings(updated)
      setSaved(true)
      onError(null)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!activeTenantId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Selecciona una empresa activa para consultar su configuración fiscal.
      </div>
    )
  }

  if (!settings) return null

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5 bg-white rounded-xl border border-surface-muted p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
            <input
              value={settings.ruc || ''}
              onChange={e => update({ ruc: e.target.value })}
              placeholder="20XXXXXXXXX"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Régimen</label>
            <select
              value={settings.regimen}
              onChange={e => update({ regimen: e.target.value })}
              className={inputCls}
            >
              <option value="general">General</option>
              <option value="mype_remy">MYPE Remy</option>
              <option value="mype_tributario">MYPE Tributario</option>
              <option value="no_domiciliado">No domiciliado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón social</label>
          <input
            value={settings.razon_social || ''}
            onChange={e => update({ razon_social: e.target.value })}
            placeholder="Razón social del negocio"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
          <input
            value={settings.nombre_comercial || ''}
            onChange={e => update({ nombre_comercial: e.target.value })}
            placeholder="Nombre comercial"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal</label>
          <input
            value={settings.direccion || ''}
            onChange={e => update({ direccion: e.target.value })}
            placeholder="Domicilio fiscal"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IGV (%)</label>
            <input
              type="number"
              value={settings.igv_rate}
              onChange={e => update({ igv_rate: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={settings.moneda}
              onChange={e => update({ moneda: e.target.value })}
              className={inputCls}
            >
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Estado SUNAT */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">SUNAT</h3>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4 ${
              settings.sunat_connected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.sunat_connected ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
            {settings.sunat_connected ? 'Conectado' : 'Sin conectar'}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            La integración con SUNAT (consulta RUC/DNI y facturación electrónica)
            se activa cuando se configure un proveedor autorizado. La estructura
            ya está lista: al contratar el servicio solo se ingresa el token.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Usuarios & Cargos (GOVERNANCE-01) ──
function UsersRolesTab() {
  const dataset = useSyncExternalStore(
    governanceService.subscribe,
    governanceService.getSnapshot,
    governanceService.getServerSnapshot,
  )
  const { scopedTenant } = useTenant()
  const inEntity = Boolean(scopedTenant)
  const [userOpen, setUserOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)

  // En una organización activa (MINEDU, etc.), los cargos son institucionales.
  // El Super Administrador global del SaaS no pertenece a la entidad.
  const visibleRoles = useMemo(() => {
    return inEntity ? dataset.roles.filter((r) => r.id !== 'role-super-admin') : dataset.roles
  }, [inEntity, dataset.roles])

  const roleName = useMemo(() => {
    const map = new Map(dataset.roles.map((r) => [r.id, r.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [dataset.roles])

  return (
    <div className="space-y-6">
      {/* Sección 1: Usuarios */}
      <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 text-zinc-900">
              <Users size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Usuarios de la organización</h2>
              <p className="text-[13px] text-zinc-500">{dataset.users.length} usuarios · Avatar, cargo y estado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUserOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Cargo asignado</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {dataset.users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-zinc-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                        {initialsOf(u.name)}
                      </span>
                      <span className="text-sm font-medium text-zinc-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                      {roleName(u.roleId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                        u.status === 'activo'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'activo' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      {u.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => governanceService.toggleUserStatus(u.id)}
                      className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {u.status === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {dataset.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm font-medium text-zinc-500">
                    Sin usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 2: Cargos */}
      <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 text-zinc-900">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Cargos dinámicos y facultades</h2>
              <p className="text-[13px] text-zinc-500">Matriz de 5 módulos con checks generales y repercusiones desplegables</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRoleOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            <Plus size={16} /> Nuevo Cargo
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {visibleRoles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      {userOpen && <NewUserModal roles={visibleRoles} onClose={() => setUserOpen(false)} />}
      {roleOpen && <NewRoleModal onClose={() => setRoleOpen(false)} />}
    </div>
  )
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function countPermissions(p: ProjectModulePermissions): number {
  return (Object.values(p) as boolean[]).filter(Boolean).length
}

function RoleCard({ role }: { role: OrganizationRoleDefinition }) {
  const [open, setOpen] = useState(false)
  const active = countPermissions(role.permissions)
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900">{role.name}</p>
          <p className="mt-0.5 text-[13px] text-zinc-500">{role.description || '—'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {role.isSystem && (
              <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                Sistema
              </span>
            )}
            <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700">
              {active}/19 facultades
            </span>
          </div>
        </div>
        {!role.isSystem && (
          <button
            type="button"
            onClick={() => governanceService.deleteRole(role.id)}
            title={`Eliminar ${role.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <span>Ver repercusiones por módulo</span>
        <ChevronDown size={16} className={`text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-lg bg-zinc-50 p-3">
          {PROJECT_PERMISSION_MODULES.map((mod) => {
            const granted = mod.permissions.filter((p) => role.permissions[p.key])
            if (granted.length === 0) return null
            return (
              <div key={mod.key}>
                <p className="text-xs font-semibold text-zinc-900">{mod.title} · {granted.length}/{mod.permissions.length}</p>
                <ul className="mt-1 space-y-0.5">
                  {granted.map((p) => (
                    <li key={p.key} className="text-[13px] text-zinc-500">· {p.label} — {p.impact}</li>
                  ))}
                </ul>
              </div>
            )
          })}
          {active === 0 && <p className="text-[13px] text-zinc-500">Sin facultades asignadas.</p>}
        </div>
      )}
    </div>
  )
}

function NewUserModal({ roles, onClose }: { roles: OrganizationRoleDefinition[]; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)

  const inputCls =
    'w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/15'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Ingresa el nombre del usuario.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }
    if (!roleId) {
      setError('Selecciona un cargo.')
      return
    }
    governanceService.createUser({ name, email, roleId })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
      <div role="dialog" aria-modal="true" aria-label="Nuevo usuario" className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Nuevo Usuario</h2>
            <p className="text-[13px] text-zinc-500">Registra nombre, correo y cargo existente.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Correo *</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@organizacion.pe" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Cargo *</label>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={inputCls}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-hover">
              <Plus size={16} /> Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewRoleModal({ onClose }: { onClose: () => void }) {
  const { activeTenantId } = useTenant()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [perms, setPerms] = useState<ProjectModulePermissions>({ ...EMPTY_PROJECT_PERMISSIONS })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ cartera: true })
  const [error, setError] = useState<string | null>(null)

  const inputCls =
    'w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/15'

  const toggleModule = (moduleKey: string, checked: boolean) => {
    const mod = PROJECT_PERMISSION_MODULES.find((m) => m.key === moduleKey)
    if (!mod) return
    setPerms((prev) => {
      const next = { ...prev }
      for (const p of mod.permissions) next[p.key] = checked
      return next
    })
  }

  const toggleOne = (key: keyof ProjectModulePermissions, checked: boolean) => {
    setPerms((prev) => ({ ...prev, [key]: checked }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Define el nombre del cargo (ej. Coordinador Macroregional).')
      return
    }
    governanceService.createRole({
      name,
      description: description.trim() || 'Cargo dinámico de la organización.',
      organizationId: activeTenantId ?? 'org-global',
      permissions: perms,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
      <div role="dialog" aria-modal="true" aria-label="Nuevo cargo" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Nuevo Cargo</h2>
            <p className="text-[13px] text-zinc-500">Define el nombre y asigna facultades por módulo.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Nombre del cargo *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Coordinador Macroregional" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Descripción</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Alcance del cargo…" className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            {PROJECT_PERMISSION_MODULES.map((mod) => {
              const all = mod.permissions.every((p) => perms[p.key])
              const some = !all && mod.permissions.some((p) => perms[p.key])
              const isOpen = expanded[mod.key] ?? false
              return (
                <div key={mod.key} className="rounded-xl border border-zinc-200">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={all}
                      ref={(el) => {
                        if (el) el.indeterminate = some
                      }}
                      onChange={(e) => toggleModule(mod.key, e.target.checked)}
                      aria-label={`Todas las facultades de ${mod.title}`}
                      className="h-4 w-4 accent-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [mod.key]: !isOpen }))}
                      className="flex flex-1 items-center justify-between gap-2 text-left"
                    >
                      <span className="text-sm font-medium text-zinc-900">{mod.title}</span>
                      <ChevronDown size={16} className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3">
                      <p className="text-[13px] text-zinc-500">{mod.impact}</p>
                      {mod.permissions.map((p) => (
                        <label key={p.key} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
                          <input
                            type="checkbox"
                            checked={perms[p.key]}
                            onChange={(e) => toggleOne(p.key, e.target.checked)}
                            className="mt-0.5 h-4 w-4 accent-zinc-900"
                          />
                          <span>
                            <span className="block text-sm font-medium text-zinc-900">{p.label}</span>
                            <span className="block text-[13px] text-zinc-500">{p.impact}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-hover">
              <Plus size={16} /> Guardar cargo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
