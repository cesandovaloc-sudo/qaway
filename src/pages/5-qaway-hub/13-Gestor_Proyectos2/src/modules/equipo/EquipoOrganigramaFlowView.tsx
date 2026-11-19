import React, { useCallback, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Integrante } from './types';
import type { OrganigramaDataset } from './organigrama/types/organigrama.types';
import { useOrganigrama } from './organigrama/hooks/useOrganigrama';
import { OrganigramaControls } from './organigrama/OrganigramaControls';
import { OrganigramaCanvas, type OrganigramaCanvasActions } from './organigrama/OrganigramaCanvas';
import { OrganigramaDetailPanel } from './organigrama/OrganigramaDetailPanel';
import EquipoExpedienteModal from './EquipoExpedienteModal';
import { usePerfilGp } from '../../services/gpPermisosService';
import { esTenantMineduPrincipal } from '../../services/gestorTareasLocalService';

const EMPTY_ORGANIGRAMA_DATASET: OrganigramaDataset = {
  nodes: [],
  edges: [],
  sourceLabel: 'Sin datos registrados',
};

export interface EquipoOrganigramaFlowViewProps {
  /** Dataset opcional para futura conexión con servicios Supabase; por defecto usa datos de demostración */
  dataset?: OrganigramaDataset;
  /** Callback opcional si un contenedor padre desea capturar la apertura de ficha de integrante */
  onOpenIntegrante?: (integrante: Integrante) => void;
}

export default function EquipoOrganigramaFlowView({
  dataset: externalDataset,
  onOpenIntegrante,
}: EquipoOrganigramaFlowViewProps) {
  const { perfil, cargando: cargandoPerfilGp } = usePerfilGp();
  const esDigerePrincipal = esTenantMineduPrincipal(perfil?.tenantId);
  const effectiveDataset =
    externalDataset ?? (esDigerePrincipal ? undefined : EMPTY_ORGANIGRAMA_DATASET);

  const {
    dataset,
    integrity,
    mode,
    setMode,
    direction,
    setDirection,
    showCrossLinks,
    setShowCrossLinks,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    selectedConnections,
    searchQuery,
    setSearchQuery,
    searchMatches,
    expandAll,
    collapseToUnits,
    forceRelayout,
    revealAndSelectNode,
    visibleCount,
    totalCount,
  } = useOrganigrama(effectiveDataset);

  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [pendingFocusNodeId, setPendingFocusNodeId] = useState<string | null>(null);
  const [expedienteIntegrante, setExpedienteIntegrante] = useState<Integrante | null>(null);
  const canvasActionsRef = useRef<OrganigramaCanvasActions | null>(null);

  const handleRegisterActions = useCallback((actions: OrganigramaCanvasActions) => {
    canvasActionsRef.current = actions;
  }, []);

  const handleFocusAndSelectNode = useCallback(
    (nodeId: string) => {
      revealAndSelectNode(nodeId);
      setPendingFocusNodeId(nodeId);
    },
    [revealAndSelectNode]
  );

  const handleClearPendingFocus = useCallback(() => {
    setPendingFocusNodeId(null);
  }, []);

  const handleCenterStructure = useCallback(() => {
    forceRelayout();
    setTimeout(() => {
      canvasActionsRef.current?.centerStructure();
    }, 60);
  }, [forceRelayout]);

  const handleOpenIntegranteSheet = useCallback(
    (integrante: Integrante) => {
      if (onOpenIntegrante) {
        onOpenIntegrante(integrante);
        return;
      }
      setExpedienteIntegrante(integrante);
    },
    [onOpenIntegrante]
  );

  if (!externalDataset && cargandoPerfilGp) {
    return (
      <div style={{ padding: '70px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#ffffff', width: '100%' }}>
        Cargando equipo...
      </div>
    );
  }

  if (!externalDataset && !esDigerePrincipal && totalCount === 0) {
    return (
      <div style={{ padding: '70px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#ffffff', width: '100%' }}>
        <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>
          Sin estructura organizacional ni integrantes registrados
        </strong>
        Configura tus unidades organizacionales en Configuración o agrega integrantes para visualizar el organigrama.
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: '100%',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Barra superior de navegación, búsqueda, modos de representación y layout */}
        <OrganigramaControls
          isDemo={dataset.isDemo}
          mode={mode}
          onModeChange={setMode}
          direction={direction}
          onDirectionChange={setDirection}
          showCrossLinks={showCrossLinks}
          onToggleCrossLinks={() => setShowCrossLinks((v) => !v)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchMatches={searchMatches}
          onSelectSearchMatch={handleFocusAndSelectNode}
          zoomPercent={zoomPercent}
          onZoomIn={() => canvasActionsRef.current?.zoomIn()}
          onZoomOut={() => canvasActionsRef.current?.zoomOut()}
          onFitView={() => canvasActionsRef.current?.fitView()}
          onCenterStructure={handleCenterStructure}
          onExpandAll={expandAll}
          onCollapseBranches={collapseToUnits}
        />

        {/* Área central: Lienzo React Flow + Panel contextual al seleccionar */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            position: 'relative',
            background: '#f8fafc',
          }}
        >
          <OrganigramaCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectNode={setSelectedNodeId}
            onZoomPercentChange={setZoomPercent}
            pendingFocusNodeId={pendingFocusNodeId}
            onClearPendingFocus={handleClearPendingFocus}
            onRegisterActions={handleRegisterActions}
          />

          {selectedNode && (
            <OrganigramaDetailPanel
              node={selectedNode}
              incoming={selectedConnections.incoming}
              outgoing={selectedConnections.outgoing}
              onClose={() => setSelectedNodeId(null)}
              onJumpToNode={handleFocusAndSelectNode}
              onOpenIntegranteSheet={handleOpenIntegranteSheet}
            />
          )}
        </div>

        {/* Barra de estado técnica compacta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 14px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '11px',
            color: '#475569',
            flexShrink: 0,
          }}
        >
          <span>
            Organigrama React Flow + Dagre · <strong>{visibleCount}</strong> de <strong>{totalCount}</strong> nodos visibles ·{' '}
            {selectedNodeId ? 'Nodo seleccionado' : 'Arrastra el lienzo o haz clic en un nodo para inspeccionarlo'}
          </span>
          <span style={{ color: '#64748b' }}>
            {dataset.sourceLabel} · Ciclos: {integrity.cyclesCount} · Sin enlace: {integrity.orphanNodesCount}
          </span>
        </div>

        {/* Ficha de expediente integrada en el área de trabajo (sin tapar sidebar ni migajas) */}
        <EquipoExpedienteModal
          isOpen={Boolean(expedienteIntegrante)}
          onClose={() => setExpedienteIntegrante(null)}
          integrante={expedienteIntegrante}
          onUpdateIntegrante={(updated) => setExpedienteIntegrante(updated)}
          asignaciones={[]}
          sedes={[]}
          areas={[]}
          embedded
          backLabel="Volver al Organigrama"
        />
      </div>
    </ReactFlowProvider>
  );
}
