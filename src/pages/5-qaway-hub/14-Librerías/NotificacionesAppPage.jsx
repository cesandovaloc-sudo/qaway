import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getNotifications,
  getProfiles,
  getSettings,
  getStats,
  resetLibrary,
} from './services/notificationEngine'
import { onExternalChange } from './services/storage'
import InboxTab from './components/InboxTab'
import ComposerTab from './components/ComposerTab'
import ProfilesTab from './components/ProfilesTab'
import AdoptionTab from './components/AdoptionTab'
import './notificaciones.css'

/* Centro de Notificaciones y Perfiles del Hub.
   Reúne en un solo lugar lo funcional de todas las apps (bandeja, canales,
   prioridades, perfiles y preferencias) para ir conectándolas una por una.
   Cada app conserva su propio diseño: esto es el motor, no un rediseño. */

const TABS = [
  { id: 'bandeja', label: 'Bandeja' },
  { id: 'componer', label: 'Componer y enviar' },
  { id: 'perfiles', label: 'Perfiles y preferencias' },
  { id: 'adopcion', label: 'Adopción por app' },
]

function readAll() {
  return {
    notifications: getNotifications(),
    profiles: getProfiles(),
    settings: getSettings(),
    stats: getStats(),
  }
}

export default function NotificacionesAppPage() {
  const [tab, setTab] = useState('bandeja')
  const [data, setData] = useState(readAll)

  const refresh = useCallback(() => setData(readAll()), [])

  useEffect(() => onExternalChange(refresh), [refresh])

  const unread = useMemo(() => data.stats.unread, [data.stats.unread])

  return (
    <div className="cnp-page">
      <header className="cnp-header">
        <div>
          <p className="cnp-eyebrow">Qaway Lab · Núcleo compartido</p>
          <h1 className="cnp-title">Centro de Notificaciones y Perfiles</h1>
          <p className="cnp-subtitle">
            Todo lo funcional de las apps del Hub, en un solo motor: bandeja, prioridades, canales de
            correo y WhatsApp con auditoría, perfiles y preferencias. Las apps se conectan aquí sin
            tocar su diseño, una por una y bajo tu control.
          </p>
        </div>
        <button
          type="button"
          className="cnp-btn cnp-btn-ghost"
          onClick={() => {
            if (window.confirm('¿Restaurar los datos de demostración? Se perderán los cambios locales.')) {
              resetLibrary()
              refresh()
            }
          }}
        >
          Restaurar demo
        </button>
      </header>

      <nav className="cnp-tabs" role="tablist" aria-label="Secciones del centro">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className="cnp-tab"
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === 'bandeja' && unread > 0 ? <span className="cnp-tab-count">{unread}</span> : null}
          </button>
        ))}
      </nav>

      <div className="cnp-body">
        {tab === 'bandeja' ? (
          <InboxTab
            notifications={data.notifications}
            profiles={data.profiles}
            stats={data.stats}
            onRefresh={refresh}
          />
        ) : null}
        {tab === 'componer' ? (
          <ComposerTab profiles={data.profiles} settings={data.settings} onRefresh={refresh} />
        ) : null}
        {tab === 'perfiles' ? (
          <ProfilesTab
            profiles={data.profiles}
            settings={data.settings}
            onRefresh={refresh}
          />
        ) : null}
        {tab === 'adopcion' ? <AdoptionTab notifications={data.notifications} /> : null}
      </div>
    </div>
  )
}
