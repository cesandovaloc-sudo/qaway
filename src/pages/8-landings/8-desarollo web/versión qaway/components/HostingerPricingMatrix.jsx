import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, HelpCircle, Info, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const periods = [
  { id: "48", label: "48 Meses", discountExtra: "Mejor Precio" },
  { id: "24", label: "24 Meses", discountExtra: "Ahorra 70%" },
  { id: "12", label: "12 Meses", discountExtra: "Dominio gratis" },
  { id: "1", label: "1 Mes", discountExtra: "Sin compromiso" },
];

const plansPricing = {
  "48": {
    premium: { price: "US$ 2.49", old: "US$ 11.99", discount: "79% OFF", renewal: "US$ 6.99/mes" },
    business: { price: "US$ 2.99", old: "US$ 13.99", discount: "78% OFF", renewal: "US$ 8.99/mes" },
    cloud: { price: "US$ 7.99", old: "US$ 24.99", discount: "68% OFF", renewal: "US$ 19.99/mes" },
  },
  "24": {
    premium: { price: "US$ 2.99", old: "US$ 11.99", discount: "75% OFF", renewal: "US$ 7.99/mes" },
    business: { price: "US$ 3.99", old: "US$ 13.99", discount: "71% OFF", renewal: "US$ 9.99/mes" },
    cloud: { price: "US$ 9.99", old: "US$ 24.99", discount: "60% OFF", renewal: "US$ 21.99/mes" },
  },
  "12": {
    premium: { price: "US$ 3.49", old: "US$ 11.99", discount: "70% OFF", renewal: "US$ 8.99/mes" },
    business: { price: "US$ 4.99", old: "US$ 13.99", discount: "64% OFF", renewal: "US$ 11.99/mes" },
    cloud: { price: "US$ 12.99", old: "US$ 24.99", discount: "48% OFF", renewal: "US$ 24.99/mes" },
  },
  "1": {
    premium: { price: "US$ 9.99", old: "US$ 11.99", discount: "15% OFF", renewal: "US$ 11.99/mes" },
    business: { price: "US$ 12.99", old: "US$ 13.99", discount: "10% OFF", renewal: "US$ 13.99/mes" },
    cloud: { price: "US$ 21.99", old: "US$ 24.99", discount: "12% OFF", renewal: "US$ 24.99/mes" },
  },
};

const fullMatrixCategories = [
  {
    category: "Rendimiento y Almacenamiento",
    features: [
      { name: "Número de Sitios Web", premium: "100", business: "100", cloud: "300" },
      { name: "Almacenamiento en Disco", premium: "100 GB SSD", business: "200 GB NVMe", cloud: "200 GB NVMe" },
      { name: "Memoria RAM", premium: "1 GB", business: "1.5 GB", cloud: "3 GB Dedicada" },
      { name: "Núcleos CPU", premium: "1 Núcleo", business: "2 Núcleos", cloud: "2 Núcleos Dedicados" },
      { name: "Servidor Web LiteSpeed", premium: true, business: true, cloud: true },
      { name: "Acelerador LSCache", premium: true, business: true, cloud: true },
    ],
  },
  {
    category: "WordPress e Inteligencia Artificial",
    features: [
      { name: "Creador de Sitios Web con IA", premium: true, business: true, cloud: true },
      { name: "Generador de Contenido y Blog con IA", premium: false, business: true, cloud: true },
      { name: "Herramienta de Staging de WordPress", premium: false, business: true, cloud: true },
      { name: "Actualizaciones automáticas de Core y Plugins", premium: true, business: true, cloud: true },
      { name: "Asistente SEO con IA", premium: false, business: true, cloud: true },
      { name: "Soporte Multisite de WordPress", premium: true, business: true, cloud: true },
    ],
  },
  {
    category: "Seguridad y Copias de Respaldo",
    features: [
      { name: "Certificados SSL Gratuitos Ilimitados", premium: true, business: true, cloud: true },
      { name: "Frecuencia de Copias de Seguridad", premium: "Semanales", business: "Diarias", cloud: "Diarias" },
      { name: "Copias de Seguridad bajo Demanda", premium: false, business: true, cloud: true },
      { name: "Protección DDoS de Cloudflare", premium: true, business: true, cloud: true },
      { name: "Escáner Automático de Malware", premium: true, business: true, cloud: true },
      { name: "Dirección IP Dedicada", premium: false, business: "Opcional", cloud: "Incluida Gratis" },
    ],
  },
  {
    category: "Dominio, Correo y Soporte",
    features: [
      { name: "Dominio Gratis (1er año)", premium: true, business: true, cloud: true },
      { name: "Cuentas de Correo Corporativo", premium: "Gratis (hasta 100)", business: "Gratis (hasta 100)", cloud: "Gratis (hasta 100)" },
      { name: "Soporte Técnico 24/7 en Español", premium: true, business: true, cloud: "Prioritario 24/7" },
      { name: "Garantía de Reembolso de 30 Días", premium: true, business: true, cloud: true },
    ],
  },
];

