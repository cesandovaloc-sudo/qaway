import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
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
  counts.forEach((_, value) => {
    if (!known.has(value)) extra.push({ value, label: value });
  });
  extra.sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' }));

  let list = [...base, ...extra];
  const withBase = { ...col, options: base } as ColumnDef;
  if (base.length && hasCustomOrder(withBase)) {
    list = [...list].sort((a, b) => customRank(a.value, withBase) - customRank(b.value, withBase));
  } else if (!base.length) {
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
const VIEW_H = 196;

interface SelectionFilterProps {
  col: ColumnDef;
  options: CountedOption[];
  value?: FilterValue;
  onApply: (v: FilterValue | null) => void;
  onCancel: () => void;
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({ col, options, value, onApply, onCancel }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'in' | 'not_in'>(value?.op === 'not_in' ? 'not_in' : 'in');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(value?.values ?? []));
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
      {col.type === 'processState' && options.length > 0 && (
        <div className="te-quick" role="group" aria-label="Filtros rápidos de estado">
          {options
            .filter((o) => o.value !== EMPTY_TOKEN)
            .map((o) => (
              <button
                key={o.value}
                type="button"
                className="te-chip"
                onClick={() => onApply({ op: 'in', values: [o.value] })}
              >
                Solo {o.label.toLowerCase()}
              </button>
            ))}
          <button type="button" className="te-chip te-chip-all" onClick={() => onApply(null)}>
            Mostrar todos
          </button>
        </div>
      )}

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
          {selected.size} de {options.length} seleccionados
        </span>
        <div className="te-foot-btns">
          <button type="button" className="te-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="te-btn te-btn-primary" onClick={apply}>
            Aplicar
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
  value?: FilterValue;
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
      {quick.length > 0 && (
        <div className="te-quick" role="group" aria-label="Filtros rápidos">
          {quick.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`te-chip ${value?.op === o.id ? 'on' : ''}`}
              onClick={() => onApply({ op: o.id })}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

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
}

const MENU_W = 272;

export function ColumnHeaderMenu<R>({
  engine,
  columnId,
  buttonClassName = 'te-trigger',
  iconSize = 11,
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
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
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
            <MenuBody engine={engine} col={col} close={close} />
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
}: {
  engine: TableEngine<R>;
  col: ColumnDef;
  close: (returnFocus?: boolean) => void;
}) {
  const type = getColumnType(col.type);
  const sortable = col.sortable !== false;
  const filterable = col.filterable !== false;
  const modes = sortable ? type.sortModes(col) : [];
  const [combine, setCombine] = useState(false);
  const mine = engine.sort.find((c) => c.columnId === col.id);
  const othersSorted = engine.sort.some((c) => c.columnId !== col.id);
  const filter = engine.filters[col.id];

  const options = useMemo(
    () => (type.kind === 'selection' ? buildOptions(col, engine.rows as unknown[]) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [col, engine.rows, type.kind]
  );

  const applyFilter = (v: FilterValue | null) => {
    engine.setFilter(col.id, v);
    close();
  };

  return (
    <>
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

      {engine.sort.length > 1 && (
        <div className="te-section te-criteria" role="group" aria-label="Prioridad de ordenamiento">
          {engine.sort.map((c, i) => {
            const cc = engine.columns.find((x) => x.id === c.columnId);
            return (
              <div key={c.columnId} className="te-crit">
                <b>{i + 1}</b>
                <span className="te-crit-name">{cc?.label ?? c.columnId}</span>
                {c.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                <button type="button" disabled={i === 0} onClick={() => engine.moveSort(c.columnId, -1)} aria-label="Subir prioridad">
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  disabled={i === engine.sort.length - 1}
                  onClick={() => engine.moveSort(c.columnId, 1)}
                  aria-label="Bajar prioridad"
                >
                  <ChevronDown size={12} />
                </button>
                <button type="button" onClick={() => engine.removeSort(c.columnId)} aria-label="Quitar criterio">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filterable && modes.length > 0 && <div className="te-sep" />}

      {filterable &&
        (type.kind === 'selection' ? (
          <SelectionFilter
            col={col}
            options={options}
            value={filter}
            onApply={applyFilter}
            onCancel={() => close(true)}
          />
        ) : (
          <ConditionFilter col={col} value={filter} onApply={applyFilter} />
        ))}

      {(isFilterActive(filter) || engine.sort.length > 0) && (
        <div className="te-section te-clears">
          {isFilterActive(filter) && (
            <button type="button" className="te-clear" onClick={() => applyFilter(null)}>
              Limpiar filtro
            </button>
          )}
          {engine.sort.length > 0 && (
            <button
              type="button"
              className="te-clear"
              onClick={() => {
                engine.clearSort();
                close();
              }}
            >
              Limpiar orden
            </button>
          )}
        </div>
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
