import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  NOTIFICATIONS_STORAGE_KEY,
  type AppNotification,
  type NotificationPriority,
} from '../types';

const PRIORITY_ORDER: NotificationPriority[] = ['CRITICAL', 'PREVENTIVE', 'INFO'];
const PRIORITY_META: Record<NotificationPriority, { label: string; color: string }> = {
  CRITICAL: { label: 'Críticas', color: '#dc2626' },
  PREVENTIVE: { label: 'Preventivas', color: '#d97706' },
  INFO: { label: 'Informativas', color: '#64748b' },
};

/** Semilla inicial (equivale a las 3 alertas preventivas que mostraba el Topbar estático). */
const seedNotifications = (): AppNotification[] => {
  const now = new Date().toISOString();
  return [
     { id: 'seed-1', title: 'Paquete 1.6 vence en 48h', description: 'Sedes pendientes de reporte.', priority: 'PREVENTIVE', category: 'hito_vencido', targetModule: 'cronograma', read: false, createdAt: now },
     { id: 'seed-2', title: 'Seguimiento territorial', description: 'Hay sedes sin actualización de avance esta semana.', priority: 'INFO', category: 'mencion', targetModule: 'sedes', read: false, createdAt: now },
     { id: 'seed-3', title: 'Revisión de línea base', description: 'Revisa desviaciones del cronograma maestro.', priority: 'CRITICAL', category: 'nudo_critico', targetModule: 'cronograma', read: false, createdAt: now },
  ];
};

const load = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    }
    const seeded = seedNotifications();
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    /* almacenamiento no disponible */
  }
  return seedNotifications();
};

export const pushAppNotification = (notification: AppNotification): void => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const current = raw === null ? [] : JSON.parse(raw);
    const notifications = Array.isArray(current) ? current : [];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([...notifications, notification]));
    window.dispatchEvent(new CustomEvent('qaway-gp-notifications-updated'));
  } catch {
    /* almacenamiento no disponible */
  }
};

interface NotificationPopoverProps {
  onSelectNotification?: (notification: AppNotification) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onSelectNotification }) => {
  const [items, setItems] = useState<AppNotification[]>(load);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onNotificationsUpdated = () => setItems(load());
    window.addEventListener('qaway-gp-notifications-updated', onNotificationsUpdated);
    return () => window.removeEventListener('qaway-gp-notifications-updated', onNotificationsUpdated);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read).length;
  const markAll = useCallback(() => setItems((p) => p.map((n) => ({ ...n, read: true }))), []);
  const markOne = (notification: AppNotification) => {
    setItems((p) => p.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    onSelectNotification?.(notification);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className="qm-topbar-btn"
        style={{ position: 'relative' }}
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
        aria-expanded={open}
        title="Notificaciones y alertas preventivas"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '15px',
              height: '15px',
              padding: '0 3px',
              borderRadius: '999px',
              background: '#dc2626',
              color: 'white',
              fontSize: '9px',
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Centro de notificaciones"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 420,
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(15,23,42,.14)',
            zIndex: 60,
            animation: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
            <b style={{ fontSize: 14, color: '#0f172a' }}>Notificaciones</b>
            <button
              onClick={markAll}
              disabled={unread === 0}
              style={{ fontSize: 13, color: unread ? '#1d4ed8' : '#94a3b8', background: 'none', border: 0, cursor: unread ? 'pointer' : 'default' }}
            >
              Marcar todo como leído
            </button>
          </div>

          {items.length === 0 && (
            <p style={{ padding: 16, fontSize: 14, color: '#64748b', margin: 0 }}>Sin notificaciones.</p>
          )}

          {PRIORITY_ORDER.map((p) => {
            const group = items.filter((n) => n.priority === p);
            if (!group.length) return null;
            return (
              <div key={p}>
                <div style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: PRIORITY_META[p].color, background: '#f8fafc' }}>
                  {PRIORITY_META[p].label}
                </div>
                {group.map((n) => (
                  <button
                    key={n.id}
                     onClick={() => markOne(n)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 0, borderBottom: '1px solid #f1f5f9', background: n.read ? '#fff' : '#f1f5f9', cursor: 'pointer' }}
                  >
                    <span style={{ display: 'block', fontSize: 14, fontWeight: n.read ? 500 : 700, color: '#0f172a' }}>{n.title}</span>
                    {n.description && (
                      <span style={{ display: 'block', fontSize: 14, color: '#475569', marginTop: 2 }}>{n.description}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
