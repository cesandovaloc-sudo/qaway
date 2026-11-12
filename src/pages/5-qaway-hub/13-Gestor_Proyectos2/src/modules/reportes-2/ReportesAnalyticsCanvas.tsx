// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  FileText,
  ListChecks,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ColumnHeader,
  TableEngineStatus,
  useTableEngine,
  type ColumnDef,
} from '../../shared/table-engine';
import { TerritoryReporterV2Tab } from './territory-reporter/TerritoryReporterV2View';
import './reportesAnalytics.css';

type Sub = {
  id: string;
  name: string;
  dates: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Pendiente';
  children?: Sub[];
};

type Milestone = {
  id: string;
  name: string;
  description: string;
  dates: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Pendiente';
  presentation: string;
  children: Sub[];
};

const initialMilestones: Milestone[] = [
  {
    id: '1.4',
    name: 'Preparación de la distribución regional',
    description: 'Conformación de comités operativos y validación del plan',
    dates: '04 sep. – 30 oct. 2026',
    progress: 100,
    status: 'Cumple',
    presentation: 'Matriz de entregables',
    children: [
      { id: '1.4.1', name: 'Conformación de comités UGEL', dates: '04–18 sep. 2026', progress: 100, status: 'Cumple' },
      { id: '1.4.2', name: 'Planificación regional validada', dates: '19 sep.–30 oct. 2026', progress: 100, status: 'Cumple' },
    ],
  },
  {
    id: '1.6',
    name: 'Elaboración del CDL en MC SIGA',
    description: 'Corte regional: Fase 1, Fase 2 y validación DEI',
    dates: '12 oct. – 30 nov. 2026',
    progress: 67,
    status: 'En proceso',
    presentation: 'Línea de tiempo',
    children: [
      { id: '1.6.1', name: 'Fase 1 · Planificación y CDL preliminar', dates: '14–30 oct. 2026', progress: 100, status: 'Cumple' },
      { id: '1.6.2', name: 'Fase 2 · Registro en MC SIGA (RAR / NEA)', dates: '02–20 nov. 2026', progress: 50, status: 'En proceso' },
      { id: '1.6.3', name: 'Fase 3 · Validación DEI – Nivel Inicial', dates: '21–30 nov. 2026', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '2.1',
    name: 'Gestión de Almacenes y Recepción RAR / NEA',
    description: 'Control de recepción física y pecosas de materiales',
    dates: '11 sep. 2026 – 30 ene. 2027',
    progress: 42,
    status: 'En proceso',
    presentation: 'Matriz de entregables',
    children: [
      { id: '2.1.1', name: 'Recepción de archivos RAR', dates: 'Sep.–nov. 2026', progress: 65, status: 'En proceso' },
      { id: '2.1.2', name: 'Registro de NEA en almacén', dates: 'Nov. 2026–ene. 2027', progress: 20, status: 'En proceso' },
    ],
  },
  {
    id: '3.1',
    name: 'Distribución a Instituciones Educativas',
    description: 'Entrega final y actas de recepción con directores',
    dates: '05 nov. 2026 – 28 feb. 2027',
    progress: 18,
    status: 'En proceso',
    presentation: 'Registro de cantidades',
    children: [
      { id: '3.1.1', name: 'Despacho a sedes UGEL', dates: '05 nov.–15 dic. 2026', progress: 35, status: 'En proceso' },
      { id: '3.1.2', name: 'Entrega en II. EE. focalizadas', dates: '16 dic. 2026–28 feb. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '4.1',
    name: 'Monitoreo y Verificación en Campo',
    description: 'Supervisión de uso efectivo y stock en instituciones',
    dates: '01 feb. – 31 mar. 2027',
    progress: 0,
    status: 'Pendiente',
    presentation: 'Matriz de entregables',
    children: [
      { id: '4.1.1', name: 'Visitas de verificación UGEL', dates: '01–28 feb. 2027', progress: 0, status: 'Pendiente' },
      { id: '4.1.2', name: 'Consolidación de actas de campo', dates: '01–31 mar. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '5.1',
    name: 'Cierre y Liquidación del Proceso',
    description: 'Informe final regional y rendición documental',
    dates: '01 abr. – 30 abr. 2027',
    progress: 0,
    status: 'Pendiente',
    presentation: 'Resumen ejecutivo',
    children: [
      { id: '5.1.1', name: 'Elaboración del informe de cierre', dates: '01–20 abr. 2027', progress: 0, status: 'Pendiente' },
      { id: '5.1.2', name: 'Remisión formal del informe final', dates: '21–30 abr. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
];

const generalTrend = [
  { date: '01 oct.', v: 18 },
  { date: '08 oct.', v: 31 },
  { date: '15 oct.', v: 49 },
  { date: '22 oct.', v: 61 },
  { date: '30 oct.', v: 67 },
];

const colorFor = (s: string) =>
  s === 'Cumple' ? 'green' : s === 'En proceso' ? 'amber' : 'slate';

const REPORTES_STATUS = [
  { value: 'Cumple', label: 'Cumple', color: '#10b981' },
  { value: 'En proceso', label: 'En proceso', color: '#f59e0b' },
  { value: 'Pendiente', label: 'Pendiente', color: '#94a3b8' },
];

const REPORTES_COLUMNS: ColumnDef<Milestone>[] = [
  { id: 'name', label: 'Hito / Subproceso', type: 'text', accessor: (m) => `${m.id} ${m.name} ${m.description}` },
  { id: 'dates', label: 'Periodo', type: 'text', accessor: (m) => m.dates },
  { id: 'progress', label: 'Avance', type: 'percent', accessor: (m) => m.progress },
  { id: 'status', label: 'Estado', type: 'processState', accessor: (m) => m.status, options: REPORTES_STATUS },
  { id: 'presentation', label: 'Formato de reporte', type: 'select', accessor: (m) => m.presentation },
];

export default function ReportesAnalyticsCanvas({
  notify,
}: {
  notify?: (m: string) => void;
}) {
  const [milestones] = useState<Milestone[]>(initialMilestones);
  const [expanded, setExpanded] = useState<string[]>(['1.6']);

  const engine = useTableEngine<Milestone>({
    tableId: 'reportes-2-hitos',
    columns: REPORTES_COLUMNS,
    rows: milestones,
  });

  const filteredMilestones = useMemo(
    () => engine.apply(milestones),
    [engine.apply, milestones]
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleOpenReport = (m: Milestone) => {
    notify?.(`Hito seleccionado: ${m.id} · ${m.name}`);
  };

  return (
    <div className="rep-analytics-canvas">
      {/* Paneles de Gráficos Analíticos Superiores */}
      <div className="charts">
        {/* 1. Avance regional por hito */}
        <section className="panel">
          <div className="panel-head">
            <h2>Avance regional por hito</h2>
            <p>Porcentaje promedio de cumplimiento en las 13 UGEL.</p>
          </div>
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { id: '1.4', name: 'Preparación', v: 100 },
                  { id: '1.6', name: 'CDL SIGA', v: 67 },
                  { id: '2.1', name: 'Recepción', v: 42 },
                  { id: '3.1', name: 'Distribución', v: 18 },
                  { id: '4.1', name: 'Cierre', v: 0 },
                  { id: '5.1', name: 'Informe', v: 0 },
                ]}
                margin={{ top: 14, right: 8, bottom: 0, left: -18 }}
              >
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="id" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Cumplimiento']}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.08)', radius: 4 }}
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                />
                <Bar
                  dataKey="v"
                  radius={[5, 5, 0, 0]}
                  fill="#2563eb"
                  isAnimationActive={true}
                  animationBegin={150}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  activeBar={{ fill: '#1d4ed8', stroke: '#1e40af', strokeWidth: 1.5 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. Estado de los hitos (Donut) */}
        <section className="panel">
          <div className="panel-head">
            <h2>Estado de los hitos</h2>
            <p>Distribución porcentual actual.</p>
          </div>
          <div className="donut-row">
            <div className="donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(v: any, name: any) => [`${v} hitos (${Math.round((Number(v) / 6) * 100)}%)`, name]}
                    contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                  />
                  <Pie
                    data={[
                      { name: 'Cumplidos', value: 1 },
                      { name: 'En proceso', value: 3 },
                      { name: 'Pendientes', value: 2 },
                    ]}
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>06</b>
                <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>hitos</small>
              </div>
            </div>
            <div className="donut-legend">
              <div className="legend-row">
                <span className="legend-dot green" />
                <span>Cumplidos</span>
                <b>1 (17%)</b>
              </div>
              <div className="legend-row">
                <span className="legend-dot amber" />
                <span>En proceso</span>
                <b>3 (50%)</b>
              </div>
              <div className="legend-row">
                <span className="legend-dot red" />
                <span>Pendientes</span>
                <b>2 (33%)</b>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Evolución del avance regional (LineChart) */}
        <section className="panel">
          <div className="panel-head">
            <h2>Evolución del avance regional</h2>
            <p>Curva de cumplimiento acumulado.</p>
          </div>
          <div className="line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generalTrend} margin={{ top: 14, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Avance']}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                />
                <Line
                  dataKey="v"
                  name="Avance"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                  isAnimationActive={true}
                  animationBegin={250}
                  animationDuration={1100}
                  animationEasing="ease-out"
                  activeDot={{ r: 6.5, stroke: '#2563eb', strokeWidth: 2.5, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Tabla Principal Jerárquica de Hitos y Subprocesos Reportables */}
      <div className="cronograma-lista-table">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Hitos y Subprocesos Reportables</h2>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              Estructura WBS desglosada. Haz clic en "Abrir reporte" para consultar el cumplimiento y evidencias por UGEL.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setExpanded(expanded.length > 0 ? [] : ['1.4', '1.6', '2.1', '3.1', '4.1', '5.1'])}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {expanded.length > 0 ? 'Colapsar todo' : 'Expandir todo'}
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <TableEngineStatus engine={engine} />
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>
                  <ColumnHeader engine={engine} columnId="name" label="Hito / Subproceso" />
                </th>
                <th><ColumnHeader engine={engine} columnId="dates" label="Periodo" /></th>
                <th><ColumnHeader engine={engine} columnId="progress" label="Avance" /></th>
                <th><ColumnHeader engine={engine} columnId="status" label="Estado" /></th>
                <th><ColumnHeader engine={engine} columnId="presentation" label="Formato de Reporte" /></th>
                <th style={{ width: '130px', textAlign: 'right', paddingRight: '20px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredMilestones.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className="root-row">
                    <td style={{ paddingLeft: '20px' }}>
                      <div className="name-cell">
                        {m.children && m.children.length > 0 ? (
                          <button
                            type="button"
                            className="expand-btn"
                            onClick={() => toggleExpand(m.id)}
                            title={expanded.includes(m.id) ? 'Colapsar subprocesos' : 'Expandir subprocesos'}
                          >
                            {expanded.includes(m.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        ) : (
                          <span className="expand-btn" style={{ visibility: 'hidden' }} />
                        )}
                        <button
                          type="button"
                          className="name-button"
                          onClick={() => handleOpenReport(m)}
                        >
                          <span className={`row-icon ${colorFor(m.status)}`}>
                            <FileText size={16} />
                          </span>
                          <div>
                            <b>{m.id} · {m.name}</b>
                            <small>{m.description}</small>
                          </div>
                        </button>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#475569' }}>{m.dates}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: '70px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <i
                            style={{
                              display: 'block',
                              height: '100%',
                              borderRadius: '999px',
                              width: `${m.progress}%`,
                              background: m.status === 'Cumple' ? '#10b981' : m.status === 'En proceso' ? '#f59e0b' : '#94a3b8',
                            }}
                          />
                        </div>
                        <b style={{ fontSize: '12.5px', color: '#0f172a', minWidth: '36px' }}>{m.progress}%</b>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${colorFor(m.status)}`}>{m.status}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: 500 }}>
                        <BarChart3 size={13} color="#2563eb" /> {m.presentation}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '5px 10px', fontSize: '12px', gap: '4px' }}
                        onClick={() => handleOpenReport(m)}
                      >
                        <span>Abrir reporte</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>

                  {expanded.includes(m.id) &&
                    m.children.map((sub) => (
                      <tr className="child-row" key={sub.id} style={{ background: '#fcfdfd' }}>
                        <td style={{ paddingLeft: '56px' }}>
                          <div className="name-cell">
                            <span className="row-icon child"><ListChecks size={13} /></span>
                            <div>
                              <b style={{ fontSize: '13px', color: '#334155' }}>{sub.id} · {sub.name}</b>
                            </div>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '12.5px', color: '#64748b' }}>{sub.dates}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: '70px', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                              <i
                                style={{
                                  display: 'block',
                                  height: '100%',
                                  borderRadius: '999px',
                                  width: `${sub.progress}%`,
                                  background: sub.status === 'Cumple' ? '#10b981' : sub.status === 'En proceso' ? '#f59e0b' : '#94a3b8',
                                }}
                              />
                            </div>
                            <b style={{ fontSize: '12px', color: '#475569', minWidth: '36px' }}>{sub.progress}%</b>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${colorFor(sub.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{sub.status}</span>
                        </td>
                        <td colSpan={2}>
                          <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>Subproceso operativo territorial</small>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
