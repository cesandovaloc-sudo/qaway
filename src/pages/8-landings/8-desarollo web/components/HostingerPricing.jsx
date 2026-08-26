import { Check, ShieldCheck, Zap } from "lucide-react";

const plans = [
  {
    name: "Premium",
    desc: "Todo lo necesario para crear y alojar hasta 100 sitios web con velocidad estándar.",
    price: "US$ 2.49",
    oldPrice: "US$ 11.99",
    discount: "Ahorra 79%",
    renewal: "Renueva a US$ 6.99/mes",
    popular: false,
    features: [
      "100 Sitios web",
      "100 GB Almacenamiento SSD",
      "Creador de sitios web con IA",
      "Dominio gratis (valor de US$ 9.99)",
      "SSL ilimitado gratis",
      "Copias de seguridad semanales",
      "Ancho de banda ilimitado",
      "Soporte 24/7",
    ],
  },
  {
    name: "Business",
    desc: "Nivel recomendado para optimizar el rendimiento de WordPress con aceleración LiteSpeed y más IA.",
    price: "US$ 2.99",
    oldPrice: "US$ 13.99",
    discount: "Ahorra 78%",
    renewal: "Renueva a US$ 8.99/mes",
    popular: true,
    features: [
      "100 Sitios web",
      "200 GB Almacenamiento NVMe ultrarrápido",
      "Herramientas avanzadas de WordPress con IA",
      "Asistente de contenido y SEO con IA",
      "Dominio gratis (valor de US$ 9.99)",
      "Copias de seguridad diarias y bajo demanda",
      "CDN gratuito integrado",
      "IP dedicada opcional",
      "Staging de WordPress con 1 clic",
    ],
  },
  {
    name: "Cloud Startup",
    desc: "Potencia y recursos dedicados para proyectos de alto tráfico o tiendas WooCommerce.",
    price: "US$ 7.99",
    oldPrice: "US$ 24.99",
    discount: "Ahorra 68%",
    renewal: "Renueva a US$ 19.99/mes",
    popular: false,
    features: [
      "300 Sitios web",
      "200 GB Almacenamiento NVMe",
      "3 GB RAM y 2 núcleos CPU dedicados",
      "Dirección IP dedicada incluida",
      "Rendimiento hasta 10 veces más rápido",
      "Soporte prioritario 24/7",
      "Todas las funciones de IA de WordPress",
      "Copias de seguridad automáticas diarias",
    ],
  },
];

export function HostingerPricing() {
  return (
    <section id="precios" className="h-pricing-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Elige el plan ideal para tu web de WordPress</h2>
          <p>Potencia tu presencia online con tecnología LiteSpeed, creador con IA y garantía de 30 días.</p>
        </div>

        <div className="h-pricing-grid">
          {plans.map((p) => (
            <div key={p.name} className={`h-plan-card ${p.popular ? "popular" : ""}`}>
              {p.popular && <div className="h-plan-badge-popular">Más popular</div>}

              <h3 className="h-plan-title">{p.name}</h3>
              <p className="h-plan-desc">{p.desc}</p>

              <div className="h-plan-price-wrap">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ textDecoration: "line-through", color: "#727586", fontSize: "14px" }}>{p.oldPrice}</span>
                  <span className="h-discount-badge">{p.discount}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <strong style={{ fontSize: "36px", fontWeight: "800", color: "#5025d1" }}>{p.price}</strong>
                  <span style={{ color: "#727586", fontSize: "14px" }}>/mes</span>
                </div>
                <small style={{ color: "#727586", fontSize: "12px", display: "block", marginTop: "4px" }}>{p.renewal}</small>
              </div>

              <a
                href="#inicio"
                className="h-btn-primary"
                style={{
                  width: "100%",
                  background: p.popular ? "#5025d1" : "#ffffff",
                  color: p.popular ? "#ffffff" : "#5025d1",
                  border: p.popular ? "none" : "2px solid #5025d1",
                }}
              >
                Elegir plan
              </a>

              <ul className="h-plan-features-list">
                {p.features.map((f) => (
                  <li key={f} className="h-plan-feature-item">
                    <Check size={16} strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
