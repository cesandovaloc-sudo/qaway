import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import pilar1Img from "../ChatGPT Image 24 ago 2026, 12_16_16.png";

const pillarsData = [
  {
    id: "branding",
    tag: "PILAR 01 · IDENTIDAD VISUAL",
    title: "Branding & Dirección de Arte",
    desc: "Construimos una presencia cromática coherente, logotipos vectoriales de precisión y activos de marca que transmiten autoridad corporativa inmediata.",
    image: pilar1Img,
    highlight: "Identidad & Colorimetría Exclusiva",
    subHighlight: "Armonización visual de alto contraste y balance cromático",
    badges: ["Color Tokens", "Logo Vectorial", "Design System", "Activos SVG"],
  },
  {
    id: "mockup",
    tag: "PILAR 02 · IMPACTO MULTIDISPOSITIVO",
    title: "Mockups de Marca Hiperrealistas",
    desc: "Presentamos tu negocio en pantallas Retina y dispositivos móviles de última generación para generar credibilidad instantánea en tus clientes.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    highlight: "Composición Multidispositivo 3D",
    subHighlight: "Adaptación exacta en Desktop, Tablet y Smartphone",
    badges: ["Retina Display", "Mobile First", "Perspectiva 3D", "UI/UX Fluido"],
  },
  {
    id: "tipografia",
    tag: "PILAR 03 · JERARQUÍA EDITORIAL",
    title: "Tipografía de Precisión",
    desc: "Combinamos Space Grotesk para titulares de gran fuerza visual con Inter para párrafos de lectura óptima, garantizando una jerarquía clara y sin fatiga.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
    highlight: "Space Grotesk + Inter Sans",
    subHighlight: "Micro-tracking y pesos editoriales calibrados al píxel",
    badges: ["Space Grotesk", "Inter UI", "Micro-Tracking", "Legibilidad 100%"],
  },
];

export function QawayDesignPillarsSection() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const current = pillarsData[currentIdx];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % pillarsData.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);

  return (
    <section style={{ padding: "90px 16px 90px", background: "#f8f9fc", position: "relative" }}>
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Centrado de la Sección */}
        <div style={{ textAlign: "center", maxWidth: "850px", margin: "0 auto 52px" }}>
          <span
            style={{
              color: "#71717a",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "12px",
            }}
          >
            IDENTIDAD & BRANDING
          </span>

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: "0 0 14px", lineHeight: "1.2" }}>
            Diseño web a medida con <span style={{ color: "#fe6612" }}>identidad de marca propia</span>
          </h2>

          <p style={{ color: "#71717a", fontSize: "16px", maxWidth: "660px", margin: "0 auto", lineHeight: "1.5" }}>
            Cuidamos la tipografía, el impacto visual y la armonía cromática para que tu negocio transmita máxima autoridad y confianza.
          </p>
        </div>

        {/* Contenedor Maestro Panorámico con Mayor Aire Vertical */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "12px",
            padding: "48px 44px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Columna Izquierda: Control del Pilar & Navegación */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <span
                  style={{
                    color: "#fe6612",
                    fontSize: "11.5px",
                    fontWeight: "800",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  {current.tag}
                </span>

                <h3 style={{ color: "#111111", fontSize: "26px", fontWeight: "700", margin: "0 0 16px", lineHeight: "1.25" }}>
                  {current.title}
                </h3>

                <p style={{ color: "#52525b", fontSize: "15.5px", lineHeight: "1.7", margin: "0 0 24px" }}>
                  "{current.desc}"
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f8f9fc",
                    border: "1px solid #e4e4e7",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    marginBottom: "36px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(254, 102, 18, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={16} color="#fe6612" />
                  </div>
                  <span style={{ fontSize: "13px", color: "#18181b", fontWeight: "600" }}>
                    Garantía de Autoridad & Conversión Qaway Lab
                  </span>
                </div>
              </div>

              {/* Controles de Navegación Fluidos */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", paddingTop: "8px" }}>
                <button
                  onClick={handlePrev}
                  aria-label="Pilar anterior"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1.5px solid #e4e4e7",
                    color: "#18181b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                >
                  <ChevronLeft size={20} />
                </button>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {pillarsData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      aria-label={`Ir al pilar ${i + 1}`}
                      style={{
                        width: currentIdx === i ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: currentIdx === i ? "#fe6612" : "#d4d4d8",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  aria-label="Pilar siguiente"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#fe6612",
                    border: "none",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    boxShadow: "0 4px 14px rgba(254, 102, 18, 0.3)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Columna Derecha: Preview del Proyecto con Imagen Alargada a 330px */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                }}
              >
                {/* Contenedor de Imagen Ampliado */}
                <div style={{ height: "330px", overflow: "hidden", position: "relative", background: "#f1f3f7" }}>
                  <img
                    src={current.image}
                    alt={current.highlight}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      background: "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: "999px",
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#18181b",
                      fontSize: "11px",
                      fontWeight: "700",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fe6612" }} />
                    <span>PROYECTO DESTACADO</span>
                  </div>
                </div>

                {/* Pie de la Tarjeta */}
                <div style={{ padding: "24px" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 4px", fontFamily: "var(--qw-font-display)" }}>
                    {current.highlight}
                  </h4>
                  <span style={{ fontSize: "13px", color: "#71717a", display: "block", marginBottom: "16px" }}>
                    {current.subHighlight}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {current.badges.map((badge) => (
                      <span
                        key={badge}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e4e4e7",
                          color: "#3f3f46",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
