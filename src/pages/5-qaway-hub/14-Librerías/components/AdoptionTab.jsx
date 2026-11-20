import { useMemo, useState } from 'react'
import { FRAMEWORK_FEATURES, getAdoptionSummary, STATUS_LABELS } from '../services/adoptionMatrix'
import { CATALOG, appName } from '../services/notificationEngine'

const MARK = { cubierto: '✓', parcial: '!', no_cubierto: '×' }

export default function AdoptionTab({ notifications }) {
  const summary = useMemo(() => getAdoptionSummary(), [])
  const [filter, setFilter] = useState('todas')

  const visible = summary.filter((app) => {
    if (filter === 'listas') return app.ready
    if (filter === 'pendientes') return !app.ready
    return true
  })

  const totalCovered = summary.reduce((acc, app) => acc + app.counts.cubierto, 0)
  const totalNeeds = summary.reduce((acc, app) => acc + app.total, 0)

  return (
    <>
      <div className="cnp-grid-stats">
        <div className="cnp-stat">
          <p className="cnp-stat-label">Capacidades del motor</p>
          <p className="cnp-stat-value">{FRAMEWORK_FEATURES.length}</p>
          <p className="cnp-stat-hint">API documentada y operativa</p>
        </div>
        <div className="cnp-stat">
          <p className="cnp-stat-label">Necesidades cubiertas</p>
          <p className="cnp-stat-value">
            {totalCovered}/{totalNeeds}
          </p>
          <p className="cnp-stat-hint">en {summary.length} apps evaluadas</p>
        </div>
        <div className="cnp-stat">
          <p className="cnp-stat-label">Apps listas</p>
          <p className="cnp-stat-value">{summary.filter((app) => app.ready).length}</p>
          <p className="cnp-stat-hint">sin bloqueos para conectar</p>
        </div>
        <div className="cnp-stat">
          <p className="cnp-stat-label">Primera migración</p>
          <p className="cnp-stat-value" style={{ fontSize: 16 }}>
            Gestor de Proyectos
          </p>
          <p className="cnp-stat-hint">la app que ya está en verde</p>
        </div>
      </div>

      <div className="cnp-tabs" style={{ margin: '0 0 14px', borderBottom: 0 }}>
        {[
          { id: 'todas', label: 'Todas las apps' },
          { id: 'listas', label: 'Listas para conectar' },
          { id: 'pendientes', label: 'Con pendientes' },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            className="cnp-tab"
            aria-selected={filter === option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="cnp-adoption-grid">
        {visible.map((app) => (
          <article className="cnp-adoption-card" key={app.slug} data-first={app.slug === 'gestor_proyectos'}>
            <div className="cnp-adoption-head">
              <div>
                <h2 className="cnp-adoption-name">{app.name}</h2>
                <p className="cnp-adoption-role">{app.role}</p>
              </div>
              <span className={`cnp-chip ${app.ready ? 'cnp-chip-ok' : 'cnp-chip-warn'}`}>
                {app.counts.cubierto}/{app.total}
              </span>
            </div>

            <p className="cnp-note">{app.notes}</p>

            {app.needs.map((need) => (
              <div className="cnp-need" key={need.id}>
                <span className="cnp-need-mark" data-status={need.status}>
                  {MARK[need.status]}
                </span>
                <span>
                  {need.label}
                  <span className="cnp-need-note">
                    {STATUS_LABELS[need.status]}
                    {need.note ? ` · ${need.note}` : ''}
                  </span>
                </span>
              </div>
            ))}

            <p className="cnp-note" style={{ marginTop: 4 }}>
              Notificaciones registradas en este centro: <strong>{notifications.filter((n) => n.app_slug === app.slug).length}</strong>{' '}
              · {appName(app.slug)}
            </p>

            {app.blockers.length > 0 ? (
              <p className="cnp-note">
                Antes de conectar: {app.blockers.map((need) => need.label).join(', ')}.
              </p>
            ) : (
              <p className="cnp-note">Sin bloqueos: se puede conectar cuando lo autorices.</p>
            )}
          </article>
        ))}
      </div>

      <section className="cnp-card" style={{ marginTop: 16 }}>
        <h2 className="cnp-card-title">API disponible para las apps</h2>
        <table className="cnp-delivery" style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Capacidad</th>
              <th>Se usa así</th>
            </tr>
          </thead>
          <tbody>
            {FRAMEWORK_FEATURES.map((feature) => (
              <tr key={feature.id}>
                <td>{feature.label}</td>
                <td>
                  <span className="cnp-code">{feature.api}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="cnp-note" style={{ marginTop: 10 }}>
          Apps registradas en el catálogo: {CATALOG.APPS.map((app) => app.name).join(', ')}.
        </p>
      </section>
    </>
  )
}
