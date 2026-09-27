import React, { useMemo, useState } from "react";
// import "./MovimientosPanel.css";

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
    <aside className="mov-sidebar">
      <div className="mov-logo"><b>⬡</b><div><strong>Inventi <em>Pro</em></strong><small>Inventario & ERP Comercial</small></div></div>
      <nav>{["Resumen", "Productos", "Categorías", "Movimientos", "Clientes", "Cotizaciones", "Ventas", "Pedidos web", "Compras", "Proveedores", "Precios", "Paquetes / Kits", "Promociones", "Liquidaciones", "Catálogos"].map((x, i) => <button key={x} className={x === "Movimientos" ? "nav-active" : ""} onClick={() => x === "Movimientos" && setScreen("list")}><span>{["▦","⬡","▤","♧","♙","▧","▣","▣","🛒","♙","♧","♧","♧","▧","▧"][i]}</span>{x}</button>)}
        <hr/><label>Organización</label>{["Sedes", "Almacenes", "Usuarios"].map(x => <button key={x}><span>⌂</span>{x}</button>)}<button><span>⚙</span>Configuración</button></nav>
      <div className="mov-plan"><b>♕ Plan Profesional</b><small>Inventi Pro</small><div><i /></div><small>800 de 2,000 productos</small><a>Ver últimos beneficios →</a></div>
    </aside>
    <main className="mov-main">
      <header className="mov-top"><div className="mov-global-search">⌕ <span>Buscar productos, clientes, ventas, compras...</span><kbd>Ctrl</kbd><kbd>K</kbd></div><button>▦　Sede Lima　⌄</button><button className="top-bell">♧</button><button className="top-bell">☾</button><div className="mov-user"><b>S</b><span><strong>S Admin</strong><small>Administrador</small></span>⌄</div></header>

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
          {rows.map(m => <tr key={m.id}><td><input type="checkbox" /></td><td>{m.date}<small className="cell-sub">{m.time}</small></td><td><Badge type={m.type}/></td><td><div className="mov-product"><span>{m.product.includes("Colono") ? "☕" : "▥"}</span><div>{m.product}<small>{m.sku}</small></div></div></td><td className="mov-muted">{m.ref}</td><td>{m.location}</td><td className={`mov-qty ${m.type.toLowerCase()}`}>{m.type === "Entrada" ? "+" : m.type === "Transferencia" ? "↓" : "−"} {m.qty}<small>unid.</small></td><td>{m.balance}</td><td className="mov-muted">{m.reason}</td><td className="mov-muted">{m.user}</td><td className="mov-actions"><button className="mov-dots" onClick={() => setMenu(menu === m.id ? null : m.id)}>•••</button>{menu === m.id && <div className="mov-menu"><button onClick={() => { setSelected(m); setScreen("detail"); setMenu(null); }}>◎　Ver detalles</button><button onClick={() => edit(m)}>✎　Editar</button><button onClick={() => { setItems(old => [{ ...m, id: Date.now(), ref: `${m.ref}-C` }, ...old]); setMenu(null); setNotice("Movimiento duplicado."); }}>▢　Duplicar</button><button onClick={() => { setSelected(m); setScreen("detail"); setMenu(null); }}>▣　Imprimir</button><hr/><button className="danger" onClick={() => remove(m)}>▤　Eliminar</button></div>}</td></tr>)}
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
    </main>
  </div>;
}

function Stat({ icon, tone, title, value, trend, foot }) {
  return <article className="mov-stat"><div className={`mov-stat-icon ${tone}`}>{icon}</div><div><span>{title}</span><div className="mov-stat-line"><strong>{Number(value).toLocaleString("es-PE")}</strong><em className={tone === "red" ? "negative" : ""}>{trend}</em></div><small>{foot}</small></div></article>;
}
function Badge({ type }) { return <span className={`mov-badge ${type.toLowerCase()}`}><b>{typeIcon[type]}</b>{type}</span>; }
function Field({ label, required, children }) { return <label className="mov-field"><span>{label}{required && <i> *</i>}</span>{children}</label>; }
function FormSection({ n, title, subtitle, children }) { return <section className="mov-form-section"><div className="mov-section-intro"><b>{n}</b><div><h3>{title}</h3><p>{subtitle}</p></div></div><div className="mov-section-content">{children}</div></section>; }
