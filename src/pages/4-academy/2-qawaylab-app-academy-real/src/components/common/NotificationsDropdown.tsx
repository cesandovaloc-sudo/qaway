import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Notification } from '@/lib/types'
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from '@/lib/services/notifications'

const TYPE_ICONS: Record<string, string> = {
  task: '📝',
  offer: '🎁',
  system: '🔔',
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NotificationsDropdown() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const [items, count] = await Promise.all([
        getNotifications(user.id),
        getUnreadCount(user.id),
      ])
      setNotifications(items)
      setUnread(count)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    }
  }, [user])

  // Realtime: actualizar al instante al llegar una nueva notificación
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToNotifications(user.id, () => refresh())
    return unsubscribe
  }, [user, refresh])

  // Cargar al abrir el panel
  useEffect(() => {
    if (!open) return
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [open, refresh])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleMarkAll() {
    if (!user) return
    await markAllNotificationsRead(user.id)
    refresh()
  }

  function handleOpenItem(item: Notification) {
    setOpen(false) // cerrar siempre, incluso si falla el marcado como leída
    if (!user) return
    if (!item.is_read) {
      markNotificationRead(item.id, user.id)
        .then(refresh)
        .catch((err) => console.error('Error marcando notificación como leída:', err))
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-none text-surface-400 transition-colors hover:bg-surface-50 hover:text-surface-700"
        title="Notificaciones"
        aria-label="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-none border border-surface-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
            <h3 className="text-sm font-bold text-surface-900">Notificaciones</h3>
            {user && unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-semibold text-primary-700 transition hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Contenido: sin sesión mostrar invitación a iniciar sesión */}
          {!user ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="text-2xl">🔔</span>
              <p className="text-sm font-semibold text-surface-800">Inicia sesión para ver tus notificaciones</p>
              <Link
                to="/acceder"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center gap-1 rounded-none bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-700"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="text-2xl">🔔</span>
                <p className="text-sm font-semibold text-surface-800">No tienes notificaciones</p>
                <p className="text-xs text-surface-500">Te avisaremos aquí cuando algo nuevo ocurra.</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-100">
                {notifications.map((item) => (
                  <li key={item.id}>
                    {item.link ? (
                      <Link
                        to={item.link}
                        onClick={() => handleOpenItem(item)}
                        className={`flex items-start gap-3 px-4 py-3 transition hover:bg-surface-50 ${!item.is_read ? 'bg-primary-50/50' : ''}`}
                      >
                        <NotificationContent item={item} />
                      </Link>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenItem(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleOpenItem(item) }}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-surface-50 ${!item.is_read ? 'bg-primary-50/50' : ''}`}
                      >
                        <NotificationContent item={item} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationContent({ item }: { item: Notification }) {
  return (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-100 text-sm">
        {TYPE_ICONS[item.type || ''] || '🔔'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs ${item.is_read ? 'font-semibold text-surface-700' : 'font-bold text-surface-900'}`}>
            {item.title}
          </p>
          {!item.is_read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />}
        </div>
        {item.message && (
          <p className="mt-0.5 text-xs leading-snug text-surface-500 line-clamp-2">{item.message}</p>
        )}
        <p className="mt-1 text-[10px] font-medium text-surface-400">{timeAgo(item.created_at)}</p>
      </div>
    </>
  )
}
