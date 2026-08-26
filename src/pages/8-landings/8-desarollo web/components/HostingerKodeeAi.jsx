import { CheckCircle2, ShieldCheck, Cloud, MessageSquare, Wrench, Clock } from "lucide-react";

export function HostingerKodeeAi() {
  return (
    <section className="h-split-section" style={{ background: "#ffffff", borderTop: "1px solid #f4f4f5" }}>
      <div className="h-container">
        <div className="h-split-grid" style={{ gap: "60px", alignItems: "center" }}>
          
          {/* Izquierda: Lista de Capacidades de Soporte */}
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
              SOPORTE & ACOMPAÑAMIENTO TÉCNICO
            </span>

            <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 20px", lineHeight: "1.2" }}>
              Nosotros nos encargamos de todo el soporte para que tú <span style={{ color: "#fe6612" }}>te enfoques en tu negocio</span>
            </h2>

            <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
              Olvídate de problemas técnicos, caídas de servidor o configuraciones complejas. Cuentas con un equipo profesional cuidando tu sitio en todo momento.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ marginTop: "3px", flexShrink: 0 }} />
                <span><strong>Actualizaciones & Seguridad:</strong> Mantenemos los scripts y librerías siempre al día para prevenir fallos y vulnerabilidades.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ marginTop: "3px", flexShrink: 0 }} />
                <span><strong>Copias de Seguridad en la Nube:</strong> Respaldos periódicos automáticos para proteger tu información ante cualquier eventualidad.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ marginTop: "3px", flexShrink: 0 }} />
                <span><strong>Soporte Directo por WhatsApp:</strong> Atención rápida y personalizada para resolver dudas o solicitar ajustes puntuales.</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#27272a" }}>
                <CheckCircle2 size={18} color="#fe6612" style={{ marginTop: "3px", flexShrink: 0 }} />
                <span><strong>Monitoreo de Disponibilidad:</strong> Supervisión constante para asegurar que tu web cargue rápido y esté siempre en línea.</span>
              </li>
            </ul>
          </div>

          {/* Derecha: Visual de Tarjeta de Soporte Activo */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(254, 102, 18, 0.08) 0%, rgba(254, 102, 18, 0.02) 100%)",
                border: "1px solid rgba(254, 102, 18, 0.15)",
                borderRadius: "16px",
                padding: "36px",
                width: "100%",
                maxWidth: "420px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ background: "#ffffff", borderRadius: "14px", padding: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #e4e4e7" }}>
                {/* Header Soporte */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f4f4f5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }} />
                    <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#111111" }}>Soporte Técnico Qaway Lab</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", background: "rgba(22, 163, 74, 0.1)", padding: "3px 8px", borderRadius: "999px" }}>
                    Activo 24/7
                  </span>
                </div>

                {/* Lista de Servicios Activos */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "12px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Cloud size={18} color="#fe6612" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: "12px", color: "#111111", display: "block" }}>Copias de Seguridad Cloud</strong>
                      <span style={{ fontSize: "11px", color: "#71717a" }}>Último respaldo: Hoy · 100% Seguro</span>
                    </div>
                  </div>

                  <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "12px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: "12px", color: "#111111", display: "block" }}>Protección SSL & Antivirus</strong>
                      <span style={{ fontSize: "11px", color: "#71717a" }}>Nivel de seguridad: Máximo</span>
                    </div>
                  </div>

                  <div style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "12px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <MessageSquare size={18} color="#25d366" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: "12px", color: "#111111", display: "block" }}>Asistencia WhatsApp Directa</strong>
                      <span style={{ fontSize: "11px", color: "#71717a" }}>Atención personalizada con tu equipo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
