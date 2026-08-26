import { motion } from "framer-motion";
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
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 52px" }}
        >
          <span className="qw-kicker-capsule-light">
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
        </motion.div>

        {/* Grid de 4 Tarjetas Blancas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Tarjeta 1: WhatsApp Business */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
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
                Conexión Activa
              </span>
            </div>
          </motion.div>

          {/* Tarjeta 2: Pasarelas de Pago */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
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
              Cobros online automáticos con Yape, Plin, tarjetas de crédito, débito y transferencias.
            </p>

            {/* Píldora minimalista */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "#f4f4f5", color: "#3f3f46", fontSize: "11px", fontWeight: "700", padding: "4px 9px", borderRadius: "6px" }}>
                Yape · Tarjetas · Culqi
              </span>
            </div>
          </motion.div>

          {/* Tarjeta 3: E-mails & Notificaciones */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
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
              E-mails & Notificaciones
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 20px", flexGrow: 1 }}>
              Confirmaciones de pedido automáticas y alertas en tiempo real al correo de tu empresa.
            </p>

            {/* Píldora minimalista */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid #f4f4f5" }}>
              <span style={{ background: "#f4f4f5", color: "#0284c7", fontSize: "11px", fontWeight: "700", padding: "4px 9px", borderRadius: "6px" }}>
                Auto-Respuesta 24/7
              </span>
            </div>
          </motion.div>

          {/* Tarjeta 4: Analítica & Píxel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
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
                Eventos Lead / Compra
              </span>
            </div>
          </motion.div>
        </div>

        {/* Botón Automatizar mi proyecto (Oculto hasta activar portafolio) */}
        <div style={{ display: "none", marginTop: "48px", textAlign: "center" }}>
          <a
            href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab%2C%20deseo%20automatizar%20mi%20proyecto%20web%20con%20WhatsApp%20y%20pasarelas%20de%20pago."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#ffffff",
              color: "#18181b",
              padding: "14px 36px",
              borderRadius: "9999px",
              fontSize: "15px",
              fontWeight: "700",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <span>Automatizar mi proyecto</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
