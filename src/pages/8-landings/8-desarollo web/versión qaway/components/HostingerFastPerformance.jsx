import { useState } from "react";
import { Minus, Plus, Zap, Activity, ShieldCheck, Server } from "lucide-react";

const performanceItems = [
  {
    title: "Imágenes ultra optimizadas en formato WebP (< 1.2s)",
    content: "Comprimimos y procesamos cada fotografía y mockup sin pérdida de calidad para que tu web cargue en menos de un segundo.",
  },
  {
    title: "Infraestructura Cloud de máxima estabilidad",
    content: "Servidores de alta velocidad con 99.9% de tiempo activo para que tu web jamás se caiga ante picos de tráfico.",
  },
  {
    title: "Core Web Vitals impecables para posicionar en Google",
    content: "Tu web no solo se ve increíble, sino que cumple los requisitos técnicos más exigentes de los buscadores.",
  },
  {
    title: "Experiencia fluida que multiplica tus ventas",
    content: "La combinación de diseño premium y carga instantánea retiene a tus clientes y acelera el contacto por WhatsApp.",
  },
];

export function HostingerFastPerformance() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="rendimiento" style={{ padding: "80px 0 120px", background: "#f8f9fc" }}>
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
                    {isOpen ? <Minus size={18} color="#fe6612" strokeWidth={2.5} /> : <Plus size={18} color="#fe6612" strokeWidth={2.5} />}
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
              OPTIMIZACIÓN & VELOCIDAD WEB
            </span>

            <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 20px", lineHeight: "1.2" }}>
              Diseño visual de alto nivel con velocidad de carga instantánea
            </h2>

            {/* Fila Horizontal de Indicadores Numéricos Minimalistas en Naranja */}
            <div style={{ display: "flex", gap: "32px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e4e4e7", flexWrap: "wrap" }}>
              <div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#fe6612",
                    fontFamily: "var(--qw-font-display)",
                    letterSpacing: "-0.03em",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  &lt; 1.2s
                </span>
                <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginTop: "8px" }}>
                  Velocidad de Carga
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#fe6612",
                    fontFamily: "var(--qw-font-display)",
                    letterSpacing: "-0.03em",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  99.9%
                </span>
                <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginTop: "8px" }}>
                  Disponibilidad Uptime
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#fe6612",
                    fontFamily: "var(--qw-font-display)",
                    letterSpacing: "-0.03em",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  100%
                </span>
                <span style={{ fontSize: "11px", color: "#71717a", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginTop: "8px" }}>
                  Core Web Vitals
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
