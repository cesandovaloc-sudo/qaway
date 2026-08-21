import { ArrowUpRight, Check, Columns, Eye, HelpCircle, Info, Laptop, Monitor, Move, Paintbrush, Redo2, Save, ShieldCheck, Sparkles, Undo2 } from "lucide-react";

export function HostingerHeroReal() {
  return (
    <section id="inicio" className="h-hero-section-real">
      <div className="h-container">
        <div className="h-hero-grid-real">
          {/* Columna Izquierda */}
          <div>
            <div className="h-hero-overline-real">
              Hasta un 78% de descuento en hosting administrado para WordPress
            </div>

            <h1 className="h-hero-title-real">
              Gestiona tu sitio web WordPress de manera sencilla
            </h1>

            <ul className="h-hero-checks-real">
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Dominio gratis</span>
                <Info size={14} color="#84879c" style={{ cursor: "pointer" }} />
              </li>
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Migración de sitios web gratuita e ilimitada</span>
              </li>
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Sitios web WordPress mantenidos para ti</span>
              </li>
            </ul>

            <div style={{ marginBottom: "20px" }}>
              <a href="#precios" className="h-btn-cta-purple" style={{ padding: "14px 42px", fontSize: "16px" }}>
                Empezar ya
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#56596e", fontSize: "13.5px", fontWeight: "600" }}>
              <ShieldCheck size={16} />
              <span>Garantía de reembolso de 30 días</span>
            </div>
          </div>

          {/* Columna Derecha: Canvas Visual de WordPress con IA */}
          <div className="h-mockup-wrapper-real">
            {/* Barra lateral de WordPress */}
            <div className="h-mockup-sidebar-real">
              {/* Logo WordPress */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 1.848-.598 3.559-1.611 4.954l-5.074-13.2A8.442 8.442 0 0 1 12 3.5zm-6.602 4.195c.571-.027 1.111.237 1.393.766L9.61 16.5l-3.23-8.805zm10.742 0l3.076 8.384c.338-.616.554-1.309.627-2.04.148-1.503-.314-2.993-1.282-4.142l-2.421-2.202z" />
              </svg>
              <div style={{ width: "20px", height: "1px", background: "#3c434a" }} />
              <div className="h-mockup-sidebar-icon active">
                <Paintbrush size={16} />
              </div>
              <div className="h-mockup-sidebar-icon">
                <Columns size={16} />
              </div>
              <div className="h-mockup-sidebar-icon">
                <Sparkles size={16} />
              </div>
            </div>

            {/* Ventana de Edición */}
            <div className="h-mockup-window-real">
              {/* Barra Superior */}
              <div className="h-mockup-topbar-real">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button style={{ background: "#2271b1", color: "#fff", border: "none", borderRadius: "4px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>+</button>
                  <Undo2 size={14} />
                  <Redo2 size={14} />
                </div>
                <div style={{ background: "#f0f0f1", padding: "3px 14px", borderRadius: "4px", fontWeight: "600", fontSize: "11px", color: "#2c3338" }}>
                  About me · Page
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Monitor size={14} />
                  <button style={{ background: "#2271b1", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "4px", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>Save</button>
                </div>
              </div>

              {/* Canvas de Contenido */}
              <div className="h-mockup-canvas-real">
                <div className="h-canvas-nav">
                  <span>ABOUT</span>
                  <span>PRODUCTS</span>
                  <span>CONTACT</span>
                </div>

                {/* Floating Ask AI Bubble */}
                <div className="h-canvas-floating-bubble">
                  <Sparkles size={13} color="#673de6" />
                  <span>Ask AI</span>
                  <span style={{ color: "#c3c4c7" }}>|</span>
                  <span>B</span>
                  <span>I</span>
                  <span>&lt;/&gt;</span>
                </div>

                {/* Title Box */}
                <div className="h-canvas-heading-box">
                  <h2>Empower<br />your life</h2>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button style={{ background: "#12131a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                    → Join Member
                  </button>
                  <button style={{ background: "transparent", border: "1px solid #12131a", color: "#12131a", padding: "8px 16px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                    Explore products
                  </button>
                </div>

                {/* Background image of beach yoga */}
                <div style={{ position: "absolute", right: "20px", bottom: "0", width: "200px", height: "240px", overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80"
                    alt="Yoga lifestyle"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* Floating Product Card on the Right */}
              <div className="h-floating-hero-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "12px", color: "#12131a" }}>Yoga starter pack</strong>
                  <ArrowUpRight size={14} />
                </div>
                <p style={{ fontSize: "9.5px", color: "#727586", margin: "0 0 8px", lineHeight: "1.3" }}>
                  A yoga starter pack is a curated set of essential items.
                </p>
                <div style={{ position: "relative", height: "90px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                  <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80"
                    alt="Yoga mats"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "6px", right: "6px", background: "#ffffff", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "800" }}>
                    $ 50.00
                  </div>
                </div>

                {/* Floating AI Status Tag */}
                <div className="h-floating-ai-pill">
                  <Sparkles size={12} color="#673de6" />
                  <span>Brewing content with AI magic...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
