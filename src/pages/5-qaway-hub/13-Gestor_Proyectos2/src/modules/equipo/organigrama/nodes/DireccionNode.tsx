import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Crown, Users, Layers, MapPin } from 'lucide-react';
import type { OrganigramaFlowNodeData } from '../types/organigrama.types';
import { NodeCollapseButton } from './NodeCollapseButton';

type DireccionFlowNode = Node<OrganigramaFlowNodeData, 'direccion'>;

export const DireccionNode: React.FC<NodeProps<DireccionFlowNode>> = React.memo(({ data }) => {
  const { raw, isSelected, isHighlighted, isDimmed, isCollapsed, hasChildren, hiddenDescendantCount, layoutDirection, onToggleCollapse } = data;
  const isHorizontal = layoutDirection === 'LR';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        border: isSelected || isHighlighted ? '2px solid #38bdf8' : '1.5px solid #334155',
        boxShadow:
          isSelected || isHighlighted
            ? '0 0 0 4px rgba(56, 189, 248, 0.22), 0 12px 24px rgba(15, 23, 42, 0.24)'
            : '0 8px 20px rgba(15, 23, 42, 0.16)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isDimmed ? 0.35 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box',
      }}
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ opacity: 0, width: 8, height: 8, pointerEvents: 'none' }}
      />

      {/* Top row: badge + code */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.14)',
            padding: '2px 8px',
            borderRadius: '999px',
          }}
        >
          <Crown size={11} />
          Dirección Central
        </span>
        {raw.code && (
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', fontFamily: 'monospace' }}>
            {raw.code}
          </span>
        )}
      </div>

      {/* Title & Lead */}
      <div>
        <div
          style={{
            fontSize: '13.5px',
            fontWeight: 750,
            color: '#ffffff',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {raw.title}
        </div>
        <div
          style={{
            fontSize: '11.5px',
            color: '#cbd5e1',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Resp.: <strong style={{ color: '#f8fafc', fontWeight: 600 }}>{raw.leadName || 'Por designar'}</strong>
        </div>
      </div>

      {/* Footer metrics */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '7px',
          borderTop: '1px solid rgba(148, 163, 184, 0.22)',
          fontSize: '10.5px',
          color: '#cbd5e1',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} color="#38bdf8" />
          {raw.locationLabel || 'Sede Central'}
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <Layers size={11} color="#93c5fd" />
            {raw.subTeamCount ?? 0} unid.
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <Users size={11} color="#93c5fd" />
            {raw.memberCount ?? 0}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        style={{ background: '#38bdf8', border: '2px solid #0f172a', width: 8, height: 8 }}
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

DireccionNode.displayName = 'DireccionNode';
