import { Zap, ShieldCheck, Cloud, MessageSquare, Activity, CheckCircle2 } from "lucide-react";

export function HostingerSecurityGridTaste() {
  const capabilities = [
    {
      metric: "< 1.2s",
      badge: "Velocidad Extrema",
      title: "Carga Ultrarrápida",
      desc: "Optimización WebP, compresión de assets y Core Web Vitals al 100%.",
      icon: Zap,
      accentColor: "#fe6612",
      badgeBg: "rgba(254, 102, 18, 0.1)",
      badgeColor: "#fe6612",
    },
    {
      metric: "256-Bit",
      badge: "Cero Vulnerabilidades",
      title: "Seguridad & SSL Activo",
      desc: "Certificado SSL oficial, protección anti-malware y firewall perimetral.",
      icon: ShieldCheck,
      accentColor: "#16a34a",
      badgeBg: "rgba(22, 163, 74, 0.1)",
      badgeColor: "#16a34a",
    },
    {
      metric: "24h Auto",
      badge: "Nube Redundante",
      title: "Copias de Seguridad",
      desc: "Respaldos diarios automáticos con capacidad de restauración en 1 clic.",
      icon: Cloud,
      accentColor: "#0284c7",
      badgeBg: "rgba(2, 132, 199, 0.1)",
      badgeColor: "#0284c7",
    },
    {
      metric: "VIP",
      badge: "Atención Humana",
      title: "Soporte por WhatsApp",
      desc: "Contacto directo con el equipo técnico sin sistemas de tickets lentos.",
      icon: MessageSquare,
      accentColor: "#25d366",
      badgeBg: "rgba(37, 211, 102, 0.12)",
      badgeColor: "#15803d",
    },
    {
      metric: "99.9%",
      badge: "Alta Disponibilidad",
      title: "Monitoreo Continuo",
      desc: "Supervisión 24/7 de servidores para garantizar que tu web nunca falle.",
      icon: Activity,
      accentColor: "#8b5cf6",
      badgeBg: "rgba(139, 92, 246, 0.1)",
      badgeColor: "#7c3aed",
    },
  ];

  return (
    <section style={{ padding: "85px 0 95px", background: "#f8f9fc", borderTop: "1px solid #e4e4e7" }}>
      <div className="h-container" style={{ maxWidth: "1240px" }}>
        
        {/* Encabezado Editorial */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 48px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#56596e",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#e6e8ee",
              padding: "4px 12px",
              borderRadius: "4px",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            GARANTÍA OPERATIVA & SOPORTE CONTINUO
          </span>

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 14px", lineHeight: "1.2" }}>
            Nosotros nos encargamos del soporte para que tú <span style={{ color: "#fe6612" }}>te enfoques en vender</span>
          </h2>

          <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.55", margin: 0 }}>
            Cero configuraciones técnicas, caídas de servidor ni estrés operativo. Un equipo profesional respaldando tu web en todo momento.
          </p>
        </div>

        {/* Grid de 5 Bloques con Métricas y Micro-Detalles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "14px",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = item.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.02)";
                  e.currentTarget.style.borderColor = "#e4e4e7";
                }}
              >
                {/* Header de la tarjeta con Métrica e Icono */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: item.badgeBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} color={item.accentColor} strokeWidth={2.2} />
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: item.accentColor,
                      fontFamily: "var(--qw-font-display, inherit)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.metric}
                  </span>
                </div>

                {/* Badge contextual */}
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: "700",
                    color: item.badgeColor,
                    background: item.badgeBg,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    alignSelf: "flex-start",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.badge}
                </span>

                {/* Título y Descripción */}
                <h3 style={{ fontSize: "15.5px", fontWeight: "700", color: "#111111", margin: "0 0 6px", lineHeight: "1.3" }}>
                  {item.title}
                </h3>
                <p style={{ color: "#71717a", fontSize: "12.5px", lineHeight: "1.5", margin: 0, flexGrow: 1 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
