import { Star } from "lucide-react";

export function HostingerTrustBar() {
  return (
    <section className="h-trust-bar-real">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <strong>Excelente</strong>
        <div style={{ display: "flex", gap: "2px" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "20px",
                height: "20px",
                background: "#00b67a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star size={13} fill="#ffffff" color="#ffffff" />
            </div>
          ))}
        </div>
        <span style={{ textDecoration: "underline", fontWeight: "600", cursor: "pointer" }}>
          71.464 opiniones en
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "800" }}>
          <Star size={15} fill="#00b67a" color="#00b67a" /> Trustpilot
        </span>
      </div>

      <div style={{ width: "1px", height: "24px", background: "#e2e5e9" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#12131a">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.5c4.687 0 8.5 3.813 8.5 8.5 0 1.848-.598 3.559-1.611 4.954l-5.074-13.2A8.442 8.442 0 0 1 12 3.5zm-6.602 4.195c.571-.027 1.111.237 1.393.766L9.61 16.5l-3.23-8.805zm10.742 0l3.076 8.384c.338-.616.554-1.309.627-2.04.148-1.503-.314-2.993-1.282-4.142l-2.421-2.202z" />
        </svg>
        <span>Recomendado por <strong>WordPress.org</strong></span>
      </div>
    </section>
  );
}
