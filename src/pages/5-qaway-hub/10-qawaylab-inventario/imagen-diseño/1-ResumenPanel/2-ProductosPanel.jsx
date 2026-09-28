import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Camera,
  Plus,
  Filter,
  List,
  Grid3X3,
  SlidersHorizontal,
  Check,
  Search,
  X,
  ChevronDown,
  ArrowLeft,
  Trash2,
  Edit,
} from "lucide-react";

/**
 * ProductosPanel.jsx
 * Panel de productos de Inveti Pro (interfaz de demostración).
 * React + CSS inline; no requiere librerías de iconos ni componentes externos.
 *
 * Uso:
 *   import ProductosPanel from "./ProductosPanel";
 *   <ProductosPanel />
 *
 * Los datos incluidos son de ejemplo. Conecta las acciones y los datos a tu API/BD
 * cuando integres el panel en tu aplicación.
 */

const initialProducts = [
  { id: 1, name: "Café Premium 250g", detail: "Grano molido", sku: "CAF-250", category: "Alimentos", stock: 32, price: 12.5, status: "Disponible", location: "Almacén Principal", image: "☕", barcode: "7750123456789", brand: "Café Premium", presentation: "250 g", unit: "un.", weight: "0.25 kg", dimensions: "12 × 6 × 20 cm", salePrice: 15, wholesale: 13.5, minPrice: 10, description: "Café tostado y molido de alta calidad. Presentación de 250 g, ideal para consumo en hogar u oficina. Blend de granos seleccionados.", warehouse: [{ name: "Almacén Principal", stock: 20, min: 10 }, { name: "Tienda Sur", stock: 8, min: 5 }, { name: "Tienda Online", stock: 4, min: 3 }] },
  { id: 2, name: "Alimento Perro Adulto 10kg", detail: "Nutrición completa", sku: "DOG-AD-10", category: "Mascotas", stock: 5, price: 85, status: "Stock bajo", location: "Tienda Sur", image: "🟠", barcode: "7750123456790", brand: "NutriPet", presentation: "10 kg", unit: "un.", weight: "10 kg", dimensions: "40 × 25 × 15 cm", salePrice: 95, wholesale: 90, minPrice: 80, description: "Alimento balanceado para perros adultos.", warehouse: [{ name: "Tienda Sur", stock: 5, min: 10 }] },
  { id: 3, name: "Shampoo Veterinario 500ml", detail: "Higiene para mascotas", sku: "VET-SH-500", category: "Mascotas", stock: 0, price: 28, status: "Sin stock", location: "Almacén Principal", image: "🧴", barcode: "7750123456791", brand: "VetCare", presentation: "500 ml", unit: "un.", weight: "0.5 kg", dimensions: "8 × 8 × 22 cm", salePrice: 34, wholesale: 30, minPrice: 25, description: "Shampoo veterinario para la higiene regular de mascotas.", warehouse: [{ name: "Almacén Principal", stock: 0, min: 15 }] },
  { id: 4, name: "Arena Sanitaria 5kg", detail: "Control de olores", sku: "CAT-ARE-5", category: "Mascotas", stock: 18, price: 15, status: "Disponible", location: "Almacén Principal", image: "🟤", barcode: "7750123456792", brand: "Michi", presentation: "5 kg", unit: "un.", weight: "5 kg", dimensions: "30 × 20 × 8 cm", salePrice: 19, wholesale: 17, minPrice: 13, description: "Arena sanitaria para gatos.", warehouse: [{ name: "Almacén Principal", stock: 18, min: 25 }] },
  { id: 5, name: "Collar Antipulgas", detail: "Protección para mascotas", sku: "VET-COL-01", category: "Mascotas", stock: 7, price: 22, status: "Stock bajo", location: "Tienda Sur", image: "🐾", barcode: "7750123456793", brand: "VetCare", presentation: "1 unidad", unit: "un.", weight: "0.1 kg", dimensions: "15 × 12 × 2 cm", salePrice: 28, wholesale: 25, minPrice: 20, description: "Collar antipulgas para mascotas.", warehouse: [{ name: "Tienda Sur", stock: 7, min: 40 }] },
  { id: 6, name: "Juguete Dental", detail: "Accesorio para perros", sku: "VET-JUG-01", category: "Mascotas", stock: 45, price: 18, status: "Disponible", location: "Almacén Principal", image: "🦴", barcode: "7750123456794", brand: "PetFun", presentation: "1 unidad", unit: "un.", weight: "0.2 kg", dimensions: "18 × 5 × 4 cm", salePrice: 23, wholesale: 20, minPrice: 15, description: "Juguete dental para entretenimiento y cuidado oral.", warehouse: [{ name: "Almacén Principal", stock: 45, min: 10 }] },
  { id: 7, name: "Lata Alimento Gato 400g", detail: "Alimento húmedo", sku: "CAT-LAT-400", category: "Mascotas", stock: 120, price: 8.5, status: "Disponible", location: "Tienda Sur", image: "🥫", barcode: "7750123456795", brand: "Michi", presentation: "400 g", unit: "un.", weight: "0.4 kg", dimensions: "8 × 8 × 11 cm", salePrice: 11, wholesale: 9.5, minPrice: 7, description: "Alimento húmedo para gatos.", warehouse: [{ name: "Tienda Sur", stock: 120, min: 20 }] },
  { id: 8, name: "Alimento Gato Adulto 3kg", detail: "Nutrición completa", sku: "CAT-AD-3", category: "Mascotas", stock: 3, price: 42, status: "Stock bajo", location: "Almacén Principal", image: "🐈", barcode: "7750123456796", brand: "Michi", presentation: "3 kg", unit: "un.", weight: "3 kg", dimensions: "30 × 20 × 10 cm", salePrice: 49, wholesale: 45, minPrice: 38, description: "Alimento balanceado para gatos adultos.", warehouse: [{ name: "Almacén Principal", stock: 3, min: 30 }] },
  { id: 9, name: "Desparasitante 100ml", detail: "Cuidado veterinario", sku: "VET-DES-100", category: "Veterinaria", stock: 27, price: 35, status: "Disponible", location: "Almacén Principal", image: "🧪", barcode: "7750123456797", brand: "VetCare", presentation: "100 ml", unit: "un.", weight: "0.15 kg", dimensions: "6 × 6 × 14 cm", salePrice: 42, wholesale: 38, minPrice: 30, description: "Producto veterinario desparasitante.", warehouse: [{ name: "Almacén Principal", stock: 27, min: 10 }] },
  { id: 10, name: "Snack Entrenamiento 100g", detail: "Premios para perros", sku: "DOG-SNK-100", category: "Mascotas", stock: 0, price: 10, status: "Sin stock", location: "Tienda Sur", image: "🟧", barcode: "7750123456798", brand: "NutriPet", presentation: "100 g", unit: "un.", weight: "0.1 kg", dimensions: "12 × 8 × 3 cm", salePrice: 13, wholesale: 11, minPrice: 8, description: "Snack para entrenamiento canino.", warehouse: [{ name: "Tienda Sur", stock: 0, min: 10 }] },
];

