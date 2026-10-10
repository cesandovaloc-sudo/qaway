import React, { useMemo, useState, useRef, useEffect } from "react";

const css = `

.mov-app{--blue:#075bea;--line:#e5ebf5;--muted:#7180ac;display:flex;min-height:100vh;background:#f7faff;color:#101828;font:14px Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.mov-app *{box-sizing:border-box}.mov-main{flex:1;min-width:0}.mov-heading{display:flex;align-items:center;gap:15px;padding:24px 24px 18px}.mov-heading-icon{width:52px;height:52px;display:grid;place-items:center;background:#e9f2ff;border-radius:12px;color:var(--blue);font-size:32px}.mov-heading h1,.mov-form-title h1{font-size:28px;letter-spacing:-.8px;margin:0 0 3px;font-weight:750;color:#080d18}.mov-heading p,.mov-form-title p{margin:0;color:#6675a9;font-size:15px}.mov-primary{border:1px solid #075bea;background:#075bea;color:white;border-radius:7px;height:44px;padding:0 19px;font:inherit;cursor:pointer;box-shadow:0 2px 4px #075bea12}.mov-new{margin-left:auto;display:flex;align-items:center;gap:14px;padding:0 16px}.mov-new b{font-weight:400;border-left:1px solid #ffffff50;padding-left:14px}.mov-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:0 24px 14px}.mov-stat{display:flex;align-items:center;gap:15px;min-height:111px;background:#fff;border:1px solid var(--line);border-radius:9px;padding:16px;box-shadow:0 2px 8px #1c3b7005}.mov-stat-icon{width:50px;height:50px;flex:0 0 50px;border-radius:12px;display:grid;place-items:center;font-size:30px}.mov-stat-icon.green{background:#e7f8ef;color:#00a65a}.mov-stat-icon.red{background:#ffebed;color:#ed1b2f}.mov-stat-icon.blue{background:#e9f2ff;color:#0861ee}.mov-stat-icon.orange{background:#fff1df;color:#f18a00}.mov-stat>div:last-child{min-width:0}.mov-stat>div>span{font-size:13px;display:block;white-space:nowrap}.mov-stat-line{display:flex;align-items:center;gap:16px;margin:6px 0 1px}.mov-stat-line strong{font-size:27px;line-height:1.1;color:#050b15}.mov-stat-line em{font-style:normal;color:#00a65a;font-size:14px}.mov-stat-line em.negative{color:#e31d2e}.mov-stat small{color:#7180ac;font-size:13px}.mov-filters{display:flex;align-items:center;gap:14px;margin:0 24px 14px;padding:12px 15px;background:#fff;border:1px solid var(--line);border-radius:9px}.mov-search,.mov-select{height:40px;display:flex;align-items:center;gap:10px;border:1px solid #e2e9f5;border-radius:7px;padding:0 12px;color:#263d79;white-space:nowrap}.mov-search{flex:1;min-width:200px;background:#f9fbff;font-size:21px}.mov-search input{border:0;outline:0;background:transparent;width:100%;font:inherit;font-size:13px;color:#17284e}.mov-search input::placeholder{color:#8793b2}.mov-select select{border:0;outline:0;background:transparent;color:#17284e;font:inherit;min-width:105px;cursor:pointer}.mov-outline{height:42px;border:1px solid #dfe7f4;border-radius:7px;background:#fff;color:#14254e;padding:0 16px;font:inherit;cursor:pointer}.mov-filters>.mov-outline{margin-left:auto;white-space:nowrap}.mov-table-card{margin:0 24px 24px;background:#fff;border:1px solid var(--line);border-radius:9px;overflow:visible;box-shadow:0 2px 8px #1c3b7004}.mov-table-wrap{overflow-x:auto;border-radius:9px}.mov-table{width:100%;border-collapse:collapse;min-width:1130px;text-align:left}.mov-table th{height:43px;font-size:12px;font-weight:600;color:#111e40;background:#fbfcff;border-bottom:1px solid #e8edf5;white-space:nowrap}.mov-table th,.mov-table td{padding:9px 10px}.mov-table th:first-child,.mov-table td:first-child{padding-left:17px;width:42px}.mov-table th small{color:#b0bad0}.mov-table td{height:61px;border-bottom:1px solid #edf1f7;color:#34436c;vertical-align:middle;font-size:13px}.mov-table tbody tr:hover{background:#f6f9ff}.mov-table input[type=checkbox]{width:15px;height:15px;accent-color:#0961ed;cursor:pointer}.mov-app .cell-sub,.mov-product small{display:block;color:#7b88ad;font-size:12px;margin-top:3px}.mov-product{display:flex;align-items:center;gap:10px;min-width:185px;color:#17244a}.mov-product>span{width:36px;height:40px;flex:0 0 36px;display:grid;place-items:center;background:#f0f4fa;border-radius:5px;font-size:21px}.mov-muted{color:#6b79a7!important}.mov-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 9px;border-radius:6px;font-size:12px;white-space:nowrap}.mov-badge b{font-size:16px;line-height:1}.mov-badge.entrada{background:#e4f8ed;color:#009b55}.mov-badge.salida{background:#ffeaec;color:#e51f31}.mov-badge.transferencia{background:#e9f1ff;color:#075bea}.mov-badge.ajuste{background:#fff2e1;color:#e98200}.mov-qty{font-weight:600;white-space:nowrap}.mov-qty small{display:block;font-size:11px;font-weight:400;text-align:center;color:#7b88ad}.mov-qty.entrada{color:#009b55}.mov-qty.salida,.mov-qty.ajuste{color:#e51f31}.mov-qty.transferencia{color:#075bea}.mov-actions{position:relative;text-align:center}.mov-dots{width:40px;height:39px;border:1px solid #e1e8f4;border-radius:7px;background:#fff;color:#172c68;font-size:17px;cursor:pointer}.mov-menu{position:absolute;right:12px;top:48px;width:190px;padding:7px;background:#fff;border:1px solid #e3e9f3;border-radius:8px;box-shadow:0 10px 28px #12264a20;z-index:20}.mov-menu button{display:block;width:100%;text-align:left;padding:10px 9px;border:0;border-radius:5px;background:#fff;color:#1b2c54;font:inherit;cursor:pointer;white-space:nowrap}.mov-menu button:hover{background:#f3f7ff}.mov-menu hr{border:0;border-top:1px solid #edf0f6}.mov-menu .mov-app .danger{color:#e11d2e}.mov-footer{min-height:72px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;color:#7885aa;font-size:13px}.mov-footer>div{display:flex;align-items:center;gap:9px;color:#17284c}.mov-footer label{display:flex;align-items:center;gap:10px;margin-right:9px}.mov-footer select{border:1px solid #e3e9f4;border-radius:6px;padding:9px;background:#fff;color:#24345e}.mov-footer button,.mov-footer b{width:35px;height:36px;display:grid;place-items:center;border:1px solid #e1e8f4;background:#fff;border-radius:6px;font:inherit;color:#20345f}.mov-footer b{background:#075bea;color:#fff;border-color:#075bea}.mov-footer button:disabled{color:#b7c1d5}.mov-empty{text-align:center;padding:35px;color:#7b88a8}.mov-notice{margin:0 24px 12px;background:#edf8f1;border:1px solid #c9ead5;color:#13763d;border-radius:7px;padding:10px 14px;display:flex;justify-content:space-between}.mov-notice button{border:0;background:transparent;font-size:18px;color:inherit;cursor:pointer}.mov-form-page{padding:23px 24px 35px}.mov-back{width:52px;height:52px;border:0;border-radius:10px;background:#eaf2ff;color:#075bea;font-size:30px;float:left;margin-right:17px;cursor:pointer}.mov-form-title{padding:0 0 22px;min-height:74px}.mov-form-title h1{font-size:27px}.mov-form-page form{clear:both}.mov-form-section{display:grid;grid-template-columns:340px minmax(0,1fr);gap:20px;background:#fff;border:1px solid var(--line);border-radius:9px;padding:22px 17px;margin-bottom:13px}.mov-section-intro{display:flex;gap:14px;align-items:flex-start}.mov-section-intro>b{width:35px;height:35px;flex:0 0 35px;display:grid;place-items:center;border-radius:50%;background:#3e78f3;color:#fff}.mov-section-intro h3{margin:1px 0 4px;font-size:16px}.mov-section-intro p{margin:0;color:#7784a8;font-size:13px}.mov-section-content{min-width:0}.mov-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 20px}.mov-field{display:flex;flex-direction:column;gap:9px;min-width:0;color:#15244b;font-size:13px}.mov-field>span i{color:#e11d48;font-style:normal}.mov-field input,.mov-field select{height:42px;width:100%;min-width:0;border:1px solid #dce5f3;border-radius:6px;background:#fff;padding:0 13px;color:#17284d;font:inherit;outline-color:#8ab4ff}.mov-field input::placeholder{color:#8995b3}.mov-subtotal{border:1px solid #e3eaf5;border-radius:7px;padding:8px 13px;display:flex;flex-direction:column;justify-content:center;background:#f9fbff}.mov-subtotal small{font-size:12px;color:#7b87a7}.mov-subtotal strong{font-size:19px;margin-top:4px}.mov-section-content textarea{width:100%;min-height:105px;resize:vertical;border:1px solid #dce5f3;border-radius:7px;padding:12px;font:inherit;color:#17284d;outline-color:#8ab4ff}.mov-char-count{display:block;text-align:right;color:#8b96b3;font-size:12px;margin-top:5px}.mov-form-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:8px}.mov-form-actions .mov-primary{min-width:205px}.mov-detail{padding:0 24px 30px}.mov-detail-head{display:flex;align-items:center;gap:15px;padding:20px 22px;background:#fff;border:1px solid var(--line);border-bottom:0;border-radius:10px 10px 0 0}.mov-detail-icon{width:52px;height:52px;border-radius:12px;display:grid;place-items:center;font-size:31px;background:#e4f8ed;color:#009b55}.mov-detail-icon.salida{background:#ffeaec;color:#e51f31}.mov-detail-icon.transferencia{background:#e9f1ff;color:#075bea}.mov-detail-icon.ajuste{background:#fff2e1;color:#e98200}.mov-detail-head h1{font-size:22px;margin:0 0 5px;display:flex;align-items:center;gap:12px}.mov-detail-head p{margin:0;color:#7784a8;font-size:13px}.mov-detail-head>.mov-dots{margin-left:auto;font-size:25px}.mov-tabs{display:flex;border-bottom:1px solid #e7edf6;padding:0 20px;gap:12px;background:#fff}.mov-tabs button{border:0;background:transparent;padding:14px 18px;color:#4c5d85;font:inherit}.mov-tabs button.selected{color:#075bea;border-bottom:2px solid #075bea}.mov-detail-card{margin:18px 20px;background:#fff;border:1px solid #e4ebf5;border-radius:8px;padding:17px}.mov-detail-card h3{font-size:16px;margin:0 0 20px;display:flex;align-items:center;gap:8px}.mov-detail-card h3 .mov-badge{margin-left:auto}.mov-detail-card dl{display:grid;grid-template-columns:minmax(180px,34%) 1fr;gap:14px 12px;margin:0}.mov-detail-card dt{color:#7a87aa}.mov-detail-card dd{margin:0;color:#1a2a50}.mov-detail-products{display:grid;grid-template-columns:2fr 1.5fr .8fr 1fr 1fr;gap:14px;padding:14px 8px;border-bottom:1px solid #edf1f7;color:#4e5e85;font-size:13px}.mov-detail-products b{color:#19274a}.mov-detail-products small{display:block;color:#7b88ad;font-size:12px;margin-top:3px}.mov-detail-products strong{text-align:right;color:#1b2a50}.mov-detail-total{display:flex;justify-content:space-between;padding:17px 8px 3px;color:#243456}.mov-detail-total strong{font-size:17px}.mov-detail-actions{display:flex;justify-content:flex-end;gap:12px;padding:0 20px 20px}.mov-detail-actions .mov-primary{min-width:190px}
@media(max-width:1200px){.mov-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.mov-form-section{grid-template-columns:240px minmax(0,1fr)}.mov-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mov-filters{flex-wrap:wrap}.mov-search{flex-basis:100%}}
@media(max-width:760px){.mov-heading{padding:18px 14px;flex-wrap:wrap}.mov-heading h1{font-size:24px}.mov-heading p{font-size:13px}.mov-new{margin-left:auto}.mov-stats{padding:0 14px 12px;gap:9px}.mov-stat{padding:11px;gap:9px;min-height:95px}.mov-stat-icon{width:40px;height:40px;flex-basis:40px;font-size:24px}.mov-stat>div>span{white-space:normal;font-size:12px}.mov-stat-line{gap:8px}.mov-stat-line strong{font-size:22px}.mov-stat-line em{font-size:12px}.mov-filters{margin:0 14px 12px;padding:10px;gap:8px}.mov-select{flex:1;min-width:0}.mov-select select{min-width:0;width:100%}.mov-filters>.mov-outline{margin-left:0}.mov-table-card{margin:0 14px 18px}.mov-footer{align-items:flex-start;gap:12px;flex-direction:column}.mov-footer>div{flex-wrap:wrap}.mov-form-page{padding:17px 14px}.mov-form-section{display:block;padding:16px 13px}.mov-section-intro{margin-bottom:18px}.mov-form-grid{grid-template-columns:1fr}.mov-form-actions{position:sticky;bottom:0;background:#fff;padding:12px 0}.mov-detail{padding:0 12px 20px}.mov-detail-head{padding:14px;gap:10px}.mov-detail-head h1{font-size:17px;flex-wrap:wrap}.mov-detail-head p{font-size:11px}.mov-detail-card{margin:12px;padding:13px}.mov-detail-card dl{grid-template-columns:1fr;gap:6px}.mov-detail-card dd{margin-bottom:9px}.mov-detail-products{min-width:650px}.mov-detail-card:has(.mov-detail-products){overflow-x:auto}.mov-tabs{padding:0 5px;gap:0}.mov-tabs button{padding:12px 10px;font-size:12px}.mov-detail-actions{padding:0 12px 14px}.mov-detail-actions .mov-primary{min-width:0}}
`;

