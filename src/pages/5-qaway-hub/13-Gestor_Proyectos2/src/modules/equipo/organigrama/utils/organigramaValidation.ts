import type { OrganigramaDataset } from '../types/organigrama.types';

export interface OrganigramaIntegrityReport {
  totalNodes: number;
  totalPrimaryEdges: number;
  totalSecondaryEdges: number;
  orphanNodesCount: number;
  cyclesCount: number;
  missingLeadCount: number;
}

/**
 * Evalúa integridad estructural del grafo sin inventar ni reparar relaciones automáticamente.
 */
export function validateOrganigramaDataset(dataset: OrganigramaDataset): OrganigramaIntegrityReport {
  const nodeIds = new Set(dataset.nodes.map((n) => n.id));
  const primaryEdges = dataset.edges.filter((e) => e.isPrimaryHierarchy);
  const secondaryEdges = dataset.edges.filter((e) => !e.isPrimaryHierarchy);

  const targetHasPrimaryParent = new Set(
    primaryEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.target)
  );

  // Nodos sin padre primario (excluyendo nodos de nivel raíz 'direccion')
  const orphanNodesCount = dataset.nodes.filter(
    (n) => n.kind !== 'direccion' && !targetHasPrimaryParent.has(n.id)
  ).length;

  // Detección de ciclos en aristas primarias
  const adjacency = new Map<string, string[]>();
  for (const edge of primaryEdges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  let cyclesCount = 0;
  const state = new Map<string, 'visiting' | 'visited'>();

  const dfs = (id: string) => {
    state.set(id, 'visiting');
    const neighbors = adjacency.get(id) ?? [];
    for (const next of neighbors) {
      const nextState = state.get(next);
      if (nextState === 'visiting') {
        cyclesCount++;
      } else if (!nextState) {
        dfs(next);
      }
    }
    state.set(id, 'visited');
  };

  for (const node of dataset.nodes) {
    if (!state.has(node.id)) {
      dfs(node.id);
    }
  }

  const missingLeadCount = dataset.nodes.filter(
    (n) => n.kind !== 'integrante' && !n.leadName
  ).length;

  return {
    totalNodes: dataset.nodes.length,
    totalPrimaryEdges: primaryEdges.length,
    totalSecondaryEdges: secondaryEdges.length,
    orphanNodesCount,
    cyclesCount,
    missingLeadCount,
  };
}
