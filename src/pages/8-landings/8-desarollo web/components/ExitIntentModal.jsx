import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
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

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "490px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "36px 28px 30px",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.12)",
              textAlign: "center",
              border: "1px solid rgba(0, 0, 0, 0.08)",
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
                top: "16px",
                right: "16px",
                background: "#f4f4f6",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
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
                e.currentTarget.style.background = "#f4f4f6";
                e.currentTarget.style.color = "#71717a";
              }}
            >
              <X size={15} />
            </button>

            {/* Badge Minimalista */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f4f4f6",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                color: "#18181b",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                padding: "4px 12px",
                borderRadius: "9999px",
                marginBottom: "16px",
                textTransform: "uppercase",
              }}
            >
              <Sparkles size={12} color="#ff4b0b" />
              <span>OFERTA DE LANZAMIENTO</span>
            </div>

            {/* Título */}
            <h3
              style={{
                fontSize: "clamp(1.4rem, 2.2vw, 1.7rem)",
                fontWeight: "700",
                color: "#111111",
                margin: "0 0 8px",
                letterSpacing: "-0.03em",
                lineHeight: "1.2",
              }}
            >
              Asegura tu web profesional a precio de lanzamiento
            </h3>

            <p style={{ color: "#52525b", fontSize: "13.5px", lineHeight: "1.5", margin: "0 0 22px" }}>
              Obtén tu <strong>One Web por solo S/ 79.90</strong> antes de que expire la cuenta regresiva. Cupos limitados por mes.
            </p>

            {/* Temporizador Digital Minimalista */}
            <div style={{ marginBottom: "24px" }}>
              <DigitalCountdown targetDays={6} />
            </div>

            {/* Botón CTA */}
            <button
              type="button"
              onClick={handleClaim}
              style={{
                display: "flex",
                width: "100%",
                height: "48px",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "10px",
                border: "none",
                background: "#ff4b0b",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255, 75, 11, 0.25)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fd5605";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ff4b0b";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span>Reclamar mi oferta de lanzamiento</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
