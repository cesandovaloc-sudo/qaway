import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Layers3, ListChecks, Paperclip, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useMemo } from 'react';
import type { Item } from './CronogramaGanttView';
import { getEdtNodeDisplayLabel } from './edtPmbokModel';

export default function GanttElementDetailView() {
  const navigate = useNavigate();
  const { elementoId } = useParams<{ elementoId: string }>();
  const item = useMemo(() => {
    try {
      const projectId = localStorage.getItem('qaway-gp-active-project-id') || 'p1';
      const raw = localStorage.getItem(`qaway-gantt-items-${projectId}`) || localStorage.getItem('qaway-gantt-items-p1');
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items.find((entry: Item) => entry.id === elementoId) as Item | undefined : undefined;
    } catch { return undefined; }
  }, [elementoId]);

  if (!item) return <main className="gantt-element-page"><button className="btn secondary" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')}><ArrowLeft size={15} /> Volver al cronograma</button><h1>Elemento no encontrado</h1></main>;
  const children = 0;
  return <main className="gantt-element-page">
    <header className="gantt-element-page-head"><button className="editor-icon-btn" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')} title="Volver"><ArrowLeft size={18} /></button><div><span>Detalle del elemento</span><h1>{item.name}</h1><small>{item.code || 'Sin código'} · {getEdtNodeDisplayLabel(item, [item])}</small></div></header>
    <section className="gantt-element-hero"><div><span className="gantt-element-eyebrow">Resumen operativo</span><h2>{item.name}</h2><p>{item.description || 'Sin descripción registrada.'}</p></div><span className={`status ${item.status === 'Cumple' || item.status === 'Completado' ? 'complete' : item.status === 'En curso' || item.status === 'En proceso' ? 'progress' : 'pending'}`}>{item.status}</span></section>
    <div className="gantt-element-grid">
      <article><CalendarDays size={18} /><span>Periodo</span><b>{item.start} – {item.end}</b></article><article><Users size={18} /><span>Responsable</span><b>{item.gestor || 'Sin asignar'}</b></article><article><CheckCircle2 size={18} /><span>Avance</span><b>{item.progress}%</b><div className="gantt-element-progress"><i style={{ width: `${item.progress}%` }} /></div></article><article><Layers3 size={18} /><span>Elementos asociados</span><b>{children}</b></article>
    </div>
    <section className="gantt-element-sections"><article><h3><FileText size={17} /> Entregables</h3><p>{item.deliverable || 'No hay entregable principal registrado.'}</p></article><article><h3><ListChecks size={17} /> Tareas vinculadas</h3><p>La gestión de tareas se realiza desde el módulo Tareas del proyecto.</p></article><article><h3><Paperclip size={17} /> Documentos de sustento</h3><p>Los documentos y evidencias del elemento se administran en este expediente.</p></article></section>
  </main>;
}
