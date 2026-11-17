// @ts-nocheck
import React, { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import TipoProyectoCatalogoSelect from './TipoProyectoCatalogoSelect';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: {
    id: string;
    code: string;
    name: string;
    region: string;
    entidad: string;
    metodologia: string;
    tipoProyectoCodigo?: string | null;
  }) => void;
}

const formatDatePE = (iso: string) => {
  if (!iso) return 'Seleccionar fecha';
  try {
    const parts = iso.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d, 12, 0, 0);
      return dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch {
    /* fallback */
  }
  return iso;
};

/* Mini Calendario Institucional Flotante (Mismo diseño y tokens del Gantt Maestro) */
function ModalMiniCalendar({
  value,
  onChange,
  onClose,
  align = 'left',
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  align?: 'left' | 'right';
  min?: string;
}) {
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value + 'T12:00:00') : new Date('2026-11-01T12:00:00')
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1, 12));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1, 12));
  };

  const days: { day: number; currentMonth: boolean; iso: string }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 1, d, 12);
    const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({ day: d, currentMonth: false, iso: `${prevDate.getFullYear()}-${mStr}-${dStr}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, currentMonth: true, iso });
  }
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d, 12);
    const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({ day: d, currentMonth: false, iso: `${nextDate.getFullYear()}-${mStr}-${dStr}` });
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        [align === 'right' ? 'right' : 'left']: 0,
        zIndex: 10000,
        width: '260px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.18), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        padding: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          padding: '0 2px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{capitalizedMonth}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={prevMonth}
            title="Mes anterior"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            title="Mes siguiente"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 700,
          color: '#94a3b8',
          marginBottom: '6px',
        }}
      >
        <span>LU</span>
        <span>MA</span>
        <span>MI</span>
        <span>JU</span>
        <span>VI</span>
        <span>SA</span>
        <span>DO</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}
      >
        {days.map((item, idx) => {
          const isSelected = item.iso === value;
          const isDisabled = min && item.iso < min;
          return (
            <button
              key={idx}
              type="button"
              disabled={Boolean(isDisabled)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  onChange(item.iso);
                  onClose();
                }
              }}
              style={{
                height: '28px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: isSelected ? 700 : 500,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isSelected ? '#0284c7' : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isDisabled
                  ? '#cbd5e1'
                  : item.currentMonth
                  ? '#0f172a'
                  : '#94a3b8',
                transition: 'background 0.15s ease',
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [code, setCode] = useState('PRJ-2026-01');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [riskLevel, setRiskLevel] = useState('Bajo');
  const [metodologia, setMetodologia] = useState('Híbrido: Hitos Clave + Tareas de Campo');
  const [tipoProyecto, setTipoProyecto] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [openCal, setOpenCal] = useState<'start' | 'end' | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: 'proj-' + Date.now(),
      code: code.trim() || 'PRJ-' + Date.now().toString().slice(-4),
      name: name.trim(),
      region: region.trim() || 'Zona Central',
      entidad: entidad.trim() || 'Qaway Lab',
      metodologia,
      tipoProyectoCodigo: tipoProyecto,
      budget: presupuesto.trim() || 'S/ 350,000',
      sponsor: sponsor.trim() || 'Directorio General',
      riskLevel,
    });
    setName('');
    setRegion('');
    setEntidad('');
    setPresupuesto('');
    setSponsor('');
    setTipoProyecto(null);
    setOpenCal(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setOpenCal(null);
          onClose();
        }
      }}
    >
      <div
        onClick={() => setOpenCal(null)}
        style={{
          width: 'min(590px, 100%)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.28), 0 10px 24px -5px rgba(15, 23, 42, 0.12)',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Cabecera Institucional */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.12)',
              }}
            >
              <FolderKanban size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Crear Nuevo Proyecto
              </h2>
              <small style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                Panel de Dirección · Alta y Configuración de Proyecto
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpenCal(null);
              onClose();
            }}
            style={{
              border: 'none',
              background: '#f1f5f9',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'background 0.15s ease',
            }}
            title="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 26px', overflowY: 'visible' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Código de Proyecto
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. PRJ-2026-01"
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Nombre del Proyecto *
              <input
                required
                autoFocus
                placeholder="Ej. Residencial Torres del Parque / Operación Logística 2026"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Zona / Ámbito Operativo
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ej. Lima Moderna, Zona Centro, Selva Central..."
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Cliente / Empresa Contratante
              <input
                type="text"
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                placeholder="Ej. Inmobiliaria Qaway, Grupo Constructor..."
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Metodología Operativa
              <select
                value={metodologia}
                onChange={(e) => setMetodologia(e.target.value)}
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                }}
              >
                <option>Híbrido: Hitos Clave + Tareas de Campo</option>
                <option>Gestión por Frentes y Sedes de Supervisión</option>
                <option>Línea de Tiempo Tradicional (Gantt Maestro)</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Nivel de Riesgo Inicial
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                }}
              >
                <option>Bajo</option>
                <option>Medio</option>
                <option>Alto</option>
                <option>Crítico</option>
              </select>
            </label>
          </div>

          {/* Etapa 6.3 · Clasificación administrativa del proyecto (catálogo real
              gp_tipos_proyecto_c). Opcional: NULL ⇒ "Sin clasificar" (B-8).
              NO influye en EDT/cronograma — decisión aprobada 6.2/6.3. */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Tipo de Proyecto (Clasificación)
              <TipoProyectoCatalogoSelect
                value={tipoProyecto}
                onChange={(codigo) => setTipoProyecto(codigo)}
                etiquetaNula="Sin clasificar — opcional"
              />
            </label>
            <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#94a3b8' }}>
              Clasificación administrativa (obra pública, inversión, mantenimiento…). No modifica la EDT ni el cronograma.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Presupuesto Estimado / Techo Financiero
              <input
                type="text"
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)}
                placeholder="Ej. S/ 450,000 ó $ 120,000 USD"
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
              Patrocinador / Stakeholder Principal
              <input
                type="text"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                placeholder="Ej. Gerencia General / Directorio"
                style={{
                  padding: '9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </label>
          </div>

          {/* Selectores de Fecha Ergonómicos (Estilo Gantt Qaway) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>Fecha Inicio Planificada</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCal((p) => (p === 'start' ? null : 'start'));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  border: openCal === 'start' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  borderRadius: '9px',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: openCal === 'start' ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{formatDatePE(startDate)}</span>
                <CalendarDays size={15} color="#2563eb" />
              </button>
              {openCal === 'start' && (
                <ModalMiniCalendar
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  onClose={() => setOpenCal(null)}
                  align="left"
                />
              )}
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>Fecha Fin Planificada</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCal((p) => (p === 'end' ? null : 'end'));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  border: openCal === 'end' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  borderRadius: '9px',
                  background: '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: openCal === 'end' ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{formatDatePE(endDate)}</span>
                <CalendarDays size={15} color="#2563eb" />
              </button>
              {openCal === 'end' && (
                <ModalMiniCalendar
                  value={endDate}
                  min={startDate}
                  onChange={(d) => setEndDate(d)}
                  onClose={() => setOpenCal(null)}
                  align="right"
                />
              )}
            </div>
          </div>

          {/* Nota Informativa Institucional */}
          <div
            style={{
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '9px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              El proyecto creado se activará en tu panel de Coordinación con su propio cronograma y quedará listo para asignarle sedes y supervisores de campo.
            </span>
          </div>

          {/* Botonera de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setOpenCal(null);
                onClose();
              }}
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#475569',
                transition: 'background 0.15s ease',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                height: '40px',
                padding: '0 18px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                transition: 'background 0.15s ease',
              }}
            >
              <Check size={16} />
              <span>Crear Proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
