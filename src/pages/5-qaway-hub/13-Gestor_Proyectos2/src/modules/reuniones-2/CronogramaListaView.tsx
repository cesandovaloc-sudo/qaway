import React from 'react';
import {
  CalendarDays,
  FileText,
  Flag,
  MoreHorizontal,
  Target
} from 'lucide-react';
import type { Item, Status } from './Reuniones2View';

interface CronogramaListaViewProps {
  items: Item[];
  allItems: Item[];
  onSelectItem: (item: Item) => void;
  formatDatePE: (iso: string) => string;
}

const GESTOR_INITIALS_MAP: Record<string, { initials: string; bg: string }> = {
  'Carlos Sandoval': { initials: 'CM', bg: '#0066ff' },
  'María Salazar': { initials: 'MS', bg: '#8b5cf6' },
  'Javier Rivas': { initials: 'JR', bg: '#10b981' },
  'Sofía Alva': { initials: 'SA', bg: '#f59e0b' },
  'Luis Castro': { initials: 'LC', bg: '#6366f1' },
  'Ana Paredes': { initials: 'AP', bg: '#ec4899' },
};

const getAvatarMeta = (name?: string) => {
  if (!name || name === 'Sin asignar') {
    return { initials: 'SA', bg: '#94a3b8' };
  }
  if (GESTOR_INITIALS_MAP[name]) return GESTOR_INITIALS_MAP[name];
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((p) => p[0]?.toUpperCase() || '').slice(0, 2).join('');
  return { initials: initials || 'CM', bg: '#0066ff' };
};

const getDays = (start: string, end: string) => {
  const d1 = new Date(start).getTime();
  const d2 = new Date(end).getTime();
  if (isNaN(d1) || isNaN(d2)) return 1;
  return Math.max(1, Math.round((d2 - d1) / 86400000) + 1);
};

const getStatusBadgeClass = (status: Status) => {
  switch (status) {
    case 'Completado':
    case 'Cumple':
      return 'badge-complete';
    case 'En proceso':
    case 'En curso':
      return 'badge-progress';
    case 'Con retraso':
      return 'badge-late';
    case 'Pendiente':
    default:
      return 'badge-pending';
  }
};

export default function CronogramaListaView({
  items,
  allItems,
  onSelectItem,
  formatDatePE,
}: CronogramaListaViewProps) {
  const getParentHito = (parentId?: string) => {
    if (!parentId) return null;
    return allItems.find((x) => x.id === parentId);
  };

  return (
    <div className="cronograma-lista-container">
      <div className="cronograma-lista-table-wrap">
        <table className="cronograma-lista-table">
          <thead>
            <tr>
              <th className="col-chk">
                <input type="checkbox" aria-label="Seleccionar todos los registros visibles" />
              </th>
              <th className="col-code">Código</th>
              <th className="col-name">Nombre</th>
              <th className="col-type">Tipo</th>
              <th className="col-parent">Hito padre</th>
              <th className="col-date">Inicio</th>
              <th className="col-date">Fin</th>
              <th className="col-dur">Duración</th>
              <th className="col-progress">Avance</th>
              <th className="col-status">Estado</th>
              <th className="col-gestor">Responsable</th>
              <th className="col-region">Ámbito</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={13} className="empty-row">
                  No se encontraron registros con los filtros seleccionados
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const parent = getParentHito(item.parentId);
                const avatar = getAvatarMeta(item.gestor);
                const duration = getDays(item.start, item.end);
                const isHito = item.kind === 'hito';

                return (
                  <tr
                    key={item.id}
                    className={`lista-row ${isHito ? 'is-hito-row' : ''}`}
                    onClick={() => onSelectItem(item)}
                  >
                    <td className="col-chk" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Seleccionar ${item.code} ${item.name}`} />
                    </td>
                    <td className="col-code">
                      <div className="code-cell">
                        {isHito ? (
                          <Flag size={14} className="code-icon is-hito" />
                        ) : (
                          <FileText size={14} className="code-icon" />
                        )}
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td className="col-name">
                      <span className="item-name-text" title={item.name}>
                        {item.name}
                      </span>
                    </td>
                    <td className="col-type">
                      <span className={`type-pill ${isHito ? 'hito' : 'sub'}`}>
                        {isHito ? 'Hito' : 'Subproceso'}
                      </span>
                    </td>
                    <td className="col-parent">
                      {parent ? (
                        <div className="parent-cell" title={parent.name}>
                          <Target size={12} className="parent-icon" />
                          <span>
                            {parent.code ? `H-${parent.code}` : ''} {parent.name}
                          </span>
                        </div>
                      ) : (
                        <span className="parent-none">—</span>
                      )}
                    </td>
                    <td className="col-date">{formatDatePE(item.start)}</td>
                    <td className="col-date">{formatDatePE(item.end)}</td>
                    <td className="col-dur">{duration} días</td>
                    <td className="col-progress">
                      <div className="progress-cell">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, item.progress))}%`,
                              backgroundColor: item.progress >= 100 ? '#10b981' : '#0066ff',
                            }}
                          />
                        </div>
                        <span className="progress-val">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="col-status">
                      <span className={`status-pill ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="col-gestor">
                      <div className="gestor-cell" title={item.gestor || 'Sin asignar'}>
                        <div className="gestor-avatar" style={{ backgroundColor: avatar.bg }}>
                          {avatar.initials}
                        </div>
                      </div>
                    </td>
                    <td className="col-region">
                      <span className="region-text">{item.region || '—'}</span>
                    </td>
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="lista-action-btn"
                        onClick={() => onSelectItem(item)}
                        title="Ver detalle"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
