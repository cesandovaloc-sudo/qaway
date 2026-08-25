import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, Star } from "lucide-react";
import heroFrontImg from "../ChatGPT Image 24 ago 2026, 16_58_52.png";
import heroBackImg from "../ChatGPT Image 24 ago 2026, 17_09_50.png";

const trustAvatars = [
  { name: 'Ana Sofía', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
  { name: 'Carlos Ruiz', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80' },
  { name: 'Elena Ramos', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80' },
  { name: 'Mateo Silva', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
];

export function HostingerHeroReal() {
  const [frontIndex, setFrontIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrontIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="inicio" className="h-hero-section-real">
      <div className="h-container">
        <div className="h-hero-grid-real">
          
          {/* Columna Izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="qw-kicker-capsule">
              CREACIÓN DE WEBS & TIENDAS DIGITALES
            </span>

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
                Comenzar ahora
              </a>
              <a
                href="#beneficios"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#191918",
                  background: "#ffffff",
                  border: "1.5px solid #191918",
                  padding: "13px 26px",
                  borderRadius: "9999px",
                  fontSize: "14.5px",
                  fontWeight: "700",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#191918";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#191918";
                }}
              >
                <span>Ver proyectos</span>
              </a>
            </div>

            {/* Círculos Animados de Recomendados (Social Proof) */}
            <div
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
                    whileHover={{ y: -3, zIndex: 10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      marginLeft: index === 0 ? "0" : "-10px",
                      border: "2.5px solid #ffffff",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                  whileHover={{ y: -3, zIndex: 10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    marginLeft: "-10px",
                    border: "2.5px solid #ffffff",
                    background: "#f4f4f5",
                    color: "#191918",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  +40
                </motion.div>
              </div>

              {/* Textos y Estrellas */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#fe6612" color="#fe6612" />
                  ))}
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#191918", marginLeft: "4px" }}>
                    5.0 / 5.0
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "500" }}>
                  Empresas y marcas satisfechas
                </span>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Composición en Capas con Intercambio Infinito y Suave */}
          <div className="h-hero-showcase-container" style={{ position: "relative", minHeight: "470px" }}>
            
            {/* IMAGEN 1: Soluciones TI */}
            <motion.div
              animate={{
                x: frontIndex === 0 ? -18 : 36,
                y: frontIndex === 0 ? 0 : -15,
                scale: frontIndex === 0 ? 1 : 0.94,
                zIndex: frontIndex === 0 ? 10 : 2,
                opacity: 1,
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: frontIndex === 0 ? "relative" : "absolute",
                top: 0,
                right: frontIndex === 0 ? "auto" : "10px",
                width: "90%",
                maxWidth: "490px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: frontIndex === 0 
                  ? "0 35px 70px -15px rgba(0, 0, 0, 0.32), 0 15px 30px -8px rgba(0, 0, 0, 0.15)" 
                  : "0 20px 45px -10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src={heroFrontImg}
                alt="Soluciones TI y desarrollo web"
                className="h-hero-layer-img"
              />
            </motion.div>

            {/* IMAGEN 2: Agencia Creativa */}
            <motion.div
              animate={{
                x: frontIndex === 1 ? -18 : 36,
                y: frontIndex === 1 ? 0 : -15,
                scale: frontIndex === 1 ? 1 : 0.94,
                zIndex: frontIndex === 1 ? 10 : 2,
                opacity: 1,
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: frontIndex === 1 ? "relative" : "absolute",
                top: 0,
                right: frontIndex === 1 ? "auto" : "10px",
                width: "90%",
                maxWidth: "490px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: frontIndex === 1 
                  ? "0 35px 70px -15px rgba(0, 0, 0, 0.32), 0 15px 30px -8px rgba(0, 0, 0, 0.15)" 
                  : "0 20px 45px -10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src={heroBackImg}
                alt="Agencia creativa diseño web"
                className="h-hero-layer-img"
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
