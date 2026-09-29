import React, { useMemo, useState } from "react";
import {
  Search, Bell, Moon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Plus, FileText, Settings, Clock3, CheckCircle2, CircleDollarSign,
  CalendarDays, Filter, Eye, Pencil, MoreHorizontal, Download, Save,
  ArrowLeft, Building2, UserRound, Wallet, Calculator, ShieldCheck,
  Paperclip, Trash2, Upload, Receipt, ChartNoAxesColumn, CreditCard,
  SlidersHorizontal, X, Check, FileCheck2, Landmark
} from "lucide-react";
import "./12-Liquidaciones.css";

const initialLiquidations = [
  { id:"LIQ-2026-0012", date:"25/09/2026", party:"Brew Coffee SAC", subtitle:"Suministro de café", initials:"BC", type:"Proveedor", period:"01/09 - 25/09", total:1250, status:"Pagado", paidDate:"26/09/2026", method:"Transferencia", receipt:"TRF-001245" },
  { id:"LIQ-2026-0011", date:"22/09/2026", party:"Juan Quispe", subtitle:"Comisión de ventas", initials:"JQ", type:"Comisión", period:"01/09 - 21/09", total:480, status:"Pendiente", paidDate:"—", method:"Yape", receipt:"—" },
  { id:"LIQ-2026-0010", date:"20/09/2026", party:"Distribuidora Perú", subtitle:"Insumos de embalaje", initials:"DP", type:"Proveedor", period:"01/09 - 20/09", total:920, status:"Pagado", paidDate:"21/09/2026", method:"Transferencia", receipt:"TRF-001198" },
  { id:"LIQ-2026-0009", date:"18/09/2026", party:"Luis Castillo", subtitle:"Incentivo por metas", initials:"LC", type:"Comisión", period:"01/09 - 18/09", total:350, status:"Pagado", paidDate:"19/09/2026", method:"Yape", receipt:"YAP-887633" },
  { id:"LIQ-2026-0008", date:"15/09/2026", party:"Transportes M&S", subtitle:"Servicio de delivery", initials:"TM", type:"Servicio", period:"01/09 - 15/09", total:280, status:"Pendiente", paidDate:"—", method:"Transferencia", receipt:"—" },
  { id:"LIQ-2026-0007", date:"12/09/2026", party:"Distribuidora Perú", subtitle:"Insumos de embalaje", initials:"DP", type:"Proveedor", period:"01/09 - 12/09", total:920, status:"Pagado", paidDate:"15/09/2026", method:"Transferencia", receipt:"TRF-001198" },
  { id:"LIQ-2026-0006", date:"12/09/2026", party:"Juan Quispe", subtitle:"Comisión de ventas", initials:"JQ", type:"Comisión", period:"01/09 - 12/09", total:480, status:"Pagado", paidDate:"12/09/2026", method:"Efectivo", receipt:"REC-004321" },
  { id:"LIQ-2026-0005", date:"08/09/2026", party:"Brew Coffee SAC", subtitle:"Suministro de café", initials:"BC", type:"Proveedor", period:"01/09 - 08/09", total:1110, status:"Pagado", paidDate:"08/09/2026", method:"Transferencia", receipt:"TRF-001156" },
  { id:"LIQ-2026-0004", date:"05/09/2026", party:"Luis Castillo", subtitle:"Incentivo por metas", initials:"LC", type:"Comisión", period:"01/09 - 05/09", total:350, status:"Pendiente", paidDate:"—", method:"Yape", receipt:"YAP-775421" },
  { id:"LIQ-2026-0003", date:"03/09/2026", party:"Transportes M&S", subtitle:"Servicio de delivery", initials:"TM", type:"Servicio", period:"01/09 - 03/09", total:280, status:"Pendiente", paidDate:"—", method:"Transferencia", receipt:"TRF-001102" },
  { id:"LIQ-2026-0002", date:"02/09/2026", party:"Distribuidora Perú", subtitle:"Insumos de embalaje", initials:"DP", type:"Proveedor", period:"01/09 - 02/09", total:920, status:"Pendiente", paidDate:"—", method:"Transferencia", receipt:"TRF-001098" },
  { id:"LIQ-2026-0001", date:"01/09/2026", party:"Brew Coffee SAC", subtitle:"Suministro de café", initials:"BC", type:"Proveedor", period:"01/09 - 01/09", total:1250, status:"Rechazado", paidDate:"—", method:"Transferencia", receipt:"TRF-001087" },
];

