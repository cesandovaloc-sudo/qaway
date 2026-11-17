import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronsLeftRight,
  Flag,
  Layers,
  ListChecks,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Target,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';
import { getDeviationDays, formatDeviation, getDeviationTone } from './scheduleMetrics';
import { getEdtNodeDisplayLabel, resolveEdtNodeType } from './edtPmbokModel';

interface CronogramaKanbanViewProps {
  items: Item[];
  allItems: Item[];
  onSelectItem: (item: Item) => void;
  onAddItem?: (status: Status, title?: string) => void;
  onUpdateStatus?: (itemId: string, nextStatus: Status) => void;
  formatDatePE: (iso: string) => string;
  todayIso?: string;
  notify?: (msg: string) => void;
}

type GroupByMode = 'status' | 'gestor' | 'parent' | 'region';
type CardDensity = 'detailed' | 'compact';
type ColorByMode = 'status' | 'edt' | 'deviation' | 'manual';
type ScopeMode = 'all' | 'workpackages';

interface ColumnConfig {
  id: string;
  statusKey?: Status;
  label: string;
  dotColor: string;
  statuses?: Status[];
}

const STATUS_COLUMNS: ColumnConfig[] = [
  {
    id: 'Pendiente',
    statusKey: 'Pendiente',
    label: 'Pendiente',
    dotColor: '#94a3b8',
    statuses: ['Pendiente'],
  },
  {
    id: 'En proceso',
    statusKey: 'En proceso',
    label: 'En proceso',
    dotColor: '#0066ff',
    statuses: ['En proceso', 'En curso'],
  },
  {
    id: 'Con retraso',
    statusKey: 'Con retraso',
    label: 'Con retraso',
    dotColor: '#ef4444',
    statuses: ['Con retraso'],
  },
  {
    id: 'Completado',
    statusKey: 'Completado',
    label: 'Completado',
    dotColor: '#16a34a',
    statuses: ['Completado', 'Cumple'],
  },
];

const CARD_COLOR_SWATCHES = [
  { label: 'Sin color', hex: '' },
  { label: 'Azul marca', hex: '#0066ff' },
  { label: 'Rojo alerta', hex: '#ef4444' },
  { label: 'Ámbar', hex: '#f59e0b' },
  { label: 'Verde', hex: '#16a34a' },
  { label: 'Violeta', hex: '#7c3aed' },
  { label: 'Cian', hex: '#0891b2' },
];

const DEFAULT_WIP_LIMITS: Record<string, number> = {
  Pendiente: 0,
  'En proceso': 8,
  'Con retraso': 5,
  Completado: 0,
};

const GESTOR_INITIALS_MAP: Record<string, { initials: string; bg: string }> = {
  'Carlos Sandoval': { initials: 'CS', bg: '#0066ff' },
  'María Salazar': { initials: 'MS', bg: '#8b5cf6' },
  'Javier Rivas': { initials: 'JR', bg: '#10b981' },
  'Sofía Alva': { initials: 'SA', bg: '#f59e0b' },
  'Luis Castro': { initials: 'LC', bg: '#6366f1' },
  'Ana Paredes': { initials: 'AP', bg: '#ec4899' },
};

const getAvatarMeta = (name?: string) => {
  if (!name || name === 'Sin asignar') {
    return { initials: 'SA', bg: '#94a3b8' };
  }
  if (GESTOR_INITIALS_MAP[name]) return GESTOR_INITIALS_MAP[name];
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((p) => p[0]?.toUpperCase() || '').slice(0, 2).join('');
  return { initials: initials || 'CM', bg: '#0066ff' };
};

const ORDER_STORAGE_KEY = 'qaway-kanban-order-v1';
const WIP_STORAGE_KEY = 'qaway-kanban-wip-v1';
const CARD_COLORS_STORAGE_KEY = 'qaway-kanban-card-colors-v1';
const COLOR_MODE_STORAGE_KEY = 'qaway-kanban-color-mode-v1';

