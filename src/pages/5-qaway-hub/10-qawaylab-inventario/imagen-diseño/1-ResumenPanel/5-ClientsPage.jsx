import React, { useMemo, useState, useEffect } from "react";
import {
  Search, Building2, Bell, Moon, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, Users, Package, Folder, MapPin, FileText, ShoppingCart,
  UserRound, Tag, Gift, Settings, Crown, Pencil, MoreHorizontal, Plus,
  Filter, CheckCircle2, Star, UserRoundX, Eye, Copy, Clock, Mail, Phone,
  Trash2, Printer, Save, X, ArrowLeft, CalendarDays, ClipboardList,
  BriefcaseBusiness, Warehouse, ReceiptText, ChartNoAxesColumn,
  LayoutDashboard, Boxes, Truck, BadgePercent, NotebookPen, Contact,
  CircleDollarSign, ChevronRight as RightIcon
} from "lucide-react";
import { customerService } from "../../src/services/customerService";
import { docTypeOptions, isValidDocNumber, normalizeDocNumber } from "../../src/utils/fiscal";

const initialClients = [
  { id: 1, initials: "CM", name: "Comercial Martínez SAC", subtitle: "Empresa", type: "Empresa", document: "RUC 20567890123", phone: "(01) 987 654 321", email: "ventas@cmartinez.pe", city: "Lima", total: 12450, purchases: 15, lastPurchase: "22/09/2026", status: "Activo", category: "Cliente retail", commercialName: "Comercial Martínez", address: "Av. Los Olivos 123", district: "San Martín de Porres", province: "Lima", department: "Lima", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "15/08/2025", notes: "Cliente frecuente. Realiza compras mensuales.", contactName: "Carlos Martínez" },
  { id: 2, initials: "JD", name: "Juan Pérez Díaz", subtitle: "Cliente retail", type: "Persona", document: "DNI 44778899", phone: "987 654 321", email: "juanperez@gmail.com", city: "Lima", total: 1280.5, purchases: 6, lastPurchase: "20/09/2026", status: "Activo", category: "Cliente retail", commercialName: "", address: "", district: "", province: "Lima", department: "Lima", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "20/02/2026", notes: "", contactName: "Juan Pérez Díaz" },
  { id: 3, initials: "DI", name: "Distribuidora Inka", subtitle: "Empresa", type: "Empresa", document: "RUC 20654321098", phone: "(01) 923 456 789", email: "contacto@inka.pe", city: "Arequipa", total: 8920, purchases: 12, lastPurchase: "18/09/2026", status: "Activo", category: "Mayorista", commercialName: "Distribuidora Inka", address: "", district: "", province: "Arequipa", department: "Arequipa", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "10/03/2025", notes: "", contactName: "Contacto Inka" },
  { id: 4, initials: "ER", name: "Emprendimientos R&C", subtitle: "Empresa", type: "Empresa", document: "RUC 2056789012", phone: "(01) 934 567 890", email: "ventas@ryc.com", city: "Cusco", total: 4350, purchases: 9, lastPurchase: "15/09/2026", status: "Activo", category: "Cliente retail", commercialName: "Emprendimientos R&C", address: "", district: "", province: "Cusco", department: "Cusco", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "18/05/2025", notes: "", contactName: "Contacto R&C" },
  { id: 5, initials: "MR", name: "María Rodríguez", subtitle: "Cliente retail", type: "Persona", document: "DNI 4332211", phone: "987 111 222", email: "mrodriguez@gmail.com", city: "Lima", total: 950, purchases: 4, lastPurchase: "14/09/2026", status: "Activo", category: "Cliente retail", commercialName: "", address: "", district: "", province: "Lima", department: "Lima", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "01/06/2026", notes: "", contactName: "María Rodríguez" },
  { id: 6, initials: "CC", name: "Café del Valle SAC", subtitle: "Empresa", type: "Empresa", document: "RUC 20551234567", phone: "(01) 912 345 678", email: "info@cafedelvalle.pe", city: "Lima", total: 18600, purchases: 22, lastPurchase: "12/09/2026", status: "Activo", category: "Mayorista", commercialName: "Café del Valle", address: "", district: "", province: "Lima", department: "Lima", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "12/01/2025", notes: "", contactName: "Café del Valle" },
  { id: 7, initials: "LB", name: "Luis Barrientos", subtitle: "Cliente retail", type: "Persona", document: "DNI 42115678", phone: "982 333 444", email: "lbarrientos@gmail.com", city: "Arequipa", total: 760, purchases: 3, lastPurchase: "10/09/2026", status: "Inactivo", category: "Cliente retail", commercialName: "", address: "", district: "", province: "Arequipa", department: "Arequipa", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "05/02/2026", notes: "", contactName: "Luis Barrientos" },
  { id: 8, initials: "DN", name: "Distribuciones Norte", subtitle: "Empresa", type: "Empresa", document: "RUC 2060987654", phone: "(01) 955 666 777", email: "ventas@dnorte.com", city: "Trujillo", total: 6320, purchases: 11, lastPurchase: "08/09/2026", status: "Activo", category: "Mayorista", commercialName: "Distribuciones Norte", address: "", district: "", province: "Trujillo", department: "La Libertad", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general", registered: "21/04/2025", notes: "", contactName: "Distribuciones Norte" },
];

const money = (n) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n).replace("PEN", "S/");
const initialsColors = ["bg-blue-50 text-blue-600", "bg-emerald-50 text-emerald-600", "bg-purple-50 text-purple-600", "bg-rose-50 text-rose-600", "bg-amber-50 text-amber-600"];

