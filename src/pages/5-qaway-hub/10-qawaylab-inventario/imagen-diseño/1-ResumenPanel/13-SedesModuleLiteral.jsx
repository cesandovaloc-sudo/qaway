import React, { useMemo, useState, useRef, useEffect } from "react";
import PxpPopup from "./PxpPopup";
import { useNavigate } from "react-router-dom";
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
  Warehouse,
  MapPin,
  Store,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ArrowLeft,
  Trash2,
  Edit,
  Coffee,
  Dog,
  Sparkles,
  Package,
  Shield,
  Gamepad2,
  Layers,
  Cat,
  FlaskConical,
  Cookie,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CircleDollarSign,
  Box,
  Upload,
  Copy,
} from "lucide-react";

import { useTenant } from "../../src/context/TenantContext";
import { INITIAL_SEDES, INITIAL_ALMACENES } from "./13-SedesModule";

/**
 * 13-SedesModuleLiteral.jsx
 * Tablero superior de Sedes — diseño aprobado (copiado del tablero de Productos).
 * Fase 1: contenido textual adaptado al contexto de Sedes. La lógica, conexiones
 * y datos reales se conectan en las fases 2 a 4.
 */

const STOCK_IMAGES = {
  cafe: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
  canino: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80",
  perro: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80",
  gato: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  shampoo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80",
  snack: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
  collar: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80",
  panaderia: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  lacteos: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  software: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  consultoria: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
};

function getProductStockImage(product) {
  if (!product) return STOCK_IMAGES.default;
  if (product.coverImage || product.imageUrl) return product.coverImage || product.imageUrl;
  const txt = `${product.name || ""} ${product.category || ""} ${product.id || ""}`.toLowerCase();
  if (txt.includes("café") || txt.includes("cafe")) return STOCK_IMAGES.cafe;
  if (txt.includes("canino") || txt.includes("perro") || txt.includes("dog")) return STOCK_IMAGES.canino;
  if (txt.includes("gato") || txt.includes("cat") || txt.includes("michi")) return STOCK_IMAGES.gato;
  if (txt.includes("shampoo") || txt.includes("vet") || txt.includes("derm")) return STOCK_IMAGES.shampoo;
  if (txt.includes("snack") || txt.includes("galleta")) return STOCK_IMAGES.snack;
  if (txt.includes("collar") || txt.includes("correa")) return STOCK_IMAGES.collar;
  if (txt.includes("pan") || txt.includes("harina")) return STOCK_IMAGES.panaderia;
  if (txt.includes("leche") || txt.includes("queso") || txt.includes("lacteo")) return STOCK_IMAGES.lacteos;
  if (txt.includes("software") || txt.includes("sistema") || txt.includes("saas") || txt.includes("app")) return STOCK_IMAGES.software;
  if (txt.includes("asesor") || txt.includes("consult") || txt.includes("servicio")) return STOCK_IMAGES.consultoria;
  return STOCK_IMAGES.default;
}

