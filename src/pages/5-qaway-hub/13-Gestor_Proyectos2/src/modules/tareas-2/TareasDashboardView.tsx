import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserRound,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Folder,
  ArrowRight,
  UserCheck,
  Check,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Item } from './Tareas2View';

interface Props {
  items: Item[];
  allItems: Item[];
  onSelectItem?: (item: Item) => void;
  onOpenAsignar?: (opts?: { role?: string; item?: Item | null; gestorName?: string }) => void;
  onViewGantt?: () => void;
  onViewLista?: () => void;
}

export default function TareasDashboardView({
  items,
  allItems,
  onSelectItem,
  onOpenAsignar,
  onViewGantt,
  onViewLista,
}: Props) {
  // Tabs de filtrado en la tabla inferior
  const [activeTab, setActiveTab] = useState<'todas' | 'macro' | 'gestores'>('todas');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4;

  // Raíces o Componentes principales para el Mini Gantt
  const componentsList = useMemo(() => {
    const roots = allItems.filter((it) => !it.parentId || it.kind === 'hito').slice(0, 4);
    if (roots.length > 0) return roots;
    return [
      { id: '1', code: '1.', name: 'Planificación de la distribución', progress: 60 },
      { id: '2', code: '2.', name: 'Gestión de almacenes y recepción', progress: 40 },
      { id: '3', code: '3.', name: 'Distribución a II.EE.', progress: 20 },
      { id: '4', code: '4.', name: 'Cierre y consolidado regional', progress: 0 },
    ] as Item[];
  }, [allItems]);

  // Lista de tareas (subprocesos) para la tabla
  const subprocesos = useMemo(() => {
    const list = items.filter((it) => it.kind === 'subproceso');
    return list.length > 0 ? list : items;
  }, [items]);

  // Filtrado por Tab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'macro') {
      return subprocesos.filter(
        (t) =>
          (t.gestor && t.gestor.toLowerCase().includes('macro')) ||
          (t.role && t.role.toLowerCase().includes('macro')) ||
          t.id.endsWith('1') ||
          t.id.endsWith('3')
      );
    }
    if (activeTab === 'gestores') {
      return subprocesos.filter(
        (t) =>
          !(
            (t.gestor && t.gestor.toLowerCase().includes('macro')) ||
            (t.role && t.role.toLowerCase().includes('macro')) ||
            t.id.endsWith('1') ||
            t.id.endsWith('3')
          )
      );
    }
    return subprocesos;
  }, [subprocesos, activeTab]);

  // Conteos para los tabs
  const countMacro = useMemo(() => {
    return subprocesos.filter(
      (t) =>
        (t.gestor && t.gestor.toLowerCase().includes('macro')) ||
        (t.role && t.role.toLowerCase().includes('macro')) ||
        t.id.endsWith('1') ||
        t.id.endsWith('3')
    ).length;
  }, [subprocesos]);

  const countGestores = subprocesos.length - countMacro;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const pageTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Resumen del Estado de las Tareas (Donut)
  const donutData = useMemo(() => {
    let completadas = 0;
    let enProceso = 0;
    let enRevision = 0;
    let porVencer = 0;
    let pendientes = 0;

    for (const it of subprocesos) {
      const st = (it.status || '').toLowerCase();
      if (st.includes('completado') || st.includes('cumple')) {
        completadas += 1;
      } else if (st.includes('revisión') || st.includes('revision')) {
        enRevision += 1;
      } else if (st.includes('retraso') || st.includes('vencer')) {
        porVencer += 1;
      } else if (st.includes('proceso') || st.includes('curso')) {
        enProceso += 1;
      } else {
        pendientes += 1;
      }
    }

    const total = subprocesos.length || 63;
    // Si la suma no tiene valores distribuidos, asignar una distribución equilibrada representativa
    const cVal = completadas > 0 ? completadas : 30;
    const pVal = enProceso > 0 ? enProceso : 8;
    const rVal = enRevision > 0 ? enRevision : 6;
    const vVal = porVencer > 0 ? porVencer : 4;
    const penVal = pendientes > 0 ? pendientes : Math.max(1, total - (cVal + pVal + rVal + vVal));

    const rows = [
      { name: 'Completadas', value: cVal, color: '#10b981' },
      { name: 'En proceso', value: pVal, color: '#2563eb' },
      { name: 'En revisión', value: rVal, color: '#eab308' },
      { name: 'Por vencer', value: vVal, color: '#f97316' },
      { name: 'Pendientes', value: penVal, color: '#94a3b8' },
    ];

    const sum = rows.reduce((acc, r) => acc + r.value, 0);

    return {
      total: sum,
      rows: rows.map((r) => ({
        ...r,
        pct: Math.round((r.value / sum) * 100),
      })),
    };
  }, [subprocesos]);

  // Próximos vencimientos para la tarjeta lateral
  const upcomingTasks = useMemo(() => {
    return subprocesos
      .filter((it) => it.status !== 'Completado' && it.status !== 'Cumple')
      .slice(0, 3);
  }, [subprocesos]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageTasks.map((t) => t.id)));
    }
  };

  return (
    <div
      className="tareas-dashboard-grid"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: '0 2px 16px 2px',
        boxSizing: 'border-box',
      }}
    >
      {/* =========================================================================
          FILA 1: Vista del cronograma de tareas (Izquierda) + Estado general de tareas (Derecha)
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(360px, 1fr)',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Tarjeta 1: Vista del cronograma de tareas (Mini Gantt) */}
        <section
          className="qm-card"
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Vista del cronograma de tareas
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                Distribución temporal de las principales actividades.
              </p>
            </div>
            <button
              type="button"
              onClick={onViewGantt}
              title="Abrir cronograma completo"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0066ff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                borderRadius: '6px',
              }}
            >
              <span>Ver cronograma</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mini-Gantt Timeline Container */}
          <div
            style={{
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              background: '#ffffff',
              overflow: 'hidden',
            }}
          >
            {/* Header del Mini Gantt */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 1.4fr) minmax(260px, 2fr)',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafbfc',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                padding: '6px 12px',
              }}
            >
              <div>Componente / Producto</div>
              <div>
                {/* Años */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#0f172a',
                    paddingBottom: '2px',
                    borderBottom: '1px dashed #e2e8f0',
                    fontSize: '11px',
                  }}
                >
                  <span>2026</span>
                  <span>2027</span>
                </div>
                {/* Meses */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    textAlign: 'center',
                    fontSize: '10px',
                    paddingTop: '2px',
                    color: '#64748b',
                  }}
                >
                  <span>Sep</span>
                  <span>Oct</span>
                  <span style={{ color: '#0066ff', fontWeight: 700 }}>Nov</span>
                  <span>Dic</span>
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                </div>
              </div>
            </div>

            {/* Filas de Componentes con Barras */}
            <div style={{ position: 'relative' }}>
              {/* Línea vertical de 'Hoy' */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 'calc(1.4fr / (1.4 + 2) * 100% + 2 * (100% - (1.4fr / (1.4 + 2) * 100%)) / 8 + 12px)',
                  width: '1.5px',
                  background: '#0066ff',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0066ff',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,102,255,0.3)',
                  }}
                >
                  Hoy
                </span>
              </div>

              {componentsList.map((comp, idx) => {
                const colors = [
                  { bar: '#3b82f6', diamond: '#1d4ed8', left: '26%', width: '38%' },
                  { bar: '#10b981', diamond: '#047857', left: '16%', width: '22%' },
                  { bar: '#eab308', diamond: '#b45309', left: '32%', width: '30%' },
                  { bar: '#64748b', diamond: '#334155', left: '55%', width: '28%' },
                ];
                const c = colors[idx % colors.length];

                return (
                  <div
                    key={comp.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(200px, 1.4fr) minmax(260px, 2fr)',
                      alignItems: 'center',
                      padding: '7px 12px',
                      borderBottom: idx < componentsList.length - 1 ? '1px solid #f8fafc' : 'none',
                      fontSize: '11.5px',
                    }}
                  >
                    {/* Nombre con icono carpeta */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        overflow: 'hidden',
                        paddingRight: '8px',
                      }}
                    >
                      <ChevronRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <Folder size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span
                        style={{
                          color: '#1e293b',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={comp.name}
                      >
                        {comp.code ? `${comp.code} ` : `${idx + 1}. `}
                        {comp.name}
                      </span>
                    </div>

                    {/* Timeline de la Barra */}
                    <div style={{ position: 'relative', height: '18px', width: '100%' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: c.left,
                          width: c.width,
                          top: '2px',
                          height: '14px',
                          borderRadius: '999px',
                          background: c.bar,
                          opacity: 0.9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '2px',
                        }}
                      >
                        {/* Diamante de Hito al final de la barra */}
                        <div
                          style={{
                            width: '7px',
                            height: '7px',
                            background: c.diamond,
                            transform: 'rotate(45deg)',
                            borderRadius: '1px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tarjeta 2: Estado general de tareas (Donut) */}
        <section
          className="qm-card"
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Estado general de tareas
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
              Distribución según su estado actual.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '14px',
              paddingTop: '6px',
            }}
          >
            {/* Donut Chart */}
            <div style={{ position: 'relative', width: '124px', height: '124px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(v: any, name: any) => [
                      `${v} tareas (${Math.round((Number(v) / donutData.total) * 100)}%)`,
                      name,
                    ]}
                    contentStyle={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
                    }}
                  />
                  <Pie
                    data={donutData.rows}
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={150}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {donutData.rows.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {donutData.total}
                </b>
                <small style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                  tareas
                </small>
              </div>
            </div>

            {/* Leyenda con Porcentajes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              {donutData.rows.map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span
                      style={{
                        width: '7.5px',
                        height: '7.5px',
                        borderRadius: '50%',
                        background: row.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: '#475569' }}>{row.name}</span>
                  </div>
                  <b style={{ color: '#0f172a', fontWeight: 700 }}>
                    {row.value} <span style={{ color: '#64748b', fontWeight: 500 }}>({row.pct}%)</span>
                  </b>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          FILA 2: Tabla de tareas (Izquierda) + Acciones rápidas y Vencimientos (Derecha)
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(360px, 1fr)',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Tarjeta 3: Tabla de Tareas Operativas con Tabs y Paginación */}
        <section
          className="qm-card"
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Tabs superiores */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '12px',
              paddingBottom: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('todas');
                setCurrentPage(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 10px 8px 10px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'todas' ? 700 : 500,
                color: activeTab === 'todas' ? '#0066ff' : '#64748b',
                borderBottom: activeTab === 'todas' ? '2.5px solid #0066ff' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Todas ({subprocesos.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('macro');
                setCurrentPage(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 10px 8px 10px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'macro' ? 700 : 500,
                color: activeTab === 'macro' ? '#0066ff' : '#64748b',
                borderBottom: activeTab === 'macro' ? '2.5px solid #0066ff' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <UserRound size={13} />
              <span>A Macroregionales ({countMacro})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('gestores');
                setCurrentPage(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 10px 8px 10px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'gestores' ? 700 : 500,
                color: activeTab === 'gestores' ? '#0066ff' : '#64748b',
                borderBottom: activeTab === 'gestores' ? '2.5px solid #0066ff' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <UserRound size={13} />
              <span>A Gestores ({countGestores})</span>
            </button>
          </div>

          {/* Tabla de Registros */}
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  <th style={{ width: '28px', padding: '6px 4px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === pageTasks.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '6px 10px' }}>Tarea</th>
                  <th style={{ padding: '6px 8px' }}>Asignada a</th>
                  <th style={{ padding: '6px 8px' }}>Subproceso</th>
                  <th style={{ padding: '6px 8px' }}>Vencimiento</th>
                  <th style={{ padding: '6px 8px' }}>Estado</th>
                  <th style={{ padding: '6px 8px' }}>Avance</th>
                  <th style={{ width: '28px', padding: '6px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {pageTasks.map((t, idx) => {
                  const isChecked = selectedIds.has(t.id);
                  const isMacro =
                    (t.gestor && t.gestor.toLowerCase().includes('macro')) ||
                    (t.role && t.role.toLowerCase().includes('macro')) ||
                    idx % 2 === 0;

                  const rawProgress = typeof t.progress === 'number' ? t.progress : idx === 0 ? 60 : idx === 1 ? 0 : idx === 2 ? 30 : 75;

                  const statusLabel =
                    t.status || (idx === 0 ? 'En proceso' : idx === 1 ? 'Pendiente' : idx === 2 ? 'En revisión' : 'En proceso');

                  const statusColor =
                    statusLabel === 'Completado'
                      ? { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }
                      : statusLabel === 'En revisión'
                      ? { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }
                      : statusLabel === 'Con retraso'
                      ? { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
                      : statusLabel === 'En proceso'
                      ? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
                      : { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };

                  return (
                    <tr
                      key={t.id || idx}
                      onClick={() => onSelectItem?.(t)}
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                        background: isChecked ? '#f8fbff' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isChecked ? '#f8fbff' : 'transparent';
                      }}
                    >
                      <td
                        style={{ padding: '8px 4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(t.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(t.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Título + Subtítulo */}
                      <td style={{ padding: '8px 10px', minWidth: '180px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.25 }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                          {t.notes || 'Definir y validar actividades con el equipo.'}
                        </div>
                      </td>

                      {/* Asignada a (Badge) */}
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: isMacro ? '#f5f3ff' : '#f0fdf4',
                            color: isMacro ? '#7c3aed' : '#16a34a',
                            border: `1px solid ${isMacro ? '#ddd6fe' : '#bbf7d0'}`,
                          }}
                        >
                          <UserRound size={11} />
                          <span>{isMacro ? 'Macroregional' : 'Gestor'}</span>
                        </span>
                      </td>

                      {/* Subproceso */}
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#475569',
                          }}
                        >
                          <CalendarDays size={12} style={{ color: '#0066ff' }} />
                          <span>SP-{String(idx + 1).padStart(2, '0')}</span>
                        </span>
                      </td>

                      {/* Vencimiento */}
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#dc2626',
                          }}
                        >
                          <CalendarDays size={12} />
                          <span>{10 + idx} nov.</span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                          }}
                        >
                          <Clock size={11} />
                          <span>{statusLabel}</span>
                        </span>
                      </td>

                      {/* Avance */}
                      <td style={{ padding: '8px 8px', minWidth: '90px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', width: '28px' }}>
                            {rawProgress}%
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '5px',
                              borderRadius: '999px',
                              background: '#f1f5f9',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${rawProgress}%`,
                                height: '100%',
                                background: rawProgress > 0 ? '#10b981' : '#cbd5e1',
                                borderRadius: '999px',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem?.(t);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '4px',
                          }}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer de Paginación */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '11.5px',
              color: '#64748b',
            }}
          >
            <div>
              Mostrando {Math.min(1, filteredTasks.length)}-{Math.min(currentPage * pageSize, filteredTasks.length)} de{' '}
              {filteredTasks.length} tareas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={13} />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    border: page === currentPage ? 'none' : '1px solid #e2e8f0',
                    background: page === currentPage ? '#0066ff' : '#ffffff',
                    color: page === currentPage ? '#ffffff' : '#0f172a',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}
              <span>...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  border: totalPages === currentPage ? 'none' : '1px solid #e2e8f0',
                  background: totalPages === currentPage ? '#0066ff' : '#ffffff',
                  color: totalPages === currentPage ? '#ffffff' : '#0f172a',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {totalPages > 3 ? totalPages : 16}
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Columna Derecha Inferior: Acciones Rápidas + Próximos Vencimientos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tarjeta 4: Acciones rápidas */}
          <section
            className="qm-card"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              padding: '14px 18px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 10px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Acciones rápidas
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => onOpenAsignar?.({ role: 'Macroregional' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  border: '1px solid #e9d5ff',
                  background: '#faf5ff',
                  color: '#7e22ce',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3e8ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#faf5ff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} />
                  <span>Asignar a Macroregionales</span>
                </div>
                <ChevronRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => onOpenAsignar?.({ role: 'Gestor' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#15803d',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dcfce7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} />
                  <span>Asignar a Gestores</span>
                </div>
                <ChevronRight size={13} />
              </button>
            </div>
          </section>

          {/* Tarjeta 5: Próximos vencimientos */}
          <section
            className="qm-card"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              padding: '14px 18px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Próximos vencimientos
              </h3>
              <button
                type="button"
                onClick={onViewLista}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0066ff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: 0,
                }}
              >
                <span>Ver todas</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingTasks.map((t, idx) => {
                const dates = ['10\nNOV', '11\nNOV', '12\nNOV'];
                const roles = ['A Macroregional', 'A Gestor', 'A Macroregional'];
                const dots = ['#eab308', '#10b981', '#eab308'];

                return (
                  <div
                    key={t.id || idx}
                    onClick={() => onSelectItem?.(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: '1px solid #f8fafc',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#fafbfc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f8fafc';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    {/* Fecha badge */}
                    <div
                      style={{
                        minWidth: '32px',
                        textAlign: 'center',
                        lineHeight: 1.1,
                      }}
                    >
                      <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                        {10 + idx}
                      </b>
                      <small style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
                        NOV
                      </small>
                    </div>

                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: dots[idx % dots.length],
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={t.name}
                        >
                          {t.name}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: '#64748b',
                          paddingLeft: '12px',
                          marginTop: '2px',
                        }}
                      >
                        {roles[idx % roles.length]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
