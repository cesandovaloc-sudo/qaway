import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  TrendingUp,
  Users,
  CreditCard,
  Building2,
  RefreshCw,
  UserPlus,
  XCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const companies = [
  { name: "CoraVet", sector: "Veterinaria", plan: "Premium", users: 5, apps: 3, mrr: 199, status: "Activa" },
  { name: "EPC Contable", sector: "Estudio contable", plan: "Intermedio", users: 4, apps: 2, mrr: 99, status: "Activa" },
  { name: "Vallet Inmobiliaria", sector: "Inmobiliaria", plan: "Premium", users: 6, apps: 4, mrr: 199, status: "Activa" },
  { name: "Mesa Selecta", sector: "Alimentos y bebidas", plan: "Básico", users: 3, apps: 2, mrr: 49, status: "En prueba" },
  { name: "Auréa Skincare", sector: "Cuidado personal", plan: "Intermedio", users: 4, apps: 3, mrr: 99, status: "Activa" },
  { name: "Josué Panadería", sector: "Panadería", plan: "Básico", users: 2, apps: 1, mrr: 49, status: "Vencida" },
  { name: "Brenda y Ely", sector: "Café artesanal", plan: "Intermedio", users: 2, apps: 1, mrr: 99, status: "Activa" },
  { name: "VAR Sportswear", sector: "Ropa deportiva", plan: "Premium", users: 3, apps: 2, mrr: 199, status: "En prueba" },
  { name: "ECP Contable", sector: "Estudio contable", plan: "Intermedio", users: 3, apps: 2, mrr: 99, status: "Activa" },
  { name: "CoraVet Norte", sector: "Veterinaria", plan: "Premium", users: 4, apps: 3, mrr: 199, status: "Activa" },
  { name: "Brenda y Ely Sur", sector: "Café artesanal", plan: "Básico", users: 2, apps: 1, mrr: 49, status: "Activa" },
  { name: "Vallet Centro", sector: "Inmobiliaria", plan: "Empresarial", users: 8, apps: 5, mrr: 299, status: "Activa" },
];

const mrrData = [
  { label: "Abr", value: 1400 },
  { label: "May", value: 1800 },
  { label: "Jun", value: 2200 },
  { label: "Jul", value: 2600 },
  { label: "Ago", value: 3000 },
  { label: "Sep", value: 3200 },
];

const newCompaniesData = [
  { label: "Abr", value: 2 },
  { label: "May", value: 3 },
  { label: "Jun", value: 4 },
  { label: "Jul", value: 5 },
  { label: "Ago", value: 6 },
  { label: "Sep", value: 7 },
];

const plans = [
  { name: "Premium", value: 12, pct: 42, cls: "plan-premium" },
  { name: "Intermedio", value: 8, pct: 29, cls: "plan-intermedio" },
  { name: "Básico", value: 5, pct: 18, cls: "plan-basico" },
  { name: "Empresarial", value: 3, pct: 11, cls: "plan-empresarial" },
];

