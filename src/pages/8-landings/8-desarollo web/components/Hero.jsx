import { ArrowRight, Gauge, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section id="inicio" className="sp-hero">
      <div className="sp-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow-badge"
        >
          <span className="dot-live" />
          <span>Ingeniería Web & UI Editorial 2026</span>
        </motion.div>

        <motion.h1
          className="serif-heading"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          El estándar definitivo de presencia web para marcas que lideran.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Diseñamos plataformas digitales ultra rápidas con arquitectura moderna, dirección de arte inmersiva y embudos calibrados para multiplicar tus ventas.
        </motion.p>

        <motion.div
          className="sp-hero-ctas"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="https://wa.me/51987654321?text=Hola%20Qaway%20Lab%2C%20quisiera%20agendar%20una%20sesi%C3%B3n%20para%20dise%C3%B1ar%20mi%20web."
            target="_blank"
            rel="noopener noreferrer"
            className="sp-btn-primary"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
          >
            <span>Iniciar Proyecto</span>
            <ArrowRight size={16} />
          </a>
          <a href="#modelos" className="sp-btn-secondary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            <span>Explorar Modelos</span>
          </a>
        </motion.div>

        {/* Mockup Central Flotante con Badges de Métricas */}
        <motion.div
          className="sp-mockup-stage"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge Flotante Izquierdo */}
          <div className="sp-floating-pill sp-pill-left">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
              <Gauge size={20} strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ display: "block", fontSize: "0.95rem", color: "#0e1013" }}>PageSpeed 100/100</strong>
              <small style={{ color: "#059669", fontWeight: "600" }}>Carga instantánea &lt; 0.6s</small>
            </div>
          </div>

          {/* Badge Flotante Derecho */}
          <div className="sp-floating-pill sp-pill-right">
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
              <Zap size={20} strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ display: "block", fontSize: "0.95rem", color: "#0e1013" }}>+140% Conversión</strong>
              <small style={{ color: "#2563eb", fontWeight: "600" }}>Tráfico directo a WhatsApp</small>
            </div>
          </div>

          <div className="sp-mockup-window">
            <div className="sp-mockup-header">
              <div className="sp-mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="sp-mockup-url">qawaylab.com/arquitectura-web</span>
              <div style={{ width: "40px" }} />
            </div>
            <div className="sp-mockup-content">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85"
                alt="Plataforma Web de Vanguardia"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
