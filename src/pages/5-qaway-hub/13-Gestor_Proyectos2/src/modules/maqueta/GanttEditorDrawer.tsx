// Verificación de tipado activada: este archivo será validado por tsc -b
import { claveTareasLocal } from '../../services/gestorTareasLocalService';
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  CalendarDays,
  Anchor,
  Target,
  CheckSquare,
  Paperclip,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Layers3,
  Link2,
  Folder,
  AlertTriangle,
  Save,
  MoreHorizontal,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  FileSpreadsheet,
  Presentation,
  Link as LinkIcon,
  Package,
  ArrowUpRight,
  Users,
  Tag,
  Layers,
} from 'lucide-react';
import type {
  Item,
  Status,
  DeliverableItem,
  AttachmentItem,
  DeliverableFormat,
} from './CronogramaGanttView';
import { getDeviationDays } from './scheduleMetrics';
import TablaPorConectar from '../../components/TablaPorConectar';
import { usePerfilGp } from '../../services/gpPermisosService';
import { getEdtNodeDisplayLabel, resolveEdtNodeType, PROJECT_PHASES_CATALOG, EDT_NODE_LABELS, isContainerEdtType, normalizeEdtType, type EdtNodeType } from './edtPmbokModel';
import { getLinkedTasksSummary } from '../cronograma-core/wbsHierarchy';
import TipoDependenciaCatalogoSelect from '../../components/TipoDependenciaCatalogoSelect';
import TipoEntregableCatalogoSelect from '../../components/TipoEntregableCatalogoSelect';
import EstadoEntregableCatalogoSelect from '../../components/EstadoEntregableCatalogoSelect';
import { listarEstadosEjecucionGestor } from '../../services/gpCatalogosService';
import { fetchEquipoIntegrantesFromSupabase } from '../../services/gestorEquipoService';

// Caché de módulo compartida (in-flight + resultado): evita re-consultar Supabase en cada apertura
let cachedEstadosGestorPromise: Promise<Status[]> | null = null;
let cachedEquipoIntegrantesPromise: Promise<Integrante[]> | null = null;
const getEstadosGestorCached = (): Promise<Status[]> => {
  if (!cachedEstadosGestorPromise) {
    cachedEstadosGestorPromise = listarEstadosEjecucionGestor()
      .then((res) => {
        if (res.estado === 'lista' && res.items.length > 0) {
          const validSet = new Set<string>(STATUS_OPTIONS);
          const mapped = res.items.map((it) => it.nombre as Status).filter((name) => validSet.has(name));
          if (mapped.length > 0) return mapped;
        }
        return STATUS_OPTIONS;
      })
      .catch(() => STATUS_OPTIONS);
  }
  return cachedEstadosGestorPromise;
};
const getEquipoIntegrantesCached = (): Promise<Integrante[]> => {
  if (!cachedEquipoIntegrantesPromise) {
    cachedEquipoIntegrantesPromise = fetchEquipoIntegrantesFromSupabase()
      .then((list) => (Array.isArray(list) ? list : []))
      .catch(() => []);
  }
  return cachedEquipoIntegrantesPromise;
};
import type { Integrante } from '../equipo/types';

import {
  REGIONES_PROYECTO,
  MACROREGIONES,
  getRegionCoordinador,
  getMacroById,
} from './regionalCoordinationModel';

// ── Helpers locales para aislar completamente el Drawer y evitar dependencias circulares ──
const RANGE_MIN = '2026-09-01';
const RANGE_MAX = '2027-04-30';
const TODAY_ISO = '2026-10-27';

const STATUS_CLASS: Record<Status, string> = {
  'Cumple': 'complete',
  'Completado': 'complete',
  'En curso': 'progress',
  'En proceso': 'progress',
  'Pendiente': 'pending',
  'Con retraso': 'late',
};

const STATUS_OPTIONS: Status[] = ['Cumple', 'En curso', 'En proceso', 'Con retraso', 'Pendiente'];

const formatDate = (s: string) =>
  new Date(s + 'T12:00:00')
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');

const getPhaseLabel = (phaseId: string) => {
  const phase = PROJECT_PHASES_CATALOG.find((item) => item.id === phaseId);
  return phase ? `${phase.code} · ${phase.name}` : 'Sin fase asignada';
};


