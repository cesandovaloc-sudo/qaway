import mockup1 from "../../Diseño sin título (1).png";
import mockup2 from "../../Diseño sin título.png";
import mockup3 from "../../ChatGPT Image 21 ago 2026, 18_38_46.png";

export function HostingerAiCards() {
  return (
    <section id="beneficios" className="h-ai-three-cards-section">
      <div className="h-container">
        <h2 style={{ marginBottom: "14px" }}>
          Ahorra tiempo gestionando WordPress con IA
        </h2>
        <p style={{ color: "#71717a", fontSize: "16px", maxWidth: "620px", margin: "0 auto 40px", lineHeight: "1.5" }}>
          Herramientas inteligentes integradas para optimizar la velocidad, corregir anomalías y potenciar la conversión.
        </p>

        <div className="h-three-cards-grid">
          {/* Tarjeta 1: Creador de páginas */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "#eef1f6", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup1}
                  alt="Mockup Web 1"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
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
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "#eef1f6", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup2}
                  alt="Mockup Web 2"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
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
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "#eef1f6", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup3}
                  alt="Mockup Web 3"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
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
          <a href="#planes" className="h-btn-cta-purple h-btn-cta-orange" style={{ padding: "14px 42px", fontSize: "15px" }}>
            Comenzar ahora
          </a>
        </div>
      </div>
    </section>
  );
}
