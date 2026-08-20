import { BarChart3, CheckCircle2, Clock, Globe, Shield, Smartphone, Zap } from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  {
    value: "0.6s",
    label: "Tiempo de Carga Promedio",
    desc: "Optimización de assets para experiencia fluida en celulares y conexión 4G/5G.",
    icon: Clock,
  },
  {
    value: "100%",
    label: "Puntaje Google Core Web Vitals",
    desc: "Arquitectura estructurada que posiciona orgánicamente en los primeros resultados de búsqueda.",
    icon: Zap,
  },
  {
    value: "+140%",
    label: "Incremento en Contactos Comerciales",
    desc: "Llamadas a la acción estratégicas conectadas directamente a tu canal de WhatsApp.",
    icon: BarChart3,
  },
  {
    value: "7 Días",
    label: "Entrega y Despliegue en Producción",
    desc: "Metodología ágil con dominio .com y hosting cloud de alta velocidad listo.",
    icon: Shield,
  },
];

export function InteractiveMetrics() {
  return (
    <section id="metricas" style={{ padding: "80px 0", background: "var(--sp-bg-surface)", borderTop: "1px solid var(--sp-border-light)", borderBottom: "1px solid var(--sp-border-light)" }}>
      <div className="sp-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 50px" }}>
          <div className="eyebrow-badge" style={{ marginBottom: "14px" }}>
            <span>Impacto en Cifras</span>
          </div>
          <h2 className="serif-heading" style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", marginBottom: "14px" }}>
            Rendimiento medible desde el primer día.
          </h2>
          <p style={{ color: "var(--sp-text-secondary)", fontSize: "1.05rem", margin: 0 }}>
            Una web rápida no solo luce bien: convierte más visitantes en clientes y reduce el costo por adquisición en pauta.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--sp-border-light)",
                  borderRadius: "18px",
                  padding: "32px 24px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#faf5ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", marginBottom: "18px" }}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <strong style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0e1013", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px" }}>
                  {m.value}
                </strong>
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "8px" }}>{m.label}</h4>
                <p style={{ color: "var(--sp-text-secondary)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                  {m.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