// ── Puente con la tabla real `customers` ───────────────────────────────
// El panel pinta más campos de los que la tabla tiene. Los que sí existen
// (name, company, email, phone, type, doc_type, doc_number, fiscal_name,
// address, notes) se leen y se escriben tal cual. El resto —categoría,
// estado, crédito, plazo de pago, descuento, lista de precios, país,
// departamento, provincia, distrito, código postal y contacto— vive en
// `extra_data`, que es una columna jsonb creada exactamente para "datos
// adicionales". Por eso este acople NO necesita migración de base de datos.
const PANEL_TYPE = { company: "Empresa", individual: "Persona", wholesale: "Mayorista", reseller: "Distribuidor" };
const DB_TYPE = { Empresa: "company", Persona: "individual", Mayorista: "wholesale", Distribuidor: "reseller" };
const DEFAULT_EXTRA = { status: "Activo", category: "Cliente retail", country: "Perú", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general" };
const initialsOf = (name) => (name || "").trim().split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase() || "?";
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
};
const toRow = (c, stat = {}) => {
  const x = { ...DEFAULT_EXTRA, ...c.extra_data };
  return {
    id: c.id, name: c.name || "", initials: initialsOf(c.name),
    subtitle: x.category || PANEL_TYPE[c.type] || "Cliente",
    type: PANEL_TYPE[c.type] || "Persona",
    doc_type: c.doc_type || "SIN_DOC", document: c.doc_number || "—",
    phone: c.phone || "—", email: c.email || "", company: c.company || "",
    commercialName: c.fiscal_name || c.company || "",
    city: x.city || "—", address: c.address || "",
    district: x.district || "", province: x.province || "", department: x.department || "",
    country: x.country || "Perú", postalCode: x.postalCode || "",
    category: x.category || "Cliente retail", status: x.status || "Activo",
    credit: x.credit || "0.00", paymentTerm: x.paymentTerm || 0, discount: x.discount || 0,
    priceList: x.priceList || "Precio general",
    total: stat.total || 0, purchases: stat.purchases || 0, lastPurchase: formatDate(stat.lastPurchase),
    notes: c.notes || "", registered: formatDate(c.created_at),
    contactName: x.contactName || c.name || "",
    __extra: x,
  };
};
const toPayload = (r) => {
  const hasDoc = !!r.document && r.document !== "—";
  return {
    name: (r.name || "").trim() || (r.commercialName || "").trim(),
    company: r.company || null, email: r.email || null,
    phone: r.phone && r.phone !== "—" ? r.phone : null,
    type: DB_TYPE[r.type] || "individual",
    doc_type: hasDoc ? (r.doc_type || "SIN_DOC") : "SIN_DOC",
    doc_number: hasDoc ? normalizeDocNumber(r.document) : null,
    fiscal_name: r.commercialName || null, address: r.address || null,
    notes: r.notes || null,
    extra_data: {
      status: r.status, category: r.category, country: r.country, credit: r.credit,
      paymentTerm: r.paymentTerm, discount: r.discount, priceList: r.priceList,
      city: r.city, district: r.district, province: r.province, department: r.department,
      postalCode: r.postalCode, contactName: r.contactName,
    },
  };
};

