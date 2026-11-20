import React from 'react';
import {
  X,
  Building2,
  Users,
  Compass,
  Crown,
  User,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ArrowRight,
  GitCommitHorizontal,
} from 'lucide-react';
import type {
  OrganigramaRawEdge,
  OrganigramaRawNode,
  OrganigramaRelationKind,
} from './types/organigrama.types';
import type { Integrante } from '../types';
import { usePerfilVisible } from '../../../services/perfilVisibleService';
import { formatearTelefono, telefonoDeContacto } from '../../../services/comunicacionesService';

interface OrganigramaDetailPanelProps {
  node: OrganigramaRawNode | null;
  incoming: { edge: OrganigramaRawEdge; peer: OrganigramaRawNode }[];
  outgoing: { edge: OrganigramaRawEdge; peer: OrganigramaRawNode }[];
  onClose: () => void;
  onJumpToNode: (nodeId: string) => void;
  onOpenIntegranteSheet?: (integrante: Integrante) => void;
}

const RELATION_LABEL: Record<OrganigramaRelationKind, { label: string; color: string; bg: string }> = {
  jerarquia: { label: 'Dependencia jerárquica', color: '#0f172a', bg: '#f1f5f9' },
  pertenencia: { label: 'Pertenencia organizacional', color: '#0369a1', bg: '#e0f2fe' },
  asignacion_frente: { label: 'Asignación a frente', color: '#0f766e', bg: '#ccfbf1' },
  colaboracion: { label: 'Colaboración transversal', color: '#6d28d9', bg: '#f3e8ff' },
};

function getHeaderBadge(kind: OrganigramaRawNode['kind']) {
  switch (kind) {
    case 'direccion':
      return { label: 'Dirección Central', icon: <Crown size={13} />, bg: '#0f172a', color: '#fbbf24' };
    case 'unidad':
      return { label: 'Unidad Organizacional', icon: <Building2 size={13} />, bg: '#e0f2fe', color: '#0369a1' };
    case 'equipo':
      return { label: 'Equipo de Trabajo', icon: <Users size={13} />, bg: '#dbeafe', color: '#1d4ed8' };
    case 'frente':
      return { label: 'Frente de Intervención', icon: <Compass size={13} />, bg: '#ccfbf1', color: '#0f766e' };
    case 'integrante':
    default:
      return { label: 'Ficha de Integrante', icon: <User size={13} />, bg: '#f1f5f9', color: '#0f172a' };
  }
}

export const OrganigramaDetailPanel: React.FC<OrganigramaDetailPanelProps> = ({
  node,
  incoming,
  outgoing,
  onClose,
  onJumpToNode,
  onOpenIntegranteSheet,
}) => {
  const { perfil: visible } = usePerfilVisible();
  if (!node) return null;

  const badge = getHeaderBadge(node.kind);
  const person = node.integrante;

  return (
    <aside
      aria-label="Detalle del elemento seleccionado"
      style={{
        width: '320px',
        flexShrink: 0,
        background: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
            padding: '3px 9px',
            borderRadius: '999px',
          }}
        >
          {badge.icon}
          {badge.label}
        </span>

        <button
          type="button"
          onClick={onClose}
          title="Cerrar panel contextual"
          aria-label="Cerrar panel"
          style={{
            border: 'none',
            background: '#f8fafc',
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: '#475569',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Cuerpo scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#0f172a', lineHeight: 1.3 }}>
            {node.title}
          </h3>
          {node.subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              {node.subtitle}
            </p>
          )}
        </div>

        {/* Datos contextuales diferenciados */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            fontSize: '12px',
          }}
        >
          {node.leadName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Responsable</span>
              <strong style={{ color: '#0f172a', textAlign: 'right' }}>{node.leadName}</strong>
            </div>
          )}
          {node.unitName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Unidad org.</span>
              <strong style={{ color: '#0f172a', textAlign: 'right' }}>{node.unitName}</strong>
            </div>
          )}
          {(node.locationLabel || person?.sedeNombre) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#0284c7" /> Sede / Frente
              </span>
              <strong style={{ color: '#0f172a', textAlign: 'right' }}>
                {person?.sedeNombre || node.locationLabel}
              </strong>
            </div>
          )}
          {typeof node.memberCount === 'number' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Integrantes</span>
              <strong style={{ color: '#0066ff' }}>{node.memberCount}</strong>
            </div>
          )}
          {typeof node.capacityPercent === 'number' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Ocupación equipo</span>
              <strong style={{ color: '#0f172a' }}>{node.capacityPercent}%</strong>
            </div>
          )}
          {person && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ color: '#64748b' }}>Estado operativo</span>
                <strong style={{ color: person.estadoOperativo === 'En funciones' ? '#15803d' : '#b45309' }}>
                  {person.estadoOperativo}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', paddingTop: '4px', borderTop: '1px solid #e2e8f0' }}>
                <Mail size={12} color="#64748b" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <Phone size={12} color="#64748b" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formatearTelefono(telefonoDeContacto(visible?.contactos || [], {
                    email: person.email,
                    nombre: person.nombreCompleto || person.nombre,
                  })) || 'Sin teléfono registrado en su perfil'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Responsabilidades si es Dirección / Unidad / Equipo */}
        {node.responsibilities && node.responsibilities.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              Alcance funcional
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#334155' }}>
              {node.responsibilities.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Conexiones reales (Dependencia vs Pertenencia vs Frente vs Colaboración) */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <GitCommitHorizontal size={13} />
            Relaciones en la red ({incoming.length + outgoing.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {incoming.map(({ edge, peer }) => {
              const rel = RELATION_LABEL[edge.relationKind];
              return (
                <button
                  key={edge.id}
                  type="button"
                  onClick={() => onJumpToNode(peer.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, background: rel.bg, color: rel.color, padding: '1px 6px', borderRadius: '4px', marginBottom: '2px' }}>
                      {rel.label} (superior / origen)
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 650, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {peer.title}
                    </div>
                  </div>
                  <ArrowRight size={13} color="#64748b" />
                </button>
              );
            })}

            {outgoing.map(({ edge, peer }) => {
              const rel = RELATION_LABEL[edge.relationKind];
              return (
                <button
                  key={edge.id}
                  type="button"
                  onClick={() => onJumpToNode(peer.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, background: rel.bg, color: rel.color, padding: '1px 6px', borderRadius: '4px', marginBottom: '2px' }}>
                      {rel.label} (destino)
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 650, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {peer.title}
                    </div>
                  </div>
                  <ArrowRight size={13} color="#64748b" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Acceso a ficha completa de integrante cuando aplique */}
      {person && onOpenIntegranteSheet && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => onOpenIntegranteSheet(person)}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: '#0066ff',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 650,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <ExternalLink size={14} />
            <span>Abrir ficha del integrante</span>
          </button>
        </div>
      )}
    </aside>
  );
};
