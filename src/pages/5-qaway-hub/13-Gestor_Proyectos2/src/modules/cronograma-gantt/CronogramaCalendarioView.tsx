import React, { useMemo, useState } from 'react';
import {
  FolderGit2,
  FileText,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building2,
  User,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';

export type CalendarCategory = 'hito' | 'subproceso' | 'reunion' | 'visita' | 'vencimiento';

export interface CalendarEvent {
  id: string;
  itemId?: string;
  code: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  category: CalendarCategory;
  status: Status;
  owner?: string;
  region?: string;
  time?: string;
  originalItem?: Item;
}

interface CronogramaCalendarioViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  formatDatePE: (iso: string) => string;
  calYear: number;
  calMonth: number; // 0-indexed: 9 = Octubre
  calDay: number;
  calSubView: 'Mes' | 'Semana' | 'Día' | 'Agenda';
  onNavPrev: () => void;
  onNavNext: () => void;
  onNavToday: () => void;
  onSubViewChange: (view: 'Mes' | 'Semana' | 'Día' | 'Agenda') => void;
}

const WEEK_DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHORT_WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SHORT_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
];

// Eventos complementarios oficiales (operaciones de campo y seguimiento territorial MINEDU)
const EXTRA_OPERATIONAL_EVENTS: CalendarEvent[] = [
  {
    id: 'op-reu-1',
    code: 'REU-01',
    name: 'Reunión con UGEL Huancayo',
    start: '2026-10-06',
    end: '2026-10-06',
    category: 'reunion',
    status: 'Completado',
    owner: 'Carlos Mendoza',
    region: 'Junín',
    time: '10:00 – 11:30',
  },
  {
    id: 'op-venc-1',
    code: 'SP-02.2',
    name: 'Vence informe de almacén',
    start: '2026-10-09',
    end: '2026-10-09',
    category: 'vencimiento',
    status: 'En proceso',
    owner: 'Ana Paredes',
    region: 'Junín',
    time: 'Todo el día',
  },
  {
    id: 'op-vis-1',
    code: 'VIS-01',
    name: 'Visita a sede central',
    start: '2026-10-13',
    end: '2026-10-16',
    category: 'visita',
    status: 'En proceso',
    owner: 'Lucía Castillo',
    region: 'Lima Provincias',
    time: '09:00 – 16:00',
  },
  {
    id: 'op-reu-2',
    code: 'REU-02',
    name: 'Reunión técnica MINEDU',
    start: '2026-10-24',
    end: '2026-10-24',
    category: 'reunion',
    status: 'Pendiente',
    owner: 'Carlos Mendoza',
    region: 'Junín',
    time: '15:00 – 16:30',
  },
  {
    id: 'op-venc-2',
    code: 'H-03',
    name: 'Vence acta de conformidad',
    start: '2026-10-27',
    end: '2026-10-28',
    category: 'vencimiento',
    status: 'Pendiente',
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
    time: 'Todo el día',
  },
  {
    id: 'op-vis-2',
    code: 'VIS-02',
    name: 'Visita UGEL Concepción',
    start: '2026-10-30',
    end: '2026-10-31',
    category: 'visita',
    status: 'Pendiente',
    owner: 'Jorge Ramos',
    region: 'Junín',
    time: '09:00 – 14:00',
  },
];

