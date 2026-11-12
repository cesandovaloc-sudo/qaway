import React from 'react';
import { MiniMap } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import type { OrganigramaFlowNodeData } from './types/organigrama.types';

export const OrganigramaMinimap: React.FC = React.memo(() => {
  return (
    <MiniMap<Node<OrganigramaFlowNodeData>>
      pannable
      zoomable
      position="bottom-left"
      nodeColor={(node) => {
        const kind = node.data?.raw?.kind;
        switch (kind) {
          case 'direccion':
            return '#0f172a';
          case 'unidad':
            return '#0284c7';
          case 'equipo':
            return '#2563eb';
          case 'frente':
            return '#0d9488';
          case 'integrante':
          default:
            return '#94a3b8';
        }
      }}
      maskColor="rgba(15, 23, 42, 0.08)"
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
      }}
    />
  );
});

OrganigramaMinimap.displayName = 'OrganigramaMinimap';
