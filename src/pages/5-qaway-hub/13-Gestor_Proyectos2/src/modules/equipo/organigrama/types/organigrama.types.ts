import type { Integrante, EstadoOperativo } from '../../types';

export type OrganigramaNodeKind =
  | 'direccion'
  | 'unidad'
  | 'equipo'
  | 'frente'
  | 'integrante';

export type OrganigramaRelationKind =
  | 'jerarquia'
  | 'pertenencia'
  | 'asignacion_frente'
  | 'colaboracion';

export type OrganigramaRepresentationMode =
  | 'completa'
  | 'estructura'
  | 'frentes'
  | 'colaborativa';

export type OrganigramaLayoutDirection = 'TB' | 'LR';

export interface OrganigramaRawNode {
  id: string;
  kind: OrganigramaNodeKind;
  title: string;
  subtitle?: string | undefined;
  code?: string | undefined;
  unitName?: string | undefined;
  locationLabel?: string | undefined;
  leadName?: string | undefined;
  memberCount?: number | undefined;
  subTeamCount?: number | undefined;
  capacityPercent?: number | undefined;
  operationalStatus?: EstadoOperativo | 'Activo' | 'En despliegue' | undefined;
  parentId?: string | null | undefined;
  integrante?: Integrante | undefined;
  responsibilities?: string[] | undefined;
}

export interface OrganigramaRawEdge {
  id: string;
  source: string;
  target: string;
  relationKind: OrganigramaRelationKind;
  label?: string | undefined;
  /** Si es false, es un enlace secundario/matricial/colaborativo que no define el árbol primario */
  isPrimaryHierarchy: boolean;
}

export interface OrganigramaDataset {
  isDemo: boolean;
  sourceLabel: string;
  nodes: OrganigramaRawNode[];
  edges: OrganigramaRawEdge[];
}

export interface OrganigramaFlowNodeData extends Record<string, unknown> {
  raw: OrganigramaRawNode;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  hiddenDescendantCount: number;
  layoutDirection: OrganigramaLayoutDirection;
  onToggleCollapse: (nodeId: string) => void;
  onOpenDetail?: ((node: OrganigramaRawNode) => void) | undefined;
}

export interface OrganigramaFlowEdgeData extends Record<string, unknown> {
  relationKind: OrganigramaRelationKind;
  label?: string | undefined;
  isHighlighted: boolean;
  isDimmed: boolean;
}
