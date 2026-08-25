import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function RouletteDigit({ digit, delay = 0 }) {
  const target = parseInt(digit, 10) || 0;
  // Reel de ruleta con ciclo 0-9 seguido del dígito objetivo
  const reel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, target];
  const targetIndex = 20; // Se detiene en el último número exacto (target)

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
        whileInView={{ y: -targetIndex * 46 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 1.3 + delay * 0.12,
          ease: [0.16, 1, 0.3, 1],
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

export function DigitalCountdown({ targetDays = 4 }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 35,
    seconds: 18,
  });

  useEffect(() => {
    // Cuenta regresiva dinámica con efecto de urgencia rotativo
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + targetDays, 23, 59, 59).getTime();

    const updateCountdown = () => {
      const current = new Date().getTime();
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
      {units.map((u, uIdx) => {
        const [d1, d2] = u.value.split("");
        return (
          <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
            {/* Par de Cajas Dígito con Efecto Ruleta */}
            <div style={{ display: "flex", gap: "3px" }}>
              <RouletteDigit digit={d1} delay={uIdx * 2} />
              <RouletteDigit digit={d2} delay={uIdx * 2 + 1} />
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
