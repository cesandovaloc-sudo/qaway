import React, { useMemo, useState } from "react";
import "./HubProResumen.css";

/**
 * HubPro — Resumen regional
 * React + CSS, sin dependencias de gráficos.
 *
 * Para adaptar:
 * 1. Reemplaza los arrays DEMO_* con datos de tu backend.
 * 2. Ajusta los filtros para conectarlos a tu estado/API.
 * 3. Cambia los enlaces de "Ver detalle" por tus rutas reales.
 */

const DEMO_UGEL = [
  { nombre: "Chupaca", estado: "cumple", avance: 100, fase1: true, fase2: true, dei: true, hito: "CDL validado", fecha: "15 oct." },
  { nombre: "Concepción", estado: "cumple", avance: 100, fase1: true, fase2: true, dei: true, hito: "CDL validado", fecha: "14 oct." },
  { nombre: "Huancayo", estado: "proceso", avance: 75, fase1: true, fase2: false, dei: true, hito: "Registro MC SIGA", fecha: "20 oct." },
  { nombre: "Jauja", estado: "proceso", avance: 50, fase1: true, fase2: false, dei: false, hito: "Validación DEI", fecha: "21 oct." },
  { nombre: "Junín", estado: "proceso", avance: 50, fase1: true, fase2: false, dei: false, hito: "Registro MC SIGA", fecha: "21 oct." },
  { nombre: "Satipo", estado: "incumple", avance: 33, fase1: true, fase2: false, dei: false, hito: "Registro de NEA", fecha: "20 oct." },
  { nombre: "Tarma", estado: "incumple", avance: 20, fase1: true, fase2: false, dei: false, hito: "Carga RAR", fecha: "22 oct." },
  { nombre: "Chanchamayo", estado: "incumple", avance: 20, fase1: false, fase2: false, dei: false, hito: "Validación", fecha: "24 oct." },
  { nombre: "Yauli", estado: "incumple", avance: 0, fase1: false, fase2: false, dei: false, hito: "Registro MC SIGA", fecha: "28 oct." },
  { nombre: "Pichanaki", estado: "incumple", avance: 0, fase1: false, fase2: false, dei: false, hito: "Carga RAR", fecha: "30 oct." },
  { nombre: "Río Tambo", estado: "incumple", avance: 0, fase1: false, fase2: false, dei: false, hito: "Acta de recepción", fecha: "30 oct." },
  { nombre: "Chupaca (Sur)", estado: "incumple", avance: 0, fase1: false, fase2: false, dei: false, hito: "Validación CDL", fecha: "31 oct." },
  { nombre: "Perene", estado: "incumple", avance: 0, fase1: false, fase2: false, dei: false, hito: "Registro MC SIGA", fecha: "31 oct." },
];

const DEMO_HITOS = [
  { dia: "20", mes: "OCT", titulo: "Carga de archivo RAR", unidad: "UGEL Junín", estado: "Retrasado", tipo: "rojo" },
  { dia: "24", mes: "OCT", titulo: "Registro de NEA en MC SIGA", unidad: "UGEL Tarma", estado: "Retrasado", tipo: "rojo" },
  { dia: "28", mes: "OCT", titulo: "Validación de consistencias", unidad: "UGEL Yauli", estado: "En riesgo", tipo: "amarillo" },
  { dia: "30", mes: "OCT", titulo: "Envío de acta de comité", unidad: "UGEL Chupaca", estado: "Pendiente", tipo: "gris" },
];

const PHASES = [
  { nombre: "Fase 1 — Planificación", avance: 69, inicio: 3, fin: 34, estado: "verde" },
  { nombre: "Fase 2 — Registro MC SIGA", avance: 38, inicio: 17, fin: 47, estado: "amarillo" },
  { nombre: "DEI — Nivel Inicial", avance: 23, inicio: 34, fin: 66, estado: "rojo" },
];

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M9 21v-5h6v5M8 8h1m6 0h1M8 12h1m6 0h1" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    alert: <><path d="M12 9v4m0 4h.01" /><path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
  };
  return <svg {...common}>{paths[name] || paths.file}</svg>;
}

