import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sp-navbar ${scrolled ? "scrolled" : ""}`}>
      <a href="#inicio" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
        <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#0e1013", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "14px" }}>
          Q
        </span>
        <strong style={{ fontSize: "1.05rem", letterSpacing: "-0.4px" }}>Qaway Lab</strong>
      </a>

      <nav className="sp-nav-links">
        <a href="#modelos" className="sp-nav-link">Arquitecturas</a>
        <a href="#metricas" className="sp-nav-link">Métricas</a>
        <a href="#proceso" className="sp-nav-link">Proceso</a>
        <a href="#planes" className="sp-nav-link">Membresía & Planes</a>
        <a href="#faq" className="sp-nav-link">Preguntas</a>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <a
          href="https://wa.me/51987654321?text=Hola%20Qaway%20Lab%2C%20quisiera%20cotizar%20un%20proyecto%20web%20de%20alta%20gama."
          target="_blank"
          rel="noopener noreferrer"
          className="sp-btn-primary"
        >
          <span>Cotizar Proyecto</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </header>
  );
}
