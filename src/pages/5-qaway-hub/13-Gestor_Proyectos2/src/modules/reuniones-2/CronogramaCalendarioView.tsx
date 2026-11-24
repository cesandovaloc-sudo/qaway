import React, { useEffect, useMemo, useState } from 'react';
import {
  EVENTO_PARAMS_CRONOGRAMA,
  getParametrosCronograma,
  isDowLaboral,
} from '../../services/gpCronogramaConfigService';
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
  Plus,
  Users,
  Video,
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
  onCreateMeeting?: (draft: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    modality: 'Google Meet' | 'Presencial';
    meetUrl: string;
    region: string;
    owner: string;
    purpose: string;
    hitoLabel: string;
    hitoColor: string;
  }) => void;
}

const HITO_OPTIONS = [
  { hitoLabel: '1. Planificación de la Distribución', hitoColor: '#2563EB' },
  { hitoLabel: '2. Gestión de Almacenes', hitoColor: '#0D9488' },
  { hitoLabel: '3. Recepción DRE / UGEL', hitoColor: '#D97706' },
  { hitoLabel: '4. Gestión de Contratos', hitoColor: '#7C3AED' },
  { hitoLabel: '5. Registro de Personal', hitoColor: '#E11D48' },
  { hitoLabel: '6. Distribución Primaria', hitoColor: '#0284C7' },
  { hitoLabel: '7. Distribución Secundaria', hitoColor: '#EA580C' },
  { hitoLabel: '8. Monitoreo en Campo', hitoColor: '#4F46E5' },
  { hitoLabel: '9. Entrega a Beneficiarios', hitoColor: '#059669' },
];

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
  onCreateMeeting,
}: CronogramaCalendarioViewProps) {
  const [cronoParams, setCronoParams] = useState(() => getParametrosCronograma());

  useEffect(() => {
    const onParams = () => setCronoParams(getParametrosCronograma());
    window.addEventListener(EVENTO_PARAMS_CRONOGRAMA, onParams);
    return () => window.removeEventListener(EVENTO_PARAMS_CRONOGRAMA, onParams);
  }, []);

  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [dayModalTab, setDayModalTab] = useState<'agenda' | 'crear'>('agenda');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [quickForm, setQuickForm] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    modality: 'Google Meet' as 'Google Meet' | 'Presencial',
    meetUrl: '',
    region: 'Junín',
    owner: 'Carlos Sandoval',
    purpose: '',
    hitoIdx: 0,
  });

  const openDayModal = (iso: string) => {
    const dayHasItems = items.some((it) => {
      const s = (it.start || '').slice(0, 10);
      const e = (it.end || it.start || '').slice(0, 10);
      return s && s <= iso && iso <= e;
    });
    setDayModalDate(iso);
    setDayModalTab(dayHasItems ? 'agenda' : 'crear');
    setShowMoreOptions(false);
    setQuickForm({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      modality: 'Google Meet',
      meetUrl: '',
      region: 'Junín',
      owner: 'Carlos Sandoval',
      purpose: '',
      hitoIdx: 0,
    });
  };
  const [showWeekends, setShowWeekends] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qaway-reuniones2-show-weekends') === 'true';
    } catch {
      return false; // L-V por defecto
    }
  });
  const setWorkweekMode = (includeWeekends: boolean) => {
    setShowWeekends(includeWeekends);
    try {
      localStorage.setItem('qaway-reuniones2-show-weekends', String(includeWeekends));
    } catch {}
  };

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

    // Filtrar reuniones cuya fecha cae dentro de las semanas visibles del mes
    const inMonthMeetings = matchingItems
      .filter((it) => {
        const dateIso = it.start || it.end;
        return dateIso >= monthStartIso && dateIso <= monthEndIso;
      })
      .sort((a, b) => {
        const dA = a.start || a.end;
        const dB = b.start || b.end;
        if (dA !== dB) return dA.localeCompare(dB);
        return ((a as any).meetingTime || '09:00').localeCompare((b as any).meetingTime || '09:00');
      });

    inMonthMeetings.forEach((it) => {
      const dateIso = it.start || it.end;
      const weekIdx = monthWeeks.findIndex(
        (w) => dateIso >= w.startDateIso && dateIso <= w.endDateIso
      );
      if (weekIdx === -1) return;

      const weekObj = monthWeeks[weekIdx];
      const dayIdx = weekObj.days.findIndex((d) => d.iso === dateIso);
      if (dayIdx === -1) return;

      const colStart = dayIdx + 1;
      const colSpan = 1; // Las reuniones son puntuales: nunca cruzan días
      const weekEventsList = map[weekIdx];
      if (!weekEventsList) return;

      let targetRow = 1;
      while (
        weekEventsList
          .filter((e) => e.row === targetRow)
          .some((e) => e.colStart === colStart)
      ) {
        targetRow += 1;
      }

      weekEventsList.push({
        id: `${it.id}-w${weekIdx}`,
        code: it.code,
        name: it.name,
        kind: it.kind,
        status: it.status,
        progress: it.progress,
        start: dateIso,
        end: dateIso,
        weekIndex: weekIdx,
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
        {/* Cabecera Dinámica Limpia: Icono + Mes y Año Real + Toggle L-V / L-D */}
        <div className="cal-title-header-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <CalendarDays size={18} color="#0066ff" />
            <h2 className="cal-clean-title" style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#0f172a' }}>
              {CAL_MONTH_NAMES[calMonth]} {calYear}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="r2-workweek-toggle" role="group" aria-label="Días visibles">
              <button
                type="button"
                className={`r2-workweek-btn ${!showWeekends ? 'active' : ''}`}
                onClick={() => setWorkweekMode(false)}
                title="Mostrar solo días hábiles (Lunes a Viernes)"
              >
                L–V
              </button>
              <button
                type="button"
                className={`r2-workweek-btn ${showWeekends ? 'active' : ''}`}
                onClick={() => setWorkweekMode(true)}
                title="Mostrar semana completa (Lunes a Domingo)"
              >
                L–D
              </button>
            </div>
            <span className="cal-total-count-badge">
              {totalMonthActivities} {totalMonthActivities === 1 ? 'actividad programada' : 'actividades programadas'}
            </span>
          </div>
        </div>

        {/* 1. SUB-VISTA: MES (Cuadrícula Dinámica con Selección de Día y Tarjetas Sólidas) */}
        {calSubView === 'Mes' && (() => {
          const columnasVisibles = WEEK_DAY_LABELS.map((dayLabel, idx) => {
            const dow = (idx + 1) % 7;
            const laboral = isDowLaboral(dow, cronoParams.semanaLaboral, cronoParams.diasLaboralesCustom);
            return { dayLabel, idx, dow, laboral };
          }).filter((c) => (showWeekends ? true : c.laboral));
          const colCount = Math.max(1, columnasVisibles.length);
          const colsStyle = { gridTemplateColumns: `repeat(${colCount}, 1fr)` };

          return (
          <div className="cal-month-canvas">
            {/* Cabecera de Días de la Semana */}
            <div className="cal-weekdays-header" style={colsStyle}>
              {columnasVisibles.map((col) => (
                <div
                  key={col.dayLabel}
                  className="cal-weekday-col"
                  style={col.laboral ? undefined : { color: '#94a3b8', background: '#f1f5f9' }}
                  title={col.laboral ? undefined : 'Día no laboral (Parámetros del Cronograma)'}
                >
                  {col.dayLabel}
                </div>
              ))}
            </div>

            {/* Rejilla de Semanas calculadas dinámicamente */}
            <div className="cal-grid-body">
              {monthWeeks.map((week) => {
                const rawEvs = weekEvents[week.weekIndex] || [];
                const visibleIdxSet = new Set(columnasVisibles.map((c) => c.idx + 1));
                const evs = showWeekends ? rawEvs : rawEvs.filter((e) => visibleIdxSet.has(e.colStart));
                const visibleDays = columnasVisibles.map((c) => ({ day: week.days[c.idx], laboral: c.laboral }));
                const maxRow = evs.reduce((acc, e) => Math.max(acc, e.row), 0);
                const dynamicMinHeight = Math.max(126, 42 + maxRow * 32);

                return (
                <div
                  key={week.weekIndex}
                  className="cal-week-row-grid"
                  style={{ ...colsStyle, minHeight: `${dynamicMinHeight}px` }}
                >
                  {/* Celdas de fondo clicables con selección de día y Drag & Drop */}
                  {visibleDays.map(({ day, laboral }, idx) => (
                    <div
                      key={idx}
                      className={`cal-day-bg-cell r2-day-cell ${!day.isCurrentMonth ? 'outside' : ''} ${
                        day.iso === activeDateIso ? 'is-selected' : ''
                      } ${dragOverDate === day.iso ? 'r2-drag-over' : ''}`}
                      style={laboral ? undefined : { background: '#f1f5f9' }}
                      onClick={() => {
                        onSelectDate?.(day.iso);
                        openDayModal(day.iso);
                      }}
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
                      title={`Clic para ver/seleccionar el ${formatDatePE(day.iso)}`}
                    >
                      <span className="cal-num r2-clickable-num">
                        {day.dayNumber}
                      </span>
                    </div>
                  ))}

                  {/* Capa de Tarjetas Sólidas por Color de Componente (sin % ni sombras) */}
                  <div className="cal-week-events-overlay" style={colsStyle}>
                    {evs.map((ev) => {
                      const isMajor = ev.kind === 'hito';
                      const isComplete = ev.status === 'Completado' || ev.status === 'Cumple';
                      const conflict = findItemConflict(ev.item, matchingItems);
                      const solidColor = (ev.item as any).hitoColor || '#2563eb';
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
                            className="cal-gantt-bar r2-solid-bar"
                            style={{
                              background: solidColor,
                              color: '#ffffff',
                              boxShadow: 'none',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(ev.item);
                            }}
                            title={
                              conflict
                                ? `⚠️ Cruce de agenda con: ${conflict.code} · ${conflict.name} (${conflict.gestor}) | Arrastra para reprogramar`
                                : `${(ev.item as any).meetingTime ? `${(ev.item as any).meetingTime} · ` : ''}${ev.name}${(ev.item as any).hitoLabel ? ` (${(ev.item as any).hitoLabel})` : ''}`
                            }
                          >
                            {/* Contenido limpio: icono + hora/código + nombre en blanco */}
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
                              <strong className="cal-gantt-code">
                                {(ev.item as any).meetingTime || ev.code}
                              </strong>
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
                                    background: 'rgba(255,255,255,0.22)',
                                    color: '#ffffff',
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
                            </div>
                          </div>
                          {/* Sombra de Línea Base cuando esté habilitada */}
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
          );
        })()}

        {/* 2. SUB-VISTA: SEMANA (TimeGrid Semanal Real L–V o L–D con cabecera sticky alineada 1:1) */}
        {calSubView === 'Semana' && (() => {
          const visibleWeekDays = showWeekends ? activeWeekDays : activeWeekDays.slice(0, 5);
          const weekColsStyle = {
            gridTemplateColumns: showWeekends ? '56px repeat(7, minmax(0, 1fr))' : '56px repeat(5, minmax(0, 1fr))',
          };

          return (
            <div className="r2-week-wrap">
              <div className="r2-week-body">
                <div className="r2-week-header" style={weekColsStyle}>
                  <div className="r2-week-head-time">HORA</div>
                  {visibleWeekDays.map((d) => (
                    <div
                      key={d.iso}
                      className={`r2-week-head-day ${d.isToday ? 'is-today' : ''}`}
                      onClick={() => {
                        onSelectDate?.(d.iso);
                        openDayModal(d.iso);
                      }}
                      title={`Ver agenda del ${formatDatePE(d.iso)}`}
                    >
                      <span>{d.label}</span>
                      <b>{d.dayNumber}</b>
                    </div>
                  ))}
                </div>

                <div className="r2-week-grid" style={weekColsStyle}>
                  <div className="r2-time-col">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                      <div key={h} className="r2-time-slot-label">
                        {h}
                      </div>
                    ))}
                  </div>

                  {visibleWeekDays.map((col) => {
                    const dayItems = matchingItems.filter((it) => {
                      const s = (it.start || '').slice(0, 10);
                      const e = (it.end || it.start || '').slice(0, 10);
                      return s && s <= col.iso && col.iso <= e;
                    });

                    return (
                      <div
                        key={col.iso}
                        className={`r2-week-day-col ${dragOverDate === col.iso ? 'r2-drag-over' : ''}`}
                        onClick={() => {
                          onSelectDate?.(col.iso);
                          openDayModal(col.iso);
                        }}
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
                            const conflict = findItemConflict(it, matchingItems);
                            const mTime = (it as any).meetingTime as string | undefined;
                            const mEndTime = (it as any).meetingEndTime as string | undefined;
                            const hitoColor = ((it as any).hitoColor as string | undefined) || '#2563eb';
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
                                className="r2-week-event-card"
                                style={{
                                  top: `${topPx}px`,
                                  height: `${heightPx}px`,
                                  background: hitoColor,
                                  color: '#ffffff',
                                  border: 0,
                                  boxShadow: 'none',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectItem(it);
                                }}
                                title={`${it.code} · ${it.name}${mTime ? ` (${mTime}–${mEndTime || ''})` : ''} · ${hitoLabel || it.gestor || 'Sin asignar'}`}
                              >
                                <strong style={{ color: '#ffffff' }}>{mTime ? `${mTime} ` : ''}{it.name}</strong>
                                <div className="r2-week-event-meta" style={{ color: 'rgba(255,255,255,0.9)' }}>
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
          );
        })()}

        {/* 3. SUB-VISTA: DÍA (Timeline Real de la Fecha Seleccionada) */}
        {calSubView === 'Día' && (() => {
          const dayItems = matchingItems
            .filter((it) => {
              const s = (it.start || '').slice(0, 10);
              const e = (it.end || it.start || '').slice(0, 10);
              return s && s <= activeDateIso && activeDateIso <= e;
            })
            .sort((a, b) =>
              ((a as any).meetingTime || '09:00').localeCompare((b as any).meetingTime || '09:00')
            );

          return (
            <div className="r2-day-wrap">
              <div className="r2-day-header">
                <div>
                  <h3>
                    {WEEK_DAY_LABELS[(new Date(calYear, calMonth, calDay).getDay() + 6) % 7]} {calDay} de {CAL_MONTH_NAMES[calMonth]}, {calYear}
                  </h3>
                  <p>{dayItems.length} {dayItems.length === 1 ? 'reunión agendada en esta jornada' : 'reuniones agendadas en esta jornada'}</p>
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
                    const hitoColor = (it as any).hitoColor as string | undefined;
                    const hitoLabel = (it as any).hitoLabel as string | undefined;
                    const mStart = (it as any).meetingTime as string | undefined;
                    const mEnd = (it as any).meetingEndTime as string | undefined;
                    const modality = (it as any).modality as string | undefined;
                    return (
                      <div
                        key={it.id}
                        className={`r2-day-card ${conflict ? 'has-conflict' : ''}`}
                        style={
                          hitoColor && !conflict
                            ? { borderLeft: `4px solid ${hitoColor}` }
                            : undefined
                        }
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
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#0f172a' }}>
                            <Clock size={11} /> {mStart ? `${mStart}${mEnd ? ` – ${mEnd}` : ''}` : formatDatePE(it.start)}
                          </span>
                          {hitoLabel && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '1px 7px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 650,
                                background: hitoColor ? `${hitoColor}18` : '#f1f5f9',
                                color: hitoColor || '#334155',
                                border: `1px solid ${hitoColor ? `${hitoColor}35` : '#e2e8f0'}`,
                              }}
                            >
                              {hitoLabel}
                            </span>
                          )}
                          {modality && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                              {modality}
                            </span>
                          )}
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
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '999px',
                        background: (ev.rawItem as any).hitoColor || '#2563eb',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(ev.rawItem as any).meetingTime ? `${(ev.rawItem as any).meetingTime} · ` : ''}
                      {(ev.rawItem as any).hitoLabel || ev.code}
                    </span>
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

      {/* Modal Google Calendar + Reuniones 1 (sin salir de Mes) */}
      {dayModalDate && (() => {
        const modalItems = matchingItems.filter((it) => {
          const s = (it.start || '').slice(0, 10);
          const e = (it.end || it.start || '').slice(0, 10);
          return s && s <= dayModalDate && dayModalDate <= e;
        });

        const handleSaveQuickMeeting = (e: React.FormEvent) => {
          e.preventDefault();
          if (!quickForm.title.trim()) {
            onNotify?.('Ingresa un título para la reunión');
            return;
          }
          const hito = HITO_OPTIONS[quickForm.hitoIdx] || HITO_OPTIONS[0]!;
          onCreateMeeting?.({
            title: quickForm.title.trim(),
            date: dayModalDate,
            startTime: quickForm.startTime,
            endTime: quickForm.endTime,
            modality: quickForm.modality,
            meetUrl: quickForm.meetUrl.trim(),
            region: quickForm.region,
            owner: quickForm.owner,
            purpose: quickForm.purpose.trim(),
            hitoLabel: hito.hitoLabel,
            hitoColor: hito.hitoColor,
          });
          setDayModalDate(null);
        };

        return (
          <div className="r2-modal-overlay" onMouseDown={() => setDayModalDate(null)}>
            <div className="r2-day-modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="r2-day-modal-head">
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
                    {dayModalTab === 'crear' ? 'REGISTRO RÁPIDO DE REUNIÓN' : 'AGENDA DEL DÍA'}
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
                {/* Tabs: Nueva reunión vs Reuniones del día */}
                <div className="r2-modal-tabs">
                  <button
                    type="button"
                    className={`r2-modal-tab ${dayModalTab === 'crear' ? 'active' : ''}`}
                    onClick={() => setDayModalTab('crear')}
                  >
                    + Nueva reunión
                  </button>
                  <button
                    type="button"
                    className={`r2-modal-tab ${dayModalTab === 'agenda' ? 'active' : ''}`}
                    onClick={() => setDayModalTab('agenda')}
                  >
                    Reuniones del día ({modalItems.length})
                  </button>
                </div>

                {dayModalTab === 'crear' ? (
                  <form className="r2-quick-form" onSubmit={handleSaveQuickMeeting}>
                    <input
                      type="text"
                      className="r2-quick-title-input"
                      placeholder="Añade un título de reunión *"
                      value={quickForm.title}
                      onChange={(e) => setQuickForm((p) => ({ ...p, title: e.target.value }))}
                      autoFocus
                    />

                    <div className="r2-quick-grid-2">
                      <div className="r2-quick-field">
                        <label>Hora de inicio</label>
                        <input
                          type="time"
                          value={quickForm.startTime}
                          onChange={(e) => setQuickForm((p) => ({ ...p, startTime: e.target.value }))}
                        />
                      </div>
                      <div className="r2-quick-field">
                        <label>Hora de fin</label>
                        <input
                          type="time"
                          value={quickForm.endTime}
                          onChange={(e) => setQuickForm((p) => ({ ...p, endTime: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="r2-quick-field">
                      <label>Modalidad</label>
                      <div className="r2-modality-grid">
                        <button
                          type="button"
                          className={`r2-modality-card ${quickForm.modality === 'Google Meet' ? 'selected' : ''}`}
                          onClick={() => setQuickForm((p) => ({ ...p, modality: 'Google Meet' }))}
                        >
                          <Video size={16} color="#4f46e5" />
                          <div>
                            <strong>Google Meet</strong>
                            <small>Reunión virtual</small>
                          </div>
                        </button>
                        <button
                          type="button"
                          className={`r2-modality-card ${quickForm.modality === 'Presencial' ? 'selected' : ''}`}
                          onClick={() => setQuickForm((p) => ({ ...p, modality: 'Presencial' }))}
                        >
                          <MapPin size={16} color="#d97706" />
                          <div>
                            <strong>Presencial</strong>
                            <small>Sede o visita territorial</small>
                          </div>
                        </button>
                      </div>
                    </div>

                    {quickForm.modality === 'Google Meet' ? (
                      <div className="r2-quick-field">
                        <label>Enlace de Google Meet (opcional)</label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/..."
                          value={quickForm.meetUrl}
                          onChange={(e) => setQuickForm((p) => ({ ...p, meetUrl: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <div className="r2-quick-field">
                        <label>Región / Sede</label>
                        <select
                          value={quickForm.region}
                          onChange={(e) => setQuickForm((p) => ({ ...p, region: e.target.value }))}
                        >
                          <option value="Junín">Junín</option>
                          <option value="Pasco">Pasco</option>
                          <option value="Huancavelica">Huancavelica</option>
                          <option value="Ayacucho">Ayacucho</option>
                          <option value="Todas las Regiones">Todas las Regiones (Nacional)</option>
                        </select>
                      </div>
                    )}

                    {showMoreOptions && (
                      <>
                        <div className="r2-quick-grid-2">
                          <div className="r2-quick-field">
                            <label>Componente / Color</label>
                            <select
                              value={quickForm.hitoIdx}
                              onChange={(e) => setQuickForm((p) => ({ ...p, hitoIdx: Number(e.target.value) }))}
                            >
                              {HITO_OPTIONS.map((h, i) => (
                                <option key={h.hitoLabel} value={i}>
                                  {h.hitoLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="r2-quick-field">
                            <label>Responsable</label>
                            <input
                              type="text"
                              value={quickForm.owner}
                              onChange={(e) => setQuickForm((p) => ({ ...p, owner: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="r2-quick-field">
                          <label>Objetivo / motivo</label>
                          <textarea
                            rows={2}
                            placeholder="¿Qué se busca lograr con la reunión?"
                            value={quickForm.purpose}
                            onChange={(e) => setQuickForm((p) => ({ ...p, purpose: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    <div className="r2-quick-footer">
                      <button
                        type="button"
                        className="r2-btn-cancel"
                        style={{ marginRight: 'auto', border: 0, color: '#2563eb' }}
                        onClick={() => setShowMoreOptions((v) => !v)}
                      >
                        {showMoreOptions ? 'Menos opciones' : 'Más opciones'}
                      </button>
                      <button type="button" className="r2-btn-cancel" onClick={() => setDayModalDate(null)}>
                        Cancelar
                      </button>
                      <button type="submit" className="r2-btn-save">
                        <Plus size={14} /> Guardar reunión
                      </button>
                    </div>
                  </form>
                ) : modalItems.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                    No hay reuniones programadas para el {formatDatePE(dayModalDate)}.
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
                            <span
                              className="cal-gantt-code"
                              style={{
                                background: (it as any).hitoColor || '#2563eb',
                                color: '#ffffff',
                              }}
                            >
                              {(it as any).meetingTime || it.code}
                            </span>
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
                                description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status}`,
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
                                description: `Responsable: ${it.gestor || 'Sin asignar'}\nEstado: ${it.status}`,
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
