import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Layers, Palette, Sparkles, Type } from "lucide-react";

const pillarsData = [
  {
    id: "branding",
    tag: "PILAR 01 · IDENTIDAD VISUAL",
    title: "Branding & Dirección de Arte",
    desc: "Construimos una presencia cromática coherente, logotipos vectoriales de precisión y activos de marca que transmiten autoridad corporativa inmediata.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
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

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % pillarsData.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);
  };

  return (
    <section style={{ padding: "80px 16px 50px", background: "#f8f9fc", position: "relative" }}>
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        {/* Encabezado Centrado de la Sección */}
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 52px" }}>
          <span
            style={{
              color: "#fe6612",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "12px",
            }}
          >
            IDENTIDAD & BRANDING
          </span>

          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: "600", color: "#111111", margin: "0 0 16px", lineHeight: "1.25" }}>
            Diseño web a medida con <br />
            <span style={{ color: "#fe6612" }}>identidad de marca</span>
          </h2>

          <p style={{ color: "#71717a", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>
            Cuidamos la tipografía, el impacto visual y la armonía cromática para que tu negocio transmita máxima autoridad y confianza.
          </p>
        </div>

        {/* Grid de Pilares */}
        <div
          className="qaway-pillars-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Columna Izquierda: Mensaje Central & Pilares */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div>
              <span
                style={{
                  color: "#fe6612",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {current.tag}
              </span>

              <h3 style={{ color: "#111111", fontSize: "26px", fontWeight: "700", margin: "0 0 16px", lineHeight: "1.25" }}>
                {current.title}
              </h3>

              {/* Tarjeta de Contenido / Descripción perfectamente alineada */}
              <div
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "12px",
                  padding: "26px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                }}
              >
                <p
                  style={{
                    color: "#3f3f46",
                    fontSize: "15px",
                    lineHeight: "1.65",
                    margin: "0 0 16px",
                  }}
                >
                  "{current.desc}"
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(254, 102, 18, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={18} color="#fe6612" />
                  </div>
                  <div>
                    <strong style={{ fontSize: "13.5px", color: "#111111", display: "block" }}>
                      Pilar Esencial de Diseño
                    </strong>
                    <span style={{ fontSize: "12px", color: "#71717a" }}>
                      Garantía de Autoridad & Conversión Qaway Lab
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paginador & Controles de Navegación Centrados debajo de la tarjeta */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", paddingTop: "6px" }}>
              {/* Flecha Anterior */}
              <button
                onClick={handlePrev}
                aria-label="Pilar anterior"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid #e4e4e7",
                  color: "#18181b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f4f4f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <ChevronLeft size={20} />
              </button>

              {/* Indicadores de Puntos */}
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

              {/* Flecha Siguiente */}
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
                  boxShadow: "0 4px 12px rgba(254, 102, 18, 0.25)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Showcase Visual con Animación */}
          <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  overflow: "hidden",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Imagen del Proyecto / Mockup */}
                <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
                  <img
                    src={current.image}
                    alt={current.highlight}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  {/* Badge Destacado */}
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
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <h4
                      style={{
                        fontSize: "19px",
                        fontWeight: "700",
                        color: "#111111",
                        margin: "0 0 4px",
                        fontFamily: "var(--qw-font-display)",
                      }}
                    >
                      {current.highlight}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#71717a" }}>
                      {current.subHighlight}
                    </span>
                  </div>

                  {/* Badges Técnicos */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "6px", borderTop: "1px solid #f4f4f5" }}>
                    {current.badges.map((badge) => (
                      <span
                        key={badge}
                        style={{
                          background: "#f4f4f5",
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
    </section>
  );
}
