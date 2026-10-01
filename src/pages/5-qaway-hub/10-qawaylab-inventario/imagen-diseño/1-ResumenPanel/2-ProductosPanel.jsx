import React, { useMemo, useState, useRef, useEffect } from "react";
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

import { productService } from "../../src/services/productService";
import { useTenant } from "../../src/context/TenantContext";
import { useDismissOnEscapeOrOutside } from "../../../hooks/useDismissOnEscapeOrOutside";
import PxpPopup from "./PxpPopup";

/**
 * ProductosPanel.jsx
 * Panel de productos de Inventi Pro conectado al ecosistema Supabase.
 * Soporta stock por almacén/tiendas, unidades de medida, listas de precios (base, mayorista, mínimo, venta)
 * y sincronización en tiempo real con Supabase.
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
.pxp-root *{box-sizing:border-box}.pxp-layout{display:flex;min-height:100vh}.pxp-sidebar{width:220px;flex-shrink:0;background:#fff;border-right:1px solid var(--line);padding:16px 14px;display:flex;flex-direction:column;gap:10px}.pxp-brand{display:flex;align-items:center;gap:10px;padding:0 6px 18px}.pxp-logo{width:30px;height:30px;background:linear-gradient(135deg,#ff6b35,#ff4b0b);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);position:relative}.pxp-logo:after{content:"";position:absolute;inset:8px;background:#fff;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}.pxp-brand b{font-size:20px;letter-spacing:-.7px}.pxp-pro{font-size:11px;color:#ff4b0b;background:#fff2eb;border-radius:6px;padding:3px 7px;margin-left:4px}.pxp-brand small{display:block;color:var(--muted);font-size:11px;margin-top:1px}.pxp-nav{display:grid;gap:4px}.pxp-nav button{border:0;background:transparent;color:#34415b;text-align:left;padding:10px 12px;border-radius:7px;display:flex;align-items:center;gap:12px;font:inherit;cursor:pointer}.pxp-nav button.active{background:#fff2eb;color:#ff4b0b;font-weight:600}.pxp-nav .sep{height:1px;background:var(--line);margin:8px 2px}.pxp-plan{margin-top:auto;border:1px solid var(--line);border-radius:10px;padding:12px;background:#f8faff}.pxp-plan b{display:block}.pxp-plan small{color:var(--muted)}.pxp-progress{height:6px;border-radius:10px;background:#dfe7f2;margin:10px 0 7px;overflow:hidden}.pxp-progress i{display:block;width:40%;height:100%;background:var(--blue);border-radius:10px}.pxp-main{min-width:0;flex:1}.pxp-topbar{height:58px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 22px;gap:18px}.pxp-global-search{height:36px;max-width:600px;flex:1;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;gap:10px;padding:0 12px;color:var(--muted);background:#fbfcfe}.pxp-global-search input{border:0;outline:0;background:transparent;flex:1;font:inherit;min-width:0}.pxp-top-right{margin-left:auto;display:flex;align-items:center;gap:18px;color:#53627d}.pxp-avatar{width:32px;height:32px;border-radius:50%;background:#172b50;color:white;display:grid;place-items:center;font-weight:700}.pxp-content{padding:22px 20px;max-width:1800px;margin:auto}.pxp-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}.pxp-heading-icon{width:38px;height:38px;border-radius:10px;background:#f4f4f5;border:1px solid #e4e4e7;color:#18181b;display:grid;place-items:center;font-size:21px}.pxp-heading h1{font-size:28px;letter-spacing:-.8px;margin:0 0 2px;color:#111b2d}.pxp-heading p{margin:0;color:var(--muted)}.pxp-heading-actions{margin-left:auto;display:flex;gap:10px;align-items:center}.pxp-btn{border:1px solid var(--line);background:#fff;color:#34415b;border-radius:8px;padding:10px 14px;display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}.pxp-btn:hover{border-color:#b8c9e6;background:#f9fbff}.pxp-btn.primary{background:#ff4b0b;border-color:#ff4b0b;color:#fff;box-shadow:0 2px 8px rgba(255,75,11,0.25)}.pxp-btn.primary:hover{background:#ea3e00;border-color:#ea3e00;color:#fff}.pxp-btn.dark{background:#14213c;border-color:#14213c;color:#fff}.pxp-btn.small{padding:7px 10px;font-size:12px}.pxp-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:14px}.pxp-metric{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;min-width:0;box-shadow:0 4px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}.pxp-metric:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06)}.pxp-metric-icon{width:28px;height:28px;flex-shrink:0;border-radius:8px;display:grid;place-items:center;background:#f4f4f5;color:#52525b}.pxp-metric-label{font-size:12px;font-weight:600;color:#52525b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pxp-metric-value{font-size:26px;font-weight:800;letter-spacing:-.6px;color:#0f172a;margin-top:2px;white-space:nowrap}.pxp-metric-note{font-size:11px;font-weight:500;color:#71717a;margin-top:4px;display:flex;align-items:center;gap:5px}.pxp-up{color:#ff4b0b;font-weight:600}.pxp-toolbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:11px;margin-bottom:12px;flex-wrap:wrap;box-shadow:0 2px 10px rgba(0,0,0,0.03)}.pxp-search{display:flex;align-items:center;gap:9px;flex:1;min-width:220px;max-width:480px;border:1px solid var(--line);background:#f9fbfd;border-radius:8px;padding:0 12px;height:38px;color:#7b8aa5}.pxp-search input{border:0;outline:0;background:transparent;flex:1;min-width:0;font:inherit}.pxp-select-wrap{position:relative;display:inline-flex;align-items:center}.pxp-select{height:38px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:0 34px 0 12px;color:#334155;font:inherit;font-size:13px;font-weight:500;appearance:none;-webkit-appearance:none;cursor:pointer;outline:none;transition:border-color .15s ease}.pxp-select:hover{border-color:#cbd5e1}.pxp-select:focus{border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.1)}.pxp-select-chevron{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:#64748b}.pxp-dmenu{position:absolute;left:0;top:calc(100% + 8px);min-width:100%;width:100%;box-sizing:border-box;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.12),0 4px 12px rgba(15,23,42,0.06);padding:6px;z-index:1200;color-scheme:light}.pxp-dmenu-item{display:flex;width:100%;align-items:center;gap:8px;padding:8px 10px;border:0;background:transparent;border-radius:8px;font-size:13px;font-weight:500;color:#334155;cursor:pointer;text-align:left;transition:background .12s ease}.pxp-dmenu-item:hover{background:#f1f5f9;color:#0f172a}.pxp-dmenu-item.sel{background:#f4f4f5;color:#0f172a;font-weight:600}.pxp-dmenu-dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:#e2e8f0}.pxp-dmenu-item.sel .pxp-dmenu-dot{background:#52525b}.pxp-view-toggle{margin-left:auto;display:flex;gap:6px;align-items:center}.pxp-icon-btn{width:36px;height:36px;border:1px solid var(--line);background:#fff;border-radius:8px;color:#53627d;cursor:pointer;display:grid;place-items:center;font-size:17px}.pxp-icon-btn.selected{background:#eef4ff;border-color:#b7cdfa;color:#155de3}.pxp-table-wrap{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:visible;box-shadow:0 2px 10px rgba(0,0,0,0.02)}.pxp-table-scroll{overflow-x:auto}.pxp-table{width:100%;border-collapse:collapse;min-width:940px}.pxp-table th{background:#f8fafc;color:#475569;font-size:13px;font-weight:700;text-align:left;padding:15px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap;letter-spacing:.2px}.pxp-table td{padding:16px 16px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14.5px;white-space:nowrap}.pxp-table tr:last-child td{border-bottom:0}.pxp-table tbody tr:nth-child(even){background:#fafafa}.pxp-table tbody tr:hover{background:#f8fafc}.pxp-check{width:18px;height:18px;accent-color:var(--blue);cursor:pointer;border-radius:4px}.pxp-product-cell{display:flex;align-items:center;gap:13px;min-width:250px}.pxp-product-thumb{width:42px;height:42px;flex-shrink:0;border-radius:10px;background:#f8fafc;display:grid;place-items:center;border:1px solid #e2e8f0}.pxp-product-name{color:#0f172a;font-weight:700;font-size:14.5px}.pxp-product-sub{font-size:12px;color:#64748b;margin-top:2px}.pxp-stock{font-weight:700;font-size:14px}.pxp-stock.ok{color:#166534}.pxp-stock.low{color:#b45309}.pxp-stock.zero{color:#71717a}.pxp-badge{display:inline-flex;align-items:center;border-radius:6px;padding:4px 9px;font-size:12px;font-weight:650}.pxp-badge.ok{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}.pxp-badge.low{background:#fffbeb;color:#b45309;border:1px solid #fde68a}.pxp-badge.zero{background:#f4f4f5;color:#52525b;border:1px solid #e4e4e7}.pxp-actions{display:flex;gap:6px;justify-content:flex-end;position:relative}.pxp-action-menu{position:absolute;z-index:15;right:0;top:40px;width:190px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:0 12px 35px #182c4a20}.pxp-action-menu button{display:flex;width:100%;gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:10px;border-radius:6px;color:#34415b;font:inherit;cursor:pointer}.pxp-action-menu button:hover{background:#f2f6fc}.pxp-action-menu button.danger{color:#e11d48}.pxp-table-footer{display:flex;align-items:center;gap:12px;padding:15px 18px;color:#64748b;font-size:13px;border-top:1px solid var(--line);flex-wrap:wrap}.pxp-footer-spacer{flex:1}.pxp-pagination{display:flex;gap:6px;align-items:center}.pxp-pagination button{width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;color:#34415b;cursor:pointer}.pxp-pagination button.active{background:var(--blue);color:white;border-color:var(--blue)}.pxp-pagination button:disabled{opacity:.4;cursor:default}
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
.pxp-empty{padding:45px;text-align:center;color:var(--muted)}.pxp-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;contain:paint}.pxp-modal{background:#fff;border-radius:16px;width:min(640px,100%);max-height:92vh;overflow-y:auto;box-shadow:0 25px 80px rgba(12,27,53,0.22);z-index:9999;isolation:isolate;contain:content}input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type="number"]{-moz-appearance:textfield;appearance:textfield}.pxp-modal-head{padding:20px 24px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between}.pxp-modal-head h2{margin:0;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.4px}.pxp-modal-head .close{font-size:22px;color:#64748b;background:none;border:0;cursor:pointer;line-height:1}.pxp-modal-body{padding:22px 24px}.pxp-form-row{display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:center;margin-bottom:15px}.pxp-form-label{font-size:13px;font-weight:650;color:#334155;line-height:1.3}.pxp-form-label span.req{color:#ef4444;margin-left:2px}.pxp-form-input{width:100%;border:1px solid transparent;background:#f4f4f6;border-radius:12px;padding:11px 14px;font:inherit;font-size:13.5px;color:#0f172a;outline:none;transition:border-color .15s ease,box-shadow .15s ease}select.pxp-form-input,select.pxp-compound-sel{cursor:pointer}.pxp-form-input:focus{background:#fff;border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.12)}.pxp-compound{display:flex;border-radius:12px;background:#f4f4f6;overflow:hidden;border:1px solid transparent}.pxp-compound:focus-within{background:#fff;border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.12)}.pxp-compound-sel{border:0;background:transparent;padding:0 12px;font-weight:700;color:#0f172a;outline:none;cursor:pointer;border-right:1px solid #e4e4e7}.pxp-compound-input{border:0;background:transparent;padding:11px 14px;flex:1;min-width:0;font:inherit;font-size:13.5px;color:#0f172a;outline:none}.pxp-compound-tag{display:flex;align-items:center;gap:4px;padding:0 12px;font-size:11.5px;font-weight:650;color:#166534;white-space:nowrap}.pxp-modal-foot{padding:16px 24px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;background:#fafafa;border-bottom-left-radius:16px;border-bottom-right-radius:16px}.pxp-field{display:grid;gap:6px;margin-bottom:13px}.pxp-field label{font-size:12px;color:#53627d;font-weight:600}.pxp-field input,.pxp-field select,.pxp-field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:10px 11px;font:inherit;outline-color:#9ab9ff;background:white}.pxp-field textarea{min-height:90px;resize:vertical}.pxp-map-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}.pxp-preview-table{width:100%;border-collapse:collapse;font-size:12px}.pxp-preview-table th,.pxp-preview-table td{padding:10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}.pxp-preview-scroll{overflow:auto}.pxp-detail{position:fixed;z-index:9999;right:0;top:0;bottom:0;width:min(760px,95vw);background:#fff;box-shadow:-20px 0 60px rgba(15,23,42,0.16);overflow-y:auto;animation:pxpSlideIn .25s cubic-bezier(.16,1,.3,1)}.pxp-detail-head{padding:24px 28px 18px;border-bottom:1px solid var(--line)}.pxp-detail-close{position:absolute;right:18px;top:18px;z-index:10;width:34px;height:34px;border-radius:8px;background:#f8fafc;border:1px solid var(--line);color:#475569;display:grid;place-items:center;font-size:20px;cursor:pointer;transition:all .2s ease}.pxp-detail-close:hover{background:#fee2e2;color:#ef4444;border-color:#fca5a5}.pxp-detail-product{display:flex;gap:18px;align-items:center;padding-right:48px}.pxp-detail-art{width:68px;height:68px;border-radius:12px;background:#f8fafc;display:grid;place-items:center;flex-shrink:0;border:1px solid #e2e8f0}.pxp-detail-title{font-size:21px;font-weight:800;letter-spacing:-.4px;margin:0 0 6px;color:#0f172a}.pxp-detail-tabs{display:flex;gap:2px;overflow-x:auto;padding:0 24px;border-bottom:1px solid var(--line);background:#fafafa}.pxp-detail-tabs button{padding:12px 14px;border:0;border-bottom:2px solid transparent;background:transparent;color:#64748b;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:color .15s ease}.pxp-detail-tabs button:hover{color:#0f172a}.pxp-detail-tabs button.active{color:#ff4b0b;border-color:#ff4b0b;font-weight:700}.pxp-detail-content{padding:22px 28px}.pxp-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pxp-detail-box{border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.02)}.pxp-detail-box h3{margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9}.pxp-detail-box.full{grid-column:1/-1}.pxp-kv{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f8fafc;font-size:13px}.pxp-kv:last-child{border-bottom:0}.pxp-kv span{color:#64748b;font-weight:500}.pxp-kv b{text-align:right;font-weight:650;color:#0f172a}.pxp-detail-table{width:100%;border-collapse:collapse;font-size:13px}.pxp-detail-table th{background:#f8fafc;color:#475569;font-weight:700;text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12.5px}.pxp-detail-table td{text-align:left;padding:10px 10px;border-bottom:1px solid #f1f5f9;color:#334155}.pxp-detail-table tr:last-child td{border-bottom:0}.pxp-toast{position:fixed;bottom:20px;right:20px;z-index:100;background:#14213c;color:#fff;padding:12px 18px;border-radius:9px;box-shadow:0 8px 25px #0e1e3b33}.pxp-mobile-menu{display:none}
@media(max-width:1500px){.pxp-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}}
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

const DEFAULT_PRODUCT_FORM = {
  name: "",
  sku: "",
  category: "Alimentos",
  stock: 0,
  minStock: 5,
  price: "",
  cost: "",
  wholesale: "",
  minPrice: "",
  location: "Almacén Principal",
  unit: "un.",
  brand: "",
  barcode: "",
  weight: "",
  dimensions: "",
  condition: 10,
  hasStock: true,
  igvType: "IGV (18.00%)",
  marginProfit: "",
  discount: 0,
  sunatCode: "",
  inPos: true,
  description: "",
  currency: "PEN",
  includesIgv: true
};

const ProductModal = React.memo(function ProductModal({ editing, form: initialForm, categories, onClose, onSave }) {
  const [form, setForm] = useState(() => initialForm || DEFAULT_PRODUCT_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, e);
  };

  return (
    <div className="pxp-overlay" onClick={onClose}>
      <section className="pxp-modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="pxp-modal-head">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="pxp-heading-icon">
                <Boxes size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
                  {editing ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {editing ? `Modificando: ${editing.name}` : "Completa los datos para registrarlo en tu inventario."}
                </p>
              </div>
            </div>
            <button type="button" className="pxp-icon-btn close" onClick={onClose} title="Cerrar"><X size={18} /></button>
          </div>

          <div className="pxp-modal-body" style={{ maxHeight: "75vh", overflowY: "auto", padding: "20px 24px" }}>
            {/* Pill selectors: Con inventario vs Servicio */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button
                type="button"
                className={`pxp-pill-btn ${form.hasStock ? "active" : ""}`}
                onClick={() => setForm(prev => ({ ...prev, hasStock: true }))}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: form.hasStock ? "1.5px solid #52525b" : "1px solid #e2e8f0",
                  background: form.hasStock ? "#f4f4f5" : "#fff",
                  color: form.hasStock ? "#0f172a" : "#475569",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all .15s ease"
                }}
              >
                <Package size={15} /> Con inventario / stock
              </button>
              <button
                type="button"
                className={`pxp-pill-btn ${!form.hasStock ? "active" : ""}`}
                onClick={() => setForm(prev => ({ ...prev, hasStock: false }))}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: !form.hasStock ? "1.5px solid #ff4b0b" : "1px solid #e2e8f0",
                  background: !form.hasStock ? "#fff2eb" : "#fff",
                  color: !form.hasStock ? "#ff4b0b" : "#475569",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all .15s ease"
                }}
              >
                <Briefcase size={15} /> Servicio / Intangible
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Nombre */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Nombre del producto <span style={{ color: "#ef4444" }}>*</span></div>
                <input
                  required
                  className="pxp-form-input"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Café Geisha Villa Rica 250g"
                />
              </div>

              {/* SKU / Código */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Código / SKU <span style={{ color: "#ef4444" }}>*</span></div>
                <input
                  required
                  className="pxp-form-input"
                  value={form.sku}
                  onChange={e => setForm(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Ej. CAF-GEI-250"
                />
              </div>

              {/* Precio de venta con selector de moneda y switch de IGV */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Precio de venta <span style={{ color: "#ef4444" }}>*</span></div>
                <div>
                  <div className="pxp-compound">
                    <select
                      className="pxp-compound-sel"
                      value={form.currency || "PEN"}
                      onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="PEN">S/ (PEN)</option>
                      <option value="USD">$ (USD)</option>
                    </select>
                    <input
                      required
                      type="text"
                      inputMode="decimal"
                      className="pxp-compound-input"
                      value={form.price}
                      onChange={e => {
                        const newPrice = e.target.value;
                        if (newPrice === "" || /^\d*\.?\d*$/.test(newPrice)) {
                          const costVal = Number(form.cost) || 0;
                          let margin = form.marginProfit;
                          if (costVal && Number(newPrice) > 0) {
                            margin = Math.round(((Number(newPrice) - costVal) / Number(newPrice)) * 100);
                          }
                          setForm(prev => ({ ...prev, price: newPrice, marginProfit: margin }));
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Selector diseñado de Afectación IGV */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "0 2px" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Precio incluye IGV</span>
                    <div style={{ display: "inline-flex", background: "#f1f5f9", padding: 2, borderRadius: 8, gap: 2, border: "1px solid #e2e8f0" }}>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, includesIgv: false }))}
                        style={{
                          border: 0,
                          padding: "3px 12px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: form.includesIgv === false ? "#fff" : "transparent",
                          color: form.includesIgv === false ? "#0f172a" : "#64748b",
                          boxShadow: form.includesIgv === false ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          transition: "all .15s ease"
                        }}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, includesIgv: true }))}
                        style={{
                          border: 0,
                          padding: "3px 12px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: form.includesIgv !== false ? "#ff4b0b" : "transparent",
                          color: form.includesIgv !== false ? "#fff" : "#64748b",
                          boxShadow: form.includesIgv !== false ? "0 1px 3px rgba(255,75,11,0.25)" : "none",
                          transition: "all .15s ease"
                        }}
                      >
                        Sí
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impuesto */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Tipo de Impuesto</div>
                <PxpPopup
                  value={form.igvType || "IGV (18.00%)"}
                  onChange={v => setForm(prev => ({ ...prev, igvType: v }))}
                  options={["IGV (18.00%)", "Exonerado (0.00%)", "Inafecto (0.00%)"].map(v => ({ v, l: v }))}
                  wrapStyle={{ width: "100%" }}
                />
              </div>

              {/* Unidad de medida */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Unidad de medida</div>
                <PxpPopup
                  value={form.unit || "un."}
                  onChange={v => setForm(prev => ({ ...prev, unit: v }))}
                  options={[
                    { v: "un.", l: "NIU - Unidades (Bienes)" },
                    { v: "kg", l: "KGM - Kilogramos" },
                    { v: "l", l: "LTR - Litros" },
                    { v: "serv.", l: "ZZ - Servicio (Unidad)" },
                    { v: "caja", l: "BX - Caja" },
                    { v: "bolsa", l: "BG - Bolsa" },
                    { v: "frasco", l: "FR - Frasco" },
                    { v: "saco", l: "SA - Saco" },
                  ]}
                  wrapStyle={{ width: "100%" }}
                />
              </div>

              {/* Categoría y Sede */}
              <div className="pxp-form-row">
                <div className="pxp-form-label">Categoría y Sede</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <PxpPopup
                    value={form.category}
                    onChange={v => setForm(prev => ({ ...prev, category: v }))}
                    options={[...new Set([...categories.filter(c => c !== "Todas"), "Alimentos", "Veterinaria", "Mascotas", "Servicios", "General"])].map(c => ({ v: c, l: c }))}
                    wrapStyle={{ width: "100%" }}
                  />
                  <PxpPopup
                    value={form.location}
                    onChange={v => setForm(prev => ({ ...prev, location: v }))}
                    options={["Almacén Principal", "Tienda Sur", "Tienda Online"].map(v => ({ v, l: v }))}
                    wrapStyle={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Stock inicial (si aplica) */}
              {form.hasStock && (
                <div className="pxp-form-row">
                  <div className="pxp-form-label">Stock y Alerta Mínima</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="pxp-form-input"
                        value={form.stock}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^\d*$/.test(val)) {
                            setForm(prev => ({ ...prev, stock: val }));
                          }
                        }}
                        placeholder="Stock inicial"
                      />
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>Stock inicial actual</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="pxp-form-input"
                        value={form.minStock}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^\d*$/.test(val)) {
                            setForm(prev => ({ ...prev, minStock: val }));
                          }
                        }}
                        placeholder="Alerta mínima"
                      />
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>Avisar cuando quede &le;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Opciones avanzadas toggle */}
              <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    background: "none",
                    border: 0,
                    color: "#ff4b0b",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 0
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{showAdvanced ? <>Ocultar opciones avanzadas <ChevronUp size={15} /></> : <>Opciones avanzadas <ChevronDown size={15} /></>}</span>
                </button>
              </div>

              {/* Acordeón Opciones avanzadas */}
              {showAdvanced && (
                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16
                }}>
                  {/* Costo de compra y Margen */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Costo de compra ({form.currency === "USD" ? "$" : "S/"})
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="pxp-form-input"
                        value={form.cost}
                        onChange={e => {
                          const newCost = e.target.value;
                          if (newCost === "" || /^\d*\.?\d*$/.test(newCost)) {
                            const priceVal = Number(form.price) || 0;
                            let margin = form.marginProfit;
                            if (priceVal > 0 && Number(newCost) > 0) {
                              margin = Math.round(((priceVal - Number(newCost)) / priceVal) * 100);
                            }
                            setForm(prev => ({ ...prev, cost: newCost, marginProfit: margin }));
                          }
                        }}
                        placeholder="Ej. 15.00"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Margen de ganancia (%)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="pxp-form-input"
                        value={form.marginProfit}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^-?\d*$/.test(val)) {
                            setForm(prev => ({ ...prev, marginProfit: val }));
                          }
                        }}
                        placeholder="Ej. 40"
                      />
                    </div>
                  </div>

                  {/* Precios escalonados: Mayorista y Mínimo */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Precio Mayorista (S/)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="pxp-form-input"
                        value={form.wholesale}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setForm(prev => ({ ...prev, wholesale: val }));
                          }
                        }}
                        placeholder="Precio por volumen"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Precio Mínimo de venta (S/)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="pxp-form-input"
                        value={form.minPrice}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setForm(prev => ({ ...prev, minPrice: val }));
                          }
                        }}
                        placeholder="Límite piso descuento"
                      />
                    </div>
                  </div>

                  {/* Escala de condición Qaway (1-10) y Marca */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Condición / Calidad (Escala 1-10)
                      </label>
                      <PxpPopup
                        value={form.condition}
                        onChange={v => setForm(prev => ({ ...prev, condition: Number(v) }))}
                        options={[10, 9, 8, 7, 6, 5].map(n => ({ v: n, l: `${n}/10 - ${n === 10 ? "Nuevo / Óptimo" : n >= 8 ? "Excelente estado" : "Aceptable"}` }))}
                        wrapStyle={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Marca o Laboratorio
                      </label>
                      <input
                        className="pxp-form-input"
                        value={form.brand}
                        onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Ej. Origen Perú / Bayer"
                      />
                    </div>
                  </div>

                  {/* Código de barras y Código SUNAT */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Código de barras (EAN-13)
                      </label>
                      <input
                        className="pxp-form-input"
                        value={form.barcode}
                        onChange={e => setForm(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="7750123456789"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Código SUNAT (Catálogo 25)
                      </label>
                      <input
                        className="pxp-form-input"
                        value={form.sunatCode}
                        onChange={e => setForm(prev => ({ ...prev, sunatCode: e.target.value }))}
                        placeholder="Ej. 50201706"
                      />
                    </div>
                  </div>

                  {/* Peso y Dimensiones */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Peso (kg / gr)
                      </label>
                      <input
                        className="pxp-form-input"
                        value={form.weight}
                        onChange={e => setForm(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="Ej. 0.25 kg"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                        Dimensiones (L × A × Alto cm)
                      </label>
                      <input
                        className="pxp-form-input"
                        value={form.dimensions}
                        onChange={e => setForm(prev => ({ ...prev, dimensions: e.target.value }))}
                        placeholder="Ej. 12 × 7 × 20 cm"
                      />
                    </div>
                  </div>

                  {/* Toggle Visible en POS */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                    <div>
                      <b style={{ fontSize: 13, color: "#1e293b", display: "block" }}>Visible en Punto de Venta (POS)</b>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>Permitir cobrar este ítem en caja rápida</span>
                    </div>
                    <input
                      type="checkbox"
                      className="pxp-check"
                      checked={form.inPos}
                      onChange={e => setForm(prev => ({ ...prev, inPos: e.target.checked }))}
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 650, color: "#475569", display: "block", marginBottom: 6 }}>
                      Descripción detallada
                    </label>
                    <textarea
                      className="pxp-form-input"
                      style={{ minHeight: 70, resize: "vertical" }}
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Notas, especificaciones o ingredientes..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pxp-modal-foot">
            <button type="button" className="pxp-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="pxp-btn primary" style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff" }}>
              {editing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
});

export default function ProductosPanel() {
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

  const activeTenant = tenantCtx?.activeTenant || null;
  const activeTenantId = tenantCtx?.activeTenantId || null;
  const isPlatformAdmin = Boolean(tenantCtx?.isPlatformAdmin);
  const canCreateProduct = tenantCtx ? tenantCtx.canCreateProduct : true;

  const handleNavigateCapture = () => {
    const isHub = typeof window !== "undefined" && window.location.pathname.startsWith("/hub/inventario");
    const targetUrl = isHub ? "/hub/inventario/captura" : "/captura";
    if (navigate) {
      navigate(targetUrl);
    } else if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    }
  };

  // Do not render demo inventory while the authoritative source is loading.
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
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
  const [gridCols, setGridCols] = useState(5);
  const [menuId, setMenuId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [fullProduct, setFullProduct] = useState(null);
  const [detailTab, setDetailTab] = useState("Resumen");
  const [modal, setModal] = useState("");
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importOption, setImportOption] = useState("merge");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultForm = DEFAULT_PRODUCT_FORM;

  const [form, setForm] = useState(defaultForm);

  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const columnPickerRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const bulkMenuRef = useRef(null);
  const filterMenuRef = useRef(null);

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
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuId(null);
        setShowBulkMenu(false);
        setModal("");
        setDetailProduct(null);
        setOpenFilter(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleBulkStatusChange = (newStatus) => {
    setProducts(prev => prev.map(p => selected.includes(p.id) ? { ...p, status: newStatus } : p));
    showToast(`${selected.length} productos marcados como "${newStatus}"`);
    setShowBulkMenu(false);
  };

  const handleBulkDuplicate = () => {
    const toDuplicate = products.filter(p => selected.includes(p.id));
    const copies = toDuplicate.map((p, i) => ({
      ...p,
      id: `copy-${Date.now()}-${i}`,
      name: `${p.name} (copia)`,
      sku: `${p.sku}-COPY`
    }));
    setProducts(prev => [...copies, ...prev]);
    showToast(`${toDuplicate.length} productos duplicados`);
    setShowBulkMenu(false);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar los ${selected.length} productos seleccionados?`)) {
      const count = selected.length;
      setProducts(prev => prev.filter(p => !selected.includes(p.id)));
      setSelected([]);
      showToast(`${count} productos eliminados correctamente`);
      setShowBulkMenu(false);
    }
  };

  const handleBulkExportCSV = () => {
    const selectedItems = products.filter(p => selected.includes(p.id));
    if (selectedItems.length === 0) return;
    const headers = ["ID", "Producto", "SKU", "Código de Barras", "Categoría", "Marca", "Stock", "Precio Base", "Precio Mayorista", "Estado", "Ubicación"];
    const rows = selectedItems.map(p => [
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
    link.setAttribute("download", `productos_seleccionados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${selectedItems.length} productos exportados en CSV`);
    setShowBulkMenu(false);
  };

  // Sincronización en vivo con Supabase por empresa activa
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseProducts() {
      setIsLoadingProducts(true);
      try {
        if (isPlatformAdmin && !activeTenantId) {
          if (isMounted) {
            setProducts([]);
            setIsLoadingProducts(false);
          }
          return;
        }

        const res = await productService.getProducts({ tenant_id: activeTenantId || undefined });
        const sourceProducts = Array.isArray(res?.data) ? res.data : [];
        const mapped = sourceProducts.map((p, idx) => ({
            id: p.id || `prod-sb-${idx}`,
            name: p.name || "Producto sin nombre",
            detail: p.description ? p.description.slice(0, 35) : "",
            sku: p.sku || `SKU-${idx + 1}`,
            category: p.category || "General",
            stock: Number(p.stock) || 0,
            price: Number(p.base_price) || 0,
            cost: Number(p.cost) || 0,
            salePrice: Number(p.base_price) || 0,
            wholesale: Number(p.base_price ? p.base_price * 0.85 : 0),
            minPrice: Number(p.base_price ? p.base_price * 0.75 : 0),
            status: Number(p.stock) === 0 ? "Sin stock" : Number(p.stock) <= (p.min_stock || 10) ? "Stock bajo" : "Disponible",
            location: "Almacén Principal",
            image: "📦",
            barcode: p.sku || "",
            brand: p.brand || "—",
            presentation: p.unit || "un.",
            unit: p.unit || "un.",
            weight: "—",
            dimensions: "—",
            condition: p.condition || 10,
            description: p.description || "",
            warehouse: [
              { name: "Almacén Principal", stock: Number(p.stock) || 0, min: Number(p.min_stock) || 0 },
              { name: "Tienda Sur", stock: 0, min: 0 }
            ]
        }));

        if (isMounted) setProducts(mapped);
      } catch (err) {
        console.warn("[Inventi] Supabase live fetch fallback:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    loadSupabaseProducts();
    return () => { isMounted = false; };
  }, [activeTenantId, isPlatformAdmin]);

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
  
  const openNew = () => {
    if (isPlatformAdmin && !activeTenantId) {
      showToast("Debes seleccionar una empresa en la barra superior antes de registrar un producto.");
      return;
    }
    setEditing(null);
    setForm(defaultForm);
    setShowAdvanced(false);
    setModal("product");
  };

  const openEdit = p => {
    setEditing(p);
    const pCost = p.cost ?? (p.price ? Math.round(p.price * 0.5) : "");
    const pMargin = pCost && p.price ? Math.round(((p.price - pCost) / p.price) * 100) : "";
    setForm({
      ...defaultForm,
      name: p.name || "",
      sku: p.sku || "",
      category: p.category || "Alimentos",
      stock: p.stock ?? 0,
      minStock: p.warehouse?.[0]?.min ?? 5,
      price: p.price ?? "",
      cost: pCost,
      wholesale: p.wholesale ?? "",
      minPrice: p.minPrice ?? "",
      location: p.location || "Almacén Principal",
      unit: p.unit || "un.",
      brand: p.brand || "",
      barcode: p.barcode || "",
      weight: p.weight || "",
      dimensions: p.dimensions || "",
      condition: p.condition || 10,
      hasStock: (p.stock ?? 0) > 0 || true,
      igvType: "IGV (18.00%)",
      marginProfit: pMargin,
      discount: 0,
      sunatCode: "",
      inPos: true,
      description: p.description || "",
      currency: "PEN"
    });
    setShowAdvanced(false);
    setDetailProduct(null);
    setModal("product");
    setMenuId(null);
  };

  const saveProduct = async (formData, e) => {
    if (e?.preventDefault) e.preventDefault();
    else if (formData?.preventDefault) {
      formData.preventDefault();
      formData = null;
    }
    const currentForm = (formData && typeof formData === 'object' && 'name' in formData) ? formData : form;
    const stock = Number(currentForm.stock) || 0;
    const price = Number(currentForm.price) || 0;
    const cost = Number(currentForm.cost) || Math.round(price * 0.5);
    const wholesale = Number(currentForm.wholesale) || Number((price * 0.85).toFixed(2));
    const minPrice = Number(currentForm.minPrice) || Number((price * 0.75).toFixed(2));
    const minStock = Number(currentForm.minStock) || 5;
    const statusText = stock === 0 ? "Sin stock" : stock <= minStock ? "Stock bajo" : "Disponible";

    if (editing) {
      try {
        if (typeof editing.id === 'string' && !editing.id.startsWith('prod-')) {
          await productService.updateProduct(editing.id, {
            name: currentForm.name,
            sku: currentForm.sku,
            base_price: price,
            price: price,
            stock,
            unit: currentForm.unit || "un.",
            brand: currentForm.brand || "Marca Propia",
            description: currentForm.description || ""
          });
        }
        setProducts(prev => prev.map(p => p.id === editing.id ? {
          ...p,
          ...currentForm,
          stock,
          price,
          cost,
          wholesale,
          minPrice,
          status: statusText,
          warehouse: [
            { name: currentForm.location, stock, min: minStock },
            ...(p.warehouse?.filter(w => w.name !== currentForm.location) || [])
          ]
        } : p));
        if (detailProduct?.id === editing.id) {
          setDetailProduct(prev => ({
            ...prev,
            ...currentForm,
            stock,
            price,
            cost,
            wholesale,
            minPrice,
            status: statusText,
            warehouse: [
              { name: currentForm.location, stock, min: minStock },
              ...(prev.warehouse?.filter(w => w.name !== currentForm.location) || [])
            ]
          }));
        }
        showToast("Producto actualizado correctamente");
        setModal("");
      } catch (err) {
        console.error("[Inventi] Error al actualizar producto:", err);
        showToast(`Error al actualizar: ${err.message || 'Error en base de datos'}`);
      }
    } else {
      if (isPlatformAdmin && !activeTenantId) {
        showToast("Debes seleccionar una empresa en la barra superior antes de registrar un producto.");
        return;
      }
      try {
        const created = await productService.createProduct({
          name: currentForm.name,
          sku: currentForm.sku || undefined,
          base_price: price,
          price: price,
          stock,
          unit: currentForm.unit || "un.",
          brand: currentForm.brand || "Marca Propia",
          description: currentForm.description || "",
          category: currentForm.category || "Alimentos",
          status: "active",
          type: "simple",
          commercial_status: "available",
          condition: 10,
          tenant_id: activeTenantId || undefined
        });

        const newP = {
          ...currentForm,
          id: created?.id || `prod-${Date.now()}`,
          stock,
          price,
          cost,
          wholesale,
          minPrice,
          status: statusText,
          detail: currentForm.description ? currentForm.description.slice(0, 35) : "",
          image: "📦",
          barcode: currentForm.barcode || currentForm.sku,
          brand: currentForm.brand || "Marca Propia",
          presentation: currentForm.unit || "un.",
          unit: currentForm.unit || "un.",
          weight: currentForm.weight || "—",
          dimensions: currentForm.dimensions || "—",
          condition: currentForm.condition || 10,
          warehouse: [{ name: currentForm.location, stock, min: minStock }]
        };

        setProducts(prev => [newP, ...prev]);
        setPage(1);
        showToast("Producto creado correctamente en base de datos");
        setModal("");
      } catch (err) {
        console.error("[Inventi] Error al crear producto en Supabase:", err);
        showToast(`Error al guardar producto: ${err.message || 'Error en base de datos'}`);
      }
    } 
  };
  const handleImportFile = file => { if (!file) return; setImportFile(file); setImportStep(2); };
  const finishImport = () => { showToast(importFile ? `Archivo "${importFile.name}" listo para procesar (demo)` : "Selecciona un archivo para continuar"); setModal(""); setImportStep(1); setImportFile(null); };
  const toggleSelected = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = checked => setSelected(checked ? pageRows.map(p => p.id) : []);
  const resetImport = () => { setImportStep(1); setImportFile(null); setModal("import"); };

  if (fullProduct) {
    return (
      <div className="pxp-root" style={{ background: "#fff", minHeight: "100vh", padding: "28px 36px" }}>
        <style>{css}</style>
        <button
          onClick={() => setFullProduct(null)}
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
            {fullProduct.imageUrl ? (
              <img
                src={fullProduct.imageUrl}
                alt={fullProduct.name}
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
                {fullProduct.sku}
              </span>
              <span className={`pxp-badge ${statusClass(fullProduct.status)}`}>
                {fullProduct.status}
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              {fullProduct.name}
            </h1>
            <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: 14, margin: "0 0 24px" }}>
              {fullProduct.description ||
                "Lleva tus habilidades al siguiente nivel con este producto."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Precio base</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{money(fullProduct.price)}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "14px 12px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Stock</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{fullProduct.stock}</div>
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
              <div>Tipo: <b style={{ color: "#1e293b" }}>{fullProduct.category}</b></div>
              <div>Marca: <b style={{ color: "#1e293b" }}>{fullProduct.brand || "—"}</b></div>
              <div>Ubicación: <b style={{ color: "#1e293b" }}>{fullProduct.location || "—"}</b></div>
              <div>Creado: <b style={{ color: "#1e293b" }}>18 set. 2026</b></div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="pxp-btn primary" onClick={() => openEdit(fullProduct)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Edit size={15} /> Editar
              </button>
              <button
                className="pxp-btn"
                style={{ color: "#e11d48", borderColor: "#fecdd3", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  if (window.confirm(`¿Eliminar "${fullProduct.name}"?`)) {
                    setProducts(prev => prev.filter(x => x.id !== fullProduct.id));
                    setFullProduct(null);
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
          <ProductModal
            editing={editing}
            form={form}
            setForm={setForm}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            categories={categories}
            onClose={() => setModal("")}
            onSave={saveProduct}
          />
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
                <div className="pxp-heading-icon"><Boxes size={22} strokeWidth={1.8} /></div>
                <div>
                  <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 2px", color: "#111b2d" }}>Productos</h1>
                  <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                    {isLoadingProducts ? "Cargando inventario..." : `${products.length} productos en tu inventario.`}
                  </p>
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
                  style={{ background: "#1e293b", borderColor: "#1e293b", color: "#fff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}
                  onClick={handleNavigateCapture}
                  title="Capturar y digitalizar producto con IA / Cámara"
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
                  title={isPlatformAdmin && !activeTenantId ? "Selecciona una empresa en la barra superior para crear productos" : "Crear nuevo producto"}
                >
                  <Plus size={15} /> Nuevo producto <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <section className="pxp-metrics">
              <Metric icon={<Boxes size={16} strokeWidth={1.75} />} label="Total de productos" value={isLoadingProducts ? "—" : products.length.toLocaleString("es-PE")} note={<><span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] inline-block animate-pulse" /> {isLoadingProducts ? "Cargando..." : "Data en vivo"}</>} stroke="#ff4b0b" points="0,15 20,10 40,18 60,5 80,12 100,2" />
              <Metric icon={<CheckCircle2 size={16} strokeWidth={1.75} />} label="Con stock" value={isLoadingProducts ? "—" : products.filter(p => p.stock > 10).length.toLocaleString("es-PE")} note={isLoadingProducts ? "Cargando..." : `${Math.round(products.filter(p => p.stock > 0).length / Math.max(products.length, 1) * 100)}% del total`} stroke="#10b981" points="0,18 20,14 40,16 60,8 80,10 100,2" />
              <Metric icon={<AlertTriangle size={16} strokeWidth={1.75} />} label="Stock bajo" value={isLoadingProducts ? "—" : products.filter(p => p.stock > 0 && p.stock <= 10).length.toLocaleString("es-PE")} note={isLoadingProducts ? "Cargando..." : `${Math.round(products.filter(p => p.stock > 0 && p.stock <= 10).length / Math.max(products.length, 1) * 100)}% del total`} stroke="#f59e0b" points="0,14 20,16 40,10 60,15 80,8 100,12" />
              <Metric icon={<XCircle size={16} strokeWidth={1.75} />} label="Sin stock" value={isLoadingProducts ? "—" : products.filter(p => p.stock === 0).length.toLocaleString("es-PE")} note={isLoadingProducts ? "Cargando..." : `${Math.round(products.filter(p => p.stock === 0).length / Math.max(products.length, 1) * 100)}% del total`} stroke="#71717a" points="0,15 25,12 50,14 75,10 100,16" />
              <Metric icon={<CircleDollarSign size={16} strokeWidth={1.75} />} label="Valor de inventario" value={isLoadingProducts ? "—" : money(inventoryValue)} note={isLoadingProducts ? "Cargando..." : <span style={{ color: "#ff4b0b", fontWeight: 600 }}>↑ 9% vs. mes anterior</span>} stroke="#ff4b0b" points="0,16 20,12 40,15 60,7 80,9 100,3" />
            </section>

            <div className="pxp-toolbar">
              <div className="pxp-search"><Search size={15} style={{ color: "var(--muted)" }} /><input value={query} placeholder="Buscar por nombre, SKU o código..." onChange={e => { setQuery(e.target.value); setPage(1); }} /></div>
              
              {/* 2 Filtros Principales en la barra superior */}
              <div className="pxp-select-wrap" ref={openFilter === "category" ? filterMenuRef : null}>
                <button type="button" className="pxp-select" style={{ textAlign: "left", width: "100%" }} onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}>
                  {category === "Todas" ? "Categoría: Todas" : category}
                </button>
                <ChevronDown size={14} className="pxp-select-chevron" />
                {openFilter === "category" && (
                  <div className="pxp-dmenu">
                    {["Todas", ...categories.filter(c => c !== "Todas")].map(opt => (
                      <button type="button" key={opt} className={`pxp-dmenu-item ${category === opt ? "sel" : ""}`} onClick={() => { setCategory(opt); setPage(1); setOpenFilter(null); }}>
                        <span className="pxp-dmenu-dot" /> <span>{opt === "Todas" ? "Categoría: Todas" : opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pxp-select-wrap" ref={openFilter === "stock" ? filterMenuRef : null}>
                <button type="button" className="pxp-select" style={{ textAlign: "left", width: "100%" }} onClick={() => setOpenFilter(openFilter === "stock" ? null : "stock")}>
                  {stockFilter === "Todos" ? "Stock: Todos" : stockFilter}
                </button>
                <ChevronDown size={14} className="pxp-select-chevron" />
                {openFilter === "stock" && (
                  <div className="pxp-dmenu">
                    {[{ v: "Todos", l: "Stock: Todos" }, { v: "Con stock", l: "Con stock" }, { v: "Stock bajo", l: "Stock bajo" }, { v: "Sin stock", l: "Sin stock" }].map(o => (
                      <button type="button" key={o.v} className={`pxp-dmenu-item ${stockFilter === o.v ? "sel" : ""}`} onClick={() => { setStockFilter(o.v); setPage(1); setOpenFilter(null); }}>
                        <span className="pxp-dmenu-dot" /> <span>{o.l}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
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
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#53627d", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado Comercial</label>
                    <div className="pxp-select-wrap" style={{ width: "100%" }} ref={openFilter === "status" ? filterMenuRef : null}>
                      <button type="button" className="pxp-select" style={{ width: "100%", maxWidth: "100%", textAlign: "left" }} onClick={() => setOpenFilter(openFilter === "status" ? null : "status")}>
                        {commercialStatus}
                      </button>
                      <ChevronDown size={14} className="pxp-select-chevron" />
                      {openFilter === "status" && (
                        <div className="pxp-dmenu">
                          {["Todos", "Disponible", "Stock bajo", "Sin stock", "Reservado", "Agotado"].map(opt => (
                            <button type="button" key={opt} className={`pxp-dmenu-item ${commercialStatus === opt ? "sel" : ""}`} onClick={() => { setCommercialStatus(opt); setPage(1); setOpenFilter(null); }}>
                              <span className="pxp-dmenu-dot" /> <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                    <div className="pxp-select-wrap" style={{ width: "100%" }} ref={openFilter === "location" ? filterMenuRef : null}>
                      <button type="button" className="pxp-select" style={{ width: "100%", maxWidth: "100%", textAlign: "left" }} onClick={() => setOpenFilter(openFilter === "location" ? null : "location")}>
                        {locationFilter === "Todos" ? "Todos los almacenes" : locationFilter}
                      </button>
                      <ChevronDown size={14} className="pxp-select-chevron" />
                      {openFilter === "location" && (
                        <div className="pxp-dmenu">
                          {[{ v: "Todos", l: "Todos los almacenes" }, { v: "Almacén Principal", l: "Almacén Principal" }, { v: "Tienda Sur", l: "Tienda Sur" }, { v: "Tienda Online", l: "Tienda Online" }].map(o => (
                            <button type="button" key={o.v} className={`pxp-dmenu-item ${locationFilter === o.v ? "sel" : ""}`} onClick={() => { setLocationFilter(o.v); setPage(1); setOpenFilter(null); }}>
                              <span className="pxp-dmenu-dot" /> <span>{o.l}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                          Estado Comercial
                        </div>
                        <button
                          className="pxp-bulk-menu-item"
                          onClick={() => handleBulkStatusChange("Disponible")}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                          Marcar como Disponible
                        </button>
                        <button
                          className="pxp-bulk-menu-item"
                          onClick={() => handleBulkStatusChange("Stock bajo")}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706" }} />
                          Marcar como Stock bajo
                        </button>
                        <button
                          className="pxp-bulk-menu-item"
                          onClick={() => handleBulkStatusChange("Sin stock")}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
                          Marcar como Sin stock
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
                  {isLoadingProducts ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={`loading-${index}`} aria-busy="true">
                      <td colSpan={visibleColumns.length + 2}>
                        <div style={{ height: 22, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
                      </td>
                    </tr>
                  )) : pageRows.map(p => <tr key={p.id}>
                    <td><input className="pxp-check" type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)} /></td>
                    {visibleColumns.includes("product") && <td onClick={() => setFullProduct(p)} style={{ cursor: "pointer" }}><div className="pxp-product-cell"><ProductThumb id={p.id} category={p.category} name={p.name} /><div><div className="pxp-product-name">{p.name}</div>{p.detail && <div className="pxp-product-sub">{p.detail}</div>}</div></div></td>}
                    {visibleColumns.includes("sku") && <td>{p.sku}</td>}
                    {visibleColumns.includes("barcode") && <td>{p.barcode || "—"}</td>}
                    {visibleColumns.includes("category") && <td>{p.category}</td>}
                    {visibleColumns.includes("stock") && <td><span className={`pxp-stock ${statusClass(p.status)}`}>{p.stock} un.</span></td>}
                    {visibleColumns.includes("price") && <td>{money(p.price)}</td>}
                    {visibleColumns.includes("wholesale") && <td>{money(p.wholesale || p.price)}</td>}
                    {visibleColumns.includes("status") && <td><span className={`pxp-badge ${statusClass(p.status)}`}>{p.status}</span></td>}
                    {visibleColumns.includes("location") && <td>{p.location}</td>}
                    <td><div className="pxp-actions" ref={menuId === p.id ? actionsMenuRef : null}><button className="pxp-icon-btn" title="Editar" onClick={() => openEdit(p)}>✎</button><button className={`pxp-icon-btn ${menuId === p.id ? "selected" : ""}`} title="Más acciones" onClick={() => setMenuId(menuId === p.id ? null : p.id)}>···</button>
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
                  {!isLoadingProducts && pageRows.length === 0 && <tr><td colSpan={visibleColumns.length + 2}><div className="pxp-empty">No se encontraron productos con esos filtros.</div></td></tr>}
                </tbody>
              </table></div> : (
                <div
                  className="pxp-grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
                  }}
                >
                  {pageRows.map(p => {
                    const isSelected = selected.includes(p.id);
                    return (
                      <article className="pxp-product-card" key={p.id} onClick={() => setFullProduct(p)} style={{ cursor: "pointer" }}>
                        <div className="pxp-card-media">
                          <img
                            src={getProductStockImage(p)}
                            alt={p.name}
                            className="pxp-card-img"
                            loading="lazy"
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = STOCK_IMAGES.default;
                            }}
                          />
                          <div className="pxp-card-floating-bar" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`pxp-card-select-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => toggleSelected(p.id)}
                              title={isSelected ? "Deseleccionar" : "Seleccionar"}
                            >
                              {isSelected && <Check size={14} strokeWidth={2.5} />}
                            </button>
                          </div>
                        </div>

                        <div className="pxp-card-body">
                          <div className="pxp-card-meta">{p.sku} · {p.category}</div>
                          <div className="pxp-card-name" title={p.name}>{p.name}</div>
                          
                          {/* Estado comercial minimalista entre título y precio */}
                          <div className="pxp-card-status-line">
                            <span className={`pxp-status-dot ${statusClass(p.status)}`} />
                            <span className="pxp-status-text">{p.status}</span>
                          </div>

                          <div className="pxp-card-bottom">
                            <div>
                              <span className="pxp-card-price">{money(p.price)}</span>
                            </div>
                            <div className="pxp-card-stock-pill">
                              <span>{p.stock} {p.unit || "un."}</span>
                            </div>
                          </div>
                          <div className="pxp-card-actions" onClick={e => e.stopPropagation()}>
                            <button className="pxp-btn small" onClick={() => { setDetailProduct(p); setDetailTab("Resumen"); }}>Ver detalle</button>
                            <button className="pxp-btn small" onClick={() => openEdit(p)}>Editar</button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {pageRows.length === 0 && <div className="pxp-empty">No se encontraron productos.</div>}
                </div>
              )}
              <div className="pxp-table-footer"><span>Mostrando {filtered.length ? (page - 1) * pageSize + 1 : 0} a {Math.min(page * pageSize, filtered.length)} de {filtered.length.toLocaleString("es-PE")} productos</span><div className="pxp-footer-spacer" /><span>Filas por página</span><select className="pxp-select" style={{ height: 34, minWidth: 68 }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><div className="pxp-pagination"><button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>{Array.from({ length: Math.min(pages, 5) }, (_, i) => { const n = i + 1; return <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</button>; })}<button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button></div></div>
            </section>
          </div>
        </main>
      </div>

      {detailProduct && (
        <>
          <div className="pxp-overlay" onClick={() => setDetailProduct(null)} />
          <aside className="pxp-detail">
            <button className="pxp-icon-btn pxp-detail-close" onClick={() => setDetailProduct(null)} title="Cerrar panel">×</button>
            <div className="pxp-detail-head">
              <div className="pxp-detail-product">
                <div className="pxp-detail-art">
                  <ProductThumb id={detailProduct.id} category={detailProduct.category} name={detailProduct.name} size={60} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="pxp-detail-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{detailProduct.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    <span className={`pxp-badge ${statusClass(detailProduct.status)}`} style={{ fontSize: 12 }}>
                      {detailProduct.status}
                    </span>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                      · {detailProduct.category}
                    </span>
                    {detailProduct.brand && detailProduct.brand !== "—" && (
                      <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                        · {detailProduct.brand}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  className="pxp-btn small"
                  style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff" }}
                  onClick={() => openEdit(detailProduct)}
                >
                  ✎ Editar producto
                </button>
                <button
                  className="pxp-btn small"
                  onClick={() => {
                    setEditing(detailProduct);
                    setForm({
                      name: detailProduct.name,
                      sku: detailProduct.sku,
                      category: detailProduct.category,
                      stock: detailProduct.stock,
                      price: detailProduct.price,
                      location: detailProduct.location,
                      description: detailProduct.description || ""
                    });
                    setModal("stock");
                  }}
                >
                  ▤ Ajustar stock
                </button>
              </div>
              <div className="pxp-detail-grid" style={{ marginTop: 16 }}>
                <div className="pxp-detail-box" style={{ padding: "12px 14px" }}>
                  <div className="pxp-kv"><span>SKU</span><b>{detailProduct.sku}</b></div>
                  <div className="pxp-kv"><span>Código de barras</span><b>{detailProduct.barcode || "—"}</b></div>
                </div>
                <div className="pxp-detail-box" style={{ padding: "12px 14px" }}>
                  <div className="pxp-kv"><span>Precio de venta</span><b>{money(detailProduct.salePrice ?? detailProduct.price)}</b></div>
                  <div className="pxp-kv"><span>Stock total</span><b className={`pxp-stock ${statusClass(detailProduct.status)}`}>{detailProduct.stock} un.</b></div>
                </div>
              </div>
            </div>

            <div className="pxp-detail-tabs">
              {["Resumen", "Inventario", "Precios", "Movimientos", "Proveedores", "Ventas"].map(t => (
                <button key={t} className={detailTab === t ? "active" : ""} onClick={() => setDetailTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="pxp-detail-content">
              {detailTab === "Resumen" && (
                <div className="pxp-detail-grid">
                  {/* Ficha Técnica */}
                  <div className="pxp-detail-box">
                    <h3>▤ Ficha técnica</h3>
                    {[
                      ["Categoría", detailProduct.category],
                      ["Marca", detailProduct.brand || "—"],
                      ["Presentación", detailProduct.presentation ? (detailProduct.presentation.length > 2 && detailProduct.presentation === detailProduct.presentation.toUpperCase() ? detailProduct.presentation.charAt(0).toUpperCase() + detailProduct.presentation.slice(1).toLowerCase() : detailProduct.presentation) : "—"],
                      ["Unidad de medida", detailProduct.unit ? (detailProduct.unit.length > 2 && detailProduct.unit === detailProduct.unit.toUpperCase() ? detailProduct.unit.charAt(0).toUpperCase() + detailProduct.unit.slice(1).toLowerCase() : detailProduct.unit) : "un."],
                      ["Condición Qaway", `${detailProduct.condition || 10}/10`],
                      ["Estado actual", detailProduct.status]
                    ].map(([k, v]) => (
                      <div className="pxp-kv" key={k}>
                        <span>{k}</span>
                        <b>{v}</b>
                      </div>
                    ))}
                  </div>

                  {/* Disponibilidad y Valor */}
                  <div className="pxp-detail-box">
                    <h3>▣ Disponibilidad y valor</h3>
                    {[
                      ["Stock global disponible", `${detailProduct.stock} un.`],
                      ["Valorización en inventario", money(detailProduct.stock * detailProduct.price)],
                      ["Ubicación principal", detailProduct.location || "Almacén Principal"],
                      ["Precio de venta regular", money(detailProduct.salePrice ?? detailProduct.price)],
                      ["Régimen tributario", "IGV (18% Gravado)"]
                    ].map(([k, v]) => (
                      <div className="pxp-kv" key={k}>
                        <span>{k}</span>
                        <b style={{ color: k.includes("Stock") ? "#059669" : "#0f172a" }}>{v}</b>
                      </div>
                    ))}
                  </div>

                  {/* Descripción oficial (único lugar) */}
                  <div className="pxp-detail-box full">
                    <h3>▣ Descripción oficial del producto</h3>
                    <p style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
                      {detailProduct.description || "Sin descripción registrada para este producto."}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === "Inventario" && (
                <div className="pxp-detail-box">
                  <h3>▣ Stock detallado por sede / almacén</h3>
                  <table className="pxp-detail-table">
                    <thead>
                      <tr>
                        <th>Almacén / Tienda</th>
                        <th style={{ textAlign: "right" }}>Stock disponible</th>
                        <th style={{ textAlign: "right" }}>Alerta mínima</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailProduct.warehouse || [{ name: detailProduct.location || "Almacén Principal", stock: detailProduct.stock, min: 0 }]).map(w => (
                        <tr key={w.name}>
                          <td style={{ fontWeight: 600 }}>{w.name}</td>
                          <td style={{ textAlign: "right", color: w.stock > 0 ? "#059669" : "#71717a", fontWeight: 700 }}>{w.stock} un.</td>
                          <td style={{ textAlign: "right", color: "#64748b" }}>{w.min ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Total consolidado: <b style={{ color: "#059669" }}>{detailProduct.stock} unidades</b>
                    </div>
                    <button
                      className="pxp-btn small"
                      style={{ background: "#ff4b0b", borderColor: "#ff4b0b", color: "#fff" }}
                      onClick={() => {
                        setEditing(detailProduct);
                        setForm({
                          name: detailProduct.name,
                          sku: detailProduct.sku,
                          category: detailProduct.category,
                          stock: detailProduct.stock,
                          price: detailProduct.price,
                          location: detailProduct.location,
                          description: detailProduct.description || ""
                        });
                        setModal("stock");
                      }}
                    >
                      ▤ Ajustar stock
                    </button>
                  </div>
                </div>
              )}

              {detailTab === "Precios" && (
                <div className="pxp-detail-box">
                  <h3>▣ Matriz comercial y listas de precios</h3>
                  {[
                    ["Precio de venta final (PVP)", money(detailProduct.salePrice ?? detailProduct.price)],
                    ["Precio base / lista neto", money(detailProduct.price)],
                    ["Precio mayorista (volumen)", money(detailProduct.wholesale ?? detailProduct.price)],
                    ["Precio mínimo permitido (piso)", money(detailProduct.minPrice ?? detailProduct.price)],
                    ["Costo referencial de compra", money(detailProduct.cost ?? (detailProduct.price * 0.5))],
                    ["Moneda de operación", "PEN (S/)"],
                    ["Régimen tributario", "IGV 18% Gravado"]
                  ].map(([k, v]) => (
                    <div className="pxp-kv" key={k}>
                      <span>{k}</span>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === "Movimientos" && (
                <div className="pxp-detail-box">
                  <h3>⇄ Historial y Kardex de movimientos</h3>
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#1e293b" }}>Registro de entradas y salidas</p>
                    <p style={{ margin: 0, fontSize: 13 }}>Se generarán automáticamente al emitir ventas, registrar compras o realizar ajustes de inventario.</p>
                  </div>
                </div>
              )}

              {detailTab === "Proveedores" && (
                <div className="pxp-detail-box">
                  <h3>🏢 Proveedores y Abastecimiento</h3>
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#1e293b" }}>Sin proveedor principal vinculado</p>
                    <p style={{ margin: 0, fontSize: 13 }}>Puedes asignar proveedores de origen desde el módulo de Compras y Proveedores.</p>
                  </div>
                </div>
              )}

              {detailTab === "Ventas" && (
                <div className="pxp-detail-box">
                  <h3>🛒 Historial de Ventas y Salidas</h3>
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#1e293b" }}>Sin ventas registradas en esta demo</p>
                    <p style={{ margin: 0, fontSize: 13 }}>Las órdenes y boletas/facturas generadas en el POS se listarán aquí en tiempo real.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}



      {modal === "import" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" onClick={e => e.stopPropagation()}>
        <div className="pxp-modal-head"><div className="pxp-heading-icon"><FileSpreadsheet size={20} /></div><div><h2>Importar productos</h2><p>Carga productos desde un archivo Excel o CSV. Puedes actualizar existentes o solo agregar nuevos.</p></div><button className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div>
        <div className="pxp-modal-body">
          <div className="pxp-stepper">{["Cargar archivo", "Mapear campos", "Validar datos", "Importar"].map((s, i) => <div key={s} className={`pxp-step ${importStep === i + 1 ? "active" : importStep > i + 1 ? "done" : ""}`}><span>{importStep > i + 1 ? "✓" : i + 1}</span><div><b>{s}</b><div className="pxp-muted">{["Selecciona tu archivo", "Relaciona las columnas", "Revisa los registros", "Confirma y procesa"][i]}</div></div></div>)}</div>
          {importStep === 1 && <div className="pxp-import-columns"><div className="pxp-panel"><h3>1. Cargar archivo</h3><p className="pxp-muted">Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv). Tamaño máximo: 10 MB.</p><label className="pxp-dropzone"><div style={{ fontSize: 30, color: "#2165ed" }}><Download size={32} /></div><b>{importFile ? importFile.name : "Arrastra tu archivo aquí"}</b><span className="pxp-muted">o haz clic para seleccionar</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e => handleImportFile(e.target.files?.[0])} /></label><button className="pxp-link" onClick={() => showToast("La plantilla de ejemplo estará disponible al conectar el módulo de archivos.")}>Descargar plantilla de ejemplo (Excel)</button></div><div className="pxp-info"><b>Información importante</b><ul><li>Puedes importar productos nuevos o actualizar existentes.</li><li>Usa los campos obligatorios: nombre y SKU (o código).</li><li>Si el SKU ya existe, se actualizará según la opción elegida.</li><li>Puedes incluir categorías, precios, stock y ubicaciones.</li><li>Se validarán errores antes de importar.</li></ul></div></div>}
          {importStep === 2 && <div className="pxp-panel"><h3>2. Mapear campos</h3><p className="pxp-muted">Relaciona las columnas de tu archivo con los campos del sistema.</p>{["Código → SKU (obligatorio)", "Nombre del producto → Nombre (obligatorio)", "Categoría → Categoría", "Precio → Precio base", "Stock inicial → Stock", "Ubicación → Ubicación principal", "Descripción → Descripción", "Código de barras → Código de barras"].map(row => <div className="pxp-map-row" key={row}><input value={row.split(" → ")[0]} readOnly /><select defaultValue={row.split(" → ")[1]}><option>{row.split(" → ")[1]}</option><option>Omitir columna</option><option>Descripción</option><option>Stock</option><option>Precio base</option></select></div>)}</div>}
          {importStep === 3 && <div className="pxp-panel"><h3>3. Vista previa y validación</h3><p className="pxp-muted">{importFile ? `Archivo seleccionado: ${importFile.name}` : "Vista previa de registros de ejemplo."} Revisa los campos antes de continuar.</p><div className="pxp-preview-scroll"><table className="pxp-preview-table"><thead><tr><th>#</th><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead><tbody>{products.slice(0, 5).map((p, i) => <tr key={p.id}><td>{i + 1}</td><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{p.price.toFixed(2)}</td><td>{p.stock}</td><td><span className={`pxp-badge ${statusClass(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table></div></div>}
          {importStep === 4 && <div className="pxp-info"><h3>4. Confirmar importación</h3><p>Revisa el modo de importación. La ejecución real requiere conectar el servicio de importación del backend.</p><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "merge"} onChange={() => setImportOption("merge")} /> Agregar nuevos y actualizar existentes</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "new"} onChange={() => setImportOption("new")} /> Solo agregar nuevos</label><label style={{ display: "block", margin: "10px 0" }}><input type="radio" checked={importOption === "update"} onChange={() => setImportOption("update")} /> Solo actualizar existentes</label></div>}
        </div>
        <div className="pxp-modal-foot"><button className="pxp-btn" onClick={() => importStep > 1 ? setImportStep(s => s - 1) : setModal("")}>{importStep > 1 ? "← Anterior" : "Cancelar"}</button><button className="pxp-btn primary" onClick={() => { if (importStep < 4) { if (importStep === 1 && !importFile) { showToast("Selecciona un archivo para continuar"); return; } setImportStep(s => s + 1); } else finishImport(); }}>{importStep === 4 ? "Confirmar e importar" : "Continuar →"}</button></div>
      </section></div>}

      {modal === "product" && (
        <ProductModal
          editing={editing}
          form={form}
          categories={categories}
          onClose={() => setModal("")}
          onSave={saveProduct}
        />
      )}

      {modal === "stock" && <div className="pxp-overlay" onClick={() => setModal("")}><section className="pxp-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}><div className="pxp-modal-head"><div className="pxp-heading-icon"><Boxes size={20} strokeWidth={1.8} /></div><div><h2>Ajustar stock</h2><p>{editing?.name}</p></div><button className="pxp-icon-btn close" onClick={() => setModal("")}>×</button></div><div className="pxp-modal-body"><div className="pxp-field"><label>Stock actual</label><input value={`${editing?.stock ?? 0} unidades`} readOnly /></div><div className="pxp-field"><label>Nuevo stock</label><input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div><div className="pxp-field"><label>Motivo del ajuste</label><select defaultValue="Conteo físico"><option>Conteo físico</option><option>Corrección de inventario</option><option>Merma o pérdida</option><option>Otro</option></select></div></div><div className="pxp-modal-foot"><button className="pxp-btn" onClick={() => setModal("")}>Cancelar</button><button className="pxp-btn primary" onClick={() => { const stock = Math.max(0, Number(form.stock) || 0); setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, stock, status: stock === 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Disponible" } : p)); if (detailProduct?.id === editing.id) setDetailProduct(prev => ({ ...prev, stock, status: stock === 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Disponible" })); setModal(""); showToast("Stock actualizado"); }}>Guardar ajuste</button></div></section></div>}

      {toast && <div className="pxp-toast">{toast}</div>}
    </div>
  );
}

function Metric({ icon, label, value, note, stroke = "#ff4b0b", points = "0,15 20,10 40,18 60,5 80,12 100,2" }) {
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
      <svg style={{ width: "100%", height: 32, marginTop: 8 }} viewBox="0 0 100 20" preserveAspectRatio="none">
        <polyline fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    </div>
  );
}
