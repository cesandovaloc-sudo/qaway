import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Flame } from "lucide-react";
import { DigitalCountdown } from "./DigitalCountdown";

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Si ya lo cerró en esta sesión, no volver a mostrar
    const alreadyShown = sessionStorage.getItem("qaway_exit_shown");
    if (alreadyShown) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 15) {
        setIsOpen(true);
        sessionStorage.setItem("qaway_exit_shown", "true");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const close = () => setIsOpen(false);

  const handleClaim = () => {
    close();
    const contactSection = document.getElementById("contacto");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
          }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "24px",
              padding: "42px 32px 36px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              border: "1px solid rgba(254, 102, 18, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar modal"
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                background: "#f4f4f5",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#71717a",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e4e4e7";
                e.currentTarget.style.color = "#18181b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f4f4f5";
                e.currentTarget.style.color = "#71717a";
              }}
            >
              <X size={18} />
            </button>

            {/* Badge de Alerta */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(254, 102, 18, 0.1)",
                border: "1px solid rgba(254, 102, 18, 0.25)",
                color: "#fe6612",
                fontSize: "12px",
                fontWeight: "800",
                padding: "5px 14px",
                borderRadius: "9999px",
                marginBottom: "18px",
              }}
            >
              <Flame size={15} />
              <span>¡ESPERA! NO DEJES PASAR ESTA OPORTUNIDAD</span>
            </div>

            {/* Título */}
            <h3
              style={{
                fontSize: "clamp(1.5rem, 2.5vw, 1.85rem)",
                fontWeight: "800",
                color: "#111111",
                margin: "0 0 10px",
                letterSpacing: "-0.03em",
                lineHeight: "1.2",
              }}
            >
              Asegura tu web profesional a precio de lanzamiento
            </h3>

            <p style={{ color: "#52525b", fontSize: "14.5px", lineHeight: "1.55", margin: "0 0 26px" }}>
              Obtén tu <strong>One Web por solo S/ 79.90</strong> antes de que expire la cuenta regresiva. Cupos limitados por mes.
            </p>

            {/* Temporizador Digital en Bloques */}
            <div style={{ marginBottom: "30px" }}>
              <DigitalCountdown targetDays={4} />
            </div>

            {/* Botón CTA */}
            <button
              type="button"
              onClick={handleClaim}
              style={{
                display: "flex",
                width: "100%",
                height: "52px",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "14px",
                border: "none",
                background: "#fe6612",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(254, 102, 18, 0.35)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ff7527";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fe6612";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span>Reclamar mi oferta de lanzamiento</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={close}
              style={{
                marginTop: "14px",
                background: "transparent",
                border: "none",
                color: "#a1a1aa",
                fontSize: "12.5px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              No gracias, prefiero pagar el precio regular
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
