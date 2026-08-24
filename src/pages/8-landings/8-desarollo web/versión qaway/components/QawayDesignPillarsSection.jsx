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
    <section style={{ padding: "40px 16px 70px" }}>
      <div className="h-container" style={{ maxWidth: "1320px" }}>
        {/* Contenedor Principal Dark (Estilo Showcase de Marca) */}
        <div
          style={{
            background: "#1e2026",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "54px 44px",
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="qaway-pillars-grid"
            style={{
              display: "grid",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Columna Izquierda: Mensaje Central & Pilares */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span
                  style={{
                    color: "#fe6612",
                    fontSize: "11.5px",
                    fontWeight: "800",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  {current.tag}
                </span>

                <h2 style={{ color: "#ffffff", margin: "0 0 16px" }}>
                  {current.title}
                </h2>

                {/* Tarjeta de Contenido / Descripción */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "28px",
                  }}
                >
                  <p
                    style={{
                      color: "#d4d4d8",
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
                        background: "rgba(254, 102, 18, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={18} color="#fe6612" />
                    </div>
                    <div>
                      <strong style={{ fontSize: "13.5px", color: "#ffffff", display: "block" }}>
                        Pilar Esencial de Diseño
                      </strong>
                      <span style={{ fontSize: "12px", color: "#a1a1aa" }}>
                        Garantía de Autoridad & Conversión Qaway Lab
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paginador & Controles de Navegación */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
                {/* Indicadores de Puntos */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {pillarsData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      aria-label={`Ir al pilar ${i + 1}`}
                      style={{
                        width: currentIdx === i ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: currentIdx === i ? "#fe6612" : "rgba(255, 255, 255, 0.2)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>

                {/* Flechas de Navegación */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handlePrev}
                    aria-label="Pilar anterior"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNext}
                    aria-label="Pilar siguiente"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#fe6612",
                      border: "none",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
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
                  background: "#242731",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  overflow: "hidden",
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.35)",
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
                      background: "rgba(30, 32, 38, 0.88)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "999px",
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fe6612" }} />
                    <span>PROYECTO DESTACADO</span>
                  </div>
                </div>

                {/* Pie de la Tarjeta */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <h3
                      style={{
                        fontSize: "19px",
                        fontWeight: "700",
                        color: "#ffffff",
                        margin: "0 0 4px",
                        fontFamily: "var(--qw-font-display)",
                      }}
                    >
                      {current.highlight}
                    </h3>
                    <span style={{ fontSize: "13px", color: "#a1a1aa" }}>
                      {current.subHighlight}
                    </span>
                  </div>

                  {/* Badges Técnicos */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "6px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    {current.badges.map((badge) => (
                      <span
                        key={badge}
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "#e4e4e7",
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
