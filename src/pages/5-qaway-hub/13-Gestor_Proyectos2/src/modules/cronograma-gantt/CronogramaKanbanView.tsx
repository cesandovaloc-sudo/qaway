import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsLeftRight,
  Flag,
  Layers,
  LayoutGrid,
  ListChecks,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Settings2,
  Target,
  Trash2,
} from 'lucide-react';
import type { Item, Status } from './CronogramaGanttView';
import { daysBetween, getDeviationDays, formatDeviation, getDeviationTone } from './scheduleMetrics';
import { getEdtNodeDisplayLabel, resolveEdtNodeType } from './edtPmbokModel';

export interface KanbanBoardPrefs {
  cardSize: 'compact' | 'standard' | 'wide';
  showDates: boolean;
  showOwner: boolean;
  showProgress: boolean;
  showRegion: boolean;
  showEmptyCols: boolean;
  showKeyProps: boolean;
  collapseAllCols: boolean;
}

export const DEFAULT_KANBAN_BOARD_PREFS: KanbanBoardPrefs = {
  cardSize: 'standard',
  showDates: true,
  showOwner: true,
  showProgress: true,
  showRegion: true,
  showEmptyCols: true,
  showKeyProps: true,
  collapseAllCols: false,
};

interface CronogramaKanbanViewProps {
  items: Item[];
  allItems: Item[];
  onSelectItem: (item: Item) => void;
  onAddItem?: (status: Status, title?: string) => void;
  onUpdateStatus?: (itemId: string, nextStatus: Status) => void;
  formatDatePE: (iso: string) => string;
  todayIso?: string;
  notify?: (msg: string) => void;
  resetSignal?: number;
  cardThemeProp?: CardTheme;
  colorByProp?: ColorByMode;
  densityProp?: CardDensity;
  statusColumnsProp?: ColumnConfig[];
  wipLimitsProp?: Record<string, number>;
  onSaveWipProp?: (colId: string, val: number) => void;
  boardPrefsProp?: KanbanBoardPrefs;
  fitColumnsProp?: boolean;
  fitSignal?: number;
}

export type CardDensity = 'detailed' | 'compact' | 'minimal';
export type ColorByMode = 'status' | 'edt' | 'deviation' | 'manual';
export type CardTheme = 'simple' | 'border' | 'tinted';

export interface ColumnConfig {
  id: string;
  statusKey?: Status;
  label: string;
  dotColor: string;
  statuses?: Status[];
  isCustom?: boolean;
}

export const KANBAN_DEFAULT_WIP_LIMITS: Record<string, number> = {
  Pendiente: 0,
  'En proceso': 8,
  'Con retraso': 5,
  Completado: 0,
};

