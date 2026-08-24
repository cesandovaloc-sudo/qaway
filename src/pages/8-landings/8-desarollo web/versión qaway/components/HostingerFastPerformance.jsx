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
    <section id="rendimiento" style={{ padding: "110px 0 120px", background: "#f8f9fc" }}>
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
                    border: isOpen ? "1px solid #e4e4e7" : "1px solid #e4e4e7",
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

          {/* Lado Derecho: Titular + Dashboard Minimalista Moderno */}
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

            <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 24px", lineHeight: "1.2" }}>
              Rendimiento ultrarrápido y tiempo de actividad en el que <span style={{ color: "#fe6612" }}>puedes confiar</span>
            </h2>

            {/* Dashboard Minimalista de Telemetría */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.03)",
              }}
            >
              {/* Barra Superior del Dashboard */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #f4f4f5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={16} color="#fe6612" />
                  <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#111111" }}>Google PageSpeed Insights</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(22, 163, 74, 0.1)", color: "#16a34a", padding: "4px 10px", borderRadius: "999px", fontSize: "11.5px", fontWeight: "700" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                  <span>Score: 99 / 100</span>
                </div>
              </div>

              {/* 3 Métricas Clave en Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
                <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "600", display: "block", marginBottom: "4px" }}>LCP (Carga)</span>
                  <strong style={{ fontSize: "19px", color: "#111111", display: "block" }}>0.8s</strong>
                  <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700" }}>● Óptimo</span>
                </div>

                <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "600", display: "block", marginBottom: "4px" }}>TTFB (Servidor)</span>
                  <strong style={{ fontSize: "19px", color: "#111111", display: "block" }}>38ms</strong>
                  <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700" }}>● Ultrarrápido</span>
                </div>

                <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "600", display: "block", marginBottom: "4px" }}>Uptime SLA</span>
                  <strong style={{ fontSize: "19px", color: "#111111", display: "block" }}>99.9%</strong>
                  <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700" }}>● Activo 24/7</span>
                </div>
              </div>

              {/* Barra de Progreso de Core Web Vitals */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", fontWeight: "600", color: "#52525b", marginBottom: "6px" }}>
                  <span>Core Web Vitals Pass</span>
                  <span style={{ color: "#16a34a" }}>100% Aprobado</span>
                </div>
                <div style={{ width: "100%", height: "7px", background: "#e4e4e7", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #fe6612 0%, #16a34a 100%)", borderRadius: "4px" }} />
                </div>
              </div>

              {/* Status Footer */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f4f4f5", fontSize: "11.5px", color: "#71717a" }}>
                <Server size={14} color="#fe6612" />
                <span>Edge CDN Qaway Lab · Nodos Cloud de alta disponibilidad</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
