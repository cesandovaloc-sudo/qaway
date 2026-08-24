import { MessageSquare, CreditCard, Mail, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";

export function HostingerEmailMarketing() {
  const channels = [
    {
      icon: MessageSquare,
      title: "WhatsApp Business",
      desc: "Botón flotante y mensajes predeterminados en un clic para recibir contactos directo a tu celular.",
      color: "#25d366",
      bg: "rgba(37, 211, 102, 0.12)",
    },
    {
      icon: CreditCard,
      title: "Pasarelas de Pago",
      desc: "Cobros seguros con tarjetas de crédito/débito, transferencias bancarias, Yape y Plin sin fricción.",
      color: "#fe6612",
      bg: "rgba(254, 102, 18, 0.15)",
    },
    {
      icon: Mail,
      title: "Formularios & CRM",
      desc: "Notificaciones instantáneas de cada cotización enviadas directamente a tu correo corporativo.",
      color: "#38bdf8",
      bg: "rgba(56, 189, 248, 0.12)",
    },
    {
      icon: BarChart3,
      title: "Analítica & Píxel",
      desc: "Medición exacta de visitas y conversiones con Meta Píxel y Google Analytics 4 activos.",
      color: "#a855f7",
      bg: "rgba(168, 85, 247, 0.12)",
    },
  ];

  return (
    <section
      id="automatizacion"
      style={{
        padding: "90px 0 100px",
        background: "#12131a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Resplandor sutil naranja en esquina */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          right: "-100px",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(254, 102, 18, 0.15) 0%, rgba(18, 19, 26, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="h-container" style={{ position: "relative", zIndex: 2 }}>
        
        {/* Encabezado Centrado en Blanco */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 52px" }}>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#fe6612",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "rgba(254, 102, 18, 0.12)",
              border: "1px solid rgba(254, 102, 18, 0.25)",
              padding: "5px 12px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            CANALES DE VENTA & AUTOMATIZACIÓN
          </span>

          <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.6rem)", fontWeight: "600", color: "#ffffff", margin: "0 0 16px", lineHeight: "1.2" }}>
            Conecta tu web a tus canales de venta y <span style={{ color: "#fe6612" }}>recibe clientes en automático</span>
          </h2>

          <p style={{ color: "#a1a1aa", fontSize: "16.5px", lineHeight: "1.6", margin: 0 }}>
            Integramos tu sitio con las herramientas esenciales para que cada visitante se convierta en una consulta o una venta directa.
          </p>
        </div>

        {/* Fila / Grid de los 4 Canales Clave */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "22px",
            marginBottom: "48px",
          }}
        >
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.title}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: ch.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  <Icon size={22} color={ch.color} strokeWidth={2.2} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#ffffff", margin: "0 0 8px" }}>
                  {ch.title}
                </h3>
                <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6", margin: 0, flexGrow: 1 }}>
                  {ch.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Botón CTA Destacado */}
        <div style={{ textAlign: "center" }}>
          <a
            href="#planes"
            className="h-btn-cta-orange"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "15px 42px",
              fontSize: "15.5px",
              fontWeight: "700",
              borderRadius: "8px",
            }}
          >
            <span>Comenzar ahora</span>
            <ArrowRight size={18} />
          </a>
        </div>

      </div>
    </section>
  );
}
