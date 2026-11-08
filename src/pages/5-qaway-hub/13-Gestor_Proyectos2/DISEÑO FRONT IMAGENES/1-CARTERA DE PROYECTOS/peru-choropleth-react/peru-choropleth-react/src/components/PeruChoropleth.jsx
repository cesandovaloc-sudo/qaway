import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./PeruChoropleth.css";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson";

const STATUS = {
  cumple: { label: "Cumple", color: "#16a36a" },
  proceso: { label: "En proceso", color: "#f59e0b" },
  incumple: { label: "No cumple", color: "#e5484d" },
  sinReporte: { label: "Sin reporte", color: "#cbd5e1" },
};

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const getRegionName = (properties = {}) =>
  properties.NOMBDEP ||
  properties.name ||
  properties.NAME_1 ||
  properties.departamento ||
  properties.DEPARTAMENTO ||
  "Región sin nombre";

function getStatus(progress) {
  if (progress === null || progress === undefined || Number.isNaN(Number(progress))) {
    return "sinReporte";
  }
  if (Number(progress) >= 80) return "cumple";
  if (Number(progress) > 0) return "proceso";
  return "incumple";
}

/**
 * regionMetrics:
 * {
 *   "JUNIN": { progress: 38, ugel: 13, cumplimiento: 38 },
 *   "LIMA":  { progress: 82, ugel: 9, cumplimiento: 82 }
 * }
 *
 * Las claves pueden llevar tildes o estar en mayúsculas/minúsculas.
 * Los datos del ejemplo de integración deben venir de tu fuente real.
 */