const initialMovements = [
  { id: 1, date: "25/09/2026", time: "14:32", type: "Entrada", product: "Café El Colono Premium", sku: "CP-250-MOL", ref: "OC-2026-045", location: "Almacén Principal · Estante A1", qty: 120, balance: 340, reason: "Compra a proveedor", user: "S Admin", cost: 12.5 },
  { id: 2, date: "25/09/2026", time: "11:18", type: "Salida", product: "Kiénti Typica", sku: "KT-250-MOL", ref: "VENT-001245", location: "Tienda Lima · Zona de venta", qty: 5, balance: 28, reason: "Venta", user: "María López", cost: 14 },
  { id: 3, date: "24/09/2026", time: "16:45", type: "Transferencia", product: "Café El Colono Premium", sku: "CP-250-GRA", ref: "TRF-2026-012", location: "Almacén Principal → Tienda Lima", qty: 20, balance: 120, reason: "Traslado entre almacenes", user: "S Admin", cost: 12.5 },
  { id: 4, date: "24/09/2026", time: "10:12", type: "Ajuste", product: "Kiénti Catimor", sku: "KC-250-GRA", ref: "AJ-2026-008", location: "Almacén Principal · Zona B", qty: 3, balance: 45, reason: "Ajuste por merma", user: "S Admin", cost: 15.5 },
  { id: 5, date: "23/09/2026", time: "15:20", type: "Entrada", product: "Café El Colono Premium", sku: "CP-250-MOL", ref: "OC-2026-044", location: "Almacén Principal · Estante A2", qty: 60, balance: 220, reason: "Compra a proveedor", user: "S Admin", cost: 12.5 },
  { id: 6, date: "23/09/2026", time: "09:37", type: "Salida", product: "Kiénti Typica", sku: "KT-250-MOL", ref: "VENT-001238", location: "Tienda Lima · Zona de venta", qty: 8, balance: 33, reason: "Venta", user: "Ana Ramos", cost: 14 },
  { id: 7, date: "22/09/2026", time: "16:10", type: "Transferencia", product: "Kiénti Catimor", sku: "KC-250-GRA", ref: "TRF-2026-011", location: "Almacén Principal → Sede Arequipa", qty: 15, balance: 60, reason: "Traslado entre sedes", user: "S Admin", cost: 15.5 },
  { id: 8, date: "22/09/2026", time: "11:02", type: "Ajuste", product: "Café El Colono Premium", sku: "CP-250-GRA", ref: "AJ-2026-007", location: "Almacén Principal · Estante A1", qty: 2, balance: 98, reason: "Ajuste por inventario", user: "S Admin", cost: 12.5 },
];