export const STATUS_COLUMNS: ColumnConfig[] = [
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
  resetSignal = 0,
  cardThemeProp,
  colorByProp,
  densityProp,
  statusColumnsProp,
  wipLimitsProp,
  onSaveWipProp,
  boardPrefsProp,
  fitColumnsProp = false,
  fitSignal = 0,
}: CronogramaKanbanViewProps) {
  const boardPrefs = boardPrefsProp ?? DEFAULT_KANBAN_BOARD_PREFS;
  const [groupBy, setGroupBy] = useState<'status' | 'parent'>('status');
  const [sortBy, setSortBy] = useState<'manual' | 'start_asc' | 'end_asc' | 'progress_desc' | 'progress_asc'>('manual');
  const [densityState, setDensity] = useState<CardDensity>('detailed');
  const [cardThemeState, setCardTheme] = useState<CardTheme>(() => {
    try {
      const saved = localStorage.getItem('qaway-kanban-card-theme-v1') as CardTheme | null;
      return saved || 'border';
    } catch {
      return 'border';
    }
  });
  const [colorByState, setColorBy] = useState<ColorByMode>(() => {
    try {
      const saved = localStorage.getItem(COLOR_MODE_STORAGE_KEY) as ColorByMode | null;
      return saved || 'status';
    } catch {
      return 'status';
    }
  });
  const [toolbarMenu, setToolbarMenu] = useState<'color' | 'view' | 'board' | null>(null);
  const [statusColumnsState, setStatusColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qaway-kanban-columns-v1') || 'null');
      return Array.isArray(saved) && saved.length > 0 ? saved : STATUS_COLUMNS;
    } catch {
      return STATUS_COLUMNS;
    }
  });
  const density = densityProp ?? densityState;
  const cardTheme = cardThemeProp ?? cardThemeState;
  const colorBy = colorByProp ?? colorByState;
  const statusColumns = statusColumnsProp ?? statusColumnsState;
  const [customColMap, setCustomColMap] = useState<Record<string, string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qaway-kanban-col-map-v1') || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });
  const [newColTitle, setNewColTitle] = useState('');
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qaway-kanban-col-widths-v1') || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });
  const [hoveredResizeColId, setHoveredResizeColId] = useState<string | null>(null);
  const [activeResizeColId, setActiveResizeColId] = useState<string | null>(null);

  const startColResize = (colId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const colEl = (e.currentTarget as HTMLElement).parentElement;
    const startW = colWidths[colId] || colEl?.getBoundingClientRect().width || 300;
    setActiveResizeColId(colId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const nextW = Math.min(540, Math.max(220, Math.round(startW + (ev.clientX - startX))));
      setColWidths((prev) => {
        const next = { ...prev, [colId]: nextW };
        try {
          localStorage.setItem('qaway-kanban-col-widths-v1', JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const onUp = () => {
      setActiveResizeColId(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (fitSignal > 0) {
      setColWidths({});
      try {
        localStorage.removeItem('qaway-kanban-col-widths-v1');
      } catch {}
      setCollapsedCols({});
      const board = document.querySelector('.cronograma-kanban-board') as HTMLElement | null;
      if (board) board.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [fitSignal]);

  useEffect(() => {
    if (resetSignal > 0) {
      setGroupBy('status');
      setSortBy('manual');
      setDensity('detailed');
      setToolbarMenu(null);
      setCollapsedCols({});
      const board = document.querySelector('.cronograma-kanban-board') as HTMLElement | null;
      if (board) board.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [resetSignal]);

  const [openStatusMenu, setOpenStatusMenu] = useState<{ item: Item; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ item: Item; x: number; y: number } | null>(null);

  // Creación inline dentro de columna Kanban
  const [addingInColId, setAddingInColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Colapsar columnas (sincronizado con preferencia global Contraer todas las columnas)
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (boardPrefs.collapseAllCols) {
      const next: Record<string, boolean> = {};
      statusColumns.forEach((c) => {
        next[c.id] = true;
      });
      setCollapsedCols(next);
    } else {
      setCollapsedCols({});
    }
  }, [boardPrefs.collapseAllCols, statusColumns]);

  // Límites WIP editables por columna
  const [wipLimitsState, setWipLimits] = useState<Record<string, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WIP_STORAGE_KEY) || 'null');
      return saved && typeof saved === 'object' ? { ...DEFAULT_WIP_LIMITS, ...saved } : DEFAULT_WIP_LIMITS;
    } catch {
      return DEFAULT_WIP_LIMITS;
    }
  });
  const wipLimits = wipLimitsProp ?? wipLimitsState;
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
    if (!contextMenu && !openStatusMenu && !editingWipColId) return;
    const onClose = () => {
      setContextMenu(null);
      setOpenStatusMenu(null);
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
  }, [contextMenu, openStatusMenu, editingWipColId]);

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
    if (onSaveWipProp) {
      onSaveWipProp(colId, clean);
      setEditingWipColId(null);
      return;
    }
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

  const persistStatusColumns = (next: ColumnConfig[]) => {
    setStatusColumns(next);
    try {
      localStorage.setItem('qaway-kanban-columns-v1', JSON.stringify(next));
    } catch {}
  };

  const handleSetCardTheme = (theme: CardTheme) => {
    setCardTheme(theme);
    try {
      localStorage.setItem('qaway-kanban-card-theme-v1', theme);
    } catch {}
  };

  const handleAddCustomColumn = () => {
    const label = newColTitle.trim();
    if (!label) return;
    const palette = ['#0066ff', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#ec4899', '#64748b'];
    const newCol: ColumnConfig = {
      id: `custom-${Date.now()}`,
      label,
      dotColor: palette[statusColumns.length % palette.length],
      isCustom: true,
    };
    persistStatusColumns([...statusColumns, newCol]);
    setNewColTitle('');
    notify?.(`Columna "${label}" agregada al tablero`);
  };

  const handleRenameColumn = (colId: string, label: string) => {
    persistStatusColumns(statusColumns.map((c) => (c.id === colId ? { ...c, label } : c)));
  };

  const handleDeleteCustomColumn = (colId: string) => {
    persistStatusColumns(statusColumns.filter((c) => c.id !== colId));
    setCustomColMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === colId) delete next[k];
      });
      try {
        localStorage.setItem('qaway-kanban-col-map-v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getParentHito = (parentId?: string) => {
    if (!parentId) return null;
    return allItems.find((x) => x.id === parentId);
  };

  const columns: { col: ColumnConfig; items: Item[] }[] = useMemo(() => {
    const sortWithOrder = (colId: string, list: Item[]) => {
      if (sortBy === 'start_asc') {
        return [...list].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
      }
      if (sortBy === 'end_asc') {
        return [...list].sort((a, b) => (a.end || '').localeCompare(b.end || ''));
      }
      if (sortBy === 'progress_desc') {
        return [...list].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      }
      if (sortBy === 'progress_asc') {
        return [...list].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0));
      }
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
      const customColIds = new Set(statusColumns.filter((c) => c.isCustom).map((c) => c.id));
      return statusColumns.map((col) => ({
        col,
        items: sortWithOrder(
          col.id,
          items.filter((x) => {
            const mapped = customColMap[x.id];
            if (mapped && customColIds.has(mapped)) {
              return mapped === col.id;
            }
            return !col.isCustom && col.statuses?.includes(x.status);
          })
        ),
      }));
    }

    // Agrupación por Componente: cada componente raíz es una columna con sus paquetes hijos
    const palette = ['#0066ff', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#ec4899', '#64748b'];
    const rootComponents = allItems.filter((x) => !x.parentId && (x.kind === 'hito' || x.edtType === 'COMPONENTE'));
    const sourceItems = allItems.filter((x) => x.parentId);
    const activeIds = new Set(items.map((x) => x.id));

    return rootComponents.map((comp, idx) => {
      const children = sourceItems.filter((x) => {
        let cur: Item | undefined = x;
        while (cur?.parentId) {
          if (cur.parentId === comp.id) return activeIds.has(x.id) || activeIds.has(comp.id);
          cur = allItems.find((p) => p.id === cur?.parentId);
        }
        return false;
      });
      const colId = `parent:${comp.id}`;
      return {
        col: {
          id: colId,
          label: `${comp.code ? `${comp.code} ` : ''}${comp.name}`,
          dotColor: palette[idx % palette.length],
        },
        items: sortWithOrder(colId, children.length > 0 ? children : [comp]),
      };
    });
  }, [groupBy, sortBy, items, allItems, cardOrder, statusColumns, customColMap]);

  const persistOrder = (next: Record<string, string[]>) => {
    setCardOrder(next);
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleDropOnColumn = (targetCol: ColumnConfig, currentColItems: Item[], targetItemId?: string, pos: 'before' | 'after' = 'after') => {
    if (!draggedId) return;
    const draggedItem = allItems.find((i) => i.id === draggedId) || items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    if (groupBy === 'status') {
      const wipLimit = wipLimits[targetCol.id] || 0;
      if (wipLimit > 0 && currentColItems.length >= wipLimit) {
        notify?.(`Alerta WIP: "${targetCol.label}" alcanzó su límite (${currentColItems.length}/${wipLimit}).`);
      }
      if (targetCol.isCustom) {
        setCustomColMap((prev) => {
          const next = { ...prev, [draggedId]: targetCol.id };
          try {
            localStorage.setItem('qaway-kanban-col-map-v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        setCustomColMap((prev) => {
          if (!prev[draggedId]) return prev;
          const next = { ...prev };
          delete next[draggedId];
          try {
            localStorage.setItem('qaway-kanban-col-map-v1', JSON.stringify(next));
          } catch {}
          return next;
        });
        if (targetCol.statusKey && !targetCol.statuses?.includes(draggedItem.status)) {
          onUpdateStatus?.(draggedId, targetCol.statusKey);
        }
      }
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

  const resolveTintedSurface = (hex: string): { bg: string; border: string } => {
    const map: Record<string, { bg: string; border: string }> = {
      '#16a34a': { bg: 'linear-gradient(155deg, #dcfce7 0%, #f0fdf4 55%, #ffffff 100%)', border: '#bbf7d0' },
      '#ef4444': { bg: 'linear-gradient(155deg, #fee2e2 0%, #fef2f2 55%, #ffffff 100%)', border: '#fecaca' },
      '#0066ff': { bg: 'linear-gradient(155deg, #dbeafe 0%, #eff6ff 55%, #ffffff 100%)', border: '#bfdbfe' },
      '#2563eb': { bg: 'linear-gradient(155deg, #dbeafe 0%, #eff6ff 55%, #ffffff 100%)', border: '#bfdbfe' },
      '#d97706': { bg: 'linear-gradient(155deg, #fef3c7 0%, #fffbeb 55%, #ffffff 100%)', border: '#fde68a' },
      '#7c3aed': { bg: 'linear-gradient(155deg, #ede9fe 0%, #f5f3ff 55%, #ffffff 100%)', border: '#ddd6fe' },
      '#0891b2': { bg: 'linear-gradient(155deg, #cffafe 0%, #ecfeff 55%, #ffffff 100%)', border: '#a5f3fc' },
      '#cbd5e1': { bg: 'linear-gradient(155deg, #f1f5f9 0%, #f8fafc 55%, #ffffff 100%)', border: '#cbd5e1' },
    };
    const key = hex.toLowerCase();
    if (map[key]) return map[key];
    return {
      bg: `linear-gradient(155deg, color-mix(in srgb, ${hex} 16%, #ffffff) 0%, color-mix(in srgb, ${hex} 6%, #ffffff) 55%, #ffffff 100%)`,
      border: `color-mix(in srgb, ${hex} 34%, #e2e8f0)`,
    };
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

  const renderCardMenuContent = (item: Item, closeFn: () => void) => {
    const manualColor = cardColors[item.id] || '';
    const isCustomColor = Boolean(manualColor && !CARD_COLOR_SWATCHES.some((s) => s.hex.toLowerCase() === manualColor.toLowerCase()));
    return (
      <>
        <div style={{ padding: '10px 12px 6px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f1f5f9' }}>
          Mover a estado
        </div>
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(
            [
              { st: 'Pendiente', label: 'Pendiente', dot: '#94a3b8' },
              { st: 'En proceso', label: 'En proceso', dot: '#0066ff' },
              { st: 'Con retraso', label: 'Con retraso', dot: '#ef4444' },
              { st: 'Completado', label: 'Completado', dot: '#16a34a' },
            ] as const
          ).map((opt) => {
            const selected = item.status === opt.st;
            return (
              <button
                key={opt.st}
                type="button"
                className="kanban-status-opt"
                style={{
                  padding: '6px 8px',
                  borderRadius: 7,
                  background: selected ? '#eff6ff' : 'transparent',
                  color: selected ? '#0066ff' : '#1e293b',
                  fontWeight: selected ? 600 : 500,
                }}
                onClick={() => {
                  closeFn();
                  onUpdateStatus?.(item.id, opt.st);
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                <span>{opt.label}</span>
                {selected && <Check size={13} style={{ marginLeft: 'auto', color: '#0066ff', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', padding: '7px 12px 9px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Palette size={11} />
              <span>Color de tarjeta</span>
            </span>
            {manualColor && (
              <button
                type="button"
                onClick={() => {
                  handleSetCardColor(item.id, '');
                  closeFn();
                }}
                style={{ border: 0, background: 'transparent', color: '#0066ff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Restablecer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'nowrap' }}>
            {CARD_COLOR_SWATCHES.filter((sw) => sw.hex !== '').map((sw) => {
              const active = manualColor.toLowerCase() === sw.hex.toLowerCase();
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
                    background: sw.hex,
                    border: active ? '2px solid #0f172a' : '1px solid rgba(15, 23, 42, 0.14)',
                    boxShadow: active ? '0 0 0 2px #ffffff inset' : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              );
            })}
            <label
              title="Color personalizado"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 20,
                padding: '0 7px',
                borderRadius: 99,
                border: isCustomColor ? '1px solid #0066ff' : '1px solid #cbd5e1',
                background: isCustomColor ? '#eff6ff' : '#f8fafc',
                color: isCustomColor ? '#0066ff' : '#475569',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: isCustomColor ? manualColor : 'conic-gradient(#ef4444, #f59e0b, #16a34a, #0066ff, #7c3aed, #ef4444)',
                  border: '1px solid rgba(15, 23, 42, 0.18)',
                  flexShrink: 0,
                }}
              />
              <span>Otro</span>
              <input
                type="color"
                value={manualColor || '#0066ff'}
                onChange={(e) => handleSetCardColor(item.id, e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
              />
            </label>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', padding: '4px 6px' }}>
          <button
            type="button"
            className="kanban-status-opt"
            style={{ color: '#0066ff', fontWeight: 650, padding: '6px 8px', borderRadius: 7, fontSize: '12.5px' }}
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
  };

  const hasCustomWidths = Object.keys(colWidths).length > 0;

  return (
    <div className={`cronograma-kanban-board${fitColumnsProp ? ' fit-columns' : ''}${hasCustomWidths ? ' has-custom-widths' : ''}${boardPrefs.cardSize === 'wide' ? ' card-size-wide' : boardPrefs.cardSize === 'compact' ? ' card-size-compact' : ''}`}>
      <div className="kanban-columns-track">
        {columns.filter(({ items: colItems }) => boardPrefs.showEmptyCols || colItems.length > 0).map(({ col, items: colItems }) => {
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

          const customW = colWidths[col.id];
          return (
            <div
              key={col.id}
              className={`kanban-column ${dropColId === col.id ? 'is-drop-target' : ''} ${isWipExceeded ? 'is-wip-exceeded' : ''}`}
              style={
                customW
                  ? { width: `${customW}px`, minWidth: `${customW}px`, maxWidth: `${customW}px`, flex: `0 0 ${customW}px`, position: 'relative' }
                  : { position: 'relative' }
              }
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
              {/* Divisor minimalista al pasar el mouse para ampliar/disminuir el ancho de esta columna */}
              <div
                role="separator"
                aria-orientation="vertical"
                title="Arrastra para ajustar el ancho de esta columna"
                onMouseDown={(e) => startColResize(col.id, e)}
                onMouseEnter={() => setHoveredResizeColId(col.id)}
                onMouseLeave={() => setHoveredResizeColId((prev) => (prev === col.id ? null : prev))}
                style={{
                  position: 'absolute',
                  top: 8,
                  bottom: 8,
                  right: -4,
                  width: 8,
                  cursor: 'col-resize',
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  userSelect: 'none',
                }}
              >
                <span
                  style={{
                    width: 2,
                    height: hoveredResizeColId === col.id || activeResizeColId === col.id ? '100%' : '28px',
                    borderRadius: 99,
                    background:
                      hoveredResizeColId === col.id || activeResizeColId === col.id ? '#3b82f6' : 'transparent',
                    transition: 'background 0.15s ease, height 0.15s ease',
                  }}
                />
              </div>
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
                          setOpenStatusMenu(null);
                          setContextMenu({
                            item,
                            x: Math.min(e.clientX, window.innerWidth - 224),
                            y: Math.min(e.clientY, window.innerHeight - 280),
                          });
                        }}
                        className={`kanban-card ${isDragging ? 'is-dragging' : ''} ${dropPosClass}`}
                        style={{
                          ...(boardPrefs.cardSize === 'compact'
                            ? { padding: '9px 11px', gap: 6 }
                            : boardPrefs.cardSize === 'wide'
                            ? { padding: '16px 18px', gap: 10 }
                            : {}),
                          ...(cardTheme === 'simple' || !accentColor
                            ? {}
                            : cardTheme === 'tinted'
                            ? (() => {
                                const surf = resolveTintedSurface(accentColor);
                                return {
                                  border: `1px solid ${surf.border}`,
                                  background: surf.bg,
                                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                                };
                              })()
                            : { borderLeft: `4px solid ${accentColor}` }),
                        }}
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
                            <span
                              className="kanban-card-name"
                              title={item.name}
                              style={
                                boardPrefs.cardSize === 'compact'
                                  ? {
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }
                                  : undefined
                              }
                            >
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
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const menuW = 254;
                                const x = Math.max(12, Math.min(rect.right - menuW, window.innerWidth - menuW - 12));
                                const y = Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - 300));
                                setOpenStatusMenu((prev) => (prev?.item.id === item.id ? null : { item, x, y }));
                              }}
                              title="Opciones de tarjeta"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </div>

                        {boardPrefs.cardSize !== 'compact' && (
                          <>
                            {boardPrefs.showKeyProps && (parentHito ? (
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
                            ))}

                            {boardPrefs.showDates && (
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
                            )}
                          </>
                        )}

                        {/* Bloque ejecutivo en modo Amplia: Avance Real vs. Baseline */}
                        {boardPrefs.cardSize === 'wide' && boardPrefs.showProgress && (() => {
                          const refToday = todayIso || new Date().toISOString().slice(0, 10);
                          const bStart = item.baselineStart || item.start;
                          const bEnd = item.baselineEnd || item.end;
                          const totalDays = Math.max(1, daysBetween(bStart, bEnd));
                          const elapsedDays = daysBetween(bStart, refToday);
                          const baselinePct = refToday < bStart ? 0 : refToday >= bEnd ? 100 : Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
                          const actualPct = Math.min(100, Math.max(0, item.progress));
                          const behind = !isCompleted && actualPct < baselinePct;
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 10px', borderRadius: 8, background: '#ffffff', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 650 }}>
                                <span style={{ color: '#0f172a' }}>
                                  Avance: <strong style={{ color: isCompleted ? '#16a34a' : behind ? '#dc2626' : '#0066ff' }}>{actualPct}%</strong>
                                </span>
                                <span style={{ color: '#64748b' }}>
                                  Baseline: <strong style={{ color: '#334155' }}>{baselinePct}%</strong>
                                </span>
                              </div>
                              <div style={{ position: 'relative', height: 10, borderRadius: 99, background: '#e2e8f0', overflow: 'visible' }}>
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${baselinePct}%`,
                                    background: '#cbd5e1',
                                    borderRadius: 99,
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'relative',
                                    height: '100%',
                                    width: `${actualPct}%`,
                                    background: isCompleted ? '#16a34a' : behind ? '#ef4444' : '#0066ff',
                                    borderRadius: 99,
                                    transition: 'width 0.2s ease',
                                    zIndex: 2,
                                  }}
                                />
                                {baselinePct > 0 && baselinePct < 100 && (
                                  <span
                                    title={`Línea base esperada hoy: ${baselinePct}%`}
                                    style={{
                                      position: 'absolute',
                                      left: `${baselinePct}%`,
                                      top: -2,
                                      width: 3,
                                      height: 14,
                                      borderRadius: 2,
                                      background: '#334155',
                                      transform: 'translateX(-50%)',
                                      zIndex: 3,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Pie de Tarjeta: Avatar + Región + Barra de Avance */}
                        {(boardPrefs.showOwner || boardPrefs.showRegion || (boardPrefs.showProgress && boardPrefs.cardSize !== 'wide')) && (
                        <div className="kanban-card-footer">
                          <div className="kanban-card-meta-left">
                            {boardPrefs.showOwner && (
                            <div
                              className="kanban-card-avatar"
                              style={{ backgroundColor: avatar.bg }}
                              title={`Responsable: ${item.gestor || 'Sin asignar'}`}
                            >
                              {avatar.initials}
                            </div>
                            )}
                            {boardPrefs.showRegion && item.region && (() => {
                              const regionLabel =
                                typeof item.region === 'string'
                                  ? item.region
                                  : (item.region as any)?.name || (item.region as any)?.dre || '';
                              if (!regionLabel) return null;
                              return (
                                <span className="kanban-card-region-pill" title={`Ámbito: ${regionLabel}`}>
                                  {regionLabel}
                                </span>
                              );
                            })()}
                          </div>

                          {boardPrefs.showProgress && boardPrefs.cardSize !== 'wide' && (
                          <div className="kanban-card-progress-wrap">
                            {item.progress > 0 && (
                              <div className="kanban-progress-track" style={{ height: 6, borderRadius: 99 }}>
                                <div
                                  className="kanban-progress-bar"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, item.progress))}%`,
                                    backgroundColor: isCompleted ? '#16a34a' : '#0066ff',
                                    borderRadius: 99,
                                  }}
                                />
                              </div>
                            )}
                            <span className={`kanban-card-pct ${isCompleted ? 'is-complete' : ''}`}>
                              {item.progress}%
                            </span>
                          </div>
                          )}
                        </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Menú flotante de 3 puntos (Portal sobre document.body con .kanban-context-menu) */}
      {openStatusMenu &&
        createPortal(
          <div
            className="kanban-context-menu"
            style={{
              top: openStatusMenu.y,
              left: openStatusMenu.x,
              minWidth: 248,
              maxWidth: 264,
              padding: 0,
              borderRadius: 12,
              overflow: 'hidden',
              gap: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderCardMenuContent(openStatusMenu.item, () => setOpenStatusMenu(null))}
          </div>,
          document.body
        )}

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
