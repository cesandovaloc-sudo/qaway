import { useMemo, useState } from 'react'
import {
  CATALOG,
  DELIVERY_STATUS,
  appName,
  markAllRead,
  markRead,
  removeNotification,
  retryDelivery,
  setTaskResponse,
} from '../services/notificationEngine'
import { TASK_RESPONSE_STATUSES } from '../services/seed'
import { formatDateTime, relativeTime } from '../services/storage'

const READ_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'no_leidas', label: 'No leídas' },
  { value: 'leidas', label: 'Leídas' },
]

const PRIORITY_CHIP = { HIGH: 'cnp-chip-high', MEDIUM: 'cnp-chip-medium', LOW: 'cnp-chip-low' }
const PRIORITY_LABEL = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
const CHANNEL_LABEL = { internal: 'En la app', email: 'Correo', whatsapp: 'WhatsApp', push: 'Push' }

const REASON_LABEL = {
  tenant_deshabilitado: 'Deshabilitado por la empresa',
  preferencias_desactivadas: 'Preferencias apagadas',
  solo_urgentes: 'Usuario en modo solo urgentes',
  horario_silencio: 'Horario de silencio',
  canal_desactivado: 'Canal desactivado por el usuario',
  sin_transporte: 'Sin transporte conectado',
  error_proveedor: 'Error del proveedor',
}

function recipientName(profiles, id) {
  return profiles.find((profile) => profile.id === id)?.display_name || 'Sin destinatario'
}

