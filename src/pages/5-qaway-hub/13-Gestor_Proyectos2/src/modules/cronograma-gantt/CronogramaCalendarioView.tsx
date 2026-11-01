import React, { useMemo } from 'react';
import {
  FileText,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Layers,
  Plus,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';

export type CalendarCategory = 'hito' | 'subproceso' | 'reunion' | 'visita' | 'vencimiento';

export interface CalendarEvent {
  id: string;
  code: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  category: CalendarCategory;
  status: Status;
  owner: string;
  region: string;
  time?: string;
  isFullWeek?: boolean;
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

// Agenda oficial territorial MINEDU · Octubre 2026 (exacta a Imagen 2)
const OCTOBER_OFFICIAL_EVENTS: CalendarEvent[] = [
  // Semana 1: 1 al 4 Oct
  {
    id: 'cal-sp-02-1',
    code: 'SP-02.1',
    name: 'Entrega de requerimientos',
    start: '2026-10-01',
    end: '2026-10-04',
    category: 'subproceso',
    status: 'En proceso',
    owner: 'Carlos Mendoza',
    region: 'Junín',
    time: '09:00 – 12:00',
  },
  // Semana 2: 5 al 11 Oct
  {
    id: 'cal-reu-01',
    code: 'REU-01',
    name: 'Reunión con UGEL Huancayo',
    start: '2026-10-06',
    end: '2026-10-06',
    category: 'reunion',
    status: 'Completado',
    owner: 'Jorge Ramos',
    region: 'Junín',
    time: '10:00 – 11:30',
  },
  {
    id: 'cal-sp-02-2',
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
    id: 'cal-h-02',
    code: 'H-02',
    name: 'Gestión de Almacenes y Recepción',
    start: '2026-10-05',
    end: '2026-10-11',
    category: 'hito',
    status: 'En proceso',
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
    isFullWeek: true,
  },
  // Semana 3: 12 al 18 Oct
  {
    id: 'cal-vis-01',
    code: 'VIS-01',
    name: 'Visita a sede central',
    start: '2026-10-14',
    end: '2026-10-16',
    category: 'visita',
    status: 'En proceso',
    owner: 'Lucía Castillo',
    region: 'Lima Provincias',
    time: '09:00 – 16:00',
  },
  {
    id: 'cal-sp-03-1',
    code: 'SP-03.1',
    name: 'Validación de evidencias',
    start: '2026-10-16',
    end: '2026-10-18',
    category: 'subproceso',
    status: 'En proceso',
    owner: 'Carlos Mendoza',
    region: 'Junín',
    time: '14:00 – 17:00',
  },
  // Semana 4: 19 al 25 Oct
  {
    id: 'cal-sp-04-1',
    code: 'SP-04.1',
    name: 'Cierre de subproceso',
    start: '2026-10-21',
    end: '2026-10-23',
    category: 'subproceso',
    status: 'Pendiente',
    owner: 'Carlos Mendoza',
    region: 'Junín',
    time: '09:00 – 17:00',
  },
  {
    id: 'cal-reu-02',
    code: 'REU-02',
    name: 'Reunión técnica MINEDU',
    start: '2026-10-24',
    end: '2026-10-24',
    category: 'reunion',
    status: 'Pendiente',
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
    time: '15:00 – 16:30',
  },
  // Semana 5: 26 Oct al 1 Nov
  {
    id: 'cal-venc-h03',
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
    id: 'cal-vis-02',
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
  {
    id: 'cal-sp-04-2',
    code: 'SP-04.2',
    name: 'Informe final',
    start: '2026-10-31',
    end: '2026-11-01',
    category: 'subproceso',
    status: 'Pendiente',
    owner: 'Carlos Mendoza',
    region: 'Todas las Regiones',
    time: '09:00 – 13:00',
  },
];

// Estructura de las 5 semanas de Octubre 2026
interface WeekStructure {
  weekNum: number;
  days: Array<{
    dayNumber: number;
    dateIso: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }>;
}

const OCTOBER_2026_WEEKS: WeekStructure[] = [
  {
    weekNum: 1,
    days: [
      { dayNumber: 28, dateIso: '2026-09-28', isCurrentMonth: false, isToday: false },
      { dayNumber: 29, dateIso: '2026-09-29', isCurrentMonth: false, isToday: false },
      { dayNumber: 30, dateIso: '2026-09-30', isCurrentMonth: false, isToday: false },
      { dayNumber: 1, dateIso: '2026-10-01', isCurrentMonth: true, isToday: false },
      { dayNumber: 2, dateIso: '2026-10-02', isCurrentMonth: true, isToday: false },
      { dayNumber: 3, dateIso: '2026-10-03', isCurrentMonth: true, isToday: false },
      { dayNumber: 4, dateIso: '2026-10-04', isCurrentMonth: true, isToday: false },
    ],
  },
  {
    weekNum: 2,
    days: [
      { dayNumber: 5, dateIso: '2026-10-05', isCurrentMonth: true, isToday: false },
      { dayNumber: 6, dateIso: '2026-10-06', isCurrentMonth: true, isToday: false },
      { dayNumber: 7, dateIso: '2026-10-07', isCurrentMonth: true, isToday: false },
      { dayNumber: 8, dateIso: '2026-10-08', isCurrentMonth: true, isToday: false },
      { dayNumber: 9, dateIso: '2026-10-09', isCurrentMonth: true, isToday: false },
      { dayNumber: 10, dateIso: '2026-10-10', isCurrentMonth: true, isToday: false },
      { dayNumber: 11, dateIso: '2026-10-11', isCurrentMonth: true, isToday: false },
    ],
  },
  {
    weekNum: 3,
    days: [
      { dayNumber: 12, dateIso: '2026-10-12', isCurrentMonth: true, isToday: false },
      { dayNumber: 13, dateIso: '2026-10-13', isCurrentMonth: true, isToday: false },
      { dayNumber: 14, dateIso: '2026-10-14', isCurrentMonth: true, isToday: false },
      { dayNumber: 15, dateIso: '2026-10-15', isCurrentMonth: true, isToday: false },
      { dayNumber: 16, dateIso: '2026-10-16', isCurrentMonth: true, isToday: false },
      { dayNumber: 17, dateIso: '2026-10-17', isCurrentMonth: true, isToday: false },
      { dayNumber: 18, dateIso: '2026-10-18', isCurrentMonth: true, isToday: false },
    ],
  },
  {
    weekNum: 4,
    days: [
      { dayNumber: 19, dateIso: '2026-10-19', isCurrentMonth: true, isToday: false },
      { dayNumber: 20, dateIso: '2026-10-20', isCurrentMonth: true, isToday: false },
      { dayNumber: 21, dateIso: '2026-10-21', isCurrentMonth: true, isToday: false },
      { dayNumber: 22, dateIso: '2026-10-22', isCurrentMonth: true, isToday: false },
      { dayNumber: 23, dateIso: '2026-10-23', isCurrentMonth: true, isToday: false },
      { dayNumber: 24, dateIso: '2026-10-24', isCurrentMonth: true, isToday: false },
      { dayNumber: 25, dateIso: '2026-10-25', isCurrentMonth: true, isToday: false },
    ],
  },
  {
    weekNum: 5,
    days: [
      { dayNumber: 26, dateIso: '2026-10-26', isCurrentMonth: true, isToday: false },
      { dayNumber: 27, dateIso: '2026-10-27', isCurrentMonth: true, isToday: true },
      { dayNumber: 28, dateIso: '2026-10-28', isCurrentMonth: true, isToday: false },
      { dayNumber: 29, dateIso: '2026-10-29', isCurrentMonth: true, isToday: false },
      { dayNumber: 30, dateIso: '2026-10-30', isCurrentMonth: true, isToday: false },
      { dayNumber: 31, dateIso: '2026-10-31', isCurrentMonth: true, isToday: false },
      { dayNumber: 1, dateIso: '2026-11-01', isCurrentMonth: false, isToday: false },
    ],
  },
];

// Los 5 eventos del panel lateral derecho (exactos a Imagen 2)
const UPCOMING_SIDEBAR_EVENTS = [
  {
    id: 'up-1',
    day: '01',
    month: 'OCT',
    title: 'Entrega de requerimientos',
    category: 'subproceso',
    catLabel: 'SP-02.1 · Subproceso',
    time: '09:00 – 12:00',
    initials: 'CM',
    avatarBg: '#eff6ff',
    avatarColor: '#1d4ed8',
  },
  {
    id: 'up-2',
    day: '05',
    month: 'OCT',
    title: 'Reunión con UGEL Huancayo',
    category: 'reunion',
    catLabel: 'Reunión',
    time: '10:00 – 11:30',
    initials: 'JR',
    avatarBg: '#ecfdf5',
    avatarColor: '#047857',
  },
  {
    id: 'up-3',
    day: '09',
    month: 'OCT',
    title: 'Vence informe de almacén',
    category: 'vencimiento',
    catLabel: 'SP-02.2 · Subproceso',
    time: 'Todo el día',
    initials: 'AP',
    avatarBg: '#fff7ed',
    avatarColor: '#c2410c',
  },
  {
    id: 'up-4',
    day: '14',
    month: 'OCT',
    title: 'Visita a sede central',
    category: 'visita',
    catLabel: 'Visita a sede',
    time: '09:00 – 16:00',
    initials: 'LC',
    avatarBg: '#f5f3ff',
    avatarColor: '#6d28d9',
  },
  {
    id: 'up-5',
    day: '16',
    month: 'OCT',
    title: 'Validación de evidencias',
    category: 'subproceso',
    catLabel: 'SP-03.1 · Subproceso',
    time: '14:00 – 17:00',
    initials: 'CM',
    avatarBg: '#eff6ff',
    avatarColor: '#1d4ed8',
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

  return (
    <div className="cronograma-cal-container cal-master-layout">
      {/* Área Principal de Calendario */}
      <div className="cal-main-area">
        {/* Cabecera Limpia (Idéntica a Imagen 2): Icono + Octubre 2026 */}
        <div className="cal-title-header-clean">
          <div className="cal-plus-icon-wrap" title="Agregar evento o hito al calendario">
            <Plus size={16} />
          </div>
          <h2 className="cal-clean-title">Octubre 2026</h2>
        </div>

        {/* 1. SUB-VISTA: MES (Idéntica a Imagen 2) */}
        {calSubView === 'Mes' && (
          <div className="cal-month-canvas">
            {/* Cabecera de Días de la Semana: Lunes a Domingo en texto normal */}
            <div className="cal-weekdays-header">
              {WEEK_DAY_LABELS.map((dayLabel) => (
                <div key={dayLabel} className="cal-weekday-col">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Rejilla de las 5 Semanas */}
            <div className="cal-grid-body">
              {/* ===== SEMANA 1 (28 Sep al 04 Oct) ===== */}
              <div className="cal-week-row-grid">
                <div className="cal-day-bg-cell outside"><span className="cal-num">28</span></div>
                <div className="cal-day-bg-cell outside"><span className="cal-num">29</span></div>
                <div className="cal-day-bg-cell outside"><span className="cal-num">30</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">1</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">2</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">3</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">4</span></div>

                {/* Eventos Semana 1: SP-02.1 del Jueves 1 al Domingo 4 */}
                <div className="cal-week-events-overlay">
                  <div
                    className="cal-pill-event cal-pill-blue"
                    style={{ gridColumn: '4 / span 4', gridRow: 1 }}
                    onClick={() => handleOpenItem('1.2')}
                    title="SP-02.1 Entrega de requerimientos (01/10 al 04/10)"
                  >
                    <FileText size={13} className="cal-pill-icon icon-blue" />
                    <span className="cal-pill-text">SP-02.1 Entrega de requerimientos</span>
                  </div>
                </div>
              </div>

              {/* ===== SEMANA 2 (05 al 11 Oct) ===== */}
              <div className="cal-week-row-grid">
                <div className="cal-day-bg-cell"><span className="cal-num">5</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">6</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">7</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">8</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">9</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">10</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">11</span></div>

                {/* Eventos Semana 2: Reunión (Mar 6), Vencimiento (Vie 9), H-02 (Lun 5 a Dom 11) */}
                <div className="cal-week-events-overlay">
                  {/* Martes 6: Reunión técnica morada */}
                  <div
                    className="cal-card-meeting"
                    style={{ gridColumn: '2 / span 1', gridRow: 1 }}
                    onClick={() => handleOpenItem('2.')}
                    title="Reunión con UGEL Huancayo · 10:00 – 11:30"
                  >
                    <div className="cal-meeting-top">
                      <Users size={12} className="icon-purple" />
                      <span className="cal-meeting-title">Reunión con UGEL Huancayo</span>
                    </div>
                    <span className="cal-meeting-time">10:00 – 11:30</span>
                  </div>

                  {/* Viernes 9: Vence informe de almacén */}
                  <div
                    className="cal-pill-event cal-pill-orange"
                    style={{ gridColumn: '5 / span 1', gridRow: 1 }}
                    onClick={() => handleOpenItem('2.2')}
                    title="SP-02.2 Vence informe de almacén"
                  >
                    <Clock size={13} className="cal-pill-icon icon-orange" />
                    <span className="cal-pill-text">SP-02.2 Vence informe de almacén</span>
                  </div>

                  {/* H-02: Gestión de Almacenes y Recepción (toda la semana en fila 2) */}
                  <div
                    className="cal-pill-event cal-pill-blue cal-pill-hito-full"
                    style={{ gridColumn: '1 / span 7', gridRow: 2 }}
                    onClick={() => handleOpenItem('2.')}
                    title="H-02 Gestión de Almacenes y Recepción en MC SIGA"
                  >
                    <span className="cal-hito-circle-badge">
                      <Layers size={10} />
                    </span>
                    <span className="cal-pill-text cal-hito-bold">
                      H-02 Gestión de Almacenes y Recepción
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== SEMANA 3 (12 al 18 Oct) ===== */}
              <div className="cal-week-row-grid">
                <div className="cal-day-bg-cell"><span className="cal-num">12</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">13</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">14</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">15</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">16</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">17</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">18</span></div>

                {/* Eventos Semana 3: Visita sede (Mié 14 al Vie 16), Validación (Vie 16 al Dom 18) */}
                <div className="cal-week-events-overlay">
                  {/* Miércoles 14 al Viernes 16: Visita a sede central (Verde) */}
                  <div
                    className="cal-pill-event cal-pill-green"
                    style={{ gridColumn: '3 / span 3', gridRow: 1 }}
                    onClick={() => handleOpenItem('2.')}
                    title="Visita a sede central (14/10 al 16/10)"
                  >
                    <MapPin size={13} className="cal-pill-icon icon-green" />
                    <span className="cal-pill-text">Visita a sede central</span>
                  </div>

                  {/* Viernes 16 al Domingo 18: SP-03.1 Validación de evidencias (Azul) */}
                  <div
                    className="cal-pill-event cal-pill-blue"
                    style={{ gridColumn: '5 / span 3', gridRow: 2 }}
                    onClick={() => handleOpenItem('3.')}
                    title="SP-03.1 Validación de evidencias (16/10 al 18/10)"
                  >
                    <FileText size={13} className="cal-pill-icon icon-blue" />
                    <span className="cal-pill-text">SP-03.1 Validación de evidencias</span>
                  </div>
                </div>
              </div>

              {/* ===== SEMANA 4 (19 al 25 Oct) ===== */}
              <div className="cal-week-row-grid">
                <div className="cal-day-bg-cell"><span className="cal-num">19</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">20</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">21</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">22</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">23</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">24</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">25</span></div>

                {/* Eventos Semana 4: Cierre (Mié 21 al Vie 23), Reunión MINEDU (Sáb 24) */}
                <div className="cal-week-events-overlay">
                  {/* Miércoles 21 al Viernes 23: SP-04.1 Cierre de subproceso */}
                  <div
                    className="cal-pill-event cal-pill-blue"
                    style={{ gridColumn: '3 / span 3', gridRow: 1 }}
                    onClick={() => handleOpenItem('4.')}
                    title="SP-04.1 Cierre de subproceso (21/10 al 23/10)"
                  >
                    <FileText size={13} className="cal-pill-icon icon-blue" />
                    <span className="cal-pill-text">SP-04.1 Cierre de subproceso</span>
                  </div>

                  {/* Sábado 24: Reunión técnica MINEDU */}
                  <div
                    className="cal-card-meeting"
                    style={{ gridColumn: '6 / span 1', gridRow: 1 }}
                    onClick={() => handleOpenItem('4.')}
                    title="Reunión técnica MINEDU · 15:00 – 16:30"
                  >
                    <div className="cal-meeting-top">
                      <Users size={12} className="icon-purple" />
                      <span className="cal-meeting-title">Reunión técnica MINEDU</span>
                    </div>
                    <span className="cal-meeting-time">15:00 – 16:30</span>
                  </div>
                </div>
              </div>

              {/* ===== SEMANA 5 (26 Oct al 01 Nov) ===== */}
              <div className="cal-week-row-grid">
                <div className="cal-day-bg-cell"><span className="cal-num">26</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">27</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">28</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">29</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">30</span></div>
                <div className="cal-day-bg-cell"><span className="cal-num">31</span></div>
                <div className="cal-day-bg-cell outside"><span className="cal-num">1</span></div>

                {/* Eventos Semana 5: Vence acta (Mar 27 al Mié 28), Visita Concepción (Vie 30 al Sáb 31), SP-04.2 (Sáb 31 al Dom 1) */}
                <div className="cal-week-events-overlay">
                  {/* Martes 27 al Miércoles 28: H-03 Vence acta de conformidad (Naranja) */}
                  <div
                    className="cal-pill-event cal-pill-orange"
                    style={{ gridColumn: '2 / span 2', gridRow: 1 }}
                    onClick={() => handleOpenItem('3.')}
                    title="H-03 Vence acta de conformidad"
                  >
                    <Clock size={13} className="cal-pill-icon icon-orange" />
                    <span className="cal-pill-text">H-03 Vence acta de conformidad</span>
                  </div>

                  {/* Viernes 30 al Sábado 31: Visita UGEL Concepción (Verde) */}
                  <div
                    className="cal-pill-event cal-pill-green"
                    style={{ gridColumn: '5 / span 2', gridRow: 1 }}
                    onClick={() => handleOpenItem('4.')}
                    title="Visita UGEL Concepción (30/10 al 31/10)"
                  >
                    <MapPin size={13} className="cal-pill-icon icon-green" />
                    <span className="cal-pill-text">Visita UGEL Concepción</span>
                  </div>

                  {/* Sábado 31 al Domingo 1: SP-04.2 Informe final (Azul) */}
                  <div
                    className="cal-pill-event cal-pill-blue"
                    style={{ gridColumn: '6 / span 2', gridRow: 2 }}
                    onClick={() => handleOpenItem('4.')}
                    title="SP-04.2 Informe final (31/10 al 01/11)"
                  >
                    <FileText size={13} className="cal-pill-icon icon-blue" />
                    <span className="cal-pill-text">SP-04.2 Informe final</span>
                  </div>
                </div>
              </div>
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
              {OCTOBER_OFFICIAL_EVENTS.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className={`cal-pill-event cal-pill-${evt.category === 'reunion' ? 'purple' : evt.category === 'visita' ? 'green' : evt.category === 'vencimiento' ? 'orange' : 'blue'}`}
                  onClick={() => handleOpenItem(evt.code)}
                  style={{ marginBottom: 8, padding: '8px 12px', height: 'auto' }}
                >
                  <strong style={{ marginRight: 6 }}>{evt.code}</strong>
                  <span>{evt.name}</span>
                  {evt.time && <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8 }}>{evt.time}</span>}
                </div>
              ))}
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
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((h) => (
                <div key={h} className="cal-dia-slot-row">
                  <span className="cal-dia-hour">{h}</span>
                  <div className="cal-dia-event-box">
                    {h === '10:00' && (
                      <div className="cal-card-meeting" onClick={() => handleOpenItem('2.')}>
                        <div className="cal-meeting-top">
                          <Users size={12} className="icon-purple" />
                          <span className="cal-meeting-title">Reunión de coordinación territorial MINEDU</span>
                        </div>
                        <span className="cal-meeting-time">10:00 – 11:30</span>
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
            {UPCOMING_SIDEBAR_EVENTS.map((it) => (
              <div
                key={it.id}
                className="cal-agenda-row"
                onClick={() => handleOpenItem(it.title)}
              >
                <div className="cal-date-badge-box">
                  <span className="cal-badge-day">{it.day}</span>
                  <span className="cal-badge-mon">{it.month}</span>
                </div>
                <div className="cal-agenda-info">
                  <div className="cal-agenda-title-line">
                    <span className={`cal-cat-dot cal-dot-${it.category}`} />
                    <strong>{it.title}</strong>
                  </div>
                  <span className="cal-agenda-sub">{it.catLabel} · {it.time}</span>
                </div>
                <div className="cal-agenda-avatar" style={{ backgroundColor: it.avatarBg, color: it.avatarColor }}>
                  {it.initials}
                </div>
                <ArrowRight size={14} className="cal-agenda-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra Lateral Derecha (Exacta a Imagen 2): Próximos eventos y Leyenda */}
      <aside className="cal-sidebar-clean">
        {/* Sección: Próximos eventos */}
        <div className="cal-sidebar-section">
          <div className="cal-sidebar-head">
            <h3 className="cal-sidebar-title">Próximos eventos</h3>
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
            {UPCOMING_SIDEBAR_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="cal-upcoming-card-row"
                onClick={() => handleOpenItem(ev.title)}
              >
                {/* Badge de fecha a la izquierda: 01 OCT */}
                <div className="cal-clean-date-badge">
                  <span className="badge-day-number">{ev.day}</span>
                  <span className="badge-month-text">{ev.month}</span>
                </div>

                {/* Info central */}
                <div className="cal-upcoming-center-info">
                  <div className="cal-upcoming-main-title">
                    <span className={`cal-dot-indicator dot-${ev.category}`} />
                    <span className="upcoming-title-text" title={ev.title}>{ev.title}</span>
                  </div>

                  <div className="cal-upcoming-cat-line">
                    {ev.category === 'reunion' ? (
                      <Users size={11} className="cat-icon-sub" />
                    ) : ev.category === 'visita' ? (
                      <MapPin size={11} className="cat-icon-sub" />
                    ) : (
                      <FileText size={11} className="cat-icon-sub" />
                    )}
                    <span>{ev.catLabel}</span>
                  </div>

                  <div className="cal-upcoming-time-line">
                    <Clock size={11} className="cat-icon-sub" />
                    <span>{ev.time}</span>
                  </div>
                </div>

                {/* Avatar iniciales + tres puntos */}
                <div className="cal-upcoming-right-actions">
                  <div
                    className="cal-user-avatar-circle"
                    style={{ backgroundColor: ev.avatarBg, color: ev.avatarColor }}
                  >
                    {ev.initials}
                  </div>
                  <button
                    type="button"
                    className="cal-more-dots-btn"
                    title="Opciones de evento"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenItem(ev.title);
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Leyenda (Cuadrícula limpia 2x2) */}
        <div className="cal-sidebar-section cal-legend-section">
          <h3 className="cal-sidebar-title">Leyenda</h3>
          <div className="cal-clean-legend-grid">
            <div className="cal-legend-row">
              <span className="cal-dot-indicator dot-subproceso" />
              <span>Hitos / Subprocesos</span>
            </div>
            <div className="cal-legend-row">
              <span className="cal-dot-indicator dot-reunion" />
              <span>Reuniones</span>
            </div>
            <div className="cal-legend-row">
              <span className="cal-dot-indicator dot-visita" />
              <span>Visitas a sedes</span>
            </div>
            <div className="cal-legend-row">
              <span className="cal-dot-indicator dot-vencimiento" />
              <span>Vencimientos</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
