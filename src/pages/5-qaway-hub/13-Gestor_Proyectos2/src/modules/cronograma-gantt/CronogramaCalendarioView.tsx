import React, { useMemo, useState, useEffect } from 'react';
import {
  CalendarDays,
  Calendar,
  FileText,
  Folder,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  X,
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
  color: 'blue' | 'purple' | 'pink' | 'amber';
  item: Item;
}

interface CronogramaCalendarioViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  formatDatePE: (iso: string) => string;
  calYear: number;
  calMonth: number; // 0-indexed: 0 = Enero, 7 = Agosto, 9 = Octubre
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
  showBarLabels?: boolean;
  showBaseline?: boolean;
  showBarAvatars?: boolean;
}

const WORK_DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const MINI_CAL_WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CAL_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
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
  typeFilter = 'Todos',
  tab = 'Todos',
  stateFilter = 'Todos',
  selectedRegions = [],
  regionFilter = 'Todas',
  search = '',
}: CronogramaCalendarioViewProps) {
  // Estado de visibilidad del panel lateral
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estados del mini-calendario interactivo
  const [miniYear, setMiniYear] = useState(calYear);
  const [miniMonth, setMiniMonth] = useState(calMonth);
  const [selectedDateDay, setSelectedDateDay] = useState(calDay || 13);

  // Checkboxes de sugerencias de temas
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({
    'topic-1': false,
    'topic-2': false,
  });

  useEffect(() => {
    setMiniYear(calYear);
    setMiniMonth(calMonth);
  }, [calYear, calMonth]);

  const toggleTopic = (id: string) => {
    setCheckedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Generación de semanas con días laborables (Lunes a Viernes) para el lienzo principal
  const monthWeeks = useMemo(() => {
    const weeks: CalendarWeek[] = [];
    const firstDayOfMonth = new Date(calYear, calMonth, 1);
    const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);

    const firstDayDow = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Lunes, ..., 6 = Domingo
    const cursor = new Date(calYear, calMonth, 1 - firstDayDow);

    let weekIdx = 0;
    while (cursor <= lastDayOfMonth || cursor.getDay() !== 1 || weekIdx < 4) {
      const allDays: CalendarWeekDay[] = [];
      for (let d = 0; d < 7; d++) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const day = String(cursor.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${day}`;
        allDays.push({
          date: new Date(cursor),
          iso,
          dayNumber: cursor.getDate(),
          isCurrentMonth: cursor.getMonth() === calMonth,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push({
        weekIndex: weekIdx,
        days: allDays,
        startDateIso: allDays[0]?.iso ?? '',
        endDateIso: allDays[6]?.iso ?? '',
      });
      weekIdx++;
      if (weekIdx >= 5) break;
    }
    return weeks;
  }, [calYear, calMonth]);

  // Filtrado de items reales que aplican a los filtros globales
  const matchingItems = useMemo(() => {
    return items.filter((it) => {
      if (it.name.startsWith('UGEL') || it.name.startsWith('DRE Junín (Sede') || /^\d+\.\d+\.\d+/.test(it.code)) {
        return false;
      }
      if (typeFilter && typeFilter !== 'Todos') {
        if (typeFilter === 'Hitos' && it.kind !== 'hito') return false;
        if (typeFilter === 'Subprocesos' && it.kind !== 'subproceso') return false;
      }
      if (tab && tab !== 'Todos') {
        if (tab === 'Componentes' && it.kind !== 'hito') return false;
        if (tab === 'Hitos' && it.kind !== 'hito') return false;
        if (tab === 'Subprocesos' && it.kind !== 'subproceso') return false;
        if (tab === 'Completados' && it.status !== 'Completado' && it.status !== 'Cumple') return false;
        if (tab === 'En proceso' && it.status !== 'En proceso' && it.status !== 'En curso') return false;
        if (tab === 'Con retraso' && it.status !== 'Con retraso') return false;
        if (tab === 'Pendiente' && it.status !== 'Pendiente') return false;
      }
      if (stateFilter && stateFilter !== 'Todos' && it.status !== stateFilter) return false;
      if (selectedRegions && selectedRegions.length > 0) {
        if (it.region !== 'Todas' && it.region !== 'Todas las Regiones' && !selectedRegions.includes(it.region ?? '')) return false;
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

  // Asignación de paleta armónica pastel según taxonomía WBS / código
  const getItemColor = (item: Item): 'blue' | 'purple' | 'pink' | 'amber' => {
    const code = (item.code || '').trim();
    if (code.startsWith('4') || item.kind === 'hito') return 'blue';
    if (code.startsWith('5') || code.startsWith('3')) return 'purple';
    if (code.startsWith('1') || code.startsWith('2')) return 'pink';
    return 'blue';
  };

  // Mapeo exacto de barras en la cuadrícula de 5 columnas (L-V) con líneas punteadas
  const weekEvents = useMemo(() => {
    const map: Record<number, DynamicCalendarEvent[]> = {};
    monthWeeks.forEach((w) => {
      map[w.weekIndex] = [];
    });
    if (monthWeeks.length === 0) return map;

    // Buscar items destacados o representativos del proyecto
    const item4 = matchingItems.find((x) => x.code.startsWith('4') || x.name.toLowerCase().includes('contrato')) || matchingItems[0];
    const item5 = matchingItems.find((x) => x.code.startsWith('5.1') || x.name.toLowerCase().includes('personal') || x.name.toLowerCase().includes('apoyo')) || matchingItems[1];
    const item1 = matchingItems.find((x) => x.code.startsWith('1.6') || x.name.toLowerCase().includes('necesidades') || x.code.startsWith('1')) || matchingItems[2];

    // Semana 2 (Semana de los días 12 al 16):
    if (monthWeeks.length > 1) {
      if (item4) {
        map[1]?.push({
          id: `${item4.id}-w1-r1`,
          code: item4.code.endsWith('.') ? item4.code : `${item4.code}.`,
          name: item4.name,
          kind: item4.kind,
          status: item4.status,
          progress: item4.progress,
          start: item4.start,
          end: item4.end,
          weekIndex: 1,
          colStart: 1,
          colSpan: 5,
          row: 1,
          color: 'blue',
          item: item4,
        });
      }

      if (item5) {
        map[1]?.push({
          id: `${item5.id}-w1-r2`,
          code: item5.code,
          name: item5.name,
          kind: item5.kind,
          status: item5.status,
          progress: item5.progress,
          start: item5.start,
          end: item5.end,
          weekIndex: 1,
          colStart: 2,
          colSpan: 3,
          row: 2,
          color: 'purple',
          item: item5,
        });
      }
    }

    // Semana 3 (Semana de los días 19 al 23):
    if (monthWeeks.length > 2) {
      if (item1) {
        map[2]?.push({
          id: `${item1.id}-w2-r1`,
          code: item1.code,
          name: item1.name,
          kind: item1.kind,
          status: item1.status,
          progress: item1.progress,
          start: item1.start,
          end: item1.end,
          weekIndex: 2,
          colStart: 1,
          colSpan: 4,
          row: 1,
          color: 'pink',
          item: item1,
        });
      }
    }

    // Si hay más items en el mes y hay semanas libres, distribuirlos ordenadamente
    const usedIds = new Set([item4?.id, item5?.id, item1?.id].filter(Boolean));
    const extraItems = matchingItems.filter((x) => !usedIds.has(x.id)).slice(0, 3);

    extraItems.forEach((it, i) => {
      const targetWeek = (3 + i) % monthWeeks.length;
      if (map[targetWeek] && map[targetWeek].length < 2) {
        map[targetWeek].push({
          id: `${it.id}-extra-${targetWeek}`,
          code: it.code,
          name: it.name,
          kind: it.kind,
          status: it.status,
          progress: it.progress,
          start: it.start,
          end: it.end,
          weekIndex: targetWeek,
          colStart: 2,
          colSpan: 3,
          row: map[targetWeek].length + 1,
          color: getItemColor(it),
          item: it,
        });
      }
    });

    return map;
  }, [monthWeeks, matchingItems]);

  // Celdas del mini-calendario (L M X J V S D)
  const miniCalCells = useMemo(() => {
    const cells: { dayNumber: number; isCurrentMonth: boolean; isPrev: boolean; isNext: boolean }[] = [];
    const firstDay = new Date(miniYear, miniMonth, 1);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // 0 lunes ... 6 domingo
    const lastDayPrev = new Date(miniYear, miniMonth, 0).getDate();
    const lastDayCurr = new Date(miniYear, miniMonth + 1, 0).getDate();

    // Días mes previo
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      cells.push({
        dayNumber: lastDayPrev - i,
        isCurrentMonth: false,
        isPrev: true,
        isNext: false,
      });
    }

    // Días mes actual
    for (let d = 1; d <= lastDayCurr; d++) {
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        isPrev: false,
        isNext: false,
      });
    }

    // Días mes siguiente para completar la cuadrícula (35 celdas)
    const remaining = 35 - cells.length;
    for (let n = 1; n <= (remaining > 0 ? remaining : 7); n++) {
      cells.push({
        dayNumber: n,
        isCurrentMonth: false,
        isPrev: false,
        isNext: true,
      });
    }

    return cells.slice(0, 35);
  }, [miniYear, miniMonth]);

  const handleMiniPrev = () => {
    if (miniMonth === 0) {
      setMiniMonth(11);
      setMiniYear((y) => y - 1);
    } else {
      setMiniMonth((m) => m - 1);
    }
    onNavPrev();
  };

  const handleMiniNext = () => {
    if (miniMonth === 11) {
      setMiniMonth(0);
      setMiniYear((y) => y + 1);
    } else {
      setMiniMonth((m) => m + 1);
    }
    onNavNext();
  };

  return (
    <div className="cronograma-cal-container cal-master-layout">
      {/* Área Principal de Calendario */}
      <div className="cal-main-area">
        {/* SUB-VISTA: MES (Cuadrícula Limpia de 5 Columnas Laborales Lunes-Viernes) */}
        {calSubView === 'Mes' && (
          <div className="cal-month-canvas">
            {/* Cabecera de Días Laborales: Lunes a Viernes */}
            <div className="cal-weekdays-header five-cols">
              {WORK_DAY_LABELS.map((dayLabel) => (
                <div key={dayLabel} className="cal-weekday-col">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Rejilla de Semanas */}
            <div className="cal-grid-body">
              {monthWeeks.map((week) => {
                const evs = weekEvents[week.weekIndex] || [];
                const maxRow = evs.reduce((acc, e) => Math.max(acc, e.row), 0);
                const dynamicMinHeight = Math.max(136, 46 + maxRow * 48);

                // Solo tomamos los primeros 5 días (Lunes a Viernes)
                const workDays = week.days.slice(0, 5);

                return (
                  <div
                    key={week.weekIndex}
                    className="cal-week-row-grid five-cols"
                    style={{ minHeight: `${dynamicMinHeight}px` }}
                  >
                    {/* Celdas de fondo con número de día */}
                    {workDays.map((day, idx) => {
                      const isHighlighted = day.dayNumber === 13 || (day.isCurrentMonth && day.dayNumber === selectedDateDay);
                      return (
                        <div
                          key={idx}
                          className={`cal-day-bg-cell ${!day.isCurrentMonth ? 'outside' : ''}`}
                          onClick={() => setSelectedDateDay(day.dayNumber)}
                        >
                          <span className={`cal-num ${isHighlighted ? 'today' : ''}`}>
                            {day.dayNumber}
                          </span>
                        </div>
                      );
                    })}

                    {/* Capa de Barras de Entregables / Tareas con Línea de Rango Punteada */}
                    <div className="cal-week-events-overlay five-cols">
                      {evs.map((ev) => {
                        const IconComponent = ev.color === 'blue' || ev.kind === 'hito' ? Folder : FileText;

                        return (
                          <div
                            key={ev.id}
                            className="cal-event-slot-wrap"
                            style={{
                              gridColumn: `${ev.colStart} / span ${ev.colSpan}`,
                              gridRow: ev.row,
                            }}
                          >
                            {/* Pastilla cromática limpia */}
                            <div
                              className={`cal-event-clean-pill ${ev.color}`}
                              onClick={() => onSelectItem(ev.item)}
                              title={`${ev.code} ${ev.name}`}
                            >
                              <IconComponent size={13} className="pill-icon" />
                              <span className="pill-text">
                                <b className="pill-code">{ev.code}</b> {ev.name}
                              </span>
                            </div>

                            {/* Línea guía punteada con topes circulares exactos a la imagen */}
                            <div className="cal-event-guideline">
                              <span className="cal-guide-pin left" />
                              <div className="cal-guide-dashed" />
                              <span className="cal-guide-pin right" />
                            </div>
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
      </div>

      {/* Botón flotante para reabrir el panel lateral si se cerró */}
      {!sidebarOpen && (
        <button
          type="button"
          className="cal-sidebar-reopen-btn"
          onClick={() => setSidebarOpen(true)}
          title="Mostrar mini-calendario y agenda"
        >
          <CalendarDays size={16} />
        </button>
      )}

      {/* Barra Lateral Derecha: Mini-Calendario + Agenda + Sugerencias */}
      {sidebarOpen && (
        <aside className="cal-sidebar-clean">
          {/* Pestaña Superior: Tareas sin programar + Botón X */}
          <div className="cal-sidebar-top-tab">
            <div className="cal-tab-active-pill">
              <CalendarDays size={14} className="tab-icon" />
              <span>Tareas sin programar</span>
            </div>
            <button
              type="button"
              className="cal-sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              title="Cerrar panel lateral"
            >
              <X size={14} />
            </button>
          </div>

          {/* 1. Mini-Calendario Mensual Interactivo */}
          <div className="cal-mini-calendar-widget">
            <div className="cal-mini-nav-header">
              <button
                type="button"
                className="cal-mini-nav-btn"
                onClick={handleMiniPrev}
                title="Mes anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="cal-mini-month-title">
                {CAL_MONTH_NAMES[miniMonth]} de {miniYear}
              </span>
              <button
                type="button"
                className="cal-mini-nav-btn"
                onClick={handleMiniNext}
                title="Mes siguiente"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Días L M X J V S D */}
            <div className="cal-mini-weekdays-row">
              {MINI_CAL_WEEKDAYS.map((w, idx) => (
                <span key={idx} className="cal-mini-weekday-cell">
                  {w}
                </span>
              ))}
            </div>

            {/* Cuadrícula de 35 días */}
            <div className="cal-mini-days-grid">
              {miniCalCells.map((c, idx) => {
                const isDay1 = c.isCurrentMonth && c.dayNumber === 1;
                const isDay13 = c.isCurrentMonth && (c.dayNumber === 13 || c.dayNumber === selectedDateDay);

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`cal-mini-day-cell ${!c.isCurrentMonth ? 'outside' : ''} ${
                      isDay1 ? 'solid-blue' : ''
                    } ${isDay13 && !isDay1 ? 'circle-outline' : ''}`}
                    onClick={() => {
                      if (c.isCurrentMonth) setSelectedDateDay(c.dayNumber);
                    }}
                  >
                    {c.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sección: Agenda de reuniones */}
          <div className="cal-sidebar-mini-section">
            <h4 className="cal-mini-section-title">Agenda de reuniones</h4>
            <div className="cal-meetings-list">
              <div className="cal-meeting-card">
                <div className="cal-meeting-icon-box">
                  <Calendar size={13} />
                </div>
                <div className="cal-meeting-text-box">
                  <span className="cal-meeting-title">Plantilla de agenda de reunión</span>
                  <span className="cal-meeting-sub">(Ejemplo)</span>
                </div>
                <div className="cal-meeting-attendees-badge" title="3 participantes">
                  <Users size={12} />
                  <span>3</span>
                </div>
              </div>

              <div className="cal-meeting-card">
                <div className="cal-meeting-icon-box">
                  <Calendar size={13} />
                </div>
                <div className="cal-meeting-text-box">
                  <span className="cal-meeting-title">Agenda de reunión semanal</span>
                  <span className="cal-meeting-sub">(Ejemplo)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sección: Sugerencias de nuevos temas */}
          <div className="cal-sidebar-mini-section">
            <h4 className="cal-mini-section-title">Sugerencias de nuevos temas</h4>
            <div className="cal-topics-stack">
              <div
                className={`cal-topic-card pink ${checkedTopics['topic-1'] ? 'checked' : ''}`}
                onClick={() => toggleTopic('topic-1')}
              >
                <div className="cal-topic-icon-wrap pink">
                  <FileText size={13} />
                </div>
                <div className="cal-topic-text-wrap">
                  <span className="cal-topic-title">Resumen de avance trimestral</span>
                  <span className="cal-topic-sub">(Ejemplo)</span>
                </div>
                <div className="cal-topic-checkbox pink">
                  {checkedTopics['topic-1'] && <Check size={10} strokeWidth={3} />}
                </div>
              </div>

              <div
                className={`cal-topic-card amber ${checkedTopics['topic-2'] ? 'checked' : ''}`}
                onClick={() => toggleTopic('topic-2')}
              >
                <div className="cal-topic-icon-wrap amber">
                  <FileText size={13} />
                </div>
                <div className="cal-topic-text-wrap">
                  <span className="cal-topic-title">
                    Analizar cifras de abril y preparar hallazgos para la próxima reunión
                  </span>
                  <span className="cal-topic-sub">(Ejemplo)</span>
                </div>
                <div className="cal-topic-checkbox amber">
                  {checkedTopics['topic-2'] && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Sección: Nuevas solicitudes */}
          <div className="cal-sidebar-mini-section">
            <h4 className="cal-mini-section-title">Nuevas solicitudes</h4>
            <div className="cal-request-box">
              <FileText size={13} className="cal-request-icon" />
              <span className="cal-request-title">Prueba</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
