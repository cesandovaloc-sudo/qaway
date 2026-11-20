import { useEffect, useMemo, useState } from 'react'
import {
  getOrgRoles,
  getPermissionCatalog,
  getPreferences,
  resolvePermissions,
  setActiveProfile,
  updateProfile,
} from '../services/notificationEngine'
import { formatDateTime } from '../services/storage'

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'operativo', label: 'Operativo' },
  { value: 'visor', label: 'Visor' },
  { value: 'customer', label: 'Cliente' },
]

const THEMES = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
]

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
]

const STATUSES = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'invitado', label: 'Invitado' },
]

const CHANNELS = [
  { value: 'internal', label: 'En la app' },
  { value: 'email', label: 'Correo' },
  { value: 'push', label: 'Push' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

function initials(name) {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function draftFrom(profile) {
  const prefs = getPreferences(profile)
  return {
    display_name: profile.display_name || '',
    full_name: profile.full_name || '',
    email: profile.email || '',
    role: profile.role || 'editor',
    cargo_id: profile.cargo_id || 'role-cliente',
    status: profile.status || 'activo',
    permissions: { ...(profile.permissions || {}) },
    tenant_id: profile.tenant_id || '',
    theme: prefs.theme,
    language: prefs.language,
    enabled: prefs.notifications.enabled,
    only_urgent: prefs.notifications.only_urgent,
    sound: prefs.notifications.sound,
    quiet_enabled: prefs.notifications.quiet_hours.enabled,
    quiet_start: prefs.notifications.quiet_hours.start,
    quiet_end: prefs.notifications.quiet_hours.end,
    auto_logout_minutes: prefs.session.auto_logout_minutes || 60,
    channels: { ...prefs.notifications.channels },
  }
}

export default function ProfilesTab({ profiles, settings, onRefresh }) {
  const [selectedId, setSelectedId] = useState(settings?.activeProfileId || profiles[0]?.id || '')
  const selected = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) || profiles[0] || null,
    [profiles, selectedId]
  )
  const [draft, setDraft] = useState(() => (selected ? draftFrom(selected) : null))
  const [saved, setSaved] = useState(false)
  const ORG_ROLES = getOrgRoles()
  const grantedCount = draft ? Object.values(resolvePermissions(draft)).filter(Boolean).length : 0

  useEffect(() => {
    if (selected) {
      setDraft(draftFrom(selected))
      setSaved(false)
    }
  }, [selected?.id])

  if (!selected || !draft) {
    return <p className="cnp-empty">No hay perfiles disponibles.</p>
  }

  function set(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function setOverride(key, value) {
    setDraft((current) => {
      const permissions = { ...current.permissions }
      if (value === null) delete permissions[key]
      else permissions[key] = value
      return { ...current, permissions }
    })
    setSaved(false)
  }

  function toggleChannel(channel) {
    setDraft((current) => ({
      ...current,
      channels: { ...current.channels, [channel]: !current.channels[channel] },
    }))
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    updateProfile(selected.id, {
      display_name: draft.display_name.trim() || selected.display_name,
      full_name: draft.full_name,
      email: draft.email,
      role: draft.role,
      cargo_id: draft.cargo_id,
      status: draft.status,
      permissions: draft.permissions,
      tenant_id: draft.tenant_id,
      preferences: {
        theme: draft.theme,
        language: draft.language,
        notifications: {
          enabled: draft.enabled,
          only_urgent: draft.only_urgent,
          sound: draft.sound,
          channels: draft.channels,
          quiet_hours: {
            enabled: draft.quiet_enabled,
            start: draft.quiet_start,
            end: draft.quiet_end,
          },
        },
        session: { auto_logout_minutes: Number(draft.auto_logout_minutes) || 60 },
      },
    })
    setSaved(true)
    onRefresh()
  }

  return (
    <div className="cnp-layout">
      <section className="cnp-card">
        <h2 className="cnp-card-title">Perfiles unificados</h2>
        <p className="cnp-note" style={{ marginBottom: 10 }}>
          Rol, empresa, apps asignadas y preferencias que hoy están repartidas entre Hub, Academy y
          Gestor de Proyectos.
        </p>
        <div className="cnp-profile-list">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="cnp-profile-btn"
              data-selected={profile.id === selected.id}
              onClick={() => {
                setSelectedId(profile.id)
                setActiveProfile(profile.id)
                onRefresh()
              }}
            >
              <span className="cnp-avatar">{initials(profile.display_name)}</span>
              <span style={{ minWidth: 0 }}>
                <p className="cnp-profile-name">{profile.display_name}</p>
                <p className="cnp-profile-sub">
                  {ROLES.find((role) => role.value === profile.role)?.label || profile.role} ·{' '}
                  {profile.tenant_name}
                </p>
                <p className="cnp-profile-sub">
                  {(profile.apps || []).map((app) => app.slug).join(' · ') || 'sin apps'}
                </p>
                <p className="cnp-profile-sub">
                  {ORG_ROLES.find((role) => role.id === profile.cargo_id)?.name || 'Sin cargo'} ·{' '}
                  <span data-status={profile.status || 'activo'}>{profile.status || 'activo'}</span>
                </p>
              </span>
            </button>
          ))}
        </div>
        <p className="cnp-note" style={{ marginTop: 10 }}>
          Alta del perfil: {formatDateTime(selected.created_at)}
        </p>
      </section>

      <form className="cnp-card cnp-form" onSubmit={handleSave}>
        <h2 className="cnp-card-title">Datos y preferencias</h2>
        <p className="cnp-note">
          Este perfil concede <strong>{grantedCount}</strong> de {getPermissionCatalog().length} permisos
          según su cargo y ajustes.
        </p>

        <div className="cnp-form-row">
          <label className="cnp-field">
            <span>Nombre visible</span>
            <input className="cnp-input" value={draft.display_name} onChange={(event) => set('display_name', event.target.value)} />
          </label>
          <label className="cnp-field">
            <span>Nombre completo</span>
            <input className="cnp-input" value={draft.full_name} onChange={(event) => set('full_name', event.target.value)} />
          </label>
        </div>

        <div className="cnp-form-row">
          <label className="cnp-field">
            <span>Correo</span>
            <input className="cnp-input" type="email" value={draft.email} onChange={(event) => set('email', event.target.value)} />
          </label>
          <label className="cnp-field">
            <span>Rol</span>
            <select className="cnp-select" value={draft.role} onChange={(event) => set('role', event.target.value)}>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Empresa (tenant)</span>
            <input className="cnp-input" value={draft.tenant_id} onChange={(event) => set('tenant_id', event.target.value)} />
          </label>
        </div>

        <div className="cnp-form-row">
          <label className="cnp-field">
            <span>Cargo en la organización</span>
            <select className="cnp-select" value={draft.cargo_id} onChange={(event) => set('cargo_id', event.target.value)}>
              {ORG_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Estado del usuario</span>
            <select className="cnp-select" value={draft.status} onChange={(event) => set('status', event.target.value)}>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="cnp-note">
          {ORG_ROLES.find((role) => role.id === draft.cargo_id)?.description}
        </p>

        <div className="cnp-field">
          <span>Permisos del cargo y ajustes individuales</span>
          <div className="cnp-perm-grid">
            {getPermissionCatalog().map((permission) => {
              const override = draft.permissions[permission.key]
              const inherited = Boolean(
                ORG_ROLES.find((role) => role.id === draft.cargo_id)?.permissions?.[permission.key]
              )
              const effective = override === undefined ? inherited : override
              return (
                <div className="cnp-perm" key={permission.key} data-on={effective}>
                  <span className="cnp-perm-name">
                    {permission.label}
                    <span className="cnp-perm-group">{permission.group}</span>
                  </span>
                  <span className="cnp-perm-state">
                    {override === undefined ? 'heredado' : 'ajustado'} · {effective ? 'sí' : 'no'}
                  </span>
                  <span className="cnp-perm-actions">
                    <button
                      type="button"
                      className="cnp-perm-btn"
                      data-active={override === undefined}
                      onClick={() => setOverride(permission.key, null)}
                    >
                      Heredar
                    </button>
                    <button
                      type="button"
                      className="cnp-perm-btn"
                      data-active={override === true}
                      onClick={() => setOverride(permission.key, true)}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className="cnp-perm-btn"
                      data-active={override === false}
                      onClick={() => setOverride(permission.key, false)}
                    >
                      No
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="cnp-form-row">
          <label className="cnp-field">
            <span>Tema</span>
            <select className="cnp-select" value={draft.theme} onChange={(event) => set('theme', event.target.value)}>
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Idioma</span>
            <select className="cnp-select" value={draft.language} onChange={(event) => set('language', event.target.value)}>
              {LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Cierre por inactividad (min)</span>
            <input
              className="cnp-input"
              type="number"
              min="0"
              value={draft.auto_logout_minutes}
              onChange={(event) => set('auto_logout_minutes', event.target.value)}
            />
          </label>
        </div>

        <div className="cnp-field">
          <span>Canales permitidos</span>
          <div className="cnp-checks">
            {CHANNELS.map((channel) => (
              <button
                key={channel.value}
                type="button"
                className="cnp-check"
                data-on={Boolean(draft.channels[channel.value])}
                onClick={() => toggleChannel(channel.value)}
                aria-pressed={Boolean(draft.channels[channel.value])}
              >
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        <label className="cnp-toggle">
          <span>Notificaciones activas</span>
          <input type="checkbox" checked={draft.enabled} onChange={(event) => set('enabled', event.target.checked)} />
        </label>
        <label className="cnp-toggle">
          <span>Solo urgentes (prioridad alta)</span>
          <input
            type="checkbox"
            checked={draft.only_urgent}
            onChange={(event) => set('only_urgent', event.target.checked)}
          />
        </label>
        <label className="cnp-toggle">
          <span>Sonido al recibir</span>
          <input type="checkbox" checked={draft.sound} onChange={(event) => set('sound', event.target.checked)} />
        </label>

        <div className="cnp-toggle" style={{ alignItems: 'center' }}>
          <span>Horario de silencio</span>
          <input
            type="checkbox"
            checked={draft.quiet_enabled}
            onChange={(event) => set('quiet_enabled', event.target.checked)}
          />
        </div>
        {draft.quiet_enabled ? (
          <div className="cnp-form-row">
            <label className="cnp-field">
              <span>Desde</span>
              <input className="cnp-input" type="time" value={draft.quiet_start} onChange={(event) => set('quiet_start', event.target.value)} />
            </label>
            <label className="cnp-field">
              <span>Hasta</span>
              <input className="cnp-input" type="time" value={draft.quiet_end} onChange={(event) => set('quiet_end', event.target.value)} />
            </label>
          </div>
        ) : null}

        <button type="submit" className="cnp-btn cnp-btn-primary">
          Guardar preferencias
        </button>
        {saved ? <div className="cnp-banner cnp-banner-ok">Perfil actualizado. Ya aplica al próximo envío.</div> : null}
      </form>
    </div>
  )
}
