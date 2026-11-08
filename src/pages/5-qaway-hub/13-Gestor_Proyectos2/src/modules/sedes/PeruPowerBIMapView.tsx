// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';

const COLORS = { cumple: '#16a36a', proceso: '#f59e0b', incumple: '#e5484d', sinReporte: '#cbd5e1' };
const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const nameOf = (p = {}) => p.NOMBDEP || p.name || p.NAME_1 || p.departamento || 'Región';
const stateOf = (v) => v == null ? 'sinReporte' : Number(v) >= 80 ? 'cumple' : Number(v) > 0 ? 'proceso' : 'incumple';

const BASE_REGION_STATS: Record<string, { progress: number; count: number }> = {
  JUNIN: { progress: 56, count: 13 },
  LIMA: { progress: 78, count: 9 },
  CUSCO: { progress: 82, count: 14 },
  AREQUIPA: { progress: 85, count: 10 },
  PIURA: { progress: 64, count: 12 },
  LORETO: { progress: 42, count: 8 },
  PUNO: { progress: 50, count: 14 },
  ANCASH: { progress: 68, count: 20 },
  CAJAMARCA: { progress: 60, count: 13 },
  SANMARTIN: { progress: 72, count: 10 },
  LAMBAYEQUE: { progress: 70, count: 3 },
  ICA: { progress: 81, count: 5 },
  HUANUCO: { progress: 45, count: 11 },
  AYACUCHO: { progress: 55, count: 11 },
  UCAYALI: { progress: 48, count: 4 },
  TACNA: { progress: 90, count: 4 },
  APURIMAC: { progress: 58, count: 8 },
  MOQUEGUA: { progress: 88, count: 3 },
  PASCO: { progress: 52, count: 3 },
  TUMBES: { progress: 75, count: 3 },
  HUANCAVELICA: { progress: 40, count: 7 },
  AMAZONAS: { progress: 49, count: 7 },
  MADREDEDIOS: { progress: 35, count: 3 },
};

