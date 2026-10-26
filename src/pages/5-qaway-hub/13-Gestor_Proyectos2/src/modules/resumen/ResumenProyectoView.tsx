// @ts-nocheck
import React, { useMemo, useState } from 'react';
import './resumen.css';
import {
  Activity, AlertTriangle, ArrowRight, Bell, Building2, Calendar, Check,
  ChevronDown, ChevronRight, Download, FileText, Filter, Plus, RefreshCw, Search,
  ShieldCheck, SlidersHorizontal, Users, X
} from 'lucide-react';

const DEMO_UGEL = [
  { nombre: 'UGEL Chupaca', estado: 'cumple', avance: 100, fase1: true, fase2: true, dei: true, hito: 'CDL validado', fecha: '15 oct.' },
  { nombre: 'UGEL Concepción', estado: 'cumple', avance: 100, fase1: true, fase2: true, dei: true, hito: 'CDL validado', fecha: '14 oct.' },
  { nombre: 'UGEL Huancayo', estado: 'proceso', avance: 75, fase1: true, fase2: false, dei: true, hito: 'Registro MC SIGA', fecha: '20 oct.' },
  { nombre: 'UGEL Jauja', estado: 'proceso', avance: 50, fase1: true, fase2: false, dei: false, hito: 'Validación DEI', fecha: '21 oct.' },
  { nombre: 'UGEL Junín', estado: 'proceso', avance: 50, fase1: true, fase2: false, dei: false, hito: 'Registro MC SIGA', fecha: '21 oct.' },
  { nombre: 'UGEL Satipo', estado: 'incumple', avance: 33, fase1: true, fase2: false, dei: false, hito: 'Registro de NEA', fecha: '20 oct.' },
  { nombre: 'UGEL Tarma', estado: 'incumple', avance: 20, fase1: true, fase2: false, dei: false, hito: 'Carga RAR', fecha: '22 oct.' },
  { nombre: 'UGEL Chanchamayo', estado: 'incumple', avance: 20, fase1: false, fase2: false, dei: false, hito: 'Validación', fecha: '24 oct.' },
  { nombre: 'UGEL Yauli', estado: 'incumple', avance: 0, fase1: false, fase2: false, dei: false, hito: 'Registro MC SIGA', fecha: '28 oct.' },
  { nombre: 'UGEL Pichanaki', estado: 'incumple', avance: 0, fase1: false, fase2: false, dei: false, hito: 'Carga RAR', fecha: '30 oct.' },
  { nombre: 'UGEL Río Tambo', estado: 'incumple', avance: 0, fase1: false, fase2: false, dei: false, hito: 'Acta de recepción', fecha: '30 oct.' },
  { nombre: 'UGEL Pangoa', estado: 'incumple', avance: 0, fase1: false, fase2: false, dei: false, hito: 'Validación CDL', fecha: '31 oct.' },
  { nombre: 'UGEL Perené', estado: 'incumple', avance: 0, fase1: false, fase2: false, dei: false, hito: 'Registro MC SIGA', fecha: '31 oct.' },
];

const DEMO_HITOS = [
  { dia: '20', mes: 'OCT', titulo: 'Carga de archivo RAR en MC SIGA', unidad: 'UGEL Junín', estado: 'Retrasado', tipo: 'rojo' },
  { dia: '24', mes: 'OCT', titulo: 'Registro de NEA en MC SIGA', unidad: 'UGEL Tarma', estado: 'Retrasado', tipo: 'rojo' },
  { dia: '28', mes: 'OCT', titulo: 'Validación de inconsistencias CDL', unidad: 'UGEL Yauli', estado: 'En riesgo', tipo: 'amarillo' },
  { dia: '30', mes: 'OCT', titulo: 'Envío de acta de comité y padrón', unidad: 'UGEL Chupaca', estado: 'Pendiente', tipo: 'gris' },
];

const PHASES = [
  { nombre: 'Fase 1 — Planificación y CDL', avance: 69, inicio: 3, fin: 34, estado: 'green' },
  { nombre: 'Fase 2 — Registro MC SIGA (RAR / NEA)', avance: 38, inicio: 17, fin: 47, estado: 'amber' },
  { nombre: 'DEI — Validación Nivel Inicial', avance: 23, inicio: 34, fin: 66, estado: 'red' },
];

