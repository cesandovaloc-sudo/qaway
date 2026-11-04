// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../cronograma-gantt/gantt.css';
import './tareas.css';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Flag,
  GitPullRequest,
  LayoutDashboard,
  List,
  ListChecks,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  X,
  MoreHorizontal,
  ChartNoAxesColumnIncreasing,
  FolderKanban,
  UserRound,
} from 'lucide-react';

export type Status = 'Pendiente' | 'En proceso' | 'Bloqueada' | 'Cumple';
export type Origin =
  | 'Coordinación directa'
  | 'Reunión o acta'
  | 'Hito del proyecto'
  | 'Necesidad operativa'
  | 'Incidencia';
export type Kind = 'Vinculada al cronograma' | 'Operativa independiente' | 'En consulta';

export interface Task {
  id: number;
  title: string;
  milestone: string;
  owner: string;
  due: string;
  status: Status;
  priority: 'Alta' | 'Media' | 'Baja';
  origin: Origin;
  kind: Kind;
  description: string;
  checklist: { text: string; done: boolean }[];
  requester?: string;
  assignedBy?: string;
  start?: string;
  meetingRef?: string;
  deliverable?: string;
  blockedReason?: string;
  comments?: { author: string; text: string; date: string }[];
  attachments?: string[];
  history?: { text: string; date: string }[];
}

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Consolidar información de distribución de materiales educativos',
    milestone: 'Seguimiento de distribución',
    owner: 'María Salazar',
    due: '2026-10-27',
    status: 'En proceso',
    priority: 'Alta',
    origin: 'Coordinación directa',
    kind: 'Operativa independiente',
    deliverable: 'Padrón consolidado de distribución visado',
    description:
      'Verificar la información recibida de las coordinaciones locales y consolidar los datos pendientes para la supervisión regional.',
    checklist: [
      { text: 'Solicitar actualización a las sedes', done: true },
      { text: 'Validar información recibida', done: false },
      { text: 'Enviar consolidado a dirección', done: false },
    ],
  },
  {
    id: 2,
    title: 'Revisar observaciones del plan de trabajo regional',
    milestone: 'Aprobación del plan de trabajo',
    owner: 'Jorge Paredes',
    due: '2026-10-28',
    status: 'Pendiente',
    priority: 'Alta',
    origin: 'Hito del proyecto',
    kind: 'Vinculada al cronograma',
    deliverable: 'Plan de trabajo regional visado',
    description:
      'Revisar observaciones pendientes y preparar la versión corregida del plan de trabajo técnico.',
    checklist: [
      { text: 'Revisar comentarios de supervisores', done: false },
      { text: 'Preparar ajustes presupuestarios', done: false },
    ],
  },
  {
    id: 3,
    title: 'Enviar minuta de coordinación regional',
    milestone: '—',
    owner: 'Lucía Torres',
    due: '2026-10-25',
    status: 'Cumple',
    priority: 'Media',
    origin: 'Reunión o acta',
    kind: 'Operativa independiente',
    deliverable: 'Minuta de acuerdos firmada',
    description:
      'Compartir la minuta con todos los participantes y registrar los acuerdos en la plataforma.',
    checklist: [
      { text: 'Validar acuerdos con moderador', done: true },
      { text: 'Enviar a participantes', done: true },
    ],
  },
  {
    id: 4,
    title: 'Confirmar disponibilidad de materiales en almacén (RAR)',
    milestone: 'Verificación de disponibilidad',
    owner: 'Carlos Rojas',
    due: '2026-10-29',
    status: 'Bloqueada',
    priority: 'Media',
    origin: 'Coordinación directa',
    kind: 'En consulta',
    deliverable: 'Ficha de verificación técnica de stock',
    description:
      'La confirmación depende de información de inventario que aún debe validarse en campo.',
    checklist: [
      { text: 'Solicitar información de inventario', done: true },
      { text: 'Recibir confirmación de almacén', done: false },
    ],
  },
  {
    id: 5,
    title: 'Preparar reporte de avance quincenal',
    milestone: 'Reporte de avance',
    owner: 'Ana Mendoza',
    due: '2026-10-30',
    status: 'En proceso',
    priority: 'Media',
    origin: 'Hito del proyecto',
    kind: 'Vinculada al cronograma',
    deliverable: 'Reporte ejecutivo quincenal emitido',
    description:
      'Preparar el reporte con avances, riesgos identificados y acuerdos pendientes del comité directivo.',
    checklist: [
      { text: 'Recopilar avances de frentes', done: true },
      { text: 'Redactar reporte ejecutivo', done: false },
      { text: 'Validar datos cuantitativos', done: false },
    ],
  },
  {
    id: 6,
    title: 'Consultar estado de atención de solicitud',
    milestone: '—',
    owner: 'María Salazar',
    due: '2026-10-31',
    status: 'Pendiente',
    priority: 'Baja',
    origin: 'Necesidad operativa',
    kind: 'En consulta',
    deliverable: 'Acta de atención de consulta técnica',
    description:
      'Confirmar el estado de atención de la solicitud y registrar la respuesta recibida.',
    checklist: [{ text: 'Contactar al área de soporte técnico', done: false }],
  },
  {
    id: 7,
    title: 'Actualizar matriz de responsables territoriales',
    milestone: 'Organización operativa',
    owner: 'Jorge Paredes',
    due: '2026-11-02',
    status: 'Pendiente',
    priority: 'Baja',
    origin: 'Hito del proyecto',
    kind: 'Vinculada al cronograma',
    deliverable: 'Matriz de asignación de roles aprobada',
    description:
      'Actualizar responsables de sedes y verificar la asignación equilibrada de actividades.',
    checklist: [
      { text: 'Revisar matriz actual de personal', done: false },
      { text: 'Publicar versión actualizada', done: false },
    ],
  },
];

