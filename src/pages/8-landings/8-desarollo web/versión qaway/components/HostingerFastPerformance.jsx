import { useState } from "react";
import { Minus, Plus, Zap, Activity, ShieldCheck, Server } from "lucide-react";

const performanceItems = [
  {
    title: "Tiempos de carga ultrarrápidos (< 1.2s)",
    content: "Optimizamos assets, scripts y compresión WebP para que tu web cargue en menos de un segundo, reduciendo drásticamente la tasa de rebote.",
  },
  {
    title: "Sin tiempo de inactividad, 99.9% de disponibilidad",
    content: "Infraestructura Cloud de alto rendimiento con servidores redundantes para que tu negocio nunca pierda una sola venta ni cliente potencial.",
  },
  {
    title: "Core Web Vitals 100% aprobados para SEO e IA",
    content: "Tu sitio cumple con las métricas más exigentes de Google, logrando mejor posicionamiento orgánico y máxima visibilidad en motores de IA.",
  },
  {
    title: "Mayor retención y tasa de conversión",
    content: "Una navegación ágil y sin esperas incrementa hasta en un 40% las consultas por WhatsApp y las compras directas en tu tienda online.",
  },
];

export function HostingerFastPerformance() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="rendimiento" style={{ padding: "40px 0 90px", background: "#f8f9fc" }}>
      <div className="h-container">
        <div className="h-split-grid" style={{ gridTemplateColumns: "1fr 1.05fr", gap: "60px", alignItems: "center" }}>
          
          {/* Lado Izquierdo: Acordeón Interactivo */}
          <div className="h-accordion-list">
            {performanceItems.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={item.title}
                  className="h-accordion-item-custom"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: isOpen ? "0 4px 16px rgba(0,0,0,0.03)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    className="h-accordion-header-custom"
                    onClick={() => toggle(idx)}
                    style={{
                      padding: "20px 24px",
                      background: "#ffffff",
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#111111" }}>{item.title}</span>
                    {isOpen ? <Minus size={18} color="#fe6612" /> : <Plus size={18} color="#71717a" />}
                  </button>
                  {isOpen && (
                    <div className="h-accordion-body-custom" style={{ padding: "0 24px 20px", color: "#52525b", fontSize: "14.5px", lineHeight: "1.6" }}>
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lado Derecho: Titular + Cifra Minimalista */}
          <div>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: "800",
                color: "#56596e",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#e6e8ee",
                padding: "4px 10px",
                borderRadius: "4px",
                display: "inline-block",
                marginBottom: "16px",
              }}
            >
              INFRAESTRUCTURA & VELOCIDAD WEB
            </span>

            <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 20px", lineHeight: "1.2" }}>
              Rendimiento ultrarrápido y tiempo de actividad en el que <span style={{ color: "#fe6612" }}>puedes confiar</span>
            </h2>

            {/* Número Minimalista Limpio */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "24px" }}>
              <span
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.4rem)",
                  fontWeight: "700",
                  color: "#111111",
                  fontFamily: "var(--qw-font-display)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                &lt; 1.2s
              </span>
              <span style={{ fontSize: "14.5px", color: "#71717a", fontWeight: "500", maxWidth: "240px", lineHeight: "1.4" }}>
                Tiempo de carga promedio optimizado para retención y ventas.
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
