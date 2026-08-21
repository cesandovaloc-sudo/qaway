import { ArrowUpRight, CheckCircle2, Layers, Smartphone, Sparkles, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const showcases = [
  {
    title: "Landings de Conversión Inmediata",
    tag: "01 / TRÁFICO & VENTAS",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sitios Web Comerciales de Autoridad",
    tag: "02 / POSICIONAMIENTO",
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Plataformas Web & E-Commerce a Medida",
    tag: "03 / ESCALABILIDAD",
    image: "https://images.unsplash.com/photo-1556742049-0a67e557b56e?auto=format&fit=crop&w=1200&q=80",
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
              className="sp-bento-card"
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
