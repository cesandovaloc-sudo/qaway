import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Crown, Sparkles, X, Info } from "lucide-react";

export const PLAN_CONFIGS = [
  {
    id: "basico",
    name: "Básico",
    subtitle: "Inventario y Catálogo",
    targetAudience: "Para pequeños comercios y negocios en inicio",
    priceMonthly: 30,
    priceRegular: 60,
    tag: "Esencial",
  },
  {
    id: "intermedio",
    name: "Intermedio",
    subtitle: "Ventas Online",
    targetAudience: "Para negocios con pedidos frecuentes y catálogo web",
    priceMonthly: 50,
    priceRegular: 100,
    tag: "Más popular",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Operación Comercial",
    targetAudience: "Para marcas en expansión y operación multisede",
    priceMonthly: 70,
    priceRegular: 140,
    tag: "Avanzado",
  },
];

// Matriz de beneficios
// visibleInitially: true (se muestran en la primera vista antes del difuminado)
export const FEATURE_ROWS = [
  {
    name: "Límite de productos",
    info: "Cantidad máxima de artículos registrados en tu catálogo activo.",
    basico: "Hasta 100",
    intermedio: "Hasta 500",
    premium: "Ilimitados",
    visibleInitially: true,
  },
  {
    name: "Usuarios del equipo",
    info: "Accesos simultáneos con cuentas individuales para tu personal.",
    basico: "1 usuario",
    intermedio: "Hasta 5 usuarios",
    premium: "Ilimitados",
    visibleInitially: true,
  },
  {
    name: "Sedes y almacenes",
    info: "Locales físicos, sucursales o almacenes independientes de inventario.",
    basico: "1 sede / almacén",
    intermedio: "Hasta 3 sedes",
    premium: "Múltiples sedes",
    visibleInitially: true,
  },
  {
    name: "Catálogo Web Público estándar",
    info: "🎁 3 Meses 100% gratis incluidos de catálogo web con tu marca.",
    basico: "3 Meses gratis",
    intermedio: "3 Meses gratis",
    premium: "3 Meses gratis",
    highlightBadge: true,
    visibleInitially: true,
  },
  {
    name: "Pedidos directos a WhatsApp",
    info: "Tus clientes envían su pedido prellenado directamente a tu WhatsApp comercial.",
    basico: true,
    intermedio: true,
    premium: true,
    visibleInitially: true,
  },
  {
    name: "Carrito de compras web",
    info: "Permite al cliente acumular varios productos antes de solicitar el pedido.",
    basico: false,
    intermedio: true,
    premium: true,
    visibleInitially: true,
  },
  {
    name: "Control de stock y existencias",
    info: "Control de inventario en tiempo real con alertas de reposición.",
    basico: "Stock básico",
    intermedio: "Preciso + alertas",
    premium: "Multialmacén en vivo",
    visibleInitially: true,
  },
  {
    name: "Soporte técnico y asesoría",
    info: "Canales de soporte para puesta en marcha y dudas operativas.",
    basico: "Estándar WhatsApp",
    intermedio: "Asistido prioritario",
    premium: "Asesor 24/7",
    visibleInitially: true,
  },
  // --- Fila con difuminado y expansibles ---
  {
    name: "Fotos por producto",
    info: "Cantidad de fotografías y vistas en la galería de cada ficha.",
    basico: "1 principal",
    intermedio: "Hasta 5 fotos",
    premium: "Múltiples por variante",
    visibleInitially: false,
  },
  {
    name: "Variantes (talla, color, modelo)",
    info: "Atributos dinámicos por producto con SKU y stock individual.",
    basico: false,
    intermedio: "Variantes estándar",
    premium: "Avanzadas y atributos",
    visibleInitially: false,
  },
  {
    name: "Movimientos de Kardex (entradas/salidas)",
    info: "Auditoría de quién modificó stock, transferencias y mermas.",
    basico: false,
    intermedio: true,
    premium: "Historial completo",
    visibleInitially: false,
  },
  {
    name: "Transferencias entre sedes y almacenes",
    info: "Envío y recepción de mercadería entre sucursales con confirmación.",
    basico: false,
    intermedio: false,
    premium: true,
    visibleInitially: false,
  },
  {
    name: "Gestión de pedidos web y estados",
    info: "Panel de control para despachos: Pendiente, En preparación, Entregado.",
    basico: false,
    intermedio: true,
    premium: "Flujo operativo completo",
    visibleInitially: false,
  },
  {
    name: "Directorio de clientes y ventas",
    info: "Registro de clientes frecuentes y vinculación a sus pedidos.",
    basico: false,
    intermedio: true,
    premium: "Historial 360°",
    visibleInitially: false,
  },
  {
    name: "Listas de precios",
    info: "Precios diferenciados por mostrador, mayorista o distribuidor.",
    basico: "1 lista estándar",
    intermedio: "Múltiples listas",
    premium: "Reglas por volumen",
    visibleInitially: false,
  },
  {
    name: "Cotizaciones formales en PDF",
    info: "Emisión de proformas comerciales para clientes con un clic.",
    basico: false,
    intermedio: "Básicas",
    premium: "Avanzadas personalizadas",
    visibleInitially: false,
  },
  {
    name: "Paquetes, combos y kits (Bundles)",
    info: "Agrupa productos en combos descontando stock de cada componente.",
    basico: false,
    intermedio: false,
    premium: true,
    visibleInitially: false,
  },
  {
    name: "Promociones y liquidaciones",
    info: "Campañas automáticas de descuento por fecha o liquidación de lotes.",
    basico: false,
    intermedio: "Descuentos simples",
    premium: "Campañas avanzadas",
    visibleInitially: false,
  },
  {
    name: "Módulo de compras y proveedores",
    info: "Registro de costos de adquisición y órdenes de compra oficiales.",
    basico: false,
    intermedio: "Registro de compras",
    premium: "Órdenes y proveedores",
    visibleInitially: false,
  },
  {
    name: "Punto de Venta (POS) y Caja Chica",
    info: "Interfaz rápida para mostrador físico y arqueo de caja diario.",
    basico: false,
    intermedio: "Registro de ventas",
    premium: "POS + Caja Chica",
    visibleInitially: false,
  },
  {
    name: "Captura Asistida con IA Qaway",
    info: "Sugerencias inteligentes de categorías, descripciones y precios con IA.",
    basico: false,
    intermedio: false,
    premium: true,
    visibleInitially: false,
  },
  {
    name: "Importación masiva (Excel / CSV)",
    info: "Sube miles de productos o listas de inventario en segundos.",
    basico: false,
    intermedio: true,
    premium: "Avanzado con mapeo",
    visibleInitially: false,
  },
  {
    name: "Reportes analíticos y exportación",
    info: "Métricas de rentabilidad, productos más vendidos y finanzas.",
    basico: "Básicos",
    intermedio: "Operativos y ventas",
    premium: "Analítica avanzada",
    visibleInitially: false,
  },
];

