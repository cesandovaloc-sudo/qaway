import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Users, Compass, MapPin } from 'lucide-react';
import type { OrganigramaFlowNodeData } from '../types/organigrama.types';
import { NodeCollapseButton } from './NodeCollapseButton';

type EquipoFlowNode = Node<OrganigramaFlowNodeData, 'equipo' | 'frente'>;

export const EquipoNode: React.FC<NodeProps<EquipoFlowNode>> = React.memo(({ data }) => {
  const { raw, isSelected, isHighlighted, isDimmed, isCollapsed, hasChildren, hiddenDescendantCount, layoutDirection, onToggleCollapse } = data;
  const isHorizontal = layoutDirection === 'LR';
  const isFrente = raw.kind === 'frente';
  const accent = isFrente ? '#0d9488' : '#2563eb';
  const badgeBg = isFrente ? '#ccfbf1' : '#dbeafe';
  const badgeColor = isFrente ? '#0f766e' : '#1d4ed8';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        background: '#f8fafc',
        border: isSelected || isHighlighted ? `2px solid ${accent}` : '1px solid #cbd5e1',
        boxShadow:
          isSelected || isHighlighted
            ? `0 0 0 4px ${isFrente ? 'rgba(13, 148, 136, 0.16)' : 'rgba(37, 99, 235, 0.15)'}, 0 8px 18px rgba(15, 23, 42, 0.09)`
            : '0 3px 10px rgba(15, 23, 42, 0.05)',
        padding: '10px 12px',
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
        style={{ background: accent, border: '2px solid #ffffff', width: 8, height: 8 }}
      />

      {/* Tipo de nodo + Ámbito */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 700,
            color: badgeColor,
            background: badgeBg,
            padding: '2px 7px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {isFrente ? <Compass size={11} /> : <Users size={11} />}
          {isFrente ? 'Frente Territorial' : 'Equipo de Trabajo'}
        </span>
        {typeof raw.capacityPercent === 'number' && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>
            {raw.capacityPercent}% ocup.
          </span>
        )}
      </div>

      {/* Nombre + Responsable */}
      <div>
        <div
          style={{
            fontSize: '12.5px',
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
          Líder: <span style={{ color: '#334155', fontWeight: 600 }}>{raw.leadName || 'Sin asignar'}</span>
        </div>
      </div>

      {/* Pie: Ubicación y Dotación */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '10.5px',
          color: '#475569',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} color={accent} />
          {raw.locationLabel || 'Sin sede'}
        </span>
        <span style={{ fontWeight: 650, color: '#0f172a' }}>
          {raw.memberCount ?? 0} miembros
        </span>
      </div>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        style={{ background: accent, border: '2px solid #ffffff', width: 8, height: 8 }}
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

EquipoNode.displayName = 'EquipoNode';