const money = n => `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const typeIcon = { Entrada: "↓", Salida: "↑", Transferencia: "⇄", Ajuste: "⚙" };

export default function MovimientosPanel() {
  const [items, setItems] = useState(initialMovements);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Todos");
  const [warehouse, setWarehouse] = useState("Todos");
  const [menu, setMenu] = useState(null);
  const [selected, setSelected] = useState(null);
  const [screen, setScreen] = useState("list");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const emptyForm = { type: "Entrada", date: "2026-09-27", ref: "", reason: "Compra a proveedor", product: "", sku: "", location: "", qty: "", cost: "", user: "S Admin", note: "" };
  const [form, setForm] = useState(emptyForm);
  const actionsMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setMenu(null);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filtered = useMemo(() => items.filter(m => {
    const searchable = `${m.product} ${m.sku} ${m.ref} ${m.reason} ${m.user}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (type === "Todos" || m.type === type) && (warehouse === "Todos" || m.location.includes(warehouse));
  }), [items, query, type, warehouse]);
  const rows = filtered.slice((page - 1) * 8, page * 8);
  const qtySum = kind => items.filter(m => m.type === kind).reduce((sum, m) => sum + m.qty, 0);
  const count = kind => items.filter(m => m.type === kind).length;
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));

  function openNew() { setSelected(null); setForm({ ...emptyForm, ref: `MOV-2026-${String(items.length + 1).padStart(3, "0")}` }); setScreen("new"); }
  function save(e) {
    e.preventDefault();
    if (!form.product.trim() || Number(form.qty) <= 0) { setNotice("Completa el producto y una cantidad mayor que cero."); return; }
    const item = { ...form, id: Date.now(), date: form.date.split("-").reverse().join("/"), time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false }), qty: Number(form.qty), balance: Number(form.qty), cost: Number(form.cost || 0), location: form.location || "Almacén Principal" };
    setItems(old => [item, ...old]); setSelected(item); setScreen("detail"); setNotice("Movimiento registrado correctamente.");
  }
  function edit(item) {
    setSelected(item);
    setForm({ ...item, date: item.date.split("/").reverse().join("-"), qty: String(item.qty), cost: String(item.cost || 0), location: item.location });
    setScreen("edit"); setMenu(null);
  }
  function update(e) {
    e.preventDefault();
    const updated = { ...selected, ...form, date: form.date.split("-").reverse().join("/"), qty: Number(form.qty), cost: Number(form.cost || 0) };
    setItems(old => old.map(m => m.id === selected.id ? updated : m)); setSelected(updated); setScreen("detail"); setNotice("Movimiento actualizado.");
  }
  function remove(item) {
    setItems(old => old.filter(m => m.id !== item.id)); setMenu(null); setSelected(null); setScreen("list"); setNotice("Movimiento eliminado.");
  }

  return <div className="mov-app">
    <style>{css}</style>
    <div className="mov-main">
      
      {screen === "list" && <>
        <div className="mov-heading"><div className="mov-heading-icon">⇄</div><div><h1>Movimientos</h1><p>Registra y consulta todas las entradas, salidas y movimientos de inventario.</p></div><button className="mov-primary mov-new" onClick={openNew}>＋　Nuevo movimiento <b>⌄</b></button></div>
        <div className="mov-stats">
          <Stat icon="↓" tone="green" title="Entradas (últimos 30 días)" value={qtySum("Entrada")} trend="↑ +12%" foot={`${count("Entrada")} movimientos`} />
          <Stat icon="↑" tone="red" title="Salidas (últimos 30 días)" value={qtySum("Salida")} trend="↓ -8%" foot={`${count("Salida")} movimientos`} />
          <Stat icon="⇄" tone="blue" title="Transferencias" value={qtySum("Transferencia")} trend="↑ +18%" foot={`${count("Transferencia")} movimientos`} />
          <Stat icon="⚙" tone="orange" title="Ajustes" value={qtySum("Ajuste")} trend="↓ -20%" foot={`${count("Ajuste")} movimientos`} />
        </div>
        <div className="mov-filters"><label className="mov-search">⌕ <input placeholder="Buscar por producto, referencia, motivo..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
          <label className="mov-select">▦ <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}>{["Todos","Entrada","Salida","Transferencia","Ajuste"].map(x => <option key={x}>{x === "Todos" ? "Tipo: Todos" : x}</option>)}</select></label>
          <label className="mov-select">⌂ <select value={warehouse} onChange={e => { setWarehouse(e.target.value); setPage(1); }}><option value="Todos">Almacén: Todos</option><option value="Almacén Principal">Almacén Principal</option><option value="Tienda Lima">Tienda Lima</option><option value="Sede Arequipa">Sede Arequipa</option></select></label>
          <button className="mov-outline" onClick={() => { setQuery(""); setType("Todos"); setWarehouse("Todos"); setPage(1); }}>▽　Más filtros</button>
        </div>
        {notice && <div className="mov-notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
        <section className="mov-table-card"><div className="mov-table-wrap"><table className="mov-table"><thead><tr><th><input type="checkbox" /></th><th>Fecha <small>↕</small></th><th>Tipo</th><th>Producto</th><th>Referencia</th><th>Almacén / Ubicación</th><th>Cantidad</th><th>Saldo <small>↕</small></th><th>Motivo</th><th>Usuario</th><th>Acciones</th></tr></thead><tbody>
          {rows.map(m => <tr key={m.id}><td><input type="checkbox" /></td><td>{m.date}<small className="cell-sub">{m.time}</small></td><td><Badge type={m.type}/></td><td><div className="mov-product"><span>{m.product.includes("Colono") ? "☕" : "▥"}</span><div>{m.product}<small>{m.sku}</small></div></div></td><td className="mov-muted">{m.ref}</td><td>{m.location}</td><td className={`mov-qty ${m.type.toLowerCase()}`}>{m.type === "Entrada" ? "+" : m.type === "Transferencia" ? "↓" : "−"} {m.qty}<small>unid.</small></td><td>{m.balance}</td><td className="mov-muted">{m.reason}</td><td className="mov-muted">{m.user}</td><td className="mov-actions" ref={menu === m.id ? actionsMenuRef : null}><button className="mov-dots" onClick={() => setMenu(menu === m.id ? null : m.id)}>•••</button>{menu === m.id && <div className="mov-menu"><button onClick={() => { setSelected(m); setScreen("detail"); setMenu(null); }}>◎　Ver detalles</button><button onClick={() => edit(m)}>✎　Editar</button><button onClick={() => { setItems(old => [{ ...m, id: Date.now(), ref: `${m.ref}-C` }, ...old]); setMenu(null); setNotice("Movimiento duplicado."); }}>▢　Duplicar</button><button onClick={() => { setSelected(m); setScreen("detail"); setMenu(null); }}>▣　Imprimir</button><hr/><button className="danger" onClick={() => remove(m)}>▤　Eliminar</button></div>}</td></tr>)}
        </tbody></table></div>{!rows.length && <div className="mov-empty">No se encontraron movimientos.</div>}
          <footer className="mov-footer"><span>Mostrando {filtered.length ? (page - 1) * 8 + 1 : 0} a {Math.min(page * 8, filtered.length)} de {filtered.length} movimientos</span><div><label>Filas por página <select value="8" readOnly><option>8</option></select></label><button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button><b>{page}</b><button disabled={page * 8 >= filtered.length} onClick={() => setPage(p => p + 1)}>›</button></div></footer>
        </section>
      </>}

      {(screen === "new" || screen === "edit") && <section className="mov-form-page"><button className="mov-back" onClick={() => setScreen("list")}>←</button><div className="mov-form-title"><h1>{screen === "new" ? "Nuevo movimiento" : "Editar movimiento"}</h1><p>Registra una entrada, salida, transferencia o ajuste de inventario.</p></div>
        <form onSubmit={screen === "new" ? save : update}>
          <FormSection n="1" title="Información general" subtitle="Define el tipo de movimiento y los datos principales."><div className="mov-form-grid">
            <Field label="Tipo de movimiento" required><select value={form.type} onChange={e => change("type", e.target.value)}>{["Entrada","Salida","Transferencia","Ajuste"].map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Fecha" required><input type="date" value={form.date} onChange={e => change("date", e.target.value)} required /></Field>
            <Field label="Referencia"><input value={form.ref} onChange={e => change("ref", e.target.value)} placeholder="Ej. OC-2026-046" /></Field>
            <Field label="Motivo" required><select value={form.reason} onChange={e => change("reason", e.target.value)}>{["Compra a proveedor","Venta","Traslado entre almacenes","Traslado entre sedes","Ajuste por merma","Ajuste por inventario","Devolución","Otro"].map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Proveedor"><input value={form.supplier || ""} onChange={e => change("supplier", e.target.value)} placeholder="Seleccionar proveedor..." /></Field>
            <Field label="Almacén / Ubicación" required><input value={form.location} onChange={e => change("location", e.target.value)} placeholder="Ej. Almacén Principal · Estante A1" /></Field>
          </div></FormSection>
          <FormSection n="2" title="Productos" subtitle="Agrega los productos que forman parte del movimiento."><div className="mov-form-grid">
            <Field label="Producto" required><input value={form.product} onChange={e => change("product", e.target.value)} placeholder="Nombre del producto" required /></Field>
            <Field label="Código / SKU"><input value={form.sku} onChange={e => change("sku", e.target.value)} placeholder="Ej. CP-250-MOL" /></Field>
            <Field label="Cantidad" required><input type="number" min="1" value={form.qty} onChange={e => change("qty", e.target.value)} placeholder="0" required /></Field>
            <Field label="Costo unitario (S/)"><input type="number" min="0" step="0.01" value={form.cost} onChange={e => change("cost", e.target.value)} placeholder="0.00" /></Field>
            <div className="mov-subtotal"><small>Subtotal estimado</small><strong>{money(Number(form.qty || 0) * Number(form.cost || 0))}</strong></div>
          </div></FormSection>
          <FormSection n="3" title="Observaciones (opcional)" subtitle="Añade información adicional si es necesario."><textarea maxLength="500" value={form.note || ""} onChange={e => change("note", e.target.value)} placeholder="Escribe una observación..." /><small className="mov-char-count">{(form.note || "").length}/500</small></FormSection>
          <div className="mov-form-actions"><button type="button" className="mov-outline" onClick={() => setScreen("list")}>Cancelar</button><button type="submit" className="mov-primary">▣　{screen === "new" ? "Guardar movimiento" : "Guardar cambios"}</button></div>
        </form>
      </section>}

      {screen === "detail" && selected && <section className="mov-detail"><div className="mov-detail-head"><div className={`mov-detail-icon ${selected.type.toLowerCase()}`}>{typeIcon[selected.type]}</div><div><h1>Movimiento {selected.ref} <Badge type={selected.type}/></h1><p>Registrado el {selected.date} a las {selected.time} por {selected.user}</p></div><button className="mov-dots" onClick={() => setScreen("list")}>×</button></div>
        <div className="mov-tabs"><button className="selected">Detalle</button><button>Historial</button><button>Documentos</button><button>Relacionado</button></div>
        <article className="mov-detail-card"><h3>▣　Información general <Badge type={selected.type}/></h3><dl><dt>Tipo de movimiento</dt><dd><Badge type={selected.type}/></dd><dt>Referencia</dt><dd>{selected.ref}</dd><dt>Fecha y hora</dt><dd>{selected.date} {selected.time}</dd><dt>Motivo</dt><dd>{selected.reason}</dd>{selected.supplier && <><dt>Proveedor</dt><dd>{selected.supplier}</dd></>}<dt>Almacén / Ubicación</dt><dd>{selected.location}</dd><dt>Observaciones</dt><dd>{selected.note || "—"}</dd></dl></article>
        <article className="mov-detail-card"><h3>⬡　Productos (1)</h3><div className="mov-detail-products"><b>Producto</b><b>Ubicación</b><b>Cantidad</b><b>Costo unitario</b><b>Subtotal</b><span>{selected.product}<small>{selected.sku}</small></span><span>{selected.location}</span><span>{selected.qty} unid.</span><span>{money(selected.cost)}</span><strong>{money(selected.qty * selected.cost)}</strong></div><div className="mov-detail-total"><span>Total de productos: 1</span><strong>Total　{money(selected.qty * selected.cost)}</strong></div></article>
        <div className="mov-detail-actions"><button className="mov-outline" onClick={() => window.print()}>▣　Imprimir</button><button className="mov-primary" onClick={() => edit(selected)}>✎　Editar movimiento</button></div>
      </section>}
    </div>
  </div>;
}

function Stat({ icon, tone, title, value, trend, foot }) {
  return <article className="mov-stat"><div className={`mov-stat-icon ${tone}`}>{icon}</div><div><span>{title}</span><div className="mov-stat-line"><strong>{Number(value).toLocaleString("es-PE")}</strong><em className={tone === "red" ? "negative" : ""}>{trend}</em></div><small>{foot}</small></div></article>;
}
function Badge({ type }) { return <span className={`mov-badge ${type.toLowerCase()}`}><b>{typeIcon[type]}</b>{type}</span>; }
function Field({ label, required, children }) { return <label className="mov-field"><span>{label}{required && <i> *</i>}</span>{children}</label>; }
function FormSection({ n, title, subtitle, children }) { return <section className="mov-form-section"><div className="mov-section-intro"><b>{n}</b><div><h3>{title}</h3><p>{subtitle}</p></div></div><div className="mov-section-content">{children}</div></section>; }
