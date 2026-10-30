import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';

interface CronogramaCalendarioViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  formatDatePE: (iso: string) => string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'Completado':
    case 'Cumple':
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    case 'En proceso':
    case 'En curso':
      return { bg: '#eff6ff', text: '#0066ff', border: '#bfdbfe' };
    case 'Con retraso':
      return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    case 'Pendiente':
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
};

export default function CronogramaCalendarioView({
  items,
  onSelectItem,
  formatDatePE,
}: CronogramaCalendarioViewProps) {
  // Inicializar en Octubre 2026 (mes de referencia de las capturas)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = Octubre

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Ajustar a lunes (0 = Lun, ..., 6 = Dom)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      dateIso: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Días del mes previo
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const iso = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateIso: iso,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: iso === '2026-10-27',
      });
    }

    // Días del mes actual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateIso: iso,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: iso === '2026-10-27',
      });
    }

    // Días del siguiente mes para completar semanas de 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const iso = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateIso: iso,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: iso === '2026-10-27',
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  return (
    <div className="cronograma-cal-container">
      {/* Barra de Navegación del Calendario */}
      <div className="cal-header-bar">
        <div className="cal-title-group">
          <span className="cal-month-title">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <span className="cal-subtitle">Distribución de hitos y subprocesos en ejecución</span>
        </div>

        <div className="cal-controls">
          <button type="button" className="cal-nav-btn" onClick={handlePrevMonth} title="Mes anterior">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="cal-today-btn" onClick={handleToday} title="Ir a fecha actual">
            Hoy
          </button>
          <button type="button" className="cal-nav-btn" onClick={handleNextMonth} title="Mes siguiente">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="cal-weekdays-row">
        {WEEK_DAYS.map((wd) => (
          <div key={wd} className="cal-weekday-cell">
            {wd}
          </div>
        ))}
      </div>

      {/* Rejilla de días */}
      <div className="cal-grid">
        {calendarDays.map((day) => {
          // Filtrar items que coinciden con este día
          const dayItems = items.filter((x) => x.start <= day.dateIso && x.end >= day.dateIso);

          return (
            <div
              key={day.dateIso}
              className={`cal-day-cell ${day.isCurrentMonth ? '' : 'outside'} ${
                day.isToday ? 'is-today' : ''
              }`}
            >
              <div className="cal-day-header">
                <span className={`cal-day-number ${day.isToday ? 'today-pill' : ''}`}>
                  {day.dayNumber}
                </span>
                {dayItems.length > 0 && (
                  <span className="cal-day-count-badge">{dayItems.length}</span>
                )}
              </div>

              <div className="cal-day-events-list">
                {dayItems.slice(0, 3).map((item) => {
                  const style = getStatusColor(item.status);
                  const isHito = item.kind === 'hito';

                  return (
                    <div
                      key={item.id}
                      className={`cal-event-pill ${isHito ? 'is-hito' : ''}`}
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: style.border,
                      }}
                      onClick={() => onSelectItem(item)}
                      title={`${isHito ? 'Hito' : 'Subproceso'}: ${item.code} ${item.name} (${item.status})`}
                    >
                      <span className="event-code">{item.code}</span>
                      <span className="event-name">{item.name}</span>
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <span className="cal-more-events">+{dayItems.length - 3} más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
