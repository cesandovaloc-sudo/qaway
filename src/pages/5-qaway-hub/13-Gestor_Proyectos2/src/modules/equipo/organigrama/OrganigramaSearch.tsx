import React, { useState } from 'react';
import { Search, X, Building2, Users, Compass, Crown, User } from 'lucide-react';
import type { OrganigramaNodeKind, OrganigramaRawNode } from './types/organigrama.types';

interface OrganigramaSearchProps {
  query: string;
  onQueryChange: (val: string) => void;
  matches: OrganigramaRawNode[];
  onSelectMatch: (nodeId: string) => void;
}

function getKindIcon(kind: OrganigramaNodeKind) {
  switch (kind) {
    case 'direccion':
      return <Crown size={13} color="#b45309" />;
    case 'unidad':
      return <Building2 size={13} color="#0284c7" />;
    case 'equipo':
      return <Users size={13} color="#2563eb" />;
    case 'frente':
      return <Compass size={13} color="#0d9488" />;
    case 'integrante':
    default:
      return <User size={13} color="#334155" />;
  }
}

function getKindLabel(kind: OrganigramaNodeKind) {
  switch (kind) {
    case 'direccion':
      return 'Dirección';
    case 'unidad':
      return 'Unidad';
    case 'equipo':
      return 'Equipo';
    case 'frente':
      return 'Frente';
    case 'integrante':
    default:
      return 'Integrante';
  }
}

export const OrganigramaSearch: React.FC<OrganigramaSearchProps> = ({
  query,
  onQueryChange,
  matches,
  onSelectMatch,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', minWidth: '240px', maxWidth: '300px', flex: '1 1 240px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          height: '32px',
          padding: '0 10px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
        }}
      >
        <Search size={14} color="#64748b" />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          placeholder="Buscar integrante, unidad o equipo..."
          aria-label="Buscar en el organigrama"
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '12px',
            color: '#0f172a',
            background: 'transparent',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            title="Limpiar búsqueda"
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              color: '#64748b',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.14)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 40,
            padding: '4px',
          }}
        >
          {matches.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '11.5px', color: '#64748b' }}>
              Sin coincidencias en el organigrama.
            </div>
          ) : (
            matches.map((node) => (
              <button
                key={node.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectMatch(node.id);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 9px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ flexShrink: 0 }}>{getKindIcon(node.kind)}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 650,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.title}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.subtitle || node.locationLabel || ''}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 650,
                    color: '#475569',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    flexShrink: 0,
                  }}
                >
                  {getKindLabel(node.kind)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
