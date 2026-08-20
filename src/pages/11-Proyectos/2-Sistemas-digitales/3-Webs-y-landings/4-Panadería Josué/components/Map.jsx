import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { site } from "../data/site.js";

export function Map() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lat = parseFloat(site.geo.latitude);
    const lng = parseFloat(site.geo.longitude);

    const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
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

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="mapLive" aria-label="Mapa interactivo de la ubicación de Josué Panadería" />;
}
