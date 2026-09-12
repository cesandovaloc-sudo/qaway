import { useState, useEffect } from "react";

const COUNTRIES_REQUIRING_CONSENT = [
  // LATAM
  "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "SV",
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "PR", "UY", "VE",
  // EE. UU.
  "US",
  // Español
  "ES", "GL"
];

export default function PixelConfigPanel() {
  const [accepted, setAccepted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("qaway_cookie_consent") === "accepted";
  });
  const [loadAlways, setLoadAlways] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState(["PageView", "Lead", "AddToCart", "Purchase"]);
  const [country, setCountry] = useState(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => setCountry(d.country_code))
      .catch(() => setCountry("PE"));
  }, []);

  const shouldLoadPixel = loadAlways || (country && !COUNTRIES_REQUIRING_CONSENT.includes(country)) || accepted;

  const toggleEvent = (ev) => {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md">
      <h2 className="text-xl font-semibold mb-4">Configuración de MetaPixel</h2>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={loadAlways}
            onChange={e => setLoadAlways(e.target.checked)}
            className="mr-2"
          />
          Cargar píxel siempre (ignorar consentimiento)
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Si está desmarcado, el píxel se carga sólo cuando el usuario acepte cookies o cuando el país no requiera
          consentimiento explícito.
        </p>
      </div>

      <div className="mb-4">
        <p className="font-medium mb-2">Eventos a rastrear</p>
        {["PageView", "Lead", "AddToCart", "Purchase", "CustomEvent"].map(event => (
          <label key={event} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={selectedEvents.includes(event)}
              onChange={() => toggleEvent(event)}
              className="mr-2"
            />
            {event}
          </label>
        ))}
        {selectedEvents.includes("CustomEvent") && (
          <input
            type="text"
            placeholder="Nombre del evento personalizado"
            className="mt-2 p-1 border rounded w-full"
            onBlur={e => {
              const name = e.target.value.trim();
              if (name && !selectedEvents.includes(name)) {
                setSelectedEvents([...selectedEvents, name]);
              }
            }}
          />
        )}
      </div>

      <div className="text-sm text-gray-600">
        <p>País detectado: {country ?? "…"}</p>
        <p>Se cargará el píxel: {shouldLoadPixel ? "Sí" : "No"}</p>
      </div>
    </div>
  );
}
