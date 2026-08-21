import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Qué es el creador de sitios web de WordPress con IA de Hostinger?",
    a: "Es una herramienta integrada en nuestros planes de hosting para WordPress que utiliza inteligencia artificial para generar automáticamente un sitio web completo (diseño, páginas, textos e imágenes) a partir de una breve descripción de tu negocio.",
  },
  {
    q: "¿Cómo funciona la garantía de reembolso de 30 días?",
    a: "Si no estás 100% satisfecho con el rendimiento o las herramientas de tu hosting durante los primeros 30 días posteriores a la compra, te devolvemos el total de tu dinero sin preguntas complicadas.",
  },
  {
    q: "¿Puedo migrar mi sitio web de WordPress actual a Hostinger gratis?",
    a: "Sí. Ofrecemos una herramienta de migración automática gratuita. Solo necesitas ingresar los datos de acceso de tu sitio actual y nuestro sistema transferirá todo el contenido sin tiempo de inactividad.",
  },
  {
    q: "¿El dominio gratis está incluido en todos los planes?",
    a: "Sí, todos los planes anuales incluyen 1 dominio gratis (.com, .net, .org, etc.) durante el primer año de servicio.",
  },
  {
    q: "¿Qué tipo de soporte técnico ofrecen?",
    a: "Contamos con un equipo de expertos en WordPress disponible las 24 horas del día, los 7 días de la semana, mediante chat en vivo en español con un tiempo de respuesta promedio menor a 3 minutos.",
  },
];

export function HostingerFAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="h-faq-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Preguntas frecuentes sobre WordPress con IA</h2>
          <p>Encuentra respuestas rápidas a las dudas más comunes sobre nuestro servicio.</p>
        </div>

        <div className="h-faq-list">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="h-faq-item">
                <button className="h-faq-header" onClick={() => toggle(i)}>
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "#673de6",
                    }}
                  />
                </button>
                {isOpen && <div className="h-faq-body">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
