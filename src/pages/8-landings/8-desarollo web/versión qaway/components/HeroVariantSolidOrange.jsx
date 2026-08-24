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

export function HeroVariantSolidOrange() {
  return (
    <section style={{ padding: "40px 16px 50px", background: "#ffffff" }}>
      <div className="h-container" style={{ maxWidth: "1320px" }}>
        
        {/* Label Identificador de Variante */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={{ background: "#fe6612", color: "#ffffff", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            🔥 Alternativa 3: Hero Flotante Naranja Sólido (#fe6612)
          </span>
        </div>

        {/* Tarjeta Flotante Naranja Sólido */}
        <div
          style={{
            background: "linear-gradient(135deg, #fe6612 0%, #e85509 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            padding: "54px 44px",
            boxShadow: "0 30px 60px -15px rgba(254, 102, 18, 0.45)",
            position: "relative",
            overflow: "hidden",
            color: "#ffffff",
          }}
        >
          <div className="h-hero-grid-real">
            
            {/* Columna Izquierda */}
            <div>
              <div className="h-hero-overline-real" style={{ color: "rgba(255, 255, 255, 0.9)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "800" }}>
                CREACIÓN DE WEBS & SISTEMAS DIGITALES
              </div>

              <h1 className="h-hero-title-real" style={{ color: "#ffffff" }}>
                Gestiona tu sitio web WordPress de manera sencilla
              </h1>

              <ul className="h-hero-checks-real" style={{ color: "#ffffff" }}>
                <li className="h-hero-check-item-real" style={{ color: "#ffffff" }}>
                  <Check size={18} strokeWidth={3} color="#ffffff" />
                  <span>Dominio gratis</span>
                  <Info size={14} color="rgba(255,255,255,0.7)" style={{ cursor: "pointer" }} />
                </li>
                <li className="h-hero-check-item-real" style={{ color: "#ffffff" }}>
                  <Check size={18} strokeWidth={3} color="#ffffff" />
                  <span>Migración de sitios web gratuita e ilimitada</span>
                </li>
                <li className="h-hero-check-item-real" style={{ color: "#ffffff" }}>
                  <Check size={18} strokeWidth={3} color="#ffffff" />
                  <span>Sitios web WordPress mantenidos para ti</span>
                </li>
              </ul>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                {/* Botón Blanco para Máximo Contraste */}
                <a
                  href="#planes"
                  style={{
                    background: "#ffffff",
                    color: "#fe6612",
                    padding: "14px 38px",
                    borderRadius: "9999px",
                    fontSize: "15px",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#fff8f5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#ffffff"; }}
                >
                  Empezar ya
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255, 255, 255, 0.9)", fontSize: "13px", fontWeight: "600" }}>
                  <ShieldCheck size={16} color="#ffffff" />
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
                  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
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
                        border: "2.5px solid #fe6612",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
                      border: "2.5px solid #fe6612",
                      background: "#ffffff",
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
                      <Star key={i} size={14} fill="#ffffff" color="#ffffff" />
                    ))}
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff", marginLeft: "4px" }}>
                      5.0 / 5.0
                    </span>
                  </div>
                  <small style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "11.5px", fontWeight: "500" }}>
                    Más de 50 negocios confían en nosotros
                  </small>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mockups */}
            <div className="h-hero-showcase-container">
              <div className="h-hero-layer-back" style={{ boxShadow: "0 25px 50px -10px rgba(0, 0, 0, 0.35)" }}>
                <img src={heroBackImg} alt="Agencia creativa diseño web" className="h-hero-layer-img" />
              </div>
              <div className="h-hero-layer-front" style={{ boxShadow: "0 35px 70px -15px rgba(0, 0, 0, 0.45)" }}>
                <img src={heroFrontImg} alt="Soluciones TI y desarrollo web" className="h-hero-layer-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
