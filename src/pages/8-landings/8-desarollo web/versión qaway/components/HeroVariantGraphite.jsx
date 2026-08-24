import { motion } from "framer-motion";
import { Check, Info, ShieldCheck, Star } from "lucide-react";
import heroFrontImg from "../assets/hero-showcase-front.png";
import heroBackImg from "../assets/hero-showcase-back.png";

const trustAvatars = [
  { name: 'Ana Sofía', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
  { name: 'Carlos Ruiz', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80' },
  { name: 'Elena Ramos', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80' },
  { name: 'Mateo Silva', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
];

export function HeroVariantGraphite() {
  return (
    <section style={{ padding: "40px 16px 50px", background: "#ffffff" }}>
      <div className="h-container" style={{ maxWidth: "1320px" }}>
        
        {/* Label Identificador de Variante */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={{ background: "#1e2026", color: "#ffffff", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ⭐ Alternativa 1: Hero Flotante Grafito Carbón (#1e2026)
          </span>
        </div>

        {/* Tarjeta Flotante Dark */}
        <div
          style={{
            background: "#1e2026",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "54px 44px",
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="h-hero-grid-real">
            
            {/* Columna Izquierda */}
            <div>
              <div className="h-hero-overline-real" style={{ color: "#fe6612", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "800" }}>
                CREACIÓN DE WEBS & SISTEMAS DIGITALES
              </div>

              <h1 className="h-hero-title-real" style={{ color: "#ffffff" }}>
                Gestiona tu sitio web WordPress de manera sencilla
              </h1>

              <ul className="h-hero-checks-real" style={{ color: "#e4e4e7" }}>
                <li className="h-hero-check-item-real" style={{ color: "#e4e4e7" }}>
                  <Check size={18} strokeWidth={3} color="#00b090" />
                  <span>Dominio gratis</span>
                  <Info size={14} color="#a1a1aa" style={{ cursor: "pointer" }} />
                </li>
                <li className="h-hero-check-item-real" style={{ color: "#e4e4e7" }}>
                  <Check size={18} strokeWidth={3} color="#00b090" />
                  <span>Migración de sitios web gratuita e ilimitada</span>
                </li>
                <li className="h-hero-check-item-real" style={{ color: "#e4e4e7" }}>
                  <Check size={18} strokeWidth={3} color="#00b090" />
                  <span>Sitios web WordPress mantenidos para ti</span>
                </li>
              </ul>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                <a
                  href="#planes"
                  className="h-btn-cta-purple h-btn-cta-orange"
                  style={{ padding: "14px 38px", fontSize: "15px" }}
                >
                  Empezar ya
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a1a1aa", fontSize: "13px", fontWeight: "600" }}>
                  <ShieldCheck size={16} color="#00b090" />
                  <span>Garantía de reembolso de 30 días</span>
                </div>
              </div>

              {/* Social Proof */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  marginTop: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {trustAvatars.map((av, index) => (
                    <div
                      key={av.name}
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        marginLeft: index === 0 ? "0" : "-10px",
                        border: "2.5px solid #1e2026",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      }}
                    >
                      <img src={av.img} alt={av.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      marginLeft: "-10px",
                      border: "2.5px solid #1e2026",
                      background: "#2a2d36",
                      color: "#fe6612",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +50
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "2px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff", marginLeft: "4px" }}>
                      5.0 / 5.0
                    </span>
                  </div>
                  <small style={{ color: "#a1a1aa", fontSize: "11.5px", fontWeight: "500" }}>
                    Más de 50 negocios confían en nosotros
                  </small>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mockups */}
            <div className="h-hero-showcase-container">
              <div className="h-hero-layer-back">
                <img src={heroBackImg} alt="Agencia creativa diseño web" className="h-hero-layer-img" />
              </div>
              <div className="h-hero-layer-front">
                <img src={heroFrontImg} alt="Soluciones TI y desarrollo web" className="h-hero-layer-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