export default function PeruChoropleth({
  regionMetrics = {},
  title = "Cumplimiento por región",
  subtitle = "Perú · 25 departamentos",
  geojsonUrl = GEOJSON_URL,
  onRegionSelect,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedMetrics = useMemo(() => {
    const result = {};
    Object.entries(regionMetrics).forEach(([name, value]) => {
      result[normalize(name)] = value;
    });
    return result;
  }, [regionMetrics]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [-75.2, -9.2],
      zoom: 4.2,
      minZoom: 3.5,
      maxZoom: 8,
      maxBounds: [[-83, -20], [-66, 1]],
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    let disposed = false;

    map.on("load", async () => {
      try {
        setLoading(true);
        const response = await fetch(geojsonUrl);
        if (!response.ok) throw new Error(`No se pudo cargar GeoJSON (${response.status})`);

        const raw = await response.json();
        if (!raw || raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
          throw new Error("El archivo geográfico no tiene un FeatureCollection válido.");
        }

        const features = raw.features.map((feature, index) => {
          const name = getRegionName(feature.properties);
          const metric = normalizedMetrics[normalize(name)] ?? null;
          const progress =
            metric?.progress === null || metric?.progress === undefined
              ? null
              : Math.max(0, Math.min(100, Number(metric.progress)));
          const status = getStatus(progress);

          return {
            ...feature,
            id: index + 1,
            properties: {
              ...feature.properties,
              _mapId: index + 1,
              _regionName: name,
              _progress: progress,
              _status: status,
              _ugelCount: metric?.ugel ?? null,
              _compliance: metric?.cumplimiento ?? progress,
            },
          };
        });

        const geojson = { ...raw, features };
        if (disposed) return;

        map.addSource("peru-regions", {
          type: "geojson",
          data: geojson,
          promoteId: "_mapId",
        });

        map.addLayer({
          id: "peru-regions-fill",
          type: "fill",
          source: "peru-regions",
          paint: {
            "fill-color": [
              "match",
              ["get", "_status"],
              "cumple", STATUS.cumple.color,
              "proceso", STATUS.proceso.color,
              "incumple", STATUS.incumple.color,
              STATUS.sinReporte.color,
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false], 0.92,
              0.78,
            ],
          },
        });

        map.addLayer({
          id: "peru-regions-outline",
          type: "line",
          source: "peru-regions",
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.25,
          },
        });

        map.addLayer({
          id: "peru-regions-selected",
          type: "line",
          source: "peru-regions",
          paint: {
            "line-color": "#123b67",
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false], 3,
              0,
            ],
          },
        });

        map.addLayer({
          id: "peru-regions-labels",
          type: "symbol",
          source: "peru-regions",
          layout: {
            "text-field": ["get", "_regionName"],
            "text-size": 10,
            "text-font": ["Open Sans Semibold"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": "#17324d",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });

        let hoveredId = null;

        map.on("mousemove", "peru-regions-fill", (event) => {
          map.getCanvas().style.cursor = "pointer";
          const feature = event.features?.[0];
          if (!feature) return;

          if (hoveredId !== null) {
            map.setFeatureState({ source: "peru-regions", id: hoveredId }, { hover: false });
          }

          hoveredId = feature.id;
          map.setFeatureState({ source: "peru-regions", id: hoveredId }, { hover: true });

          const p = feature.properties;
          const status = STATUS[p._status] ?? STATUS.sinReporte;
          const content = document.createElement("div");
          content.className = "peru-map-popup";
          const name = document.createElement("strong");
          name.textContent = p._regionName;
          const line = document.createElement("div");
          line.textContent =
            p._progress === null ? "Sin información de avance" : `Avance: ${p._progress}%`;
          const badge = document.createElement("span");
          badge.textContent = status.label;
          badge.style.color = status.color;
          content.append(name, line, badge);

          if (!popupRef.current) {
            popupRef.current = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 12,
            });
          }
          popupRef.current.setLngLat(event.lngLat).setDOMContent(content).addTo(map);
        });

        map.on("mouseleave", "peru-regions-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId !== null) {
            map.setFeatureState({ source: "peru-regions", id: hoveredId }, { hover: false });
          }
          hoveredId = null;
          popupRef.current?.remove();
        });

        map.on("click", "peru-regions-fill", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;

          const p = feature.properties;
          const next = {
            name: p._regionName,
            progress: p._progress,
            status: STATUS[p._status]?.label ?? STATUS.sinReporte.label,
            ugel: p._ugelCount,
            cumplimiento: p._compliance,
            properties: p,
          };

          const previous = selected?.properties?._mapId;
          if (previous !== undefined) {
            map.setFeatureState(
              { source: "peru-regions", id: previous },
              { selected: false }
            );
          }
          map.setFeatureState(
            { source: "peru-regions", id: feature.id },
            { selected: true }
          );

          setSelected(next);
          onRegionSelect?.(next);
        });

        // Encuadra el territorio peruano sin deformar la geometría.
        map.fitBounds([[-81.5, -18.5], [-68.5, 0.5]], {
          padding: { top: 36, right: 36, bottom: 36, left: 36 },
          duration: 0,
        });
        setLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err.message || "Ocurrió un error al cargar el mapa.");
          setLoading(false);
        }
      }
    });

    return () => {
      disposed = true;
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // El mapa se inicializa una sola vez; los datos se pasan al montarlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualiza los colores si llegan métricas nuevas desde la aplicación.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource("peru-regions")) return;

    fetch(geojsonUrl)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo actualizar el GeoJSON.");
        return response.json();
      })
      .then((raw) => {
        const features = raw.features.map((feature, index) => {
          const name = getRegionName(feature.properties);
          const metric = normalizedMetrics[normalize(name)] ?? null;
          const progress =
            metric?.progress === null || metric?.progress === undefined
              ? null
              : Math.max(0, Math.min(100, Number(metric.progress)));

          return {
            ...feature,
            id: index + 1,
            properties: {
              ...feature.properties,
              _mapId: index + 1,
              _regionName: name,
              _progress: progress,
              _status: getStatus(progress),
              _ugelCount: metric?.ugel ?? null,
              _compliance: metric?.cumplimiento ?? progress,
            },
          };
        });
        map.getSource("peru-regions")?.setData({ ...raw, features });
      })
      .catch((err) => setError(err.message));
  }, [normalizedMetrics, geojsonUrl]);

  const counts = useMemo(() => {
    const values = Object.values(normalizedMetrics);
    return values.reduce(
      (acc, item) => {
        const status = getStatus(item?.progress);
        acc[status] += 1;
        return acc;
      },
      { cumple: 0, proceso: 0, incumple: 0, sinReporte: 0 }
    );
  }, [normalizedMetrics]);

  return (
    <section className="peru-choropleth">
      <header className="peru-choropleth__header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="peru-choropleth__legend" aria-label="Leyenda de cumplimiento">
          {Object.entries(STATUS).map(([key, item]) => (
            <span key={key}>
              <i style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </header>

      <div className="peru-choropleth__summary">
        <div><strong>{counts.cumple}</strong><span>Cumplen</span></div>
        <div><strong>{counts.proceso}</strong><span>En proceso</span></div>
        <div><strong>{counts.incumple}</strong><span>No cumplen</span></div>
        <div><strong>{counts.sinReporte}</strong><span>Sin reporte</span></div>
      </div>

      <div className="peru-choropleth__map-wrap">
        <div ref={mapContainer} className="peru-choropleth__map" />
        {loading && <div className="peru-choropleth__overlay">Cargando límites geográficos del Perú…</div>}
        {error && <div className="peru-choropleth__error">{error}</div>}
      </div>

      <footer className="peru-choropleth__footer">
        <div className="peru-choropleth__selected">
          {selected ? (
            <>
              <strong>{selected.name}</strong>
              <span>{selected.status}</span>
              <span>{selected.progress === null ? "Sin avance reportado" : `${selected.progress}% de avance`}</span>
              {selected.ugel !== null && <span>{selected.ugel} UGEL</span>}
            </>
          ) : (
            <span>Selecciona un departamento para consultar su información.</span>
          )}
        </div>
        <small>Cartografía departamental · Fuente GeoJSON indicada en la documentación</small>
      </footer>
    </section>
  );
}