const money = (n) => new Intl.NumberFormat("es-PE", { style:"currency", currency:"PEN", minimumFractionDigits:2 }).format(n).replace("PEN", "S/").replace(/\s/g, " ");
const tabs = [
  ["list", "Lista de liquidaciones", FileText],
  ["new", "Nueva liquidación", Plus],
  ["history", "Historial de pagos", Clock3],
  ["config", "Configuración", Settings],
];

function Badge({ children, tone }) {
  const cls = tone || (children === "Pagado" ? "green" : children === "Pendiente" ? "yellow" : children === "Rechazado" ? "red" : "blue");
  return <span className={`liq-badge ${cls}`}>{children}</span>;
}
function IconButton({ children, title, onClick }) {
  return <button className="liq-icon-btn" title={title} onClick={onClick}>{children}</button>;
}
function StatCard({ icon: Icon, value, label, note, color="blue" }) {
  return <div className="liq-stat"><div className={`liq-stat-icon ${color}`}><Icon size={25}/></div><div><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div></div>;
}

export default function Liquidaciones() {
  const [page, setPage] = useState("list");
  const [rows, setRows] = useState(initialLiquidations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [selected, setSelected] = useState(initialLiquidations[0]);
  const [showDetail, setShowDetail] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ party:"Brew Coffee SAC", type:"Proveedor", id:"LIQ-2026-0013", date:"25/09/2026", periodStart:"01/09/2026", periodEnd:"25/09/2026", status:"Pendiente", method:"Transferencia", receipt:"", notes:"" });
  const [items, setItems] = useState([
    { name:"Café El Colono Premium", sku:"COL-250-MOL", qty:50, unit:"un.", price:22 },
    { name:"Taza de cerámica", sku:"TAZ-001", qty:20, unit:"un.", price:4.5 },
    { name:"Filtros de papel #2", sku:"FIL-002", qty:10, unit:"un.", price:3.5 },
    { name:"Envío", sku:"—", qty:1, unit:"serv.", price:25 },
  ]);
  const [configTab, setConfigTab] = useState("General");
  const [settings, setSettings] = useState({
    defaultStatus:"Pendiente", defaultType:"Proveedor", defaultPeriod:"Mes actual", defaultMethod:"Transferencia",
    multiMethod:true, stock:true, noStock:false, showCost:true, accounting:true, discounts:true, extraCharges:true,
    approval:false, lockPaid:true, receiptRequired:true, dateValidation:true, prefix:"LIQ-", numberFormat:"Año + secuencial (0001)", nextNumber:"LIQ-2026-0014",
    updatePurchases:true, syncAccounting:false
  });
  const total = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
  const filtered = useMemo(() => rows.filter(r => {
    const term = search.toLowerCase();
    return (!term || [r.id,r.party,r.subtitle,r.receipt].some(v => String(v).toLowerCase().includes(term))) &&
      (statusFilter === "Todos" || r.status === statusFilter) &&
      (typeFilter === "Todos" || r.type === typeFilter) &&
      (methodFilter === "Todos" || r.method === methodFilter);
  }), [rows, search, statusFilter, typeFilter, methodFilter]);
  const pageRows = filtered.slice((currentPage-1)*10, currentPage*10);
  const paid = rows.filter(r => r.status === "Pagado").reduce((s,r)=>s+r.total,0);
  const pending = rows.filter(r => r.status === "Pendiente").reduce((s,r)=>s+r.total,0);

  const updateItem = (idx, key, value) => setItems(old => old.map((it,i)=>i===idx ? {...it,[key]:value} : it));
  const saveLiquidation = () => {
    const newRow = { id:form.id, date:form.date, party:form.party, subtitle:form.type === "Proveedor" ? "Suministro / compra" : form.type, initials:form.party.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(), type:form.type, period:`${form.periodStart.slice(0,5)} - ${form.periodEnd.slice(0,5)}`, total, status:form.status, paidDate:form.status==="Pagado" ? form.date : "—", method:form.method, receipt:form.receipt || "—" };
    setRows(old => [newRow, ...old]);
    setSelected(newRow); setShowDetail(true); setPage("list");
  };
  const toggleSetting = (key) => setSettings(s=>({...s,[key]:!s[key]}));

  return <div className="liq-app">
    <aside className="liq-sidebar">
      <div className="liq-brand"><div className="liq-logo">◆</div><div><b>Inventi <em>Pro</em></b><small>Inventario & ERP Comercial</small></div></div>
      <nav className="liq-nav">
        <div className="liq-nav-item"><ChartNoAxesColumn size={18}/>Resumen</div>
        <label>LOGÍSTICA</label>
        <div className="liq-nav-item"><Receipt size={18}/>Productos</div><div className="liq-nav-item"><FileText size={18}/>Categorías</div><div className="liq-nav-item"><Landmark size={18}/>Ubicaciones</div><div className="liq-nav-item"><SlidersHorizontal size={18}/>Movimientos</div>
        <label>COMERCIAL</label>
        <div className="liq-nav-item"><UserRound size={18}/>Clientes</div><div className="liq-nav-item"><FileText size={18}/>Cotizaciones</div><div className="liq-nav-item"><CircleDollarSign size={18}/>Ventas</div><div className="liq-nav-item"><Wallet size={18}/>Pedidos</div>
        <label>COMPRAS</label>
        <div className="liq-nav-item"><Receipt size={18}/>Compras</div><div className="liq-nav-item"><CircleDollarSign size={18}/>Precios</div><div className="liq-nav-item"><PackageIcon/>Paquetes / Kits</div>
        <div className="liq-nav-item active"><FileCheck2 size={18}/>Liquidaciones <ChevronUp size={14} className="nav-end"/></div>
        <div className="liq-subnav">{tabs.map(([key,label,Icon])=><button key={key} className={page===key?"selected":""} onClick={()=>{setPage(key);setShowDetail(false)}}>{label}</button>)}</div>
        <div className="liq-nav-item"><FileText size={18}/>Catálogos</div>
        <label>OPERACIONES</label><div className="liq-nav-item"><Receipt size={18}/>Entregas</div><div className="liq-nav-item"><UserRound size={18}/>Usuarios</div><div className="liq-nav-item"><Settings size={18}/>Configuración</div>
      </nav>
      <div className="liq-plan"><b>▣　Plan Profesional</b><small>Inventi Pro</small><div className="liq-progress"><i/></div><small>800 de 2,000 productos</small><a>Ver últimos beneficios →</a></div>
    </aside>
    <main className="liq-main">
      <header className="liq-topbar"><div className="liq-global-search"><Search size={20}/><input placeholder="Buscar productos, clientes, ventas, pedidos..."/><kbd>Ctrl</kbd><kbd>K</kbd></div><button className="liq-branch"><Building2 size={17}/> Sede Lima <ChevronDown size={15}/></button><button className="liq-top-icon"><Bell size={20}/><i/></button><button className="liq-top-icon"><Moon size={20}/></button><div className="liq-user"><span>S</span><div><b>S Admin</b><small>Administrador</small></div><ChevronDown size={15}/></div></header>
      <div className="liq-content">
        <div className="liq-breadcrumb">Liquidaciones <span>›</span> {tabs.find(t=>t[0]===page)?.[1]}</div>
        {page==="list" && <ListPage {...{rows,filtered,pageRows,search,setSearch,statusFilter,setStatusFilter,typeFilter,setTypeFilter,methodFilter,setMethodFilter,currentPage,setCurrentPage,selected,setSelected,showDetail,setShowDetail,paid,pending,setPage}} />}
        {page==="new" && <NewPage {...{form,setForm,items,setItems,total,updateItem,saveLiquidation,setPage}} />}
        {page==="history" && <HistoryPage {...{rows,search,setSearch,statusFilter,setStatusFilter,methodFilter,setMethodFilter,selected,setSelected,setShowDetail}} />}
        {page==="config" && <ConfigPage {...{configTab,setConfigTab,settings,setSettings,toggleSetting,setPage}} />}
      </div>
    </main>
  </div>;
}

