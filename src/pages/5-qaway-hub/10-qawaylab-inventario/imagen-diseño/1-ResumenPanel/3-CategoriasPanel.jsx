import React, { useMemo, useState, useRef, useEffect } from "react";

/**
 * CategoriasPanel.jsx
 * Panel de categorías para Inveti Pro.
 * Componente autónomo con datos de demostración y estilos encapsulados.
 * Uso: import CategoriasPanel from "./CategoriasPanel"; <CategoriasPanel />
 * Para producción, sustituye initialCategories por datos de tu API/Supabase.
 */

const initialCategories = [
  { id: 1, name: "Alimentos", description: "Productos de consumo humano.", products: 24, status: "Activa", created: "12 Sep 2026", updated: "25 Sep 2026, 14:30", icon: "🍴", color: "#F59E0B", parent: "", related: ["Bebidas", "Snacks", "Productos secos"], stock: 20, noStock: 1, lowStock: 3 },
  { id: 2, name: "Mascotas", description: "Alimentos y accesorios para mascotas.", products: 42, status: "Activa", created: "10 Sep 2026", updated: "24 Sep 2026, 11:15", icon: "🐾", color: "#F97316", parent: "", related: ["Perros", "Gatos"], stock: 36, noStock: 2, lowStock: 4 },
  { id: 3, name: "Veterinaria", description: "Productos veterinarios y de cuidado animal.", products: 28, status: "Activa", created: "08 Sep 2026", updated: "23 Sep 2026, 16:20", icon: "♧", color: "#EF4444", parent: "", related: ["Medicamentos", "Higiene"], stock: 23, noStock: 1, lowStock: 4 },
  { id: 4, name: "Higiene y Limpieza", description: "Productos de limpieza y desinfección.", products: 18, status: "Activa", created: "05 Sep 2026", updated: "22 Sep 2026, 10:45", icon: "💧", color: "#1684F8", parent: "", related: ["Limpieza", "Desinfección"], stock: 15, noStock: 1, lowStock: 2 },
  { id: 5, name: "Accesorios", description: "Accesorios y complementos.", products: 15, status: "Activa", created: "04 Sep 2026", updated: "21 Sep 2026, 09:30", icon: "🔧", color: "#64748B", parent: "", related: [], stock: 13, noStock: 0, lowStock: 2 },
  { id: 6, name: "Salud y Bienestar", description: "Suplementos y productos de cuidado.", products: 12, status: "Activa", created: "01 Sep 2026", updated: "20 Sep 2026, 18:10", icon: "♡", color: "#EF4444", parent: "", related: ["Vitaminas", "Cuidado personal"], stock: 10, noStock: 0, lowStock: 2 },
  { id: 7, name: "Juguetes", description: "Juguetes y entretenimiento.", products: 10, status: "Activa", created: "28 Ago 2026", updated: "19 Sep 2026, 12:05", icon: "🦴", color: "#F97316", parent: "", related: [], stock: 9, noStock: 0, lowStock: 1 },
  { id: 8, name: "Ropa y Textiles", description: "Ropa, camas y textiles.", products: 8, status: "Activa", created: "25 Ago 2026", updated: "18 Sep 2026, 14:40", icon: "♧", color: "#7C3AED", parent: "", related: [], stock: 7, noStock: 0, lowStock: 1 },
  { id: 9, name: "Electrónicos", description: "Equipos y accesorios electrónicos.", products: 5, status: "Activa", created: "20 Ago 2026", updated: "17 Sep 2026, 09:15", icon: "▣", color: "#475569", parent: "", related: [], stock: 4, noStock: 0, lowStock: 1 },
  { id: 10, name: "Otros", description: "Productos varios.", products: 3, status: "Activa", created: "18 Ago 2026", updated: "15 Sep 2026, 14:20", icon: "•••", color: "#64748B", parent: "", related: [], stock: 0, noStock: 3, lowStock: 0 },
  { id: 11, name: "Bebidas", description: "Bebidas frías y calientes.", products: 22, status: "Activa", created: "15 Ago 2026", updated: "14 Sep 2026, 12:00", icon: "☕", color: "#A16207", parent: "Alimentos", related: [], stock: 21, noStock: 0, lowStock: 1 },
  { id: 12, name: "Snacks", description: "Snacks y aperitivos.", products: 14, status: "Activa", created: "12 Ago 2026", updated: "13 Sep 2026, 10:30", icon: "◇", color: "#F59E0B", parent: "Alimentos", related: [], stock: 13, noStock: 0, lowStock: 1 },
  { id: 13, name: "Productos secos", description: "Granos, semillas y productos secos.", products: 9, status: "Activa", created: "10 Ago 2026", updated: "12 Sep 2026, 15:20", icon: "▦", color: "#A16207", parent: "Alimentos", related: [], stock: 8, noStock: 0, lowStock: 1 },
  { id: 14, name: "Perros", description: "Productos para perros.", products: 20, status: "Activa", created: "08 Ago 2026", updated: "11 Sep 2026, 10:00", icon: "🐾", color: "#F97316", parent: "Mascotas", related: [], stock: 18, noStock: 0, lowStock: 2 },
  { id: 15, name: "Gatos", description: "Productos para gatos.", products: 22, status: "Activa", created: "06 Ago 2026", updated: "10 Sep 2026, 11:30", icon: "🐈", color: "#F97316", parent: "Mascotas", related: [], stock: 18, noStock: 1, lowStock: 3 },
  { id: 16, name: "Medicamentos", description: "Medicamentos y tratamientos veterinarios.", products: 12, status: "Activa", created: "04 Ago 2026", updated: "09 Sep 2026, 09:20", icon: "✚", color: "#EF4444", parent: "Veterinaria", related: [], stock: 10, noStock: 0, lowStock: 2 },
  { id: 17, name: "Promocionales", description: "Productos de temporada y promoción.", products: 0, status: "Inactiva", created: "02 Ago 2026", updated: "08 Sep 2026, 12:15", icon: "☆", color: "#8B5CF6", parent: "", related: [], stock: 0, noStock: 0, lowStock: 0 },
  { id: 18, name: "Sin clasificar", description: "Categoría pendiente de clasificación.", products: 0, status: "Inactiva", created: "01 Ago 2026", updated: "07 Sep 2026, 08:45", icon: "•••", color: "#94A3B8", parent: "", related: [], stock: 0, noStock: 0, lowStock: 0 },
];

