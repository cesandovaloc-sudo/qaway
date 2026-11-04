import { getColumnType } from './columnTypes';
import type { ColumnDef, EngineContext, FilterState, Hierarchy, SortCriterion } from './types';

/* ───────────── Filtrado ───────────── */

export const isFilterActive = (f: FilterState[string] | undefined) => {
  if (!f) return false;
  const type = f.values !== undefined;
  return type ? (f.values as string[]).length > 0 : !!f.op;
};

export function filterRows<R>(
  rows: R[],
  columns: ColumnDef<R>[],
  filters: FilterState,
  ctx: EngineContext,
  hierarchy?: Hierarchy<R>
): R[] {
  const active = columns.filter((c) => isFilterActive(filters[c.id]));
  if (!active.length) return rows;

  const prepared = active.map((c) => ({ col: c, type: getColumnType(c.type), f: filters[c.id] }));
  // Entre columnas: AND. Dentro de una columna: la lógica OR/exclusión vive en el tipo.
  const matches = (row: R) =>
    prepared.every(({ col, type, f }) => type.test(col.accessor(row), f, ctx, col as ColumnDef));

  if (!hierarchy) return rows.filter(matches);

  // Con jerarquía: se conservan los ancestros de cada coincidencia como contexto.
  const byId = new Map<string, R>();
  rows.forEach((r) => byId.set(hierarchy.getId(r), r));
  const keep = new Set<string>();
  rows.forEach((r) => {
    if (!matches(r)) return;
    let cur: R | undefined = r;
    const guard = new Set<string>();
    while (cur) {
      const id = hierarchy.getId(cur);
      if (guard.has(id)) break;
      guard.add(id);
      keep.add(id);
      const pid = hierarchy.getParentId(cur);
      cur = pid ? byId.get(pid) : undefined;
    }
  });
  return rows.filter((r) => keep.has(hierarchy.getId(r)));
}

/* ───────────── Ordenamiento ───────────── */

type Key = string | number | null;

const cmpWbs = (a: any, b: any): number => {
  const codeA = a?.code;
  const codeB = b?.code;
  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;
  const segsA = String(codeA).replace(/\.$/, '').split('.');
  const segsB = String(codeB).replace(/\.$/, '').split('.');
  const len = Math.max(segsA.length, segsB.length);
  for (let i = 0; i < len; i++) {
    const sA = segsA[i];
    const sB = segsB[i];
    if (sA === undefined) return -1;
    if (sB === undefined) return 1;
    const matchA = sA.match(/^(\d+)(.*)$/);
    const matchB = sB.match(/^(\d+)(.*)$/);
    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      if (numA !== numB) return numA - numB;
      const suffComp = matchA[2].localeCompare(matchB[2]);
      if (suffComp !== 0) return suffComp;
    } else {
      const cmp = sA.localeCompare(sB, undefined, { numeric: true });
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
};

const cmpKeys = (a: Key, b: Key, dir: 1 | -1): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1; // vacíos siempre al final
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;
  return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' }) * dir;
};

export function sortRows<R>(
  rows: R[],
  columns: ColumnDef<R>[],
  criteria: SortCriterion[],
  hierarchy?: Hierarchy<R>
): R[] {
  const usable = criteria
    .map((c) => ({ c, col: columns.find((x) => x.id === c.columnId) }))
    .filter((x): x is { c: SortCriterion; col: ColumnDef<R> } => !!x.col);

  // Si no hay criterios de ordenamiento seleccionados por el usuario
  if (!usable.length) {
    if (!hierarchy || rows.length < 2) return rows;
    // Con jerarquía activa: organizar canónicamente árbol WBS (padres e hijos anidados)
    const ids = new Set(rows.map((r) => hierarchy.getId(r)));
    const children = new Map<string, R[]>();
    const roots: R[] = [];
    rows.forEach((r) => {
      const pid = hierarchy.getParentId(r);
      if (pid && ids.has(pid)) {
        const list = children.get(pid) ?? [];
        list.push(r);
        children.set(pid, list);
      } else roots.push(r);
    });

    const out: R[] = [];
    const seen = new Set<string>();
    const walk = (list: R[]) => {
      [...list].sort(cmpWbs).forEach((r) => {
        const id = hierarchy.getId(r);
        if (seen.has(id)) return;
        seen.add(id);
        out.push(r);
        const kids = children.get(id);
        if (kids) walk(kids);
      });
    };
    walk(roots);
    return out.length === rows.length ? out : rows;
  }

  if (rows.length < 2) return rows;

  // Claves precalculadas una sola vez por fila (n log n con comparación barata).
  const keys = new Map<R, Key[]>();
  rows.forEach((r) =>
    keys.set(
      r,
      usable.map(({ c, col }) => getColumnType(col.type).sortKey(col.accessor(r), col as ColumnDef, c.mode))
    )
  );

  const compare = (a: R, b: R) => {
    const ka = keys.get(a) as Key[];
    const kb = keys.get(b) as Key[];
    for (let i = 0; i < usable.length; i++) {
      const r = cmpKeys(ka[i], kb[i], usable[i].c.dir === 'asc' ? 1 : -1);
      if (r !== 0) return r;
    }
    return cmpWbs(a, b);
  };

  if (!hierarchy) return [...rows].sort(compare);

  // Con jerarquía: se ordenan hermanos entre sí y cada hijo queda bajo su padre.
  const ids = new Set(rows.map((r) => hierarchy.getId(r)));
  const children = new Map<string, R[]>();
  const roots: R[] = [];
  rows.forEach((r) => {
    const pid = hierarchy.getParentId(r);
    if (pid && ids.has(pid)) {
      const list = children.get(pid) ?? [];
      list.push(r);
      children.set(pid, list);
    } else roots.push(r);
  });

  const out: R[] = [];
  const seen = new Set<string>();
  const walk = (list: R[]) => {
    [...list].sort(compare).forEach((r) => {
      const id = hierarchy.getId(r);
      if (seen.has(id)) return;
      seen.add(id);
      out.push(r);
      const kids = children.get(id);
      if (kids) walk(kids);
    });
  };
  walk(roots);
  return out.length === rows.length ? out : rows;
}
