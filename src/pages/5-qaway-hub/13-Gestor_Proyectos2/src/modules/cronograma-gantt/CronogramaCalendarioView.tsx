import React, { useMemo } from 'react';
import {
  FileText,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Check,
  Plus,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';

export interface CalendarProjectEvent {
  id: string;
  code: string;
  name: string;
  kind: 'hito' | 'subproceso';
  status: Status;
  progress: number;
  start: string;
  end: string;
  weekIndex: number; // 0 a 4 (Semana 1 a Semana 5)
  colStart: number;  // 1 a 7 (Lunes = 1, Domingo = 7)
  colSpan: number;   // 1 a 7
  row: number;       // 1, 2, 3...
  owner: string;
  region: string;
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
  typeFilter?: string;
  tab?: string;
  stateFilter?: string;
  selectedRegions?: string[];
  regionFilter?: string;
  search?: string;
}

const WEEK_DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Programación Oficial de Hitos Rectores y Subprocesos · MINEDU Dotación 2027 (Octubre 2026)
// Exclusivo para Hitos y Entregables del Proyecto (Reuniones pertenece a su propio módulo)
const OCTOBER_PROJECT_EVENTS: CalendarProjectEvent[] = [
  // SEMANA 1: 28 Sep al 04 Oct (Jueves 1 al Domingo 4)
  {
    id: 'cal-sp-02-1',
    code: 'SP-02.1',
    name: 'Elaboración y entrega del plan de distribución',
    kind: 'subproceso',
    status: 'En proceso',
    progress: 55,
    start: '2026-10-01',
    end: '2026-10-04',
    weekIndex: 0,
    colStart: 4,
    colSpan: 4,
    row: 1,
    owner: 'Carlos Mendoza',
    region: 'Junín',
  },

  // SEMANA 2: 05 al 11 Oct
  {
    id: 'cal-sp-02-2',
    code: 'SP-02.2',
    name: 'Identificación y directorio de almacenes',
    kind: 'subproceso',
    status: 'Completado',
    progress: 100,
    start: '2026-10-05',
    end: '2026-10-08',
    weekIndex: 1,
    colStart: 1,
    colSpan: 4,
    row: 1,
    owner: 'María Salazar',
    region: 'Junín',
  },
  {
    id: 'cal-sp-02-3',
    code: 'SP-02.3',
    name: 'Registro y corte de stock inicial',
    kind: 'subproceso',
    status: 'En proceso',
    progress: 40,
    start: '2026-10-09',
    end: '2026-10-10',
    weekIndex: 1,
    colStart: 5,
    colSpan: 2,
    row: 1,
    owner: 'Ana Paredes',
    region: 'Junín',
  },
  {
    id: 'cal-h-02',
    code: 'H-02',
    name: 'Gestión de Almacenes y Recepción en MC SIGA',
    kind: 'hito',
    status: 'En proceso',
    progress: 42,
    start: '2026-10-05',
    end: '2026-10-11',
    weekIndex: 1,
    colStart: 1,
    colSpan: 7,
    row: 2,
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
  },

  // SEMANA 3: 12 al 18 Oct
  {
    id: 'cal-sp-02-4',
    code: 'SP-02.4',
    name: 'Validación física de almacenes territoriales',
    kind: 'subproceso',
    status: 'Completado',
    progress: 100,
    start: '2026-10-13',
    end: '2026-10-15',
    weekIndex: 2,
    colStart: 2,
    colSpan: 3,
    row: 1,
    owner: 'Lucía Castillo',
    region: 'Lima Provincias',
  },
  {
    id: 'cal-sp-03-1',
    code: 'SP-03.1',
    name: 'Validación de evidencias y requerimientos',
    kind: 'subproceso',
    status: 'En proceso',
    progress: 60,
    start: '2026-10-16',
    end: '2026-10-18',
    weekIndex: 2,
    colStart: 5,
    colSpan: 3,
    row: 1,
    owner: 'Carlos Mendoza',
    region: 'Junín',
  },

  // SEMANA 4: 19 al 25 Oct
  {
    id: 'cal-sp-02-5',
    code: 'SP-02.5',
    name: 'Cierre de fase y conciliación de almacén',
    kind: 'subproceso',
    status: 'Pendiente',
    progress: 0,
    start: '2026-10-21',
    end: '2026-10-23',
    weekIndex: 3,
    colStart: 3,
    colSpan: 3,
    row: 1,
    owner: 'Carlos Mendoza',
    region: 'Junín',
  },
  {
    id: 'cal-sp-03-2',
    code: 'SP-03.2',
    name: 'Consolidado de requerimientos II.EE.',
    kind: 'subproceso',
    status: 'Pendiente',
    progress: 0,
    start: '2026-10-24',
    end: '2026-10-25',
    weekIndex: 3,
    colStart: 6,
    colSpan: 2,
    row: 1,
    owner: 'María Salazar',
    region: 'Junín',
  },

  // SEMANA 5: 26 Oct al 01 Nov
  {
    id: 'cal-h-03',
    code: 'H-03',
    name: 'Acta de conformidad y asignación presupuestal',
    kind: 'hito',
    status: 'Pendiente',
    progress: 0,
    start: '2026-10-27',
    end: '2026-10-29',
    weekIndex: 4,
    colStart: 2,
    colSpan: 3,
    row: 1,
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
  },
  {
    id: 'cal-sp-04-1',
    code: 'SP-04.1',
    name: 'Informe técnico territorial consolidado',
    kind: 'subproceso',
    status: 'Pendiente',
    progress: 0,
    start: '2026-10-30',
    end: '2026-11-01',
    weekIndex: 4,
    colStart: 5,
    colSpan: 3,
    row: 2,
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
  },
];

// Estructura de las 5 semanas de Octubre 2026
const OCTOBER_2026_WEEKS = [
  {
    weekIndex: 0,
    days: [
      { dayNumber: 28, isCurrentMonth: false },
      { dayNumber: 29, isCurrentMonth: false },
      { dayNumber: 30, isCurrentMonth: false },
      { dayNumber: 1, isCurrentMonth: true },
      { dayNumber: 2, isCurrentMonth: true },
      { dayNumber: 3, isCurrentMonth: true },
      { dayNumber: 4, isCurrentMonth: true },
    ],
  },
  {
    weekIndex: 1,
    days: [
      { dayNumber: 5, isCurrentMonth: true },
      { dayNumber: 6, isCurrentMonth: true },
      { dayNumber: 7, isCurrentMonth: true },
      { dayNumber: 8, isCurrentMonth: true },
      { dayNumber: 9, isCurrentMonth: true },
      { dayNumber: 10, isCurrentMonth: true },
      { dayNumber: 11, isCurrentMonth: true },
    ],
  },
  {
    weekIndex: 2,
    days: [
      { dayNumber: 12, isCurrentMonth: true },
      { dayNumber: 13, isCurrentMonth: true },
      { dayNumber: 14, isCurrentMonth: true },
      { dayNumber: 15, isCurrentMonth: true },
      { dayNumber: 16, isCurrentMonth: true },
      { dayNumber: 17, isCurrentMonth: true },
      { dayNumber: 18, isCurrentMonth: true },
    ],
  },
  {
    weekIndex: 3,
    days: [
      { dayNumber: 19, isCurrentMonth: true },
      { dayNumber: 20, isCurrentMonth: true },
      { dayNumber: 21, isCurrentMonth: true },
      { dayNumber: 22, isCurrentMonth: true },
      { dayNumber: 23, isCurrentMonth: true },
      { dayNumber: 24, isCurrentMonth: true },
      { dayNumber: 25, isCurrentMonth: true },
    ],
  },
  {
    weekIndex: 4,
    days: [
      { dayNumber: 26, isCurrentMonth: true },
      { dayNumber: 27, isCurrentMonth: true },
      { dayNumber: 28, isCurrentMonth: true },
      { dayNumber: 29, isCurrentMonth: true },
      { dayNumber: 30, isCurrentMonth: true },
      { dayNumber: 31, isCurrentMonth: true },
      { dayNumber: 1, isCurrentMonth: false },
    ],
  },
];

// Próximos Entregables y Fechas Clave del Proyecto (Sidebar Derecho)
const UPCOMING_PROJECT_DELIVERABLES = [
  {
    id: 'up-1',
    day: '01',
    month: 'OCT',
    code: 'SP-02.1',
    title: 'Elaboración y entrega del plan de distribución',
    kind: 'subproceso' as const,
    status: 'En proceso' as Status,
    progress: 55,
    time: 'Plazo oficial',
    initials: 'CM',
    avatarBg: '#eff6ff',
    avatarColor: '#1d4ed8',
    owner: 'Carlos Mendoza',
  },
  {
    id: 'up-2',
    day: '05',
    month: 'OCT',
    code: 'SP-02.2',
    title: 'Identificación y directorio de almacenes',
    kind: 'subproceso' as const,
    status: 'Completado' as Status,
    progress: 100,
    time: 'Entregado',
    initials: 'MS',
    avatarBg: '#ecfdf5',
    avatarColor: '#047857',
    owner: 'María Salazar',
  },
  {
    id: 'up-3',
    day: '09',
    month: 'OCT',
    code: 'SP-02.3',
    title: 'Registro y corte de stock inicial',
    kind: 'subproceso' as const,
    status: 'En proceso' as Status,
    progress: 40,
    time: 'En verificación',
    initials: 'AP',
    avatarBg: '#fff7ed',
    avatarColor: '#c2410c',
    owner: 'Ana Paredes',
  },
  {
    id: 'up-4',
    day: '13',
    month: 'OCT',
    code: 'SP-02.4',
    title: 'Validación física de almacenes territoriales',
    kind: 'subproceso' as const,
    status: 'Completado' as Status,
    progress: 100,
    time: 'Entregado',
    initials: 'LC',
    avatarBg: '#ecfdf5',
    avatarColor: '#047857',
    owner: 'Lucía Castillo',
  },
  {
    id: 'up-5',
    day: '16',
    month: 'OCT',
    code: 'SP-03.1',
    title: 'Validación de evidencias y requerimientos',
    kind: 'subproceso' as const,
    status: 'En proceso' as Status,
    progress: 60,
    time: 'En curso',
    initials: 'CM',
    avatarBg: '#eff6ff',
    avatarColor: '#1d4ed8',
    owner: 'Carlos Mendoza',
  },
  {
    id: 'up-6',
    day: '27',
    month: 'OCT',
    code: 'H-03',
    title: 'Acta de conformidad y asignación presupuestal',
    kind: 'hito' as const,
    status: 'Pendiente' as Status,
    progress: 0,
    time: 'Programado',
    initials: 'CM',
    avatarBg: '#f1f5f9',
    avatarColor: '#475569',
    owner: 'Carlos Mendoza',
  },
];

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
  // Manejador para abrir el drawer con un item real del cronograma
  const handleOpenItem = (code: string) => {
    const found = items.find((x) => x.code === code || code.startsWith(x.code));
    if (found) {
      onSelectItem(found);
    } else if (items[0]) {
      onSelectItem(items[0]);
    }
  };

  // Filtrado reactivo de eventos según Filtro Tipo, Tab, Estado, Ubicación (Multi-región) y Búsqueda
  const filteredEvents = useMemo(() => {
    return OCTOBER_PROJECT_EVENTS.filter((ev) => {
      // 1. Filtro Tipo (Todos / Hitos / Subprocesos)
      if (typeFilter && typeFilter !== 'Todos') {
        if (typeFilter === 'Hitos' && ev.kind !== 'hito') return false;
        if (typeFilter === 'Subprocesos' && ev.kind !== 'subproceso') return false;
      }

      // 2. Filtro Tab general (Cápsulas de Gantt)
      if (tab && tab !== 'Todos') {
        if (tab === 'Hitos' && ev.kind !== 'hito') return false;
        if (tab === 'Subprocesos' && ev.kind !== 'subproceso') return false;
        if (tab === 'Completados' && ev.status !== 'Completado' && ev.status !== 'Cumple') return false;
        if (tab === 'En proceso' && ev.status !== 'En proceso' && ev.status !== 'En curso') return false;
        if (tab === 'Con retraso' && ev.status !== 'Con retraso') return false;
        if (tab === 'Pendiente' && ev.status !== 'Pendiente') return false;
      }

      // 3. Filtro Estado
      if (stateFilter && stateFilter !== 'Todos') {
        if (ev.status !== stateFilter) return false;
      }

      // 4. Filtro Ubicación (Multi-región y territorial)
      if (selectedRegions && selectedRegions.length > 0) {
        if (ev.region !== 'Todas las Regiones' && !selectedRegions.includes(ev.region)) return false;
      } else if (regionFilter && regionFilter !== 'Todas') {
        if (ev.region !== 'Todas las Regiones' && ev.region !== regionFilter) return false;
      }

      // 5. Búsqueda por texto
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const match = `${ev.code} ${ev.name}`.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [typeFilter, tab, stateFilter, selectedRegions, regionFilter, search]);

  // Agrupación de eventos por semana para la cuadrícula del mes
  const weekEvents = useMemo(() => {
    const map: Record<number, CalendarProjectEvent[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    filteredEvents.forEach((ev) => {
      const bucket = map[ev.weekIndex];
      if (bucket) {
        bucket.push(ev);
      }
    });
    return map;
  }, [filteredEvents]);

  return (
    <div className="cronograma-cal-container cal-master-layout">
      {/* Área Principal de Calendario */}
      <div className="cal-main-area">
        {/* Cabecera Limpia Institucional: Icono + Octubre 2026 */}
        <div className="cal-title-header-clean">
          <div className="cal-plus-icon-wrap" title="Agregar evento o hito al calendario">
            <Plus size={16} />
          </div>
          <h2 className="cal-clean-title">Octubre 2026</h2>
          <span className="cal-total-count-badge">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'actividad programada' : 'actividades programadas'}
          </span>
        </div>

        {/* 1. SUB-VISTA: MES (Cuadrícula Mensual con Barras de Gantt) */}
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

            {/* Rejilla de las 5 Semanas de Octubre */}
            <div className="cal-grid-body">
              {OCTOBER_2026_WEEKS.map((week) => (
                <div key={week.weekIndex} className="cal-week-row-grid">
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
                    {weekEvents[week.weekIndex]?.map((ev) => {
                      const isMajor = ev.kind === 'hito';
                      const isComplete = ev.status === 'Completado' || ev.status === 'Cumple';
                      const isProgress = ev.status === 'En proceso' || ev.status === 'En curso';
                      const isLate = ev.status === 'Con retraso';

                      // Si es Hito Rector, su barra es SIEMPRE bar-major (Azul Oficial Gantt con Rombo ◆).
                      // Si no es Hito Rector, toma el color según su estado operativo (verde, naranja, rojo o gris).
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
                          onClick={() => handleOpenItem(ev.code)}
                          title={`${ev.code} · ${ev.name} (${ev.progress}% · ${ev.status})`}
                        >
                          {/* Barra de avance interior con física y color Gantt */}
                          <div
                            className="cal-gantt-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, ev.progress))}%`,
                            }}
                          />

                          {/* Contenido legible del entregable */}
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

                          {/* Diamante característico al final del Hito Rector (idéntico a Gantt) */}
                          {isMajor && (
                            <span className="cal-gantt-diamond-badge" title="Hito Rector MINEDU">
                              <span className="cal-diamond-shape" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. SUB-VISTA: SEMANA */}
        {calSubView === 'Semana' && (
          <div className="cal-subview-semana">
            <div className="cal-semana-headers">
              {['Lun 05', 'Mar 06', 'Mié 07', 'Jue 08', 'Vie 09', 'Sáb 10', 'Dom 11'].map((d) => (
                <div key={d} className="cal-semana-col-title">{d}</div>
              ))}
            </div>
            <div className="cal-semana-content">
              {filteredEvents.slice(0, 5).map((ev) => {
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
                    onClick={() => handleOpenItem(ev.code)}
                    style={{ marginBottom: 8, height: '32px' }}
                  >
                    <div
                      className="cal-gantt-progress-fill"
                      style={{ width: `${ev.progress}%` }}
                    />
                    <div className="cal-gantt-content">
                      {ev.kind === 'hito' && <span className="cal-gantt-hito-badge">◆</span>}
                      <strong className="cal-gantt-code">{ev.code}</strong>
                      <span className="cal-gantt-name">{ev.name}</span>
                      <span className="cal-gantt-pct">{ev.progress}%</span>
                    </div>
                    {ev.kind === 'hito' && (
                      <span className="cal-gantt-diamond-badge">
                        <span className="cal-diamond-shape" />
                      </span>
                    )}
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
              <h3>Martes 27 de Octubre, 2026</h3>
              <span className="cal-dia-tag">Corte Oficial</span>
            </div>
            <div className="cal-dia-schedule">
              {['08:00', '10:00', '12:00', '14:00', '16:00'].map((h, i) => (
                <div key={h} className="cal-dia-slot-row">
                  <span className="cal-dia-hour">{h}</span>
                  <div className="cal-dia-event-box">
                    {i === 1 && (
                      <div
                        className="cal-gantt-bar bar-progress"
                        onClick={() => handleOpenItem('SP-02.1')}
                        style={{ height: '30px' }}
                      >
                        <div className="cal-gantt-progress-fill" style={{ width: '55%' }} />
                        <div className="cal-gantt-content">
                          <strong className="cal-gantt-code">SP-02.1</strong>
                          <span className="cal-gantt-name">Elaboración y validación del plan de distribución</span>
                          <span className="cal-gantt-pct">55%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SUB-VISTA: AGENDA */}
        {calSubView === 'Agenda' && (
          <div className="cal-subview-agenda">
            {UPCOMING_PROJECT_DELIVERABLES.map((it) => (
              <div
                key={it.id}
                className="cal-agenda-row"
                onClick={() => handleOpenItem(it.code)}
              >
                <div className="cal-date-badge-box">
                  <span className="cal-badge-day">{it.day}</span>
                  <span className="cal-badge-mon">{it.month}</span>
                </div>
                <div className="cal-agenda-info">
                  <div className="cal-agenda-title-line">
                    <span
                      className={`cal-status-pill-mini ${
                        it.status === 'Completado'
                          ? 'pill-complete'
                          : it.status === 'En proceso'
                          ? 'pill-progress'
                          : 'pill-pending'
                      }`}
                    >
                      {it.status}
                    </span>
                    <strong>{it.code} · {it.title}</strong>
                  </div>
                  <span className="cal-agenda-sub">
                    {it.kind === 'hito' ? 'Hito Rector' : 'Subproceso'} · Responsable: {it.owner}
                  </span>
                </div>
                <div
                  className="cal-agenda-avatar"
                  style={{ backgroundColor: it.avatarBg, color: it.avatarColor }}
                  title={it.owner}
                >
                  {it.initials}
                </div>
                <ArrowRight size={14} className="cal-agenda-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra Lateral Derecha Institucional: Próximos Entregables y Leyenda de Gantt */}
      <aside className="cal-sidebar-clean">
        {/* Sección: Próximos Entregables */}
        <div className="cal-sidebar-section">
          <div className="cal-sidebar-head">
            <h3 className="cal-sidebar-title">Próximos entregables</h3>
            <button
              type="button"
              className="cal-ver-todos-btn"
              onClick={() => onSubViewChange('Agenda')}
            >
              <span>Ver todos</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="cal-upcoming-stack">
            {UPCOMING_PROJECT_DELIVERABLES.map((ev) => (
              <div
                key={ev.id}
                className="cal-upcoming-card-row"
                onClick={() => handleOpenItem(ev.code)}
              >
                {/* Badge de fecha a la izquierda: 01 OCT */}
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
                    <span>{ev.code} · {ev.kind === 'hito' ? 'Hito Rector' : 'Subproceso'}</span>
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
                    title={ev.owner}
                  >
                    {ev.initials}
                  </div>
                  <button
                    type="button"
                    className="cal-more-dots-btn"
                    title="Opciones de entregable"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenItem(ev.code);
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Leyenda (Estricto Sistema Gantt) */}
        <div className="cal-sidebar-section cal-legend-section">
          <h3 className="cal-sidebar-title">Leyenda</h3>
          <div className="cal-clean-legend-grid">
            <div className="cal-legend-row" title="Hito Rector oficial con rombo característico de Gantt">
              <span className="cal-legend-diamond">◆</span>
              <span>Hito Rector</span>
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
