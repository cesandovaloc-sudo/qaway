import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { OrganigramaLayoutDirection } from '../types/organigrama.types';

interface NodeCollapseButtonProps {
  nodeId: string;
  hasChildren: boolean;
  isCollapsed: boolean;
  hiddenDescendantCount: number;
  layoutDirection: OrganigramaLayoutDirection;
  onToggleCollapse: (nodeId: string) => void;
}

export const NodeCollapseButton: React.FC<NodeCollapseButtonProps> = React.memo(
  ({ nodeId, hasChildren, isCollapsed, hiddenDescendantCount, layoutDirection, onToggleCollapse }) => {
    if (!hasChildren) return null;

    const isHorizontal = layoutDirection === 'LR';

    return (
      <button
        type="button"
        className="nodrag nopan"
        onClick={(e) => {
          e.stopPropagation();
          onToggleCollapse(nodeId);
        }}
        title={isCollapsed ? `Expandir rama (${hiddenDescendantCount} ocultos)` : 'Contraer rama'}
        aria-label={isCollapsed ? 'Expandir rama' : 'Contraer rama'}
        style={{
          position: 'absolute',
          ...(isHorizontal
            ? { right: '-13px', top: '50%', transform: 'translateY(-50%)' }
            : { bottom: '-13px', left: '50%', transform: 'translateX(-50%)' }),
          minWidth: isCollapsed && hiddenDescendantCount > 0 ? '42px' : '24px',
          height: '24px',
          padding: isCollapsed && hiddenDescendantCount > 0 ? '0 7px' : '0',
          borderRadius: '999px',
          background: isCollapsed ? '#0066ff' : '#ffffff',
          color: isCollapsed ? '#ffffff' : '#334155',
          border: isCollapsed ? '1.5px solid #0052cc' : '1.5px solid #cbd5e1',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.14)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {isCollapsed ? (
          <>
            <ChevronRight size={12} />
            {hiddenDescendantCount > 0 && <span>+{hiddenDescendantCount}</span>}
          </>
        ) : (
          <ChevronDown size={13} />
        )}
      </button>
    );
  }
);

NodeCollapseButton.displayName = 'NodeCollapseButton';
