import { useEffect, useRef } from "react";
import { site } from "../data/site.js";

export function Map() {
  const containerRef = useRef(null);

  useEffect(() => {
    let map = null;
    let disposed = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      const el = containerRef.current;
      if (disposed || !el) return;

      const lat = parseFloat(site.geo.latitude);
      const lng = parseFloat(site.geo.longitude);

      map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.divIcon({
        className: "mapPin",
        html: '<div class="mapPinInner"></div>',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -44],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(
          `<a href="${site.mapsDirectionsUrl}" target="_blank" rel="noreferrer"><strong>${site.address}</strong><br/>Cómo llegar ↗</a>`,
          { closeButton: false }
        )
        .openPopup();
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
    };
  }, []);

  return <div ref={containerRef} className="map mapLive" aria-label="Mapa interactivo de la ubicación de Josué Panadería" />;
}
