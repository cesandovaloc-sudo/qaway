import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Check,
  AlertTriangle,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import './reuniones2Calendar.css';
import { generateGoogleCalendarUrl, downloadIcsFile } from './calendarExport';
import type { Item, Status } from './Reuniones2View';

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
  calSubView: 'Mes' | 'Semana' | 'Día' | 'Agenda';
  onNavPrev: () => void;
  onNavNext: () => void;
  onNavPrevMonth?: () => void;
  onNavNextMonth?: () => void;
  onSelectDate?: (iso: string) => void;
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
  onRescheduleItem?: (itemId: string, targetDateIso: string) => void;
  onNotify?: (msg: string) => void;
}

const WEEK_DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CAL_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const CAL_SHORT_MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
const MINI_WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const GESTOR_COLORS: Record<string, { bg: string; color: string; initials: string }> = {
  'Carlos Sandoval': { bg: '#eff6ff', color: '#1d4ed8', initials: 'CS' },
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
  onNavPrevMonth,
  onNavNextMonth,
  onSelectDate,
  onNavToday,
  onSubViewChange,
  typeFilter = 'Todos',
  tab = 'Todos',
  stateFilter = 'Todos',
  selectedRegions = [],
  regionFilter = 'Todas',
  search = '',
  showBarLabels = true,
  showBaseline = true,
  showBarAvatars = false,
  onRescheduleItem,
  onNotify,
}: CronogramaCalendarioViewProps) {
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('qaway-r2-cal-sidebar-w'));
      if (Number.isFinite(saved) && saved >= 260 && saved <= 560) return saved;
    } catch {}
    return 340;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const startSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;
    setIsResizingSidebar(true);
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(260, Math.min(560, startW + (startX - ev.clientX)));
      setSidebarWidth(next);
    };
    const onUp = (ev: MouseEvent) => {
      const finalW = Math.max(260, Math.min(560, startW + (startX - ev.clientX)));
      setSidebarWidth(finalW);
      try {
        localStorage.setItem('qaway-r2-cal-sidebar-w', String(finalW));
      } catch {}
      setIsResizingSidebar(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const toMinutes = (hhmm?: string, fallbackMin = 540) => {
    if (!hhmm || !hhmm.includes(':')) return fallbackMin;
    const [h, m] = hhmm.split(':').map(Number);
    return (Number.isFinite(h) ? h : 9) * 60 + (Number.isFinite(m) ? m : 0);
  };

  // Detector de cruce real: si son reuniones con horario, solo cruza si coinciden fecha y hora
  const findItemConflict = (target: Item, pool: Item[]): Item | undefined => {
    const startA = (target.start || '').slice(0, 10);
    const endA = (target.end || target.start || '').slice(0, 10);
    if (!startA) return undefined;
    const tA = (target as any).meetingTime as string | undefined;
    const tEndA = (target as any).meetingEndTime as string | undefined;
    return pool.find((other) => {
      if (other.id === target.id) return false;
      const startB = (other.start || '').slice(0, 10);
      const endB = (other.end || other.start || '').slice(0, 10);
      if (!startB) return false;
      if (!(startA <= endB && startB <= endA)) return false;

      const tB = (other as any).meetingTime as string | undefined;
      const tEndB = (other as any).meetingEndTime as string | undefined;
      if (tA && tB) {
        const sA = toMinutes(tA, 540);
        const eA = toMinutes(tEndA, sA + 60);
        const sB = toMinutes(tB, 540);
        const eB = toMinutes(tEndB, sB + 60);
        if (!(sA < eB && sB < eA)) return false;
      }

      const sameOwner = target.gestor && other.gestor && target.gestor !== 'Sin asignar' && target.gestor === other.gestor;
      const sameRegion = target.region && other.region && target.region === other.region;
      return Boolean(sameOwner || sameRegion);
    });
  };

  const activeDateIso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(calDay).padStart(2, '0')}`;

  const activeWeekDays = useMemo(() => {
    const ref = new Date(calYear, calMonth, calDay);
    const dow = (ref.getDay() + 6) % 7;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        date: d,
        iso,
        dayNumber: d.getDate(),
        label: WEEK_DAY_LABELS[i]?.slice(0, 3) || '',
        isToday: iso === activeDateIso,
      };
    });
  }, [calYear, calMonth, calDay, activeDateIso]);

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
        startDateIso: days[0]?.iso ?? '',
        endDateIso: days[6]?.iso ?? '',
      });
      weekIdx++;
      if (weekIdx >= 6) break;
    }
    return weeks;
  }, [calYear, calMonth]);

  // Filtrado de items reales que aplican a los filtros globales (Vista Proyecto: Hitos y Entregables del Proyecto, excluyendo sedes/UGEL)
  const matchingItems = useMemo(() => {
    return items.filter((it) => {
      // Excluir registros desglosados a nivel UGEL o sede (código con 3 niveles numéricos '1.6.1' o nombre que comience con 'UGEL')
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

  // Proyección de entregables en el calendario mensual como bloques discretos de calendario (2 a 4 días por hito de corte, sin repetir barras de 138 días en todas las semanas)
  const weekEvents = useMemo(() => {
    const map: Record<number, DynamicCalendarEvent[]> = {};
    monthWeeks.forEach((w) => {
      map[w.weekIndex] = [];
    });
    if (monthWeeks.length === 0) return map;

    const monthStartIso = monthWeeks[0]?.startDateIso ?? '';
    const monthEndIso = monthWeeks[monthWeeks.length - 1]?.endDateIso ?? '';

    // 1. Priorizar paquetes cuya fecha de entrega (end) o inicio (start) cae dentro de las semanas visibles del mes
    const inMonthCutoffs = matchingItems.filter(
      (it) =>
        (it.end >= monthStartIso && it.end <= monthEndIso) ||
        (it.start >= monthStartIso && it.start <= monthEndIso)
    );

    // 2. Si hay pocos cortes puntuales en este mes, completar con los paquetes activos en el mes (sin repetir el mismo paquete en múltiples semanas)
    const activeFallback = matchingItems.filter(
      (it) =>
        it.start <= monthEndIso &&
        it.end >= monthStartIso &&
        !inMonthCutoffs.some((c) => c.id === it.id)
    );

    const candidates = [...inMonthCutoffs, ...activeFallback].slice(0, 9);

    // Plantillas de ventanas limpias estilo Calendario (colStart 1..7, colSpan 2..4, row 1..2) por semana
    const weekSlots: Record<number, { colStart: number; colSpan: number; row: number }[]> = {
      0: [
        { colStart: 4, colSpan: 3, row: 1 },
        { colStart: 1, colSpan: 3, row: 2 },
      ],
      1: [
        { colStart: 2, colSpan: 2, row: 1 },
        { colStart: 5, colSpan: 2, row: 1 },
        { colStart: 1, colSpan: 5, row: 2 },
      ],
      2: [
        { colStart: 3, colSpan: 3, row: 1 },
        { colStart: 5, colSpan: 3, row: 2 },
      ],
      3: [
        { colStart: 3, colSpan: 3, row: 1 },
        { colStart: 6, colSpan: 2, row: 2 },
      ],
      4: [
        { colStart: 2, colSpan: 2, row: 1 },
        { colStart: 5, colSpan: 2, row: 1 },
        { colStart: 6, colSpan: 2, row: 2 },
      ],
      5: [
        { colStart: 2, colSpan: 3, row: 1 },
      ],
    };

    const weekCursor: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    candidates.forEach((it, idx) => {
      // Determinar en qué semana cae su fecha de corte (end) o inicio (start)
      let targetWeekIdx = monthWeeks.findIndex(
        (w) => it.end >= w.startDateIso && it.end <= w.endDateIso
      );
      if (targetWeekIdx === -1) {
        targetWeekIdx = monthWeeks.findIndex(
          (w) => it.start >= w.startDateIso && it.start <= w.endDateIso
        );
      }
      if (targetWeekIdx === -1) {
        targetWeekIdx = idx % monthWeeks.length;
      }

      // Si la semana elegida ya llenó sus slots, buscar la siguiente semana con espacio libre
      let finalWeekIdx = targetWeekIdx;
      for (let step = 0; step < monthWeeks.length; step++) {
        const tryIdx = (targetWeekIdx + step) % monthWeeks.length;
        const slots = weekSlots[tryIdx] || weekSlots[0] || [];
        if ((weekCursor[tryIdx] || 0) < slots.length) {
          finalWeekIdx = tryIdx;
          break;
        }
      }

      const slots = weekSlots[finalWeekIdx] || weekSlots[0] || [];
      const slotIdx = weekCursor[finalWeekIdx] || 0;
      if (slotIdx >= slots.length) return;
      weekCursor[finalWeekIdx] = slotIdx + 1;

      const slot = slots[slotIdx];
      const weekEventsList = map[finalWeekIdx];
      if (!slot || !weekEventsList) return;
      let colStart = slot.colStart;
      let colSpan = slot.colSpan;
      let targetRow = slot.row;

      // Si la fecha de fin del paquete cae exactamente en esta semana, anclar la barra a su día real con máximo 3-4 días de ancho
      const weekObj = monthWeeks[finalWeekIdx];
      if (weekObj && it.end >= weekObj.startDateIso && it.end <= weekObj.endDateIso) {
        const endDayIdx = Math.max(
          0,
          Math.min(
            6,
            Math.round(
              (new Date(it.end + 'T12:00:00').getTime() -
                new Date(weekObj.startDateIso + 'T12:00:00').getTime()) /
                86400000
            )
          )
        );
        const span = Math.min(3, endDayIdx + 1);
        const computedStart = Math.max(1, endDayIdx + 2 - span);
        const existingInRow = weekEventsList.filter((e) => e.row === targetRow);
        const collides = existingInRow.some(
          (e) => !(computedStart + span - 1 < e.colStart || computedStart > e.colStart + e.colSpan - 1)
        );
        if (!collides && span >= 2) {
          colStart = computedStart;
          colSpan = span;
        }
      }

      // Garantizar cero colisión horizontal en la fila asignada (si el slot por defecto choca con una barra previa movida, bajar a la siguiente fila libre)
      while (
        weekEventsList
          .filter((e) => e.row === targetRow)
          .some((e) => !(colStart + colSpan - 1 < e.colStart || colStart > e.colStart + e.colSpan - 1))
      ) {
        targetRow += 1;
      }

      weekEventsList.push({
        id: `${it.id}-w${finalWeekIdx}`,
        code: it.code,
        name: it.name,
        kind: it.kind,
        status: it.status,
        progress: it.progress,
        start: it.start,
        end: it.end,
        weekIndex: finalWeekIdx,
        colStart,
        colSpan,
        row: targetRow,
        gestor: it.gestor || 'Carlos Sandoval',
        region: it.region || 'Junín',
        item: it,
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
        gestor: it.gestor || 'Carlos Sandoval',
        avatarBg: badge.bg,
        avatarColor: badge.color,
        initials: badge.initials,
        rawItem: it,
      };
    });
  }, [matchingItems, calYear, calMonth]);

  // Mini-calendario: celdas del mes visible (Lunes a Domingo), sincronizadas con calYear/calMonth
  const miniCalCells = useMemo(() => {
    const cells: { iso: string; dayNumber: number; isCurrentMonth: boolean }[] = [];
    const first = new Date(calYear, calMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const cursor = new Date(calYear, calMonth, 1 - offset);
    const totalCells = Math.ceil((offset + new Date(calYear, calMonth + 1, 0).getDate()) / 7) * 7;
    for (let i = 0; i < totalCells; i++) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      cells.push({ iso, dayNumber: cursor.getDate(), isCurrentMonth: cursor.getMonth() === calMonth });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [calYear, calMonth]);

  // Días con entregables reales (fecha de fin) para marcarlos en el mini-calendario
  const deliverableDays = useMemo(() => new Set(matchingItems.map((it) => it.end)), [matchingItems]);

  const todayIso = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

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
                  {/* Celdas de fondo con número de día (Soporta Drag & Drop y clic para ver Agenda del Día) */}
                  {week.days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`cal-day-bg-cell ${!day.isCurrentMonth ? 'outside' : ''} ${
                        dragOverDate === day.iso ? 'r2-drag-over' : ''
                      }`}
                      onDragOver={(e) => {
                        if (!onRescheduleItem) return;
                        e.preventDefault();
                        if (dragOverDate !== day.iso) setDragOverDate(day.iso);
                      }}
                      onDragLeave={() => {
                        if (dragOverDate === day.iso) setDragOverDate(null);
                      }}
                      onDrop={(e) => {
                        if (!onRescheduleItem) return;
                        e.preventDefault();
                        setDragOverDate(null);
                        const itemId = e.dataTransfer.getData('text/plain');
                        if (itemId) onRescheduleItem(itemId, day.iso);
                      }}
                    >
                      <span
                        className="cal-num r2-clickable-num"
                        onClick={() => setDayModalDate(day.iso)}
                        title={`Ver agenda del ${formatDatePE(day.iso)}`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                  ))}

                  {/* Capa de Barras de Calendario con colores oficiales Gantt, Drag & Drop y detección de cruces */}
                  <div className="cal-week-events-overlay">
                    {evs.map((ev) => {
                      const isMajor = ev.kind === 'hito';
                      const isComplete = ev.status === 'Completado' || ev.status === 'Cumple';
                      const isProgress = ev.status === 'En proceso' || ev.status === 'En curso';
                      const isLate = ev.status === 'Con retraso';
                      const conflict = findItemConflict(ev.item, matchingItems);

                      const barColorClass = isMajor
                        ? 'bar-major'
                        : isComplete
                        ? 'bar-complete'
                        : isProgress
                        ? 'bar-progress'
                        : isLate
                        ? 'bar-late'
                        : 'bar-pending';

                      const bStart = ev.item.baselineStart || ev.start;
                      const bEnd = ev.item.baselineEnd || ev.end;

                      return (
                        <div
                          key={ev.id}
                          className="cal-event-slot-wrap"
                          style={{
                            gridColumn: `${ev.colStart} / span ${ev.colSpan}`,
                            gridRow: ev.row,
                          }}
                        >
                          <div
                            draggable={Boolean(onRescheduleItem)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', ev.item.id);
                            }}
                            className={`cal-gantt-bar ${barColorClass}`}
                            style={
                              (ev.item as any).hitoColor
                                ? {
                                    borderLeft: `3.5px solid ${(ev.item as any).hitoColor}`,
                                    borderColor: `${(ev.item as any).hitoColor}44`,
                                    background: `${(ev.item as any).hitoColor}18`,
                                    color: '#0f172a',
                                  }
                                : undefined
                            }
                            onClick={() => onSelectItem(ev.item)}
                            title={
                              conflict
                                ? `⚠️ Cruce de agenda con: ${conflict.code} · ${conflict.name} (${conflict.gestor}) | Arrastra para reprogramar`
                                : `${(ev.item as any).meetingTime ? `${(ev.item as any).meetingTime} · ` : ''}${ev.name}${(ev.item as any).hitoLabel ? ` (${(ev.item as any).hitoLabel})` : ''}`
                            }
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
                                <span className="cal-gantt-diamond-badge" title="Hito Principal">
                                  <span className="cal-diamond-shape" />
                                </span>
                              ) : isComplete ? (
                                <Check size={11} strokeWidth={3} className="cal-gantt-check-icon" />
                              ) : (
                                <FileText size={11} className="cal-gantt-check-icon" />
                              )}
                              <strong className="cal-gantt-code">{ev.code}</strong>
                              <span className="cal-gantt-name">{ev.name}</span>
                              {conflict && (
                                <span
                                  className="r2-conflict-pill"
                                  title={`Cruce de agenda con ${conflict.code} (${conflict.gestor})`}
                                >
                                  <AlertTriangle size={9} /> Cruce
                                </span>
                              )}
                              {showBarAvatars && (
                                <span
                                  className="cal-gantt-pct"
                                  style={{
                                    background: getGestorBadge(ev.gestor).bg,
                                    color: getGestorBadge(ev.gestor).color,
                                    borderRadius: '999px',
                                    padding: '1px 5px',
                                    fontSize: '9.5px',
                                    fontWeight: 800,
                                  }}
                                  title={`Responsable: ${ev.gestor}`}
                                >
                                  {getGestorBadge(ev.gestor).initials}
                                </span>
                              )}
                              {showBarLabels && (
                                <span className="cal-gantt-pct">{ev.progress}%</span>
                              )}
                            </div>
                          </div>
                          {/* Sombra de Línea Base idéntica a la vista Gantt */}
                          {showBaseline && (
                            <div
                              className="cal-baseline-shadow-bar"
                              title={`Línea base aprobada: ${formatDatePE(bStart)} – ${formatDatePE(bEnd)}`}
                            />
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

        {/* 2. SUB-VISTA: SEMANA (TimeGrid Semanal Real Lunes–Domingo) */}
        {calSubView === 'Semana' && (
          <div className="r2-week-wrap">
            <div className="r2-week-header">
              <div className="r2-week-head-time">HORA</div>
              {activeWeekDays.map((d) => (
                <div
                  key={d.iso}
                  className={`r2-week-head-day ${d.isToday ? 'is-today' : ''}`}
                  onClick={() => setDayModalDate(d.iso)}
                  title={`Ver agenda del ${formatDatePE(d.iso)}`}
                >
                  <span>{d.label}</span>
                  <b>{d.dayNumber}</b>
                </div>
              ))}
            </div>

            <div className="r2-week-body">
              <div className="r2-week-grid">
                <div className="r2-time-col">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                    <div key={h} className="r2-time-slot-label">
                      {h}
                    </div>
                  ))}
                </div>

                {activeWeekDays.map((col) => {
                  const dayItems = matchingItems.filter((it) => {
                    const s = (it.start || '').slice(0, 10);
                    const e = (it.end || it.start || '').slice(0, 10);
                    return s && s <= col.iso && col.iso <= e;
                  });

                  return (
                    <div
                      key={col.iso}
                      className={`r2-week-day-col ${dragOverDate === col.iso ? 'r2-drag-over' : ''}`}
                      onDragOver={(e) => {
                        if (!onRescheduleItem) return;
                        e.preventDefault();
                        if (dragOverDate !== col.iso) setDragOverDate(col.iso);
                      }}
                      onDragLeave={() => {
                        if (dragOverDate === col.iso) setDragOverDate(null);
                      }}
                      onDrop={(e) => {
                        if (!onRescheduleItem) return;
                        e.preventDefault();
                        setDragOverDate(null);
                        const itemId = e.dataTransfer.getData('text/plain');
                        if (itemId) onRescheduleItem(itemId, col.iso);
                      }}
                    >
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                        <div key={h} className="r2-week-hour-cell" />
                      ))}

                      <div className="r2-week-events-stack">
                        {dayItems.map((it) => {
                          const isMajor = it.kind === 'hito';
                          const isComplete = it.status === 'Completado' || it.status === 'Cumple';
                          const conflict = findItemConflict(it, matchingItems);
                          const mTime = (it as any).meetingTime as string | undefined;
                          const mEndTime = (it as any).meetingEndTime as string | undefined;
                          const hitoColor = (it as any).hitoColor as string | undefined;
                          const hitoLabel = (it as any).hitoLabel as string | undefined;
                          const startMin = toMinutes(mTime, 540);
                          const endMin = toMinutes(mEndTime, startMin + 60);
                          const topPx = Math.max(0, ((startMin - 480) / 60) * 54) + 2;
                          const heightPx = Math.max(42, ((endMin - startMin) / 60) * 54 - 4);

                          return (
                            <div
                              key={it.id}
                              draggable={Boolean(onRescheduleItem)}
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', it.id)}
                              className={`r2-week-event-card ${
                                isMajor ? 'is-hito' : isComplete ? 'is-complete' : ''
                              }`}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                ...(hitoColor
                                  ? {
                                      borderLeftColor: hitoColor,
                                      borderColor: `${hitoColor}33`,
                                      background: `${hitoColor}14`,
                                      color: '#0f172a',
                                    }
                                  : {}),
                              }}
                              onClick={() => onSelectItem(it)}
                              title={`${it.code} · ${it.name}${mTime ? ` (${mTime}–${mEndTime || ''})` : ''} · ${hitoLabel || it.gestor || 'Sin asignar'}`}
                            >
                              <strong>{mTime ? `${mTime} ` : ''}{it.name}</strong>
                              <div className="r2-week-event-meta">
                                <span>{hitoLabel || `${it.region || 'General'}`}</span>
                                {conflict && (
                                  <span className="r2-conflict-pill" title={`Cruce con ${conflict.code}`}>
                                    <AlertTriangle size={9} /> Cruce
                                  </span>
                                )}
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
          </div>
        )}

        {/* 3. SUB-VISTA: DÍA (Timeline Real de la Fecha Seleccionada) */}
        {calSubView === 'Día' && (() => {
          const dayItems = matchingItems.filter((it) => {
            const s = (it.start || '').slice(0, 10);
            const e = (it.end || it.start || '').slice(0, 10);
            return s && s <= activeDateIso && activeDateIso <= e;
          });

          return (
            <div className="r2-day-wrap">
              <div className="r2-day-header">
                <div>
                  <h3>
                    {WEEK_DAY_LABELS[(new Date(calYear, calMonth, calDay).getDay() + 6) % 7]} {calDay} de {CAL_MONTH_NAMES[calMonth]}, {calYear}
                  </h3>
                  <p>{dayItems.length} reuniones / entregables activos en esta jornada</p>
                </div>
                <span className="cal-dia-tag">Agenda de la Jornada</span>
              </div>

              {dayItems.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No hay reuniones ni actividades programadas para el {formatDatePE(activeDateIso)}.
                </div>
              ) : (
                <div className="r2-day-list">
                  {dayItems.map((it) => {
                    const conflict = findItemConflict(it, matchingItems);
                    return (
                      <div
                        key={it.id}
                        className={`r2-day-card ${conflict ? 'has-conflict' : ''}`}
                        onClick={() => onSelectItem(it)}
                      >
                        <div className="r2-day-card-top">
                          <div className="r2-day-card-title">
                            <span className="cal-gantt-code">{it.code}</span>
                            <strong>{it.name}</strong>
                          </div>
                          <div className="r2-day-card-right" onClick={(e) => e.stopPropagation()}>
                            {conflict && (
                              <span
                                className="r2-conflict-pill"
                                title={`Se cruza con ${conflict.code} · ${conflict.name}`}
                              >
                                <AlertTriangle size={10} /> Cruce {conflict.code}
                              </span>
                            )}
                            <span className="cal-dia-tag">{it.status} · {it.progress}%</span>
                            <button
                              type="button"
                              className="r2-export-btn is-icon"
                              title="Agregar a Google Calendar"
                              onClick={() => {
                                const url = generateGoogleCalendarUrl({
                                  id: it.id,
                                  title: `${it.code} · ${it.name}`,
                                  description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status} (${it.progress}%)`,
                                  location: it.region || 'Qaway Lab',
                                  startDate: it.start,
                                  endDate: it.end || it.start,
                                });
                                window.open(url, '_blank', 'noopener,noreferrer');
                                onNotify?.('Abriendo Google Calendar...');
                              }}
                            >
                              <CalendarPlus size={13} />
                            </button>
                            <button
                              type="button"
                              className="r2-export-btn is-icon"
                              title="Descargar archivo .ics"
                              onClick={() => {
                                downloadIcsFile({
                                  id: it.id,
                                  title: `${it.code} · ${it.name}`,
                                  description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status} (${it.progress}%)`,
                                  location: it.region || 'Qaway Lab',
                                  startDate: it.start,
                                  endDate: it.end || it.start,
                                });
                                onNotify?.('Archivo .ics descargado');
                              }}
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="r2-day-card-meta">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {formatDatePE(it.start)} – {formatDatePE(it.end || it.start)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={11} /> {it.gestor || 'Sin asignar'}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {it.region || 'Nacional'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Divisor vertical arrastrable para agrandar o achicar el panel derecho */}
      <div
        className={`r2-sidebar-resizer ${isResizingSidebar ? 'is-resizing' : ''}`}
        onMouseDown={startSidebarResize}
        title="Arrastra para agrandar o disminuir el panel derecho"
      />

      {/* Barra Lateral Derecha Institucional: Mini-calendario, Próximas Reuniones y Leyenda */}
      <aside className="cal-sidebar-clean" style={{ width: `${sidebarWidth}px` }}>
        {/* Sección: Mini-calendario mensual sincronizado con el lienzo principal */}
        <div className="cal-sidebar-section cal-minical">
          <div className="cal-minical-head">
            <button type="button" className="cal-minical-nav" onClick={onNavPrevMonth || onNavPrev} title="Mes anterior">
              <ChevronLeft size={14} />
            </button>
            <span className="cal-minical-title">
              {CAL_MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button type="button" className="cal-minical-nav" onClick={onNavNextMonth || onNavNext} title="Mes siguiente">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="cal-minical-grid">
            {MINI_WEEKDAYS.map((w) => (
              <span key={w} className="cal-minical-wd">{w}</span>
            ))}
            {miniCalCells.map((c) => (
              <span
                key={c.iso}
                onClick={() => onSelectDate?.(c.iso)}
                style={{ cursor: onSelectDate ? 'pointer' : undefined, outline: c.iso === activeDateIso ? '1.5px solid #2563eb' : undefined, borderRadius: '6px' }}
                className={`cal-minical-day${c.isCurrentMonth ? '' : ' outside'}${c.iso === todayIso ? ' today' : ''}${deliverableDays.has(c.iso) ? ' has-event' : ''}`}
                title={deliverableDays.has(c.iso) ? 'Entregable programado · Clic para ver día' : 'Clic para ver día'}
              >
                {c.dayNumber}
              </span>
            ))}
          </div>
        </div>

        {/* Sección: Próximos Entregables Dinámicos */}
        <div className="cal-sidebar-section">
          <div className="cal-sidebar-head">
            <h3 className="cal-sidebar-title">Próximas reuniones</h3>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {upcomingDeliverables.length} agendadas
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

        {/* Sección: Leyenda Oficial (Colores Gantt + Línea Base, sin Hitos) */}
        <div className="cal-sidebar-section cal-legend-section">
          <h3 className="cal-sidebar-title">Leyenda</h3>
          <div className="cal-clean-legend-grid">
            <div className="cal-legend-row" title="Paquete de trabajo en ejecución activa">
              <span className="cal-legend-box box-progress" />
              <span>En proceso</span>
            </div>
            <div className="cal-legend-row" title="Paquete de trabajo completado al 100%">
              <span className="cal-legend-box box-complete" />
              <span>Completado</span>
            </div>
            <div className="cal-legend-row" title="Paquete de trabajo con retraso respecto a línea base">
              <span className="cal-legend-box box-late" style={{ background: '#ef4444' }} />
              <span>Con retraso</span>
            </div>
            <div className="cal-legend-row" title="Paquete de trabajo pendiente de inicio">
              <span className="cal-legend-box box-pending" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Agenda del Día al hacer clic en cualquier fecha */}
      {dayModalDate && (() => {
        const modalItems = matchingItems.filter((it) => {
          const s = (it.start || '').slice(0, 10);
          const e = (it.end || it.start || '').slice(0, 10);
          return s && s <= dayModalDate && dayModalDate <= e;
        });

        return (
          <div className="r2-modal-overlay" onMouseDown={() => setDayModalDate(null)}>
            <div className="r2-day-modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="r2-day-modal-head">
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
                    AGENDA DEL DÍA
                  </span>
                  <h3>{formatDatePE(dayModalDate)}</h3>
                </div>
                <button
                  type="button"
                  className="cal-minical-nav"
                  onClick={() => setDayModalDate(null)}
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="r2-day-modal-body">
                {modalItems.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                    No hay reuniones o actividades activas para el {formatDatePE(dayModalDate)}.
                  </div>
                ) : (
                  modalItems.map((it) => {
                    const conflict = findItemConflict(it, matchingItems);
                    return (
                      <div
                        key={it.id}
                        className={`r2-day-card ${conflict ? 'has-conflict' : ''}`}
                        onClick={() => {
                          setDayModalDate(null);
                          onSelectItem(it);
                        }}
                      >
                        <div className="r2-day-card-top">
                          <div className="r2-day-card-title">
                            <span className="cal-gantt-code">{it.code}</span>
                            <strong>{it.name}</strong>
                          </div>
                          {conflict && (
                            <span className="r2-conflict-pill" title={`Cruce con ${conflict.code}`}>
                              <AlertTriangle size={10} /> Cruce
                            </span>
                          )}
                        </div>
                        <div className="r2-day-card-meta">
                          <span><Clock size={12} /> {formatDatePE(it.start)} – {formatDatePE(it.end || it.start)}</span>
                          <span><Users size={12} /> {it.gestor || 'Sin asignar'}</span>
                          <span><MapPin size={12} /> {it.region || 'Nacional'}</span>
                        </div>
                        <div className="r2-day-card-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="r2-export-btn"
                            onClick={() => {
                              const url = generateGoogleCalendarUrl({
                                id: it.id,
                                title: `${it.code} · ${it.name}`,
                                description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status} (${it.progress}%)`,
                                location: it.region || 'Qaway Lab',
                                startDate: it.start,
                                endDate: it.end || it.start,
                              });
                              window.open(url, '_blank', 'noopener,noreferrer');
                              onNotify?.('Abriendo Google Calendar...');
                            }}
                          >
                            <CalendarPlus size={13} /> Google Calendar
                          </button>
                          <button
                            type="button"
                            className="r2-export-btn"
                            onClick={() => {
                              downloadIcsFile({
                                id: it.id,
                                title: `${it.code} · ${it.name}`,
                                description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status} (${it.progress}%)`,
                                location: it.region || 'Qaway Lab',
                                startDate: it.start,
                                endDate: it.end || it.start,
                              });
                              onNotify?.('Archivo .ics descargado');
                            }}
                          >
                            <Download size={13} /> Descargar .ics
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
