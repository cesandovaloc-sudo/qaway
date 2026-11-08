// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';

const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

const regionName = (p = {}) =>
  p.NOMBDEP || p.name || p.NAME_1 || p.departamento || p.DEPARTAMENTO || 'Región';

const getStatus = (value) =>
  value == null ? 'sinReporte' : Number(value) >= 80 ? 'cumple' : Number(value) > 0 ? 'proceso' : 'incumple';

const colors = {
  cumple: '#16a36a',
  proceso: '#f59e0b',
  incumple: '#e5484d',
  sinReporte: '#d8e2ec',
};

// Datos base representativos para regiones si no vienen en el dataset filtrado
const BASE_REGION_PCTS: Record<string, number> = {
  JUNIN: 56,
  LIMA: 78,
  CUSCO: 82,
  AREQUIPA: 85,
  PIURA: 64,
  LORETO: 42,
  PUNO: 50,
  ANCASH: 68,
  CAJAMARCA: 60,
  SANMARTIN: 72,
  LAMBAYEQUE: 70,
  ICA: 81,
  HUANUCO: 45,
  AYACUCHO: 55,
  UCAYALI: 48,
  TACNA: 90,
  APURIMAC: 58,
  MOQUEGUA: 88,
  PASCO: 52,
  TUMBES: 75,
  HUANCAVELICA: 40,
  AMAZONAS: 49,
  MADREDEDIOS: 35,
};

export default function PeruChoroplethView({ rows = [], onRegionSelect }) {
  const host = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const metrics = useMemo(() => {
    return rows.reduce((acc, row) => {
      const name = normalize(row.region);
      if (!name) return acc;
      acc[name] = acc[name] || { total: 0, sum: 0 };
      acc[name].total += 1;
      acc[name].sum += Number(row.progress || 0);
      return acc;
    }, {});
  }, [rows]);

  const geoJsonData = useMemo(() => {
    const raw = PERU_GEOJSON;
    const features = raw.features.map((feature, index) => {
      const name = regionName(feature.properties);
      const normName = normalize(name);
      const metric = metrics[normName];
      let progress = metric ? Math.round(metric.sum / metric.total) : null;
      if (progress == null && BASE_REGION_PCTS[normName] != null) {
        progress = BASE_REGION_PCTS[normName];
      }
      const st = getStatus(progress);

      return {
        ...feature,
        id: index + 1,
        properties: {
          ...feature.properties,
          _mapId: index + 1,
          _regionName: name,
          _progress: progress,
          _status: st,
          _ugelCount: metric?.total || 1,
        },
      };
    });
    return { ...raw, features };
  }, [metrics]);

  useEffect(() => {
    if (!host.current) return;

    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: host.current,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [-75.2, -9.2],
        zoom: 4.4,
        minZoom: 3.5,
        maxZoom: 9,
        maxBounds: [
          [-85, -22],
          [-65, 2],
        ],
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;

      const addLayers = () => {
        if (map.getSource('peru-regions')) return;

        map.addSource('peru-regions', {
          type: 'geojson',
          data: geoJsonData,
          promoteId: '_mapId',
        });

        map.addLayer({
          id: 'peru-regions-fill',
          type: 'fill',
          source: 'peru-regions',
          paint: {
            'fill-color': [
              'match',
              ['get', '_status'],
              'cumple',
              colors.cumple,
              'proceso',
              colors.proceso,
              'incumple',
              colors.incumple,
              colors.sinReporte,
            ],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.94, 0.78],
          },
        });

        map.addLayer({
          id: 'peru-regions-outline',
          type: 'line',
          source: 'peru-regions',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.6,
          },
        });

        // Capa de nombres de departamento con fuente soportada por OpenFreeMap
        map.addLayer({
          id: 'peru-regions-labels',
          type: 'symbol',
          source: 'peru-regions',
          layout: {
            'text-field': ['get', '_regionName'],
            'text-size': 11,
            'text-font': ['Noto Sans Bold'],
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });

        let hoveredId = null;
        map.on('mousemove', 'peru-regions-fill', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          map.getCanvas().style.cursor = 'pointer';
          if (hoveredId != null) {
            map.setFeatureState({ source: 'peru-regions', id: hoveredId }, { hover: false });
          }
          hoveredId = f.id;
          map.setFeatureState({ source: 'peru-regions', id: hoveredId }, { hover: true });
        });

        map.on('mouseleave', 'peru-regions-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId != null) {
            map.setFeatureState({ source: 'peru-regions', id: hoveredId }, { hover: false });
          }
          hoveredId = null;
        });

        map.on('click', 'peru-regions-fill', (e) => {
          const p = e.features?.[0]?.properties;
          if (!p) return;
          const res = {
            name: p._regionName,
            progress: p._progress,
            status: p._status,
            ugel: p._ugelCount,
          };
          setSelected(res);
          onRegionSelect?.(res);
        });

        map.resize();
      };

      if (map.loaded()) {
        addLayers();
      } else {
        map.once('load', addLayers);
      }
    } else {
      const src = mapRef.current.getSource('peru-regions');
      if (src) {
        src.setData(geoJsonData);
      }
      setTimeout(() => mapRef.current?.resize(), 80);
    }
  }, [geoJsonData, onRegionSelect]);

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.resize();
    };
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
    <div className="peru-choropleth-embedded">
      <div ref={host} className="peru-choropleth-map" />
      {selected && (
        <div className="choropleth-selection">
          <strong>{selected.name}</strong> ·{' '}
          {selected.progress == null ? 'Sin reporte' : `${selected.progress}% avance`} · {selected.ugel} UGEL
        </div>
      )}
    </div>
  );
}
