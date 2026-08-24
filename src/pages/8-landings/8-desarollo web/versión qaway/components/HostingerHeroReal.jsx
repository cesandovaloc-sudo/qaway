import { motion } from "framer-motion";
import { Check, MessageCircle, Star } from "lucide-react";
import heroFrontImg from "../assets/hero-showcase-front.png";
import heroBackImg from "../assets/hero-showcase-back.png";

const trustAvatars = [
  { name: 'Ana Sofía', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
  { name: 'Carlos Ruiz', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80' },
  { name: 'Elena Ramos', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80' },
  { name: 'Mateo Silva', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
];

export function HostingerHeroReal() {
  return (
    <section id="inicio" className="h-hero-section-real">
      <div className="h-container">
        <div className="h-hero-grid-real">
          
          {/* Columna Izquierda */}
          <div>
            <div className="h-hero-overline-real" style={{ color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "800" }}>
              CREACIÓN DE WEBS & TIENDAS DIGITALES
            </div>

            <h1 className="h-hero-title-real">
              Diseñamos tu sitio web profesional listo para captar clientes
            </h1>

            <ul className="h-hero-checks-real">
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Diseño profesional adaptado a tu marca</span>
              </li>
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Carga ultra rápida y responsiva para celulares</span>
              </li>
              <li className="h-hero-check-item-real">
                <Check size={18} strokeWidth={3} />
                <span>Variedad de formatos para cada objetivo</span>
              </li>
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <a
                href="#planes"
                className="h-btn-cta-purple h-btn-cta-orange"
                style={{ padding: "14px 38px", fontSize: "15px" }}
              >
                Cotizar mi proyecto
              </a>
              <a
                href="https://wa.me/51921820468?text=Hola%20Qaway%20Lab%2C%20quiero%20cotizar%20un%20proyecto%20web"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#15803d",
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                  padding: "12px 22px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(34, 197, 94, 0.08)",
                }}
              >
                <MessageCircle size={18} color="#16a34a" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

            {/* Círculos Animados de Recomendados (Social Proof) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                paddingTop: "20px",
                borderTop: "1px solid #f4f4f5",
                marginTop: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {trustAvatars.map((av, index) => (
                  <motion.div
                    key={av.name}
                    whileHover={{ scale: 1.18, zIndex: 10, y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      marginLeft: index === 0 ? "0" : "-10px",
                      border: "2.5px solid #ffffff",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    title={av.name}
                  >
                    <img
                      src={av.img}
                      alt={av.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </motion.div>
                ))}
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    marginLeft: "-10px",
                    border: "2.5px solid #ffffff",
                    background: "#fff2eb",
                    color: "#ff4b0b",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                  }}
                >
                  +20
                </motion.div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "2px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#111111", marginLeft: "4px" }}>
                    4.5 / 5.0
                  </span>
                </div>
                <small style={{ color: "#71717a", fontSize: "11.5px", fontWeight: "500" }}>
                  Más de 20 negocios confían en nosotros
                </small>
              </div>
            </motion.div>
          </div>

          {/* Columna Derecha: Composición en Capas Invertida (Bordes rectos, sin marco y con más parte inferior) */}
          <div className="h-hero-showcase-container">
            
            {/* CAPA 1: IMAGEN DE ATRÁS (Agencia Creativa - Asomando 50% recta y con sombra suave) */}
            <motion.div
              initial={{ opacity: 0, y: 30, x: 40 }}
              animate={{ opacity: 1, y: 0, x: 36 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="h-hero-layer-back"
            >
              <img
                src={heroBackImg}
                alt="Agencia creativa diseño web"
                className="h-hero-layer-img"
              />
            </motion.div>

            {/* CAPA 2: IMAGEN DEL FRENTE (Soluciones TI - Al frente 100% nítida y recta) */}
            <motion.div
              initial={{ opacity: 0, y: 30, x: -20 }}
              animate={{ opacity: 1, y: 0, x: -18 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="h-hero-layer-front"
            >
              <img
                src={heroFrontImg}
                alt="Soluciones TI y desarrollo web"
                className="h-hero-layer-img"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
