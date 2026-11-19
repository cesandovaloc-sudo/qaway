import { claveTareasLocal } from '../../services/gestorTareasLocalService';
import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MoreVertical,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getLinkedTasksSummary, type Item } from './Reportes2View';

interface CronogramaArbolViewProps {
  items: Item[];
  allItems: Item[];
  selectedId: string | null;
  onSelectItem: (item: Item) => void;
  onAddItem?: (kind: 'hito' | 'subproceso', parentId?: string) => void;
  formatDatePE: (iso: string) => string;
}

// Iniciales de gestor
const getInitials = (name?: string) => {
  if (!name || name === 'Sin asignar') return 'SA';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
};

// Color temático para avatar
const getAvatarColor = (name?: string) => {
  if (!name || name === 'Sin asignar') return '#94a3b8';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#0284c7', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];
  return colors[Math.abs(hash) % colors.length];
};

export const CronogramaArbolView: React.FC<CronogramaArbolViewProps> = ({
  items,
  allItems,
  selectedId,
  onSelectItem,
  onAddItem,
  formatDatePE,
}) => {
  // Estado local de colapso de nodos en el árbol
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rawTasks = useMemo(() => {
    try {
      const saved = localStorage.getItem(claveTareasLocal());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [items]);

  // Agrupación jerárquica en base a items
  const { hitos, subprocesosByParent } = useMemo(() => {
    const hitosList = items.filter((x) => !x.parentId);
    const subMap: Record<string, Item[]> = {};

    items.forEach((x) => {
      if (x.parentId) {
        if (!subMap[x.parentId]) subMap[x.parentId] = [];
        subMap[x.parentId]?.push(x);
      }
    });

    return { hitos: hitosList, subprocesosByParent: subMap };
  }, [items]);

  // Cálculo de avance consolidado del proyecto
  const overallProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <div className="arbol-wbs-container">
      {/* ── Breadcrumb de Navegación Jerárquica ── */}
      <div className="arbol-breadcrumb-bar">
        <span className="arbol-crumb root">Distribución de Materiales DOT 2027</span>
        <span className="arbol-crumb-sep">/</span>
        <span className="arbol-crumb active">Estructura Desglosada de Trabajo (WBS)</span>
      </div>

      <div className="arbol-tree-wrapper">
        {/* ── Tarjeta Raíz del Proyecto Maestro ── */}
        <div className="arbol-node-root">
          <div className="arbol-card master-project">
            <div className="arbol-card-left">
              <div className="arbol-master-icon">
                <FolderOpen size={18} color="#ffffff" />
              </div>
              <div className="arbol-card-titles">
                <div className="arbol-master-title">Distribución de Materiales DOT 2027</div>
                <div className="arbol-card-sub">Distribución Nacional y Regional de Materiales Educativos</div>
              </div>
            </div>

            <div className="arbol-card-center">
              <div className="arbol-metric-box">
                <span className="arbol-metric-num">{overallProgress}%</span>
                <div className="arbol-progress-track">
                  <div className="arbol-progress-fill" style={{ width: `${overallProgress}%`, backgroundColor: '#0066ff' }} />
                </div>
              </div>
              <div className="arbol-date-range">
                <Calendar size={13} style={{ color: '#64748b', marginRight: 4 }} />
                <span>04 set. 2026 – 30 abr. 2027</span>
              </div>
            </div>

            <div className="arbol-card-right">
              <span className="arbol-count-badge">{hitos.length} Componentes</span>
            </div>
          </div>

          {/* ── Ramas del Nivel 1 (Componentes Principales) ── */}
          <div className="arbol-branches-level1">
            {hitos.map((hito, hIdx) => {
              const isHitoCollapsed = collapsedNodes[hito.id];
              const children = subprocesosByParent[hito.id] || [];
              const isDirectDeliverable = children.length === 0;
              const taskSummary = isDirectDeliverable ? getLinkedTasksSummary(hito, rawTasks) : null;
              const isSelected = selectedId === hito.id;

              // Color de barra según avance
              const barColor =
                hito.progress >= 100
                  ? '#10b981'
                  : isDirectDeliverable
                  ? '#e11d48'
                  : hito.progress >= 40
                  ? '#0066ff'
                  : hito.progress > 0
                  ? '#f59e0b'
                  : '#cbd5e1';

              return (
                <div key={hito.id} className="arbol-branch-item">
                  {/* Conector vertical y brazo hacia el nodo */}
                  <div className="arbol-connector-arm" />

                  {/* Tarjeta del Componente o Entregable Directo (Nivel 1 sin subdivisiones) */}
                  <div
                    className={`arbol-card hito-card ${isDirectDeliverable ? 'direct-deliverable-card' : ''} ${isSelected ? 'selected' : ''}`}
                    style={
                      isDirectDeliverable
                        ? { borderLeft: '3.5px solid #e11d48', background: '#fffbfc' }
                        : undefined
                    }
                    onClick={() => onSelectItem(hito)}
                  >
                    <div className="arbol-card-left">
                      {!isDirectDeliverable ? (
                        <button
                          type="button"
                          className="arbol-collapse-btn"
                          onClick={(e) => toggleCollapse(hito.id, e)}
                          title={isHitoCollapsed ? 'Expandir subcomponentes' : 'Colapsar subcomponentes'}
                        >
                          {isHitoCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                        </button>
                      ) : (
                        <div className="arbol-collapse-spacer" />
                      )}

                      <div
                        className="arbol-node-icon hito-icon"
                        style={
                          isDirectDeliverable
                            ? { background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }
                            : undefined
                        }
                      >
                        {isDirectDeliverable ? (
                          <FileText size={16} color="#e11d48" />
                        ) : (
                          <Folder size={16} color="#0066ff" />
                        )}
                      </div>

                      <div className="arbol-card-titles">
                        <div className="arbol-card-title">
                          <span className="arbol-code">{hito.code.endsWith('.') ? hito.code : `${hito.code}.`}</span> {hito.name}
                        </div>
                        <div className="arbol-card-sub">
                          {isDirectDeliverable ? (
                            <span style={{ color: '#be123c', fontWeight: 600 }}>
                              Entregable Directo · {hito.deliverable || 'Paquete ejecutable'}
                            </span>
                          ) : hito.distrito || hito.sede ? (
                            `${hito.distrito || ''} · ${hito.sede || ''}`
                          ) : (
                            'Alcance Regional'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="arbol-card-center">
                      <div className="arbol-metric-box">
                        <span className="arbol-metric-num">{hito.progress}%</span>
                        <div className="arbol-progress-track">
                          <div
                            className="arbol-progress-fill"
                            style={{ width: `${hito.progress}%`, backgroundColor: barColor }}
                          />
                        </div>
                      </div>

                      <div className="arbol-date-range">
                        <span>{formatDatePE(hito.start)} – {formatDatePE(hito.end)}</span>
                      </div>
                    </div>

                    <div className="arbol-card-right">
                      {isDirectDeliverable && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(225, 29, 72, 0.08)',
                            color: '#be123c',
                            border: '1px solid rgba(225, 29, 72, 0.2)',
                          }}
                          title="Tareas operativas asociadas a este entregable directo"
                        >
                          📋 {taskSummary ? `${taskSummary.completed}/${taskSummary.total}` : `${hito.done || 0}/${hito.tasks || 0}`} Tareas
                        </span>
                      )}

                      <span className={`arbol-status-badge ${hito.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {hito.status}
                      </span>

                      {/* Avatar del gestor responsable */}
                      <span
                        className="arbol-user-avatar"
                        style={{ backgroundColor: getAvatarColor(hito.gestor) }}
                        title={`Responsable: ${hito.gestor || 'Sin asignar'}`}
                      >
                        {getInitials(hito.gestor)}
                      </span>
                    </div>
                  </div>

                  {/* ── Subprocesos / Nivel 2 y Nivel 3 ── */}
                  {!isHitoCollapsed && children.length > 0 && (
                    <div className="arbol-children-container">
                      {children.map((sub, sIdx) => {
                        const isSubCollapsed = collapsedNodes[sub.id];
                        const subChildren = subprocesosByParent[sub.id] || [];
                        const isSubSelected = selectedId === sub.id;

                        const subBarColor =
                          sub.progress >= 100 ? '#10b981' : sub.progress >= 40 ? '#0066ff' : sub.progress > 0 ? '#f59e0b' : '#cbd5e1';

                        return (
                          <div key={sub.id} className="arbol-sub-branch">
                            <div className="arbol-connector-arm sub" />

                            <div
                              className={`arbol-card sub-card ${isSubSelected ? 'selected' : ''}`}
                              onClick={() => onSelectItem(sub)}
                            >
                              <div className="arbol-card-left">
                                {subChildren.length > 0 ? (
                                  <button
                                    type="button"
                                    className="arbol-collapse-btn"
                                    onClick={(e) => toggleCollapse(sub.id, e)}
                                    title={isSubCollapsed ? 'Expandir' : 'Colapsar'}
                                  >
                                    {isSubCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                                  </button>
                                ) : (
                                  <div className="arbol-collapse-spacer" />
                                )}

                                <div className="arbol-node-icon sub-icon">
                                  <FileText size={15} color="#0284c7" />
                                </div>

                                <div className="arbol-card-titles">
                                  <div className="arbol-card-title sub-title">
                                    <span className="arbol-code">{sub.code}</span> {sub.name}
                                  </div>
                                  {sub.sede && <div className="arbol-card-sub">{sub.sede}</div>}
                                </div>
                              </div>

                              <div className="arbol-card-center">
                                <div className="arbol-metric-box">
                                  <span className="arbol-metric-num">{sub.progress}%</span>
                                  <div className="arbol-progress-track">
                                    <div
                                      className="arbol-progress-fill"
                                      style={{ width: `${sub.progress}%`, backgroundColor: subBarColor }}
                                    />
                                  </div>
                                </div>

                                <div className="arbol-date-range">
                                  <span>{formatDatePE(sub.start)} – {formatDatePE(sub.end)}</span>
                                </div>
                              </div>

                              <div className="arbol-card-right">
                                <span className={`arbol-status-badge ${sub.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {sub.status}
                                </span>

                                <span
                                  className="arbol-user-avatar"
                                  style={{ backgroundColor: getAvatarColor(sub.gestor) }}
                                  title={`Responsable: ${sub.gestor || 'Sin asignar'}`}
                                >
                                  {getInitials(sub.gestor)}
                                </span>
                              </div>
                            </div>

                            {/* Nivel 3 (Nietos / Actividades operativas si las hay) */}
                            {!isSubCollapsed && subChildren.length > 0 && (
                              <div className="arbol-leaf-container">
                                {subChildren.map((leaf) => {
                                  const isLeafSelected = selectedId === leaf.id;
                                  return (
                                    <div key={leaf.id} className="arbol-leaf-item">
                                      <div className="arbol-connector-arm leaf" />
                                      <div
                                        className={`arbol-card leaf-card ${isLeafSelected ? 'selected' : ''}`}
                                        onClick={() => onSelectItem(leaf)}
                                      >
                                        <div className="arbol-card-left">
                                          <div className="arbol-node-icon leaf-icon">
                                            {leaf.progress >= 100 ? (
                                              <CheckCircle2 size={14} color="#10b981" />
                                            ) : (
                                              <Clock size={14} color="#64748b" />
                                            )}
                                          </div>
                                          <div className="arbol-card-title leaf-title">
                                            <span className="arbol-code">{leaf.code}</span> {leaf.name}
                                          </div>
                                        </div>

                                        <div className="arbol-card-center leaf-center">
                                          <span className="arbol-metric-num">{leaf.progress}%</span>
                                          <div className="arbol-progress-track leaf-track">
                                            <div
                                              className="arbol-progress-fill"
                                              style={{
                                                width: `${leaf.progress}%`,
                                                backgroundColor: leaf.progress >= 100 ? '#10b981' : '#0066ff',
                                              }}
                                            />
                                          </div>
                                          <div className="arbol-date-range">
                                            <span>{formatDatePE(leaf.start)} – {formatDatePE(leaf.end)}</span>
                                          </div>
                                        </div>

                                        <div className="arbol-card-right">
                                          <span className={`arbol-status-badge small ${leaf.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {leaf.status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