function PackageIcon(){return <Receipt size={18}/>}

function ListPage(p) {
  const {filtered,pageRows,search,setSearch,statusFilter,setStatusFilter,typeFilter,setTypeFilter,methodFilter,setMethodFilter,currentPage,setCurrentPage,selected,setSelected,showDetail,setShowDetail,paid,pending,setPage}=p;
  return <><div className="liq-title-row"><div className="liq-title-icon"><FileText size={30}/></div><div><h1>Liquidaciones</h1><p>Gestiona los pagos y liquidaciones a proveedores, comisiones o personal.</p></div><button className="liq-primary push" onClick={()=>setPage("new")}><Plus size={18}/> Nueva liquidación</button></div>
    <div className="liq-stats">
      <StatCard icon={FileText} value="12" label="Liquidaciones este mes" note="↑ +33% vs. mes anterior"/>
      <StatCard icon={CircleDollarSign} value={money(4850)} label="Total liquidado este mes" note="↑ +18% vs. mes anterior" color="orange"/>
      <StatCard icon={Clock3} value={money(980)} label="Pendiente de pago" note="3 liquidaciones" color="green"/>
      <StatCard icon={CheckCircle2} value={money(3870)} label="Pagado" note="9 liquidaciones" color="blue"/>
    </div>
    <div className="liq-filterbar"><div className="liq-search"><Search size={18}/><input value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1)}} placeholder="Buscar por proveedor, concepto o número..."/></div><label>Tipo<select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option>Todos</option><option>Proveedor</option><option>Comisión</option><option>Servicio</option></select></label><label>Estado<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Pagado</option><option>Pendiente</option><option>Rechazado</option></select></label><label>Método<select value={methodFilter} onChange={e=>setMethodFilter(e.target.value)}><option>Todos</option><option>Transferencia</option><option>Yape</option><option>Efectivo</option></select></label><button className="liq-outline"><Filter size={16}/> Más filtros</button></div>
    <div className="liq-table-wrap"><table className="liq-table"><thead><tr><th><input type="checkbox"/></th><th>N° liquidación</th><th>Fecha</th><th>Proveedor / Destinatario</th><th>Tipo</th><th>Periodo</th><th>Total (S/)</th><th>Estado</th><th>Fecha de pago</th><th>Acciones</th></tr></thead><tbody>{pageRows.map(r=><tr key={r.id} className={selected?.id===r.id?"row-selected":""} onClick={()=>{setSelected(r);setShowDetail(true)}}><td><input type="checkbox" onClick={e=>e.stopPropagation()}/></td><td><a>{r.id}</a></td><td>{r.date}</td><td><div className="liq-party"><span>{r.initials}</span><div><b>{r.party}</b><small>{r.subtitle}</small></div></div></td><td><Badge tone={r.type==="Proveedor"?"blue":r.type==="Comisión"?"purple":"orange"}>{r.type}</Badge></td><td>{r.period}</td><td className="align-right">{money(r.total)}</td><td><Badge>{r.status}</Badge></td><td>{r.paidDate}</td><td><div className="liq-actions"><IconButton title="Ver detalle" onClick={e=>{e?.stopPropagation?.();setSelected(r);setShowDetail(true)}}><Eye size={17}/></IconButton><IconButton title="Editar" onClick={e=>{e?.stopPropagation?.();setSelected(r);setPage("new")}}><Pencil size={17}/></IconButton><IconButton title="Más opciones"><MoreHorizontal size={18}/></IconButton></div></td></tr>)}</tbody></table><div className="liq-table-footer"><span>Mostrando {pageRows.length} de {filtered.length} liquidaciones</span><div>Filas por página <select><option>10</option><option>25</option><option>50</option></select><button disabled={currentPage===1} onClick={()=>setCurrentPage(x=>Math.max(1,x-1))}><ChevronLeft size={17}/></button><button className="current">{currentPage}</button><button onClick={()=>setCurrentPage(x=>x+1)}><ChevronRight size={17}/></button></div></div></div>
    <div className="liq-lower-grid"><section className="liq-panel"><h3><FileText/>Detalle de liquidación <span className="spacer"/><Badge>{selected?.status||"Pagado"}</Badge></h3><div className="liq-detail-person"><span>{selected?.initials||"BC"}</span><div><b>{selected?.id||"LIQ-2026-0012"}</b><strong>{selected?.party||"Brew Coffee SAC"}</strong><small>RUC 20601234567<br/>{selected?.subtitle}</small></div></div><div className="liq-detail-grid"><div><small>Tipo</small><Badge tone="blue">{selected?.type||"Proveedor"}</Badge></div><div><small>Periodo</small><b>{selected?.period||"01/09 - 25/09"}</b></div><div><small>Fecha</small><b>{selected?.date||"25/09/2026"}</b></div><div><small>Fecha de pago</small><b>{selected?.paidDate||"26/09/2026"}</b></div></div><p className="liq-note">Liquidación correspondiente al suministro según OC-2026-0045.</p></section>
      <section className="liq-panel"><h3><Receipt/>Productos / Conceptos <span className="spacer"/><button className="liq-mini-btn">▤ Ver documentos</button></h3><table className="liq-small-table"><thead><tr><th>Producto / Concepto</th><th>SKU</th><th>Cantidad</th><th>Precio (S/)</th><th>Total (S/)</th></tr></thead><tbody><tr><td>Café El Colono Premium</td><td>COL-250-MOL</td><td>50 un.</td><td>22.00</td><td>1,100.00</td></tr><tr><td>Taza de cerámica</td><td>TAZ-001</td><td>20 un.</td><td>4.50</td><td>90.00</td></tr><tr><td>Filtros de papel #2</td><td>FIL-002</td><td>10 un.</td><td>3.50</td><td>35.00</td></tr><tr><td>Envío</td><td>—</td><td>1 serv.</td><td>25.00</td><td>25.00</td></tr></tbody></table><div className="liq-total-line"><b>Total liquidación</b><strong>{money(selected?.total||1250)}</strong></div></section>
      <div className="liq-right-stack"><section className="liq-panel"><h3><Clock3/>Historial de pagos</h3><table className="liq-small-table"><thead><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Estado</th><th>Comprobante</th></tr></thead><tbody><tr><td>{selected?.paidDate||"26/09/2026"}</td><td>{money(selected?.total||1250)}</td><td>{selected?.method||"Transferencia"}</td><td><Badge>{selected?.status||"Pagado"}</Badge></td><td>{selected?.receipt||"TRF-001245"} ↗</td></tr></tbody></table></section><section className="liq-panel"><h3><ChartNoAxesColumn/>Resumen financiero</h3><div className="liq-finance"><div><small>Total liquidación</small><b>{money(selected?.total||1250)}</b></div><div><small>Total pagado</small><b className="green-text">{money(selected?.status==="Pagado"?(selected?.total||1250):0)}</b></div><div><small>Saldo pendiente</small><b>{money(selected?.status==="Pagado"?0:(selected?.total||1250))}</b></div></div></section></div></div>
    {showDetail && <button className="liq-floating-close" onClick={()=>setShowDetail(false)}><X size={16}/> Ocultar detalle</button>}
  </>;
}

