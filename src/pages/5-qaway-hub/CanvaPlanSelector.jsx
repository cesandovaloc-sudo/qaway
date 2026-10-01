import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Crown, Sparkles, X, Info, ChevronLeft, Bell, Gift } from "lucide-react";

function getFormattedDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const day = d.getDate();
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

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
    visibleInitially: true,
  },
  {
    name: "Variantes (talla, color, modelo)",
    info: "Atributos dinámicos por producto con SKU y stock individual.",
    basico: false,
    intermedio: "Variantes estándar",
    premium: "Avanzadas y atributos",
    visibleInitially: true,
  },
  {
    name: "Movimientos de Kardex (entradas/salidas)",
    info: "Auditoría de quién modificó stock, transferencias y mermas.",
    basico: false,
    intermedio: true,
    premium: "Historial completo",
    visibleInitially: true,
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
  const [subStep, setSubStep] = useState(1);
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [billingType, setBillingType] = useState("recurring");
  const [frequency, setFrequency] = useState("monthly");

  function handleSelect(planId) {
    setCurrentPlan(planId);
    if (onSelectPlan) onSelectPlan(planId);
  }

  const selectedPlanObj = PLAN_CONFIGS.find((p) => p.id === currentPlan) || PLAN_CONFIGS[1];

  // Cálculo dinámico para la frecuencia anual (ahorro de 2 meses)
  const annualTotal = selectedPlanObj.priceMonthly === 30 ? 240 : (selectedPlanObj.priceMonthly === 50 ? 400 : 560);
  const annualSavings = (selectedPlanObj.priceMonthly * 12) - annualTotal;
  const annualPerMonth = Math.round(annualTotal / 12);
  const currentPrice = frequency === "annual" ? annualTotal : selectedPlanObj.priceMonthly;

  const dateDay24 = getFormattedDateOffset(24);
  const dateDay30 = getFormattedDateOffset(30);

  const content = (
    <div className="canva-plan-main-wrapper">
      {/* PANTALLA 1: Selector de Plan y Comparativa de Beneficios (Captura 1) */}
      {subStep === 1 && (
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

            {/* Botón Principal de Acción (Avanza a la Pantalla 2 de Frecuencia y Timeline) */}
            <div className="canva-cta-block">
              <button
                type="button"
                className="canva-cta-btn"
                disabled={loading}
                onClick={() => setSubStep(2)}
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
                <span>Ver más beneficios</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
      )}

      {/* PANTALLA 2 (Captura 2 Canva): Frecuencia, Timeline de 3 Hitos y Desglose S/ 0 Hoy */}
      {subStep === 2 && (
        <div className="canva-sub2-wrapper">
          {/* Barra de navegación superior: Atrás y Cerrar */}
          <div className="canva-sub2-topbar">
            <button
              type="button"
              className="canva-sub2-back-btn"
              onClick={() => setSubStep(1)}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span>Atrás</span>
            </button>
            {onClose && (
              <button
                type="button"
                className="canva-sub2-close-btn"
                onClick={onClose}
              >
                <X size={18} />
                <span>Cerrar</span>
              </button>
            )}
          </div>

          <div className="canva-sub2-grid">
            {/* Columna Izquierda: Frecuencia y selección */}
            <div className="canva-sub2-left">
              <h2 className="canva-sub2-title">Elige tu plan</h2>

              {/* Toggle: Pago recurrente (Prueba gratis) vs Pago único */}
              <div className="canva-tabs-wrapper">
                <div className="canva-tab-pill-box">
                  <span className="canva-badge-trial-top">Prueba gratis</span>
                  <button
                    type="button"
                    className={`canva-tab-switch ${billingType === "recurring" ? "active" : ""}`}
                    onClick={() => setBillingType("recurring")}
                  >
                    Pago recurrente
                  </button>
                </div>
                <button
                  type="button"
                  className={`canva-tab-switch ${billingType === "one_time" ? "active" : ""}`}
                  onClick={() => setBillingType("one_time")}
                >
                  Pago único
                </button>
              </div>

              {/* Bullets con checks verdes */}
              <div className="canva-sub2-bullets">
                <div className="canva-sub2-bullet">
                  <Check size={18} className="canva-check-green" strokeWidth={2.8} />
                  <span>Gratis 30 días. Puedes cancelar cuando quieras.</span>
                </div>
                <div className="canva-sub2-bullet">
                  <Check size={18} className="canva-check-green" strokeWidth={2.8} />
                  <span>Te avisaremos antes de que termine tu prueba</span>
                </div>
              </div>

              {/* Radio Cards: Mensual y Anual */}
              <div className="canva-freq-cards-list" role="radiogroup" aria-label="Frecuencia de pago">
                {/* Tarjeta Mensual */}
                <div
                  className={`canva-freq-card ${frequency === "monthly" ? "selected" : ""}`}
                  onClick={() => setFrequency("monthly")}
                  role="radio"
                  aria-checked={frequency === "monthly"}
                  tabIndex={0}
                >
                  <div className="canva-freq-radio">
                    <div className={`canva-freq-circle ${frequency === "monthly" ? "active" : ""}`}>
                      {frequency === "monthly" && <div className="canva-freq-dot" />}
                    </div>
                  </div>
                  <div className="canva-freq-details">
                    <span className="canva-freq-name">Mensual</span>
                    <span className="canva-freq-cost">S/{selectedPlanObj.priceMonthly}</span>
                  </div>
                </div>

                {/* Tarjeta Anual */}
                <div
                  className={`canva-freq-card ${frequency === "annual" ? "selected" : ""}`}
                  onClick={() => setFrequency("annual")}
                  role="radio"
                  aria-checked={frequency === "annual"}
                  tabIndex={0}
                >
                  <div className="canva-freq-radio">
                    <div className={`canva-freq-circle ${frequency === "annual" ? "active" : ""}`}>
                      {frequency === "annual" && <div className="canva-freq-dot" />}
                    </div>
                  </div>
                  <div className="canva-freq-details">
                    <div className="canva-freq-header-line">
                      <span className="canva-freq-name">Anual</span>
                      <span className="canva-offer-tag">MEJOR OFERTA - Ahorra S/{annualSavings}</span>
                    </div>
                    <div className="canva-freq-cost">
                      S/{annualTotal} <span className="canva-freq-month-part">(S/{annualPerMonth} al mes)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Timeline y Desglose de cobro */}
            <div className="canva-sub2-right">
              {/* Card 1: Línea de tiempo gráfica de 3 hitos */}
              <div className="canva-card-timeline">
                <div className="canva-tl-step">
                  <div className="canva-tl-indicator">
                    <div className="canva-tl-node node-green">
                      <Gift size={16} strokeWidth={2.4} />
                    </div>
                    <div className="canva-tl-bar bar-green" />
                  </div>
                  <div className="canva-tl-content">
                    <strong className="canva-tl-date">Hoy</strong>
                    <p className="canva-tl-text">
                      Accede gratis a todo lo que {selectedPlanObj.name} tiene para ofrecer
                    </p>
                  </div>
                </div>

                <div className="canva-tl-step">
                  <div className="canva-tl-indicator">
                    <div className="canva-tl-node node-gray">
                      <Bell size={16} strokeWidth={2.4} />
                    </div>
                    <div className="canva-tl-bar bar-gray" />
                  </div>
                  <div className="canva-tl-content">
                    <strong className="canva-tl-date">{dateDay24}</strong>
                    <p className="canva-tl-text">
                      Te recordaremos cuando tu prueba esté por terminar.
                    </p>
                  </div>
                </div>

                <div className="canva-tl-step">
                  <div className="canva-tl-indicator">
                    <div className="canva-tl-node node-gold">
                      <Crown size={16} strokeWidth={2.4} />
                    </div>
                  </div>
                  <div className="canva-tl-content">
                    <strong className="canva-tl-date">{dateDay30}</strong>
                    <p className="canva-tl-text">
                      A menos que canceles tu plan, lo renovaremos de forma automática.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Desglose y CTA */}
              <div className="canva-card-summary">
                <div className="canva-summary-line-top">
                  <div className="canva-sum-left">
                    <span className="canva-sum-title">A pagar hoy</span>
                    <span className="canva-trial-pill">Prueba gratis de 30 días</span>
                  </div>
                  <span className="canva-sum-zero">S/ 0</span>
                </div>

                <div className="canva-summary-line-next">
                  <span className="canva-next-date">Próxima fecha de cobro: {dateDay30}</span>
                  <span className="canva-next-price">
                    S/{frequency === "annual" ? annualTotal : selectedPlanObj.priceMonthly}
                  </span>
                </div>

                <button
                  type="button"
                  className="canva-sub2-btn-submit"
                  disabled={loading}
                  onClick={() => {
                    if (onContinue) {
                      onContinue({
                        ...selectedPlanObj,
                        billingType,
                        frequency,
                        currentPrice,
                      });
                    }
                  }}
                >
                  <span>{loading ? "Iniciando tu prueba…" : "Siguiente"}</span>
                </button>

                <p className="canva-sub2-legal">
                  Al continuar, aceptas las <a href="#terminos" onClick={(e) => e.preventDefault()}>Condiciones de uso de Qaway Lab</a> y confirmas que leíste nuestra <a href="#privacidad" onClick={(e) => e.preventDefault()}>Política de privacidad</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .canva-plan-container {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 28px;
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          text-align: left;
          align-items: start;
        }

        /* Columna Izquierda: Fija / Sticky */
        .canva-left-panel {
          position: sticky;
          top: 0;
          align-self: start;
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

        /* Columna Derecha: Tabla Comparativa con Scroll Independiente */
        .canva-right-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #f1f5f9;
          padding-left: 24px;
          max-height: min(80vh, 760px);
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 6px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .canva-right-panel::-webkit-scrollbar {
          width: 6px;
        }

        .canva-right-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .canva-right-panel::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .canva-table-wrapper {
          position: relative;
          width: 100%;
          overflow: visible;
        }

        .canva-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 14.5px;
        }

        .canva-table thead tr th {
          position: sticky;
          top: 0;
          z-index: 10;
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
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
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

        /* ═══════════════════════════════════════════════════
           ESTILOS SUB-PANTALLA 2 (Frecuencia, Timeline & CTA)
           ═══════════════════════════════════════════════════ */
        .canva-sub2-wrapper {
          width: 100%;
          animation: canvaFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes canvaFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .canva-sub2-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .canva-sub2-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .canva-sub2-back-btn:hover {
          background: #f1f5f9;
        }

        .canva-sub2-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .canva-sub2-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .canva-sub2-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .canva-sub2-left {
          display: flex;
          flex-direction: column;
        }

        .canva-sub2-title {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.8px;
          margin: 0 0 20px;
          line-height: 1.15;
        }

        /* Tabs de Cobro */
        .canva-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .canva-tab-pill-box {
          position: relative;
        }

        .canva-badge-trial-top {
          position: absolute;
          top: -9px;
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
          z-index: 2;
        }

        .canva-tab-switch {
          height: 42px;
          padding: 0 22px;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-tab-switch:hover {
          border-color: #cbd5e1;
          color: #334155;
        }

        .canva-tab-switch.active {
          border-color: #8b5cf6;
          color: #0f172a;
          box-shadow: 0 0 0 1px #8b5cf6;
          font-weight: 700;
        }

        /* Bullets */
        .canva-sub2-bullets {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .canva-sub2-bullet {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }

        .canva-check-green {
          color: #10b981;
          flex-shrink: 0;
        }

        /* Freq cards */
        .canva-freq-cards-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .canva-freq-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }

        .canva-freq-card:hover {
          border-color: #cbd5e1;
        }

        .canva-freq-card.selected {
          border-color: #8b5cf6;
          background: #faf5ff;
          box-shadow: 0 0 0 1.5px #8b5cf6;
        }

        .canva-freq-radio {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .canva-freq-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: grid;
          place-items: center;
          transition: all 0.15s ease;
        }

        .canva-freq-circle.active {
          border-color: #8b5cf6;
        }

        .canva-freq-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .canva-freq-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .canva-freq-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .canva-freq-cost {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-top: 2px;
        }

        .canva-freq-header-line {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .canva-offer-tag {
          background: #8b5cf6;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .canva-freq-month-part {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }

        /* Columna Derecha */
        .canva-sub2-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .canva-card-timeline, .canva-card-summary {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }

        .canva-tl-step {
          display: flex;
          gap: 14px;
          position: relative;
        }

        .canva-tl-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
        }

        .canva-tl-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .node-green {
          background: #15803d;
          color: #ffffff;
        }

        .node-gray {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .node-gold {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .canva-tl-bar {
          width: 2px;
          flex: 1;
          min-height: 32px;
          margin: 4px 0;
        }

        .bar-green {
          background: #15803d;
        }

        .bar-gray {
          background: #cbd5e1;
        }

        .canva-tl-content {
          padding-bottom: 20px;
        }

        .canva-tl-date {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .canva-tl-text {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.45;
        }

        /* Resumen de cobro */
        .canva-summary-line-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 12px;
        }

        .canva-sum-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .canva-sum-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-trial-pill {
          background: #dcfce7;
          color: #15803d;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
        }

        .canva-sum-zero {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-summary-line-next {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .canva-next-date {
          font-size: 13px;
          color: #64748b;
        }

        .canva-next-price {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .canva-sub2-btn-submit {
          width: 100%;
          height: 48px;
          background: #8b5cf6;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
        }

        .canva-sub2-btn-submit:hover {
          background: #7c3aed;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
        }

        .canva-sub2-legal {
          font-size: 11.5px;
          color: #64748b;
          text-align: left;
          margin: 14px 0 0;
          line-height: 1.45;
        }

        .canva-sub2-legal a {
          color: #475569;
          text-decoration: underline;
        }

        @media (max-width: 820px) {
          .canva-sub2-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .canva-sub2-title {
            font-size: 26px;
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
