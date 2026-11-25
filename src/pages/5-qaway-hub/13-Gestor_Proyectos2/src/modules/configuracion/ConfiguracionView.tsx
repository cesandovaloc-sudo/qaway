// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
  Info,
  Key,
  Layers,
  Pencil,
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
  UserRound,
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
import PermisosTab from './PermisosTab';
import OrganizacionTab from './OrganizacionTab';
import PerfilTab from './PerfilTab';
import PreferenciasTab from './PreferenciasTab';
import EmpresaTab from './EmpresaTab';
import SelectEstilizado from './SelectEstilizado';
import { MiniCalendar } from '../cronograma-gantt/CronogramaGanttView';
import {
  DIAS_SEMANA_ORDEN,
  aplicarColchonAdelantoItems,
  getParametrosCronograma,
  saveParametrosCronograma,
  type AlertaColchonPaquete,
  type FrecuenciaCorte,
  type MetodoPonderacion,
  type ParametrosCronograma,
  type SemanaLaboral,
} from '../../services/gpCronogramaConfigService';
import {
  fetchCronogramaFromSupabase,
  syncAllCronogramaItemsToSupabase,
  type GanttItemData,
} from '../../services/gestorCronogramaService';
import { usePerfilGp } from '../../services/gpPermisosService';
import { usePerfilVisible } from '../../services/perfilVisibleService';
import { listarUnidadesParaJerarquia } from '../../services/organizacionJerarquiaLectura';
import { supabase } from '../../services/supabaseClient';

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
  /** Topbar: abre un tab concreto CADA VEZ (seq cambia aunque repitan el tab). */
  tabRequest?: { tab: string; seq: number } | null;
  /** El notify local de este archivo ya existe; este es el del shell. */
  notifyExterno?: (msg: string) => void;
}

const TIMEZONES = [
  { id: 'America/Lima', label: 'America/Lima (UTC-05:00) · Hora Oficial de Perú' },
  { id: 'America/Bogota', label: 'America/Bogota (UTC-05:00) · Colombia / Región Andina' },
  { id: 'America/La_Paz', label: 'America/La_Paz (UTC-04:00) · Bolivia' },
  { id: 'America/Santiago', label: 'America/Santiago (UTC-04:00) · Chile' },
  { id: 'UTC', label: 'UTC (UTC+00:00) · Tiempo Universal Coordinado' },
];

