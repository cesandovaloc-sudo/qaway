import React, { useState, useMemo } from 'react';
import type { Integrante, UnidadOrganizacional, SedeFrente } from './types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  Search,
  Download,
  X,
} from 'lucide-react';

interface EquipoOrganigramaViewProps {
  integrantes: Integrante[];
  areas: UnidadOrganizacional[];
  sedes: SedeFrente[];
  onSelectIntegrante: (id: string) => void;
}

interface TreeNode {
  integrante: Integrante;
  subordinados: TreeNode[];
}

export default function EquipoOrganigramaView({
  integrantes,
  areas,
  sedes,
  onSelectIntegrante,
}: EquipoOrganigramaViewProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState('');

  // Construir el árbol jerárquico a partir de reportaAId
  const hierarchicalTree = useMemo(() => {
    const lideres = integrantes.filter(
      (i) => !i.reportaAId || !integrantes.some((parent) => parent.id === i.reportaAId)
    );

    const buildSubTree = (parent: Integrante): TreeNode => {
      const hijos = integrantes.filter((i) => i.reportaAId === parent.id);
      return {
        integrante: parent,
        subordinados: hijos.map(buildSubTree),
      };
    };

    return lideres.map(buildSubTree);
  }, [integrantes]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(60, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  // Renderizador recursivo de nodo del organigrama
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const { integrante, subordinados } = node;
    const isCollapsed = collapsedNodes.has(integrante.id);
    const hasChildren = subordinados.length > 0;
    const esLider = depth === 0;

    const matchesSearch =
      busqueda.trim() &&
      (integrante.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        integrante.cargo.toLowerCase().includes(busqueda.toLowerCase()));

    return (
      <div
        key={integrante.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Tarjeta del Integrante en el Organigrama */}
        <div
          onClick={() => onSelectIntegrante(integrante.id)}
          style={{
            width: '270px',
            background: matchesSearch ? '#fef9c3' : '#ffffff',
            borderRadius: '10px',
            border: matchesSearch
              ? '2px solid #eab308'
              : esLider
              ? '2px solid #0066ff'
              : '1px solid #cbd5e1',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 2,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.14)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
          }}
        >
          {/* Cabecera de la tarjeta: Área y Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#0066ff', textTransform: 'uppercase' }}>
              {integrante.areaNombre}
            </span>
            {esLider && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Crown size={10} /> Dirección
              </span>
            )}
          </div>

          {/* Información del Integrante */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {integrante.avatarUrl ? (
              <img
                src={integrante.avatarUrl}
                alt={integrante.nombreCompleto}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: esLider ? '#0066ff' : '#1e293b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {integrante.iniciales}
              </div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {integrante.nombreCompleto}
              </b>
              <small style={{ display: 'block', fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {integrante.cargo}
              </small>
            </div>
          </div>

          {/* Sede y Reportes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '10.5px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={12} color="#0066ff" />
              {integrante.sedeNombre.length > 20 ? integrante.sedeNombre.slice(0, 20) + '...' : integrante.sedeNombre}
            </span>

            {hasChildren && (
              <span style={{ fontWeight: 650, color: '#0066ff', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px' }}>
                {subordinados.length} {subordinados.length === 1 ? 'subordinado' : 'subordinados'}
              </span>
            )}
          </div>

          {/* Botón de Colapso / Expansión de Rama */}
          {hasChildren && (
            <div
              onClick={(e) => toggleCollapse(integrante.id, e)}
              style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 3,
                color: '#475569',
              }}
              title={isCollapsed ? 'Expandir rama' : 'Colapsar rama'}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
        </div>

        {/* Línea conectora hacia hijos si no está colapsado */}
        {hasChildren && !isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '2px', height: '24px', background: '#94a3b8' }} />

            <div
              style={{
                display: 'flex',
                gap: '24px',
                position: 'relative',
                paddingTop: '16px',
              }}
            >
              {subordinados.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '135px',
                    right: '135px',
                    height: '2px',
                    background: '#94a3b8',
                  }}
                />
              )}

              {subordinados.map((childNode) => (
                <div
                  key={childNode.integrante.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      width: '2px',
                      height: '16px',
                      background: '#94a3b8',
                    }}
                  />
                  {renderNode(childNode, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Barra de Filtros Nativa */}
      <div className="filters">
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Buscar integrante en el árbol jerárquico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}>
              <X size={14} />
            </button>
          )}
        </label>

        <button
          className="btn secondary"
          style={{ height: '34px', fontSize: '12px' }}
          onClick={() => setCollapsedNodes(new Set())}
        >
          Expandir Todos los Niveles
        </button>

        <div style={{ flex: 1 }} />

        {/* Controles de Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleZoom(-10)}
            className="btn secondary"
            style={{ width: '32px', height: '32px', padding: 0, display: 'grid', placeItems: 'center' }}
            title="Alejar"
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', minWidth: '40px', textAlign: 'center' }}>
            {zoomLevel}%
          </span>
          <button
            onClick={() => handleZoom(10)}
            className="btn secondary"
            style={{ width: '32px', height: '32px', padding: 0, display: 'grid', placeItems: 'center' }}
            title="Acercar"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={resetZoom}
            className="btn secondary"
            style={{ height: '32px', padding: '0 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Restablecer zoom"
          >
            <RotateCcw size={12} />
            100%
          </button>
          <button
            onClick={() => window.print()}
            className="btn secondary"
            style={{ height: '32px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Canvas Espacial de Navegación */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#f8fafc',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          padding: '40px 60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px',
          }}
        >
          {hierarchicalTree.map((rootNode) => renderNode(rootNode, 0))}
        </div>
      </div>

      {/* Footer que cierra la cápsula */}
      <footer className="footer">
        <span>Jerarquía Organizacional · {integrantes.length} integrantes vinculados</span>
        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
          Líneas de reporte y supervisión directa
        </span>
      </footer>
    </div>
  );
}
