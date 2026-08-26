import { useState } from "react";
import { Download, Copy, Check, Palette, FileText, Image as ImageIcon } from "lucide-react";

export function BrandKitDeliveryCard({ palette }) {
  const [copiedHex, setCopiedHex] = useState(null);

  const defaultPalette = palette || [
    { name: "Negro Editorial", hex: "#111111", role: "Primario" },
    { name: "Naranja Qaway", hex: "#fe6612", role: "Acento" },
    { name: "Arena Nude", hex: "#e7ded7", role: "Superficie" },
    { name: "Blanco Puro", hex: "#ffffff", role: "Fondo" },
  ];

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="qw-gestor-brand-card">
      <div className="qw-gestor-brand-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="qw-gestor-badge-brand">
            <Palette size={15} color="#ff4b0b" />
            <span>Brand Kit Master & Activos de Marca</span>
          </div>
        </div>
        <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "600" }}>
          Vector Master (AI, SVG, PNG)
        </span>
      </div>

      {/* Paleta Cromática Interactiva con Copia Rápida */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Paleta de Color Oficial
        </h4>
        <div className="qw-gestor-palette-grid">
          {defaultPalette.map((c) => (
            <div
              key={c.hex}
              onClick={() => handleCopy(c.hex)}
              className="qw-gestor-palette-item"
              title="Clic para copiar código HEX"
            >
              <div
                className="qw-gestor-palette-color"
                style={{ backgroundColor: c.hex, border: c.hex === "#ffffff" ? "1px solid #e4e4e7" : "none" }}
              />
              <div className="qw-gestor-palette-info">
                <strong>{c.name}</strong>
                <span className="qw-gestor-hex-code">
                  {copiedHex === c.hex ? (
                    <span style={{ color: "#00b090", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Check size={11} /> ¡Copiado!
                    </span>
                  ) : (
                    <span>{c.hex} <Copy size={10} style={{ display: "inline", marginLeft: "2px", opacity: 0.6 }} /></span>
                  )}
                </span>
                <small>{c.role}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Descarga de Entregables Vectoriales */}
      <div>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Archivos Maestros de Entrega
        </h4>
        <div className="qw-gestor-downloads-grid">
          <button type="button" className="qw-gestor-download-btn">
            <FileText size={16} color="#fe6612" />
            <div>
              <strong>Manual de Identidad (PDF)</strong>
              <span>Guía de uso y reglas de logo</span>
            </div>
            <Download size={15} className="qw-gestor-down-icon" />
          </button>

          <button type="button" className="qw-gestor-download-btn">
            <ImageIcon size={16} color="#fe6612" />
            <div>
              <strong>Paquete Vectorial Master (.ZIP)</strong>
              <span>SVG, AI, EPS y PNG transparentes</span>
            </div>
            <Download size={15} className="qw-gestor-down-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
