import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  EyeOff,
  Filter,
  Hash,
  Pencil,
  Percent,
  PieChart,
  Pin,
  RotateCcw,
  Search,
  Sigma,
  Sliders,
  Tag,
  Trash2,
  Type,
  User,
  WrapText,
  X,
} from 'lucide-react';
import {
  customRank,
  DATE_PRESET_LABELS,
  getColumnType,
  hasCustomOrder,
  toTokens,
} from './columnTypes';
import { isFilterActive } from './engine';
import type { TableEngine } from './useTableEngine';
import { EMPTY_TOKEN, type ColumnDef, type ColumnOption, type FilterValue, type OperatorDef } from './types';
import './tableEngine.css';



function getPropertyIcon(type: string): React.ReactNode {
  switch (type) {
    case 'text': return <Type size={13} />;
    case 'number': return <Hash size={13} />;
    case 'percent': return <Percent size={13} />;
    case 'date':
    case 'dateRange': return <Calendar size={13} />;
    case 'person': return <User size={13} />;
    case 'processState':
    case 'select':
    case 'multiSelect': return <Tag size={13} />;
    default: return <Sliders size={13} />;
  }
}

function getPropertyTypeName(type: string): string {
  switch (type) {
    case 'text': return 'Texto';
    case 'number': return 'Número';
    case 'percent': return 'Porcentaje';
    case 'date': return 'Fecha';
    case 'dateRange': return 'Rango de fechas';
    case 'person': return 'Persona / Responsable';
    case 'processState': return 'Estado de proceso';
    case 'select': return 'Selección';
    case 'multiSelect': return 'Selección múltiple';
    case 'boolean': return 'Booleano';
    default: return 'Propiedad';
  }
}

function getFilterSubmenuTitle(type: string): string {
  switch (type) {
    case 'text': return 'Filtros de texto';
    case 'number':
    case 'percent': return 'Filtros de número';
    case 'date':
    case 'dateRange': return 'Filtros de fecha';
    case 'person': return 'Filtros de responsable';
    case 'processState': return 'Filtros de estado';
    default: return 'Filtros avanzados';
  }
}

/* ───────────── Opciones del selector ───────────── */

interface CountedOption extends ColumnOption {
  count: number;
}

function buildOptions<R>(col: ColumnDef<R>, rows: R[]): CountedOption[] {
  const base: ColumnOption[] =
    typeof col.options === 'function' ? col.options(rows) : Array.isArray(col.options) ? col.options : [];
  const counts = new Map<string, number>();
  let empties = 0;
  rows.forEach((r) => {
    const tokens = toTokens(col.accessor(r));
    if (!tokens.length) empties++;
    tokens.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  });

  const known = new Set(base.map((o) => o.value));
  const extra: ColumnOption[] = [];
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  counts.forEach((_, value) => {
    if (!known.has(value)) {
      let label = value;
      if (col.type === 'percent') {
        label = `${value}%`;
      } else if (col.id === 'duration') {
        label = `${value} días`;
      } else if (col.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parts = value.split('-');
        const y = parts[0] ?? '';
        const m = parts[1] ?? '1';
        const d = parts[2] ?? '';
        const mIdx = parseInt(m, 10) - 1;
        label = `${d} ${monthNames[mIdx] ?? m} ${y}`;
      }
      extra.push({ value, label });
    }
  });

  if (col.type === 'number' || col.type === 'percent') {
    extra.sort((a, b) => Number(a.value) - Number(b.value));
  } else if (col.type === 'date') {
    extra.sort((a, b) => a.value.localeCompare(b.value));
  } else {
    extra.sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' }));
  }

  let list = [...base, ...extra];
  const withBase = { ...col, options: base } as ColumnDef;
  if (base.length && hasCustomOrder(withBase)) {
    list = [...list].sort((a, b) => customRank(a.value, withBase) - customRank(b.value, withBase));
  } else if (!base.length && (col.type !== 'number' && col.type !== 'percent' && col.type !== 'date')) {
    list.sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' }));
  }

  const out: CountedOption[] = list.map((o) => ({ ...o, count: counts.get(o.value) ?? 0 }));
  if (empties > 0) {
    out.push({
      value: EMPTY_TOKEN,
      label: col.emptyLabel ?? (col.type === 'person' ? 'Sin asignar' : '(Vacíos)'),
      count: empties,
    });
  }
  return out;
}

/* ───────────── Selector múltiple (estilo Excel) ───────────── */

const ROW_H = 28;
const VIEW_H = 168;

