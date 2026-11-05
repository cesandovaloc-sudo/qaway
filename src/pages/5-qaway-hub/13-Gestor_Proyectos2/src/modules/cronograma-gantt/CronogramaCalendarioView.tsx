import React, { useMemo } from 'react';
import {
  CalendarDays,
  FileText,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';

export interface CalendarWeekDay {
  date: Date;
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  weekIndex: number;
  days: CalendarWeekDay[];
  startDateIso: string;
  endDateIso: string;
}

export interface DynamicCalendarEvent {
  id: string;
  code: string;
  name: string;
  kind: 'hito' | 'subproceso';
  status: Status;
  progress: number;
  start: string;
  end: string;
  weekIndex: number;
  colStart: number;
  colSpan: number;
  row: number;
  gestor: string;
  region: string;
  item: Item;
}

interface CronogramaCalendarioViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  formatDatePE: (iso: string) => string;
  calYear: number;
  calMonth: number; // 0-indexed: 0 = Enero, 9 = Octubre
  calDay: number;
  calSubView: 'Mes' | 'Semana' | 'Día';
  onNavPrev: () => void;
  onNavNext: () => void;
  onNavToday: () => void;
  onSubViewChange: (view: 'Mes' | 'Semana' | 'Día') => void;
  typeFilter?: string;
  tab?: string;
  stateFilter?: string;
  selectedRegions?: string[];
  regionFilter?: string;
  search?: string;
}

const WEEK_DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CAL_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const CAL_SHORT_MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

const GESTOR_COLORS: Record<string, { bg: string; color: string; initials: string }> = {
  'Carlos Mendoza': { bg: '#eff6ff', color: '#1d4ed8', initials: 'CM' },
  'María Salazar': { bg: '#ecfdf5', color: '#047857', initials: 'MS' },
  'Javier Rivas': { bg: '#fef3c7', color: '#b45309', initials: 'JR' },
  'Ana Paredes': { bg: '#fff7ed', color: '#c2410c', initials: 'AP' },
  'Lucía Castillo': { bg: '#f3e8ff', color: '#7e22ce', initials: 'LC' },
  'Sofía Alva': { bg: '#fef2f2', color: '#b91c1c', initials: 'SA' },
};

