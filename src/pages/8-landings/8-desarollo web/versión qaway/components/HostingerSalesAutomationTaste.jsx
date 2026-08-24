import { MessageSquare, CreditCard, Mail, BarChart3 } from "lucide-react";

export function HostingerSalesAutomationTaste() {
  return (
    <section
      id="canales-de-venta"
      style={{
        padding: "95px 0 105px",
        background: "#fe6612",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="h-container" style={{ maxWidth: "1240px", position: "relative", zIndex: 2 }}>
        
        {/* Encabezado en Blanco sobre Fondo Naranja */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 52px" }}>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "800",
              color: "rgba(255, 255, 255, 0.88)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "14px",
            }}
          >
            CANALES DE VENTA & AUTOMATIZACIÓN
          </span>

          <h2
            style={{
              fontSize: "clamp(2.1rem, 3.8vw, 3.1rem)",
              fontWeight: "700",
              color: "#ffffff",
              margin: "0 0 16px",
              lineHeight: "1.15",
              letterSpacing: "-0.02em",
            }}
          >
            Conecta tu web y recibe clientes en automático.
          </h2>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.92)",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: 0,
              maxWidth: "680px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Integramos tu sitio con las herramientas esenciales para que cada visitante se convierta en una consulta o una venta directa.
          </p>
        </div>

        {/* Grid de 4 Tarjetas Blancas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Tarjeta 1: WhatsApp Business */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "34px 28px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 22px 48px rgba(0, 0, 0, 0.16)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "#fe6612";
                iconBox.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.08)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "rgba(254, 102, 18, 0.1)";
                iconBox.style.color = "#fe6612";
              }
            }}
          >
            <div
              className="channel-icon-box"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(254, 102, 18, 0.1)",
                color: "#fe6612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "22px",
                transition: "background-color 0.25s ease, color 0.25s ease",
              }}
            >
              <MessageSquare size={24} strokeWidth={2} />
            </div>

            <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              WhatsApp Business
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px", flexGrow: 1 }}>
              Botón flotante y mensajes predeterminados en un clic para recibir contactos directo a tu celular.
            </p>

            {/* Píldora minimalista */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "rgba(37, 211, 102, 0.12)", color: "#15803d", fontSize: "11px", fontWeight: "700", padding: "4px 9px", borderRadius: "6px" }}>
                🟢 Conexión Activa
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Pasarelas de Pago */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "34px 28px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 22px 48px rgba(0, 0, 0, 0.16)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "#fe6612";
                iconBox.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.08)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "rgba(254, 102, 18, 0.1)";
                iconBox.style.color = "#fe6612";
              }
            }}
          >
            <div
              className="channel-icon-box"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(254, 102, 18, 0.1)",
                color: "#fe6612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "22px",
                transition: "background-color 0.25s ease, color 0.25s ease",
              }}
            >
              <CreditCard size={24} strokeWidth={2} />
            </div>

            <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Pasarelas de Pago
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px", flexGrow: 1 }}>
              Cobros seguros con tarjetas de crédito/débito, transferencias bancarias, Yape y Plin sin fricción.
            </p>

            {/* Píldoras minimalistas de pago */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "#f4f4f5", color: "#18181b", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                📱 Yape / Plin
              </span>
              <span style={{ background: "#f4f4f5", color: "#18181b", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                💳 Tarjetas & Stripe
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Formularios & CRM */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "34px 28px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 22px 48px rgba(0, 0, 0, 0.16)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "#fe6612";
                iconBox.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.08)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "rgba(254, 102, 18, 0.1)";
                iconBox.style.color = "#fe6612";
              }
            }}
          >
            <div
              className="channel-icon-box"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(254, 102, 18, 0.1)",
                color: "#fe6612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "22px",
                transition: "background-color 0.25s ease, color 0.25s ease",
              }}
            >
              <Mail size={24} strokeWidth={2} />
            </div>

            <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Formularios & CRM
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px", flexGrow: 1 }}>
              Notificaciones instantáneas de cada cotización enviadas directamente a tu correo corporativo.
            </p>

            {/* Píldora minimalista */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "#f4f4f5", color: "#0284c7", fontSize: "11px", fontWeight: "700", padding: "4px 9px", borderRadius: "6px" }}>
                ⚡ Notificación en 0.4s
              </span>
            </div>
          </div>

          {/* Tarjeta 4: Analítica & Píxel */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "34px 28px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 22px 48px rgba(0, 0, 0, 0.16)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "#fe6612";
                iconBox.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.08)";
              const iconBox = e.currentTarget.querySelector(".channel-icon-box");
              if (iconBox) {
                iconBox.style.backgroundColor = "rgba(254, 102, 18, 0.1)";
                iconBox.style.color = "#fe6612";
              }
            }}
          >
            <div
              className="channel-icon-box"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(254, 102, 18, 0.1)",
                color: "#fe6612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "22px",
                transition: "background-color 0.25s ease, color 0.25s ease",
              }}
            >
              <BarChart3 size={24} strokeWidth={2} />
            </div>

            <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Analítica & Píxel
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px", flexGrow: 1 }}>
              Medición exacta de visitas y conversiones con Meta Píxel y Google Analytics 4 activos.
            </p>

            {/* Píldora minimalista */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "#f4f4f5", color: "#7c3aed", fontSize: "11px", fontWeight: "700", padding: "4px 9px", borderRadius: "6px" }}>
                📈 Eventos Lead / Compra
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
