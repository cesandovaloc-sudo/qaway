import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, Star, StarHalf } from "lucide-react";
import heroFrontImg from "../assets/Hero-1.webp";
import heroBackImg from "../assets/Hero-2.webp";

const trustAvatars = [
  { name: 'Mariana Ríos', img: '/assets/pages/4-academy/testimonials/mariana.png' },
  { name: 'Diego Morales', img: '/assets/pages/4-academy/testimonials/diego.png' },
  { name: 'Lucía Vargas', img: '/assets/pages/4-academy/testimonials/lucia.png' },
  { name: 'Renzo Soto', img: '/assets/pages/4-academy/testimonials/renzo.png' },
];

export function QawayHeroSection() {
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
                href="#precios"
                className="h-btn-cta-purple h-btn-cta-orange"
                style={{ padding: "14px 38px", fontSize: "15px" }}
              >
                Comenzar ahora
              </a>
              <a
                href="/proyectos"
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
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={14} fill="#fe6612" color="#fe6612" />
                  ))}
                  <StarHalf size={14} fill="#fe6612" color="#fe6612" />
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#191918", marginLeft: "4px" }}>
                    4.5 / 5.0
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "500" }}>
                  Empresas y marcas satisfechas
                </span>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Composición en Capas con Transiciones y Hover 3D */}
          <div className="h-hero-showcase-container" style={{ position: "relative" }}>
            
            {/* IMAGEN 2 (Fondo / Gelato) */}
            <motion.div
              initial={{ opacity: 0, x: 28, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -6, x: 6, transition: { duration: 0.25, ease: "easeOut" } }}
              style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                width: "88%",
                maxWidth: "470px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 15px 35px -8px rgba(0, 0, 0, 0.16)",
                zIndex: 1,
                cursor: "pointer",
              }}
            >
              <img
                src={heroBackImg}
                alt="Agencia creativa diseño web"
                className="h-hero-layer-img"
              />
            </motion.div>

            {/* IMAGEN 1 (Frente / NÖRA) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -8, scale: 1.015, boxShadow: "0 35px 75px -15px rgba(0, 0, 0, 0.36)", transition: { duration: 0.25, ease: "easeOut" } }}
              style={{
                position: "relative",
                top: "40px",
                left: "-10px",
                width: "92%",
                maxWidth: "490px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 30px 65px -15px rgba(0, 0, 0, 0.3)",
                zIndex: 2,
                cursor: "pointer",
              }}
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
