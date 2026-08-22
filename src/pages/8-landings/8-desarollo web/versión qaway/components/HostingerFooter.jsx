export function HostingerFooter() {
  return (
    <footer className="h-footer">
      <div className="hostinger-container">
        <div className="h-footer-grid">
          <div className="h-footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#673de6" />
                <path d="M9 8H14V24H9V8Z" fill="white" />
                <path d="M18 8H23V24H18V8Z" fill="white" />
                <path d="M14 14H18V18H14V14Z" fill="white" />
              </svg>
              <strong style={{ fontSize: "20px", color: "#fff" }}>Hostinger</strong>
            </div>
            <p style={{ color: "#a0a3bd", fontSize: "13.5px", lineHeight: "1.6", maxWidth: "280px" }}>
              Alojamiento web de alta velocidad, seguro y accesible para emprendedores y creadores en todo el mundo.
            </p>
          </div>

          <div className="h-footer-col">
            <h4>Hosting</h4>
            <ul>
              <li><a href="#precios">Hosting Web</a></li>
              <li><a href="#precios">Hosting WordPress</a></li>
              <li><a href="#precios">Hosting VPS</a></li>
              <li><a href="#precios">Hosting Cloud</a></li>
            </ul>
          </div>

          <div className="h-footer-col">
            <h4>Dominios</h4>
            <ul>
              <li><a href="#precios">Comprar Dominio</a></li>
              <li><a href="#precios">Transferir Dominio</a></li>
              <li><a href="#precios">WHOIS Lookup</a></li>
              <li><a href="#precios">Dominio Gratis</a></li>
            </ul>
          </div>

          <div className="h-footer-col">
            <h4>Información</h4>
            <ul>
              <li><a href="#precios">Sobre nosotros</a></li>
              <li><a href="#precios">Blog de tecnología</a></li>
              <li><a href="#precios">Afiliados</a></li>
              <li><a href="#precios">Estado del sistema</a></li>
            </ul>
          </div>
        </div>

        <div className="h-footer-bottom">
          <span>© 2026 Hostinger. Todos los derechos reservados.</span>
          <span>Precios expresados en US$ sin impuestos incluidos.</span>
        </div>
      </div>
    </footer>
  );
}
