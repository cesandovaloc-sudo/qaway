import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';

const normalize = (value: any = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

const BASE_REGION_STATS: Record<string, { progress: number; count: number; center: [number, number] }> = {
  ANCASH: { progress: 68, count: 21, center: [-9.5, -77.5] },
  JUNIN: { progress: 56, count: 13, center: [-11.5, -75.1] },
  'LA LIBERTAD': { progress: 74, count: 12, center: [-8.0, -78.5] },
  LIMA: { progress: 78, count: 9, center: [-11.8, -76.8] },
  CUSCO: { progress: 82, count: 14, center: [-13.3, -71.8] },
  AREQUIPA: { progress: 85, count: 10, center: [-16.2, -71.8] },
  PIURA: { progress: 64, count: 12, center: [-5.0, -80.2] },
  LORETO: { progress: 42, count: 8, center: [-4.2, -74.5] },
  PUNO: { progress: 50, count: 14, center: [-15.0, -70.0] },
  CAJAMARCA: { progress: 60, count: 13, center: [-6.8, -78.6] },
  SANMARTIN: { progress: 72, count: 10, center: [-6.8, -76.7] },
  LAMBAYEQUE: { progress: 70, count: 3, center: [-6.4, -79.8] },
  ICA: { progress: 81, count: 5, center: [-14.3, -75.5] },
  HUANUCO: { progress: 45, count: 11, center: [-9.6, -75.8] },
  AYACUCHO: { progress: 55, count: 11, center: [-13.6, -74.2] },
  UCAYALI: { progress: 48, count: 4, center: [-9.0, -73.8] },
  TACNA: { progress: 90, count: 4, center: [-17.8, -70.3] },
  APURIMAC: { progress: 58, count: 8, center: [-14.1, -73.0] },
  MOQUEGUA: { progress: 88, count: 3, center: [-17.0, -70.9] },
  PASCO: { progress: 52, count: 3, center: [-10.5, -75.5] },
  TUMBES: { progress: 75, count: 3, center: [-3.8, -80.5] },
  HUANCAVELICA: { progress: 40, count: 7, center: [-12.9, -75.0] },
  AMAZONAS: { progress: 49, count: 7, center: [-5.5, -78.2] },
  MADREDEDIOS: { progress: 35, count: 3, center: [-12.3, -70.5] },
};

export interface PeruPowerBIMapViewProps {
  rows?: any[];
  selectedRegion?: string;
  selectedUgelId?: string | null;
  onUgelSelect?: (ugel: any) => void;
  compact?: boolean;
}

export default function PeruPowerBIMapView({
  rows = [],
  selectedRegion,
  selectedUgelId,
  onUgelSelect,
  compact = false,
}: PeruPowerBIMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [selected, setSelected] = useState<{
    name: string;
    progress: number;
    status: string;
    ugel: number;
  } | null>(null);

  const regionData = useMemo(() => {
    const data: Record<string, { sum: number; count: number; progress: number }> = {};
    rows.forEach((row) => {
      const reg = normalize(row.region || '');
      if (!reg) return;
      if (!data[reg]) {
        data[reg] = { sum: 0, count: 0, progress: 0 };
      }
      data[reg].sum += Number(row.progress || 0);
      data[reg].count += 1;
    });

    Object.entries(BASE_REGION_STATS).forEach(([k, v]) => {
      if (!data[k]) {
        data[k] = { sum: v.progress * v.count, count: v.count, progress: v.progress };
      } else {
        data[k].progress = Math.round(data[k].sum / Math.max(1, data[k].count));
      }
    });

    return data;
  }, [rows]);

  const summary = useMemo(() => {
    const list = Object.values(regionData);
    const avg = list.length ? list.reduce((s, x) => s + x.progress, 0) / list.length : 0;
    const totalUgel = list.reduce((s, x) => s + x.count, 0);
    const cumple = list.filter((x) => x.progress >= 80).length;
    const proceso = list.filter((x) => x.progress > 0 && x.progress < 80).length;
    const noCumple = list.filter((x) => x.progress === 0).length;

    return {
      average: avg,
      ugel: totalUgel,
      cumple,
      proceso,
      noCumple,
      totalRegiones: list.length,
    };
  }, [regionData]);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    import('leaflet').then((LModule) => {
      if (disposed || !containerRef.current) return;
      const L = (LModule as any).default || LModule;

      if ((containerRef.current as any)._leaflet_id && leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      (containerRef.current as any)._leaflet_id = null;

      const map = L.map(containerRef.current, {
        center: [-9.19, -75.0152],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Basemap de Esri Light Gray: 100% libre, oficial y SIN MARCAS DE AGUA
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      }).addTo(map);

      // Polígonos de base
      const normReg = normalize(selectedRegion);

      const geoLayer = L.geoJSON(PERU_GEOJSON as any, {
        style: (feature: any) => {
          const name = normalize(feature?.properties?.NOMBDEP || feature?.properties?.name || '');
          const isSelected = normReg && normReg !== 'TODAS' && name === normReg;
          return {
            fillColor: isSelected ? '#dbeafe' : '#e2e8f0',
            weight: isSelected ? 2.5 : 1.2,
            color: isSelected ? '#0066ff' : '#ffffff',
            fillOpacity: isSelected ? 0.75 : 0.55,
          };
        },
      }).addTo(map);

      try {
        map.fitBounds(geoLayer.getBounds(), { padding: [16, 16] });
      } catch {}

      // Burbujas analíticas proporcionales estilo Power BI
      Object.entries(BASE_REGION_STATS).forEach(([regKey, meta]) => {
        const item = regionData[regKey] || { progress: meta.progress, count: meta.count };
        const progress = item.progress;
        const color = progress >= 80 ? '#16a36a' : progress > 0 ? '#f59e0b' : '#e5484d';
        const radius = Math.max(12, Math.min(26, 10 + item.count * 1.2));

        const bubble = L.circleMarker(meta.center, {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.82,
        }).addTo(map);

        bubble.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px 4px;">
            <strong style="font-size: 13px; color: #0f172a;">${regKey}</strong><br/>
            <span style="color: #64748b;">Avance analítico:</span> <b>${progress}%</b><br/>
            <span style="color: #64748b;">UGEL / Sedes:</span> <b>${item.count}</b>
          </div>`,
          { sticky: true }
        );

        bubble.on('click', () => {
          setSelected({
            name: regKey,
            progress,
            status: progress >= 80 ? 'Cumple' : progress > 0 ? 'En proceso' : 'No cumple',
            ugel: item.count,
          });
        });
      });

      leafletMapRef.current = map;
      setTimeout(() => { map.invalidateSize(); }, 200);
    });

    return () => {
      disposed = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [regionData, selectedRegion]);

  if (compact) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  return (
    <div className="powerbi-grid-container" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 14,
      width: '100%',
      height: '100%',
      minHeight: 400,
    }}>
      <div className="powerbi-map-panel" style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
      }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />
      </div>

      <div className="powerbi-analytics-sidebar" style={{
        background: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
      }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Indicadores Territoriales
        </h4>

        <div className="powerbi-kpi-card" style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', display: 'block' }}>
            {summary.average.toFixed(1)}%
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
            Avance promedio nacional
          </span>
        </div>

        <div className="powerbi-kpi-card" style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0066ff', display: 'block' }}>
            {summary.ugel}
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
            Sedes / UGEL evaluadas
          </span>
        </div>

        <div className="powerbi-kpi-card" style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#16a36a', display: 'block' }}>
            {summary.cumple}
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
            Regiones en meta (≥80%)
          </span>
        </div>

        {selected ? (
          <div style={{
            marginTop: 'auto',
            padding: 12,
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
          }}>
            <h5 style={{ margin: '0 0 6px', fontSize: 13, color: '#1e40af', fontWeight: 700 }}>{selected.name}</h5>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#334155' }}>
              Cumplimiento: <b>{selected.progress}%</b>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#334155' }}>
              UGEL activas: <b>{selected.ugel}</b>
            </p>
          </div>
        ) : (
          <div style={{
            marginTop: 'auto',
            padding: 10,
            borderRadius: 6,
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            fontSize: 11.5,
            color: '#64748b',
            textAlign: 'center',
          }}>
            Haz clic en una burbuja regional para inspeccionar su analítica.
          </div>
        )}
      </div>
    </div>
  );
}
