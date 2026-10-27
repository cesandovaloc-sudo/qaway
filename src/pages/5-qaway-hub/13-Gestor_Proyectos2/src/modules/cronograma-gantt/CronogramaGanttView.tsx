// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect } from 'react';
import './gantt.css';
import {
  AlertTriangle,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  FileUp,
  Folder,
  FolderOpen,
  HelpCircle,
  Layers3,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X
} from 'lucide-react';

type Status = 'Completado' | 'En proceso' | 'Pendiente' | 'Con retraso';
type Kind = 'hito' | 'subproceso';

interface Item {
  id: string;
  code: string;
  name: string;
  kind: Kind;
  parentId?: string;
  start: string;
  end: string;
  progress: number;
  status: Status;
  expanded?: boolean;
  description?: string;
  reportType?: string;
  region?: string;
  gestor?: string;
}

const INITIAL_ITEMS: Item[] = [
  {
    id: 'h1',
    code: '1.',
    name: 'Planificación de la distribución y conformación de comités',
    kind: 'hito',
    start: '2026-09-04',
    end: '2026-11-30',
    progress: 67,
    status: 'En proceso',
    expanded: true,
    description: 'Conformación de comités y elaboración del plan de distribución de materiales a nivel regional.',
    reportType: 'Línea de tiempo',
    region: 'Junín',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's11',
    code: '1.1',
    name: 'Conformación de comités UGEL',
    kind: 'subproceso',
    parentId: 'h1',
    start: '2026-09-04',
    end: '2026-09-25',
    progress: 100,
    status: 'Completado',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 's12',
    code: '1.2',
    name: 'Elaboración y validación del plan de distribución',
    kind: 'subproceso',
    parentId: 'h1',
    start: '2026-09-26',
    end: '2026-11-30',
    progress: 55,
    status: 'En proceso',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 'h2',
    code: '2.',
    name: 'Gestión de Almacenes y Recepción en MC SIGA',
    kind: 'hito',
    start: '2026-09-11',
    end: '2027-01-30',
    progress: 42,
    status: 'En proceso',
    expanded: true,
    description: 'Organización de almacenes territoriales y control de recepción de materiales educativos.',
    reportType: 'Matriz de entregables',
    region: 'Junín',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's21',
    code: '2.1',
    name: 'Identificación y directorio de almacenes',
    kind: 'subproceso',
    parentId: 'h2',
    start: '2026-09-11',
    end: '2026-10-20',
    progress: 100,
    status: 'Completado',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 's22',
    code: '2.2',
    name: 'Registro de recepción de materiales (RAR / NEA)',
    kind: 'subproceso',
    parentId: 'h2',
    start: '2026-10-21',
    end: '2027-01-30',
    progress: 18,
    status: 'En proceso',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 'h3',
    code: '3.',
    name: 'Distribución y Transporte a II.EE.',
    kind: 'hito',
    start: '2026-11-05',
    end: '2027-02-28',
    progress: 18,
    status: 'Pendiente',
    expanded: true,
    description: 'Coordinación y contratación de transporte para distribución de materiales a instituciones educativas.',
    reportType: 'Registro de entregas',
    region: 'Todas las Regiones',
    gestor: 'Javier Ruiz',
  },
  {
    id: 's31',
    code: '3.1',
    name: 'Preparación de expedientes de contratación de transporte',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2026-11-05',
    end: '2026-11-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Loreto',
    gestor: 'Lucía Ramos',
  },
  {
    id: 's32',
    code: '3.2',
    name: 'Coordinación de rutas críticas y transporte fluvial',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2026-12-01',
    end: '2027-01-31',
    progress: 0,
    status: 'Pendiente',
    region: 'Loreto',
    gestor: 'Lucía Ramos',
  },
  {
    id: 's33',
    code: '3.3',
    name: 'Entrega física y actas de recepción con directores',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2027-02-01',
    end: '2027-02-28',
    progress: 0,
    status: 'Pendiente',
    region: 'Huancavelica',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 'h4',
    code: '4.',
    name: 'Cierre, PECOSA y Consolidado Regional',
    kind: 'hito',
    start: '2027-03-01',
    end: '2027-03-30',
    progress: 0,
    status: 'Pendiente',
    expanded: true,
    description: 'Validación de actas PECOSA y consolidación regional en SIAGIE.',
    reportType: 'Consolidado de datos',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's41',
    code: '4.1',
    name: 'Validación y registro de PECOSA en SIAGIE',
    kind: 'subproceso',
    parentId: 'h4',
    start: '2027-03-01',
    end: '2027-03-15',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's42',
    code: '4.2',
    name: 'Consolidado final y balance de contingencias',
    kind: 'subproceso',
    parentId: 'h4',
    start: '2027-03-16',
    end: '2027-03-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 'h5',
    code: '5.',
    name: 'Informe Técnico Final MINEDU - DIGERE',
    kind: 'hito',
    start: '2027-04-01',
    end: '2027-04-30',
    progress: 0,
    status: 'Pendiente',
    expanded: true,
    description: 'Elaboración y presentación del informe final de cumplimiento normativo Dotación 2027.',
    reportType: 'Informe de cierre',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's51',
    code: '5.1',
    name: 'Consolidación de informes técnicos de gestores',
    kind: 'subproceso',
    parentId: 'h5',
    start: '2027-04-01',
    end: '2027-04-20',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's52',
    code: '5.2',
    name: 'Elevación de informe a DIGERE y cierre de ciclo',
    kind: 'subproceso',
    parentId: 'h5',
    start: '2027-04-21',
    end: '2027-04-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
];

const MONTHS = [
  { label: 'Sep', start: '2026-09-01' },
  { label: 'Oct', start: '2026-10-01' },
  { label: 'Nov', start: '2026-11-01' },
  { label: 'Dic', start: '2026-12-01' },
  { label: 'Ene', start: '2027-01-01' },
  { label: 'Feb', start: '2027-02-01' },
  { label: 'Mar', start: '2027-03-01' },
  { label: 'Abr', start: '2027-04-01' },
];

const STATUS_CLASS: Record<Status, string> = {
  'Completado': 'complete',
  'En proceso': 'progress',
  'Pendiente': 'pending',
  'Con retraso': 'late',
};

const formatDate = (s: string) =>
  new Date(s + 'T12:00:00')
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');

const getDays = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1);

