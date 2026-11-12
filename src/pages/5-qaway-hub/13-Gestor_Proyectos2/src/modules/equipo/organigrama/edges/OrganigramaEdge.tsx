import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import type { OrganigramaFlowEdgeData, OrganigramaRelationKind } from '../types/organigrama.types';

type CustomFlowEdge = Edge<OrganigramaFlowEdgeData, 'organigrama'>;

const RELATION_STYLE: Record<
  OrganigramaRelationKind,
  { stroke: string; dashArray?: string; strokeWidth: number; badgeBg: string; badgeColor: string }
> = {
  jerarquia: {
    stroke: '#1e293b',
    strokeWidth: 2,
    badgeBg: '#f1f5f9',
    badgeColor: '#0f172a',
  },
  pertenencia: {
    stroke: '#0284c7',
    strokeWidth: 1.75,
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
  },
  asignacion_frente: {
    stroke: '#0d9488',
    dashArray: '6 4',
    strokeWidth: 1.75,
    badgeBg: '#ccfbf1',
    badgeColor: '#0f766e',
  },
  colaboracion: {
    stroke: '#7c3aed',
    dashArray: '4 4',
    strokeWidth: 1.6,
    badgeBg: '#f3e8ff',
    badgeColor: '#6d28d9',
  },
};

export const OrganigramaEdge: React.FC<EdgeProps<CustomFlowEdge>> = React.memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) => {
    const relationKind = data?.relationKind ?? 'jerarquia';
    const isHighlighted = Boolean(data?.isHighlighted);
    const isDimmed = Boolean(data?.isDimmed);
    const cfg = RELATION_STYLE[relationKind];

    const isSecondary = relationKind === 'colaboracion';
    const [edgePath, labelX, labelY] = isSecondary
      ? getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
      : getSmoothStepPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
          borderRadius: 10,
        });

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: isHighlighted ? '#0066ff' : cfg.stroke,
            strokeWidth: isHighlighted ? cfg.strokeWidth + 0.8 : cfg.strokeWidth,
            strokeDasharray: cfg.dashArray,
            opacity: isDimmed ? 0.16 : 0.9,
            transition: 'opacity 0.2s ease, stroke 0.2s ease',
          }}
        />
        {data?.label && (isHighlighted || isSecondary || relationKind === 'asignacion_frente') && !isDimmed && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                background: isHighlighted ? '#eff6ff' : cfg.badgeBg,
                color: isHighlighted ? '#1d4ed8' : cfg.badgeColor,
                border: `1px solid ${isHighlighted ? '#93c5fd' : 'rgba(148, 163, 184, 0.35)'}`,
                fontSize: '9.5px',
                fontWeight: 650,
                padding: '1.5px 6px',
                borderRadius: '999px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              }}
              className="nodrag nopan"
            >
              {data.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

OrganigramaEdge.displayName = 'OrganigramaEdge';
