import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';

const normalize = (value: any = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

const BASE_REGION_PCTS: Record<string, number> = {
  ANCASH: 68,
  JUNIN: 56,
  'LA LIBERTAD': 74,
  LIMA: 78,
  CUSCO: 82,
  AREQUIPA: 85,
  PIURA: 64,
  LORETO: 42,
  PUNO: 50,
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

export interface PeruChoroplethViewProps {
  rows?: any[];
  selectedRegion?: string;
  selectedUgelId?: string | null;
  onRegionSelect?: (region: { name: string; progress: number; status: string; ugel: number }) => void;
  onUgelSelect?: (ugel: any) => void;
}

export default function PeruChoroplethView({
  rows = [],
  selectedRegion,
  selectedUgelId,
  onRegionSelect,
  onUgelSelect,
}: PeruChoroplethViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const geoJsonLayerRef = useRef<any>(null);
  const [selected, setSelected] = useState<{
    name: string;
    progress: number;
    status: string;
    ugelCount: number;
  } | null>(null);

  // Mapeo consolidado por región desde rows reales
  const regionStats = useMemo(() => {
    const stats: Record<string, { totalProgress: number; count: number; progress: number }> = {};
    rows.forEach((r) => {
      const reg = normalize(r.region || r.departamento || '');
      if (!reg) return;
      if (!stats[reg]) {
        stats[reg] = { totalProgress: 0, count: 0, progress: 0 };
      }
      const item = stats[reg];
      if (item) {
        item.totalProgress += Number(r.progress || 0);
        item.count += 1;
      }
    });

    Object.keys(stats).forEach((k) => {
      const entry = stats[k];
      if (entry) {
        entry.progress = Math.round(entry.totalProgress / Math.max(1, entry.count));
      }
    });

    return stats;
  }, [rows]);

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

      // Basemap de Esri Light Gray: 100% libre, oficial, nítido y SIN MARCAS DE AGUA
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      }).addTo(map);

      // Capa Cloroplética Departamental usando GeoJSON local
      const normSelectedReg = normalize(selectedRegion);

      const geoJsonLayer = L.geoJSON(PERU_GEOJSON as any, {
        style: (feature: any) => {
          const name = normalize(feature?.properties?.NOMBDEP || feature?.properties?.name || '');
          const stat = regionStats[name];
          const progress = stat ? stat.progress : (BASE_REGION_PCTS[name] ?? 50);
          const status = progress >= 80 ? 'cumple' : progress > 0 ? 'proceso' : 'incumple';
          const isCurrentRegion = normSelectedReg && normSelectedReg !== 'TODAS' && name === normSelectedReg;

          const fillColor = status === 'cumple' ? '#16a36a' : status === 'proceso' ? '#f59e0b' : '#e5484d';

          return {
            fillColor,
            weight: isCurrentRegion ? 2.8 : 1.2,
            opacity: 1,
            color: isCurrentRegion ? '#0066ff' : '#ffffff',
            fillOpacity: isCurrentRegion ? 0.88 : 0.68,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature?.properties?.NOMBDEP || feature?.properties?.name || 'Región';
          const normName = normalize(name);
          const stat = regionStats[normName];
          const progress = stat ? stat.progress : (BASE_REGION_PCTS[normName] ?? 50);
          const status = progress >= 80 ? 'Cumple' : progress > 0 ? 'En proceso' : 'No cumple';
          const ugelCount = stat?.count || 1;

          layer.bindTooltip(
            `<div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px 4px;">
              <strong style="color: #0f172a; font-size: 13px;">${name}</strong><br/>
              <span style="color: #64748b;">Avance:</span> <b>${progress}%</b><br/>
              <span style="color: #64748b;">Estado:</span> <span style="font-weight: 600; color: ${
                status === 'Cumple' ? '#16a36a' : status === 'En proceso' ? '#d97706' : '#dc2626'
              }">${status}</span>
            </div>`,
            { sticky: true, className: 'leaflet-territorial-tooltip' }
          );

          layer.on({
            mouseover: (e: any) => {
              const target = e.target;
              target.setStyle({
                weight: 3,
                color: '#0f172a',
                fillOpacity: 0.92,
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                target.bringToFront();
              }
            },
            mouseout: (e: any) => {
              geoJsonLayer.resetStyle(e.target);
            },
            click: () => {
              const res = { name, progress, status, ugel: ugelCount };
              setSelected({ name, progress, status, ugelCount });
              onRegionSelect?.(res);
            },
          });
        },
      }).addTo(map);

      geoJsonLayerRef.current = geoJsonLayer;

      // Centrado inteligente en región seleccionada o en todo el Perú
      let regionBoundsFound = false;
      if (normSelectedReg && normSelectedReg !== 'TODAS') {
        geoJsonLayer.eachLayer((layer: any) => {
          const lName = normalize(layer.feature?.properties?.NOMBDEP || layer.feature?.properties?.name || '');
          if (lName === normSelectedReg) {
            try {
              map.fitBounds(layer.getBounds(), { padding: [30, 30] });
              regionBoundsFound = true;
            } catch (_) {}
          }
        });
      }

      if (!regionBoundsFound) {
        try {
          map.fitBounds(geoJsonLayer.getBounds(), { padding: [16, 16] });
        } catch (_) {}
      }

      // Renderizar pines de las UGEL sobre el mapa temático
      markersRef.current.clear();
      rows.forEach((row) => {
        if (!row.coords || !Array.isArray(row.coords) || row.coords.length < 2) return;
        const pinColor =
          row.state === 'Cumple'
            ? '#00b96b'
            : row.state === 'En proceso'
            ? '#fa8c16'
            : '#ef4444';
        const isSelected = row.id === selectedUgelId;

        const customIconHtml = `
          <div class="qaway-map-pin ${isSelected ? 'is-selected' : ''}" style="--pin-color: ${pinColor}">
            ${isSelected ? '<span class="pin-pulse"></span>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          html: customIconHtml,
          className: 'qaway-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -12],
        });

        const popupContent = `
          <div class="qaway-minimal-topplin" style="font-family: inherit; font-size: 12px; min-width: 160px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${pinColor}; flex-shrink: 0;"></span>
              <strong style="color: #0f172a; font-size: 12.5px;">${row.name}</strong>
            </div>
            <div style="color: #475569; display: flex; flex-direction: column; gap: 2px;">
              <div>Avance actual: <b style="color: #0f172a;">${row.progress}%</b></div>
              <div>Estado: <b style="color: ${pinColor};">${row.state}</b></div>
              <small style="color: #64748b;">${row.region}</small>
            </div>
          </div>
        `;

        const marker = L.marker(row.coords, { icon, zIndexOffset: isSelected ? 1000 : 100 })
          .addTo(map)
          .bindPopup(popupContent, { closeButton: true });

        marker.on('click', () => {
          onUgelSelect?.(row);
        });

        markersRef.current.set(row.id, marker);

        if (isSelected) {
          marker.openPopup();
        }
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
  }, [regionStats, selectedRegion, rows, onRegionSelect, onUgelSelect]);

  // Reaccionar inmediatamente cuando cambia la UGEL seleccionada
  useEffect(() => {
    if (!leafletMapRef.current || !selectedUgelId) return;
    const selectedRow = rows.find((r) => r.id === selectedUgelId);
    if (selectedRow && selectedRow.coords) {
      const map = leafletMapRef.current;
      map.flyTo(selectedRow.coords, Math.max(map.getZoom(), 8), { duration: 0.6 });
      const m = markersRef.current.get(selectedUgelId);
      if (m) {
        m.openPopup();
      }
    }
  }, [selectedUgelId, rows]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {selected && (
        <div className="choropleth-floating-info-card" style={{
          position: 'absolute',
          top: 14,
          left: 14,
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          border: '1px solid #cbd5e1',
          padding: '10px 14px',
          zIndex: 1000,
          minWidth: 200,
          pointerEvents: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 13, color: '#0f172a' }}>{selected.name}</strong>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              background: selected.status === 'Cumple' ? '#ecfdf5' : selected.status === 'En proceso' ? '#fffbeb' : '#fef2f2',
              color: selected.status === 'Cumple' ? '#047857' : selected.status === 'En proceso' ? '#b45309' : '#b91c1c',
              border: `1px solid ${selected.status === 'Cumple' ? '#a7f3d0' : selected.status === 'En proceso' ? '#fde68a' : '#fecaca'}`,
            }}>
              {selected.status}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>Avance consolidado: <b style={{ color: '#0f172a' }}>{selected.progress}%</b></div>
            <div>UGEL / Sedes: <b style={{ color: '#0f172a' }}>{selected.ugelCount}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
