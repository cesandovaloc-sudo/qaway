// @ts-nocheck
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers3,
  Link2,
  ListChecks,
  Package,
  Paperclip,
  Presentation,
  Save,
  Trash2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import type { AttachmentItem, DeliverableItem, Item, Status } from './Reuniones2View';
import { OFFICIAL_WBS_DEPENDENCIES } from './Reuniones2View';
import { DRE_JUNIN_DOTACION_2027_EDT, PROJECT_PHASES_CATALOG } from './edtPmbokModel';
import './gantt.css';

/* Tipos que viven solo en Reuniones2View: se replican aquí para no importar
   módulo pesado. El matching de tareas es compatible con getLinkedTasksSummary. */
type StatusOption = Status;

const STATUS_OPTIONS: StatusOption[] = ['Cumple', 'En curso', 'En proceso', 'Con retraso', 'Pendiente'];

/** Términos de configuración adicional que sí existen en el modelo de datos */
const KIND_LABELS: Record<string, string> = {
  COMPONENTE: 'Componente',
  SUBCOMPONENTE: 'Subcomponente',
  PAQUETE_TRABAJO: 'Paquete de trabajo',
  HITO: 'Hito',
};

const DELIVERABLE_ICONS: Record<string, typeof FileText> = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  link: FileText,
  physical: Package,
};

const DAY_MS = 86400000;

const fmtDate = (iso?: string) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return new Date(iso || '').toLocaleDateString() || '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const durationDays = (start?: string, end?: string) => {
  if (!start || !end || !/^\d{4}-\d{2}-\d{2}/.test(start) || !/^\d{4}-\d{2}-\d{2}/.test(end)) return 0;
  const days = Math.round((new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / DAY_MS) + 1;
  return Math.max(1, days);
};

const statusClass = (status?: string) =>
  status === 'Cumple' || status === 'Completado' ? 'complete'
  : status === 'En proceso' || status === 'En curso' ? 'progress'
  : status === 'Con retraso' ? 'late'
  : 'pending';

// Compatibilidad con getLinkedTasksSummary: match por hito/código del elemento
const linkTasks = (item: Item, rawTasks: any[]) => {
  const itemLabel = `${item.code ? (item.code.endsWith('.') ? item.code : `${item.code} `) : ''}${item.name}`.trim().toLowerCase();
  const itemName = (item.name || '').trim().toLowerCase();
  const itemId = (item.id || '').trim().toLowerCase();
  const itemCode = (item.code || '').trim().toLowerCase();
  return rawTasks.filter((t) => {
    if (!t || !t.milestone || t.milestone === '—' || t.milestone === '-') return false;
    const m = String(t.milestone).trim().toLowerCase();
    if (m === itemLabel || m === itemName || m === itemId) return true;
    if (itemCode && m.startsWith(itemCode)) return true;
    return itemCode.length > 2 && m.includes(itemCode);
  });
};

