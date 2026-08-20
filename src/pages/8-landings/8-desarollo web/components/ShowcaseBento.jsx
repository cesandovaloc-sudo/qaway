import { ArrowUpRight, CheckCircle2, Layers, Smartphone, Sparkles, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const showcases = [
  {
    title: "Landing de Conversión Instantánea",
    tag: "High-Speed Funnel",
    desc: "Estructurada para campañas de tráfico pago (Meta Ads, Google Ads) y captación directa por WhatsApp con tiempos de carga inferiores a 1 segundo.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tech: ["React 19", "Vite", "Mobile First", "WhatsApp Direct"],
    colSpan: "sp-bento-col-8",
  },
  {
    title: "Sitio Web Comercial & Marca",
    tag: "Brand Authority",
    desc: "Presencia corporativa multi-sección con dirección de arte a medida y catálogo interactivo de servicios.",
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
    tech: ["UI Editorial", "SEO Pro", "SSL Cloud"],
    colSpan: "sp-bento-col-4",
  },
  {
    title: "E-Commerce & Catálogo Digital",
    tag: "Sales Engine",
    desc: "Tienda online con checkout directo, panel autoadministrable y sincronización de pedidos por WhatsApp y pasarela de pago.",
    image: "https://images.unsplash.com/photo-1556742049-0a67e557b56e?auto=format&fit=crop&w=1200&q=80",
    tech: ["Carrito Rápido", "Pasarela de Pagos", "Inventario"],
    colSpan: "sp-bento-col-6",
  },
  {
    title: "Plataformas Web a Medida & SaaS",
    tag: "Custom Architecture",
    desc: "Arquitectura escalable para startups y portales con base de datos en tiempo real, dashboards y lógica personalizada.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    tech: ["Supabase", "Fastify Node", "Full Responsive"],
    colSpan: "sp-bento-col-6",
  },
];

export function ShowcaseBento() {
  return (
    <section id="modelos" style={{ padding: "100px 0" }}>
      <div className="sp-container">
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 40px" }}>
          <div className="eyebrow-badge" style={{ marginBottom: "16px" }}>
            <span>Arquitecturas a Medida</span>
          </div>
          <h2 className="serif-heading" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: "16px" }}>
            Modelos diseñados para cada etapa de tu negocio.
          </h2>
          <p style={{ color: "var(--sp-text-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Sin plantillas genéricas. Cada desarrollo se crea desde cero con código optimizado, copywriting persuasivo y diseño responsive a 60fps.
          </p>
        </div>

        <div className="sp-bento-grid">
          {showcases.map((item, idx) => (
            <motion.div
              key={item.title}
              className={`sp-bento-card ${item.colSpan}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sp-bento-media">
                <div className="sp-bento-media-inner">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
              </div>
              <div className="sp-bento-body">
                <span className="sp-bento-tag">{item.tag}</span>
                <h3 className="sp-bento-title">{item.title}</h3>
                <p className="sp-bento-desc">{item.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "auto" }}>
                  {item.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "#f4f4f0",
                        color: "#4b5563",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