const STATUSES: Status[] = ['Pendiente', 'En proceso', 'Bloqueada', 'Cumple'];
const ORIGINS: Origin[] = [
  'Coordinación directa',
  'Reunión o acta',
  'Hito del proyecto',
  'Necesidad operativa',
  'Incidencia',
];
const KINDS: Kind[] = ['Vinculada al cronograma', 'Operativa independiente', 'En consulta'];

const statusBadgeClass = (s: Status) => {
  switch (s) {
    case 'Cumple':
      return 'badge-complete';
    case 'En proceso':
      return 'badge-progress';
    case 'Bloqueada':
      return 'badge-late';
    case 'Pendiente':
    default:
      return 'badge-pending';
  }
};

const getInitials = (s: string) =>
  s
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

const formatDateText = (s: string) => {
  if (!s) return '—';
  try {
    return new Date(s + 'T12:00:00')
      .toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
      .replace('.', '');
  } catch {
    return s;
  }
};

const TASK_COLUMNS: ColumnDef<Task>[] = [
  { id: 'title', label: 'Tarea', type: 'text', accessor: (t) => `${t.title} ${t.id}` },
  {
    id: 'origin',
    label: 'Origen',
    type: 'select',
    accessor: (t) => t.origin,
    options: ORIGINS.map((o) => ({ value: o, label: o })),
  },
  { id: 'milestone', label: 'Hito / vinculación', type: 'relation', accessor: (t) => t.milestone },
  { id: 'deliverable', label: 'Entregable esperado', type: 'text', accessor: (t) => t.deliverable || '' },
  { id: 'owner', label: 'Responsable', type: 'person', accessor: (t) => t.owner },
  { id: 'due', label: 'Fecha límite', type: 'date', accessor: (t) => t.due },
  {
    id: 'status',
    label: 'Estado',
    type: 'processState',
    accessor: (t) => t.status,
    options: STATUSES.map((s) => ({ value: s, label: s })),
  },
];

export interface TareasViewProps {
  activeProject?: any;
  onTasksCount?: (n: number) => void;
  onActions?: (h: { setView: (v: string) => void; notify: (m: string) => void }) => void;
}

