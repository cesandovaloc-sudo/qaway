import { Zap, ShieldCheck, Cloud, MessageSquare, Activity } from "lucide-react";

export function HostingerSecurityGrid() {
  const items = [
    { icon: Zap, title: "Carga Ultrarrápida (< 1.2s)", color: "#fe6612", bg: "rgba(254, 102, 18, 0.1)" },
    { icon: ShieldCheck, title: "Actualizaciones & Seguridad", color: "#fe6612", bg: "rgba(254, 102, 18, 0.1)" },
    { icon: Cloud, title: "Copias de Seguridad en la Nube", color: "#fe6612", bg: "rgba(254, 102, 18, 0.1)" },
    { icon: MessageSquare, title: "Soporte Directo por WhatsApp", color: "#25d366", bg: "rgba(37, 211, 102, 0.12)" },
    { icon: Activity, title: "Monitoreo de Disponibilidad 24/7", color: "#16a34a", bg: "rgba(22, 163, 74, 0.1)" },
  ];

  return (
    <section id="soporte" style={{ padding: "80px 0 85px", background: "#f8f9fc" }}>
      <div className="h-container">
        
        {/* Encabezado Centrado y Directo */}
        <div style={{ textAlign: "center", maxWidth: "740px", margin: "0 auto 40px" }}>
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
              marginBottom: "14px",
            }}
          >
            SOPORTE & ACOMPAÑAMIENTO TÉCNICO
          </span>

          <h2 style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.3rem)", fontWeight: "600", color: "#111111", margin: "0 0 12px", lineHeight: "1.25" }}>
            Nosotros nos encargamos de todo el soporte para que tú <span style={{ color: "#fe6612" }}>te enfoques en tu negocio</span>
          </h2>

          <p style={{ color: "#52525b", fontSize: "15.5px", lineHeight: "1.5", margin: 0 }}>
            Olvídate de problemas técnicos, caídas de servidor o configuraciones complejas. Cuentas con un equipo profesional cuidando tu sitio en todo momento.
          </p>
        </div>

        {/* Fila / Grid Compacto de Solo Iconos y Títulos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            maxWidth: "1160px",
            margin: "0 auto",
          }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "12px",
                  padding: "20px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={item.color} strokeWidth={2.2} />
                </div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#111111",
                    margin: 0,
                    lineHeight: "1.35",
                  }}
                >
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
