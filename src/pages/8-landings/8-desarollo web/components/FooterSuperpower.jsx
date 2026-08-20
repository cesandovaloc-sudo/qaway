import { ArrowRight, Globe, Mail, Phone } from "lucide-react";

export function FooterSuperpower() {
  return (
    <footer className="sp-footer">
      <div className="sp-container">
        <div className="sp-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#0e1013", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "14px" }}>
                Q
              </span>
              <strong style={{ fontSize: "1.15rem", letterSpacing: "-0.4px" }}>Qaway Lab</strong>
            </div>
            <p style={{ color: "var(--sp-text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "300px", margin: "0 0 20px" }}>
              Estudio de ingeniería digital, diseño UI de vanguardia y arquitecturas web de alto impacto para negocios en crecimiento.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#059669", fontWeight: "600" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              <span>Servidores & API operativas (99.9% Uptime)</span>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: "0.9rem", color: "#0e1013", marginBottom: "14px" }}>Arquitecturas</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
              <a href="#modelos" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Landings de Conversión</a>
              <a href="#modelos" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Webs Comerciales</a>
              <a href="#modelos" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>E-Commerce & Tiendas</a>
              <a href="#modelos" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>SaaS & Apps a Medida</a>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: "0.9rem", color: "#0e1013", marginBottom: "14px" }}>Metodología</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
              <a href="#proceso" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Proceso de 4 Fases</a>
              <a href="#metricas" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Core Web Vitals 100</a>
              <a href="#planes" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Garantía de Entrega</a>
              <a href="#faq" style={{ color: "var(--sp-text-secondary)", textDecoration: "none" }}>Preguntas Frecuentes</a>
            </div>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: "0.9rem", color: "#0e1013", marginBottom: "14px" }}>Contacto Directo</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "var(--sp-text-secondary)", marginBottom: "18px" }}>
              <span>Lima, Perú & Remoto Global</span>
              <span>contacto@qawaylab.com</span>
              <span>+51 987 654 321</span>
            </div>
            <a
              href="https://wa.me/51987654321?text=Hola%20Qaway%20Lab%2C%20quisiera%20iniciar%20mi%20proyecto."
              target="_blank"
              rel="noopener noreferrer"
              className="sp-btn-primary"
              style={{ fontSize: "0.82rem", padding: "8px 16px" }}
            >
              <span>Escríbenos</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>

        <div className="sp-footer-bottom">
          <span>© 2026 Qaway Lab Digital. Todos los derechos reservados.</span>
          <span>Arquitectura Web & UX Editorial a 60fps.</span>
        </div>
      </div>
    </footer>
  );
}
