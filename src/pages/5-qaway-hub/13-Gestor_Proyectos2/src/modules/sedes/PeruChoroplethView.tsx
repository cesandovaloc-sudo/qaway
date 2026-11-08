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
  p.NOMBDEP || p.name || p.NAME_1 || p.departamento || p.DEPARTAMENTO || 'Región sin nombre';

const getStatus = (value) =>
  value == null ? 'sinReporte' : Number(value) >= 80 ? 'cumple' : Number(value) > 0 ? 'proceso' : 'incumple';

const colors = {
  cumple: '#16a36a',
  proceso: '#f59e0b',
  incumple: '#e5484d',
  sinReporte: '#94a3b8',
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
      const metric = metrics[normalize(name)];
      const progress = metric ? Math.round(metric.sum / metric.total) : null;
      return {
        ...feature,
        id: index + 1,
        properties: {
          ...feature.properties,
          _mapId: index + 1,
          _regionName: name,
          _progress: progress,
          _status: getStatus(progress),
          _ugelCount: metric?.total || 0,
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
        zoom: 4.5,
        minZoom: 3.5,
        maxZoom: 9,
        maxBounds: [
          [-84, -21],
          [-65, 2],
        ],
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;

      const setupLayers = () => {
        if (!map.getSource('peru-regions')) {
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
              'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.92, 0.76],
            },
          });

          map.addLayer({
            id: 'peru-regions-outline',
            type: 'line',
            source: 'peru-regions',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1.5,
            },
          });

          map.addLayer({
            id: 'peru-regions-labels',
            type: 'symbol',
            source: 'peru-regions',
            layout: {
              'text-field': ['get', '_regionName'],
              'text-size': 10.5,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            },
            paint: {
              'text-color': '#0f172a',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.5,
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
        }
        setTimeout(() => map.resize(), 100);
      };

      if (map.loaded()) {
        setupLayers();
      } else {
        map.once('load', setupLayers);
      }
    } else {
      // Si el mapa ya existe, actualizamos la fuente de datos en vivo sin destruir el mapa
      const source = mapRef.current.getSource('peru-regions');
      if (source) {
        source.setData(geoJsonData);
      }
      setTimeout(() => mapRef.current?.resize(), 60);
    }
  }, [geoJsonData, onRegionSelect]);

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
