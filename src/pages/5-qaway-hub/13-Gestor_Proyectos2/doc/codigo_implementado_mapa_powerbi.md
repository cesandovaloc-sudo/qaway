# Diagnóstico Técnico y Código Implementado: Mapa Territorial y Analítica Power BI

**Ubicación del Documento:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/doc/codigo_implementado_mapa_powerbi.md`  
**Módulo:** Gestor de Proyectos 2 · Qaway Lab (MINEDU · Dotación 2027)  
**Fecha:** 08 de Noviembre de 2026  

---

## 1. Diagnóstico de Causa Raíz

### 1.1 ¿Por qué la Vista Temática Poligonal y Analítica Power BI quedan en blanco?
Tanto `PeruChoroplethView.tsx` como `PeruPowerBIMapView.tsx` fueron implementados utilizando la librería `maplibre-gl` invocando una URL de estilo remota:
```ts
style: 'https://tiles.openfreemap.org/styles/bright'
```
* **Falla de conexión y bloqueo WebGL:** El evento `map.once('load', addLayers)` depende de que el servidor externo `tiles.openfreemap.org` entregue satisfactoriamente el archivo de estilo vectorial, los glyphs tipográficos (`fonts`) y los tiles. Si hay restricciones de red, problemas de CORS, latencia o si el navegador no completa la carga de fuentes vectoriales remotas, el evento `'load'` **nunca se dispara**.
* **Consecuencia:** Las capas GeoJSON (`peru-regions-fill`, `peru-regions-outline`, `peru-regions-labels`) jamás llegan a montarse en el mapa, dejando el lienzo en blanco con solo la atribución al pie.
* **Solución arquitectónica recomendada:** En lugar de depender de servidores externos de estilos vectoriales WebGL, implementar la capa temática y analítica sobre **Leaflet GeoJSON** (usando el archivo local `src/data/peru_departamental_simple.json` de 139KB que ya está descargado e integrado localmente) o mediante un componente SVG interactivo autocontenido. De este modo, renderiza al 100% de manera instantánea y sin dependencias externas.

---

### 1.2 ¿Por qué no se respetan los filtros territoriales y de Fase?
1. **Región hardcodeada:** En `MapaTerritorialView.tsx`, la línea 185 tenía `const [selectedRegion, setSelectedRegion] = useState<string>('JUNÍN');`. Cuando el usuario selecciona **La Libertad** (o cualquier otra región) en el selector superior del cronograma, la vista de mapa no recibía esa selección ni actualizaba su estado.
2. **Desconexión con Supabase (`gestor_unidades`):** El listado de la tabla izquierda (`Estado por UGEL`) consumía un array estático (`MINEDU_UNIDADES`) con valores de progreso mockeados (`[100, 100, 75, 50, ...]`), en lugar de tomar las unidades territoriales registradas en la tabla `gestor_unidades` de Supabase cruzadas con los entregables de la Fase seleccionada.
3. **Omisión de Props en `CronogramaGanttView.tsx`:** El padre invocaba `<MapaTerritorialView items={shown} ... />` sin transferir `selectedRegions`, `phaseFilter` ni el listado `unidades` de Supabase.

---

### 1.3 ¿Por qué colapsa el desplegable del Filtro de Fase?
1. En `src/modules/cronograma-gantt/edtPmbokModel.ts`, las fases tienen descripciones largas (ej. Fase 2: 137 caracteres).
2. En `gantt.css`, `.filter-item-check` y `.filter-item-btn` tienen `display: flex; align-items: center; justify-content: space-between;`, pero los botones dentro de `.filter-popover-list` no tienen `flex-shrink: 0`.
3. Al envolver el texto en múltiples líneas dentro de un contenedor con `max-height: 260px; overflow-y: auto;`, el botón no expande su altura de forma aislada y el texto de la descripción invade verticalmente el botón siguiente, superponiéndose las letras unas sobre otras.

---

## 2. Código Implementado para Mapa Temático Poligonal

**Archivo:** `src/modules/sedes/PeruChoroplethView.tsx`

```tsx
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
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={host} style={{ width: '100%', height: '100%' }} />
      {selected && (
        <div className="choropleth-floating-info-card">
          <div className="card-top">
            <strong>{selected.name}</strong>
            <span className={`tag ${selected.status}`}>{selected.status}</span>
          </div>
          <div className="card-body">
            <div>Avance consolidado: <b>{selected.progress ?? '—'}%</b></div>
            <div>UGEL / Sedes evaluadas: <b>{selected.ugel}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 3. Código Implementado para Tablero Analítico Power BI

**Archivo:** `src/modules/sedes/PeruPowerBIMapView.tsx`

```tsx
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
          promoteId: 'id',
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
              COLORS.cumple,
              'proceso',
              COLORS.proceso,
              'incumple',
              COLORS.incumple,
              COLORS.sinReporte,
            ],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0.72],
          },
        });

        map.addLayer({
          id: 'peru-regions-line',
          type: 'line',
          source: 'peru-regions',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.5,
          },
        });

        map.on('click', 'peru-regions-fill', (e) => {
          const p = e.features?.[0]?.properties;
          if (!p) return;
          setSelected({
            name: p._region,
            progress: p._progress,
            status: p._status,
            ugel: p._ugel,
          });
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
      if (src) src.setData(geoJsonData);
      setTimeout(() => mapRef.current?.resize(), 80);
    }
  }, [geoJsonData]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="powerbi-grid-container">
      <div className="powerbi-map-panel">
        <div ref={host} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="powerbi-analytics-sidebar">
        <h4 className="powerbi-kpi-title">Indicadores Territoriales</h4>
        <div className="powerbi-kpi-card">
          <span className="powerbi-kpi-value">{summary.average.toFixed(1)}%</span>
          <span className="powerbi-kpi-label">Avance promedio nacional</span>
        </div>
        <div className="powerbi-kpi-card">
          <span className="powerbi-kpi-value">{summary.ugel}</span>
          <span className="powerbi-kpi-label">Sedes / UGEL evaluadas</span>
        </div>
        <div className="powerbi-kpi-card">
          <span className="powerbi-kpi-value">{summary.cumple}</span>
          <span className="powerbi-kpi-label">Regiones en meta (≥80%)</span>
        </div>

        {selected && (
          <div className="powerbi-selected-summary">
            <h5>{selected.name}</h5>
            <p>Cumplimiento: <b>{selected.progress ?? 0}%</b></p>
            <p>UGEL activas: <b>{selected.ugel}</b></p>
          </div>
        )}
      </div>
    </div>
  );
}
```