export default function ResumenProyectoView({
  onActions,
  userRole = 'gestor',
  onOpenCreateProject,
}: {
  onActions?: (h: any) => void;
  userRole?: 'gestor' | 'coordinador';
  onOpenCreateProject?: () => void;
}) {
  const [fase, setFase] = useState('Todas');
  const [ugel, setUgel] = useState('Todas');
  const [periodo, setPeriodo] = useState('01/10/2026 – 15/10/2026');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [actualizado, setActualizado] = useState('26 oct. 2026 · 10:30');
  const [notice, setNotice] = useState('');

  const notify = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 2600);
  };

  const rows = useMemo(() => {
    return DEMO_UGEL.filter((row) => {
      const matchesUgel = ugel === 'Todas' || row.nombre === ugel;
      const matchesSearch = row.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchesStatus = filtroEstado === 'todos' || row.estado === filtroEstado;
      const matchesPhase = fase === 'Todas' || (fase === 'Fase 1' ? row.fase1 : fase === 'Fase 2' ? row.fase2 : row.dei);
      return matchesUgel && matchesSearch && matchesStatus && matchesPhase;
    });
  }, [ugel, busqueda, filtroEstado, fase]);

  const total = DEMO_UGEL.length;
  const cumple = DEMO_UGEL.filter((x) => x.estado === 'cumple').length;
  const proceso = DEMO_UGEL.filter((x) => x.estado === 'proceso').length;
  const incumple = DEMO_UGEL.filter((x) => x.estado === 'incumple').length;

  const refresh = () => {
    setActualizado(new Date().toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    notify('Resumen regional sincronizado con la última fecha de corte');
  };

  return (
    <div className="res-v1">
      <header className="topbar">
        <div>
          Proyecto <ChevronRight size={13} /> <b>MINEDU · Dotación 2027</b> <ChevronRight size={13} /> <b>Resumen del proyecto</b>
        </div>
        <div className="top-actions">
          <button className="iconbtn" onClick={() => notify('Panel de Resumen Regional conectado a MC SIGA.')}>
            <ShieldCheck size={18} />
          </button>
          <button className="iconbtn" onClick={() => notify('Sin alertas pendientes')}>
            <Bell size={18} />
          </button>
          <div className="avatar">CM</div>
        </div>
      </header>

      <div className="content">
        {userRole === 'coordinador' && (
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              border: '1px solid #1e293b',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  VISTA DE COORDINACIÓN GENERAL
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Carlos Mendoza</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Gobernanza Multirregional y Creación de Proyectos
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                Como Coordinador General puedes crear nuevos proyectos para otras DRE/UGEL y subir su cronograma maestro desde cero.
              </p>
            </div>
            <button
              onClick={onOpenCreateProject}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              }}
            >
              <Plus size={16} />
              <span>+ Crear nuevo proyecto regional</span>
            </button>
          </div>
        )}

        <div className="page-heading">
          <div>
            <div className="eyebrow">DRE JUNÍN <span>•</span> DOTACIÓN 2027</div>
            <h1>Resumen del proyecto</h1>
            <p>Monitoreo ejecutivo de la subida del Cuadro de Distribución Local (CDL) en MC SIGA · Actividad 1.6</p>
          </div>
          <div className="updated-box">
            <div>
              <span>ÚLTIMA ACTUALIZACIÓN REGIONAL</span>
              <strong>{actualizado}</strong>
            </div>
            <button type="button" onClick={refresh}>
              <RefreshCw size={14} /> Sincronizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <section className="filters">
          <label>
            <span>Fase del subproceso</span>
            <select value={fase} onChange={(e) => setFase(e.target.value)}>
              <option>Todas</option>
              <option>Fase 1</option>
              <option>Fase 2</option>
              <option>DEI</option>
            </select>
          </label>
          <label>
            <span>Unidad ejecutora</span>
            <select value={ugel} onChange={(e) => setUgel(e.target.value)}>
              <option>Todas</option>
              {DEMO_UGEL.map((x) => (
                <option key={x.nombre}>{x.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Periodo de corte</span>
            <div className="date-field">
              <Calendar size={15} className="text-slate-400" />
              <input value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
            </div>
          </label>
          <div className="filter-reset">
            <button
              type="button"
              onClick={() => {
                setFase('Todas');
                setUgel('Todas');
                setPeriodo('01/10/2026 – 15/10/2026');
                setFiltroEstado('todos');
                setBusqueda('');
              }}
            >
              Restablecer
            </button>
          </div>
        </section>

        {/* KPIs estilo Power BI */}
        <section className="kpis">
          <div className="kpi-card">
            <div className="kpi-icon blue"><Building2 size={22} /></div>
            <div className="kpi-info">
              <span>UGEL monitoreadas</span>
              <strong>{total}</strong>
              <small>En la región Junín</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green"><Check size={22} /></div>
            <div className="kpi-info">
              <span>Cumplen</span>
              <strong>{cumple}<em>{Math.round((cumple / total) * 100)}%</em></strong>
              <small>Fases completadas</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon amber"><AlertTriangle size={22} /></div>
            <div className="kpi-info">
              <span>En proceso</span>
              <strong>{proceso}<em>{Math.round((proceso / total) * 100)}%</em></strong>
              <small>Avance activo parcial</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon red"><AlertTriangle size={22} /></div>
            <div className="kpi-info">
              <span>No cumplen</span>
              <strong>{incumple}<em>{Math.round((incumple / total) * 100)}%</em></strong>
              <small>Requieren asistencia</small>
            </div>
          </div>
        </section>

        {/* Avance por Fase */}
        <section className="section-card">
          <div className="section-head">
            <div>
              <h2>Avance por fase de trabajo</h2>
              <p>Progreso reportado de subida de archivos en MC SIGA</p>
            </div>
            <div className="legend">
              <span><i className="dot green" /> En plazo</span>
              <span><i className="dot amber" /> En riesgo</span>
              <span><i className="dot red" /> Retrasado</span>
            </div>
          </div>

          <div className="timeline-months">
            <span>OCT 2026</span>
            <span>NOV 2026</span>
            <span>DIC 2026</span>
            <span>ENE 2027</span>
            <span>FEB 2027</span>
          </div>

          {PHASES.map((p) => (
            <div className="phase-row" key={p.nombre}>
              <strong>{p.nombre}</strong>
              <b>{p.avance}%</b>
              <div className="phase-track">
                <span className={`phase-fill ${p.estado}`} style={{ left: `${p.inicio}%`, width: `${p.fin - p.inicio}%` }} />
              </div>
            </div>
          ))}
        </section>

        {/* Grid Inferior: Curva + Hitos Críticos + UGEL de Atención */}
        <section className="bottom-grid">
          {/* Curva Regional SVG */}
          <article className="section-card">
            <div className="section-head">
              <div>
                <h2>Avance regional</h2>
                <p>Curva de progreso acumulado</p>
              </div>
            </div>
            <div style={{ height: '180px', position: 'relative' }}>
              <svg viewBox="0 0 450 170" style={{ width: '100%', height: '100%' }}>
                <line x1="10" y1="20" x2="440" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="10" y1="60" x2="440" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="10" y1="100" x2="440" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="10" y1="140" x2="440" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
                {/* Línea planeada */}
                <path d="M 20 145 Q 150 90 430 30" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                {/* Línea real */}
                <path d="M 20 150 Q 140 120 300 75" fill="none" stroke="#2563eb" strokeWidth="3" />
                <circle cx="300" cy="75" r="4.5" fill="#2563eb" />
                <text x="310" y="72" fontSize="12" fontWeight="700" fill="#2563eb">50%</text>
              </svg>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              <span><i style={{ display: 'inline-block', width: '10px', height: '2px', background: '#94a3b8', verticalAlign: 'middle', marginRight: '4px' }} /> Planificado</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '3px', background: '#2563eb', verticalAlign: 'middle', marginRight: '4px' }} /> Real (promedio)</span>
            </div>
          </article>

          {/* Hitos Críticos */}
          <article className="section-card">
            <div className="section-head">
              <div>
                <h2>Hitos críticos</h2>
                <p>Próximos compromisos</p>
              </div>
            </div>
            <div className="milestone-list">
              {DEMO_HITOS.map((h) => (
                <div className="milestone-item" key={h.titulo}>
                  <div className="milestone-date">
                    <b>{h.dia}</b>
                    <span>{h.mes}</span>
                  </div>
                  <div className="milestone-copy">
                    <strong>{h.titulo}</strong>
                    <span>{h.unidad}</span>
                  </div>
                  <span className={`status-tag ${h.tipo}`}>{h.estado}</span>
                </div>
              ))}
            </div>
          </article>

          {/* UGEL que requieren atención */}
          <article className="section-card">
            <div className="section-head">
              <div>
                <h2>UGEL en atención</h2>
                <p>Prioridad según avance</p>
              </div>
              <button
                style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setFiltroEstado(filtroEstado === 'incumple' ? 'todos' : 'incumple')}
              >
                {filtroEstado === 'incumple' ? 'Mostrar todas' : 'Solo incumplimientos'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>UGEL</th>
                    <th>Estado</th>
                    <th>Avance</th>
                    <th>Próximo hito</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter((r) => r.estado !== 'cumple').slice(0, 5).map((r) => (
                    <tr key={r.nombre}>
                      <td><b>{r.nombre}</b></td>
                      <td>
                        <span className={`status-badge ${r.estado}`}>
                          <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.estado === 'proceso' ? '#f59e0b' : '#ef4444', display: 'inline-block' }} />
                          {r.estado === 'proceso' ? 'En proceso' : 'No cumple'}
                        </span>
                      </td>
                      <td>
                        <div className="progress-track">
                          <i className={r.estado === 'proceso' ? 'amber' : 'red'} style={{ width: `${r.avance}%` }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{r.avance}%</span>
                      </td>
                      <td><span style={{ fontSize: '12.5px' }}>{r.hito}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>

      {notice && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 18px', borderRadius: '8px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <Check size={16} className="text-green-400" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
