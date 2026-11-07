import { ArrowLeft, CalendarDays, CheckCircle2, FileText, Layers3, ListChecks, Paperclip, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useMemo } from 'react';
import type { Item } from './CronogramaGanttView';
import { DRE_JUNIN_DOTACION_2027_EDT } from './edtPmbokModel';
import './gantt.css';

export default function GanttElementDetailView() {
  const navigate = useNavigate();
  const { elementoId } = useParams<{ elementoId: string }>();
  const item = useMemo(() => {
    try {
      const projectId = localStorage.getItem('qaway-gp-active-project-id') || 'p1';
       const raw = localStorage.getItem(`qaway-gantt-items-${projectId}`) || localStorage.getItem('qaway-gantt-items-p1');
       // La ficha debe poder abrirse directamente, aunque el proyecto activo
       // no tenga todavía una copia local del cronograma.
       const fallbackItems = DRE_JUNIN_DOTACION_2027_EDT;
       const parsedItems = raw ? JSON.parse(raw) : [];
       const items = Array.isArray(parsedItems) ? parsedItems : [];
       const flatten = (entries: Item[]): Item[] => entries.flatMap((entry) => [entry, ...(entry.children ? flatten(entry.children) : [])]);
       const storedMatch = flatten(items).find((entry: Item) => String(entry.id) === String(elementoId));
       const fallbackMatch = fallbackItems.find((entry) => String(entry.id) === String(elementoId));
       return (storedMatch || fallbackMatch) as Item | undefined;
    } catch { return undefined; }
  }, [elementoId]);

  if (!item) return <main className="gantt-element-page"><button className="btn secondary" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')}><ArrowLeft size={15} /> Volver al cronograma</button><h1>Elemento no encontrado</h1></main>;
  const children = item.children?.length || 0;
  const duration = Math.max(1, Math.ceil((new Date(`${item.end}T12:00:00`).getTime() - new Date(`${item.start}T12:00:00`).getTime()) / 86400000) + 1);
  return <main className="gantt-element-page">
     <header className="gantt-element-page-head"><button className="editor-icon-btn" onClick={() => navigate('/hub/gestor_proyectos/proyecto/gantt')} title="Volver"><ArrowLeft size={18} /></button><div><span>Ficha del componente</span><h1>{item.name}</h1><small>{item.code || 'Sin código'} · {item.phase || 'Sin fase definida'}</small></div></header>
    <section className="gantt-element-hero"><div><span className="gantt-element-eyebrow">Resumen operativo</span><h2>{item.name}</h2><p>{item.description || 'Sin descripción registrada.'}</p></div><span className={`status ${item.status === 'Cumple' || item.status === 'Completado' ? 'complete' : item.status === 'En curso' || item.status === 'En proceso' ? 'progress' : 'pending'}`}>{item.status}</span></section>
    <div className="gantt-element-grid">
       <article><CalendarDays size={18} /><span>Periodo</span><b>{item.start} – {item.end}</b><small>{duration} días</small></article><article><Users size={18} /><span>Responsable</span><b>{item.gestor || 'Sin asignar'}</b><small>{item.entidadResponsable || item.region || 'Gestión del proyecto'}</small></article><article><CheckCircle2 size={18} /><span>Avance</span><b>{item.progress}%</b><div className="gantt-element-progress"><i style={{ width: `${item.progress}%` }} /></div></article><article><Layers3 size={18} /><span>Elementos asociados</span><b>{children}</b><small>{item.tasks ?? 0} tareas vinculadas</small></article>
    </div>
    <section className="gantt-element-sections"><article><h3><FileText size={17} /> Entregables</h3><p>{item.deliverable || 'No hay entregable principal registrado.'}</p></article><article><h3><ListChecks size={17} /> Tareas vinculadas</h3><p>La gestión de tareas se realiza desde el módulo Tareas del proyecto.</p></article><article><h3><Paperclip size={17} /> Documentos de sustento</h3><p>Los documentos y evidencias del elemento se administran en este expediente.</p></article></section>
  </main>;
}
