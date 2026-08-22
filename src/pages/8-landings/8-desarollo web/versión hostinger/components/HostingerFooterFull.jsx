import { CreditCard, Globe, Lock, ShieldCheck } from "lucide-react";

export function HostingerFooterFull() {
  return (
    <footer style={{ backgroundColor: "#111111", color: "#ffffff", borderTop: "1px solid rgba(255, 255, 255, 0.1)", padding: "70px 24px 36px", width: "100%" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "56px" }}>
          {/* Columna Principal */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#673de6" />
                <path d="M9 8H14V24H9V8Z" fill="white" />
                <path d="M18 8H23V24H18V8Z" fill="white" />
                <path d="M14 14H18V18H14V14Z" fill="white" />
              </svg>
              <strong style={{ fontSize: "20px", color: "#ffffff", letterSpacing: "-0.03em" }}>HOSTINGER</strong>
            </div>
            <p style={{ color: "#a0a3bd", fontSize: "13.5px", lineHeight: "1.65", maxWidth: "280px", margin: "0 0 20px" }}>
              Alojamiento web de alta velocidad, seguro y accesible para emprendedores, diseñadores y empresas en todo el mundo.
            </p>
            <div style={{ display: "flex", gap: "10px", color: "#a0a3bd", fontSize: "12.5px", alignItems: "center" }}>
              <ShieldCheck size={16} color="#00b090" />
              <span>Garantía de reembolso de 30 días</span>
            </div>
          </div>

          {/* Columna 2 */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: "0 0 16px" }}>Hosting</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Hosting Web</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Hosting WordPress con IA</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Hosting VPS</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Hosting Cloud</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Alojamiento de Tiendas Online</a></li>
            </ul>
          </div>

          {/* Columna 3 */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: "0 0 16px" }}>Dominios</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Comprar Dominio</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Transferir Dominio</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Buscador de Dominios</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Dominio Gratis</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>WHOIS Lookup</a></li>
            </ul>
          </div>

          {/* Columna 4 */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: "0 0 16px" }}>Herramientas IA</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><a href="#features" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Creador de Sitios Web con IA</a></li>
              <li><a href="#herramientas" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Creador de Logos con IA</a></li>
              <li><a href="#herramientas" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Redactor de Artículos SEO</a></li>
              <li><a href="#herramientas" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Mapas de Calor con IA</a></li>
            </ul>
          </div>

          {/* Columna 5 */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: "0 0 16px" }}>Empresa</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Sobre nosotros</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Blog de tecnología</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Programa de afiliados</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Estado del sistema</a></li>
              <li><a href="#precios" style={{ color: "#a0a3bd", fontSize: "13px", textDecoration: "none" }}>Contacto y Soporte 24/7</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "12.5px", color: "#71717a" }}>
          <span>© 2026 Hostinger. Todos los derechos reservados.</span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span>Precios expresados en US$ antes de impuestos aplicables.</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#a0a3bd" }}>
              <Globe size={14} />
              <span>Español (LATAM)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