function sugerirCodigoProyecto(nombre: string): string {
  const limpio = (nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .trim();
  if (!limpio) return `PRJ-${new Date().getFullYear()}`;
  const tokens = limpio.split(/\s+/).filter(Boolean);
  const anio = tokens.find((t) => /^(19|20)\d{2}$/.test(t));
  const palabras = tokens.filter((t) => t !== anio && !['DE', 'DEL', 'LA', 'LAS', 'EL', 'LOS', 'Y', 'EN', 'PARA'].includes(t));
  const siglas = palabras.slice(0, 2).map((p) => p.slice(0, 3)).join('-');
  const sufijo = anio || String(new Date().getFullYear());
  return siglas ? `${siglas}-${sufijo}` : `PRJ-${sufijo}`;
}

export default function ConfiguracionView({
  onActions,
  projects = [],
  activeProjectId = '',
  onSelectProject,
  onUpdateProject,
  onDeleteProject,
  onIrAFicha,
  tabRequest,
  notifyExterno,
}: ConfiguracionViewProps) {
  type TabId = 'perfil' | 'preferencias' | 'empresa' | 'organizacion' | 'general' | 'proyectos' | 'cronograma' | 'auditoria' | 'asistente' | 'permisos';
  const CONFIG_BASE = '/hub/gestor_proyectos/configuracion';
  const TAB_TO_SLUG: Record<TabId, string> = {
    perfil: 'perfil',
    preferencias: 'preferencias',
    empresa: 'empresa',
    organizacion: 'organizacion',
    permisos: 'permisos',
    general: 'zona-horaria',
    proyectos: 'proyecto',
    cronograma: 'tolerancias',
    auditoria: 'seguridad',
    asistente: 'asistente',
  };
  const SLUG_TO_TAB: Record<string, TabId> = {
    perfil: 'perfil',
    preferencias: 'preferencias',
    empresa: 'empresa',
    organizacion: 'organizacion',
    permisos: 'permisos',
    'zona-horaria': 'general',
    proyecto: 'proyectos',
    tolerancias: 'cronograma',
    seguridad: 'auditoria',
    asistente: 'asistente',
  };

  const location = useLocation();
  const navigate = useNavigate();

  const tabDesdeRuta = (pathname: string): TabId | null => {
    const clean = pathname.replace(/\/+$/, '');
    if (!clean.startsWith(`${CONFIG_BASE}/`)) return null;
    const sub = clean.slice(CONFIG_BASE.length + 1).split('/')[0] || '';
    return SLUG_TO_TAB[sub] ?? null;
  };

  const [activeTab, setActiveTab] = useState<TabId>(() => tabDesdeRuta(location.pathname) ?? 'organizacion');

  useEffect(() => {
    const clean = location.pathname.replace(/\/+$/, '');
    const fromUrl = tabDesdeRuta(clean);
    if (fromUrl) {
      if (fromUrl !== activeTab) setActiveTab(fromUrl);
    } else if (clean === CONFIG_BASE) {
      navigate(`${CONFIG_BASE}/${TAB_TO_SLUG[activeTab]}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const selectTab = (nextTab: TabId) => {
    setActiveTab(nextTab);
    const targetUrl = `${CONFIG_BASE}/${TAB_TO_SLUG[nextTab]}`;
    if (location.pathname !== targetUrl) {
      navigate(targetUrl);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  // Etapa 6-B: perfil GP real. El gating de guardado SOLO aplica con sesión
  // real (perfilGp no nulo); en modo local se conserva el comportamiento actual.
  const { perfil: perfilGp, capacidades: capGp } = usePerfilGp();
  const esAdmin = !perfilGp || Boolean(
    perfilGp.esPlataforma || perfilGp.rol === 'admin' || capGp?.administrarPermisos
  );
  const puedeEliminarProyecto = !perfilGp || Boolean(capGp?.eliminarProyecto);
  const puedeEditarProyecto = !perfilGp || Boolean(capGp?.editarProyecto);
  const puedeVerTab = (tab: TabId): boolean => {
    switch (tab) {
      case 'perfil':
      case 'empresa':
        return true;
      case 'preferencias':
        return Boolean(perfilGp?.esPlataforma);
      case 'proyectos':
        return esAdmin || Boolean(capGp?.editarProyecto) || Boolean(capGp?.eliminarProyecto);
      case 'cronograma':
        return esAdmin || Boolean(capGp?.administrarEdt);
      case 'organizacion':
      case 'permisos':
      case 'general':
      case 'auditoria':
      case 'asistente':
        return esAdmin;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (!puedeVerTab(activeTab)) {
      selectTab('perfil');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, esAdmin, capGp?.editarProyecto, capGp?.eliminarProyecto, capGp?.administrarEdt, perfilGp?.esPlataforma]);

  // Keep-alive: Configuración NO se desmonta al cambiar de módulo. useState(tab)
  // no bastaba: si el usuario estaba en otra pestaña, el clic del Topbar no
  // cambiaba nada. seq dispara el cambio incluso repetido el mismo tab.
  useEffect(() => {
    if (tabRequest?.tab) selectTab(tabRequest.tab as TabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabRequest?.seq]);
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('qaway-system-timezone-v1') || 'America/Lima';
  });

  const [dateMode, setDateMode] = useState<'real' | 'custom'>(() => {
    return (localStorage.getItem('qaway-system-date-mode-v1') as 'real' | 'custom') || 'real';
  });

  const [customDate, setCustomDate] = useState(() => {
    return localStorage.getItem('qaway-system-date-v1') || '2026-10-28';
  });

  const [cronoParams, setCronoParams] = useState<ParametrosCronograma>(() => getParametrosCronograma());
  const [cronoParamsGuardado, setCronoParamsGuardado] = useState<ParametrosCronograma>(() => getParametrosCronograma());
  const [aplicandoColchon, setAplicandoColchon] = useState(false);
  const [alertasColchon, setAlertasColchon] = useState<AlertaColchonPaquete[]>([]);
  const [resumenColchon, setResumenColchon] = useState<string | null>(null);
  const [editandoProyecto, setEditandoProyecto] = useState(false);
  const [editandoCrono, setEditandoCrono] = useState(false);
  const [editandoGeneral, setEditandoGeneral] = useState(false);
  const [generalCalOpen, setGeneralCalOpen] = useState(false);
  useEffect(() => {
    if (!generalCalOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.cfg-date-picker-wrap')) setGeneralCalOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [generalCalOpen]);
  const [editandoAsistente, setEditandoAsistente] = useState(false);

  const estiloSoloLectura: React.CSSProperties = {
    background: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#64748b',
    cursor: 'not-allowed',
  };

  const renderBannerSoloLectura = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #bfdbfe',
        background: '#eff6ff',
        color: '#1d4ed8',
        fontSize: '13px',
        fontWeight: 500,
        marginBottom: '14px',
      }}
    >
      <Info size={16} style={{ flexShrink: 0 }} />
      <span>Solo lectura: estos datos los administra un administrador de la empresa.</span>
    </div>
  );

  const renderBotonEditar = (editando: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      style={{
        marginLeft: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        background: '#ffffff',
        color: '#0f172a',
        fontSize: '12.5px',
        fontWeight: 500,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {editando ? <X size={13} /> : <Pencil size={13} />}
      <span>{editando ? 'Cancelar' : 'Editar'}</span>
    </button>
  );

  // Proyecto activo en configuración
  const currentProj = useMemo(() => {
    // Sin proyectos del tenant: vacío. Nunca un proyecto MINEDU/DIGERE.
    return projects.find((p) => p.id === activeProjectId) || projects[0] || {
      id: '',
      code: '',
      name: '',
      region: '',
      subtext: '',
    };
  }, [projects, activeProjectId]);

  const [editName, setEditName] = useState(currentProj.name);
  const [editCode, setEditCode] = useState(currentProj.code);
  const [showCodeInfo, setShowCodeInfo] = useState(false);
  const [showPonderacionInfo, setShowPonderacionInfo] = useState(false);
  const [editBudget, setEditBudget] = useState(currentProj.budget || '');
  const { perfil: perfilVisible } = usePerfilVisible();
  const nombreEntidad = String(perfilVisible?.tenant?.name || '').trim() || 'Sin configurar en Datos de la Empresa';
  const [nombreAreaResponsable, setNombreAreaResponsable] = useState<string>('Cargando...');
  const [faltaSedePrincipal, setFaltaSedePrincipal] = useState<boolean>(false);
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
    if (!puedeEliminarProyecto) {
      notify('No tienes permiso para eliminar proyectos (requiere rol admin o la llave especial gp.eliminar_proyecto).');
      return;
    }
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
    setEditBudget(currentProj.budget || '');
    setModuleDescriptions({
      cronograma: currentProj.moduleDescriptions?.['cronograma'] || currentProj.descProyecto || '',
      sedes: currentProj.moduleDescriptions?.['sedes'] || currentProj.descSedes || '',
      ...(currentProj.moduleDescriptions || {}),
    });
  }, [currentProj]);

  useEffect(() => {
    const tenantId = perfilGp?.tenantId;
    if (!tenantId || !supabase) {
      setNombreAreaResponsable('Sin definir en Organización y Sedes');
      setFaltaSedePrincipal(false);
      return;
    }
    let vigente = true;
    const cargarEstadoOrganizacion = () => {
      if (!supabase) return;
      Promise.all([
        listarUnidadesParaJerarquia({ tenantId }).catch(() => []),
        supabase
          .from('gp_config_gestion_proyectos')
          .select('unidad_responsable_id, metadata')
          .eq('empresa_id', tenantId)
          .maybeSingle()
          .then((res) => res.data ?? null, () => null),
        supabase
          .from('gp_sedes')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', tenantId)
          .eq('es_principal', true)
          .then((res) => res.count ?? 0, () => 0),
        supabase
          .from('gp_sedes')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', tenantId)
          .then((res) => res.count ?? 0, () => 0),
      ]).then(([unidades, cfg, countPrincipal, countTotalSedes]) => {
        if (!vigente) return;
        const respId = cfg?.unidad_responsable_id ? String(cfg.unidad_responsable_id) : null;
        if (!respId) {
          setNombreAreaResponsable('Sin definir en Organización y Sedes');
        } else {
          const u = unidades.find((item) => item.id === respId);
          setNombreAreaResponsable(u?.name || 'Sin definir en Organización y Sedes');
        }
        const meta = (cfg?.metadata && typeof cfg.metadata === 'object' ? cfg.metadata : {}) as Record<string, unknown>;
        const modalidad = String(meta.modalidad_sedes || '');
        const tienePrincipal = countPrincipal > 0;
        const tieneSedes = countTotalSedes > 0;
        setFaltaSedePrincipal(modalidad !== 'sin_sede' && !tienePrincipal && (modalidad === 'una' || modalidad === 'varias' || tieneSedes));
      });
    };
    cargarEstadoOrganizacion();
    window.addEventListener('gp:organizacion-actualizada', cargarEstadoOrganizacion);
    return () => {
      vigente = false;
      window.removeEventListener('gp:organizacion-actualizada', cargarEstadoOrganizacion);
    };
  }, [perfilGp?.tenantId]);

  const handleSaveCurrentProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      notify('El nombre del proyecto no puede estar vacío');
      return;
    }
    // Etapa 6-B: gating solo con sesión real (modo local conserva la edición).
    if (perfilGp && !capGp.editarProyecto) {
      notify('Solo lectura: editar el proyecto requiere rol admin o la llave gp.editar_proyecto.');
      return;
    }
    const cronoDesc = (moduleDescriptions['cronograma'] || '').trim();
    const sedesDesc = (moduleDescriptions['sedes'] || '').trim();
    onUpdateProject?.({
      ...currentProj,
      name: editName.trim(),
      code: editCode.trim() || currentProj.code,
      budget: editBudget.trim(),
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
    setEditandoProyecto(false);
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
    if (!puedeEliminarProyecto) {
      setDeleteError('No tienes permiso para eliminar proyectos (requiere rol admin o la llave especial gp.eliminar_proyecto).');
      return;
    }
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
    saveParametrosCronograma(cronoParams);
    setCronoParamsGuardado(getParametrosCronograma());

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

    setEditandoCrono(false);
    setEditandoGeneral(false);
    setEditandoAsistente(false);
    notify('Configuración general y parámetros del Asistente IA guardados con éxito');
  };

  const currentDisplayDate = dateMode === 'custom' ? customDate : new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());

  return (
    <div className="cfg-v1">
      <div className="page">
        {notice && (
          <div style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
            padding: '10px 18px',
            borderRadius: '10px',
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
            <h1>Configuración y Parámetros del Sistema</h1>
            <p>
              Ajuste de zona horaria oficial, calibración de fecha operativa para seguimiento territorial y parámetros de tolerancia.
            </p>
          </div>
          {/* Botón global solo visible cuando la pestaña activa está en modo edición. */}
          {((activeTab === 'general' && editandoGeneral) ||
            (activeTab === 'cronograma' && editandoCrono) ||
            (activeTab === 'asistente' && editandoAsistente)) ? (
            <div className="heading-actions">
              <button type="button" className="btn-save" onClick={handleSave}>
                <Save size={15} />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          ) : null}
        </header>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <aside
            style={{
              width: '240px',
              flexShrink: 0,
              maxHeight: '100%',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ajuste..."
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '13.5px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
              }}
            />

            {[
              {
                group: 'Mi Cuenta',
                items: [
                  { id: 'perfil', label: 'Mi Perfil', icon: <UserRound size={15} /> },
                  ...(perfilGp?.esPlataforma ? [{ id: 'preferencias', label: 'Preferencias', icon: <SlidersHorizontal size={15} /> }] : []),
                ],
              },
              {
                group: 'Organización',
                items: [
                  { id: 'empresa', label: 'Datos de la Empresa', icon: <Building2 size={15} /> },
                  { id: 'organizacion', label: 'Organización y Sedes', icon: <Layers size={15} />, adminOnly: true },
                  { id: 'permisos', label: 'Permisos del Equipo', icon: <Users size={15} />, adminOnly: true },
                ],
              },
              {
                group: 'Proyecto y Operación',
                items: [
                  { id: 'proyectos', label: 'Gestión del Proyecto', icon: <FolderKanban size={15} /> },
                  { id: 'cronograma', label: 'Parámetros del Cronograma', icon: <Layers size={15} /> },
                  { id: 'general', label: 'Zona Horaria y Fecha', icon: <Clock3 size={15} /> },
                ],
              },
              {
                group: 'Sistema e IA',
                items: [
                  { id: 'auditoria', label: 'Seguridad y Auditoría', icon: <ShieldCheck size={15} />, adminOnly: true },
                  { id: 'asistente', label: 'Asistente IA (Copilot)', icon: <Bot size={15} /> },
                ],
              },
            ].map((section) => {
              const q = searchQuery.trim().toLowerCase();
              const filtered = section.items.filter(
                (i: { id: string; label: string }) => puedeVerTab(i.id as TabId) && (!q || i.label.toLowerCase().includes(q))
              );
              if (filtered.length === 0) return null;
              return (
                <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0 8px' }}>
                    {section.group}
                  </div>
                  {filtered.map((item) => (
                    <a
                      key={item.id}
                      href={`${CONFIG_BASE}/${TAB_TO_SLUG[item.id as TabId]}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        selectTab(item.id as TabId);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        background: activeTab === item.id ? '#f1f5f9' : 'transparent',
                        color: activeTab === item.id ? '#0f172a' : '#475569',
                        fontWeight: 500,
                      }}
                    >
                      {item.icon}
                      <span style={{ fontSize: '13.5px', flex: 1 }}>{item.label}</span>
                      {item.id === 'organizacion' && faltaSedePrincipal && (
                        <span
                          title="Te hace falta registrar la Sede Principal"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: 1,
                            padding: '3px 7px',
                            borderRadius: '999px',
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            flexShrink: 0,
                          }}
                        >
                          1
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              );
            })}
          </aside>

          <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', paddingRight: '4px', paddingBottom: '120px' }}>
            {activeTab === 'perfil' && <PerfilTab notify={notifyExterno || notify} />}
            {activeTab === 'preferencias' && <PreferenciasTab notify={notifyExterno || notify} />}
            {activeTab === 'empresa' && <EmpresaTab notify={notifyExterno || notify} />}
            {activeTab === 'organizacion' && <OrganizacionTab onSedePrincipalStatusChange={setFaltaSedePrincipal} />}

        {activeTab === 'general' && (
          <div className="cards-grid">
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <Globe2 size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2>Zona Horaria del Proyecto</h2>
                  <p>
                    Define el huso horario oficial para el cómputo de plazos, alertas de cierre de hitos y sincronización territorial.
                  </p>
                </div>
                {esAdmin && renderBotonEditar(editandoGeneral, () => setEditandoGeneral((v) => !v))}
              </div>
              {!esAdmin && renderBannerSoloLectura()}

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-timezone">Huso Horario Oficial</label>
                  <p>Aplica a todas las fechas de corte, reportes de gestores y actas del proyecto.</p>
                </div>
                <div className="field-control">
                  <SelectEstilizado
                    value={timezone}
                    disabled={!editandoGeneral}
                    options={TIMEZONES.map((tz) => ({ value: tz.id, label: tz.label }))}
                    onChange={(val) => setTimezone(val)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Modo de Fecha del Sistema</label>
                  <p>Determina si el cronograma toma la fecha real del computador o una fecha operativa de simulación/seguimiento.</p>
                </div>
                <div className="field-control">
                  <div className="radio-group">
                    <label className={`radio-card ${dateMode === 'real' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="dateMode"
                        disabled={!editandoGeneral}
                        checked={dateMode === 'real'}
                        onChange={() => setDateMode('real')}
                      />
                      <div className="radio-text">
                        <strong>Fecha en Tiempo Real del Dispositivo</strong>
                        <span>Toma la fecha y hora del reloj del equipo según la zona horaria seleccionada.</span>
                      </div>
                    </label>

                    <label className={`radio-card ${dateMode === 'custom' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="dateMode"
                        disabled={!editandoGeneral}
                        checked={dateMode === 'custom'}
                        onChange={() => setDateMode('custom')}
                      />
                      <div className="radio-text">
                        <strong>Fecha Operativa del Proyecto (Control de seguimiento)</strong>
                        <span>
                          Fija la fecha de control territorial para evaluar con precisión el estado de hitos pasados, presentes y futuros.
                        </span>
                        {dateMode === 'custom' && (
                          <div className="date-picker-wrap cfg-date-picker-wrap" style={{ position: 'relative' }}>
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                              <button
                                type="button"
                                className="date-input"
                                disabled={!editandoGeneral}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!editandoGeneral) return;
                                  setGeneralCalOpen((v) => !v);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  minWidth: '150px',
                                  cursor: editandoGeneral ? 'pointer' : 'not-allowed',
                                  ...(!editandoGeneral ? estiloSoloLectura : {}),
                                }}
                              >
                                <span>{customDate ? customDate.split('-').reverse().join('/') : 'Seleccionar'}</span>
                                <Calendar size={14} color="#64748b" />
                              </button>
                              {generalCalOpen && editandoGeneral && (
                                <MiniCalendar
                                  value={customDate}
                                  min="2026-09-01"
                                  max="2027-04-30"
                                  onChange={(val) => {
                                    setCustomDate(val);
                                    setGeneralCalOpen(false);
                                  }}
                                  onClose={() => setGeneralCalOpen(false)}
                                  align="left"
                                />
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              Fecha actual de seguimiento territorial: <strong>{customDate}</strong>
                            </span>
                          </div>
                        )}
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
                <div style={{ flex: 1 }}>
                  <h2>Configuración y Datos del Proyecto Activo</h2>
                  <p>
                    Edita el nombre oficial, código identificador y ficha general del proyecto activo.
                  </p>
                </div>
                {puedeEditarProyecto && renderBotonEditar(editandoProyecto, () => {
                  if (editandoProyecto) {
                    setEditName(currentProj.name);
                    setEditCode(currentProj.code);
                    setEditBudget(currentProj.budget || '');
                    setEditTipo(currentProj.tipoProyectoCodigo ?? null);
                  }
                  setEditandoProyecto((v) => !v);
                })}
              </div>
              {!puedeEditarProyecto && renderBannerSoloLectura()}

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
                      disabled={!editandoProyecto}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                        ...(!editandoProyecto ? estiloSoloLectura : {}),
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                      <input
                        id="cfg-proj-code"
                        type="text"
                        disabled={!editandoProyecto}
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        placeholder={`Sugerencia: ${sugerirCodigoProyecto(editName)}`}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          color: '#0f172a',
                          ...(!editandoProyecto ? estiloSoloLectura : {}),
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Información sobre formato de Código Oficial"
                        onClick={() => setShowCodeInfo((v) => !v)}
                        onBlur={() => setShowCodeInfo(false)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '36px',
                          flexShrink: 0,
                          borderRadius: '8px',
                          border: showCodeInfo ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                          background: showCodeInfo ? '#eff6ff' : '#ffffff',
                          color: showCodeInfo ? '#2563eb' : '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <Info size={15} />
                      </button>
                      {showCodeInfo && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            width: '280px',
                            zIndex: 50,
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            fontSize: '12px',
                            lineHeight: 1.45,
                            boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
                          }}
                        >
                          Usa siglas en <strong style={{ color: '#0f172a' }}>MAYÚSCULAS</strong> sin espacios (ej. <strong style={{ color: '#2563eb' }}>{sugerirCodigoProyecto(editName)}</strong>). Facilita identificar el proyecto en reportes y respaldos.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {esAdmin && (
                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-budget">Presupuesto Estimado</label>
                    <p>Monto referencial asignado para la ejecución del proyecto.</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-budget"
                      type="text"
                      disabled={!editandoProyecto}
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      placeholder="Ej. S/ 350,000"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                        ...(!editandoProyecto ? estiloSoloLectura : {}),
                      }}
                    />
                  </div>
                </div>
                )}

                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-entidad">Entidad</label>
                    <p>Empresa registrada en Datos de la Empresa (resumen cerrado).</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-entidad"
                      type="text"
                      value={nombreEntidad}
                      disabled
                      readOnly
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#64748b',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-info">
                    <label>Tipo de proyecto</label>
                    <p>Categoría administrativa del proyecto.</p>
                  </div>
                  <div className="field-control">
                    <TipoProyectoCatalogoSelect
                      value={editTipo || null}
                      disabled={!editandoProyecto}
                      onChange={(codigo) => setEditTipo(codigo)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-info">
                    <label htmlFor="cfg-proj-responsable">Área responsable</label>
                    <p>Unidad asignada en Organización y Sedes (resumen cerrado).</p>
                  </div>
                  <div className="field-control">
                    <input
                      id="cfg-proj-responsable"
                      type="text"
                      value={nombreAreaResponsable}
                      disabled
                      readOnly
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#64748b',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                {editandoProyecto && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
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
                )}
              </form>
            </div>

            {/* Tarjeta 2: Zona de Peligro (Danger Zone) */}
            {puedeEliminarProyecto && (
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
            )}
          </div>
        )}

        {activeTab === 'cronograma' && (
          <div className="cards-grid">
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <Calendar size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2>Calendario Laboral y Avance (Curva S)</h2>
                  <p>Reglas de días hábiles y ponderación del avance en el Cronograma.</p>
                </div>
                {esAdmin && renderBotonEditar(editandoCrono, () => {
                  if (editandoCrono) setCronoParams(cronoParamsGuardado);
                  setEditandoCrono((v) => !v);
                })}
              </div>
              {!esAdmin && renderBannerSoloLectura()}

              <div className="form-row">
                <div className="field-info">
                  <label>Semana laboral</label>
                  <p>Días hábiles usados para calcular duraciones, desviaciones y avance ponderado.</p>
                </div>
                <div className="field-control">
                  <SelectEstilizado
                    value={cronoParams.semanaLaboral}
                    disabled={!editandoCrono}
                    saved={
                      !editandoCrono &&
                      cronoParams.semanaLaboral === cronoParamsGuardado.semanaLaboral &&
                      (cronoParams.semanaLaboral !== 'personalizado' ||
                        cronoParams.diasLaboralesCustom.join(',') === cronoParamsGuardado.diasLaboralesCustom.join(','))
                    }
                    options={[
                      { value: 'lun-vie', label: 'Lunes a Viernes (5 días hábiles)' },
                      { value: 'lun-sab', label: 'Lunes a Sábado (6 días hábiles)' },
                      { value: 'lun-dom', label: 'Lunes a Domingo (7 días calendario)' },
                      { value: 'personalizado', label: 'Personalizado (elegir días)' },
                    ]}
                    onChange={(val) => setCronoParams((p) => ({ ...p, semanaLaboral: val as SemanaLaboral }))}
                  />
                  {cronoParams.semanaLaboral === 'personalizado' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {DIAS_SEMANA_ORDEN.map((d) => {
                        const activo = cronoParams.diasLaboralesCustom.includes(d.dow);
                        return (
                          <button
                            key={d.dow}
                            type="button"
                            disabled={!editandoCrono}
                            onClick={() => {
                              setCronoParams((p) => {
                                const existe = p.diasLaboralesCustom.includes(d.dow);
                                if (existe && p.diasLaboralesCustom.length <= 1) return p;
                                const next = existe
                                  ? p.diasLaboralesCustom.filter((x) => x !== d.dow)
                                  : [...p.diasLaboralesCustom, d.dow];
                                return { ...p, diasLaboralesCustom: next };
                              });
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '7px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: !editandoCrono ? 'not-allowed' : 'pointer',
                              border: activo ? '1px solid #2563eb' : '1px solid #cbd5e1',
                              background: !editandoCrono ? '#f8fafc' : activo ? '#eff6ff' : '#ffffff',
                              color: !editandoCrono ? '#64748b' : activo ? '#1d4ed8' : '#64748b',
                            }}
                          >
                            {d.short}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Ponderación de avance</label>
                  <p>Cómo se consolida el porcentaje de avance hacia los componentes padre.</p>
                </div>
                <div className="field-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <SelectEstilizado
                        value={cronoParams.metodoPonderacion}
                        disabled={!editandoCrono}
                        saved={!editandoCrono && cronoParams.metodoPonderacion === cronoParamsGuardado.metodoPonderacion}
                        options={[
                          {
                            value: 'duracion',
                            label: 'Ponderación por duración',
                            badge: 'Recomendada',
                            description: 'Días hábiles · Duration-weighted progress',
                            infoTooltip:
                              'El avance de cada actividad se pondera según su duración en días hábiles respecto del total de días hábiles de las actividades.',
                          },
                          {
                            value: 'promedio',
                            label: 'Promedio simple',
                            description: 'Promedio aritmético · Arithmetic mean',
                            infoTooltip:
                              'Todas las actividades tienen el mismo peso, independientemente de su duración.',
                          },
                        ]}
                        onChange={(val) => setCronoParams((p) => ({ ...p, metodoPonderacion: val as MetodoPonderacion }))}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="Información sobre criterios de ponderación de avance"
                      onClick={() => setShowPonderacionInfo((v) => !v)}
                      onBlur={() => setShowPonderacionInfo(false)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: showPonderacionInfo ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                        background: showPonderacionInfo ? '#eff6ff' : '#ffffff',
                        color: showPonderacionInfo ? '#2563eb' : '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Info size={15} />
                    </button>
                    {showPonderacionInfo && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          right: 0,
                          width: '320px',
                          zIndex: 50,
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
                          fontSize: '12px',
                          lineHeight: 1.45,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', marginBottom: '2px', color: '#0f172a' }}>
                            Ponderación por duración
                          </strong>
                          <span>
                            El avance de cada actividad se pondera según su duración en días hábiles respecto del total de días hábiles de las actividades.
                          </span>
                        </div>
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <strong style={{ display: 'block', marginBottom: '2px', color: '#0f172a' }}>
                            Promedio simple
                          </strong>
                          <span>
                            Todas las actividades tienen el mismo peso, independientemente de su duración.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label>Frecuencia de corte</label>
                  <p>Periodicidad de referencia para cortes de avance y seguimiento de Curva S.</p>
                </div>
                <div className="field-control">
                  <SelectEstilizado
                    value={cronoParams.frecuenciaCorte}
                    disabled={!editandoCrono}
                    saved={!editandoCrono && cronoParams.frecuenciaCorte === cronoParamsGuardado.frecuenciaCorte}
                    options={[
                      { value: 'semanal', label: 'Semanal' },
                      { value: 'quincenal', label: 'Quincenal' },
                      { value: 'mensual', label: 'Mensual' },
                    ]}
                    onChange={(val) => setCronoParams((p) => ({ ...p, frecuenciaCorte: val as FrecuenciaCorte }))}
                  />
                </div>
              </div>
            </div>

            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap">
                  <Layers size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2>Umbrales de Control y Línea Base</h2>
                  <p>Criterios de alerta temprana, hitos y protección de la Línea Base oficial.</p>
                </div>
                {esAdmin && renderBotonEditar(editandoCrono, () => {
                  if (editandoCrono) setCronoParams(cronoParamsGuardado);
                  setEditandoCrono((v) => !v);
                })}
              </div>
              {!esAdmin && renderBannerSoloLectura()}

              {/* A. Umbrales de alerta y control */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>
                Umbrales de alerta y control
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-aviso-previo">1. Aviso previo al vencimiento (días hábiles)</label>
                  <p>Marca preventivamente en el cronograma y en la campanita cuando faltan estos días hábiles o menos para vencer.</p>
                </div>
                <div className="field-control">
                  <input
                    id="cfg-aviso-previo"
                    type="number"
                    min={0}
                    max={30}
                    disabled={!editandoCrono}
                    className="select-input"
                    style={{ maxWidth: 120, ...(!editandoCrono ? estiloSoloLectura : {}) }}
                    value={cronoParams.diasAvisoPrevio}
                    onChange={(e) => setCronoParams((p) => ({ ...p, diasAvisoPrevio: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-hitos-gracia">2. Días hábiles de gracia al vencer</label>
                  <p>Un hito mantiene duración 0 días; si supera este margen tras su fecha programada sin cumplirse, pasa a vencido.</p>
                </div>
                <div className="field-control">
                  <input
                    id="cfg-hitos-gracia"
                    type="number"
                    min={0}
                    max={15}
                    disabled={!editandoCrono}
                    className="select-input"
                    style={{ maxWidth: 120, ...(!editandoCrono ? estiloSoloLectura : {}) }}
                    value={cronoParams.diasGraciaHito}
                    onChange={(e) => setCronoParams((p) => ({ ...p, diasGraciaHito: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field-info">
                  <label htmlFor="cfg-desvio-critico">3. Desvío crítico respecto a Línea Base (días hábiles)</label>
                  <p>Retraso frente a la Línea Base aprobada que activa alerta crítica en el cronograma y notificaciones.</p>
                </div>
                <div className="field-control">
                  <input
                    id="cfg-desvio-critico"
                    type="number"
                    min={0}
                    max={60}
                    disabled={!editandoCrono}
                    className="select-input"
                    style={{ maxWidth: 120, ...(!editandoCrono ? estiloSoloLectura : {}) }}
                    value={cronoParams.umbralDesvioCritico}
                    onChange={(e) => setCronoParams((p) => ({ ...p, umbralDesvioCritico: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {esAdmin && (
                <>
                  <div className="form-row">
                    <div className="field-info">
                      <label htmlFor="cfg-colchon-adelanto">4. Adelanto interno sobre fecha oficial (días hábiles · Solo Administrador)</label>
                      <p>Descuenta días hábiles (según la semana laboral configurada) respecto a la fecha oficial/Línea Base para que el equipo persiga una meta adelantada.</p>
                    </div>
                    <div className="field-control" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <input
                        id="cfg-colchon-adelanto"
                        type="number"
                        min={0}
                        max={30}
                        disabled={!editandoCrono}
                        className="select-input"
                        style={{ maxWidth: 120, ...(!editandoCrono ? estiloSoloLectura : {}) }}
                        value={cronoParams.diasColchonAdelanto}
                        onChange={(e) => setCronoParams((p) => ({ ...p, diasColchonAdelanto: Number(e.target.value) }))}
                      />
                      <button
                        type="button"
                        className="btn secondary"
                        disabled={aplicandoColchon || cronoParams.diasColchonAdelanto <= 0}
                        onClick={async () => {
                          if (!currentProj?.id) return;
                          setAplicandoColchon(true);
                          setResumenColchon(null);
                          try {
                            saveParametrosCronograma(cronoParams);
                            setCronoParamsGuardado(cronoParams);
                            let baseItems: GanttItemData[] | null = await fetchCronogramaFromSupabase(currentProj.id);
                            if (!baseItems || baseItems.length === 0) {
                              try {
                                const localRaw =
                                  localStorage.getItem(`qaway-gantt-items-${currentProj.id}-maestro`) ||
                                  localStorage.getItem(`qaway-gantt-items-${currentProj.id}`);
                                baseItems = localRaw ? (JSON.parse(localRaw) as GanttItemData[]) : [];
                              } catch {
                                baseItems = [];
                              }
                            }
                            if (!baseItems || baseItems.length === 0) {
                              setAlertasColchon([]);
                              setResumenColchon('El proyecto activo aún no tiene paquetes de trabajo para ajustar.');
                              return;
                            }
                            const res = aplicarColchonAdelantoItems(
                              baseItems,
                              cronoParams.diasColchonAdelanto,
                              cronoParams.semanaLaboral,
                              cronoParams.diasLaboralesCustom,
                            );
                            if (res.aplicados > 0) {
                              await syncAllCronogramaItemsToSupabase(currentProj.id, res.items);
                              try {
                                localStorage.setItem(`qaway-gantt-items-${currentProj.id}-maestro`, JSON.stringify(res.items));
                                localStorage.setItem(`qaway-gantt-items-${currentProj.id}`, JSON.stringify(res.items));
                                window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
                              } catch {}
                            }
                            setAlertasColchon(res.alertas);
                            setResumenColchon(
                              `Adelanto aplicado a ${res.aplicados} paquete(s). ${
                                res.alertas.length > 0
                                  ? `${res.alertas.length} paquete(s) quedaron en alerta para ajuste manual.`
                                  : 'Sin paquetes en alerta.'
                              }`,
                            );
                            notify(`Adelanto de ${cronoParams.diasColchonAdelanto} días hábiles procesado (${res.aplicados} aplicados, ${res.alertas.length} en alerta).`);
                          } finally {
                            setAplicandoColchon(false);
                          }
                        }}
                      >
                        {aplicandoColchon ? 'Aplicando...' : 'Aplicar adelanto al proyecto activo'}
                      </button>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-info">
                      <label htmlFor="cfg-ocultar-oficial">5. Ocultar fecha oficial (Línea Base) a usuarios no-admin</label>
                      <p>Si está activo, los usuarios operativos/editores solo ven su fecha de seguimiento adelantada y no el colchón oficial.</p>
                    </div>
                    <div className="field-control">
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: editandoCrono ? 'pointer' : 'not-allowed' }}>
                        <input
                          id="cfg-ocultar-oficial"
                          type="checkbox"
                          disabled={!editandoCrono}
                          checked={cronoParams.ocultarFechaOficialANoAdmin}
                          onChange={(e) => setCronoParams((p) => ({ ...p, ocultarFechaOficialANoAdmin: e.target.checked }))}
                        />
                        <span>Ocultar Línea Base oficial al equipo</span>
                      </label>
                    </div>
                  </div>

                  {(resumenColchon || alertasColchon.length > 0) && (
                    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #f59e0b', background: '#fffbeb', fontSize: '12.5px', color: '#78350f' }}>
                      {resumenColchon && <div style={{ fontWeight: 700, marginBottom: alertasColchon.length > 0 ? 8 : 0 }}>{resumenColchon}</div>}
                      {alertasColchon.length > 0 && (
                        <>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            Paquetes con plazo corto no modificados (requieren ajuste manual en el Gantt):
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 3 }}>
                            {alertasColchon.map((a) => (
                              <li key={a.id}>
                                <b>{a.code}</b> {a.name} — plazo actual: {a.plazoHabil} día(s) hábil(es), quedarían {a.diasRestantes} día(s).
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
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
                  <p>Trazabilidad de cambios en cronograma, hitos y configuración por los responsables autorizados.</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Todas las modificaciones de cronograma, asignaciones de responsables y fechas de hito se registran con usuario y marca temporal conforme a las políticas de control de la empresa.
              </p>
            </div>

            {/* Tarjeta: Historial de estado del proyecto */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Clock3 size={20} />
                </div>
                <div>
                  <h2>Historial de Estado del Proyecto</h2>
                  <p>
                    Registro de cambios de estado del proyecto (iniciar, pausar, reanudar, completar, cancelar o reabrir), con responsable, fecha y motivo.
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
                  Aún no hay cambios de estado registrados para este proyecto.
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

        {activeTab === 'permisos' && (
          <PermisosTab />
        )}

        {activeTab === 'asistente' && (
          <div className="cards-grid">
            {/* Tarjeta 1: Motor y Conexión BYOK */}
            <div className="cfg-card">
              <div className="card-header">
                <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#0066ff' }}>
                  <Key size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2>Conexión con Google Gemini (BYOK)</h2>
                  <p>
                    Configura tu propia clave de API de Google Gemini para habilitar razonamiento generativo real, análisis de documentos y proyecciones de cronograma.
                  </p>
                </div>
                {renderBotonEditar(editandoAsistente, () => setEditandoAsistente((v) => !v))}
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
                        disabled={!editandoAsistente}
                        className="select-input"
                        style={{ width: '100%', paddingRight: 36, fontFamily: showApiKey ? 'monospace' : 'inherit', ...(!editandoAsistente ? estiloSoloLectura : {}) }}
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
                    disabled={!editandoAsistente}
                    style={!editandoAsistente ? estiloSoloLectura : undefined}
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
                    disabled={!editandoAsistente}
                    style={!editandoAsistente ? estiloSoloLectura : undefined}
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
                    disabled={!editandoAsistente}
                    style={!editandoAsistente ? estiloSoloLectura : undefined}
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
                      disabled={!editandoAsistente}
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
        </div>
    </div>
  );
}
