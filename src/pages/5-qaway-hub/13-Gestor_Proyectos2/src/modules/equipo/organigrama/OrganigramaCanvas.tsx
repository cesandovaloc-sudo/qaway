import React, { useEffect } from 'react';
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useOnViewportChange,
  useReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type NodeMouseHandler,
} from '@xyflow/react';
import type {
  OrganigramaFlowEdgeData,
  OrganigramaFlowNodeData,
} from './types/organigrama.types';
import { DireccionNode } from './nodes/DireccionNode';
import { UnidadNode } from './nodes/UnidadNode';
import { EquipoNode } from './nodes/EquipoNode';
import { IntegranteNode } from './nodes/IntegranteNode';
import { OrganigramaEdge } from './edges/OrganigramaEdge';
import { OrganigramaMinimap } from './OrganigramaMinimap';
import { getNodeDimensions } from './services/organigramaLayout';

const NODE_TYPES = {
  direccion: DireccionNode,
  unidad: UnidadNode,
  equipo: EquipoNode,
  frente: EquipoNode,
  integrante: IntegranteNode,
} as const;

const EDGE_TYPES = {
  organigrama: OrganigramaEdge,
} as const;

export interface OrganigramaCanvasActions {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  centerStructure: () => void;
}

interface OrganigramaCanvasProps {
  nodes: Node<OrganigramaFlowNodeData>[];
  edges: Edge<OrganigramaFlowEdgeData>[];
  onNodesChange: (changes: NodeChange<Node<OrganigramaFlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<OrganigramaFlowEdgeData>>[]) => void;
  onSelectNode: (nodeId: string | null) => void;
  onZoomPercentChange: (pct: number) => void;
  pendingFocusNodeId: string | null;
  onClearPendingFocus: () => void;
  onRegisterActions: (actions: OrganigramaCanvasActions) => void;
}

export const OrganigramaCanvas: React.FC<OrganigramaCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSelectNode,
  onZoomPercentChange,
  pendingFocusNodeId,
  onClearPendingFocus,
  onRegisterActions,
}) => {
  const { zoomIn, zoomOut, fitView, setCenter, getNode } = useReactFlow<
    Node<OrganigramaFlowNodeData>,
    Edge<OrganigramaFlowEdgeData>
  >();

  useOnViewportChange({
    onChange: (viewport) => {
      onZoomPercentChange(Math.round(viewport.zoom * 100));
    },
  });

  useEffect(() => {
    onRegisterActions({
      zoomIn: () => zoomIn({ duration: 180 }),
      zoomOut: () => zoomOut({ duration: 180 }),
      fitView: () => fitView({ padding: 0.16, duration: 280 }),
      centerStructure: () => fitView({ padding: 0.22, maxZoom: 1, duration: 280 }),
    });
  }, [zoomIn, zoomOut, fitView, onRegisterActions]);

  // Centra suavemente el nodo buscado una vez que Dagre haya calculado su posición visible
  useEffect(() => {
    if (!pendingFocusNodeId) return;
    const targetNode = getNode(pendingFocusNodeId);
    if (!targetNode) return;

    const dims = getNodeDimensions(targetNode.data.raw.kind);
    const centerX = targetNode.position.x + dims.width / 2;
    const centerY = targetNode.position.y + dims.height / 2;

    setCenter(centerX, centerY, { zoom: 1.02, duration: 360 });
    onClearPendingFocus();
  }, [pendingFocusNodeId, nodes, getNode, setCenter, onClearPendingFocus]);

  const handleNodeClick: NodeMouseHandler<Node<OrganigramaFlowNodeData>> = (_event, node) => {
    onSelectNode(node.id);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '460px', flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => onSelectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
        minZoom={0.25}
        maxZoom={1.85}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        selectionOnDrag={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#cbd5e1" />
        <OrganigramaMinimap />
      </ReactFlow>

      {/* Leyenda flotante compacta de conectores */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #e2e8f0',
          borderRadius: '9px',
          padding: '7px 11px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          fontSize: '10.5px',
          color: '#334155',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '16px', height: '2px', background: '#1e293b', display: 'inline-block' }} />
          Jerarquía
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '16px', height: '2px', background: '#0284c7', display: 'inline-block' }} />
          Pertenencia
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '16px', borderTop: '2px dashed #0d9488', display: 'inline-block' }} />
          Frente
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '16px', borderTop: '2px dotted #7c3aed', display: 'inline-block' }} />
          Colaboración
        </span>
      </div>
    </div>
  );
};
