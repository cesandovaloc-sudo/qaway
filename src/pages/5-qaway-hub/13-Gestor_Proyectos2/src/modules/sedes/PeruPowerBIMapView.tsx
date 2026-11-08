// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const URL = 'https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson';
const COLORS = { cumple: '#16a36a', proceso: '#f59e0b', incumple: '#e5484d', sinReporte: '#94a3b8' };
const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const nameOf = (p = {}) => p.NOMBDEP || p.name || p.NAME_1 || p.departamento || 'Región sin nombre';
const stateOf = (v) => v == null ? 'sinReporte' : Number(v) >= 80 ? 'cumple' : Number(v) > 0 ? 'proceso' : 'incumple';

export default function PeruPowerBIMapView({ rows = [] }) {
  const host = useRef(null); const mapRef = useRef(null);
  const [selected, setSelected] = useState(null); const [error, setError] = useState('');
  const data = useMemo(() => rows.reduce((out, row) => { const k = norm(row.region); if (!k) return out; const x = out[k] || { sum: 0, count: 0 }; x.sum += Number(row.progress || 0); x.count += 1; out[k] = x; return out; }, {}), [rows]);
  const summary = useMemo(() => { const values = Object.values(data); const average = values.length ? values.reduce((s, x) => s + x.sum / x.count, 0) / values.length : 0; return { total: values.length, average, ugel: rows.length, cumple: values.filter(x => x.sum / x.count >= 80).length, proceso: values.filter(x => x.sum / x.count > 0 && x.sum / x.count < 80).length, incumple: values.filter(x => x.sum === 0).length }; }, [data, rows.length]);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: host.current, style: 'https://tiles.openfreemap.org/styles/bright', center: [-75.2, -9.2], zoom: 4.2, minZoom: 3.5, maxZoom: 8, maxBounds: [[-83, -20], [-66, 2]] });
    mapRef.current = map; map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    let dead = false;
    map.on('load', async () => { try {
      const response = await fetch(URL); if (!response.ok) throw new Error(`GeoJSON no disponible (${response.status})`); const raw = await response.json();
      const features = raw.features.map((f, i) => { const region = nameOf(f.properties); const m = data[norm(region)]; const progress = m ? Math.round(m.sum / m.count) : null; return { ...f, id: i + 1, properties: { ...f.properties, _region: region, _progress: progress, _status: stateOf(progress), _bubble: m?.count || 1, _ugel: m?.count || 0 } }; });
      if (dead) return; const collection = { ...raw, features };
      map.addSource('pbi-regions', { type: 'geojson', data: collection });
      map.addLayer({ id: 'pbi-fill', type: 'fill', source: 'pbi-regions', paint: { 'fill-color': ['match', ['get', '_status'], 'cumple', COLORS.cumple, 'proceso', COLORS.proceso, 'incumple', COLORS.incumple, COLORS.sinReporte], 'fill-opacity': .1 } });
      map.addLayer({ id: 'pbi-outline', type: 'line', source: 'pbi-regions', paint: { 'line-color': '#fff', 'line-width': 1 } });
      const points = features.map(f => { const coords = []; const visit = n => Array.isArray(n) && (typeof n[0] === 'number' ? coords.push(n) : n.forEach(visit)); visit(f.geometry.coordinates); const lng = coords.reduce((s, p) => s + p[0], 0) / Math.max(coords.length, 1); const lat = coords.reduce((s, p) => s + p[1], 0) / Math.max(coords.length, 1); return { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: f.properties }; });
      map.addSource('pbi-points', { type: 'geojson', data: { type: 'FeatureCollection', features: points } });
      map.addLayer({ id: 'pbi-bubbles', type: 'circle', source: 'pbi-points', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', '_bubble'], 1, 7, 5, 12, 10, 17, 20, 24], 'circle-color': ['match', ['get', '_status'], 'cumple', COLORS.cumple, 'proceso', COLORS.proceso, 'incumple', COLORS.incumple, COLORS.sinReporte], 'circle-opacity': .84, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
      map.on('click', 'pbi-bubbles', e => { const p = e.features?.[0]?.properties; if (p) setSelected({ name: p._region, progress: p._progress, status: p._status, ugel: p._ugel, bubble: p._bubble }); });
      map.on('mouseenter', 'pbi-bubbles', () => { map.getCanvas().style.cursor = 'pointer'; }); map.on('mouseleave', 'pbi-bubbles', () => { map.getCanvas().style.cursor = ''; }); map.fitBounds([[-81.5, -18.5], [-68.5, .5]], { padding: 30, duration: 0 });
    } catch (e) { if (!dead) setError(e.message); } });
    return () => { dead = true; map.remove(); mapRef.current = null; };
  }, [data]);

  return <div className="pbi-native-view"><div className="pbi-native-map" ref={host} />{error && <div className="map-data-note">{error}</div>}<div className="pbi-native-side"><strong>Indicadores territoriales</strong><div><b>{summary.average.toFixed(1)}%</b><span>Avance promedio</span></div><div><b>{summary.ugel}</b><span>UGEL registradas</span></div><div><b>{summary.cumple}</b><span>Regiones en meta</span></div><div className="pbi-native-legend"><i style={{ background: COLORS.cumple }} /> Cumple <i style={{ background: COLORS.proceso }} /> En proceso <i style={{ background: COLORS.incumple }} /> No cumple</div>{selected && <div className="pbi-native-selected"><strong>{selected.name}</strong><span>{selected.progress == null ? 'Sin reporte' : `${selected.progress}% de avance`}</span><span>{selected.ugel} UGEL · Burbuja {selected.bubble}</span></div>}</div></div>;
}