function NewPage({form,setForm,items,setItems,total,updateItem,saveLiquidation,setPage}) {
  const set=(key,value)=>setForm(f=>({...f,[key]:value}));
  return <><div className="liq-title-row"><div className="liq-title-icon"><FileText size={30}/></div><div><h1>Nueva liquidación</h1><p>Registra los productos o conceptos a liquidar y genera el documento de pago.</p></div><button className="liq-outline push" onClick={()=>setPage("list")}><ArrowLeft size={17}/> Volver a la lista</button></div>
    <div className="liq-new-layout"><div className="liq-new-left"><section className="liq-panel"><h3><span className="liq-section-icon"><FileCheck2/></span><div>1. Información general<small>Completa los datos principales de la liquidación.</small></div></h3><div className="liq-form-grid"><label>Proveedor / Destinatario <i>*</i><select value={form.party} onChange={e=>set("party",e.target.value)}><option>Brew Coffee SAC</option><option>Distribuidora Perú</option><option>Juan Quispe</option><option>Luis Castillo</option><option>Transportes M&S</option></select></label><label>Tipo de liquidación <i>*</i><select value={form.type} onChange={e=>set("type",e.target.value)}><option>Proveedor</option><option>Comisión</option><option>Servicio</option><option>Personal</option></select></label><label>N° de liquidación<input value={form.id} onChange={e=>set("id",e.target.value)}/></label><label>Fecha de liquidación <i>*</i><input value={form.date} onChange={e=>set("date",e.target.value)} /></label><label>Inicio del periodo<input value={form.periodStart} onChange={e=>set("periodStart",e.target.value)}/></label><label>Fin del periodo<input value={form.periodEnd} onChange={e=>set("periodEnd",e.target.value)}/></label><label className="full">Observaciones<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Agrega una descripción o referencia para esta liquidación..." maxLength={500}/><small className="char-count">{form.notes.length}/500</small></label></div></section>
      <section className="liq-panel"><h3><span className="liq-section-icon"><Receipt/></span><div>2. Productos / Conceptos<small>Agrega los productos, servicios o conceptos a incluir en la liquidación.</small></div><span className="spacer"/><button className="liq-outline" onClick={()=>setItems(old=>[...old,{name:"Nuevo concepto",sku:"—",qty:1,unit:"un.",price:0}])}><Plus size={16}/> Agregar ítem</button></h3><div className="liq-search add-search"><Search size={17}/><input placeholder="Buscar producto por nombre o SKU..."/><button className="liq-outline">▤ Agregar desde pedido</button></div><div className="liq-table-wrap"><table className="liq-table edit-table"><thead><tr><th>#</th><th>Producto / Concepto</th><th>SKU</th><th>Cantidad</th><th>Precio (S/)</th><th>Total (S/)</th><th></th></tr></thead><tbody>{items.map((it,i)=><tr key={i}><td>{i+1}</td><td><input className="cell-input name-input" value={it.name} onChange={e=>updateItem(i,"name",e.target.value)}/></td><td>{it.sku}</td><td><input className="cell-input qty-input" type="number" min="0" value={it.qty} onChange={e=>updateItem(i,"qty",Number(e.target.value))}/><small>{it.unit}</small></td><td><input className="cell-input price-input" type="number" min="0" step="0.01" value={it.price} onChange={e=>updateItem(i,"price",Number(e.target.value))}/></td><td>{money(it.qty*it.price)}</td><td><IconButton title="Eliminar ítem" onClick={()=>setItems(old=>old.filter((_,idx)=>idx!==i))}><Trash2 size={16}/></IconButton></td></tr>)}</tbody></table></div></section></div>
    <aside className="liq-new-right"><section className="liq-panel"><h3><Calculator/>3. Resumen de la liquidación<small>Revisa los montos antes de guardar.</small></h3><div className="liq-summary-row"><span>Subtotal ({items.length} ítems)</span><b>{money(total)}</b></div><div className="liq-summary-row"><span>Descuentos</span><b>{money(0)}</b></div><div className="liq-summary-row"><span>Cargos adicionales</span><b>{money(0)}</b></div><div className="liq-summary-total"><b>Total a liquidar</b><strong>{money(total)}</strong></div></section>
      <section className="liq-panel"><h3><Settings/>Estado y pago</h3><div className="liq-form-grid"><label>Estado <i>*</i><select value={form.status} onChange={e=>set("status",e.target.value)}><option>Pendiente</option><option>Pagado</option><option>Rechazado</option></select></label><label>Fecha de pago<input placeholder="Seleccionar fecha" value={form.status==="Pagado"?form.date:""} onChange={e=>set("date",e.target.value)} /></label><label>Método de pago<select value={form.method} onChange={e=>set("method",e.target.value)}><option>Transferencia</option><option>Yape</option><option>Efectivo</option><option>Tarjeta</option></select></label><label>N° de comprobante<input value={form.receipt} onChange={e=>set("receipt",e.target.value)} placeholder="Ej. TRF-001245"/></label></div></section>
      <section className="liq-panel"><h3><Paperclip/>Documentos y archivos<small>Adjunta documentos de respaldo (facturas, guías, etc.).</small></h3><label className="liq-upload"><Upload/><span>Arrastra archivos aquí o selecciona<small>PDF, JPG o PNG (máx. 10 MB)</small><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"/></span></label></section>
      <div className="liq-form-actions"><button className="liq-outline" onClick={()=>setPage("list")}>Cancelar</button><button className="liq-primary" onClick={saveLiquidation}><Save size={16}/> Guardar liquidación</button></div></aside></div>
  </>;
}