const categoryIcons = ["🍴", "🐾", "♧", "💧", "🔧", "♡", "🦴", "♧", "▣", "•••", "☕", "◇"];
const palette = ["#1684F8", "#F97316", "#EF4444", "#10B981", "#8B5CF6", "#F59E0B", "#94A3B8"];
const css = `
.cat-root{--blue:#2165ed;--ink:#17233b;--muted:#71809e;--line:#e5ebf4;--green:#059669;--red:#e11d48;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#f7f9fc;min-height:100vh;font-size:14px}
.cat-root *{box-sizing:border-box}.cat-layout{display:flex;min-height:100vh}.cat-main{min-width:0;flex:1}.cat-content{padding:24px 20px;max-width:1800px;margin:auto}.cat-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}.cat-heading-icon{width:44px;height:44px;border-radius:10px;background:#eaf2ff;color:var(--blue);display:grid;place-items:center;font-size:22px}.cat-heading h1{font-size:29px;letter-spacing:-.8px;margin:0 0 2px;color:#111b2d}.cat-heading p{margin:0;color:var(--muted)}.cat-heading-actions{margin-left:auto;display:flex;gap:10px;align-items:center}.cat-btn{border:1px solid var(--line);background:#fff;color:#34415b;border-radius:8px;padding:10px 14px;display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}.cat-btn:hover{border-color:#b8c9e6;background:#f9fbff}.cat-btn.primary{background:var(--blue);border-color:var(--blue);color:#fff}.cat-btn.small{padding:7px 10px;font-size:12px}.cat-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:13px}.cat-metric{background:#fff;border:1px solid var(--line);border-radius:11px;padding:17px 15px;display:flex;align-items:center;gap:14px;min-width:0;box-shadow:0 2px 5px #203b6505}.cat-metric-icon{width:52px;height:52px;flex-shrink:0;border-radius:13px;display:grid;place-items:center;font-size:23px;background:#eaf2ff;color:#2165ed}.cat-metric-icon.green{background:#e5faf2;color:#059669}.cat-metric-icon.red{background:#fff0f2;color:#e11d48}.cat-metric-icon.purple{background:#f3e8ff;color:#7c3aed}.cat-metric-label{font-size:13px;color:#53627d;margin-bottom:8px}.cat-metric-value{font-size:27px;font-weight:750;letter-spacing:-.5px;color:#111b2d;white-space:nowrap}.cat-metric-note{font-size:12px;color:var(--muted);margin-top:1px}.cat-up{color:#059669;font-weight:650}.cat-toolbar{display:flex;align-items:center;gap:12px;padding:14px;background:#fff;border:1px solid var(--line);border-radius:10px;margin-bottom:15px;flex-wrap:wrap}.cat-search{height:38px;display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:8px;padding:0 11px;flex:1;min-width:210px;max-width:435px;background:#fbfcfe;color:#61718e}.cat-search input{border:0;outline:0;background:transparent;width:100%;font:inherit;color:var(--ink)}.cat-select{height:38px;border:1px solid var(--line);border-radius:8px;padding:0 12px;background:#fff;color:#34415b;font:inherit;display:flex;align-items:center;gap:8px}.cat-toolbar-spacer{flex:1}.cat-table-card{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:visible}.cat-table-scroll{overflow-x:auto}.cat-table{width:100%;border-collapse:collapse;min-width:900px}.cat-table th{font-size:13px;font-weight:650;color:#34415b;background:#fbfcfe;padding:14px 12px;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}.cat-table td{padding:11px 12px;border-bottom:1px solid #e9eef6;color:#52627f;white-space:nowrap}.cat-table tbody tr:hover{background:#f8fbff}.cat-table tbody tr.selected{background:#f0f6ff}.cat-table th:first-child,.cat-table td:first-child{width:48px;text-align:center}.cat-category-cell{display:flex;align-items:center;gap:13px;color:#253653;font-weight:550}.cat-icon-box{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;font-size:20px;flex-shrink:0}.cat-status{display:inline-flex;align-items:center;padding:5px 10px;border-radius:7px;font-size:12px;font-weight:600;background:#def8ed;color:#059669}.cat-status.inactive{background:#f1f4f8;color:#748198}.cat-status.empty{background:#fee8eb;color:#dc2626}.cat-actions{display:flex;justify-content:flex-end;gap:8px}.cat-icon-btn{width:37px;height:37px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#344b70;display:grid;place-items:center;font-size:18px;cursor:pointer}.cat-icon-btn:hover{border-color:#9dbbfa;color:var(--blue);background:#f8fbff}.cat-action-wrap{position:relative}.cat-dropdown{position:absolute;right:0;top:42px;z-index:20;width:185px;background:#fff;border:1px solid var(--line);border-radius:9px;padding:6px;box-shadow:0 12px 28px #1a31551c}.cat-dropdown button{display:flex;align-items:center;gap:10px;width:100%;border:0;background:#fff;padding:10px;border-radius:6px;text-align:left;color:#34415b;font:inherit;cursor:pointer}.cat-dropdown button:hover{background:#f2f6fc}.cat-dropdown button.danger{color:#dc2626}.cat-pagination{display:flex;align-items:center;gap:9px;padding:18px 16px;color:var(--muted)}.cat-pagination .grow{flex:1}.cat-pagination select{border:1px solid var(--line);border-radius:7px;padding:8px;background:white;color:#34415b}.cat-page{width:36px;height:36px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#34415b;cursor:pointer}.cat-page.active{background:var(--blue);border-color:var(--blue);color:white}.cat-overlay{position:fixed;inset:0;background:#14233b66;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}.cat-modal{width:min(740px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:13px;box-shadow:0 25px 70px #10234430}.cat-modal-head{display:flex;align-items:center;gap:15px;padding:20px 25px;border-bottom:1px solid var(--line)}.cat-modal-head .badge{width:56px;height:56px;border-radius:12px;background:#eaf2ff;color:var(--blue);display:grid;place-items:center;font-size:25px}.cat-modal-head h2{margin:0;font-size:22px;letter-spacing:-.5px}.cat-modal-head p{margin:4px 0 0;color:var(--muted)}.cat-modal-head .close{margin-left:auto}.cat-modal-body{padding:22px 25px}.cat-form-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:30px}.cat-field{display:grid;gap:7px;margin-bottom:17px}.cat-field label{font-size:13px;color:#34415b;font-weight:650}.cat-field input,.cat-field select,.cat-field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:11px 12px;font:inherit;outline-color:#9ab9ff;background:#fff;color:var(--ink)}.cat-field textarea{min-height:102px;resize:vertical}.cat-counter{text-align:right;color:var(--muted);font-size:12px;margin-top:-4px}.cat-choice-icons{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:8px 0 19px}.cat-choice-icon{height:46px;border:1px solid transparent;border-radius:9px;display:grid;place-items:center;font-size:23px;cursor:pointer}.cat-choice-icon.active{border:1.5px solid var(--blue);box-shadow:0 0 0 2px #e7efff}.cat-colors{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0 20px}.cat-color{width:26px;height:26px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 1px #dce4ef;cursor:pointer}.cat-color.active{box-shadow:0 0 0 2px var(--blue)}.cat-modal-foot{padding:15px 25px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:10px}.cat-detail{position:fixed;z-index:45;right:0;top:0;bottom:0;width:min(430px,100%);background:#fff;box-shadow:-15px 0 50px #13284b20;overflow:auto}.cat-detail-head{padding:28px 24px 18px;border-bottom:1px solid var(--line);position:relative}.cat-detail-close{position:absolute;right:15px;top:14px}.cat-detail-title{display:flex;align-items:center;gap:15px;padding-right:25px}.cat-detail-title .cat-icon-box{width:62px;height:62px;font-size:30px}.cat-detail-title h2{margin:0 0 8px;font-size:23px;letter-spacing:-.5px;color:#111b2d}.cat-detail-title p{margin:0;color:var(--muted);line-height:1.5}.cat-detail-tabs{display:flex;gap:4px;padding:0 18px;border-bottom:1px solid var(--line);overflow-x:auto}.cat-detail-tabs button{padding:14px 12px;border:0;border-bottom:2px solid transparent;background:transparent;color:#64728b;font:inherit;cursor:pointer;white-space:nowrap}.cat-detail-tabs button.active{color:var(--blue);border-color:var(--blue);font-weight:650}.cat-detail-content{padding:18px}.cat-detail-box{border:1px solid var(--line);border-radius:10px;padding:15px;margin-bottom:14px}.cat-detail-box h3{margin:0 0 14px;font-size:15px;display:flex;align-items:center;gap:9px}.cat-kv{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eff2f7;font-size:12px}.cat-kv:last-child{border-bottom:0}.cat-kv span{color:var(--muted)}.cat-kv b{text-align:right;font-weight:600;color:#34415b}.cat-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cat-stat{border:1px solid var(--line);border-radius:9px;padding:13px}.cat-stat small{display:block;color:var(--muted);font-size:11px;margin-bottom:7px}.cat-stat b{font-size:22px;color:#17233b}.cat-chips{display:flex;gap:7px;flex-wrap:wrap}.cat-chip{background:#eaf2ff;color:#1c60d8;border-radius:6px;padding:6px 10px;font-size:12px}.cat-mini-table{width:100%;border-collapse:collapse;font-size:12px}.cat-mini-table th,.cat-mini-table td{text-align:left;padding:10px 4px;border-bottom:1px solid var(--line)}.cat-mini-table th{color:var(--muted);font-weight:600}.cat-toast{position:fixed;bottom:20px;right:20px;z-index:100;background:#14213c;color:#fff;padding:12px 18px;border-radius:9px;box-shadow:0 8px 25px #0e1e3b33}
@media(max-width:1100px){.cat-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.cat-form-grid{gap:18px}}
@media(max-width:800px){.cat-content{padding:16px 12px}.cat-heading h1{font-size:25px}.cat-heading-actions{width:100%;margin-left:0}.cat-heading-actions .cat-btn{flex:1;justify-content:center}.cat-form-grid{grid-template-columns:1fr;gap:0}.cat-modal-body{padding:16px}.cat-modal-head,.cat-modal-foot{padding:16px}.cat-detail{width:100%}.cat-pagination{flex-wrap:wrap}.cat-pagination .grow{flex-basis:100%}}
@media(max-width:480px){.cat-metrics{grid-template-columns:1fr}.cat-heading-actions{flex-wrap:wrap}.cat-heading-actions .cat-btn{flex:auto}.cat-toolbar{gap:8px}.cat-search{max-width:none;flex-basis:100%}.cat-select{flex:1}.cat-choice-icons{grid-template-columns:repeat(5,1fr)}}
`;

