import dagre from '@dagrejs/dagre';
import { Position, type Edge, type Node } from '@xyflow/react';
import type {
  OrganigramaFlowEdgeData,
  OrganigramaFlowNodeData,
  OrganigramaLayoutDirection,
  OrganigramaNodeKind,
} from '../types/organigrama.types';

export function getNodeDimensions(kind: OrganigramaNodeKind): { width: number; height: number } {
  switch (kind) {
    case 'direccion':
      return { width: 296, height: 124 };
    case 'unidad':
      return { width: 280, height: 118 };
    case 'equipo':
    case 'frente':
      return { width: 268, height: 112 };
    case 'integrante':
    default:
      return { width: 264, height: 106 };
  }
}

/**
 * Calcula posiciones automáticas (x, y) mediante Dagre evitando superposiciones.
 * Utiliza exclusivamente las aristas primarias de jerarquía para mantener niveles ordenados;
 * las aristas secundarias/colaborativas se preservan sin deformar los rangos del árbol.
 */
export function applyDagreLayout(
  nodes: Node<OrganigramaFlowNodeData>[],
  edges: Edge<OrganigramaFlowEdgeData>[],
  primaryEdgeIds: Set<string>,
  direction: OrganigramaLayoutDirection = 'TB'
): {
  nodes: Node<OrganigramaFlowNodeData>[];
  edges: Edge<OrganigramaFlowEdgeData>[];
} {
  if (nodes.length === 0) {
    return { nodes: [], edges };
  }

  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';

  graph.setGraph({
    rankdir: direction,
    align: undefined,
    nodesep: isHorizontal ? 38 : 44,
    ranksep: isHorizontal ? 96 : 82,
    edgesep: 24,
    marginx: 32,
    marginy: 32,
  });

  for (const node of nodes) {
    const dims = getNodeDimensions(node.data.raw.kind);
    graph.setNode(node.id, { width: dims.width, height: dims.height });
  }

  for (const edge of edges) {
    if (primaryEdgeIds.has(edge.id) && graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  const positionedNodes = nodes.map((node) => {
    const dims = getNodeDimensions(node.data.raw.kind);
    const pos = graph.node(node.id);
    const x = pos ? pos.x - dims.width / 2 : 0;
    const y = pos ? pos.y - dims.height / 2 : 0;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x, y },
      style: {
        width: dims.width,
        height: dims.height,
      },
    };
  });

  return {
    nodes: positionedNodes,
    edges,
  };
}
