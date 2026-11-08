import {
  EMPTY_TOKEN,
  type ColumnDef,
  type ColumnTypeDef,
  type ColumnOption,
  type EngineContext,
  type FilterValue,
  type OperatorDef,
  type SortModeDef,
} from './types';
import { DATE_PRESETS, normIso, presetRange, type DatePreset } from './dateUtils';

/* ───────────── Normalizadores ───────────── */

export const toTokens = (raw: unknown): string[] => {
  if (raw === null || raw === undefined || raw === '') return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v ?? '').trim()).filter(Boolean);
  const s = String(raw).trim();
  return s ? [s] : [];
};

export const toNum = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const toText = (raw: unknown) => (Array.isArray(raw) ? raw.join(' ') : String(raw ?? '')).trim();

export const toRange = (raw: unknown): [string | null, string | null] => {
  if (Array.isArray(raw)) return [normIso(raw[0]), normIso(raw[1])];
  if (raw && typeof raw === 'object') {
    const r = raw as { start?: unknown; end?: unknown };
    return [normIso(r.start), normIso(r.end)];
  }
  return [null, null];
};

export const staticOptions = (col: ColumnDef): ColumnOption[] =>
  Array.isArray(col.options) ? col.options : [];

/** Posición de un valor en el orden personalizado de la columna. */
export const customRank = (value: string, col: ColumnDef): number => {
  if (col.sortOrder) {
    const i = col.sortOrder.indexOf(value);
    return i >= 0 ? i : col.sortOrder.length + 1;
  }
  const opts = staticOptions(col);
  const opt = opts.find((o) => o.value === value);
  if (opt && opt.order !== undefined) return opt.order;
  const i = opts.findIndex((o) => o.value === value);
  return i >= 0 ? i : opts.length + 1;
};

export const hasCustomOrder = (col: ColumnDef) =>
  col.type !== 'person' && (
    !!col.sortOrder?.length ||
    staticOptions(col).some((o) => o.order !== undefined) ||
    (col.type === 'processState' && staticOptions(col).length > 0)
  );

const labelOf = (value: string, col: ColumnDef) =>
  staticOptions(col).find((o) => o.value === value)?.label ?? value;

/* ───────────── Operadores ───────────── */

const op = (id: string, label: string, inputs: 0 | 1 | 2 = 0, input?: OperatorDef['input']): OperatorDef => ({
  id,
  label,
  inputs,
  ...(input !== undefined ? { input } : {}),
});

const TEXT_OPS: OperatorDef[] = [
  op('contains', 'Contiene', 1, 'text'),
  op('not_contains', 'No contiene', 1, 'text'),
  op('eq', 'Es igual a', 1, 'text'),
  op('neq', 'No es igual a', 1, 'text'),
  op('starts', 'Comienza con', 1, 'text'),
  op('ends', 'Termina con', 1, 'text'),
  op('empty', 'Está vacío'),
  op('not_empty', 'No está vacío'),
];

const NUMBER_OPS: OperatorDef[] = [
  op('eq', 'Igual a', 1, 'number'),
  op('neq', 'Diferente de', 1, 'number'),
  op('gt', 'Mayor que', 1, 'number'),
  op('gte', 'Mayor o igual que', 1, 'number'),
  op('lt', 'Menor que', 1, 'number'),
  op('lte', 'Menor o igual que', 1, 'number'),
  op('between', 'Entre', 2, 'number'),
  op('not_between', 'No está entre', 2, 'number'),
  op('empty', 'Vacío'),
  op('not_empty', 'No vacío'),
];

const PERCENT_OPS: OperatorDef[] = [
  op('eq', 'Igual a (%)', 1, 'number'),
  op('gt', 'Mayor que (%)', 1, 'number'),
  op('lt', 'Menor que (%)', 1, 'number'),
  op('between', 'Entre dos porcentajes', 2, 'number'),
  op('zero', 'Igual a 0 %'),
  op('full', 'Igual a 100 %'),
  op('with_progress', 'Con avance'),
  op('no_progress', 'Sin avance'),
];

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  tomorrow: 'Mañana',
  this_week: 'Esta semana',
  last_week: 'Semana pasada',
  this_month: 'Este mes',
  last_month: 'Mes pasado',
  this_quarter: 'Este trimestre',
  this_year: 'Este año',
};

const DATE_OPS: OperatorDef[] = [
  op('eq', 'Es igual a', 1, 'date'),
  op('before', 'Es anterior a', 1, 'date'),
  op('after', 'Es posterior a', 1, 'date'),
  op('between', 'Está entre', 2, 'date'),
  op('not_between', 'No está entre', 2, 'date'),
  ...DATE_PRESETS.map((p) => op(p, DATE_PRESET_LABELS[p])),
  op('empty', 'Está vacío'),
  op('not_empty', 'No está vacío'),
];

const BOOL_OPS: OperatorDef[] = [
  op('is_true', 'Sí / Activo / Validado'),
  op('is_false', 'No / Inactivo / No validado'),
  op('empty', 'Sin valor'),
];

