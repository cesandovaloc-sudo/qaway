import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { MapPin, User } from 'lucide-react';
import type { OrganigramaFlowNodeData } from '../types/organigrama.types';
import { NodeCollapseButton } from './NodeCollapseButton';

type IntegranteFlowNode = Node<OrganigramaFlowNodeData, 'integrante'>;

function getStatusStyles(status?: string): { bg: string; color: string; dot: string } {
  if (status === 'Licencia / Permiso') {
    return { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' };
  }
  if (status === 'Desvinculado') {
    return { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' };
  }
  return { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' };
}

export const IntegranteNode: React.FC<NodeProps<IntegranteFlowNode>> = React.memo(({ data }) => {
  const { raw, isSelected, isHighlighted, isDimmed, isCollapsed, hasChildren, hiddenDescendantCount, layoutDirection, onToggleCollapse } = data;
  const isHorizontal = layoutDirection === 'LR';
  const person = raw.integrante;
  const statusStyles = getStatusStyles(person?.estadoOperativo || raw.operationalStatus);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        background: '#ffffff',
        border: isSelected || isHighlighted ? '2px solid #0066ff' : '1px solid #cbd5e1',
        boxShadow:
          isSelected || isHighlighted
            ? '0 0 0 4px rgba(0, 102, 255, 0.14), 0 8px 18px rgba(15, 23, 42, 0.1)'
            : '0 3px 9px rgba(15, 23, 42, 0.05)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isDimmed ? 0.3 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box',
      }}
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ background: '#64748b', border: '2px solid #ffffff', width: 7, height: 7 }}
      />

      {/* Persona: Avatar + Nombre + Cargo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        {person?.avatarUrl ? (
          <img
            src={person.avatarUrl}
            alt={raw.title}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isSelected ? '#0066ff' : '#1e293b',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {person?.iniciales || <User size={14} />}
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0f172a',
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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={person?.cargo || raw.subtitle}
          >
            {person?.cargo || raw.subtitle || 'Integrante'}
          </div>
        </div>
      </div>

      {/* Unidad y Sede (diferenciadas) + Estado operativo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          paddingTop: '7px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '10px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '132px',
          }}
          title={`${person?.areaNombre || raw.unitName || ''} · ${person?.sedeNombre || raw.locationLabel || ''}`}
        >
          <MapPin size={10} color="#0284c7" style={{ flexShrink: 0 }} />
          {person?.sedeNombre || raw.locationLabel || 'Sin sede'}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: statusStyles.bg,
            color: statusStyles.color,
            fontWeight: 650,
            padding: '1.5px 6px',
            borderRadius: '999px',
            flexShrink: 0,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusStyles.dot }} />
          {person?.estadoOperativo === 'Licencia / Permiso' ? 'Licencia' : (person?.estadoOperativo || raw.operationalStatus || 'Activo')}
        </span>
      </div>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        style={{ background: '#64748b', border: '2px solid #ffffff', width: 7, height: 7 }}
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

IntegranteNode.displayName = 'IntegranteNode';
