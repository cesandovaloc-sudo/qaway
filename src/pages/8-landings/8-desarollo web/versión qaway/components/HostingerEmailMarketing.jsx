import { ArrowRight, Check, Send, Users } from "lucide-react";

export function HostingerEmailMarketing() {
  return (
    <section className="h-split-section" style={{ background: "#ffffff" }}>
      <div className="h-container">
        <div className="h-split-grid">
          {/* Visual Izquierda */}
          <div style={{ position: "relative", background: "linear-gradient(135deg, #a78bfa 0%, #673de6 100%)", borderRadius: "24px", padding: "32px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#12131a" }}>+124 new subscribers</span>
                <span style={{ background: "#e6f7f3", color: "#00876e", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>+17.5%</span>
              </div>
              <div style={{ background: "#f8f9fc", border: "1px solid #e2e5e9", borderRadius: "10px", padding: "16px", marginBottom: "14px" }}>
                <strong style={{ fontSize: "14px", color: "#12131a", display: "block", marginBottom: "4px" }}>Contact us</strong>
                <div style={{ width: "100%", height: "8px", background: "#e2e5e9", borderRadius: "4px", marginBottom: "8px" }} />
                <button style={{ background: "#673de6", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Texto Derecha */}
          <div>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: "800", color: "#12131a", marginBottom: "18px", lineHeight: "1.2" }}>
              Conecta tu sitio a la herramienta de email marketing con IA con un solo clic
            </h2>
            <p style={{ color: "#56596e", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
              Sincroniza a tus suscriptores con Hostinger Reach: la herramienta de email marketing con IA que te permite crear y enviar campañas en segundos para aumentar tu público y aumentar las conversiones.
            </p>
            <a href="#precios" className="h-btn-cta-purple">
              Más información
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
