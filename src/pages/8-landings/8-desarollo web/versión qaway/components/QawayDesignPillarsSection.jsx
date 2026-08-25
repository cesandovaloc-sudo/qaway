import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import pilar1Img from "../ChatGPT Image 24 ago 2026, 12_16_16.png";
import pilar2Img from "../ChatGPT Image 24 ago 2026, 13_32_04.png";
import pilar3Img from "../ChatGPT Image 24 ago 2026, 13_31_41.png";

const pillarsData = [
  {
    id: "branding",
    tag: "PILAR 01 · IDENTIDAD CORPORATIVA",
    title: "Branding & Identidad Visual",
    desc: "Construimos una presencia cromática coherente, logotipos vectoriales de precisión y activos gráficos que transmiten autoridad corporativa inmediata frente a tu competencia.",
    image: pilar1Img,
    highlight: "Paleta Cromática & Manual de Marca Digital",
    subHighlight: "Armonización visual de alto contraste y balance cromático",
    badges: ["Color Tokens", "Logo Vectorial", "Design System", "Activos SVG"],
    featureTag: "✨ DIRECCIÓN DE ARTE & UI",
  },
  {
    id: "tipografia",
    tag: "PILAR 02 · EXPERIENCIA DE USUARIO (UX)",
    title: "Tipografía Web & Lectura Optimizada",
    desc: "Seleccionamos tipografías profesionales que facilitan la lectura en móviles, reducen el rebote de visitantes y comunican tu propuesta de valor de forma clara y directa.",
    image: pilar3Img,
    highlight: "Diseño Tipográfico para Conversión",
    subHighlight: "Textos legibles y contrastados para retener clientes potenciales",
    badges: ["Lectura Móvil", "Alto Contraste", "Escaneabilidad", "Diseño Limpio"],
    featureTag: "🔤 EXPERIENCIA DE LECTURA (UX)",
  },
  {
    id: "mockup",
    tag: "PILAR 03 · RECURSOS VISUALES",
    title: "Mockups & Fotografía de Producto",
    desc: "Producimos e integramos composiciones visuales, fotografías profesionales y mockups realistas de tus servicios dentro de la web para transmitir máxima confianza y deseo de compra.",
    image: pilar2Img,
    highlight: "Imágenes y Maquetas de Alto Impacto",
    subHighlight: "Recursos visuales alineados a tu rubro",
    badges: ["Mockups Integrados", "Fotografía HD", "Composición Visual", "Alta Credibilidad"],
    featureTag: "🖼️ ASSETS VISUALES PREMIUM",
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
      style={{ padding: "90px 16px 80px", background: "#f8f9fc", position: "relative" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Principal de la Sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ textAlign: "center", maxWidth: "850px", margin: "0 auto 52px" }}
        >
          <span className="qw-kicker-capsule">
            IDENTIDAD VISUAL & EXPERIENCIA DIGITAL
          </span>

          <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontWeight: "600", color: "#111111", margin: 0, lineHeight: "1.2" }}>
            Diseño web profesional <span style={{ color: "#fe6612" }}>adaptado a tu marca</span>
          </h2>
        </motion.div>

        {/* Estructura Split Directa 2 Columnas (Estilo Integrado) */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: "64px",
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
              paddingRight: "12px",
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
                  fontSize: "clamp(1.75rem, 2.5vw, 2.2rem)",
                  fontWeight: "600",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.18",
                  color: "#111111",
                  margin: "0 0 14px",
                  minHeight: "64px",
                  display: "flex",
                  alignItems: "center",
                  maxWidth: "440px",
                }}
              >
                {current.title}
              </h3>

              <p style={{ color: "#52525b", fontSize: "15.5px", lineHeight: "1.65", margin: 0, maxWidth: "440px" }}>
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

            {/* Botón Explorar proyectos (Oculto hasta activar portafolio) */}
            <div style={{ display: "none", marginTop: "24px" }}>
              <a
                href="/proyectos"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#18181b",
                  background: "#ffffff",
                  border: "1.5px solid #18181b",
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Explorar proyectos</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Blanca con Altura Ampliada un 5% (345px) */}
          <div style={{ width: "100%", minHeight: "510px", position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0, 0, 0, 0.09)", transition: { duration: 0.2, ease: "easeOut" } }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                  cursor: "default",
                  minHeight: "510px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ height: "345px", overflow: "hidden", position: "relative", background: "#f1f3f7" }}>
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
                    <span>{current.featureTag}</span>
                  </div>
                </div>

                <div style={{ padding: "24px 26px 26px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "165px" }}>
                  <div>
                    <h4 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px", fontFamily: "var(--qw-font-display)" }}>
                      {current.highlight}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#71717a", display: "block", marginBottom: "14px" }}>
                      {current.subHighlight}
                    </span>
                  </div>
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
        </motion.div>
      </div>
    </section>
  );
}
