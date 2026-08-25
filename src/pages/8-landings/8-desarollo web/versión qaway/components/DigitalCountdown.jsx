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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
      {units.map((u) => {
        const [d1, d2] = u.value.split("");
        return (
          <div key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            {/* Par de Cajas Dígito */}
            <div style={{ display: "flex", gap: "4px" }}>
              <div
                style={{
                  width: "36px",
                  height: "44px",
                  background: "linear-gradient(180deg, #ff453a 0%, #e0281b 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  boxShadow: "0 4px 10px rgba(224, 40, 27, 0.35)",
                }}
              >
                {d1}
              </div>
              <div
                style={{
                  width: "36px",
                  height: "44px",
                  background: "linear-gradient(180deg, #ff453a 0%, #e0281b 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  boxShadow: "0 4px 10px rgba(224, 40, 27, 0.35)",
                }}
              >
                {d2}
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {u.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
