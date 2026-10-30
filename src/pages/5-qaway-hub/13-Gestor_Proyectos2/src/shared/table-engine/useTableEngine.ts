import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterRows, isFilterActive, sortRows } from './engine';
import type {
  ColumnDef,
  FilterState,
  FilterValue,
  Hierarchy,
  SortCriterion,
  SortDir,
} from './types';

export interface TableEngineOptions<R> {
  /** Identificador único de la tabla (persistencia por tabla). */
  tableId: string;
  columns: ColumnDef<R>[];
  /** Filas completas (para valores únicos y conteos del selector). */
  rows: R[];
  /** Fecha de referencia ISO para filtros relativos. */
  today?: string;
  hierarchy?: Hierarchy<R>;
  persist?: boolean;
}

export interface TableEngine<R = any> {
  tableId: string;
  columns: ColumnDef<R>[];
  rows: R[];
  today: string;
  filters: FilterState;
  sort: SortCriterion[];
  hasFilters: boolean;
  activeFilterCount: number;
  setFilter: (columnId: string, value: FilterValue | null) => void;
  clearFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  setSort: (columnId: string, dir: SortDir, mode: SortCriterion['mode'], additive?: boolean) => void;
  removeSort: (columnId: string) => void;
  moveSort: (columnId: string, delta: -1 | 1) => void;
  clearSort: () => void;
  filter: (rows: R[]) => R[];
  sortRows: (rows: R[]) => R[];
  apply: (rows: R[]) => R[];
  isFiltered: (columnId: string) => boolean;
  sortIndex: (columnId: string) => number;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const storageKey = (id: string) => `qaway-table-engine-v1:${id}`;

const load = (id: string): { filters: FilterState; sort: SortCriterion[] } => {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(id)) || 'null');
    if (raw && typeof raw === 'object') {
      return {
        filters: raw.filters && typeof raw.filters === 'object' ? raw.filters : {},
        sort: Array.isArray(raw.sort) ? raw.sort : [],
      };
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return { filters: {}, sort: [] };
};

export function useTableEngine<R>(opts: TableEngineOptions<R>): TableEngine<R> {
  const { tableId, columns, rows, hierarchy, persist = true } = opts;
  const today = opts.today || todayIso();

  const [state, setState] = useState(() => (persist ? load(tableId) : { filters: {}, sort: [] }));

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey(tableId), JSON.stringify(state));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [state, tableId, persist]);

  const setFilter = useCallback((columnId: string, value: FilterValue | null) => {
    setState((s) => {
      const filters = { ...s.filters };
      if (!value || !isFilterActive(value)) delete filters[columnId];
      else filters[columnId] = value;
      return { ...s, filters };
    });
  }, []);

  const clearFilter = useCallback((columnId: string) => setFilter(columnId, null), [setFilter]);
  const clearAllFilters = useCallback(() => setState((s) => ({ ...s, filters: {} })), []);

  const setSort = useCallback(
    (columnId: string, dir: SortDir, mode: SortCriterion['mode'], additive = false) => {
      setState((s) => {
        const next: SortCriterion = { columnId, dir, mode };
        const idx = s.sort.findIndex((c) => c.columnId === columnId);
        if (additive) {
          const sort = [...s.sort];
          if (idx >= 0) sort[idx] = next;
          else sort.push(next);
          return { ...s, sort };
        }
        return { ...s, sort: [next] };
      });
    },
    []
  );

  const removeSort = useCallback(
    (columnId: string) => setState((s) => ({ ...s, sort: s.sort.filter((c) => c.columnId !== columnId) })),
    []
  );

  const moveSort = useCallback((columnId: string, delta: -1 | 1) => {
    setState((s) => {
      const i = s.sort.findIndex((c) => c.columnId === columnId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= s.sort.length) return s;
      const sort = [...s.sort];
      [sort[i], sort[j]] = [sort[j], sort[i]];
      return { ...s, sort };
    });
  }, []);

  const clearSort = useCallback(() => setState((s) => ({ ...s, sort: [] })), []);

  const ctx = useMemo(() => ({ today }), [today]);

  const filter = useCallback(
    (input: R[]) => filterRows(input, columns, state.filters, ctx, hierarchy),
    [columns, state.filters, ctx, hierarchy]
  );
  const sortFn = useCallback(
    (input: R[]) => sortRows(input, columns, state.sort, hierarchy),
    [columns, state.sort, hierarchy]
  );
  const apply = useCallback((input: R[]) => sortFn(filter(input)), [filter, sortFn]);

  const activeFilterCount = useMemo(
    () => columns.filter((c) => isFilterActive(state.filters[c.id])).length,
    [columns, state.filters]
  );

  return {
    tableId,
    columns,
    rows,
    today,
    filters: state.filters,
    sort: state.sort,
    hasFilters: activeFilterCount > 0,
    activeFilterCount,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSort,
    removeSort,
    moveSort,
    clearSort,
    filter,
    sortRows: sortFn,
    apply,
    isFiltered: (id: string) => isFilterActive(state.filters[id]),
    sortIndex: (id: string) => state.sort.findIndex((c) => c.columnId === id),
  };
}
