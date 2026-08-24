import { ShieldCheck, Cloud, MessageSquare, Activity } from "lucide-react";

export function HostingerSecurityGrid() {
  return (
    <section id="soporte" style={{ padding: "90px 0 100px", background: "#f8f9fc" }}>
      <div className="h-container">
        
        {/* Encabezado Centrado de la Sección */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 52px" }}>
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

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 14px", lineHeight: "1.2" }}>
            Nosotros nos encargamos de todo el soporte para que tú <span style={{ color: "#fe6612" }}>te enfoques en tu negocio</span>
          </h2>

          <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.55", margin: 0 }}>
            Olvídate de problemas técnicos, caídas de servidor o configuraciones complejas. Cuentas con un equipo profesional cuidando tu sitio en todo momento.
          </p>
        </div>

        {/* Grid 2x2 de Capacidades de Soporte */}
        <div className="h-security-grid">
          {/* Card 1: Actualizaciones & Seguridad */}
          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "14px", padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(254, 102, 18, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <ShieldCheck size={24} color="#fe6612" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", marginBottom: "10px", fontFamily: "var(--qw-font-display)" }}>
              Actualizaciones & Seguridad Continua
            </h3>
            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
              Mantenemos los scripts, componentes y librerías siempre al día para prevenir fallos, vulnerabilidades e incompatibilidades.
            </p>
          </div>

          {/* Card 2: Copias de Seguridad */}
          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "14px", padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(254, 102, 18, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <Cloud size={24} color="#fe6612" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", marginBottom: "10px", fontFamily: "var(--qw-font-display)" }}>
              Copias de Seguridad en la Nube
            </h3>
            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
              Respaldos automáticos periódicos almacenados en la nube para proteger y restaurar toda tu información ante cualquier eventualidad.
            </p>
          </div>

          {/* Card 3: Soporte WhatsApp */}
          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "14px", padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(37, 211, 102, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <MessageSquare size={24} color="#25d366" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", marginBottom: "10px", fontFamily: "var(--qw-font-display)" }}>
              Soporte Directo por WhatsApp
            </h3>
            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
              Atención rápida, humana y personalizada para resolver dudas operativas o solicitar cambios puntuales sin intermediarios ni tickets lentos.
            </p>
          </div>

          {/* Card 4: Monitoreo 24/7 */}
          <div style={{ background: "#ffffff", border: "1px solid #e4e4e7", borderRadius: "14px", padding: "32px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(22, 163, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <Activity size={24} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", marginBottom: "10px", fontFamily: "var(--qw-font-display)" }}>
              Monitoreo de Disponibilidad 24/7
            </h3>
            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
              Supervisión constante de velocidad y estabilidad para asegurar que tu web esté siempre activa y lista para recibir nuevos clientes.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