interface SelectionFilterProps {
  col: ColumnDef;
  options: CountedOption[];
  value?: FilterValue | undefined;
  onApply: (v: FilterValue | null) => void;
  onCancel: () => void;
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({ col, options, value, onApply, onCancel }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'in' | 'not_in'>(value?.op === 'not_in' ? 'not_in' : 'in');
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (value?.values) return new Set(value.values);
    return new Set(options.map((o) => o.value));
  });
  const [scroll, setScroll] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const allVisibleSelected = visible.length > 0 && visible.every((o) => selected.has(o.value));

  const toggle = (v: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  const selectAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((o) => next.add(o.value));
      return next;
    });

  const clearAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((o) => next.delete(o.value));
      return next;
    });

  const apply = () => {
    const values = [...selected];
    const everything = options.length > 0 && options.every((o) => selected.has(o.value));
    if (!values.length || (everything && mode === 'in')) onApply(null);
    else onApply({ op: mode, values });
  };

  const start = Math.max(0, Math.floor(scroll / ROW_H) - 3);
  const end = Math.min(visible.length, start + Math.ceil(VIEW_H / ROW_H) + 7);

  return (
    <div className="te-section te-selection">
      <div className="te-search">
        <Search size={13} />
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setScroll(0);
          }}
          aria-label="Buscar valores"
          autoFocus
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Borrar búsqueda">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="te-seg" role="group" aria-label="Modo de selección">
        <button type="button" className={mode === 'in' ? 'on' : ''} onClick={() => setMode('in')}>
          Incluir
        </button>
        <button type="button" className={mode === 'not_in' ? 'on' : ''} onClick={() => setMode('not_in')}>
          Excluir
        </button>
      </div>

      <div className="te-selectall">
        <label className="te-check-label">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={() => (allVisibleSelected ? clearAllVisible() : selectAllVisible())}
          />
          <span>{allVisibleSelected ? 'Desmarcar todos' : 'Seleccionar todos'}</span>
          <small>({visible.length})</small>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="te-empty">Sin resultados para "{query}"</div>
      ) : (
        <div
          className="te-list"
          style={{ height: Math.min(VIEW_H, visible.length * ROW_H) }}
          onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
        >
          <div style={{ height: visible.length * ROW_H, position: 'relative' }}>
            {visible.slice(start, end).map((o, i) => {
              const checked = selected.has(o.value);
              return (
                <label
                  key={o.value}
                  className={`te-item ${checked ? 'checked' : ''}`}
                  style={{ position: 'absolute', top: (start + i) * ROW_H, left: 0, right: 0, height: ROW_H - 2 }}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggle(o.value)} />
                  <span className="te-item-text">{o.label}</span>
                  <span className="te-count">{o.count}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="te-foot">
        <span className="te-selected-count">
          {selected.size} de {options.length}
        </span>
        <div className="te-foot-btns">
          <button type="button" className="te-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="te-btn te-btn-primary" onClick={apply}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───────────── Filtros por condición ───────────── */

const QUICK_PERCENT = ['zero', 'full', 'with_progress', 'no_progress'];
const QUICK_DATE = Object.keys(DATE_PRESET_LABELS);

interface ConditionFilterProps {
  col: ColumnDef;
  value?: FilterValue | undefined;
  onApply: (v: FilterValue | null) => void;
}

const ConditionFilter: React.FC<ConditionFilterProps> = ({ col, value, onApply }) => {
  const type = getColumnType(col.type);
  const all = type.operators(col);

  const quickIds =
    type.kind === 'date' || type.kind === 'dateRange'
      ? QUICK_DATE
      : type.kind === 'percent'
        ? QUICK_PERCENT
        : type.kind === 'boolean'
          ? all.map((o) => o.id)
          : [];
  const quick = all.filter((o) => quickIds.includes(o.id));
  const selectable = all.filter((o) => !quickIds.includes(o.id));

  const [opId, setOpId] = useState(
    value && selectable.some((o) => o.id === value.op) ? value.op : selectable[0]?.id ?? ''
  );
  const [v1, setV1] = useState(value?.value ?? '');
  const [v2, setV2] = useState(value?.value2 ?? '');
  const current: OperatorDef | undefined = selectable.find((o) => o.id === opId);

  const ready = !!current && (current.inputs === 0 || v1.trim() !== '') && (current.inputs < 2 || v2.trim() !== '');

  return (
    <div className="te-section te-condition">
      {selectable.length > 0 && (
        <>
          <select
            className="te-field"
            value={opId}
            onChange={(e) => setOpId(e.target.value)}
            aria-label="Condición"
          >
            {selectable.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {current && current.inputs >= 1 && (
            <input
              className="te-field"
              type={current.input === 'number' ? 'number' : current.input === 'date' ? 'date' : 'text'}
              value={v1}
              onChange={(e) => setV1(e.target.value)}
              placeholder={current.inputs === 2 ? 'Desde' : 'Valor'}
              aria-label={current.inputs === 2 ? 'Desde' : 'Valor'}
              onKeyDown={(e) => e.key === 'Enter' && ready && onApply({ op: opId, value: v1, value2: v2 })}
            />
          )}
          {current && current.inputs === 2 && (
            <input
              className="te-field"
              type={current.input === 'number' ? 'number' : 'date'}
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              placeholder="Hasta"
              aria-label="Hasta"
              onKeyDown={(e) => e.key === 'Enter' && ready && onApply({ op: opId, value: v1, value2: v2 })}
            />
          )}
          <div className="te-foot te-foot-end">
            <button
              type="button"
              className="te-btn te-btn-primary"
              disabled={!ready}
              onClick={() => onApply({ op: opId, value: v1, value2: v2 })}
            >
              Aplicar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ───────────── Menú de encabezado ───────────── */

interface ColumnHeaderMenuProps<R> {
  engine: TableEngine<R>;
  columnId: string;
  /** Clase del botón disparador (hereda el estilo del encabezado de cada tabla). */
  buttonClassName?: string;
  iconSize?: number;
  onHideColumn?: ((columnId: string) => void) | undefined;
  onFreezeColumn?: ((columnId: string) => void) | undefined;
  isFrozen?: boolean | undefined;
  onRenameColumn?: ((columnId: string, newLabel: string) => void) | undefined;
  onChangeType?: ((columnId: string, newType: string) => void) | undefined;
  graphFormat?: 'bar' | 'ring' | 'number' | undefined;
  onChangeGraphFormat?: ((columnId: string, format: 'bar' | 'ring' | 'number') => void) | undefined;
  onToggleWrap?: ((columnId: string) => void) | undefined;
  isWrapped?: boolean | undefined;
  onCalculate?: ((columnId: string, calculation: string) => void) | undefined;
  activeCalculation?: string | undefined;
  onInsertLeft?: ((columnId: string) => void) | undefined;
  onInsertRight?: ((columnId: string) => void) | undefined;
  onDuplicate?: ((columnId: string) => void) | undefined;
  onDelete?: ((columnId: string) => void) | undefined;
}

const MENU_W = 285;

export function ColumnHeaderMenu<R>({
  engine,
  columnId,
  buttonClassName = 'te-trigger',
  iconSize = 11,
  onHideColumn,
  onFreezeColumn,
  isFrozen,
  onRenameColumn,
  onChangeType,
  graphFormat,
  onChangeGraphFormat,
  onToggleWrap,
  isWrapped,
  onCalculate,
  activeCalculation,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onDelete,
}: ColumnHeaderMenuProps<R>) {
  const col = engine.columns.find((c) => c.id === columnId) as ColumnDef | undefined;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxH: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) btnRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(MENU_W, vw - 16);
    const left = Math.max(8, Math.min(r.left, vw - width - 8));
    const top = r.bottom + 4;
    setPos({ top, left, maxH: Math.max(180, vh - top - 12) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t) || (t instanceof Element && (t.closest('.te-flyout') || t.closest('.te-nested-flyout')))) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };
    const onScroll = (e: Event) => {
      if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, close]);

  if (!col || (col.filterable === false && col.sortable === false)) return null;

  const filtered = engine.isFiltered(columnId);
  const sortIdx = engine.sortIndex(columnId);
  const sorted = sortIdx >= 0;
  const crit = sorted ? engine.sort[sortIdx] : null;
  const label = `Opciones de la columna ${col.label}${filtered ? ' (filtro activo)' : ''}${sorted ? ' (ordenada)' : ''}`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${buttonClassName} ${filtered ? 'filtered' : ''} ${sorted ? 'te-sorted' : ''} ${
          filtered || sorted ? 'te-active' : ''
        }`}
        style={{ position: 'relative' }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Filter size={iconSize} />
        {sorted && crit && (
          <span className="te-sort-badge" aria-hidden="true">
            {crit.dir === 'asc' ? <ArrowUp size={7} strokeWidth={3.2} /> : <ArrowDown size={7} strokeWidth={3.2} />}
            {engine.sort.length > 1 && <b>{sortIdx + 1}</b>}
          </span>
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={popRef}
            className="te-menu"
            role="dialog"
            aria-label={`Opciones de ${col.label}`}
            style={{ top: pos.top, left: pos.left, width: Math.min(MENU_W, window.innerWidth - 16), maxHeight: pos.maxH }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MenuBody
              engine={engine}
              col={col}
              close={close}
              onHideColumn={onHideColumn}
              onFreezeColumn={onFreezeColumn}
              isFrozen={isFrozen}
              onRenameColumn={onRenameColumn}
              onChangeType={onChangeType}
              graphFormat={graphFormat}
              onChangeGraphFormat={onChangeGraphFormat}
              onToggleWrap={onToggleWrap}
              isWrapped={isWrapped}
              onCalculate={onCalculate}
              activeCalculation={activeCalculation}
              onInsertLeft={onInsertLeft}
              onInsertRight={onInsertRight}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>,
          document.body
        )}
    </>
  );
}

function MenuBody<R>({
  engine,
  col,
  close,
  onHideColumn,
  onFreezeColumn,
  isFrozen,
  onRenameColumn,
  onChangeType,
  graphFormat,
  onChangeGraphFormat,
  onToggleWrap,
  isWrapped,
  onCalculate,
  activeCalculation,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onDelete,
}: {
  engine: TableEngine<R>;
  col: ColumnDef;
  close: (returnFocus?: boolean) => void;
  onHideColumn?: ((columnId: string) => void) | undefined;
  onFreezeColumn?: ((columnId: string) => void) | undefined;
  isFrozen?: boolean | undefined;
  onRenameColumn?: ((columnId: string, newLabel: string) => void) | undefined;
  onChangeType?: ((columnId: string, newType: string) => void) | undefined;
  graphFormat?: 'bar' | 'ring' | 'number' | undefined;
  onChangeGraphFormat?: ((columnId: string, format: 'bar' | 'ring' | 'number') => void) | undefined;
  onToggleWrap?: ((columnId: string) => void) | undefined;
  isWrapped?: boolean | undefined;
  onCalculate?: ((columnId: string, calculation: string) => void) | undefined;
  activeCalculation?: string | undefined;
  onInsertLeft?: ((columnId: string) => void) | undefined;
  onInsertRight?: ((columnId: string) => void) | undefined;
  onDuplicate?: ((columnId: string) => void) | undefined;
  onDelete?: ((columnId: string) => void) | undefined;
}) {
  const type = getColumnType(col.type);
  const sortable = col.sortable !== false;
  const filterable = col.filterable !== false;
  const modes = sortable ? type.sortModes(col) : [];
  const [combine, setCombine] = useState(false);
  const mine = engine.sort.find((c) => c.columnId === col.id);
  const othersSorted = engine.sort.some((c) => c.columnId !== col.id);
  const filter = engine.filters[col.id];

  // Submenús desplegables con puente de hover seguro + anclaje por clic
  const [activeFlyout, setActiveFlyout] = useState<'filter' | 'property' | null>(null);
  const [pinnedFlyout, setPinnedFlyout] = useState<'filter' | 'property' | null>(null);
  const [nestedFlyout, setNestedFlyout] = useState<'type' | 'calc' | 'format' | null>(null);
  const [currentFormat, setCurrentFormat] = useState(graphFormat || 'bar');
  useEffect(() => { if (graphFormat) setCurrentFormat(graphFormat); }, [graphFormat]);
  const [selectedOp, setSelectedOp] = useState<OperatorDef | null>(null);
  const [opVal, setOpVal] = useState('');
  const [opVal2, setOpVal2] = useState('');
  const [propLabel, setPropLabel] = useState(col.label);
  const [isRenaming, setIsRenaming] = useState(false);
  const [wrappedState, setWrappedState] = useState(isWrapped ?? false);
  const [selectedCalc, setSelectedCalc] = useState(activeCalculation ?? '');

  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [nestedPos, setNestedPos] = useState<{ top: number; left: number } | null>(null);

  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const propBtnRef = useRef<HTMLButtonElement>(null);
  const typeBtnRef = useRef<HTMLButtonElement>(null);
  const calcBtnRef = useRef<HTMLButtonElement>(null);
  const formatBtnRef = useRef<HTMLButtonElement>(null);

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nestedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cancelCloseFlyout = (target: 'filter' | 'property') => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveFlyout(target);
  };

  const scheduleCloseFlyout = () => {
    if (pinnedFlyout) return; // Si fue fijado por clic, no se cierra al mover el mouse
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
      setNestedFlyout(null);
      setSelectedOp(null);
    }, 220); // 220ms de gracia para cruzar el mouse sin perder el foco
  };

  const cancelCloseNested = (target: 'type' | 'calc' | 'format') => {
    if (nestedTimerRef.current) {
      clearTimeout(nestedTimerRef.current);
      nestedTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setNestedFlyout(target);
  };

  const scheduleCloseNested = () => {
    if (nestedTimerRef.current) clearTimeout(nestedTimerRef.current);
    nestedTimerRef.current = setTimeout(() => {
      setNestedFlyout(null);
    }, 220);
  };

  useLayoutEffect(() => {
    if (!activeFlyout) {
      setFlyoutPos(null);
      setNestedFlyout(null);
      return;
    }
    const btn = activeFlyout === 'filter' ? filterBtnRef.current : propBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const flyoutW = 240;
    // Solapamiento de 2px para eliminar cualquier espacio muerto entre botones y flyout
    const left = r.right - 2 + flyoutW > vw - 12 ? Math.max(12, r.left - flyoutW + 2) : r.right - 2;
    const top = Math.max(8, Math.min(r.top - 4, vh - 360));
    setFlyoutPos({ top, left });
  }, [activeFlyout, selectedOp]);

  useLayoutEffect(() => {
    if (!nestedFlyout) {
      setNestedPos(null);
      return;
    }
    const btn = nestedFlyout === 'type' ? typeBtnRef.current : nestedFlyout === 'calc' ? calcBtnRef.current : formatBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const flyoutW = 210;
    const left = r.right - 2 + flyoutW > vw - 12 ? Math.max(12, r.left - flyoutW + 2) : r.right - 2;
    const top = Math.max(8, Math.min(r.top - 4, vh - 260));
    setNestedPos({ top, left });
  }, [nestedFlyout]);

  const allOperators = useMemo(() => type.operators(col), [type, col]);

  const options = useMemo(
    () => buildOptions(col, engine.rows as unknown[]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [col, engine.rows]
  );

  const applyFilter = (v: FilterValue | null) => {
    engine.setFilter(col.id, v);
    close();
  };

  const handleOpSelect = (o: OperatorDef) => {
    if (o.inputs === 0) {
      applyFilter({ op: o.id });
    } else {
      setSelectedOp(o);
      setOpVal('');
      setOpVal2('');
    }
  };

  const applyCustomOp = () => {
    if (!selectedOp) return;
    if (selectedOp.inputs === 1 && !opVal.trim()) return;
    if (selectedOp.inputs === 2 && (!opVal.trim() || !opVal2.trim())) return;
    applyFilter({ op: selectedOp.id, value: opVal.trim(), value2: opVal2.trim() });
  };

  const savePropLabel = () => {
    const trimmed = propLabel.trim();
    if (trimmed && trimmed !== col.label) {
      col.label = trimmed;
      onRenameColumn?.(col.id, trimmed);
    }
    setIsRenaming(false);
  };

  const [currentType, setCurrentType] = useState(col.type);
  useEffect(() => { setCurrentType(col.type); }, [col.type]);

  const handleSelectType = (newType: string) => {
    col.type = newType;
    setCurrentType(newType);
    onChangeType?.(col.id, newType);
    setNestedFlyout(null);
  };

  const handleSelectCalc = (calcId: string) => {
    const next = selectedCalc === calcId ? '' : calcId;
    setSelectedCalc(next);
    onCalculate?.(col.id, next);
    setNestedFlyout(null);
  };

  const handleSelectFormat = (fmt: 'bar' | 'ring' | 'number') => {
    setCurrentFormat(fmt);
    onChangeGraphFormat?.(col.id, fmt);
    setNestedFlyout(null);
  };

  const handleToggleWrap = () => {
    const next = !wrappedState;
    setWrappedState(next);
    onToggleWrap?.(col.id);
  };

  const TYPE_OPTIONS = [
    { id: 'text', label: 'Texto', icon: <Type size={12} /> },
    { id: 'number', label: 'Número', icon: <Hash size={12} /> },
    { id: 'percent', label: 'Porcentaje', icon: <Percent size={12} /> },
    { id: 'date', label: 'Fecha', icon: <Calendar size={12} /> },
    { id: 'select', label: 'Selección única', icon: <Tag size={12} /> },
    { id: 'person', label: 'Persona / Responsable', icon: <User size={12} /> },
  ];

  const isNumeric = col.type === 'number' || col.type === 'percent' || col.id === 'duration';
  const CALC_OPTIONS = isNumeric
    ? [
        { id: 'sum', label: 'Suma total' },
        { id: 'avg', label: 'Promedio / Media' },
        { id: 'min', label: 'Valor mínimo' },
        { id: 'max', label: 'Valor máximo' },
        { id: 'range', label: 'Rango (Máx - Mín)' },
        { id: 'count', label: 'Contar todos' },
        { id: 'count_empty', label: 'Contar vacíos' },
      ]
    : [
        { id: 'count', label: 'Contar todos' },
        { id: 'unique', label: 'Contar valores únicos' },
        { id: 'count_empty', label: 'Contar vacíos (Sin asignar)' },
        { id: 'filled_percent', label: '% de registros completos' },
      ];

  return (
    <>
      {/* 1. Opciones de Ordenar (1 sola fila limpia) */}
      {modes.length > 0 && (
        <div className="te-section te-sortlist" role="group" aria-label="Ordenar">
          {modes.map((m) => {
            const active = mine && mine.dir === m.dir && mine.mode === m.mode;
            return (
              <button
                key={`${m.mode}-${m.dir}`}
                type="button"
                className={`te-row-btn ${active ? 'active' : ''}`}
                onClick={(e) => {
                  const additive = combine || e.shiftKey;
                  if (active) engine.removeSort(col.id);
                  else engine.setSort(col.id, m.dir, m.mode, additive);
                  if (!additive) close();
                }}
              >
                {m.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{m.label}</span>
                {active && <Check size={12} className="te-tick" />}
              </button>
            );
          })}
          {othersSorted && (
            <label className="te-check-label te-combine">
              <input type="checkbox" checked={combine} onChange={(e) => setCombine(e.target.checked)} />
              <span>Combinar con otros criterios</span>
            </label>
          )}
        </div>
      )}

      {/* Opción de borrar filtro de la columna si está activo */}
      {isFilterActive(filter) && (
        <button
          type="button"
          className="te-row-btn te-clear-btn"
          onClick={() => applyFilter(null)}
          title={`Borrar filtro de "${col.label}"`}
        >
          <RotateCcw size={12} />
          <span>Borrar filtro de "{col.label}"</span>
        </button>
      )}

      {/* 2. Desplegables con flecha › (Excel + Notion) */}
      <div className="te-sep" />
      <div className="te-section">
        {/* Desplegable de Filtros condicionales tipo Excel */}
        {filterable && allOperators.length > 0 && (
          <div
            className="te-submenu-item"
            onMouseEnter={() => cancelCloseFlyout('filter')}
            onMouseLeave={scheduleCloseFlyout}
          >
            <button
              ref={filterBtnRef}
              type="button"
              className={`te-submenu-trigger ${activeFlyout === 'filter' ? 'open' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (pinnedFlyout === 'filter') {
                  setPinnedFlyout(null);
                  setActiveFlyout(null);
                } else {
                  setPinnedFlyout('filter');
                  setActiveFlyout('filter');
                  setSelectedOp(null);
                  setNestedFlyout(null);
                }
              }}
            >
              <div className="te-submenu-left">
                <Filter size={12} />
                <span>{getFilterSubmenuTitle(col.type)}</span>
              </div>
              <ChevronRight size={13} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        )}

        {/* Desplegable de Configuración de propiedad tipo Notion */}
        <div
          className="te-submenu-item"
          onMouseEnter={() => cancelCloseFlyout('property')}
          onMouseLeave={scheduleCloseFlyout}
        >
          <button
            ref={propBtnRef}
            type="button"
            className={`te-submenu-trigger ${activeFlyout === 'property' ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (pinnedFlyout === 'property') {
                setPinnedFlyout(null);
                setActiveFlyout(null);
              } else {
                setPinnedFlyout('property');
                setActiveFlyout('property');
              }
            }}
          >
            <div className="te-submenu-left">
              <Sliders size={12} />
              <span>Configuración de propiedad</span>
            </div>
            <ChevronRight size={13} style={{ color: '#94a3b8' }} />
          </button>
        </div>
      </div>

      {/* 3. Selector estilo Excel (Buscador + Checkboxes + Aceptar / Cancelar) */}
      <div className="te-sep" />
      {filterable && (
        <SelectionFilter
          col={col}
          options={options}
          value={filter}
          onApply={applyFilter}
          onCancel={() => close(true)}
        />
      )}

      {/* 4. Acciones rápidas de columna estilo Notion al pie */}
      <div className="te-sep" />
      <div className="te-section">
        {onHideColumn && col.id !== 'name' && (
          <button
            type="button"
            className="te-row-btn te-danger-hover"
            onClick={() => {
              onHideColumn(col.id);
              close();
            }}
          >
            <EyeOff size={12} />
            <span>Ocultar columna</span>
          </button>
        )}
        {onFreezeColumn && (
          <button
            type="button"
            className="te-row-btn"
            onClick={() => {
              onFreezeColumn(col.id);
              close();
            }}
          >
            <Pin size={12} />
            <span>Inmovilizar columna</span>
          </button>
        )}
        {engine.sort.length > 0 && (
          <button
            type="button"
            className="te-row-btn"
            onClick={() => {
              engine.clearSort();
              close();
            }}
          >
            <RotateCcw size={12} />
            <span>Limpiar orden</span>
          </button>
        )}
      </div>

      {/* 5. Flyout de Filtros portaleado a document.body */}
      {activeFlyout === 'filter' && flyoutPos && createPortal(
        <div
          className="te-flyout"
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => cancelCloseFlyout('filter')}
          onMouseLeave={scheduleCloseFlyout}
        >
          {selectedOp ? (
            <div className="te-flyout-form">
              <div className="te-flyout-title">{selectedOp.label}</div>
              <input
                type={selectedOp.input === 'number' ? 'number' : selectedOp.input === 'date' ? 'date' : 'text'}
                className="te-field"
                placeholder="Escribe el valor..."
                value={opVal}
                onChange={(e) => setOpVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCustomOp()}
                autoFocus
              />
              {selectedOp.inputs === 2 && (
                <input
                  type={selectedOp.input === 'number' ? 'number' : selectedOp.input === 'date' ? 'date' : 'text'}
                  className="te-field"
                  placeholder="Hasta..."
                  value={opVal2}
                  onChange={(e) => setOpVal2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomOp()}
                />
              )}
              <div className="te-foot-btns" style={{ marginTop: 4 }}>
                <button type="button" className="te-btn" onClick={() => setSelectedOp(null)}>
                  Atrás
                </button>
                <button type="button" className="te-btn te-btn-primary" onClick={applyCustomOp}>
                  Aceptar
                </button>
              </div>
            </div>
          ) : (
            allOperators.map((o) => (
              <button
                key={o.id}
                type="button"
                className="te-flyout-item"
                onClick={() => handleOpSelect(o)}
              >
                <span>{o.label}</span>
                {o.inputs > 0 && <span style={{ color: '#94a3b8', fontSize: 10 }}>...</span>}
              </button>
            ))
          )}
        </div>,
        document.body
      )}

      {/* 6. Flyout completo de Configuración de Propiedad (Notion) portaleado a document.body */}
      {activeFlyout === 'property' && flyoutPos && createPortal(
        <div
          className="te-flyout"
          style={{ top: flyoutPos.top, left: flyoutPos.left, width: 240 }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => cancelCloseFlyout('property')}
          onMouseLeave={scheduleCloseFlyout}
        >
          {/* Cabecera editable con tipo */}
          <div className="te-prop-header">
            <div className="te-prop-title-row">
              <span className="te-prop-icon">{getPropertyIcon(currentType)}</span>
              {isRenaming ? (
                <input
                  type="text"
                  className="te-field te-rename-input"
                  value={propLabel}
                  onChange={(e) => setPropLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') savePropLabel();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                  onBlur={savePropLabel}
                  autoFocus
                />
              ) : (
                <span
                  className="te-prop-name"
                  onClick={() => setIsRenaming(true)}
                  title="Clic para renombrar"
                >
                  {col.label}
                </span>
              )}
            </div>
            <span className="te-prop-type-tag">{getPropertyTypeName(currentType)}</span>
          </div>

          <div className="te-sep" />

          {/* Opciones de Notion */}
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => setIsRenaming(true)}
          >
            <div className="te-submenu-left">
              <Pencil size={12} />
              <span>Renombrar propiedad</span>
            </div>
          </button>

          {/* Cambiar tipo › */}
          <button
            ref={typeBtnRef}
            type="button"
            className={`te-flyout-item ${nestedFlyout === 'type' ? 'open' : ''}`}
            onMouseEnter={() => cancelCloseNested('type')}
            onMouseLeave={scheduleCloseNested}
            onClick={(e) => {
              e.stopPropagation();
              setNestedFlyout((prev) => (prev === 'type' ? null : 'type'));
            }}
          >
            <div className="te-submenu-left">
              <Sliders size={12} />
              <span>Cambiar tipo de dato</span>
            </div>
            <ChevronRight size={12} style={{ color: '#94a3b8' }} />
          </button>

                    {/* Formato de gráfico (solo para porcentaje) › */}
          {(currentType === 'percent' || col.id === 'progress') && (
            <button
              ref={formatBtnRef}
              type="button"
              className={`te-flyout-item ${nestedFlyout === 'format' ? 'open' : ''}`}
              onMouseEnter={() => cancelCloseNested('format')}
              onMouseLeave={scheduleCloseNested}
              onClick={(e) => {
                e.stopPropagation();
                setNestedFlyout((prev) => (prev === 'format' ? null : 'format'));
              }}
            >
              <div className="te-submenu-left">
                <PieChart size={12} />
                <span>Formato de gráfico</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="te-calc-badge">
                  {currentFormat === 'ring' ? 'Circular' : currentFormat === 'number' ? 'Número' : 'Barra'}
                </span>
                <ChevronRight size={12} style={{ color: '#94a3b8' }} />
              </div>
            </button>
          )}

          {/* Calcular al pie › */}
          <button
            ref={calcBtnRef}
            type="button"
            className={`te-flyout-item ${nestedFlyout === 'calc' ? 'open' : ''}`}
            onMouseEnter={() => cancelCloseNested('calc')}
            onMouseLeave={scheduleCloseNested}
            onClick={(e) => {
              e.stopPropagation();
              setNestedFlyout((prev) => (prev === 'calc' ? null : 'calc'));
            }}
          >
            <div className="te-submenu-left">
              <Sigma size={12} />
              <span>Calcular al pie</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {selectedCalc && <span className="te-calc-badge">{selectedCalc}</span>}
              <ChevronRight size={12} style={{ color: '#94a3b8' }} />
            </div>
          </button>

          {/* Ajustar contenido (Wrap text) */}
          <button
            type="button"
            className="te-flyout-item"
            onClick={handleToggleWrap}
          >
            <div className="te-submenu-left">
              <WrapText size={12} />
              <span>Ajustar contenido</span>
            </div>
            {wrappedState && <Check size={12} className="te-tick" />}
          </button>

          {/* Inmovilizar (Freeze) */}
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => {
              onFreezeColumn?.(col.id);
            }}
          >
            <div className="te-submenu-left">
              <Pin size={12} />
              <span>{isFrozen ? 'Desinmovilizar columna' : 'Inmovilizar columna'}</span>
            </div>
            {isFrozen && <Check size={12} className="te-tick" />}
          </button>

          {/* Ocultar */}
          {col.id !== 'name' && (
            <button
              type="button"
              className="te-flyout-item te-danger-hover"
              onClick={() => {
                onHideColumn?.(col.id);
                close();
              }}
            >
              <div className="te-submenu-left">
                <EyeOff size={12} />
                <span>Ocultar columna</span>
              </div>
            </button>
          )}

          <div className="te-sep" />

          {/* Estructurales: Insertar a la izquierda / derecha */}
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => {
              onInsertLeft?.(col.id);
              close();
            }}
          >
            <div className="te-submenu-left">
              <ArrowLeft size={12} />
              <span>Insertar a la izquierda</span>
            </div>
          </button>

          <button
            type="button"
            className="te-flyout-item"
            onClick={() => {
              onInsertRight?.(col.id);
              close();
            }}
          >
            <div className="te-submenu-left">
              <ArrowRight size={12} />
              <span>Insertar a la derecha</span>
            </div>
          </button>

          <button
            type="button"
            className="te-flyout-item"
            onClick={() => {
              onDuplicate?.(col.id);
              close();
            }}
          >
            <div className="te-submenu-left">
              <Copy size={12} />
              <span>Duplicar columna</span>
            </div>
          </button>

          {onDelete && col.id !== 'name' && col.id !== 'code' && (
            <button
              type="button"
              className="te-flyout-item te-danger-hover"
              onClick={() => {
                onDelete(col.id);
                close();
              }}
            >
              <div className="te-submenu-left">
                <Trash2 size={12} />
                <span>Eliminar propiedad</span>
              </div>
            </button>
          )}
        </div>,
        document.body
      )}

            {nestedFlyout === 'format' && nestedPos && createPortal(
        <div
          className="te-nested-flyout"
          style={{ top: nestedPos.top, left: nestedPos.left }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => cancelCloseNested('format')}
          onMouseLeave={scheduleCloseNested}
        >
          <div className="te-flyout-title" style={{ padding: '3px 6px' }}>Estilo de visualización</div>
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => handleSelectFormat('bar')}
          >
            <div className="te-submenu-left">
              <Sliders size={12} />
              <span>Barra horizontal</span>
            </div>
            {(!currentFormat || currentFormat === 'bar') && <Check size={12} className="te-tick" />}
          </button>
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => handleSelectFormat('ring')}
          >
            <div className="te-submenu-left">
              <PieChart size={12} />
              <span>Circular / Anillo</span>
            </div>
            {currentFormat === 'ring' && <Check size={12} className="te-tick" />}
          </button>
          <button
            type="button"
            className="te-flyout-item"
            onClick={() => handleSelectFormat('number')}
          >
            <div className="te-submenu-left">
              <Percent size={12} />
              <span>Solo número (%)</span>
            </div>
            {currentFormat === 'number' && <Check size={12} className="te-tick" />}
          </button>
        </div>,
        document.body
      )}

      {/* 7. Sub-flyouts anidados (Cambiar tipo / Calcular) portaleados a document.body */}
      {nestedFlyout === 'type' && nestedPos && createPortal(
        <div
          className="te-nested-flyout"
          style={{ top: nestedPos.top, left: nestedPos.left }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => cancelCloseNested('type')}
          onMouseLeave={scheduleCloseNested}
        >
          <div className="te-flyout-title" style={{ padding: '3px 6px' }}>Tipos de dato</div>
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="te-flyout-item"
              onClick={() => handleSelectType(t.id)}
            >
              <div className="te-submenu-left">
                {t.icon}
                <span>{t.label}</span>
              </div>
              {currentType === t.id && <Check size={12} className="te-tick" />}
            </button>
          ))}
        </div>,
        document.body
      )}

      {nestedFlyout === 'calc' && nestedPos && createPortal(
        <div
          className="te-nested-flyout"
          style={{ top: nestedPos.top, left: nestedPos.left }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => cancelCloseNested('calc')}
          onMouseLeave={scheduleCloseNested}
        >
          <div className="te-flyout-title" style={{ padding: '3px 6px' }}>Cálculos al pie</div>
          {CALC_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="te-flyout-item"
              onClick={() => handleSelectCalc(c.id)}
            >
              <span>{c.label}</span>
              {selectedCalc === c.id && <Check size={12} className="te-tick" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* ───────────── Encabezado listo para tablas estáticas ───────────── */

export function ColumnHeader<R>({
  engine,
  columnId,
  label,
}: {
  engine: TableEngine<R>;
  columnId: string;
  label?: React.ReactNode;
}) {
  const col = engine.columns.find((c) => c.id === columnId);
  return (
    <span className="te-th">
      <span className="te-th-label">{label ?? col?.label}</span>
      <ColumnHeaderMenu engine={engine} columnId={columnId} />
    </span>
  );
}

/* ───────────── Resumen opcional (no ocupa espacio si no hay nada activo) ───────────── */

export function TableEngineStatus<R>({ engine }: { engine: TableEngine<R> }) {
  if (!engine.hasFilters && engine.sort.length === 0) return null;
  return (
    <div className="te-status" role="status">
      {engine.hasFilters && (
        <>
          <span>
            {engine.activeFilterCount} {engine.activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
          </span>
          <button type="button" onClick={engine.clearAllFilters}>
            Limpiar todos los filtros
          </button>
        </>
      )}
      {engine.sort.length > 0 && (
        <>
          <span>
            Orden:{' '}
            {engine.sort
              .map((c, i) => `${i + 1}. ${engine.columns.find((x) => x.id === c.columnId)?.label ?? c.columnId} ${c.dir === 'asc' ? '↑' : '↓'}`)
              .join('  ')}
          </span>
          <button type="button" onClick={engine.clearSort}>
            Quitar orden
          </button>
        </>
      )}
    </div>
  );
}
