import { MessageSquare, CreditCard, Mail, BarChart3, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function HostingerSalesAutomationTaste() {
  return (
    <section
      id="automatizacion-taste"
      style={{
        padding: "100px 0 110px",
        background: "#0c0d12",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Resplandor radial naranja cálido de fondo */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background: "radial-gradient(circle, rgba(254, 102, 18, 0.12) 0%, rgba(12, 13, 18, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="h-container" style={{ maxWidth: "1200px", position: "relative", zIndex: 2 }}>
        
        {/* Encabezado Editorial de Alto Contraste */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 56px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#fe6612",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(254, 102, 18, 0.12)",
              border: "1px solid rgba(254, 102, 18, 0.25)",
              padding: "5px 14px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            CONEXIÓN & AUTOMATIZACIÓN COMERCIAL
          </span>

          <h2 style={{ fontSize: "clamp(2rem, 3.4vw, 2.7rem)", fontWeight: "600", color: "#ffffff", margin: "0 0 16px", lineHeight: "1.2" }}>
            Conecta tu web a tus canales de venta y <span style={{ color: "#fe6612" }}>recibe clientes en automático</span>
          </h2>

          <p style={{ color: "#a1a1aa", fontSize: "16.5px", lineHeight: "1.6", margin: 0 }}>
            Tu sitio web deja de ser un folleto estático y se convierte en un sistema que capta prospectos calificados y cobra por ti las 24 horas.
          </p>
        </div>

        {/* Bento Grid Asimétrico con Widgets Reales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            marginBottom: "52px",
          }}
        >
          {/* Card 1: WhatsApp Business (Destacado Ancho - 7 Columnas) */}
          <div
            style={{
              gridColumn: "span 7",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "32px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(37, 211, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare size={20} color="#25d366" />
                  </div>
                  <strong style={{ fontSize: "16px", color: "#ffffff" }}>WhatsApp Business Directo</strong>
                </div>
                <span style={{ background: "rgba(37, 211, 102, 0.12)", color: "#25d366", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px" }}>
                  🟢 Conexión Activa
                </span>
              </div>
              <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
                Botón flotante inteligente y mensajes predeterminados para que los visitantes te escriban a tu celular en 1 clic sin fricción.
              </p>
            </div>

            {/* Simulación de Mensaje Entrante */}
            <div style={{ background: "#181920", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#25d366", fontWeight: "700", display: "block", marginBottom: "2px" }}>Consulta recibida hace 2 min</span>
                <span style={{ fontSize: "13px", color: "#e4e4e7", fontWeight: "500" }}>"Hola, vi el diseño web de su página y deseo cotizar..."</span>
              </div>
              <span style={{ background: "#25d366", color: "#000000", fontSize: "11.5px", fontWeight: "800", padding: "6px 14px", borderRadius: "6px", flexShrink: 0 }}>
                Atender
              </span>
            </div>
          </div>

          {/* Card 2: Pasarelas de Pago (5 Columnas) */}
          <div
            style={{
              gridColumn: "span 5",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "32px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(254, 102, 18, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CreditCard size={20} color="#fe6612" />
                </div>
                <strong style={{ fontSize: "16px", color: "#ffffff" }}>Pasarelas de Pago</strong>
              </div>
              <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
                Cobro seguro con tarjetas, transferencias, Yape, Plin y Stripe sin comisiones ocultas.
              </p>
            </div>

            {/* Badges de métodos de pago */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: "#1f2028", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", fontSize: "12px", fontWeight: "700", padding: "6px 12px", borderRadius: "8px" }}>📱 Yape / Plin</span>
              <span style={{ background: "#1f2028", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", fontSize: "12px", fontWeight: "700", padding: "6px 12px", borderRadius: "8px" }}>💳 Visa / MC</span>
              <span style={{ background: "#1f2028", border: "1px solid rgba(255,255,255,0.08)", color: "#ffffff", fontSize: "12px", fontWeight: "700", padding: "6px 12px", borderRadius: "8px" }}>⚡ Stripe</span>
            </div>
          </div>

          {/* Card 3: Formularios & CRM (6 Columnas) */}
          <div
            style={{
              gridColumn: "span 6",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "28px 30px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={18} color="#38bdf8" />
              </div>
              <div>
                <strong style={{ fontSize: "15.5px", color: "#ffffff", display: "block" }}>Formularios & CRM a tu Correo</strong>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "600" }}>Notificación instantánea en 0.4 segundos</span>
              </div>
            </div>
            <p style={{ color: "#a1a1aa", fontSize: "13.5px", lineHeight: "1.55", margin: 0 }}>
              Cada cliente potencial que llena el formulario llega de inmediato a tu bandeja de entrada o base de datos de Google Sheets con datos validados.
            </p>
          </div>

          {/* Card 4: Analítica & Píxel (6 Columnas) */}
          <div
            style={{
              gridColumn: "span 6",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "28px 30px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={18} color="#a855f7" />
              </div>
              <div>
                <strong style={{ fontSize: "15.5px", color: "#ffffff", display: "block" }}>Analítica & Píxel de Conversión</strong>
                <span style={{ fontSize: "11px", color: "#a855f7", fontWeight: "600" }}>Eventos Lead & Contacto sincronizados</span>
              </div>
            </div>
            <p style={{ color: "#a1a1aa", fontSize: "13.5px", lineHeight: "1.55", margin: 0 }}>
              Configuramos Google Analytics 4 y el Píxel de Meta para que midas el retorno de tus campañas publicitarias y sepas de dónde vienen tus ventas.
            </p>
          </div>

        </div>

        {/* Botón CTA Destacado con Sombra Naranja */}
        <div style={{ textAlign: "center" }}>
          <a
            href="#planes"
            className="h-btn-cta-orange"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 44px",
              fontSize: "15.5px",
              fontWeight: "700",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(254, 102, 18, 0.35)",
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
