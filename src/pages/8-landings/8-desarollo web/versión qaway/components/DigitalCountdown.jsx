import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

function RouletteDigit({ digit, delay = 0, isParentInView = false }) {
  const target = parseInt(digit, 10) || 0;
  // Reel de 15 números para giro dinámico
  const reel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, target];
  const targetOffset = -(reel.length - 1) * 46;

  return (
    <div
      style={{
        width: "36px",
        height: "46px",
        background: "#e11938",
        borderRadius: "6px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
      }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={isParentInView ? { y: targetOffset } : { y: 0 }}
        transition={{
          duration: 1.4 + delay * 0.15,
          ease: [0.12, 0.8, 0.25, 1],
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {reel.map((num, i) => (
          <div
            key={i}
            style={{
              width: "36px",
              height: "46px",
              minHeight: "46px",
              maxHeight: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: "800",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: 1,
            }}
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function DigitalCountdown({ targetDays = 6 }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 18,
    minutes: 42,
    seconds: 30,
  });

  useEffect(() => {
    const STORAGE_KEY = "qw_launch_offer_deadline_v2";
    const CYCLE_MS = targetDays * 24 * 60 * 60 * 1000;

    // Obtener o crear fecha límite persistente de 6 días
    const getOrSetTargetDate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();
        if (stored) {
          const deadline = parseInt(stored, 10);
          // Si quedan más de 8 horas, mantener el conteo real
          if (deadline - now > 8 * 60 * 60 * 1000) {
            return deadline;
          }
        }
        // Si no existe o le queda poco tiempo, renovar nuevo ciclo de 6 días
        const newDeadline = Date.now() + CYCLE_MS;
        localStorage.setItem(STORAGE_KEY, String(newDeadline));
        return newDeadline;
      } catch {
        return Date.now() + CYCLE_MS;
      }
    };

    const targetDate = getOrSetTargetDate();

    const updateCountdown = () => {
      const current = Date.now();
      const difference = Math.max(0, targetDate - current);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDays]);

  const pad = (n) => String(n).padStart(2, "0");

  const units = [
    { label: "Días", value: pad(timeLeft.days) },
    { label: "Horas", value: pad(timeLeft.hours) },
    { label: "Minutos", value: pad(timeLeft.minutes) },
    { label: "Segundos", value: pad(timeLeft.seconds) },
  ];

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}
    >
      {units.map((u, uIdx) => {
        const [d1, d2] = u.value.split("");
        return (
          <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
            {/* Par de Cajas Dígito con Efecto Ruleta */}
            <div style={{ display: "flex", gap: "3px" }}>
              <RouletteDigit digit={d1} delay={uIdx * 0.8} isParentInView={isInView} />
              <RouletteDigit digit={d2} delay={uIdx * 0.8 + 0.3} isParentInView={isInView} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>
              {u.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