const getInitials = (name?: string) => {
  if (!name) return 'SA';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name?: string) => {
  const colors = [
    { bg: '#eff6ff', text: '#1d4ed8' }, // azul
    { bg: '#ecfdf5', text: '#047857' }, // verde
    { bg: '#f5f3ff', text: '#6d28d9' }, // morado
    { bg: '#fff7ed', text: '#c2410c' }, // naranja
    { bg: '#fdf2f8', text: '#be185d' }, // rosa
  ];
  if (!name) return colors[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};

export default function CronogramaCalendarioView({
  items,
  onSelectItem,
  formatDatePE,
  calYear,
  calMonth,
  calDay,
  calSubView,
  onNavPrev,
  onNavNext,
  onNavToday,
  onSubViewChange,
}: CronogramaCalendarioViewProps) {
  // Construir universo unificado de eventos
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];

    // 1. Convertir items del cronograma (hitos y subprocesos)
    for (const it of items) {
      list.push({
        id: `item-${it.id}`,
        itemId: it.id,
        code: it.code,
        name: it.name,
        start: it.start,
        end: it.end,
        category: it.kind === 'hito' ? 'hito' : 'subproceso',
        status: it.status,
        owner: it.gestor || 'Sin asignar',
        region: it.region,
        originalItem: it,
      });
    }

    // 2. Incorporar eventos operativos territoriales
    for (const op of EXTRA_OPERATIONAL_EVENTS) {
      list.push(op);
    }

    return list;
  }, [items]);

  // Manejar clic en un evento
  const handleEventClick = (evt: CalendarEvent) => {
    if (evt.originalItem) {
      onSelectItem(evt.originalItem);
      return;
    }
    // Si no tiene originalItem, buscar por código o primer match
    const found = items.find((x) => x.code === evt.code || evt.code.startsWith(x.code));
    if (found) {
      onSelectItem(found);
      return;
    }
    if (items[0]) {
      onSelectItem(items[0]);
    }
  };

  // Cálculo de semanas y días del mes activo (5 a 6 semanas)
  const calendarWeeks = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth, 1);
    const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);

    // Ajustar a lunes: 0 = Lun, ..., 6 = Dom
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Primer día del grid (puede ser del mes previo)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const weeks: Array<{
      weekIndex: number;
      weekStartIso: string;
      weekEndIso: string;
      days: Array<{
        dateIso: string;
        dayNumber: number;
        isCurrentMonth: boolean;
        isToday: boolean;
        dayOfWeekIndex: number;
      }>;
    }> = [];

    const cursor = new Date(startDate);
    let currentWeekDays: Array<{
      dateIso: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayOfWeekIndex: number;
    }> = [];

    // Generar semanas completas hasta cubrir el mes (35 o 42 días)
    for (let i = 0; i < 42; i++) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      const isCurrentMonth = cursor.getMonth() === calMonth;
      const isToday = iso === '2026-10-27';

      currentWeekDays.push({
        dateIso: iso,
        dayNumber: cursor.getDate(),
        isCurrentMonth,
        isToday,
        dayOfWeekIndex: currentWeekDays.length,
      });

      cursor.setDate(cursor.getDate() + 1);

      if (currentWeekDays.length === 7) {
        weeks.push({
          weekIndex: weeks.length,
          weekStartIso: currentWeekDays[0].dateIso,
          weekEndIso: currentWeekDays[6].dateIso,
          days: currentWeekDays,
        });
        currentWeekDays = [];

        // Si ya pasamos el último día del mes y completamos semana, terminamos
        if (cursor > lastDayOfMonth && weeks.length >= 5) {
          break;
        }
      }
    }

    return weeks;
  }, [calYear, calMonth]);

  // Lista de eventos próximos (ordenados por fecha de inicio)
  const upcomingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 7);
  }, [allEvents]);

  // Formato para insignias de fecha (Día grande, Mes pequeño)
  const parseBadgeDate = (iso: string) => {
    if (!iso) return { day: '01', month: 'OCT' };
    const parts = iso.split('-');
    if (parts.length >= 3) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      return {
        day: parts[2].padStart(2, '0'),
        month: SHORT_MONTHS[monthIdx] ? SHORT_MONTHS[monthIdx].toUpperCase() : 'OCT',
      };
    }
    return { day: '01', month: 'OCT' };
  };

  // Helper de diferencia de días entre 2 fechas YYYY-MM-DD
  const diffDays = (d1: string, d2: string) => {
    const t1 = new Date(d1 + 'T00:00:00').getTime();
    const t2 = new Date(d2 + 'T00:00:00').getTime();
    return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="cronograma-cal-container cal-master-layout">
      {/* Área Principal de Calendario */}
      <div className="cal-main-area">
        {/* Cabecera del Mes en Vista Calendario */}
        <div className="cal-top-banner">
          <div className="cal-banner-left">
            <h2 className="cal-banner-title">
              {MONTH_NAMES[calMonth]} {calYear}
            </h2>
            <span className="cal-banner-subtitle">
              Programación territorial oficial · Dotación 2027
            </span>
          </div>
          <div className="cal-banner-right">
            <span className="cal-total-counter">
              <strong>{allEvents.length}</strong> actividades programadas
            </span>
          </div>
        </div>

        {/* 1. SUB-VISTA: MES (Trazo Continuo Horizontal Multi-Día) */}
        {calSubView === 'Mes' && (
          <div className="cal-month-view">
            {/* Cabecera de Días de la Semana */}
            <div className="cal-weekdays-row">
              {WEEK_DAY_LABELS.map((label, idx) => (
                <div key={label} className="cal-weekday-cell">
                  <span className="weekday-long">{label}</span>
                  <span className="weekday-short">{SHORT_WEEK_DAYS[idx]}</span>
                </div>
              ))}
            </div>

            {/* Lista de Filas de Semanas */}
            <div className="cal-weeks-stack">
              {calendarWeeks.map((week) => {
                // Filtrar eventos que intersecan con esta semana
                const weekEvents = allEvents.filter(
                  (evt) => evt.start <= week.weekEndIso && evt.end >= week.weekStartIso
                );

                // Calcular posición de columnas dentro de la semana (1 a 7)
                const computedWeekEvents = weekEvents.map((evt) => {
                  const startOffset = diffDays(evt.start, week.weekStartIso);
                  const endOffset = diffDays(evt.end, week.weekStartIso);

                  const colStart = Math.max(1, startOffset + 1);
                  const colEnd = Math.min(7, endOffset + 1);
                  const colSpan = Math.max(1, colEnd - colStart + 1);

                  const continuesBefore = evt.start < week.weekStartIso;
                  const continuesAfter = evt.end > week.weekEndIso;

                  return {
                    evt,
                    colStart,
                    colEnd,
                    colSpan,
                    continuesBefore,
                    continuesAfter,
                    lane: 0,
                  };
                });

                // Asignación voraz de carriles (Lanes) sin colisión
                computedWeekEvents.sort((a, b) => {
                  if (a.colStart !== b.colStart) return a.colStart - b.colStart;
                  return b.colSpan - a.colSpan;
                });

                const lanesEndCol: number[] = [];
                for (const item of computedWeekEvents) {
                  let placed = false;
                  for (let l = 0; l < lanesEndCol.length; l++) {
                    if (lanesEndCol[l] < item.colStart) {
                      item.lane = l;
                      lanesEndCol[l] = item.colEnd;
                      placed = true;
                      break;
                    }
                  }
                  if (!placed) {
                    item.lane = lanesEndCol.length;
                    lanesEndCol.push(item.colEnd);
                  }
                }

                return (
                  <div key={week.weekStartIso} className="cal-week-row">
                    {/* Capa de fondo con los 7 casilleros de días */}
                    <div className="cal-week-bg-grid">
                      {week.days.map((day) => (
                        <div
                          key={day.dateIso}
                          className={`cal-day-cell ${day.isCurrentMonth ? '' : 'outside'} ${
                            day.isToday ? 'is-today' : ''
                          }`}
                        >
                          <div className="cal-day-cell-top">
                            <span className={`cal-day-num ${day.isToday ? 'today-pill' : ''}`}>
                              {day.dayNumber}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Capa de eventos superpuesta con trazo continuo multi-día */}
                    <div className="cal-week-events-layer">
                      {computedWeekEvents.map(({ evt, colStart, colSpan, continuesBefore, continuesAfter, lane }) => {
                        return (
                          <div
                            key={`${evt.id}-${week.weekIndex}`}
                            className={`cal-continuous-bar cal-cat-${evt.category} ${
                              continuesBefore ? 'continues-left' : ''
                            } ${continuesAfter ? 'continues-right' : ''}`}
                            style={{
                              gridColumn: `${colStart} / span ${colSpan}`,
                              gridRow: lane + 1,
                            }}
                            onClick={() => handleEventClick(evt)}
                            title={`${evt.code} · ${evt.name} (${formatDatePE(evt.start)} al ${formatDatePE(evt.end)})`}
                          >
                            {continuesBefore && <span className="cal-arrow-indicator">◀</span>}
                            
                            <span className="cal-bar-icon-wrap">
                              {evt.category === 'hito' && <FolderGit2 size={13} className="cal-bar-icon" />}
                              {evt.category === 'subproceso' && <FileText size={13} className="cal-bar-icon" />}
                              {evt.category === 'reunion' && <Users size={13} className="cal-bar-icon" />}
                              {evt.category === 'visita' && <MapPin size={13} className="cal-bar-icon" />}
                              {evt.category === 'vencimiento' && <Clock size={13} className="cal-bar-icon" />}
                            </span>

                            <strong className="cal-bar-code">{evt.code}</strong>
                            <span className="cal-bar-title">{evt.name}</span>
                            
                            {evt.time && <span className="cal-bar-time">{evt.time}</span>}

                            {continuesAfter && <span className="cal-arrow-indicator">▶</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. SUB-VISTA: SEMANA */}
        {calSubView === 'Semana' && (
          <div className="cal-semana-view">
            <div className="cal-semana-header-grid">
              {WEEK_DAY_LABELS.map((dayLabel, idx) => (
                <div key={dayLabel} className="cal-semana-col-head">
                  <span className="semana-col-name">{dayLabel}</span>
                  <span className="semana-col-num">{idx + 5} Oct</span>
                </div>
              ))}
            </div>
            <div className="cal-semana-body-grid">
              {allEvents.slice(0, 10).map((evt, idx) => (
                <div
                  key={evt.id}
                  className={`cal-semana-event-card cal-cat-${evt.category}`}
                  onClick={() => handleEventClick(evt)}
                >
                  <div className="semana-card-head">
                    <strong className="semana-card-code">{evt.code}</strong>
                    <span className="semana-card-time">{evt.time || `${formatDatePE(evt.start)}`}</span>
                  </div>
                  <div className="semana-card-name">{evt.name}</div>
                  <div className="semana-card-meta">
                    <User size={12} />
                    <span>{evt.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUB-VISTA: DÍA */}
        {calSubView === 'Día' && (
          <div className="cal-dia-view">
            <div className="cal-dia-header">
              <CalendarDays size={18} className="cal-dia-head-icon" />
              <h3>Martes 27 de Octubre, 2026</h3>
              <span className="cal-dia-badge">Fecha de corte territorial</span>
            </div>
            <div className="cal-dia-timeline">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((hour) => {
                const hourEvents = allEvents.filter((e) => (e.time && e.time.startsWith(hour.slice(0, 2))) || hour === '10:00');
                return (
                  <div key={hour} className="cal-dia-hour-row">
                    <span className="cal-dia-hour-label">{hour}</span>
                    <div className="cal-dia-hour-slot">
                      {hour === '10:00' && (
                        <div className="cal-dia-card cal-cat-reunion" onClick={() => onSelectItem(items[0])}>
                          <div className="dia-card-top">
                            <span className="dia-card-code">REU-01</span>
                            <span className="dia-card-time">10:00 – 11:30</span>
                          </div>
                          <div className="dia-card-title">Reunión de coordinación territorial MINEDU</div>
                          <div className="dia-card-sub">Responsable: Carlos Mendoza · Junín</div>
                        </div>
                      )}
                      {hour === '09:00' && (
                        <div className="cal-dia-card cal-cat-vencimiento" onClick={() => onSelectItem(items[1] || items[0])}>
                          <div className="dia-card-top">
                            <span className="dia-card-code">SP-02.2</span>
                            <span className="dia-card-time">Todo el día</span>
                          </div>
                          <div className="dia-card-title">Vence informe de almacén y recepción en MC SIGA</div>
                          <div className="dia-card-sub">Responsable: Ana Paredes · Hito Rector 2</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SUB-VISTA: AGENDA */}
        {calSubView === 'Agenda' && (
          <div className="cal-agenda-view">
            <div className="cal-agenda-list">
              {allEvents.map((evt) => {
                const badge = parseBadgeDate(evt.start);
                return (
                  <div
                    key={evt.id}
                    className="cal-agenda-item-row"
                    onClick={() => handleEventClick(evt)}
                  >
                    <div className="cal-agenda-date-box">
                      <span className="agenda-date-num">{badge.day}</span>
                      <span className="agenda-date-mon">{badge.month}</span>
                    </div>

                    <div className={`cal-agenda-card cal-cat-${evt.category}`}>
                      <div className="agenda-card-title-row">
                        <strong className="agenda-card-code">{evt.code}</strong>
                        <span className="agenda-card-name">{evt.name}</span>
                      </div>
                      <div className="agenda-card-meta-row">
                        <span className="agenda-meta-item">
                          <Clock size={12} />
                          <span>{evt.time || `${formatDatePE(evt.start)} – ${formatDatePE(evt.end)}`}</span>
                        </span>
                        <span className="agenda-meta-item">
                          <User size={12} />
                          <span>{evt.owner}</span>
                        </span>
                        {evt.region && (
                          <span className="agenda-meta-item">
                            <Building2 size={12} />
                            <span>{evt.region}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="cal-agenda-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Barra Lateral Derecha: Próximos eventos y Leyenda */}
      <aside className="cal-sidebar">
        {/* Tarjeta 1: Próximos eventos */}
        <div className="cal-sidebar-card">
          <div className="cal-sidebar-card-header">
            <h3 className="cal-sidebar-card-title">Próximos eventos</h3>
            <button
              type="button"
              className="cal-view-all-link"
              onClick={() => onSubViewChange('Agenda')}
            >
              <span>Ver todos</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="cal-upcoming-list">
            {upcomingEvents.map((evt) => {
              const badge = parseBadgeDate(evt.start);
              const initials = getInitials(evt.owner);
              const avatarColor = getAvatarColor(evt.owner);

              return (
                <div
                  key={evt.id}
                  className="cal-upcoming-item"
                  onClick={() => handleEventClick(evt)}
                >
                  {/* Badge de fecha a la izquierda */}
                  <div className="cal-date-badge">
                    <span className="cal-date-badge-day">{badge.day}</span>
                    <span className="cal-date-badge-month">{badge.month}</span>
                  </div>

                  {/* Información central */}
                  <div className="cal-upcoming-info">
                    <div className="cal-upcoming-title-row">
                      <span className={`cal-cat-dot cal-dot-${evt.category}`} />
                      <span className="cal-upcoming-title" title={evt.name}>
                        {evt.name}
                      </span>
                    </div>
                    <div className="cal-upcoming-sub">
                      <span className="cal-upcoming-code">{evt.code}</span>
                      <span className="cal-sub-divider">·</span>
                      <span className="cal-upcoming-cat">
                        {evt.category === 'hito' && 'Hito Rector'}
                        {evt.category === 'subproceso' && 'Subproceso'}
                        {evt.category === 'reunion' && 'Reunión'}
                        {evt.category === 'visita' && 'Visita a sede'}
                        {evt.category === 'vencimiento' && 'Vencimiento'}
                      </span>
                    </div>
                    <div className="cal-upcoming-time">
                      <Clock size={11} className="time-icon" />
                      <span>{evt.time || `${formatDatePE(evt.start)} al ${formatDatePE(evt.end)}`}</span>
                    </div>
                  </div>

                  {/* Avatar iniciales a la derecha */}
                  <div
                    className="cal-upcoming-avatar"
                    style={{
                      backgroundColor: avatarColor.bg,
                      color: avatarColor.text,
                    }}
                    title={`Responsable: ${evt.owner}`}
                  >
                    {initials}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta 2: Leyenda oficial */}
        <div className="cal-sidebar-card cal-legend-card">
          <h3 className="cal-sidebar-card-title">Leyenda</h3>
          <div className="cal-legend-grid">
            <div className="cal-legend-item">
              <span className="cal-cat-dot cal-dot-hito" />
              <span className="cal-legend-label">Hitos / Subprocesos</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-cat-dot cal-dot-reunion" />
              <span className="cal-legend-label">Reuniones</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-cat-dot cal-dot-visita" />
              <span className="cal-legend-label">Visitas a sedes</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-cat-dot cal-dot-vencimiento" />
              <span className="cal-legend-label">Vencimientos</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