const getGestorBadge = (name?: string) => {
  if (!name || name === 'Sin asignar') {
    return { bg: '#f1f5f9', color: '#475569', initials: 'SA' };
  }
  if (GESTOR_COLORS[name]) return GESTOR_COLORS[name];
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((p) => p[0]?.toUpperCase() || '').slice(0, 2).join('');
  return { bg: '#eff6ff', color: '#1d4ed8', initials: initials || 'CM' };
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
  typeFilter = 'Todos',
  tab = 'Todos',
  stateFilter = 'Todos',
  selectedRegions = [],
  regionFilter = 'Todas',
  search = '',
}: CronogramaCalendarioViewProps) {

  // Generación dinámica de semanas para el mes/año seleccionado
  const monthWeeks = useMemo(() => {
    const weeks: CalendarWeek[] = [];
    const firstDayOfMonth = new Date(calYear, calMonth, 1);
    const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);

    // Ajuste al lunes anterior de la primera semana
    const firstDayDow = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Lunes, ..., 6 = Domingo
    const cursor = new Date(calYear, calMonth, 1 - firstDayDow);

    let weekIdx = 0;
    while (cursor <= lastDayOfMonth || cursor.getDay() !== 1 || weekIdx < 4) {
      const days: CalendarWeekDay[] = [];
      for (let d = 0; d < 7; d++) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const day = String(cursor.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${day}`;
        days.push({
          date: new Date(cursor),
          iso,
          dayNumber: cursor.getDate(),
          isCurrentMonth: cursor.getMonth() === calMonth,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push({
        weekIndex: weekIdx,
        days,
        startDateIso: days[0].iso,
        endDateIso: days[6].iso,
      });
      weekIdx++;
      if (weekIdx >= 6) break;
    }
    return weeks;
  }, [calYear, calMonth]);

  // Filtrado de items reales que aplican a los filtros globales
  const matchingItems = useMemo(() => {
    return items.filter((it) => {
      if (typeFilter && typeFilter !== 'Todos') {
        if (typeFilter === 'Hitos' && it.kind !== 'hito') return false;
        if (typeFilter === 'Subprocesos' && it.kind !== 'subproceso') return false;
      }
      if (tab && tab !== 'Todos') {
        if (tab === 'Hitos' && it.kind !== 'hito') return false;
        if (tab === 'Subprocesos' && it.kind !== 'subproceso') return false;
        if (tab === 'Completados' && it.status !== 'Completado' && it.status !== 'Cumple') return false;
        if (tab === 'En proceso' && it.status !== 'En proceso' && it.status !== 'En curso') return false;
        if (tab === 'Con retraso' && it.status !== 'Con retraso') return false;
        if (tab === 'Pendiente' && it.status !== 'Pendiente') return false;
      }
      if (stateFilter && stateFilter !== 'Todos' && it.status !== stateFilter) return false;
      if (selectedRegions && selectedRegions.length > 0) {
        if (it.region !== 'Todas' && it.region !== 'Todas las Regiones' && !selectedRegions.includes(it.region)) return false;
      } else if (regionFilter && regionFilter !== 'Todas') {
        if (it.region !== 'Todas' && it.region !== 'Todas las Regiones' && it.region !== regionFilter) return false;
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${it.code} ${it.name}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, typeFilter, tab, stateFilter, selectedRegions, regionFilter, search]);

  // Eventos proyectados en la rejilla del mes de forma dinámica
  const weekEvents = useMemo(() => {
    const map: Record<number, DynamicCalendarEvent[]> = {};
    monthWeeks.forEach((w) => {
      map[w.weekIndex] = [];
    });

    monthWeeks.forEach((w) => {
      const activeInWeek = matchingItems.filter((it) => it.start <= w.endDateIso && it.end >= w.startDateIso);
      // Asignación inteligente de carriles (lanes) sin colisiones para que ninguna barra se superponga
      const laneEndCols: number[] = [];

      activeInWeek.slice(0, 6).forEach((it) => {
        const startIso = it.start < w.startDateIso ? w.startDateIso : it.start;
        const endIso = it.end > w.endDateIso ? w.endDateIso : it.end;

        const startIdx = Math.max(0, Math.min(6, Math.round((new Date(startIso + 'T12:00:00').getTime() - new Date(w.startDateIso + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))));
        const endIdx = Math.max(0, Math.min(6, Math.round((new Date(endIso + 'T12:00:00').getTime() - new Date(w.startDateIso + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))));
        const colStart = startIdx + 1;
        const colSpan = Math.max(1, endIdx - startIdx + 1);
        const colEnd = colStart + colSpan - 1;

        let assignedLane = -1;
        for (let l = 0; l < laneEndCols.length; l++) {
          if (laneEndCols[l] < colStart) {
            assignedLane = l;
            laneEndCols[l] = colEnd;
            break;
          }
        }
        if (assignedLane === -1) {
          assignedLane = laneEndCols.length;
          laneEndCols.push(colEnd);
        }

        map[w.weekIndex].push({
          id: `${it.id}-w${w.weekIndex}`,
          code: it.code,
          name: it.name,
          kind: it.kind,
          status: it.status,
          progress: it.progress,
          start: it.start,
          end: it.end,
          weekIndex: w.weekIndex,
          colStart,
          colSpan,
          row: assignedLane + 1,
          gestor: it.gestor || 'Carlos Mendoza',
          region: it.region || 'Junín',
          item: it,
        });
      });
    });

    return map;
  }, [monthWeeks, matchingItems]);

  // Total de actividades activas durante este mes
  const totalMonthActivities = useMemo(() => {
    const startMonthIso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(calYear, calMonth + 1, 0).getDate();
    const endMonthIso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return matchingItems.filter((it) => it.start <= endMonthIso && it.end >= startMonthIso).length;
  }, [matchingItems, calYear, calMonth]);

  // Próximos entregables reales calculados a partir de la WBS
  const upcomingDeliverables = useMemo(() => {
    const curIso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
    const sorted = [...matchingItems]
      .filter((it) => it.end >= curIso)
      .sort((a, b) => a.end.localeCompare(b.end))
      .slice(0, 8);

    return sorted.map((it) => {
      const parts = it.end.split('-');
      const day = parts[2] || '01';
      const mIdx = Math.max(0, Math.min(11, (parseInt(parts[1] || '1', 10) - 1)));
      const badge = getGestorBadge(it.gestor);
      return {
        id: it.id,
        code: it.code,
        title: it.name,
        kind: it.kind,
        status: it.status,
        progress: it.progress,
        day,
        month: CAL_SHORT_MONTHS[mIdx] || 'MES',
        gestor: it.gestor || 'Carlos Mendoza',
        avatarBg: badge.bg,
        avatarColor: badge.color,
        initials: badge.initials,
        rawItem: it,
      };
    });
  }, [matchingItems, calYear, calMonth]);

  return (
    <div className="cronograma-cal-container cal-master-layout">
      {/* Área Principal de Calendario */}
      <div className="cal-main-area">
        {/* Cabecera Dinámica Limpia: Icono + Mes y Año Real (Punto 5 Homologado) */}
        <div className="cal-title-header-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <CalendarDays size={18} color="#0066ff" />
            <h2 className="cal-clean-title" style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#0f172a' }}>
              {CAL_MONTH_NAMES[calMonth]} {calYear}
            </h2>
          </div>
          <span className="cal-total-count-badge">
            {totalMonthActivities} {totalMonthActivities === 1 ? 'actividad programada' : 'actividades programadas'}
          </span>
        </div>

        {/* 1. SUB-VISTA: MES (Cuadrícula Dinámica con Barras de Gantt) */}
        {calSubView === 'Mes' && (
          <div className="cal-month-canvas">
            {/* Cabecera de Días de la Semana: Lunes a Domingo */}
            <div className="cal-weekdays-header">
              {WEEK_DAY_LABELS.map((dayLabel) => (
                <div key={dayLabel} className="cal-weekday-col">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Rejilla de Semanas calculadas dinámicamente */}
            <div className="cal-grid-body">
              {monthWeeks.map((week) => {
                const evs = weekEvents[week.weekIndex] || [];
                const maxRow = evs.reduce((acc, e) => Math.max(acc, e.row), 0);
                const dynamicMinHeight = Math.max(126, 42 + maxRow * 32);
                return (
                <div
                  key={week.weekIndex}
                  className="cal-week-row-grid"
                  style={{ minHeight: `${dynamicMinHeight}px` }}
                >
                  {/* Celdas de fondo con número de día */}
                  {week.days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`cal-day-bg-cell ${!day.isCurrentMonth ? 'outside' : ''}`}
                    >
                      <span className="cal-num">{day.dayNumber}</span>
                    </div>
                  ))}

                  {/* Capa de Barras de Gantt Oficiales sobre los días */}
                  <div className="cal-week-events-overlay">
                    {evs.map((ev) => {
                      const isMajor = ev.kind === 'hito';
                      const isComplete = ev.status === 'Completado' || ev.status === 'Cumple';
                      const isProgress = ev.status === 'En proceso' || ev.status === 'En curso';
                      const isLate = ev.status === 'Con retraso';

                      const barColorClass = isMajor
                        ? 'bar-major'
                        : isComplete
                        ? 'bar-complete'
                        : isProgress
                        ? 'bar-progress'
                        : isLate
                        ? 'bar-late'
                        : 'bar-pending';

                      return (
                        <div
                          key={ev.id}
                          className={`cal-gantt-bar ${barColorClass}`}
                          style={{
                            gridColumn: `${ev.colStart} / span ${ev.colSpan}`,
                            gridRow: ev.row,
                          }}
                          onClick={() => onSelectItem(ev.item)}
                          title={`${ev.code} · ${ev.name} (${ev.progress}% · ${ev.status})`}
                        >
                          {/* Barra de avance interior con física y color Gantt */}
                          <div
                            className="cal-gantt-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, ev.progress))}%`,
                            }}
                          />

                          {/* Contenido legible del entregable con alto contraste */}
                          <div className="cal-gantt-content">
                            {isMajor ? (
                              <span className="cal-gantt-hito-badge">◆</span>
                            ) : isComplete ? (
                              <Check size={11} strokeWidth={3} className="cal-gantt-check-icon" />
                            ) : null}
                            <strong className="cal-gantt-code">{ev.code}</strong>
                            <span className="cal-gantt-name">{ev.name}</span>
                            <span className="cal-gantt-pct">{ev.progress}%</span>
                          </div>

                          {/* Diamante característico al final del Componente Principal */}
                          {isMajor && (
                            <span className="cal-gantt-diamond-badge" title="Componente Principal">
                              <span className="cal-diamond-shape" />
                            </span>
                          )}
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
          <div className="cal-subview-semana">
            <div className="cal-semana-headers">
              {monthWeeks[0]?.days.map((d, i) => (
                <div key={d.iso} className="cal-semana-col-title">
                  {WEEK_DAY_LABELS[i].slice(0, 3)} {String(d.dayNumber).padStart(2, '0')}
                </div>
              ))}
            </div>
            <div className="cal-semana-content">
              {matchingItems.slice(0, 6).map((it) => {
                const isMajor = it.kind === 'hito';
                const isComplete = it.status === 'Completado' || it.status === 'Cumple';
                const isProgress = it.status === 'En proceso' || it.status === 'En curso';
                const isLate = it.status === 'Con retraso';
                const barColorClass = isMajor
                  ? 'bar-major'
                  : isComplete
                  ? 'bar-complete'
                  : isProgress
                  ? 'bar-progress'
                  : isLate
                  ? 'bar-late'
                  : 'bar-pending';

                return (
                  <div
                    key={it.id}
                    className={`cal-gantt-bar ${barColorClass}`}
                    onClick={() => onSelectItem(it)}
                    style={{ marginBottom: 8, height: '32px' }}
                  >
                    <div
                      className="cal-gantt-progress-fill"
                      style={{ width: `${it.progress}%` }}
                    />
                    <div className="cal-gantt-content">
                      {isMajor && <span className="cal-gantt-hito-badge">◆</span>}
                      <strong className="cal-gantt-code">{it.code}</strong>
                      <span className="cal-gantt-name">{it.name}</span>
                      <span className="cal-gantt-pct">{it.progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SUB-VISTA: DÍA */}
        {calSubView === 'Día' && (
          <div className="cal-subview-dia">
            <div className="cal-dia-head-row">
              <h3>
                {WEEK_DAY_LABELS[(new Date(calYear, calMonth, calDay).getDay() + 6) % 7]} {calDay} de {CAL_MONTH_NAMES[calMonth]}, {calYear}
              </h3>
              <span className="cal-dia-tag">Corte Oficial</span>
            </div>
            <div className="cal-dia-schedule">
              {['08:00', '10:00', '12:00', '14:00', '16:00'].map((h, i) => (
                <div key={h} className="cal-dia-slot-row">
                  <span className="cal-dia-hour">{h}</span>
                  <div className="cal-dia-event-box">
                    {matchingItems[i] && (
                      <div
                        className="cal-gantt-bar bar-progress"
                        onClick={() => onSelectItem(matchingItems[i])}
                        style={{ height: '30px' }}
                      >
                        <div className="cal-gantt-progress-fill" style={{ width: `${matchingItems[i].progress}%` }} />
                        <div className="cal-gantt-content">
                          <strong className="cal-gantt-code">{matchingItems[i].code}</strong>
                          <span className="cal-gantt-name">{matchingItems[i].name}</span>
                          <span className="cal-gantt-pct">{matchingItems[i].progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barra Lateral Derecha Institucional: Próximos Entregables y Leyenda */}
      <aside className="cal-sidebar-clean">
        {/* Sección: Próximos Entregables Dinámicos */}
        <div className="cal-sidebar-section">
          <div className="cal-sidebar-head">
            <h3 className="cal-sidebar-title">Próximos entregables</h3>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {upcomingDeliverables.length} pendientes
            </span>
          </div>

          <div className="cal-upcoming-stack">
            {upcomingDeliverables.map((ev) => (
              <div
                key={ev.id}
                className="cal-upcoming-card-row"
                onClick={() => onSelectItem(ev.rawItem)}
              >
                {/* Badge de fecha a la izquierda: día + mes */}
                <div className="cal-clean-date-badge">
                  <span className="badge-day-number">{ev.day}</span>
                  <span className="badge-month-text">{ev.month}</span>
                </div>

                {/* Info central */}
                <div className="cal-upcoming-center-info">
                  <div className="cal-upcoming-main-title">
                    <span
                      className={`cal-status-pill-mini ${
                        ev.status === 'Completado'
                          ? 'pill-complete'
                          : ev.status === 'En proceso'
                          ? 'pill-progress'
                          : 'pill-pending'
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span className="upcoming-title-text" title={ev.title}>{ev.title}</span>
                  </div>

                  <div className="cal-upcoming-cat-line">
                    <FileText size={11} className="cat-icon-sub" />
                    <span>{ev.code} · {ev.kind === 'hito' ? 'Componente' : 'Paquete de Trabajo'}</span>
                  </div>

                  {/* Barra de progreso estilo Gantt */}
                  <div className="cal-upcoming-progress-row">
                    <div className="cal-mini-track">
                      <div
                        className={`cal-mini-fill ${
                          ev.status === 'Completado'
                            ? 'fill-complete'
                            : ev.status === 'En proceso'
                            ? 'fill-progress'
                            : 'fill-pending'
                        }`}
                        style={{ width: `${ev.progress}%` }}
                      />
                    </div>
                    <span className="cal-mini-pct">{ev.progress}%</span>
                  </div>
                </div>

                {/* Avatar iniciales + tres puntos */}
                <div className="cal-upcoming-right-actions">
                  <div
                    className="cal-user-avatar-circle"
                    style={{ backgroundColor: ev.avatarBg, color: ev.avatarColor }}
                    title={ev.gestor}
                  >
                    {ev.initials}
                  </div>
                  <button
                    type="button"
                    className="cal-more-dots-btn"
                    title="Ver detalle"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(ev.rawItem);
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Leyenda Oficial */}
        <div className="cal-sidebar-section cal-legend-section">
          <h3 className="cal-sidebar-title">Leyenda</h3>
          <div className="cal-clean-legend-grid">
            <div className="cal-legend-row" title="Componente Principal oficial con rombo característico de Gantt">
              <span className="cal-legend-diamond">◆</span>
              <span>Componente Principal</span>
            </div>
            <div className="cal-legend-row" title="Subproceso en curso con avance parcial">
              <span className="cal-legend-box box-progress" />
              <span>En proceso</span>
            </div>
            <div className="cal-legend-row" title="Subproceso cumplido al 100%">
              <span className="cal-legend-box box-complete" />
              <span>Completado</span>
            </div>
            <div className="cal-legend-row" title="Subproceso pendiente de inicio">
              <span className="cal-legend-box box-pending" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
