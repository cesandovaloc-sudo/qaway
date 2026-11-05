import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { Item } from './CronogramaGanttView';

interface CronogramaOrganigramaViewProps {
  items: Item[];
  allItems: Item[];
  selectedId: string | null;
  onSelectItem: (item: Item) => void;
  onAddItem?: (kind: 'hito' | 'subproceso', parentId?: string) => void;
  formatDatePE: (iso: string) => string;
}

export const CronogramaOrganigramaView: React.FC<CronogramaOrganigramaViewProps> = ({
  items,
  allItems,
  selectedId,
  onSelectItem,
  formatDatePE,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [collapsedCompIds, setCollapsedCompIds] = useState<Record<string, boolean>>({});

  // Construcción del mapa jerárquico multinivel
  const { roots, childrenMap, depthMap } = useMemo(() => {
    const r: Item[] = [];
    const cMap = new Map<string, Item[]>();
    const dMap = new Map<string, number>();

    // 1. Agrupar por parentId
    items.forEach((it) => {
      if (!it.parentId) {
        r.push(it);
      } else {
        if (!cMap.has(it.parentId)) cMap.set(it.parentId, []);
        cMap.get(it.parentId)!.push(it);
      }
    });

    // 2. Calcular profundidad de cada nodo
    const computeDepth = (id: string): number => {
      if (dMap.has(id)) return dMap.get(id)!;
      const it = allItems.find((x) => x.id === id);
      if (!it || !it.parentId) {
        dMap.set(id, 0);
        return 0;
      }
      const d = 1 + computeDepth(it.parentId);
      dMap.set(id, d);
      return d;
    };
    items.forEach((it) => computeDepth(it.id));

    return { roots: r, childrenMap: cMap, depthMap: dMap };
  }, [items, allItems]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedCompIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Progreso global del proyecto
  const overallProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <div className="organigrama-wbs-container">
      {/* Barra de herramientas superior del Organigrama */}
      <div className="organigrama-toolbar">
        <div className="organigrama-legend-bar">
          <span className="legend-chip root">
            <span className="chip-dot" style={{ background: '#2563eb' }} />
            Proyecto Rector
          </span>
          <span className="legend-chip comp">
            <span className="chip-dot" style={{ background: '#f59e0b' }} />
            Nivel 1: Componentes
          </span>
          <span className="legend-chip subcomp">
            <span className="chip-dot" style={{ background: '#eab308' }} />
            Nivel 2: Subcomponentes / Productos
          </span>
          <span className="legend-chip paquete">
            <span className="chip-dot" style={{ background: '#e11d48' }} />
            Nivel 3+: Paquetes de Trabajo
          </span>
        </div>

        <div className="organigrama-zoom-controls">
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
            title="Reducir zoom"
          >
            <ZoomOut size={14} />
          </button>
          <span className="zoom-text">{zoomLevel}%</span>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
            title="Aumentar zoom"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoomLevel(100)}
            title="Restablecer tamaño (100%)"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Lienzo del Organigrama con Scroll Bidireccional */}
      <div className="organigrama-canvas-scroll">
        <div
          className="organigrama-tree-stage"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* ══════════════════════════════════════════════════════════════
              NIVEL 0: CAJA CENTRAL SUPERIOR (PROYECTO MAESTRO RECTOR)
              ══════════════════════════════════════════════════════════════ */}
          <div className="organigrama-root-wrapper">
            <div className="organigrama-card root-card">
              <div className="card-top-tag">
                <FolderOpen size={13} />
                <span>PROGRAMA MAESTRO OPERATIVO 2027</span>
              </div>
              <h2 className="card-main-title">MINEDU · Dotación 2027</h2>
              <p className="card-desc">
                Distribución Integral de Materiales Educativos en UGEL e II.EE. (DRE Junín)
              </p>

              <div className="card-metrics-row">
                <div className="mini-progress-box">
                  <span className="prog-label">Avance Rector</span>
                  <div className="prog-bar-wrap">
                    <div className="prog-bar-fill" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <b className="prog-num">{overallProgress}%</b>
                </div>
                <div className="mini-date-badge">
                  <Calendar size={12} />
                  <span>04/09/2026 – 30/04/2027</span>
                </div>
                <div className="mini-count-badge">
                  <Layers size={12} />
                  <span>{roots.length} Componentes</span>
                </div>
              </div>
            </div>

            {/* Tronco conector vertical que baja desde el nodo raíz */}
            <div className="organigrama-trunk-down" />
          </div>

          {/* ══════════════════════════════════════════════════════════════
              NIVEL 1: COMPONENTES PRINCIPALES (BLOQUES HORIZONTALES)
              ══════════════════════════════════════════════════════════════ */}
          <div className="organigrama-level1-row">
            {/* Barra conectora horizontal que une todos los componentes */}
            <div className="organigrama-horizontal-bus-bar" />

            {roots.map((comp, compIdx) => {
              const childrenL2 = childrenMap.get(comp.id) || [];
              const isCollapsed = collapsedCompIds[comp.id];
              const isSelected = selectedId === comp.id;
              const hasSub = childrenL2.length > 0;

              return (
                <div key={comp.id} className="organigrama-comp-column">
                  {/* Conector vertical desde la barra horizontal al componente */}
                  <div className="organigrama-comp-feeder-line" />

                  {/* Caja de Componente (Nivel 1 - Ámbar/Naranja) */}
                  <div
                    className={`organigrama-card comp-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectItem(comp)}
                  >
                    <div className="card-level-chip comp">
                      <span>Nivel 1 · Componente</span>
                      {hasSub && (
                        <button
                          type="button"
                          className="card-collapse-mini-btn"
                          onClick={(e) => toggleCollapse(comp.id, e)}
                          title={isCollapsed ? 'Desplegar subcomponentes' : 'Colapsar subcomponentes'}
                        >
                          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>

                    <div className="card-code-title">
                      <b className="node-code">{comp.code}</b>
                      <span className="node-title">{comp.name}</span>
                    </div>

                    <div className="card-meta-line">
                      <span className="node-dates">
                        {formatDatePE(comp.start)} – {formatDatePE(comp.end)}
                      </span>
                      <span className={`node-status-pill ${comp.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {comp.status}
                      </span>
                    </div>

                    <div className="card-progress-footer">
                      <div className="card-prog-track">
                        <div
                          className="card-prog-fill comp"
                          style={{ width: `${comp.progress}%` }}
                        />
                      </div>
                      <span className="card-prog-val">{comp.progress}%</span>
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════════════════
                      NIVEL 2: SUBCOMPONENTES / PRODUCTOS (Cajas Amarillas)
                      ══════════════════════════════════════════════════════════════ */}
                  {!isCollapsed && hasSub && (
                    <div className="organigrama-children-stack">
                      {/* Línea conectora hacia los hijos */}
                      <div className="organigrama-line-down-to-children" />

                      <div className="organigrama-sub-list">
                        {childrenL2.map((sub) => {
                          const childrenL3 = childrenMap.get(sub.id) || [];
                          const isSubSelected = selectedId === sub.id;
                          const hasWorkPackages = childrenL3.length > 0;

                          return (
                            <div key={sub.id} className="organigrama-sub-block">
                              <div className="organigrama-sub-feeder" />

                              {/* Tarjeta de Subcomponente / Producto (Nivel 2 - Amarillo) */}
                              <div
                                className={`organigrama-card subcomp-card ${isSubSelected ? 'selected' : ''}`}
                                onClick={() => onSelectItem(sub)}
                              >
                                <div className="card-level-chip subcomp">
                                  <span>{hasWorkPackages ? 'Nivel 2 · Producto' : 'Nivel 2 · Paquete Final'}</span>
                                  <span className="card-sub-prog-tag">{sub.progress}%</span>
                                </div>

                                <div className="card-code-title">
                                  <b className="node-code">{sub.code}</b>
                                  <span className="node-title">{sub.name}</span>
                                </div>

                                <div className="card-meta-line">
                                  <span className="node-dates">
                                    {formatDatePE(sub.start)} – {formatDatePE(sub.end)}
                                  </span>
                                  <span className={`node-status-pill mini ${sub.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {sub.status}
                                  </span>
                                </div>
                              </div>

                              {/* ══════════════════════════════════════════════════════════════
                                  NIVEL 3: PAQUETES DE TRABAJO (Cajas Magenta/Rosa)
                                  ══════════════════════════════════════════════════════════════ */}
                              {hasWorkPackages && (
                                <div className="organigrama-packages-stack">
                                  <div className="organigrama-sub-trunk-down" />
                                  <div className="organigrama-pkgs-list">
                                    {childrenL3.map((pkg) => {
                                      const isPkgSelected = selectedId === pkg.id;
                                      return (
                                        <div key={pkg.id} className="organigrama-pkg-item">
                                          <div className="organigrama-pkg-feeder" />
                                          <div
                                            className={`organigrama-card paquete-card ${isPkgSelected ? 'selected' : ''}`}
                                            onClick={() => onSelectItem(pkg)}
                                          >
                                            <div className="card-level-chip paquete">
                                              <span>Nivel 3 · Paquete Ejecutable</span>
                                              <span className="card-pkg-prog">{pkg.progress}%</span>
                                            </div>

                                            <div className="card-code-title">
                                              <b className="node-code">{pkg.code}</b>
                                              <span className="node-title">{pkg.name}</span>
                                            </div>

                                            {pkg.deliverable && (
                                              <div className="pkg-deliverable-line" title={pkg.deliverable}>
                                                <FileText size={11} />
                                                <span>{pkg.deliverable}</span>
                                              </div>
                                            )}

                                            <div className="card-meta-line">
                                              <span className="node-dates">
                                                {formatDatePE(pkg.start)} – {formatDatePE(pkg.end)}
                                              </span>
                                              <span className={`node-status-pill micro ${pkg.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {pkg.status}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronogramaOrganigramaView;
