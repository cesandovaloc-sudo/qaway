import React, { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Sparkles,
  X,
  Info,
  ChevronLeft,
  Bell,
  Gift,
  CreditCard,
  User,
  Calendar,
  Mail,
  Phone,
  Clock,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

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
  const [oneTimeDuration, setOneTimeDuration] = useState("1_month");

  // Estados de Checkout (subStep === 3)
  const [paymentMethod, setPaymentMethod] = useState(null); // inicia colapsado (null | "card" | "yape")
  const [yapeStep, setYapeStep] = useState("input"); // "input" | "approval"
  const [yapeSeconds, setYapeSeconds] = useState(294); // 04:54

  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
    email: "",
    country: "Perú",
  });

  const [yapeForm, setYapeForm] = useState({
    name: "",
    phone: "",
    email: "",
    country: "Perú",
  });

  // Temporizador regresivo para aprobación push en Yape (Imagen 3 de Canva)
  useEffect(() => {
    let timer;
    if (subStep === 3 && paymentMethod === "yape" && yapeStep === "approval") {
      timer = setInterval(() => {
        setYapeSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [subStep, paymentMethod, yapeStep]);

  function formatCountdown(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleSelect(planId) {
    setCurrentPlan(planId);
    if (onSelectPlan) onSelectPlan(planId);
  }

  const selectedPlanObj = PLAN_CONFIGS.find((p) => p.id === currentPlan) || PLAN_CONFIGS[1];

  // En Qaway Lab el Pago Único prepago es exclusivamente mensual
  const activeOneTimePrice = selectedPlanObj.priceMonthly;

  // Cálculo dinámico para la frecuencia anual (ahorro de 2 meses)
  const annualTotal = selectedPlanObj.priceMonthly === 30 ? 240 : (selectedPlanObj.priceMonthly === 50 ? 400 : 560);
  const annualSavings = (selectedPlanObj.priceMonthly * 12) - annualTotal;
  const annualPerMonth = Math.round(annualTotal / 12);
  const currentPrice = billingType === "one_time" 
    ? activeOneTimePrice 
    : (frequency === "annual" ? annualTotal : selectedPlanObj.priceMonthly);

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

              {/* Bullets con checks verdes dinámicos según el tipo de facturación */}
              {billingType === "recurring" ? (
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
              ) : (
                <div className="canva-sub2-bullets">
                  <div className="canva-sub2-bullet">
                    <Check size={18} className="canva-check-green" strokeWidth={2.8} />
                    <span><strong>Sin renovación automática:</strong> Pagas únicamente por el mes que decidas utilizar el sistema.</span>
                  </div>
                  <div className="canva-sub2-bullet">
                    <Check size={18} className="canva-check-green" strokeWidth={2.8} />
                    <span><strong>Tus datos nunca se pierden:</strong> Al vencer los 30 días, tu catálogo y registros se conservan seguros para cuando decidas reactivar.</span>
                  </div>
                </div>
              )}

              {/* Radio Cards: Opciones recurrentes vs Opciones de Pago Único (Imagen 5 de Canva) */}
              {billingType === "recurring" ? (
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
              ) : (
                /* Opción de Pago Único exclusiva por mes (Imagen 5 de Canva adaptada) */
                <div className="canva-freq-cards-list" role="radiogroup" aria-label="Duración de pago único">
                  <div
                    className="canva-freq-card selected"
                    role="radio"
                    aria-checked={true}
                    tabIndex={0}
                  >
                    <div className="canva-freq-radio">
                      <div className="canva-freq-circle active">
                        <div className="canva-freq-dot" />
                      </div>
                    </div>
                    <div className="canva-freq-details">
                      <div className="canva-freq-header-line">
                        <span className="canva-freq-name">1 mes de acceso prepago</span>
                        <span className="canva-offer-tag bg-blue-600">PAGO ÚNICO</span>
                      </div>
                      <span className="canva-freq-cost">S/{selectedPlanObj.priceMonthly} · Sin suscripción recurrente</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Timeline o Info del plan y Desglose de cobro */}
            <div className="canva-sub2-right">
              {billingType === "recurring" ? (
                /* Card 1: Línea de tiempo gráfica de 3 hitos para prueba recurrente */
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
              ) : (
                /* Card 1: Información del plan para Pago Único (Imagen 5 de Canva) */
                <div className="canva-card-plan-info">
                  <div className="canva-plan-info-header">
                    <h3 className="canva-plan-info-title">Información del plan</h3>
                    <span className="canva-pill-prepago">Prepago</span>
                  </div>

                  <div className="canva-plan-info-body">
                    <div className="canva-plan-avatar">
                      <Crown size={22} className="text-purple-600" />
                    </div>
                    <div className="canva-plan-info-text">
                      <strong className="canva-plan-info-name">Qaway Hub · {selectedPlanObj.name}</strong>
                      <span className="canva-plan-info-sub">Acceso total por 30 días</span>
                      <span className="canva-plan-info-users">1 usuario administrador incluido</span>
                    </div>
                  </div>

                  <div className="canva-plan-prepago-perks">
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Acceso completo a inventario y ventas por 30 días</span>
                    </div>
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Sin cobros automáticos posteriores a tu tarjeta o Yape</span>
                    </div>
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Catálogo y registros guardados intactos tras vencer el mes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: Desglose y CTA (Avanza a la Pantalla 3 de Métodos de Pago) */}
              <div className="canva-card-summary">
                <div className="canva-summary-line-top">
                  <div className="canva-sum-left">
                    <span className="canva-sum-title">A pagar hoy</span>
                    {billingType === "recurring" ? (
                      <span className="canva-trial-pill">Prueba gratis de 30 días</span>
                    ) : (
                      <span className="canva-trial-pill canva-pill-prepago">Acceso prepago</span>
                    )}
                  </div>
                  <span className="canva-sum-zero">
                    {billingType === "recurring" ? "S/ 0" : `S/ ${activeOneTimePrice}`}
                  </span>
                </div>

                {billingType === "recurring" ? (
                  <div className="canva-summary-line-next">
                    <span className="canva-next-date">Próxima fecha de cobro: {dateDay30}</span>
                    <span className="canva-next-price">
                      S/{frequency === "annual" ? annualTotal : selectedPlanObj.priceMonthly}
                    </span>
                  </div>
                ) : (
                  <div className="canva-summary-line-next">
                    <span className="canva-next-date">Periodo: 30 días desde la activación</span>
                    <span className="canva-next-price">Sin renovación</span>
                  </div>
                )}

                <button
                  type="button"
                  className="canva-sub2-btn-submit"
                  disabled={loading}
                  onClick={() => setSubStep(3)}
                >
                  <span>Siguiente</span>
                </button>

                <p className="canva-sub2-legal">
                  Al continuar, aceptas las <a href="#terminos" onClick={(e) => e.preventDefault()}>Condiciones de uso de Qaway Lab</a> y confirmas que leíste nuestra <a href="#privacidad" onClick={(e) => e.preventDefault()}>Política de privacidad</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 3 (Imágenes 1, 2, 3, 4 de Canva): Método de Pago (Tarjeta y Yape con cuenta regresiva) */}
      {subStep === 3 && (
        <div className="canva-sub2-wrapper">
          {/* Barra de navegación superior: Atrás y Cerrar */}
          <div className="canva-sub2-topbar">
            <button
              type="button"
              className="canva-sub2-back-btn"
              onClick={() => setSubStep(2)}
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
            {/* Columna Izquierda: Acordeón interactivo de Métodos de Pago */}
            <div className="canva-sub2-left">
              <h2 className="canva-sub2-title">
                {billingType === "recurring" ? "Prueba Qaway Hub gratis" : "Finaliza tu compra"}
              </h2>
              <p className="canva-pay-subtitle">Selecciona una opción de pago</p>

              <div className="canva-pay-accordion">
                {/* Opción 1: Tarjeta de crédito o débito (Imagen 1 de Canva) */}
                <div className={`canva-pay-card ${paymentMethod === "card" ? "open" : ""}`}>
                  <div
                    className="canva-pay-header"
                    onClick={() => setPaymentMethod((prev) => (prev === "card" ? null : "card"))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="canva-pay-header-left">
                      <div className={`canva-freq-circle ${paymentMethod === "card" ? "active" : ""}`}>
                        {paymentMethod === "card" && <div className="canva-freq-dot" />}
                      </div>
                      <CreditCard size={20} className="text-slate-700" />
                      <span className="canva-pay-method-title">Tarjeta de crédito o débito</span>
                    </div>

                    <div className="canva-card-badges">
                      <span className="badge-card badge-visa">VISA</span>
                      <span className="badge-card badge-mc">MC</span>
                      <span className="badge-card badge-amex">AMEX</span>
                    </div>
                  </div>

                  {/* Formulario de Tarjeta expandido */}
                  {paymentMethod === "card" && (
                    <div className="canva-pay-body">
                      {/* Nombre en la tarjeta */}
                      <div className="canva-input-group">
                        <label className="canva-input-label">Nombre que figura en la tarjeta</label>
                        <div className="canva-input-wrap">
                          <User size={18} className="canva-input-icon" />
                          <input
                            type="text"
                            placeholder="p. ej., Juan Pérez"
                            value={cardForm.name}
                            onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                            className="canva-input-field"
                          />
                        </div>
                      </div>

                      {/* Número de tarjeta */}
                      <div className="canva-input-group">
                        <label className="canva-input-label">Número de tarjeta</label>
                        <div className="canva-input-wrap">
                          <CreditCard size={18} className="canva-input-icon" />
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            value={cardForm.number}
                            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                            className="canva-input-field"
                          />
                        </div>
                      </div>

                      {/* Fecha de caducidad y CVV */}
                      <div className="canva-grid-2col">
                        <div className="canva-input-group">
                          <label className="canva-input-label">Fecha de caducidad</label>
                          <div className="canva-input-wrap">
                            <Calendar size={18} className="canva-input-icon" />
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="MM/AA"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                              className="canva-input-field"
                            />
                          </div>
                        </div>

                        <div className="canva-input-group">
                          <label className="canva-input-label">Código de seguridad (CVV)</label>
                          <div className="canva-input-wrap">
                            <Lock size={18} className="canva-input-icon" />
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="CVV"
                              value={cardForm.cvc}
                              onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                              className="canva-input-field"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Correo electrónico */}
                      <div className="canva-input-group">
                        <label className="canva-input-label">Correo electrónico</label>
                        <div className="canva-input-wrap">
                          <Mail size={18} className="canva-input-icon" />
                          <input
                            type="email"
                            placeholder="nombre@ejemplo.com"
                            value={cardForm.email}
                            onChange={(e) => setCardForm({ ...cardForm, email: e.target.value })}
                            className="canva-input-field"
                          />
                        </div>
                      </div>

                      {/* Selector de País */}
                      <div className="canva-input-group">
                        <label className="canva-input-label">País</label>
                        <div className="canva-select-country">
                          <span className="canva-flag">🇵🇪</span>
                          <span className="canva-country-name">Perú</span>
                        </div>
                      </div>

                      {/* Nota legal de cargo simbólico temporal reembolsable (Imagen 1 Canva) */}
                      <div className="canva-pay-card-notice">
                        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <p>
                          Es posible que autoricemos un cargo temporal por un importe simbólico en tu tarjeta para comprobar que funciona. No te preocupes, te lo reembolsaremos enseguida.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opción 2: Yape (Imágenes 2, 3 y 4 de Canva) */}
                <div className={`canva-pay-card ${paymentMethod === "yape" ? "open" : ""}`}>
                  <div
                    className="canva-pay-header"
                    onClick={() => setPaymentMethod((prev) => (prev === "yape" ? null : "yape"))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="canva-pay-header-left">
                      <div className={`canva-freq-circle ${paymentMethod === "yape" ? "active" : ""}`}>
                        {paymentMethod === "yape" && <div className="canva-freq-dot" />}
                      </div>
                      <div className="canva-yape-icon-badge">
                        <span>Y</span>
                      </div>
                      <span className="canva-pay-method-title">Yape</span>
                    </div>

                    <div className="canva-yape-tag">
                      <span>Perú</span>
                    </div>
                  </div>

                  {/* Formulario de Yape expandido */}
                  {paymentMethod === "yape" && (
                    <div className="canva-pay-body">
                      {yapeStep === "input" ? (
                        /* Paso 1: Ingreso de Datos (Imágenes 2 y 4 de Canva) */
                        <>
                          {/* Nombre y apellido */}
                          <div className="canva-input-group">
                            <label className="canva-input-label">Nombre y apellido</label>
                            <div className="canva-input-wrap">
                              <User size={18} className="canva-input-icon" />
                              <input
                                type="text"
                                placeholder="p. ej., Ana Morales"
                                value={yapeForm.name}
                                onChange={(e) => setYapeForm({ ...yapeForm, name: e.target.value })}
                                className="canva-input-field"
                              />
                            </div>
                          </div>

                          {/* Número de celular con prefijo +51 */}
                          <div className="canva-input-group">
                            <label className="canva-input-label">Número de celular Yape</label>
                            <div className="canva-input-wrap">
                              <span className="canva-phone-prefix">+51</span>
                              <input
                                type="tel"
                                maxLength={9}
                                placeholder="987 654 321"
                                value={yapeForm.phone}
                                onChange={(e) => setYapeForm({ ...yapeForm, phone: e.target.value.replace(/\D/g, "") })}
                                className="canva-input-field canva-input-with-prefix"
                              />
                              <Phone size={18} className="canva-input-icon-right" />
                            </div>
                          </div>

                          {/* Correo electrónico */}
                          <div className="canva-input-group">
                            <label className="canva-input-label">Correo electrónico</label>
                            <div className="canva-input-wrap">
                              <Mail size={18} className="canva-input-icon" />
                              <input
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                value={yapeForm.email}
                                onChange={(e) => setYapeForm({ ...yapeForm, email: e.target.value })}
                                className="canva-input-field"
                              />
                            </div>
                          </div>

                          {/* País */}
                          <div className="canva-input-group">
                            <label className="canva-input-label">País</label>
                            <div className="canva-select-country">
                              <span className="canva-flag">🇵🇪</span>
                              <span className="canva-country-name">Perú</span>
                            </div>
                          </div>

                          <div className="canva-pay-card-notice yape-notice">
                            <Info size={16} className="text-purple-600 shrink-0 mt-0.5" />
                            <p>
                              Al hacer clic en el botón te enviaremos una notificación push directa a tu app Yape para que apruebes la suscripción sin ingresar claves aquí.
                            </p>
                          </div>
                        </>
                      ) : (
                        /* Paso 2: Aprobación Push con Cuenta Regresiva (Imagen 3 de Canva) */
                        <div className="canva-yape-approval-card">
                          <div className="canva-yape-timer-banner">
                            <div className="canva-timer-left">
                              <Clock size={18} className="text-sky-600" />
                              <span>Tiempo restante para aprobar en Yape:</span>
                            </div>
                            <span className="canva-timer-digits">
                              {formatCountdown(yapeSeconds)}
                            </span>
                          </div>

                          <div className="canva-yape-steps-box">
                            <h4 className="canva-yape-steps-title">
                              Sigue estos pasos en tu celular:
                            </h4>
                            <ol className="canva-yape-steps-list">
                              <li>
                                <span className="canva-step-num">1</span>
                                <span>Abre tu app <strong>Yape</strong> en tu teléfono.</span>
                              </li>
                              <li>
                                <span className="canva-step-num">2</span>
                                <span>Toca la campanita de notificaciones o la alerta emergente.</span>
                              </li>
                              <li>
                                <span className="canva-step-num">3</span>
                                <span>
                                  Aprueba la solicitud de <strong>Qaway Hub</strong> ({billingType === "recurring" ? "S/ 0 cobrado hoy" : `S/ ${activeOneTimePrice}`}).
                                </span>
                              </li>
                            </ol>
                          </div>

                          <div className="canva-yape-actions-row">
                            <button
                              type="button"
                              className="canva-btn-text-action"
                              onClick={() => setYapeStep("input")}
                            >
                              Cambiar número de celular
                            </button>
                            <button
                              type="button"
                              className="canva-btn-text-action"
                              onClick={() => setYapeSeconds(294)}
                            >
                              Reenviar notificación
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Timeline / Resumen del Plan y Botón Final */}
            <div className="canva-sub2-right">
              {billingType === "recurring" ? (
                /* Card 1: Línea de tiempo gráfica de 3 hitos */
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
              ) : (
                /* Card 1: Información del plan para Pago Único (Imagen 5 de Canva) */
                <div className="canva-card-plan-info">
                  <div className="canva-plan-info-header">
                    <h3 className="canva-plan-info-title">Información del plan</h3>
                    <span className="canva-pill-prepago">Prepago</span>
                  </div>

                  <div className="canva-plan-info-body">
                    <div className="canva-plan-avatar">
                      <Crown size={22} className="text-purple-600" />
                    </div>
                    <div className="canva-plan-info-text">
                      <strong className="canva-plan-info-name">Qaway Hub · {selectedPlanObj.name}</strong>
                      <span className="canva-plan-info-sub">Acceso total por 30 días</span>
                      <span className="canva-plan-info-users">1 usuario administrador incluido</span>
                    </div>
                  </div>

                  <div className="canva-plan-prepago-perks">
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Acceso completo a inventario y ventas por 30 días</span>
                    </div>
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Sin cobros automáticos posteriores a tu tarjeta o Yape</span>
                    </div>
                    <div className="canva-prepago-perk-item">
                      <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={2.6} />
                      <span>Catálogo y registros guardados intactos tras vencer el mes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: Desglose y CTA Final estilo Canva */}
              <div className="canva-card-summary">
                <div className="canva-summary-line-top">
                  <div className="canva-sum-left">
                    <span className="canva-sum-title">A pagar hoy</span>
                    {billingType === "recurring" ? (
                      <span className="canva-trial-pill">Prueba gratis de 30 días</span>
                    ) : (
                      <span className="canva-trial-pill canva-pill-prepago">Acceso prepago</span>
                    )}
                  </div>
                  <span className="canva-sum-zero">
                    {billingType === "recurring" ? "S/ 0" : `S/ ${activeOneTimePrice}`}
                  </span>
                </div>

                {billingType === "recurring" ? (
                  <div className="canva-summary-line-next">
                    <span className="canva-next-date">Próxima fecha de cobro: {dateDay30}</span>
                    <span className="canva-next-price">
                      S/{frequency === "annual" ? annualTotal : selectedPlanObj.priceMonthly}
                    </span>
                  </div>
                ) : (
                  <div className="canva-summary-line-next">
                    <span className="canva-next-date">Periodo: 30 días desde la activación</span>
                    <span className="canva-next-price">Sin renovación</span>
                  </div>
                )}

                {/* Botón Principal CTA según el método y estado */}
                <button
                  type="button"
                  className="canva-sub2-btn-submit"
                  disabled={loading || !paymentMethod}
                  style={!paymentMethod ? { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" } : {}}
                  onClick={() => {
                    if (!paymentMethod) return;
                    if (paymentMethod === "yape" && yapeStep === "input") {
                      setYapeStep("approval");
                      return;
                    }
                    if (onContinue) {
                      onContinue({
                        ...selectedPlanObj,
                        billingType,
                        frequency: billingType === "recurring" ? frequency : undefined,
                        oneTimeDuration: billingType === "one_time" ? oneTimeDuration : undefined,
                        price: billingType === "recurring" ? currentPrice : activeOneTimePrice,
                        paymentMethod,
                        cardForm: paymentMethod === "card" ? cardForm : undefined,
                        yapeForm: paymentMethod === "yape" ? yapeForm : undefined,
                      });
                    }
                  }}
                >
                  {!paymentMethod ? (
                    "Selecciona una opción de pago"
                  ) : paymentMethod === "card" ? (
                    billingType === "recurring" ? "Obtén tu prueba gratis" : "Pagar y activar ahora"
                  ) : yapeStep === "input" ? (
                    "Continuar a aprobación Yape"
                  ) : (
                    "He aprobado en mi app Yape"
                  )}
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

        .canva-card-timeline {
          min-height: 236px;
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

        /* Tarjeta de Información del Plan Prepago (Imagen 5 de Canva) */
        .canva-card-plan-info {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          min-height: 236px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .canva-plan-info-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .canva-plan-info-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .canva-plan-info-body {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .canva-plan-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .canva-plan-info-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .canva-plan-info-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .canva-plan-info-sub {
          font-size: 12.5px;
          color: #64748b;
        }

        .canva-plan-info-users {
          font-size: 12px;
          color: #94a3b8;
        }

        .canva-plan-prepago-perks {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .canva-prepago-perk-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #334155;
          line-height: 1.4;
        }

        .canva-pill-prepago {
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid #bfdbfe;
        }

        /* Pantalla 3: Métodos de Pago (Imágenes 1, 2, 3 y 4 de Canva) */
        .canva-pay-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 20px 0;
        }

        .canva-pay-accordion {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .canva-pay-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-pay-card.open {
          border-color: #8b5cf6;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.08);
        }

        .canva-pay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          user-select: none;
          background: #ffffff;
        }

        .canva-pay-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .canva-pay-method-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .canva-card-badges {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-card {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          color: #475569;
          background: #f8fafc;
        }

        .badge-visa {
          color: #1e3a8a;
          border-color: #93c5fd;
          background: #eff6ff;
        }

        .badge-mc {
          color: #b91c1c;
          border-color: #fca5a5;
          background: #fef2f2;
        }

        .badge-amex {
          color: #0369a1;
          border-color: #7dd3fc;
          background: #f0f9ff;
        }

        /* Yape Icon Badge */
        .canva-yape-icon-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #730076;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 13px;
        }

        .canva-yape-tag {
          font-size: 11px;
          font-weight: 700;
          color: #730076;
          background: #fdf2f8;
          border: 1px solid #fbcfe8;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .canva-pay-body {
          padding: 8px 20px 22px 20px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .canva-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .canva-input-label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .canva-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .canva-input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          pointer-events: none;
        }

        .canva-input-icon-right {
          position: absolute;
          right: 14px;
          color: #94a3b8;
          pointer-events: none;
        }

        .canva-input-field {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 42px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }

        .canva-input-field:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .canva-input-field::placeholder {
          color: #94a3b8;
        }

        .canva-phone-prefix {
          position: absolute;
          left: 14px;
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          pointer-events: none;
        }

        .canva-input-with-prefix {
          padding-left: 50px !important;
          padding-right: 42px !important;
        }

        .canva-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .canva-select-country {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 14px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
        }

        .canva-flag {
          font-size: 18px;
        }

        .canva-country-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .canva-pay-card-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-top: 4px;
        }

        .canva-pay-card-notice p {
          margin: 0;
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.45;
        }

        .yape-notice {
          background: #faf5ff;
          border-color: #e9d5ff;
        }

        .yape-notice p {
          color: #6b21a8;
        }

        /* Yape Aprobación Push y Temporizador (Imagen 3 de Canva) */
        .canva-yape-approval-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .canva-yape-timer-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 12px 16px;
          color: #0369a1;
          font-size: 13.5px;
          font-weight: 600;
        }

        .canva-timer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .canva-timer-digits {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 16px;
          font-weight: 800;
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid #bae6fd;
          color: #0284c7;
        }

        .canva-yape-steps-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }

        .canva-yape-steps-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .canva-yape-steps-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .canva-yape-steps-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.45;
        }

        .canva-step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #730076;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .canva-yape-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
        }

        .canva-btn-text-action {
          background: none;
          border: none;
          padding: 0;
          font-size: 12.5px;
          font-weight: 600;
          color: #730076;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .canva-btn-text-action:hover {
          color: #500052;
        }

        @media (max-width: 820px) {
          .canva-sub2-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .canva-sub2-title {
            font-size: 26px;
          }
          .canva-grid-2col {
            grid-template-columns: 1fr;
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
