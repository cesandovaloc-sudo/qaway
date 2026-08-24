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

export function QawayBrandsMarquee() {
  const track1 = [...brandRow1, ...brandRow1, ...brandRow1];
  const track2 = [...brandRow2, ...brandRow2, ...brandRow2];

  return (
    <section
      style={{
        padding: "50px 0 60px",
        background: "#f8f9fc",
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid #e4e4e7",
        borderBottom: "1px solid #e4e4e7",
      }}
    >
      {/* Degradados Laterales para Desvanecimiento Suave en Fondo Gris */}
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

      <div style={{ textAlign: "center", marginBottom: "28px", padding: "0 16px" }}>
        <p
          style={{
            fontSize: "11.5px",
            fontWeight: "800",
            color: "#fe6612",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          MARCAS QUE TOMAN FORMA CON QAWAY LAB
        </p>
      </div>

      {/* Contenedor Marquee con pausa al Hover */}
      <div className="qaway-marquee-wrapper" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        
        {/* Fila 1: Circula hacia la Izquierda */}
        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-left">
            {track1.map((brand, idx) => (
              <span
                key={`r1-${brand.name}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "24px",
                  fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
                  color: "#18181b",
                  opacity: 0.85,
                  whiteSpace: "nowrap",
                  ...brand.style,
                }}
              >
                <span>{brand.name}</span>
                <span style={{ width: "1px", height: "24px", background: "#fe6612", display: "inline-block", opacity: 0.6 }} />
              </span>
            ))}
          </div>
        </div>

        {/* Fila 2: Circula hacia la Derecha */}
        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-right">
            {track2.map((brand, idx) => (
              <span
                key={`r2-${brand.name}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "24px",
                  fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
                  color: "#18181b",
                  opacity: 0.85,
                  whiteSpace: "nowrap",
                  ...brand.style,
                }}
              >
                <span>{brand.name}</span>
                <span style={{ width: "1px", height: "24px", background: "#fe6612", display: "inline-block", opacity: 0.6 }} />
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
