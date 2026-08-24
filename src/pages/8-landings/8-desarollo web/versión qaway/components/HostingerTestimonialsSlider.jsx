import { Star, CheckCircle, Quote } from "lucide-react";
import avatar1 from "@/assets/1-no-usados/Portfolio/1.webp";
import avatar2 from "@/assets/1-no-usados/Portfolio/2.webp";
import avatar3 from "@/assets/1-no-usados/Portfolio/3.webp";

const brandRow1 = [
  { name: "Mesa Selecta", style: { fontFamily: "'The Seasons', 'Georgia', 'Times New Roman', serif", fontWeight: 400 } },
  { name: "Andes Norte", style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: "-0.04em" } },
  { name: "Lima Forma", style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: "Croma Patio", style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: "-0.03em" } },
  { name: "Nativa Studio", style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, letterSpacing: "-0.02em" } },
  { name: "Punto Claro", style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: "Marea Capital", style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: "-0.05em" } },
  { name: "Casa Bruma", style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontWeight: 400, textTransform: "none", letterSpacing: "-0.01em" } },
  { name: "Senda Legal", style: { fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 600, letterSpacing: "-0.03em", fontStyle: "italic" } },
];

const brandRow2 = [
  { name: "Rumbo Vivo", style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: "-0.02em" } },
  { name: "Altura Cafe", style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: "Brava Textil", style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: "-0.05em" } },
  { name: "Nexo Salud", style: { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400, letterSpacing: "-0.01em" } },
  { name: "Tierra Uno", style: { fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 500 } },
  { name: "Solar Finca", style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 500, letterSpacing: "-0.02em" } },
  { name: "Nodo Urbano", style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "-0.04em" } },
  { name: "Ayni Foods", style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontWeight: 400, textTransform: "none", letterSpacing: "0" } },
  { name: "Vertice Lab", style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 600, letterSpacing: "-0.04em" } },
];

const reviews = [
  {
    name: "Carlos Mendoza",
    role: "Director de Operaciones · GastroGroup",
    comment: "El rediseño de nuestra web corporativa nos permitió duplicar los pedidos corporativos en el primer mes. La velocidad de carga en celulares es inmediata y transmite una autoridad total.",
    rating: 5,
    tag: "Web Corporativa",
    avatar: avatar1,
  },
  {
    name: "Lucía Fernández",
    role: "Fundadora · Estudio LF Arquitectura",
    comment: "Cuidaron cada detalle del branding, los colores y las imágenes de nuestros proyectos. La entrega fue en tiempo récord y el soporte por WhatsApp nos resuelve cualquier duda al instante.",
    rating: 5,
    tag: "Identidad & Landing",
    avatar: avatar2,
  },
  {
    name: "Andrés Silva",
    role: "Gerente Comercial · Silva & Asociados",
    comment: "La integración directa con WhatsApp y la pasarela de pagos nos automatizó la captación de leads. Recibimos cotizaciones diarias directamente en nuestro correo y celular.",
    rating: 5,
    tag: "Automatización & Ventas",
    avatar: avatar3,
  },
];

export function HostingerTestimonialsSlider() {
  const track1 = [...brandRow1, ...brandRow1, ...brandRow1];
  const track2 = [...brandRow2, ...brandRow2, ...brandRow2];

  return (
    <section id="testimonios" style={{ padding: "90px 0 95px", background: "#f8f9fc", position: "relative", overflow: "hidden" }}>
      
      {/* 1. Encabezado Único (Sin Párrafo) */}
      <div className="h-container" style={{ maxWidth: "1200px", textAlign: "center", marginBottom: "48px" }}>
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
          HISTORIAS DE ÉXITO & MARCAS QUE CONFÍAN
        </span>

        <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: 0, lineHeight: "1.2" }}>
          Empresas y marcas que confían en <span style={{ color: "#fe6612" }}>Qaway Lab</span>
        </h2>
      </div>

      {/* 2. Grid de Testimonios Protagonistas */}
      <div className="h-container" style={{ maxWidth: "1200px", marginBottom: "64px" }}>
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
              {/* Barra superior: Estrellas + Tag */}
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

              {/* Bloque Autor con Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "18px", borderTop: "1px solid #f4f4f5" }}>
                <img
                  src={r.avatar}
                  alt={r.name}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                  loading="lazy"
                />
                <div>
                  <strong style={{ fontSize: "14px", color: "#111111", display: "block" }}>{r.name}</strong>
                  <span style={{ color: "#71717a", fontSize: "12px", display: "block" }}>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pasarela de Logos Tipográficos Sutiles de Apoyo (Baja Opacidad) */}
      <div style={{ position: "relative", overflow: "hidden", borderTop: "1px solid rgba(228, 228, 231, 0.6)", paddingTop: "32px" }}>
        {/* Degradados Laterales para Desvanecimiento */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "160px",
            height: "100%",
            background: "linear-gradient(90deg, #f8f9fc 0%, rgba(248, 249, 252, 0) 100%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "160px",
            height: "100%",
            background: "linear-gradient(270deg, #f8f9fc 0%, rgba(248, 249, 252, 0) 100%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        <div className="qaway-marquee-wrapper" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Fila 1: Izquierda */}
          <div style={{ overflow: "hidden", display: "flex" }}>
            <div className="qaway-marquee-row qaway-marquee-left">
              {track1.map((brand, idx) => (
                <span
                  key={`r1-${brand.name}-${idx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)",
                    color: "#18181b",
                    opacity: 0.35,
                    whiteSpace: "nowrap",
                    transition: "opacity 0.2s ease",
                    ...brand.style,
                  }}
                >
                  <span>{brand.name}</span>
                  <span style={{ width: "1px", height: "16px", background: "#fe6612", display: "inline-block", opacity: 0.4 }} />
                </span>
              ))}
            </div>
          </div>

          {/* Fila 2: Derecha */}
          <div style={{ overflow: "hidden", display: "flex" }}>
            <div className="qaway-marquee-row qaway-marquee-right">
              {track2.map((brand, idx) => (
                <span
                  key={`r2-${brand.name}-${idx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)",
                    color: "#18181b",
                    opacity: 0.35,
                    whiteSpace: "nowrap",
                    transition: "opacity 0.2s ease",
                    ...brand.style,
                  }}
                >
                  <span>{brand.name}</span>
                  <span style={{ width: "1px", height: "16px", background: "#fe6612", display: "inline-block", opacity: 0.4 }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
