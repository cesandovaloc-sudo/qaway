// @ts-nocheck
import React, { useState, useEffect } from 'react';
import './configuracion.css';
import {
  Calendar,
  Check,
  Clock3,
  Globe2,
  Save,
  Sliders,
  Sparkles,
  ShieldCheck,
  Layers,
  RotateCcw
} from 'lucide-react';

export type ConfigBinds = { notify: (m: string) => void };

const TIMEZONES = [
  { id: 'America/Lima', label: 'America/Lima (UTC-05:00) · Hora Oficial de Perú (MINEDU)' },
  { id: 'America/Bogota', label: 'America/Bogota (UTC-05:00) · Colombia / Región Andina' },
  { id: 'America/La_Paz', label: 'America/La_Paz (UTC-04:00) · Bolivia' },
  { id: 'America/Santiago', label: 'America/Santiago (UTC-04:00) · Chile' },
  { id: 'UTC', label: 'UTC (UTC+00:00) · Tiempo Universal Coordinado' },
];

export default function ConfiguracionView({ onActions }: { onActions?: (h: ConfigBinds) => void }) {
  const [activeTab, setActiveTab] = useState<'general' | 'cronograma' | 'auditoria'>('general');
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('qaway-system-timezone-v1') || 'America/Lima';
  });

  const [dateMode, setDateMode] = useState<'real' | 'custom'>(() => {
    return (localStorage.getItem('qaway-system-date-mode-v1') as 'real' | 'custom') || 'custom';
  });

  const [customDate, setCustomDate] = useState(() => {
    return localStorage.getItem('qaway-system-date-v1') || '2026-10-28';
  });

  const [toleranceDays, setToleranceDays] = useState(() => {
    return localStorage.getItem('qaway-tolerance-days-v1') || '5';
  });

  const [notice, setNotice] = useState('');

  const notify = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 3000);
  };

  useEffect(() => {
    onActions?.({ notify });
  }, [onActions]);

  const handleSave = () => {
    localStorage.setItem('qaway-system-timezone-v1', timezone);
    localStorage.setItem('qaway-system-date-mode-v1', dateMode);
    localStorage.setItem('qaway-system-date-v1', customDate);
    localStorage.setItem('qaway-tolerance-days-v1', toleranceDays);

    // Disparar evento para que el Gantt y otros módulos sincronicen la fecha actual de inmediato
    window.dispatchEvent(
      new CustomEvent('qaway-date-changed', {
        detail: {
          timezone,
          dateMode,
          date: dateMode === 'custom' ? customDate : new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date()),
        },
      })
    );

    notify('Configuración de zona horaria y cronograma guardada y aplicada con éxito');
  };

  const currentDisplayDate = dateMode === 'custom' ? customDate : new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());

  return (
    <div className="cfg-v1">
      <div className="page">
        {notice && (
          <div style={{
            position: 'fixed',
            top: 24,
            right: 28,
            zIndex: 9999,
            background: '#0f172a',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '13px',
            fontWeight: 600
          }}>
            <Check size={16} color="#00b96b" />
            <span>{notice}</span>
          </div>
        )}

        <header className="page-heading">
          <div className="heading-copy">
            <div className="eyebrow">
              <Sliders size={13} />
              <span>Gobernanza Territorial · Qaway Lab</span>
            </div>
            <h1>Configuración y Parámetros del Sistema</h1>
            <p>
              Ajuste de zona horaria oficial, calibración de fecha operativa para seguimiento territorial y parámetros de tolerancia.
            </p>
          </div>
          <div className="heading-actions">
            <button type="button" className="btn-save" onClick={handleSave}>
              <Save size={15} />
              <span>Guardar Parámetros</span>
            </button>
          </div>
        </header>

        <nav className="tabs-bar">
          <button
            type="button"
            className={`tab-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Clock3 size={15} />
            <span>Zona Horaria y Fecha Operativa</span>
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'cronograma' ? 'active' : ''}`}
            onClick={() => setActiveTab('cronograma')}
          >
            <Layers size={15} />
            <span>Tolerancias y Reglas de Cronograma</span>
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'auditoria' ? 'active' : ''}`}
            onClick={() => setActiveTab('auditoria')}
          >
            <ShieldCheck size={15} />
            <span>Seguridad y Auditoría Institucional</span>
          </button>
        </nav>

        {activeTab === 'general' && (
          <div className="cards-grid">
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <Globe2 size={20} />
                </div>
                <div>
                  <h2>Zona Horaria del Proyecto</h2>
                  <p>
                    Define el huso horario oficial para el cómputo de plazos, alertas de cierre de hitos y sincronización territorial.
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-timezone">Huso Horario Oficial</label>
                  <p>Aplica a todas las fechas de corte, reportes de gestores y actas del proyecto.</p>
                </div>
                <div className="field-control">
                  <select
                    id="cfg-timezone"
                    className="select-input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Modo de Fecha del Sistema</label>
                  <p>Determina si el cronograma toma la fecha real del computador o una fecha operativa de simulación/seguimiento.</p>
                </div>
                <div className="field-control">
                  <div className="radio-group">
                    <label className={`radio-card ${dateMode === 'custom' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="dateMode"
                        checked={dateMode === 'custom'}
                        onChange={() => setDateMode('custom')}
                      />
                      <div className="radio-text">
                        <strong>Fecha Operativa MINEDU (Recomendado para seguimiento)</strong>
                        <span>
                          Fija la fecha de control territorial para evaluar con precisión el estado de hitos pasados, presentes y futuros.
                        </span>
                        {dateMode === 'custom' && (
                          <div className="date-picker-wrap">
                            <input
                              type="date"
                              className="date-input"
                              value={customDate}
                              min="2026-09-01"
                              max="2027-04-30"
                              onChange={(e) => setCustomDate(e.target.value)}
                            />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              Fecha actual de seguimiento territorial: <strong>{customDate}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </label>

                    <label className={`radio-card ${dateMode === 'real' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="dateMode"
                        checked={dateMode === 'real'}
                        onChange={() => setDateMode('real')}
                      />
                      <div className="radio-text">
                        <strong>Fecha en Tiempo Real del Dispositivo</strong>
                        <span>Toma la fecha y hora del reloj del equipo según la zona horaria seleccionada.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="status-banner">
                <div className="status-banner-left">
                  <Calendar size={17} color="#0066ff" />
                  <span>
                    Fecha de referencia activa en el cronograma: <strong>{currentDisplayDate}</strong> ({timezone})
                  </span>
                </div>
                <span className="status-banner-badge">Sincronizado</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cronograma' && (
          <div className="cards-grid">
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <Layers size={20} />
                </div>
                <div>
                  <h2>Tolerancias de Hitos y Subprocesos</h2>
                  <p>Reglas de cálculo para categorización de actividades como «En curso», «Con retraso» o «Cumple».</p>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-tolerance">Días de Gracia / Tolerancia Territorial</label>
                  <p>Número de días hábiles antes de clasificar automáticamente una tarea pendiente como «Con retraso».</p>
                </div>
                <div className="field-control">
                  <input
                    id="cfg-tolerance"
                    type="number"
                    min="0"
                    max="30"
                    className="select-input"
                    style={{ maxWidth: 120 }}
                    value={toleranceDays}
                    onChange={(e) => setToleranceDays(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auditoria' && (
          <div className="cards-grid">
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2>Registro de Auditoría Institucional</h2>
                  <p>Parámetros de trazabilidad para cambios de cronograma por directores regionales y coordinadores UGEL.</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Todas las modificaciones de cronograma, asignaciones de responsables territoriales y fechas de hito se registran con firma digital y marca temporal conforme a la Directiva MINEDU 2027.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
