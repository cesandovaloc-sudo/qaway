import { Link } from "react-router-dom";
import { ArrowRight, Globe, ShieldCheck } from "lucide-react";
import { WHATSAPP_LINK } from "@/data/navigation";

export function HostingerFooterFull() {
  return (
    <footer id="contacto" style={{ backgroundColor: "#111111", color: "#ffffff", borderTop: "1px solid rgba(255, 255, 255, 0.1)", padding: "70px 24px 36px", width: "100%", fontFamily: "var(--h-font-sans)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Grid Principal de 4 Columnas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "48px", marginBottom: "56px" }}>
          
          {/* Columna 1: Marca & Propuesta */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "22px", fontWeight: "700", letterSpacing: "-0.05em", color: "#ffffff", fontFamily: "var(--h-font-display)", marginBottom: "16px" }}>
              Qaway <span style={{ color: "#ff4b0b", marginLeft: "4px" }}>Lab</span>
            </Link>

            <p style={{ color: "#a1a1aa", fontSize: "13.5px", lineHeight: "1.65", margin: "0 0 20px", maxWidth: "300px" }}>
              Estudio de ingeniería digital y diseño de vanguardia. Construimos sistemas web de alto impacto, landing pages de conversión y soluciones con IA.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontSize: "12.5px", fontWeight: "600" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              <span>Sistemas & Servidores Operativos 99.9%</span>
            </div>
          </div>

          {/* Columna 2: Navegación de la Landing */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px", fontFamily: "var(--h-font-display)" }}>
              Navegación
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><a href="#inicio" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Inicio</a></li>
              <li><a href="#beneficios" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Beneficios</a></li>
              <li><a href="#rendimiento" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Rendimiento & Velocidad</a></li>
              <li><a href="#seguridad" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Seguridad y Protección</a></li>
              <li><a href="#planes" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Planes y Precios</a></li>
              <li><a href="#faq" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Columna 3: Tecnología e IA */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px", fontFamily: "var(--h-font-display)" }}>
              Tecnología & IA
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><a href="#rendimiento" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Core Web Vitals 99+</a></li>
              <li><a href="#beneficios" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Agentes e Integraciones IA</a></li>
              <li><a href="#rendimiento" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Infraestructura LiteSpeed / CDN</a></li>
              <li><a href="#seguridad" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Seguridad & Firewall WAF</a></li>
              <li><a href="#beneficios" style={{ color: "#a1a1aa", fontSize: "13.5px", textDecoration: "none" }}>Automatizaciones & CRM</a></li>
            </ul>
          </div>

          {/* Columna 4: Contacto Directo */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 18px", fontFamily: "var(--h-font-display)" }}>
              Contacto Directo
            </h4>
            <p style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6", margin: "0 0 16px" }}>
              ¿Tienes un proyecto en mente? Escríbenos para una cotización y diagnóstico técnico inmediato.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                color: "#111111",
                border: "1.5px solid #ffffff",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>Escribir por WhatsApp</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Barra Inferior */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "12.5px", color: "#71717a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>© 2026 Qaway Lab. Todos los derechos reservados.</span>
            <span>•</span>
            <span>Estándar de Ingeniería v3.0</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a href="#inicio" style={{ color: "#a1a1aa", textDecoration: "none" }}>Privacidad</a>
            <a href="#inicio" style={{ color: "#a1a1aa", textDecoration: "none" }}>Términos</a>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a1a1aa" }}>
              <Globe size={14} />
              <span>Español (PE / LATAM)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
