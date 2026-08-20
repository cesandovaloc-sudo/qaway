import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "¿En cuánto tiempo entregan el proyecto web listo?",
    a: "Una Landing Page de alta conversión se entrega en un plazo de 5 a 7 días hábiles. Una Web Comercial multi-sección toma entre 10 y 14 días hábiles, garantizando revisiones conjuntas y calibración final de cada detalle.",
  },
  {
    q: "¿El servicio incluye dominio, hosting y certificado SSL?",
    a: "Sí. Todos nuestros planes incluyen el registro de tu dominio .com por 1 año y alojamiento en servidores cloud de alta velocidad con certificado de seguridad SSL sin costo adicional.",
  },
  {
    q: "¿Podré editar los textos e imágenes de mi página después?",
    a: "Por supuesto. Te entregamos la web completamente funcional y te brindamos una videocapacitación paso a paso para que tú o tu equipo puedan modificar textos, fotos o productos fácilmente.",
  },
  {
    q: "¿Cómo es el esquema de pago y garantía de entrega?",
    a: "El proyecto se inicia con un 50% de anticipo para arrancar la fase estratégica y prototipo visual. El 50% restante se cancela una vez que la web esté 100% aprobada y publicada a tu entera satisfacción.",
  },
  {
    q: "¿Por qué su desarrollo es superior a una plantilla común de WordPress o Wix?",
    a: "Las plantillas genéricas contienen miles de líneas de código basura que ralentizan la carga y lucen idénticas a la competencia. En Qaway Lab desarrollamos con código ligero a medida (React 19 / Vite), logrando cargas en menos de 0.8s y una experiencia visual de marca exclusiva.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ padding: "90px 0", background: "var(--sp-bg-surface)" }}>
      <div className="sp-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
          <div className="eyebrow-badge" style={{ marginBottom: "14px" }}>
            <span>Dudas Frecuentes</span>
          </div>
          <h2 className="serif-heading" style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", marginBottom: "14px" }}>
            Todo claro antes de empezar.
          </h2>
          <p style={{ color: "var(--sp-text-secondary)", fontSize: "1.05rem", margin: 0 }}>
            Resolvemos tus principales preguntas sobre tecnología, tiempos y entregables.
          </p>
        </div>

        <div className="sp-faq-wrap">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="sp-faq-item">
                <button className="sp-faq-btn" onClick={() => toggle(i)} aria-expanded={isOpen}>
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={19}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      color: isOpen ? "#0e1013" : "#8e95a0",
                      flexShrink: 0,
                      marginLeft: "12px",
                    }}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="sp-faq-ans"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
