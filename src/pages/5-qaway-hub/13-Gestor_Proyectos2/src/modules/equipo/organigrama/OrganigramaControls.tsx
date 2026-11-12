import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  LocateFixed,
  ChevronsDownUp,
  ChevronsUpDown,
  GitBranch,
  ArrowDownUp,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import type {
  OrganigramaLayoutDirection,
  OrganigramaRawNode,
  OrganigramaRepresentationMode,
} from './types/organigrama.types';
import { OrganigramaSearch } from './OrganigramaSearch';

interface OrganigramaControlsProps {
  isDemo: boolean;
  mode: OrganigramaRepresentationMode;
  onModeChange: (m: OrganigramaRepresentationMode) => void;
  direction: OrganigramaLayoutDirection;
  onDirectionChange: (d: OrganigramaLayoutDirection) => void;
  showCrossLinks: boolean;
  onToggleCrossLinks: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  searchMatches: OrganigramaRawNode[];
  onSelectSearchMatch: (id: string) => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onCenterStructure: () => void;
  onExpandAll: () => void;
  onCollapseBranches: () => void;
}

const MODE_OPTIONS: { id: OrganigramaRepresentationMode; label: string }[] = [
  { id: 'completa', label: 'Vista Integral' },
  { id: 'estructura', label: 'Estructura' },
  { id: 'frentes', label: 'Frentes y Sedes' },
  { id: 'colaborativa', label: 'Colaboración' },
];

export const OrganigramaControls: React.FC<OrganigramaControlsProps> = ({
  isDemo,
  mode,
  onModeChange,
  direction,
  onDirectionChange,
  showCrossLinks,
  onToggleCrossLinks,
  searchQuery,
  onSearchQueryChange,
  searchMatches,
  onSelectSearchMatch,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitView,
  onCenterStructure,
  onExpandAll,
  onCollapseBranches,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {/* Identificador explícito de dataset de demostración */}
      {isDemo && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#1d4ed8',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '4px 9px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
          }}
          title="Conjunto genérico de demostración aislado de Supabase"
        >
          <Sparkles size={12} />
          Datos de demostración
        </span>
      )}

      {/* Búsqueda inteligente con expansión automática */}
      <OrganigramaSearch
        query={searchQuery}
        onQueryChange={onSearchQueryChange}
        matches={searchMatches}
        onSelectMatch={onSelectSearchMatch}
      />

      {/* Selector de modo de representación */}
      <div
        role="group"
        aria-label="Modo de representación del organigrama"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#e2e8f0',
          padding: '2px',
          borderRadius: '8px',
          gap: '2px',
        }}
      >
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onModeChange(opt.id)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '5px 9px',
                fontSize: '11.5px',
                fontWeight: active ? 700 : 500,
                background: active ? '#ffffff' : 'transparent',
                color: active ? '#0f172a' : '#475569',
                boxShadow: active ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Toggle relaciones transversales */}
      <button
        type="button"
        onClick={onToggleCrossLinks}
        className="btn secondary"
        style={{
          height: '32px',
          padding: '0 10px',
          fontSize: '11.5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: showCrossLinks ? '#f5f3ff' : '#ffffff',
          borderColor: showCrossLinks ? '#c4b5fd' : '#cbd5e1',
          color: showCrossLinks ? '#6d28d9' : '#475569',
        }}
        title="Mostrar u ocultar relaciones transversales de colaboración y frentes"
      >
        <GitBranch size={13} />
        <span>Enlaces transversales</span>
      </button>

      {/* Orientación Dagre TB / LR */}
      <button
        type="button"
        onClick={() => onDirectionChange(direction === 'TB' ? 'LR' : 'TB')}
        className="btn secondary"
        style={{
          height: '32px',
          padding: '0 10px',
          fontSize: '11.5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}
        title={direction === 'TB' ? 'Cambiar distribución a Horizontal' : 'Cambiar distribución a Vertical'}
      >
        {direction === 'TB' ? <ArrowDownUp size={13} /> : <ArrowLeftRight size={13} />}
        <span>{direction === 'TB' ? 'Vertical' : 'Horizontal'}</span>
      </button>

      {/* Expandir / Contraer ramas */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={onExpandAll}
          className="btn secondary"
          style={{ height: '32px', padding: '0 9px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Expandir todos los niveles"
        >
          <ChevronsUpDown size={13} />
          <span>Expandir</span>
        </button>
        <button
          type="button"
          onClick={onCollapseBranches}
          className="btn secondary"
          style={{ height: '32px', padding: '0 9px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Contraer a nivel de unidades"
        >
          <ChevronsDownUp size={13} />
          <span>Contraer</span>
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Navegación del lienzo (Zoom, Ajustar, Centrar) */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={onZoomOut}
          className="btn secondary"
          style={{ width: '30px', height: '30px', padding: 0, display: 'grid', placeItems: 'center' }}
          title="Alejar zoom"
          aria-label="Alejar zoom"
        >
          <ZoomOut size={14} />
        </button>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', minWidth: '40px', textAlign: 'center' }}>
          {zoomPercent}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className="btn secondary"
          style={{ width: '30px', height: '30px', padding: 0, display: 'grid', placeItems: 'center' }}
          title="Acercar zoom"
          aria-label="Acercar zoom"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          onClick={onCenterStructure}
          className="btn secondary"
          style={{ height: '30px', padding: '0 9px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Reorganizar y centrar estructura"
        >
          <LocateFixed size={13} />
          <span>Centrar</span>
        </button>
        <button
          type="button"
          onClick={onFitView}
          className="btn secondary"
          style={{ height: '30px', padding: '0 9px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Ajustar organigrama a la pantalla"
        >
          <Maximize2 size={13} />
          <span>Ajustar</span>
        </button>
      </div>
    </div>
  );
};
