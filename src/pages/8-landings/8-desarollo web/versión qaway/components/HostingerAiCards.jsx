import mockup1 from "../../Diseño sin título (1).png";
import mockup2 from "../../Diseño sin título.png";
import mockup3 from "../../ChatGPT Image 21 ago 2026, 18_38_46.png";

export function HostingerAiCards() {
  return (
    <section id="beneficios" className="h-ai-three-cards-section">
      <div className="h-container">
        <span
          style={{
            fontSize: "11.5px",
            fontWeight: "800",
            color: "#71717a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "#e6e8ee",
            padding: "4px 10px",
            borderRadius: "4px",
            display: "inline-block",
            marginBottom: "14px",
          }}
        >
          SOLUCIONES WEB A MEDIDA
        </span>

        <h2 style={{ marginBottom: "14px" }}>
          Estructuras web diseñadas para captar clientes y <span style={{ color: "#fe6612" }}>hacer crecer tu negocio</span>
        </h2>
        <p style={{ color: "#71717a", fontSize: "16px", maxWidth: "680px", margin: "0 auto 40px", lineHeight: "1.5" }}>
          Desarrollo web profesional optimizado para posicionamiento en Google (SEO), conversión comercial y navegación fluida en todos los dispositivos.
        </p>

        <div className="h-three-cards-grid">
          {/* Tarjeta 1: Landing Pages */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, rgba(254, 102, 18, 0.09) 0%, rgba(254, 102, 18, 0.02) 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup1}
                  alt="Landing Pages de Alta Conversión"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            </div>
            
            <div className="h-ai-feature-card-body">
              <h3>Landing Pages de Alta Conversión</h3>
              <p>
                Páginas estratégicas diseñadas para campañas publicitarias (Google Ads y Meta), con velocidad de carga ultra rápida y llamados a la acción (CTA) directos a WhatsApp.
              </p>
            </div>
          </div>

          {/* Tarjeta 2: Sitios Corporativos */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, rgba(254, 102, 18, 0.09) 0%, rgba(254, 102, 18, 0.02) 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup2}
                  alt="Sitios Web Corporativos e Institucionales"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            </div>

            <div className="h-ai-feature-card-body">
              <h3>Sitios Web Corporativos</h3>
              <p>
                Portales multipágina estructurados para posicionar en Google (SEO), transmitir máxima solvencia institucional y presentar tus servicios con autoridad profesional.
              </p>
            </div>
          </div>

          {/* Tarjeta 3: Tiendas Online */}
          <div className="h-ai-feature-card">
            <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, rgba(254, 102, 18, 0.09) 0%, rgba(254, 102, 18, 0.02) 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                <img
                  src={mockup3}
                  alt="Tiendas Online y Comercio Electrónico"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            </div>

            <div className="h-ai-feature-card-body">
              <h3>Tiendas Online (E-commerce)</h3>
              <p>
                Plataformas completas de venta online con catálogo autogestionable, pasarelas de pago seguras (tarjetas, Yape, Plin) y panel intuitivo para vender productos 24/7.
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
