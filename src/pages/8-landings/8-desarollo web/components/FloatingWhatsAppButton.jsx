import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingWhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

  const waUrl = "https://wa.me/51930756781?text=Hola%20Qaway%20Lab%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20el%20desarrollo%20de%20mi%20sitio%20web.";

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      // Oculto en el Hero (primeros 350px)
      if (currentY < 350) {
        setVisible(false);
      } else {
        // Aparece cuando el usuario sube scroll (o al llegar al final de la página)
        const isNearBottom = window.innerHeight + currentY >= document.body.offsetHeight - 600;
        const isScrollingUp = currentY < lastScrollY.current;

        if (isScrollingUp || isNearBottom) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "26px",
            right: "26px",
            zIndex: 99,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Tooltip sutil al pasar mouse */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{
                  background: "#18181b",
                  color: "#ffffff",
                  padding: "9px 15px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                <span>¿Hablamos por WhatsApp?</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón Circular Oficial de WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "50%",
              background: "#20ba5a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
              textDecoration: "none",
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1ea952";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#20ba5a";
            }}
          >
            <svg
              viewBox="0 0 32 32"
              width="32"
              height="32"
              fill="currentColor"
              style={{ display: "block" }}
            >
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.27 2.13 7.42L2.5 30l6.78-1.6A13.92 13.92 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.56c-2.3 0-4.47-.65-6.33-1.78l-.45-.28-4.03.95.96-3.92-.3-.47A11.5 11.5 0 014.44 16c0-6.38 5.19-11.56 11.56-11.56 6.38 0 11.56 5.19 11.56 11.56S22.38 27.56 16 27.56zm6.34-8.68c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.41.52-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.89-1.07-2.58-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.61.09-.93.44-.32.35-1.22 1.2-1.22 2.92 0 1.72 1.25 3.38 1.43 3.61.18.23 2.47 3.77 5.98 5.29.83.36 1.48.58 1.99.74.84.27 1.6.23 2.21.14.67-.1 2.07-.85 2.36-1.66.29-.81.29-1.51.2-1.66-.09-.15-.32-.24-.67-.41z" />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
