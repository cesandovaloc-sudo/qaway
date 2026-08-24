import logo1 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (1).webp";
import logo3 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (3).webp";
import logo4 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (4).webp";
import logo5 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (5).webp";
import logo6 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (6).webp";
import logo7 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (7).webp";
import logo8 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (8).webp";
import logo13 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (13).webp";
import logo15 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (15).webp";
import logo16 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (16).webp";
import logo18 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (18).webp";
import logo19 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (19).webp";
import logo20 from "@/assets/1-no-usados/Portfolio/Qaway Web Logo WEP 1 (20).webp";

export function QawayBrandsMarquee() {
  const row1 = [logo1, logo3, logo4, logo5, logo6, logo7];
  const row2 = [logo8, logo13, logo15, logo16, logo18, logo19, logo20];

  // Duplicar para loop continuo sin cortes
  const track1 = [...row1, ...row1, ...row1, ...row1];
  const track2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section
      style={{
        padding: "60px 0 70px",
        background: "#ffffff",
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid #f4f4f5",
        borderBottom: "1px solid #f4f4f5",
      }}
    >
      {/* Degradados Laterales para Desvanecimiento Suave */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "140px",
          height: "100%",
          background: "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "140px",
          height: "100%",
          background: "linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: "36px", padding: "0 16px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "800",
            color: "#71717a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: "8px",
          }}
        >
          MARCAS & PROYECTOS QUE CONFÍAN EN NOSOTROS
        </span>
        <h3
          style={{
            fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
            fontWeight: "600",
            color: "#111111",
            margin: 0,
          }}
        >
          Marcas que impulsan su presencia digital con Qaway Lab
        </h3>
      </div>

      {/* Contenedor Marquee con pausa al Hover */}
      <div className="qaway-marquee-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Fila 1: Circula hacia la Izquierda */}
        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-left">
            {track1.map((logoSrc, idx) => (
              <div
                key={`r1-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 30px",
                  flexShrink: 0,
                  opacity: 0.7,
                  filter: "grayscale(100%)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.filter = "grayscale(0%)";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.filter = "grayscale(100%)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={logoSrc}
                  alt="Cliente Qaway Lab"
                  style={{
                    height: "42px",
                    width: "auto",
                    maxWidth: "140px",
                    objectFit: "contain",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Fila 2: Circula hacia la Derecha */}
        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-right">
            {track2.map((logoSrc, idx) => (
              <div
                key={`r2-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 30px",
                  flexShrink: 0,
                  opacity: 0.7,
                  filter: "grayscale(100%)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.filter = "grayscale(0%)";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.filter = "grayscale(100%)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={logoSrc}
                  alt="Cliente Qaway Lab"
                  style={{
                    height: "42px",
                    width: "auto",
                    maxWidth: "140px",
                    objectFit: "contain",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