export default function CronogramaKanbanView({
  items,
  allItems,
  onSelectItem,
  onAddItem,
  onUpdateStatus,
  formatDatePE,
  todayIso,
  notify,
}: CronogramaKanbanViewProps) {
  const [groupBy, setGroupBy] = useState<GroupByMode>('status');
  const [density, setDensity] = useState<CardDensity>('detailed');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('all');
  const [colorBy, setColorBy] = useState<ColorByMode>(() => {
    try {
      const saved = localStorage.getItem(COLOR_MODE_STORAGE_KEY) as ColorByMode | null;
      return saved || 'status';
    } catch {
      return 'status';
    }
  });

  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ item: Item; x: number; y: number } | null>(null);

  // Creación inline dentro de columna Kanban
  const [addingInColId, setAddingInColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Colapsar columnas
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});

  // Límites WIP editables por columna
  const [wipLimits, setWipLimits] = useState<Record<string, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WIP_STORAGE_KEY) || 'null');
      return saved && typeof saved === 'object' ? { ...DEFAULT_WIP_LIMITS, ...saved } : DEFAULT_WIP_LIMITS;
    } catch {
      return DEFAULT_WIP_LIMITS;
    }
  });
  const [editingWipColId, setEditingWipColId] = useState<string | null>(null);
  const [wipDraft, setWipDraft] = useState<string>('0');

  // Colores manuales por tarjeta
  const [cardColors, setCardColors] = useState<Record<string, string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CARD_COLORS_STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropColId, setDropColId] = useState<string | null>(null);
  const [dropCardTarget, setDropCardTarget] = useState<{ id: string; pos: 'before' | 'after' } | null>(null);

  const [cardOrder, setCardOrder] = useState<Record<string, string[]>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!contextMenu && !openStatusMenuId && !editingWipColId) return;
    const onClose = () => {
      setContextMenu(null);
      setOpenStatusMenuId(null);
      setEditingWipColId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('click', onClose);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onClose);
      window.removeEventListener('keydown', onKey);
    };
  }, [contextMenu, openStatusMenuId, editingWipColId]);

  const handleSetColorBy = (mode: ColorByMode) => {
    setColorBy(mode);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
    } catch {}
  };

  const handleSetCardColor = (itemId: string, hex: string) => {
    setCardColors((prev) => {
      const next = { ...prev };
      if (!hex) delete next[itemId];
      else next[itemId] = hex;
      try {
        localStorage.setItem(CARD_COLORS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSaveWip = (colId: string, val: number) => {
    const clean = Math.max(0, Math.floor(Number.isFinite(val) ? val : 0));
    setWipLimits((prev) => {
      const next = { ...prev, [colId]: clean };
      try {
        localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setEditingWipColId(null);
    notify?.(clean > 0 ? `Límite WIP fijado en ${clean} tarjetas` : 'Límite WIP desactivado en esta columna');
  };

  const getParentHito = (parentId?: string) => {
    if (!parentId) return null;
    return allItems.find((x) => x.id === parentId);
  };

  const filteredByScope = useMemo(() => {
    if (scopeMode === 'all') return items;
    return items.filter((it) => {
      const nodeType = resolveEdtNodeType(it, allItems);
      return nodeType === 'PAQUETE_TRABAJO' || nodeType === 'HITO';
    });
  }, [items, allItems, scopeMode]);

  const columns: { col: ColumnConfig; items: Item[] }[] = useMemo(() => {
    const sortWithOrder = (colId: string, list: Item[]) => {
      const order = cardOrder[colId];
      if (!order || order.length === 0) return list;
      const rank = new Map(order.map((id, i) => [id, i]));
      return [...list].sort((a, b) => {
        const ra = rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
        return ra - rb;
      });
    };

    if (groupBy === 'status') {
      return STATUS_COLUMNS.map((col) => ({
        col,
        items: sortWithOrder(
          col.id,
          filteredByScope.filter((x) => col.statuses?.includes(x.status))
        ),
      }));
    }

    const buckets = new Map<string, Item[]>();
    const labelMap = new Map<string, string>();
    const palette = ['#0066ff', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#ec4899', '#64748b'];

    for (const it of filteredByScope) {
      let key = 'sin-asignar';
      let label = 'Sin asignar';
      if (groupBy === 'gestor') {
        key = it.gestor?.trim() || 'Sin asignar';
        label = key;
      } else if (groupBy === 'region') {
        key = it.region?.trim() || 'Todas las Regiones';
        label = key;
      } else if (groupBy === 'parent') {
        const parent = getParentHito(it.parentId);
        key = parent ? parent.id : 'componentes-raiz';
        label = parent ? `${parent.code ? `${parent.code} ` : ''}${parent.name}` : 'Componentes principales';
      }
      if (!buckets.has(key)) {
        buckets.set(key, []);
        labelMap.set(key, label);
      }
      buckets.get(key)!.push(it);
    }

    return Array.from(buckets.entries()).map(([key, list], idx) => ({
      col: {
        id: `${groupBy}:${key}`,
        label: labelMap.get(key) || key,
        dotColor: palette[idx % palette.length],
      },
      items: sortWithOrder(`${groupBy}:${key}`, list),
    }));
  }, [groupBy, filteredByScope, allItems, cardOrder]);

  const persistOrder = (next: Record<string, string[]>) => {
    setCardOrder(next);
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleDropOnColumn = (targetCol: ColumnConfig, currentColItems: Item[], targetItemId?: string, pos: 'before' | 'after' = 'after') => {
    if (!draggedId) return;
    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    const isChangingCol = groupBy === 'status' && targetCol.statusKey && !targetCol.statuses?.includes(draggedItem.status);
    if (isChangingCol && targetCol.statusKey) {
      const wipLimit = wipLimits[targetCol.id] || 0;
      if (wipLimit > 0 && currentColItems.length >= wipLimit) {
        notify?.(`Alerta WIP: "${targetCol.label}" alcanzó su límite (${currentColItems.length}/${wipLimit}).`);
      }
      onUpdateStatus?.(draggedId, targetCol.statusKey);
    }

    const baseIds = currentColItems.map((i) => i.id).filter((id) => id !== draggedId);
    let insertIdx = baseIds.length;
    if (targetItemId && targetItemId !== draggedId) {
      const idx = baseIds.indexOf(targetItemId);
      if (idx !== -1) {
        insertIdx = pos === 'before' ? idx : idx + 1;
      }
    }
    baseIds.splice(insertIdx, 0, draggedId);
    persistOrder({ ...cardOrder, [targetCol.id]: baseIds });

    setDraggedId(null);
    setDropColId(null);
    setDropCardTarget(null);
  };

  const renderEdtIcon = (item: Item) => {
    const nodeType = resolveEdtNodeType(item, allItems);
    if (nodeType === 'COMPONENTE') return <Layers size={12} style={{ color: '#2563eb', flexShrink: 0 }} />;
    if (nodeType === 'PRODUCTO') return <Package size={12} style={{ color: '#d97706', flexShrink: 0 }} />;
    if (nodeType === 'HITO') return <Flag size={12} style={{ color: '#7c3aed', flexShrink: 0 }} />;
    return <ListChecks size={12} style={{ color: '#0284c7', flexShrink: 0 }} />;
  };

  const resolveCardAccentColor = (item: Item): string | undefined => {
    if (cardColors[item.id]) return cardColors[item.id];
    if (colorBy === 'manual') return undefined;
    if (colorBy === 'status') {
      if (item.status === 'Completado' || item.status === 'Cumple') return '#16a34a';
      if (item.status === 'Con retraso') return '#ef4444';
      if (item.status === 'En proceso' || item.status === 'En curso') return '#0066ff';
      return '#cbd5e1';
    }
    if (colorBy === 'edt') {
      const nt = resolveEdtNodeType(item, allItems);
      if (nt === 'COMPONENTE') return '#2563eb';
      if (nt === 'PRODUCTO') return '#d97706';
      if (nt === 'HITO') return '#7c3aed';
      return '#0891b2';
    }
    if (colorBy === 'deviation') {
      const dev = getDeviationDays(item, todayIso || new Date().toISOString().slice(0, 10));
      if (dev === undefined) return '#cbd5e1';
      if (dev > 0) return '#ef4444';
      return '#16a34a';
    }
    return undefined;
  };

  const handleSubmitInlineCard = (col: ColumnConfig) => {
    const title = newCardTitle.trim();
    if (!title || !col.statusKey || !onAddItem) return;
    const wipLimit = wipLimits[col.id] || 0;
    const currentCount = columns.find((c) => c.col.id === col.id)?.items.length || 0;
    if (wipLimit > 0 && currentCount >= wipLimit) {
      notify?.(`Alerta WIP: "${col.label}" ya alcanzó su límite (${currentCount}/${wipLimit}).`);
    }
    onAddItem(col.statusKey, title);
    setNewCardTitle('');
    setAddingInColId(null);
  };

  const renderCardMenuContent = (item: Item, closeFn: () => void) => (
    <>
      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, padding: '4px 8px', borderBottom: '1px solid #f1f5f9' }}>
        Mover a estado
      </div>
      {(
        [
          { st: 'Pendiente', label: 'Pendiente', dot: '#94a3b8' },
          { st: 'En proceso', label: 'En proceso', dot: '#0066ff' },
          { st: 'Con retraso', label: 'Con retraso', dot: '#ef4444' },
          { st: 'Completado', label: 'Completado', dot: '#16a34a' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.st}
          type="button"
          className="kanban-status-opt"
          onClick={() => {
            closeFn();
            onUpdateStatus?.(item.id, opt.st);
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
          <span>{opt.label}</span>
          {item.status === opt.st && <Check size={12} style={{ marginLeft: 'auto', color: '#0066ff' }} />}
        </button>
      ))}

      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 3, padding: '6px 8px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '10.5px', color: '#64748b', fontWeight: 700, marginBottom: 5 }}>
          <Palette size={11} />
          <span>Color de tarjeta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {CARD_COLOR_SWATCHES.map((sw) => {
            const active = (cardColors[item.id] || '') === sw.hex;
            return (
              <button
                key={sw.label}
                type="button"
                title={sw.label}
                onClick={() => {
                  handleSetCardColor(item.id, sw.hex);
                  closeFn();
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: sw.hex || '#f8fafc',
                  border: active ? '2px solid #0f172a' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 3 }}>
        <button
          type="button"
          className="kanban-status-opt"
          style={{ color: '#0066ff', fontWeight: 600 }}
          onClick={() => {
            closeFn();
            onSelectItem(item);
          }}
        >
          <span>Ver detalle completo...</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="cronograma-kanban-board">
      {/* Barra operativa Kanban: Agrupación, Color de tarjetas, Alcance y Densidad */}
      <div className="kanban-board-toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="kanban-toolbar-group">
          <span className="kanban-toolbar-label">Agrupar:</span>
          {(
            [
              { id: 'status', label: 'Estado' },
              { id: 'gestor', label: 'Responsable' },
              { id: 'parent', label: 'Componente' },
              { id: 'region', label: 'Región' },
            ] as const
          ).map((g) => (
            <button
              key={g.id}
              type="button"
              className={`kanban-toolbar-pill ${groupBy === g.id ? 'active' : ''}`}
              onClick={() => setGroupBy(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="kanban-toolbar-group">
          <span className="kanban-toolbar-label">Color:</span>
          {(
            [
              { id: 'status', label: 'Estado' },
              { id: 'edt', label: 'Tipo EDT' },
              { id: 'deviation', label: 'Desviación' },
              { id: 'manual', label: 'Manual' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              type="button"
              className={`kanban-toolbar-pill ${colorBy === c.id ? 'active' : ''}`}
              onClick={() => handleSetColorBy(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="kanban-toolbar-group">
          <button
            type="button"
            className={`kanban-toolbar-pill ${scopeMode === 'workpackages' ? 'active' : ''}`}
            onClick={() => setScopeMode((prev) => (prev === 'all' ? 'workpackages' : 'all'))}
            title="Filtrar solo Paquetes de Trabajo e Hitos accionables (oculta contenedores)"
          >
            {scopeMode === 'workpackages' ? 'Solo Paquetes de Trabajo' : 'Todos los niveles'}
          </button>
          <button
            type="button"
            className={`kanban-toolbar-pill ${density === 'compact' ? 'active' : ''}`}
            onClick={() => setDensity((prev) => (prev === 'detailed' ? 'compact' : 'detailed'))}
          >
            {density === 'compact' ? 'Vista compacta' : 'Vista detallada'}
          </button>
        </div>
      </div>

      <div className="kanban-columns-track">
        {columns.map(({ col, items: colItems }) => {
          const isCollapsed = Boolean(collapsedCols[col.id]);
          const wipLimit = wipLimits[col.id] || 0;
          const isWipExceeded = wipLimit > 0 && colItems.length > wipLimit;

          if (isCollapsed) {
            return (
              <div
                key={col.id}
                className={`kanban-column is-collapsed ${isWipExceeded ? 'is-wip-exceeded' : ''}`}
                onClick={() => setCollapsedCols((prev) => ({ ...prev, [col.id]: false }))}
                title={`Expandir columna ${col.label} (${colItems.length})`}
              >
                <span className="kanban-col-dot" style={{ backgroundColor: col.dotColor, marginBottom: 10 }} />
                <span className={`kanban-wip-badge ${isWipExceeded ? 'exceeded' : ''}`} style={{ marginBottom: 12 }}>
                  {colItems.length}
                </span>
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#334155',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </span>
              </div>
            );
          }

          return (
            <div
              key={col.id}
              className={`kanban-column ${dropColId === col.id ? 'is-drop-target' : ''} ${isWipExceeded ? 'is-wip-exceeded' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                if (dropColId !== col.id) setDropColId(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDropColId((prev) => (prev === col.id ? null : prev));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnColumn(col, colItems);
              }}
            >
              {/* Cabecera de Columna con WIP Limit y colapsado */}
              <div className="kanban-column-header" style={{ position: 'relative' }}>
                <div className="kanban-col-title-group" style={{ minWidth: 0 }}>
                  <span className="kanban-col-dot" style={{ backgroundColor: col.dotColor }} />
                  <span className="kanban-col-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={col.label}>
                    {col.label}
                  </span>
                  <button
                    type="button"
                    className={`kanban-wip-badge ${isWipExceeded ? 'exceeded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWipDraft(String(wipLimit));
                      setEditingWipColId((prev) => (prev === col.id ? null : col.id));
                    }}
                    title={wipLimit > 0 ? `Límite WIP: ${colItems.length} de ${wipLimit} (clic para ajustar)` : 'Clic para configurar límite WIP (Work In Progress)'}
                  >
                    {isWipExceeded && <AlertTriangle size={11} />}
                    <span>{wipLimit > 0 ? `${colItems.length} / ${wipLimit}` : colItems.length}</span>
                  </button>

                  {editingWipColId === col.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 4,
                        marginTop: 6,
                        zIndex: 120,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: 8,
                        boxShadow: '0 8px 20px rgba(15,23,42,0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Máx. WIP:</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={wipDraft}
                        onChange={(e) => setWipDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveWip(col.id, Number(wipDraft));
                          if (e.key === 'Escape') setEditingWipColId(null);
                        }}
                        style={{ width: 48, fontSize: 12, padding: '2px 5px', border: '1px solid #cbd5e1', borderRadius: 5 }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveWip(col.id, Number(wipDraft))}
                        style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, border: 'none', background: '#0066ff', color: '#fff', cursor: 'pointer' }}
                      >
                        OK
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {onAddItem && col.statusKey && (
                    <button
                      type="button"
                      className="kanban-add-btn"
                      onClick={() => {
                        setAddingInColId(col.id);
                        setNewCardTitle('');
                      }}
                      title={`Agregar paquete de trabajo en ${col.label}`}
                      aria-label={`Agregar paquete de trabajo en ${col.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="kanban-add-btn"
                    onClick={() => setCollapsedCols((prev) => ({ ...prev, [col.id]: true }))}
                    title={`Plegar columna ${col.label}`}
                    aria-label={`Plegar columna ${col.label}`}
                  >
                    <ChevronsLeftRight size={13} />
                  </button>
                </div>
              </div>

              {isWipExceeded && (
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#b91c1c', marginBottom: 8, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={12} />
                  <span>WIP excedido ({colItems.length}/{wipLimit}) — revisa cuello de botella</span>
                </div>
              )}

              {/* Creador inline dentro de la columna al pulsar + */}
              {addingInColId === col.id && (
                <div className="kanban-inline-creator" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Nombre del paquete de trabajo..."
                    value={newCardTitle}
                    autoFocus
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitInlineCard(col);
                      if (e.key === 'Escape') {
                        setAddingInColId(null);
                        setNewCardTitle('');
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingInColId(null);
                        setNewCardTitle('');
                      }}
                      style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitInlineCard(col)}
                      disabled={!newCardTitle.trim()}
                      style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: 'none', background: '#0066ff', color: '#fff', cursor: newCardTitle.trim() ? 'pointer' : 'not-allowed', opacity: newCardTitle.trim() ? 1 : 0.5 }}
                    >
                      Crear
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Tarjetas */}
              <div className="kanban-cards-list">
                {colItems.length === 0 ? (
                  <div className="kanban-column-empty">
                    <span>Arrastra tarjetas aquí o pulsa + para crear</span>
                  </div>
                ) : (
                  colItems.map((item) => {
                    const parentHito = getParentHito(item.parentId);
                    const avatar = getAvatarMeta(item.gestor);
                    const isCompleted = item.status === 'Completado' || item.status === 'Cumple';
                    const isDragging = draggedId === item.id;
                    const accentColor = resolveCardAccentColor(item);
                    const dropPosClass =
                      dropCardTarget?.id === item.id
                        ? dropCardTarget.pos === 'before'
                          ? 'is-drop-before'
                          : 'is-drop-after'
                        : '';

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(item.id);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', item.id);
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDropColId(null);
                          setDropCardTarget(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!draggedId || draggedId === item.id) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                          setDropColId(col.id);
                          setDropCardTarget({ id: item.id, pos });
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const pos = dropCardTarget?.id === item.id ? dropCardTarget.pos : 'after';
                          handleDropOnColumn(col, colItems, item.id, pos);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenStatusMenuId(null);
                          setContextMenu({
                            item,
                            x: Math.min(e.clientX, window.innerWidth - 224),
                            y: Math.min(e.clientY, window.innerHeight - 280),
                          });
                        }}
                        className={`kanban-card ${isDragging ? 'is-dragging' : ''} ${dropPosClass}`}
                        style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
                        onClick={() => onSelectItem(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectItem(item);
                          }
                        }}
                      >
                        {/* Cabecera de tarjeta: Código EDT, Título y Menú */}
                        <div className="kanban-card-top">
                          <div className="kanban-card-title-wrap">
                            <span className="kanban-card-code" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {renderEdtIcon(item)}
                              <span>{item.code || getEdtNodeDisplayLabel(item, allItems)}</span>
                            </span>
                            <span className="kanban-card-name" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="kanban-card-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu(null);
                                setOpenStatusMenuId((prev) => (prev === item.id ? null : item.id));
                              }}
                              title="Opciones de tarjeta"
                            >
                              <MoreHorizontal size={14} />
                            </button>

                            {openStatusMenuId === item.id && (
                              <div
                                className="kanban-status-popover"
                                style={{ minWidth: 205 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {renderCardMenuContent(item, () => setOpenStatusMenuId(null))}
                              </div>
                            )}
                          </div>
                        </div>

                        {density === 'detailed' && (
                          <>
                            {parentHito ? (
                              <div className="kanban-card-parent" title={`Padre: ${parentHito.name}`}>
                                <Target size={12} className="kanban-card-icon" />
                                <span>
                                  {parentHito.code ? `${parentHito.code} ` : ''}{parentHito.name}
                                </span>
                              </div>
                            ) : (
                              <div className="kanban-card-parent is-hito" title={getEdtNodeDisplayLabel(item, allItems)}>
                                <Flag size={12} className="kanban-card-icon" />
                                <span>{getEdtNodeDisplayLabel(item, allItems)}</span>
                              </div>
                            )}

                            <div className="kanban-card-dates" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, overflow: 'hidden' }}>
                                <CalendarDays size={12} className="kanban-card-icon" style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {formatDatePE(item.start)} – {formatDatePE(item.end)}
                                </span>
                              </div>
                              {(() => {
                                const dev = getDeviationDays(item, todayIso || new Date().toISOString().slice(0, 10));
                                if (dev === undefined) return null;
                                const tone = getDeviationTone(dev);
                                return (
                                  <span
                                    className={`dev-pill ${tone}`}
                                    style={{ fontSize: '10.5px', padding: '1px 5px', lineHeight: '1.2', flexShrink: 0 }}
                                    title={`Desviación respecto a línea base: ${formatDeviation(dev)}`}
                                  >
                                    {formatDeviation(dev)}
                                  </span>
                                );
                              })()}
                            </div>
                          </>
                        )}

                        {/* Pie de Tarjeta: Avatar + Región + Barra de Avance */}
                        <div className="kanban-card-footer">
                          <div className="kanban-card-meta-left">
                            <div
                              className="kanban-card-avatar"
                              style={{ backgroundColor: avatar.bg }}
                              title={`Responsable: ${item.gestor || 'Sin asignar'}`}
                            >
                              {avatar.initials}
                            </div>
                            {item.region && (
                              <span className="kanban-card-region-pill" title={`Ámbito: ${item.region}`}>
                                {item.region}
                              </span>
                            )}
                          </div>

                          <div className="kanban-card-progress-wrap">
                            {item.progress > 0 && (
                              <div className="kanban-progress-track">
                                <div
                                  className="kanban-progress-bar"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, item.progress))}%`,
                                    backgroundColor: isCompleted ? '#16a34a' : '#0066ff',
                                  }}
                                />
                              </div>
                            )}
                            <span className={`kanban-card-pct ${isCompleted ? 'is-complete' : ''}`}>
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Menú contextual flotante por clic derecho (clase raíz independiente de .gantt-v2) */}
      {contextMenu &&
        createPortal(
          <div
            className="kanban-context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderCardMenuContent(contextMenu.item, () => setContextMenu(null))}
          </div>,
          document.body
        )}
    </div>
  );
}
