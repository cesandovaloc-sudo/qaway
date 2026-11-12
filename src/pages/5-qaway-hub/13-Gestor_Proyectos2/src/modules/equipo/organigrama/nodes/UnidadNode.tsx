import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Building2, Users, Layers } from 'lucide-react';
import type { OrganigramaFlowNodeData } from '../types/organigrama.types';
import { NodeCollapseButton } from './NodeCollapseButton';

type UnidadFlowNode = Node<OrganigramaFlowNodeData, 'unidad'>;

export const UnidadNode: React.FC<NodeProps<UnidadFlowNode>> = React.memo(({ data }) => {
  const { raw, isSelected, isHighlighted, isDimmed, isCollapsed, hasChildren, hiddenDescendantCount, layoutDirection, onToggleCollapse } = data;
  const isHorizontal = layoutDirection === 'LR';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '11px',
        background: '#ffffff',
        border: isSelected || isHighlighted ? '2px solid #0066ff' : '1px solid #cbd5e1',
        borderLeft: isSelected || isHighlighted ? '4px solid #0066ff' : '4px solid #0284c7',
        boxShadow:
          isSelected || isHighlighted
            ? '0 0 0 4px rgba(0, 102, 255, 0.14), 0 10px 22px rgba(15, 23, 42, 0.1)'
            : '0 4px 12px rgba(15, 23, 42, 0.06)',
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isDimmed ? 0.32 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box',
      }}
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ background: '#0284c7', border: '2px solid #ffffff', width: 8, height: 8 }}
      />

      {/* Cabecera: Badge de Unidad + Estado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#0369a1',
            background: '#e0f2fe',
            padding: '2px 7px',
            borderRadius: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          <Building2 size={11} />
          Unidad {raw.code ? `· ${raw.code}` : ''}
        </span>

        {raw.operationalStatus && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: raw.operationalStatus === 'En despliegue' ? '#0284c7' : '#15803d',
              background: raw.operationalStatus === 'En despliegue' ? '#eff6ff' : '#dcfce7',
              padding: '2px 7px',
              borderRadius: '999px',
            }}
          >
            {raw.operationalStatus}
          </span>
        )}
      </div>

      {/* Nombre de unidad y responsable */}
      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={raw.title}
        >
          {raw.title}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#64748b',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Responsable: <span style={{ color: '#334155', fontWeight: 600 }}>{raw.leadName || 'Sin asignar'}</span>
        </div>
      </div>

      {/* Pie con conteo de equipos e integrantes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '7px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '10.5px',
          color: '#475569',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <Layers size={11} color="#0284c7" />
          {raw.subTeamCount ?? 0} equipos
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 650,
            color: '#0f172a',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '5px',
            padding: '1px 6px',
          }}
        >
          <Users size={11} color="#0066ff" />
          {raw.memberCount ?? 0} integrantes
        </span>
      </div>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        style={{ background: '#0284c7', border: '2px solid #ffffff', width: 8, height: 8 }}
      />

      <NodeCollapseButton
        nodeId={raw.id}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        hiddenDescendantCount={hiddenDescendantCount}
        layoutDirection={layoutDirection}
        onToggleCollapse={onToggleCollapse}
      />
    </div>
  );
});

UnidadNode.displayName = 'UnidadNode';