export function HostingerPricingMatrix() {
  const [selectedPeriod, setSelectedPeriod] = useState("48");
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  const pricing = plansPricing[selectedPeriod];

  return (
    <section id="precios" className="h-pricing-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Planes de Hosting Administrado para WordPress con IA</h2>
          <p>Selecciona tu ciclo de facturación y obtén el máximo descuento disponible.</p>
        </div>

        {/* Period Switcher */}
        <div style={{ textAlign: "center" }}>
          <div className="h-period-switcher">
            {periods.map((p) => (
              <button
                key={p.id}
                className={`h-period-btn ${selectedPeriod === p.id ? "active" : ""}`}
                onClick={() => setSelectedPeriod(p.id)}
              >
                <span>{p.label}</span>
                {p.id === "48" && (
                  <span
                    style={{
                      marginLeft: "6px",
                      background: "#e6f7f3",
                      color: "#00876e",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    MÁS AHORRO
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Main Pricing Cards */}
        <div className="h-pricing-grid">
          {/* Plan 1: Premium */}
          <div className="h-plan-card">
            <h3 className="h-plan-title">Premium</h3>
            <p className="h-plan-desc">Rendimiento esencial para blogs personales y webs corporativas de inicio.</p>

            <div className="h-plan-price-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="old-price tabular-nums">{pricing.premium.old}</span>
                <span className="h-discount-badge">{pricing.premium.discount}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <strong style={{ fontSize: "38px", fontWeight: "800", color: "#5025d1" }} className="tabular-nums">
                  {pricing.premium.price}
                </strong>
                <span style={{ color: "#727586", fontSize: "14px" }}>/mes</span>
              </div>
              <small style={{ color: "#727586", fontSize: "12px", display: "block", marginTop: "6px" }}>
                Renueva a {pricing.premium.renewal}
              </small>
            </div>

            <a
              href="#inicio"
              className="h-btn-primary"
              style={{ width: "100%", background: "#ffffff", color: "#5025d1", border: "2px solid #5025d1", boxShadow: "none" }}
            >
              Elegir Plan
            </a>

            <ul className="h-plan-features-list">
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span><strong>100 Sitios web</strong></span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>100 GB Almacenamiento SSD</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Creador de sitios web con IA</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Dominio gratis incluido (US$ 9.99)</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>SSL ilimitado gratuito</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Copias de seguridad semanales</span>
              </li>
            </ul>
          </div>

          {/* Plan 2: Business (Popular) */}
          <div className="h-plan-card popular">
            <div className="h-plan-badge-popular">Más Popular</div>

            <h3 className="h-plan-title">Business</h3>
            <p className="h-plan-desc">El nivel recomendado con NVMe ultra rápido y suite completa de IA para WordPress.</p>

            <div className="h-plan-price-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="old-price tabular-nums">{pricing.business.old}</span>
                <span className="h-discount-badge">{pricing.business.discount}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <strong style={{ fontSize: "40px", fontWeight: "800", color: "#5025d1" }} className="tabular-nums">
                  {pricing.business.price}
                </strong>
                <span style={{ color: "#727586", fontSize: "14px" }}>/mes</span>
              </div>
              <small style={{ color: "#727586", fontSize: "12px", display: "block", marginTop: "6px" }}>
                + 3 meses gratis • Renueva a {pricing.business.renewal}
              </small>
            </div>

            <a href="#inicio" className="h-btn-primary" style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
              Elegir Plan
            </a>

            <ul className="h-plan-features-list">
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span><strong>100 Sitios web</strong> con aceleración</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span><strong>200 GB NVMe</strong> hasta 5x más veloz</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Herramientas avanzadas de WordPress con IA</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Asistente de Contenido y SEO con IA</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Herramienta de Staging en 1 clic</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Copias de seguridad diarias automáticas</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>CDN global gratuita integrada</span>
              </li>
            </ul>
          </div>

          {/* Plan 3: Cloud Startup */}
          <div className="h-plan-card">
            <h3 className="h-plan-title">Cloud Startup</h3>
            <p className="h-plan-desc">Recursos dedicados y máxima potencia para tiendas WooCommerce o alto tráfico.</p>

            <div className="h-plan-price-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="old-price tabular-nums">{pricing.cloud.old}</span>
                <span className="h-discount-badge">{pricing.cloud.discount}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <strong style={{ fontSize: "38px", fontWeight: "800", color: "#5025d1" }} className="tabular-nums">
                  {pricing.cloud.price}
                </strong>
                <span style={{ color: "#727586", fontSize: "14px" }}>/mes</span>
              </div>
              <small style={{ color: "#727586", fontSize: "12px", display: "block", marginTop: "6px" }}>
                Renueva a {pricing.cloud.renewal}
              </small>
            </div>

            <a
              href="#inicio"
              className="h-btn-primary"
              style={{ width: "100%", background: "#ffffff", color: "#5025d1", border: "2px solid #5025d1", boxShadow: "none" }}
            >
              Elegir Plan
            </a>

            <ul className="h-plan-features-list">
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span><strong>300 Sitios web</strong></span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span><strong>3 GB RAM & 2 CPU</strong> Dedicadas</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>IP Dedicada incluida gratis</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Soporte prioritario 24/7 VIP</span>
              </li>
              <li className="h-plan-feature-item">
                <Check size={16} strokeWidth={2.5} />
                <span>Rendimiento hasta 10 veces más rápido</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Collapsible Full Feature Comparison Matrix */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={() => setShowFullMatrix(!showFullMatrix)}
            style={{
              background: "#ffffff",
              border: "1.5px solid #673de6",
              color: "#673de6",
              padding: "12px 30px",
              borderRadius: "10px",
              fontSize: "14.5px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{showFullMatrix ? "Ocultar tabla comparativa completa" : "Ver comparativa completa de más de 30 características"}</span>
            {showFullMatrix ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Matriz Desplegable */}
        <AnimatePresence>
          {showFullMatrix && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: "hidden", marginTop: "32px" }}
            >
              <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e5e9", padding: "28px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e5e9" }}>
                      <th style={{ padding: "16px", width: "40%", fontWeight: "800", color: "#1d1e24" }}>Características</th>
                      <th style={{ padding: "16px", width: "20%", fontWeight: "800", color: "#1d1e24" }}>Premium</th>
                      <th style={{ padding: "16px", width: "20%", fontWeight: "800", color: "#5025d1" }}>Business</th>
                      <th style={{ padding: "16px", width: "20%", fontWeight: "800", color: "#1d1e24" }}>Cloud Startup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullMatrixCategories.map((cat) => (
                      <React.Fragment key={cat.category}>
                        <tr style={{ background: "#f8f9fa" }}>
                          <td colSpan={4} style={{ padding: "12px 16px", fontWeight: "800", color: "#673de6", fontSize: "13px", textTransform: "uppercase" }}>
                            {cat.category}
                          </td>
                        </tr>
                        {cat.features.map((f) => (
                          <tr key={f.name} style={{ borderBottom: "1px solid #f0f2f5" }}>
                            <td style={{ padding: "14px 16px", color: "#2f303a" }}>{f.name}</td>
                            <td style={{ padding: "14px 16px" }}>
                              {typeof f.premium === "boolean" ? (
                                f.premium ? <Check size={16} color="#00b090" /> : <span style={{ color: "#a0a3bd" }}>—</span>
                              ) : (
                                <strong>{f.premium}</strong>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px", color: "#5025d1" }}>
                              {typeof f.business === "boolean" ? (
                                f.business ? <Check size={16} color="#00b090" /> : <span style={{ color: "#a0a3bd" }}>—</span>
                              ) : (
                                <strong>{f.business}</strong>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              {typeof f.cloud === "boolean" ? (
                                f.cloud ? <Check size={16} color="#00b090" /> : <span style={{ color: "#a0a3bd" }}>—</span>
                              ) : (
                                <strong>{f.cloud}</strong>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
