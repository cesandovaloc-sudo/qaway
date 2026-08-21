import { ChevronDown, Globe, Sparkles } from "lucide-react";

export function HostingerHeader() {
  return (
    <header className="h-header-nav">
      <div className="h-container" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Brand Logo */}
        <a href="#inicio" className="h-brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M4 6H12V26H4V6Z" fill="#12131a" />
            <path d="M20 6H28V26H20V6Z" fill="#12131a" />
            <path d="M12 13.5H20V18.5H12V13.5Z" fill="#12131a" />
          </svg>
          <span>HOSTINGER</span>
        </a>

        {/* Header Right */}
        <div className="h-header-right">
          <a href="#features" className="h-ask-ai-btn">
            <Sparkles size={15} color="#673de6" />
            <span>Preguntar a la IA</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            <span style={{ fontSize: "16px" }}>🇪🇸</span>
            <span>ES</span>
          </div>

          <a href="#precios" style={{ textDecoration: "none", color: "#12131a", fontWeight: "700", fontSize: "14.5px" }}>
            Empezar ya
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "600", color: "#56596e", cursor: "pointer" }}>
            <span>Divisa</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </header>
  );
}