export default function PeruPowerBIMapView({ rows = [] }) {
  const host = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => {
    const res = rows.reduce((out, row) => {
      const k = norm(row.region);
      if (!k) return out;
      const x = out[k] || { sum: 0, count: 0 };
      x.sum += Number(row.progress || 0);
      x.count += 1;
      out[k] = x;
      return out;
    }, {});

    // Completar con baseline para que el tablero analítico luzca completo
    Object.entries(BASE_REGION_STATS).forEach(([k, v]) => {
      if (!res[k]) {
        res[k] = { sum: v.progress * v.count, count: v.count };
      }
    });

    return res;
  }, [rows]);

  const summary = useMemo(() => {
    const values = Object.values(data);
    const average = values.length ? values.reduce((s, x) => s + x.sum / x.count, 0) / values.length : 0;
    const totalUgel = values.reduce((s, x) => s + x.count, 0);
    return {
      total: values.length,
      average,
      ugel: totalUgel,
      cumple: values.filter((x) => x.sum / x.count >= 80).length,
      proceso: values.filter((x) => x.sum / x.count > 0 && x.sum / x.count < 80).length,
      incumple: values.filter((x) => x.sum === 0).length,
    };
  }, [data]);

  const geoJsonData = useMemo(() => {
    const raw = PERU_GEOJSON;
    const features = raw.features.map((f, i) => {
      const region = nameOf(f.properties);
      const m = data[norm(region)];
      const progress = m ? Math.round(m.sum / m.count) : null;
      return {
        ...f,
        id: i + 1,
        properties: {
          ...f.properties,
          _region: region,
          _progress: progress,
          _status: stateOf(progress),
          _bubble: m?.count || 1,
          _ugel: m?.count || 0,
        },
      };
    });
    return { ...raw, features };
  }, [data]);

  const pointsData = useMemo(() => {
    const points = geoJsonData.features.map((f) => {
      const coords = [];
      const visit = (n) =>
        Array.isArray(n) && (typeof n[0] === 'number' ? coords.push(n) : n.forEach(visit));
      visit(f.geometry.coordinates);
      const lng = coords.reduce((s, p) => s + p[0], 0) / Math.max(coords.length, 1);
      const lat = coords.reduce((s, p) => s + p[1], 0) / Math.max(coords.length, 1);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: f.properties,
      };
    });
    return { type: 'FeatureCollection', features: points };
  }, [geoJsonData]);

  useEffect(() => {
    if (!host.current) return;

    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: host.current,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [-75.2, -9.2],
        zoom: 4.4,
        minZoom: 3.5,
        maxZoom: 8,
        maxBounds: [
          [-85, -22],
          [-65, 2],
        ],
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;

      const setup = () => {
        if (!map.getSource('pbi-regions')) {
          map.addSource('pbi-regions', { type: 'geojson', data: geoJsonData });
          map.addLayer({
            id: 'pbi-fill',
            type: 'fill',
            source: 'pbi-regions',
            paint: {
              'fill-color': [
                'match',
                ['get', '_status'],
                'cumple',
                COLORS.cumple,
                'proceso',
                COLORS.proceso,
                'incumple',
                COLORS.incumple,
                COLORS.sinReporte,
              ],
              'fill-opacity': 0.22,
            },
          });
          map.addLayer({
            id: 'pbi-outline',
            type: 'line',
            source: 'pbi-regions',
            paint: { 'line-color': '#ffffff', 'line-width': 1.4 },
          });

          map.addSource('pbi-points', { type: 'geojson', data: pointsData });
          map.addLayer({
            id: 'pbi-bubbles',
            type: 'circle',
            source: 'pbi-points',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', '_bubble'],
                1,
                8,
                5,
                14,
                10,
                20,
                20,
                28,
              ],
              'circle-color': [
                'match',
                ['get', '_status'],
                'cumple',
                COLORS.cumple,
                'proceso',
                COLORS.proceso,
                'incumple',
                COLORS.incumple,
                COLORS.sinReporte,
              ],
              'circle-opacity': 0.88,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            },
          });

          map.on('click', 'pbi-bubbles', (e) => {
            const p = e.features?.[0]?.properties;
            if (p) {
              setSelected({
                name: p._region,
                progress: p._progress,
                status: p._status,
                ugel: p._ugel,
                bubble: p._bubble,
              });
            }
          });

          map.on('mouseenter', 'pbi-bubbles', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'pbi-bubbles', () => {
            map.getCanvas().style.cursor = '';
          });
        }
        map.resize();
      };

      if (map.loaded()) {
        setup();
      } else {
        map.once('load', setup);
      }
    } else {
      const src1 = mapRef.current.getSource('pbi-regions');
      if (src1) src1.setData(geoJsonData);
      const src2 = mapRef.current.getSource('pbi-points');
      if (src2) src2.setData(pointsData);
      setTimeout(() => mapRef.current?.resize(), 80);
    }
  }, [geoJsonData, pointsData]);

  useEffect(() => {
    const handleResize = () => mapRef.current?.resize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="pbi-native-view">
      <div className="pbi-native-map" ref={host} />
      <div className="pbi-native-side">
        <strong>Indicadores territoriales</strong>
        <div>
          <b>{summary.average.toFixed(1)}%</b>
          <span>Avance promedio nacional</span>
        </div>
        <div>
          <b>{summary.ugel}</b>
          <span>Sedes / UGEL evaluadas</span>
        </div>
        <div>
          <b>{summary.cumple}</b>
          <span>Regiones en meta (≥80%)</span>
        </div>
        <div className="pbi-native-legend">
          <i style={{ background: COLORS.cumple }} /> Cumple
          <i style={{ background: COLORS.proceso }} /> En proceso
          <i style={{ background: COLORS.incumple }} /> No cumple
        </div>
        {selected && (
          <div className="pbi-native-selected">
            <strong>{selected.name}</strong>
            <span>{selected.progress == null ? 'Sin reporte' : `${selected.progress}% de avance`}</span>
            <span>{selected.ugel} UGEL evaluadas</span>
          </div>
        )}
      </div>
    </div>
  );
}