function HistoryPage({rows,search,setSearch,statusFilter,setStatusFilter,methodFilter,setMethodFilter,selected,setSelected,setShowDetail}) {
  const payments=rows.filter(r=>r.status==="Pagado");
  const filtered=payments.filter(r=>(!search||[r.id,r.party,r.receipt].some(v=>String(v).toLowerCase().includes(search.toLowerCase())))&&(statusFilter==="Todos"||r.status===statusFilter)&&(methodFilter==="Todos"||r.method===methodFilter));
  return <><div className="liq-title-row"><div className="liq-title-icon"><Clock3 size={30}/></div><div><h1>Historial de pagos</h1><p>Consulta y gestiona todos los pagos realizados por liquidaciones.</p></div></div><div className="liq-stats"><StatCard icon={CircleDollarSign} value={money(12480)} label="Total pagado" note="48 pagos realizados"/><StatCard icon={CheckCircle2} value={money(10950)} label="Pagos completados" note="42 pagos (87.5%)" color="green"/><StatCard icon={Clock3} value={money(1530)} label="Pagos pendientes" note="5 pagos (10.4%)" color="orange"/><StatCard icon={X} value={money(0)} label="Pagos rechazados" note="1 pago (2.1%)" color="red"/></div>
    <div className="liq-filterbar"><div className="liq-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por N° de liquidación, proveedor o comprobante..."/></div><label>Estado<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Pagado</option></select></label><label>Método de pago<select value={methodFilter} onChange={e=>setMethodFilter(e.target.value)}><option>Todos</option><option>Transferencia</option><option>Yape</option><option>Efectivo</option></select></label><label>Fecha desde<input type="date" defaultValue="2026-09-01"/></label><label>Fecha hasta<input type="date" defaultValue="2026-09-30"/></label><button className="liq-outline"><Filter size={16}/> Más filtros</button></div>
    <div className="liq-table-wrap"><table className="liq-table"><thead><tr><th><input type="checkbox"/></th><th>Fecha de pago ↓</th><th>N° liquidación</th><th>Proveedor / Destinatario</th><th>Monto (S/)</th><th>Método de pago</th><th>N° de comprobante</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><input type="checkbox"/></td><td>{r.paidDate}</td><td><a>{r.id}</a></td><td><div className="liq-party"><span>{r.initials}</span><div><b>{r.party}</b><small>{r.subtitle}</small></div></div></td><td>{money(r.total)}</td><td><Badge tone={r.method==="Yape"?"purple":"blue"}>{r.method}</Badge></td><td>{r.receipt}</td><td><Badge>{r.status}</Badge></td><td><div className="liq-actions"><IconButton title="Ver detalle" onClick={()=>{setSelected(r);setShowDetail(true)}}><Eye size={17}/></IconButton><IconButton title="Descargar comprobante"><Download size={17}/></IconButton><IconButton title="Más opciones"><MoreHorizontal size={18}/></IconButton></div></td></tr>)}</tbody></table><div className="liq-table-footer"><span>Mostrando {filtered.length} pagos</span><div>Filas por página <select><option>10</option><option>25</option></select><button><ChevronLeft size={17}/></button><button className="current">1</button><button><ChevronRight size={17}/></button></div></div></div></>;
}