function MiniCalendar({
  value,
  onChange,
  min = RANGE_MIN,
  max = RANGE_MAX,
  onClose,
  align = 'left',
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  onClose: () => void;
  align?: 'left' | 'right';
}) {
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value + 'T12:00:00') : new Date('2026-10-27T12:00:00')
  );

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + 'T12:00:00'));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
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
      className={`custom-calendar-pop ${align === 'right' ? 'align-right' : 'align-left'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cal-head">
        <span className="cal-title">{capitalizedMonth}</span>
        <div className="cal-arrows">
          <button type="button" onClick={prevMonth} title="Mes anterior">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={nextMonth} title="Mes siguiente">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="cal-weekdays">
        <span>LU</span>
        <span>MA</span>
        <span>MI</span>
        <span>JU</span>
        <span>VI</span>
        <span>SA</span>
        <span>DO</span>
      </div>
      <div className="cal-grid">
        {days.map((item, idx) => {
          const isSelected = item.iso === value;
          const isToday = item.iso === TODAY_ISO;
          const isDisabled = (!!min && item.iso < min) || (!!max && item.iso > max);
          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              className={`cal-day ${item.currentMonth ? '' : 'outside'} ${isSelected ? 'selected' : ''} ${
                isToday ? 'today-day' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  onChange(item.iso);
                  onClose();
                }
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>
      <div className="cal-footer">
        <button
          type="button"
          className="cal-today-btn"
          onClick={(e) => {
            e.stopPropagation();
            onChange(TODAY_ISO);
            onClose();
          }}
        >
          Hoy
        </button>
        <button
          type="button"
          className="cal-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

interface GanttEditorDrawerProps {
  panelOpen: boolean;
  selectedItem: Item | null;
  isNewDraft: boolean;
  items: Item[];
  hitos: Item[];
  currentTodayIso: string;
  onSave: (updatedItem: Item, isNew: boolean) => void;
  onClose: () => void;
  onDeleteItem?: (item: Item) => void;
  onAddSubItem?: (kind: 'hito' | 'subproceso', parentId?: string) => void;
  onSelectSubItem?: (item: Item) => void;
  /** Sincroniza la selección del Gantt padre cuando el Drawer cambia el ítem abierto */
  onSelectItem?: (id: string) => void;
  notify: (msg: string) => void;
  activeProject?: any;
  onOpenFullDetail?: (item: Item) => void;
  onToggleSuccessor?: (sourceId: string, successorId: string, shouldAdd: boolean) => void;
}

export const GanttEditorDrawer = memo(function GanttEditorDrawer({
  panelOpen,
  selectedItem,
  isNewDraft: initialIsNewDraft,
  items,
  hitos,
  currentTodayIso,
  onSave,
  onClose,
  onDeleteItem,
  onAddSubItem,
  onSelectSubItem,
  onSelectItem,
  notify,
  activeProject,
  onOpenFullDetail,
  onToggleSuccessor,
}: GanttEditorDrawerProps) {
  // ESTADO LOCAL DEL BORRADOR (Aislamiento total: escribir aqui NO re-renderiza el Gantt)
  const [drawerDraft, setDrawerDraft] = useState<Item | null>(null);
  const [isNewDraft, setIsNewDraft] = useState<boolean>(initialIsNewDraft);
  const [editorTab, setEditorTab] = useState<'info' | 'subprocesos' | 'dependencias'>('info');
  const [newDraftRespOpen, setNewDraftRespOpen] = useState(false);
  const [newDraftTagsOpen, setNewDraftTagsOpen] = useState(false);
  const [newDraftNivelOpen, setNewDraftNivelOpen] = useState(false);
  const [newDraftFaseOpen, setNewDraftFaseOpen] = useState(false);
  const [newDraftEstadoOpen, setNewDraftEstadoOpen] = useState(false);
  const [newDraftRespSelectOpen, setNewDraftRespSelectOpen] = useState(false);
  const [supabaseEstadoOptions, setSupabaseEstadoOptions] = useState<Status[]>(STATUS_OPTIONS);
  const [equipoIntegrantes, setEquipoIntegrantes] = useState<Integrante[]>([]);

  useEffect(() => {
    if (!panelOpen || !isNewDraft) return;
    let alive = true;
    Promise.all([getEstadosGestorCached(), getEquipoIntegrantesCached()]).then(([estados, equipo]) => {
      if (!alive) return;
      setSupabaseEstadoOptions(estados);
      setEquipoIntegrantes(equipo);
    });
    return () => {
      alive = false;
    };
  }, [panelOpen, isNewDraft]);

  const availableGestores = useMemo(() => {
    const fromEquipo = equipoIntegrantes
      .map((m) => ({
        name: m.nombreCompleto || `${m.nombre} ${m.apellidos}`.trim(),
        meta: [m.cargo, m.areaNombre || m.sedeNombre].filter(Boolean).join(' · '),
      }))
      .filter((m) => Boolean(m.name));
    const seen = new Set(fromEquipo.map((m) => m.name));
    const fromItems = items
      .map((it) => it.gestor)
      .filter((g): g is string => Boolean(g && g !== 'Sin asignar' && !seen.has(g)))
      .map((g) => ({ name: g, meta: '' }));
    return [...fromEquipo, ...fromItems];
  }, [equipoIntegrantes, items]);
  const [editorInitialSnapshot, setEditorInitialSnapshot] = useState<string>('');
  const [unsavedAlertOpen, setUnsavedAlertOpen] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  const [editorReportTypeOpen, setEditorReportTypeOpen] = useState(false);
  const [editorStatusOpen, setEditorStatusOpen] = useState(false);
  const [editorCalOpen, setEditorCalOpen] = useState<'start' | 'end' | 'actualStart' | 'actualEnd' | null>(null);
  const [editorHitoSelectOpen, setEditorHitoSelectOpen] = useState(false);
  const [editorParentSelectOpen, setEditorParentSelectOpen] = useState(false);
  const [editorDepSelectOpen, setEditorDepSelectOpen] = useState(false);
  const [editorSuccSelectOpen, setEditorSuccSelectOpen] = useState(false);
  const [editorPhaseSelectOpen, setEditorPhaseSelectOpen] = useState(false);

  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newDelivName, setNewDelivName] = useState('');
  const [newDelivType, setNewDelivType] = useState<DeliverableFormat>('document');
  const [newDelivTipoCodigo, setNewDelivTipoCodigo] = useState<string>('');
  const [newDelivUrl, setNewDelivUrl] = useState('');
  const [attachment, setAttachment] = useState('');

  // Etapa 6-B: permisos granulares del modelo GP. El gating SOLO aplica con
  // sesión real (perfilGp no nulo); en modo local (sin sesión) se conserva la
  // edición actual del cronograma (documentado en bitácora 6-B). La DB (RLS)
  // sigue siendo el mando real; esto es UX.
  const { perfil: perfilGp, capacidades: capGp } = usePerfilGp();
  const aplicarPermisos = Boolean(perfilGp);
  const puedeEstructura = !aplicarPermisos || capGp.administrarEdt;
  const puedeOperar = !aplicarPermisos || capGp.crearTarea || capGp.editarPropio;

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskModalMilestone, setTaskModalMilestone] = useState('');
  const [taskOwnerOpen, setTaskOwnerOpen] = useState(false);
  const [taskPriorityOpen, setTaskPriorityOpen] = useState(false);
  const [newTaskCalOpen, setNewTaskCalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    owner: 'Sin asignar',
    due: '2026-11-30',
    priority: 'Media' as 'Alta' | 'Media' | 'Baja',
  });

  // Sincronizacion inicial del borrador cuando se abre el drawer o cambia el item
  useEffect(() => {
    if (panelOpen && selectedItem) {
      setDrawerDraft({ ...selectedItem });
      setIsNewDraft(initialIsNewDraft);
      setEditorInitialSnapshot(captureSnapshot(selectedItem));
      setEditorTab('info');
      setAttachment(selectedItem.attachments?.[0]?.name || '');
    } else if (!panelOpen) {
      setDrawerDraft(null);
    }
  }, [panelOpen, selectedItem?.id, initialIsNewDraft]);

  // El drawer es una capa modal: mientras está abierto, el scroll debe quedar
  // contenido en su cuerpo y no desplazarse detrás sobre la aplicación.
  useEffect(() => {
    if (!panelOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [panelOpen]);

  const activeItem = drawerDraft || selectedItem;

  const drawerDraftRef = useRef(drawerDraft);
  drawerDraftRef.current = drawerDraft;
  const editorInitialSnapshotRef = useRef(editorInitialSnapshot);
  editorInitialSnapshotRef.current = editorInitialSnapshot;
  const selectedRef = useRef(selectedItem);
  selectedRef.current = selectedItem;
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Nonce local: fuerza relectura del listado de tareas vinculadas tras crear/toggle desde el Drawer
  const [forceTasksNonce, setForceTasksNonce] = useState(0);
  const rawTasks = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(claveTareasLocal()) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [forceTasksNonce]);

  // Derivados estables del elemento activo. El panel contiene varios controles
  // que cambian estado de forma independiente; estos datos no deben recalcularse
  // cada vez que se abre un desplegable o se mueve el cursor.
  const activeChildItems = useMemo(
    () => (activeItem ? items.filter((item) => item.parentId === activeItem.id) : []),
    [items, activeItem?.id]
  );

  const linkedTasks = useMemo(
    () => (activeItem ? rawTasks.filter((task: any) => task.milestone === activeItem.name) : []),
    [activeItem?.name, rawTasks]
  );

  const linkedTaskStats = useMemo(() => {
    const completed = linkedTasks.filter((task: any) => (
      task.status === 'Cumple' || task.status === 'Completado' || task.status === 'Completada'
    )).length;
    return {
      total: linkedTasks.length,
      completed,
      progress: linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : 0,
    };
  }, [linkedTasks]);

  // Helpers auxiliares de fechas para el Drawer
  const formatDatePE = (iso: string): string => {
    if (!iso) return '–';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
  };

  const getDeviationTone = (days: number | undefined): 'green' | 'amber' | 'red' | 'none' => {
    if (days === undefined) return 'none';
    if (days <= 0) return 'green';
    if (days <= 7) return 'amber';
    return 'red';
  };

  const formatDeviation = (days: number | undefined): string => {
    if (days === undefined) return '—';
    if (days === 0) return '0 días';
    if (days > 0) return `+${days} d${days === 1 ? 'ía' : 'ías'}`;
    return `${days} d${Math.abs(days) === 1 ? 'ía' : 'ías'}`;
  };

  const hasBaseline = (it: Item | undefined | null): boolean => {
    return !!(it && it.baselineStart && it.baselineEnd);
  };

  const add = (kind: 'hito' | 'subproceso', parentId?: string) => {
    if (onAddSubItem) onAddSubItem(kind, parentId);
  };


  const setPanelOpen = (val: boolean) => {
    if (!val) onClose();
  };

  // LOGICA EXTRAIDA DEL DRAWER
    const captureSnapshot = (item: Item | undefined | null) => {
    if (!item) return '';
    return JSON.stringify({
      name: item.name || '',
      description: item.description || '',
      start: item.start || '',
      end: item.end || '',
      reportType: item.reportType || '',
      status: item.status || '',
      progress: item.progress || 0,
      deliverable: item.deliverable || '',
      deliverables: item.deliverables || [],
      attachments: item.attachments || [],
      parentId: item.parentId || '',
      edtType: item.edtType || '',
      faseId: item.faseId || null,
      baselineStart: item.baselineStart || '',
      baselineEnd: item.baselineEnd || '',
      actualStart: item.actualStart || '',
      actualEnd: item.actualEnd || '',
    });
  };

  const isEditorDirty = () => {
    const target = drawerDraftRef.current || selectedRef.current;
    if (!target || !editorInitialSnapshotRef.current) return false;
    const current = captureSnapshot(target);
    return current !== editorInitialSnapshotRef.current;
  };

  const requestCloseDrawer = (action?: () => void) => {
    setEditorCalOpen(null);
    setEditorReportTypeOpen(false);
    setEditorStatusOpen(false);
    setEditorHitoSelectOpen(false);
    setEditorParentSelectOpen(false);
    setEditorDepSelectOpen(false);
            setEditorSuccSelectOpen(false);

    if (isEditorDirty()) {
      setPendingCloseAction(() => action || (() => {
        setPanelOpen(false);
        setDrawerDraft(null);
        setIsNewDraft(false);
        setEditorInitialSnapshot('');
      }));
      setUnsavedAlertOpen(true);
    } else {
      setPanelOpen(false);
      setDrawerDraft(null);
      setIsNewDraft(false);
      setEditorInitialSnapshot('');
      if (action) {
        action();
      }
    }
  };

  const openEditorForItem = (item: Item, preserveTab: boolean = false) => {
    onSelectItem?.(item.id);
    setDrawerDraft({ ...item });
    setIsNewDraft(false);
    setEditorInitialSnapshot(captureSnapshot(item));
    if (!preserveTab) {
      setEditorTab('info');
    }
    setPanelOpen(true);
  };

  const updateDraft = (p: Partial<Item>) => {
    setDrawerDraft((prev) => (prev ? { ...prev, ...p } : null));
  };

  const setDraftStart = (v: string) => {
    if (!v || !drawerDraft) return;
    updateDraft(v > drawerDraft.end ? { start: v, end: v } : { start: v });
  };

  const setDraftEnd = (v: string) => {
    if (!v || !drawerDraft) return;
    updateDraft(v < drawerDraft.start ? { start: v, end: v } : { end: v });
  };

  const setDraftProgress = (v: number) => {
    if (!drawerDraft) return;
    updateDraft({
      progress: v,
      status: v >= 100 ? 'Cumple' : v === 0 ? 'Pendiente' : 'En proceso',
    });
  };

  const setDraftStatus = (s: Status) => {
    if (!drawerDraft) return;
    let newProgress = drawerDraft.progress;
    if (s === 'Pendiente') {
      newProgress = 0;
    } else if (s === 'Completado' || s === 'Cumple') {
      newProgress = 100;
    } else if (s === 'En proceso' || s === 'En curso') {
      if (newProgress === 0 || newProgress === 100) newProgress = 50;
    }
    updateDraft({ status: s, progress: newProgress });
  };

  const handleSaveDrawer = () => {
    if (!drawerDraft) return;
    if (!drawerDraft.name.trim()) {
      notify('El nombre no puede estar vacío');
      return;
    }
    // El padre ya implementa el commit (insert/replace + applyActuals + notify + cierre) vía prop onSave
    onSave(drawerDraft, isNewDraft);
    setEditorInitialSnapshot('');
    setDrawerDraft(null);
    setIsNewDraft(false);
  };

  // Eliminación fiel al monolito pre-extracción: descarta borradores o delega al flujo de confirmación del padre
  const deleteItem = () => {
    if (!activeItem) return;
    if (isNewDraft) {
      setPanelOpen(false);
      setDrawerDraft(null);
      setIsNewDraft(false);
      setEditorInitialSnapshot('');
      notify('Borrador descartado');
      return;
    }
    onDeleteItem?.(activeItem);
  };

  const getLinkedTasks = (milestoneName?: string) => {
    if (!milestoneName) return [];
    return rawTasks.filter((task: any) => task.milestone === milestoneName);
  };

  const handleOpenCreateTaskModal = (milestoneName: string) => {
    setTaskModalMilestone(milestoneName);
    setTaskOwnerOpen(false);
    setTaskPriorityOpen(false);
    setNewTaskCalOpen(false);
    setNewTaskForm({
      title: '',
      owner: activeItem?.gestor || 'Sin asignar',
      due: activeItem?.end || '2026-11-30',
      priority: 'Media',
    });
    setCreateTaskModalOpen(true);
  };

  const handleConfirmCreateTask = () => {
    if (!newTaskForm.title.trim()) {
      notify('Ingresa el título de la tarea');
      return;
    }
    try {
      const raw = JSON.parse(localStorage.getItem(claveTareasLocal()) || '[]');
      const list = Array.isArray(raw) ? raw : [];
      const newTask = {
        id: Math.max(0, ...list.map((x: any) => x.id || 0)) + 1,
        title: newTaskForm.title.trim(),
        milestone: taskModalMilestone || activeItem?.name || 'Hito del cronograma',
        owner: newTaskForm.owner,
        due: newTaskForm.due || activeItem?.end || '2026-11-30',
        status: 'Pendiente',
        priority: newTaskForm.priority,
        origin: 'Hito del proyecto',
        kind: 'Vinculada al cronograma',
        deliverable: activeItem?.deliverable || 'Entregable de hito',
        description: `Tarea operativa para el cumplimiento de ${taskModalMilestone}`,
        checklist: [],
        comments: [],
        attachments: [],
        history: [{ text: 'Tarea creada desde el cronograma maestro', date: new Date().toLocaleString('es-PE') }],
      };
      const nextList = [newTask, ...list];
      localStorage.setItem(claveTareasLocal(), JSON.stringify(nextList));
      setForceTasksNonce((n) => n + 1);
      setCreateTaskModalOpen(false);
      notify(`Tarea "${newTaskForm.title.trim()}" vinculada y agregada al módulo Tareas`);
      window.dispatchEvent(new CustomEvent('qaway-tasks-updated'));
    } catch {
      notify('Error al crear tarea vinculada');
    }
  };

  const handleToggleTask = (taskId: number) => {
    try {
      const raw = JSON.parse(localStorage.getItem(claveTareasLocal()) || '[]');
      if (Array.isArray(raw)) {
        const nextList = raw.map((t: any) => {
          if (t.id === taskId) {
            const isDone = t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada';
            return { ...t, status: isDone ? 'Pendiente' : 'Cumple' };
          }
          return t;
        });
        localStorage.setItem(claveTareasLocal(), JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('qaway-tasks-updated'));
        setForceTasksNonce((n) => n + 1);
        notify('Estado de tarea operativa actualizado');
      }
    } catch {
      /* fallback */
    }
  };

  const handleSwitchActiveHito = (targetHito: Item) => {
    if (targetHito.id === activeItem?.id) return;
    if (isEditorDirty()) {
      setPendingCloseAction(() => () => {
        openEditorForItem(targetHito, true);
      });
      setUnsavedAlertOpen(true);
    } else {
      openEditorForItem(targetHito, true);
    }
  };

  const getActiveDeliverables = (item: Item): DeliverableItem[] => {
    if (item.deliverables && item.deliverables.length > 0) {
      return item.deliverables;
    }
    if (item.deliverable && item.deliverable.trim()) {
      return [
        {
          id: 'deliv-legacy',
          name: item.deliverable.trim(),
          type: 'document',
        },
      ];
    }
    return [];
  };

  const handleAddDeliverable = (deliv: Omit<DeliverableItem, 'id'>) => {
    if (!activeItem) return;
    const currentList = getActiveDeliverables(activeItem);
    const itemToAdd: DeliverableItem = {
      ...deliv,
      id: `deliv-${Date.now()}`,
    };
    const updated = [...currentList, itemToAdd];
    updateDraft({
      deliverables: updated,
      deliverable: updated.map((d) => d.name).join('; '),
    });
    setShowAddDeliverable(false);
    setNewDelivName('');
    setNewDelivTipoCodigo('');
    setNewDelivUrl('');
    notify(`Entregable "${deliv.name}" agregado`);
  };

  const handleRemoveDeliverable = (delivId: string) => {
    if (!activeItem) return;
    const currentList = getActiveDeliverables(activeItem);
    const updated = currentList.filter((d) => d.id !== delivId);
    updateDraft({
      deliverables: updated,
      deliverable: updated.map((d) => d.name).join('; '),
    });
    notify('Entregable eliminado');
  };

  const handleOpenDeliverable = (deliv: DeliverableItem) => {
    if (deliv.url && (deliv.url.startsWith('http://') || deliv.url.startsWith('https://'))) {
      window.open(deliv.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const typeLabel =
      deliv.type === 'spreadsheet'
        ? 'Hoja de Cálculo / Matriz'
        : deliv.type === 'presentation'
        ? 'Presentación / Canva'
        : deliv.type === 'link'
        ? 'Enlace Externo'
        : deliv.type === 'physical'
        ? 'Entrega Física / Inspección'
        : 'Documento Oficial';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${deliv.name} · Visor de Entregable Oficial - Qaway Lab</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
          .container { max-width: 800px; width: 100%; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; text-transform: uppercase; margin-bottom: 12px; }
          h1 { margin: 0 0 8px; font-size: 22px; color: #0f172a; }
          p { margin: 4px 0 20px; color: #64748b; font-size: 14px; line-height: 1.5; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
          .btn-group { display: flex; gap: 12px; }
          .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
          .btn-primary { background: #2563eb; color: #ffffff; }
          .btn-secondary { background: #f1f5f9; color: #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">${typeLabel}</div>
          <h1>${deliv.name}</h1>
          <p>Entregable oficial vinculado al proyecto ${activeProject?.name || 'Gestión de Proyectos'}.</p>
          <div class="meta-box">
            <div><strong>Hito / Etapa Asociada:</strong> ${activeItem?.name || 'Hito del cronograma'}</div>
            <div style="margin-top:6px;"><strong>Estado Actual:</strong> ${activeItem?.status || 'En proceso'} (${activeItem?.progress || 0}%)</div>
            <div style="margin-top:6px;"><strong>Tipo de Instrumento:</strong> ${typeLabel}</div>
            ${deliv.url ? `<div style="margin-top:6px;"><strong>URL Origen:</strong> <a href="${deliv.url}" target="_blank">${deliv.url}</a></div>` : ''}
          </div>
          <div class="btn-group">
            <button class="btn btn-primary" onclick="window.print()">Imprimir / Guardar como PDF</button>
            <button class="btn btn-secondary" onclick="window.close()">Cerrar visor</button>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  const getActiveAttachments = (item: Item): AttachmentItem[] => {
    if (item.attachments && item.attachments.length > 0) {
      return item.attachments;
    }
    if (attachment && attachment.trim()) {
      return [
        {
          id: 'att-legacy',
          name: attachment.trim(),
          date: '28/10/2026',
        },
      ];
    }
    return [];
  };

  const handleAddAttachments = (fileList: FileList | null) => {
    if (!fileList || !activeItem) return;
    const currentList = getActiveAttachments(activeItem);
    const newItems: AttachmentItem[] = [];
    const dateStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      newItems.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        date: dateStr,
        type: file.type || 'application/octet-stream',
      });
    }
    const updated = [...currentList, ...newItems];
    updateDraft({
      attachments: updated,
    });
    setAttachment(updated[0]?.name || '');
    notify(`${newItems.length} documento(s) de sustento adjuntado(s)`);
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!activeItem) return;
    const currentList = getActiveAttachments(activeItem);
    const updated = currentList.filter((a) => a.id !== attId);
    updateDraft({ attachments: updated });
    setAttachment(updated[0]?.name || '');
    notify('Documento de sustento eliminado');
  };

  const handleOpenAttachment = (att: AttachmentItem) => {
    if (att.url && (att.url.startsWith('http://') || att.url.startsWith('https://'))) {
      window.open(att.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${att.name} · Sustento Oficial - Qaway Lab</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: 700; }
          .content-preview { background: #ffffff; color: #0f172a; border-radius: 8px; padding: 36px; min-height: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .btn { background: #0284c7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">📄 ${att.name}</div>
          <div>
            <button class="btn" onclick="window.print()">Descargar / Imprimir</button>
          </div>
        </div>
        <div class="content-preview">
          <h2>Sustento Oficial del Proyecto</h2>
          <p><strong>Archivo:</strong> ${att.name}</p>
          <p><strong>Fecha de carga:</strong> ${att.date || new Date().toLocaleDateString('es-PE')}</p>
          <p><strong>Asociado a:</strong> ${activeItem?.name || 'Hito del cronograma'}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #64748b; font-size: 14px;">
            Este documento está certificado en el repositorio del proyecto ${activeProject?.name || 'Gestión de Proyectos'}.
          </p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  if (!panelOpen || !activeItem) return null;

  return (
    <>
              {/* Backdrop Scrim para cerrar drawer al hacer clic afuera */}
        {panelOpen && (
          <div
            className="editor-backdrop"
            onClick={() => requestCloseDrawer()}
            aria-label="Cerrar panel lateral"
          />
        )}

        {/* Panel Lateral Editor (Drawer de Coordinador) */}
        {panelOpen && activeItem && (
          <aside className="editor" onClick={() => {
            setEditorCalOpen(null);
            setEditorReportTypeOpen(false);
            setEditorStatusOpen(false);
            setEditorHitoSelectOpen(false);
            setEditorParentSelectOpen(false);
            setEditorDepSelectOpen(false);
           }} onWheel={(event) => event.stopPropagation()}>
            <div className="editor-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  className="editor-icon-btn"
                  onClick={() => requestCloseDrawer()}
                  title="Volver"
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>
                    {isNewDraft ? 'Crear' : 'Editar'} {getEdtNodeDisplayLabel(activeItem, items)}
                  </h2>
                </div>
              </div>
              {onOpenFullDetail && (
                <button
                  type="button"
                  onClick={() => onOpenFullDetail(activeItem)}
                  title="Ir a la página completa de este elemento"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginRight: 6,
                    flexShrink: 0,
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Vista completa</span>
                </button>
              )}
              <button
                type="button"
                className="editor-icon-btn"
                onClick={() => requestCloseDrawer()}
                aria-label="Cerrar editor"
                title="Cerrar panel de detalles"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector permanente de componente con diseño oficial de la página */}
            {hitos.length > 0 && (
              <div
                style={{
                  padding: '9px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Componente:
                </span>
                <div className="filter-dropdown-wrap" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <button
                    type="button"
                    className={`filter-card-btn ${editorHitoSelectOpen ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      height: '32px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditorCalOpen(null);
                      setEditorStatusOpen(false);
                      setEditorReportTypeOpen(false);
                      setEditorHitoSelectOpen((v) => !v);
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 650,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'left',
                      }}
                    >
                      {isNewDraft
                        ? `${activeItem.code ? `${activeItem.code} ` : ''}${activeItem.name || 'Nuevo componente'}`
                        : activeItem.kind === 'hito'
                        ? `${activeItem.code} ${activeItem.name}`
                        : `${hitos.find((h) => h.id === activeItem.parentId)?.code || ''} ${hitos.find((h) => h.id === activeItem.parentId)?.name || 'Componente padre'}`}
                    </span>
                    <ChevronDown
                      size={14}
                      className="filter-chevron"
                      style={{
                        transform: editorHitoSelectOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease',
                        color: '#64748b',
                        flexShrink: 0,
                        marginLeft: 6,
                      }}
                    />
                  </button>
                  {editorHitoSelectOpen && (
                    <div
                      className="filter-card-popover"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        marginTop: '4px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="filter-popover-title">Componentes del Cronograma</div>
                      {hitos.map((h) => {
                        const isSelected = activeItem.kind === 'hito' && !isNewDraft && activeItem.id === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setEditorHitoSelectOpen(false);
                              handleSwitchActiveHito(h);
                            }}
                            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                              <b style={{ color: '#0284c7', marginRight: 5 }}>{h.code}</b> {h.name}
                            </span>
                            {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="editor-tabs">
              <button
                type="button"
                className={editorTab === 'info' ? 'active' : ''}
                onClick={() => setEditorTab('info')}
              >
                General
              </button>
              <button
                type="button"
                className={editorTab === 'subprocesos' ? 'active' : ''}
                onClick={() => setEditorTab('subprocesos')}
              >
                Paquetes de trabajo / Elementos EDT
              </button>
              <button
                type="button"
                className={editorTab === 'dependencias' ? 'active' : ''}
                onClick={() => setEditorTab('dependencias')}
              >
                Dependencias
              </button>
            </div>

            {editorTab === 'info' && (
              <div className="editor-body">
                {/* Resumen ejecutivo minimalista: lo relevante en el panel lateral; lo demás va hacia la Ficha completa */}
                {!isNewDraft && (
                  <div className="drawer-summary-card">
                    <div className="drawer-summary-title">
                      <span className="drawer-summary-icon"><Folder size={17} /></span>
                      <div className="drawer-summary-heading">
                        <b>{getEdtNodeDisplayLabel(activeItem, items)}</b>
                        <span>{activeItem.code || 'Elemento del cronograma'}</span>
                      </div>
                      <span className={`status ${STATUS_CLASS[activeItem.status]}`}>{activeItem.status}</span>
                    </div>
                    {activeItem.description && (
                      <p className="drawer-summary-description">{activeItem.description}</p>
                    )}
                    <div className="drawer-summary-context">
                      <div><span>Fase</span><b>{activeItem.phase || 'Sin fase definida'}</b></div>
                      <div><span>Entidad responsable</span><b>{activeItem.entidadResponsable || activeItem.region || 'Gestión del proyecto'}</b></div>
                      <div><span>Elementos asociados</span><b>{activeChildItems.length}</b></div>
                      <div><span>Tareas vinculadas</span><b>{activeItem.tasks ?? 0}</b></div>
                    </div>
                    <div className="drawer-summary-grid">
                      <div><span>Periodo</span><b>{formatDatePE(activeItem.start)} – {formatDatePE(activeItem.end)}</b></div>
                      <div><span>Duración</span><b>{Math.max(1, Math.ceil((new Date(`${activeItem.end}T12:00:00`).getTime() - new Date(`${activeItem.start}T12:00:00`).getTime()) / 86400000) + 1)} días</b></div>
                      <div><span>Responsable</span><b>{activeItem.gestor || 'Sin asignar'}</b></div>
                      <div><span>Avance</span><b>{activeItem.progress}%</b></div>
                    </div>
                    <div className="drawer-summary-progress"><span style={{ width: `${Math.max(0, Math.min(100, activeItem.progress))}%` }} /></div>
                    {activeItem.deliverable && (
                      <div className="drawer-summary-deliverable"><FileText size={15} /><div><span>Entregable principal</span><b>{activeItem.deliverable}</b></div></div>
                    )}
                    <div className="drawer-summary-meta">
                      <span>{activeItem.deliverables?.length || 0} entregables registrados</span>
                      <span>{activeItem.attachments?.length || 0} documentos adjuntos</span>
                    </div>
                    <button
                      type="button"
                      className="drawer-summary-detail-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenFullDetail?.(activeItem);
                      }}
                    >
                      Ver componente completo
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                )}
                {isNewDraft && (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    onClick={() => {
                      setNewDraftNivelOpen(false);
                      setNewDraftFaseOpen(false);
                      setNewDraftEstadoOpen(false);
                      setNewDraftRespSelectOpen(false);
                    }}
                  >
                    {/* Tarjeta 1: Información principal */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 750, color: '#0f172a' }}>
                        <Layers size={15} color="#2563eb" />
                        <span>Información principal</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 650, color: '#334155' }}>
                          Nombre del componente <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={activeItem.name === 'Nuevo componente' ? '' : activeItem.name}
                          placeholder="Ej. Gestión de entregables principales"
                          onChange={(e) => updateDraft({ name: e.target.value || 'Nuevo componente' })}
                          style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                          autoFocus
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                        {/* Nivel */}
                        <div className="field relative" style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, margin: 0 }}>
                          <label style={{ fontSize: '12px', fontWeight: 650, color: '#334155' }}>
                            Nivel <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className={`filter-card-btn ${newDraftNivelOpen ? 'active' : ''}`}
                              style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#0f172a' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewDraftFaseOpen(false);
                                setNewDraftEstadoOpen(false);
                                setNewDraftRespSelectOpen(false);
                                setEditorCalOpen(null);
                                setNewDraftNivelOpen((v) => !v);
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(() => {
                                  const cur = activeItem.edtType || (activeItem.kind === 'hito' ? 'COMPONENTE' : 'PAQUETE_TRABAJO');
                                  const labels: Record<string, string> = {
                                    COMPONENTE: 'Nivel 1 · Componente',
                                    PRODUCTO: 'Nivel 2 · Producto',
                                    PAQUETE_TRABAJO: 'Nivel 3 · Paquete de Trabajo',
                                    ACTIVIDAD: 'Nivel 4 · Actividad',
                                  };
                                  return labels[cur] || 'Nivel 1 · Componente';
                                })()}
                              </span>
                              <ChevronDown size={14} className="filter-chevron" style={{ flexShrink: 0, transform: newDraftNivelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: '#64748b' }} />
                            </button>
                            {newDraftNivelOpen && (
                              <div className="filter-card-popover" style={{ width: '100%', minWidth: '220px' }} onClick={(e) => e.stopPropagation()}>
                                <div className="filter-popover-title">Nivel jerárquico</div>
                                {[
                                  { value: 'COMPONENTE' as EdtNodeType, label: 'Nivel 1 · Componente' },
                                  { value: 'PRODUCTO' as EdtNodeType, label: 'Nivel 2 · Producto' },
                                  { value: 'PAQUETE_TRABAJO' as EdtNodeType, label: 'Nivel 3 · Paquete de Trabajo' },
                                  { value: 'ACTIVIDAD' as EdtNodeType, label: 'Nivel 4 · Actividad' },
                                ].map((opt) => {
                                  const cur = activeItem.edtType || (activeItem.kind === 'hito' ? 'COMPONENTE' : 'PAQUETE_TRABAJO');
                                  const selected = cur === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      className={`filter-item-btn ${selected ? 'selected' : ''}`}
                                      onClick={() => {
                                        updateDraft({
                                          edtType: opt.value,
                                          wbsNodeType: opt.value,
                                          kind: opt.value === 'COMPONENTE' ? 'hito' : 'subproceso',
                                        });
                                        setNewDraftNivelOpen(false);
                                      }}
                                    >
                                      <span>{opt.label}</span>
                                      {selected && <Check size={14} className="item-check" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fase */}
                        <div className="field relative" style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, margin: 0 }}>
                          <label style={{ fontSize: '12px', fontWeight: 650, color: '#334155' }}>
                            Fase <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className={`filter-card-btn ${newDraftFaseOpen ? 'active' : ''}`}
                              style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: activeItem.faseId ? '#0f172a' : '#64748b' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewDraftNivelOpen(false);
                                setNewDraftEstadoOpen(false);
                                setNewDraftRespSelectOpen(false);
                                setEditorCalOpen(null);
                                setNewDraftFaseOpen((v) => !v);
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(() => {
                                  const fObj = PROJECT_PHASES_CATALOG.find((p) => p.id === activeItem.faseId);
                                  return fObj ? `${fObj.code} · ${fObj.name}` : 'Seleccionar...';
                                })()}
                              </span>
                              <ChevronDown size={14} className="filter-chevron" style={{ flexShrink: 0, transform: newDraftFaseOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: '#64748b' }} />
                            </button>
                            {newDraftFaseOpen && (
                              <div className="filter-card-popover" style={{ right: 0, left: 'auto', minWidth: '250px' }} onClick={(e) => e.stopPropagation()}>
                                <div className="filter-popover-title">Fase del proyecto</div>
                                <button
                                  type="button"
                                  className={`filter-item-btn ${!activeItem.faseId ? 'selected' : ''}`}
                                  onClick={() => {
                                    updateDraft({ faseId: null, phase: '' });
                                    setNewDraftFaseOpen(false);
                                  }}
                                >
                                  <span>Sin fase asignada</span>
                                  {!activeItem.faseId && <Check size={14} className="item-check" />}
                                </button>
                                {PROJECT_PHASES_CATALOG.map((p) => {
                                  const selected = activeItem.faseId === p.id;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      className={`filter-item-btn ${selected ? 'selected' : ''}`}
                                      onClick={() => {
                                        updateDraft({ faseId: p.id, phase: `${p.code} · ${p.name}` });
                                        setNewDraftFaseOpen(false);
                                      }}
                                    >
                                      <span>{p.code} · {p.name}</span>
                                      {selected && <Check size={14} className="item-check" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estado inicial (desde catálogo Supabase gp_estados_ejecucion_c) */}
                      <div className="field relative" style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, margin: 0 }}>
                        <label style={{ fontSize: '12px', fontWeight: 650, color: '#334155' }}>Estado inicial</label>
                        <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className={`filter-card-btn ${newDraftEstadoOpen ? 'active' : ''}`}
                            style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#0f172a' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewDraftNivelOpen(false);
                              setNewDraftFaseOpen(false);
                              setNewDraftRespSelectOpen(false);
                              setEditorCalOpen(null);
                              setNewDraftEstadoOpen((v) => !v);
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span className={`status ${STATUS_CLASS[activeItem.status]}`}>
                                {activeItem.status}
                              </span>
                            </span>
                            <ChevronDown size={14} className="filter-chevron" style={{ flexShrink: 0, transform: newDraftEstadoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: '#64748b' }} />
                          </button>
                          {newDraftEstadoOpen && (
                            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                              <div className="filter-popover-title">Estado inicial</div>
                              {supabaseEstadoOptions.map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  className={`filter-item-btn ${activeItem.status === st ? 'selected' : ''}`}
                                  onClick={() => {
                                    setDraftStatus(st);
                                    setNewDraftEstadoOpen(false);
                                  }}
                                >
                                  <span className={`status ${STATUS_CLASS[st]}`}>{st}</span>
                                  {activeItem.status === st && <Check size={14} className="item-check" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 2: Programación */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 750, color: '#0f172a' }}>
                        <CalendarDays size={15} color="#2563eb" />
                        <span>Programación</span>
                      </div>
                      <div className="date-fields" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', margin: 0 }}>
                        <div className="field relative" style={{ minWidth: 0, margin: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 650, color: '#334155', textTransform: 'none', letterSpacing: 'normal' }}>
                            Fecha de inicio <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                          <button
                            type="button"
                            className={`custom-date-btn ${editorCalOpen === 'start' ? 'active' : ''}`}
                            style={{ borderRadius: '8px', height: '36px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewDraftNivelOpen(false);
                              setNewDraftFaseOpen(false);
                              setNewDraftEstadoOpen(false);
                              setNewDraftRespSelectOpen(false);
                              setEditorCalOpen((p) => (p === 'start' ? null : 'start'));
                            }}
                          >
                            <span>{formatDatePE(activeItem.start)}</span>
                            <CalendarDays size={14} className="date-btn-icon" />
                          </button>
                          {editorCalOpen === 'start' && (
                            <MiniCalendar
                              value={activeItem.start}
                              onChange={(newDate) => {
                                setDraftStart(newDate);
                                setEditorCalOpen(null);
                              }}
                              onClose={() => setEditorCalOpen(null)}
                              align="left"
                            />
                          )}
                        </div>

                        <div className="field relative" style={{ minWidth: 0, margin: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 650, color: '#334155', textTransform: 'none', letterSpacing: 'normal' }}>
                            Fecha de fin <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                          <button
                            type="button"
                            className={`custom-date-btn ${editorCalOpen === 'end' ? 'active' : ''}`}
                            style={{ borderRadius: '8px', height: '36px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewDraftNivelOpen(false);
                              setNewDraftFaseOpen(false);
                              setNewDraftEstadoOpen(false);
                              setNewDraftRespSelectOpen(false);
                              setEditorCalOpen((p) => (p === 'end' ? null : 'end'));
                            }}
                          >
                            <span>{formatDatePE(activeItem.end)}</span>
                            <CalendarDays size={14} className="date-btn-icon" />
                          </button>
                          {editorCalOpen === 'end' && (
                            <MiniCalendar
                              value={activeItem.end}
                              min={activeItem.start}
                              onChange={(newDate) => {
                                setDraftEnd(newDate);
                                setEditorCalOpen(null);
                              }}
                              onClose={() => setEditorCalOpen(null)}
                              align="right"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acordeón 3: Responsable (desde Equipo en Supabase) */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setNewDraftRespOpen((v) => !v)}
                        style={{ width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={15} color="#475569" />
                          <span>Responsable</span>
                        </span>
                        <ChevronDown size={15} color="#64748b" style={{ transform: newDraftRespOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                      </button>
                      {newDraftRespOpen && (
                        <div style={{ padding: '10px 14px 12px', borderTop: '1px solid #f1f5f9' }}>
                          <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className={`filter-card-btn ${newDraftRespSelectOpen ? 'active' : ''}`}
                              style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#0f172a' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewDraftNivelOpen(false);
                                setNewDraftFaseOpen(false);
                                setNewDraftEstadoOpen(false);
                                setEditorCalOpen(null);
                                setNewDraftRespSelectOpen((v) => !v);
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {activeItem.gestor || 'Sin asignar'}
                              </span>
                              <ChevronDown size={14} className="filter-chevron" style={{ flexShrink: 0, transform: newDraftRespSelectOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: '#64748b' }} />
                            </button>
                            {newDraftRespSelectOpen && (
                              <div className="filter-card-popover" style={{ maxHeight: '220px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                                <div className="filter-popover-title">Integrantes del equipo</div>
                                <button
                                  type="button"
                                  className={`filter-item-btn ${(!activeItem.gestor || activeItem.gestor === 'Sin asignar') ? 'selected' : ''}`}
                                  onClick={() => {
                                    updateDraft({ gestor: 'Sin asignar', gestores: [] });
                                    setNewDraftRespSelectOpen(false);
                                  }}
                                >
                                  <span>Sin asignar</span>
                                  {(!activeItem.gestor || activeItem.gestor === 'Sin asignar') && <Check size={14} className="item-check" />}
                                </button>
                                {availableGestores.map((g) => {
                                  const selected = activeItem.gestor === g.name;
                                  return (
                                    <button
                                      key={g.name}
                                      type="button"
                                      className={`filter-item-btn ${selected ? 'selected' : ''}`}
                                      onClick={() => {
                                        updateDraft({ gestor: g.name, gestores: [g.name] });
                                        setNewDraftRespSelectOpen(false);
                                      }}
                                    >
                                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                                        <span>{g.name}</span>
                                        {g.meta && <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>{g.meta}</span>}
                                      </span>
                                      {selected && <Check size={14} className="item-check" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeón 4: Etiquetas */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setNewDraftTagsOpen((v) => !v)}
                        style={{ width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Tag size={15} color="#475569" />
                          <span>Etiquetas</span>
                        </span>
                        <ChevronDown size={15} color="#64748b" style={{ transform: newDraftTagsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                      </button>
                      {newDraftTagsOpen && (
                        <div style={{ padding: '10px 14px 12px', borderTop: '1px solid #f1f5f9' }}>
                          <input
                            type="text"
                            value={activeItem.deliverable || ''}
                            placeholder="Ej. Prioritario, Hito clave, Fase 1..."
                            onChange={(e) => updateDraft({ deliverable: e.target.value })}
                            style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '12.5px', color: '#0f172a', boxSizing: 'border-box' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className={isNewDraft ? 'drawer-advanced-content' : 'drawer-advanced-content'}>
                {/* Selector de Elemento Padre si es subcomponente (admite Componentes y Subcomponentes para multinivel) */}
                {activeItem.kind === 'subproceso' && (
                  <div className="field relative" style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '6px' }}>
                      Elemento Padre (Asociado a)
                    </span>
                    <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className={`filter-card-btn ${editorParentSelectOpen ? 'active' : ''}`}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorCalOpen(null);
                          setEditorStatusOpen(false);
                          setEditorReportTypeOpen(false);
                          setEditorHitoSelectOpen(false);
                          setEditorDepSelectOpen(false);
                          setEditorParentSelectOpen((v) => !v);
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                          }}
                        >
                          {(() => {
                            const parent = activeParentItem;
                            if (!parent) return 'Selecciona el elemento padre...';
                            return parent.kind === 'hito'
                              ? `[Componente] ${parent.code} ${parent.name}`
                              : `└ [Paquete de trabajo] ${parent.code} ${parent.name}`;
                          })()}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: editorParentSelectOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                            flexShrink: 0,
                            marginLeft: 6,
                          }}
                        />
                      </button>
                      {editorParentSelectOpen && (
                        <div
                          className="filter-card-popover"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            marginTop: '4px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="filter-popover-title">Seleccionar Elemento Padre</div>
                          {items
                            .filter((x) => x.id !== activeItem.id)
                            .map((cand) => {
                              const isSelected = activeItem.parentId === cand.id;
                              return (
                                <button
                                  key={cand.id}
                                  type="button"
                                  className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    updateDraft({ parentId: cand.id });
                                    setEditorParentSelectOpen(false);
                                  }}
                                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                    <b style={{ color: cand.kind === 'hito' ? '#0284c7' : '#64748b', marginRight: 5 }}>
                                      {cand.kind === 'hito' ? `[Componente] ${cand.code}` : `└ ${cand.code}`}
                                    </b>
                                    {cand.name}
                                  </span>
                                  {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                 {/* Clasificación operativa y fase del proyecto. Los nombres técnicos
                     se conservan internamente, pero no se exponen al usuario. */}
                 <label className="field" style={{ marginBottom: '10px' }}>
                   <span>Nivel del elemento</span>
                   <div className="drawer-choice-wrap">
                     <span className="drawer-choice" style={{ cursor: 'default' }}>
                       <span>{EDT_NODE_LABELS[resolveEdtNodeType(activeItem, items)]}</span>
                     </span>
                   </div>
                   {isContainerEdtType(resolveEdtNodeType(activeItem, items)) && (
                     <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12 }}>
                       <input type="checkbox" checked={normalizeEdtType(activeItem.edtType) === 'ENTREGABLE'} onChange={(e) => updateDraft({ edtType: (e.target.checked ? 'ENTREGABLE' : undefined) as EdtNodeType })} />
                       Marcar este agrupador como entregable
                     </label>
                   )}
                 </label>

                {/* 1. Nombre */}
                <label className="field">
                  <span>Nombre ({getEdtNodeDisplayLabel(activeItem, items)})</span>
                  <input
                    value={activeItem.name}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                    placeholder="Nombre del componente o subcomponente..."
                  />
                </label>

                {/* 2. Descripción y Alcance */}
                <label className="field">
                  <span>Descripción y Alcance</span>
                  <textarea
                    value={activeItem.description || ''}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    placeholder="Describe el alcance y el resultado esperado..."
                  />
                </label>

                {/* 3. Entregables Oficiales (Criterios de Cumplimiento) */}
                <div className="field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 650, color: '#334155' }}>
                      <Target size={13} style={{ color: '#2563eb' }} />
                      Entregables Oficiales ({getActiveDeliverables(activeItem).length})
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '11.5px',
                        fontWeight: 650,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: 0,
                      }}
                      onClick={() => setShowAddDeliverable((v) => !v)}
                      disabled={!puedeEstructura}
                      title={puedeEstructura ? undefined : 'Solo lectura: agregar entregables requiere permiso de estructura (rol admin o llave gp.administrar_edt)'}
                    >
                      <Plus size={12} />
                      <span>Agregar entregable</span>
                    </button>
                  </div>

                  {/* Formulario en línea para nuevo entregable */}
                  {showAddDeliverable && (
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                        Nuevo Entregable Oficial
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        {[
                          { type: 'document' as DeliverableFormat, label: 'Doc / PDF', icon: FileText, color: '#2563eb' },
                          { type: 'spreadsheet' as DeliverableFormat, label: 'Excel / Sheets', icon: FileSpreadsheet, color: '#16a34a' },
                          { type: 'presentation' as DeliverableFormat, label: 'Canva / PPT', icon: Presentation, color: '#ea580c' },
                          { type: 'link' as DeliverableFormat, label: 'Enlace Web', icon: ExternalLink, color: '#7c3aed' },
                          { type: 'physical' as DeliverableFormat, label: 'Físico', icon: Package, color: '#d97706' },
                        ].map((btn) => {
                          const IconComponent = btn.icon;
                          const isSel = newDelivType === btn.type;
                          return (
                            <button
                              key={btn.type}
                              type="button"
                              onClick={() => setNewDelivType(btn.type)}
                              style={{
                                flex: 1,
                                padding: '6px 4px',
                                borderRadius: '6px',
                                border: isSel ? `1.5px solid ${btn.color}` : '1px solid #e2e8f0',
                                background: isSel ? '#ffffff' : '#f1f5f9',
                                color: isSel ? btn.color : '#64748b',
                                fontSize: '10.5px',
                                fontWeight: isSel ? 700 : 500,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              <IconComponent size={14} />
                              <span>{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <TipoEntregableCatalogoSelect
                        value={newDelivTipoCodigo}
                        onChange={(sel) => {
                          setNewDelivTipoCodigo(sel?.codigo || '');
                          if (sel && !newDelivName.trim()) {
                            setNewDelivName(sel.nombre);
                          }
                        }}
                      />
                      <input
                        value={newDelivName}
                        onChange={(e) => setNewDelivName(e.target.value)}
                        placeholder="Nombre del entregable (ej. Acta de Conformidad, Plan Excel)..."
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '12px',
                          marginBottom: '6px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        value={newDelivUrl}
                        onChange={(e) => setNewDelivUrl(e.target.value)}
                        placeholder="URL de enlace en línea (opcional: Canva, OneDrive, Google Drive...)"
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '12px',
                          marginBottom: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          style={{
                            minHeight: 'unset',
                            height: '30px',
                            padding: '0 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                          onClick={() => setShowAddDeliverable(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          style={{
                            minHeight: 'unset',
                            height: '30px',
                            padding: '0 14px',
                            fontSize: '11.5px',
                            fontWeight: 650,
                            borderRadius: '6px',
                            border: '1px solid #0066ff',
                            background: '#0066ff',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: 'none',
                          }}
                          onClick={() => {
                            if (!newDelivName.trim()) {
                              notify('Ingresa el nombre del entregable');
                              return;
                            }
                            handleAddDeliverable({
                              name: newDelivName.trim(),
                              type: newDelivType,
                              tipoCodigo: newDelivTipoCodigo || undefined,
                              url: newDelivUrl.trim() || undefined,
                            });
                          }}
                        >
                          <Plus size={13} />
                          <span>Guardar entregable</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Entregables */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {getActiveDeliverables(activeItem).map((deliv) => {
                      const IconComp =
                        deliv.type === 'spreadsheet'
                          ? FileSpreadsheet
                          : deliv.type === 'presentation'
                          ? Presentation
                          : deliv.type === 'link'
                          ? Link2
                          : deliv.type === 'physical'
                          ? Package
                          : FileText;
                      const iconColor =
                        deliv.type === 'spreadsheet'
                          ? '#16a34a'
                          : deliv.type === 'presentation'
                          ? '#ea580c'
                          : deliv.type === 'link'
                          ? '#7c3aed'
                          : deliv.type === 'physical'
                          ? '#d97706'
                          : '#2563eb';
                      return (
                        <div
                          key={deliv.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '7px',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: `${iconColor}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <IconComp size={15} style={{ color: iconColor }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b
                                style={{
                                  fontSize: '12px',
                                  color: '#0f172a',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {deliv.name}
                              </b>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {deliv.type === 'spreadsheet'
                                  ? 'Matriz Excel'
                                  : deliv.type === 'presentation'
                                  ? 'Presentación / Canva'
                                  : deliv.type === 'link'
                                  ? 'Enlace Web'
                                  : deliv.type === 'physical'
                                  ? 'Bien / Entrega Física'
                                  : 'Documento Oficial'}
                                {deliv.url ? ' · En línea' : ''}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EstadoEntregableCatalogoSelect
                              value={deliv.estadoCodigo || 'pendiente'}
                              onChange={(nuevoEstado) => {
                                const currentList = getActiveDeliverables(activeItem);
                                const updated = currentList.map((d) =>
                                  d.id === deliv.id ? { ...d, estadoCodigo: nuevoEstado } : d
                                );
                                updateDraft({ deliverables: updated });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleOpenDeliverable(deliv)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '5px',
                                padding: '4px 7px',
                                color: '#0f172a',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                              }}
                              title="Abrir en pestaña nueva del navegador"
                            >
                              <ExternalLink size={12} color="#0284c7" />
                              <span style={{ fontWeight: 600 }}>Abrir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(deliv.id)}
                              disabled={!puedeEstructura}
                              title={!puedeEstructura ? 'Solo lectura: eliminar entregables requiere permiso de estructura (rol admin o llave gp.administrar_edt)' : 'Eliminar entregable'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                padding: '4px',
                                cursor: 'pointer',
                              }}
                              title="Eliminar entregable"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {getActiveDeliverables(activeItem).length === 0 && !showAddDeliverable && (
                      <div
                        style={{
                          padding: '10px',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '11.5px',
                        }}
                      >
                        Sin entregables oficiales vinculados
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Fechas (Inicio y Fin) */}
                <div className="date-fields">
                  <div className="field relative">
                    <span>Fecha de inicio</span>
                    <button
                      type="button"
                      className={`custom-date-btn ${editorCalOpen === 'start' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen(false);
                        setEditorCalOpen((p) => p === 'start' ? null : 'start');
                      }}
                      title="Seleccionar fecha de inicio con calendario institucional"
                    >
                      <span>{formatDatePE(activeItem.start)}</span>
                      <CalendarDays size={14} className="date-btn-icon" />
                    </button>
                    {editorCalOpen === 'start' && (
                      <MiniCalendar
                        value={activeItem.start}
                        onChange={(newDate) => {
                          setDraftStart(newDate);
                          setEditorCalOpen(null);
                        }}
                        onClose={() => setEditorCalOpen(null)}
                        align="left"
                      />
                    )}
                  </div>

                  <div className="field relative">
                    <span>Fecha de fin</span>
                    <button
                      type="button"
                      className={`custom-date-btn ${editorCalOpen === 'end' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen(false);
                        setEditorCalOpen((p) => p === 'end' ? null : 'end');
                      }}
                      title="Seleccionar fecha de fin con calendario institucional"
                    >
                      <span>{formatDatePE(activeItem.end)}</span>
                      <CalendarDays size={14} className="date-btn-icon" />
                    </button>
                    {editorCalOpen === 'end' && (
                      <MiniCalendar
                        value={activeItem.end}
                        min={activeItem.start}
                        onChange={(newDate) => {
                          setDraftEnd(newDate);
                          setEditorCalOpen(null);
                        }}
                        onClose={() => setEditorCalOpen(null)}
                        align="right"
                      />
                    )}
                  </div>
                </div>

                {/* 5. Estado de cumplimiento */}
                <div className="field relative">
                  <span>Estado de cumplimiento</span>
                  <div className="filter-dropdown-wrap">
                    <button
                      type="button"
                      className={`filter-card-btn ${editorStatusOpen ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorCalOpen(null);
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen((v) => !v);
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className={`status ${STATUS_CLASS[activeItem.status]}`}>
                          {activeItem.status}
                        </span>
                      </span>
                      <ChevronDown
                        size={14}
                        className="filter-chevron"
                        style={{
                          transform: editorStatusOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                          color: '#64748b',
                        }}
                      />
                    </button>
                    {editorStatusOpen && (
                      <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-popover-title">Estado Oficial</div>
                        {STATUS_OPTIONS.map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={`filter-item-btn ${activeItem.status === st ? 'selected' : ''}`}
                            onClick={() => {
                              setDraftStatus(st);
                              setEditorStatusOpen(false);
                            }}
                          >
                            <span className={`status ${STATUS_CLASS[st]}`}>{st}</span>
                            {activeItem.status === st && (
                              <Check size={14} className="item-check" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Avance */}
                {(() => {
                  const isContainer = Boolean((activeItem.children && activeItem.children.length > 0) || isContainerEdtType(resolveEdtNodeType(activeItem, items)) || activeChildItems.length > 0);
                   const linkedTaskSummary = !isContainer ? getLinkedTasksSummary(activeItem, rawTasks) : null;

                  return (
                    <div className="progress-edit">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avance</span>
                        <b style={{ fontSize: '13px', color: '#0f172a' }}>{activeItem.progress}%</b>
                      </div>
                      {/* Tabla 11: el catálogo existe, la pantalla de registro de avances aún no. */}
                      <TablaPorConectar
                        campo="Tipo de avance"
                        tabla="gp_tipos_avance_c"
                        nota="6 tipos PMI; aquí se clasificará cada registro de avance con su sustento"
                      />
                      {(isContainer || linkedTaskSummary) && (
                        <div
                          style={{
                            height: '7px',
                            width: '100%',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            marginBottom: '8px',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.max(0, Math.min(100, activeItem.progress))}%`,
                              backgroundColor: activeItem.progress >= 100 ? '#16a34a' : '#2563eb',
                              borderRadius: 'inherit',
                              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                          />
                        </div>
                      )}
                      {isContainer ? (
                        <div style={{ padding: '7px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                          <span>Calculado por rollup de subelementos (PMI - Regla del 100%)</span>
                        </div>
                      ) : linkedTaskSummary ? (
                        <div style={{ padding: '7px 10px', background: '#eff6ff', borderRadius: '6px', fontSize: '11px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                          <span>Gobernado por tareas operativas ({linkedTaskSummary.completed}/{linkedTaskSummary.total} completadas)</span>
                        </div>
                      ) : (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={activeItem.progress}
                          onChange={(e) => setDraftProgress(+e.target.value)}
                        />
                      )}
                    </div>
                  );
                })()}

                {/* 8. Desglose de Tareas vinculadas (100% Dinámico) */}
                {(() => {
                   const tasks = linkedTasks;
                   const total = linkedTaskStats.total;
                   const completed = linkedTaskStats.completed;
                   const pct = linkedTaskStats.progress;
                  return (
                    <div className="field" style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          <CheckSquare size={15} style={{ color: '#0284c7' }} />
                          Tareas vinculadas ({total})
                        </span>
                        <button
                          type="button"
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            color: '#0284c7',
                            fontSize: '12px',
                            fontWeight: 650,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => handleOpenCreateTaskModal(activeItem.name)}
                        >
                          <Plus size={13} />
                          <span>Crear tarea para este componente</span>
                        </button>
                      </div>

                      <div className="task-relation-box">
                        <div className="task-relation-head">
                          <span style={{ fontSize: '13.5px', fontWeight: 650, color: '#0f172a' }}>
                            {total === 0 ? 'Sin tareas operativas asignadas' : `${completed} de ${total} completadas`}
                          </span>
                          <span className="task-relation-badge">
                            {total === 0 ? '0 tareas · 0%' : `${pct}% ejecutado`}
                          </span>
                        </div>
                        <div className="task-relation-bar">
                          <div
                            className="task-relation-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct === 100 ? '#16a34a' : pct >= 40 ? '#0284c7' : '#f59e0b',
                            }}
                          />
                        </div>

                        {/* Lista interactiva de tareas vinculadas si existen */}
                        {total > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                            {tasks.map((task: any) => {
                              const isDone = task.status === 'Cumple' || task.status === 'Completado' || task.status === 'Completada';
                              return (
                                <div
                                  key={task.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '7px',
                                    fontSize: '13px',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => handleToggleTask(task.id)}
                                    style={{ cursor: 'pointer', accentColor: '#16a34a', width: '15px', height: '15px' }}
                                  />
                                  <span
                                    style={{
                                      flex: 1,
                                      color: isDone ? '#94a3b8' : '#0f172a',
                                      textDecoration: isDone ? 'line-through' : 'none',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {task.title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      background: isDone ? '#dcfce7' : '#f1f5f9',
                                      color: isDone ? '#15803d' : '#475569',
                                    }}
                                  >
                                    {task.status || 'Pendiente'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {total > 0
                              ? `${total} tarea(s) sincronizadas con módulo Tareas Kanban`
                              : 'Vincula tareas operativas con responsables y fechas para medir el avance del componente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                </div>
                </div>
            )}

            {/* Pestaña: Subcomponentes del Componente */}
            {editorTab === 'subprocesos' && (
              <div className="editor-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                       {activeItem.kind === 'hito' ? 'Subcomponentes' : 'Sub-elementos / Paquetes de trabajo'} ({activeChildItems.length})
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {activeItem.kind === 'hito'
                        ? 'Desglose de subcomponentes, paquetes de trabajo y entregables hijos.'
                        : 'Subdivisiones y paquetes de trabajo vinculados.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn primary"
                    style={{ height: '32px', padding: '0 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => add('subproceso', activeItem.id)}
                    disabled={!puedeEstructura}
                    title={!puedeEstructura ? 'Solo lectura: la estructura EDT requiere rol admin o llave gp.administrar_edt' : undefined}
                  >
                    <Plus size={14} />
                    <span>{activeItem.kind === 'hito' ? 'Agregar Subcomponente' : 'Agregar Sub-elemento'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {activeChildItems.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <FileText size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{sub.code}</span>
                          <b style={{ fontSize: '12.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.name}
                          </b>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#64748b' }}>
                          <span>{formatDatePE(sub.start)} – {formatDatePE(sub.end)}</span>
                          <span>•</span>
                          <b>{sub.progress}%</b>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span className={`status ${STATUS_CLASS[sub.status]}`} style={{ fontSize: '11px' }}>
                          {sub.status}
                        </span>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11.5px' }}
                          onClick={() => openEditorForItem(sub)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                   {activeChildItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <FileText size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                      <b style={{ fontSize: '13px', color: '#334155', display: 'block' }}>
                        {activeItem.kind === 'hito' ? 'No hay subcomponentes asignados' : 'No hay sub-elementos asignados'}
                      </b>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block', margin: '4px 0 14px' }}>
                        {activeItem.kind === 'hito'
                          ? 'Desglosa este componente en subcomponentes o paquetes de trabajo estructurados.'
                          : 'Desglosa este subcomponente en niveles operativos de mayor detalle.'}
                      </span>
                      <button
                        type="button"
                        className="btn primary"
                        style={{ height: '32px', padding: '0 14px', fontSize: '12px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => add('subproceso', activeItem.id)}
                        disabled={!puedeEstructura}
                        title={!puedeEstructura ? 'Solo lectura: la estructura EDT requiere rol admin o llave gp.administrar_edt' : undefined}
                      >
                        <Plus size={14} />
                        <span>{activeItem.kind === 'hito' ? 'Crear primer subcomponente' : 'Crear primer sub-elemento'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: Dependencias y Prelaciones */}
            {editorTab === 'dependencias' && (
              <div className="editor-body">
                <div style={{ marginBottom: 12 }}>
                  <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                    Dependencias y Prelación (Ruta Crítica)
                  </b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Configura qué hitos deben finalizar antes de iniciar esta etapa (Finish-to-Start).
                  </span>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '12.5px', fontWeight: 650 }}>
                    <ArrowRight size={15} />
                    <span>Cadena de Prelación Oficial</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#15803d', lineHeight: 1.4 }}>
                    Los desfases en el hito predecesor alertarán automáticamente sobre posibles cuellos de botella en la entrega.
                  </p>
                </div>

                <div className="field relative">
                  <span>Vincular Componente Predecesor (Requisito previo)</span>
                  <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`filter-card-btn ${editorDepSelectOpen ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        height: '36px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorCalOpen(null);
                        setEditorStatusOpen(false);
                        setEditorReportTypeOpen(false);
                        setEditorHitoSelectOpen(false);
                        setEditorParentSelectOpen(false);
                        setEditorDepSelectOpen((v) => !v);
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'left',
                        }}
                      >
                        {(() => {
                          const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                          const dep = items.find((x) => x.id === currentPredecessorId);
                          return dep ? `${dep.code} ${dep.name}` : 'Sin predecesor (Actividad inicial o independiente)';
                        })()}
                      </span>
                      <ChevronDown
                        size={14}
                        className="filter-chevron"
                        style={{
                          transform: editorDepSelectOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                          color: '#64748b',
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      />
                    </button>
                    {editorDepSelectOpen && (
                      <div
                        className="filter-card-popover"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          marginTop: '4px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="filter-popover-title">Predecesor en Cadena / Ruta Crítica</div>
                        <button
                          type="button"
                          className={`filter-item-btn ${!(activeItem.dependencies?.[0] || (activeItem.kind === 'hito' && activeItem.parentId)) ? 'selected' : ''}`}
                          onClick={() => {
                            updateDraft({ dependencies: [] });
                            setEditorDepSelectOpen(false);
                          }}
                          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span style={{ fontSize: '12px' }}>Sin predecesor (Actividad inicial o independiente)</span>
                          {!(activeItem.dependencies?.[0] || (activeItem.kind === 'hito' && activeItem.parentId)) && (
                            <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />
                          )}
                        </button>
                        {items
                          .filter((h) => h.id !== activeItem.id)
                          .map((h) => {
                            const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                            const isSelected = currentPredecessorId === h.id;
                            return (
                              <button
                                key={h.id}
                                type="button"
                                className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  updateDraft({ dependencies: [h.id] });
                                  setEditorDepSelectOpen(false);
                                }}
                                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                  <b style={{ color: '#0284c7', marginRight: 5 }}>{h.code}</b> {h.name} (Fin: {formatDatePE(h.end)})
                                </span>
                                {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                  const predItem = currentPredecessorId ? items.find((x) => x.id === currentPredecessorId) : null;
                  if (!predItem) return null;
                  return (
                    <div style={{ marginTop: 12, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Flujo de Prelación Configurado
                        </small>
                        <TipoDependenciaCatalogoSelect
                          value={activeItem.dependencyType || 'FS'}
                          onChange={(codigo) => updateDraft({ dependencyType: codigo })}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 8 }}>
                        <div style={{ padding: '6px 10px', background: '#e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                          {predItem.code} {predItem.name}
                        </div>
                        <ArrowRight size={16} color="#0284c7" />
                        <div style={{ padding: '6px 10px', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>
                          {activeItem.code} {activeItem.name}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Actividades Sucesoras */}
                <div className="field relative" style={{ marginTop: 14 }}>
                  <span>Vincular Actividades Sucesoras (Siguientes en cadena)</span>
                  <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`filter-card-btn ${editorSuccSelectOpen ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        height: '36px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorDepSelectOpen(false);
                        setEditorSuccSelectOpen((v) => !v);
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'left',
                        }}
                      >
                        {(() => {
                          const succList = items.filter((it) => it.id !== activeItem.id && (it.dependencies || []).includes(activeItem.id));
                          if (succList.length === 0) return 'Sin sucesores vinculados';
                          return succList.map((s) => `${s.code} ${s.name}`).join(', ');
                        })()}
                      </span>
                      <ChevronDown
                        size={14}
                        className="filter-chevron"
                        style={{
                          transform: editorSuccSelectOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                          color: '#64748b',
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      />
                    </button>
                    {editorSuccSelectOpen && (
                      <div
                        className="filter-card-popover"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          marginTop: '4px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="filter-popover-title">Actividades Sucesoras (Dependen de este nodo)</div>
                        {items
                          .filter((h) => h.id !== activeItem.id)
                          .map((h) => {
                            const isSelected = (h.dependencies || []).includes(activeItem.id);
                            return (
                              <button
                                key={h.id}
                                type="button"
                                className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  onToggleSuccessor?.(activeItem.id, h.id, !isSelected);
                                }}
                                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                  <b style={{ color: '#0284c7', marginRight: 5 }}>{h.code}</b> {h.name}
                                </span>
                                {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {aplicarPermisos && !puedeEstructura && !puedeOperar && (
              <div style={{ padding: '6px 12px 0', fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={13} />
                <span>Solo lectura: tu rol no permite editar este elemento (la estructura requiere rol admin o llave gp.administrar_edt).</span>
              </div>
            )}
            <div className="editor-footer">
              <button
                className="delete"
                onClick={deleteItem}
                disabled={!puedeEstructura && !isNewDraft}
                title={!puedeEstructura && !isNewDraft ? 'Solo lectura: eliminar requiere permiso de estructura (rol admin o llave gp.administrar_edt)' : undefined}
              >
                <Trash2 size={15} />
                <span>{isNewDraft ? 'Cancelar borrador' : 'Eliminar'}</span>
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={handleSaveDrawer}
                disabled={!puedeEstructura && !puedeOperar}
                title={!puedeEstructura && !puedeOperar ? 'Solo lectura: tu rol no permite guardar cambios en este elemento' : undefined}
              >
                <Save size={15} />
                <span>Guardar cambios</span>
              </button>
            </div>
          </aside>
        )}

        {/* Modal Pop-up de Alerta Centrado: Salir sin Guardar */}
        {unsavedAlertOpen && (
          <div
            className="overlay"
            style={{ zIndex: 99999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setUnsavedAlertOpen(false);
                setPendingCloseAction(null);
              }
            }}
          >
            <div className="unsaved-alert-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div className="unsaved-alert-icon">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '2px 0 4px', fontSize: '16.5px', fontWeight: 750, color: '#0f172a' }}>
                    ¿Salir sin guardar cambios?
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b' }}>
                    Hay modificaciones o datos pendientes en este {activeItem?.kind === 'hito' ? 'componente' : 'subcomponente'}.
                  </small>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                Has cargado o editado información en el formulario lateral. Si sales ahora, se descartarán los cambios no confirmados.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600 }}
                  onClick={() => {
                    setUnsavedAlertOpen(false);
                    setPendingCloseAction(null);
                  }}
                >
                  Continuar editando
                </button>
                <button
                  type="button"
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
                  onClick={() => {
                    setUnsavedAlertOpen(false);
                    setPanelOpen(false);
                    setDrawerDraft(null);
                    setIsNewDraft(false);
                    setEditorInitialSnapshot('');
                    if (pendingCloseAction) {
                      pendingCloseAction();
                      setPendingCloseAction(null);
                    }
                    notify('Cambios descartados');
                  }}
                >
                  <Trash2 size={14} />
                  <span>Descartar y salir</span>
                </button>
              </div>
            </div>
          </div>
        )}

    </>
  );
});

export default GanttEditorDrawer;
