import React, { useMemo, useState, useEffect } from "react";
import {
  Building2, Warehouse, MapPin, Package, Store, Search, Plus, Filter,
  Pencil, MoreHorizontal, Eye, ChevronDown, ChevronLeft, ChevronRight,
  Settings, Clock3, Hash, ShieldCheck, Link2, Phone, Mail, UserRound,
  CalendarDays, Box, ChartNoAxesColumn, Image as ImageIcon, Camera,
  Save, X, Check, Upload, SlidersHorizontal, LayoutGrid
} from "lucide-react";

/**
 * Módulo Sedes — Inventi Pro
 * Requiere: React y lucide-react.
 * Diseñado para integrarse dentro del layout general de la aplicación.
 */
const INITIAL_SEDES = [
  {
    id: 1, nombre: "Sede Lima", subtitulo: "Oficina principal", codigo: "SED-001",
    ciudad: "Lima", direccion: "Av. José Pardo 123, Miraflores, Lima",
    tipo: "Principal", estado: "Activa", almacenes: 2, telefono: "+51 123 5678",
    email: "lima@empresa.com", responsable: "Carlos Sandoval",
    fechaCreacion: "15/01/2026", actualizacion: "25/09/2026 10:30",
    descripcion: "Oficina principal de la empresa. Punto de atención al público y centro de operaciones.",
    imagen: ""
  },
  {
    id: 2, nombre: "Sede Cusco", subtitulo: "Tienda Cusco", codigo: "SED-002",
    ciudad: "Cusco", direccion: "Av. El Sol 456, Cusco, Cusco",
    tipo: "Tienda", estado: "Activa", almacenes: 2, telefono: "+51 984 111 222",
    email: "cusco@empresa.com", responsable: "María Quispe",
    fechaCreacion: "20/02/2026", actualizacion: "24/09/2026 15:20",
    descripcion: "Tienda y punto de atención comercial en Cusco.", imagen: ""
  },
  {
    id: 3, nombre: "Sede Arequipa", subtitulo: "Almacén Arequipa", codigo: "SED-003",
    ciudad: "Arequipa", direccion: "Av. Aviación 789, Cerro Colorado",
    tipo: "Almacén", estado: "Activa", almacenes: 1, telefono: "+51 954 333 444",
    email: "arequipa@empresa.com", responsable: "Luis Castillo",
    fechaCreacion: "10/03/2026", actualizacion: "23/09/2026 09:15",
    descripcion: "Centro de almacenamiento y distribución para la zona sur.", imagen: ""
  },
  {
    id: 4, nombre: "Sede Trujillo", subtitulo: "Punto de venta", codigo: "SED-004",
    ciudad: "Trujillo", direccion: "Av. Fátima 321, Trujillo, La Libertad",
    tipo: "Tienda", estado: "Inactiva", almacenes: 0, telefono: "+51 944 555 666",
    email: "trujillo@empresa.com", responsable: "Ana Torres",
    fechaCreacion: "12/04/2026", actualizacion: "18/09/2026 12:00",
    descripcion: "Punto de venta en Trujillo.", imagen: ""
  }
];

