import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Folder,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import type { Item } from './Reportes2View';

interface CronogramaOrganigramaViewProps {
  items: Item[];
  allItems: Item[];
  selectedId: string | null;
  projectName?: string;
  onSelectItem: (item: Item) => void;
  onAddItem?: (kind: 'hito' | 'subproceso', parentId?: string) => void;
  formatDatePE: (iso: string) => string;
  onMoveNode?: (draggedId: string, targetId: string, mode: 'reparent' | 'reorder') => void;
  onAutoSort?: () => void;
  zoomLevel?: number;
  onZoomChange?: (z: number | ((prev: number) => number)) => void;
  fitViewTrigger?: number;
}

type NodeCategory = 'COMPONENTE' | 'AGRUPADOR' | 'PAQUETE';

interface DropEvaluation {
  valid: boolean;
  mode?: 'reparent' | 'reorder';
  hint?: string;
}

export const CronogramaOrganigramaView: React.FC<CronogramaOrganigramaViewProps> = ({
  items,
  allItems,
  selectedId,
  projectName = 'Distribución de Materiales DOT 2027',
  onSelectItem,
  formatDatePE,
  onMoveNode,
  onAutoSort,
  zoomLevel: externalZoom,
  onZoomChange,
  fitViewTrigger,
}) => {
  const [internalZoom, setInternalZoom] = useState<number>(100);
  const zoomLevel = externalZoom !== undefined ? externalZoom : internalZoom;
  const setZoomLevel = useCallback(
    (action: number | ((prev: number) => number)) => {
      const nextVal = typeof action === 'function' ? action(zoomLevel) : action;
      const clamped = Math.min(150, Math.max(40, nextVal));
      if (onZoomChange) {
        onZoomChange(clamped);
      } else {
        setInternalZoom(clamped);
      }
    },
    [zoomLevel, onZoomChange]
  );
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const treeStageRef = useRef<HTMLDivElement | null>(null);
  const minimapTrackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingMinimapRef = useRef<boolean>(false);

  // Estado del rectángulo de viewport en el minimapa (valores normalizados 0..1)
  const [viewportRect, setViewportRect] = useState({
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  });

  // Mapa completo sobre allItems para cálculos exactos de jerarquía y fechas rollup
  const fullChildrenMap = useMemo(() => {
    const map = new Map<string, Item[]>();
    allItems.forEach((it) => {
      if (it.parentId) {
        if (!map.has(it.parentId)) map.set(it.parentId, []);
        map.get(it.parentId)!.push(it);
      }
    });
    return map;
  }, [allItems]);

  const getNodeCategory = useCallback(
    (item: Item): NodeCategory => {
      if (!item.parentId) return 'COMPONENTE';
      const children = fullChildrenMap.get(item.id) || [];
      return children.length > 0 ? 'AGRUPADOR' : 'PAQUETE';
    },
    [fullChildrenMap]
  );

  // Cálculo recursivo de fechas a partir de todos los paquetes de trabajo descendientes
  const getCalculatedDates = useCallback(
    (nodeId: string | 'PROJECT_ROOT'): { start: string; end: string } => {
      const leafPackages: Item[] = [];

      if (nodeId === 'PROJECT_ROOT') {
        allItems.forEach((it) => {
          const children = fullChildrenMap.get(it.id) || [];
          if (children.length === 0) leafPackages.push(it);
        });
      } else {
        const collectLeaves = (id: string) => {
          const children = fullChildrenMap.get(id) || [];
          if (children.length === 0) {
            const self = allItems.find((x) => x.id === id);
            if (self) leafPackages.push(self);
            return;
          }
          children.forEach((c) => collectLeaves(c.id));
        };
        collectLeaves(nodeId);
      }

      const validStarts = leafPackages
        .map((p) => p.start)
        .filter((s) => Boolean(s) && /^\d{4}-\d{2}-\d{2}/.test(s))
        .sort();
      const validEnds = leafPackages
        .map((p) => p.end)
        .filter((e) => Boolean(e) && /^\d{4}-\d{2}-\d{2}/.test(e))
        .sort();

      if (validStarts.length > 0 && validEnds.length > 0) {
        return {
          start: validStarts[0] ?? '',
          end: validEnds[validEnds.length - 1] ?? '',
        };
      }

      if (nodeId !== 'PROJECT_ROOT') {
        const fallback = allItems.find((x) => x.id === nodeId);
        if (fallback) return { start: fallback.start, end: fallback.end };
      }
      return { start: '2026-09-04', end: '2027-04-30' };
    },
    [allItems, fullChildrenMap]
  );

  // Construcción del árbol visible (preservando ancestros cuando se filtra por nivel inferior o búsqueda)
  const { roots, childrenMap, totalAgrupadores, totalPaquetes } = useMemo(() => {
    const visibleSet = new Set<string>(items.map((x) => x.id));
    const itemById = new Map<string, Item>(allItems.map((x) => [x.id, x]));

    // Asegurar que todo nodo visible tenga su cadena de padres conectada hasta Nivel 1
    items.forEach((it) => {
      let currParent = it.parentId;
      while (currParent) {
        visibleSet.add(currParent);
        const parentObj = itemById.get(currParent);
        currParent = parentObj?.parentId;
      }
    });

    const orderedVisible = allItems.filter((it) => visibleSet.has(it.id));
    const r: Item[] = [];
    const cMap = new Map<string, Item[]>();
    let agCount = 0;
    let pqCount = 0;

    orderedVisible.forEach((it) => {
      if (!it.parentId) {
        r.push(it);
      } else {
        if (!cMap.has(it.parentId)) cMap.set(it.parentId, []);
        cMap.get(it.parentId)!.push(it);

        const hasFullChildren = (fullChildrenMap.get(it.id) || []).length > 0;
        if (hasFullChildren) agCount++;
        else pqCount++;
      }
    });

    return {
      roots: r,
      childrenMap: cMap,
      totalAgrupadores: agCount,
      totalPaquetes: pqCount,
    };
  }, [items, allItems, fullChildrenMap]);

  const projectDates = useMemo(() => getCalculatedDates('PROJECT_ROOT'), [getCalculatedDates]);

  // Verificar si targetId es descendiente de sourceId (prevención de ciclos)
  const isDescendantOf = useCallback(
    (targetId: string, sourceId: string): boolean => {
      let curr = allItems.find((x) => x.id === targetId)?.parentId;
      while (curr) {
        if (curr === sourceId) return true;
        curr = allItems.find((x) => x.id === curr)?.parentId;
      }
      return false;
    },
    [allItems]
  );

  // Validación estricta de movimiento y reordenamiento jerárquico
  const evaluateDrop = useCallback(
    (sourceId: string | null, targetId: string): DropEvaluation => {
      if (!sourceId || sourceId === targetId) return { valid: false };
      const dragged = allItems.find((x) => x.id === sourceId);
      const target = allItems.find((x) => x.id === targetId);
      if (!dragged || !target) return { valid: false };

      if (isDescendantOf(target.id, dragged.id)) {
        return { valid: false, hint: 'No se puede mover dentro de su propio descendiente' };
      }

      const draggedCat = getNodeCategory(dragged);
      const targetCat = getNodeCategory(target);

      if (draggedCat === 'PAQUETE') {
        if (targetCat === 'COMPONENTE' || targetCat === 'AGRUPADOR') {
          return {
            valid: true,
            mode: 'reparent',
            hint: `Asignar a ${target.code}`,
          };
        }
        if (targetCat === 'PAQUETE') {
          return {
            valid: true,
            mode: 'reorder',
            hint: `Reordenar junto a ${target.code}`,
          };
        }
      }

      if (draggedCat === 'AGRUPADOR') {
        if (targetCat === 'COMPONENTE') {
          return {
            valid: true,
            mode: 'reparent',
            hint: `Mover agrupador a ${target.code}`,
          };
        }
        if (targetCat === 'AGRUPADOR') {
          return {
            valid: true,
            mode: 'reorder',
            hint: `Reordenar junto a ${target.code}`,
          };
        }
        if (targetCat === 'PAQUETE') {
          const targetParent = allItems.find((x) => x.id === target.parentId);
          // Solo válido si el paquete cuelga directamente de un Componente (Nivel 2)
          if (targetParent && !targetParent.parentId) {
            return {
              valid: true,
              mode: 'reorder',
              hint: `Reordenar junto a ${target.code}`,
            };
          }
          return {
            valid: false,
            hint: 'Un agrupador no puede ubicarse en el nivel terminal',
          };
        }
      }

      if (draggedCat === 'COMPONENTE') {
        if (targetCat === 'COMPONENTE') {
          return {
            valid: true,
            mode: 'reorder',
            hint: `Reordenar junto a ${target.code}`,
          };
        }
        return {
          valid: false,
          hint: 'Un componente solo puede reordenarse en el Nivel 1',
        };
      }

      return { valid: false };
    },
    [allItems, getNodeCategory, isDescendantOf]
  );

  // Manejadores Drag & Drop
  const handleDragStart = (e: React.DragEvent, item: Item) => {
    e.stopPropagation();
    setDraggedId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: Item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === targetItem.id) return;
    const evalResult = evaluateDrop(draggedId, targetItem.id);
    e.dataTransfer.dropEffect = evalResult.valid ? 'move' : 'none';
    if (hoverTargetId !== targetItem.id) {
      setHoverTargetId(targetItem.id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetItem: Item) => {
    e.stopPropagation();
    if (hoverTargetId === targetItem.id) {
      setHoverTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetItem: Item) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setHoverTargetId(null);

    if (!sourceId || sourceId === targetItem.id) return;
    const evalResult = evaluateDrop(sourceId, targetItem.id);
    if (evalResult.valid && evalResult.mode && onMoveNode) {
      // Si se mueve dentro de un contenedor colapsado, desplegarlo automáticamente
      if (evalResult.mode === 'reparent') {
        setCollapsedIds((prev) => ({ ...prev, [targetItem.id]: false }));
      }
      onMoveNode(sourceId, targetItem.id, evalResult.mode);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setHoverTargetId(null);
  };

  // Expandir / Contraer ramas
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    setCollapsedIds({});
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    allItems.forEach((it) => {
      if ((fullChildrenMap.get(it.id) || []).length > 0) {
        next[it.id] = true;
      }
    });
    setCollapsedIds(next);
  };

  const handleFitView = useCallback(() => {
    const container = canvasScrollRef.current;
    const stage = treeStageRef.current;
    if (!container || !stage) {
      setZoomLevel(100);
      return;
    }
    const currentScale = (zoomLevel || 100) / 100;
    const naturalWidth = (stage.scrollWidth || stage.offsetWidth) / (currentScale || 1);
    const availableWidth = container.clientWidth - 48;
    if (naturalWidth > 0 && availableWidth > 0) {
      const idealZoom = Math.min(100, Math.max(45, Math.round((availableWidth / naturalWidth) * 100)));
      setZoomLevel(idealZoom);
    } else {
      setZoomLevel(100);
    }
    requestAnimationFrame(() => {
      if (container) {
        container.scrollTo({
          left: Math.max(0, (container.scrollWidth - container.clientWidth) / 2),
          top: 0,
          behavior: 'smooth',
        });
      }
    });
  }, [zoomLevel, setZoomLevel]);

  useEffect(() => {
    if (fitViewTrigger && fitViewTrigger > 0) {
      handleFitView();
    }
  }, [fitViewTrigger, handleFitView]);

  // Soporte de zoom interactivo en EDT (Ctrl + Rueda de mouse o Trackpad pinch)
  useEffect(() => {
    const el = canvasScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 10 : -10;
        setZoomLevel((prev) => prev + delta);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoomLevel]);

  const handleAutoSortClick = () => {
    setCollapsedIds({});
    if (onAutoSort) onAutoSort();
    requestAnimationFrame(() => {
      const container = canvasScrollRef.current;
      if (container) {
        container.scrollTo({
          left: Math.max(0, (container.scrollWidth - container.clientWidth) / 2),
          top: 0,
          behavior: 'smooth',
        });
      }
    });
  };

  // Sincronización del minimapa con el scroll del lienzo
  const updateMinimapViewport = useCallback(() => {
    const el = canvasScrollRef.current;
    if (!el) return;
    const sw = Math.max(1, el.scrollWidth);
    const sh = Math.max(1, el.scrollHeight);
    const cw = el.clientWidth;
    const ch = el.clientHeight;

    setViewportRect({
      left: Math.min(1, Math.max(0, el.scrollLeft / sw)),
      top: Math.min(1, Math.max(0, el.scrollTop / sh)),
      width: Math.min(1, Math.max(0.08, cw / sw)),
      height: Math.min(1, Math.max(0.12, ch / sh)),
    });
  }, []);

  useEffect(() => {
    updateMinimapViewport();
    const timer = setTimeout(updateMinimapViewport, 120);
    window.addEventListener('resize', updateMinimapViewport);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateMinimapViewport);
    };
  }, [updateMinimapViewport, zoomLevel, collapsedIds, items]);

  const scrollCanvasFromMinimapPoint = (clientX: number, clientY: number) => {
    const track = minimapTrackRef.current;
    const canvas = canvasScrollRef.current;
    if (!track || !canvas) return;

    const rect = track.getBoundingClientRect();
    const relX = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const relY = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));

    const targetLeft = relX * canvas.scrollWidth - canvas.clientWidth / 2;
    const targetTop = relY * canvas.scrollHeight - canvas.clientHeight / 2;

    canvas.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: 'auto',
    });
    updateMinimapViewport();
  };

  const handleMinimapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isDraggingMinimapRef.current = true;
    scrollCanvasFromMinimapPoint(e.clientX, e.clientY);

    const onMove = (ev: MouseEvent) => {
      if (!isDraggingMinimapRef.current) return;
      scrollCanvasFromMinimapPoint(ev.clientX, ev.clientY);
    };
    const onUp = () => {
      isDraggingMinimapRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Clases dinámicas de Drag & Drop para cada tarjeta
  const getDragStateClasses = (itemId: string): { className: string; hint?: string | undefined } => {
    if (!draggedId) return { className: '' };
    if (draggedId === itemId) return { className: 'edt-dragging-source' };
    if (hoverTargetId === itemId) {
      const ev = evaluateDrop(draggedId, itemId);
      return {
        className: ev.valid ? 'edt-drop-valid' : 'edt-drop-invalid',
        hint: ev.hint,
      };
    }
    return { className: '' };
  };

  // Renderizador de Tarjeta Terminal: Paquete de Trabajo (Rosado suave, sin %)
  const renderPaqueteCard = (pkg: Item) => {
    const isSelected = selectedId === pkg.id;
    const dragInfo = getDragStateClasses(pkg.id);

    return (
      <div
        key={pkg.id}
        draggable
        onDragStart={(e) => handleDragStart(e, pkg)}
        onDragOver={(e) => handleDragOver(e, pkg)}
        onDragLeave={(e) => handleDragLeave(e, pkg)}
        onDrop={(e) => handleDrop(e, pkg)}
        onDragEnd={handleDragEnd}
        className={`organigrama-card paquete-card ${isSelected ? 'selected' : ''} ${dragInfo.className}`}
        onClick={() => onSelectItem(pkg)}
        title={`${pkg.code} ${pkg.name} · Arrastra para mover o clic para ver detalle`}
      >
        <span className="edt-junction-dot top" />
        {dragInfo.hint && <span className="edt-drop-hint-pill">{dragInfo.hint}</span>}

        <div className="edt-pkg-header">
          <b className="edt-pkg-code">{pkg.code}</b>
          <span className="edt-pkg-title">{pkg.name}</span>
        </div>

        <div className="edt-pkg-footer">
          <span className="edt-node-dates">
            {formatDatePE(pkg.start)} – {formatDatePE(pkg.end)}
          </span>
          {pkg.status && (
            <span className={`edt-status-dot-tag ${pkg.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {pkg.status}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="organigrama-wbs-container">
      {/* Barra de controles superior de la EDT (Sin herramienta mano) */}
      <div className="organigrama-toolbar" id="edt-workspace-toolbar">
        <div className="organigrama-legend-bar">
          <span className="legend-chip root">
            <span className="chip-dot" style={{ background: '#3b82f6' }} />
            Proyecto
          </span>
          <span className="legend-chip comp">
            <span className="chip-dot" style={{ background: '#60a5fa' }} />
            Componentes ({roots.length})
          </span>
          <span className="legend-chip subcomp">
            <span className="chip-dot" style={{ background: '#eab308' }} />
            Agrupadores ({totalAgrupadores})
          </span>
          <span className="legend-chip paquete">
            <span className="chip-dot" style={{ background: '#f43f5e' }} />
            Paquetes de trabajo ({totalPaquetes})
          </span>
        </div>

        <div className="edt-actions-toolbar">
          <button
            type="button"
            className="edt-tool-btn active-cursor"
            title="Modo selección y movimiento jerárquico activo"
          >
            <MousePointer size={13} />
          </button>

          <button
            type="button"
            className="edt-tool-btn"
            onClick={handleAutoSortClick}
            title="Reorganizar automáticamente según jerarquía WBS"
          >
            <ArrowUpDown size={13} />
            <span>Autoordenar</span>
          </button>

          <button
            type="button"
            className="edt-tool-btn"
            onClick={handleExpandAll}
            title="Expandir todos los niveles de la EDT"
          >
            <PlusCircle size={13} />
            <span>Expandir todo</span>
          </button>

          <button
            type="button"
            className="edt-tool-btn"
            onClick={handleCollapseAll}
            title="Contraer todas las ramas al nivel de componentes"
          >
            <MinusCircle size={13} />
            <span>Contraer todo</span>
          </button>

          <div className="organigrama-zoom-controls">
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
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
              onClick={handleFitView}
              title="Ajustar vista al contenedor"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Lienzo estructurado de arriba hacia abajo con scroll bidireccional */}
      <div
        ref={canvasScrollRef}
        className="organigrama-canvas-scroll"
        onScroll={updateMinimapViewport}
      >
        <div
          ref={treeStageRef}
          className="organigrama-tree-stage"
          style={{
            zoom: `${zoomLevel}%`,
            ...(typeof CSS !== 'undefined' && !CSS.supports?.('zoom', '1')
              ? {
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }
              : {}),
          }}
        >
          {/* ══════════════════════════════════════════════════════════════
              NIVEL 0: NODO RAÍZ DEL PROYECTO (AZUL DESTACADO)
              ══════════════════════════════════════════════════════════════ */}
          <div className="organigrama-root-wrapper">
            <div className="organigrama-card root-card">
              <div className="edt-node-icon-box root-icon">
                <Folder size={20} strokeWidth={2} />
              </div>
              <div className="edt-node-body">
                <h2 className="edt-root-title">{projectName}</h2>
                <span className="edt-root-dates">
                  {formatDatePE(projectDates.start)} – {formatDatePE(projectDates.end)}
                </span>
              </div>
              {roots.length > 0 && <span className="edt-junction-dot bottom" />}
            </div>

            {roots.length > 0 && (
              <div className="organigrama-trunk-down">
                <span className="edt-junction-dot bottom" />
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              NIVEL 1: COMPONENTES PRINCIPALES (DISTRIBUCIÓN AUTOMÁTICA)
              ══════════════════════════════════════════════════════════════ */}
          {roots.length > 0 && (
            <div className="edt-tree-row level-1-row">
              {roots.map((comp) => {
                const childrenL2 = childrenMap.get(comp.id) || [];
                const isCompCollapsed = Boolean(collapsedIds[comp.id]);
                const isCompSelected = selectedId === comp.id;
                const hasSub = childrenL2.length > 0;
                const compDates = getCalculatedDates(comp.id);
                const compDrag = getDragStateClasses(comp.id);

                return (
                  <div key={comp.id} className="edt-tree-col comp-col">
                    <div className="edt-feeder-down" />

                    {/* Tarjeta de Componente (Azul suave, sin %) */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp)}
                      onDragOver={(e) => handleDragOver(e, comp)}
                      onDragLeave={(e) => handleDragLeave(e, comp)}
                      onDrop={(e) => handleDrop(e, comp)}
                      onDragEnd={handleDragEnd}
                      className={`organigrama-card comp-card ${isCompSelected ? 'selected' : ''} ${compDrag.className}`}
                      onClick={() => onSelectItem(comp)}
                      title={`${comp.code} ${comp.name}`}
                    >
                      <span className="edt-junction-dot top" />
                      {compDrag.hint && <span className="edt-drop-hint-pill">{compDrag.hint}</span>}

                      <div className="edt-node-icon-box comp-icon">
                        <Layers size={18} strokeWidth={2} />
                      </div>

                      <div className="edt-node-body">
                        <div className="edt-node-title-row">
                          <span className="edt-node-title">
                            <b>{comp.code.endsWith('.') ? comp.code : `${comp.code}.`}</b> {comp.name}
                          </span>
                          {hasSub && (
                            <button
                              type="button"
                              className="edt-collapse-btn"
                              onClick={(e) => toggleCollapse(comp.id, e)}
                              title={isCompCollapsed ? 'Expandir componente' : 'Contraer componente'}
                            >
                              {isCompCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                        <span className="edt-node-dates">
                          {formatDatePE(compDates.start)} – {formatDatePE(compDates.end)}
                        </span>
                      </div>

                      {!isCompCollapsed && hasSub && <span className="edt-junction-dot bottom" />}
                    </div>

                    {/* ══════════════════════════════════════════════════════════════
                        NIVEL 2: AGRUPADORES (AMARILLO) O PAQUETES DIRECTOS (ROSADO)
                        ══════════════════════════════════════════════════════════════ */}
                    {!isCompCollapsed && hasSub && (
                      <div className="edt-subtree-wrap">
                        <div className="edt-trunk-down">
                          {childrenL2.length > 1 && <span className="edt-junction-dot bottom" />}
                        </div>

                        <div className="edt-tree-row level-2-row">
                          {childrenL2.map((item) => {
                            const childrenL3 = childrenMap.get(item.id) || [];
                            const isAgrupador = (fullChildrenMap.get(item.id) || []).length > 0;
                            const isSubCollapsed = Boolean(collapsedIds[item.id]);
                            const isItemSelected = selectedId === item.id;
                            const subDates = getCalculatedDates(item.id);
                            const subDrag = getDragStateClasses(item.id);

                            return (
                              <div key={item.id} className="edt-tree-col branch-col">
                                <div className="edt-feeder-down" />

                                {isAgrupador ? (
                                  <div className="edt-agrupador-group">
                                    {/* Tarjeta de Agrupador (Amarillo suave, sin %) */}
                                    <div
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, item)}
                                      onDragOver={(e) => handleDragOver(e, item)}
                                      onDragLeave={(e) => handleDragLeave(e, item)}
                                      onDrop={(e) => handleDrop(e, item)}
                                      onDragEnd={handleDragEnd}
                                      className={`organigrama-card subcomp-card ${isItemSelected ? 'selected' : ''} ${subDrag.className}`}
                                      onClick={() => onSelectItem(item)}
                                      title={`${item.code} ${item.name} · Agrupador`}
                                    >
                                      <span className="edt-junction-dot top" />
                                      {subDrag.hint && <span className="edt-drop-hint-pill">{subDrag.hint}</span>}

                                      <div className="edt-node-icon-box subcomp-icon">
                                        <Calendar size={16} strokeWidth={2} />
                                      </div>

                                      <div className="edt-node-body">
                                        <div className="edt-node-title-row">
                                          <span className="edt-node-title">
                                            <b>{item.code}</b> {item.name}
                                          </span>
                                          {childrenL3.length > 0 && (
                                            <button
                                              type="button"
                                              className="edt-collapse-btn sub"
                                              onClick={(e) => toggleCollapse(item.id, e)}
                                              title={isSubCollapsed ? 'Expandir agrupador' : 'Contraer agrupador'}
                                            >
                                              {isSubCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                            </button>
                                          )}
                                        </div>
                                        <span className="edt-node-dates">
                                          {formatDatePE(subDates.start)} – {formatDatePE(subDates.end)}
                                        </span>
                                      </div>

                                      {!isSubCollapsed && childrenL3.length > 0 && (
                                        <span className="edt-junction-dot bottom" />
                                      )}
                                    </div>

                                    {/* ══════════════════════════════════════════════════════════════
                                        NIVEL 3: PAQUETES DE TRABAJO BAJO AGRUPADOR (ROSADO)
                                        ══════════════════════════════════════════════════════════════ */}
                                    {!isSubCollapsed && childrenL3.length > 0 && (
                                      <div className="edt-subtree-wrap">
                                        <div className="edt-trunk-down">
                                          {childrenL3.length > 1 && <span className="edt-junction-dot bottom" />}
                                        </div>

                                        <div className="edt-tree-row level-3-row">
                                          {childrenL3.map((pkg) => (
                                            <div key={pkg.id} className="edt-tree-col pkg-col">
                                              <div className="edt-feeder-down" />
                                              {renderPaqueteCard(pkg)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* Paquete de trabajo directo bajo Componente */
                                  renderPaqueteCard(item)
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
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MINIMAPA DE NAVEGACIÓN (ESQUINA INFERIOR DERECHA)
          ══════════════════════════════════════════════════════════════ */}
      <div className="edt-minimap-card" title="Mapa de navegación de la EDT (clic o arrastra para desplazarte)">
        <button
          type="button"
          className="edt-minimap-fit-btn"
          onClick={handleFitView}
          title="Ajustar vista completa"
        >
          <Maximize2 size={11} />
        </button>

        <div
          ref={minimapTrackRef}
          className="edt-minimap-stage"
          onMouseDown={handleMinimapMouseDown}
        >
          {/* Esquema proporcional de la jerarquía */}
          <div className="minimap-tree-preview">
            <div className="minimap-root-node" />
            <div className="minimap-v-line" />
            <div className="minimap-comp-row">
              {roots.slice(0, 8).map((comp) => {
                const subItems = childrenMap.get(comp.id) || [];
                const isCollapsed = Boolean(collapsedIds[comp.id]);
                const hasAgrupador = subItems.some((s) => (fullChildrenMap.get(s.id) || []).length > 0);
                return (
                  <div key={comp.id} className="minimap-comp-branch">
                    <div className="minimap-comp-node" />
                    {!isCollapsed && subItems.length > 0 && (
                      <>
                        <div className="minimap-v-line short" />
                        <div className="minimap-sub-row">
                          <div className={`minimap-leaf-node ${hasAgrupador ? 'yellow' : 'pink'}`} />
                          {subItems.length > 1 && <div className="minimap-leaf-node pink" />}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rectángulo indicador del área visible actual */}
          <div
            className="edt-minimap-viewport"
            style={{
              left: `${viewportRect.left * 100}%`,
              top: `${viewportRect.top * 100}%`,
              width: `${viewportRect.width * 100}%`,
              height: `${viewportRect.height * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CronogramaOrganigramaView;
