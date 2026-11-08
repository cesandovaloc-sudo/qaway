// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const GEOJSON_URL = 'https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson';
const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const regionName = (p = {}) => p.NOMBDEP || p.name || p.NAME_1 || p.departamento || p.DEPARTAMENTO || 'Región sin nombre';
const status = (value) => value == null ? 'sinReporte' : Number(value) >= 80 ? 'cumple' : Number(value) > 0 ? 'proceso' : 'incumple';
const colors = { cumple: '#16a36a', proceso: '#f59e0b', incumple: '#e5484d', sinReporte: '#94a3b8' };

export default function PeruChoroplethView({ rows = [], onRegionSelect }) {
  const host = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const metrics = useMemo(() => rows.reduce((acc, row) => {
    const name = normalize(row.region);
    if (!name) return acc;
    acc[name] = acc[name] || { total: 0, sum: 0 };
    acc[name].total += 1;
    acc[name].sum += Number(row.progress || 0);
    return acc;
  }, {}), [rows]);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: host.current, style: 'https://tiles.openfreemap.org/styles/bright', center: [-75.2, -9.2], zoom: 4.2, minZoom: 3.5, maxZoom: 8, maxBounds: [[-83, -20], [-66, 1]] });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    let disposed = false;
    map.on('load', async () => {
      try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) throw new Error(`No se pudo cargar GeoJSON (${response.status})`);
        const raw = await response.json();
        const features = raw.features.map((feature, index) => {
          const name = regionName(feature.properties);
          const metric = metrics[normalize(name)];
          const progress = metric ? Math.round(metric.sum / metric.total) : null;
          return { ...feature, id: index + 1, properties: { ...feature.properties, _mapId: index + 1, _regionName: name, _progress: progress, _status: status(progress), _ugelCount: metric?.total || 0 } };
        });
        if (disposed) return;
        map.addSource('peru-regions', { type: 'geojson', data: { ...raw, features }, promoteId: '_mapId' });
        map.addLayer({ id: 'peru-regions-fill', type: 'fill', source: 'peru-regions', paint: { 'fill-color': ['match', ['get', '_status'], 'cumple', colors.cumple, 'proceso', colors.proceso, 'incumple', colors.incumple, colors.sinReporte], 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.92, 0.78] } });
        map.addLayer({ id: 'peru-regions-outline', type: 'line', source: 'peru-regions', paint: { 'line-color': '#fff', 'line-width': 1.25 } });
        map.addLayer({ id: 'peru-regions-labels', type: 'symbol', source: 'peru-regions', layout: { 'text-field': ['get', '_regionName'], 'text-size': 10 }, paint: { 'text-color': '#17324d', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } });
        let hovered;
        map.on('mousemove', 'peru-regions-fill', (event) => { const f = event.features?.[0]; if (!f) return; map.getCanvas().style.cursor = 'pointer'; if (hovered) map.setFeatureState({ source: 'peru-regions', id: hovered }, { hover: false }); hovered = f.id; map.setFeatureState({ source: 'peru-regions', id: hovered }, { hover: true }); });
        map.on('mouseleave', 'peru-regions-fill', () => { map.getCanvas().style.cursor = ''; if (hovered) map.setFeatureState({ source: 'peru-regions', id: hovered }, { hover: false }); hovered = null; });
        map.on('click', 'peru-regions-fill', (event) => { const p = event.features?.[0]?.properties; if (!p) return; const result = { name: p._regionName, progress: p._progress, status: p._status, ugel: p._ugelCount }; setSelected(result); onRegionSelect?.(result); });
        map.fitBounds([[-81.5, -18.5], [-68.5, 0.5]], { padding: 30, duration: 0 });
      } catch (err) { if (!disposed) setError(err.message); }
    });
    return () => { disposed = true; map.remove(); mapRef.current = null; };
  }, [metrics, onRegionSelect]);

  return <div className="peru-choropleth-embedded"><div ref={host} className="peru-choropleth-map" />{error && <div className="map-data-note">{error}</div>}{selected && <div className="choropleth-selection"><strong>{selected.name}</strong> · {selected.progress == null ? 'Sin reporte' : `${selected.progress}%`} · {selected.ugel} UGEL</div>}</div>;
}