const css = `
.pxp-root{--blue:#ff4b0b;--ink:#17233b;--muted:#71809e;--line:#e5ebf4;--soft:#f5f8fc;--green:#059669;--red:#e11d48;--amber:#d97706;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#f7f9fc;min-height:100vh;font-size:14px}
.pxp-root *{box-sizing:border-box}.pxp-layout{display:flex;min-height:100vh}.pxp-sidebar{width:220px;flex-shrink:0;background:#fff;border-right:1px solid var(--line);padding:16px 14px;display:flex;flex-direction:column;gap:10px}.pxp-brand{display:flex;align-items:center;gap:10px;padding:0 6px 18px}.pxp-logo{width:30px;height:30px;background:linear-gradient(135deg,#ff6b35,#ff4b0b);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);position:relative}.pxp-logo:after{content:"";position:absolute;inset:8px;background:#fff;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}.pxp-brand b{font-size:20px;letter-spacing:-.7px}.pxp-pro{font-size:11px;color:#ff4b0b;background:#fff2eb;border-radius:6px;padding:3px 7px;margin-left:4px}.pxp-brand small{display:block;color:var(--muted);font-size:11px;margin-top:1px}.pxp-nav{display:grid;gap:4px}.pxp-nav button{border:0;background:transparent;color:#34415b;text-align:left;padding:10px 12px;border-radius:7px;display:flex;align-items:center;gap:12px;font:inherit;cursor:pointer}.pxp-nav button.active{background:#fff2eb;color:#ff4b0b;font-weight:600}.pxp-nav .sep{height:1px;background:var(--line);margin:8px 2px}.pxp-plan{margin-top:auto;border:1px solid var(--line);border-radius:10px;padding:12px;background:#f8faff}.pxp-plan b{display:block}.pxp-plan small{color:var(--muted)}.pxp-progress{height:6px;border-radius:10px;background:#dfe7f2;margin:10px 0 7px;overflow:hidden}.pxp-progress i{display:block;width:40%;height:100%;background:var(--blue);border-radius:10px}.pxp-main{min-width:0;flex:1}.pxp-topbar{height:58px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 22px;gap:18px}.pxp-global-search{height:36px;max-width:600px;flex:1;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;gap:10px;padding:0 12px;color:var(--muted);background:#fbfcfe}.pxp-global-search input{border:0;outline:0;background:transparent;flex:1;font:inherit;min-width:0}.pxp-top-right{margin-left:auto;display:flex;align-items:center;gap:18px;color:#53627d}.pxp-avatar{width:32px;height:32px;border-radius:50%;background:#172b50;color:white;display:grid;place-items:center;font-weight:700}.pxp-content{padding:22px 20px;max-width:1800px;margin:auto}.pxp-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}.pxp-heading-icon{width:38px;height:38px;border-radius:10px;background:#f4f4f5;border:1px solid #e4e4e7;color:#18181b;display:grid;place-items:center;font-size:21px}.pxp-heading h1{font-size:28px;letter-spacing:-.8px;margin:0 0 2px;color:#111b2d}.pxp-heading p{margin:0;color:var(--muted)}.pxp-heading-actions{margin-left:auto;display:flex;gap:10px;align-items:center}.pxp-btn{border:1px solid var(--line);background:#fff;color:#34415b;border-radius:8px;padding:10px 14px;display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}.pxp-btn:hover{border-color:#b8c9e6;background:#f9fbff}.pxp-btn.primary{background:#ff4b0b;border-color:#ff4b0b;color:#fff;box-shadow:0 2px 8px rgba(255,75,11,0.25)}.pxp-btn.primary:hover{background:#ea3e00;border-color:#ea3e00;color:#fff}.pxp-btn.dark{background:#14213c;border-color:#14213c;color:#fff}.pxp-btn.small{padding:7px 10px;font-size:12px}.pxp-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:14px}.pxp-metric{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;min-width:0;box-shadow:0 4px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}.pxp-metric:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06)}.pxp-metric-icon{width:28px;height:28px;flex-shrink:0;border-radius:8px;display:grid;place-items:center;background:#f4f4f5;color:#52525b}.pxp-metric-label{font-size:12px;font-weight:600;color:#52525b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pxp-metric-value{font-size:26px;font-weight:800;letter-spacing:-.6px;color:#0f172a;margin-top:2px;white-space:nowrap}.pxp-metric-note{font-size:11px;font-weight:500;color:#71717a;margin-top:4px;display:flex;align-items:center;gap:5px}.pxp-up{color:#ff4b0b;font-weight:600}.pxp-toolbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:11px;margin-bottom:12px;flex-wrap:wrap;box-shadow:0 2px 10px rgba(0,0,0,0.03)}.pxp-search{display:flex;align-items:center;gap:9px;flex:1;min-width:220px;max-width:480px;border:1px solid var(--line);background:#f9fbfd;border-radius:8px;padding:0 12px;height:38px;color:#7b8aa5}.pxp-search input{border:0;outline:0;background:transparent;flex:1;min-width:0;font:inherit}.pxp-select-wrap{position:relative;display:inline-flex;align-items:center}.pxp-select{height:38px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:0 34px 0 12px;color:#334155;font:inherit;font-size:13px;font-weight:500;appearance:none;-webkit-appearance:none;cursor:pointer;outline:none;transition:border-color .15s ease}.pxp-select:hover{border-color:#cbd5e1}.pxp-select:focus{border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.1)}.pxp-select-chevron{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:#64748b}.pxp-view-toggle{margin-left:auto;display:flex;gap:6px;align-items:center}.pxp-icon-btn{width:36px;height:36px;border:1px solid var(--line);background:#fff;border-radius:8px;color:#53627d;cursor:pointer;display:grid;place-items:center;font-size:17px}.pxp-icon-btn.selected{background:#eef4ff;border-color:#b7cdfa;color:#155de3}.pxp-table-wrap{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:visible;box-shadow:0 2px 10px rgba(0,0,0,0.02)}.pxp-table-scroll{overflow-x:auto}.pxp-table{width:100%;border-collapse:collapse;min-width:940px}.pxp-table th{background:#f8fafc;color:#475569;font-size:13px;font-weight:700;text-align:left;padding:15px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap;letter-spacing:.2px}.pxp-table td{padding:16px 16px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14.5px;white-space:nowrap}.pxp-table tr:last-child td{border-bottom:0}.pxp-table tbody tr:nth-child(even){background:#fafafa}.pxp-table tbody tr:hover{background:#f8fafc}.pxp-check{width:18px;height:18px;accent-color:var(--blue);cursor:pointer;border-radius:4px}.pxp-product-cell{display:flex;align-items:center;gap:13px;min-width:250px}.pxp-product-thumb{width:42px;height:42px;flex-shrink:0;border-radius:10px;background:#f8fafc;display:grid;place-items:center;border:1px solid #e2e8f0}.pxp-product-name{color:#0f172a;font-weight:700;font-size:14.5px}.pxp-product-sub{font-size:12px;color:#64748b;margin-top:2px}.pxp-stock{font-weight:700;font-size:14px}.pxp-stock.ok{color:#166534}.pxp-stock.low{color:#b45309}.pxp-stock.zero{color:#71717a}.pxp-badge{display:inline-flex;align-items:center;border-radius:6px;padding:4px 9px;font-size:12px;font-weight:650}.pxp-badge.ok{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}.pxp-badge.low{background:#fffbeb;color:#b45309;border:1px solid #fde68a}.pxp-badge.zero{background:#f4f4f5;color:#52525b;border:1px solid #e4e4e7}.pxp-actions{display:flex;gap:6px;justify-content:flex-end;position:relative}.pxp-action-menu{position:absolute;z-index:15;right:0;top:40px;width:190px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 35px #182c4a20}.pxp-action-menu button{display:flex;width:100%;gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:10px;border-radius:6px;color:#34415b;font:inherit;cursor:pointer}.pxp-action-menu button:hover{background:#f2f6fc}.pxp-action-menu button.danger{color:#e11d48}.pxp-table-footer{display:flex;align-items:center;gap:12px;padding:15px 18px;color:#64748b;font-size:13px;border-top:1px solid var(--line);flex-wrap:wrap}.pxp-footer-spacer{flex:1}.pxp-pagination{display:flex;gap:6px;align-items:center}.pxp-pagination button{width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#34415b;cursor:pointer}.pxp-pagination button.active{background:var(--blue);color:white;border-color:var(--blue)}.pxp-pagination button:disabled{opacity:.4;cursor:default}
.pxp-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;padding:14px 0}
.pxp-product-card{border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;position:relative;box-shadow:0 1px 3px rgba(15,23,42,0.03);transition:border-color .15s ease,box-shadow .15s ease}
.pxp-product-card:hover{border-color:#94a3b8;box-shadow:0 4px 14px rgba(15,23,42,0.06)}
.pxp-card-media{position:relative;width:100%;aspect-ratio:16/10.5;min-height:175px;background:#f8fafc;overflow:hidden}
.pxp-card-img{width:100%;height:100%;object-fit:cover;display:block}
.pxp-card-floating-bar{position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;z-index:2}
.pxp-card-select-btn{width:28px;height:28px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.9);background:rgba(255,255,255,0.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:all .15s ease}
.pxp-card-select-btn.selected{background:#0f172a;border-color:#0f172a;color:#fff}
.pxp-card-select-btn:hover:not(.selected){background:#fff;border-color:#cbd5e1}
.pxp-card-body{padding:14px 16px 16px;display:flex;flex-direction:column;flex:1}
.pxp-card-meta{color:#64748b;font-size:11.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
.pxp-card-name{font-weight:700;font-size:15px;color:#0f172a;line-height:1.35;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:38px}
.pxp-card-status-line{display:inline-flex;align-items:center;gap:6px;margin-bottom:12px}
.pxp-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.pxp-status-dot.ok{background:#16a34a}
.pxp-status-dot.low{background:#d97706}
.pxp-status-dot.zero{background:#94a3b8}
.pxp-status-text{font-size:12px;font-weight:600;color:#64748b}
.pxp-card-bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:10px;border-top:1px solid #f1f5f9}
.pxp-card-price{font-size:17px;font-weight:800;color:#0f172a;letter-spacing:-.3px}
.pxp-card-stock-pill{font-size:12.5px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:5px}
.pxp-card-actions{display:flex;gap:8px;margin-top:12px}
.pxp-card-actions .pxp-btn{flex:1;justify-content:center;padding:7px 8px;font-size:12px;font-weight:600;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#334155}
.pxp-card-actions .pxp-btn:hover{background:#f1f5f9;border-color:#cbd5e1;color:#0f172a}
.pxp-bulk-menu-item{display:flex;width:100%;align-items:center;gap:8px;padding:7px 10px;border:0;background:transparent;border-radius:6px;font-size:12.5px;color:#334155;cursor:pointer;text-align:left;font-weight:500;transition:background .12s ease}
.pxp-bulk-menu-item:hover{background:#f1f5f9;color:#0f172a}
.pxp-bulk-menu-item.danger{color:#dc2626}
.pxp-bulk-menu-item.danger:hover{background:#fef2f2;color:#b91c1c}
.pxp-empty{padding:45px;text-align:center;color:var(--muted)}.pxp-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;color-scheme:light!important}.pxp-modal{background:#fff;border-radius:16px;width:min(640px,100%);max-height:92vh;overflow-y:auto;box-shadow:0 25px 80px rgba(12,27,53,0.22);z-index:9999;color-scheme:light!important}.pxp-modal input[type="number"]::-webkit-inner-spin-button,.pxp-modal input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none!important;margin:0!important}.pxp-modal input[type="number"]{-moz-appearance:textfield!important;appearance:textfield!important}.pxp-modal-head{padding:20px 24px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between}.pxp-modal-head h2{margin:0;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.4px}.pxp-modal-head .close{font-size:22px;color:#64748b;background:none;border:0;cursor:pointer;line-height:1}.pxp-modal-body{padding:22px 24px}.pxp-form-row{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:center;margin-bottom:15px}.pxp-form-label{font-size:13px;font-weight:650;color:#334155;line-height:1.3}.pxp-form-label span.req{color:#ef4444;margin-left:2px}.pxp-form-input{width:100%;border:1px solid transparent;background:#f4f4f6;border-radius:12px;padding:11px 14px;font:inherit;font-size:13.5px;color:#0f172a;outline:none;transition:all .18s ease;color-scheme:light!important}select.pxp-form-input,select.pxp-compound-sel,select.pxp-select,select{color-scheme:light!important;color:#0f172a!important;background-color:#f4f4f6}select.pxp-form-input option,select.pxp-compound-sel option,select.pxp-select option,select option,option{background-color:#ffffff!important;color:#0f172a!important;color-scheme:light!important}.pxp-form-input:focus{background:#fff;border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.12)}.pxp-compound{display:flex;border-radius:12px;background:#f4f4f6;overflow:hidden;border:1px solid transparent}.pxp-compound:focus-within{background:#fff;border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.12)}.pxp-compound-sel{border:0;background:transparent;padding:0 12px;font-weight:700;color:#0f172a;outline:none;cursor:pointer;border-right:1px solid #e4e4e7;color-scheme:light!important}.pxp-compound-input{border:0;background:transparent;padding:11px 14px;flex:1;min-width:0;font:inherit;font-size:13.5px;color:#0f172a;outline:none}.pxp-compound-tag{display:flex;align-items:center;gap:4px;padding:0 12px;font-size:11.5px;font-weight:650;color:#166534;white-space:nowrap}.pxp-modal-foot{padding:16px 24px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;background:#fafafa;border-bottom-left-radius:16px;border-bottom-right-radius:16px}.pxp-field{display:grid;gap:6px;margin-bottom:13px}.pxp-field label{font-size:12px;color:#53627d;font-weight:600}.pxp-field input,.pxp-field select,.pxp-field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:10px 11px;font:inherit;outline-color:#9ab9ff;background:white;color-scheme:light!important}.pxp-field textarea{min-height:90px;resize:vertical}.pxp-map-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}.pxp-preview-table{width:100%;border-collapse:collapse;font-size:12px}.pxp-preview-table th,.pxp-preview-table td{padding:10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}.pxp-preview-scroll{overflow:auto}.pxp-detail{position:fixed;z-index:9999;right:0;top:0;bottom:0;width:min(760px,95vw);background:#fff;box-shadow:-20px 0 60px rgba(15,23,42,0.16);overflow-y:auto;animation:pxpSlideIn .25s cubic-bezier(.16,1,.3,1)}.pxp-detail-head{padding:24px 28px 18px;border-bottom:1px solid var(--line)}.pxp-detail-close{position:absolute;right:18px;top:18px;z-index:10;width:34px;height:34px;border-radius:8px;background:#f8fafc;border:1px solid var(--line);color:#475569;display:grid;place-items:center;font-size:20px;cursor:pointer;transition:all .2s ease}.pxp-detail-close:hover{background:#fee2e2;color:#ef4444;border-color:#fca5a5}.pxp-detail-product{display:flex;gap:18px;align-items:center;padding-right:48px}.pxp-detail-art{width:68px;height:68px;border-radius:12px;background:#f8fafc;display:grid;place-items:center;flex-shrink:0;border:1px solid #e2e8f0}.pxp-detail-title{font-size:21px;font-weight:800;letter-spacing:-.4px;margin:0 0 6px;color:#0f172a}.pxp-detail-tabs{display:flex;gap:2px;overflow-x:auto;padding:0 24px;border-bottom:1px solid var(--line);background:#fafafa}.pxp-detail-tabs button{padding:12px 14px;border:0;border-bottom:2px solid transparent;background:transparent;color:#64748b;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:color .15s ease}.pxp-detail-tabs button:hover{color:#0f172a}.pxp-detail-tabs button.active{color:#ff4b0b;border-color:#ff4b0b;font-weight:700}.pxp-detail-content{padding:22px 28px}.pxp-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pxp-detail-box{border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.02)}.pxp-detail-box h3{margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9}.pxp-detail-box.full{grid-column:1/-1}.pxp-kv{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f8fafc;font-size:13px}.pxp-kv:last-child{border-bottom:0}.pxp-kv span{color:#64748b;font-weight:500}.pxp-kv b{text-align:right;font-weight:650;color:#0f172a}.pxp-detail-table{width:100%;border-collapse:collapse;font-size:13px}.pxp-detail-table th{background:#f8fafc;color:#475569;font-weight:700;text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12.5px}.pxp-detail-table td{text-align:left;padding:10px 10px;border-bottom:1px solid #f1f5f9;color:#334155}.pxp-detail-table tr:last-child td{border-bottom:0}.pxp-toast{position:fixed;bottom:20px;right:20px;z-index:100;background:#14213c;color:#fff;padding:12px 18px;border-radius:9px;box-shadow:0 8px 25px #0e1e3b33}.pxp-mobile-menu{display:none}
@media(max-width:1500px){.pxp-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}}
.pxp-metrics.sedes-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:1150px){.pxp-metrics.sedes-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.pxp-metrics.sedes-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){.pxp-metrics.sedes-metrics{grid-template-columns:1fr}}
@media(max-width:1150px){.pxp-sidebar{width:190px}.pxp-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.pxp-metric-value{font-size:22px}.pxp-import-columns{grid-template-columns:1fr}}
@media(max-width:800px){.pxp-sidebar{display:none}.pxp-content{padding:16px 12px}.pxp-topbar{padding:0 12px}.pxp-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.pxp-heading h1{font-size:24px}.pxp-heading-actions{width:100%;margin-left:0}.pxp-heading-actions .pxp-btn{flex:1;justify-content:center}.pxp-detail-grid{grid-template-columns:1fr}.pxp-detail-box.full{grid-column:auto}.pxp-detail-product{align-items:flex-start}.pxp-detail-art{width:75px;height:75px;font-size:35px}.pxp-detail-title{font-size:20px}.pxp-stepper{grid-template-columns:repeat(2,1fr)}.pxp-modal-body{padding:16px}.pxp-modal-head,.pxp-modal-foot{padding:16px}.pxp-select{max-width:calc(50% - 6px);flex:1}.pxp-view-toggle{margin-left:0}}
@media(max-width:480px){.pxp-metrics{grid-template-columns:1fr}.pxp-heading-actions{flex-wrap:wrap}.pxp-heading-actions .pxp-btn{flex:auto}.pxp-top-right{gap:10px}.pxp-global-search{min-width:0}.pxp-step{font-size:11px}.pxp-detail-head{padding:22px 14px 16px}.pxp-detail-content{padding:14px}.pxp-detail-tabs{padding:0 8px}}
`;

