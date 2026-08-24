import { Star, CheckCircle, Quote } from "lucide-react";

const reviews = [
  {
    name: "Carlos Mendoza",
    role: "Director de Operaciones · GastroGroup",
    comment: "El rediseño de nuestra web corporativa nos permitió duplicar los pedidos corporativos en el primer mes. La velocidad de carga en celulares es inmediata y transmite una autoridad total.",
    rating: 5,
    tag: "Web Corporativa",
    initials: "CM",
  },
  {
    name: "Lucía Fernández",
    role: "Fundadora · Estudio LF Arquitectura",
    comment: "Cuidaron cada detalle del branding, los colores y las imágenes de nuestros proyectos. La entrega fue en tiempo récord y el soporte por WhatsApp nos resuelve cualquier duda al instante.",
    rating: 5,
    tag: "Identidad & Landing",
    initials: "LF",
  },
  {
    name: "Andrés Silva",
    role: "Gerente Comercial · Silva & Asociados",
    comment: "La integración directa con WhatsApp y la pasarela de pagos nos automatizó la captación de leads. Recibimos cotizaciones diarias directamente en nuestro correo y celular.",
    rating: 5,
    tag: "Automatización & Ventas",
    initials: "AS",
  },
];

export function HostingerTestimonialsSlider() {
  return (
    <section style={{ padding: "90px 0 100px", background: "#f8f9fc", position: "relative" }}>
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Centrado */}
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 52px" }}>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#56596e",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "#e6e8ee",
              padding: "4px 10px",
              borderRadius: "4px",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            HISTORIAS DE ÉXITO & TESTIMONIOS
          </span>

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 14px", lineHeight: "1.2" }}>
            Empresas y marcas que confían en <span style={{ color: "#fe6612" }}>Qaway Lab</span>
          </h2>

          <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.55", margin: 0 }}>
            Resultados reales de negocios que transformaron su presencia digital y multiplicaron sus clientes.
          </p>
        </div>

        {/* Grid de 3 Tarjetas Modernas de Testimonios */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {reviews.map((r) => (
            <div
              key={r.name}
              style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "14px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {/* Barra superior de la tarjeta: Estrellas + Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", gap: "3px" }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#00b67a" color="#00b67a" />
                  ))}
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#71717a", background: "#f4f4f5", padding: "3px 8px", borderRadius: "6px" }}>
                  {r.tag}
                </span>
              </div>

              {/* Comentario */}
              <p style={{ color: "#27272a", fontSize: "14.5px", lineHeight: "1.65", flexGrow: 1, margin: "0 0 24px" }}>
                "{r.comment}"
              </p>

              {/* Bloque Autor con Avatar de Iniciales */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "18px", borderTop: "1px solid #f4f4f5" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fe6612 0%, #111111 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "800",
                    flexShrink: 0,
                  }}
                >
                  {r.initials}
                </div>
                <div>
                  <strong style={{ fontSize: "14px", color: "#111111", display: "block" }}>{r.name}</strong>
                  <span style={{ color: "#71717a", fontSize: "12px", display: "block" }}>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