export default function GanttElementDetailView() {
  const navigate = useNavigate();
  const location = useLocation();
  // La app no monta <Route> reales: el shell renderiza leyendo el pathname,
  // así que el ID se extrae directamente de la URL.
  const elementoId = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? decodeURIComponent(parts[parts.length - 1]) : '';
  }, [location.pathname]);

  const { item, allEntries, projectId } = useMemo(() => {
    const fallbackCatalog = DRE_JUNIN_DOTACION_2027_EDT;
    let storedEntries: Item[] = [];
    let pid = 'p1';
    let flat: Item[] = [];
    try {
      pid = localStorage.getItem('qaway-gp-active-project-id') || 'p1';
      const raw = localStorage.getItem(`qaway-gantt-items-${pid}`) || localStorage.getItem('qaway-gantt-items-p1');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) storedEntries = parsed as Item[];
    } catch {
      storedEntries = [];
    }
    const source = storedEntries.length > 0 ? storedEntries : (fallbackCatalog as Item[]);
    const flatten = (entries: Item[]): Item[] => entries.flatMap((entry) => [entry, ...(entry.children ? flatten(entry.children) : [])]);
    flat = flatten(source);
    const match = flat.find((entry: Item) => String(entry.id) === String(elementoId));
    return { item: match, allEntries: flat, projectId: pid };
  }, [elementoId]);

  /* Pestañas derivadas de la configuración REAL del elemento */
  const [tab, setTab] = useState<'config' | 'paquetes' | 'entregables' | 'evidencias' | 'dependencias' | 'tareas'>('config');
  const childEntries = useMemo(
    () => allEntries.filter((x) => x.parentId === item?.id),
    [allEntries, item]
  );
  const linkedTasks = useMemo(() => {
    if (!item) return [];
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      return Array.isArray(raw) ? linkTasks(item, raw) : [];
    } catch {
      return [];
    }
  }, [item]);
  const dependencies = useMemo(() => {
    if (!item) return [] as { id: string; name: string; code: string }[];
    const depIds = item.dependencies?.length ? item.dependencies : (OFFICIAL_WBS_DEPENDENCIES[item.id] || []);
    return depIds
      .map((depId) => {
        const dep = allEntries.find((x) => String(x.id) === String(depId));
        return dep ? { id: dep.id, name: dep.name, code: dep.code } : { id: depId, name: '', code: '' };
      });
  }, [item, allEntries]);
  const faseName = useMemo(() => {
    if (!item?.faseId) return '';
    const fase = PROJECT_PHASES_CATALOG.find((f) => f.id === item.faseId);
    return fase?.name || (item.faseId as string);
  }, [item]);

  /* Edición real: los cambios se persisten bajo la misma llave del cronograma */
  const [form, setForm] = useState(() => ({
    name: item?.name || '',
    description: item?.description || '',
    status: (item?.status || 'Pendiente') as StatusOption,
    gestor: item?.gestor || '',
    entidadResponsable: item?.entidadResponsable || '',
    start: item?.start || '',
    end: item?.end || '',
    deliverable: item?.deliverable || '',
  }));
  const [savedFlash, setSavedFlash] = useState(false);
  useEffect(() => {
    setTab('config');
  }, [elementoId]);
  useEffect(() => {
    setForm({
      name: item?.name || '',
      description: item?.description || '',
      status: (item?.status || 'Pendiente') as StatusOption,
      gestor: item?.gestor || '',
      entidadResponsable: item?.entidadResponsable || '',
      start: item?.start || '',
      end: item?.end || '',
      deliverable: item?.deliverable || '',
    });
  }, [item?.id]);

  if (!item) {
    return <main className="gantt-element-page">
      <button className="btn secondary" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')}><ArrowLeft size={15} /> Volver al cronograma</button>
      <h1>Elemento no encontrado</h1>
    </main>;
  }

  const wbsType = item.wbsNodeType || (childEntries.length > 0 ? (item.parentId ? 'SUBCOMPONENTE' : 'COMPONENTE') : 'PAQUETE_TRABAJO');
  const kindLabel = KIND_LABELS[wbsType] || 'Componente';
  const duration = durationDays(item.start, item.end);

  const persistItems = (mutate: (list: Item[]) => Item[]) => {
    try {
      const pid = localStorage.getItem('qaway-gp-active-project-id') || projectId || 'p1';
      const raw = localStorage.getItem(`qaway-gantt-items-${pid}`) || localStorage.getItem('qaway-gantt-items-p1');
      const current = raw && Array.isArray(JSON.parse(raw)) && JSON.parse(raw).length > 0 ? (JSON.parse(raw) as Item[]) : (DRE_JUNIN_DOTACION_2027_EDT as Item[]);
      const next = mutate(current.map((x) => ({ ...x })));
      localStorage.setItem(`qaway-gantt-items-${pid}`, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    const ok = persistItems((list) => list.map((x) => (String(x.id) === String(item.id) ? {
      ...x,
      name: form.name.trim() || x.name,
      description: form.description,
      status: form.status,
      gestor: form.gestor.trim() || undefined,
      gestores: form.gestor.trim() ? [form.gestor.trim()] : x.gestores,
      entidadResponsable: form.entidadResponsable.trim() || undefined,
      start: form.start || x.start,
      end: form.end || x.end,
      deliverable: form.deliverable.trim() || undefined,
    } : x)));
    if (ok) {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2600);
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar «${item.name}» del cronograma? Esta acción no se puede deshacer.`)) return;
    const ok = persistItems((list) => list
      .filter((x) => String(x.id) !== String(item.id))
      .map((x) => (String(x.parentId) === String(item.id) ? ({ ...x, parentId: undefined }) : x)));
    if (ok) navigate('/hub/gestor_proyectos/proyecto/gantt');
  };

  const openChild = (childId: string) => navigate(`/hub/gestor_proyectos/proyecto/gantt/elemento/${encodeURIComponent(childId)}`);

  const statusCounts = {
    completados: childEntries.filter((c) => c.status === 'Completado' || c.status === 'Cumple').length,
    ejecucion: childEntries.filter((c) => c.status === 'En proceso' || c.status === 'En curso').length,
    pendientes: childEntries.filter((c) => c.status === 'Pendiente').length,
    retraso: childEntries.filter((c) => c.status === 'Con retraso').length,
  };

  const counts = {
    paquetes: childEntries.length,
    entregables: item.deliverables?.length || 0,
    evidencias: item.attachments?.length || 0,
    dependencias: dependencies.length,
    tareas: linkedTasks.length,
  };

  const tabs: Array<{ id: typeof tab; label: string; count?: number }> = [
    { id: 'config', label: 'Configuración' },
    { id: 'paquetes', label: 'Paquetes de trabajo', count: counts.paquetes },
    { id: 'entregables', label: 'Entregables', count: counts.entregables },
    { id: 'evidencias', label: 'Evidencias', count: counts.evidencias },
    { id: 'dependencias', label: 'Dependencias', count: counts.dependencias },
    { id: 'tareas', label: 'Tareas vinculadas', count: counts.tareas },
  ];

  const emptyBox = (what: string) => <p className="gantt-element-empty">No hay {what} registrados para este elemento.</p>;

  return <main className="gantt-element-page gantt-element-page-v2">
    <header className="gantt-element-toolbar">
      <button type="button" className="editor-icon-btn" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')} title="Volver al cronograma"><ArrowLeft size={18} /></button>
      <nav className="gantt-element-crumb" aria-label="Ruta">
        <span onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')}>Seguimiento de operaciones</span>
        <i>/</i>
        <b>MINEDU · Dotación 2027</b>
        <i>/</i>
        <b>{codeLabel(item.code, kindLabel)}</b>
      </nav>
    </header>

    <header className="gantt-element-page-head">
      <span className="gantt-element-folder"><FolderOpen size={26} /></span>
      <div className="gantt-element-heading">
        <small>{kindLabel}</small>
        <h1>{form.name || item.name}</h1>
        <p>{form.description || 'Sin descripción registrada.'}</p>
      </div>
      <span className={`status ${statusClass(form.status)}`}>{form.status}</span>
    </header>

    <nav className="gantt-element-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
          {t.label}{typeof t.count === 'number' ? <i>({t.count})</i> : null}
        </button>
      ))}
    </nav>

    {tab === 'config' && (
      <div className="gantt-element-config">
        <section className="gantt-element-card gantt-element-span-4">
          <h3><ListChecks size={17} /> Información general</h3>
          <label>Nombre del elemento
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Descripción
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>Estado
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusOption })}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Responsable
            <input value={form.gestor} placeholder="Sin asignar" onChange={(e) => setForm({ ...form, gestor: e.target.value })} />
          </label>
          <label>Entidad responsable
            <input value={form.entidadResponsable} placeholder="DRE / UGEL" onChange={(e) => setForm({ ...form, entidadResponsable: e.target.value })} />
          </label>
        </section>

        <section className="gantt-element-card gantt-element-span-4">
          <h3><CalendarDays size={17} /> Programación</h3>
          <div className="gantt-element-dates">
            <label>Fecha de inicio
              <input type="date" value={form.start.slice(0, 10)} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </label>
            <label>Fecha de fin (prevista)
              <input type="date" value={form.end.slice(0, 10)} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </label>
            <div className="gantt-element-duration"><Clock size={15} /><div><span>Duración</span><b>{duration} días</b></div></div>
          </div>
          {(item.baselineStart || item.actualStart || item.actualEnd) && (
            <div className="gantt-element-dates meta">
              {item.baselineStart && <span>Línea base: {fmtDate(item.baselineStart)} – {fmtDate(item.baselineEnd || item.end)}</span>}
              {item.actualStart && <span>Inicio real: {fmtDate(item.actualStart)}</span>}
              {item.actualEnd && <span>Fin real: {fmtDate(item.actualEnd)}</span>}
            </div>
          )}

          <h3 className="gap-top"><Layers3 size={17} /> Alcance y estructura</h3>
          <div className="gantt-element-row">
            <div>
              <b>{counts.paquetes}</b>
              <span>Paquetes de trabajo hijos</span>
            </div>
            <button type="button" className="btn secondary" onClick={() => setTab('paquetes')}>Ver paquetes</button>
          </div>
          <div className="gantt-element-row">
            <div>
              <b>{form.deliverable || item.deliverable || 'Sin entregable principal'}</b>
              <span>Entregable principal</span>
            </div>
            <button type="button" className="btn secondary" onClick={() => setTab('entregables')}>Ver entregables</button>
          </div>
          <div className="gantt-element-row">
            <div>
              <b>{counts.dependencias > 0 ? `${counts.dependencias} dependencia(s)` : 'Sin dependencias'}</b>
              <span>Requisitos previos de ejecución</span>
            </div>
            <button type="button" className="btn secondary" onClick={() => setTab('dependencias')}>Configurar</button>
          </div>
        </section>

        <aside className="gantt-element-side">
          <section className="gantt-element-card">
            <h3><CheckCircle2 size={17} /> Avance del elemento</h3>
            <div className="gantt-element-advance">
              <b>{item.progress}%</b>
              <div className="gantt-element-progress"><i style={{ width: `${item.progress}%` }} /></div>
            </div>
            <ul className="gantt-element-stats">
              <li><Layers3 size={15} /> Paquetes de trabajo <i>{childEntries.length}</i></li>
              <li><CheckCircle2 size={15} /> Completados <i>{statusCounts.completados}</i></li>
              <li><Clock size={15} /> En ejecución <i>{statusCounts.ejecucion}</i></li>
              <li><CalendarDays size={15} /> Pendientes <i>{statusCounts.pendientes}</i></li>
              <li className="late"><Clock size={15} /> Con retraso <i>{statusCounts.retraso}</i></li>
            </ul>
          </section>
          <section className="gantt-element-card">
            <h3><ListChecks size={17} /> Configuración adicional</h3>
            <ul className="gantt-element-meta">
              <li><span>Estructura</span><b>{kindLabel}</b></li>
              {faseName && <li><span>Fase</span><b>{faseName}</b></li>}
              {item.deliverable && <li><span>Entregable</span><b>{item.deliverable}</b></li>}
              {item.entidadResponsable && <li><span>Entidad</span><b>{item.entidadResponsable}</b></li>}
              {item.region && <li><span>Región</span><b>{item.region}</b></li>}
              {item.sede && <li><span>Sede</span><b>{item.sede}</b></li>}
              {item.distrito && <li><span>Distrito</span><b>{item.distrito}</b></li>}
              {item.reportType && <li><span>Tipo de reporte</span><b>{item.reportType}</b></li>}
              <li><span>Tareas vinculadas</span><b>{counts.tareas}</b></li>
            </ul>
          </section>
        </aside>

        <footer className="gantt-element-footer gantt-element-span-12">
          <button type="button" className="btn danger-ghost" onClick={handleDelete}><Trash2 size={15} /> Eliminar elemento</button>
          <div>
            {savedFlash && <em className="gantt-element-saved">Cambios guardados</em>}
            <button type="button" className="btn secondary" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')}>Cancelar</button>
            <button type="button" className="btn primary" onClick={handleSave}><Save size={15} /> Guardar cambios</button>
          </div>
        </footer>
      </div>
    )}

    {tab === 'paquetes' && (
      <div className="gantt-element-list">
        {childEntries.length === 0
          ? emptyBox('paquetes de trabajo')
          : childEntries.map((c) => (
            <article key={c.id} className="gantt-element-row-item" onClick={() => openChild(c.id)}>
              <div>
                <b>{c.code ? `${c.code.endsWith('.') ? c.code : `${c.code} `}` : ''}{c.name}</b>
                <span>{fmtDate(c.start)} – {fmtDate(c.end)} · {durationDays(c.start, c.end)} días</span>
              </div>
              <div className="gantt-element-row-item-side">
                <span className={`status ${statusClass(c.status)}`}>{c.status}</span>
                <i>{c.progress}%</i>
              </div>
            </article>
          ))}
      </div>
    )}

    {tab === 'entregables' && (
      <div className="gantt-element-list">
        {form.deliverable && (
          <article className="gantt-element-row-item main">
            <div><b>{form.deliverable}</b><span>Entregable principal del elemento</span></div>
            <span className={`status ${statusClass(form.status)}`}>{form.status}</span>
          </article>
        )}
        {(item.deliverables || []).map((d: DeliverableItem) => {
          const Icon = DELIVERABLE_ICONS[d.type] || FileText;
          return (
            <article key={d.id} className="gantt-element-row-item">
              <div><b><Icon size={15} /> {d.name}</b><span>{d.type === 'link' ? 'Enlace de referencia' : 'Documento / evidencia del entregable'}</span></div>
              {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="btn secondary" onClick={(e) => e.stopPropagation()}>Abrir</a>}
            </article>
          );
        })}
        {!form.deliverable && counts.entregables === 0 && emptyBox('entregables')}
      </div>
    )}

    {tab === 'evidencias' && (
      <div className="gantt-element-list">
        {(item.attachments || []).map((a: AttachmentItem) => (
          <article key={a.id} className="gantt-element-row-item">
            <div><b><Paperclip size={15} /> {a.name}</b><span>{fmtDate(a.date)}</span></div>
            {a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="btn secondary">Descargar</a> : null}
          </article>
        ))}
        {counts.evidencias === 0 && emptyBox('evidencias')}
      </div>
    )}

    {tab === 'dependencias' && (
      <div className="gantt-element-list">
        {dependencies.length === 0
          ? emptyBox('dependencias')
          : dependencies.map((d) => {
            const dep = allEntries.find((x) => String(x.id) === String(d.id));
            return (
              <article key={d.id} className="gantt-element-row-item" onClick={() => openChild(d.id)}>
                <div><b><Link2 size={15} /> {d.code ? `${d.code} ` : ''}{d.name || d.id}</b><span>Predecesor requerido</span></div>
                {dep && <span className={`status ${statusClass(dep.status)}`}>{dep.status}</span>}
              </article>
            );
          })}
      </div>
    )}

    {tab === 'tareas' && (
      <div className="gantt-element-list">
        {linkedTasks.length === 0
          ? emptyBox('tareas vinculadas')
          : linkedTasks.map((t) => (
            <article key={String(t.id)} className="gantt-element-row-item">
              <div><b>{t.title || t.name}</b><span>{t.owner || 'Sin responsable'} · Vence {t.due || '—'}</span></div>
              <span className={`status ${t.status === 'Cumplida' || t.status === 'Cumple' ? 'complete' : t.status === 'En proceso' ? 'progress' : t.status === 'Bloqueada' ? 'late' : 'pending'}`}>{t.status}</span>
            </article>
          ))}
      </div>
    )}
  </main>;
}

const codeLabel = (code: string, kindLabel: string) => `${code && code !== '' ? (code.endsWith('.') ? `${code} ` : `${code} · `) : ''}${kindLabel}`;
