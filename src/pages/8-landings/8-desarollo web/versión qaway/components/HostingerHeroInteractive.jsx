import { useState, useEffect } from "react";
import { ArrowRight, Check, Laptop, RefreshCw, ShieldCheck, Smartphone, Sparkles, Star, Tablet, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const samplePrompts = [
  { label: "Restaurante Gourmet", prompt: "Restaurante de cocina fusión con reservas en línea y menú digital", theme: "#d97706" },
  { label: "Tienda de Moda", prompt: "Boutique de ropa urbana con catálogo interactivo y pasarela de pago", theme: "#5025d1" },
  { label: "Agencia de Marketing", prompt: "Agencia de branding y captación de clientes con portafolio moderno", theme: "#00b090" },
];

export function HostingerHeroInteractive() {
  const [prompt, setPrompt] = useState("Restaurante de cocina fusión con reservas en línea y menú digital");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(100);
  const [activeStep, setActiveStep] = useState("¡Sitio generado con éxito!");
  const [device, setDevice] = useState("desktop"); // 'desktop' | 'mobile'
  const [activeTheme, setActiveTheme] = useState("#5025d1");

  const [timeLeft, setTimeLeft] = useState({
    days: "02",
    hours: "18",
    minutes: "44",
    seconds: "32",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let sec = parseInt(prev.seconds, 10) - 1;
        let min = parseInt(prev.minutes, 10);
        let hr = parseInt(prev.hours, 10);
        let dy = parseInt(prev.days, 10);

        if (sec < 0) {
          sec = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          hr -= 1;
        }
        if (hr < 0) {
          hr = 23;
          dy -= 1;
        }

        return {
          days: String(Math.max(0, dy)).padStart(2, "0"),
          hours: String(Math.max(0, hr)).padStart(2, "0"),
          minutes: String(Math.max(0, min)).padStart(2, "0"),
          seconds: String(Math.max(0, sec)).padStart(2, "0"),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGenerate = (customPrompt, theme) => {
    if (isGenerating) return;
    const text = customPrompt || prompt;
    if (customPrompt) setPrompt(customPrompt);
    if (theme) setActiveTheme(theme);

    setIsGenerating(true);
    setProgress(15);
    setActiveStep("1/3 Analizando nicho y arquitectura de marca...");

    setTimeout(() => {
      setProgress(55);
      setActiveStep("2/3 Creando diseño responsivo y redactando textos SEO...");
    }, 900);

    setTimeout(() => {
      setProgress(85);
      setActiveStep("3/3 Optimizando velocidad LiteSpeed y Core Web Vitals...");
    }, 1700);

    setTimeout(() => {
      setProgress(100);
      setIsGenerating(false);
      setActiveStep("¡Sitio generado con éxito a 60fps!");
    }, 2400);
  };

  return (
    <section id="inicio" className="h-hero-section">
      <div className="hostinger-container">
        <div className="h-hero-grid">
          {/* Columna Izquierda: Mensaje Comercial & Urgencia */}
          <div className="h-hero-left">
            <div className="h-hero-kicker">
              <span className="kicker-icon">
                <Sparkles size={14} />
              </span>
              <span>Creador de Sitios Web de WordPress con IA</span>
            </div>

            <h1 className="h-hero-title">
              Crea tu web de WordPress con <span className="brand-gradient">Inteligencia Artificial</span> en minutos
            </h1>

            <ul className="h-hero-checklist">
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Genera diseño, textos persuasivos e imágenes de alta resolución</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Dominio gratis incluido durante el primer año (valor US$ 9.99)</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Aceleración LiteSpeed: Tiempos de carga hasta 3 veces más veloces</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Soporte 24/7 en español y garantía de devolución total de 30 días</span>
              </li>
            </ul>

            <div className="h-hero-price-box">
              <span className="h-discount-badge">Ahorra hasta un 75%</span>
              <div className="h-hero-price-tag">
                <span className="old-price tabular-nums">US$ 11.99</span>
                <span className="current-price tabular-nums">US$ 2.99</span>
                <span className="period">/mes</span>
              </div>
              <small style={{ color: "#727586", fontSize: "13px", fontWeight: "600" }}>+ 3 meses gratis incluidos</small>
            </div>

            {/* Temporizador Regresivo */}
            <div className="h-timer-wrap">
              <div className="h-timer-unit tabular-nums">
                {timeLeft.days}
                <small>Días</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit tabular-nums">
                {timeLeft.hours}
                <small>Horas</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit tabular-nums">
                {timeLeft.minutes}
                <small>Minutos</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit tabular-nums">
                {timeLeft.seconds}
                <small>Segundos</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "28px" }}>
              <a href="#precios" className="h-btn-primary" style={{ padding: "14px 38px", fontSize: "16px" }}>
                <span>Empezar ahora</span>
                <ArrowRight size={18} />
              </a>
              <div style={{ color: "#727586", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600" }}>
                <ShieldCheck size={18} color="#00b090" />
                Garantía de reembolso de 30 días
              </div>
            </div>

            <div className="h-trust-bar">
              <strong style={{ color: "#1d1e24" }}>Trustpilot</strong>
              <div className="h-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#00b67a" color="#00b67a" />
                ))}
              </div>
              <span style={{ fontWeight: "700", color: "#1d1e24" }}>4.7 / 5</span>
              <span>(más de 24,000 opiniones verificadas)</span>
            </div>
          </div>

          {/* Columna Derecha: Simulador Interactivo de WordPress con IA */}
          <div className="h-hero-right">
            <div className="h-ai-widget">
              <div className="h-ai-widget-header">
                <div className="h-ai-widget-dots">
                  <span style={{ background: "#eb2f5d" }} />
                  <span style={{ background: "#ffb800" }} />
                  <span style={{ background: "#00b090" }} />
                </div>
                <div className="h-ai-widget-title">
                  <Wand2 size={15} color="#8c67ff" />
                  <span>Hostinger AI Website Builder Engine</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setDevice("desktop")}
                    style={{
                      background: device === "desktop" ? "#3f4250" : "transparent",
                      border: "none",
                      color: "#fff",
                      borderRadius: "4px",
                      padding: "4px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <Laptop size={14} />
                  </button>
                  <button
                    onClick={() => setDevice("mobile")}
                    style={{
                      background: device === "mobile" ? "#3f4250" : "transparent",
                      border: "none",
                      color: "#fff",
                      borderRadius: "4px",
                      padding: "4px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              <div className="h-ai-widget-body">
                {/* Input de Prompt */}
                <div className="h-ai-input-group">
                  <Sparkles size={18} color="#673de6" style={{ position: "absolute", left: "14px", top: "15px" }} />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-ai-input"
                    placeholder="Describe la web que deseas crear..."
                  />
                </div>

                {/* Quick Prompts */}
                <div className="h-ai-quick-tags">
                  <span style={{ fontSize: "12px", color: "#727586", display: "flex", alignItems: "center" }}>Ejemplos:</span>
                  {samplePrompts.map((s) => (
                    <button
                      key={s.label}
                      className="h-ai-tag-btn"
                      onClick={() => handleGenerate(s.prompt, s.theme)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="h-ai-progress-wrap">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: "600", marginBottom: "6px" }}>
                    <span style={{ color: "#5025d1" }}>{activeStep}</span>
                    <span style={{ color: "#727586" }}>{progress}%</span>
                  </div>
                  <div className="h-ai-progress-bar-bg">
                    <div className="h-ai-progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="h-btn-primary"
                    style={{ width: "100%", padding: "10px", fontSize: "13.5px", marginTop: "6px" }}
                  >
                    <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                    <span>{isGenerating ? "Generando con IA..." : "Re-generar diseño en vivo"}</span>
                  </button>
                </div>

                {/* Live Preview Canvas */}
                <div
                  className="h-ai-preview-canvas"
                  style={{
                    maxWidth: device === "mobile" ? "280px" : "100%",
                    margin: device === "mobile" ? "0 auto" : "0",
                    transition: "max-width 0.3s ease",
                  }}
                >
                  <div className="h-preview-navbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: activeTheme }} />
                      <strong style={{ fontSize: "12px", color: "#1d1e24" }}>MiMarca.com</strong>
                    </div>
                    <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#727586" }}>
                      <span>Inicio</span>
                      <span>Servicios</span>
                      <span>Contacto</span>
                    </div>
                  </div>

                  <div className="h-preview-hero">
                    <span style={{ fontSize: "11px", fontWeight: "700", color: activeTheme, textTransform: "uppercase", marginBottom: "4px" }}>
                      WordPress IA 2026
                    </span>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#1d1e24", marginBottom: "6px" }}>
                      {prompt.slice(0, 48)}...
                    </h4>
                    <p style={{ fontSize: "11.5px", color: "#727586", margin: "0 0 12px", lineHeight: "1.4" }}>
                      Estructura optimizada para captar clientes desde el primer día con velocidad LiteSpeed garantizada.
                    </p>
                    <div>
                      <button
                        style={{
                          background: activeTheme,
                          color: "#fff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Reservar / Contactar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
