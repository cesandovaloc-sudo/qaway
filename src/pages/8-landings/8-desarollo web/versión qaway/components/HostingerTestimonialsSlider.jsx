import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

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
    name: "Mariana Ríos",
    role: "Fundadora · Studio Glow",
    comment: "La web cambió totalmente la percepción de nuestro estudio. Los clientes llegan directo a WhatsApp convencidos y listos para contratar.",
    rating: 5,
    tag: "Marca Personal & Web",
  },
  {
    name: "Diego Morales",
    role: "Director Comercial · Innova Corp",
    comment: "Entregaron en los 7 días prometidos. La velocidad de carga en celulares es instantánea y el diseño superó todas nuestras expectativas.",
    rating: 5,
    tag: "Web Corporativa",
  },
  {
    name: "Lucía Vargas",
    role: "CEO · BioHealth",
    comment: "El nivel de detalle visual y la claridad del copy nos permitió cerrar alianzas corporativas con marcas que antes no nos consideraban.",
    rating: 5,
    tag: "E-commerce & Autoridad",
  },
];

export function HostingerTestimonialsSlider() {
  const track1 = [...brandRow1, ...brandRow1, ...brandRow1];
  const track2 = [...brandRow2, ...brandRow2, ...brandRow2];

  return (
    <section id="testimonios" style={{ padding: "90px 0 95px", background: "#f8f9fc", position: "relative", overflow: "hidden" }}>
      
      <div className="h-container" style={{ maxWidth: "1200px", textAlign: "center", marginBottom: "48px" }}>
        <span className="qw-kicker-capsule" style={{ fontSize: "12px", fontWeight: "800", color: "#fe6612", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          HISTORIAS DE ÉXITO & MARCAS QUE CONFÍAN
        </span>
        <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "16px 0 0", lineHeight: "1.2" }}>
          Empresas y marcas que confían en <span style={{ color: "#fe6612" }}>Qaway Lab</span>
        </h2>
      </div>

      <div className="h-container" style={{ maxWidth: "1200px", marginBottom: "64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {reviews.map((r, idx) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "32px 28px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#fe6612" color="#fe6612" />
                    ))}
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#fe6612", background: "rgba(254, 102, 18, 0.08)", padding: "4px 10px", borderRadius: "9999px", letterSpacing: "0.02em" }}>
                    {r.tag}
                  </span>
                </div>
                <p style={{ color: "#27272a", fontSize: "14.5px", lineHeight: "1.65", margin: "0 0 24px", fontStyle: "normal" }}>
                  "{r.comment}"
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f4f4f5", paddingTop: "18px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#e4e4e7", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px" }}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#111111", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    {r.name}
                    <CheckCircle size={13} color="#fe6612" />
                  </h3>
                  <span style={{ fontSize: "12px", color: "#71717a", display: "block" }}>{r.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden", padding: "10px 0" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "160px", height: "100%", background: "linear-gradient(90deg, #f8f9fc 0%, rgba(248, 249, 252, 0) 100%)", zIndex: 3, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "160px", height: "100%", background: "linear-gradient(270deg, #f8f9fc 0%, rgba(248, 249, 252, 0) 100%)", zIndex: 3, pointerEvents: "none" }} />

        <div className="qaway-marquee-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ overflow: "hidden", display: "flex" }}>
            <div className="qaway-marquee-row qaway-marquee-left" style={{ display: "flex", gap: "40px" }}>
              {track1.map((brand, idx) => (
                <span key={`r1-${brand.name}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "20px", fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)", color: "#18181b", opacity: 0.35, whiteSpace: "nowrap", ...brand.style }}>
                  <span>{brand.name}</span>
                  <span style={{ width: "1px", height: "16px", background: "#fe6612", display: "inline-block", opacity: 0.4 }} />
                </span>
              ))}
            </div>
          </div>
          <div style={{ overflow: "hidden", display: "flex" }}>
            <div className="qaway-marquee-row qaway-marquee-right" style={{ display: "flex", gap: "40px" }}>
              {track2.map((brand, idx) => (
                <span key={`r2-${brand.name}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "20px", fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)", color: "#18181b", opacity: 0.35, whiteSpace: "nowrap", ...brand.style }}>
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
