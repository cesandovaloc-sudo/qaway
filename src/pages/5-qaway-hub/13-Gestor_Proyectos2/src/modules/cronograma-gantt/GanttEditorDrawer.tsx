// @ts-nocheck
import React, { useState, useEffect, useRef, memo } from 'react';
import {
  ChevronLeft,
  X,
  Calendar,
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
} from 'lucide-react';
import {
  Item,
  Status,
  DeliverableItem,
  AttachmentItem,
  DeliverableType,
  MiniCalendar,
  formatDate,
  STATUS_CLASS,
  getLinkedTasksSummary,
} from './CronogramaGanttView';
import { getDeviationDays } from './scheduleMetrics';
import { getEdtNodeDisplayLabel } from './edtPmbokModel';
import {
  REGIONES_PROYECTO,
  MACROREGIONES,
  getRegionCoordinador,
  getGestoresPorAmbito,
  getGestorColor,
  getMacroById,
} from './regionalCoordinationModel';

interface GanttEditorDrawerProps {
  panelOpen: boolean;
  selectedItem: Item | null;
  isNewDraft: boolean;
  items: Item[];
  hitos: Item[];
  fases?: any[];
  currentTodayIso: string;
  onSave: (updatedItem: Item, isNew: boolean) => void;
  onClose: () => void;
  onDeleteItem?: (item: Item) => void;
  onAddSubItem?: (kind: 'hito' | 'subproceso', parentId?: string) => void;
  onSelectSubItem?: (item: Item) => void;
  notify: (msg: string) => void;
  activeProject?: any;
}

