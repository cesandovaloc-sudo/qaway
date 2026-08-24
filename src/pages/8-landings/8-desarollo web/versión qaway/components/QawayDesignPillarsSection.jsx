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
  const [currentIdx1, setCurrentIdx1] = useState(0);
  const [currentIdx2, setCurrentIdx2] = useState(0);

  const current1 = pillarsData[currentIdx1];
  const current2 = pillarsData[currentIdx2];

  const handleNext1 = () => setCurrentIdx1((prev) => (prev + 1) % pillarsData.length);
  const handlePrev1 = () => setCurrentIdx1((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);

  const handleNext2 = () => setCurrentIdx2((prev) => (prev + 1) % pillarsData.length);
  const handlePrev2 = () => setCurrentIdx2((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);

  return (
    <section style={{ padding: "80px 16px 80px", background: "#f8f9fc", position: "relative" }}>
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

        {/* ─────────────────────────────────────────────────────────────
            OPCIÓN 1: DOS TARJETAS GEMELAS SIMÉTRICAS (ALINEADAS AL 100%)
            ───────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #e4e4e7", padding: "6px 16px", borderRadius: "999px", marginBottom: "20px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612" }} />
            <strong style={{ fontSize: "12.5px", color: "#111111" }}>OPCIÓN 1: Dos Tarjetas Gemelas Simétricas</strong>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "28px",
              alignItems: "stretch",
            }}
          >
            {/* Tarjeta Izquierda (Control del Pilar Integrado) */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "12px",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                height: "100%",
                minHeight: "440px",
              }}
            >
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
                  {current1.tag}
                </span>

                <h3 style={{ color: "#111111", fontSize: "24px", fontWeight: "700", margin: "0 0 16px", lineHeight: "1.25" }}>
                  {current1.title}
                </h3>

                <p
                  style={{
                    color: "#52525b",
                    fontSize: "15px",
                    lineHeight: "1.65",
                    margin: "0 0 24px",
                  }}
                >
                  "{current1.desc}"
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#f9fafb",
                    border: "1px solid #f4f4f5",
                    borderRadius: "10px",
                    padding: "12px 16px",
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
                  <div>
                    <strong style={{ fontSize: "13px", color: "#111111", display: "block" }}>
                      Pilar Esencial de Diseño
                    </strong>
                    <span style={{ fontSize: "11.5px", color: "#71717a" }}>
                      Garantía de Autoridad & Conversión Qaway Lab
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta: Navegación Integrada */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px", borderTop: "1px solid #f4f4f5", marginTop: "24px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {pillarsData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx1(i)}
                      aria-label={`Ir al pilar ${i + 1}`}
                      style={{
                        width: currentIdx1 === i ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: currentIdx1 === i ? "#fe6612" : "#e4e4e7",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handlePrev1}
                    aria-label="Pilar anterior"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#f9fafb",
                      border: "1px solid #e4e4e7",
                      color: "#18181b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={handleNext1}
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
                      boxShadow: "0 4px 12px rgba(254, 102, 18, 0.25)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta Derecha (Showcase Visual) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current1.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: "440px",
                }}
              >
                <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
                  <img
                    src={current1.image}
                    alt={current1.highlight}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
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

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "space-between", flexGrow: 1 }}>
                  <div>
                    <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 4px", fontFamily: "var(--qw-font-display)" }}>
                      {current1.highlight}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#71717a" }}>
                      {current1.subHighlight}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f4f4f5" }}>
                    {current1.badges.map((badge) => (
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

        {/* ─────────────────────────────────────────────────────────────
            OPCIÓN 2: UN SOLO CONTENEDOR MAESTRO BLANCO DE 2 COLUMNAS
            ───────────────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #e4e4e7", padding: "6px 16px", borderRadius: "999px", marginBottom: "20px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612" }} />
            <strong style={{ fontSize: "12.5px", color: "#111111" }}>OPCIÓN 2: Un Solo Contenedor Maestro Panorámico</strong>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              padding: "36px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr",
                gap: "40px",
                alignItems: "center",
              }}
            >
              {/* Columna Izquierda */}
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
                    {current2.tag}
                  </span>

                  <h3 style={{ color: "#111111", fontSize: "24px", fontWeight: "700", margin: "0 0 14px", lineHeight: "1.25" }}>
                    {current2.title}
                  </h3>

                  <p style={{ color: "#52525b", fontSize: "15px", lineHeight: "1.65", margin: "0 0 20px" }}>
                    "{current2.desc}"
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8f9fc", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "12px 16px", marginBottom: "24px" }}>
                    <Sparkles size={16} color="#fe6612" />
                    <span style={{ fontSize: "12.5px", color: "#18181b", fontWeight: "600" }}>
                      Garantía de Autoridad & Conversión Qaway Lab
                    </span>
                  </div>
                </div>

                {/* Controles de Navegación */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <button
                    onClick={handlePrev2}
                    aria-label="Pilar anterior"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: "1px solid #e4e4e7",
                      color: "#18181b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {pillarsData.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIdx2(i)}
                        style={{
                          width: currentIdx2 === i ? "20px" : "6px",
                          height: "6px",
                          borderRadius: "3px",
                          background: currentIdx2 === i ? "#fe6612" : "#d4d4d8",
                          border: "none",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext2}
                    aria-label="Pilar siguiente"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#fe6612",
                      border: "none",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Columna Derecha (Preview del Proyecto) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current2.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e4e4e7",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: "240px", overflow: "hidden" }}>
                    <img
                      src={current2.image}
                      alt={current2.highlight}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h4 style={{ fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 4px" }}>
                      {current2.highlight}
                    </h4>
                    <span style={{ fontSize: "12.5px", color: "#71717a", display: "block", marginBottom: "12px" }}>
                      {current2.subHighlight}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {current2.badges.map((badge) => (
                        <span key={badge} style={{ background: "#ffffff", border: "1px solid #e4e4e7", color: "#3f3f46", padding: "3px 8px", borderRadius: "5px", fontSize: "10.5px", fontWeight: "600" }}>
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

      </div>
    </section>
  );
}