const fmt = n => new Intl.NumberFormat("es-PE").format(n);
const iconBg = color => ({ background: `${color}18`, color });
function Icon({ children }) { return <span aria-hidden="true" style={{display:"inline-grid",placeItems:"center",minWidth:18}}>{children}</span>; }

export default function CategoriasPanel() {
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailTab, setDetailTab] = useState("Resumen");
  const [moreFilters, setMoreFilters] = useState(false);
  const [hasProducts, setHasProducts] = useState("Todos");
  const [form, setForm] = useState({ name:"", description:"", icon:"🍴", color:"#1684F8", status:"Activa", parent:"" });
  const [toast, setToast] = useState("");
  const actionsMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setMenuId(null);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const showToast = msg => { setToast(msg); window.setTimeout(() => setToast(""), 2600); };
  const totalProducts = categories.reduce((s,c)=>s+c.products,0);
  const withProducts = categories.filter(c=>c.products>0).length;
  const noProducts = categories.filter(c=>c.products===0).length;
  const filtered = useMemo(() => {
    const q=query.trim().toLowerCase();
    let rows=categories.filter(c=>(!q || `${c.name} ${c.description} ${c.parent}`.toLowerCase().includes(q)) &&
      (statusFilter==="Todas" || c.status===statusFilter) &&
      (hasProducts==="Todos" || (hasProducts==="Con productos" && c.products>0) || (hasProducts==="Sin productos" && c.products===0)));
    rows=[...rows].sort((a,b)=> sort==="name-desc" ? b.name.localeCompare(a.name,"es") : sort==="products-desc" ? b.products-a.products : sort==="products-asc" ? a.products-b.products : a.name.localeCompare(b.name,"es"));
    return rows;
  },[categories,query,statusFilter,sort,hasProducts]);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const rows=filtered.slice((page-1)*pageSize,page*pageSize);
  const resetForm = () => setForm({name:"",description:"",icon:"🍴",color:"#1684F8",status:"Activa",parent:""});
  const openCreate = () => { setEditing(null); resetForm(); setModal(true); setMenuId(null); };
  const openEdit = c => { setEditing(c); setForm({name:c.name,description:c.description,icon:c.icon,color:c.color,status:c.status,parent:c.parent||""}); setModal(true); setMenuId(null); };
  const saveCategory = e => {
    e.preventDefault();
    const name=form.name.trim();
    if(!name){showToast("Escribe el nombre de la categoría");return;}
    if(categories.some(c=>c.name.toLowerCase()===name.toLowerCase() && c.id!==editing?.id)){showToast("Ya existe una categoría con ese nombre");return;}
    if(editing){
      const updated={...editing,...form,updated:"27 Sep 2026, 09:00"};
      setCategories(prev=>prev.map(c=>c.id===editing.id?updated:c));
      if(detail?.id===editing.id)setDetail(updated);
      showToast("Categoría actualizada");
    }else{
      const created={id:Date.now(),...form,products:0,created:"27 Sep 2026",updated:"27 Sep 2026, 09:00",related:[],stock:0,noStock:0,lowStock:0};
      setCategories(prev=>[created,...prev]);setPage(1);showToast("Categoría creada");
    }
    setModal(false);
  };
  const removeCategory = c => {
    if(c.products>0){showToast("No se puede eliminar: la categoría tiene productos asociados");setMenuId(null);return;}
    if(window.confirm(`¿Eliminar la categoría «${c.name}»?`)){
      setCategories(prev=>prev.filter(x=>x.id!==c.id));setSelectedIds(prev=>prev.filter(id=>id!==c.id));if(detail?.id===c.id)setDetail(null);showToast("Categoría eliminada");
    }
    setMenuId(null);
  };
  const toggleAll = checked => setSelectedIds(checked ? rows.map(c=>c.id) : []);
  const toggleOne = id => setSelectedIds(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  return <div className="cat-root">
     <style>{css}</style>
     <style>{`
       /* Unifica la superficie del tablero con el estándar visual de Productos. */
       .cat-root {
         --blue: #ff4b0b;
         --line: #e5ebf4;
         --muted: #71809e;
         background: #f7f9fc;
         font-size: 14px;
       }
       .cat-content { padding: 22px 20px; max-width: 1800px; }
       .cat-heading { gap: 14px; margin-bottom: 22px; }
       .cat-heading-icon {
         width: 38px;
         height: 38px;
         border-radius: 10px;
         background: #f4f4f5;
         border: 1px solid #e4e4e7;
         color: #ff4b0b;
         font-size: 20px;
       }
       .cat-heading h1 {
         font-size: 28px;
         font-weight: 700;
         letter-spacing: -0.8px;
         color: #111b2d;
       }
       .cat-metrics { gap: 12px; margin-bottom: 14px; }
       .cat-metric {
         border: 1px solid #e4e4e7;
         border-radius: 12px;
         padding: 14px 16px;
         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
       }
       .cat-metric-icon {
         width: 28px;
         height: 28px;
         border-radius: 8px;
         font-size: 16px;
         background: #f4f4f5;
         color: #52525b;
       }
       .cat-metric-icon.green,
       .cat-metric-icon.red,
       .cat-metric-icon.purple {
         background: #f4f4f5;
         color: #52525b;
       }
       .cat-metric-label { font-size: 12px; font-weight: 600; color: #52525b; }
       .cat-metric-value { font-size: 26px; font-weight: 800; letter-spacing: -0.6px; color: #0f172a; }
       .cat-metric-note { font-size: 11px; font-weight: 500; color: #71717a; }
       .cat-toolbar {
         position: sticky;
         top: 0;
         z-index: 20;
         padding: 12px;
         gap: 10px;
         border: 1px solid #e5ebf4;
         border-radius: 11px;
         background: rgba(255, 255, 255, 0.96);
         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
         backdrop-filter: blur(8px);
       }
       .cat-search {
         height: 38px;
         min-width: 220px;
         max-width: 480px;
         border: 1px solid #e5ebf4;
         border-radius: 8px;
         background: #f9fbfd;
       }
       .cat-select {
         height: 38px;
         border: 1px solid #e2e8f0;
         border-radius: 8px;
         background: #fff;
         color: #334155;
         font-size: 13px;
         font-weight: 500;
       }
       .cat-table-card {
         background: #fff;
         border: 1px solid #e5ebf4;
         border-radius: 12px;
         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
       }
       .cat-table { min-width: 940px; border-collapse: collapse; }
       .cat-table th {
         background: #f8fafc;
         padding: 15px 16px;
         border-bottom: 1px solid #e2e8f0;
         font-size: 13px;
         font-weight: 700;
         letter-spacing: 0.2px;
         color: #475569;
       }
       .cat-table td {
         padding: 16px;
         border-bottom: 1px solid #f1f5f9;
         font-size: 14.5px;
         color: #334155;
       }
       .cat-table tbody tr:nth-child(even) { background: #fafafa; }
       .cat-table tbody tr:hover { background: #f8fafc; }
       .cat-table tbody tr.selected { background: rgba(255, 75, 11, 0.05); }
       .cat-icon-box {
         border-radius: 10px;
         border: 1px solid #e2e8f0;
       }
       .cat-pagination { border-top: 1px solid #f1f5f9; }
     `}</style>
    <div className="cat-layout">
      <div className="cat-main">
        <div className="cat-content">
          <div className="cat-heading">
            <div className="cat-heading-icon">▱</div>
            <div><h1>Categorías</h1><p>Organiza tus productos en categorías para una mejor gestión del inventario.</p></div>
            <div className="cat-heading-actions"><button className="cat-btn primary" onClick={openCreate}>＋ Nueva categoría</button></div>
          </div>
          <div className="cat-metrics">
            <div className="cat-metric"><div className="cat-metric-icon">⬡</div><div><div className="cat-metric-label">Total de categorías</div><div className="cat-metric-value">{categories.length}</div><div className="cat-metric-note"><span className="cat-up">↑ 12%</span>　vs. mes anterior</div></div></div>
            <div className="cat-metric"><div className="cat-metric-icon green">◇</div><div><div className="cat-metric-label">Categorías con productos</div><div className="cat-metric-value">{withProducts}</div><div className="cat-metric-note">{categories.length?Math.round(withProducts/categories.length*100):0}% del total</div></div></div>
            <div className="cat-metric"><div className="cat-metric-icon red">◇</div><div><div className="cat-metric-label">Sin productos</div><div className="cat-metric-value">{noProducts}</div><div className="cat-metric-note">{categories.length?Math.round(noProducts/categories.length*100):0}% del total</div></div></div>
            <div className="cat-metric"><div className="cat-metric-icon purple">⬡</div><div><div className="cat-metric-label">Total de productos</div><div className="cat-metric-value">{fmt(totalProducts)}</div><div className="cat-metric-note"><span className="cat-up">↑ 12%</span>　vs. mes anterior</div></div></div>
          </div>
          <div className="cat-toolbar">
            <div className="cat-search"><Icon>⌕</Icon><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Buscar categoría..."/></div>
            <select className="cat-select" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}><option value="Todas">▣　Estado: Todas</option><option>Activa</option><option>Inactiva</option></select>
            <select className="cat-select" value={sort} onChange={e=>setSort(e.target.value)}><option value="name-asc">▤　Ordenar por: Nombre (A–Z)</option><option value="name-desc">Ordenar por: Nombre (Z–A)</option><option value="products-desc">Ordenar por: Más productos</option><option value="products-asc">Ordenar por: Menos productos</option></select>
            <div className="cat-toolbar-spacer"/>
            <button className="cat-btn" onClick={()=>setMoreFilters(v=>!v)}>⚑　Más filtros {moreFilters?"⌃":" "}</button>
            {moreFilters&&<select className="cat-select" value={hasProducts} onChange={e=>{setHasProducts(e.target.value);setPage(1)}}><option>Todos</option><option>Con productos</option><option>Sin productos</option></select>}
          </div>
          <div className="cat-table-card">
            <div className="cat-table-scroll"><table className="cat-table">
              <thead><tr><th><input type="checkbox" aria-label="Seleccionar todos" checked={rows.length>0&&rows.every(c=>selectedIds.includes(c.id))} onChange={e=>toggleAll(e.target.checked)}/></th><th>Categoría　↕</th><th>Descripción　↕</th><th>Productos　↕</th><th>Estado　↕</th><th>Fecha de creación　↕</th><th>Última actualización　↕</th><th style={{textAlign:"right"}}>Acciones</th></tr></thead>
              <tbody>{rows.map(c=><tr key={c.id} className={selectedIds.includes(c.id)?"selected":""}>
                <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>toggleOne(c.id)} aria-label={`Seleccionar ${c.name}`}/></td>
                <td><div className="cat-category-cell"><div className="cat-icon-box" style={iconBg(c.color)}>{c.icon}</div><button style={{border:0,background:"transparent",padding:0,color:"inherit",font:"inherit",cursor:"pointer"}} onClick={()=>{setDetail(c);setDetailTab("Resumen")}}>{c.name}</button></div></td>
                <td title={c.description}>{c.description.length>47?c.description.slice(0,47)+"…":c.description}</td><td>{fmt(c.products)}</td><td><span className={`cat-status ${c.status==="Inactiva"?"inactive":c.products===0?"empty":""}`}>{c.products===0&&c.status==="Activa"?"Sin productos":c.status}</span></td><td>{c.created}</td><td>{c.updated}</td>
                <td><div className="cat-actions" ref={menuId === c.id ? actionsMenuRef : null}><button className="cat-icon-btn" title="Editar" onClick={()=>openEdit(c)}>✎</button><div className="cat-action-wrap"><button className="cat-icon-btn" title="Más acciones" onClick={()=>setMenuId(menuId===c.id?null:c.id)}>•••</button>{menuId===c.id&&<div className="cat-dropdown"><button onClick={()=>{setDetail(c);setDetailTab("Resumen");setMenuId(null)}}>◉　Ver detalle</button><button onClick={()=>openEdit(c)}>✎　Editar categoría</button><button onClick={()=>{setForm({name:c.name,description:c.description,icon:c.icon,color:c.color,status:c.status,parent:c.parent||""});setEditing(null);setModal(true);setMenuId(null);showToast("Edita el nombre para duplicar")}}>▣　Duplicar</button><button className="danger" onClick={()=>removeCategory(c)}>♜　Eliminar</button></div>}</div></div></td>
              </tr>)}</tbody>
            </table></div>
            <div className="cat-pagination"><span>Mostrando {filtered.length?((page-1)*pageSize+1):0} a {Math.min(page*pageSize,filtered.length)} de {fmt(filtered.length)} categorías</span><div className="grow"/><span>Filas por página</span><select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option>10</option><option>20</option><option>50</option></select><button className="cat-page" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>{Array.from({length:Math.min(pages,5)},(_,i)=><button key={i} className={`cat-page ${page===i+1?"active":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button className="cat-page" disabled={page===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>›</button></div>
          </div>
        </div>
      </div>
    </div>

    {modal&&<div className="cat-overlay" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="cat-modal" onSubmit={saveCategory}>
      <div className="cat-modal-head"><div className="badge">▱</div><div><h2>{editing?"Editar categoría":"Nueva categoría"}</h2><p>{editing?"Actualiza la información de la categoría.":"Crea una nueva categoría para organizar tus productos."}</p></div><button type="button" className="cat-icon-btn close" onClick={()=>setModal(false)}>×</button></div>
      <div className="cat-modal-body"><div className="cat-form-grid"><div>
        <div className="cat-field"><label>Nombre de la categoría *</label><input autoFocus required maxLength={80} placeholder="Ej. Alimentos, Mascotas, Electrónicos" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div className="cat-field"><label>Descripción</label><textarea maxLength={200} placeholder="Describe brevemente el tipo de productos que incluirá esta categoría." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><div className="cat-counter">{form.description.length}/200</div></div>
        <div className="cat-field"><label>Estado</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Activa</option><option>Inactiva</option></select><small style={{color:"var(--muted)",lineHeight:1.5}}>Las categorías inactivas no se mostrarán al seleccionar productos.</small></div>
      </div><div>
        <div className="cat-field"><label>Ícono</label><div className="cat-choice-icons">{categoryIcons.map((ic,i)=><button type="button" key={i} className={`cat-choice-icon ${form.icon===ic?"active":""}`} style={iconBg(palette[i%palette.length])} onClick={()=>setForm({...form,icon:ic,color:palette[i%palette.length]})}>{ic}</button>)}</div></div>
        <div className="cat-field"><label>Color</label><div className="cat-colors">{palette.map(color=><button type="button" key={color} aria-label={`Color ${color}`} className={`cat-color ${form.color===color?"active":""}`} style={{background:color}} onClick={()=>setForm({...form,color})}/>)}</div></div>
        <div className="cat-field"><label>Categoría padre (opcional)</label><select value={form.parent} onChange={e=>setForm({...form,parent:e.target.value})}><option value="">Sin categoría padre</option>{categories.filter(c=>c.id!==editing?.id).map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select><small style={{color:"var(--muted)",lineHeight:1.5}}>Útil para crear subcategorías dentro de una categoría existente.</small></div>
      </div></div></div>
      <div className="cat-modal-foot"><button type="button" className="cat-btn" onClick={()=>setModal(false)}>Cancelar</button><button className="cat-btn primary" type="submit">{editing?"Guardar cambios":"Guardar categoría"}</button></div>
    </form></div>}

    {detail&&<><div className="cat-overlay" style={{background:"#14233b66",padding:0}} onClick={()=>setDetail(null)}></div><aside className="cat-detail">
      <div className="cat-detail-head"><button className="cat-icon-btn cat-detail-close" onClick={()=>setDetail(null)}>×</button><div className="cat-detail-title"><div className="cat-icon-box" style={iconBg(detail.color)}>{detail.icon}</div><div><h2>{detail.name} <span className={`cat-status ${detail.status==="Inactiva"?"inactive":""}`}>{detail.status}</span></h2><p>{detail.description}</p></div></div></div>
      <div className="cat-detail-tabs">{["Resumen",`Productos (${detail.products})`,"Precios","Más datos"].map(t=><button key={t} className={detailTab===t?"active":""} onClick={()=>setDetailTab(t)}>{t}</button>)}</div>
      <div className="cat-detail-content">
        {detailTab==="Resumen"&&<>
          <section className="cat-detail-box"><h3>▣　Información general <button className="cat-btn small" style={{marginLeft:"auto"}} onClick={()=>openEdit(detail)}>✎ Editar</button></h3>{[["Nombre",detail.name],["Descripción",detail.description||"—"],["Ícono",detail.icon],["Color",<span><i style={{display:"inline-block",width:13,height:13,borderRadius:"50%",background:detail.color,verticalAlign:"middle",marginRight:7}}/>{detail.color}</span>],["Estado",detail.status],["Categoría padre",detail.parent||"Sin categoría padre"],["Fecha de creación",detail.created],["Última actualización",detail.updated]].map(([k,v])=><div className="cat-kv" key={k}><span>{k}</span><b>{v}</b></div>)}</section>
          <section className="cat-detail-box"><h3>▣　Estadísticas</h3><div className="cat-stat-grid"><div className="cat-stat"><small>Total de productos</small><b>{detail.products}</b></div><div className="cat-stat"><small>Con stock</small><b style={{color:"#059669"}}>{detail.stock}</b><small>{detail.products?Math.round(detail.stock/detail.products*100):0}% del total</small></div><div className="cat-stat"><small>Sin stock</small><b style={{color:"#e11d48"}}>{detail.noStock}</b><small>{detail.products?Math.round(detail.noStock/detail.products*100):0}% del total</small></div><div className="cat-stat"><small>Stock bajo</small><b style={{color:"#d97706"}}>{detail.lowStock}</b><small>{detail.products?Math.round(detail.lowStock/detail.products*100):0}% del total</small></div></div></section>
          <section className="cat-detail-box"><h3>▣　Categorías relacionadas <button className="cat-btn small" style={{marginLeft:"auto"}} onClick={()=>showToast("Edición de relaciones disponible al conectar el backend")}>✎ Editar</button></h3><div className="cat-chips">{(detail.related||[]).length?detail.related.map(x=><span className="cat-chip" key={x}>{x}</span>):<span style={{color:"var(--muted)",fontSize:12}}>Sin categorías relacionadas</span>}</div></section>
        </>}
        {detailTab.startsWith("Productos")&&<section className="cat-detail-box"><h3>Productos de la categoría</h3>{detail.products===0?<p style={{color:"var(--muted)"}}>Esta categoría todavía no tiene productos.</p>:<><p style={{color:"var(--muted)",fontSize:12}}>Vista de ejemplo. Los productos se mostrarán al conectar el catálogo.</p><table className="cat-mini-table"><thead><tr><th>Producto</th><th>Stock</th><th>Estado</th></tr></thead><tbody>{["Producto de ejemplo A","Producto de ejemplo B","Producto de ejemplo C"].slice(0,Math.min(3,detail.products)).map((n,i)=><tr key={n}><td>{n}</td><td>{[18,4,0][i]} un.</td><td>{["Disponible","Stock bajo","Sin stock"][i]}</td></tr>)}</tbody></table></>}</section>}
        {detailTab==="Precios"&&<section className="cat-detail-box"><h3>Resumen de precios</h3><p style={{color:"var(--muted)",fontSize:12}}>Los precios agregados se mostrarán cuando la categoría esté conectada con los datos reales de productos.</p><div className="cat-kv"><span>Productos</span><b>{detail.products}</b></div><div className="cat-kv"><span>Precio promedio</span><b>—</b></div><div className="cat-kv"><span>Valor del inventario</span><b>—</b></div></section>}
        {detailTab==="Más datos"&&<section className="cat-detail-box"><h3>Datos adicionales</h3><div className="cat-kv"><span>ID de categoría</span><b>{detail.id}</b></div><div className="cat-kv"><span>Categoría padre</span><b>{detail.parent||"—"}</b></div><div className="cat-kv"><span>Subcategorías</span><b>{categories.filter(c=>c.parent===detail.name).length}</b></div><div className="cat-kv"><span>Estado</span><b>{detail.status}</b></div></section>}
      </div>
    </aside></>}

    {toast&&<div className="cat-toast">{toast}</div>}
  </div>;
}
