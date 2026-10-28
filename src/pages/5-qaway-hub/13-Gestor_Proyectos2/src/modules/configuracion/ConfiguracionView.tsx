// @ts-nocheck
import React, { useState, useEffect } from 'react';
import './configuracion.css';
import {
  AlertCircle,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  Key,
  Layers,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import {
  getStoredGeminiConfig,
  saveStoredGeminiConfig,
  testGeminiConnection,
  AVAILABLE_MODELS,
  AGENT_PROFILES,
  AGENT_TONES,
  type AgentProfileId,
  type AgentToneId
} from '../../services/geminiRAGService';

export type ConfigBinds = { notify: (m: string) => void };

const TIMEZONES = [
  { id: 'America/Lima', label: 'America/Lima (UTC-05:00) · Hora Oficial de Perú' },
  { id: 'America/Bogota', label: 'America/Bogota (UTC-05:00) · Colombia / Región Andina' },
  { id: 'America/La_Paz', label: 'America/La_Paz (UTC-04:00) · Bolivia' },
  { id: 'America/Santiago', label: 'America/Santiago (UTC-04:00) · Chile' },
  { id: 'UTC', label: 'UTC (UTC+00:00) · Tiempo Universal Coordinado' },
];

export default function ConfiguracionView({ onActions }: { onActions?: (h: ConfigBinds) => void }) {
  const [activeTab, setActiveTab] = useState<'general' | 'cronograma' | 'auditoria' | 'asistente'>('general');
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

  // Estado del Asistente IA (Google Gemini RAG)
  const [geminiConfig, setGeminiConfig] = useState(getStoredGeminiConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [notice, setNotice] = useState('');

  const notify = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 3000);
  };

  useEffect(() => {
    onActions?.({ notify });
  }, [onActions]);

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(geminiConfig.apiKey, geminiConfig.model);
      setTestResult(res);
      if (res.ok) {
        notify('Conexión con Google Gemini verificada con éxito');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('qaway-system-timezone-v1', timezone);
    localStorage.setItem('qaway-system-date-mode-v1', dateMode);
    localStorage.setItem('qaway-system-date-v1', customDate);
    localStorage.setItem('qaway-tolerance-days-v1', toleranceDays);

    // Guardar configuración del Asistente IA
    saveStoredGeminiConfig(geminiConfig);
    window.dispatchEvent(new CustomEvent('qaway-gemini-config-changed'));

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

    notify('Configuración general y parámetros del Asistente IA guardados con éxito');
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
          <button
            type="button"
            className={`tab-item ${activeTab === 'asistente' ? 'active' : ''}`}
            onClick={() => setActiveTab('asistente')}
          >
            <Bot size={15} />
            <span>Asistente IA (Qaway Copilot)</span>
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
                        <strong>Fecha Operativa del Proyecto (Control de seguimiento)</strong>
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
                Todas las modificaciones de cronograma, asignaciones de responsables territoriales y fechas de hito se registran con firma digital y marca temporal conforme a los lineamientos institucionales y directivas del proyecto.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'asistente' && (
          <div className="cards-grid">
            {/* Tarjeta 1: Motor y Conexión BYOK */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#0066ff' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h2>Conexión con Google Gemini (BYOK)</h2>
                  <p>
                    Configura tu propia clave de API de Google Gemini para habilitar razonamiento generativo real, análisis de documentos y proyecciones de cronograma.
                  </p>
                </div>
              </div>

              {/* Fila: API Key */}
              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-gemini-key">API Key de Google Gemini</label>
                  <p>Clave personal segura obtenida desde Google AI Studio (almacenada únicamente en tu navegador).</p>
                </div>
                <div className="field-control">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        id="cfg-gemini-key"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="AIzaSy..."
                        className="select-input"
                        style={{ width: '100%', paddingRight: 36, fontFamily: showApiKey ? 'monospace' : 'inherit' }}
                        value={geminiConfig.apiKey}
                        onChange={(e) => setGeminiConfig((c) => ({ ...c, apiKey: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey((v) => !v)}
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 0,
                          background: 'transparent',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4
                        }}
                        title={showApiKey ? 'Ocultar clave' : 'Mostrar clave'}
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-save"
                      style={{
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        boxShadow: 'none',
                        height: 38,
                        padding: '0 14px',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={handleTestKey}
                      disabled={isTesting || !geminiConfig.apiKey.trim()}
                    >
                      {isTesting ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} color="#0066ff" />}
                      <span>{isTesting ? 'Verificando...' : 'Probar Conexión'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: testResult.ok ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${testResult.ok ? '#bbf7d0' : '#fecaca'}`,
                        color: testResult.ok ? '#166534' : '#991b1b'
                      }}
                    >
                      {testResult.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila: Modelo de IA */}
              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-gemini-model">Modelo de Lenguaje</label>
                  <p>Selecciona la versión de Google Gemini que procesará las consultas y documentos.</p>
                </div>
                <div className="field-control">
                  <select
                    id="cfg-gemini-model"
                    className="select-input"
                    value={geminiConfig.model}
                    onChange={(e) => setGeminiConfig((c) => ({ ...c, model: e.target.value }))}
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Perfil y Tono del Agente */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h2>Perfil y Comportamiento del Agente Territorial</h2>
                  <p>Define la personalidad, enfoque analítico y nivel de rigor en las respuestas del asistente.</p>
                </div>
              </div>

              {/* Fila: Perfil */}
              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-agent-profile">Perfil de Especialización</label>
                  <p>Alinea el razonamiento del agente a la función que necesitas priorizar.</p>
                </div>
                <div className="field-control">
                  <select
                    id="cfg-agent-profile"
                    className="select-input"
                    value={geminiConfig.profile}
                    onChange={(e) => setGeminiConfig((c) => ({ ...c, profile: e.target.value as AgentProfileId }))}
                  >
                    {Object.entries(AGENT_PROFILES).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                  <small style={{ display: 'block', marginTop: 6, fontSize: '11.5px', color: '#64748b' }}>
                    {AGENT_PROFILES[geminiConfig.profile]?.desc}
                  </small>
                </div>
              </div>

              {/* Fila: Tono */}
              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-agent-tone">Tono de Comunicación</label>
                  <p>Ajusta el estilo de redacción de las respuestas.</p>
                </div>
                <div className="field-control">
                  <select
                    id="cfg-agent-tone"
                    className="select-input"
                    value={geminiConfig.tone}
                    onChange={(e) => setGeminiConfig((c) => ({ ...c, tone: e.target.value as AgentToneId }))}
                  >
                    {Object.entries(AGENT_TONES).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila: Temperatura */}
              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-agent-temp">Temperatura ({geminiConfig.temperature.toFixed(1)})</label>
                  <p>Controla el balance entre precisión estricta (0.0) y creatividad exploratoria (1.0).</p>
                </div>
                <div className="field-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      id="cfg-agent-temp"
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      style={{ flex: 1, accentColor: '#0066ff' }}
                      value={geminiConfig.temperature}
                      onChange={(e) => setGeminiConfig((c) => ({ ...c, temperature: parseFloat(e.target.value) }))}
                    />
                    <b style={{ minWidth: 40, fontSize: '13px', color: '#0f172a' }}>
                      {geminiConfig.temperature <= 0.2 ? 'Normativo' : geminiConfig.temperature <= 0.5 ? 'Balanceado' : 'Creativo'}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Directivas de Gobernanza */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2>Directivas Adicionales de Gobernanza</h2>
                  <p>Instrucciones y lineamientos especiales que el agente debe cumplir en cada respuesta.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-agent-directives">Instrucciones del Sistema Personalizadas</label>
                  <p>Añade reglas de negocio regionales (ej. nombres de UGEL prioritarias, formatos de actas, directivas MINEDU).</p>
                </div>
                <div className="field-control">
                  <textarea
                    id="cfg-agent-directives"
                    rows={4}
                    className="select-input"
                    style={{ width: '100%', resize: 'vertical', lineHeight: 1.45, fontSize: '12.5px' }}
                    placeholder="Ejemplo: Priorizar siempre los entregables de la UGEL Satipo y Chanchamayo. Citar siempre el número de oficio rector correspondiente."
                    value={geminiConfig.customDirectives}
                    onChange={(e) => setGeminiConfig((c) => ({ ...c, customDirectives: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
