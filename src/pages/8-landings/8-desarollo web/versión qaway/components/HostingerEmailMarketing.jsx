import { MessageSquare, CreditCard, Mail, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";

export function HostingerEmailMarketing() {
  return (
    <section className="h-split-section" style={{ background: "#ffffff" }}>
      <div className="h-container">
        <div className="h-split-grid" style={{ gap: "60px", alignItems: "center" }}>
          
          {/* Visual Izquierda: Centro de Notificaciones Comerciales */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(135deg, rgba(254, 102, 18, 0.08) 0%, rgba(254, 102, 18, 0.02) 100%)",
              border: "1px solid rgba(254, 102, 18, 0.15)",
              borderRadius: "16px",
              padding: "36px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                width: "100%",
                maxWidth: "380px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                border: "1px solid #e4e4e7",
              }}
            >
              {/* Encabezado del Widget */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid #f4f4f5" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#111111" }}>Canales de Venta Activos</span>
                <span style={{ background: "rgba(22, 163, 74, 0.1)", color: "#16a34a", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "999px" }}>
                  🟢 Conectado
                </span>
              </div>

              {/* Tarjeta 1: Notificación WhatsApp */}
              <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "14px", marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(37, 211, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageSquare size={18} color="#25d366" />
                </div>
                <div>
                  <strong style={{ fontSize: "12.5px", color: "#111111", display: "block", marginBottom: "2px" }}>Nueva consulta por WhatsApp</strong>
                  <p style={{ fontSize: "11.5px", color: "#71717a", margin: 0, lineHeight: "1.4" }}>
                    "Hola, vi su sitio web y deseo cotizar un servicio..."
                  </p>
                </div>
              </div>

              {/* Tarjeta 2: Notificación Pago */}
              <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(254, 102, 18, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CreditCard size={18} color="#fe6612" />
                </div>
                <div>
                  <strong style={{ fontSize: "12.5px", color: "#111111", display: "block", marginBottom: "2px" }}>Pago Confirmado</strong>
                  <p style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: "700", margin: 0 }}>
                    S/ 450.00 · Tarjeta / Yape / Plin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Texto Derecha */}
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
              CANALES DE VENTA & AUTOMATIZACIÓN
            </span>

            <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 16px", lineHeight: "1.2" }}>
              Conecta tu web a tus canales de venta y <span style={{ color: "#fe6612" }}>recibe clientes en automático</span>
            </h2>

            <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>
              Integramos tu sitio con las herramientas esenciales para que cada visitante se convierta en una consulta o una venta directa.
            </p>

            {/* Lista de Puntos Comerciales */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ flexShrink: 0 }} />
                <span><strong>WhatsApp Business:</strong> Botón flotante y mensajes predeterminados en un clic.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ flexShrink: 0 }} />
                <span><strong>Pasarelas de Pago:</strong> Cobros seguros con tarjetas, transferencias, Yape y Plin.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ flexShrink: 0 }} />
                <span><strong>Formularios & CRM:</strong> Notificaciones instantáneas de cada cotización a tu correo.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ flexShrink: 0 }} />
                <span><strong>Analítica & Píxel:</strong> Medición de visitas con Meta Píxel y Google Analytics 4.</span>
              </div>
            </div>

            <a href="#planes" className="h-btn-cta-purple h-btn-cta-orange" style={{ padding: "14px 38px", fontSize: "15px" }}>
              Comenzar ahora
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
