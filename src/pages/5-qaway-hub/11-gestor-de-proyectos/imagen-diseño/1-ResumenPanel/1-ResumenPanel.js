import React, { useEffect, useRef, useState } from "react";

/**
 * Inventi — Panel Resumen + menú desplegable de perfil
 * Componente React autónomo. Incluye estilos, menú de perfil y modal "Nueva operación".
 * Los datos mostrados son datos de demostración basados en las referencias visuales.
 */
export default function ResumenPanel() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [operationOpen, setOperationOpen] = useState(false);
  const [warehouse, setWarehouse] = useState("Todos los almacenes");
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");
  const [theme, setTheme] = useState("light");
  const profileRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setOperationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navGroups = [
    ["Resumen", "Productos", "Categorías", "Ubicaciones", "Movimientos"],
    ["Clientes", "Cotizaciones", "Ventas", "Pedidos web"],
    ["Compras", "Proveedores"],
    ["Precios", "Paquetes / Kits", "Promociones", "Liquidaciones", "Catálogos"],
    ["Caja", "Gastos", "Contabilidad", "Reportes", "Configuración"],
  ];

  const operations = [
    { icon: "🛒", title: "Registrar venta", description: "Emite una venta de productos o servicios.", tone: "green" },
    { icon: "🚚", title: "Registrar compra", description: "Registra una compra de productos.", tone: "purple" },
    { icon: "▱", title: "Ajuste de stock", description: "Aumenta o disminuye el stock de productos.", tone: "orange" },
    { icon: "▤", title: "Nueva cotización", description: "Crea una cotización para un cliente.", tone: "blue" },
    { icon: "▣", title: "Registrar gasto", description: "Registra un gasto operativo.", tone: "pink" },
    { icon: "▥", title: "Inventario físico", description: "Realiza un conteo de inventario.", tone: "teal" },
    { icon: "⇄", title: "Transferencia", description: "Transfiere stock entre almacenes.", tone: "purple" },
    { icon: "▥", title: "Ver reportes", description: "Accede a reportes de operaciones.", tone: "slate" },
  ];

  const recentActivity = [
    ["Hoy, 14:32", "Salida", "Café Premium 250g", "- 10 un.", "Tienda Surco", "Ana Torres", "red"],
    ["Hoy, 11:20", "Entrada", "Alimento Perro Adulto", "+ 50 un.", "Almacén Principal", "Carlos Ruiz", "green"],
    ["Ayer, 17:10", "Ajuste", "Shampoo Veterinario", "- 5 un.", "Almacén Principal", "S Admin", "purple"],
    ["Ayer, 10:45", "Transferencia", "Collar Antipulgas", "+ 20 un.", "Sede Centro → Sede Sur", "Ana Torres", "blue"],
    ["12 Sep, 16:20", "Salida", "Arena Sanitaria 5kg", "- 3 un.", "Tienda Online", "María López", "red"],
  ];

  const lowStock = [
    ["☕", "Café Premium 250g", "SKU: CAF-250", "3 un.", "Mín: 20"],
    ["🧴", "Shampoo Veterinario 500ml", "SKU: VET-SH-500", "2 un.", "Mín: 15"],
    ["🧴", "Arena Sanitaria 5kg", "SKU: CAT-ARE-5", "4 un.", "Mín: 25"],
    ["📦", "Alimento Gato Adulto", "SKU: CAT-AD-10", "5 un.", "Mín: 30"],
    ["🐾", "Collar Antipulgas", "SKU: VET-COL-01", "8 un.", "Mín: 40"],
  ];

  const bestSellers = [
    ["1", "Alimento Perro Adulto 10kg", "DOG-AD-10", "124 un.", "S/ 12,400"],
    ["2", "Café Premium 250g", "CAF-250", "98 un.", "S/ 9,800"],
    ["3", "Arena Sanitaria 5kg", "CAT-ARE-5", "76 un.", "S/ 7,600"],
    ["4", "Shampoo Veterinario 500ml", "VET-SH-500", "62 un.", "S/ 4,960"],
    ["5", "Collar Antipulgas", "VET-COL-01", "48 un.", "S/ 3,840"],
  ];

  const recentSales = [
    ["V-000123", "Ana Torres", "3", "S/ 120.00", "Completada", "green"],
    ["V-000122", "Clínica Patitas", "5", "S/ 450.00", "Completada", "green"],
    ["V-000121", "Carlos Ruiz", "2", "S/ 85.00", "Completada", "green"],
    ["V-000120", "Pet Shop Surco", "8", "S/ 680.00", "Completada", "green"],
    ["V-000119", "María López", "1", "S/ 75.00", "Pendiente", "orange"],
  ];

  const recentPurchases = [
    ["OC-00045", "Distribuidora Vet Perú", "12", "S/ 1,250.00", "Recibida", "green"],
    ["OC-00044", "Alimentos S.A.C.", "20", "S/ 2,400.00", "Recibida", "green"],
    ["OC-00043", "Laboratorios Pet", "8", "S/ 890.00", "Aprobada", "blue"],
    ["OC-00042", "Importadora BioVet", "15", "S/ 1,750.00", "Recibida", "green"],
    ["OC-00041", "Productos Andinos", "10", "S/ 980.00", "Pendiente", "orange"],
  ];

  return (
    <div className={`inventi-app ${theme === "dark" ? "inventi-dark" : ""}`}>
      <style>{styles}</style>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">◆</div>
          <div><strong>Inventi <span>Pro</span></strong><small>Inventario y ERP Comercial</small></div>
        </div>
        <nav>
          {navGroups.map((group, groupIndex) => (
            <div className="nav-group" key={groupIndex}>
              {group.map((item, index) => (
                <button className={`nav-item ${item === "Resumen" ? "active" : ""}`} key={item}>
                  <span className="nav-icon">{navIcon(item)}</span><span>{item}</span>
                  {["Ventas", "Compras", "Contabilidad", "Reportes"].includes(item) && <span className="nav-chevron">⌄</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="plan-card">
          <div className="plan-heading"><span className="crown">♛</span><div><b>Plan Profesional</b><small>Inventi Pro</small></div></div>
          <div className="progress"><i /></div>
          <small>800 de 2,000 productos</small>
          <a href="#beneficios">Ver últimos beneficios →</a>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="global-search"><span>⌕</span><input placeholder="Buscar productos, clientes, ventas, compras..." /><kbd>Ctrl</kbd><kbd>K</kbd></div>
          <div className="top-actions">
            <button className="icon-button notification" aria-label="Notificaciones">♧<i /></button>
            <button className="icon-button" aria-label="Cambiar tema" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>☾</button>
            <div className="profile-wrap" ref={profileRef}>
              <button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                <span className="avatar">S</span><span className="profile-short"><b>S Admin</b><small>Administrador</small></span><span className="chevron">⌄</span>
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-summary">
                    <span className="avatar avatar-large">S</span>
                    <div><b>S Admin</b><span>Administrador</span><small>admin@inventi.com</small></div>
                  </div>
                  <div className="profile-warehouse">
                    <span className="warehouse-icon">▣</span>
                    <div className="warehouse-field"><label>Almacén actual</label>
                      <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
                        <option>Todos los almacenes</option><option>Almacén Principal</option><option>Almacén Surco</option><option>Almacén Secundario</option>
                      </select>
                    </div>
                  </div>
                  <div className="menu-links">
                    <button><span>♙</span>Mi perfil</button>
                    <button><span>♧</span>Usuarios y permisos</button>
                    <button><span>⚙</span>Configuración de la empresa</button>
                    <button><span>⚙</span>Preferencias del sistema</button>
                    <button><span>♧</span>Notificaciones <em>3</em></button>
                    <button><span>ⓘ</span>Ayuda y soporte <b className="external">↗</b></button>
                    <button><span>♧</span>Novedades <b className="external">↗</b></button>
                  </div>
                  <div className="theme-row"><span>♧</span><b>Cambiar tema</b>
                    <div className="theme-options">
                      <button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")} aria-label="Tema claro">☼</button>
                      <button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")} aria-label="Tema oscuro">☾</button>
                      <button aria-label="Tema sistema" onClick={() => setTheme("light")}>▣</button>
                    </div>
                  </div>
                  <button className="logout" onClick={() => setProfileOpen(false)}><span>⇥</span>Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="dashboard">
          <div className="page-heading">
            <div className="heading-icon">☷</div><div><h1>Resumen</h1><p>Estado actual de tu inventario y operación comercial.</p></div>
            <div className="heading-controls">
              <select aria-label="Rango de fechas" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option>01 Sep 2026 - 30 Sep 2026</option><option>Este mes</option><option>Últimos 30 días</option><option>Este año</option>
              </select>
              <select aria-label="Filtrar almacén" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option>Todos los almacenes</option><option>Almacén Principal</option><option>Almacén Surco</option><option>Almacén Secundario</option>
              </select>
              <button className="primary-button" onClick={() => setOperationOpen(true)}><span>＋</span> Nueva operación <span className="down">⌄</span></button>
            </div>
          </div>

          <div className="metric-grid">
            <Metric icon="◇" label="Productos activos" value="248" trend="12%" tone="blue" />
            <Metric icon="🛒" label="Ventas del mes" value="S/ 48,320" trend="18%" tone="green" />
            <Metric icon="🚚" label="Compras del mes" value="S/ 21,450" trend="5%" tone="purple" />
            <Metric icon="▤" label="Stock disponible" value="1,042 un." trend="6%" tone="blue" down />
          </div>

          <div className="middle-grid">
            <section className="panel activity-panel">
              <PanelHeading title="Actividad reciente" subtitle="Últimos movimientos registrados en el sistema." action="Ver todos →" />
              <div className="table-wrap"><table><thead><tr>{["Fecha y hora", "Tipo", "Producto", "Cantidad", "Origen / Destino", "Usuario"].map(x => <th key={x}>{x}</th>)}</tr></thead>
                <tbody>{recentActivity.map((row, i) => <tr key={i}><td>{row[0]}</td><td><span className={`badge ${row[6]}`}>{row[1]}</span></td><td>{row[2]}</td><td className={row[3].startsWith("-") ? "negative" : "positive"}>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td></tr>)}</tbody></table></div>
            </section>
            <section className="panel low-stock-panel">
              <PanelHeading title="Productos con stock bajo" subtitle="Requieren atención inmediata." action="Ver todos →" />
              <div className="stock-list">{lowStock.map((item, i) => <div className="stock-row" key={i}><span className="product-thumb">{item[0]}</span><div className="stock-name"><b>{item[1]}</b><small>{item[2]}</small></div><div className="stock-count"><b>{item[3]}</b><small>{item[4]}</small></div><span className="row-arrow">›</span></div>)}</div>
            </section>
          </div>

          <section className="panel quick-panel">
            <PanelHeading title="Acciones rápidas" subtitle="Accede a las operaciones más comunes." />
            <div className="quick-actions">
              {[["◇", "Nuevo producto", "blue"], ["🛒", "Registrar venta", "green"], ["🚚", "Nueva compra", "purple"], ["▱", "Ajuste de stock", "orange"], ["▤", "Nueva cotización", "blue"], ["▣", "Registrar gasto", "pink"], ["▥", "Inventario físico", "teal"], ["▥", "Ver reportes", "slate"]].map(([icon, label, tone]) => <button key={label} className="quick-action"><span className={`tile-icon ${tone}`}>{icon}</span>{label}</button>)}
            </div>
          </section>

          <div className="bottom-grid">
            <section className="panel data-panel"><PanelHeading title="Productos más vendidos" subtitle="En el período seleccionado." action="Ver todos →" />
              <table><thead><tr>{["#", "Producto", "SKU", "Ventas", "Ingresos"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{bestSellers.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
            </section>
            <section className="panel data-panel"><PanelHeading title="Últimas ventas" action="Ver todas →" />
              <table><thead><tr>{["N°", "Cliente", "Ítems", "Total", "Estado"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{recentSales.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><span className={`status ${r[5]}`}>{r[4]}</span></td></tr>)}</tbody></table>
            </section>
            <section className="panel data-panel"><PanelHeading title="Últimas compras" action="Ver todas →" />
              <table><thead><tr>{["N°", "Proveedor", "Ítems", "Total", "Estado"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{recentPurchases.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><span className={`status ${r[5]}`}>{r[4]}</span></td></tr>)}</tbody></table>
            </section>
          </div>
        </section>
      </main>

      {operationOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOperationOpen(false); }}>
        <section className="operation-modal" role="dialog" aria-modal="true" aria-labelledby="operation-title">
          <header className="modal-heading"><span className="modal-plus">＋</span><div><h2 id="operation-title">Nueva operación</h2><p>Selecciona el tipo de operación que deseas registrar.</p></div><button className="modal-close" onClick={() => setOperationOpen(false)} aria-label="Cerrar">×</button></header>
          <div className="operation-grid">{operations.map((op) => <button className="operation-card" key={op.title} onClick={() => setOperationOpen(false)}><span className={`operation-icon ${op.tone}`}>{op.icon}</span><b>{op.title}</b><p>{op.description}</p><span className="operation-arrow">›</span></button>)}</div>
        </section>
      </div>}
    </div>
  );
}

function Metric({ icon, label, value, trend, tone, down }) {
  return <section className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={down ? "trend-down" : "trend-up"}>{down ? "↓" : "↑"} {trend} <em>vs. mes anterior</em></small></div><span className={`sparkline ${down ? "falling" : ""}`}>⌁</span></section>;
}

function PanelHeading({ title, subtitle, action }) {
  return <div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="text-action">{action}</button>}</div>;
}

function navIcon(item) {
  const icons = { Resumen: "▣", Productos: "◇", Categorías: "▱", Ubicaciones: "♧", Movimientos: "⇄", Clientes: "♙", Cotizaciones: "▤", Ventas: "▣", "Pedidos web": "▣", Compras: "🛒", Proveedores: "♙", Precios: "♧", "Paquetes / Kits": "▣", Promociones: "◇", Liquidaciones: "▤", Catálogos: "▤", Caja: "▣", Gastos: "▤", Contabilidad: "▥", Reportes: "▥", Configuración: "⚙" };
  return icons[item] || "•";
}

const styles = `
*{box-sizing:border-box}
.inventi-app{--bg:#f6f9fd;--surface:#fff;--surface-soft:#f4f7fb;--line:#e3eaf4;--text:#17233e;--muted:#71809e;--blue:#1765ed;display:flex;min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px}
.inventi-app button,.inventi-app select,.inventi-app input{font:inherit}
.inventi-app button{cursor:pointer}
.sidebar{width:224px;flex:0 0 224px;background:#f8fbff;border-right:1px solid #e4ebf5;display:flex;flex-direction:column;padding:14px 15px 16px;min-height:100vh}
.brand{display:flex;align-items:center;gap:10px;height:42px;margin:0 4px 20px}.brand-mark{width:30px;height:32px;display:grid;place-items:center;background:#1765ed;color:#fff;font-size:26px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}.brand strong{font-size:20px;letter-spacing:-.7px;color:#101a2e}.brand strong span{font-size:11px;background:#e8f0ff;color:#1765ed;padding:4px 8px;border-radius:7px;vertical-align:middle;margin-left:4px}.brand small{display:block;font-size:10px;color:#63738e;margin-top:2px}
.sidebar nav{flex:1}.nav-group{padding:0 0 10px;margin-bottom:8px;border-bottom:1px solid #e5ebf3}.nav-group:last-child{border:0}.nav-item{width:100%;height:35px;display:flex;align-items:center;gap:12px;padding:0 11px;border:0;border-radius:7px;background:transparent;color:#24324d;text-align:left;margin:1px 0;font-size:13px}.nav-item.active{background:#e6efff;color:#075be8;font-weight:600}.nav-icon{width:17px;text-align:center;font-size:17px;color:#526481}.nav-item.active .nav-icon{color:#1765ed}.nav-chevron{margin-left:auto;color:#64748b}
.plan-card{padding:12px;background:#fff;border:1px solid #e4ebf5;border-radius:10px;margin-top:16px}.plan-heading{display:flex;align-items:center;gap:9px}.crown{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:#f0eaff;color:#7044ec;font-size:21px}.plan-heading b{display:block;font-size:12px}.plan-heading small,.plan-card>small{display:block;color:#71809e;font-size:11px;margin-top:2px}.progress{height:6px;background:#e6edf7;border-radius:9px;margin:12px 0 8px;overflow:hidden}.progress i{display:block;width:40%;height:100%;background:#1765ed;border-radius:9px}.plan-card a{display:block;color:#075be8;text-decoration:none;margin-top:10px;font-size:11px}
.main-area{min-width:0;flex:1}.topbar{height:57px;display:flex;align-items:center;justify-content:space-between;padding:0 25px;background:rgba(255,255,255,.78);border-bottom:1px solid #e4ebf5;position:relative;z-index:5}.global-search{height:36px;width:min(620px,58%);display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e0e7f1;border-radius:9px;padding:0 12px;color:#61718f}.global-search>span{font-size:23px}.global-search input{border:0;outline:0;flex:1;min-width:0;background:transparent;color:var(--text)}.global-search kbd{border:1px solid #e1e7f0;background:#f8fafc;border-radius:4px;padding:3px 5px;font-size:10px}.top-actions{display:flex;align-items:center;gap:17px}.icon-button{position:relative;border:0;background:transparent;color:#243554;font-size:22px;width:28px;height:32px}.notification i{position:absolute;width:7px;height:7px;border-radius:50%;background:#ef4444;right:2px;top:3px;border:1px solid white}.profile-wrap{position:relative}.profile-trigger{display:flex;align-items:center;gap:9px;border:0;background:transparent;padding:2px 0 2px 5px;color:#18243d;text-align:left}.avatar{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#17294e;color:white;font-size:14px;font-weight:600;flex:0 0 auto}.profile-short b,.profile-short small{display:block}.profile-short b{font-size:12px}.profile-short small{font-size:11px;color:#71809e;margin-top:2px}.chevron{margin-left:16px;color:#60708d}
.profile-menu{position:absolute;right:-8px;top:47px;width:278px;background:#fff;border:1px solid #e3eaf4;border-radius:12px;box-shadow:0 14px 45px rgba(27,46,80,.17);padding:15px 14px 11px;z-index:30}.profile-menu:before{content:"";position:absolute;right:17px;top:-7px;width:13px;height:13px;background:#fff;border-left:1px solid #e3eaf4;border-top:1px solid #e3eaf4;transform:rotate(45deg)}.profile-summary{display:flex;gap:12px;align-items:center;padding:1px 4px 14px;border-bottom:1px solid #e9eef5}.avatar-large{width:48px;height:48px;font-size:18px}.profile-summary b,.profile-summary span,.profile-summary small{display:block}.profile-summary b{font-size:14px}.profile-summary span:not(.avatar){font-size:12px;color:#4d5d78;margin-top:3px}.profile-summary small{font-size:11px;color:#8390a7;margin-top:3px}.profile-warehouse{display:flex;align-items:center;gap:11px;padding:13px 3px;border-bottom:1px solid #e9eef5}.warehouse-icon{width:34px;height:34px;display:grid;place-items:center;background:#f1f5fb;border-radius:8px;color:#405675;font-size:18px}.warehouse-field{flex:1;min-width:0}.warehouse-field label{display:block;font-size:11px;color:#62718b;margin-bottom:5px}.warehouse-field select{width:100%;height:30px;border:1px solid #e1e8f2;border-radius:6px;background:#f5f8fc;color:#243553;padding:0 7px;font-size:11px;outline:0}.menu-links{padding:7px 0;border-bottom:1px solid #e9eef5}.menu-links button{height:36px;width:100%;display:flex;align-items:center;gap:12px;border:0;background:transparent;text-align:left;color:#263550;padding:0 5px;font-size:12px;border-radius:6px}.menu-links button:hover{background:#f4f7fb}.menu-links button>span{width:18px;text-align:center;color:#425675;font-size:17px}.menu-links em{font-style:normal;margin-left:auto;background:#ef4444;color:white;border-radius:12px;font-size:10px;min-width:19px;text-align:center;padding:3px}.external{margin-left:auto;color:#60708d;font-weight:400}.theme-row{display:flex;align-items:center;gap:9px;padding:13px 3px;border-bottom:1px solid #e9eef5}.theme-row>span{color:#536582;font-size:17px}.theme-row>b{font-size:12px;font-weight:500;white-space:nowrap}.theme-options{display:flex;gap:3px;margin-left:auto}.theme-options button{width:31px;height:29px;border:1px solid transparent;border-radius:6px;background:transparent;color:#61718b;font-size:17px}.theme-options button.selected{border-color:#8eb4ff;color:#1765ed;background:#f4f8ff}.logout{height:42px;width:100%;display:flex;align-items:center;gap:12px;border:0;background:transparent;color:#e11d48;padding:0 5px;text-align:left;font-size:12px}.logout span{font-size:19px}
.dashboard{padding:18px 18px 25px}.page-heading{display:flex;align-items:center;gap:13px;margin-bottom:21px;min-height:48px}.heading-icon{width:34px;height:36px;border-radius:7px;background:#e8f1ff;color:#1765ed;display:grid;place-items:center;font-size:21px}.page-heading h1{font-size:26px;line-height:1.1;letter-spacing:-.8px;margin:0;color:#101827}.page-heading p{font-size:12px;color:#74819c;margin:4px 0 0}.heading-controls{display:flex;align-items:center;gap:10px;margin-left:auto}.heading-controls select{height:38px;max-width:190px;border:1px solid #e1e8f2;border-radius:8px;background:#fff;color:#273754;padding:0 11px;font-size:11px}.primary-button{height:38px;border:0;border-radius:8px;background:#17294e;color:#fff;padding:0 14px;display:flex;align-items:center;gap:7px;font-size:12px;white-space:nowrap}.primary-button>span:first-child{font-size:19px}.primary-button .down{margin-left:8px}
.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:13px}.metric-card{min-height:94px;background:var(--surface);border:1px solid var(--line);border-radius:9px;display:flex;align-items:center;gap:13px;padding:14px 16px;position:relative;overflow:hidden}.metric-icon{width:45px;height:45px;display:grid;place-items:center;border-radius:12px;font-size:23px;flex:0 0 auto}.metric-icon.blue,.tile-icon.blue{background:#eaf3ff;color:#1765ed}.metric-icon.green,.tile-icon.green{background:#e5f9f1;color:#08a978}.metric-icon.purple,.tile-icon.purple{background:#f2eaff;color:#7c3aed}.metric-copy{display:flex;flex-direction:column;min-width:0}.metric-copy>span{font-size:11px;color:#5c6b86}.metric-copy strong{font-size:23px;letter-spacing:-.6px;margin-top:5px;color:#101827;white-space:nowrap}.metric-copy small{font-size:11px;color:#08a978;margin-top:2px;white-space:nowrap}.metric-copy small em{font-style:normal;color:#8490a8;margin-left:4px;font-size:10px}.metric-copy .trend-down{color:#ef4444}.sparkline{margin-left:auto;color:#2474f4;font-size:34px;align-self:center;transform:rotate(-10deg)}.sparkline.falling{color:#ef476f;transform:rotate(12deg)}
.middle-grid{display:grid;grid-template-columns:minmax(0,1.95fr) minmax(300px,1fr);gap:12px;margin-bottom:12px}.panel{background:var(--surface);border:1px solid var(--line);border-radius:9px;min-width:0;overflow:hidden}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:13px 15px 9px}.panel-heading h3{font-size:14px;font-weight:650;letter-spacing:-.2px;margin:0;color:#17233a}.panel-heading p{font-size:11px;color:#7a88a2;margin:3px 0 0}.text-action{border:0;background:transparent;color:#1765ed;font-size:11px;white-space:nowrap;padding:2px 0}.table-wrap{overflow-x:auto;padding:0 12px 12px}.inventi-app table{width:100%;border-collapse:collapse;text-align:left;font-size:11px;white-space:nowrap}.inventi-app th{font-size:10px;font-weight:500;color:#61718e;background:#f6f8fc;padding:9px 8px}.inventi-app td{padding:9px 8px;border-bottom:1px solid #edf1f6;color:#586986}.inventi-app tbody tr:last-child td{border-bottom:0}.badge,.status{display:inline-flex;align-items:center;justify-content:center;border-radius:7px;padding:5px 8px;font-size:10px;line-height:1}.badge.red{background:#fff0f2;color:#e11d48}.badge.green,.status.green{background:#dff8ed;color:#079669}.badge.purple{background:#f0e8ff;color:#7c3aed}.badge.blue,.status.blue{background:#e8f1ff;color:#1765ed}.badge.orange,.status.orange{background:#fff3d9;color:#c68108}.negative{color:#e11d48!important}.positive{color:#08a978!important}
.stock-list{padding:0 13px 7px}.stock-row{display:flex;align-items:center;gap:10px;min-height:47px;border-top:1px solid #edf1f6}.product-thumb{width:34px;height:34px;display:grid;place-items:center;background:#f4f7fb;border-radius:7px;font-size:20px;flex:0 0 auto}.stock-name{min-width:0;flex:1}.stock-name b,.stock-name small{display:block;overflow:hidden;text-overflow:ellipsis}.stock-name b{font-size:11px;font-weight:550;color:#33415b}.stock-name small{font-size:10px;color:#8390a8;margin-top:3px}.stock-count{text-align:right;white-space:nowrap}.stock-count b,.stock-count small{display:block}.stock-count b{font-size:11px;color:#e11d48;font-weight:600}.stock-count small{font-size:10px;color:#e11d48;margin-top:3px}.row-arrow{font-size:22px;color:#7e8da7}
.quick-panel{margin-bottom:12px;padding-bottom:12px}.quick-panel .panel-heading{padding-bottom:8px}.quick-actions{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;padding:0 13px}.quick-action{display:flex;align-items:center;gap:8px;min-width:0;height:54px;border:1px solid #e5ebf4;border-radius:8px;background:#fff;padding:7px 8px;color:#42516b;text-align:left;font-size:10px;white-space:nowrap}.tile-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:8px;font-size:19px;flex:0 0 auto}.tile-icon.orange,.operation-icon.orange{background:#fff2e7;color:#f97316}.tile-icon.pink,.operation-icon.pink{background:#ffebf3;color:#e11d72}.tile-icon.teal,.operation-icon.teal{background:#e4faf7;color:#0daca6}.tile-icon.slate,.operation-icon.slate{background:#edf2f9;color:#40577c}
.bottom-grid{display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:12px}.data-panel .panel-heading{padding-bottom:9px}.data-panel table{font-size:10px}.data-panel th{padding:8px 7px}.data-panel td{padding:8px 7px}.status{font-size:9px;padding:5px 7px}
.modal-backdrop{position:fixed;inset:0;background:rgba(23,39,67,.42);backdrop-filter:blur(1.5px);display:grid;place-items:center;padding:20px;z-index:100}.operation-modal{width:min(710px,100%);background:#fff;border:1px solid #e2e9f3;border-radius:13px;box-shadow:0 24px 80px rgba(15,30,60,.2);padding:22px 23px 24px}.modal-heading{display:flex;align-items:center;gap:14px;margin-bottom:21px}.modal-plus{width:49px;height:49px;border-radius:11px;background:#eaf3ff;color:#1765ed;display:grid;place-items:center;font-size:31px}.modal-heading h2{font-size:21px;letter-spacing:-.5px;margin:0;color:#1a2d59}.modal-heading p{font-size:12px;color:#7887a2;margin:4px 0 0}.modal-close{margin-left:auto;align-self:flex-start;border:0;background:transparent;color:#7786a0;font-size:25px;line-height:1;padding:0 0 0 10px}.operation-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.operation-card{min-height:165px;position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;border:1px solid #e3eaf4;border-radius:10px;background:#fff;padding:15px 14px;color:#17233e;transition:border-color .15s,box-shadow .15s}.operation-card:hover{border-color:#9bbcff;box-shadow:0 5px 18px rgba(23,101,237,.08)}.operation-icon{width:47px;height:47px;border-radius:12px;display:grid;place-items:center;font-size:24px;margin-bottom:11px}.operation-icon.green{background:#e4f9f1;color:#08a978}.operation-icon.purple{background:#f2eaff;color:#7c3aed}.operation-icon.blue{background:#eaf3ff;color:#1765ed}.operation-card>b{font-size:13px;font-weight:650}.operation-card p{font-size:11px;line-height:1.5;color:#74819b;margin:6px 0 14px}.operation-arrow{position:absolute;right:12px;bottom:12px;color:#526b94;font-size:22px}
.inventi-dark{--bg:#101827;--surface:#172235;--surface-soft:#1d2b40;--line:#2b3a50;--text:#e8eef8;color:#e8eef8}.inventi-dark .sidebar,.inventi-dark .topbar{background:#131e30;border-color:#2b3a50}.inventi-dark .brand strong,.inventi-dark .page-heading h1,.inventi-dark .metric-copy strong,.inventi-dark .panel-heading h3{color:#eef4ff}.inventi-dark .nav-item,.inventi-dark .profile-trigger,.inventi-dark .metric-copy>span,.inventi-dark .inventi-app td{color:#c0cce0}.inventi-dark .metric-card,.inventi-dark .panel,.inventi-dark .plan-card{background:#172235;border-color:#2b3a50}.inventi-dark .inventi-app th,.inventi-dark .quick-action,.inventi-dark .global-search,.inventi-dark .heading-controls select{background:#1d2b40;color:#cbd7e8;border-color:#2b3a50}.inventi-dark .profile-menu,.inventi-dark .operation-modal{background:#172235;border-color:#2b3a50}.inventi-dark .profile-menu:before{background:#172235;border-color:#2b3a50}.inventi-dark .profile-summary b,.inventi-dark .menu-links button,.inventi-dark .theme-row>b,.inventi-dark .operation-card{color:#e8eef8}.inventi-dark .menu-links button:hover,.inventi-dark .operation-card{background:#1b2940}.inventi-dark .warehouse-field select{background:#1d2b40;color:#d9e4f4;border-color:#35445b}.inventi-dark .operation-card{border-color:#35445b}
@media(max-width:1200px){.sidebar{width:200px;flex-basis:200px}.quick-actions{grid-template-columns:repeat(4,minmax(0,1fr))}.bottom-grid{grid-template-columns:1fr 1fr}.bottom-grid .data-panel:first-child{grid-column:1/-1}.heading-controls select{max-width:155px}.metric-card{padding:12px}.metric-copy strong{font-size:20px}}
@media(max-width:850px){.sidebar{width:66px;flex-basis:66px;padding:12px 8px}.brand{justify-content:center;margin:0 0 20px}.brand>div:last-child,.nav-item>span:not(.nav-icon),.plan-card{display:none}.nav-item{justify-content:center;padding:0}.nav-icon{font-size:18px}.nav-group{padding-bottom:8px}.topbar{padding:0 13px}.dashboard{padding:15px 12px}.page-heading{flex-wrap:wrap}.heading-controls{width:100%;margin-left:0}.heading-controls select{flex:1;max-width:none}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.middle-grid{grid-template-columns:1fr}.bottom-grid{grid-template-columns:1fr}.bottom-grid .data-panel:first-child{grid-column:auto}.quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.global-search{width:52%}.profile-short{display:none}.profile-trigger .chevron{margin-left:2px}.operation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.operation-card{min-height:145px}}
@media(max-width:520px){.sidebar{display:none}.topbar{height:55px}.global-search{width:60%;padding:0 8px}.global-search kbd{display:none}.top-actions{gap:7px}.profile-menu{right:-3px;width:min(278px,calc(100vw - 20px))}.page-heading h1{font-size:23px}.heading-controls{flex-wrap:wrap}.heading-controls select{min-width:0;width:100%;flex:1 1 100%}.primary-button{width:100%;justify-content:center}.metric-grid{gap:8px}.metric-card{gap:8px;padding:10px}.metric-icon{width:36px;height:36px}.metric-copy strong{font-size:17px}.metric-copy small em{display:block;margin:2px 0 0}.sparkline{display:none}.quick-actions{grid-template-columns:1fr 1fr}.quick-action{font-size:10px}.operation-modal{padding:17px}.operation-grid{gap:9px}.operation-card{padding:11px;min-height:155px}.modal-heading h2{font-size:19px}.modal-plus{width:42px;height:42px}}
`;