function Icon({ children }) { return <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", minWidth: 18 }}>{children}</span>; }
function money(value) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(value).replace("PEN", "S/"); }
function statusClass(status) { return status === "Disponible" ? "ok" : status === "Stock bajo" ? "low" : "zero"; }

function ProductThumb({ id, category = "", name = "", size = 40 }) {
  const iconSize = Math.round(size * 0.48);
  const neutralStyle = { bg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" };
  
  const text = `${name} ${category} ${id}`.toLowerCase();
  let iconComponent = <Box size={iconSize} strokeWidth={1.75} />;

  if (text.includes("café") || text.includes("cafe")) {
    iconComponent = <Coffee size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("canino") || text.includes("perro") || text.includes("dog")) {
    iconComponent = <Dog size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("gato") || text.includes("cat") || text.includes("michi")) {
    iconComponent = <Cat size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("shampoo") || text.includes("derm") || text.includes("vet") || text.includes("veterinaria")) {
    iconComponent = <FlaskConical size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("snack") || text.includes("galleta") || text.includes("cookie")) {
    iconComponent = <Cookie size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("collar") || text.includes("proteccion") || text.includes("shield")) {
    iconComponent = <Shield size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("juguete") || text.includes("game")) {
    iconComponent = <Gamepad2 size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("arena") || text.includes("sanitaria")) {
    iconComponent = <Sparkles size={iconSize} strokeWidth={1.75} />;
  } else if (text.includes("paquete") || text.includes("pack")) {
    iconComponent = <Package size={iconSize} strokeWidth={1.75} />;
  } else {
    iconComponent = <Boxes size={iconSize} strokeWidth={1.75} />;
  }
  
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size > 50 ? 12 : 8,
        backgroundColor: neutralStyle.bg,
        border: `1px solid ${neutralStyle.border}`,
        color: neutralStyle.color,
        display: "grid",
        placeItems: "center",
      }}
    >
      {iconComponent}
    </div>
  );
}

