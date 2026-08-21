import { Check, Sparkles } from "lucide-react";

export function HostingerPricingReal() {
  return (
    <section id="precios" className="h-real-pricing-section">
      <div className="h-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#56596e", fontSize: "14px", marginBottom: "12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#12131a">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 1.848-.598 3.559-1.611 4.954l-5.074-13.2A8.442 8.442 0 0 1 12 3.5zm-6.602 4.195c.571-.027 1.111.237 1.393.766L9.61 16.5l-3.23-8.805zm10.742 0l3.076 8.384c.338-.616.554-1.309.627-2.04.148-1.503-.314-2.993-1.282-4.142l-2.421-2.202z" />
            </svg>
            <span>Recomendado por <strong>WordPress.org</strong></span>
          </div>

          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: "800", color: "#12131a", marginBottom: "14px", lineHeight: "1.15" }}>
            Explora los planes de hosting administrado para WordPress
          </h2>
          <p style={{ color: "#56596e", fontSize: "15px", margin: 0 }}>
            Nuestros servicios de hosting ofrecen rendimiento superior, herramientas con IA y soporte las 24 horas del día, con precios que se adaptan a tu crecimiento.
          </p>
        </div>

        <div className="h-real-pricing-grid">
          {/* Plan 1: Premium */}
          <div className="h-real-plan-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#12131a", margin: 0 }}>Premium</h3>
              <span style={{ background: "#e6f7f3", color: "#00876e", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>-78%</span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#727586", minHeight: "36px", margin: "0 0 16px" }}>
              Gestiona sitios web sin problemas. Ideal para creadores y pequeñas marcas.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ textDecoration: "line-through", color: "#84879c", fontSize: "12.5px" }}>11,99 US$</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <strong className="h-plan-price-num" style={{ fontSize: "32px", fontWeight: "800", color: "#12131a" }}>2,59 US$</strong>
                <span style={{ color: "#727586", fontSize: "13px" }}>/mes</span>
              </div>
              <small style={{ color: "#84879c", fontSize: "11px", display: "block", marginTop: "2px" }}>
                Obtén 48 meses por 124,32 US$ (valorado en 575,52 US$). Se renueva por 9,99 US$/mes.
              </small>
            </div>

            <a href="#inicio" style={{ background: "#ffffff", border: "1.5px solid #673de6", color: "#673de6", textAlign: "center", padding: "10px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
              Elegir plan
            </a>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Sitios web 3</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Dominio gratis durante 1 año</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>20 GB de almacenamiento SSD</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Backups semanales gratis</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>CDN incluido</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Herramientas de IA</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Soporte prioritario las 24 horas</span></li>
            </ul>
          </div>

          {/* Plan 2: Unlimited (Dark Card - Más Vendido) */}
          <div className="h-real-plan-card unlimited-popular">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Unlimited</h3>
              <span style={{ background: "#673de6", color: "#ffffff", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>Oferta especial -80%</span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#c9ccd5", minHeight: "36px", margin: "0 0 16px" }}>
              Sitios web y buzones ilimitados, además de herramientas de IA y asistencia prioritaria para una máxima flexibilidad.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ textDecoration: "line-through", color: "#a0a3bd", fontSize: "12.5px" }}>18,99 US$</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <strong className="h-plan-price-num" style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>3,79 US$</strong>
                <span style={{ color: "#c9ccd5", fontSize: "13px" }}>/mes</span>
              </div>
              <small style={{ color: "#a0a3bd", fontSize: "11px", display: "block", marginTop: "2px" }}>
                Obtén 48 meses por 181,92 US$ (valorado en 911,52 US$). Se renueva por 16,99 US$/mes.
              </small>
            </div>

            <a href="#inicio" className="h-btn-cta-purple" style={{ textAlign: "center", padding: "10px", fontSize: "14px", marginBottom: "24px" }}>
              Elegir plan
            </a>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text"><strong>Ilimitado sitios web</strong></span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">Dominio gratis durante 1 año</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text"><strong>50 GB de almacenamiento NVMe</strong></span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">Backups diarios + restauración de datos fácil</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">CDN incluido</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">Ecommerce integrado</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">Herramientas de IA</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span className="h-feature-check-text">Soporte prioritario las 24 horas</span></li>
            </ul>

            <div style={{ marginTop: "20px", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <strong style={{ fontSize: "12px", color: "#ffffff", display: "block", marginBottom: "2px" }}>¿Por qué elegir este plan?</strong>
              <small style={{ color: "#a0a3bd", fontSize: "11px" }}>Una solución integral para proyectos a largo plazo con todo incluido.</small>
            </div>
          </div>

          {/* Plan 3: Cloud Startup */}
          <div className="h-real-plan-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#12131a", margin: 0 }}>Cloud Startup</h3>
              <span style={{ background: "#e6f7f3", color: "#00876e", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>-69%</span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#727586", minHeight: "36px", margin: "0 0 16px" }}>
              Rendimiento superior para agencias o proyectos con alto tráfico.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ textDecoration: "line-through", color: "#84879c", fontSize: "12.5px" }}>25,99 US$</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <strong className="h-plan-price-num" style={{ fontSize: "32px", fontWeight: "800", color: "#12131a" }}>7,99 US$</strong>
                <span style={{ color: "#727586", fontSize: "13px" }}>/mes</span>
              </div>
              <small style={{ color: "#84879c", fontSize: "11px", display: "block", marginTop: "2px" }}>
                Obtén 48 meses por 383,52 US$ (valorado en 1.247,52 US$). Se renueva por 23,99 US$/mes.
              </small>
            </div>

            <a href="#inicio" style={{ background: "#ffffff", border: "1.5px solid #673de6", color: "#673de6", textAlign: "center", padding: "10px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
              Elegir plan
            </a>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Sitios web ilimitado</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Dominio gratis durante 1 año</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span><strong>100 GB de almacenamiento NVMe</strong></span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Backups diarios y bajo demanda</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>CDN incluido</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Ecommerce integrado</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Herramientas de IA</span></li>
              <li style={{ display: "flex", gap: "8px" }}><Check size={15} color="#00b090" /><span>Soporte prioritario las 24 horas</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
