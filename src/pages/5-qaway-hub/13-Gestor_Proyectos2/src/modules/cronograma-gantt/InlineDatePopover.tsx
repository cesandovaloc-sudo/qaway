import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InlineDatePopoverProps {
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
  onClose: () => void;
}

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_HEADERS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

function parseIso(iso: string): { year: number; month: number; day: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (m) {
    return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function InlineDatePopover({ value, onChange, onClose }: InlineDatePopoverProps) {
  const initial = parseIso(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  // Monday-first index (0 = Mon ... 6 = Sun)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{ year: number; month: number; day: number; outside: boolean }> = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const pm = viewMonth === 0 ? 11 : viewMonth - 1;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ year: py, month: pm, day: daysInPrevMonth - i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ year: viewYear, month: viewMonth, day: d, outside: false });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= trailing; d++) {
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ year: ny, month: nm, day: d, outside: true });
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div
      ref={ref}
      className="cell-editor cell-pop"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        zIndex: 1400,
        width: '248px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
        padding: '10px 12px',
        userSelect: 'none',
      }}
    >
      {/* Cabecera Mes / Año */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{
            width: 26,
            height: 26,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#334155',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          title="Mes anterior"
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          style={{
            width: 26,
            height: 26,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#334155',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          title="Mes siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAY_HEADERS.map((dh) => (
          <div
            key={dh}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#64748b',
              padding: '2px 0',
            }}
          >
            {dh}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((c, idx) => {
          const iso = toIso(c.year, c.month, c.day);
          const isSelected = iso === (value || '').slice(0, 10);
          const isToday = iso === todayIso;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(iso);
                onClose();
              }}
              style={{
                height: '28px',
                borderRadius: '7px',
                border: isToday && !isSelected ? '1px solid #93c5fd' : '1px solid transparent',
                background: isSelected ? '#1e40af' : 'transparent',
                color: isSelected ? '#ffffff' : c.outside ? '#94a3b8' : '#0f172a',
                fontSize: '11.5px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              {c.day}
            </button>
          );
        })}
      </div>

      {/* Pie con botón Hoy y Cerrar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
        <button
          type="button"
          onClick={() => {
            onChange(todayIso);
            onClose();
          }}
          style={{
            fontSize: '11.5px',
            fontWeight: 650,
            color: '#1e40af',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '7px',
            padding: '3px 10px',
            cursor: 'pointer',
          }}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
            padding: '3px 10px',
            cursor: 'pointer',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