export const GanttEditorDrawer = memo(function GanttEditorDrawer({
  panelOpen,
  selectedItem,
  isNewDraft: initialIsNewDraft,
  items,
  hitos,
  fases = [],
  currentTodayIso,
  onSave,
  onClose,
  onDeleteItem,
  onAddSubItem,
  onSelectSubItem,
  notify,
  activeProject,
}: GanttEditorDrawerProps) {
  // ESTADO LOCAL DEL BORRADOR (Aislamiento total: escribir aqui NO re-renderiza el Gantt)
  const [drawerDraft, setDrawerDraft] = useState<Item | null>(null);
  const [isNewDraft, setIsNewDraft] = useState<boolean>(initialIsNewDraft);
  const [editorTab, setEditorTab] = useState<'info' | 'subprocesos' | 'dependencias'>('info');
  const [editorInitialSnapshot, setEditorInitialSnapshot] = useState<string>('');
  const [unsavedAlertOpen, setUnsavedAlertOpen] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  const [editorReportTypeOpen, setEditorReportTypeOpen] = useState(false);
  const [editorStatusOpen, setEditorStatusOpen] = useState(false);
  const [editorCalOpen, setEditorCalOpen] = useState<'start' | 'end' | null>(null);
  const [editorHitoSelectOpen, setEditorHitoSelectOpen] = useState(false);
  const [editorParentSelectOpen, setEditorParentSelectOpen] = useState(false);
  const [editorDepSelectOpen, setEditorDepSelectOpen] = useState(false);

  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newDelivName, setNewDelivName] = useState('');
  const [newDelivType, setNewDelivType] = useState<DeliverableType>('document');
  const [newDelivUrl, setNewDelivUrl] = useState('');
  const [attachment, setAttachment] = useState('');

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskModalMilestone, setTaskModalMilestone] = useState('');
  const [taskOwnerOpen, setTaskOwnerOpen] = useState(false);
  const [taskPriorityOpen, setTaskPriorityOpen] = useState(false);
  const [newTaskCalOpen, setNewTaskCalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    owner: 'Carlos Mendoza',
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
      setAttachment(selectedItem.attachments?.[0]?.name || selectedItem.attachment || '');
    } else if (!panelOpen) {
      setDrawerDraft(null);
    }
  }, [panelOpen, selectedItem?.id, initialIsNewDraft]);

  const activeItem = drawerDraft || selectedItem;

  const drawerDraftRef = useRef(drawerDraft);
  drawerDraftRef.current = drawerDraft;
  const editorInitialSnapshotRef = useRef(editorInitialSnapshot);
  editorInitialSnapshotRef.current = editorInitialSnapshot;
  const selectedRef = useRef(selectedItem);
  selectedRef.current = selectedItem;

  // Helpers auxiliares de fechas para el Drawer
  const formatDatePE = (iso: string): string => {
    if (!iso) return '–';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
  };

  const getDeviationTone = (days: number): 'green' | 'amber' | 'red' => {
    if (days <= 0) return 'green';
    if (days <= 7) return 'amber';
    return 'red';
  };

  const formatDeviation = (days: number): string => {
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
    setSelectedId(item.id);
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
    if (isNewDraft) {
      commitChange((old) =>
        drawerDraft.kind === 'subproceso' && drawerDraft.parentId
          ? old.flatMap((x) => (x.id === drawerDraft.parentId ? [x, drawerDraft] : [x]))
          : [...old, drawerDraft]
      );
      notify(`Nuevo ${drawerDraft.kind === 'hito' ? 'componente' : 'subcomponente'} guardado con éxito en el cronograma maestro`);
    } else {
      commitChange((old) => old.map((x) => (x.id === drawerDraft.id ? applyActuals(x, drawerDraft, currentTodayIso) : x)));
      notify('Cambios guardados con éxito en el cronograma maestro');
    }
    setEditorInitialSnapshot('');
    setDrawerDraft(null);
    setIsNewDraft(false);
    setPanelOpen(false);
  };

  const getLinkedTasks = (milestoneName?: string) => {
    if (!milestoneName) return [];
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      if (Array.isArray(raw)) {
        return raw.filter((t: any) => t.milestone === milestoneName);
      }
    } catch {
      /* fallback */
    }
    return [];
  };

  const handleOpenCreateTaskModal = (milestoneName: string) => {
    setTaskModalMilestone(milestoneName);
    setTaskOwnerOpen(false);
    setTaskPriorityOpen(false);
    setNewTaskCalOpen(false);
    setNewTaskForm({
      title: '',
      owner: activeItem?.gestor || 'Carlos Mendoza',
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
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
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
      localStorage.setItem('qaway-tasks-v1', JSON.stringify(nextList));
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
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      if (Array.isArray(raw)) {
        const nextList = raw.map((t: any) => {
          if (t.id === taskId) {
            const isDone = t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada';
            return { ...t, status: isDone ? 'Pendiente' : 'Cumple' };
          }
          return t;
        });
        localStorage.setItem('qaway-tasks-v1', JSON.stringify(nextList));
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
          }}>
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
                        ? `+ ${activeItem.kind === 'hito' ? 'Nuevo componente' : 'Nuevo subcomponente'} (en borrador)`
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
                {activeItem.kind === 'hito' ? 'Componente' : 'Subcomponente'}
              </button>
              <button
                type="button"
                className={editorTab === 'subprocesos' ? 'active' : ''}
                onClick={() => setEditorTab('subprocesos')}
              >
                Subcomponentes
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
                            const parent = items.find((x) => x.id === activeItem.parentId);
                            if (!parent) return 'Selecciona el elemento padre...';
                            return parent.kind === 'hito'
                              ? `[Componente] ${parent.code} ${parent.name}`
                              : `└ [Subcomponente] ${parent.code} ${parent.name}`;
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

                {/* Contenedor Opcional PMBOK: Fase del Ciclo de Vida y Clasificación EDT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '4px' }}>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Clasificación EDT (PMBOK)</span>
                    <select
                      value={activeItem.edtType || resolveEdtNodeType(activeItem, items)}
                      onChange={(e) => updateDraft({ edtType: e.target.value as EdtNodeType })}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                      }}
                    >
                      {activeItem.kind === 'hito' ? (
                        <>
                          <option value="COMPONENTE">Componente (Nivel 1 EDT)</option>
                          <option value="HITO">Hito (Control Duración 0)</option>
                        </>
                      ) : (
                        <>
                          <option value="SUBCOMPONENTE">Subcomponente (Subdivisión EDT)</option>
                          <option value="PAQUETE_TRABAJO">Paquete de Trabajo (Ejecutable)</option>
                          <option value="ENTREGABLE">Entregable (Producto / Evidencia)</option>
                          <option value="HITO">Hito (Control Duración 0)</option>
                        </>
                      )}
                    </select>
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Fase del Ciclo de Vida (Opcional)</span>
                    <select
                      value={activeItem.faseId || ''}
                      onChange={(e) => updateDraft({ faseId: e.target.value ? e.target.value : null })}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                      }}
                    >
                      <option value="">Sin fase asignada (Directo en EDT)</option>
                      {PROJECT_PHASES_CATALOG.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.code} · {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

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
                          { type: 'document' as DeliverableType, label: 'Doc / PDF', icon: FileText, color: '#2563eb' },
                          { type: 'spreadsheet' as DeliverableType, label: 'Excel / Sheets', icon: FileSpreadsheet, color: '#16a34a' },
                          { type: 'presentation' as DeliverableType, label: 'Canva / PPT', icon: Presentation, color: '#ea580c' },
                          { type: 'link' as DeliverableType, label: 'Enlace Web', icon: ExternalLink, color: '#7c3aed' },
                          { type: 'physical' as DeliverableType, label: 'Físico', icon: Package, color: '#d97706' },
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

                {/* 4b. Línea base y cumplimiento real */}
                <div className="baseline-box">
                  <div className="baseline-head">
                    <b>Línea base y cumplimiento</b>
                    {(() => {
                      const dev = getDeviationDays(activeItem, currentTodayIso);
                      return <span className={`dev-pill ${getDeviationTone(dev)}`}>{formatDeviation(dev)}</span>;
                    })()}
                  </div>
                  <div className="baseline-row">
                    <span className="baseline-label">Línea base</span>
                    <span className="baseline-value">
                      {hasBaseline(activeItem)
                        ? `${formatDatePE(activeItem.baselineStart)} — ${formatDatePE(activeItem.baselineEnd)}`
                        : 'Sin línea base'}
                    </span>
                    <button
                      type="button"
                      className="baseline-btn"
                      onClick={() => updateDraft({ baselineStart: activeItem.start, baselineEnd: activeItem.end })}
                      title="Congela las fechas de inicio y fin actuales como planificación aprobada"
                    >
                      <Anchor size={12} />
                      {hasBaseline(activeItem) ? 'Actualizar con fechas actuales' : 'Fijar con fechas actuales'}
                    </button>
                  </div>
                  <div className="date-fields">
                    <div className="field relative">
                      <span>Inicio real</span>
                      <button
                        type="button"
                        className={`custom-date-btn ${editorCalOpen === 'actualStart' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorReportTypeOpen(false);
                          setEditorStatusOpen(false);
                          setEditorCalOpen((p) => (p === 'actualStart' ? null : 'actualStart'));
                        }}
                        title="Fecha en que realmente comenzó (se registra sola al iniciar)"
                      >
                        <span>{activeItem.actualStart ? formatDatePE(activeItem.actualStart) : '—'}</span>
                        <CalendarDays size={14} className="date-btn-icon" />
                      </button>
                      {editorCalOpen === 'actualStart' && (
                        <MiniCalendar
                          value={activeItem.actualStart || activeItem.start}
                          onChange={(newDate) => {
                            updateDraft({ actualStart: newDate || undefined });
                            setEditorCalOpen(null);
                          }}
                          onClose={() => setEditorCalOpen(null)}
                          align="left"
                        />
                      )}
                    </div>
                    <div className="field relative">
                      <span>Fin real</span>
                      <button
                        type="button"
                        className={`custom-date-btn ${editorCalOpen === 'actualEnd' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorReportTypeOpen(false);
                          setEditorStatusOpen(false);
                          setEditorCalOpen((p) => (p === 'actualEnd' ? null : 'actualEnd'));
                        }}
                        title="Fecha en que realmente se cumplió (se registra sola al completar)"
                      >
                        <span>{activeItem.actualEnd ? formatDatePE(activeItem.actualEnd) : '—'}</span>
                        <CalendarDays size={14} className="date-btn-icon" />
                      </button>
                      {editorCalOpen === 'actualEnd' && (
                        <MiniCalendar
                          value={activeItem.actualEnd || activeItem.end}
                          onChange={(newDate) => {
                            updateDraft({ actualEnd: newDate || undefined });
                            setEditorCalOpen(null);
                          }}
                          onClose={() => setEditorCalOpen(null)}
                          align="right"
                        />
                      )}
                    </div>
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
                  const isContainer = Boolean(activeItem.hasChildren || activeItem.wbsNodeType === 'COMPONENTE' || activeItem.wbsNodeType === 'SUBCOMPONENTE' || items.some((c) => c.parentId === activeItem.id));
                  const linkedTaskSummary = !isContainer ? getLinkedTasksSummary(activeItem, rawTasks) : null;

                  return (
                    <div className="progress-edit">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avance</span>
                        <b style={{ fontSize: '13px', color: '#0f172a' }}>{activeItem.progress}%</b>
                      </div>
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

                {/* 7. Tipo de reporte */}
                {activeItem.kind === 'hito' && (
                  <div className="field relative">
                    <span>Tipo de reporte</span>
                    <div className="filter-dropdown-wrap">
                      <button
                        type="button"
                        className={`filter-card-btn ${editorReportTypeOpen ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorCalOpen(null);
                          setEditorStatusOpen(false);
                          setEditorReportTypeOpen((v) => !v);
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                          {activeItem.reportType || 'Línea de tiempo'}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: editorReportTypeOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                          }}
                        />
                      </button>
                      {editorReportTypeOpen && (
                        <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                          <div className="filter-popover-title">Formato de Reporte</div>
                          {[
                            'Línea de tiempo',
                            'Matriz de entregables',
                            'Registro de entregas',
                            'Consolidado de datos',
                            'Informe de cierre',
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`filter-item-btn ${(activeItem.reportType || 'Línea de tiempo') === opt ? 'selected' : ''}`}
                              onClick={() => {
                                updateDraft({ reportType: opt });
                                setEditorReportTypeOpen(false);
                              }}
                            >
                              <span>{opt}</span>
                              {(activeItem.reportType || 'Línea de tiempo') === opt && (
                                <Check size={14} className="item-check" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. Desglose de Tareas vinculadas (100% Dinámico) */}
                {(() => {
                  const tasks = getLinkedTasks(activeItem.name);
                  const total = tasks.length;
                  const completed = tasks.filter((t: any) => t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada').length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
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

                {/* 9. Documentos de Sustento (Múltiples con apertura en pestaña nueva) */}
                <div className="field" style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <Paperclip size={15} style={{ color: '#0284c7' }} />
                      Documentos de Sustento ({getActiveAttachments(activeItem).length})
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
                      onClick={() => fileRef.current?.click()}
                    >
                      <Plus size={13} />
                      <span>Adjuntar archivo</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getActiveAttachments(activeItem).map((att) => {
                      const isPdf = att.name.toLowerCase().endsWith('.pdf');
                      const isExcel = att.name.toLowerCase().endsWith('.xls') || att.name.toLowerCase().endsWith('.xlsx') || att.name.toLowerCase().endsWith('.csv');
                      return (
                        <div
                          key={att.id}
                          className="file-card"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        >
                          <span
                            className={isPdf ? 'pdf' : isExcel ? 'status' : 'pdf'}
                            style={{
                              background: isExcel ? '#16a34a' : isPdf ? '#dc2626' : '#2563eb',
                              color: '#ffffff',
                              fontSize: '10.5px',
                              fontWeight: 750,
                              padding: '3px 7px',
                              borderRadius: '5px',
                              flexShrink: 0,
                            }}
                          >
                            {isPdf ? 'PDF' : isExcel ? 'XLS' : 'DOC'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#0f172a' }}>
                              {att.name}
                            </b>
                            <small style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {att.date || 'Sustento oficial'}
                            </small>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenAttachment(att)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 9px',
                                color: '#0f172a',
                                fontSize: '11.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              title="Abrir documento en pestaña nueva"
                            >
                              <ExternalLink size={12} color="#0284c7" />
                              <span>Ver</span>
                            </button>
                            <button
                              type="button"
                              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
                              onClick={() => handleRemoveAttachment(att.id)}
                              title="Eliminar archivo"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {getActiveAttachments(activeItem).length === 0 && (
                      <div
                        style={{
                          padding: '16px',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '12.5px',
                          background: '#f8fafc',
                        }}
                      >
                        Sin documentos de sustento adjuntos
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleAddAttachments(e.target.files);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Pestaña: Subcomponentes del Componente */}
            {editorTab === 'subprocesos' && (
              <div className="editor-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                      {activeItem.kind === 'hito' ? 'Subcomponentes' : 'Sub-elementos / Paquetes de trabajo'} ({items.filter((x) => x.parentId === activeItem.id).length})
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
                  >
                    <Plus size={14} />
                    <span>{activeItem.kind === 'hito' ? 'Agregar Subcomponente' : 'Agregar Sub-elemento'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.filter((x) => x.parentId === activeItem.id).map((sub) => (
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
                  {items.filter((x) => x.parentId === activeItem.id).length === 0 && (
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
                      <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Flujo de Prelación Configurado
                      </small>
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
              </div>
            )}

            <div className="editor-footer">
              <button className="delete" onClick={deleteItem}>
                <Trash2 size={15} />
                <span>{isNewDraft ? 'Cancelar borrador' : 'Eliminar'}</span>
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={handleSaveDrawer}
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
                    Hay modificaciones o datos pendientes en este {selected?.kind === 'hito' ? 'componente' : 'subcomponente'}.
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
