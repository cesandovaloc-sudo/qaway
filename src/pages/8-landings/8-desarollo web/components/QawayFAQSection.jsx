import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const realFaqs = [
  {
    q: "¿Qué tipo de web necesita mi negocio?",
    a: (
      <>
        Depende de tu objetivo comercial: si buscas una presencia rápida, todo en uno y directa para captar clientes en campañas, <strong style={{ color: "#111111", fontWeight: "600" }}>“One Web”</strong> o una <strong style={{ color: "#111111", fontWeight: "600" }}>“Landing Page”</strong> es ideal. Si necesitas mostrar varios servicios y dar una imagen corporativa sólida, elige <strong style={{ color: "#111111", fontWeight: "600" }}>“Web Comercial”</strong>. Si buscas vender productos las 24 horas con pasarela de pagos, tu opción es <strong style={{ color: "#111111", fontWeight: "600" }}>“Tienda Online”</strong>.
      </>
    )
  },
  {
    q: "¿El dominio y el hosting están incluidos?",
    a: (
      <>
        Si estás iniciando, para la publicación de tu sitio podemos utilizar <strong style={{ color: "#111111", fontWeight: "600" }}>infraestructura gratuita o de muy bajo costo</strong> según lo permita el proyecto. Luego, a medida que tu negocio escale, te asesoramos para adquirir tu propio <strong style={{ color: "#111111", fontWeight: "600" }}>dominio (.com o .pe)</strong> directamente a tu nombre.
      </>
    )
  },
  {
    q: "¿Puedo conectar WhatsApp y formularios de contacto?",
    a: "Sí. Todos los planes cuentan con conexión directa a WhatsApp para captar clientes al instante. Además, si tu proyecto requiere recibir solicitudes por correo, integramos formularios de contacto adaptados a tu flujo de trabajo."
  },
  {
    q: "¿Puedo empezar con una One Web y ampliarla después?",
    a: "Totalmente. Tu web se construye con arquitectura escalable: puedes iniciar hoy con una versión base y luego incorporar nuevas páginas, catálogo, funcionalidades avanzadas, CRM, automatizaciones o integraciones según las necesidades de tu negocio."
  },
  {
    q: "¿Cuánto tiempo demora la entrega de mi web?",
    a: "Una 'One Web' suele estar lista en 3 a 5 días hábiles. Una 'Web Comercial' toma entre 7 a 12 días, y una 'Tienda Online' de 12 a 20 días. El tiempo exacto depende de la complejidad del proyecto y de la entrega de la información básica de tu negocio mediante una ficha guiada que coordinamos juntos."
  },
  {
    q: "¿Cómo es el proceso de trabajo y pago?",
    a: "Definimos los requerimientos y el presupuesto final desde el primer día, sin costos ocultos ni cobros sorpresa. Iniciamos con un anticipo del 50%, desarrollamos la propuesta para tu revisión y, tras tu aprobación final y publicación, se cancela el saldo restante."
  }
];

export function QawayFAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ padding: "85px 0 105px", background: "#ffffff" }}>
      <div className="h-container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 48px" }}
        >
          <span className="qw-kicker-capsule">
            PREGUNTAS FRECUENTES
          </span>
          <h2 style={{ marginBottom: "12px", fontSize: "clamp(2rem, 3.4vw, 2.7rem)", fontWeight: "700", color: "#111111", letterSpacing: "-0.02em" }}>
            Resolvemos tus dudas antes de empezar
          </h2>
          <p style={{ color: "#71717a", fontSize: "15.5px", margin: 0, lineHeight: "1.5" }}>
            Todo claro y transparente desde el primer día.
          </p>
        </motion.div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {realFaqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #e2e5e9",
                  paddingBottom: "14px",
                  transition: "border-color 0.2s ease",
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "14px 0",
                    textAlign: "left",
                    fontSize: "15.5px",
                    fontWeight: "600",
                    color: isOpen ? "#fe6612" : "#12131a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen) e.currentTarget.style.color = "#fe6612";
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.color = "#12131a";
                  }}
                >
                  <span>{f.q}</span>
                  {isOpen ? <Minus size={18} color="#fe6612" /> : <Plus size={18} color="#84879c" />}
                </button>
                {isOpen && (
                  <div style={{ padding: "6px 0 14px", color: "#56596e", fontSize: "14.5px", lineHeight: "1.65", animation: "fadeIn 0.2s ease" }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
