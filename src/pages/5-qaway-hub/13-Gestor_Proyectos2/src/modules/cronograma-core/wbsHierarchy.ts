/**
 * QAWAY LAB · cronograma-core · Motores WBS / EDT — fuente única
 *
 * - `getLinkedTasksSummary`: vincula tareas operativas de /tareas a un nodo WBS.
 * - `computeWbsHierarchy`: clasifica + rollup (avance, fechas, estado) con regla única del core.
 * - `sortWbsHierarchy`: ordenación de la jerarquía (exportada desde edtPmbokModel).
 *
 * [Histórico/legado] Antes de centralizarse existía una copia por vista (cronograma-gantt,
 * tareas-2, reportes-2, reuniones-2) con reglas distintas (SUBCOMPONENTE vs PRODUCTO y O(n²)).
 * Referencia solo histórica: SUBCOMPONENTE no participa en la lógica funcional vigente.
 * Este archivo reemplaza esas copias; sortWbsHierarchy sigue viviendo en edtPmbokModel.
 */

// Re-export del plano de tipos principales para que otros módulos puedan importarlos sin
// levantar runtime de cero. Sólo los tipos (íconos, etiquetas, orden) son tão re-exportados;
// el motor (getLinkedTasksSummary, computeWbsHierarchy) se importa explícitamente cuando lo usa.
export type {
  EdtNodeType,
  Fase,
  PROJECT_PHASES_CATALOG,
  EDT_NODE_LABELS,
  EDT_NODE_ICONS,
  EDT_NODE_ORDER,
  LEGACY_EDT_TYPES,
  DECLARABLE_EDT_TYPES,
  isContainerEdtType,
  normalizeEdtType,
  resolveEdtNodeType,
  getEdtNodeDisplayLabel,
  DRE_JUNIN_DOTACION_2027_EDT,
  compareWbsCodes,
  isLegacyCronogramaItem,
} from './edtPmbokModel';

import type { Item } from './types';
import { resolveEdtNodeType, sortWbsHierarchy } from './edtPmbokModel';

/**
 * Obtiene el resumen de tareas operativas vinculadas a un elemento de la WBS
 * desde el almacén central de tareas del módulo /tareas.
 */
export function getLinkedTasksSummary(
  item: Item,
  rawTasks?: any[]
): { total: number; completed: number; progress: number } | null {
  if (!rawTasks || !Array.isArray(rawTasks) || rawTasks.length === 0) return null;
  const itemLabel = `${item.code ? (item.code.endsWith('.') ? item.code : `${item.code} `) : ''}${item.name}`
    .trim()
    .toLowerCase();
  const itemName = (item.name || '').trim().toLowerCase();
  const itemId = (item.id || '').trim().toLowerCase();
  const itemCode = (item.code || '').trim().toLowerCase();

  const linked = rawTasks.filter((t) => {
    if (!t || !t.milestone || t.milestone === '—' || t.milestone === '-') return false;
    const m = String(t.milestone).trim().toLowerCase();
    if (m === itemLabel || m === itemName || m === itemId) return true;
    if (itemCode && m.startsWith(itemCode)) return true;
    if (m.includes(itemName) || itemName.includes(m)) return true;
    if (t.wbsId && String(t.wbsId).toLowerCase() === itemId) return true;
    if (t.componentId && String(t.componentId).toLowerCase() === itemId) return true;
    return false;
  });

  if (linked.length === 0) return null;

  const completed = linked.filter(
    (t) => t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada'
  ).length;

  const progress = Math.min(100, Math.max(0, Math.round((completed / linked.length) * 100)));
  return { total: linked.length, completed, progress };
}

/**
 * Motor central de gobernanza WBS / EDT conforme al estándar PMI/PMBOK.
 * Devuelve una copia de los items con `wbsNodeType`, avance, fechas y estado recalculados.
 */
export function computeWbsHierarchy(rawItems: Item[], rawTasks?: any[]): Item[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  const items = rawItems.map((it) => ({ ...it }));
  const itemsById = new Map<string, Item>();
  items.forEach((it) => itemsById.set(it.id, it));

  const parentToChildren = new Map<string, Item[]>();
  items.forEach((it) => {
    if (it.parentId) {
      if (!parentToChildren.has(it.parentId)) parentToChildren.set(it.parentId, []);
      parentToChildren.get(it.parentId)!.push(it);
    }
  });

  // Clasificación de tipología de nodo (regla única del core) y avance en hojas
  items.forEach((it) => {
    const hasChildren = parentToChildren.has(it.id) && parentToChildren.get(it.id)!.length > 0;
    it.wbsNodeType = resolveEdtNodeType(it, items);

    if (!hasChildren) {
      const summary = getLinkedTasksSummary(it, rawTasks);
      if (summary) {
        it.progress = summary.progress;
      }
    }
  });

  // Cálculo de profundidad para procesamiento bottom-up estricto
  const depthMap = new Map<string, number>();
  const getDepth = (id: string): number => {
    if (depthMap.has(id)) return depthMap.get(id)!;
    const item = itemsById.get(id);
    if (!item || !item.parentId) {
      depthMap.set(id, 0);
      return 0;
    }
    const d = 1 + getDepth(item.parentId);
    depthMap.set(id, d);
    return d;
  };
  items.forEach((it) => getDepth(it.id));

  // Contenedores de mayor profundidad a menor (hojas intermedias primero, luego raíces)
  const containers = items
    .filter((it) => parentToChildren.has(it.id) && parentToChildren.get(it.id)!.length > 0)
    .sort((a, b) => (depthMap.get(b.id) || 0) - (depthMap.get(a.id) || 0));

  // Rollup de avance, fechas y estado en contenedores
  containers.forEach((parent) => {
    const children = parentToChildren.get(parent.id) ?? [];
    if (children.length > 0) {
      const totalProgress = children.reduce(
        (sum, c) => sum + (typeof c.progress === 'number' ? c.progress : 0),
        0
      );
      parent.progress = Math.min(100, Math.max(0, Math.round(totalProgress / children.length)));

      const validStarts = children
        .map((c) => c.start)
        .filter((s): s is string => !!s && /^\d{4}-\d{2}-\d{2}/.test(s))
        .sort();
      const validEnds = children
        .map((c) => c.end)
        .filter((e): e is string => !!e && /^\d{4}-\d{2}-\d{2}/.test(e))
        .sort();
      if (validStarts.length > 0) parent.start = validStarts[0] ?? parent.start;
      if (validEnds.length > 0) parent.end = validEnds[validEnds.length - 1] ?? parent.end;

      if (parent.progress === 100) {
        parent.status = 'Completado';
      } else if (children.some((c) => c.status === 'Con retraso')) {
        parent.status = 'Con retraso';
      } else if (parent.progress > 0) {
        parent.status = 'En proceso';
      } else {
        parent.status = 'Pendiente';
      }
    }
  });

  return items;
}

// Re-export de ordenación y tipo de nodo para compatibilidad con shims y drawers.
export { sortWbsHierarchy } from './edtPmbokModel';
export type { WbsNodeType } from './types';