function MiniSpark({ type = "up" }) {
  return (
    <svg viewBox="0 0 100 34" className="mini-spark" aria-hidden="true">
      <path
        d={type === "up" ? "M2 28 C18 25, 25 24, 38 19 S55 17, 67 11 S82 8, 98 4" : "M2 10 C18 12, 25 9, 38 14 S55 17, 67 15 S82 23, 98 27"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiCard({ icon: Icon, title, value, change, tone = "green", spark = "up" }) {
  return (
    <div className="report-kpi">
      <div className={`kpi-icon ${tone}`}>
        <Icon size={17} strokeWidth={2.2} />
      </div>
      <div className="kpi-copy">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value-row">
          <strong>{value}</strong>
          <span className={`kpi-change ${change?.startsWith("↓") ? "down" : ""}`}>{change}</span>
        </div>
        <div className="kpi-sub">vs. mes anterior</div>
      </div>
      <div className={`spark ${tone}`}><MiniSpark type={spark} /></div>
    </div>
  );
}

function ChartCard({ title, subtitle, data, colorClass = "orange", suffix = "", maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <button className="period-btn">Últimos 6 meses <ChevronDown size={14} /></button>
      </div>

      <div className="bar-chart">
        <div className="y-axis">
          {suffix === "S/" ? ["S/ 4,000", "S/ 3,000", "S/ 2,000", "S/ 1,000", "S/ 0"].map((x) => <span key={x}>{x}</span>) : ["8", "6", "4", "2", "0"].map((x) => <span key={x}>{x}</span>)}
        </div>
        <div className="plot">
          <div className="grid-lines">
            {[0,1,2,3,4].map((i) => <i key={i} />)}
          </div>
          <div className="bars">
            {data.map((item) => (
              <div className="bar-group" key={item.label}>
                <div
                  className={`chart-bar ${colorClass}`}
                  style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
                  title={`${item.label}: ${suffix}${item.value.toLocaleString("es-PE")}`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutCard() {
  const segments = [
    { name: "Premium", pct: 42, cls: "seg-premium" },
    { name: "Intermedio", pct: 29, cls: "seg-intermedio" },
    { name: "Básico", pct: 18, cls: "seg-basico" },
    { name: "Empresarial", pct: 11, cls: "seg-empresarial" },
  ];

  let cursor = 0;
  const gradient = segments.map((s) => {
    const start = cursor;
    cursor += s.pct;
    return `${getComputedStyleSafe(s.cls)} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <div className="side-card">
      <div className="side-head">
        <h3>Suscripciones por plan</h3>
        <p>Distribución de suscripciones activas.</p>
      </div>
      <div className="donut-wrap">
        <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="donut-center">
            <strong>28</strong>
            <span>suscripciones</span>
          </div>
        </div>
        <div className="legend">
          {plans.map((p) => (
            <div className="legend-row" key={p.name}>
              <span className={`legend-dot ${p.cls}`} />
              <span>{p.name}</span>
              <b>{p.value}</b>
              <em>({p.pct}%)</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getComputedStyleSafe(cls) {
  const map = {
    "seg-premium": "rgb(255, 89, 31)",
    "seg-intermedio": "rgb(61, 126, 236)",
    "seg-basico": "rgb(235, 174, 0)",
    "seg-empresarial": "rgb(145, 67, 235)",
  };
  return map[cls] || "#ccc";
}

function AdditionalKpis() {
  return (
    <div className="side-card additional-card">
      <div className="side-head"><h3>KPIs adicionales</h3></div>
      <div className="additional-list">
        <div><span className="additional-icon blue"><TrendingUp size={15}/></span><span>Ingreso promedio por empresa</span><b>S/ 241 <small>↑ 12%</small></b></div>
        <div><span className="additional-icon pink"><RefreshCw size={15}/></span><span>Churn rate</span><b>8% <small>↓ 3%</small></b></div>
        <div><span className="additional-icon purple"><CreditCard size={15}/></span><span>Lifetime value (LTV)</span><b>S/ 2,850 <small>↑ 18%</small></b></div>
        <div><span className="additional-icon orange"><FileText size={15}/></span><span>Ticket promedio por suscripción</span><b>S/ 103 <small>↑ 10%</small></b></div>
      </div>
    </div>
  );
}

function QuickReports() {
  const items = ["Reporte de ingresos", "Reporte de suscripciones", "Reporte de empresas", "Reporte personalizado"];
  return (
    <div className="side-card quick-card">
      <div className="side-head">
        <h3>Reporte rápido</h3>
        <p>Genera y descarga reportes en diferentes formatos.</p>
      </div>
      <div className="quick-grid">
        {items.map((item) => (
          <button key={item} className="quick-btn"><FileText size={14}/>{item}</button>
        ))}
      </div>
    </div>
  );
}

function Status({ value }) {
  const cls = value === "Activa" ? "active" : value === "En prueba" ? "trial" : "expired";
  return <span className={`status ${cls}`}><i />{value}</span>;
}

export default function ReportesPanel({ onGenerateReport, onExport }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      [c.name, c.sector, c.plan, c.status].some((v) => v.toLowerCase().includes(q))
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const kpis = useMemo(() => {
    const totalMrr = companies.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const activeCompanies = companies.filter((c) => c.status === "Activa").length;
    const activeSubs = companies.reduce((sum, c) => sum + (c.apps || 0), 0);
    const retentionRate = companies.length > 0 ? Math.round((activeCompanies / companies.length) * 100) : 100;
    return {
      mrrFmt: `S/ ${totalMrr.toLocaleString("es-PE")}`,
      activeCompanies,
      activeSubs,
      retentionFmt: `${retentionRate}%`,
    };
  }, []);

  const generate = () => {
    if (onGenerateReport) onGenerateReport();
    else window.dispatchEvent(new CustomEvent("qaway:generate-report"));
  };

  const exportReport = () => {
    if (onExport) return onExport(visible);
    const headers = ["Empresa", "Plan", "Usuarios", "Aplicaciones", "MRR", "Estado"];
    const rows = filtered.map((c) => [c.name, c.plan, c.users, c.apps, c.mrr, c.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-qaway-lab.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-page">
      <style>{`
        .report-page{font-family:inherit;color:#101116;background:transparent;min-height:100%;padding:0;box-sizing:border-box}
        .report-page *{box-sizing:border-box}
        .report-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:25px}
        .breadcrumbs{font-size:13px;color:#747985;margin-bottom:8px;display:flex;gap:10px;align-items:center}
        .breadcrumbs span:last-child{color:#515661}
        .report-title{margin:0;font-size:28px;line-height:1.1;letter-spacing:-.8px;font-weight:760}
        .report-description{margin:7px 0 0;color:#727783;font-size:14px}
        .top-actions{display:flex;gap:12px;align-items:center}
        .date-btn,.generate-btn{height:42px;border-radius:12px;padding:0 15px;border:1px solid #e1e3e8;background:#fff;display:flex;align-items:center;gap:9px;font-size:13px;font-weight:650;color:#3e424b;cursor:pointer}
        .generate-btn{border-color:#ff4b0b;background:#ff4b0b;color:#fff;padding:0 19px;box-shadow:0 3px 8px rgba(255,75,11,.15)}
        .kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
        .report-kpi{height:132px;border:1px solid #e7e8eb;border-radius:16px;background:#fff;display:flex;align-items:flex-start;padding:18px 18px;position:relative;overflow:hidden;box-shadow:0 1px 2px rgba(16,17,22,.02)}
        .kpi-icon{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;flex:none}
        .kpi-icon.green{color:#12ae77;background:#e7faf3}.kpi-icon.blue{color:#397ff0;background:#edf4ff}.kpi-icon.orange{color:#ff7b31;background:#fff1e9}.kpi-icon.purple{color:#934ce8;background:#f3edff}
        .kpi-copy{margin-left:12px}.kpi-title{font-size:12px;color:#606671;font-weight:650;margin:1px 0 8px}.kpi-value-row{display:flex;align-items:baseline;gap:9px}.kpi-value-row strong{font-size:27px;letter-spacing:-.7px}.kpi-change{font-size:12px;color:#16aa76;font-weight:750}.kpi-change.down{color:#ef4444}.kpi-sub{font-size:11px;color:#8b9099;margin-top:2px}.spark{position:absolute;right:17px;bottom:20px;width:91px;height:37px}.spark.green{color:#19b980}.spark.blue{color:#4e8df3}.spark.orange{color:#ff6a32}.spark.purple{color:#a54cf1}.mini-spark{width:100%;height:100%}
        .main-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(350px,1fr);gap:14px}
        .charts-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .chart-card,.side-card,.table-card{border:1px solid #e6e8ec;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(16,17,22,.02)}
        .chart-card{height:282px;padding:15px 18px 12px}.chart-head{display:flex;justify-content:space-between;align-items:flex-start}.chart-head h3,.side-head h3{font-size:14px;margin:0;font-weight:750}.chart-head p,.side-head p{font-size:11px;color:#747984;margin:3px 0 0}.period-btn{height:31px;border:1px solid #e5e6ea;background:#fff;border-radius:8px;padding:0 10px;display:flex;align-items:center;gap:8px;font-size:11px;font-weight:650;color:#555a63}
        .bar-chart{height:192px;display:flex;margin-top:9px}.y-axis{width:57px;display:flex;flex-direction:column;justify-content:space-between;padding:7px 0 25px;color:#8a909a;font-size:10px}.plot{position:relative;flex:1}.grid-lines{position:absolute;inset:7px 0 27px;display:flex;flex-direction:column;justify-content:space-between}.grid-lines i{display:block;border-top:1px solid #edf0f3}.bars{height:100%;display:flex;align-items:flex-end;justify-content:space-around;gap:12px;padding:7px 4px 0}.bar-group{height:100%;flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative}.chart-bar{width:78%;max-width:66px;border-radius:6px 6px 0 0;min-height:7px;z-index:1}.chart-bar.orange{background:linear-gradient(to top,#ff4b0b,#ff7140)}.chart-bar.blue{background:linear-gradient(to top,#397ff0,#6ba0f5)}.bar-group span{font-size:10px;color:#777d87;height:21px;padding-top:7px}
        .right-col{display:flex;flex-direction:column;gap:14px}.side-card{padding:15px 18px}.side-head{margin-bottom:11px}.donut-wrap{display:flex;align-items:center;gap:24px}.donut{width:132px;height:132px;border-radius:50%;position:relative;flex:none}.donut:after{content:"";position:absolute;inset:27px;background:#fff;border-radius:50%}.donut-center{position:absolute;z-index:2;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column}.donut-center strong{font-size:17px}.donut-center span{font-size:10px;color:#858a94}.legend{display:flex;flex-direction:column;gap:9px;min-width:145px}.legend-row{display:grid;grid-template-columns:9px 1fr auto auto;gap:8px;align-items:center;font-size:11px;color:#5f646d}.legend-row b{font-weight:600}.legend-row em{font-style:normal;color:#878c95}.legend-dot{width:9px;height:9px;border-radius:50%}.seg-premium,.plan-premium{background:#ff591f}.seg-intermedio,.plan-intermedio{background:#3d7eec}.seg-basico,.plan-basico{background:#ebaE00}.seg-empresarial,.plan-empresarial{background:#9143eb}
        .additional-card{padding-bottom:12px}.additional-list{display:flex;flex-direction:column}.additional-list>div{min-height:38px;border-bottom:1px solid #f0f1f3;display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;font-size:11px;color:#646a73}.additional-list>div:last-child{border-bottom:0}.additional-list b{font-size:11px;color:#23262d}.additional-list small{font-size:10px;color:#18ad78;margin-left:4px}.additional-icon{width:27px;height:27px;border-radius:8px;display:grid;place-items:center}.additional-icon.blue{background:#edf4ff;color:#4184ee}.additional-icon.pink{background:#fff0f4;color:#e85a87}.additional-icon.purple{background:#f2ebff;color:#944ee7}.additional-icon.orange{background:#fff1e9;color:#ff7432}
        .quick-card{padding-bottom:16px}.quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.quick-btn{height:37px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;text-align:left;padding:0 10px;display:flex;align-items:center;gap:8px;color:#5e636d;font-size:10px;cursor:pointer}.quick-btn:hover,.date-btn:hover,.period-btn:hover{background:#fafafa}
        .table-card{overflow:hidden}.table-head{padding:15px 18px 10px;display:flex;justify-content:space-between;align-items:flex-start}.table-head h3{font-size:14px;margin:0}.table-head p{font-size:11px;color:#747984;margin:3px 0 0}.table-tools{display:flex;gap:9px}.search{width:210px;height:32px;border:1px solid #e3e5e9;border-radius:8px;display:flex;align-items:center;padding:0 9px;gap:7px;color:#8a8f98}.search input{border:0;outline:0;width:100%;font-size:11px;color:#333}.filter-btn{height:32px;border:1px solid #e3e5e9;border-radius:8px;background:#fff;display:flex;align-items:center;gap:7px;padding:0 11px;font-size:11px;font-weight:650;color:#575c65}.table-wrap{overflow-x:auto}.report-table{width:100%;border-collapse:collapse;min-width:690px}.report-table th{height:34px;background:#fafbfc;text-align:left;padding:0 10px;color:#5f646d;font-size:10px;font-weight:700;border-top:1px solid #f0f1f3;border-bottom:1px solid #eceef1}.report-table td{height:47px;padding:0 10px;border-bottom:1px solid #f0f1f3;font-size:10px;color:#555a63}.report-table th:first-child,.report-table td:first-child{padding-left:18px}.company-cell{display:flex;align-items:center;gap:8px}.company-logo{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#f1f2f4;color:#60656e;font-size:9px;font-weight:750}.company-logo.blue{background:#e8f0ff;color:#3d80ec}.company-logo.green{background:#eef7f1;color:#4d9368}.company-name strong{display:block;color:#202329;font-size:10px}.company-name span{display:block;color:#8a8f98;font-size:9px;margin-top:1px}.more{width:25px;height:25px;border:1px solid #e6e7ea;border-radius:8px;background:#fff;display:grid;place-items:center;color:#666b74;cursor:pointer}.status{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:650}.status i{width:7px;height:7px;border-radius:50%}.status.active{color:#11986d}.status.active i{background:#18b47d}.status.trial{color:#bd8300}.status.trial i{background:#f4ad12}.status.expired{color:#e53b3b}.status.expired i{background:#ef3e43}.table-foot{height:52px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;color:#747984;font-size:10px}.pagination{display:flex;align-items:center;gap:5px}.page-btn{width:31px;height:31px;border:0;background:#fff;border-radius:8px;color:#656a73;display:grid;place-items:center;cursor:pointer}.page-btn.active{background:#ff4b0b;color:#fff}.page-btn:disabled{opacity:.4;cursor:not-allowed}.page-size{margin-left:34px;display:flex;align-items:center;gap:7px}.page-size select{border:1px solid #e4e6ea;border-radius:8px;height:31px;padding:0 8px;background:#fff;font-size:10px;color:#555}
        @media(max-width:1180px){.kpi-grid{grid-template-columns:repeat(2,1fr)}.main-grid{grid-template-columns:1fr}.right-col{display:grid;grid-template-columns:1fr 1fr}.charts-row{grid-template-columns:1fr 1fr}}
        @media(max-width:780px){.report-page{padding:18px}.report-top{flex-direction:column;gap:15px}.top-actions{width:100%}.date-btn,.generate-btn{flex:1;justify-content:center}.kpi-grid,.charts-row,.right-col{grid-template-columns:1fr}.table-head{flex-direction:column;gap:10px}.table-tools{width:100%}.search{flex:1;width:auto}.donut-wrap{justify-content:center}.table-foot{padding:0 10px}.page-size{margin-left:8px}}
      `}</style>

      <div className="report-top">
        <div>
          <div className="breadcrumbs"><span>Inicio</span><span>›</span><span>Reportes</span></div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">Reportes</h1>
          <p className="report-description">Analiza el desempeño del ecosistema Qaway Lab con datos en tiempo real. Visualiza métricas clave, genera reportes y toma mejores decisiones.</p>
        </div>
        <div className="top-actions">
          <button className="date-btn"><CalendarDays size={15}/>01 Sep 2026 - 30 Sep 2026<ChevronDown size={14}/></button>
          <button className="generate-btn" onClick={generate}><Download size={15}/>Generar reporte</button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon={TrendingUp} title="Ingresos totales (MRR)" value={kpis.mrrFmt} change="↑ 15%" tone="green" />
        <KpiCard icon={Users} title="Empresas activas" value={String(kpis.activeCompanies)} change="↑ 33%" tone="blue" />
        <KpiCard icon={CreditCard} title="Suscripciones activas" value={String(kpis.activeSubs)} change="↑ 27%" tone="orange" />
        <KpiCard icon={BarChart3} title="Tasa de retención" value={kpis.retentionFmt} change="↑ 5%" tone="purple" spark="up" />
      </div>

      <div className="main-grid">
        <div>
          <div className="charts-row">
            <ChartCard title="Ingresos recurrentes (MRR)" subtitle="Evolución de ingresos en los últimos 6 meses." data={mrrData} colorClass="orange" suffix="S/" maxValue={4000} />
            <ChartCard title="Nuevas empresas" subtitle="Empresas registradas por mes." data={newCompaniesData} colorClass="blue" maxValue={8} />
          </div>

          <div className="table-card">
            <div className="table-head">
              <div>
                <h3>Reporte por empresa</h3>
                <p>Resumen de métricas por empresa.</p>
              </div>
              <div className="table-tools">
                <label className="search"><Search size={14}/><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar empresa..." /></label>
                <button className="filter-btn"><Filter size={14}/>Filtros</button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="report-table">
                <thead><tr><th>Empresa</th><th>Plan actual</th><th>Usuarios</th><th>Aplicaciones</th><th>MRR (S/)</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {visible.map((company, index) => (
                    <tr key={`${company.name}-${index}`}>
                      <td><div className="company-cell"><div className={`company-logo ${index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : ""}`}>{company.name.slice(0,3).toUpperCase()}</div><div className="company-name"><strong>{company.name}</strong><span>{company.sector}</span></div></div></td>
                      <td>{company.plan}</td>
                      <td>{company.users}</td>
                      <td>{company.apps}</td>
                      <td>{company.mrr}</td>
                      <td><Status value={company.status}/></td>
                      <td><button className="more"><MoreHorizontal size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-foot">
              <span>Mostrando {visible.length} de {filtered.length} empresas</span>
              <div className="pagination">
                <button className="page-btn" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={15}/></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 4).map((p) => (
                  <button key={p} className={`page-btn ${p === safePage ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={15}/></button>
              </div>
              <label className="page-size">Filas por página:<select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label>
            </div>
          </div>
        </div>

        <div className="right-col">
          <DonutCard />
          <AdditionalKpis />
          <QuickReports />
        </div>
      </div>
    </div>
  );
}