function IconButton({ children, onClick, title, className = "" }) {
  return <button title={title} onClick={onClick} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-950 transition hover:bg-blue-50 ${className}`}>{children}</button>;
}

function Sidebar() {
  const [open, setOpen] = useState(true);
  const nav = [
    [LayoutDashboard, "Resumen"], [Package, "Productos"], [Folder, "Categorías"], [MapPin, "Movimientos"],
    ["divider"], [Users, "Clientes", true], [FileText, "Cotizaciones"], [ReceiptText, "Ventas", false, true], [CircleDollarSign, "Pedidos web"],
    ["divider"], [ShoppingCart, "Compras", false, true], [UserRound, "Proveedores"],
    ["divider"], [Building2, "Precios", false, true], [Gift, "Paqutes / Kits"], [Tag, "Promociones"], [ReceiptText, "Liquidaciones"], [ClipboardList, "Catálogos"],
    ["divider"], [Building2, "Organización", false, true], [Building2, "  Sedes"], [Warehouse, "  Almacenes"], [Contact, "  Usuarios"],
    ["divider"], [Settings, "Configuración"],
  ];
  return <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
    <div className="flex h-[68px] items-center gap-3 border-b border-slate-100 px-5">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-700 text-lg font-black text-white">I</div>
      <div><div className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-950">Inventi <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">Pro</span></div><div className="text-[11px] text-slate-500">Inventario & ERP Comercial</div></div>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-3 text-[13px] text-slate-800">
      {nav.map((item, i) => item[0] === "divider" ? <div key={i} className="my-3 border-t border-slate-100" /> : <button key={i} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 ${item[2] ? "bg-blue-50 font-medium text-slate-950" : "hover:bg-slate-50"} ${item[1].startsWith("  ") ? "pl-7" : ""}`}>
        {typeof item[0] !== "string" && React.createElement(item[0], { size: 17, className: item[2] ? "text-blue-600" : "text-blue-950" })}
        <span className="flex-1 text-left">{item[1].trim()}</span>{item[3] && <ChevronDown size={14} className="text-slate-500" />}
      </button>)}
    </nav>
    <div className="m-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2 font-medium"><Crown size={17} className="text-blue-700"/> Plan Profesional</div>
      <div className="mt-1 text-xs text-slate-500">Inventi Pro</div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-2/5 rounded-full bg-blue-500"/></div>
      <div className="mt-2 text-[11px] text-slate-500">800 de 2,000 productos</div>
      <button className="mt-3 text-xs font-medium text-blue-700">Ver últimos beneficios →</button>
    </div>
  </aside>;
}

function Topbar() {
  return <header className="flex h-[68px] items-center gap-5 border-b border-slate-200 bg-white px-5 lg:px-6">
    <div className="relative max-w-[635px] flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-950"/><input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-10 pr-16 text-sm outline-none focus:border-blue-400" placeholder="Buscar productos, clientes, ventas, compras..."/><span className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">Ctrl K</span></div>
    <div className="ml-auto flex items-center gap-5"><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><Building2 size={17}/> Sede Lima <ChevronDown size={14}/></button><button className="relative text-blue-950"><Bell size={20}/><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"/></button><Moon size={20} className="text-blue-950"/><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-950 font-semibold text-white">S</div><div className="hidden text-xs sm:block"><div className="font-medium text-slate-900">S Admin</div><div className="mt-1 text-slate-500">Administrador</div></div><ChevronDown size={14}/></div></div>
  </header>;
}

function StatCard({ icon: Icon, title, value, sub, tone = "blue", trend }) {
  const tones = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", red: "bg-rose-50 text-red-600", amber: "bg-orange-50 text-orange-500" };
  return <div className="flex min-h-[112px] items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-100/70">
    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={27}/></div>
    <div className="min-w-0"><div className="text-[13px] text-slate-800">{title}</div><div className="mt-1 flex items-baseline gap-3"><strong className="text-[28px] leading-8 font-semibold tracking-tight text-slate-950">{value}</strong>{trend && <span className="text-sm font-medium text-emerald-600">↑ {trend}</span>}</div><div className="mt-1 text-sm text-slate-500">{sub}</div></div>
  </div>;
}

