import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    title: "Landing de Conversión",
    tag: "Para Campañas & WhatsApp",
    desc: "Ideal para marcas que buscan captar leads y ventas inmediatas desde anuncios de Meta o Google.",
    price: "S/ 790",
    period: "Pago único",
    features: [
      "1 Página de alto impacto y venta directa",
      "Copywriting persuasivo profesional",
      "Botones directos de contacto a WhatsApp",
      "Dominio .com + Hosting Cloud por 1 año",
      "Velocidad de carga < 0.8s en móviles",
      "Certificado de seguridad SSL incluido",
      "Entrega garantizada en 5 a 7 días",
    ],
    featured: false,
    btnText: "Cotizar Landing Pro",
  },
  {
    title: "Web Comercial & Marca",
    tag: "Recomendado para Empresas",
    desc: "Sitio multi-sección completo para proyectar máxima autoridad de mercado y captar clientes de alto valor.",
    price: "S/ 1,490",
    period: "Pago único",
    features: [
      "Hasta 5 secciones completas a medida",
      "Dirección visual & UI personalizada",
      "Catálogo interactivo de servicios o proyectos",
      "Formularios inteligentes conectados a WhatsApp",
      "Estructura SEO optimizada para Google",
      "Capacitación grabada para autoadministración",
      "Soporte técnico prioritario por 30 días",
      "Entrega en 10 a 14 días hábiles",
    ],
    featured: true,
    btnText: "Elegir Web Comercial",
  },
  {
    title: "Arquitectura a Medida",
    tag: "E-Commerce & SaaS",
    desc: "Para plataformas con tienda online, pasarela de pagos, filtros avanzados o integraciones con sistemas.",
    price: "A Cotizar",
    period: "Según requerimientos",
    features: [
      "Tienda online con pasarela de pagos integrada",
      "Panel de control para gestión de productos",
      "Base de datos y automatizaciones en tiempo real",
      "Filtros avanzados y buscador dinámico",
      "Integraciones con CRM y herramientas externas",
      "Soporte y mantenimiento dedicado continuo",
    ],
    featured: false,
    btnText: "Cotizar a Medida",
  },
];

export function PricingSection() {
  return (
    <section id="planes" className="sp-dark-zone">
      <div className="sp-container">
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
          <div className="eyebrow-badge" style={{ background: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#94a3b8", marginBottom: "16px" }}>
            <Sparkles size={14} color="#60a5fa" />
            <span>Inversión Transparente</span>
          </div>
          <h2 className="serif-heading" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", marginBottom: "16px" }}>
            Planes claros, sin costos ocultos.
          </h2>
          <p style={{ color: "var(--sp-text-dark-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Todos nuestros proyectos incluyen código fuente, dominio .com, hosting cloud y optimización para velocidad extrema.
          </p>
        </div>

        <div className="sp-pricing-grid">
          {plans.map((p, idx) => (
            <motion.div
              key={p.title}
              className={`sp-pricing-card ${p.featured ? "featured" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {p.featured && <span className="sp-badge-featured">Más Elegido</span>}
              <span style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#60a5fa", marginBottom: "6px" }}>
                {p.tag}
              </span>
              <h3 style={{ fontSize: "1.5rem", color: "#ffffff", marginBottom: "10px" }}>{p.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--sp-text-dark-secondary)", margin: 0, minHeight: "44px" }}>
                {p.desc}
              </p>

              <div className="sp-price-amount">{p.price}</div>
              <small style={{ color: "#64748b", fontSize: "0.8rem", display: "block" }}>{p.period}</small>

              <ul className="sp-price-feature-list">
                {p.features.map((f) => (
                  <li key={f} className="sp-price-feature-item">
                    <Check size={16} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/51987654321?text=${encodeURIComponent(`Hola Qaway Lab, quisiera consultar y contratar el plan: ${p.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={p.featured ? "sp-btn-primary" : "sp-btn-secondary"}
                style={{
                  width: "100%",
                  marginTop: "32px",
                  padding: "13px",
                  background: p.featured ? "#2563eb" : "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  borderColor: p.featured ? "transparent" : "rgba(255, 255, 255, 0.15)",
                }}
              >
                <span>{p.btnText}</span>
                <ArrowRight size={15} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