export default function TareasView({ activeProject, onTasksCount, onActions }: TareasViewProps) {
  const bindsRef = useRef<{ setView: (v: string) => void; notify: (m: string) => void } | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || 'null');
      const list = Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_TASKS;
      return list.map((t: any, idx: number) => ({
        ...t,
        deliverable: t.deliverable || INITIAL_TASKS[idx]?.deliverable || t.deliverable,
        status: ({ 'En curso': 'En proceso', Completada: 'Cumple' } as any)[t.status] || t.status,
      }));
    } catch {
      return INITIAL_TASKS;
    }
  });

  const engine = useTableEngine<Task>({ tableId: 'tareas-lista', columns: TASK_COLUMNS, rows: tasks });

  // Pestañas y Switcher
  const [selectedPill, setSelectedPill] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'Todas' | 'Tablero' | 'Por hito'>('Todas');

  // Filtros de búsqueda y desplegables
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Todos los estados');
  const [origin, setOrigin] = useState('Todos los orígenes');
  const [kind, setKind] = useState('Todos los tipos');
  const [openDropdown, setOpenDropdown] = useState<'status' | 'origin' | 'kind' | null>(null);

  // Modales y Drawers
  const [create, setCreate] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'Resumen' | 'Checklist' | 'Actividad' | 'Archivos'>('Resumen');
  const [commentText, setCommentText] = useState('');
  const [attachmentText, setAttachmentText] = useState('');
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    title: '',
    deliverable: '',
    origin: 'Coordinación directa' as Origin,
    kind: 'Operativa independiente' as Kind,
    milestone: '',
    owner: '',
    due: '',
    priority: 'Media' as Task['priority'],
    description: '',
  });

  // Cierre de popovers al hacer click fuera
  useEffect(() => {
    const handleDocClick = () => setOpenDropdown(null);
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2600);
  };

  const save = (next: Task[]) => {
    setTasks(next);
    try {
      localStorage.setItem('qaway-tasks-v1', JSON.stringify(next));
    } catch {}
  };

  const update = (id: number, patch: Partial<Task>) => save(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const current = useMemo(() => tasks.find((t) => t.id === detail) || null, [tasks, detail]);

  const addComment = (t: Task) => {
    if (!commentText.trim()) return;
    update(t.id, {
      comments: [
        ...(t.comments || []),
        { author: 'Coordinador General', text: commentText.trim(), date: new Date().toLocaleString('es-PE') },
      ],
      history: [...(t.history || []), { text: 'Se añadió un comentario', date: new Date().toLocaleString('es-PE') }],
    });
    setCommentText('');
    notify('Comentario añadido');
  };

  const addAttachment = (t: Task) => {
    if (!attachmentText.trim()) return;
    update(t.id, {
      attachments: [...(t.attachments || []), attachmentText.trim()],
      history: [
        ...(t.history || []),
        { text: `Se registró el archivo: ${attachmentText.trim()}`, date: new Date().toLocaleString('es-PE') },
      ],
    });
    setAttachmentText('');
    notify('Referencia de archivo añadida');
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQ =
        !q ||
        [t.title, t.owner, t.milestone, t.deliverable || '', t.origin].some((v) =>
          v.toLowerCase().includes(q.toLowerCase())
        );

      const matchesStatus = status === 'Todos los estados' || t.status === status;
      const matchesOrigin = origin === 'Todos los orígenes' || t.origin === origin;
      const matchesKind = kind === 'Todos los tipos' || t.kind === kind;

      const matchesPill =
        selectedPill === 'Todas' ||
        (selectedPill === 'En proceso' && t.status === 'En proceso') ||
        (selectedPill === 'Por vencer' && t.status !== 'Cumple' && t.due < '2026-10-30') ||
        (selectedPill === 'En consulta' && t.kind === 'En consulta') ||
        (selectedPill === 'Cumplidas' && t.status === 'Cumple');

      return matchesQ && matchesStatus && matchesOrigin && matchesKind && matchesPill;
    });
  }, [tasks, q, status, origin, kind, selectedPill]);

  const tableView = useMemo(() => engine.apply(filtered), [engine.apply, filtered]);

  const counts = useMemo(() => {
    const all = tasks.length;
    const progress = tasks.filter((t) => t.status === 'En proceso').length;
    const overdue = tasks.filter((t) => t.status !== 'Cumple' && t.due < '2026-10-25').length;
    const consult = tasks.filter((t) => t.kind === 'En consulta').length;
    const done = tasks.filter((t) => t.status === 'Cumple').length;
    return { all, progress, overdue, consult, done };
  }, [tasks]);

  const createTask = () => {
    if (!form.title.trim() || !form.owner.trim() || !form.due) {
      notify('Completa título, responsable y fecha límite.');
      return;
    }
    const t: Task = {
      id: Math.max(0, ...tasks.map((x) => x.id)) + 1,
      title: form.title.trim(),
      deliverable: form.deliverable.trim() || undefined,
      milestone: form.milestone || '—',
      owner: form.owner.trim(),
      due: form.due,
      status: 'Pendiente',
      priority: form.priority,
      origin: form.origin,
      kind: form.kind,
      description: form.description,
      checklist: [],
      requester: 'Coordinación General',
      assignedBy: 'Asignación Directa',
      comments: [],
      attachments: [],
      history: [{ text: 'Tarea creada', date: new Date().toLocaleString('es-PE') }],
    };
    save([t, ...tasks]);
    setCreate(false);
    setSelectedPill('Todas');
    setForm({
      title: '',
      deliverable: '',
      origin: 'Coordinación directa',
      kind: 'Operativa independiente',
      milestone: '',
      owner: '',
      due: '',
      priority: 'Media',
      description: '',
    });
    notify('Tarea registrada en el sistema');
  };

  const exportCSV = () => {
    const rows = [
      ['Tarea', 'Hito', 'Entregable', 'Responsable', 'Vencimiento', 'Estado', 'Prioridad', 'Origen', 'Tipo'],
      ...filtered.map((t) => [
        t.title,
        t.milestone,
        t.deliverable || '—',
        t.owner,
        t.due,
        t.status,
        t.priority,
        t.origin,
        t.kind,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + rows.map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_tareas_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Reporte exportado correctamente');
  };

  useEffect(() => {
    bindsRef.current = { setView: (v: string) => setSelectedPill(v), notify };
    onActions?.(bindsRef.current);
  }, [onActions]);

  useEffect(() => {
    onTasksCount?.(tasks.length);
  }, [tasks, onTasksCount]);

  const projectName = activeProject?.name || 'Gestión del Proyecto';

  const tabPills = [
    { id: 'Todas', label: 'Todas las tareas', count: counts.all },
    { id: 'En proceso', label: 'En proceso', count: counts.progress },
    { id: 'Por vencer', label: 'Por vencer', count: counts.overdue },
    { id: 'En consulta', label: 'En consulta', count: counts.consult },
    { id: 'Cumplidas', label: 'Cumplidas', count: counts.done },
  ];

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Header Principal Oficial (Idéntico a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <ListChecks size={26} />
            </span>
            <div>
              <h1>Tareas del Proyecto · {projectName}</h1>
              <p>
                Organiza los compromisos operativos, asigna responsables y vincula entregables a los hitos del proyecto.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button className="btn secondary" onClick={exportCSV} title="Descargar reporte en formato CSV">
              <Download size={15} />
              <span>Exportar Tareas</span>
            </button>
            <button className="btn primary" onClick={() => setCreate(true)}>
              <Plus size={16} />
              <span>Nueva Tarea Vinculada</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedPill('Todas');
              setStatus('Todos los estados');
            }}
          >
            <span className="metric-icon">
              <ListChecks size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(counts.all).padStart(2, '0')}</b>
              <strong>Tareas Registradas</strong>
              <small>en este proyecto</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedPill('En proceso');
              setStatus('En proceso');
            }}
          >
            <span className="metric-icon">
              <Activity size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(counts.progress).padStart(2, '0')}</b>
              <strong>En Proceso</strong>
              <small>con trabajo activo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedPill('En consulta');
              setKind('En consulta');
            }}
          >
            <span className="metric-icon">
              <GitPullRequest size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(counts.consult).padStart(2, '0')}</b>
              <strong>En Consulta</strong>
              <small>pendientes de definición</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setSelectedPill('Por vencer');
            }}
          >
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(counts.overdue).padStart(2, '0')}</b>
              <strong>Vencidas / Alerta</strong>
              <small>requieren seguimiento</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma y Equipo)
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              {tabPills.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={selectedPill === t.id ? 'active' : ''}
                  onClick={() => setSelectedPill(t.id)}
                >
                  {t.label} <span>({t.count})</span>
                </button>
              ))}
            </div>

            {/* Switcher de Modos (Lista, Tablero, Por Hito) */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Todas' ? 'active' : ''}`}
                onClick={() => setViewMode('Todas')}
                title="Vista Lista Tabular"
              >
                <List size={14} />
                <span>Lista</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Tablero' ? 'active' : ''}`}
                onClick={() => setViewMode('Tablero')}
                title="Vista Tablero Kanban"
              >
                <LayoutDashboard size={14} />
                <span>Tablero</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Por hito' ? 'active' : ''}`}
                onClick={() => setViewMode('Por hito')}
                title="Vista Agrupada por Hito"
              >
                <Flag size={14} />
                <span>Por Hito</span>
              </button>
            </div>
          </nav>

          {/* Barra de Filtros Nativa estilo Cronograma */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar tarea, responsable, hito o entregable..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button onClick={() => setQ('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Estado */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                  status !== 'Todos los estados' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por estado de tarea"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>{status}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {['Todos los estados', ...STATUSES].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-item-btn ${status === st ? 'selected' : ''}`}
                        onClick={() => {
                          setStatus(st);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st}</span>
                        {status === st && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Origen */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'origin' ? 'active' : ''} ${
                  origin !== 'Todos los orígenes' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'origin' ? null : 'origin');
                }}
                title="Filtrar por origen"
              >
                <div className="filter-card-copy">
                  <small>Origen</small>
                  <span>{origin}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'origin' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Origen</div>
                  <div className="filter-popover-list">
                    {['Todos los orígenes', ...ORIGINS].map((orig) => (
                      <button
                        key={orig}
                        type="button"
                        className={`filter-item-btn ${origin === orig ? 'selected' : ''}`}
                        onClick={() => {
                          setOrigin(orig);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{orig}</span>
                        {origin === orig && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Tipo */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'kind' ? 'active' : ''} ${
                  kind !== 'Todos los tipos' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'kind' ? null : 'kind');
                }}
                title="Filtrar por tipo"
              >
                <div className="filter-card-copy">
                  <small>Tipo de Tarea</small>
                  <span>{kind}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'kind' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 230 }}>
                  <div className="filter-popover-title">Filtrar por Tipo</div>
                  <div className="filter-popover-list">
                    {['Todos los tipos', ...KINDS].map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`filter-item-btn ${kind === k ? 'selected' : ''}`}
                        onClick={() => {
                          setKind(k);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{k}</span>
                        {kind === k && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(q || status !== 'Todos los estados' || origin !== 'Todos los orígenes' || kind !== 'Todos los tipos') && (
              <button
                className="clear-btn"
                onClick={() => {
                  setQ('');
                  setStatus('Todos los estados');
                  setOrigin('Todos los orígenes');
                  setKind('Todos los tipos');
                  engine.clearAllFilters();
                }}
                title="Limpiar todos los filtros"
              >
                Limpiar
              </button>
            )}

            <div style={{ flex: 1 }} />
          </div>

          {/* CUERPO PRINCIPAL DINÁMICO SEGÚN MODO */}
          {viewMode === 'Tablero' ? (
            <div className="cronograma-kanban-board">
              <div className="kanban-columns-track">
                {STATUSES.map((s) => {
                  const dotColor =
                    s === 'Cumple'
                      ? '#10b981'
                      : s === 'En proceso'
                      ? '#0066ff'
                      : s === 'Bloqueada'
                      ? '#ef4444'
                      : '#94a3b8';
                  const cardsInCol = filtered.filter((t) => t.status === s);

                  return (
                    <div className="kanban-column" key={s}>
                      {/* Cabecera de Columna oficial Cronograma */}
                      <div className="kanban-column-header">
                        <div className="kanban-col-title-group">
                          <span className="kanban-col-dot" style={{ background: dotColor }} />
                          <span className="kanban-col-label">{s}</span>
                          <span className="kanban-col-count">{cardsInCol.length}</span>
                        </div>
                        <button
                          type="button"
                          className="kanban-add-btn"
                          onClick={() => setCreate(true)}
                          title="Añadir tarea a esta etapa"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Lista de Tarjetas con diseño tarjeta Cronograma */}
                      <div className="kanban-cards-list">
                        {cardsInCol.length === 0 ? (
                          <div className="kanban-column-empty">Sin tareas en esta etapa</div>
                        ) : (
                          cardsInCol.map((t) => (
                            <div
                              className="kanban-card"
                              key={t.id}
                              onClick={() => {
                                setDetail(t.id);
                                setDetailTab('Resumen');
                              }}
                            >
                              <div className="kanban-card-top">
                                <div className="kanban-card-title-wrap">
                                  <span className="kanban-card-code">
                                    QW-T-{String(t.id).padStart(3, '0')}
                                  </span>
                                  <span className="kanban-card-name">{t.title}</span>
                                </div>
                                <button
                                  type="button"
                                  className="kanban-card-menu-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetail(t.id);
                                  }}
                                  title="Ver detalle de tarea"
                                >
                                  <MoreHorizontal size={14} />
                                </button>
                              </div>

                              {t.deliverable && (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    color: '#0369a1',
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    width: 'fit-content',
                                  }}
                                >
                                  <Target size={11} color="#0284c7" />
                                  <span>{t.deliverable}</span>
                                </div>
                              )}

                              <div className="kanban-card-dates">
                                <CalendarDays size={12} />
                                <span>{formatDateText(t.due)}</span>
                                <span
                                  className={'priority p-' + t.priority.toLowerCase()}
                                  style={{
                                    marginLeft: 'auto',
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 650,
                                  }}
                                >
                                  {t.priority}
                                </span>
                              </div>

                              <div className="kanban-card-footer">
                                <div className="kanban-card-meta-left">
                                  <div
                                    className="gestor-avatar"
                                    style={{
                                      background: '#1e293b',
                                      width: '22px',
                                      height: '22px',
                                      fontSize: '9px',
                                      color: '#fff',
                                    }}
                                  >
                                    {getInitials(t.owner)}
                                  </div>
                                  <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
                                    {t.owner}
                                  </span>
                                </div>
                                {t.milestone !== '—' && (
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      color: '#64748b',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Flag size={10} color="#0066ff" />{' '}
                                    {t.milestone.length > 18 ? t.milestone.slice(0, 18) + '...' : t.milestone}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'Por hito' ? (
            <div className="groups" style={{ flex: 1, padding: '16px 18px', overflow: 'auto' }}>
              {Array.from(new Set(filtered.map((t) => t.milestone))).map((m) => (
                <section key={m} style={{ marginBottom: '16px' }}>
                  <header
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px 8px 0 0',
                    }}
                  >
                    <Flag size={15} color="#0066ff" />
                    <b style={{ fontSize: '13px', color: '#0f172a' }}>
                      {m === '—' ? 'Actividades operativas independientes' : m}
                    </b>
                    <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: '#64748b' }}>
                      {filtered.filter((t) => t.milestone === m).length} tareas
                    </span>
                  </header>
                  <table className="cronograma-lista-table" style={{ borderTop: 0 }}>
                    <tbody>
                      {filtered
                        .filter((t) => t.milestone === m)
                        .map((t) => (
                          <TaskRow
                            key={t.id}
                            t={t}
                            open={() => {
                              setDetail(t.id);
                              setDetailTab('Resumen');
                            }}
                            toggle={() => update(t.id, { status: t.status === 'Cumple' ? 'Pendiente' : 'Cumple' })}
                          />
                        ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          ) : (
            <div className="cronograma-lista-table-wrap" style={{ flex: 1, overflow: 'auto' }}>
              <TableEngineStatus engine={engine} />
              <table className="cronograma-lista-table">
                <thead>
                  <tr>
                    <th style={{ width: '38px', textAlign: 'center' }}></th>
                    <th><ColumnHeader engine={engine} columnId="title" label="Tarea" /></th>
                    <th><ColumnHeader engine={engine} columnId="origin" label="Origen" /></th>
                    <th><ColumnHeader engine={engine} columnId="milestone" label="Hito / Vinculación" /></th>
                    <th><ColumnHeader engine={engine} columnId="deliverable" label="Entregable Esperado" /></th>
                    <th><ColumnHeader engine={engine} columnId="owner" label="Responsable" /></th>
                    <th><ColumnHeader engine={engine} columnId="due" label="Fecha Límite" /></th>
                    <th><ColumnHeader engine={engine} columnId="status" label="Estado" /></th>
                    <th style={{ width: '44px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tableView.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-row" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Search size={22} color="#94a3b8" />
                          <b style={{ color: '#0f172a', fontSize: '13px' }}>No hay tareas que coincidan con la búsqueda</b>
                          <span style={{ color: '#64748b', fontSize: '11.5px' }}>Prueba con otros filtros o añade una nueva tarea vinculada.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableView.map((t) => (
                      <TaskRow
                        key={t.id}
                        t={t}
                        open={() => {
                          setDetail(t.id);
                          setDetailTab('Resumen');
                        }}
                        toggle={() => update(t.id, { status: t.status === 'Cumple' ? 'Pendiente' : 'Cumple' })}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Oficial Cronograma */}
          <footer className="footer">
            <span>
              Mostrando <b>{tableView.length}</b> de <b>{tasks.length}</b> tareas registradas
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn secondary"
                style={{ minHeight: '30px', fontSize: '12px' }}
                onClick={exportCSV}
              >
                Descargar Listado
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* DRAWER LATERAL: CREAR NUEVA TAREA */}
      {create && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreate(false);
          }}
        >
          <section className="drawer" style={{ width: 'min(540px, 100%)' }}>
            <header>
              <div>
                <small style={{ textTransform: 'uppercase' }}>PLANIFICACIÓN OPERATIVA · {projectName}</small>
                <h2>Nueva Tarea Vinculada</h2>
                <p>Registra el trabajo y define cómo se relaciona con el cronograma del proyecto.</p>
              </div>
              <button className="iconbtn" onClick={() => setCreate(false)}>
                <X size={18} />
              </button>
            </header>

            <div className="formbody">
              <h3>Información de la Tarea</h3>
              <label>
                Nombre de la tarea <b>*</b>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="¿Qué entregable o acción se necesita realizar?"
                />
              </label>

              <label>
                Entregable esperado (Criterio de finalización)
                <input
                  value={form.deliverable}
                  onChange={(e) => setForm({ ...form, deliverable: e.target.value })}
                  placeholder="Ej. Acta de recepción, Informe técnico visado, Padrón validado..."
                />
              </label>

              <label>
                Descripción
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Contexto, resultado esperado o indicaciones de campo..."
                />
              </label>

              <div className="formgrid">
                <label>
                  Responsable <b>*</b>
                  <input
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    placeholder="Nombre del integrante"
                  />
                </label>
                <label>
                  Fecha límite <b>*</b>
                  <input
                    type="date"
                    value={form.due}
                    onChange={(e) => setForm({ ...form, due: e.target.value })}
                  />
                </label>
              </div>

              <div className="formgrid">
                <label>
                  Prioridad
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </label>
                <label>
                  Origen de la tarea
                  <select
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value as Origin })}
                  >
                    {ORIGINS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <h3>Vinculación con el Proyecto</h3>
              <label>
                Tipo de tarea
                <select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <small>La tarea puede existir como operativa independiente o vincularse a un hito rector.</small>
              </label>

              <label>
                Hito relacionado <span>(opcional)</span>
                <select
                  value={form.milestone}
                  onChange={(e) => setForm({ ...form, milestone: e.target.value })}
                >
                  <option value="">Sin hito asignado</option>
                  {[
                    'Aprobación del plan de trabajo',
                    'Seguimiento de distribución',
                    'Verificación de disponibilidad',
                    'Reporte de avance',
                    'Organización operativa',
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              {form.kind === 'En consulta' && (
                <div className="callout">
                  <GitPullRequest size={17} />
                  <div>
                    <b>La tarea quedará en consulta</b>
                    <p>Se mantendrá en revisión técnica antes de su incorporación formal a la línea de tiempo.</p>
                  </div>
                </div>
              )}
            </div>

            <footer>
              <button className="btn secondary" onClick={() => setCreate(false)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={createTask}>
                <Check size={15} />
                <span>Crear Tarea</span>
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* DRAWER LATERAL: DETALLE Y FICHA DE LA TAREA */}
      {current && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <section className="drawer task-detail-drawer" style={{ width: 'min(580px, 100%)' }}>
            <header>
              <div>
                <small style={{ textTransform: 'uppercase' }}>
                  EXPEDIENTE DE TAREA · #{String(current.id).padStart(4, '0')} · {projectName}
                </small>
                <h2>Espacio de Trabajo de la Tarea</h2>
                <p>Registro operativo · Historial, compromisos y evidencias</p>
              </div>
              <button className="iconbtn" onClick={() => setDetail(null)}>
                <X size={18} />
              </button>
            </header>

            <div className="detail-hero">
              <div>
                <span className={`status-pill ${statusBadgeClass(current.status)}`} style={{ marginRight: '8px' }}>
                  {current.status}
                </span>
                <span className={'priority p-' + current.priority.toLowerCase()}>{current.priority}</span>
                <h2 className="detail-title" style={{ marginTop: '10px' }}>
                  {current.title}
                </h2>
                <p>{current.description || 'Sin descripción detallada registrada.'}</p>
              </div>
            </div>

            <nav className="detail-tabs">
              {[
                ['Resumen', 'Información'],
                ['Checklist', 'Checklist'],
                ['Actividad', 'Actividad'],
                ['Archivos', 'Archivos y Vínculos'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={detailTab === v ? 'active' : ''}
                  onClick={() => setDetailTab(v as any)}
                >
                  {l}
                  {v === 'Actividad' && (current.comments?.length || 0) > 0 && (
                    <i>{current.comments?.length}</i>
                  )}
                </button>
              ))}
            </nav>

            <div className="formbody">
              {detailTab === 'Resumen' && (
                <>
                  <div className="detail-grid">
                    <div>
                      <small>Responsable de ejecución</small>
                      <b>{current.owner}</b>
                    </div>
                    <div>
                      <small>Fecha límite</small>
                      <b>{formatDateText(current.due)}</b>
                    </div>
                    <div>
                      <small>Solicitada por</small>
                      <b>{current.requester || 'Coordinación'}</b>
                    </div>
                    <div>
                      <small>Origen</small>
                      <b>{current.origin}</b>
                    </div>
                    <div>
                      <small>Tipo de tarea</small>
                      <b>{current.kind}</b>
                    </div>
                    <div>
                      <small>Hito relacionado</small>
                      <b>{current.milestone === '—' ? 'Actividad independiente' : current.milestone}</b>
                    </div>
                  </div>

                  <h3>Entregable Comprometido</h3>
                  <div className="relation-card">
                    <Target size={16} color="#0066ff" />
                    <div>
                      <b>{current.deliverable || 'Entregable pendiente de definir'}</b>
                      <p>
                        {current.kind === 'En consulta'
                          ? 'La incorporación formal al cronograma está pendiente de revisión directiva.'
                          : 'Compromiso clave requerido para validar el cierre de la actividad.'}
                      </p>
                    </div>
                  </div>

                  <h3>Estado de Trabajo</h3>
                  <div className="status-choices">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        className={current.status === s ? 'choice chosen' : 'choice'}
                        onClick={() => {
                          update(current.id, {
                            status: s,
                            history: [
                              ...(current.history || []),
                              { text: `Estado cambiado a ${s}`, date: new Date().toLocaleString('es-PE') },
                            ],
                          });
                          notify(`Estado actualizado: ${s}`);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {detailTab === 'Checklist' && (
                <>
                  <h3>
                    Pasos de Ejecución{' '}
                    <span>
                      {current.checklist.filter((c) => c.done).length}/{current.checklist.length} completados
                    </span>
                  </h3>
                  <div className="progress-track">
                    <i
                      style={{
                        width: `${
                          current.checklist.length
                            ? (current.checklist.filter((c) => c.done).length / current.checklist.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  {current.checklist.map((c, i) => (
                    <label className="checkline" key={i}>
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={() =>
                          update(current.id, {
                            checklist: current.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)),
                            history: [
                              ...(current.history || []),
                              {
                                text: `Paso: ${c.text} ${c.done ? 'reabierto' : 'completado'}`,
                                date: new Date().toLocaleString('es-PE'),
                              },
                            ],
                          })
                        }
                      />
                      <span className={c.done ? 'struck' : ''}>{c.text}</span>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={(e) => {
                          e.preventDefault();
                          update(current.id, {
                            checklist: current.checklist.filter((_, j) => j !== i),
                          });
                        }}
                      >
                        <X size={13} />
                      </button>
                    </label>
                  ))}
                  <button
                    className="btn secondary small"
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      const text = window.prompt('Nombre del paso o subtarea técnica');
                      if (text?.trim()) {
                        update(current.id, {
                          checklist: [...current.checklist, { text: text.trim(), done: false }],
                        });
                      }
                    }}
                  >
                    <Plus size={14} /> Añadir paso
                  </button>
                </>
              )}

              {detailTab === 'Actividad' && (
                <>
                  <h3>Comentarios y Coordinación</h3>
                  <label>
                    Nuevo comentario u observación
                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Registra una actualización operativa o acuerdo..."
                    />
                  </label>
                  <button className="btn primary small" onClick={() => addComment(current)}>
                    <Plus size={13} /> Añadir comentario
                  </button>

                  <div className="activity-list">
                    {(current.comments || [])
                      .slice()
                      .reverse()
                      .map((c, i) => (
                        <article key={i}>
                          <div className="avatar" style={{ background: '#1e293b', color: '#fff' }}>
                            {getInitials(c.author)}
                          </div>
                          <div>
                            <b>{c.author}</b>
                            <small>{c.date}</small>
                            <p>{c.text}</p>
                          </div>
                        </article>
                      ))}
                    {(current.history || [])
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <article key={'h' + i}>
                          <div className="activity-mark">
                            <Activity size={13} />
                          </div>
                          <div>
                            <b>Historial del sistema</b>
                            <small>{h.date}</small>
                            <p>{h.text}</p>
                          </div>
                        </article>
                      ))}
                  </div>
                </>
              )}

              {detailTab === 'Archivos' && (
                <>
                  <h3>Archivos, Evidencias y Referencias</h3>
                  <label>
                    Nombre o enlace de evidencia documental
                    <input
                      value={attachmentText}
                      onChange={(e) => setAttachmentText(e.target.value)}
                      placeholder="Ej. Acta_de_entrega_visada.pdf o URL..."
                    />
                  </label>
                  <button className="btn secondary small" onClick={() => addAttachment(current)}>
                    <Plus size={14} /> Añadir referencia
                  </button>

                  <div className="attachment-list">
                    {(current.attachments || []).map((a, i) => (
                      <div key={i}>
                        <FileText size={16} />
                        <span>
                          <b>{a}</b>
                          <small>Referencia registrada · Documento visado</small>
                        </span>
                        <button
                          className="iconbtn"
                          onClick={() =>
                            update(current.id, {
                              attachments: current.attachments?.filter((_, j) => j !== i),
                            })
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <footer>
              <button className="btn secondary" onClick={() => setDetail(null)}>
                Cerrar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  const nextStatus = current.status === 'Cumple' ? 'Pendiente' : 'Cumple';
                  update(current.id, {
                    status: nextStatus,
                    history: [
                      ...(current.history || []),
                      {
                        text: `Tarea marcada como ${nextStatus}`,
                        date: new Date().toLocaleString('es-PE'),
                      },
                    ],
                  });
                  notify(nextStatus === 'Cumple' ? 'Tarea marcada como Cumplida' : 'Tarea reabierta');
                }}
              >
                {current.status === 'Cumple' ? <Activity size={15} /> : <CheckCheck size={15} />}
                <span>{current.status === 'Cumple' ? 'Reabrir Tarea' : 'Marcar Completada'}</span>
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* TOAST DE NOTIFICACIÓN */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 3000,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            fontSize: '12.5px',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #334155',
          }}
        >
          <Check size={16} color="#4ade80" />
          {toast}
        </div>
      )}
    </div>
  );
}

function TaskRow({ t, open, toggle }: { t: Task; open: () => void; toggle: () => void }) {
  return (
    <tr className="lista-row" onClick={open} style={{ cursor: 'pointer' }}>
      <td
        className="col-chk"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        style={{ textAlign: 'center' }}
      >
        <button
          className={'check ' + (t.status === 'Cumple' ? 'checked' : '')}
          aria-label="Cambiar estado"
        >
          {t.status === 'Cumple' && <Check size={12} />}
        </button>
      </td>

      <td className="col-name">
        <div className="gestor-cell" style={{ gap: '10px' }}>
          <div>
            <b
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#0f172a',
                fontWeight: 650,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0066ff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
            >
              {t.title}
            </b>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              QW-T-{String(t.id).padStart(3, '0')} · {t.origin}
            </small>
          </div>
        </div>
      </td>

      <td style={{ fontSize: '12px', color: '#475569' }}>{t.origin}</td>

      <td style={{ fontSize: '12px', color: '#334155' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Flag size={12} color="#0066ff" />
          <span>{t.milestone === '—' ? 'Sin hito vinculado' : t.milestone}</span>
        </span>
      </td>

      <td style={{ fontSize: '12px', color: '#334155', maxWidth: '240px' }}>
        {t.deliverable ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: '#0369a1',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 500,
            }}
          >
            <Target size={12} color="#0284c7" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.deliverable}
            </span>
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        )}
      </td>

      <td className="col-gestor">
        <div className="gestor-cell" style={{ gap: '8px' }}>
          <div className="gestor-avatar" style={{ background: '#1e293b', width: '26px', height: '26px', fontSize: '10px' }}>
            {getInitials(t.owner)}
          </div>
          <span style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>{t.owner}</span>
        </div>
      </td>

      <td style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
        {formatDateText(t.due)}
      </td>

      <td>
        <span className={`status-pill ${statusBadgeClass(t.status)}`}>
          {t.status}
        </span>
      </td>

      <td className="col-actions" style={{ textAlign: 'center' }}>
        <button
          className="btn-icon"
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          title="Ver detalle de tarea"
        >
          <MoreHorizontal size={16} />
        </button>
      </td>
    </tr>
  );
}
