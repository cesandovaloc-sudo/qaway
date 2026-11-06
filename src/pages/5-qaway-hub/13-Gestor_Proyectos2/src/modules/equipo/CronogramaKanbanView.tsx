import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  MoreHorizontal,
  Plus,
  Target
} from 'lucide-react';
import type { Item, Status } from '../cronograma-gantt/CronogramaGanttView';

interface CronogramaKanbanViewProps {
  items: Item[];
  allItems: Item[];
  onSelectItem: (item: Item) => void;
  onAddItem?: (status: Status) => void;
  formatDatePE: (iso: string) => string;
}

interface ColumnConfig {
  id: Status;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeColor: string;
  statuses: Status[];
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'Pendiente',
    label: 'Pendiente',
    dotColor: '#94a3b8',
    badgeBg: '#f1f5f9',
    badgeColor: '#475569',
    statuses: ['Pendiente'],
  },
  {
    id: 'En proceso',
    label: 'En proceso',
    dotColor: '#0066ff',
    badgeBg: '#eff6ff',
    badgeColor: '#0066ff',
    statuses: ['En proceso', 'En curso'],
  },
  {
    id: 'Con retraso',
    label: 'En revisión',
    dotColor: '#eab308',
    badgeBg: '#fefce8',
    badgeColor: '#a16207',
    statuses: ['Con retraso'],
  },
  {
    id: 'Completado',
    label: 'Completado',
    dotColor: '#10b981',
    badgeBg: '#ecfdf5',
    badgeColor: '#047857',
    statuses: ['Completado', 'Cumple'],
  },
];

const GESTOR_INITIALS_MAP: Record<string, { initials: string; bg: string }> = {
  'Carlos Mendoza': { initials: 'CM', bg: '#0066ff' },
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

export default function CronogramaKanbanView({
  items,
  allItems,
  onSelectItem,
  onAddItem,
  formatDatePE,
}: CronogramaKanbanViewProps) {
  const getParentHito = (parentId?: string) => {
    if (!parentId) return null;
    return allItems.find((x) => x.id === parentId);
  };

  return (
    <div className="cronograma-kanban-board">
      <div className="kanban-columns-track">
        {KANBAN_COLUMNS.map((col) => {
          const colItems = items.filter((x) => col.statuses.includes(x.status));

          return (
            <div key={col.id} className="kanban-column">
              {/* Cabecera de Columna */}
              <div className="kanban-column-header">
                <div className="kanban-col-title-group">
                  <span className="kanban-col-dot" style={{ backgroundColor: col.dotColor }} />
                  <span className="kanban-col-label">{col.label}</span>
                  <span className="kanban-col-count">{colItems.length}</span>
                </div>
                {onAddItem && (
                  <button
                    type="button"
                    className="kanban-add-btn"
                    onClick={() => onAddItem(col.id)}
                    title={`Agregar elemento en ${col.label}`}
                    aria-label={`Agregar elemento en ${col.label}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {/* Lista de Tarjetas */}
              <div className="kanban-cards-list">
                {colItems.length === 0 ? (
                  <div className="kanban-column-empty">
                    <span>Sin registros en este estado</span>
                  </div>
                ) : (
                  colItems.map((item) => {
                    const parentHito = getParentHito(item.parentId);
                    const avatar = getAvatarMeta(item.gestor);
                    const isCompleted = item.status === 'Completado' || item.status === 'Cumple';

                    return (
                      <div
                        key={item.id}
                        className="kanban-card"
                        onClick={() => onSelectItem(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectItem(item);
                          }
                        }}
                      >
                        {/* Cabecera de tarjeta: Código, Título y Menú */}
                        <div className="kanban-card-top">
                          <div className="kanban-card-title-wrap">
                            <span className="kanban-card-code">
                              {item.kind === 'hito' ? `H-${item.code}` : `SP-${item.code}`}
                            </span>
                            <span className="kanban-card-name" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="kanban-card-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(item);
                            }}
                            title="Opciones del elemento"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>

                        {/* Hito Principal Padre (si es subproceso) */}
                        {parentHito ? (
                          <div className="kanban-card-parent" title={`Hito principal: ${parentHito.name}`}>
                            <Target size={12} className="kanban-card-icon" />
                            <span>
                              {parentHito.code ? `H-${parentHito.code}` : 'Hito'} {parentHito.name}
                            </span>
                          </div>
                        ) : (
                          <div className="kanban-card-parent is-hito" title="Hito Principal">
                            <Flag size={12} className="kanban-card-icon" />
                            <span>Hito Principal</span>
                          </div>
                        )}

                        {/* Fechas de Ejecución */}
                        <div className="kanban-card-dates">
                          <CalendarDays size={12} className="kanban-card-icon" />
                          <span>
                            {formatDatePE(item.start)} – {formatDatePE(item.end)}
                          </span>
                        </div>

                        {/* Pie de Tarjeta: Avatar + Región + Barra de Avance */}
                        <div className="kanban-card-footer">
                          <div className="kanban-card-meta-left">
                            <div
                              className="kanban-card-avatar"
                              style={{ backgroundColor: avatar.bg }}
                              title={`Responsable: ${item.gestor || 'Sin asignar'}`}
                            >
                              {avatar.initials}
                            </div>
                            {item.region && (
                              <span className="kanban-card-region-pill" title={`Ámbito: ${item.region}`}>
                                {item.region}
                              </span>
                            )}
                          </div>

                          <div className="kanban-card-progress-wrap">
                            {item.progress > 0 && (
                              <div className="kanban-progress-track">
                                <div
                                  className="kanban-progress-bar"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, item.progress))}%`,
                                    backgroundColor: isCompleted ? '#10b981' : '#0066ff',
                                  }}
                                />
                              </div>
                            )}
                            <span
                              className={`kanban-card-pct ${isCompleted ? 'is-complete' : ''}`}
                            >
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
