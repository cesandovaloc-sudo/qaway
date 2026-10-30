/**
 * Sistema universal de columnas, filtros y ordenamiento.
 * Cada columna se DEFINE (tipo + parámetros) y el motor deduce filtros, orden y controles.
 */

export type ColumnTypeId =
  | 'text'
  | 'select'
  | 'multiSelect'
  | 'person'
  | 'date'
  | 'dateRange'
  | 'number'
  | 'percent'
  | 'processState'
  | 'relation'
  | 'boolean'
  | (string & {});

export interface ColumnOption {
  value: string;
  label: string;
  /** Posición en el orden personalizado (menor = primero). */
  order?: number;
}

export type SortDir = 'asc' | 'desc';

export interface ColumnDef<R = any> {
  id: string;
  label: string;
  type: ColumnTypeId;
  /** Valor crudo de la fila. Para multivalor devolver string[]; para rango de fechas { start, end } o [start, end]. */
  accessor: (row: R) => unknown;
  /** Opciones fijas o calculadas. Si se omiten, se derivan de los valores únicos de las filas. */
  options?: ColumnOption[] | ((rows: R[]) => ColumnOption[]);
  /** Orden personalizado (lista de valores de mayor a menor jerarquía). */
  sortOrder?: string[];
  /** Etiquetas de orden específicas de la columna. */
  sortLabels?: Partial<Record<'asc' | 'desc' | 'customAsc' | 'customDesc', string>>;
  sortable?: boolean;
  filterable?: boolean;
  /** Restringe los operadores disponibles del tipo. */
  filterOps?: string[];
  /** Etiqueta del grupo de vacíos (ej. "Sin asignar"). */
  emptyLabel?: string;
}

export interface FilterValue {
  op: string;
  /** Selección: valores elegidos (token EMPTY_TOKEN = vacío). */
  values?: string[];
  value?: string;
  value2?: string;
}

export type FilterState = Record<string, FilterValue>;

export interface SortCriterion {
  columnId: string;
  dir: SortDir;
  mode: 'alpha' | 'custom' | 'natural';
}

export interface EngineContext {
  /** Fecha de referencia ISO (YYYY-MM-DD) para filtros relativos. */
  today: string;
}

export interface Hierarchy<R> {
  getId: (row: R) => string;
  getParentId: (row: R) => string | undefined | null;
}

export type FilterKind = 'text' | 'number' | 'percent' | 'date' | 'dateRange' | 'selection' | 'boolean';

export interface OperatorDef {
  id: string;
  label: string;
  inputs: 0 | 1 | 2;
  input?: 'text' | 'number' | 'date';
}

export interface SortModeDef {
  mode: SortCriterion['mode'];
  dir: SortDir;
  label: string;
}

export interface ColumnTypeDef {
  id: string;
  kind: FilterKind;
  operators: (col: ColumnDef) => OperatorDef[];
  test: (raw: unknown, f: FilterValue, ctx: EngineContext, col: ColumnDef) => boolean;
  sortModes: (col: ColumnDef) => SortModeDef[];
  /** Clave comparable (null = vacío, siempre al final). */
  sortKey: (raw: unknown, col: ColumnDef, mode: SortCriterion['mode']) => string | number | null;
}

export const EMPTY_TOKEN = '__empty__';
