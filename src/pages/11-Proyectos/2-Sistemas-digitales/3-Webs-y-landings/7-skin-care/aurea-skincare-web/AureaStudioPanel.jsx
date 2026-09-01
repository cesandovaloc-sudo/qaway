import React, { useState } from "react";
import { Move, Type, Layers, RotateCcw, Copy, Check, Sparkles, X } from "lucide-react";

export default function AureaStudioPanel({ config, setConfig, onReset }) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedKey, setSelectedKey] = useState("heroTitle");
  const [copied, setCopied] = useState(false);

  const elements = [
    { key: "heroBg", label: "🖼️ Fondo PNG Hero" },
    { key: "heroTitle", label: "✍️ Título H1" },
    { key: "heroSubtext", label: "📝 Subtexto Hero" },
    { key: "heroBtn", label: "🔘 Botón CTA" },
    { key: "heroPill", label: "💊 Cápsula Productos" },
    { key: "cardLeft", label: "✨ Tarjeta Ingredientes (Izq)" },
    { key: "cardRight", label: "🏷️ Badge Atributos (Der)" },
  ];

  const current = config[selectedKey] || { x: 0, y: 0, scale: 100, fontSize: 40, opacity: 100 };

  const updateProp = (prop, val) => {
    setConfig(prev => ({
      ...prev,
      [selectedKey]: {
        ...prev[selectedKey],
        [prop]: Number(val)
      }
    }));
  };

  const copyCleanCSS = () => {
    const css = `/* === CONFIGURACIÓN MAESTRA CALIBRADA ÁUREA === */
.aurea-landing .hero-stage-bg {
  transform: translate(${config.heroBg?.x || 0}px, ${config.heroBg?.y || 0}px) scale(${(config.heroBg?.scale || 100) / 100});
  opacity: ${(config.heroBg?.opacity || 100) / 100};
}
.aurea-landing .hero-stage-content {
  transform: translate(${config.heroTitle?.x || 0}px, ${config.heroTitle?.y || 0}px) scale(${(config.heroTitle?.scale || 100) / 100});
}
.aurea-landing .hero h1 {
  font-size: ${config.heroTitle?.fontSize || 48}px;
}
.aurea-landing .hero-subtext {
  font-size: ${config.heroSubtext?.fontSize || 15}px;
  transform: translate(${config.heroSubtext?.x || 0}px, ${config.heroSubtext?.y || 0}px);
}
.aurea-landing .hero-stage .hero-pill {
  transform: translate(${config.heroPill?.x || 0}px, ${config.heroPill?.y || 0}px) scale(${(config.heroPill?.scale || 100) / 100});
}
.aurea-landing .hero-overlay {
  transform: translate(${config.cardLeft?.x || 0}px, ${config.cardLeft?.y || 0}px) scale(${(config.cardLeft?.scale || 100) / 100});
  opacity: ${(config.cardLeft?.opacity || 100) / 100};
}
.aurea-landing .hero-badge {
  transform: translate(${config.cardRight?.x || 0}px, ${config.cardRight?.y || 0}px) scale(${(config.cardRight?.scale || 100) / 100});
  opacity: ${(config.cardRight?.opacity || 100) / 100};
}`;

    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99999,
          background: "linear-gradient(135deg, #182219 0%, #2f4431 100%)",
          color: "#fff",
          padding: "12px 18px",
          borderRadius: 999,
          boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.2)",
          fontWeight: 700,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          transition: "transform .2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <Sparkles size={16} color="#8be78b" />
        <span>🎨 Abrir Visual Studio</span>
      </button>
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 320,
        maxHeight: "85vh",
        zIndex: 99999,
        background: "rgba(18, 25, 19, 0.96)",
        color: "#f5f6f4",
        borderRadius: 20,
        backdropFilter: "blur(18px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "14px 16px",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>Áurea Visual Studio</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={onReset}
            title="Restablecer todo a cero"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: 0,
              color: "#ccc",
              borderRadius: 6,
              padding: "4px 7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "transparent",
              border: 0,
              color: "#aaa",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Body Controls */}
      <div style={{ padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Selector de Elemento */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            Elemento a calibrar:
          </label>
          <select
            value={selectedKey}
            onChange={e => setSelectedKey(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {elements.map(el => (
              <option key={el.key} value={el.key} style={{ background: "#1a231b", color: "#fff" }}>
                {el.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sliders de Posición */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#4ade80", fontSize: 11, fontWeight: 700 }}>
            <Move size={13} />
            <span>Posición y Desplazamiento</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "#aaa" }}>Eje X (Horizontal):</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{current.x || 0}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={current.x || 0}
                onChange={e => updateProp("x", e.target.value)}
                style={{ width: "100%", accentColor: "#4ade80", cursor: "pointer" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "#aaa" }}>Eje Y (Vertical):</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{current.y || 0}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={current.y || 0}
                onChange={e => updateProp("y", e.target.value)}
                style={{ width: "100%", accentColor: "#4ade80", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* Sliders de Escala y Tamaño */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#60a5fa", fontSize: 11, fontWeight: 700 }}>
            <Layers size={13} />
            <span>Escala y Opacidad</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "#aaa" }}>Escala / Zoom:</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{current.scale || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={current.scale || 100}
                onChange={e => updateProp("scale", e.target.value)}
                style={{ width: "100%", accentColor: "#60a5fa", cursor: "pointer" }}
              />
            </div>

            {current.opacity !== undefined && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: "#aaa" }}>Opacidad:</span>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{current.opacity ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.opacity ?? 100}
                  onChange={e => updateProp("opacity", e.target.value)}
                  style={{ width: "100%", accentColor: "#60a5fa", cursor: "pointer" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tipografía (Si aplica) */}
        {current.fontSize !== undefined && (
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
              <Type size={13} />
              <span>Tamaño de Texto</span>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "#aaa" }}>Font Size:</span>
                <span style={{ fontWeight: 700, color: "#fff" }}>{current.fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="84"
                value={current.fontSize}
                onChange={e => updateProp("fontSize", e.target.value)}
                style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Export */}
      <footer
        style={{
          padding: "12px 16px",
          background: "rgba(0,0,0,0.25)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={copyCleanCSS}
          style={{
            width: "100%",
            background: copied ? "#22c55e" : "linear-gradient(135deg, #2d5a32 0%, #3f7b46 100%)",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            transition: "all .2s ease",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "¡CSS Maestro Copiado!" : "📋 Copiar Todo el CSS"}</span>
        </button>
      </footer>
    </aside>
  );
}
