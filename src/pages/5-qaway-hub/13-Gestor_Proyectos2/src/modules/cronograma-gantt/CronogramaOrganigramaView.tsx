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
  CheckSquare,
  User,
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
  const { roots, childrenMap } = useMemo(() => {
    const r: Item[] = [];
    const cMap = new Map<string, Item[]>();

    items.forEach((it) => {
      if (!it.parentId) {
        r.push(it);
      } else {
        if (!cMap.has(it.parentId)) cMap.set(it.parentId, []);
        cMap.get(it.parentId)!.push(it);
      }
    });

    return { roots: r, childrenMap: cMap };
  }, [items]);

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

  // Conteos exactos WBS PM4R / BID
  const { totalAgrupadores, totalPaquetes } = useMemo(() => {
    let ag = 0;
    let pq = 0;
    items.forEach((it) => {
      if (it.parentId) {
        const hasChildren = items.some((c) => c.parentId === it.id);
        if (hasChildren) ag++;
        else pq++;
      }
    });
    return { totalAgrupadores: ag, totalPaquetes: pq };
  }, [items]);

  const getTaskCounts = (item: Item) => {
    const total = item.tasks ?? 4;
    const done = item.done ?? Math.min(total, Math.round(((item.progress ?? 0) / 100) * total));
    return { done, total };
  };

  // Renderizador de tarjeta de Paquete de Trabajo Terminal (Rosa / Magenta)
  const renderPaqueteCard = (pkg: Item) => {
    const isPkgSelected = selectedId === pkg.id;
    const taskCounts = getTaskCounts(pkg);
    const responsable = pkg.gestor || pkg.sede || 'DRE / UGEL';

    return (
      <div
        key={pkg.id}
        className={`organigrama-card paquete-card ${isPkgSelected ? 'selected' : ''}`}
        onClick={() => onSelectItem(pkg)}
        title="Clic para abrir detalle operativo y checklist de tareas"
      >
        <div className="card-level-chip paquete">
          <span>Nivel Terminal · Paquete de Trabajo</span>
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

        {/* Insignia de Responsable e Insignia de Actividades Operativas (Tareas) */}
        <div className="pkg-indicators-row">
          <span className="pkg-responsible-pill" title={`Responsable operativo: ${responsable}`}>
            <User size={10} />
            <span>{responsable}</span>
          </span>

          <div
            className="pkg-task-pill"
            onClick={(e) => {
              e.stopPropagation();
              onSelectItem(pkg);
            }}
            title="Actividades operativas: clic para ver checklist y tareas"
          >
            <CheckSquare size={10} />
            <span>{taskCounts.done}/{taskCounts.total} Tareas</span>
          </div>
        </div>

        <div className="card-meta-line" style={{ marginTop: 6, marginBottom: 6 }}>
          <span className="node-dates">
            {formatDatePE(pkg.start)} – {formatDatePE(pkg.end)}
          </span>
          <span className={`node-status-pill micro ${pkg.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {pkg.status}
          </span>
        </div>

        <div className="card-progress-footer">
          <div className="card-prog-track" style={{ background: '#fecdd3' }}>
            <div
              className="card-prog-fill"
              style={{
                width: `${pkg.progress}%`,
                background: '#f43f5e',
                height: '100%',
                borderRadius: 999
              }}
            />
          </div>
          <span className="card-prog-val" style={{ color: '#be123c', fontSize: '10px' }}>
            {pkg.progress}%
          </span>
        </div>
      </div>
    );
  };

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
            Nivel 1: Componentes ({roots.length})
          </span>
          <span className="legend-chip subcomp">
            <span className="chip-dot" style={{ background: '#eab308' }} />
            Nivel Intermedio: Agrupadores ({totalAgrupadores})
          </span>
          <span className="legend-chip paquete">
            <span className="chip-dot" style={{ background: '#f43f5e' }} />
            Nivel Terminal: Paquetes de Trabajo ({totalPaquetes})
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
                  <span>{roots.length} Componentes · {totalPaquetes} Paquetes</span>
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

            {roots.map((comp) => {
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
                          title={isCollapsed ? 'Desplegar estructura' : 'Colapsar estructura'}
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
                      RAMIFICACIÓN REAL: ABANICO DESCENDENTE WBS PM4R / BID
                      ══════════════════════════════════════════════════════════════ */}
                  {!isCollapsed && hasSub && (
                    <div className="organigrama-children-stack">
                      {/* Línea conectora que baja del Componente a la barra de bifurcación */}
                      <div className="organigrama-line-down-to-children" />

                      {/* Contenedor en Abanico de ramas hijas del Componente */}
                      <div className="organigrama-branches-row">
                        {/* Barra conectora horizontal entre ramas directas */}
                        {childrenL2.length > 1 && (
                          <div
                            className="organigrama-branches-bus-bar"
                            style={{
                              left: childrenL2.length === 2 ? '25%' : '12%',
                              right: childrenL2.length === 2 ? '25%' : '12%',
                            }}
                          />
                        )}

                        {childrenL2.map((item) => {
                          const childrenL3 = childrenMap.get(item.id) || [];
                          const isAgrupador = childrenL3.length > 0;
                          const isItemSelected = selectedId === item.id;

                          return (
                            <div key={item.id} className="organigrama-branch-col">
                              {/* Alimentador vertical desde la barra horizontal */}
                              <div className="organigrama-branch-feeder" />

                              {/* CASO A: AGRUPADOR INTERMEDIO / PRODUCTO (AMARILLO) */}
                              {isAgrupador ? (
                                <div className="organigrama-agrupador-wrapper">
                                  <div
                                    className={`organigrama-card subcomp-card ${isItemSelected ? 'selected' : ''}`}
                                    onClick={() => onSelectItem(item)}
                                    title="Agrupador intermedio WBS / Producto contenedor"
                                  >
                                    <div className="card-level-chip subcomp">
                                      <span>Nivel Intermedio · Agrupador</span>
                                      <span className="card-sub-prog-tag">{item.progress}%</span>
                                    </div>

                                    <div className="card-code-title">
                                      <b className="node-code">{item.code}</b>
                                      <span className="node-title">{item.name}</span>
                                    </div>

                                    <div className="card-meta-line">
                                      <span className="node-dates">
                                        {formatDatePE(item.start)} – {formatDatePE(item.end)}
                                      </span>
                                      <span className={`node-status-pill mini ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {item.status}
                                      </span>
                                    </div>

                                    <div className="card-progress-footer">
                                      <div className="card-prog-track" style={{ background: '#fef08a' }}>
                                        <div
                                          className="card-prog-fill"
                                          style={{
                                            width: `${item.progress}%`,
                                            background: '#eab308',
                                            height: '100%',
                                            borderRadius: 999
                                          }}
                                        />
                                      </div>
                                      <span className="card-prog-val" style={{ color: '#a16207', fontSize: '10px' }}>
                                        {item.progress}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Sub-bifurcación hacia los Paquetes de Trabajo dependientes */}
                                  <div className="organigrama-packages-stack">
                                    <div className="organigrama-sub-trunk-down" />

                                    <div className="organigrama-pkgs-list">
                                      {childrenL3.map((pkg) => (
                                        <div key={pkg.id} className="organigrama-pkg-item">
                                          <div className="organigrama-pkg-feeder" />
                                          {renderPaqueteCard(pkg)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* CASO B: PAQUETE DE TRABAJO TERMINAL DIRECTO (ROSA / MAGENTA) */
                                <div className="organigrama-direct-pkg-wrapper">
                                  {renderPaqueteCard(item)}
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
