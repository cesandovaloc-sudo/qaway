import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./PeruPowerBIMap.css";

const DEFAULT_GEOJSON_URL =
  "https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson";

const STATUS_COLORS = {
  cumple: "#16a36a",
  proceso: "#f59e0b",
  incumple: "#e5484d",
  sinReporte: "#94a3b8",
};

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const getName = (properties = {}) =>
  properties.NOMBDEP ||
  properties.name ||
  properties.NAME_1 ||
  properties.departamento ||
  "Región sin nombre";

const getStatus = (progress) => {
  if (progress === null || progress === undefined || !Number.isFinite(Number(progress))) {
    return "sinReporte";
  }
  if (Number(progress) >= 80) return "cumple";
  if (Number(progress) > 0) return "proceso";
  return "incumple";
};

const formatNumber = (value) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(value);

function makeFeatureCollection(raw, metrics) {
  return {
    ...raw,
    features: raw.features.map((feature, index) => {
      const name = getName(feature.properties);
      const metric = metrics[normalize(name)] ?? null;
      const progress =
        metric?.progress === null || metric?.progress === undefined
          ? null
          : Math.max(0, Math.min(100, Number(metric.progress)));
      const bubbleValue = Math.max(0, Number(metric?.bubbleValue ?? metric?.ugelCount ?? 1));

      return {
        ...feature,
        id: index + 1,
        properties: {
          ...feature.properties,
          _featureId: index + 1,
          _region: name,
          _progress: progress,
          _status: getStatus(progress),
          _bubbleValue: bubbleValue,
          _ugelCount: metric?.ugelCount ?? null,
          _incidents: metric?.incidents ?? 0,
          _compliance: metric?.compliance ?? progress,
          _cutDate: metric?.cutDate ?? "Sin fecha",
        },
      };
    }),
  };
}

/**
 * regionData example:
 * {
 *   JUNIN: {
 *     progress: 38,       // avance porcentual: determina el color
 *     bubbleValue: 13,    // magnitud de la burbuja
 *     ugelCount: 13,
 *     incidents: 4,
 *     compliance: 38,
 *     cutDate: "15 oct. 2026"
 *   }
 * }
 *
 * geojson: preferible importar un GeoJSON oficial/local del proyecto.
 * geojsonUrl: alternativa para cargarlo desde una URL.
 */
