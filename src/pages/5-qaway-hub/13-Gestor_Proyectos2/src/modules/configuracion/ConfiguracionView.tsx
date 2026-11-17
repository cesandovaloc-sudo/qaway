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
  RefreshCw,
  ChevronRight,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Trash2,
  Users,
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
import { CONFIGURABLE_MODULES } from '../../types';
import TipoProyectoCatalogoSelect from '../../components/TipoProyectoCatalogoSelect';
import CicloVidaEstadoChip from '../../components/CicloVidaEstadoChip';
import { capacidadesDeProyecto, historialEstado } from '../../services/gpCicloVidaService';

export type ConfigBinds = { notify: (m: string) => void };

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string | undefined;
  descProyecto?: string | undefined;
  descSedes?: string | undefined;
  moduleDescriptions?: Record<string, string> | undefined;
  budget?: string | undefined;
  sponsor?: string | undefined;
  riskLevel?: string | undefined;
  metodologia?: string | undefined;
}

export interface ConfiguracionViewProps {
  onActions?: (h: ConfigBinds) => void;
  projects?: ProjectItem[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  onUpdateProject?: (updated: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
  /** Etapa 6.3: navegar a la ficha Resumen (donde viven las acciones de dirección). */
  onIrAFicha?: () => void;
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
  onIrAFicha,
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
      name: 'Distribución de Materiales DOT 2027',
      region: 'Junín',
      subtext: 'Seguimiento de operaciones',
    };
  }, [projects, activeProjectId]);

  const [editName, setEditName] = useState(currentProj.name);
  const [editCode, setEditCode] = useState(currentProj.code);
  const [editRegion, setEditRegion] = useState(currentProj.region || '');
  const [editSubtext, setEditSubtext] = useState(currentProj.subtext || '');
  const [selectedModuleKey, setSelectedModuleKey] = useState<string>(CONFIGURABLE_MODULES[0]?.key || 'cronograma');
  const [moduleDescriptions, setModuleDescriptions] = useState<Record<string, string>>(() => {
    return {
      cronograma: currentProj.moduleDescriptions?.['cronograma'] || currentProj.descProyecto || '',
      sedes: currentProj.moduleDescriptions?.['sedes'] || currentProj.descSedes || '',
      ...(currentProj.moduleDescriptions || {}),
    };
  });

  // -------------------------------------------------------------------------
  // Etapa 6.3 · Clasificación (tipo) y ciclo de vida (estado, solo lectura)
  // -------------------------------------------------------------------------
  const [editTipo, setEditTipo] = useState<string | null>(currentProj.tipoProyectoCodigo ?? null);
  /** Capacidades del usuario real del Hub sobre el proyecto activo (fail-closed). */
  const [capacidadesProy, setCapacidadesProy] = useState(null);
  /** Historial de cambios de estado (gp_eventos_auditoria) para la pestaña auditoría. */
  const [historialProy, setHistorialProy] = useState(null);
  const [historialCargando, setHistorialCargando] = useState(false);

  const cargarHistorialProy = () => {
    setHistorialCargando(true);
    historialEstado(currentProj.id).then((r) => {
      setHistorialProy(r);
      setHistorialCargando(false);
    });
  };

  useEffect(() => {
    setEditTipo(currentProj.tipoProyectoCodigo ?? null);
  }, [currentProj]);

  useEffect(() => {
    let vigente = true;
    capacidadesDeProyecto(currentProj.id).then((r) => {
      if (vigente) setCapacidadesProy(r);
    });
    return () => {
      vigente = false;
    };
  }, [currentProj.id]);
  
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
    setModuleDescriptions({
      cronograma: currentProj.moduleDescriptions?.['cronograma'] || currentProj.descProyecto || '',
      sedes: currentProj.moduleDescriptions?.['sedes'] || currentProj.descSedes || '',
      ...(currentProj.moduleDescriptions || {}),
    });
  }, [currentProj]);

  const handleSaveCurrentProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      notify('El nombre del proyecto no puede estar vacío');
      return;
    }
    const cronoDesc = (moduleDescriptions['cronograma'] || '').trim();
    const sedesDesc = (moduleDescriptions['sedes'] || '').trim();
    onUpdateProject?.({
      ...currentProj,
      name: editName.trim(),
      code: editCode.trim() || currentProj.code,
      region: editRegion.trim(),
      subtext: editSubtext.trim(),
      descProyecto: cronoDesc,
      descSedes: sedesDesc,
      // Etapa 6.3: la clasificación se conserva (se edita desde su tarjeta).
      tipoProyectoCodigo: editTipo || undefined,
      moduleDescriptions: {
        ...moduleDescriptions,
        cronograma: cronoDesc,
        sedes: sedesDesc,
      },
    });
    notify(`Proyecto "${editName}" actualizado correctamente.`);
  };

  /** Etapa 6.3: guarda SOLO la clasificación (tipo) del proyecto activo. */
  const handleGuardarClasificacion = () => {
    onUpdateProject?.({ ...currentProj, tipoProyectoCodigo: editTipo || undefined });
    notify(editTipo ? `Clasificación actualizada: "${editTipo}".` : 'Clasificación actualizada: "Sin clasificar".');
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

                {/* Configuración dinámica de cabeceras por módulo */}
                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-module-select">Módulo a configurar</label>
                    <p>Elige el módulo para personalizar el texto que aparece bajo su título principal.</p>
                  </div>
                  <div className="field-control">
                    <select
                      id="cfg-proj-module-select"
                      value={selectedModuleKey}
                      onChange={(e) => setSelectedModuleKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                        background: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {CONFIGURABLE_MODULES.map((mod) => (
                        <option key={mod.key} value={mod.key}>
                          {mod.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-module-desc">
                      Subtítulo de Cabecera · {CONFIGURABLE_MODULES.find((m) => m.key === selectedModuleKey)?.name || 'Módulo'}
                    </label>
                    <p>Texto corto de una sola línea mostrado a los usuarios en la cabecera de este módulo.</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-module-desc"
                      type="text"
                      value={moduleDescriptions[selectedModuleKey] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModuleDescriptions((prev) => ({
                          ...prev,
                          [selectedModuleKey]: val,
                        }));
                      }}
                      placeholder={CONFIGURABLE_MODULES.find((m) => m.key === selectedModuleKey)?.defaultSubtitle || 'Subtítulo del módulo...'}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                      }}
                    />
                    <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Vista previa:</span>
                      <strong style={{ color: '#0284c7', fontWeight: 600 }}>
                        {moduleDescriptions[selectedModuleKey]?.trim() || CONFIGURABLE_MODULES.find((m) => m.key === selectedModuleKey)?.defaultSubtitle}
                      </strong>
                    </div>
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

             {/* Tarjeta: Clasificación del Proyecto (Etapa 6.3 — tipo, catálogo real) */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Tags size={20} />
                </div>
                <div>
                  <h2>Clasificación del Proyecto</h2>
                  <p>
                    Tipo administrativo del proyecto (obra pública, inversión, mantenimiento, servicio, mejora interna u otro).
                    Es clasificación para filtros y reportes: NO modifica la EDT ni el cronograma.
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Tipo de Proyecto (gp_tipos_proyecto_c)</label>
                  <p>Persistencia definitiva: <b>gp_proyectos.tipo_proyecto_codigo</b> (0002 · FK por código). "Sin clasificar" = NULL (B-8).</p>
                </div>
                <div className="field-control">
                  <TipoProyectoCatalogoSelect
                    value={editTipo || null}
                    onChange={(codigo) => setEditTipo(codigo)}
                    disabled={capacidadesProy ? !capacidadesProy.capacidades?.editarTipo : false}
                  />
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
                    {capacidadesProy == null && <span>Verificando permisos con la sesión del Hub…</span>}
                    {capacidadesProy && capacidadesProy.estado === 'ok' && (capacidadesProy.capacidades?.editarTipo
                      ? <span style={{ color: '#047857', fontWeight: 600 }}>✓ Tu rol permite editar la clasificación.</span>
                      : <span>Solo consulta: editar la clasificación requiere gerente del proyecto, admin de empresa o plataforma.</span>)}
                    {capacidadesProy && capacidadesProy.estado === 'sin_sesion' && (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>Sin sesión del Hub (fail-closed): inicia sesión para editar la clasificación.</span>
                    )}
                    {capacidadesProy && capacidadesProy.estado === 'indisponible' && (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>No se pudo verificar el rol (fail-closed): {capacidadesProy.mensaje}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGuardarClasificacion}
                    disabled={capacidadesProy ? !capacidadesProy.capacidades?.editarTipo : true}
                    style={{
                      marginTop: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #7c3aed',
                      background: capacidadesProy?.capacidades?.editarTipo ? '#7c3aed' : '#ede9fe',
                      color: capacidadesProy?.capacidades?.editarTipo ? '#ffffff' : '#a78bfa',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: capacidadesProy?.capacidades?.editarTipo ? 'pointer' : 'not-allowed',
                    }}
                    title="Guarda el tipo del proyecto activo"
                  >
                    <Save size={14} />
                    <span>Guardar Clasificación</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta: Estado y Ciclo de Vida (Etapa 6.3 — SOLO LECTURA aquí) */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2>Estado y Ciclo de Vida · Solo Lectura</h2>
                  <p>
                    El estado general es una condición de DIRECCIÓN: se consulta aquí, pero se cambia desde la ficha del
                    proyecto (iniciar, pausar, reanudar, completar, cancelar, reabrir — con motivo y auditoría).
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Estado general actual</label>
                  <p>Persistencia definitiva: <b>gp_proyectos.estado_codigo</b> (0002 · FK a gp_estados_proyecto_c). Cada transición queda en gp_eventos_auditoria.</p>
                </div>
                <div className="field-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <CicloVidaEstadoChip codigo={currentProj.estadoCodigo ?? null} />
                    {onIrAFicha && (
                      <button
                        type="button"
                        onClick={onIrAFicha}
                        title="Las acciones de dirección se realizan desde la ficha del proyecto"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronRight size={13} />
                        <span>Acciones en la ficha Resumen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Equipo y Accesos (Etapa 6.3 — estado del bloqueo honesto) */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#fffbeb', color: '#b45309' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2>Equipo y Accesos (roles del proyecto)</h2>
                  <p>
                    Aquí se administrará el equipo del proyecto con roles (`gp_roles_proyecto_c` + `gp_proyecto_miembros_r`):
                    permisos asignados a ROLES, nunca a personas sueltas. La pertenencia al proyecto no otorga permisos administrativos.
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
                  border: '1px solid #fde68a',
                }}
              >
                <div>
                  <b style={{ fontSize: '13px', color: '#92400e', display: 'block' }}>
                    ⚠️ Bloqueado por discrepancia estructural · SQL de resolución preparado
                  </b>
                  <span style={{ fontSize: '12px', color: '#78350f', lineHeight: 1.5 }}>
                    La tabla viva tiene 9 columnas frente a las 10 del SQL del repo (`5.4` §3). La resolución ADITIVA y no
                    destructiva está lista en <b>20261115_0008</b> (completa columnas faltantes + seed de 6 roles con la matriz
                    de permisos en `permisos jsonb`). Tras aplicarla (y con `0003`), esta sección gestionará integrantes y roles.
                  </span>
                </div>
              </div>
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

            {/* Tarjeta: Historial de estado del proyecto (Etapa 6.3 — gp_eventos_auditoria) */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Clock3 size={20} />
                </div>
                <div>
                  <h2>Historial de Estado del Proyecto</h2>
                  <p>
                    Transiciones de dirección (STATE_CHANGE) registradas en <b>gp_eventos_auditoria</b>: actor, fecha y motivo
                    de cada iniciar / pausar / reanudar / completar / cancelar / reabrir. Sin tablas nuevas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={cargarHistorialProy}
                disabled={historialCargando}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 13px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: historialCargando ? 'wait' : 'pointer',
                  marginBottom: '10px',
                }}
                title="Consulta el historial de transiciones del proyecto activo"
              >
                <RefreshCw size={13} />
                <span>{historialCargando ? 'Consultando…' : 'Consultar historial'}</span>
              </button>

              {historialProy == null && (
                <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                  Pulsa "Consultar historial" para leer los registros del proyecto <b>{currentProj.name}</b>.
                </p>
              )}

              {historialProy && historialProy.estado === 'vacio' && (
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Sin registros de cambio de estado todavía. Aparecerán al ejecutar acciones de dirección
                  (requiere la capa gp_* aplicada: SQL 0008 → 0009 → 0010 + prerrequisitos).
                </p>
              )}

              {historialProy && historialProy.estado === 'error' && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '12px', fontWeight: 600 }}>
                  {historialProy.mensaje}
                </div>
              )}

              {historialProy && historialProy.estado === 'lista' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {historialProy.eventos.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 700 }}>
                          {ev.estadoAnterior || 'Sin clasificar'} <span style={{ color: '#94a3b8' }}>→</span> {ev.estadoNuevo || 'Sin clasificar'}
                          {ev.accion && (
                            <span style={{ marginLeft: '8px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.4px', color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {ev.accion}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: 1.45 }}>
                          {ev.ocurridoAt ? new Date(ev.ocurridoAt).toLocaleString('es-PE') : '—'}
                          {ev.motivo ? <> · Motivo: <b>{ev.motivo}</b></> : ' · Sin motivo registrado'}
                          {ev.actorUserId ? <> · Actor: {ev.actorUserId.slice(0, 8)}…</> : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