function Status({ value }) {
  const labels = { cumple: "Cumple", proceso: "En proceso", incumple: "No cumple" };
  return <span className={`hp-status hp-status--${value}`}><i />{labels[value] || value}</span>;
}

function ProgressBar({ value, tone }) {
  const color = tone || (value >= 80 ? "green" : value >= 30 ? "amber" : "red");
  return <div className="hp-progress" aria-label={`Avance ${value}%`}><span className={`hp-progress__fill hp-fill--${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function RegionalCurve() {
  return (
    <div className="hp-curve-wrap">
      <div className="hp-curve-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
      <svg className="hp-curve" viewBox="0 0 520 190" role="img" aria-label="Curva de avance planificado frente al real">
        {[18, 54, 90, 126, 162].map(y => <line key={y} x1="10" y1={y} x2="510" y2={y} className="hp-gridline" />)}
        <line x1="170" y1="8" x2="170" y2="164" className="hp-today-line" />
        <path d="M10 150 L110 128 L210 103 L310 78 L410 49 L510 20" className="hp-plan-line" />
        <path d="M10 155 L110 145 L210 126 L310 105 L410 84 L510 65 L510 164 L10 164 Z" className="hp-real-area" />
        <path d="M10 155 L110 145 L210 126 L310 105 L410 84 L510 65" className="hp-real-line" />
        <circle cx="510" cy="65" r="3.5" className="hp-real-dot" />
        <text x="478" y="54" className="hp-chart-label">50%</text>
      </svg>
      <div className="hp-curve-months"><span>Oct</span><span>Nov</span><span>Dic</span><span>Ene</span><span>Feb</span><span>Mar</span></div>
      <div className="hp-curve-legend"><span><i className="hp-legend-dash" />Planificado (promedio)</span><span><i className="hp-legend-blue" />Real (promedio)</span></div>
    </div>
  );
}

export default function HubProResumen() {
  const [fase, setFase] = useState("Todas");
  const [ugel, setUgel] = useState("Todas");
  const [periodo, setPeriodo] = useState("01/10/2026 – 15/10/2026");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [actualizado, setActualizado] = useState("22 oct. 2026 · 10:30");

  const rows = useMemo(() => {
    return DEMO_UGEL.filter(row => {
      const matchesUgel = ugel === "Todas" || row.nombre === ugel;
      const matchesSearch = row.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchesStatus = filtroEstado === "todos" || row.estado === filtroEstado;
      const matchesPhase = fase === "Todas" || (fase === "Fase 1" ? row.fase1 : fase === "Fase 2" ? row.fase2 : row.dei);
      return matchesUgel && matchesSearch && matchesStatus && matchesPhase;
    });
  }, [ugel, busqueda, filtroEstado, fase]);

  const total = DEMO_UGEL.length;
  const cumple = DEMO_UGEL.filter(x => x.estado === "cumple").length;
  const proceso = DEMO_UGEL.filter(x => x.estado === "proceso").length;
  const incumple = DEMO_UGEL.filter(x => x.estado === "incumple").length;

  const refresh = () => setActualizado(new Date().toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));

  return (
    <main className="hp-app">
      <header className="hp-topbar">
        <div className="hp-brand">
          <div className="hp-brand-mark"><span /></div>
          <div><strong>HubPro</strong><small>Gestor de Proyectos</small></div>
        </div>
        <nav className="hp-nav" aria-label="Navegación principal">
          <a className="hp-nav-link hp-nav-link--active" href="#resumen">Resumen</a>
          <a className="hp-nav-link" href="#proyectos">Proyectos</a>
          <a className="hp-nav-link" href="#tareas">Mis tareas</a>
          <a className="hp-nav-link" href="#calendario">Calendario</a>
          <a className="hp-nav-link" href="#reportes">Reportes</a>
        </nav>
        <label className="hp-search"><Icon name="search" size={17} /><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar proyectos, UGEL o tareas..." /></label>
        <button className="hp-icon-button" type="button" aria-label="Notificaciones"><span className="hp-notification-dot" />♧</button>
        <div className="hp-user"><span className="hp-avatar">CM</span><span><b>Carlos Mendoza</b><small>Director de Programa</small></span><span className="hp-chevron">⌄</span></div>
      </header>

      <section className="hp-content" id="resumen">
        <div className="hp-page-heading">
          <div><div className="hp-eyebrow">DRE JUNÍN <span>•</span> DOTACIÓN 2027</div><h1>Resumen regional</h1><p>Elaboración del CDL en MC SIGA <span className="hp-heading-separator">/</span> Actividad 1.6</p></div>
          <div className="hp-updated"><span>Última actualización</span><strong>{actualizado}</strong><button type="button" onClick={refresh}><Icon name="refresh" size={15} /> Actualizar</button></div>
        </div>

        <section className="hp-filters" aria-label="Filtros del reporte">
          <label><span>Fase</span><select value={fase} onChange={e => setFase(e.target.value)}><option>Todas</option><option>Fase 1</option><option>Fase 2</option><option>DEI</option></select></label>
          <label><span>UGEL</span><select value={ugel} onChange={e => setUgel(e.target.value)}><option>Todas</option>{DEMO_UGEL.map(x => <option key={x.nombre}>{x.nombre}</option>)}</select></label>
          <label><span>Periodo</span><div className="hp-date-field"><Icon name="calendar" size={16} /><input value={periodo} onChange={e => setPeriodo(e.target.value)} aria-label="Periodo del reporte" /></div></label>
          <div className="hp-filter-reset"><button type="button" onClick={() => { setFase("Todas"); setUgel("Todas"); setPeriodo("01/10/2026 – 15/10/2026"); setFiltroEstado("todos"); setBusqueda(""); }}>Restablecer filtros</button></div>
        </section>

        <section className="hp-kpis" aria-label="Indicadores regionales">
          <article className="hp-kpi hp-kpi--total"><div className="hp-kpi-icon"><Icon name="building" size={23} /></div><div><span>UGEL monitoreadas</span><strong>{total}</strong><small>En la región Junín</small></div><div className="hp-kpi-watermark">J</div></article>
          <article className="hp-kpi"><div className="hp-kpi-icon hp-kpi-icon--green"><Icon name="check" size={21} /></div><div><span>Cumplen</span><strong>{cumple}<em>{Math.round(cumple / total * 100)}%</em></strong><small>Con las fases requeridas</small></div><div className="hp-kpi-mini hp-mini--green"><span style={{height:"28%"}}/><span style={{height:"42%"}}/><span style={{height:"38%"}}/><span style={{height:"66%"}}/><span style={{height:"82%"}}/><span style={{height:"100%"}}/></div></article>
          <article className="hp-kpi"><div className="hp-kpi-icon hp-kpi-icon--amber"><Icon name="alert" size={21} /></div><div><span>En proceso</span><strong>{proceso}<em>{Math.round(proceso / total * 100)}%</em></strong><small>Avance parcial registrado</small></div><div className="hp-kpi-mini hp-mini--amber"><span style={{height:"22%"}}/><span style={{height:"38%"}}/><span style={{height:"34%"}}/><span style={{height:"61%"}}/><span style={{height:"73%"}}/><span style={{height:"85%"}}/></div></article>
          <article className="hp-kpi"><div className="hp-kpi-icon hp-kpi-icon--red"><Icon name="alert" size={21} /></div><div><span>No cumplen</span><strong>{incumple}<em>{Math.round(incumple / total * 100)}%</em></strong><small>Requieren seguimiento</small></div><div className="hp-kpi-mini hp-mini--red"><span style={{height:"100%"}}/><span style={{height:"86%"}}/><span style={{height:"72%"}}/><span style={{height:"61%"}}/><span style={{height:"42%"}}/><span style={{height:"32%"}}/></div></article>
        </section>

        <section className="hp-phase-card hp-section-card">
          <div className="hp-section-head"><div><h2>Avance por fase</h2><p>Progreso reportado frente al calendario previsto</p></div><div className="hp-legend"><span><i className="hp-dot hp-dot--green" />En plazo</span><span><i className="hp-dot hp-dot--amber" />En riesgo</span><span><i className="hp-dot hp-dot--red" />Retrasado</span><span><i className="hp-dot hp-dot--muted" />Planificado</span></div></div>
          <div className="hp-timeline">
            <div className="hp-timeline-months"><span>OCT 2026</span><span>NOV 2026</span><span>DIC 2026</span><span>ENE 2027</span><span>FEB 2027</span><span>MAR 2027</span></div>
            <div className="hp-today-marker"><span>Hoy</span></div>
            {PHASES.map(p => <div className="hp-phase-row" key={p.nombre}><strong>{p.nombre}</strong><b>{p.avance}%</b><div className="hp-phase-track"><span className={`hp-phase-planned hp-planned--${p.estado}`} /><span className={`hp-phase-current hp-current--${p.estado}`} style={{left:`${p.inicio}%`, width:`${p.fin-p.inicio}%`}} /><i className={`hp-phase-end hp-end--${p.estado}`} style={{left:`${p.fin}%`}} /></div></div>)}
          </div>
        </section>

        <section className="hp-bottom-grid">
          <article className="hp-section-card hp-curve-card">
            <div className="hp-section-head"><div><h2>Avance regional</h2><p>Curva de progreso acumulado</p></div><button className="hp-text-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent("hubpro:open-report", { detail: "curva-avance" }))}>Ver detalle <Icon name="arrow" size={14} /></button></div>
            <RegionalCurve />
          </article>

          <article className="hp-section-card hp-milestones-card">
            <div className="hp-section-head"><div><h2>Hitos críticos</h2><p>Próximos compromisos de seguimiento</p></div><button className="hp-text-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent("hubpro:open-report", { detail: "hitos" }))}>Ver todos <Icon name="arrow" size={14} /></button></div>
            <div className="hp-milestone-list">{DEMO_HITOS.map(h => <div className="hp-milestone" key={`${h.dia}-${h.titulo}`}><div className={`hp-milestone-date hp-date--${h.tipo}`}><b>{h.dia}</b><span>{h.mes}</span></div><div className={`hp-milestone-file hp-file--${h.tipo}`}><Icon name="file" size={18} /></div><div className="hp-milestone-copy"><strong>{h.titulo}</strong><span>{h.unidad}</span></div><span className={`hp-tag hp-tag--${h.tipo}`}>{h.estado}</span></div>)}</div>
          </article>

          <article className="hp-section-card hp-attention-card">
            <div className="hp-section-head"><div><h2>UGEL que requieren atención</h2><p>Prioridad según avance y estado</p></div><button className="hp-text-link" type="button" onClick={() => setFiltroEstado("incumple")}>Ver todas <Icon name="arrow" size={14} /></button></div>
            <div className="hp-table-tools"><div className="hp-table-filters" role="group" aria-label="Filtrar estado"><button className={filtroEstado === "todos" ? "is-active" : ""} onClick={() => setFiltroEstado("todos")}>Todas</button><button className={filtroEstado === "incumple" ? "is-active" : ""} onClick={() => setFiltroEstado("incumple")}>No cumplen</button><button className={filtroEstado === "proceso" ? "is-active" : ""} onClick={() => setFiltroEstado("proceso")}>En proceso</button></div></div>
            <div className="hp-table-wrap"><table className="hp-table"><thead><tr><th>UGEL</th><th>Estado</th><th>Avance</th><th>Próximo hito</th></tr></thead><tbody>
              {rows.filter(r => r.estado !== "cumple").slice(0, 6).map(r => <tr key={r.nombre}><td className="hp-table-ugel">{r.nombre}</td><td><Status value={r.estado} /></td><td><div className="hp-table-progress"><ProgressBar value={r.avance} /><b>{r.avance}%</b></div></td><td><strong className="hp-next-hito">{r.hito}</strong><span className="hp-table-date">{r.fecha}</span></td></tr>)}
              {rows.filter(r => r.estado !== "cumple").length === 0 && <tr><td colSpan="4" className="hp-empty">No hay UGEL pendientes con estos filtros.</td></tr>}
            </tbody></table></div>
            <div className="hp-table-footer"><span>Mostrando hasta 6 UGEL prioritarias</span><button type="button" onClick={() => setFiltroEstado("incumple")}>Priorizar incumplimientos <Icon name="arrow" size={13} /></button></div>
          </article>
        </section>
        <footer className="hp-footer"><span><i className="hp-footer-dot" /> Datos de demostración · Reemplazar por registros oficiales antes de publicar</span><span>HubPro · Reporte regional de cumplimiento</span></footer>
      </section>
    </main>
  );
}
