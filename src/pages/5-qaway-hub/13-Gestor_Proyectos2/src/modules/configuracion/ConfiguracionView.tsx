// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import './configuracion.css';
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FolderKanban,
  Globe2,
  Key,
  Layers,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
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

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string;
  budget?: string;
  sponsor?: string;
  riskLevel?: string;
  metodologia?: string;
}

export interface ConfiguracionViewProps {
  onActions?: (h: ConfigBinds) => void;
  projects?: ProjectItem[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  onUpdateProject?: (updated: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
}

const TIMEZONES = [
  { id: 'America/Lima', label: 'America/Lima (UTC-05:00) · Hora Oficial de Perú' },
  { id: 'America/Bogota', label: 'America/Bogota (UTC-05:00) · Colombia / Región Andina' },
  { id: 'America/La_Paz', label: 'America/La_Paz (UTC-04:00) · Bolivia' },
  { id: 'America/Santiago', label: 'America/Santiago (UTC-04:00) · Chile' },
  { id: 'UTC', label: 'UTC (UTC+00:00) · Tiempo Universal Coordinado' },
];

export default function ConfiguracionView({
  onActions,
  projects = [],
  activeProjectId = 'p1',
  onSelectProject,
  onUpdateProject,
  onDeleteProject,
}: ConfiguracionViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'proyectos' | 'cronograma' | 'auditoria' | 'asistente'>('general');
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

  // Proyecto activo en configuración
  const currentProj = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || {
      id: 'p1',
      code: 'PRJ-MIN-2027-01',
      name: 'MINEDU · Dotación 2027',
      region: 'Junín',
      subtext: 'Seguimiento de operaciones',
    };
  }, [projects, activeProjectId]);

  const [editName, setEditName] = useState(currentProj.name);
  const [editCode, setEditCode] = useState(currentProj.code);
  const [editRegion, setEditRegion] = useState(currentProj.region || '');
  const [editSubtext, setEditSubtext] = useState(currentProj.subtext || '');
  
