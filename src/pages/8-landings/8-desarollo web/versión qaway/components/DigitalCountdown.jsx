import { useState, useEffect } from "react";

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
      {units.map((u) => {
        const [d1, d2] = u.value.split("");
        return (
          <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
            {/* Par de Cajas Dígito */}
            <div style={{ display: "flex", gap: "3px" }}>
              <div
                style={{
                  width: "36px",
                  height: "46px",
                  background: "#e11938",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "25px",
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                }}
              >
                {d1}
              </div>
              <div
                style={{
                  width: "36px",
                  height: "46px",
                  background: "#e11938",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "25px",
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                }}
              >
                {d2}
              </div>
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
