import { useState, useEffect } from "react";
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
  const [isPaused, setIsPaused] = useState(false);
  const current = pillarsData[currentIdx];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % pillarsData.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);

  // Transición automática suave cada 4.5 segundos (se pausa al pasar el mouse)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % pillarsData.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      style={{ padding: "110px 16px 120px", background: "#f8f9fc", position: "relative" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Principal de la Sección */}
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

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: 0, lineHeight: "1.2" }}>
            Diseño web a medida con <span style={{ color: "#fe6612" }}>identidad de marca propia</span>
          </h2>
        </div>

        {/* Estructura Split Directa 2 Columnas (Estilo Integrado) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: "56px",
            alignItems: "center",
          }}
        >
          {/* Columna Izquierda: Detalle con Altura Mínima Fija para Evitar Saltos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "360px",
            }}
          >
            {/* Bloque de Textos con Altura Mínima Calibrada */}
            <div style={{ minHeight: "220px" }}>
              <span
                style={{
                  color: "#71717a",
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

              {/* Título de Pilar con el mismo tamaño y formato H2 de sección */}
              <h3
                style={{
                  fontFamily: "var(--qw-font-display)",
                  fontSize: "clamp(1.85rem, 2.8vw, 2.35rem)",
                  fontWeight: "600",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.18",
                  color: "#111111",
                  margin: "0 0 14px",
                  minHeight: "64px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {current.title}
              </h3>

              <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.65", margin: 0, maxWidth: "520px" }}>
                {current.desc}
              </p>
            </div>

            {/* Controles de Navegación Fijos en la Base (Sin Saltos) */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px", paddingTop: "20px" }}>
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
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
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
                  boxShadow: "0 4px 14px rgba(254, 102, 18, 0.3)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Blanca Limpia Directa sobre el Lienzo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e4e4e7",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ height: "320px", overflow: "hidden", position: "relative", background: "#f1f3f7" }}>
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
                    background: "rgba(255, 255, 255, 0.94)",
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

              <div style={{ padding: "26px" }}>
                <h4 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px", fontFamily: "var(--qw-font-display)" }}>
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