export default function CanvaPlanSelector({
  selectedPlan = "intermedio",
  onSelectPlan,
  onContinue,
  loading = false,
  isModal = false,
  onClose,
}) {
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  function handleSelect(planId) {
    setCurrentPlan(planId);
    if (onSelectPlan) onSelectPlan(planId);
  }

  const selectedPlanObj = PLAN_CONFIGS.find((p) => p.id === currentPlan) || PLAN_CONFIGS[1];

  const content = (
    <div className="canva-plan-container">
      {/* Columna Izquierda: Selector de Plan estilo Canva */}
      <div className="canva-left-panel">
        <div className="canva-badge-top">
          <Sparkles size={14} className="text-purple-600" />
          <span>Prueba gratuita de 30 días</span>
        </div>

        <h2 className="canva-title">
          Prueba <span className="canva-brand-accent">Qaway Hub</span> gratis
        </h2>
        <p className="canva-subtitle">
          Elige tu plan. Disfruta 30 días de acceso total sin costo. Puedes cancelar tu suscripción cuando quieras.
        </p>

        {/* Lista de planes seleccionables */}
        <div className="canva-plans-list" role="radiogroup" aria-label="Planes de suscripción">
          {PLAN_CONFIGS.map((plan) => {
            const isSelected = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(plan.id);
                  }
                }}
                className={`canva-plan-card ${isSelected ? "selected" : ""}`}
              >
                <div className="canva-radio-indicator">
                  <div className={`canva-radio-circle ${isSelected ? "active" : ""}`}>
                    {isSelected && <div className="canva-radio-dot" />}
                  </div>
                </div>

                <div className="canva-plan-info">
                  <div className="canva-plan-header">
                    <span className="canva-plan-name">{plan.name}</span>
                    {plan.recommended && <span className="canva-badge-rec">Recomendado</span>}
                    <div className="canva-plan-pricing">
                      <span className="canva-price">S/{plan.priceMonthly}</span>
                      <span className="canva-period">/mes</span>
                      <span className="canva-reg-price">S/{plan.priceRegular}</span>
                    </div>
                  </div>
                  <p className="canva-plan-desc">{plan.subtitle} · {plan.targetAudience}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Principal de Acción */}
        <div className="canva-cta-block">
          <button
            type="button"
            className="canva-cta-btn"
            disabled={loading}
            onClick={() => onContinue && onContinue(selectedPlanObj)}
          >
            <Crown size={18} />
            <span>{loading ? "Preparando tu prueba…" : "Probarlo gratis 30 días"}</span>
          </button>

          <p className="canva-cta-footnote">
            <strong>S/ 0 cobrados hoy.</strong> Te enviaremos un recordatorio antes de que termine tu periodo de prueba. Puedes cancelar tu suscripción en cualquier momento con un clic.
          </p>

          <div className="canva-promo-pill">
            <span className="canva-gift-emoji">🎁</span>
            <span><strong>Incluye 3 Meses Gratis</strong> de Catálogo Web Público</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Tabla Comparativa con Difuminado y Despliegue */}
      <div className="canva-right-panel">
        <div className="canva-table-wrapper">
          <table className="canva-table">
            <thead>
              <tr>
                <th className="th-feature">Beneficios prémium</th>
                {PLAN_CONFIGS.map((p) => {
                  const isColSelected = currentPlan === p.id;
                  return (
                    <th
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      className={`th-plan ${isColSelected ? "col-highlight" : ""}`}
                    >
                      <div className="th-plan-badge">{p.name}</div>
                      <div className="th-plan-sub">S/{p.priceMonthly}/m</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, idx) => {
                const isHidden = !showAllBenefits && !row.visibleInitially;
                if (isHidden) return null;

                return (
                  <tr key={idx} className={`tr-row ${row.highlightBadge ? "row-highlight" : ""}`}>
                    <td className="td-feature">
                      <div className="td-feature-content">
                        <span>{row.name}</span>
                        {row.info && (
                          <span className="td-info-tooltip" title={row.info}>
                            <Info size={13} className="text-slate-400 hover:text-slate-600 inline ml-1" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Básico */}
                    <td className={`td-value ${currentPlan === "basico" ? "col-highlight" : ""}`}>
                      <RenderValue val={row.basico} />
                    </td>

                    {/* Intermedio */}
                    <td className={`td-value ${currentPlan === "intermedio" ? "col-highlight" : ""}`}>
                      <RenderValue val={row.intermedio} />
                    </td>

                    {/* Premium */}
                    <td className={`td-value ${currentPlan === "premium" ? "col-highlight" : ""}`}>
                      <RenderValue val={row.premium} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Difuminado blanco inferior cuando está colapsado */}
          {!showAllBenefits && (
            <div className="canva-fade-overlay" aria-hidden="true" />
          )}
        </div>

        {/* Botón interactivo para ver más o ver menos beneficios */}
        <div className="canva-expand-bar">
          <button
            type="button"
            className="canva-expand-btn"
            onClick={() => setShowAllBenefits((prev) => !prev)}
            aria-expanded={showAllBenefits}
          >
            {showAllBenefits ? (
              <>
                <span>Ver menos beneficios</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Ver todos los beneficios ({FEATURE_ROWS.length})</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .canva-plan-container {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 28px;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
          text-align: left;
        }

        /* Columna Izquierda */
        .canva-left-panel {
          padding: 24px 20px 24px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .canva-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f3e8ff;
          color: #7e22ce;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          width: fit-content;
        }

        .canva-title {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }

        .canva-brand-accent {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .canva-subtitle {
          font-size: 14.5px;
          line-height: 1.5;
          color: #475569;
          margin: 0;
        }

        .canva-plans-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .canva-plan-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-plan-card:hover {
          border-color: #c084fc;
          background: #faf5ff;
          transform: translateY(-1px);
        }

        .canva-plan-card.selected {
          border-color: #8b5cf6;
          background: #fbf8ff;
          box-shadow: 0 0 0 1px #8b5cf6, 0 4px 14px rgba(139, 92, 246, 0.12);
        }

        .canva-radio-indicator {
          padding-top: 2px;
        }

        .canva-radio-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .canva-radio-circle.active {
          border-color: #8b5cf6;
        }

        .canva-radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .canva-plan-info {
          flex: 1;
          min-width: 0;
        }

        .canva-plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }

        .canva-plan-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-badge-rec {
          background: #e0e7ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .canva-plan-pricing {
          margin-left: auto;
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .canva-price {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-period {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .canva-reg-price {
          font-size: 12px;
          color: #94a3b8;
          text-decoration: line-through;
          margin-left: 4px;
        }

        .canva-plan-desc {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
          line-height: 1.4;
        }

        .canva-cta-block {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .canva-cta-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        .canva-cta-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
          filter: brightness(1.05);
        }

        .canva-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .canva-cta-footnote {
          font-size: 12.5px;
          line-height: 1.5;
          color: #64748b;
          margin: 0;
          text-align: center;
        }

        .canva-promo-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12.5px;
          color: #334155;
        }

        /* Columna Derecha: Tabla Comparativa */
        .canva-right-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #f1f5f9;
          padding-left: 24px;
        }

        .canva-table-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .canva-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 14.5px;
        }

        .canva-table thead tr th {
          padding: 12px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          border-bottom: 2px solid #f1f5f9;
          background: #ffffff;
        }

        .th-feature {
          text-align: left;
          width: 44%;
        }

        .th-plan {
          text-align: center;
          width: 18.6%;
          cursor: pointer;
          border-radius: 10px 10px 0 0;
          transition: background 0.2s ease;
        }

        .th-plan:hover {
          background: #faf5ff;
        }

        .th-plan-badge {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
        }

        .th-plan-sub {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          margin-top: 1px;
        }

        .col-highlight {
          background: #faf5ff !important;
          color: #7c3aed !important;
        }

        .tr-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }

        .tr-row:hover {
          background: #f8fafc;
        }

        .row-highlight {
          background: #fffdf5;
        }

        .td-feature {
          padding: 11px 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .td-feature-content {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .td-info-tooltip {
          cursor: help;
          display: inline-flex;
          align-items: center;
        }

        .td-value {
          padding: 11px 8px;
          text-align: center;
          font-size: 13.5px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        /* Capa Difuminado Blanco al pie de la tabla */
        .canva-fade-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to top, #ffffff 15%, rgba(255, 255, 255, 0.9) 60%, rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
        }

        /* Barra de Despliegue */
        .canva-expand-bar {
          padding: 12px 0 0;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .canva-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 700;
          color: #6366f1;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-expand-btn:hover {
          background: #ede9fe;
          color: #5b21b6;
          border-color: #c4b5fd;
          transform: translateY(-1px);
        }

        /* Modal wrapper if requested */
        .canva-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 16px;
        }

        .canva-modal-card {
          background: #ffffff;
          border-radius: 24px;
          max-width: 1080px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          padding: 32px;
        }

        .canva-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s ease;
        }

        .canva-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Responsive Mobile-First */
        @media (max-width: 900px) {
          .canva-plan-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .canva-left-panel {
            padding: 0;
          }

          .canva-right-panel {
            border-left: none;
            border-top: 1px solid #f1f5f9;
            padding-left: 0;
            padding-top: 20px;
          }

          .canva-table-wrapper {
            overflow-x: auto;
          }

          .canva-table {
            min-width: 520px;
          }
        }
      `}</style>
    </div>
  );

  if (isModal) {
    return (
      <div className="canva-modal-backdrop" role="dialog" aria-modal="true">
        <div className="canva-modal-card">
          {onClose && (
            <button type="button" className="canva-modal-close" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
}

function RenderValue({ val }) {
  if (val === true) {
    return (
      <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 mx-auto">
        <Check size={13} strokeWidth={2.8} />
      </div>
    );
  }
  if (val === false) {
    return <span className="text-slate-300 font-bold">—</span>;
  }
  return <span className="font-semibold text-[13px]">{val}</span>;
}
