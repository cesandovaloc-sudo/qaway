import { ArrowRight, CheckCircle, Code2, Compass, Layers, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Diagnóstico Estratégico & Propuesta",
    desc: "Analizamos tu modelo de negocio, tu audiencia clave y los puntos de fricción de tu oferta para estructurar una arquitectura web con propósito de venta.",
    deliverables: ["Análisis de competencia", "Estructura de secciones (Wireframe)", "Copywriting persuasivo"],
  },
  {
    num: "02",
    title: "Dirección de Arte & UI Editorial",
    desc: "Diseñamos un lenguaje visual exclusivo: tipografía de alto impacto, contrastes elegantes, micro-interacciones y paleta de colores corporativa.",
    deliverables: ["Prototipo visual en Figma", "Alineación de marca e identidad", "Experiencia Mobile First"],
  },
  {
    num: "03",
    title: "Ingeniería de Software a 60fps",
    desc: "Programamos con tecnologías modernas (React 19, Vite, Tailwind CSS) asegurando velocidad instantánea, seguridad SSL y conexión directa a tus canales de venta.",
    deliverables: ["Código limpio y modular", "Optimización Core Web Vitals", "Integración de WhatsApp & CRM"],
  },
  {
    num: "04",
    title: "Lanzamiento Cloud & Acompañamiento",
    desc: "Desplegamos tu web con dominio .com y hosting en servidores de alta velocidad. Te entregamos video-capacitación para que tu equipo pueda actualizar contenidos fácilmente.",
    deliverables: ["Dominio y Hosting Cloud por 1 año", "Indexación en Google Search Console", "Soporte técnico prioritario"],
  },
];

export function StickyProcess() {
  return (
    <section id="proceso" className="sp-sticky-section">
      <div className="sp-container">
        <div className="sp-sticky-layout">
          {/* Lado Izquierdo Fijo */}
          <div className="sp-sticky-left">
            <div className="eyebrow-badge" style={{ marginBottom: "16px" }}>
              <span>Metodología Ágil</span>
            </div>
            <h2 className="serif-heading" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.15, marginBottom: "20px" }}>
              De la idea a la web publicada en 4 fases claras.
            </h2>
            <p style={{ color: "var(--sp-text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Eliminamos la complejidad técnica. Sabrás exactamente qué estamos construyendo en cada etapa con entregas tangibles y sin demoras.
            </p>
            <a
              href="https://wa.me/51987654321?text=Hola%20Qaway%20Lab%2C%20quisiera%20iniciar%20el%20proceso%20para%20crear%20mi%20web."
              target="_blank"
              rel="noopener noreferrer"
              className="sp-btn-primary"
            >
              <span>Agendar Inicio</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Lado Derecho de Pasos */}
          <div className="sp-sticky-right">
            {steps.map((s, idx) => (
              <motion.div
                key={s.num}
                className="sp-step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="sp-step-num">FASE {s.num}</span>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "12px", fontWeight: "700" }}>{s.title}</h3>
                <p style={{ color: "var(--sp-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
                  {s.desc}
                </p>
                <div style={{ borderTop: "1px solid var(--sp-border-light)", paddingTop: "16px" }}>
                  <small style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", color: "var(--sp-text-muted)", marginBottom: "10px" }}>
                    Entregables Clave:
                  </small>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {s.deliverables.map((d) => (
                      <div key={d} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#374151" }}>
                        <CheckCircle size={15} color="#059669" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
