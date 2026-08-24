import mockup1 from "../../Diseño sin título (1).png";
import mockup2 from "../../Diseño sin título.png";
import mockup3 from "../../ChatGPT Image 21 ago 2026, 18_38_46.png";
import { Layers, Sparkles, TrendingUp, Gauge, Search, Smartphone } from "lucide-react";

export function HostingerAiCards() {
  return (
    <>
      {/* BLOQUE 1: Elige el tipo de web (Fondo Blanco) */}
      <section id="beneficios" className="h-ai-three-cards-section" style={{ background: "#ffffff", padding: "90px 0 85px" }}>
        <div className="h-container">
          <h2 style={{ marginBottom: "14px" }}>
            Elige el tipo de web que <span style={{ color: "#fe6612" }}>necesita tu marca</span>
          </h2>
          <p style={{ color: "#71717a", fontSize: "16px", maxWidth: "620px", margin: "0 auto 40px", lineHeight: "1.5" }}>
            Estructuras web diseñadas para captar clientes, transmitir autoridad y vender en automático.
          </p>

          <div className="h-three-cards-grid">
            {/* Tarjeta 1: Landing Pages */}
            <div className="h-ai-feature-card" style={{ background: "#ffffff" }}>
              <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, #edf0f5 0%, #f8f9fc 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                  <img
                    src={mockup1}
                    alt="Landing Pages de Captación"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                </div>
              </div>
              
              <div className="h-ai-feature-card-body">
                <h3>Landing Pages de Captación</h3>
                <p>
                  Páginas de una sola sección optimizadas para tráfico publicitario, carga instantánea y conversión directa a correo o tu WhatsApp.
                </p>
              </div>
            </div>

            {/* Tarjeta 2: Sitios Corporativos */}
            <div className="h-ai-feature-card" style={{ background: "#ffffff" }}>
              <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, #edf0f5 0%, #f8f9fc 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                  <img
                    src={mockup2}
                    alt="Sitios Web Corporativos"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                </div>
              </div>

              <div className="h-ai-feature-card-body">
                <h3>Sitios Web Corporativos</h3>
                <p>
                  Estructura multipágina con secciones de servicios, nosotros, blog y formularios para empresas, marcas y profesionales.
                </p>
              </div>
            </div>

            {/* Tarjeta 3: Tiendas Online */}
            <div className="h-ai-feature-card" style={{ background: "#ffffff" }}>
              <div className="h-ai-feature-card-media" style={{ padding: "20px 20px 0 20px", background: "linear-gradient(180deg, #edf0f5 0%, #f8f9fc 100%)", height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", background: "#ffffff", borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
                  <img
                    src={mockup3}
                    alt="Tiendas Online E-commerce"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                </div>
              </div>

              <div className="h-ai-feature-card-body">
                <h3>Tiendas Online (E-commerce)</h3>
                <p>
                  Plataforma completa de ventas con catálogo autogestionable, carrito de compras y pasarelas de pago para vender 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 2: SERVICIOS & CAPACIDADES (Fondo Naranja Suave / Bajito #fff7f2) */}
      <section style={{ background: "#fff7f2", padding: "85px 0 95px", borderTop: "1px solid rgba(254, 102, 18, 0.12)", borderBottom: "1px solid rgba(254, 102, 18, 0.12)" }}>
        <div className="h-container">
          <div style={{ textAlign: "left" }}>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: "800",
                color: "#fe6612",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "12px",
              }}
            >
              SERVICIOS
            </span>

            <h2
              style={{
                fontSize: "clamp(1.9rem, 3.2vw, 2.5rem)",
                fontWeight: "700",
                color: "#111111",
                lineHeight: "1.2",
                maxWidth: "680px",
                margin: "0 0 44px 0",
                textAlign: "left",
              }}
            >
              Todo lo que tu presencia digital necesita, en un solo equipo.
            </h2>

            {/* Contenedor Grid 3x2 con Bordes Interiores y Fondo Blanco */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(254, 102, 18, 0.16)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 6px 24px rgba(254, 102, 18, 0.05)",
              }}
            >
              {/* Fila 1 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  borderBottom: "1px solid rgba(254, 102, 18, 0.14)",
                }}
              >
                {/* Celda 1: Webs corporativas */}
                <div
                  style={{
                    padding: "38px 34px",
                    borderRight: "1px solid rgba(254, 102, 18, 0.14)",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <Layers size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    Webs corporativas
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Sitios institucionales que transmiten autoridad y ordenan tu propuesta comercial.
                  </p>
                </div>

                {/* Celda 2: Marca personal */}
                <div
                  style={{
                    padding: "38px 34px",
                    borderRight: "1px solid rgba(254, 102, 18, 0.14)",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <Sparkles size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    Marca personal
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Portafolios y landings que convierten tu reputación en clientes reales.
                  </p>
                </div>

                {/* Celda 3: E-commerce */}
                <div
                  style={{
                    padding: "38px 34px",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <TrendingUp size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    E-commerce
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Tiendas rápidas con checkout impecable, pagos y métricas desde el día uno.
                  </p>
                </div>
              </div>

              {/* Fila 2 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                }}
              >
                {/* Celda 4: Performance */}
                <div
                  style={{
                    padding: "38px 34px",
                    borderRight: "1px solid rgba(254, 102, 18, 0.14)",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <Gauge size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    Performance
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Carga en menos de 1.5s, Core Web Vitals en verde y hosting optimizado.
                  </p>
                </div>

                {/* Celda 5: SEO técnico */}
                <div
                  style={{
                    padding: "38px 34px",
                    borderRight: "1px solid rgba(254, 102, 18, 0.14)",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <Search size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    SEO técnico
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Estructura semántica, datos enriquecidos e indexación limpia en Google.
                  </p>
                </div>

                {/* Celda 6: Diseño responsive */}
                <div
                  style={{
                    padding: "38px 34px",
                    backgroundColor: "#ffffff",
                    transition: "background-color 0.25s ease, transform 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff4ec";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <Smartphone size={28} color="#fe6612" strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    Diseño responsive
                  </h3>
                  <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                    Una sola experiencia impecable en móvil, tablet y escritorio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
