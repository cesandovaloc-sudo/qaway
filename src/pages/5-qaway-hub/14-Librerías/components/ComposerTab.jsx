import { useMemo, useState } from 'react'
import { CATALOG, previewChannels, sendNotification } from '../services/notificationEngine'
import { CHANNELS, TASK_RESPONSE_STATUSES } from '../services/seed'

const PRIORITY_OPTIONS = CATALOG.PRIORITIES
const CHANNEL_LABEL = { internal: 'En la app', email: 'Correo', whatsapp: 'WhatsApp', push: 'Push' }

const INITIAL = {
  app_slug: 'gestor_proyectos',
  recipient_id: '',
  type: 'custom',
  priority: 'MEDIUM',
  title: '',
  message: '',
  link: '',
  channels: ['internal'],
  taskResponseStatus: 'sin_notificar',
  taskOrigin: 'oficial_oficio',
}

export default function ComposerTab({ profiles, settings, onRefresh }) {
  const [form, setForm] = useState({ ...INITIAL, recipient_id: profiles[0]?.id || '' })
  const [result, setResult] = useState(null)
  const [sending, setSending] = useState(false)

  const preview = useMemo(
    () => previewChannels(form.recipient_id, form.priority, form.channels),
    [form.recipient_id, form.priority, form.channels]
  )

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleChannel(channel) {
    setForm((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setResult(null)
    const response = await sendNotification({
      ...form,
      taskResponseStatus: form.type === 'task' ? form.taskResponseStatus : undefined,
      taskOrigin: form.type === 'task' ? form.taskOrigin : undefined,
    })
    setSending(false)
    setResult(response)
    if (response.ok) {
      onRefresh()
      setForm((current) => ({ ...current, title: '', message: '', link: '' }))
    }
  }

  return (
    <div className="cnp-layout">
      <form className="cnp-card cnp-form" onSubmit={handleSubmit}>
        <h2 className="cnp-card-title">Nueva notificación</h2>
        <p className="cnp-note">
          Se guarda en la bandeja y se entrega por los canales que el destinatario y su empresa permitan.
        </p>

        <div className="cnp-form-row">
          <label className="cnp-field">
            <span>App de origen</span>
            <select className="cnp-select" value={form.app_slug} onChange={(event) => set('app_slug', event.target.value)}>
              {CATALOG.APPS.map((app) => (
                <option key={app.slug} value={app.slug}>
                  {app.name}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Destinatario</span>
            <select
              className="cnp-select"
              value={form.recipient_id}
              onChange={(event) => set('recipient_id', event.target.value)}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.display_name} · {profile.tenant_name}
                </option>
              ))}
            </select>
          </label>
          <label className="cnp-field">
            <span>Tipo</span>
            <select className="cnp-select" value={form.type} onChange={(event) => set('type', event.target.value)}>
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
              value={form.priority}
              onChange={(event) => set('priority', event.target.value)}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label} ({priority.legacy})
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="cnp-field">
          <span>Título</span>
          <input
            className="cnp-input"
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Ej. Tarea vencida: validar expediente EDT 3.2"
          />
        </label>

        <label className="cnp-field">
          <span>Mensaje</span>
          <textarea
            className="cnp-textarea"
            value={form.message}
            onChange={(event) => set('message', event.target.value)}
            placeholder="Contexto y acción esperada"
          />
        </label>

        <label className="cnp-field">
          <span>Enlace (opcional)</span>
          <input
            className="cnp-input"
            value={form.link}
            onChange={(event) => set('link', event.target.value)}
            placeholder="/hub/gestor_proyecto_eliminar/tareas"
          />
        </label>

        {form.type === 'task' ? (
          <div className="cnp-form-row">
            <label className="cnp-field">
              <span>Estado de respuesta</span>
              <select
                className="cnp-select"
                value={form.taskResponseStatus}
                onChange={(event) => set('taskResponseStatus', event.target.value)}
              >
                {TASK_RESPONSE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="cnp-field">
              <span>Origen de tarea</span>
              <select
                className="cnp-select"
                value={form.taskOrigin}
                onChange={(event) => set('taskOrigin', event.target.value)}
              >
                <option value="oficial_oficio">Oficial / oficio</option>
                <option value="accion_emergente">Acción emergente</option>
              </select>
            </label>
          </div>
        ) : null}

        <div className="cnp-field">
          <span>Canales</span>
          <div className="cnp-checks">
            {CHANNELS.map((channel) => {
              const on = form.channels.includes(channel.value)
              return (
                <button
                  key={channel.value}
                  type="button"
                  className="cnp-check"
                  data-on={on}
                  onClick={() => toggleChannel(channel.value)}
                  aria-pressed={on}
                >
                  {channel.label}
                </button>
              )
            })}
          </div>
        </div>

        <button type="submit" className="cnp-btn cnp-btn-primary" disabled={sending || !form.title.trim()}>
          {sending ? 'Enviando…' : 'Enviar y registrar'}
        </button>

        {result && !result.ok ? (
          <div className="cnp-banner cnp-banner-error">
            {result.errors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        ) : null}
        {result?.ok ? (
          <div className="cnp-banner cnp-banner-ok">
            Notificación creada. Canales entregados:{' '}
            {result.delivery.filter((entry) => entry.status === 'enviado').map((entry) => CHANNEL_LABEL[entry.channel]).join(', ') || 'ninguno'}
            . Omitidos:{' '}
            {result.delivery.filter((entry) => entry.status !== 'enviado').length}
            . Revísala en la bandeja.
          </div>
        ) : null}
      </form>

      <aside className="cnp-card">
        <h2 className="cnp-card-title">Vista previa de entrega</h2>
        <p className="cnp-note" style={{ marginBottom: 10 }}>
          Calculada con las preferencias reales del destinatario y las reglas de la empresa (
          {settings?.tenant?.tenant_id || 'tenant'}).
        </p>
        <div className="cnp-preview">
          {preview.map((entry) => (
            <div className="cnp-preview-row" key={entry.channel}>
              <span>{CHANNEL_LABEL[entry.channel]}</span>
              <span className={`cnp-chip ${entry.allowed ? 'cnp-chip-ok' : 'cnp-chip-warn'}`}>{entry.reason}</span>
            </div>
          ))}
          {preview.length === 0 ? <span className="cnp-note">Elige al menos un canal.</span> : null}
        </div>

        <h2 className="cnp-card-title" style={{ marginTop: 18 }}>
          Reglas que se aplican
        </h2>
        <ul className="cnp-note" style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6 }}>
          <li>Preferencias del usuario y bloqueos de la empresa.</li>
          <li>Modo “solo urgentes”: los avisos medios y bajos quedan en la app.</li>
          <li>Horario de silencio: no salen push ni WhatsApp, el correo sí.</li>
          <li>Sin transporte conectado el canal queda omitido, nunca fingido.</li>
        </ul>
      </aside>
    </div>
  )
}
