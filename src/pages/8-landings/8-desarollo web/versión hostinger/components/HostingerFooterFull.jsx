import { CreditCard, Globe, Lock, ShieldCheck } from "lucide-react";

export function HostingerFooterFull() {
  return (
    <footer className="h-footer">
      <div className="hostinger-container">
        <div className="h-footer-grid">
          {/* Columna Principal */}
          <div className="h-footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#673de6" />
                <path d="M9 8H14V24H9V8Z" fill="white" />
                <path d="M18 8H23V24H18V8Z" fill="white" />
                <path d="M14 14H18V18H14V14Z" fill="white" />
              </svg>
              <strong style={{ fontSize: "22px", color: "#ffffff", letterSpacing: "-0.03em" }}>Hostinger</strong>
            </div>
            <p style={{ color: "#a0a3bd", fontSize: "14px", lineHeight: "1.65", maxWidth: "320px", margin: "0 0 20px" }}>
              Alojamiento web de alta velocidad, seguro y accesible para emprendedores, diseñadores y empresas en todo el mundo.
            </p>
            <div style={{ display: "flex", gap: "12px", color: "#a0a3bd", fontSize: "12.5px", alignItems: "center" }}>
              <ShieldCheck size={16} color="#00b090" />
              <span>Garantía de reembolso de 30 días</span>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="h-footer-col">
            <h4>Hosting</h4>
            <ul>
              <li><a href="#precios">Hosting Web</a></li>
              <li><a href="#precios">Hosting WordPress con IA</a></li>
              <li><a href="#precios">Hosting VPS</a></li>
              <li><a href="#precios">Hosting Cloud</a></li>
              <li><a href="#precios">Alojamiento de Tiendas Online</a></li>
            </ul>
          </div>

          {/* Columna 3 */}
          <div className="h-footer-col">
            <h4>Dominios</h4>
            <ul>
              <li><a href="#precios">Comprar Dominio</a></li>
              <li><a href="#precios">Transferir Dominio</a></li>
              <li><a href="#precios">Buscador de Dominios</a></li>
              <li><a href="#precios">Dominio Gratis</a></li>
              <li><a href="#precios">WHOIS Lookup</a></li>
            </ul>
          </div>

          {/* Columna 4 */}
          <div className="h-footer-col">
            <h4>Herramientas IA</h4>
            <ul>
              <li><a href="#features">Creador de Sitios Web con IA</a></li>
              <li><a href="#herramientas">Creador de Logos con IA</a></li>
              <li><a href="#herramientas">Redactor de Artículos SEO</a></li>
              <li><a href="#herramientas">Mapas de Calor con IA</a></li>
            </ul>
          </div>

          {/* Columna 5 */}
          <div className="h-footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#precios">Sobre nosotros</a></li>
              <li><a href="#precios">Blog de tecnología</a></li>
              <li><a href="#precios">Programa de afiliados</a></li>
              <li><a href="#precios">Estado del sistema</a></li>
              <li><a href="#precios">Contacto y Soporte 24/7</a></li>
            </ul>
          </div>
        </div>

        <div className="h-footer-bottom">
          <span>© 2026 Hostinger. Todos los derechos reservados.</span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span>Precios expresados en US$ antes de impuestos aplicables.</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Globe size={14} />
              <span>Español (LATAM)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
