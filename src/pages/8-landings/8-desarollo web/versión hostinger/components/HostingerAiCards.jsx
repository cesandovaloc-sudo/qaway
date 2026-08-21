import { CheckCircle2, Gauge, Headphones, ShoppingCart, Sparkles } from "lucide-react";

export function HostingerAiCards() {
  return (
    <section className="h-ai-three-cards-section">
      <div className="h-container">
        <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: "800", color: "#12131a", letterSpacing: "-0.03em" }}>
          Ahorra tiempo gestionando<br />WordPress con IA
        </h2>

        <div className="h-three-cards-grid">
          {/* Tarjeta 1: Creador de páginas */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ background: "#f8f9fc" }}>
              <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e5e9", padding: "14px", width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", gap: "6px", fontSize: "10px", color: "#727586" }}>
                    <span>Save</span>
                    <span>Preview</span>
                  </div>
                  <button style={{ background: "#673de6", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: "700" }}>
                    Go Live
                  </button>
                </div>
                <div style={{ flexGrow: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: "800", margin: "0 0 4px" }}>Best sound quality</h4>
                    <p style={{ fontSize: "10px", color: "#727586", margin: 0 }}>Wireless headphones</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
                    alt="Headphones"
                    style={{ width: "80px", height: "80px", objectFit: "contain", marginLeft: "auto" }}
                  />
                </div>
              </div>
            </div>
            <div className="h-ai-feature-card-body">
              <h3>Creador de páginas web con IA</h3>
              <p>
                Crea un sitio web en menos de 1 minuto con Elementor o el editor de bloques. Publica blogs, webs de negocios o tiendas WooCommerce al instante.
              </p>
            </div>
          </div>

          {/* Tarjeta 2: Solucionador de problemas */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ background: "#f8f9fc" }}>
              <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e5e9", padding: "16px", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#e6f7f3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                  <CheckCircle2 size={28} color="#00b090" />
                </div>
                <strong style={{ fontSize: "13px", color: "#12131a" }}>All errors have been fixed</strong>
                <small style={{ color: "#727586", fontSize: "10.5px", marginTop: "2px" }}>Automated AI diagnosis 100%</small>
              </div>
            </div>
            <div className="h-ai-feature-card-body">
              <h3>Solucionador de problemas de sitios con IA</h3>
              <p>
                Minimiza el tiempo de inactividad con la detección y corrección automática de errores: la IA resuelve el 70% de los problemas en minutos, sin que tú intervengas.
              </p>
            </div>
          </div>

          {/* Tarjeta 3: Optimizador de sitios web */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ background: "#f8f9fc" }}>
              <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e5e9", padding: "14px", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ color: "#727586", fontSize: "10px" }}>PageSpeed</small>
                  <strong style={{ fontSize: "18px", color: "#00b090" }}>99</strong>
                </div>
                <div style={{ background: "#f0f2f5", height: "6px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "99%", height: "100%", background: "#00b090" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10.5px" }}>
                  <span>LiteSpeed Cache</span>
                  <span style={{ color: "#00b090", fontWeight: "700" }}>Active</span>
                </div>
              </div>
            </div>
            <div className="h-ai-feature-card-body">
              <h3>Optimizador de sitios web con IA</h3>
              <p>
                Aumenta el rendimiento del sitio con Hostinger Reach: la IA aplica optimizaciones LiteSpeed y detecta consultas lentas automáticamente para hacer tu web ultrarrápida.
              </p>
            </div>
          </div>
        </div>

        <div>
          <a href="#precios" className="h-btn-cta-purple" style={{ padding: "14px 42px" }}>
            Empezar ya
          </a>
        </div>
      </div>
    </section>
  );
}
