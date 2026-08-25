import { Link } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { socialLinks, WHATSAPP_PHONE_LINK } from "@/data/navigation";

export function HostingerFooterFull() {
  return (
    <footer style={{ backgroundColor: "#111111", color: "#ffffff", borderTop: "1px solid rgba(255, 255, 255, 0.1)", padding: "75px 24px 36px", width: "100%", fontFamily: "var(--h-font-sans)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Grid Principal de 4 Columnas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "48px", marginBottom: "56px" }}>
          
          {/* Columna 1: Marca & Redes */}
          <div>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "22px", fontWeight: "700", letterSpacing: "-0.05em", color: "#ffffff", marginBottom: "16px" }}>
              Qaway <span style={{ color: "#fe6612", marginLeft: "4px" }}>Lab</span>
            </Link>
            
            <p style={{ color: "#a1a1aa", fontSize: "13.5px", lineHeight: "1.65", margin: "0 0 20px", maxWidth: "290px" }}>
              Desarrollo de sitios web y tiendas digitales de alto impacto visual y conversión para marcas, empresas y profesionales.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#71717a", fontSize: "12.5px", textDecoration: "none", transition: "color 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Navegación de la Landing */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>
              Navegación
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
              <li><a href="#inicio" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Inicio</a></li>
              <li><a href="#proyectos" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Proyectos Realizados</a></li>
              <li><a href="#servicios" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Servicios & Alcance</a></li>
              <li><a href="#precios" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Tarifario & Precios</a></li>
              <li><a href="#faq" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Preguntas Frecuentes</a></li>
              <li><a href="#contacto" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Cotizar Proyecto</a></li>
            </ul>
          </div>

          {/* Columna 3: Planes */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>
              Planes
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
              <li><a href="#precios" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>One Web (S/ 79.90)</a></li>
              <li><a href="#precios" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Web Comercial (S/ 290)</a></li>
              <li><a href="#precios" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Tienda Online (S/ 750)</a></li>
              <li><a href="#contacto" style={{ color: "#a1a1aa", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}>Desarrollo a Medida</a></li>
            </ul>
          </div>

          {/* Columna 4: Contacto Directo */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px" }}>
              ¿Listo para empezar?
            </h4>
            <p style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6", margin: "0 0 18px" }}>
              Escríbenos directamente para cotizar tu proyecto o resolver cualquier consulta técnica.
            </p>
            <a
              href={WHATSAPP_PHONE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fe6612",
                color: "#ffffff",
                padding: "11px 20px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: "700",
                textDecoration: "none",
                transition: "background 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e55708";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fe6612";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span>Escribir por WhatsApp</span>
              <ArrowRight size={15} />
            </a>
          </div>

        </div>

        {/* Barra Inferior */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "12.5px", color: "#71717a" }}>
          <span>© 2026 Qaway Lab. Todos los derechos reservados.</span>
          <span>Precios expresados en Soles (S/) sin impuestos incluidos.</span>
        </div>

      </div>
    </footer>
  );
}