const INITIAL_ALMACENES = [
  { id: 1, nombre: "Almacén Principal", descripcion: "Inventario general", codigo: "ALM-001", sede: "Sede Lima", tipo: "Principal", ubicaciones: 25, productos: 1250, estado: "Activo", direccion: "Av. José Pardo 123, Miraflores, Lima", responsable: "Carlos Sandoval", telefono: "+51 123 5678", capacidad: "2,000 productos", fechaCreacion: "15/01/2026", actualizacion: "25/09/2026 10:30", valor: "S/ 48,920" },
  { id: 2, nombre: "Almacén Tienda", descripcion: "Venta directa", codigo: "ALM-002", sede: "Sede Lima", tipo: "Tienda", ubicaciones: 10, productos: 320, estado: "Activo", direccion: "Av. José Pardo 123, Miraflores, Lima", responsable: "Carlos Sandoval", telefono: "+51 123 5678", capacidad: "500 productos", fechaCreacion: "20/01/2026", actualizacion: "25/09/2026 10:30", valor: "S/ 12,400" },
  { id: 3, nombre: "Almacén Secundario", descripcion: "Stock de respaldo", codigo: "ALM-003", sede: "Sede Cusco", tipo: "Secundario", ubicaciones: 18, productos: 680, estado: "Activo", direccion: "Av. El Sol 456, Cusco, Cusco", responsable: "María Quispe", telefono: "+51 984 111 222", capacidad: "1,000 productos", fechaCreacion: "20/02/2026", actualizacion: "24/09/2026 15:20", valor: "S/ 22,700" },
  { id: 4, nombre: "Almacén Producción", descripcion: "Insumos y materiales", codigo: "ALM-004", sede: "Sede Arequipa", tipo: "Producción", ubicaciones: 12, productos: 180, estado: "Activo", direccion: "Av. Aviación 789, Cerro Colorado", responsable: "Luis Castillo", telefono: "+51 954 333 444", capacidad: "700 productos", fechaCreacion: "10/03/2026", actualizacion: "23/09/2026 09:15", valor: "S/ 8,920" },
  { id: 5, nombre: "Almacén Tránsito", descripcion: "En proceso de traslado", codigo: "ALM-005", sede: "Sede Trujillo", tipo: "Tránsito", ubicaciones: 8, productos: 50, estado: "Inactivo", direccion: "Av. Fátima 321, Trujillo, La Libertad", responsable: "Ana Torres", telefono: "+51 944 555 666", capacidad: "300 productos", fechaCreacion: "12/04/2026", actualizacion: "18/09/2026 12:00", valor: "S/ 1,850" }
];

