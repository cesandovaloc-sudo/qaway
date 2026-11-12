import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  OrganigramaDataset,
  OrganigramaFlowEdgeData,
  OrganigramaFlowNodeData,
  OrganigramaLayoutDirection,
  OrganigramaRawNode,
  OrganigramaRepresentationMode,
} from '../types/organigrama.types';
import { getOrganigramaDemoDataset } from '../data/organigramaDemoData';
import { validateOrganigramaDataset } from '../utils/organigramaValidation';
import {
  buildVisibleOrganigramaGraph,
  getHierarchicalLineageIds,
  getNodeAncestorIds,
} from '../services/organigramaTransform';
import { applyDagreLayout } from '../services/organigramaLayout';

export function useOrganigrama(externalDataset?: OrganigramaDataset) {
  const dataset = useMemo(
    () => externalDataset ?? getOrganigramaDemoDataset(),
    [externalDataset]
  );

  const [mode, setMode] = useState<OrganigramaRepresentationMode>('completa');
  const [direction, setDirection] = useState<OrganigramaLayoutDirection>('TB');
  const [showCrossLinks, setShowCrossLinks] = useState<boolean>(true);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutVersion, setLayoutVersion] = useState<number>(0);

  const integrity = useMemo(() => validateOrganigramaDataset(dataset), [dataset]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseToUnits = useCallback(() => {
    const unitAndTeamIds = dataset.nodes
      .filter((n) => n.kind === 'unidad' || n.kind === 'equipo' || n.kind === 'frente')
      .map((n) => n.id);
    setCollapsedIds(new Set(unitAndTeamIds));
  }, [dataset.nodes]);

  const forceRelayout = useCallback(() => {
    setLayoutVersion((v) => v + 1);
  }, []);

  // Búsqueda transversal sobre TODO el dataset (incluyendo ramas contraídas)
  const searchMatches = useMemo<OrganigramaRawNode[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return dataset.nodes.filter((n) => {
      const haystack = [
        n.title,
        n.subtitle,
        n.code,
        n.leadName,
        n.unitName,
        n.locationLabel,
        n.integrante?.cargo,
        n.integrante?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [dataset.nodes, searchQuery]);

  const searchMatchIdSet = useMemo(
    () => new Set(searchMatches.map((m) => m.id)),
    [searchMatches]
  );

  const activeLineageSet = useMemo(() => {
    if (!selectedNodeId) return null;
    return getHierarchicalLineageIds(selectedNodeId, dataset.edges);
  }, [selectedNodeId, dataset.edges]);

  const transformed = useMemo(
    () => buildVisibleOrganigramaGraph(dataset, mode, collapsedIds, showCrossLinks),
    [dataset, mode, collapsedIds, showCrossLinks]
  );

  // Construir grafo posicionado por Dagre
  const computedLayout = useMemo(() => {
    const primaryEdgeIds = new Set(
      transformed.visibleEdges.filter((e) => e.isPrimaryHierarchy).map((e) => e.id)
    );

    const rawFlowNodes: Node<OrganigramaFlowNodeData>[] = transformed.visibleNodes.map((raw) => {
      const isSelected = selectedNodeId === raw.id;
      const isSearchHit = searchMatchIdSet.has(raw.id);
      const inLineage = activeLineageSet ? activeLineageSet.has(raw.id) : true;
      const isDimmed =
        (Boolean(activeLineageSet) && !inLineage) ||
        (searchMatches.length > 0 && !isSearchHit && !isSelected);

      return {
        id: raw.id,
        type: raw.kind,
        position: { x: 0, y: 0 },
        draggable: true,
        selectable: true,
        data: {
          raw,
          isSelected,
          isHighlighted: isSelected || isSearchHit,
          isDimmed,
          isCollapsed: collapsedIds.has(raw.id),
          hasChildren: transformed.hasChildrenMap.get(raw.id) ?? false,
          hiddenDescendantCount: transformed.hiddenDescendantsMap.get(raw.id) ?? 0,
          layoutDirection: direction,
          onToggleCollapse: toggleCollapse,
        },
      };
    });

    const rawFlowEdges: Edge<OrganigramaFlowEdgeData>[] = transformed.visibleEdges.map((e) => {
      const isHighlighted = Boolean(
        selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId)
      );
      const isDimmed = Boolean(
        activeLineageSet && !(activeLineageSet.has(e.source) && activeLineageSet.has(e.target))
      );

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'organigrama',
        animated: e.relationKind === 'colaboracion' && isHighlighted,
        data: {
          relationKind: e.relationKind,
          label: e.label,
          isHighlighted,
          isDimmed,
        },
      };
    });

    return applyDagreLayout(rawFlowNodes, rawFlowEdges, primaryEdgeIds, direction);
  }, [
    transformed,
    selectedNodeId,
    searchMatchIdSet,
    searchMatches.length,
    activeLineageSet,
    collapsedIds,
    direction,
    toggleCollapse,
    layoutVersion,
  ]);

  const [nodes, setNodes] = useState<Node<OrganigramaFlowNodeData>[]>(computedLayout.nodes);
  const [edges, setEdges] = useState<Edge<OrganigramaFlowEdgeData>[]>(computedLayout.edges);

  useEffect(() => {
    setNodes(computedLayout.nodes);
    setEdges(computedLayout.edges);
  }, [computedLayout]);

  // Nota: onNodesChange solo modifica posiciones visuales temporales en pantalla; jamás modifica datos reales.
  const onNodesChange = useCallback(
    (changes: NodeChange<Node<OrganigramaFlowNodeData>>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<OrganigramaFlowEdgeData>>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Al localizar un nodo en búsqueda (aunque esté en rama contraída), expande sus ancestros y lo selecciona.
  const revealAndSelectNode = useCallback(
    (nodeId: string) => {
      const ancestors = getNodeAncestorIds(nodeId, dataset.edges);
      if (ancestors.length > 0) {
        setCollapsedIds((prev) => {
          const next = new Set(prev);
          ancestors.forEach((aId) => next.delete(aId));
          return next;
        });
      }
      setSelectedNodeId(nodeId);
    },
    [dataset.edges]
  );

  const selectedNode = useMemo(
    () => dataset.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [dataset.nodes, selectedNodeId]
  );

  const selectedConnections = useMemo(() => {
    if (!selectedNodeId) return { incoming: [], outgoing: [] };
    const nodeMap = new Map(dataset.nodes.map((n) => [n.id, n]));
    const incoming = dataset.edges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => ({ edge: e, peer: nodeMap.get(e.source) }))
      .filter((x): x is { edge: typeof x.edge; peer: OrganigramaRawNode } => Boolean(x.peer));
    const outgoing = dataset.edges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => ({ edge: e, peer: nodeMap.get(e.target) }))
      .filter((x): x is { edge: typeof x.edge; peer: OrganigramaRawNode } => Boolean(x.peer));
    return { incoming, outgoing };
  }, [dataset.edges, dataset.nodes, selectedNodeId]);

  return {
    dataset,
    integrity,
    mode,
    setMode,
    direction,
    setDirection,
    showCrossLinks,
    setShowCrossLinks,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedConnections,
    searchQuery,
    setSearchQuery,
    searchMatches,
    expandAll,
    collapseToUnits,
    forceRelayout,
    revealAndSelectNode,
    visibleCount: transformed.visibleNodes.length,
    totalCount: dataset.nodes.length,
  };
}
