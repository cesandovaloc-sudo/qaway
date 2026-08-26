import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

function RouletteDigit({ digit, delay = 0, isParentInView = false }) {
  const target = parseInt(digit, 10) || 0;
  // Reel de 15 números para giro dinámico
  const reel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, target];
  const targetOffset = -(reel.length - 1) * 44;

  return (
    <div
      style={{
        width: "32px",
        height: "44px",
        background: "#18181b",
        borderRadius: "6px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
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
              width: "32px",
              height: "44px",
              minHeight: "44px",
              maxHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "700",
              color: "#ffffff",
              fontFamily: "var(--font-mono, monospace)",
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

function DigitPair({ value, label, isParentInView, baseDelay }) {
  const str = String(value).padStart(2, "0");
  const d1 = str[0];
  const d2 = str[1];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        <RouletteDigit digit={d1} delay={baseDelay} isParentInView={isParentInView} />
        <RouletteDigit digit={d2} delay={baseDelay + 1} isParentInView={isParentInView} />
      </div>
      <span
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#71717a",
          textTransform: "capitalize",
          fontFamily: "var(--font-sans, system-ui)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function DigitalCountdown({ targetDays = 6 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 37,
    seconds: 3,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "nowrap",
      }}
    >
      <DigitPair value={timeLeft.days} label="Días" isParentInView={isInView} baseDelay={0} />
      <span style={{ fontSize: "18px", fontWeight: "700", color: "#a1a1aa", marginTop: "-18px" }}>:</span>
      <DigitPair value={timeLeft.hours} label="Horas" isParentInView={isInView} baseDelay={1} />
      <span style={{ fontSize: "18px", fontWeight: "700", color: "#a1a1aa", marginTop: "-18px" }}>:</span>
      <DigitPair value={timeLeft.minutes} label="Minutos" isParentInView={isInView} baseDelay={2} />
      <span style={{ fontSize: "18px", fontWeight: "700", color: "#a1a1aa", marginTop: "-18px" }}>:</span>
      <DigitPair value={timeLeft.seconds} label="Segundos" isParentInView={isInView} baseDelay={3} />
    </div>
  );
}