const css = `
.pxp-root{--blue:#2165ed;--ink:#17233b;--muted:#71809e;--line:#e5ebf4;--soft:#f5f8fc;--green:#059669;--red:#e11d48;--amber:#d97706;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#f7f9fc;min-height:100vh;font-size:14px}
.pxp-root *{box-sizing:border-box}.pxp-layout{display:flex;min-height:100vh}.pxp-sidebar{width:220px;flex-shrink:0;background:#fff;border-right:1px solid var(--line);padding:16px 14px;display:flex;flex-direction:column;gap:10px}.pxp-brand{display:flex;align-items:center;gap:10px;padding:0 6px 18px}.pxp-logo{width:30px;height:30px;background:linear-gradient(135deg,#38a5ff,#1853d9);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);position:relative}.pxp-logo:after{content:"";position:absolute;inset:8px;background:#fff;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}.pxp-brand b{font-size:20px;letter-spacing:-.7px}.pxp-pro{font-size:11px;color:#1261e9;background:#eaf2ff;border-radius:6px;padding:3px 7px;margin-left:4px}.pxp-brand small{display:block;color:var(--muted);font-size:11px;margin-top:1px}.pxp-nav{display:grid;gap:4px}.pxp-nav button{border:0;background:transparent;color:#34415b;text-align:left;padding:10px 12px;border-radius:7px;display:flex;align-items:center;gap:12px;font:inherit;cursor:pointer}.pxp-nav button.active{background:#eaf2ff;color:#1763ed;font-weight:600}.pxp-nav .sep{height:1px;background:var(--line);margin:8px 2px}.pxp-plan{margin-top:auto;border:1px solid var(--line);border-radius:10px;padding:12px;background:#f8faff}.pxp-plan b{display:block}.pxp-plan small{color:var(--muted)}.pxp-progress{height:6px;border-radius:10px;background:#dfe7f2;margin:10px 0 7px;overflow:hidden}.pxp-progress i{display:block;width:40%;height:100%;background:var(--blue);border-radius:10px}.pxp-main{min-width:0;flex:1}.pxp-topbar{height:58px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 22px;gap:18px}.pxp-global-search{height:36px;max-width:600px;flex:1;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;gap:10px;padding:0 12px;color:var(--muted);background:#fbfcfe}.pxp-global-search input{border:0;outline:0;background:transparent;flex:1;font:inherit;min-width:0}.pxp-top-right{margin-left:auto;display:flex;align-items:center;gap:18px;color:#53627d}.pxp-avatar{width:32px;height:32px;border-radius:50%;background:#172b50;color:white;display:grid;place-items:center;font-weight:700}.pxp-content{padding:22px 20px;max-width:1800px;margin:auto}.pxp-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}.pxp-heading-icon{width:42px;height:42px;border-radius:10px;background:#eaf2ff;color:var(--blue);display:grid;place-items:center;font-size:21px}.pxp-heading h1{font-size:28px;letter-spacing:-.8px;margin:0 0 2px;color:#111b2d}.pxp-heading p{margin:0;color:var(--muted)}.pxp-heading-actions{margin-left:auto;display:flex;gap:10px;align-items:center}.pxp-btn{border:1px solid var(--line);background:#fff;color:#34415b;border-radius:8px;padding:10px 14px;display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}.pxp-btn:hover{border-color:#b8c9e6;background:#f9fbff}.pxp-btn.primary{background:var(--blue);border-color:var(--blue);color:#fff}.pxp-btn.dark{background:#14213c;border-color:#14213c;color:#fff}.pxp-btn.small{padding:7px 10px;font-size:12px}.pxp-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:12px}.pxp-metric{background:#fff;border:1px solid var(--line);border-radius:11px;padding:16px;display:flex;align-items:center;gap:13px;min-width:0;box-shadow:0 2px 5px #203b6505}.pxp-metric-icon{width:44px;height:44px;flex-shrink:0;border-radius:12px;display:grid;place-items:center;font-size:21px;background:#eaf2ff;color:#2165ed}.pxp-metric-icon.green{background:#e5faf2;color:#059669}.pxp-metric-icon.red{background:#fff0f2;color:#e11d48}.pxp-metric-icon.gray{background:#f0f3f8;color:#8793a9}.pxp-metric-label{font-size:12px;color:#53627d;margin-bottom:6px}.pxp-metric-value{font-size:23px;font-weight:750;letter-spacing:-.5px;color:#111b2d;white-space:nowrap}.pxp-metric-note{font-size:11px;color:var(--muted);margin-top:2px}.pxp-up{color:var(--green);font-weight:600}.pxp-toolbar{display:flex;align-items:center;gap:10px;padding:12px;background:#fff;border:1px solid var(--line);border-radius:11px;margin-bottom:12px;flex-wrap:wrap}.pxp-search{display:flex;align-items:center;gap:9px;flex:1;min-width:220px;max-width:480px;border:1px solid var(--line);background:#f9fbfd;border-radius:8px;padding:0 12px;height:38px;color:#7b8aa5}.pxp-search input{border:0;outline:0;background:transparent;flex:1;min-width:0;font:inherit}.pxp-select{height:38px;border:1px solid var(--line);border-radius:8px;background:#fff;padding:0 11px;color:#45536d;font:inherit;max-width:190px}.pxp-view-toggle{margin-left:auto;display:flex;gap:6px}.pxp-icon-btn{width:36px;height:36px;border:1px solid var(--line);background:#fff;border-radius:8px;color:#53627d;cursor:pointer;display:grid;place-items:center;font-size:17px}.pxp-icon-btn.selected{background:#eef4ff;border-color:#b7cdfa;color:#155de3}.pxp-table-wrap{background:#fff;border:1px solid var(--line);border-radius:11px;overflow:visible}.pxp-table-scroll{overflow-x:auto}.pxp-table{width:100%;border-collapse:collapse;min-width:920px}.pxp-table th{background:#f8fafd;color:#45536d;font-size:12px;font-weight:650;text-align:left;padding:13px 12px;border-bottom:1px solid var(--line);white-space:nowrap}.pxp-table td{padding:11px 12px;border-bottom:1px solid #edf1f7;color:#53627d;white-space:nowrap}.pxp-table tr:last-child td{border-bottom:0}.pxp-table tbody tr:hover{background:#fafcff}.pxp-check{width:16px;height:16px;accent-color:var(--blue);cursor:pointer}.pxp-product-cell{display:flex;align-items:center;gap:11px;min-width:230px}.pxp-product-thumb{width:40px;height:40px;flex-shrink:0;border-radius:8px;background:#f0f4f8;display:grid;place-items:center;font-size:22px;border:1px solid #edf1f5}.pxp-product-name{color:#34415b;font-weight:600}.pxp-product-sub{font-size:11px;color:#8996ac;margin-top:3px}.pxp-stock{font-weight:700}.pxp-stock.ok{color:#059669}.pxp-stock.low{color:#d97706}.pxp-stock.zero{color:#e11d48}.pxp-badge{display:inline-flex;align-items:center;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:600}.pxp-badge.ok{background:#e3f8ef;color:#059669}.pxp-badge.low{background:#fff4d6;color:#b77905}.pxp-badge.zero{background:#ffe7eb;color:#e11d48}.pxp-actions{display:flex;gap:6px;justify-content:flex-end;position:relative}.pxp-action-menu{position:absolute;z-index:15;right:0;top:40px;width:190px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 35px #182c4a20}.pxp-action-menu button{display:flex;width:100%;gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:10px;border-radius:6px;color:#34415b;font:inherit;cursor:pointer}.pxp-action-menu button:hover{background:#f2f6fc}.pxp-action-menu button.danger{color:#e11d48}.pxp-table-footer{display:flex;align-items:center;gap:12px;padding:14px 16px;color:#8996ac;font-size:12px;border-top:1px solid var(--line);flex-wrap:wrap}.pxp-footer-spacer{flex:1}.pxp-pagination{display:flex;gap:6px;align-items:center}.pxp-pagination button{width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#34415b;cursor:pointer}.pxp-pagination button.active{background:var(--blue);color:white;border-color:var(--blue)}.pxp-pagination button:disabled{opacity:.4;cursor:default}
.pxp-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;padding:14px}
.pxp-product-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:#fff;display:flex;flex-direction:column;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease,border-color .2s ease}
.pxp-product-card:hover{border-color:#cbd5e1;box-shadow:0 6px 18px rgba(15,23,42,.06);transform:translateY(-2px)}
.pxp-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.pxp-card-art-web{height:105px;background:#f8fafc;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;border:1px solid #f1f5f9}
.pxp-card-meta{color:#8898aa;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.pxp-card-name{font-weight:650;font-size:13px;color:#1e293b;line-height:1.3;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px}
.pxp-card-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:8px;border-top:1px dashed #edf2f7}
.pxp-card-price{font-size:13.5px;font-weight:750;color:#0f172a}
.pxp-card-actions{display:flex;gap:6px;margin-top:10px}
.pxp-card-actions .pxp-btn{flex:1;justify-content:center;padding:6px 4px;font-size:11px;font-weight:600;border-radius:6px}
.pxp-empty{padding:45px;text-align:center;color:var(--muted)}.pxp-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.45);backdrop-filter:blur(2px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px}.pxp-modal{background:#fff;border-radius:14px;width:min(900px,100%);max-height:92vh;overflow:auto;box-shadow:0 25px 80px #0c1b3533;z-index:9999}.pxp-modal-head{padding:22px 24px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px}.pxp-modal-head h2{margin:0;font-size:22px;letter-spacing:-.5px}.pxp-modal-head p{margin:4px 0 0;color:var(--muted)}.pxp-modal-head .close{margin-left:auto}.pxp-modal-body{padding:22px 24px}.pxp-stepper{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px}.pxp-step{display:flex;align-items:center;gap:9px;padding:12px 8px;border-bottom:2px solid var(--line);color:var(--muted);font-size:12px}.pxp-step span{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#eef1f6;color:#56647d;font-weight:700}.pxp-step.active{border-color:var(--blue);color:#1e2d48;font-weight:650}.pxp-step.active span,.pxp-step.done span{background:var(--blue);color:white}.pxp-import-columns{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.pxp-panel{border:1px solid var(--line);border-radius:10px;padding:16px}.pxp-panel h3{margin:0 0 6px;font-size:16px}.pxp-muted{color:var(--muted);font-size:12px}.pxp-dropzone{border:1.5px dashed #b7c9e8;border-radius:9px;background:#f8fbff;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;text-align:center;padding:18px;margin-top:12px}.pxp-dropzone input{max-width:100%;font-size:12px}.pxp-info{background:#eef5ff;border-radius:9px;padding:16px;color:#344a70;line-height:1.7}.pxp-link{color:#1763ed;background:none;border:0;cursor:pointer;font:inherit;padding:8px 0}.pxp-modal-foot{padding:16px 24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:10px}.pxp-field{display:grid;gap:6px;margin-bottom:13px}.pxp-field label{font-size:12px;color:#53627d;font-weight:600}.pxp-field input,.pxp-field select,.pxp-field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:10px 11px;font:inherit;outline-color:#9ab9ff;background:white}.pxp-field textarea{min-height:90px;resize:vertical}.pxp-map-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}.pxp-preview-table{width:100%;border-collapse:collapse;font-size:12px}.pxp-preview-table th,.pxp-preview-table td{padding:10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}.pxp-preview-scroll{overflow:auto}.pxp-detail{position:fixed;z-index:9999;right:0;top:0;bottom:0;width:min(580px,92vw);background:#fff;box-shadow:-15px 0 50px rgba(15,23,42,0.18);overflow-y:auto;animation:pxpSlideIn .25s cubic-bezier(.16,1,.3,1)}@keyframes pxpSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}.pxp-detail-head{padding:26px 24px 18px;border-bottom:1px solid var(--line)}.pxp-detail-close{position:absolute;right:16px;top:16px;z-index:10;width:36px;height:36px;border-radius:8px;background:#f1f5f9;border:1px solid var(--line);color:#475569;display:grid;place-items:center;font-size:20px;cursor:pointer;transition:all .2s ease}.pxp-detail-close:hover{background:#e2e8f0;color:#0f172a}.pxp-detail-product{display:flex;gap:18px;align-items:center;padding-right:55px}.pxp-detail-art{width:105px;height:105px;border-radius:12px;background:#f1f5f9;display:grid;place-items:center;font-size:50px;flex-shrink:0}.pxp-detail-title{font-size:24px;font-weight:750;letter-spacing:-.6px;margin:0 0 8px}.pxp-detail-tabs{display:flex;gap:3px;overflow-x:auto;padding:0 18px;border-bottom:1px solid var(--line)}.pxp-detail-tabs button{padding:14px 11px;border:0;border-bottom:2px solid transparent;background:transparent;color:#64728b;font:inherit;cursor:pointer;white-space:nowrap}.pxp-detail-tabs button.active{color:var(--blue);border-color:var(--blue);font-weight:650}.pxp-detail-content{padding:20px 22px}.pxp-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pxp-detail-box{border:1px solid var(--line);border-radius:10px;padding:15px;min-width:0}.pxp-detail-box h3{margin:0 0 14px;font-size:15px;display:flex;align-items:center;gap:8px}.pxp-detail-box.full{grid-column:1/-1}.pxp-kv{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #eff2f7;font-size:12px}.pxp-kv:last-child{border-bottom:0}.pxp-kv span{color:var(--muted)}.pxp-kv b{text-align:right;font-weight:600}.pxp-detail-table{width:100%;border-collapse:collapse;font-size:12px}.pxp-detail-table th,.pxp-detail-table td{text-align:left;padding:10px 5px;border-bottom:1px solid var(--line)}.pxp-detail-table th{color:var(--muted);font-weight:600}.pxp-toast{position:fixed;bottom:20px;right:20px;z-index:100;background:#14213c;color:#fff;padding:12px 18px;border-radius:9px;box-shadow:0 8px 25px #0e1e3b33}.pxp-mobile-menu{display:none}
@media(max-width:1500px){.pxp-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(max-width:1250px){.pxp-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:1150px){.pxp-sidebar{width:190px}.pxp-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.pxp-metric-value{font-size:20px}.pxp-import-columns{grid-template-columns:1fr}}
@media(max-width:990px){.pxp-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:800px){.pxp-sidebar{display:none}.pxp-content{padding:16px 12px}.pxp-topbar{padding:0 12px}.pxp-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.pxp-heading h1{font-size:24px}.pxp-heading-actions{width:100%;margin-left:0}.pxp-heading-actions .pxp-btn{flex:1;justify-content:center}.pxp-detail-grid{grid-template-columns:1fr}.pxp-detail-box.full{grid-column:auto}.pxp-detail-product{align-items:flex-start}.pxp-detail-art{width:75px;height:75px;font-size:35px}.pxp-detail-title{font-size:20px}.pxp-stepper{grid-template-columns:repeat(2,1fr)}.pxp-modal-body{padding:16px}.pxp-modal-head,.pxp-modal-foot{padding:16px}.pxp-select{max-width:calc(50% - 6px);flex:1}.pxp-view-toggle{margin-left:0}}
@media(max-width:640px){.pxp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.pxp-metrics{grid-template-columns:1fr}.pxp-heading-actions{flex-wrap:wrap}.pxp-heading-actions .pxp-btn{flex:auto}.pxp-top-right{gap:10px}.pxp-global-search{min-width:0}.pxp-step{font-size:11px}.pxp-detail-head{padding:22px 14px 16px}.pxp-detail-content{padding:14px}.pxp-detail-tabs{padding:0 8px}}
@media(max-width:420px){.pxp-grid{grid-template-columns:1fr}}
`;