  // Flujo estricto de eliminación en dos pasos (Doble candado de confirmación)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [typedProjectName, setTypedProjectName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const openDeleteFlow = () => {
    setDeleteStep(1);
    setTypedProjectName('');
    setAdminPassword('');
    setDeleteError('');
  };

  const closeDeleteFlow = () => {
    setDeleteStep(0);
    setTypedProjectName('');
    setAdminPassword('');
    setDeleteError('');
  };

  useEffect(() => {
    setEditName(currentProj.name);
    setEditCode(currentProj.code);
    setEditRegion(currentProj.region || '');
    setEditSubtext(currentProj.subtext || '');
  }, [currentProj]);

  const handleSaveCurrentProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      notify('El nombre del proyecto no puede estar vacío');
      return;
    }
    onUpdateProject?.({
      ...currentProj,
      name: editName.trim(),
      code: editCode.trim() || currentProj.code,
      region: editRegion.trim(),
      subtext: editSubtext.trim(),
    });
    notify(`Proyecto "${editName}" actualizado correctamente.`);
  };

  const handleExportProject = () => {
    const ganttData = localStorage.getItem(`qaway-gantt-items-${currentProj.id}`) || '[]';
    const payload = {
      project: currentProj,
      cronograma: JSON.parse(ganttData),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_${currentProj.code || currentProj.id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Copia de seguridad del proyecto exportada con éxito.');
  };

  const handleConfirmDelete = () => {
    if (typedProjectName.trim() !== currentProj.name.trim()) {
      setDeleteError('El nombre ingresado no coincide con el proyecto activo.');
      return;
    }
    if (!adminPassword.trim()) {
      setDeleteError('Ingresa tu clave de autorización institucional.');
      return;
    }
    const targetId = currentProj.id;
    const targetName = currentProj.name;
    closeDeleteFlow();
    onDeleteProject?.(targetId);
    notify(`Proyecto "${targetName}" eliminado definitivamente. Redirigiendo...`);
  };

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
            className={`tab-item ${activeTab === 'proyectos' ? 'active' : ''}`}
            onClick={() => setActiveTab('proyectos')}
          >
            <FolderKanban size={15} />
            <span>Gestión del Proyecto Activo</span>
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

        {activeTab === 'proyectos' && (
          <div className="cards-grid">
            {/* Tarjeta 1: Parámetros y Datos del Proyecto */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h2>Configuración y Datos del Proyecto Activo</h2>
                  <p>
                    Edita el nombre oficial, código identificador y ámbito operativo del proyecto activo.
                  </p>
                </div>
              </div>

              {/* Selector de proyecto si hay múltiples */}
              {(projects || []).length > 1 && (
                <div className="form-row">
                  <div className="field-info">
                    <label>Proyecto en Edición</label>
                    <p>Selecciona qué proyecto deseas parametrizar o gestionar.</p>
                  </div>
                  <div className="field-control">
                    <select
                      value={currentProj.id}
                      onChange={(e) => onSelectProject?.(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: 600,
                      }}
                    >
                      {(projects || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCurrentProject}>
                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-name">Nombre del Proyecto *</label>
                    <p>Título identificador visible en la barra superior, cronograma y reportes.</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-code">Código Oficial</label>
                    <p>Identificador correlativo del proyecto para reportes y exportaciones.</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-code"
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-region">Ámbito / Zona Operativa</label>
                    <p>Zona o territorio donde operan las sedes y supervisores de campo.</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-region"
                      type="text"
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      placeholder="Ej. Zona Centro, Lima Norte, Frentes Regionales..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleExportProject}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Download size={14} />
                    <span>Exportar Copia de Seguridad (JSON)</span>
                  </button>
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#0066ff',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 102, 255, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Save size={14} />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tarjeta 2: Zona de Peligro (Danger Zone) */}
            <div
              className="cfg-card"
              style={{
                border: '1px solid #fecaca',
                background: '#fffafb',
              }}
            >
              <div className="card-header" style={{ borderBottomColor: '#fee2e2' }}>
                <div
                  className="card-icon-wrap"
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 style={{ color: '#991b1b' }}>Zona de Peligro · Gestión del Proyecto</h2>
                  <p style={{ color: '#7f1d1d' }}>
                    Acciones irreversibles que impactan la disponibilidad del proyecto y sus datos asociados.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                }}
              >
                <div>
                  <b style={{ fontSize: '13px', color: '#991b1b', display: 'block' }}>
                    Eliminar permanentemente este proyecto
                  </b>
                  <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Se borrará el proyecto "{currentProj.name}", su cronograma Gantt, tareas y sedes asignadas.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openDeleteFlow}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #f87171',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Eliminar Proyecto</span>
                </button>
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
                    placeholder="Ejemplo: Priorizar siempre los entregables de las sedes críticas. Citar siempre el número de acta o hito correspondiente."
                    value={geminiConfig.customDirectives}
                    onChange={(e) => setGeminiConfig((c) => ({ ...c, customDirectives: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales de Confirmación de Borrado: Doble Candado Estricto con Diseño Qaway */}
      {deleteStep > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
            animation: 'fadeInPop 0.18s ease-out',
          }}
          onClick={closeDeleteFlow}
        >
          {deleteStep === 1 ? (
            /* PASO 1: Alerta Inicial de Impacto e Irreversibilidad */
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(480px, 94vw)',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '26px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 10px 24px -4px rgba(15, 23, 42, 0.15)',
                border: '1px solid #fee2e2',
                animation: 'fadeInPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Alerta de Seguridad · Paso 1 de 2
                  </div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#0f172a', lineHeight: 1.3 }}>
                    ¿Eliminar permanentemente este proyecto?
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b' }}>
                    Acción crítica e irreversible
                  </small>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Proyecto a eliminar:</div>
                <div style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a' }}>{currentProj.name}</div>
                <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>{currentProj.code} · {currentProj.region || 'Ámbito General'}</div>
              </div>

              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                Esta acción <b style={{ color: '#dc2626' }}>borrará de forma irrecuperable</b> todos los hitos, cronogramas Gantt, frentes y tareas asignadas. Ningún dato podrá restaurarse automáticamente; cualquier consulta de recuperación dependerá de base de datos con el Administrador del Sistema.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeDeleteFlow}
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteStep(2);
                    setDeleteError('');
                  }}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Continuar a confirmación</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            /* PASO 2: Confirmación con Nombre Exacto del Proyecto y Clave */
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(500px, 94vw)',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '26px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 10px 24px -4px rgba(15, 23, 42, 0.15)',
                border: '1.5px solid #dc2626',
                animation: 'fadeInPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#991b1b',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: '#fef2f2', color: '#991b1b', fontSize: '11px', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Confirmación de Autorización · Paso 2 de 2
                  </div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#0f172a', lineHeight: 1.3 }}>
                    Escribe el nombre del proyecto para destruir
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b' }}>
                    Se requiere verificación explícita antes de purgar
                  </small>
                </div>
              </div>

              <p style={{ margin: '0 0 14px', fontSize: '12.8px', color: '#475569', lineHeight: 1.5 }}>
                Para confirmar la eliminación permanente, escribe exactamente: <br />
                <code style={{ display: 'inline-block', margin: '6px 0', padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontWeight: 750, fontSize: '13px' }}>
                  {currentProj.name}
                </code>
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#334155', marginBottom: '6px' }}>
                  Nombre exacto del proyecto:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={typedProjectName}
                  onChange={(e) => {
                    setTypedProjectName(e.target.value);
                    if (deleteError) setDeleteError('');
                  }}
                  placeholder={currentProj.name}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#334155', marginBottom: '6px' }}>
                  Clave o PIN de autorización del Coordinador:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (deleteError) setDeleteError('');
                  }}
                  placeholder="Ingresa clave de confirmación institucional..."
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {deleteError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '12.5px', marginBottom: '16px' }}>
                  <AlertCircle size={15} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDeleteStep(1)}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Volver atrás
                </button>
                <button
                  type="button"
                  disabled={typedProjectName.trim() !== currentProj.name.trim() || !adminPassword.trim()}
                  onClick={handleConfirmDelete}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    border: 'none',
                    background: typedProjectName.trim() === currentProj.name.trim() && adminPassword.trim() ? '#b91c1c' : '#94a3b8',
                    color: '#ffffff',
                    borderRadius: '9px',
                    fontSize: '13px',
                    fontWeight: 650,
                    cursor: typedProjectName.trim() === currentProj.name.trim() && adminPassword.trim() ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: typedProjectName.trim() === currentProj.name.trim() && adminPassword.trim() ? '0 2px 8px rgba(185, 28, 28, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={15} />
                  <span>Destruir Proyecto Definitivamente</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
