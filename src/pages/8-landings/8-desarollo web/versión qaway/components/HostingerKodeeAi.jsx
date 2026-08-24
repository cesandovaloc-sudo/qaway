import { Check, Sparkles } from "lucide-react";

export function HostingerKodeeAi() {
  return (
    <section style={{ padding: "80px 0", background: "#ffffff" }}>
      <div className="h-container">
        <div className="h-split-grid">
          {/* Izquierda: Lista de Capacidades */}
          <div>
            <h2 style={{ marginBottom: "24px" }}>
              Kodee puede:
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#2f303a" }}>
                <Check size={18} color="#00b090" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Configurar servicios, conectar dominios y gestionar el DNS</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#2f303a" }}>
                <Check size={18} color="#00b090" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Solucionar problemas comunes y guiarte por los pasos técnicos al instante</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#2f303a" }}>
                <Check size={18} color="#00b090" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Ayudarte a publicar tu sitio web más rápido, sin necesidad de conocimientos técnicos</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "#2f303a" }}>
                <Check size={18} color="#00b090" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>Conectarte con nuestro equipo de atención al cliente si necesitas ayuda adicional</span>
              </li>
            </ul>
          </div>

          {/* Derecha: Visual del Chat Kodee */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ background: "linear-gradient(135deg, #673de6 0%, #a78bfa 100%)", borderRadius: "12px", padding: "36px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 50px rgba(103,61,230,0.2)" }}>
              <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00b090" }} />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#56596e" }}>Agente de IA</span>
                </div>

                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <Sparkles size={24} color="#673de6" />
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#12131a", margin: "0 0 4px" }}>Hola 👋</h4>
                  <p style={{ fontSize: "12.5px", color: "#56596e", margin: 0 }}>¿En qué puedo ayudarte hoy?</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "10px 14px", borderRadius: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#12131a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <span>↗</span>
                    <span>Quiero migrar a Hostinger</span>
                  </button>
                  <button style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "10px 14px", borderRadius: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#12131a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <span>↗</span>
                    <span>Ayúdame a elegir el plan de hosting adecuado</span>
                  </button>
                  <button style={{ background: "#f8f9fc", border: "1px solid #e4e4e7", padding: "10px 14px", borderRadius: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#12131a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <span>↗</span>
                    <span>Quiero crear un sitio web</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