function Icon({ children }) { return <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", minWidth: 18 }}>{children}</span>; }
function money(value) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(value).replace("PEN", "S/"); }
function statusClass(status) { return status === "Disponible" ? "ok" : status === "Stock bajo" ? "low" : "zero"; }

function ProductThumb({ id, size = 40 }) {
  const iconSize = Math.round(size * 0.5);
  const icons = {
    1: { bg: "#fef3c7", border: "#fde68a", color: "#b45309", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg> },
    2: { bg: "#eff6ff", border: "#dbeafe", color: "#2563eb", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.5 1 1.695-.69 4-4.5 4-5.828z"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.5 1-1.695-.69-4-4.5-4-5.828z"/><circle cx="12" cy="14" r="5"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg> },
    3: { bg: "#ecfdf5", border: "#a7f3d0", color: "#059669", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 9V3"/><path d="M14 9V3"/><path d="M7 10h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M10 14h4"/><path d="M12 12v4"/></svg> },
    4: { bg: "#eef2ff", border: "#e0e7ff", color: "#6366f1", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
    5: { bg: "#fff1f2", border: "#ffe4e6", color: "#e11d48", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3"/><path d="M12 18v3"/></svg> },
    6: { bg: "#f5f3ff", border: "#ede9fe", color: "#8b5cf6", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10c.7-.7 1.6-1 2.5-.7 1.2.4 1.8 1.7 1.5 3-.3 1.2-1.3 2-2.5 2-1 0-1.8-.7-2.5-1.4l-6.1 6.1c-.7.7-1.4 1.5-1.4 2.5 0 1.2-.8 2.2-2 2.5-1.3.3-2.6-.3-3-1.5-.3-.9 0-1.8.7-2.5l6.1-6.1c-.7-.7-1.4-1.5-1.4-2.5 0-1.2.8-2.2 2-2.5 1.3-.3 2.6.3 3 1.5.3.9 0 1.8-.7 2.5Z"/></svg> },
    7: { bg: "#ecfeff", border: "#cffafe", color: "#0891b2", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg> },
    8: { bg: "#fff7ed", border: "#ffedd5", color: "#ea580c", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-1.42 8.42.67 1.13 1 2.39 1 3.58 0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.19.33-2.45 1-3.58C4 9.42 2.18 3 3.58 2.42c1.4-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z"/></svg> },
    9: { bg: "#f5f3ff", border: "#ddd6fe", color: "#7c3aed", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 9V3"/><path d="M14 9V3"/><path d="M6 18a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-5H6v5z"/></svg> },
    10: { bg: "#fef3c7", border: "#fde68a", color: "#d97706", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h.01"/><path d="M12 16h.01"/><path d="M16 12h.01"/><path d="M12 8h.01"/></svg> }
  };
  const icon = icons[id] || { bg: "#f1f5f9", border: "#e2e8f0", color: "#475569", svg: <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg> };
  
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size > 50 ? 12 : 8,
        backgroundColor: icon.bg,
        border: `1px solid ${icon.border}`,
        color: icon.color,
        display: "grid",
        placeItems: "center",
      }}
    >
      {icon.svg}
    </div>
  );
}

const AVAILABLE_COLUMNS = [
  { key: "product", label: "Producto" },
  { key: "sku", label: "SKU" },
  { key: "barcode", label: "Cód. Barras" },
  { key: "category", label: "Categoría" },
  { key: "stock", label: "Stock" },
  { key: "price", label: "Precio base" },
  { key: "wholesale", label: "Precio mayorista" },
  { key: "status", label: "Estado" },
  { key: "location", label: "Ubicación" },
];

export default function ProductosPanel() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [stockFilter, setStockFilter] = useState("Todos");
  const [commercialStatus, setCommercialStatus] = useState("Todos");
  const [brandFilter, setBrandFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationFilter, setLocationFilter] = useState("Todos");
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "product",
    "sku",
    "category",
    "stock",
    "price",
    "status",
    "location",
  ]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState("list");
  const [menuId, setMenuId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailTab, setDetailTab] = useState("Resumen");
  const [modal, setModal] = useState("");
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importOption, setImportOption] = useState("merge");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "Mascotas", stock: 0, price: "", location: "Almacén Principal", description: "" });

  const columnPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = key => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      showToast("No hay productos para exportar");
      return;
    }
    const headers = ["ID", "Producto", "SKU", "Código de Barras", "Categoría", "Marca", "Stock", "Precio Base", "Precio Mayorista", "Estado", "Ubicación"];
    const rows = filtered.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.barcode || ''}"`,
      `"${p.category || ''}"`,
      `"${p.brand || ''}"`,
      p.stock || 0,
      p.price || 0,
      p.wholesale || p.price || 0,
      `"${p.status || ''}"`,
      `"${p.location || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventi_productos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Catálogo exportado en CSV");
  };

  const categories = useMemo(() => ["Todas", ...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => products.filter(p => {
    const q = query.toLowerCase().trim();
    const matchesQ = !q || [p.name, p.sku, p.category, p.barcode, p.brand].some(v => String(v || "").toLowerCase().includes(q));
    const matchesCat = category === "Todas" || p.category === category;
    const matchesStock = stockFilter === "Todos" || (stockFilter === "Con stock" && p.stock > 0) || (stockFilter === "Stock bajo" && p.stock > 0 && p.stock <= 10) || (stockFilter === "Sin stock" && p.stock === 0);
    const matchesComm = commercialStatus === "Todos" || p.status === commercialStatus;
    const matchesBrand = !brandFilter || (p.brand && p.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    const matchesMinPrice = !minPrice || p.price >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || p.price <= Number(maxPrice);
    const matchesLoc = locationFilter === "Todos" || p.location === locationFilter;
    return matchesQ && matchesCat && matchesStock && matchesComm && matchesBrand && matchesMinPrice && matchesMaxPrice && matchesLoc;
  }), [products, query, category, stockFilter, commercialStatus, brandFilter, minPrice, maxPrice, locationFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const showToast = msg => { setToast(msg); window.setTimeout(() => setToast(""), 2800); };
  const openNew = () => { setEditing(null); setForm({ name: "", sku: "", category: "Mascotas", stock: 0, price: "", location: "Almacén Principal", description: "" }); setModal("product"); };
  const openEdit = p => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category, stock: p.stock, price: p.price, location: p.location, description: p.description || "" }); setModal("product"); setMenuId(null); };
  const saveProduct = e => {
    e.preventDefault();
    const stock = Number(form.stock) || 0;
    const price = Number(form.price) || 0;
    const statusText = stock === 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Disponible";
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, stock, price, status: statusText } : p));
      showToast("Producto actualizado");
    } else {
      const newP = { ...form, id: Date.now(), stock, price, status: statusText, detail: "", image: "📦", barcode: "", brand: "", presentation: "", unit: "un.", weight: "", dimensions: "", salePrice: price, wholesale: price, minPrice: price, warehouse: [{ name: form.location, stock, min: 0 }] };
      setProducts(prev => [newP, ...prev]); setPage(1); showToast("Producto creado");
    }
    setModal(""); 
  };
  const handleImportFile = file => { if (!file) return; setImportFile(file); setImportStep(2); };
  const finishImport = () => { showToast(importFile ? `Archivo "${importFile.name}" listo para procesar (demo)` : "Selecciona un archivo para continuar"); setModal(""); setImportStep(1); setImportFile(null); };
  const toggleSelected = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = checked => setSelected(checked ? pageRows.map(p => p.id) : []);
  const resetImport = () => { setImportStep(1); setImportFile(null); setModal("import"); };

  if (detailProduct) {
    return (
      <div className="pxp-root" style={{ background: "#fff", minHeight: "100vh", padding: "28px 36px" }}>
        <style>{css}</style>
        <button
          onClick={() => setDetailProduct(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: 0,
            color: "#64748b",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 24,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Volver al inventario
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 1240, margin: "0 auto" }}>
          {/* Galería limpia sin iconos genéricos */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              aspectRatio: "1/1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {detailProduct.imageUrl ? (
              <img
                src={detailProduct.imageUrl}
                alt={detailProduct.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 52, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Foto del producto</div>
              </div>
            )}
          </div>

          {/* Información y métricas rápidas */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {detailProduct.sku}
              </span>
              <span className={`pxp-badge ${statusClass(detailProduct.status)}`}>
                {detailProduct.status}
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              {detailProduct.name}
            </h1>
            <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: 14, margin: "0 0 24px" }}>
              {detailProduct.description ||
                "Lleva tus habilidades al siguiente nivel con este producto."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Precio base</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{money(detailProduct.price)}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Stock</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{detailProduct.stock}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Condición</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#059669", marginTop: 4 }}>Nuevo</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Costo</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>—</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              <div>Tipo: <b style={{ color: "#1e293b" }}>{detailProduct.category}</b></div>
              <div>Marca: <b style={{ color: "#1e293b" }}>{detailProduct.brand || "—"}</b></div>
              <div>Ubicación: <b style={{ color: "#1e293b" }}>{detailProduct.location || "—"}</b></div>
              <div>Creado: <b style={{ color: "#1e293b" }}>18 set. 2026</b></div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="pxp-btn primary" onClick={() => openEdit(detailProduct)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Edit size={15} /> Editar
              </button>
              <button
                className="pxp-btn"
                style={{ color: "#e11d48", borderColor: "#fecdd3", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  if (window.confirm(`¿Eliminar "${detailProduct.name}"?`)) {
                    setProducts(prev => prev.filter(x => x.id !== detailProduct.id));
                    setDetailProduct(null);
                    showToast("Producto eliminado");
                  }
                }}
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs y contenido inferior */}
        <div style={{ maxWidth: 1240, margin: "40px auto 0", borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
          <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 24 }}>
            <button style={{ background: "none", border: 0, fontWeight: 700, color: "#ea580c", borderBottom: "2px solid #ea580c", paddingBottom: 10, cursor: "pointer", fontSize: 14 }}>
              Información
            </button>
            <button style={{ background: "none", border: 0, fontWeight: 600, color: "#64748b", cursor: "pointer", fontSize: 14 }}>
              Precios
            </button>
            <button style={{ background: "none", border: 0, fontWeight: 600, color: "#64748b", cursor: "pointer", fontSize: 14 }}>
              Historial
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Variantes</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Sin variantes</p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginTop: 24, marginBottom: 6 }}>Liquidaciones</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No está en ninguna liquidación</p>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Paquetes</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No está en ningún paquete</p>
            </div>
          </div>
        </div>

        {modal === "product" && (
          <div className="pxp-overlay" onClick={() => setModal("")}>
            <section className="pxp-modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
              <form onSubmit={saveProduct}>
                <div className="pxp-modal-head">
                  <div className="pxp-heading-icon">⬡</div>
                  <div>
                    <h2>Editar producto</h2>
                    <p>Completa la información del producto.</p>
                  </div>
                  <button type="button" className="pxp-icon-btn close" onClick={() => setModal("")}>×</button>
                </div>
                <div className="pxp-modal-body">
                  <div className="pxp-map-row">
                    <div className="pxp-field">
                      <label>Nombre del producto *</label>
                      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="pxp-field">
                      <label>SKU / Código *</label>
                      <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                    </div>
                  </div>
                  <div className="pxp-map-row">
                    <div className="pxp-field">
                      <label>Categoría</label>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {categories.filter(c => c !== "Todas").map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="pxp-field">
                      <label>Ubicación principal</label>
                      <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="pxp-map-row">
                    <div className="pxp-field">
                      <label>Precio base (S/) *</label>
                      <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="pxp-field">
                      <label>Stock inicial</label>
                      <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                    </div>
                  </div>
                  <div className="pxp-field">
                    <label>Descripción</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <div className="pxp-modal-foot">
                  <button type="button" className="pxp-btn" onClick={() => setModal("")}>Cancelar</button>
                  <button type="submit" className="pxp-btn primary">Guardar cambios</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {toast && <div className="pxp-toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="pxp-root">
      <style>{css}</style>
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            <div className="pxp-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="pxp-heading-icon">⬡</div>
                <div>
                  <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 2px", color: "#111b2d" }}>Productos</h1>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "13px" }}>{products.length} productos en tu inventario.</p>
                </div>
              </div>
              <div className="pxp-heading-actions" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button className="pxp-btn" onClick={resetImport} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <FileSpreadsheet size={15} /> Importar
                </button>
                <button className="pxp-btn" onClick={handleExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <Download size={15} /> Exportar
                </button>
                <button
                  className="pxp-btn"
                  style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7 }}
                  onClick={() => {
                    const isHub = typeof window !== "undefined" && window.location.pathname.startsWith("/hub/inventario");
                    if (window.location) {
                      window.location.href = isHub ? "/hub/inventario/captura" : "/captura";
                    }
                  }}
                >
                  <Camera size={15} /> Capturar
                </button>
                <button className="pxp-btn primary" onClick={openNew} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <Plus size={15} /> Nuevo producto <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <section className="pxp-metrics">
              <Metric icon="⬡" label="Total de productos" value={products.length.toLocaleString("es-PE")} note={<><span className="pxp-up">↑ 12%</span>　vs. mes anterior</>} />
              <Metric icon="⬡" tone="green" label="Con stock" value={products.filter(p => p.stock > 10).length.toLocaleString("es-PE")} note={`${Math.round(products.filter(p => p.stock > 0).length / Math.max(products.length, 1) * 100)}% del total`} />
              <Metric icon="⚠" tone="red" label="Stock bajo" value={products.filter(p => p.stock > 0 && p.stock <= 10).length.toLocaleString("es-PE")} note={<span style={{ color: "#e11d48" }}>{Math.round(products.filter(p => p.stock > 0 && p.stock <= 10).length / Math.max(products.length, 1) * 100)}% del total</span>} />
              <Metric icon="⬡" tone="gray" label="Sin stock" value={products.filter(p => p.stock === 0).length.toLocaleString("es-PE")} note={`${Math.round(products.filter(p => p.stock === 0).length / Math.max(products.length, 1) * 100)}% del total`} />
              <Metric icon="▤" label="Valor de inventario" value={money(inventoryValue)} note={<span className="pxp-up">↑ 9%　vs. mes anterior</span>} />
            </section>

            <div className="pxp-toolbar" style={{ position: "relative" }}>
              <div className="pxp-search"><Search size={15} style={{ color: "var(--muted)" }} /><input value={query} placeholder="Buscar por nombre, SKU o código..." onChange={e => { setQuery(e.target.value); setPage(1); }} /></div>
              
              {/* 2 Filtros Principales en la barra superior */}
              <select className="pxp-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                <option value="Todas">◉　Categoría: Todas</option>
                {categories.filter(c => c !== "Todas").map(c => <option key={c}>{c}</option>)}
              </select>

              <select className="pxp-select" value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}>
                <option value="Todos">☷　Stock: Todos</option>
                <option>Con stock</option>
                <option>Stock bajo</option>
                <option>Sin stock</option>
              </select>
              
              {/* Botón Más filtros con Icono Lucide */}
              <button
                className={`pxp-btn ${showExtraFilters ? "dark" : ""}`}
                onClick={() => setShowExtraFilters(!showExtraFilters)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Filter size={14} /> Más filtros
              </button>

              {/* Selector de Columnas / Mostrar otros datos */}
              <div style={{ position: "relative" }} ref={columnPickerRef}>
                <button
                  className={`pxp-btn ${showColumnPicker ? "dark" : ""}`}
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  title="Mostrar u ocultar columnas de datos"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <SlidersHorizontal size={14} /> Columnas
                </button>
                {showColumnPicker && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 10, zIndex: 40, boxShadow: "0 12px 35px #182c4a20" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#111b2d", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid var(--line)", textTransform: "uppercase" }}>
                      Datos / Columnas visibles
                    </div>
                    {AVAILABLE_COLUMNS.map(col => {
                      const isChecked = visibleColumns.includes(col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => toggleColumn(col.key)}
                          style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", border: 0, background: "transparent", borderRadius: 6, cursor: "pointer", fontSize: 12, color: isChecked ? "#111b2d" : "#71809e", fontWeight: isChecked ? 600 : 400, textAlign: "left" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f0f4f8"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span>{col.label}</span>
                          <span style={{ width: 16, height: 16, borderRadius: 4, border: isChecked ? "1px solid #2165ed" : "1px solid #c7d2e2", background: isChecked ? "#2165ed" : "#fff", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
                            {isChecked ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pxp-view-toggle"><button className={`pxp-icon-btn ${view === "list" ? "selected" : ""}`} onClick={() => setView("list")} title="Vista de lista"><List size={16} /></button><button className={`pxp-icon-btn ${view === "grid" ? "selected" : ""}`} onClick={() => setView("grid")} title="Vista de tarjetas"><Grid3X3 size={16} /></button></div>
            </div>

            {/* Panel Desplegable de Filtros Adicionales */}
            {showExtraFilters && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "11px", padding: "16px 20px", marginBottom: "12px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado Comercial</label>
                    <select className="pxp-select" style={{ width: "100%", maxWidth: "100%" }} value={commercialStatus} onChange={e => { setCommercialStatus(e.target.value); setPage(1); }}>
                      <option value="Todos">Todos</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Stock bajo">Stock bajo</option>
                      <option value="Sin stock">Sin stock</option>
                      <option value="Reservado">Reservado</option>
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marca</label>
                    <input style={{ width: "100%", height: 38, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "var(--ink)", background: "#fff" }} placeholder="Buscar marca..." value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Precio</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="number" placeholder="Min" style={{ width: "100%", height: 38, border: "1px solid var(--line)", borderRadius: 8, padding: "0 8px", fontSize: 13, background: "#fff" }} value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
                      <span style={{ color: "var(--muted)" }}>—</span>
                      <input type="number" placeholder="Max" style={{ width: "100%", height: 38, border: "1px solid var(--line)", borderRadius: 8, padding: "0 8px", fontSize: 13, background: "#fff" }} value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Almacén / Ubicación</label>
                    <select className="pxp-select" style={{ width: "100%", maxWidth: "100%" }} value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setPage(1); }}>
                      <option value="Todos">Todos los almacenes</option>
                      <option value="Almacén Principal">Almacén Principal</option>
                      <option value="Tienda Sur">Tienda Sur</option>
                      <option value="Tienda Online">Tienda Online</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                  <button className="pxp-btn small" onClick={() => { setCommercialStatus("Todos"); setBrandFilter(""); setMinPrice(""); setMaxPrice(""); setLocationFilter("Todos"); setShowExtraFilters(false); }}>
                    Cancelar / Limpiar
                  </button>
                  <button className="pxp-btn small" style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff", fontWeight: 700 }} onClick={() => setShowExtraFilters(false)}>
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}

            <section className="pxp-table-wrap">
              {selected.length > 0 && <div style={{ padding: "10px 16px", background: "#eef5ff", display: "flex", alignItems: "center", gap: 12, color: "#2457a6" }}><b>{selected.length} seleccionados</b><button className="pxp-btn small" onClick={() => showToast("Acción masiva pendiente de conectar")}>Acciones masivas　⌄</button><button className="pxp-link" onClick={() => setSelected([])}>Limpiar selección</button></div>}
              {view === "list" ? <div className="pxp-table-scroll"><table className="pxp-table">
                <thead><tr>
                  <th><input className="pxp-check" type="checkbox" checked={pageRows.length > 0 && pageRows.every(p => selected.includes(p.id))} onChange={e => selectAll(e.target.checked)} /></th>
                  {visibleColumns.includes("product") && <th>Producto ↕</th>}
                  {visibleColumns.includes("sku") && <th>SKU ↕</th>}
                  {visibleColumns.includes("barcode") && <th>Cód. Barras</th>}
                  {visibleColumns.includes("category") && <th>Categoría</th>}
                  {visibleColumns.includes("stock") && <th>Stock ↕</th>}
                  {visibleColumns.includes("price") && <th>Precio base</th>}
                  {visibleColumns.includes("wholesale") && <th>Precio mayorista</th>}
                  {visibleColumns.includes("status") && <th>Estado</th>}
                  {visibleColumns.includes("location") && <th>Ubicación principal</th>}
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr></thead>
                <tbody>
                  {pageRows.map(p => <tr key={p.id}>
                    <td><input className="pxp-check" type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)} /></td>
                    {visibleColumns.includes("product") && <td><div className="pxp-product-cell"><ProductThumb id={p.id} /><div><div className="pxp-product-name">{p.name}</div>{p.detail && <div className="pxp-product-sub">{p.detail}</div>}</div></div></td>}
                    {visibleColumns.includes("sku") && <td>{p.sku}</td>}
                    {visibleColumns.includes("barcode") && <td>{p.barcode || "—"}</td>}
                    {visibleColumns.includes("category") && <td>{p.category}</td>}
                    {visibleColumns.includes("stock") && <td><span className={`pxp-stock ${statusClass(p.status)}`}>{p.stock} un.</span></td>}
                    {visibleColumns.includes("price") && <td>{money(p.price)}</td>}
                    {visibleColumns.includes("wholesale") && <td>{money(p.wholesale || p.price)}</td>}
                    {visibleColumns.includes("status") && <td><span className={`pxp-badge ${statusClass(p.status)}`}>{p.status}</span></td>}
                    {visibleColumns.includes("location") && <td>{p.location}</td>}
                    <td><div className="pxp-actions"><button className="pxp-icon-btn" title="Editar" onClick={() => openEdit(p)}>✎</button><button className={`pxp-icon-btn ${menuId === p.id ? "selected" : ""}`} title="Más acciones" onClick={() => setMenuId(menuId === p.id ? null : p.id)}>···</button>
                      {menuId === p.id && <div className="pxp-action-menu">
                        <button onClick={() => { setDetailProduct(p); setDetailTab("Resumen"); setMenuId(null); }}>◉　Ver detalle</button>
                        <button onClick={() => openEdit(p)}>✎　Editar producto</button>
                        <button onClick={() => { setProducts(prev => [{ ...p, id: Date.now(), name: `${p.name} (copia)`, sku: `${p.sku}-COPY` }, ...prev]); setMenuId(null); showToast("Producto duplicado"); }}>▣　Duplicar</button>
                        <button onClick={() => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category, stock: p.stock, price: p.price, location: p.location, description: p.description || "" }); setModal("stock"); setMenuId(null); }}>▤　Ajustar stock</button>
                        <button onClick={() => { setDetailProduct(p); setDetailTab("Movimientos"); setMenuId(null); }}>⇄　Ver movimientos</button>
                        <button onClick={() => { setDetailProduct(p); setDetailTab("Precios"); setMenuId(null); }}>⌁　Historial de precios</button>
                        <button onClick={() => { setMenuId(null); showToast("No hay ventas vinculadas en esta demo"); }}>🛒　Ver en ventas</button>
                        <button onClick={() => { setMenuId(null); showToast("No hay compras vinculadas en esta demo"); }}>▣　Ver en compras</button>
                        <button className="danger" onClick={() => { if (window.confirm(`¿Eliminar "${p.name}"?`)) { setProducts(prev => prev.filter(x => x.id !== p.id)); setMenuId(null); showToast("Producto eliminado"); } }}>▤　Eliminar</button>
                      </div>}
                    </div></td>
                  </tr>)}
                  {pageRows.length === 0 && <tr><td colSpan={visibleColumns.length + 2}><div className="pxp-empty">No se encontraron productos con esos filtros.</div></td></tr>}
                </tbody>
              </table></div> : <div className="pxp-grid">{pageRows.map(p => (
                <article className="pxp-product-card" key={p.id}>
                  <div className="pxp-card-top">
                    <input className="pxp-check" type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)} />
                    <span className={`pxp-badge ${statusClass(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="pxp-card-art-web">
                    <ProductThumb id={p.id} size={48} />
                  </div>
                  <div className="pxp-card-meta">{p.sku} · {p.category}</div>
                  <div className="pxp-card-name" title={p.name}>{p.name}</div>
                  <div className="pxp-card-bottom">
                    <span className="pxp-card-price">{money(p.price)}</span>
                    <span className={`pxp-stock ${statusClass(p.status)}`}>{p.stock} un.</span>
                  </div>
                  <div className="pxp-card-actions">
                    <button className="pxp-btn small" onClick={() => { setDetailProduct(p); setDetailTab("Resumen"); }}>Ver detalle</button>
                    <button className="pxp-btn small" onClick={() => openEdit(p)}>Editar</button>
                  </div>
                </article>
              ))}{pageRows.length === 0 && <div className="pxp-empty">No se encontraron productos.</div>}</div>}
              <div className="pxp-table-footer"><span>Mostrando {filtered.length ? (page - 1) * pageSize + 1 : 0} a {Math.min(page * pageSize, filtered.length)} de {filtered.length.toLocaleString("es-PE")} productos</span><div className="pxp-footer-spacer" /><span>Filas por página</span><select className="pxp-select" style={{ height: 34, minWidth: 68 }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><div className="pxp-pagination"><button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>{Array.from({ length: Math.min(pages, 5) }, (_, i) => { const n = i + 1; return <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</button>; })}<button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button></div></div>
            </section>
          </div>
        </main>
      </div>



      {modal === "import" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" onClick={e => e.stopPropagation()}>
        <div className="pxp-modal-head"><div className="pxp-heading-icon">⇧</div><div><h2>Importar productos</h2><p>Carga productos desde un archivo Excel o CSV. Puedes actualizar existentes o solo agregar nuevos.</p></div><button className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div>
        <div className="pxp-modal-body">
          <div className="pxp-stepper">{["Cargar archivo", "Mapear campos", "Validar datos", "Importar"].map((s, i) => <div key={s} className={`pxp-step ${importStep === i + 1 ? "active" : importStep > i + 1 ? "done" : ""}`}><span>{importStep > i + 1 ? "✓" : i + 1}</span><div><b>{s}</b><div className="pxp-muted">{["Selecciona tu archivo", "Relaciona las columnas", "Revisa los registros", "Confirma y procesa"][i]}</div></div></div>)}</div>
          {importStep === 1 && <div className="pxp-import-columns"><div className="pxp-panel"><h3>1. Cargar archivo</h3><p className="pxp-muted">Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv). Tamaño máximo: 10 MB.</p><label className="pxp-dropzone"><div style={{ fontSize: 30, color: "#2165ed" }}>⇧</div><b>{importFile ? importFile.name : "Arrastra tu archivo aquí"}</b><span className="pxp-muted">o haz clic para seleccionar</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => handleImportFile(e.target.files?.[0])} /></label><button className="pxp-link" onClick={() => showToast("La plantilla de ejemplo estará disponible al conectar el módulo de archivos.")}>⇩　Descargar plantilla de ejemplo (Excel)</button></div><div className="pxp-info"><b>ⓘ　Información importante</b><ul><li>Puedes importar productos nuevos o actualizar existentes.</li><li>Usa los campos obligatorios: nombre y SKU (o código).</li><li>Si el SKU ya existe, se actualizará según la opción elegida.</li><li>Puedes incluir categorías, precios, stock y ubicaciones.</li><li>Se validarán errores antes de importar.</li></ul></div></div>}
          {importStep === 2 && <div className="pxp-panel"><h3>2. Mapear campos</h3><p className="pxp-muted">Relaciona las columnas de tu archivo con los campos del sistema.</p>{["Código → SKU (obligatorio)", "Nombre del producto → Nombre (obligatorio)", "Categoría → Categoría", "Precio → Precio base", "Stock inicial → Stock", "Ubicación → Ubicación principal", "Descripción → Descripción", "Código de barras → Código de barras"].map(row => <div className="pxp-map-row" key={row}><input value={row.split(" → ")[0]} readOnly /><select defaultValue={row.split(" → ")[1]}><option>{row.split(" → ")[1]}</option><option>Omitir columna</option><option>Descripción</option><option>Stock</option><option>Precio base</option></select></div>)}</div>}
          {importStep === 3 && <div className="pxp-panel"><h3>3. Vista previa y validación</h3><p className="pxp-muted">{importFile ? `Archivo seleccionado: ${importFile.name}` : "Vista previa de registros de ejemplo."} Revisa los campos antes de continuar.</p><div className="pxp-preview-scroll"><table className="pxp-preview-table"><thead><tr><th>#</th><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead><tbody>{products.slice(0, 5).map((p, i) => <tr key={p.id}><td>{i + 1}</td><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{p.price.toFixed(2)}</td><td>{p.stock}</td><td><span className={`pxp-badge ${statusClass(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table></div></div>}
          {importStep === 4 && <div className="pxp-info"><h3>4. Confirmar importación</h3><p>Revisa el modo de importación. La ejecución real requiere conectar el servicio de importación del backend.</p><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "merge"} onChange={() => setImportOption("merge")} /> Agregar nuevos y actualizar existentes</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "new"} onChange={() => setImportOption("new")} /> Solo agregar nuevos</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "update"} onChange={() => setImportOption("update")} /> Solo actualizar existentes</label></div>}
        </div>
        <div className="pxp-modal-foot"><button className="pxp-btn" onClick={() => importStep > 1 ? setImportStep(s => s - 1) : setModal("")}>{importStep > 1 ? "←　Anterior" : "Cancelar"}</button><button className="pxp-btn primary" onClick={() => { if (importStep < 4) { if (importStep === 1 && !importFile) { showToast("Selecciona un archivo para continuar"); return; } setImportStep(s => s + 1); } else finishImport(); }}>{importStep === 4 ? "Confirmar e importar" : "Continuar　→"}</button></div>
      </section></div>}

      {modal === "product" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}><form onSubmit={saveProduct}>
        <div className="pxp-modal-head"><div className="pxp-heading-icon">⬡</div><div><h2>{editing ? "Editar producto" : "Nuevo producto"}</h2><p>Completa la información del producto.</p></div><button type="button" className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div>
        <div className="pxp-modal-body"><div className="pxp-map-row"><div className="pxp-field"><label>Nombre del producto *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Producto nuevo" /></div><div className="pxp-field"><label>SKU / Código *</label><input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Ej. SKU-001" /></div></div><div className="pxp-map-row"><div className="pxp-field"><label>Categoría</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.filter(c => c !== "Todas").map(c => <option key={c}>{c}</option>)}<option>Alimentos</option><option>Veterinaria</option><option>Mascotas</option></select></div><div className="pxp-field"><label>Ubicación principal</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div></div><div className="pxp-map-row"><div className="pxp-field"><label>Precio base (S/) *</label><input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div><div className="pxp-field"><label>Stock inicial</label><input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div></div><div className="pxp-field"><label>Descripción</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción del producto..." /></div></div>
        <div className="pxp-modal-foot"><button type="button" className="pxp-btn" onClick={() => setModal("")}>Cancelar</button><button type="submit" className="pxp-btn primary">{editing ? "Guardar cambios" : "Crear producto"}</button></div>
      </form></section></div>}

      {modal === "stock" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}><div className="pxp-modal-head"><div className="pxp-heading-icon">▤</div><div><h2>Ajustar stock</h2><p>{editing?.name}</p></div><button className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div><div className="pxp-modal-body"><div className="pxp-field"><label>Stock actual</label><input value={`${editing?.stock ?? 0} unidades`} readOnly /></div><div className="pxp-field"><label>Nuevo stock</label><input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div><div className="pxp-field"><label>Motivo del ajuste</label><select defaultValue="Conteo físico"><option>Conteo físico</option><option>Corrección de inventario</option><option>Merma o pérdida</option><option>Otro</option></select></div></div><div className="pxp-modal-foot"><button className="pxp-btn" onClick={() => setModal("")}>Cancelar</button><button className="pxp-btn primary" onClick={() => { const stock = Math.max(0, Number(form.stock) || 0); setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, stock, status: stock === 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Disponible" } : p)); if (detailProduct?.id === editing.id) setDetailProduct(prev => ({ ...prev, stock, status: stock === 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Disponible" })); setModal(""); showToast("Stock actualizado"); }}>Guardar ajuste</button></div></section></div>}

      {toast && <div className="pxp-toast">{toast}</div>}
    </div>
  );
}

function Metric({ icon, tone = "", label, value, note }) {
  return <div className="pxp-metric"><div className={`pxp-metric-icon ${tone}`}>{icon}</div><div style={{ minWidth: 0 }}><div className="pxp-metric-label">{label}</div><div className="pxp-metric-value">{value}</div><div className="pxp-metric-note">{note}</div></div></div>;
}
