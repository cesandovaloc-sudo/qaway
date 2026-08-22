import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const realFaqs = [
  { q: "¿Para qué se usa WordPress?", a: "WordPress es el sistema de gestión de contenidos (CMS) más popular del mundo, utilizado para crear desde blogs y sitios web corporativos hasta tiendas virtuales WooCommerce de gran escala." },
  { q: "¿Qué es el hosting administrado para WordPress?", a: "Es un servicio de alojamiento optimizado específicamente para WordPress donde nosotros nos encargamos de las actualizaciones de seguridad, copias de seguridad automáticas y optimizaciones de velocidad del servidor." },
  { q: "¿Cuáles son los límites de CPU, RAM, inodos y disco de los planes de hosting administrado para WordPress?", a: "Los planes cuentan con recursos garantizados: hasta 3 GB de RAM dedicada, almacenamiento NVMe de ultra alta velocidad y millones de inodos para soportar miles de visitas simultáneas." },
  { q: "¿Cuánto cuesta el hosting económico para WordPress?", a: "Nuestros planes comienzan desde 2,59 US$/mes con dominio gratis y certificados SSL ilimitados incluidos." },
  { q: "¿Cuáles son las diferencias entre el hosting para WordPress y los servicios de hosting generales?", a: "El hosting para WordPress incluye servidor LiteSpeed Enterprise, plugin LSCache preconfigurado, herramientas de IA exclusivas y un equipo de soporte especializado en resolver dudas de WordPress 24/7." },
  { q: "¿Necesito hosting para WordPress?", a: "Sí, para que tu sitio web sea accesible en Internet las 24 horas del día, necesitas un servidor web donde almacenar tus archivos y bases de datos." },
  { q: "¿Cómo puedo proteger mi hosting para WordPress?", a: "Hostinger protege tu web automáticamente con cortafuegos de aplicaciones web (WAF), escáner de malware continuo y protección contra ataques DDoS de Cloudflare." },
  { q: "¿Cómo puedo transferir mi sitio de WordPress a Hostinger?", a: "Ofrecemos una herramienta de migración 100% gratuita y automática. Solo ingresas los datos de tu sitio anterior y nosotros nos encargamos del traslado sin caídas." },
  { q: "¿Cuántos sitios web puedo migrar a Hostinger?", a: "Puedes migrar todos los sitios web que desees de forma completamente gratuita e ilimitada." },
  { q: "¿Cómo crear un sitio web en WordPress?", a: "Con nuestro creador con IA, solo describes tu idea de negocio en un prompt y el sistema genera la estructura, los textos y el diseño en menos de 1 minuto." },
  { q: "¿Existe una opción de hosting para WordPress para agencias o autónomos que gestionen varios sitios web?", a: "Sí, el plan Unlimited y Cloud Startup permiten alojar hasta 100 y 300 sitios web respectivamente con acceso multiusuario y panel centralizado." },
  { q: "¿Los planes de WordPress son compatibles con WooCommerce?", a: "Totalmente compatibles. Incluyen optimización de base de datos para tiendas online y pasarelas de pago listas para operar." },
];

export function HostingerFAQReal() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" style={{ padding: "80px 0 100px", background: "#ffffff" }}>
      <div className="h-container">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
          <h2 style={{ marginBottom: "12px" }}>
            Preguntas frecuentes: hosting administrado para WordPress
          </h2>
          <p style={{ color: "#56596e", fontSize: "15px", margin: 0 }}>
            Respondemos las preguntas frecuentes sobre nuestros planes de WordPress.
          </p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {realFaqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} style={{ borderBottom: "1px solid #e2e5e9", paddingBottom: "14px" }}>
                <button
                  onClick={() => toggle(idx)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "12px 0",
                    textAlign: "left",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#12131a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>{f.q}</span>
                  {isOpen ? <Minus size={16} color="#673de6" /> : <Plus size={16} color="#84879c" />}
                </button>
                {isOpen && (
                  <div style={{ padding: "6px 0 12px", color: "#56596e", fontSize: "14px", lineHeight: "1.6" }}>
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