export default function InboxTab({ notifications, profiles, stats, onRefresh }) {
  const [filters, setFilters] = useState({
    app_slug: '',
    type: '',
    priority: '',
    read: 'todas',
    search: '',
    recipient_id: '',
  })
  const [selectedId, setSelectedId] = useState(notifications[0]?.id || '')
  const [feedback, setFeedback] = useState(null)

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    return notifications
      .filter((notification) => {
        if (filters.app_slug && notification.app_slug !== filters.app_slug) return false
        if (filters.type && notification.type !== filters.type) return false
        if (filters.priority && notification.priority !== filters.priority) return false
        if (filters.recipient_id && notification.recipient_id !== filters.recipient_id) return false
        if (filters.read === 'no_leidas' && notification.is_read) return false
        if (filters.read === 'leidas' && !notification.is_read) return false
        if (term) {
          const haystack = `${notification.title} ${notification.message} ${appName(notification.app_slug)}`.toLowerCase()
          if (!haystack.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [notifications, filters])

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null

  const activeFilters = {
    app_slug: filters.app_slug || undefined,
    type: filters.type || undefined,
    priority: filters.priority || undefined,
    recipient_id: filters.recipient_id || undefined,
    is_read: filters.read === 'no_leidas' ? false : filters.read === 'leidas' ? true : undefined,
    search: filters.search || undefined,
  }

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function handleRetry() {
    if (!selected) return
    const omitted = (selected.delivery || [])
      .filter((entry) => entry.status !== DELIVERY_STATUS.SENT)
      .map((entry) => entry.channel)
    if (!omitted.length) {
      setFeedback('Todos los canales ya quedaron registrados.')
      return
    }
    const result = await retryDelivery(selected.id, omitted)
    const sent = (result.delivery || []).filter((entry) => entry.status === DELIVERY_STATUS.SENT)
    setFeedback(`Reintento sobre ${omitted.length} canal(es). Entregados: ${sent.length}.`)
    onRefresh()
  }

  return (
    <>
      <div className="cnp-grid-stats">
        <div className="cnp-stat">
          <p className="cnp-stat-label">No leídas</p>
          <p className="cnp-stat-value">{stats.unread}</p>
          <p className="cnp-stat-hint">de {stats.total} en total</p>
        </div>
        {stats.byApp
          .filter((app) => app.total > 0)
          .map((app) => (
            <div className="cnp-stat" key={app.slug}>
              <p className="cnp-stat-label">{app.name}</p>
              <p className="cnp-stat-value">{app.unread}</p>
              <p className="cnp-stat-hint">{app.total} notificaciones</p>
            </div>
          ))}
      </div>

      <div className="cnp-layout">
        <section className="cnp-card" aria-label="Listado de notificaciones">
          <div className="cnp-filters">
            <label className="cnp-field">
              <span>Buscar</span>
              <input
                className="cnp-input"
                type="search"
                placeholder="Título, mensaje o app"
                value={filters.search}
                onChange={(event) => setFilter('search', event.target.value)}
              />
            </label>
            <label className="cnp-field">
              <span>App</span>
              <select
                className="cnp-select"
                value={filters.app_slug}
                onChange={(event) => setFilter('app_slug', event.target.value)}
              >
                <option value="">Todas</option>
                {CATALOG.APPS.map((app) => (
                  <option key={app.slug} value={app.slug}>
                    {app.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="cnp-field">
              <span>Tipo</span>
              <select
                className="cnp-select"
                value={filters.type}
                onChange={(event) => setFilter('type', event.target.value)}
              >
                <option value="">Todos</option>
                {CATALOG.NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cnp-field">
              <span>Prioridad</span>
              <select
                className="cnp-select"
                value={filters.priority}
                onChange={(event) => setFilter('priority', event.target.value)}
              >
                <option value="">Todas</option>
                {CATALOG.PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cnp-field">
              <span>Lectura</span>
              <select
                className="cnp-select"
                value={filters.read}
                onChange={(event) => setFilter('read', event.target.value)}
              >
                {READ_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cnp-field">
              <span>Destinatario</span>
              <select
                className="cnp-select"
                value={filters.recipient_id}
                onChange={(event) => setFilter('recipient_id', event.target.value)}
              >
                <option value="">Todos</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.display_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="cnp-actions" style={{ marginTop: 0, marginBottom: 10 }}>
            <button
              type="button"
              className="cnp-btn"
              disabled={!filtered.some((item) => !item.is_read)}
              onClick={() => {
                markAllRead(activeFilters)
                onRefresh()
              }}
            >
              Marcar visibles como leídas
            </button>
            <span className="cnp-note" style={{ alignSelf: 'center' }}>
              {filtered.length} resultado(s)
            </span>
          </div>

          <div className="cnp-list">
            {filtered.length === 0 ? (
              <p className="cnp-empty">No hay notificaciones con estos filtros.</p>
            ) : (
              filtered.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className="cnp-item"
                  data-unread={!notification.is_read}
                  data-selected={selected?.id === notification.id}
                  onClick={() => {
                    setSelectedId(notification.id)
                    if (!notification.is_read) {
                      markRead(notification.id, true)
                      onRefresh()
                    }
                  }}
                >
                  <div className="cnp-item-top">
                    {!notification.is_read ? <span className="cnp-dot" aria-label="No leída" /> : null}
                    <span className={`cnp-chip ${PRIORITY_CHIP[notification.priority] || 'cnp-chip-medium'}`}>
                      {PRIORITY_LABEL[notification.priority] || 'Media'}
                    </span>
                    <span className="cnp-chip cnp-chip-app">{appName(notification.app_slug)}</span>
                    <span className="cnp-item-meta">{relativeTime(notification.created_at)}</span>
                  </div>
                  <p className="cnp-item-title">{notification.title}</p>
                  {notification.message ? <p className="cnp-item-msg">{notification.message}</p> : null}
                  <span className="cnp-item-meta">
                    Para {recipientName(profiles, notification.recipient_id)}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="cnp-card" aria-label="Detalle de la notificación">
          {!selected ? (
            <div className="cnp-detail-empty">
              <strong>Sin notificación seleccionada</strong>
              <span>Elige una de la lista para ver canales, auditoría y acciones.</span>
            </div>
          ) : (
            <>
              <div className="cnp-detail-head">
                <div className="cnp-item-top">
                  <span className={`cnp-chip ${PRIORITY_CHIP[selected.priority] || 'cnp-chip-medium'}`}>
                    {PRIORITY_LABEL[selected.priority] || 'Media'}
                  </span>
                  <span className="cnp-chip cnp-chip-app">{appName(selected.app_slug)}</span>
                  <span className={`cnp-chip ${selected.is_read ? 'cnp-chip-off' : 'cnp-chip-ok'}`}>
                    {selected.is_read ? 'Leída' : 'No leída'}
                  </span>
                  {selected.source ? (
                    <span className="cnp-item-meta">origen: {selected.source}</span>
                  ) : null}
                </div>
                <h2 className="cnp-detail-title">{selected.title}</h2>
                <span className="cnp-item-meta">{formatDateTime(selected.created_at)}</span>
              </div>

              {selected.message ? <p className="cnp-detail-msg">{selected.message}</p> : null}

              <dl className="cnp-kv">
                <dt>Destinatario</dt>
                <dd>{recipientName(profiles, selected.recipient_id)}</dd>
                <dt>Empresa</dt>
                <dd>{selected.tenant_id || '—'}</dd>
                <dt>Tipo</dt>
                <dd>{CATALOG.NOTIFICATION_TYPES.find((t) => t.value === selected.type)?.label || selected.type}</dd>
                {selected.link ? (
                  <>
                    <dt>Enlace</dt>
                    <dd>
                      <a href={selected.link} target="_blank" rel="noreferrer">
                        {selected.link}
                      </a>
                    </dd>
                  </>
                ) : null}
                {selected.taskOrigin ? (
                  <>
                    <dt>Origen de tarea</dt>
                    <dd>{selected.taskOrigin === 'oficial_oficio' ? 'Oficial / oficio' : 'Acción emergente'}</dd>
                  </>
                ) : null}
              </dl>

              <h3 className="cnp-card-title" style={{ marginBottom: 6 }}>
                Canales y auditoría
              </h3>
              {(selected.delivery || []).length === 0 ? (
                <p className="cnp-note" style={{ marginBottom: 12 }}>
                  Sin registro de entrega. Este aviso se creó sin canales externos.
                </p>
              ) : (
                <table className="cnp-delivery">
                  <thead>
                    <tr>
                      <th>Canal</th>
                      <th>Estado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.delivery.map((entry) => (
                      <tr key={entry.channel}>
                        <td>{CHANNEL_LABEL[entry.channel] || entry.channel}</td>
                        <td>
                          <span
                            className={`cnp-chip ${
                              entry.status === DELIVERY_STATUS.SENT
                                ? 'cnp-chip-ok'
                                : entry.status === DELIVERY_STATUS.FAILED
                                  ? 'cnp-chip-high'
                                  : 'cnp-chip-warn'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          {entry.status === DELIVERY_STATUS.SENT
                            ? `${formatDateTime(entry.at)}${
                                entry.simulated ? ' · transporte demo' : ''
                              }${entry.messageId ? ` · ${entry.messageId}` : ''}`
                            : REASON_LABEL[entry.reason] || entry.reason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selected.type === 'task' ? (
                <label className="cnp-field" style={{ marginBottom: 12 }}>
                  <span>Respuesta de la tarea</span>
                  <select
                    className="cnp-select"
                    value={selected.taskResponseStatus || 'sin_notificar'}
                    onChange={(event) => {
                      setTaskResponse(selected.id, event.target.value)
                      onRefresh()
                    }}
                  >
                    {TASK_RESPONSE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="cnp-actions">
                <button
                  type="button"
                  className="cnp-btn"
                  onClick={() => {
                    markRead(selected.id, !selected.is_read)
                    onRefresh()
                  }}
                >
                  {selected.is_read ? 'Marcar como no leída' : 'Marcar como leída'}
                </button>
                <button type="button" className="cnp-btn" onClick={handleRetry}>
                  Reintentar canales omitidos
                </button>
                <button
                  type="button"
                  className="cnp-btn cnp-btn-danger"
                  onClick={() => {
                    removeNotification(selected.id)
                    setSelectedId('')
                    onRefresh()
                  }}
                >
                  Eliminar
                </button>
              </div>

              {feedback ? <div className="cnp-banner cnp-banner-ok">{feedback}</div> : null}
            </>
          )}
        </section>
      </div>
    </>
  )
}