const SELECTION_OPS: OperatorDef[] = [op('in', 'Incluir valores'), op('not_in', 'Excluir valores')];

/* ───────────── Pruebas de coincidencia ───────────── */

const testText = (raw: unknown, f: FilterValue) => {
  if (f.values !== undefined) return testSelection(raw, f);
  const v = toText(raw).toLowerCase();
  const q = (f.value ?? '').trim().toLowerCase();
  switch (f.op) {
    case 'contains': return v.includes(q);
    case 'not_contains': return !v.includes(q);
    case 'eq': return v === q;
    case 'neq': return v !== q;
    case 'starts': return v.startsWith(q);
    case 'ends': return v.endsWith(q);
    case 'empty': return v === '';
    case 'not_empty': return v !== '';
    default: return true;
  }
};

const testNumber = (raw: unknown, f: FilterValue, percent = false) => {
  const n = toNum(raw);
  if (f.op === 'empty') return n === null;
  if (f.op === 'not_empty') return n !== null;
  if (percent) {
    if (f.op === 'with_progress') return n !== null && n > 0;
    if (f.op === 'no_progress') return n === null || n <= 0;
    if (f.op === 'zero') return (n ?? 0) === 0;
    if (f.op === 'full') return n !== null && n >= 100;
  }
  if (n === null) return false;
  const a = toNum(f.value);
  const b = toNum(f.value2);
  if (a === null) return true;
  switch (f.op) {
    case 'eq': return n === a;
    case 'neq': return n !== a;
    case 'gt': return n > a;
    case 'gte': return n >= a;
    case 'lt': return n < a;
    case 'lte': return n <= a;
    case 'between':
    case 'not_between': {
      if (b === null) return true;
      const inside = n >= Math.min(a, b) && n <= Math.max(a, b);
      return f.op === 'between' ? inside : !inside;
    }
    default: return true;
  }
};

const resolveBounds = (f: FilterValue, ctx: EngineContext): [string | null, string | null] | null => {
  if ((DATE_PRESETS as string[]).includes(f.op)) return presetRange(f.op as DatePreset, ctx.today);
  if (f.op === 'between' || f.op === 'not_between') {
    const a = normIso(f.value);
    const b = normIso(f.value2);
    if (!a || !b) return null;
    return a <= b ? [a, b] : [b, a];
  }
  return null;
};

const testDate = (raw: unknown, f: FilterValue, ctx: EngineContext) => {
  if (f.values !== undefined) return testSelection(raw, f);
  const d = normIso(raw);
  if (f.op === 'empty') return d === null;
  if (f.op === 'not_empty') return d !== null;
  if (d === null) return false;
  const v = normIso(f.value);
  if (f.op === 'eq') return v ? d === v : true;
  if (f.op === 'before') return v ? d < v : true;
  if (f.op === 'after') return v ? d > v : true;
  const bounds = resolveBounds(f, ctx);
  if (!bounds) return true;
  const inside = d >= (bounds[0] as string) && d <= (bounds[1] as string);
  return f.op === 'not_between' ? !inside : inside;
};

const testDateRange = (raw: unknown, f: FilterValue, ctx: EngineContext) => {
  if (f.values !== undefined) return testSelection(raw, f);
  const [s, e] = toRange(raw);
  if (f.op === 'empty') return !s && !e;
  if (f.op === 'not_empty') return !!s || !!e;
  if (!s && !e) return false;
  const start = s ?? (e as string);
  const end = e ?? (s as string);
  const v = normIso(f.value);
  if (f.op === 'eq') return v ? start <= v && v <= end : true;
  if (f.op === 'before') return v ? end < v : true;
  if (f.op === 'after') return v ? start > v : true;
  const bounds = resolveBounds(f, ctx);
  if (!bounds) return true;
  const overlaps = start <= (bounds[1] as string) && end >= (bounds[0] as string);
  return f.op === 'not_between' ? !overlaps : overlaps;
};

const testSelection = (raw: unknown, f: FilterValue) => {
  const set = new Set(f.values ?? []);
  if (set.size === 0) return true;
  const tokens = toTokens(raw);
  const effective = tokens.length ? tokens : [EMPTY_TOKEN];
  const hit = effective.some((t) => set.has(t));
  return f.op === 'not_in' ? !hit : hit;
};

const testBoolean = (raw: unknown, f: FilterValue) => {
  if (f.values !== undefined) return testSelection(raw, f);
  const isEmpty = raw === null || raw === undefined || raw === '';
  if (f.op === 'empty') return isEmpty;
  const truthy = raw === true || raw === 'true' || raw === 'Sí' || raw === 'Si' || raw === 1 || raw === '1';
  if (f.op === 'is_true') return !isEmpty && truthy;
  if (f.op === 'is_false') return !isEmpty && !truthy;
  return true;
};

/* ───────────── Modos de orden ───────────── */

const pick = (col: ColumnDef, key: 'asc' | 'desc' | 'customAsc' | 'customDesc', fallback: string) =>
  col.sortLabels?.[key] ?? fallback;