function ConfigPage({configTab,setConfigTab,settings,setSettings,toggleSetting,setPage}) {
  const tabs=["General","Métodos de pago","Numeración","Documentos","Notificaciones","Permisos"];
  const select=(key,label,options)=> <label>{label}<select value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
  const toggle=(key,title,desc)=><div className="liq-toggle-row"><button className={`liq-switch ${settings[key]?"on":""}`} onClick={()=>toggleSetting(key)} aria-pressed={settings[key]}><i/></button><div><b>{title}</b><small>{desc}</small></div></div>;
  return <><div className="liq-title-row"><div className="liq-title-icon"><Settings size={30}/></div><div><h1>Configuración de liquidaciones</h1><p>Define las reglas, opciones y parámetros para el proceso de liquidación y pagos.</p></div></div><div className="liq-tabs">{tabs.map(t=><button className={configTab===t?"active":""} onClick={()=>setConfigTab(t)} key={t}>{t}</button>)}</div>
    <div className="liq-config-grid"><section className="liq-panel"><h3><FileText/>Información general<small>Configura el funcionamiento principal de las liquidaciones.</small></h3><div className="liq-form-grid">{select("defaultStatus","Estado por defecto",["Pendiente","Pagado","Rechazado"])}{select("defaultType","Tipo de liquidación por defecto",["Proveedor","Comisión","Servicio","Personal"])}{select("defaultPeriod","Periodo por defecto",["Mes actual","Semana actual","Quincena actual","Personalizado"])}{select("defaultMethod","Método de pago por defecto",["Transferencia","Yape","Efectivo","Tarjeta"])}</div></section>
      <section className="liq-panel"><h3><ShieldCheck/>Opciones de liquidación<small>Activa o desactiva funcionalidades según tus necesidades.</small></h3>{toggle("multiMethod","Permitir múltiples modos de pago","Una liquidación puede tener más de un método de pago.")}{toggle("stock","Validar stock de productos","Verifica el stock disponible al agregar productos.")}{toggle("noStock","Permitir liquidación sin stock","Permite liquidar aunque no haya stock disponible.")}{toggle("showCost","Mostrar precio de compra en la liquidación","Muestra el costo de referencia de los productos.")}{toggle("accounting","Generar asiento o registro contable","Crea un registro contable al marcar como pagado.")}</section>
      <section className="liq-panel"><h3><Calculator/>Cálculo y redondeo<small>Define cómo se calculan los montos y se aplican descuentos.</small></h3><div className="liq-form-grid">{select("rounding","Redondeo de montos",["2 decimales (0.01)","Sin redondeo","Entero (1.00)"])}</div>{toggle("discounts","Permitir descuentos","Permite aplicar descuentos al total.")}{toggle("extraCharges","Permitir cargos adicionales","Permite agregar cargos como transporte o comisión.")}</section>
      <section className="liq-panel"><h3><ShieldCheck/>Control y validaciones<small>Establece reglas para la aprobación y el pago.</small></h3>{toggle("approval","Requerir aprobación previa","La liquidación debe aprobarse antes de pagar.")}{toggle("lockPaid","Limitar edición después de pago","No permite modificar una liquidación pagada.")}{toggle("receiptRequired","Requerir comprobante de pago","Obliga a adjuntar un comprobante al marcar como pagado.")}{toggle("dateValidation","Validar fecha dentro del periodo","La fecha de liquidación debe estar dentro del periodo.")}</section>
      <section className="liq-panel"><h3><FileText/>Formatos y numeración<small>Configura el formato de los números de liquidación.</small></h3><div className="liq-form-grid"><label>Prefijo<input value={settings.prefix} onChange={e=>setSettings(s=>({...s,prefix:e.target.value}))}/></label>{select("numberFormat","Formato de numeración",["Año + secuencial (0001)","Secuencial (000001)","Año + mes + secuencial"])}<label>Próximo número<input value={settings.nextNumber} onChange={e=>setSettings(s=>({...s,nextNumber:e.target.value}))}/></label></div></section>
      <section className="liq-panel"><h3><Landmark/>Integraciones y eventos<small>Opciones relacionadas con otros módulos.</small></h3>{toggle("updatePurchases","Actualizar estado en compras","Marca como liquidado en el módulo de compras.")}{toggle("syncAccounting","Sincronizar con contabilidad","Envía la información a tu sistema contable.")}</section></div>
    <div className="liq-config-actions"><button className="liq-outline" onClick={()=>setPage("list")}>Cancelar</button><button className="liq-primary" onClick={()=>alert("Configuración guardada (demo).")}><Save size={16}/> Guardar configuración</button></div>
  </>;
}