export default function PeruPowerBIMap({
  regionData = {},
  geojson,
  geojsonUrl = DEFAULT_GEOJSON_URL,
  bubbleMetric = "bubbleValue",
  title = "Tablero analítico territorial",
  subtitle = "MINEDU · Dotación 2027",
  onRegionSelect,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const selectedIdRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const metrics = useMemo(() => {
    const result = {};
    Object.entries(regionData).forEach(([key, value]) => {
      result[normalize(key)] = value;
    });
    return result;
  }, [regionData]);

  const summary = useMemo(() => {
    const items = Object.values(metrics);
    const reported = items.filter((item) => item?.progress !== null && item?.progress !== undefined);
    const average = reported.length
      ? reported.reduce((sum, item) => sum + Number(item.progress), 0) / reported.length
      : 0;

    return {
      total: items.length,
      cumple: reported.filter((item) => Number(item.progress) >= 80).length,
      proceso: reported.filter((item) => Number(item.progress) > 0 && Number(item.progress) < 80).length,
      incumple: reported.filter((item) => Number(item.progress) === 0).length,
      sinReporte: items.length - reported.length,
      average,
      totalUGEL: items.reduce((sum, item) => sum + Number(item?.ugelCount || 0), 0),
      incidents: items.reduce((sum, item) => sum + Number(item?.incidents || 0), 0),
    };
  }, [metrics]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [-75.2, -9.2],
      zoom: 4,
      minZoom: 3,
      maxZoom: 8,
      maxBounds: [[-83, -20], [-66, 2]],
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const sourceGeoJSON = geojson ?? await (async () => {
          const response = await fetch(geojsonUrl);
          if (!response.ok) throw new Error(`GeoJSON no disponible (${response.status})`);
          return response.json();
        })();

        if (!sourceGeoJSON || sourceGeoJSON.type !== "FeatureCollection") {
          throw new Error("Se requiere un GeoJSON de tipo FeatureCollection.");
        }

        const collection = makeFeatureCollection(sourceGeoJSON, metrics);
        if (cancelled) return;

        const addLayers = () => {
          if (map.getSource("powerbi-regions")) return;

          map.addSource("powerbi-regions", {
            type: "geojson",
            data: collection,
          });

          map.addLayer({
            id: "powerbi-region-fill",
            type: "fill",
            source: "powerbi-regions",
            paint: {
              "fill-color": [
                "match",
                ["get", "_status"],
                "cumple", STATUS_COLORS.cumple,
                "proceso", STATUS_COLORS.proceso,
                "incumple", STATUS_COLORS.incumple,
                STATUS_COLORS.sinReporte,
              ],
              "fill-opacity": 0.12,
            },
          });

          map.addLayer({
            id: "powerbi-region-outline",
            type: "line",
            source: "powerbi-regions",
            paint: { "line-color": "#ffffff", "line-width": 1.1 },
          });

          // Burbujas proporcionales ubicadas en el centroide aproximado de cada departamento.
          // Para análisis UGEL, sustituir por coordenadas reales de cada UGEL.
          const bubbleFeatures = collection.features.map((feature) => {
            const coords = [];
            const visit = (node) => {
              if (!Array.isArray(node)) return;
              if (typeof node[0] === "number" && typeof node[1] === "number") {
                coords.push(node);
              } else {
                node.forEach(visit);
              }
            };
            visit(feature.geometry.coordinates);
            const lng = coords.reduce((sum, p) => sum + p[0], 0) / Math.max(coords.length, 1);
            const lat = coords.reduce((sum, p) => sum + p[1], 0) / Math.max(coords.length, 1);
            return {
              type: "Feature",
              geometry: { type: "Point", coordinates: [lng, lat] },
              properties: { ...feature.properties },
            };
          });

          map.addSource("powerbi-bubbles", {
            type: "geojson",
            data: { type: "FeatureCollection", features: bubbleFeatures },
          });

          map.addLayer({
            id: "powerbi-bubble-circles",
            type: "circle",
            source: "powerbi-bubbles",
            paint: {
              "circle-radius": [
                "interpolate", ["linear"], ["get", "_bubbleValue"],
                0, 5,
                1, 7,
                5, 12,
                10, 17,
                20, 23,
                40, 29,
              ],
              "circle-color": [
                "match",
                ["get", "_status"],
                "cumple", STATUS_COLORS.cumple,
                "proceso", STATUS_COLORS.proceso,
                "incumple", STATUS_COLORS.incumple,
                STATUS_COLORS.sinReporte,
              ],
              "circle-opacity": 0.82,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
              "circle-blur": 0.05,
            },
          });

          map.addLayer({
            id: "powerbi-bubble-labels",
            type: "symbol",
            source: "powerbi-bubbles",
            layout: {
              "text-field": ["get", "_region"],
              "text-size": 10,
              "text-font": ["Open Sans Semibold"],
              "text-offset": [0, 2.2],
              "text-allow-overlap": false,
            },
            paint: {
              "text-color": "#24364b",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.5,
            },
          });

          map.on("mouseenter", "powerbi-bubble-circles", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "powerbi-bubble-circles", () => {
            map.getCanvas().style.cursor = "";
            popupRef.current?.remove();
          });

          map.on("click", "powerbi-bubble-circles", (event) => {
            const feature = event.features?.[0];
            if (!feature) return;
            const p = feature.properties;
            const item = {
              name: p._region,
              progress: p._progress === null ? null : Number(p._progress),
              status: p._status,
              bubbleValue: Number(p._bubbleValue),
              ugelCount: p._ugelCount === null ? null : Number(p._ugelCount),
              incidents: Number(p._incidents),
              compliance: p._compliance === null ? null : Number(p._compliance),
              cutDate: p._cutDate,
            };

            setSelected(item);
            onRegionSelect?.(item);

            const previous = selectedIdRef.current;
            if (previous !== null) {
              map.setFeatureState({ source: "powerbi-regions", id: previous }, { selected: false });
            }
            selectedIdRef.current = p._featureId;
            map.setFeatureState(
              { source: "powerbi-regions", id: p._featureId },
              { selected: true }
            );
          });
        };

        if (map.isStyleLoaded()) addLayers();
        else map.once("style.load", addLayers);

        map.fitBounds([[-81.5, -18.5], [-68.5, 0.5]], {
          padding: { top: 42, right: 48, bottom: 42, left: 48 },
          duration: 0,
        });
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudo cargar el mapa.");
          setLoading(false);
        }
      }
    };

    map.on("load", loadData);

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // Se inicializa una vez; los cambios de datos se aplican en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource("powerbi-regions")) return;

    const update = async () => {
      try {
        const sourceGeoJSON = geojson ?? await (await fetch(geojsonUrl)).json();
        const collection = makeFeatureCollection(sourceGeoJSON, metrics);
        map.getSource("powerbi-regions").setData(collection);

        const bubbleFeatures = collection.features.map((feature) => {
          const coords = [];
          const visit = (node) => {
            if (!Array.isArray(node)) return;
            if (typeof node[0] === "number" && typeof node[1] === "number") coords.push(node);
            else node.forEach(visit);
          };
          visit(feature.geometry.coordinates);
          const lng = coords.reduce((s, p) => s + p[0], 0) / Math.max(coords.length, 1);
          const lat = coords.reduce((s, p) => s + p[1], 0) / Math.max(coords.length, 1);
          return { type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { ...feature.properties } };
        });
        map.getSource("powerbi-bubbles")?.setData({ type: "FeatureCollection", features: bubbleFeatures });
      } catch (err) {
        setError(err.message || "No se pudieron actualizar los datos.");
      }
    };
    update();
  }, [metrics, geojson, geojsonUrl]);

  return (
    <section className="powerbi-territorial">
      <header className="powerbi-territorial__header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="powerbi-territorial__legend">
          {Object.entries(STATUS_COLORS).map(([key, value]) => (
            <span key={key}><i style={{ background: value }} />{key === "cumple" ? "Cumple" : key === "proceso" ? "En proceso" : key === "incumple" ? "No cumple" : "Sin reporte"}</span>
          ))}
        </div>
      </header>

      <div className="powerbi-territorial__body">
        <div className="powerbi-territorial__map-panel">
          <div className="powerbi-territorial__panel-title">
            <strong>Mapa de burbujas territoriales</strong>
            <span>Tamaño = {bubbleMetric === "ugelCount" ? "cantidad de UGEL" : "magnitud del indicador"}</span>
          </div>
          <div className="powerbi-territorial__map-wrap">
            <div ref={containerRef} className="powerbi-territorial__map" />
            {loading && <div className="powerbi-territorial__overlay">Cargando mapa y datos…</div>}
            {error && <div className="powerbi-territorial__error">{error}</div>}
          </div>
          <div className="powerbi-territorial__bubble-key">
            <span><i className="bubble bubble-sm" />Bajo</span>
            <span><i className="bubble bubble-md" />Medio</span>
            <span><i className="bubble bubble-lg" />Alto</span>
            <small>El color representa el estado; el tamaño representa la magnitud.</small>
          </div>
        </div>

        <aside className="powerbi-territorial__analytics">
          <div className="powerbi-territorial__card">
            <div className="powerbi-territorial__card-heading">Distribución territorial</div>
            <div className="powerbi-territorial__distribution">
              {[
                ["Cumplen meta (≥80%)", summary.cumple, STATUS_COLORS.cumple],
                ["En ejecución (1–79%)", summary.proceso, STATUS_COLORS.proceso],
                ["No cumplen (0%)", summary.incumple, STATUS_COLORS.incumple],
                ["Sin reporte", summary.sinReporte, STATUS_COLORS.sinReporte],
              ].map(([label, value, color]) => (
                <div className="powerbi-territorial__dist-row" key={label}>
                  <div><span>{label}</span><strong>{value}</strong></div>
                  <div className="powerbi-territorial__track"><i style={{ width: `${summary.total ? (value / summary.total) * 100 : 0}%`, background: color }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="powerbi-territorial__kpis">
            <div className="powerbi-territorial__card-heading">Indicadores clave</div>
            <div className="powerbi-territorial__kpi-grid">
              <div><strong>{summary.average.toFixed(1)}%</strong><span>Avance promedio regional</span></div>
              <div><strong>{summary.totalUGEL}</strong><span>UGEL registradas</span></div>
              <div><strong>{summary.incidents}</strong><span>Incidencias reportadas</span></div>
              <div><strong>{summary.total}</strong><span>Regiones con datos</span></div>
            </div>
          </div>

          <div className="powerbi-territorial__card powerbi-territorial__selected">
            <div className="powerbi-territorial__card-heading">Detalle de selección</div>
            {selected ? (
              <>
                <strong>{selected.name}</strong>
                <div className="powerbi-territorial__selected-line"><span>Estado</span><b style={{ color: STATUS_COLORS[selected.status] }}>{selected.status === "cumple" ? "Cumple" : selected.status === "proceso" ? "En proceso" : selected.status === "incumple" ? "No cumple" : "Sin reporte"}</b></div>
                <div className="powerbi-territorial__selected-line"><span>Avance</span><b>{selected.progress === null ? "—" : `${selected.progress}%`}</b></div>
                <div className="powerbi-territorial__selected-line"><span>Magnitud de burbuja</span><b>{formatNumber(selected.bubbleValue)}</b></div>
                <div className="powerbi-territorial__selected-line"><span>UGEL</span><b>{selected.ugelCount ?? "—"}</b></div>
                <div className="powerbi-territorial__selected-line"><span>Incidencias</span><b>{selected.incidents}</b></div>
              </>
            ) : (
              <p>Selecciona una burbuja para consultar sus indicadores.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