const scalarModes = (asc: string, desc: string) => (col: ColumnDef): SortModeDef[] => [
  { mode: 'natural', dir: 'asc', label: pick(col, 'asc', asc) },
  { mode: 'natural', dir: 'desc', label: pick(col, 'desc', desc) },
];

const selectionModes = (customAsc: string, customDesc: string) => (col: ColumnDef): SortModeDef[] => {
  const modes: SortModeDef[] = [];
  if (hasCustomOrder(col)) {
    modes.push({ mode: 'custom', dir: 'asc', label: pick(col, 'customAsc', customAsc) });
    modes.push({ mode: 'custom', dir: 'desc', label: pick(col, 'customDesc', customDesc) });
  }
  modes.push({ mode: 'alpha', dir: 'asc', label: pick(col, 'asc', 'De A a Z') });
  modes.push({ mode: 'alpha', dir: 'desc', label: pick(col, 'desc', 'De Z a A') });
  return modes;
};

const selectionKey = (raw: unknown, col: ColumnDef, mode: string): string | number | null => {
  const tokens = toTokens(raw);
  if (!tokens.length) return null;
  if (mode === 'custom') return Math.min(...tokens.map((t) => customRank(t, col)));
  return tokens.map((t) => labelOf(t, col)).sort((a, b) => a.localeCompare(b, 'es')).join(', ');
};

/* ───────────── Tipos ───────────── */

const filterOpsOf = (all: OperatorDef[]) => (col: ColumnDef) =>
  col.filterOps ? all.filter((o) => col.filterOps!.includes(o.id)) : all;

const textType: ColumnTypeDef = {
  id: 'text',
  kind: 'text',
  operators: filterOpsOf(TEXT_OPS),
  test: (raw, f) => testText(raw, f),
  sortModes: scalarModes('De A a Z', 'De Z a A'),
  sortKey: (raw) => {
    const s = toText(raw);
    return s ? s : null;
  },
};

const numberType: ColumnTypeDef = {
  id: 'number',
  kind: 'number',
  operators: filterOpsOf(NUMBER_OPS),
  test: (raw, f) => testNumber(raw, f),
  sortModes: scalarModes('De menor a mayor', 'De mayor a menor'),
  sortKey: (raw) => toNum(raw),
};

const percentType: ColumnTypeDef = {
  id: 'percent',
  kind: 'percent',
  operators: filterOpsOf(PERCENT_OPS),
  test: (raw, f) => testNumber(raw, f, true),
  sortModes: scalarModes('De menor a mayor avance', 'De mayor a menor avance'),
  sortKey: (raw) => toNum(raw),
};

const dateType: ColumnTypeDef = {
  id: 'date',
  kind: 'date',
  operators: filterOpsOf(DATE_OPS),
  test: testDate,
  sortModes: scalarModes('Más antiguos a más recientes', 'Más recientes a más antiguos'),
  sortKey: (raw) => normIso(raw),
};

const dateRangeType: ColumnTypeDef = {
  id: 'dateRange',
  kind: 'dateRange',
  operators: filterOpsOf(DATE_OPS),
  test: testDateRange,
  sortModes: scalarModes('Inicio más antiguo primero', 'Inicio más reciente primero'),
  sortKey: (raw) => toRange(raw)[0] ?? toRange(raw)[1],
};

const booleanType: ColumnTypeDef = {
  id: 'boolean',
  kind: 'boolean',
  operators: filterOpsOf(BOOL_OPS),
  test: (raw, f) => testBoolean(raw, f),
  sortModes: scalarModes('No a Sí', 'Sí a No'),
  sortKey: (raw) => {
    if (raw === null || raw === undefined || raw === '') return null;
    return raw === true || raw === 'true' || raw === 'Sí' || raw === 1 ? 1 : 0;
  },
};

const selectionType = (id: string, customAsc: string, customDesc: string): ColumnTypeDef => ({
  id,
  kind: 'selection',
  operators: () => SELECTION_OPS,
  test: (raw, f) => testSelection(raw, f),
  sortModes: selectionModes(customAsc, customDesc),
  sortKey: selectionKey,
});

/* ───────────── Registro extensible ───────────── */

const registry = new Map<string, ColumnTypeDef>();

export const registerColumnType = (def: ColumnTypeDef) => {
  registry.set(def.id, def);
};

[
  textType,
  numberType,
  percentType,
  dateType,
  dateRangeType,
  booleanType,
  selectionType('select', 'Según jerarquía definida', 'Jerarquía inversa'),
  selectionType('multiSelect', 'Según orden definido', 'Orden definido inverso'),
  selectionType('person', 'De A a Z', 'De Z a A'),
  selectionType('relation', 'Según orden definido', 'Orden definido inverso'),
  selectionType('processState', 'Según flujo de proceso', 'Flujo de proceso inverso'),
].forEach(registerColumnType);

export const getColumnType = (id: string): ColumnTypeDef => registry.get(id) ?? textType;
