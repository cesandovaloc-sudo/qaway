import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "¿Qué es el creador de sitios web de WordPress con IA de Hostinger?",
    a: "Es una herramienta integrada en nuestros planes de hosting para WordPress que utiliza inteligencia artificial para generar automáticamente un sitio web completo (diseño, páginas, textos persuasivos e imágenes de stock) a partir de una breve descripción de tu negocio.",
  },
  {
    q: "¿Cómo funciona la garantía de reembolso de 30 días?",
    a: "Si no estás 100% satisfecho con el rendimiento o las herramientas de tu hosting durante los primeros 30 días posteriores a la compra, te devolvemos el total de tu dinero de forma inmediata y sin complicaciones.",
  },
  {
    q: "¿Puedo migrar mi sitio web de WordPress actual a Hostinger gratis?",
    a: "Sí. Ofrecemos una herramienta de migración automática gratuita. Solo necesitas ingresar los datos de acceso de tu sitio web actual y nuestro sistema transferirá todo el contenido sin tiempo de inactividad ni pérdida de datos.",
  },
  {
    q: "¿El dominio gratis está incluido en todos los planes?",
    a: "Sí, todos los planes anuales (12, 24 y 48 meses) incluyen 1 dominio gratis (.com, .net, .org, .es, etc.) durante el primer año de servicio.",
  },
  {
    q: "¿Qué tipo de soporte técnico ofrecen y en qué horario?",
    a: "Contamos con un equipo de especialistas en WordPress disponible las 24 horas del día, los 7 días de la semana, mediante chat en vivo en español con un tiempo de respuesta promedio inferior a 3 minutos.",
  },
];

export function HostingerFAQAccordion() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="h-faq-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Preguntas frecuentes sobre WordPress con IA</h2>
          <p>Encuentra respuestas inmediatas a las dudas más comunes sobre nuestro servicio de hosting.</p>
        </div>

        <div className="h-faq-list">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="h-faq-item">
                <button className="h-faq-header" onClick={() => toggle(i)}>
                  <span>{f.q}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                      color: "#673de6",
                      flexShrink: 0,
                    }}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="h-faq-body"
                    >
                      {f.a}
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
