import { Check, Sparkles } from "lucide-react";

export function HostingerPricingReal() {
  return (
    <section id="planes" className="h-real-pricing-section">
      <div className="h-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
          <span className="qw-kicker-capsule">
            PLANES & PRECIOS
          </span>

          <h2 style={{ marginBottom: "14px" }}>
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

            <a href="#inicio" className="h-btn-outline-black" style={{ textAlign: "center", padding: "11px", fontSize: "14px", marginBottom: "24px" }}>
              Elegir plan
            </a>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#12131a" }}>
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
              <span style={{ background: "#ff4b0b", color: "#ffffff", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>Oferta especial -80%</span>
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

            <a href="#inicio" style={{ background: "#ffffff", color: "#111111", border: "1.5px solid #ffffff", textAlign: "center", padding: "11px", fontSize: "14px", fontWeight: "700", borderRadius: "8px", textDecoration: "none", display: "block", marginBottom: "24px", transition: "all 0.2s ease" }}>
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

            <a href="#inicio" className="h-btn-outline-black" style={{ textAlign: "center", padding: "11px", fontSize: "14px", marginBottom: "24px" }}>
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
