import type {
  OrganigramaDataset,
  OrganigramaRawEdge,
  OrganigramaRawNode,
  OrganigramaRepresentationMode,
} from '../types/organigrama.types';

export interface TransformedGraph {
  visibleNodes: OrganigramaRawNode[];
  visibleEdges: OrganigramaRawEdge[];
  hasChildrenMap: Map<string, boolean>;
  hiddenDescendantsMap: Map<string, number>;
  parentMap: Map<string, string>;
}

/**
 * Filtra y proyecta el dataset en función del modo de representación y ramas expandidas/contraídas.
 */
export function buildVisibleOrganigramaGraph(
  dataset: OrganigramaDataset,
  mode: OrganigramaRepresentationMode,
  collapsedIds: Set<string>,
  showCrossLinks: boolean
): TransformedGraph {
  // 1. Filtrar nodos permitidos por modo de representación
  const allowedNodes = dataset.nodes.filter((node) => {
    if (mode === 'estructura') {
      return node.kind === 'direccion' || node.kind === 'unidad' || node.kind === 'equipo' || node.kind === 'integrante';
    }
    if (mode === 'frentes') {
      return node.kind === 'direccion' || node.kind === 'unidad' || node.kind === 'equipo' || node.kind === 'frente' || node.kind === 'integrante';
    }
    return true;
  });

  const allowedNodeSet = new Set(allowedNodes.map((n) => n.id));
  const nodeById = new Map(allowedNodes.map((n) => [n.id, n]));

  // 2. Construir mapa padre -> hijos según aristas primarias reales
  const primaryEdges = dataset.edges.filter(
    (e) => e.isPrimaryHierarchy && allowedNodeSet.has(e.source) && allowedNodeSet.has(e.target)
  );

  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const edge of primaryEdges) {
    const list = childrenMap.get(edge.source) ?? [];
    list.push(edge.target);
    childrenMap.set(edge.source, list);
    if (!parentMap.has(edge.target)) {
      parentMap.set(edge.target, edge.source);
    }
  }

  // Contar descendientes totales para badges cuando un nodo está colapsado
  const countDescendants = (id: string, visited = new Set<string>()): number => {
    if (visited.has(id)) return 0;
    visited.add(id);
    const children = childrenMap.get(id) ?? [];
    let count = children.length;
    for (const childId of children) {
      count += countDescendants(childId, visited);
    }
    return count;
  };

  const hasChildrenMap = new Map<string, boolean>();
  const hiddenDescendantsMap = new Map<string, number>();

  for (const node of allowedNodes) {
    const children = childrenMap.get(node.id) ?? [];
    hasChildrenMap.set(node.id, children.length > 0);
    if (collapsedIds.has(node.id) && children.length > 0) {
      hiddenDescendantsMap.set(node.id, countDescendants(node.id));
    } else {
      hiddenDescendantsMap.set(node.id, 0);
    }
  }

  // 3. Recorrido BFS desde raíces para ocultar descendientes de nodos contraídos
  const roots = allowedNodes.filter((n) => !parentMap.has(n.id));
  const visibleSet = new Set<string>();
  const queue: string[] = roots.map((r) => r.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visibleSet.has(currentId)) continue;
    visibleSet.add(currentId);

    if (!collapsedIds.has(currentId)) {
      const children = childrenMap.get(currentId) ?? [];
      for (const childId of children) {
        if (!visibleSet.has(childId)) {
          queue.push(childId);
        }
      }
    }
  }

  const visibleNodes = Array.from(visibleSet)
    .map((id) => nodeById.get(id))
    .filter((n): n is OrganigramaRawNode => Boolean(n));

  // 4. Seleccionar aristas visibles según modo de representación
  const visibleEdges = dataset.edges.filter((edge) => {
    if (!visibleSet.has(edge.source) || !visibleSet.has(edge.target)) return false;
    if (edge.isPrimaryHierarchy) return true;
    if (mode === 'colaborativa') {
      return edge.relationKind === 'colaboracion' || edge.relationKind === 'asignacion_frente';
    }
    if (mode === 'frentes') {
      return edge.relationKind === 'asignacion_frente';
    }
    return showCrossLinks;
  });

  return {
    visibleNodes,
    visibleEdges,
    hasChildrenMap,
    hiddenDescendantsMap,
    parentMap,
  };
}

/**
 * Obtiene toda la ruta de ancestros de un nodo (para expandir ramas al buscar en nodos colapsados).
 */
export function getNodeAncestorIds(nodeId: string, edges: OrganigramaRawEdge[]): string[] {
  const parentByChild = new Map<string, string>();
  for (const edge of edges) {
    if (edge.isPrimaryHierarchy && !parentByChild.has(edge.target)) {
      parentByChild.set(edge.target, edge.source);
    }
  }

  const ancestors: string[] = [];
  const visited = new Set<string>([nodeId]);
  let current = parentByChild.get(nodeId);

  while (current && !visited.has(current)) {
    visited.add(current);
    ancestors.push(current);
    current = parentByChild.get(current);
  }

  return ancestors;
}

/**
 * Obtiene ancestros + descendientes directos para resaltar la línea jerárquica del nodo activo.
 */
export function getHierarchicalLineageIds(nodeId: string, edges: OrganigramaRawEdge[]): Set<string> {
  const lineage = new Set<string>([nodeId]);
  const ancestors = getNodeAncestorIds(nodeId, edges);
  ancestors.forEach((id) => lineage.add(id));

  for (const edge of edges) {
    if (edge.source === nodeId || edge.target === nodeId) {
      lineage.add(edge.source);
      lineage.add(edge.target);
    }
  }

  return lineage;
}