const START_TIMESTAMP = new Date('2026-09-01T12:00:00').getTime();
const TOTAL_SPAN_DAYS = getDays('2026-09-01', '2027-04-30');

const calcPosition = (s: string) =>
  (((new Date(s + 'T12:00:00').getTime() - START_TIMESTAMP) / 86400000) / TOTAL_SPAN_DAYS) * 100;

const calcWidth = (a: string, b: string) => (getDays(a, b) / TOTAL_SPAN_DAYS) * 100;

export default function CronogramaGanttView({
  onActions,
  onSwitchPerspective,
}: {
  onActions?: (h: any) => void;
  onSwitchPerspective?: (p: 'maestro' | 'territorial') => void;
}) {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('qaway-gantt-master-v1');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>('h1');
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [gestorFilter, setGestorFilter] = useState('Todos');
  const [zoom, setZoom] = useState('Mes');
  const [newMenu, setNewMenu] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [attachment, setAttachment] = useState('OFICIO_MULTIPLE_00032-2026-MINEDU_Dotacion2027.pdf');
  const [pickedFile, setPickedFile] = useState('');
  const [toast, setToast] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('qaway-gantt-master-v1', JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items]);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    onActions?.({ notify: (m: string) => notify(m) });
  }, [onActions]);

  const selected = items.find((x) => x.id === selectedId);
  const hitos = items.filter((x) => x.kind === 'hito');
  const subs = items.filter((x) => x.kind === 'subproceso');
  const inprog = items.filter((x) => x.status === 'En proceso').length;
  const late = items.filter((x) => x.status === 'Con retraso').length;
  const complete = items.filter((x) => x.status === 'Completado').length;
  const overall = Math.round(items.reduce((a, x) => a + x.progress, 0) / items.length);

  const shown = useMemo(() => {
    return items.filter((x) => {
      const parent = items.find((p) => p.id === x.parentId);
      const matchSearch = `${x.code} ${x.name}`.toLowerCase().includes(search.toLowerCase());
      const matchState = stateFilter === 'Todos' || x.status === stateFilter;
      const matchType =
        typeFilter === 'Todos' || (typeFilter === 'Hitos' ? x.kind === 'hito' : x.kind === 'subproceso');
      const matchTab =
        tab === 'Todos' ||
        (tab === 'Hitos' && x.kind === 'hito') ||
        (tab === 'Subprocesos' && x.kind === 'subproceso') ||
        x.status === tab;
      const matchRegion =
        regionFilter === 'Todas' || x.region === 'Todas las Regiones' || x.region === regionFilter;
      const matchGestor = gestorFilter === 'Todos' || x.gestor === gestorFilter;
      const notCollapsed = !parent || parent.expanded !== false;

      return matchSearch && matchState && matchType && matchTab && matchRegion && matchGestor && notCollapsed;
    });
  }, [items, search, stateFilter, typeFilter, tab, regionFilter, gestorFilter]);

  const update = (id: string, p: Partial<Item>) => {
    setItems((old) => old.map((x) => (x.id === id ? { ...x, ...p } : x)));
  };

  const add = (kind: Kind) => {
    const id = 'new-' + Date.now();
    const n = kind === 'hito' ? hitos.length + 1 : subs.length + 1;
    const item: Item = {
      id,
      code: kind === 'hito' ? `${n}.` : `${Math.ceil(n / 3)}.${n}`,
      name: kind === 'hito' ? 'Nuevo hito oficial' : 'Nuevo subproceso operativo',
      kind,
      parentId: kind === 'subproceso' ? (selected?.kind === 'hito' ? selected.id : hitos[0]?.id) : undefined,
      start: '2026-10-26',
      end: '2026-11-30',
      progress: 0,
      status: 'Pendiente',
      expanded: true,
      description: 'Definido por el Coordinador General.',
      reportType: 'Línea de tiempo',
      region: 'Todas las Regiones',
      gestor: 'Carlos Mendoza',
    };

    setItems((old) =>
      kind === 'subproceso' && item.parentId
        ? old.flatMap((x) => (x.id === item.parentId ? [x, item] : [x]))
        : [...old, item]
    );
    setSelectedId(id);
    setPanelOpen(true);
    setNewMenu(false);
    notify(`Nuevo ${kind} incorporado al cronograma maestro`);
  };

  const exportCSV = () => {
    const csv = [
      ['Código', 'Nombre', 'Tipo', 'Inicio', 'Fin', 'Duración (días)', 'Avance', 'Estado', 'Región', 'Gestor'],
      ...items.map((x) => [
        x.code,
        x.name,
        x.kind === 'hito' ? 'Hito' : 'Subproceso',
        x.start,
        x.end,
        getDays(x.start, x.end),
        x.progress + '%',
        x.status,
        x.region || 'Nacional',
        x.gestor || 'Coordinador',
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `Cronograma_Maestro_MINEDU_Dotacion_2027_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Cronograma maestro exportado a CSV');
  };

  const deleteItem = () => {
    if (!selected || !confirm(`¿Eliminar “${selected.name}”?`)) return;
    setItems((old) => old.filter((x) => x.id !== selected.id && x.parentId !== selected.id));
    setSelectedId(null);
    setPanelOpen(false);
    notify('Elemento eliminado del cronograma maestro');
  };

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Header Principal */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <CalendarDays size={26} />
            </span>
            <div>
              <h1>Gestión del Cronograma Regional (Gantt Maestro)</h1>
              <p>
                Eleva y calibra la línea de tiempo oficial, importa normativas MINEDU y sincroniza fechas límite para los gestores territoriales.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button className="square" onClick={exportCSV} title="Exportar cronograma CSV">
              <MoreHorizontal size={18} />
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                setImportOpen(true);
                setPickedFile('');
              }}
            >
              <Upload size={15} />
              <span>Importar Cronograma Oficial</span>
              <ChevronDown size={14} />
            </button>
            <div className="menu-wrap">
              <button className="btn primary" onClick={() => setNewMenu((v) => !v)}>
                <Plus size={16} />
                <span>Agregar Hito</span>
                <ChevronDown size={14} />
              </button>
              {newMenu && (
                <div className="menu">
                  <button onClick={() => add('hito')}>
                    <Folder size={15} />
                    <span>Nuevo hito rector</span>
                  </button>
                  <button onClick={() => add('subproceso')}>
                    <FileText size={15} />
                    <span>Nuevo subproceso</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas */}
        <section className="metrics">
          <article className="metric blue">
            <span className="metric-icon">
              <CalendarDays size={22} />
            </span>
            <div className="metric-copy">
              <b>{hitos.length}</b>
              <strong>Hitos Rectores</strong>
              <small>oficiales del proyecto</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric green">
            <span className="metric-icon">
              <Layers3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{subs.length}</b>
              <strong>Subprocesos</strong>
              <small>estructurados</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric amber">
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{inprog}</b>
              <strong>En Curso</strong>
              <small>con actividad territorial</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric red">
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{late}</b>
              <strong>Con Retraso</strong>
              <small>alerta para gestores</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric overall">
            <div className="ring" style={{ '--p': `${overall}%` } as React.CSSProperties}>
              <b>{overall}%</b>
            </div>
            <div>
              <strong>Avance Regional Global</strong>
              <small>según cronograma oficial</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* Workspace Central */}
        <main className="workspace">
          {/* Tabs Superiores */}
          <nav className="tabs">
            {[
              { n: 'Todos', c: items.length },
              { n: 'Hitos', c: hitos.length },
              { n: 'Subprocesos', c: subs.length },
              { n: 'En proceso', c: inprog },
              { n: 'Con retraso', c: late },
              { n: 'Completados', c: complete },
            ].map((t) => (
              <button
                key={t.n}
                className={tab === t.n ? 'active' : ''}
                onClick={() => setTab(t.n)}
              >
                {t.n} <span>({t.c})</span>
              </button>
            ))}
          </nav>

          {/* Filtros Macro para Coordinador */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar hito, subproceso o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Macro-filtro Región */}
            <label className="select">
              <small>Región / Macro</small>
              <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                <option value="Todas">Todas las regiones</option>
                <option value="Junín">Junín</option>
                <option value="Loreto">Loreto</option>
                <option value="Huancavelica">Huancavelica</option>
                <option value="Cusco">Cusco</option>
                <option value="Pasco">Pasco</option>
              </select>
              <ChevronDown size={14} />
            </label>

            {/* Macro-filtro Gestor */}
            <label className="select">
              <small>Gestor Territorial</small>
              <select value={gestorFilter} onChange={(e) => setGestorFilter(e.target.value)}>
                <option value="Todos">Todos los gestores</option>
                <option value="María Salazar">María Salazar (Junín)</option>
                <option value="Carlos Mendoza">Carlos Mendoza (Centro)</option>
                <option value="Lucía Ramos">Lucía Ramos (Loreto)</option>
                <option value="Javier Ruiz">Javier Ruiz (Transporte)</option>
              </select>
              <ChevronDown size={14} />
            </label>

            <label className="select">
              <small>Estado</small>
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                {['Todos', 'Completado', 'En proceso', 'Pendiente', 'Con retraso'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <label className="select">
              <small>Tipo</small>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {['Todos', 'Hitos', 'Subprocesos'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <div className="date-range">
              <CalendarDays size={15} />
              <span>01 sep. 2026 – 30 abr. 2027</span>
            </div>

            <div className="zoom">
              {['Día', 'Semana', 'Mes', 'Trimestre'].map((x) => (
                <button
                  key={x}
                  className={zoom === x ? 'active' : ''}
                  onClick={() => setZoom(x)}
                >
                  {x}
                </button>
              ))}
            </div>

            <button
              className="btn secondary"
              style={{ minHeight: '38px', padding: '0 10px' }}
              onClick={() => {
                setSearch('');
                setStateFilter('Todos');
                setTypeFilter('Todos');
                setRegionFilter('Todas');
                setGestorFilter('Todos');
                setTab('Todos');
              }}
            >
              <RefreshCw size={14} />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Tabla Gantt con Timeline */}
          <div className="gantt-scroll">
            <div className="gantt">
              {/* Cabecera de la Tabla */}
              <div className="table-head">
                <div className="name-head">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      notify(e.target.checked ? 'Registros visibles seleccionados' : 'Selección cancelada')
                    }
                  />
                  <span>Hito Rector / Subproceso Oficial</span>
                </div>
                <div>Inicio</div>
                <div>Fin</div>
                <div>Duración</div>
                <div>Avance</div>
                <div>Estado</div>
                <div className="timeline-head">
                  <div className="years">
                    <span>2026</span>
                    <span>2027</span>
                  </div>
                  <div className="months">
                    {MONTHS.map((m) => (
                      <span key={m.label}>{m.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filas */}
              {shown.map((x, i) => (
                <div
                  key={x.id}
                  className={`row ${x.kind === 'hito' ? 'hito' : 'sub'} ${i % 2 ? 'stripe' : ''} ${
                    selectedId === x.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedId(x.id);
                    setPanelOpen(true);
                  }}
                >
                  <div className="name-cell">
                    {x.kind === 'hito' ? (
                      <button
                        className="expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          update(x.id, { expanded: !x.expanded });
                        }}
                      >
                        {x.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    ) : (
                      <span className="indent" />
                    )}
                    {x.kind === 'hito' ? (
                      <FolderOpen size={16} className="folder" />
                    ) : (
                      <FileText size={15} className="file" />
                    )}
                    <b className="code">{x.code}</b>
                    <span className="name" title={x.name}>
                      {x.name}
                    </span>
                  </div>
                  <div className="date">{formatDate(x.start)}</div>
                  <div className="date">{formatDate(x.end)}</div>
                  <div className="duration">{getDays(x.start, x.end)} días</div>
                  <div className="progress">
                    <span>
                      <i
                        className={
                          x.progress === 100
                            ? 'green'
                            : x.status === 'En proceso'
                            ? 'blue'
                            : x.status === 'Con retraso'
                            ? 'red'
                            : 'gray'
                        }
                        style={{ width: `${x.progress}%` }}
                      />
                    </span>
                    <b>{x.progress}%</b>
                  </div>
                  <div>
                    <span className={'status ' + STATUS_CLASS[x.status]}>{x.status}</span>
                  </div>
                  <div className="timeline">
                    <div className="month-grid">
                      {MONTHS.map((m) => (
                        <span key={m.label} />
                      ))}
                    </div>
                    <div
                      className={`bar ${STATUS_CLASS[x.status]} ${x.kind === 'hito' ? 'major' : ''}`}
                      style={{
                        left: `${calcPosition(x.start)}%`,
                        width: `${calcWidth(x.start, x.end)}%`,
                      }}
                    >
                      {x.kind === 'hito' ? '◆' : ''}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de "Hoy" */}
              <div
                className="today"
                style={{
                  left: `calc(var(--fixed) + (100% - var(--fixed)) * ${calcPosition('2026-10-26') / 100})`,
                }}
              >
                <span>Hoy</span>
              </div>
            </div>
          </div>

          {/* Footer de Paginación */}
          <footer className="footer">
            <span>
              Mostrando {shown.length ? 1 : 0}–{shown.length} de {items.length} registros oficiales
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => notify('Cronograma maestro sincronizado con la red de gestores')}
              >
                <CheckCircle2 size={14} color="#16a34a" />
                <span>Publicar a Gestores Territoriales</span>
              </button>
            </div>
          </footer>
        </main>

        {/* Panel Lateral Editor (Drawer de Coordinador) */}
        {panelOpen && selected && (
          <aside className="editor">
            <div className="editor-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  style={{ border: 0, background: 'transparent' }}
                  onClick={() => setPanelOpen(false)}
                >
                  <ChevronLeft size={18} />
                </button>
                <h2>Editar {selected.kind === 'hito' ? 'Hito Rector' : 'Subproceso'}</h2>
              </div>
              <button
                style={{ border: 0, background: 'transparent' }}
                onClick={() => setPanelOpen(false)}
                aria-label="Cerrar editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="editor-tabs">
              <button className="active">Información</button>
              <button
                onClick={() =>
                  notify(
                    `Subprocesos vinculados: ${items.filter((x) => x.parentId === selected.id).length}`
                  )
                }
              >
                Subprocesos ({items.filter((x) => x.parentId === selected.id).length})
              </button>
              <button onClick={() => notify('Selecciona un elemento para revisar dependencias')}>
                Dependencias
              </button>
            </div>

            <div className="editor-body">
              <label className="field">
                <span>Nombre oficial ({selected.kind})</span>
                <input
                  value={selected.name}
                  onChange={(e) => update(selected.id, { name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Descripción y Alcance</span>
                <textarea
                  value={selected.description || ''}
                  onChange={(e) => update(selected.id, { description: e.target.value })}
                  placeholder="Describe el alcance y el resultado esperado..."
                />
              </label>

              <div className="date-fields">
                <label className="field">
                  <span>Fecha de inicio</span>
                  <input
                    type="date"
                    value={selected.start}
                    onChange={(e) => update(selected.id, { start: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Fecha de fin</span>
                  <input
                    type="date"
                    min={selected.start}
                    value={selected.end}
                    onChange={(e) => update(selected.id, { end: e.target.value })}
                  />
                </label>
              </div>

              {selected.kind === 'hito' && (
                <label className="field">
                  <span>Tipo de reporte para UGEL</span>
                  <select
                    value={selected.reportType || 'Línea de tiempo'}
                    onChange={(e) => update(selected.id, { reportType: e.target.value })}
                  >
                    {[
                      'Línea de tiempo',
                      'Matriz de entregables',
                      'Registro de entregas',
                      'Consolidado de datos',
                      'Informe de cierre',
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="field">
                <span>Estado de cumplimiento</span>
                <select
                  value={selected.status}
                  onChange={(e) => update(selected.id, { status: e.target.value as Status })}
                >
                  {['Completado', 'En proceso', 'Pendiente', 'Con retraso'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

              <div className="progress-edit">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avance</span>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{selected.progress}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selected.progress}
                  onChange={(e) => {
                    const n = +e.target.value;
                    update(selected.id, {
                      progress: n,
                      status: n === 100 ? 'Completado' : n === 0 ? 'Pendiente' : 'En proceso',
                    });
                  }}
                />
              </div>

              {/* Archivo de Referencia Normativa */}
              <div className="attachment">
                <span className="field-title">Documento de Sustento Oficial</span>
                {attachment && (
                  <div className="file-card">
                    <span className="pdf">PDF</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '12px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment}
                      </b>
                      <small style={{ fontSize: '11px', color: '#64748b' }}>
                        {pickedFile ? 'Archivo seleccionado' : 'Referencia oficial MINEDU'}
                      </small>
                    </div>
                    <button
                      style={{ border: 0, background: 'transparent' }}
                      onClick={() => setAttachment('')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <button className="attach" onClick={() => fileRef.current?.click()}>
                  <Paperclip size={15} />
                  <span>Adjuntar nuevo archivo oficial</span>
                </button>
                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPickedFile(f.name);
                      setAttachment(f.name);
                      notify(`Archivo "${f.name}" adjuntado al hito`);
                    }
                  }}
                />
              </div>
            </div>

            <div className="editor-footer">
              <button className="delete" onClick={deleteItem}>
                <Trash2 size={15} />
                <span>Eliminar</span>
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={() => notify('Cambios guardados en el cronograma maestro')}
              >
                <Save size={15} />
                <span>Guardar cambios</span>
              </button>
            </div>
          </aside>
        )}

        {/* Modal para Importar Cronograma Oficial */}
        {importOpen && (
          <div
            className="overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setImportOpen(false);
            }}
          >
            <div className="import-modal">
              <button className="modal-x" onClick={() => setImportOpen(false)}>
                <X size={16} />
              </button>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 14,
                }}
              >
                <FileUp size={22} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Importar Cronograma Oficial desde Cero
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px', lineHeight: 1.5 }}>
                Sube el archivo normativo del Oficio Múltiple MINEDU (PDF o Excel) para vincularlo como base oficial de los hitos regionales.
              </p>
              <button className="drop" onClick={() => fileRef.current?.click()}>
                <Upload size={24} />
                <b style={{ fontSize: '13px' }}>{pickedFile || 'Arrastra un archivo o haz clic aquí'}</b>
                <small style={{ fontSize: '11px', color: '#64748b' }}>PDF, Excel, Word o CSV</small>
              </button>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: 14,
                }}
              >
                <HelpCircle size={15} />
                <span>El archivo se vinculará como sustento rector visible para los gestores.</span>
              </div>
              <div className="modal-actions">
                <button className="btn secondary" onClick={() => setImportOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    if (pickedFile) setAttachment(pickedFile);
                    setImportOpen(false);
                    notify(
                      pickedFile
                        ? 'Cronograma oficial importado y vinculado con éxito'
                        : 'Selecciona un archivo para continuar'
                    );
                  }}
                >
                  <Check size={15} />
                  <span>Confirmar Referencia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación Toast */}
        {toast && (
          <div className="toast">
            <CheckCircle2 size={16} color="#4ade80" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