const AVAILABLE_COLUMNS = [
  { key: "sede", label: "Sede" },
  { key: "codigo", label: "Código" },
  { key: "ciudad", label: "Ciudad" },
  { key: "direccion", label: "Dirección" },
  { key: "almacenes", label: "Almacenes" },
  { key: "tipo", label: "Tipo de sede" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
  { key: "telefono", label: "Teléfono" },
];


export default function SedesPanel() {
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = null;
  }

  let tenantCtx = null;
  try {
    tenantCtx = useTenant();
  } catch (e) {
    tenantCtx = null;
  }

  const activeTenantId = tenantCtx?.activeTenantId || null;
  const isPlatformAdmin = Boolean(tenantCtx?.isPlatformAdmin);

  const handleNavigateCapture = () => {
    const isHub = typeof window !== "undefined" && window.location.pathname.startsWith("/hub/inventario");
    const targetUrl = isHub ? "/hub/inventario/captura" : "/captura";
    if (navigate) {
      navigate(targetUrl);
    } else if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    }
  };
  const emptySedeForm = {
    nombre: "", codigo: "", subtitulo: "", tipo: "Principal", estado: "Activa",
    ciudad: "Lima", direccion: "", responsable: "", telefono: "", email: "",
    almacenes: 0, descripcion: ""
  };
  const [form, setForm] = useState(emptySedeForm);
  const [sedes, setSedes] = useState(INITIAL_SEDES);
  const [almacenes] = useState(INITIAL_ALMACENES);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [ciudad, setCiudad] = useState("Todas");
  const [responsable, setResponsable] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(["sede", "codigo", "ciudad", "direccion", "almacenes", "tipo", "responsable", "estado", "telefono"]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState("list");
  const [gridCols, setGridCols] = useState(5);
  const [menuId, setMenuId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [detailSede, setDetailSede] = useState(null);
  const [detailTab, setDetailTab] = useState("Resumen");
  const [modal, setModal] = useState("");
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importOption, setImportOption] = useState("merge");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const columnPickerRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const bulkMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setMenuId(null);
      }
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target)) {
        setShowBulkMenu(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuId(null);
        setShowBulkMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  // ---- Datos del módulo Sedes (fuente: tablero inferior, misma fuente, sin copia) ----
  // `sedes`/`almacenes` son el estado vivo del tablero superior; el inferior conserva el suyo
  // (páginas independientes, no comparten estado). Sus initial* sí provienen del mismo archivo.
  const sedesActivas = useMemo(() => sedes.filter(s => s.estado === "Activa"), [sedes]);
  const ciudades = useMemo(() => Array.from(new Set(sedes.map(s => s.ciudad))), [sedes]);
  const puntosVenta = useMemo(() => sedes.filter(s => s.tipo === "Tienda"), [sedes]);
  const responsables = useMemo(() => Array.from(new Set(sedes.map(s => s.responsable).filter(Boolean))), [sedes]);

  const metricasSedes = useMemo(() => {
    const total = sedes.length;
    return {
      totalSedes: { valor: total, nota: "Data en vivo" },
      sedesActivas: { valor: sedesActivas.length, nota: `de ${total} sedes registradas` },
      almacenes: { valor: almacenes.length, nota: "en todas las sedes" },
      ciudades: { valor: ciudades.length, nota: ciudades.join(", ") || "—" },
      puntosVenta: { valor: puntosVenta.length, nota: "con atención al público" },
    };
  }, [sedes, sedesActivas, almacenes, ciudades, puntosVenta]);

  const filtered = useMemo(() => sedes.filter(s => {
    const q = query.toLowerCase().trim();
    const matchesQ = !q || [s.nombre, s.codigo, s.ciudad, s.direccion, s.responsable, s.subtitulo].some(v => String(v || "").toLowerCase().includes(q));
    const matchesTipo = tipo === "Todos" || s.tipo === tipo;
    const matchesEstado = estado === "Todos" || s.estado === estado;
    const matchesCiudad = ciudad === "Todas" || s.ciudad === ciudad;
    const matchesResp = !responsable || (s.responsable && s.responsable.toLowerCase().includes(responsable.toLowerCase()));
    return matchesQ && matchesTipo && matchesEstado && matchesCiudad && matchesResp;
  }), [sedes, query, tipo, estado, ciudad, responsable]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showToast = msg => { setToast(msg); window.setTimeout(() => setToast(""), 2800); };

  const openNew = () => {
    if (isPlatformAdmin && !activeTenantId) {
      showToast("Debes seleccionar una empresa en la barra superior antes de registrar una sede.");
      return;
    }
    setEditing(null);
    setForm(emptySedeForm);
    setModal("sede");
  };

  const openEdit = s => {
    setEditing(s);
    setForm({
      nombre: s.nombre || "", codigo: s.codigo || "", subtitulo: s.subtitulo || "",
      tipo: s.tipo || "Principal", estado: s.estado || "Activa", ciudad: s.ciudad || "Lima",
      direccion: s.direccion || "", responsable: s.responsable || "", telefono: s.telefono || "",
      email: s.email || "", almacenes: s.almacenes ?? 0, descripcion: s.descripcion || ""
    });
    setDetailSede(null);
    setMenuId(null);
    setModal("sede");
  };

  const saveSede = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const item = {
      ...data,
      id: editing?.id ?? Date.now(),
      almacenes: Number(data.almacenes || 0),
      subtitulo: data.subtitulo || data.tipo,
      fechaCreacion: editing?.fechaCreacion || new Date().toLocaleDateString("es-PE"),
      actualizacion: new Date().toLocaleString("es-PE"),
      imagen: editing?.imagen || ""
    };
    setSedes(prev => editing ? prev.map(x => x.id === editing.id ? item : x) : [...prev, item]);
    if (detailSede?.id === item.id) setDetailSede(item);
    setModal("");
    showToast(editing ? "Sede actualizada correctamente" : "Sede creada correctamente");
  };

  const toggleSelected = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = checked => setSelected(checked ? pageRows.map(p => p.id) : []);

  const handleBulkEstado = (newEstado) => {
    setSedes(prev => prev.map(s => selected.includes(s.id) ? { ...s, estado: newEstado } : s));
    showToast(`${selected.length} ${selected.length === 1 ? "sede marcada" : "sedes marcadas"} como "${newEstado}"`);
    setShowBulkMenu(false);
  };

  const handleBulkDuplicate = () => {
    const toDuplicate = sedes.filter(s => selected.includes(s.id));
    const copies = toDuplicate.map((s, i) => ({
      ...s,
      id: `copy-${Date.now()}-${i}`,
      nombre: `${s.nombre} (copia)`,
      codigo: `${s.codigo}-COPY`
    }));
    setSedes(prev => [...copies, ...prev]);
    showToast(`${toDuplicate.length} sedes duplicadas`);
    setShowBulkMenu(false);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`¿Eliminar las ${selected.length} sedes seleccionadas?`)) {
      const count = selected.length;
      setSedes(prev => prev.filter(s => !selected.includes(s.id)));
      setSelected([]);
      showToast(`${count} sedes eliminadas correctamente`);
      setShowBulkMenu(false);
    }
  };

  const sedeToCsvRow = s => [
    s.id,
    `"${(s.nombre || '').replace(/"/g, '""')}"`,
    `"${s.codigo || ''}"`,
    `"${s.ciudad || ''}"`,
    `"${s.direccion || ''}"`,
    `"${s.tipo || ''}"`,
    s.almacenes || 0,
    `"${s.responsable || ''}"`,
    `"${s.estado || ''}"`,
    `"${s.telefono || ''}"`
  ];
  const SEDE_CSV_HEADERS = ["ID", "Sede", "Código", "Ciudad", "Dirección", "Tipo", "Almacenes", "Responsable", "Estado", "Teléfono"];

  const downloadCsv = (rows, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [SEDE_CSV_HEADERS.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkExportCSV = () => {
    const selectedItems = sedes.filter(s => selected.includes(s.id));
    if (selectedItems.length === 0) return;
    downloadCsv(selectedItems.map(sedeToCsvRow), `sedes_seleccionadas_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`${selectedItems.length} sedes exportadas en CSV`);
    setShowBulkMenu(false);
  };

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      showToast("No hay sedes para exportar");
      return;
    }
    downloadCsv(filtered.map(sedeToCsvRow), `inventi_sedes_${new Date().toISOString().split("T")[0]}.csv`);
    showToast("Catálogo de sedes exportado en CSV");
  };

  const handleImportFile = file => { if (!file) return; setImportFile(file); setImportStep(2); };
  const finishImport = () => { showToast(importFile ? `Archivo "${importFile.name}" listo para procesar (demo)` : "Selecciona un archivo para continuar"); setModal(""); setImportStep(1); setImportFile(null); };
  const resetImport = () => { setImportStep(1); setImportFile(null); setModal("import"); };


  const toggleColumn = key => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };


  return (
    <div className="pxp-root">
      <style>{css}</style>
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            <div className="pxp-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="pxp-heading-icon"><Boxes size={22} strokeWidth={1.8} /></div>
                <div>
                  <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 2px", color: "#111b2d" }}>Sedes</h1>
                  <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                    Administra tus sedes, almacenes y puntos de operación.
                  </p>
                </div>
              </div>
              <div className="pxp-heading-actions" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className="pxp-btn" onClick={resetImport} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <FileSpreadsheet size={15} /> Importar
                </button>
                <button className="pxp-btn" onClick={handleExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <Download size={15} /> Exportar
                </button>
                <button
                  className="pxp-btn"
                  style={{ background: "#1e293b", borderColor: "#1e293b", color: "#fff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}
                  onClick={handleNavigateCapture}
                  title="Capturar y digitalizar sede con IA / Cámara"
                >
                  <Camera size={15} /> Capturar
                </button>
                <button
                  className="pxp-btn primary"
                  onClick={openNew}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontWeight: 650,
                    opacity: isPlatformAdmin && !activeTenantId ? 0.65 : 1,
                    cursor: isPlatformAdmin && !activeTenantId ? "not-allowed" : "pointer"
                  }}
                  title={isPlatformAdmin && !activeTenantId ? "Selecciona una empresa en la barra superior para crear sedes" : "Crear nueva sede"}
                >
                  <Plus size={15} /> Nueva sede <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <section className="pxp-metrics sedes-metrics">
              <Metric icon={<CheckCircle2 size={16} strokeWidth={1.75} />} label="Sedes activas" value={metricasSedes.sedesActivas.valor.toLocaleString("es-PE")} note={metricasSedes.sedesActivas.nota} stroke="#10b981" />
              <Metric icon={<Warehouse size={16} strokeWidth={1.75} />} label="Almacenes" value={metricasSedes.almacenes.valor.toLocaleString("es-PE")} note={metricasSedes.almacenes.nota} stroke="#f59e0b" />
              <Metric icon={<MapPin size={16} strokeWidth={1.75} />} label="Ciudades" value={metricasSedes.ciudades.valor.toLocaleString("es-PE")} note={metricasSedes.ciudades.nota} stroke="#71717a" />
              <Metric icon={<Store size={16} strokeWidth={1.75} />} label="Puntos de venta" value={metricasSedes.puntosVenta.valor.toLocaleString("es-PE")} note={metricasSedes.puntosVenta.nota} stroke="#ff4b0b" />
            </section>

            <div className="pxp-toolbar">
              <div className="pxp-search"><Search size={15} style={{ color: "var(--muted)" }} /><input value={query} placeholder="Buscar sede por nombre o ciudad..." onChange={e => { setQuery(e.target.value); setPage(1); }} /></div>
              
              {/* 2 Filtros Principales en la barra superior */}
                            <PxpPopup
                value={tipo}
                onChange={v => { setTipo(v); setPage(1); }}
                options={[{ v: "Todos", l: "Tipo: Todos" }, { v: "Principal", l: "Principal" }, { v: "Tienda", l: "Tienda" }, { v: "Almacén", l: "Almacén" }, { v: "Punto de venta", l: "Punto de venta" }]}
                renderLabel={v => (v === "Todos" ? "Tipo: Todos" : v)}
              />

                            <PxpPopup
                value={estado}
                onChange={v => { setEstado(v); setPage(1); }}
                options={[{ v: "Todos", l: "Estado: Todos" }, { v: "Activa", l: "Activa" }, { v: "Inactiva", l: "Inactiva" }]}
                renderLabel={v => (v === "Todos" ? "Estado: Todos" : v)}
              />
              
              {/* Botón Más filtros con Icono Lucide */}
              <button
                className={`pxp-btn ${showExtraFilters ? "dark" : ""}`}
                onClick={() => setShowExtraFilters(!showExtraFilters)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Filter size={14} /> Más filtros
              </button>

              {/* Selector de Columnas / Mostrar otros datos (SOLO EN MODO TABLA) */}
              {view === "list" && (
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
              )}

              {/* Selector de densidad de columnas (SOLO EN MODO TARJETAS / GRID) */}
              {view === "grid" && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 38,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "3px 4px",
                    gap: 2
                  }}
                >
                  {[3, 4, 5, 6].map(cols => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setGridCols(cols)}
                      style={{
                        height: 30,
                        minWidth: 30,
                        padding: "0 8px",
                        borderRadius: 6,
                        border: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: gridCols === cols ? "#0f172a" : "transparent",
                        color: gridCols === cols ? "#ffffff" : "#64748b",
                        transition: "all .15s ease"
                      }}
                      title={`Ver en cuadrícula de ${cols} columnas`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              )}

              <div className="pxp-view-toggle">
                <button className={`pxp-icon-btn ${view === "list" ? "selected" : ""}`} onClick={() => setView("list")} title="Vista de lista"><List size={16} /></button>
                <button className={`pxp-icon-btn ${view === "grid" ? "selected" : ""}`} onClick={() => setView("grid")} title="Vista de tarjetas"><Grid3X3 size={16} /></button>
              </div>
            </div>

            {/* Panel Desplegable de Filtros Adicionales */}
            {showExtraFilters && (
              <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "11px", padding: "16px 20px", marginBottom: "12px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ciudad</label>
                    <PxpPopup
                      value={ciudad}
                      onChange={v => { setCiudad(v); setPage(1); }}
                      options={[{ v: "Todas", l: "Todas" }, ...ciudades.map(c => ({ v: c, l: c }))]}
                      renderLabel={v => (v === "Todas" ? "Todas" : v)}
                      wrapStyle={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Responsable</label>
                    <input style={{ width: "100%", height: 38, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "var(--ink)", background: "#fff" }} placeholder="Buscar responsable..." value={responsable} onChange={e => { setResponsable(e.target.value); setPage(1); }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</label>
                    <PxpPopup
                      value={estado}
                      onChange={v => { setEstado(v); setPage(1); }}
                      options={[{ v: "Todos", l: "Todos" }, { v: "Activa", l: "Activa" }, { v: "Inactiva", l: "Inactiva" }]}
                      renderLabel={v => (v === "Todos" ? "Todos" : v)}
                      wrapStyle={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                  <button className="pxp-btn small" onClick={() => { setCiudad("Todas"); setResponsable(""); setTipo("Todos"); setEstado("Todos"); setPage(1); setShowExtraFilters(false); }}>
                    Cancelar / Limpiar
                  </button>
                  <button className="pxp-btn small" style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff", fontWeight: 700 }} onClick={() => setShowExtraFilters(false)}>
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}
            <section className="pxp-table-wrap">
              {selected.length > 0 && (
                <div
                  style={{
                    padding: "9px 16px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "#0f172a",
                    fontSize: 13
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {selected.length} {selected.length === 1 ? "seleccionado" : "seleccionados"}
                  </span>
                  <div style={{ position: "relative" }} ref={bulkMenuRef}>
                    <button
                      type="button"
                      className="pxp-btn small"
                      onClick={() => setShowBulkMenu(!showBulkMenu)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#fff",
                        borderColor: "#cbd5e1",
                        fontWeight: 650,
                        color: "#0f172a"
                      }}
                    >
                      Acciones masivas <ChevronDown size={13} />
                    </button>

                    {showBulkMenu && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "calc(100% + 6px)",
                          width: 230,
                          background: "#fff",
                          border: "1px solid var(--line)",
                          borderRadius: 10,
                          padding: 6,
                          zIndex: 50,
                          boxShadow: "0 12px 35px rgba(15,23,42,0.15)"
                        }}
                      >
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", padding: "6px 8px 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Estado
                        </div>
                        <button className="pxp-bulk-menu-item" onClick={() => handleBulkEstado("Activa")}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                          Marcar como Activa
                        </button>
                        <button className="pxp-bulk-menu-item" onClick={() => handleBulkEstado("Inactiva")}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
                          Marcar como Inactiva
                        </button>
                        
                        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                        
                        <button
                          className="pxp-bulk-menu-item"
                          onClick={handleBulkDuplicate}
                        >
                          <Copy size={13} /> Duplicar seleccionados
                        </button>
                        <button
                          className="pxp-bulk-menu-item"
                          onClick={handleBulkExportCSV}
                        >
                          <Download size={13} /> Exportar selección (CSV)
                        </button>
                        
                        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                        
                        <button
                          className="pxp-bulk-menu-item danger"
                          onClick={handleBulkDelete}
                        >
                          <Trash2 size={13} /> Eliminar seleccionados
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="pxp-link"
                    onClick={() => setSelected([])}
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "#64748b",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Limpiar selección
                  </button>
                </div>
              )}
              {view === "list" ? <div className="pxp-table-scroll"><table className="pxp-table">
                <thead><tr>
                  <th><input className="pxp-check" type="checkbox" checked={pageRows.length > 0 && pageRows.every(s => selected.includes(s.id))} onChange={e => selectAll(e.target.checked)} /></th>
                  {visibleColumns.includes("sede") && <th>Sede ↕</th>}
                  {visibleColumns.includes("codigo") && <th>Código ↕</th>}
                  {visibleColumns.includes("ciudad") && <th>Ciudad</th>}
                  {visibleColumns.includes("direccion") && <th>Dirección</th>}
                  {visibleColumns.includes("almacenes") && <th>Almacenes ↕</th>}
                  {visibleColumns.includes("tipo") && <th>Tipo de sede</th>}
                  {visibleColumns.includes("responsable") && <th>Responsable</th>}
                  {visibleColumns.includes("estado") && <th>Estado</th>}
                  {visibleColumns.includes("telefono") && <th>Teléfono</th>}
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr></thead>
                <tbody>
                  {pageRows.map(s => <tr key={s.id}>
                    <td><input className="pxp-check" type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelected(s.id)} /></td>
                    {visibleColumns.includes("sede") && <td onClick={() => setDetailSede(s)} style={{ cursor: "pointer" }}><div className="pxp-product-cell"><div className="pxp-detail-art" style={{ width: 42, height: 42, color: "#ff4b0b" }}><Warehouse size={20} strokeWidth={1.75} /></div><div><div className="pxp-product-name">{s.nombre}</div>{s.subtitulo && <div className="pxp-product-sub">{s.subtitulo}</div>}</div></div></td>}
                    {visibleColumns.includes("codigo") && <td>{s.codigo}</td>}
                    {visibleColumns.includes("ciudad") && <td>{s.ciudad}</td>}
                    {visibleColumns.includes("direccion") && <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>{s.direccion}</td>}
                    {visibleColumns.includes("almacenes") && <td>{s.almacenes}</td>}
                    {visibleColumns.includes("tipo") && <td>{s.tipo}</td>}
                    {visibleColumns.includes("responsable") && <td>{s.responsable || "—"}</td>}
                    {visibleColumns.includes("estado") && <td><span className={`pxp-badge ${s.estado === "Activa" ? "ok" : "zero"}`}>{s.estado}</span></td>}
                    {visibleColumns.includes("telefono") && <td>{s.telefono || "—"}</td>}
                    <td><div className="pxp-actions" ref={menuId === s.id ? actionsMenuRef : null}><button className="pxp-icon-btn" title="Ver detalle" onClick={() => { setDetailSede(s); setDetailTab("Resumen"); setMenuId(null); }}>◉</button><button className="pxp-icon-btn" title="Editar" onClick={() => openEdit(s)}>✎</button><button className={`pxp-icon-btn ${menuId === s.id ? "selected" : ""}`} title="Más acciones" onClick={() => setMenuId(menuId === s.id ? null : s.id)}>···</button>
                      {menuId === s.id && <div className="pxp-action-menu" style={{ width: 210 }}>
                        <button onClick={() => { setDetailSede(s); setDetailTab("Resumen"); setMenuId(null); }}>◉　Ver detalle</button>
                        <button onClick={() => openEdit(s)}>✎　Editar sede</button>
                        <button onClick={() => { setSedes(prev => [{ ...s, id: Date.now(), nombre: `${s.nombre} (copia)`, codigo: `${s.codigo}-COPY` }, ...prev]); setMenuId(null); showToast("Sede duplicada"); }}>▣　Duplicar</button>
                        <button onClick={() => { setDetailSede(s); setDetailTab("Almacenes"); setMenuId(null); }}>▣　Ver almacenes</button>
                        <button className="danger" onClick={() => { if (window.confirm(`¿Eliminar la sede "${s.nombre}"?`)) { setSedes(prev => prev.filter(x => x.id !== s.id)); setMenuId(null); showToast("Sede eliminada"); } }}>▤　Eliminar</button>
                      </div>}
                    </div></td>
                  </tr>)}
                  {pageRows.length === 0 && <tr><td colSpan={visibleColumns.length + 2}><div className="pxp-empty">No se encontraron sedes con esos filtros.</div></td></tr>}
                </tbody>
              </table></div> : (
                <div
                  className="pxp-grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
                  }}
                >
                  {pageRows.map(s => {
                    const isSelected = selected.includes(s.id);
                    return (
                      <article className="pxp-product-card" key={s.id} onClick={() => setDetailSede(s)} style={{ cursor: "pointer" }}>
                        <div className="pxp-card-media" style={{ display: "grid", placeItems: "center", background: "linear-gradient(135deg,#f8fafc,#eef2f7)" }}>
                          <div style={{ color: "#94a3b8" }}><Warehouse size={54} strokeWidth={1.5} /></div>
                          <div className="pxp-card-floating-bar" onClick={e => e.stopPropagation()}>
                            <button type="button" className={`pxp-card-select-btn ${isSelected ? "selected" : ""}`} onClick={() => toggleSelected(s.id)} title={isSelected ? "Deseleccionar" : "Seleccionar"}>
                              {isSelected && <Check size={14} strokeWidth={2.5} />}
                            </button>
                          </div>
                        </div>
                        <div className="pxp-card-body">
                          <div className="pxp-card-meta">{s.codigo} · {s.ciudad}</div>
                          <div className="pxp-card-name" title={s.nombre}>{s.nombre}</div>
                          <div className="pxp-card-status-line">
                            <span className={`pxp-status-dot ${s.estado === "Activa" ? "ok" : "zero"}`} />
                            <span className="pxp-status-text">{s.estado} · {s.tipo}</span>
                          </div>
                          <div className="pxp-card-bottom">
                            <div><span className="pxp-card-price">{s.almacenes} almacenes</span></div>
                            <div className="pxp-card-stock-pill"><span>{s.responsable || "Sin responsable"}</span></div>
                          </div>
                          <div className="pxp-card-actions" onClick={e => e.stopPropagation()}>
                            <button className="pxp-btn small" onClick={() => { setDetailSede(s); setDetailTab("Resumen"); }}>Ver detalle</button>
                            <button className="pxp-btn small" onClick={() => openEdit(s)}>Editar</button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {pageRows.length === 0 && <div className="pxp-empty">No se encontraron sedes.</div>}
                </div>
              )}
              <div className="pxp-table-footer"><span>Mostrando {filtered.length ? (page - 1) * pageSize + 1 : 0} a {Math.min(page * pageSize, filtered.length)} de {filtered.length.toLocaleString("es-PE")} sedes</span><div className="pxp-footer-spacer" /><span>Filas por página</span><select className="pxp-select" style={{ height: 34, minWidth: 68 }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><div className="pxp-pagination"><button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>{Array.from({ length: Math.min(pages, 5) }, (_, i) => { const n = i + 1; return <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</button>; })}<button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button></div></div>
            </section>
          </div>
        </main>
      </div>




      {detailSede && (
        <>
          <div className="pxp-overlay" onClick={() => setDetailSede(null)} />
          <aside className="pxp-detail">
            <button className="pxp-icon-btn pxp-detail-close" onClick={() => setDetailSede(null)} title="Cerrar panel">×</button>
            <div className="pxp-detail-head">
              <div className="pxp-detail-product">
                <div className="pxp-detail-art" style={{ color: "#ff4b0b" }}><Warehouse size={30} strokeWidth={1.8} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="pxp-detail-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{detailSede.nombre}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    <span className={`pxp-badge ${detailSede.estado === "Activa" ? "ok" : "zero"}`} style={{ fontSize: 12 }}>{detailSede.estado}</span>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>· {detailSede.tipo}</span>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>· {detailSede.codigo}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button className="pxp-btn small" style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff" }} onClick={() => openEdit(detailSede)}>✎ Editar sede</button>
                <button className="pxp-btn small" onClick={() => { setSedes(prev => [{ ...detailSede, id: Date.now(), nombre: `${detailSede.nombre} (copia)`, codigo: `${detailSede.codigo}-COPY` }, ...prev]); showToast("Sede duplicada"); }}>▣ Duplicar</button>
              </div>
              <div className="pxp-detail-grid" style={{ marginTop: 16 }}>
                <div className="pxp-detail-box" style={{ padding: "12px 14px" }}>
                  <div className="pxp-kv"><span>Ciudad</span><b>{detailSede.ciudad}</b></div>
                  <div className="pxp-kv"><span>Almacenes asociados</span><b>{detailSede.almacenes}</b></div>
                </div>
                <div className="pxp-detail-box" style={{ padding: "12px 14px" }}>
                  <div className="pxp-kv"><span>Responsable</span><b>{detailSede.responsable || "—"}</b></div>
                  <div className="pxp-kv"><span>Teléfono</span><b>{detailSede.telefono || "—"}</b></div>
                </div>
              </div>
            </div>

            <div className="pxp-detail-tabs">
              {["Resumen", "Contacto", "Almacenes"].map(t => (
                <button key={t} className={detailTab === t ? "active" : ""} onClick={() => setDetailTab(t)}>{t}</button>
              ))}
            </div>

            <div className="pxp-detail-content">
              {detailTab === "Resumen" && (
                <div className="pxp-detail-grid">
                  <div className="pxp-detail-box">
                    <h3>▤ Ficha de la sede</h3>
                    {[["Código", detailSede.codigo], ["Subtítulo", detailSede.subtitulo || "—"], ["Tipo de sede", detailSede.tipo], ["Estado", detailSede.estado], ["Ciudad", detailSede.ciudad], ["Almacenes", `${detailSede.almacenes} almacenes asociados`]].map(([k, v]) => (
                      <div className="pxp-kv" key={k}><span>{k}</span><b>{v}</b></div>
                    ))}
                  </div>
                  <div className="pxp-detail-box">
                    <h3>▣ Dirección y operación</h3>
                    {[["Dirección", detailSede.direccion || "—"], ["Responsable", detailSede.responsable || "—"], ["Fecha de creación", detailSede.fechaCreacion || "—"], ["Última actualización", detailSede.actualizacion || "—"]].map(([k, v]) => (
                      <div className="pxp-kv" key={k}><span>{k}</span><b>{v}</b></div>
                    ))}
                  </div>
                  <div className="pxp-detail-box full">
                    <h3>▣ Descripción oficial de la sede</h3>
                    <p style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{detailSede.descripcion || "Sin descripción registrada para esta sede."}</p>
                  </div>
                </div>
              )}

              {detailTab === "Contacto" && (
                <div className="pxp-detail-box">
                  <h3>🏢 Datos de contacto</h3>
                  {[["Teléfono", detailSede.telefono || "—"], ["Email", detailSede.email || "—"], ["Responsable", detailSede.responsable || "—"], ["Dirección", detailSede.direccion || "—"]].map(([k, v]) => (
                    <div className="pxp-kv" key={k}><span>{k}</span><b>{v}</b></div>
                  ))}
                </div>
              )}

              {detailTab === "Almacenes" && (
                <div className="pxp-detail-box">
                  <h3>▣ Almacenes de la sede</h3>
                  {almacenes.filter(a => a.sede === detailSede.nombre).length > 0 ? (
                    <table className="pxp-detail-table">
                      <thead><tr><th>Almacén</th><th>Tipo</th><th style={{ textAlign: "right" }}>Productos</th><th style={{ textAlign: "right" }}>Estado</th></tr></thead>
                      <tbody>
                        {almacenes.filter(a => a.sede === detailSede.nombre).map(a => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                            <td>{a.tipo}</td>
                            <td style={{ textAlign: "right", color: "#059669", fontWeight: 700 }}>{a.productos.toLocaleString("es-PE")}</td>
                            <td style={{ textAlign: "right" }}>{a.estado}</td>
                          </tr>
                        ))}
                                            </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#1e293b" }}>Sin almacenes asociados</p>
                      <p style={{ margin: 0, fontSize: 13 }}>Registra almacenes desde el tablero inferior, sección Almacenes.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
      {modal === "import" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" onClick={e => e.stopPropagation()}>
        <div className="pxp-modal-head"><div className="pxp-heading-icon"><FileSpreadsheet size={20} /></div><div><h2>Importar sedes</h2><p>Carga sedes desde un archivo Excel o CSV. Puedes actualizar existentes o solo agregar nuevas.</p></div><button className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div>
        <div className="pxp-modal-body">
          <div className="pxp-stepper">{["Cargar archivo", "Mapear campos", "Validar datos", "Importar"].map((s, i) => <div key={s} className={`pxp-step ${importStep === i + 1 ? "active" : importStep > i + 1 ? "done" : ""}`}><span>{importStep > i + 1 ? "✓" : i + 1}</span><div><b>{s}</b><div className="pxp-muted">{["Selecciona tu archivo", "Relaciona las columnas", "Revisa los registros", "Confirma y procesa"][i]}</div></div></div>)}</div>
          {importStep === 1 && <div className="pxp-import-columns"><div className="pxp-panel"><h3>1. Cargar archivo</h3><p className="pxp-muted">Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv). Tamaño máximo: 10 MB.</p><label className="pxp-dropzone"><div style={{ fontSize: 30, color: "#2165ed" }}><Download size={32} /></div><b>{importFile ? importFile.name : "Arrastra tu archivo aquí"}</b><span className="pxp-muted">o haz clic para seleccionar</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => handleImportFile(e.target.files?.[0])} /></label><button className="pxp-link" onClick={() => showToast("La plantilla de ejemplo estará disponible al conectar el módulo de archivos.")}>Descargar plantilla de ejemplo (Excel)</button></div><div className="pxp-info"><b>Información importante</b><ul><li>Puedes importar sedes nuevas o actualizar existentes.</li><li>Usa los campos obligatorios: nombre y código.</li><li>Si el código ya existe, se actualizará según la opción elegida.</li><li>Puedes incluir ciudades, direcciones, tipos y almacenes.</li><li>Se validarán errores antes de importar.</li></ul></div></div>}
          {importStep === 2 && <div className="pxp-panel"><h3>2. Mapear campos</h3><p className="pxp-muted">Relaciona las columnas de tu archivo con los campos del sistema.</p>{["Código → Código (obligatorio)", "Nombre de la sede → Nombre (obligatorio)", "Ciudad → Ciudad", "Dirección → Dirección", "Tipo → Tipo de sede", "Almacenes → Almacenes", "Responsable → Responsable", "Teléfono → Teléfono"].map(row => <div className="pxp-map-row" key={row}><input value={row.split(" → ")[0]} readOnly /><select defaultValue={row.split(" → ")[1]}><option>{row.split(" → ")[1]}</option><option>Omitir columna</option><option>Descripción</option><option>Almacenes</option><option>Tipo de sede</option></select></div>)}</div>}
          {importStep === 3 && <div className="pxp-panel"><h3>3. Vista previa y validación</h3><p className="pxp-muted">{importFile ? `Archivo seleccionado: ${importFile.name}` : "Vista previa de registros de ejemplo."} Revisa los campos antes de continuar.</p><div className="pxp-preview-scroll"><table className="pxp-preview-table"><thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Ciudad</th><th>Tipo</th><th>Almacenes</th><th>Estado</th></tr></thead><tbody>{sedes.slice(0, 5).map((s, i) => <tr key={s.id}><td>{i + 1}</td><td>{s.codigo}</td><td>{s.nombre}</td><td>{s.ciudad}</td><td>{s.tipo}</td><td>{s.almacenes}</td><td><span className={`pxp-badge ${s.estado === "Activa" ? "ok" : "zero"}`}>{s.estado}</span></td></tr>)}</tbody></table></div></div>}
          {importStep === 4 && <div className="pxp-info"><h3>4. Confirmar importación</h3><p>Revisa el modo de importación. La ejecución real requiere conectar el servicio de importación del backend.</p><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "merge"} onChange={() => setImportOption("merge")} /> Agregar nuevos y actualizar existentes</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "new"} onChange={() => setImportOption("new")} /> Solo agregar nuevos</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "update"} onChange={() => setImportOption("update")} /> Solo actualizar existentes</label></div>}
        </div>
        <div className="pxp-modal-foot"><button className="pxp-btn" onClick={() => importStep > 1 ? setImportStep(s => s - 1) : setModal("")}>{importStep > 1 ? "← Anterior" : "Cancelar"}</button><button className="pxp-btn primary" onClick={() => { if (importStep < 4) { if (importStep === 1 && !importFile) { showToast("Selecciona un archivo para continuar"); return; } setImportStep(s => s + 1); } else finishImport(); }}>{importStep === 4 ? "Confirmar e importar" : "Continuar →"}</button></div>
      </section></div>}



      {modal === "sede" && (
        <div className="pxp-overlay" onClick={() => setModal("")} style={{ colorScheme: "light" }}>
          <section className="pxp-modal" style={{ maxWidth: 660, colorScheme: "light" }} onClick={e => e.stopPropagation()}>
            <form onSubmit={saveSede}>
              <div className="pxp-modal-head">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="pxp-heading-icon"><Warehouse size={20} strokeWidth={1.8} /></div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
                      {editing ? "Editar sede" : "Nueva sede"}
                    </h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5 }}>
                      {editing ? `Modificando: ${editing.nombre}` : "Registra una nueva sede con sus datos de operación"}
                    </p>
                  </div>
                </div>
                <button type="button" className="pxp-icon-btn close" onClick={() => setModal("")} title="Cerrar"><X size={18} /></button>
              </div>

              <div className="pxp-modal-body" style={{ maxHeight: "75vh", overflowY: "auto", padding: "20px 24px" }}>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Nombre de la sede <span style={{ color: "#ef4444" }}>*</span></div>
                  <input name="nombre" required defaultValue={form.nombre} className="pxp-form-input" placeholder="Ej. Sede Lima" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Código <span style={{ color: "#ef4444" }}>*</span></div>
                  <input name="codigo" required defaultValue={form.codigo} className="pxp-form-input" placeholder={`Ej. SED-${String(sedes.length + 1).padStart(3, "0")}`} />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Subtítulo</div>
                  <input name="subtitulo" defaultValue={form.subtitulo} className="pxp-form-input" placeholder="Ej. Oficina principal" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Tipo de sede</div>
                  <select name="tipo" defaultValue={form.tipo} className="pxp-form-input" style={{ colorScheme: "light" }}>
                    {["Principal", "Tienda", "Almacén", "Punto de venta"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Estado</div>
                  <select name="estado" defaultValue={form.estado} className="pxp-form-input" style={{ colorScheme: "light" }}>
                    <option>Activa</option>
                    <option>Inactiva</option>
                  </select>
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Ciudad</div>
                  <select name="ciudad" defaultValue={form.ciudad} className="pxp-form-input" style={{ colorScheme: "light" }}>
                    {["Lima", "Cusco", "Arequipa", "Trujillo"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Dirección <span style={{ color: "#ef4444" }}>*</span></div>
                  <input name="direccion" required defaultValue={form.direccion} className="pxp-form-input" placeholder="Ej. Av. José Pardo 123, Miraflores" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Responsable</div>
                  <input name="responsable" defaultValue={form.responsable} className="pxp-form-input" placeholder="Ej. Carlos Sandoval" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Teléfono</div>
                  <input name="telefono" defaultValue={form.telefono} className="pxp-form-input" placeholder="+51 987 654 321" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Email</div>
                  <input name="email" type="email" defaultValue={form.email} className="pxp-form-input" placeholder="sede@empresa.com" />
                </div>
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Cantidad de almacenes</div>
                  <input name="almacenes" type="number" min="0" defaultValue={form.almacenes} className="pxp-form-input" placeholder="0" />
                </div>
                <div className="pxp-form-row" style={{ gridTemplateColumns: "160px 1fr", alignItems: "start" }}>
                  <div className="pxp-form-label">Descripción</div>
                  <textarea name="descripcion" defaultValue={form.descripcion} className="pxp-form-input" style={{ minHeight: 70, resize: "vertical" }} placeholder="Notas sobre la sede, giro u horarios..." />
                </div>
              </div>

              <div className="pxp-modal-foot">
                <button type="button" className="pxp-btn" onClick={() => setModal("")}>Cancelar</button>
                <button type="submit" className="pxp-btn primary" style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff" }}>
                  {editing ? "Guardar cambios" : "Crear sede"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {toast && <div className="pxp-toast">{toast}</div>}
    </div>
  );
}

function Metric({ icon, label, value, note, stroke = "#ff4b0b", points = null }) {
  return (
    <div className="pxp-metric">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div className="pxp-metric-icon">{icon}</div>
          <span className="pxp-metric-label">{label}</span>
        </div>
      </div>
      <div className="pxp-metric-value">{value}</div>
      <div className="pxp-metric-note">{note}</div>
      {points && (
        <svg style={{ width: "100%", height: 32, marginTop: 8 }} viewBox="0 0 100 20" preserveAspectRatio="none">
          <polyline fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
      )}
    </div>
  );
}