function ClientForm({ client, onCancel, onSave }) {
  const [form, setForm] = useState(client || { type: "Empresa", doc_type: "SIN_DOC", status: "Activo", country: "Perú", department: "Lima", province: "Lima", category: "Cliente retail", credit: "0.00", paymentTerm: 0, discount: 0, priceList: "Precio general" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupInfo, setLookupInfo] = useState(null);
  const update = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const canLookup = form.doc_type === "DNI" || form.doc_type === "RUC";
  // Consulta SUNAT/RENIEC: autocompleta razón social y domicilio fiscal.
  const handleLookup = async () => {
    if (!canLookup || !(form.document || "").trim()) { setFormError("Ingresa un número de documento para consultar en SUNAT"); return; }
    const docNumber = normalizeDocNumber(form.document);
    if (!isValidDocNumber(form.doc_type, docNumber)) { setFormError("El " + form.doc_type + " ingresado no es válido"); return; }
    try {
      setLookingUp(true); setFormError(null); setLookupInfo(null);
      const result = await customerService.lookupFiscalDoc(form.doc_type, docNumber);
      setForm(p => ({ ...p, document: docNumber, commercialName: result.fiscal_name, address: result.address || p.address, name: (p.name || "").trim() ? p.name : result.fiscal_name }));
      setLookupInfo("Datos obtenidos: " + result.fiscal_name + (result.address ? " · " + result.address : ""));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al consultar SUNAT");
    } finally { setLookingUp(false); }
  };
  const submit = async () => {
    const payload = toPayload(form);
    if (!payload.name) { setFormError("Completa el nombre o razón social del cliente."); return; }
    if (payload.doc_number && payload.doc_type !== "SIN_DOC" && !isValidDocNumber(payload.doc_type, payload.doc_number)) {
      setFormError("El número de " + payload.doc_type + " no es válido"); return;
    }
    setSaving(true); setFormError(null);
    try { await onSave(form); }
    catch (err) { setFormError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setSaving(false); }
  };
  const field = (label, key, placeholder = "", required = false, type = "text") => <label className="block text-[13px] font-medium text-slate-800">{label}{required && <span className="text-red-500"> *</span>}<input type={type} value={form[key] ?? ""} onChange={e => update(key, e.target.value)} placeholder={placeholder} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-500"/></label>;
  const select = (label, key, options) => <label className="block text-[13px] font-medium text-slate-800">{label}<select value={form[key] ?? options[0]} onChange={e => update(key, e.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-500">{options.map(o => <option key={o}>{o}</option>)}</select></label>;
  return <div className="min-h-full bg-slate-50/60 p-5 lg:p-6">
    <div className="mb-5 flex items-center gap-4"><IconButton onClick={onCancel}><ArrowLeft size={21}/></IconButton><div><h1 className="text-2xl font-semibold tracking-tight text-slate-950">{client ? "Editar cliente" : "Nuevo cliente"}</h1><p className="text-sm text-slate-500">Registra un cliente para gestionar sus compras, ventas y mantener su información actualizada.</p></div></div>
    <div className="space-y-3">
      {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
      {lookupInfo && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{lookupInfo}</div>}
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm text-white">1</span><div><h2 className="font-semibold">Información general</h2><p className="text-sm text-slate-500">Datos básicos del cliente.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div><div className="mb-2 text-[13px] font-medium">Tipo de cliente <span className="text-red-500">*</span></div><div className="flex flex-wrap gap-3">{[["Empresa",Building2],["Persona",UserRound],["Mayorista",Crown],["Distribuidor",Tag]].map(([label,Ic])=><button key={label} onClick={() => update("type",label)} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-md border text-sm ${form.type===label?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200"}`}><Ic size={16}/> {label}</button>)}</div></div>
          {field(form.type === "Empresa" ? "Nombre o Razón social" : "Nombre completo", "name", "Ej. Comercial Martínez SAC", true)}
          <div className="md:col-span-2"><div className="text-[13px] font-medium">Documento fiscal <span className="text-red-500">*</span></div><div className="mt-2 grid grid-cols-[130px_1fr_auto] gap-2"><select value={form.doc_type ?? "SIN_DOC"} onChange={e => update("doc_type", e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500">{docTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select><input value={form.document === "—" ? "" : (form.document ?? "")} onChange={e => update("document", e.target.value)} placeholder={form.doc_type === "RUC" ? "Ej. 20123456789" : form.doc_type === "DNI" ? "Ej. 12345678" : "Ej. número de documento"} className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"/><button type="button" onClick={handleLookup} disabled={!canLookup || lookingUp} title={canLookup ? "Consultar en SUNAT" : "Disponible para DNI y RUC"} className="flex h-10 items-center justify-center gap-2 rounded-md bg-slate-800 px-4 text-sm text-white disabled:opacity-40">{lookingUp ? "..." : "SUNAT"}</button></div><p className="mt-1 text-xs text-slate-400">DNI/RUC requeridos para facturar. El botón SUNAT autocompleta razón social y domicilio.</p></div>
          {field("Nombre comercial / razón social legal", "commercialName", "Ej. Comercial Martínez SAC")}
          {field("Correo electrónico", "email", "Ej. ventas@empresa.pe")}
          <div><div className="text-[13px] font-medium">Teléfono <span className="text-red-500">*</span></div><div className="mt-2 flex gap-2"><select className="h-10 w-28 rounded-md border border-slate-200 bg-white px-2 text-sm"><option>🇵🇪 +51</option><option>🇨🇱 +56</option><option>🇨🇴 +57</option></select><input value={form.phone ?? ""} onChange={e=>update("phone",e.target.value)} placeholder="987 654 321" className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"/></div></div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm text-white">2</span><div><h2 className="font-semibold">Ubicación</h2><p className="text-sm text-slate-500">Dirección y ubicación del cliente.</p></div></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{field("Dirección","address","Ej. Av. Los Olivos 123")}{select("País","country",["Perú","Chile","Colombia","Ecuador","Bolivia"])}{select("Departamento","department",["Lima","Arequipa","Cusco","La Libertad","Piura","Junín","Lambayeque"])}{select("Provincia","province",["Lima","Arequipa","Cusco","Trujillo","Callao"])}{field("Distrito","district","Ej. San Martín de Porres")}{field("Código postal","postalCode","Ej. 15102")}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm text-white">3</span><div><h2 className="font-semibold">Información comercial</h2><p className="text-sm text-slate-500">Datos adicionales y configuración.</p></div></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{select("Categoría","category",["Cliente retail","Mayorista","Distribuidor","Corporativo"])}{field("Límite de crédito (S/)","credit","0.00",false,"number")}{field("Plazo de pago (días)","paymentTerm","0",false,"number")}{field("Descuento predeterminado (%)","discount","0",false,"number")}{select("Lista de precios","priceList",["Precio general","Mayorista","Corporativo"])}<div><div className="text-[13px] font-medium">Estado</div><button onClick={()=>update("status",form.status==="Activo"?"Inactivo":"Activo")} className="mt-3 flex items-center gap-3"><span className={`relative h-6 w-11 rounded-full ${form.status==="Activo"?"bg-emerald-600":"bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${form.status==="Activo"?"left-6":"left-1"}`} /></span><span className="text-sm">{form.status}</span></button><p className="mt-1 text-xs text-slate-400">El cliente podrá realizar compras y cotizaciones.</p></div></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="grid gap-5 md:grid-cols-[1fr_2fr]"><div><h2 className="font-semibold">4　Observaciones</h2><p className="text-sm text-slate-500">Añade información adicional si es necesario.</p></div><textarea value={form.notes ?? ""} onChange={e=>update("notes",e.target.value)} maxLength={500} placeholder="Escribe una observación sobre el cliente..." className="min-h-24 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/><div className="text-right text-xs text-slate-400 md:col-start-2">{(form.notes||"").length}/500</div></div></section>
    </div>
    <div className="mt-4 flex justify-end gap-3"><button onClick={onCancel} className="h-10 rounded-lg border border-slate-200 bg-white px-6 text-sm">Cancelar</button><button onClick={submit} disabled={saving} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Save size={16}/> {saving ? "Guardando..." : "Guardar cliente"}</button></div>
  </div>;
}

function ClientDrawer({ client, onClose, onEdit }) {
  const [tab, setTab] = useState("Detalle");
  if (!client) return null;
  const tabs = ["Detalle", "Dirección", "Contactos", "Compras", "Documentos", "Notas"];
  return <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/10" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <aside className="flex h-full w-full max-w-[650px] flex-col border-l border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center gap-4 border-b border-slate-100 p-5"><div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 font-semibold text-blue-600">{client.initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold">{client.name}</h2><span className={`rounded-full px-3 py-1 text-xs ${client.status==="Activo"?"bg-emerald-100 text-emerald-700":"bg-rose-100 text-rose-700"}`}>{client.status}</span></div><p className="mt-1 text-sm text-slate-500">Cliente {client.type.toLowerCase()}　•　Cliente desde {client.registered}</p></div><IconButton title="Más opciones"><MoreHorizontal size={20}/></IconButton><button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900"><X size={21}/></button></div>
      <div className="flex overflow-x-auto border-b border-slate-200 px-3">{tabs.map(t=><button onClick={()=>setTab(t)} key={t} className={`min-w-fit px-4 py-4 text-sm ${tab===t?"border-b-2 border-blue-600 font-medium text-blue-700":"text-slate-500"}`}>{t}</button>)}</div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
        {tab==="Detalle" && <>
          <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><FileText size={19}/></span>Información general</h3><button onClick={onEdit} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><Pencil size={15}/> Editar</button></div><dl className="grid grid-cols-[minmax(140px,1fr)_1.3fr] gap-x-4 gap-y-2 text-sm">{[["Tipo de cliente",client.type],["Nombre o razón social",client.name],["Nombre comercial",client.commercialName||"—"],["Documento",client.document],["Categoría",client.category],["Lista de precios",client.priceList],["Límite de crédito",`S/ ${client.credit}`],["Plazo de pago",`${client.paymentTerm} días`],["Descuento predeterminado",`${client.discount}%`],["Estado",client.status],["Fecha de registro",client.registered],["Observaciones",client.notes||"—"]].map(([k,v])=><React.Fragment key={k}><dt className="text-slate-500">{k}</dt><dd className="break-words text-slate-900">{v}</dd></React.Fragment>)}</dl></section>
          <div className="grid gap-4 md:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="mb-4 flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><MapPin size={19}/></span>Dirección</h3><p className="text-sm leading-6 text-slate-700">{client.address||"Sin dirección registrada"}{client.district && <><br/>{client.district}, {client.province}<br/>Perú</>}</p></section><section className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><UserRound size={19}/></span>Contacto principal</h3><button onClick={onEdit} className="rounded-lg border border-slate-200 p-2"><Pencil size={15}/></button></div><div className="space-y-3 text-sm"><div className="flex items-center gap-3"><Phone size={16}/>{client.phone}</div><div className="flex items-center gap-3 break-all"><Mail size={16}/>{client.email||"—"}</div><div className="flex items-center gap-3"><UserRound size={16}/>{client.contactName||client.name}<span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">Principal</span></div></div></section></div>
          <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><ShoppingCart size={19}/></span>Resumen comercial</h3><button onClick={()=>setTab("Compras")} className="text-sm text-blue-700">Ver historial →</button></div><div className="grid grid-cols-2 gap-2 xl:grid-cols-4"><MiniStat icon={ShoppingCart} label="Total de compras" value={money(client.total)} sub={`${client.purchases} compras`} tone="blue"/><MiniStat icon={CalendarDays} label="Última compra" value={client.lastPurchase} sub="Fecha registrada" tone="green"/><MiniStat icon={Tag} label="Ticket promedio" value={money(client.total/(client.purchases||1))} sub="Por compra" tone="amber"/><MiniStat icon={Clock} label="Pendiente de pago" value="S/ 0.00" sub="Sin deuda pendiente" tone="red"/></div></section>
        </>}
        {tab==="Dirección" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="mb-4 font-semibold">Dirección del cliente</h3><p className="text-sm leading-6">{client.address||"Sin dirección registrada"}<br/>{client.district} {client.province} {client.department}</p></section>}
        {tab==="Contactos" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="mb-4 font-semibold">Contactos registrados</h3><div className="text-sm">{client.contactName||client.name}<p className="mt-2 text-slate-500">{client.phone} · {client.email}</p></div></section>}
        {tab==="Compras" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="mb-4 font-semibold">Historial de compras</h3><p className="text-sm text-slate-500">Compras registradas: {client.purchases}</p><div className="mt-3 text-lg font-semibold">{money(client.total)}</div><p className="text-sm text-slate-500">Última compra: {client.lastPurchase}</p></section>}
        {tab==="Documentos" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="mb-3 font-semibold">Documentos</h3><p className="text-sm text-slate-500">No hay documentos adjuntos.</p></section>}
        {tab==="Notas" && <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="mb-3 font-semibold">Notas</h3><p className="text-sm text-slate-600">{client.notes||"No hay notas registradas."}</p></section>}
      </div>
      <footer className="flex justify-end gap-3 border-t border-slate-200 bg-white p-4"><button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm"><Printer size={16}/> Imprimir ficha</button><button onClick={onEdit} className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white"><Pencil size={16}/> Editar cliente</button></footer>
    </aside>
  </div>;
}

function MiniStat({ icon: Icon, label, value, sub, tone }) {
  const cls={blue:"bg-blue-50/60 text-blue-600",green:"bg-emerald-50 text-emerald-600",amber:"bg-amber-50 text-amber-600",red:"bg-rose-50 text-rose-600"};
  return <div className={`rounded-lg border border-slate-100 p-3 ${cls[tone]}`}><div className="mb-2 flex items-center gap-2"><Icon size={18}/><span className="text-[11px] text-slate-500">{label}</span></div><div className="text-sm font-semibold text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">{sub}</div></div>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [checked, setChecked] = useState([]);
  const [notice, setNotice] = useState("");

  const load = async (p = page, size = Number(pageSize)) => {
    setLoading(true); setLoadError(null);
    try {
      const res = await customerService.getCustomers({ page: p, per_page: size });
      const stats = await customerService.getStatsForCustomers(res.data.map(c => c.id));
      setClients(res.data.map(c => toRow(c, stats[c.id])));
      setTotal(res.total);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(page, Number(pageSize)); }, [page, pageSize]);

  // La paginación es la del servidor; la búsqueda y los filtros se aplican
  // sobre la página cargada. `hiddenByFilter` lo dice en pantalla para que
  // nunca quede oculto que hay filas ocultas.
  const filtered = useMemo(() => clients.filter(c => {
    const q=search.toLowerCase();
    return (!q || [c.name,c.document,c.phone,c.email,c.city,c.company,c.commercialName].some(v=>(v||"").toLowerCase().includes(q))) &&
      (typeFilter==="Todos"||c.type===typeFilter) && (statusFilter==="Todos"||c.status===statusFilter) &&
      (categoryFilter==="Todos"||c.category===categoryFilter);
  }),[clients,search,typeFilter,statusFilter,categoryFilter]);
  const pageCount=Math.max(1,Math.ceil(total/Number(pageSize)));
  const startPage=Math.min(Math.max(1,page-2),Math.max(1,pageCount-4));
  const rows=filtered;
  const hiddenByFilter=clients.length-rows.length;
  const activeCount=clients.filter(c=>c.status==="Activo").length;
  const frequentCount=clients.filter(c=>c.purchases>=10).length;
  const newClientCount=clients.filter(c=>(c.registered||"").endsWith(String(new Date().getFullYear()))).length;
  const saveClient = async (data) => {
    const payload = toPayload(data);
    if(!payload.name){setNotice("Completa el nombre o razón social del cliente.");return;}
    if(payload.doc_number && payload.doc_type!=="SIN_DOC" && !isValidDocNumber(payload.doc_type,payload.doc_number)){
      setNotice("El número de "+payload.doc_type+" no es válido");return;
    }
    try {
      if(data.id) await customerService.updateCustomer(data.id,payload);
      else await customerService.createCustomer(payload);
      setEditing(null);setSelected(null);
      setNotice(data.id?"Cliente actualizado correctamente.":"Cliente creado correctamente.");
      setTimeout(()=>setNotice(""),3000);
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No se pudo guardar el cliente.");
    }
  };
  const changeStatus = async (client) => {
    const next = client.status==="Activo" ? "Inactivo" : "Activo";
    try {
      await customerService.updateCustomer(client.id,{ extra_data:{ ...client.__extra, status:next } });
      setClients(old=>old.map(c=>c.id===client.id?{...c,status:next}:c));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No se pudo cambiar el estado.");
    }
  };
  const duplicate = async (client) => {
    const payload = toPayload(client);
    try {
      // El duplicado no puede heredar el RUC/DNI: es único.
      await customerService.createCustomer({ ...payload, name:client.name+" (copia)", doc_type:"SIN_DOC", doc_number:null });
      setMenuId(null);setNotice("Cliente duplicado.");setTimeout(()=>setNotice(""),2500);
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No se pudo duplicar el cliente.");
    }
  };
  const removeClient = async (client) => {
    try {
      await customerService.deleteCustomer(client.id);
      setMenuId(null);setNotice("Cliente eliminado.");setTimeout(()=>setNotice(""),2500);
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No se pudo eliminar el cliente.");
    }
  };

  return <div className="flex min-h-screen bg-slate-50 text-slate-900">
    <Sidebar/>
    <main className="min-w-0 flex-1">
      <Topbar/>
      {editing ? <ClientForm client={editing.id?editing:null} onCancel={()=>setEditing(null)} onSave={saveClient}/> : <div className="p-4 lg:p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><Users size={27}/></div><div><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Clientes</h1><p className="mt-1 text-sm text-slate-500">Gestiona tu base de clientes, consulta su historial de compras y mantén su información actualizada.</p></div></div><button onClick={()=>setEditing({type:"Empresa",doc_type:"SIN_DOC",status:"Activo",country:"Perú",department:"Lima",province:"Lima",category:"Cliente retail",credit:"0.00",paymentTerm:0,discount:0,priceList:"Precio general"})} className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"><Plus size={18}/> Nuevo cliente <span className="ml-2 border-l border-blue-400 pl-3"><ChevronDown size={15}/></span></button></div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} title="Total de clientes" value={total} sub={`${newClientCount} registrado(s) en ${new Date().getFullYear()}`}/><StatCard icon={UserRound} title="Clientes activos" value={activeCount} sub={`${total ? Math.round(activeCount/total*100) : 0}% del total`} tone="green"/><StatCard icon={UserRoundX} title="Clientes inactivos" value={Math.max(total-activeCount,0)} sub={`${total ? Math.round((total-activeCount)/total*100) : 0}% del total`} tone="red"/><StatCard icon={Star} title="Clientes frecuentes" value={frequentCount} sub="Con 10 o más cotizaciones" tone="amber"/></div>
        {loadError && <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>{loadError}</span><button onClick={()=>load(page,Number(pageSize))} className="ml-auto rounded-lg border border-red-300 px-3 py-1.5">Reintentar</button></div>}
        {loading && <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">Cargando clientes desde la base de datos…</div>}
        {!loading && !loadError && total===0 && <div className="mb-4 rounded-xl border border-slate-200 bg-white p-8 text-center"><div className="text-base font-semibold text-slate-900">No hay clientes</div><p className="mt-1 text-sm text-slate-500">Agrega tu primer cliente para comenzar a crear cotizaciones.</p></div>}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="relative min-w-[220px] flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-950"/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Buscar por nombre, RUC, DNI, teléfono o email..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm outline-none focus:border-blue-400"/></div>
          <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1);}} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>Todos</option><option>Empresa</option><option>Persona</option></select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>Todos</option><option>Activo</option><option>Inactivo</option></select>
          <select value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setPage(1);}} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>Todos</option><option>Cliente retail</option><option>Mayorista</option><option>Distribuidor</option><option>Corporativo</option></select>
          <button className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm"><Filter size={16}/> Más filtros</button>
        </div>
        <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-100/70">
          <div className="overflow-x-auto"><table className="w-full min-w-[1120px] border-collapse text-left text-[13px]">
            <thead><tr className="h-11 border-b border-slate-200 text-slate-800"><th className="w-12 px-4"><input type="checkbox" checked={rows.length>0&&rows.every(r=>checked.includes(r.id))} onChange={e=>setChecked(e.target.checked?[...new Set([...checked,...rows.map(r=>r.id)])]:checked.filter(id=>!rows.some(r=>r.id===id)))} className="h-4 w-4 accent-blue-600"/></th>{["Cliente","Tipo","Documento","Contacto","Ciudad","Total compras","Última compra","Estado","Acciones"].map(h=><th key={h} className="px-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{rows.map((c,i)=><tr key={c.id} className={`h-[60px] border-b border-slate-100 hover:bg-blue-50/60 ${checked.includes(c.id)?"bg-blue-50":""}`}>
              <td className="px-4"><input type="checkbox" checked={checked.includes(c.id)} onChange={e=>setChecked(old=>e.target.checked?[...old,c.id]:old.filter(id=>id!==c.id))} className="h-4 w-4 accent-blue-600"/></td>
              <td className="px-3"><button onClick={()=>setSelected(c)} className="flex min-w-[205px] items-center gap-3 text-left"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-medium ${initialsColors[i%initialsColors.length]}`}>{c.initials}</span><span><span className="block font-medium text-slate-950">{c.name}</span><span className="mt-1 block text-xs text-slate-500">{c.subtitle}</span></span></button></td>
              <td className="px-3"><span className={`rounded-md px-3 py-1 text-xs ${c.type==="Empresa"?"bg-blue-100 text-blue-700":"bg-emerald-100 text-emerald-700"}`}>{c.type}</span></td>
              <td className="px-3 text-slate-500">{c.document}</td>
              <td className="px-3"><div className="whitespace-nowrap text-slate-600">{c.phone}</div><div className="mt-1 max-w-[180px] truncate text-slate-500">{c.email}</div></td>
              <td className="px-3 text-slate-500">{c.city}</td>
              <td className="px-3"><div className="font-medium text-slate-900">{money(c.total)}</div><div className="mt-1 text-xs text-slate-500">{c.purchases} compras</div></td>
              <td className="whitespace-nowrap px-3 text-slate-500">{c.lastPurchase}</td>
              <td className="px-3"><span className={`rounded-full px-3 py-1 text-xs ${c.status==="Activo"?"bg-emerald-100 text-emerald-700":"bg-rose-100 text-rose-700"}`}>{c.status}</span></td>
              <td className="px-3"><div className="flex items-center gap-2"><IconButton title="Editar" onClick={()=>setEditing(c)}><Pencil size={16}/></IconButton><div className="relative"><IconButton title="Más acciones" onClick={()=>setMenuId(menuId===c.id?null:c.id)} className={menuId===c.id?"border-blue-500":""}><MoreHorizontal size={19}/></IconButton>{menuId===c.id&&<div className="absolute right-0 top-11 z-20 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">{[[Eye,"Ver detalles",()=>{setSelected(c);setMenuId(null);}],[Pencil,"Editar",()=>{setEditing(c);setMenuId(null);}],[Copy,"Duplicar",()=>duplicate(c)],[CheckCircle2,c.status==="Activo"?"Cambiar a inactivo":"Cambiar a activo",()=>{changeStatus(c);setMenuId(null);}],[Clock,"Ver historial",()=>{setSelected(c);setMenuId(null);}],[Mail,"Enviar correo",()=>{setNotice(`Acción de correo para ${c.name}`);setMenuId(null);}],[Trash2,"Eliminar",()=>{if(window.confirm(`¿Eliminar a ${c.name}?`)){removeClient(c);setMenuId(null);}}]].map(([I,label,fn])=><button key={label} onClick={fn} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${label==="Eliminar"?"text-red-600":""}`}><I size={16}/>{label}</button>)}</div>}</div></div></td>
            </tr>)}</tbody>
          </table></div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm"><span className="text-slate-500">Mostrando {total?(page-1)*Number(pageSize)+1:0} a {Math.min(page*Number(pageSize),total)} de {total} clientes{hiddenByFilter>0&&<span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{hiddenByFilter} oculto(s) por el filtro en esta página</span>}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2 whitespace-nowrap">Filas por página <select value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} className="h-9 rounded-md border border-slate-200 bg-white px-3"><option>10</option><option>20</option><option>50</option></select></label><div className="flex items-center gap-1"><IconButton title="Anterior" onClick={()=>setPage(p=>Math.max(1,p-1))} className="h-9 w-9"><ChevronLeft size={17}/></IconButton>{Array.from({length:Math.min(pageCount,5)},(_,i)=>startPage+i).map(p=><button key={p} onClick={()=>setPage(p)} className={`h-9 w-9 rounded-lg border text-sm ${page===p?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white"}`}>{p}</button>)}<IconButton title="Siguiente" onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="h-9 w-9"><ChevronRight size={17}/></IconButton></div></div></div>
        </div>
      </div>}
    </main>
    {selected && !editing && <ClientDrawer client={selected} onClose={()=>setSelected(null)} onEdit={()=>{setEditing(selected);setSelected(null);}}/>}
    {notice && <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{notice}</div>}
  </div>;
}