const cn = (...classes) => classes.filter(Boolean).join(" ");
const Button = ({ children, variant = "outline", className = "", ...props }) => (
  <button className={cn("inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:brightness-[.98] disabled:opacity-40", variant === "primary" ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "border-blue-100 bg-white text-blue-700 hover:bg-blue-50", className)} {...props}>{children}</button>
);
const IconBox = ({ children, color = "blue", className = "" }) => {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", amber: "bg-amber-50 text-amber-600", purple: "bg-purple-50 text-purple-600" };
  return <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl", colors[color], className)}>{children}</div>;
};
const Status = ({ value }) => {
  const active = ["Activa", "Activo"].includes(value);
  return <span className={cn("inline-flex min-w-[70px] justify-center rounded px-3 py-1 text-xs font-medium", active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>{value}</span>;
};
const TypeTag = ({ value }) => {
  const color = value === "Principal" ? "bg-blue-50 text-blue-700" : value === "Tienda" ? "bg-purple-50 text-purple-700" : value === "Almacén" || value === "Producción" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={cn("inline-flex justify-center rounded px-3 py-1 text-xs", color)}>{value}</span>;
};
const Field = ({ label, help, children }) => <label className="block min-w-0 text-sm"><span className="mb-1.5 block font-medium text-slate-800">{label}</span>{children}{help && <span className="mt-1 block text-xs text-slate-500">{help}</span>}</label>;
const Input = (props) => <input {...props} className={cn("w-full rounded-md border border-blue-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100", props.className)} />;
const Select = ({ children, ...props }) => <select {...props} className={cn("w-full rounded-md border border-blue-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500", props.className)}>{children}</select>;
const Panel = ({ title, subtitle, icon: Icon, children, className = "", action }) => (
  <section className={cn("rounded-lg border border-blue-100 bg-white p-4", className)}>
    {(title || action) && <div className="mb-4 flex items-start justify-between gap-3"><div className="flex items-start gap-3">{Icon && <Icon className="mt-0.5 h-5 w-5 text-blue-600" />}<div>{title && <h3 className="font-semibold text-slate-900">{title}</h3>}{subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}</div></div>{action}</div>}
    {children}
  </section>
);
const Stat = ({ icon: Icon, value, label, detail, color = "blue" }) => (
  <div className="flex min-h-[96px] items-center gap-4 rounded-lg border border-blue-100 bg-white p-4">
    <IconBox color={color}><Icon className="h-7 w-7" /></IconBox>
    <div><div className="text-2xl font-semibold leading-tight text-slate-900">{value}</div><div className="text-sm text-slate-700">{label}</div>{detail && <div className="text-xs text-slate-500">{detail}</div>}</div>
  </div>
);
const ActionButtons = ({ onView, onEdit, onMore }) => <div className="flex items-center justify-end gap-2"><Button className="h-9 w-10 px-0" title="Ver detalle" onClick={onView}><Eye size={17}/></Button><Button className="h-9 w-10 px-0" title="Editar" onClick={onEdit}><Pencil size={16}/></Button><Button className="h-9 w-10 px-0" title="Más acciones" onClick={onMore}><MoreHorizontal size={18}/></Button></div>;

export default function SedesModule() {
  const [section, setSection] = useState("sedes");
  const [sedes, setSedes] = useState(INITIAL_SEDES);
  const [almacenes, setAlmacenes] = useState(INITIAL_ALMACENES);
  const [selectedSede, setSelectedSede] = useState(INITIAL_SEDES[0]);
  const [selectedAlmacen, setSelectedAlmacen] = useState(INITIAL_ALMACENES[0]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (!modal) return;
    function handleEscape(event) {
      if (event.key === "Escape") setModal(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [modal]);
  const [notice, setNotice] = useState("");
  const [configTab, setConfigTab] = useState("General");
  const [settings, setSettings] = useState({ timezone: "(GMT-05:00) Lima", currency: "PEN - Sol Peruano (S/)", dateFormat: "DD/MM/AAAA", timeFormat: "24 horas (14:30)", allowSales: true, allowPurchases: true, allowTransfers: true, visibleAll: false, stockByWarehouse: true });

  const filteredSedes = useMemo(() => sedes.filter(s => {
    const text = `${s.nombre} ${s.codigo} ${s.ciudad} ${s.direccion}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "Todos" || s.estado === statusFilter) && (typeFilter === "Todos" || s.tipo === typeFilter);
  }), [sedes, query, statusFilter, typeFilter]);
  const filteredAlmacenes = useMemo(() => almacenes.filter(a => {
    const text = `${a.nombre} ${a.codigo} ${a.sede} ${a.tipo}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "Todos" || a.estado === statusFilter) && (typeFilter === "Todos" || a.tipo === typeFilter);
  }), [almacenes, query, statusFilter, typeFilter]);

  const openNew = (kind) => { setEditItem(null); setModal(kind); };
  const openEdit = (kind, item) => { setEditItem(item); setModal(kind); };
  const saveItem = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    if (modal === "sede") {
      const item = { ...data, id: editItem?.id ?? Date.now(), almacenes: Number(data.almacenes || 0), subtitulo: data.subtitulo || data.tipo, fechaCreacion: editItem?.fechaCreacion || "29/09/2026", actualizacion: "29/09/2026 08:00", imagen: editItem?.imagen || "" };
      setSedes(prev => editItem ? prev.map(x => x.id === editItem.id ? item : x) : [...prev, item]);
      setSelectedSede(item);
    } else {
      const item = { ...data, id: editItem?.id ?? Date.now(), ubicaciones: Number(data.ubicaciones || 0), productos: Number(data.productos || 0), fechaCreacion: editItem?.fechaCreacion || "29/09/2026", actualizacion: "29/09/2026 08:00", valor: editItem?.valor || "S/ 0" };
      setAlmacenes(prev => editItem ? prev.map(x => x.id === editItem.id ? item : x) : [...prev, item]);
      setSelectedAlmacen(item);
    }
    setModal(null);
    setNotice("Los cambios se guardaron correctamente.");
    setTimeout(() => setNotice(""), 3000);
  };
  const toggleSetting = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-[#101b55]">
      <div className="mx-auto max-w-[1600px] space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue-100 bg-white px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500"><span className="text-blue-600">Sedes</span><span>›</span><span className="text-blue-700">{section === "sedes" ? "Lista de sedes" : section === "almacenes" ? "Almacenes" : "Configuración"}</span></div>
          <div className="flex gap-2">
            <Button onClick={() => { setQuery(""); setStatusFilter("Todos"); setTypeFilter("Todos"); }}><SlidersHorizontal size={16}/> Limpiar filtros</Button>
            {section !== "config" && <Button variant="primary" onClick={() => openNew(section === "sedes" ? "sede" : "almacen")}><Plus size={17}/> {section === "sedes" ? "Nueva sede" : "Nuevo almacén"}</Button>}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 rounded-lg border border-blue-100 bg-white p-2">
          {[["sedes", Building2, "Lista de sedes"], ["almacenes", Warehouse, "Almacenes"], ["config", Settings, "Configuración"]].map(([key, Icon, label]) =>
            <button key={key} onClick={() => { setSection(key); setQuery(""); }} className={cn("inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm", section === key ? "border-b-2 border-blue-600 bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50")}><Icon size={18}/>{label}</button>
          )}
        </nav>

        {section === "sedes" && <>
          <header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><IconBox><Building2 size={30}/></IconBox><div><h1 className="text-2xl font-bold text-slate-900">Sedes</h1><p className="text-sm text-slate-500">Administra tus sedes, almacenes y puntos de operación.</p></div></div></header>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Building2} value={sedes.filter(s=>s.estado==="Activa").length} label="Sedes activas" detail={`de ${sedes.length} sedes registradas`}/>
            <Stat icon={Box} value={almacenes.length} label="Almacenes" detail="en todas las sedes" color="blue"/>
            <Stat icon={MapPin} value={new Set(sedes.map(s=>s.ciudad)).size} label="Ciudades" detail={Array.from(new Set(sedes.map(s=>s.ciudad))).join(", ")}/>
            <Stat icon={Store} value={sedes.filter(s=>s.tipo==="Tienda").length} label="Puntos de venta" detail="con atención al público" color="purple"/>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-3">
              <div className="grid gap-3 rounded-lg border border-blue-100 bg-white p-3 md:grid-cols-[minmax(220px,1fr)_220px_220px_auto]">
                <div className="flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50/60 px-3"><Search size={18} className="text-blue-600"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar sede por nombre o ciudad..." className="w-full bg-transparent py-2.5 text-sm outline-none"/></div>
                <Field label="Estado"><Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Activa</option><option>Inactiva</option></Select></Field>
                <Field label="Tipo de sede"><Select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option>Todos</option><option>Principal</option><option>Tienda</option><option>Almacén</option></Select></Field>
                <Button className="self-end"><Filter size={16}/> Más filtros</Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-b border-blue-100 bg-slate-50/60 text-xs text-slate-700"><tr>{["","Sede","Código","Ciudad","Dirección","Tipo","Estado","Almacenes","Acciones"].map((h,i)=><th key={i} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{filteredSedes.map(s=><tr key={s.id} onClick={()=>setSelectedSede(s)} className={cn("cursor-pointer border-b border-blue-50 hover:bg-blue-50/40",selectedSede?.id===s.id&&"bg-blue-50/30")}>
                    <td className="px-3 py-3"><input type="checkbox" onClick={e=>e.stopPropagation()} className="accent-blue-600"/></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-200 text-blue-600"><Building2 size={25}/></div><div><div className="font-semibold text-slate-900">{s.nombre}</div><div className="text-xs text-slate-500">{s.subtitulo}</div></div></div></td>
                    <td className="px-3 py-3 text-slate-600">{s.codigo}</td><td className="px-3 py-3 text-slate-600">{s.ciudad}</td><td className="max-w-[180px] px-3 py-3 text-xs text-slate-600">{s.direccion}</td><td className="px-3 py-3"><TypeTag value={s.tipo}/></td><td className="px-3 py-3"><Status value={s.estado}/></td><td className="px-3 py-3 text-center">{s.almacenes}</td><td className="px-3 py-3"><ActionButtons onView={()=>setSelectedSede(s)} onEdit={()=>openEdit("sede",s)} onMore={()=>setNotice(`Más acciones para ${s.nombre}`)}/></td>
                  </tr>)}</tbody>
                </table>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-500"><span>Mostrando {filteredSedes.length} de {sedes.length} sedes</span><div className="flex items-center gap-2">Filas por página <Select className="w-20 py-1.5"><option>10</option><option>25</option><option>50</option></Select><Button className="h-8 w-8 px-0"><ChevronLeft size={16}/></Button><Button variant="primary" className="h-8 w-8 px-0">1</Button><Button className="h-8 w-8 px-0"><ChevronRight size={16}/></Button></div></div>
              </div>
            </div>
            <Panel title="Detalle de sede" icon={ShieldCheck} action={<Button onClick={()=>openEdit("sede",selectedSede)}><Pencil size={14}/> Editar</Button>} className="self-start">
              <div className="mb-4 flex h-32 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-300 text-blue-500"><Building2 size={54}/></div>
              <div className="mb-1 flex items-center gap-2"><h2 className="text-lg font-bold text-slate-900">{selectedSede?.nombre}</h2><Status value={selectedSede?.estado}/></div><p className="mb-4 text-sm text-slate-500">{selectedSede?.subtitulo}</p>
              <div className="space-y-3 text-xs">{[[Hash,"Código",selectedSede?.codigo],[Box,"Tipo de sede",selectedSede?.tipo],[MapPin,"Dirección",selectedSede?.direccion],[Phone,"Teléfono",selectedSede?.telefono],[Mail,"Email",selectedSede?.email],[UserRound,"Responsable",selectedSede?.responsable],[Warehouse,"Almacenes",`${selectedSede?.almacenes} almacenes asociados`],[CalendarDays,"Fecha de creación",selectedSede?.fechaCreacion],[Clock3,"Última actualización",selectedSede?.actualizacion]].map(([Icon,label,val])=><div key={label} className="grid grid-cols-[18px_105px_1fr] items-start gap-2"><Icon size={15} className="text-blue-600"/><span className="text-slate-500">{label}</span><span className="break-words text-slate-800">{val || "—"}</span></div>)}</div>
            </Panel>
          </div>
        </>}

        {section === "almacenes" && <>
          <header className="flex items-center gap-4"><IconBox><Warehouse size={30}/></IconBox><div><h1 className="text-2xl font-bold text-slate-900">Almacenes</h1><p className="text-sm text-slate-500">Administra los almacenes de tus sedes y controla la ubicación del stock.</p></div></header>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Warehouse} value={almacenes.length} label="Almacenes totales" detail="en todas las sedes"/><Stat icon={Package} value={almacenes.filter(a=>a.estado==="Activo").length} label="Almacenes activos" detail={`${Math.round(almacenes.filter(a=>a.estado==="Activo").length/Math.max(almacenes.length,1)*100)}% del total`} color="green"/><Stat icon={Box} value={almacenes.filter(a=>a.estado==="Inactivo").length} label="Almacén inactivo" detail="del total" color="amber"/><Stat icon={LayoutGrid} value={almacenes.reduce((sum,a)=>sum+a.productos,0).toLocaleString("es-PE")} label="Productos en stock" detail="en todos los almacenes" color="purple"/></div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-3">
              <div className="grid gap-3 rounded-lg border border-blue-100 bg-white p-3 md:grid-cols-[minmax(200px,1fr)_180px_180px_auto]">
                <div className="flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50/60 px-3"><Search size={18} className="text-blue-600"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar almacén por nombre o código..." className="w-full bg-transparent py-2.5 text-sm outline-none"/></div>
                <Field label="Sede"><Select onChange={e=>setQuery(e.target.value==="Todas"?"":e.target.value)}><option>Todas</option>{sedes.map(s=><option key={s.id} value={s.nombre}>{s.nombre}</option>)}</Select></Field>
                <Field label="Estado"><Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Activo</option><option>Inactivo</option></Select></Field>
                <Button className="self-end"><Filter size={16}/> Más filtros</Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white">
                <table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-blue-100 bg-slate-50/60 text-xs text-slate-700"><tr>{["","Almacén","Código","Sede","Tipo","Ubicaciones","Productos","Estado","Acciones"].map((h,i)=><th key={i} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{filteredAlmacenes.map(a=><tr key={a.id} onClick={()=>setSelectedAlmacen(a)} className={cn("cursor-pointer border-b border-blue-50 hover:bg-blue-50/40",selectedAlmacen?.id===a.id&&"bg-blue-50/30")}><td className="px-3 py-3"><input type="checkbox" onClick={e=>e.stopPropagation()} className="accent-blue-600"/></td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-300 text-blue-600"><Warehouse size={24}/></div><div><div className="font-medium text-slate-900">{a.nombre}</div><div className="text-xs text-slate-500">{a.descripcion}</div></div></div></td><td className="px-3 py-3 text-slate-500">{a.codigo}</td><td className="px-3 py-3 text-slate-500">{a.sede}</td><td className="px-3 py-3"><TypeTag value={a.tipo}/></td><td className="px-3 py-3 text-center">{a.ubicaciones}</td><td className="px-3 py-3 text-center">{a.productos.toLocaleString("es-PE")}</td><td className="px-3 py-3"><Status value={a.estado}/></td><td className="px-3 py-3"><ActionButtons onView={()=>setSelectedAlmacen(a)} onEdit={()=>openEdit("almacen",a)} onMore={()=>setNotice(`Más acciones para ${a.nombre}`)}/></td></tr>)}</tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-500"><span>Mostrando {filteredAlmacenes.length} de {almacenes.length} almacenes</span><div className="flex items-center gap-2">Filas por página <Select className="w-20 py-1.5"><option>10</option><option>25</option><option>50</option></Select><Button className="h-8 w-8 px-0"><ChevronLeft size={16}/></Button><Button variant="primary" className="h-8 w-8 px-0">1</Button><Button className="h-8 w-8 px-0"><ChevronRight size={16}/></Button></div></div>
              </div>
            </div>
            <Panel title="Detalle de almacén" icon={ShieldCheck} action={<Button onClick={()=>openEdit("almacen",selectedAlmacen)}><Pencil size={14}/> Editar</Button>} className="self-start">
              <div className="mb-3 flex h-32 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-300 text-blue-500"><Warehouse size={54}/></div><div className="mb-1 flex items-center gap-2"><h2 className="text-lg font-bold text-slate-900">{selectedAlmacen?.nombre}</h2><Status value={selectedAlmacen?.estado}/></div><p className="mb-4 text-sm text-slate-500">{selectedAlmacen?.descripcion}</p>
              <div className="space-y-3 text-xs">{[[Hash,"Código",selectedAlmacen?.codigo],[Building2,"Sede",selectedAlmacen?.sede],[Box,"Tipo",selectedAlmacen?.tipo],[MapPin,"Dirección",selectedAlmacen?.direccion],[UserRound,"Responsable",selectedAlmacen?.responsable],[Phone,"Teléfono",selectedAlmacen?.telefono],[Package,"Capacidad",selectedAlmacen?.capacidad],[LayoutGrid,"Ubicaciones",`${selectedAlmacen?.ubicaciones} ubicaciones`],[CalendarDays,"Fecha de creación",selectedAlmacen?.fechaCreacion],[Clock3,"Última actualización",selectedAlmacen?.actualizacion]].map(([Icon,label,val])=><div key={label} className="grid grid-cols-[18px_105px_1fr] items-start gap-2"><Icon size={15} className="text-blue-600"/><span className="text-slate-500">{label}</span><span className="break-words text-slate-800">{val || "—"}</span></div>)}</div>
              <div className="mt-5 border-t border-blue-100 pt-4"><h3 className="mb-3 font-semibold text-slate-900">Stock actual</h3><div className="grid grid-cols-3 gap-2"><div className="rounded-md border border-blue-100 p-2"><Package size={17} className="mb-1 text-blue-600"/><strong>{selectedAlmacen?.productos?.toLocaleString("es-PE")}</strong><p className="text-[10px] text-slate-500">Productos</p></div><div className="rounded-md border border-blue-100 p-2"><MapPin size={17} className="mb-1 text-blue-600"/><strong>{selectedAlmacen?.ubicaciones}</strong><p className="text-[10px] text-slate-500">Ubicaciones</p></div><div className="rounded-md border border-blue-100 p-2"><ChartNoAxesColumn size={17} className="mb-1 text-blue-600"/><strong className="text-sm">{selectedAlmacen?.valor}</strong><p className="text-[10px] text-slate-500">Valor de stock</p></div></div></div>
            </Panel>
          </div>
        </>}

        {section === "config" && <>
          <header className="flex items-center gap-4"><IconBox><Settings size={30}/></IconBox><div><h1 className="text-2xl font-bold text-slate-900">Configuración de sedes</h1><p className="text-sm text-slate-500">Define reglas, opciones y parámetros para la gestión de tus sedes, almacenes y puntos de operación.</p></div></header>
          <div className="flex flex-wrap gap-1 rounded-lg border border-blue-100 bg-white p-2">{["General","Horarios","Numeración","Permisos","Integraciones"].map((t,i)=><button key={t} onClick={()=>setConfigTab(t)} className={cn("flex items-center gap-2 border-b-2 px-5 py-3 text-sm",configTab===t?"border-blue-600 bg-blue-50 font-semibold text-blue-700":"border-transparent text-slate-600 hover:bg-slate-50")}>{[Settings,Clock3,Hash,UserRound,Link2].map((I,j)=>j===i?<I key={j} size={17}/>:null)}{t}</button>)}</div>
          {configTab === "General" ? <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Información general" subtitle="Configura los datos principales de la sede." icon={Building2}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de la sede"><Input defaultValue={selectedSede?.nombre}/></Field><Field label="Código"><Input defaultValue={selectedSede?.codigo}/></Field>
                <Field label="Tipo de sede" help="Sede central u oficina principal."><Select defaultValue={selectedSede?.tipo}><option>Principal</option><option>Tienda</option><option>Almacén</option><option>Punto de venta</option></Select></Field><Field label="Estado"><Select defaultValue={selectedSede?.estado}><option>Activa</option><option>Inactiva</option></Select></Field>
                <Field label="Dirección"><Input defaultValue={selectedSede?.direccion}/></Field><Field label="Ciudad / Departamento"><Select defaultValue={selectedSede?.ciudad}><option>Lima</option><option>Cusco</option><option>Arequipa</option><option>Trujillo</option></Select></Field>
                <Field label="Teléfono"><Input defaultValue={selectedSede?.telefono}/></Field><Field label="Email"><Input defaultValue={selectedSede?.email}/></Field>
              </div>
            </Panel>
            <Panel title="Imagen y detalles" subtitle="Identifica visualmente la sede." icon={ImageIcon}>
              <div className="mx-auto mb-3 flex h-36 max-w-sm items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-300 text-blue-500"><Building2 size={56}/></div>
              <p className="mb-4 text-center text-xs text-slate-500">Formato recomendado: 1200 × 800 px. JPG o PNG (máx. 2 MB).</p>
              <Field label="Descripción"><textarea defaultValue={selectedSede?.descripcion} maxLength={250} rows={4} className="w-full rounded-md border border-blue-100 px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></Field>
            </Panel>
            <Panel title="Zona horaria y moneda" subtitle="Define la configuración regional de la sede." icon={Clock3}>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Zona horaria"><Select value={settings.timezone} onChange={e=>setSettings(s=>({...s,timezone:e.target.value}))}><option>(GMT-05:00) Lima</option><option>(GMT-05:00) Bogotá</option><option>(GMT-03:00) Buenos Aires</option></Select></Field><Field label="Moneda"><Select value={settings.currency} onChange={e=>setSettings(s=>({...s,currency:e.target.value}))}><option>PEN - Sol Peruano (S/)</option><option>USD - Dólar estadounidense ($)</option></Select></Field><Field label="Formato de fecha"><Select value={settings.dateFormat} onChange={e=>setSettings(s=>({...s,dateFormat:e.target.value}))}><option>DD/MM/AAAA</option><option>MM/DD/AAAA</option><option>AAAA-MM-DD</option></Select><span className="mt-1 block text-xs text-slate-500">Ejemplo: 25/09/2026</span></Field><Field label="Formato de hora"><Select value={settings.timeFormat} onChange={e=>setSettings(s=>({...s,timeFormat:e.target.value}))}><option>24 horas (14:30)</option><option>12 horas (2:30 PM)</option></Select></Field></div>
            </Panel>
            <Panel title="Opciones operativas" subtitle="Define el comportamiento de la sede." icon={Settings}>
              <div className="space-y-4">{[["allowSales","Permitir ventas en esta sede","Habilita la creación de ventas desde esta sede."],["allowPurchases","Permitir compras en esta sede","Habilita la creación de compras."],["allowTransfers","Permitir transferencias","Puede enviar y recibir transferencias de stock."],["visibleAll","Sede visible para todos los usuarios","Si está desactivado, solo usuarios asignados podrán verla."],["stockByWarehouse","Usar stock por almacén","Controla el stock a nivel de almacenes de esta sede."]].map(([key,label,desc])=><div key={key} className="flex items-center gap-4"><button type="button" role="switch" aria-checked={settings[key]} onClick={()=>toggleSetting(key)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition",settings[key]?"bg-blue-600":"bg-slate-300")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition",settings[key]?"left-6":"left-1")}/></button><div><div className="text-sm font-medium text-slate-800">{label}</div><div className="text-xs text-slate-500">{desc}</div></div></div>)}</div>
            </Panel>
          </div> : <Panel title={configTab} subtitle={`Parámetros de ${configTab.toLowerCase()} para la sede.`} icon={Settings}><p className="text-sm text-slate-500">Configura aquí las opciones de {configTab.toLowerCase()}. Los parámetros se pueden ampliar según las reglas de operación del sistema.</p></Panel>}
          <div className="flex justify-end gap-3"><Button onClick={()=>setNotice("No se aplicaron cambios.")}>Cancelar</Button><Button variant="primary" onClick={()=>{setNotice("Configuración guardada correctamente.");setTimeout(()=>setNotice(""),3000)}}><Save size={16}/> Guardar configuración</Button></div>
        </>}
      </div>

      {notice && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><Check size={17}/>{notice}<button onClick={()=>setNotice("")} className="ml-2"><X size={15}/></button></div>}

      {modal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4" onClick={()=>setModal(null)}>
        <form onSubmit={saveItem} onClick={e=>e.stopPropagation()} className="my-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">{editItem ? "Editar" : "Nueva"} {modal==="sede"?"sede":"almacén"}</h2><p className="mt-1 text-sm text-slate-500">Completa los datos para registrar la información.</p></div><button type="button" onClick={()=>setModal(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></div>
          {modal==="sede" ? <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre de la sede"><Input name="nombre" required defaultValue={editItem?.nombre}/></Field><Field label="Código"><Input name="codigo" required defaultValue={editItem?.codigo || `SED-${String(sedes.length+1).padStart(3,"0")}`}/></Field>
            <Field label="Subtítulo"><Input name="subtitulo" defaultValue={editItem?.subtitulo}/></Field><Field label="Tipo de sede"><Select name="tipo" defaultValue={editItem?.tipo || "Principal"}><option>Principal</option><option>Tienda</option><option>Almacén</option><option>Punto de venta</option></Select></Field>
            <Field label="Estado"><Select name="estado" defaultValue={editItem?.estado || "Activa"}><option>Activa</option><option>Inactiva</option></Select></Field><Field label="Ciudad"><Select name="ciudad" defaultValue={editItem?.ciudad || "Lima"}><option>Lima</option><option>Cusco</option><option>Arequipa</option><option>Trujillo</option></Select></Field>
            <Field label="Dirección"><Input name="direccion" required defaultValue={editItem?.direccion}/></Field><Field label="Responsable"><Input name="responsable" defaultValue={editItem?.responsable}/></Field>
            <Field label="Teléfono"><Input name="telefono" defaultValue={editItem?.telefono}/></Field><Field label="Email"><Input name="email" type="email" defaultValue={editItem?.email}/></Field>
            <Field label="Cantidad de almacenes"><Input name="almacenes" type="number" min="0" defaultValue={editItem?.almacenes ?? 0}/></Field><Field label="Descripción"><Input name="descripcion" defaultValue={editItem?.descripcion}/></Field>
          </div> : <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del almacén"><Input name="nombre" required defaultValue={editItem?.nombre}/></Field><Field label="Código"><Input name="codigo" required defaultValue={editItem?.codigo || `ALM-${String(almacenes.length+1).padStart(3,"0")}`}/></Field>
            <Field label="Descripción"><Input name="descripcion" defaultValue={editItem?.descripcion}/></Field><Field label="Sede"><Select name="sede" defaultValue={editItem?.sede || selectedSede?.nombre}>{sedes.map(s=><option key={s.id}>{s.nombre}</option>)}</Select></Field>
            <Field label="Tipo"><Select name="tipo" defaultValue={editItem?.tipo || "Principal"}><option>Principal</option><option>Tienda</option><option>Secundario</option><option>Producción</option><option>Tránsito</option></Select></Field><Field label="Estado"><Select name="estado" defaultValue={editItem?.estado || "Activo"}><option>Activo</option><option>Inactivo</option></Select></Field>
            <Field label="Ubicaciones"><Input name="ubicaciones" type="number" min="0" defaultValue={editItem?.ubicaciones ?? 0}/></Field><Field label="Productos"><Input name="productos" type="number" min="0" defaultValue={editItem?.productos ?? 0}/></Field>
            <Field label="Dirección"><Input name="direccion" defaultValue={editItem?.direccion}/></Field><Field label="Responsable"><Input name="responsable" defaultValue={editItem?.responsable}/></Field>
            <Field label="Teléfono"><Input name="telefono" defaultValue={editItem?.telefono}/></Field><Field label="Capacidad"><Input name="capacidad" defaultValue={editItem?.capacidad}/></Field>
          </div>}
          <div className="mt-6 flex justify-end gap-3 border-t border-blue-50 pt-4"><Button type="button" onClick={()=>setModal(null)}>Cancelar</Button><Button type="submit" variant="primary"><Save size={16}/> Guardar {modal==="sede"?"sede":"almacén"}</Button></div>
        </form>
      </div>}
    </div>
  );
}
