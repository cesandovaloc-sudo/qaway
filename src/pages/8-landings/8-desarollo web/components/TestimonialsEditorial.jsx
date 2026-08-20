import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Mariana Ríos",
    role: "Fundadora",
    company: "Studio Glow",
    avatar: "/assets/pages/4-academy/testimonials/mariana.png",
    metric: "+140% Contactos en WhatsApp",
    quote: "La web cambió radicalmente la percepción de nuestro estudio. Los clientes llegan convencidos del valor de nuestro servicio y dispuestos a pagar nuestras tarifas completas.",
  },
  {
    name: "Diego Morales",
    role: "Director Comercial",
    company: "Innova Corp",
    avatar: "/assets/pages/4-academy/testimonials/diego.png",
    metric: "Entrega en 7 Días",
    quote: "Entregaron en el plazo prometido. La velocidad de carga en celulares es inmediata y la estética superó por mucho lo que habíamos visto con otras agencias.",
  },
  {
    name: "Lucía Vargas",
    role: "CEO",
    company: "BioHealth Perú",
    avatar: "/assets/pages/4-academy/testimonials/lucia.png",
    metric: "Autoridad 10/10",
    quote: "El nivel de detalle visual y la claridad del copy nos permitió cerrar acuerdos corporativos con marcas que antes nos consideraban una empresa pequeña.",
  },
];

export function TestimonialsEditorial() {
  return (
    <section style={{ padding: "90px 0" }}>
      <div className="sp-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 50px" }}>
          <div className="eyebrow-badge" style={{ marginBottom: "16px" }}>
            <span>Casos Reales</span>
          </div>
          <h2 className="serif-heading" style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", marginBottom: "14px" }}>
            Marcas que transformaron su presencia digital.
          </h2>
          <p style={{ color: "var(--sp-text-secondary)", fontSize: "1.05rem", margin: 0 }}>
            Resultados tangibles, aumento de conversión y posicionamiento de autoridad en sus sectores.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "#ffffff",
                border: "1px solid var(--sp-border-light)",
                borderRadius: "20px",
                padding: "36px 28px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", padding: "5px 12px", borderRadius: "9999px", background: "#ecfdf5", color: "#059669" }}>
                  {t.metric}
                </span>
                <div style={{ display: "flex", gap: "3px", color: "#f59e0b" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" />
                  ))}
                </div>
              </div>

              <p style={{ color: "#374151", fontSize: "0.98rem", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 24px" }}>
                "{t.quote}"
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--sp-border-light)" }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", background: "#f3f4f6" }}
                />
                <div>
                  <strong style={{ display: "block", fontSize: "0.95rem", color: "#0e1013" }}>{t.name}</strong>
                  <small style={{ color: "#6b7280" }}>{t.role}, {t.company}</small>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
