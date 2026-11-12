import { describe, expect, it } from 'vitest';
import { getOrganigramaDemoDataset } from './data/organigramaDemoData';
import { validateOrganigramaDataset } from './utils/organigramaValidation';
import {
  buildVisibleOrganigramaGraph,
  getHierarchicalLineageIds,
  getNodeAncestorIds,
} from './services/organigramaTransform';
import { applyDagreLayout, getNodeDimensions } from './services/organigramaLayout';
import type { Edge, Node } from '@xyflow/react';
import type { OrganigramaFlowEdgeData, OrganigramaFlowNodeData } from './types/organigrama.types';

describe('Organigrama React Flow + Dagre (Módulo Equipo)', () => {
  it('mantiene neutralidad institucional y datos ficticios coherentes sin ciclos ni huérfanos', () => {
    const dataset = getOrganigramaDemoDataset();
    expect(dataset.isDemo).toBe(true);
    expect(dataset.nodes.length).toBeGreaterThanOrEqual(14);

    const serialized = JSON.stringify(dataset).toLowerCase();
    expect(serialized).not.toContain('minedu');
    expect(serialized).not.toContain('ugel');
    expect(serialized).not.toMatch(/\bdre\b/);

    const report = validateOrganigramaDataset(dataset);
    expect(report.cyclesCount).toBe(0);
    expect(report.orphanNodesCount).toBe(0);
    expect(report.missingLeadCount).toBe(0);
  });

  it('detecta ciclos y nodos huérfanos cuando se evalúa un dataset con inconsistencias', () => {
    const base = getOrganigramaDemoDataset();
    const broken = {
      ...base,
      edges: [
        ...base.edges,
        {
          id: 'edge-cycle-test',
          source: 'node-int-06',
          target: 'node-unit-ops',
          relationKind: 'jerarquia' as const,
          isPrimaryHierarchy: true,
        },
      ],
    };

    const report = validateOrganigramaDataset(broken);
    expect(report.cyclesCount).toBeGreaterThan(0);
  });

  it('contrae ramas y recupera la ruta jerárquica completa para expandir al buscar', () => {
    const dataset = getOrganigramaDemoDataset();
    const collapsed = new Set<string>(['node-unit-ops']);

    const graphCollapsed = buildVisibleOrganigramaGraph(dataset, 'completa', collapsed, true);
    const visibleIds = new Set(graphCollapsed.visibleNodes.map((n) => n.id));
    expect(visibleIds.has('node-unit-ops')).toBe(true);
    expect(visibleIds.has('node-team-norte')).toBe(false);
    expect(visibleIds.has('node-int-06')).toBe(false);
    expect(graphCollapsed.hiddenDescendantsMap.get('node-unit-ops')).toBeGreaterThan(0);

    // Simular búsqueda de 'node-int-06' estando su rama contraída
    const ancestors = getNodeAncestorIds('node-int-06', dataset.edges);
    expect(ancestors).toContain('node-unit-ops');
    expect(ancestors).toContain('node-team-norte');

    const lineage = getHierarchicalLineageIds('node-int-06', dataset.edges);
    expect(lineage.has('node-int-05')).toBe(true);
    expect(lineage.has('node-coord-central')).toBe(true);
  });

  it('posiciona todos los nodos con Dagre sin superposiciones en orientación Vertical (TB) y Horizontal (LR)', () => {
    const dataset = getOrganigramaDemoDataset();
    const transformed = buildVisibleOrganigramaGraph(dataset, 'completa', new Set(), true);
    const primaryEdgeIds = new Set(
      transformed.visibleEdges.filter((e) => e.isPrimaryHierarchy).map((e) => e.id)
    );

    const buildFlowNodes = (dir: 'TB' | 'LR'): Node<OrganigramaFlowNodeData>[] =>
      transformed.visibleNodes.map((raw) => ({
        id: raw.id,
        type: raw.kind,
        position: { x: 0, y: 0 },
        data: {
          raw,
          isSelected: false,
          isHighlighted: false,
          isDimmed: false,
          isCollapsed: false,
          hasChildren: transformed.hasChildrenMap.get(raw.id) ?? false,
          hiddenDescendantCount: 0,
          layoutDirection: dir,
          onToggleCollapse: () => {},
        },
      }));

    const flowEdges: Edge<OrganigramaFlowEdgeData>[] = transformed.visibleEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'organigrama',
      data: {
        relationKind: e.relationKind,
        label: e.label,
        isHighlighted: false,
        isDimmed: false,
      },
    }));

    for (const dir of ['TB', 'LR'] as const) {
      const laidOut = applyDagreLayout(buildFlowNodes(dir), flowEdges, primaryEdgeIds, dir);
      expect(laidOut.nodes.length).toBe(transformed.visibleNodes.length);

      // Comprobar que ningún par de tarjetas se superpone geométricamente
      for (let i = 0; i < laidOut.nodes.length; i++) {
        const a = laidOut.nodes[i];
        if (!a) continue;
        for (let j = i + 1; j < laidOut.nodes.length; j++) {
          const b = laidOut.nodes[j];
          if (!b) continue;
          const dimA = getNodeDimensions(a.data.raw.kind);
          const dimB = getNodeDimensions(b.data.raw.kind);

          const overlapX = a.position.x < b.position.x + dimB.width && a.position.x + dimA.width > b.position.x;
          const overlapY = a.position.y < b.position.y + dimB.height && a.position.y + dimA.height > b.position.y;
          expect(overlapX && overlapY).toBe(false);
        }
      }
    }
  });
});
