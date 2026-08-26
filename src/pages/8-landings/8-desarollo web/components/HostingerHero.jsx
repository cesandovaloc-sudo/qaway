import { useState, useEffect } from "react";
import { ArrowRight, Check, ShieldCheck, Sparkles, Star } from "lucide-react";

export function HostingerHero() {
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

  return (
    <section id="inicio" className="h-hero-section">
      <div className="hostinger-container">
        <div className="h-hero-grid">
          {/* Columna Izquierda */}
          <div className="h-hero-left">
            <div className="h-hero-kicker">
              <Sparkles size={16} />
              <span>Creador de sitios web de WordPress con IA</span>
            </div>

            <h1 className="h-hero-title">
              Crea tu web de WordPress con <span>Inteligencia Artificial</span> en minutos
            </h1>

            <ul className="h-hero-checklist">
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Genera contenido, imágenes y estructura completa con IA</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Dominio gratis incluido (valor de US$ 9.99)</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Migración web automática y gratuita</span>
              </li>
              <li className="h-hero-checklist-item">
                <Check size={18} strokeWidth={2.5} />
                <span>Soporte 24/7 en español y garantía de reembolso de 30 días</span>
              </li>
            </ul>

            <div className="h-hero-price-box">
              <span className="h-discount-badge">Ahorra un 75%</span>
              <div className="h-hero-price-tag">
                <span className="old-price">US$ 11.99</span>
                <span className="current-price">US$ 2.99</span>
                <span className="period">/mes</span>
              </div>
              <small style={{ color: "#727586", fontSize: "13px" }}>+ 3 meses gratis</small>
            </div>

            {/* Contador Regresivo */}
            <div className="h-timer-wrap">
              <div className="h-timer-unit">
                {timeLeft.days}
                <small>Días</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit">
                {timeLeft.hours}
                <small>Horas</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit">
                {timeLeft.minutes}
                <small>Minutos</small>
              </div>
              <span className="h-timer-colon">:</span>
              <div className="h-timer-unit">
                {timeLeft.seconds}
                <small>Segundos</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <a href="#precios" className="h-btn-primary" style={{ padding: "14px 36px", fontSize: "16px" }}>
                <span>Empezar ahora</span>
                <ArrowRight size={18} />
              </a>
              <small style={{ color: "#727586", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} color="#00b090" />
                Garantía de devolución de 30 días
              </small>
            </div>

            <div className="h-trust-bar">
              <span>Trustpilot</span>
              <div className="h-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#00b67a" />
                ))}
              </div>
              <strong>4.7 / 5</strong>
              <span>(más de 24,000 reseñas)</span>
            </div>
          </div>

          {/* Columna Derecha: Mockup Dashboard de WordPress IA */}
          <div className="h-hero-right">
            <div className="h-hero-media-wrap">
              <div className="h-hero-media-window">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                  alt="Creador de WordPress con IA de Hostinger"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
