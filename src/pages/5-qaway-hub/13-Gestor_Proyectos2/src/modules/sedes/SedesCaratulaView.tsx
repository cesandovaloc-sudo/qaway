import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Building2,
  Building,
  MapPin,
  Globe2,
  Layers,
  BarChart3,
  TrendingUp,
  Maximize2,
  Minimize2,
  Compass,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';
import 'leaflet/dist/leaflet.css';
import PeruChoroplethView from './PeruChoroplethView';
import PeruPowerBIMapView from './PeruPowerBIMapView';
import PeruEChartsPowerBI from './PeruEChartsPowerBI';

type CaratulaMapMode = 'macro' | 'geo-real' | 'tematico-regional' | 'powerbi-analitico' | 'echarts-powerbi';

const REGION_CENTERS: Record<string, [number, number]> = {
  AMAZONAS: [-5.5, -78.2],
  ANCASH: [-9.5, -77.5],
  APURIMAC: [-14.1, -73.0],
  AREQUIPA: [-16.2, -71.8],
  AYACUCHO: [-13.6, -74.2],
  CAJAMARCA: [-6.8, -78.6],
  CALLAO: [-12.05, -77.12],
  CUSCO: [-13.3, -71.8],
  HUANCAVELICA: [-12.9, -75.0],
  HUANUCO: [-9.6, -75.8],
  ICA: [-14.3, -75.5],
  JUNIN: [-11.5, -75.1],
  'LA LIBERTAD': [-8.0, -78.5],
  LAMBAYEQUE: [-6.4, -79.8],
  'LIMA METROPOLITANA': [-12.05, -77.03],
  'LIMA PROVINCIAS': [-11.8, -76.8],
  LIMA: [-11.8, -76.8],
  LORETO: [-4.2, -74.5],
  'MADRE DE DIOS': [-12.3, -70.5],
  MOQUEGUA: [-17.0, -70.9],
  PASCO: [-10.5, -75.5],
  PIURA: [-5.0, -80.2],
  PUNO: [-15.0, -70.0],
  'SAN MARTIN': [-6.8, -76.7],
  TACNA: [-17.8, -70.3],
  TUMBES: [-3.8, -80.5],
  UCAYALI: [-9.0, -73.8],
};

const normRegKey = (val: string = '') =>
  val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();

interface SedesCaratulaViewProps {
  items?: any[];
  unidades?: any[];
  onSelectSede?: (sede: any) => void;
}

const PERU_BOUNDS: [[number, number], [number, number]] = [
  [-18.35, -81.35],
  [-0.03, -68.65],
];

const MACRO_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  norte: [[-8.6, -81.4], [-0.03, -75.0]],
  centro: [[-14.5, -78.5], [-8.0, -73.0]],
  sur: [[-18.35, -75.5], [-12.5, -68.6]],
  todas: PERU_BOUNDS,
};

export default function SedesCaratulaView({
  items = [],
  unidades = [],
  onSelectSede,
}: SedesCaratulaViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const geoContainerRef = useRef<HTMLDivElement>(null);
  const geoMapRef = useRef<any>(null);
  const [activeMacro, setActiveMacro] = useState<string>('todas');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [expandedDreKey, setExpandedDreKey] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<CaratulaMapMode>('macro');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Mapa rápido de avance desde items reales del cronograma (por nombre de sede/región)
  const itemsProgressByName = useMemo(() => {
    const map = new Map<string, number>();
    if (Array.isArray(items)) {
      items.forEach((it: any) => {
        if (it?.name && typeof it.progress === 'number') {
          map.set(normRegKey(it.name), Math.round(it.progress));
        }
      });
    }
    return map;
  }, [items]);

  // 1. Datos completos de entidades vinculadas a Supabase (gestor_unidades) con fallback
  const entidadesAsignadas = useMemo(() => {
    if (unidades && unidades.length > 0) {
      return unidades.map((u: any, idx: number) => {
        const uType = (u.unitType || '').toLowerCase();
        const isDre = uType === 'dre' || uType === 'central' || uType === 'regional' || u.name?.startsWith('DRE') || u.name?.startsWith('GRE');
        const reg = u.region || 'JUNÍN';
        const rNorm = normRegKey(reg);
        let macro = 'centro';
        if (['TUMBES', 'PIURA', 'LAMBAYEQUE', 'LA LIBERTAD', 'CAJAMARCA', 'AMAZONAS', 'SAN MARTIN', 'LORETO'].includes(rNorm)) {
          macro = 'norte';
        } else if (['AREQUIPA', 'MOQUEGUA', 'TACNA', 'PUNO', 'CUSCO', 'APURIMAC', 'MADRE DE DIOS'].includes(rNorm)) {
          macro = 'sur';
        }

        const matchedPct = itemsProgressByName.get(normRegKey(u.name));
        const fallbackPct = typeof u.progress === 'number'
          ? u.progress
          : [85, 75, 50, 33, 20, 65, 90, 45][idx % 8];
        const progress = matchedPct !== undefined ? matchedPct : fallbackPct;
        const estadoAvance = progress >= 80 ? 'Cumple' : progress > 0 ? 'En proceso' : 'Pendiente';

        return {
          id: u.id || `u-${idx + 1}`,
          name: u.name,
          code: u.code || (isDre ? 'DRE' : 'UGEL'),
          type: isDre ? 'DRE' : 'UGEL',
          unitType: u.unitType || (isDre ? 'dre' : 'ugel'),
          region: reg,
          macro: macro,
          progress,
          estadoAvance,
          estado: progress >= 80 ? 'Activa' : progress > 0 ? 'En proceso' : 'Inactiva',
        };
      });
    }

    return [
      { id: 'u-1', name: 'DRE JUNÍN', code: 'DRE-JUN', type: 'DRE', unitType: 'dre', region: 'JUNÍN', macro: 'centro', progress: 75, estadoAvance: 'En proceso', estado: 'Activa' },
      { id: 'u-2', name: 'UGEL HUANCAYO', code: 'UGEL-HYO', type: 'UGEL', unitType: 'ugel', region: 'JUNÍN', macro: 'centro', progress: 85, estadoAvance: 'Cumple', estado: 'Activa' },
      { id: 'u-3', name: 'UGEL TARMA', code: 'UGEL-TAR', type: 'UGEL', unitType: 'ugel', region: 'JUNÍN', macro: 'centro', progress: 50, estadoAvance: 'En proceso', estado: 'En proceso' },
      { id: 'u-4', name: 'DRE AMAZONAS', code: 'DRE-AMA', type: 'DRE', unitType: 'dre', region: 'AMAZONAS', macro: 'norte', progress: 75, estadoAvance: 'En proceso', estado: 'Activa' },
      { id: 'u-5', name: 'UGEL BAGUA', code: 'UGEL-BAG', type: 'UGEL', unitType: 'ugel', region: 'AMAZONAS', macro: 'norte', progress: 80, estadoAvance: 'Cumple', estado: 'Activa' },
      { id: 'u-6', name: 'DRE AREQUIPA', code: 'DRE-ARE', type: 'DRE', unitType: 'dre', region: 'AREQUIPA', macro: 'sur', progress: 85, estadoAvance: 'Cumple', estado: 'Activa' },
      { id: 'u-7', name: 'UGEL AREQUIPA NORTE', code: 'UGEL-ARN', type: 'UGEL', unitType: 'ugel', region: 'AREQUIPA', macro: 'sur', progress: 85, estadoAvance: 'Cumple', estado: 'Activa' },
    ];
  }, [unidades, itemsProgressByName]);

  // 2. Conteos por macrorregión y resumen compacto para la Columna 2
  const macroStats = useMemo(() => {
    const calc = (m: string) => {
      const list = entidadesAsignadas.filter((e) => e.macro === m);
      const regs = new Set(list.map((e) => normRegKey(e.region)));
      return { regions: regs.size, entities: list.length };
    };
    const totalCumple = entidadesAsignadas.filter((e) => e.progress >= 80).length;
    const totalProceso = entidadesAsignadas.filter((e) => e.progress > 0 && e.progress < 80).length;
    const avg = entidadesAsignadas.length
      ? Math.round(entidadesAsignadas.reduce((s, e) => s + e.progress, 0) / entidadesAsignadas.length)
      : 0;
    return {
      norte: calc('norte'),
      centro: calc('centro'),
      sur: calc('sur'),
      totalCumple,
      totalProceso,
      avg,
    };
  }, [entidadesAsignadas]);

  // 3. Inicialización del Mapa de Leaflet con fitBounds centrado en Perú
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;
    let ro: ResizeObserver | null = null;

    import('leaflet').then((LModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = (LModule as any).default || LModule;

      if ((mapContainerRef.current as any)._leaflet_id && leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      (mapContainerRef.current as any)._leaflet_id = null;

      const map = L.map(mapContainerRef.current, {
        center: [-9.19, -75.0152],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri Light Gray Base',
        maxZoom: 16,
      }).addTo(map);

      // Colorear departamentos asignados según macrorregión
      const norteRegiones = new Set(['AMAZONAS', 'CAJAMARCA', 'LA LIBERTAD', 'LAMBAYEQUE', 'PIURA', 'TUMBES', 'SAN MARTIN', 'LORETO']);
      const centroRegiones = new Set(['ANCASH', 'JUNIN', 'LIMA', 'HUANUCO', 'PASCO', 'HUANCAVELICA', 'AYACUCHO', 'ICA', 'UCAYALI']);
      const surRegiones = new Set(['AREQUIPA', 'CUSCO', 'PUNO', 'TACNA', 'MOQUEGUA', 'APURIMAC', 'MADRE DE DIOS']);

      let geoJsonLayer: any = null;
      try {
        geoJsonLayer = L.geoJSON(PERU_GEOJSON as any, {
          style: (feature: any) => {
            const rawName = (feature?.properties?.NOMBDEP || feature?.properties?.name || '').toUpperCase();
            const normName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            let fillColor = '#cbd5e1';
            if (norteRegiones.has(normName)) {
              fillColor = '#1e40af'; // Azul intenso (Norte)
            } else if (centroRegiones.has(normName)) {
              fillColor = '#3b82f6'; // Azul medio (Centro)
            } else if (surRegiones.has(normName)) {
              fillColor = '#93c5fd'; // Azul claro (Sur)
            }

            return {
              fillColor: fillColor,
              weight: 1.2,
              opacity: 1,
              color: '#ffffff',
              fillOpacity: 0.85,
            };
          },
        }).addTo(map);
      } catch (err) {
        console.warn('Error cargando GeoJSON territorial:', err);
      }

      // Pines territoriales representativos
      const cityPins = [
        { name: 'DRE Junín', coords: [-12.0651, -75.2049], isDre: true },
        { name: 'UGEL Huancayo', coords: [-12.072, -75.215], isDre: false },
        { name: 'UGEL Tarma', coords: [-11.419, -75.69], isDre: false },
        { name: 'DRE Piura', coords: [-5.1945, -80.6328], isDre: true },
        { name: 'DRE La Libertad', coords: [-8.116, -79.03], isDre: true },
        { name: 'DRE Arequipa', coords: [-16.409, -71.537], isDre: true },
        { name: 'DRE Cusco', coords: [-13.5319, -71.9675], isDre: true },
        { name: 'DRE Ayacucho', coords: [-13.1588, -74.2239], isDre: true },
        { name: 'DRE Puno', coords: [-15.8422, -70.0199], isDre: true },
      ];

      cityPins.forEach((pin) => {
        const iconHtml = pin.isDre
          ? `<div style="background:#0f172a;color:#ffffff;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`
          : `<div style="background:#0284c7;color:#ffffff;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;border:2px solid #ffffff;box-shadow:0 2px 4px rgba(0,0,0,0.25);"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'sd-map-pin',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker(pin.coords as [number, number], { icon: customIcon })
          .bindTooltip(pin.name, { direction: 'top', offset: [0, -10] })
          .addTo(map);
      });

      // Calibrar encuadre exacto sobre Perú usando los límites del polígono GeoJSON
      const peruBounds = geoJsonLayer && geoJsonLayer.getBounds && geoJsonLayer.getBounds().isValid()
        ? geoJsonLayer.getBounds()
        : L.latLngBounds(PERU_BOUNDS);

      const fitPeru = () => {
        if (!map || isCancelled) return;
        map.invalidateSize();
        map.fitBounds(peruBounds, { padding: [16, 16], maxZoom: 6 });
      };

      fitPeru();
      requestAnimationFrame(fitPeru);
      setTimeout(fitPeru, 120);
      setTimeout(fitPeru, 350);

      // ResizeObserver para mantener el mapa siempre adaptado sin desbordamientos ni saltos
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        ro = new ResizeObserver(() => {
          if (!map || isCancelled) return;
          map.invalidateSize();
        });
        ro.observe(mapContainerRef.current);
      }

      leafletMapRef.current = map;
    });

    return () => {
      isCancelled = true;
      if (ro) {
        ro.disconnect();
        ro = null;
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Animación suave de cámara en Leaflet al seleccionar macrorregión (sin saltos de pantalla)
  const handleMacroClick = (macroKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = activeMacro === macroKey ? 'todas' : macroKey;
    setActiveMacro(next);

    if (leafletMapRef.current) {
      const bounds = MACRO_BOUNDS[next] || MACRO_BOUNDS.todas;
      leafletMapRef.current.flyToBounds(bounds, {
        duration: 0.65,
        easeLinearity: 0.2,
        padding: [20, 20],
      });
    }
  };

  const filteredEntidades = useMemo(() => {
    if (activeMacro === 'todas') return entidadesAsignadas;
    return entidadesAsignadas.filter((e) => e.macro.toLowerCase() === activeMacro.toLowerCase());
  }, [entidadesAsignadas, activeMacro]);

  // Filas georreferenciadas para las 4 vistas analíticas/geográficas dentro de la cápsula
  const mapRows = useMemo(() => {
    const source = filteredEntidades.length > 0 ? filteredEntidades : entidadesAsignadas;
    return source.map((ent, idx) => {
      const rKey = normRegKey(ent.region);
      const center = REGION_CENTERS[rKey] || [-9.2, -75.0];
      const seed = (ent.id?.charCodeAt(ent.id.length - 1) || idx) % 15 - 7;
      const seed2 = (ent.id?.charCodeAt(0) || idx) % 15 - 7;
      const progress = ent.estado === 'Activa' ? 85 : ent.estado === 'En proceso' ? 52 : 15;
      const state = ent.estado === 'Activa' ? 'Cumple' : ent.estado === 'En proceso' ? 'En proceso' : 'No cumple';
      return {
        ...ent,
        progress,
        state,
        coords: [center[0] + seed * 0.06, center[1] + seed2 * 0.06] as [number, number],
      };
    });
  }, [filteredEntidades, entidadesAsignadas]);

  // Recalcular tamaño del mapa Macrorregional al volver a él o cambiar fullscreen
  useEffect(() => {
    if (mapMode === 'macro' && leafletMapRef.current) {
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 120);
    }
  }, [mapMode, isMapFullscreen]);

  // Inicializar Mapa Geográfico Satelital (Vista 2) dentro de la cápsula
  useEffect(() => {
    if (mapMode !== 'geo-real' || !geoContainerRef.current) return;
    let cancelled = false;

    import('leaflet').then((LModule) => {
      if (cancelled || !geoContainerRef.current) return;
      const L = (LModule as any).default || LModule;

      if ((geoContainerRef.current as any)._leaflet_id && geoMapRef.current) {
        geoMapRef.current.remove();
        geoMapRef.current = null;
      }
      (geoContainerRef.current as any)._leaflet_id = null;

      const map = L.map(geoContainerRef.current, {
        center: [-9.19, -75.0152],
        zoom: 5,
        minZoom: 4,
        maxZoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapRows.forEach((row) => {
        const pinColor = row.state === 'Cumple' ? '#00b96b' : row.state === 'En proceso' ? '#fa8c16' : '#ef4444';
        const icon = L.divIcon({
          html: `<div class="qaway-map-pin" style="--pin-color: ${pinColor}"></div>`,
          className: 'qaway-div-icon',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -10],
        });
        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; min-width: 150px;">
            <strong style="color: #0f172a;">${row.name}</strong><br/>
            <span style="color: #64748b;">Región:</span> <b>${row.region}</b><br/>
            <span style="color: #64748b;">Estado:</span> <b style="color: ${pinColor};">${row.estado}</b>
          </div>
        `;
        L.marker(row.coords, { icon }).addTo(map).bindPopup(popupHtml);
      });

      geoMapRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    });

    return () => {
      cancelled = true;
      if (geoMapRef.current) {
        geoMapRef.current.remove();
        geoMapRef.current = null;
      }
    };
  }, [mapMode, mapRows, isMapFullscreen]);

  // Agrupación jerárquica por DRE / Sede Matriz (colapsada por defecto, acordeón)
  const groupedDres = useMemo(() => {
    const groups = new Map<string, { key: string; dre: any | null; ugels: any[] }>();
    filteredEntidades.forEach((ent) => {
      const regKey = normRegKey(ent.region) || 'GENERAL';
      if (!groups.has(regKey)) {
        groups.set(regKey, { key: regKey, dre: null, ugels: [] });
      }
      const g = groups.get(regKey)!;
      if (ent.type === 'DRE' && !g.dre) {
        g.dre = ent;
      } else {
        g.ugels.push(ent);
      }
    });

    return Array.from(groups.values()).map((g, idx) => {
      const allInGroup = g.dre ? [g.dre, ...g.ugels] : g.ugels;
      const avgProgress = allInGroup.length
        ? Math.round(allInGroup.reduce((s, x) => s + (x.progress || 0), 0) / allInGroup.length)
        : 0;
      const dreEntity = g.dre || {
        id: `dre-group-${g.key}`,
        name: `DRE ${g.key}`,
        code: `DRE-${g.key}`,
        type: 'DRE',
        unitType: 'dre',
        region: g.ugels[0]?.region || g.key,
        progress: avgProgress,
      };
      const estadoAvance = avgProgress >= 80 ? 'Cumple' : avgProgress > 0 ? 'En proceso' : 'Pendiente';
      return {
        index: idx + 1,
        key: g.key,
        dre: { ...dreEntity, progress: avgProgress, estadoAvance },
        ugels: g.ugels,
      };
    });
  }, [filteredEntidades]);

  return (
    <div className="sd-caratula-wrapper" style={{
      display: 'grid',
      gridTemplateColumns: '1.35fr 224px 1fr',
      gap: '12px',
      padding: '10px 14px',
      flex: '1 1 0%',
      height: '100%',
      minHeight: 0,
      maxHeight: '100%',
      boxSizing: 'border-box',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* =========================================================================
          COLUMNA 1: Cápsula del Mapa Oficial (100% de altura, sin título superior)
          Aloja las 5 vistas interactivas + dock flotante
          ========================================================================= */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '8px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* Cápsula del Mapa Oficial a 100% de alto */}
        <div style={{
          display: 'flex',
          flex: '1 1 0%',
          height: '100%',
          minHeight: 0,
        }}>
          {/* Cápsula del Mapa Oficial (Aloja las 5 vistas interactivas sin alterar el diseño) */}
          <div style={isMapFullscreen ? {
            position: 'fixed',
            inset: '16px',
            zIndex: 2200,
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          } : {
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            height: '100%',
            minHeight: 0,
            width: '100%',
          }}>
            {/* Vista 1: Cobertura Macrorregional (Carátula original) */}
            <div
              ref={mapContainerRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: mapMode === 'macro' ? 'block' : 'none',
              }}
            />

            {/* Vista 2: Geográfico Satelital con Pines */}
            {mapMode === 'geo-real' && (
              <div
                ref={geoContainerRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            )}

            {/* Vista 3: Temático Poligonal */}
            {mapMode === 'tematico-regional' && (
              <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <PeruChoroplethView rows={mapRows} compact />
              </div>
            )}

            {/* Vista 4: Analítica Power BI (Burbujas Leaflet) */}
            {mapMode === 'powerbi-analitico' && (
              <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <PeruPowerBIMapView rows={mapRows} compact />
              </div>
            )}

            {/* Vista 5: Power BI Analítica (Apache ECharts) */}
            {mapMode === 'echarts-powerbi' && (
              <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <PeruEChartsPowerBI rows={mapRows} compact />
              </div>
            )}

            {/* DOCK FLOTANTE CON LAS 5 VISTAS DENTRO DE LA CÁPSULA */}
            <div className="territorial-floating-dock" role="tablist" aria-label="Vistas del Mapa en Carátula">
              <button
                type="button"
                className={`floating-dock-btn ${mapMode === 'macro' ? 'is-active' : ''}`}
                onClick={() => setMapMode('macro')}
                title="Vista 1: Cobertura Macrorregional"
                aria-label="Cobertura Macrorregional"
              >
                <Compass size={16} />
              </button>

              <button
                type="button"
                className={`floating-dock-btn ${mapMode === 'geo-real' ? 'is-active' : ''}`}
                onClick={() => setMapMode('geo-real')}
                title="Vista 2: Mapa Geográfico Satelital (Pines)"
                aria-label="Mapa Geográfico"
              >
                <Globe2 size={16} />
              </button>

              <button
                type="button"
                className={`floating-dock-btn ${mapMode === 'tematico-regional' ? 'is-active' : ''}`}
                onClick={() => setMapMode('tematico-regional')}
                title="Vista 3: Mapa Temático Poligonal (Regiones)"
                aria-label="Mapa Temático Poligonal"
              >
                <Layers size={16} />
              </button>

              <button
                type="button"
                className={`floating-dock-btn ${mapMode === 'powerbi-analitico' ? 'is-active' : ''}`}
                onClick={() => setMapMode('powerbi-analitico')}
                title="Vista 4: Tablero Analítico Territorial (Power BI)"
                aria-label="Analítica Power BI"
              >
                <BarChart3 size={16} />
              </button>

              <button
                type="button"
                className={`floating-dock-btn ${mapMode === 'echarts-powerbi' ? 'is-active' : ''}`}
                onClick={() => setMapMode('echarts-powerbi')}
                title="Vista 5: Analítica Power BI (Apache ECharts)"
                aria-label="Power BI ECharts"
              >
                <TrendingUp size={16} />
              </button>

              <span className="floating-dock-divider" />

              <button
                type="button"
                className="floating-dock-btn"
                onClick={() => setIsMapFullscreen((v) => !v)}
                title={isMapFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
                aria-label="Pantalla Completa"
              >
                {isMapFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COLUMNA 2: Controles de Macrorregión, Leyenda y Resumen Compacto (196px)
          ========================================================================= */}
      <aside style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '12px 11px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}>
        {/* 1. Cobertura por macrorregión */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 750, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Cobertura por macrorregión
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <button
              type="button"
              onClick={(e) => handleMacroClick('norte', e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 11px',
                borderRadius: '10px',
                background: activeMacro === 'norte' ? '#eff6ff' : '#f8fafc',
                border: '1px solid',
                borderColor: activeMacro === 'norte' ? '#93c5fd' : '#e2e8f0',
                boxShadow: activeMacro === 'norte' ? '0 2px 6px rgba(37,99,235,0.12)' : '0 1px 2px rgba(15,23,42,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: '#1e40af', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>Norte</strong>
                <small style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>
                  {macroStats.norte.regions} reg. · {macroStats.norte.entities} sedes
                </small>
              </div>
            </button>

            <button
              type="button"
              onClick={(e) => handleMacroClick('centro', e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 11px',
                borderRadius: '10px',
                background: activeMacro === 'centro' ? '#eff6ff' : '#f8fafc',
                border: '1px solid',
                borderColor: activeMacro === 'centro' ? '#93c5fd' : '#e2e8f0',
                boxShadow: activeMacro === 'centro' ? '0 2px 6px rgba(37,99,235,0.12)' : '0 1px 2px rgba(15,23,42,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: '#3b82f6', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>Centro</strong>
                <small style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>
                  {macroStats.centro.regions} reg. · {macroStats.centro.entities} sedes
                </small>
              </div>
            </button>

            <button
              type="button"
              onClick={(e) => handleMacroClick('sur', e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 11px',
                borderRadius: '10px',
                background: activeMacro === 'sur' ? '#eff6ff' : '#f8fafc',
                border: '1px solid',
                borderColor: activeMacro === 'sur' ? '#93c5fd' : '#e2e8f0',
                boxShadow: activeMacro === 'sur' ? '0 2px 6px rgba(37,99,235,0.12)' : '0 1px 2px rgba(15,23,42,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: '#93c5fd', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>Sur</strong>
                <small style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>
                  {macroStats.sur.regions} reg. · {macroStats.sur.entities} sedes
                </small>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Leyenda del mapa */}
        <div>
          <h3 style={{ fontSize: '11.5px', fontWeight: 750, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Leyenda del mapa
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0f172a', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                <MapPin size={8} />
              </span>
              <span>DRE (Sede regional)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0284c7', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                <MapPin size={8} />
              </span>
              <span>UGEL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #38bdf8', background: 'transparent', flexShrink: 0, marginLeft: 2 }} />
              <span>Unidad intervención</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 8, borderRadius: '2px', background: '#bfdbfe', flexShrink: 0 }} />
              <span>Región asignada</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 14, height: 8, borderRadius: '2px', background: '#e2e8f0', flexShrink: 0 }} />
              <span>Sin asignación</span>
            </div>
          </div>
        </div>

        {/* 3. Indicador compacto de avance territorial */}
        <div style={{
          marginTop: 'auto',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avance</span>
            <strong style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{macroStats.avg}%</strong>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ width: `${macroStats.avg}%`, height: '100%', background: '#1e40af', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#475569' }}>
            <span>● {macroStats.totalCumple} cumplen</span>
            <span>● {macroStats.totalProceso} proc.</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          COLUMNA 3: Tablero Completo de Sedes (Altura 100%, colapsado por DRE)
          Columnas: N.° | UGEL / SEDE | ESTADO | AVANCE ACTUAL | >
          ========================================================================= */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '13.5px', fontWeight: 750, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            Estado por Sede Regional (DRE)
          </h2>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
            {groupedDres.length} DREs
          </span>
        </div>

        {/* Tabla con scroll interno contenido y colapso por DRE */}
        <div style={{
          flex: '1 1 0%',
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left',
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '8px 10px', fontWeight: 700, fontSize: '10.5px', width: '38px', textAlign: 'center' }}>N.°</th>
                <th style={{ padding: '8px 8px', fontWeight: 700, fontSize: '10.5px' }}>UGEL / SEDE</th>
                <th style={{ padding: '8px 8px', fontWeight: 700, fontSize: '10.5px', width: '92px' }}>ESTADO</th>
                <th style={{ padding: '8px 8px', fontWeight: 700, fontSize: '10.5px', width: '115px' }}>AVANCE ACTUAL</th>
                <th style={{ padding: '8px 6px', width: '24px' }} />
              </tr>
            </thead>
            <tbody>
              {groupedDres.map((group) => {
                const isExpanded = expandedDreKey === group.key;
                const dre = group.dre;
                const isDreSelected = selectedEntityId === dre.id;
                const pillBg = dre.estadoAvance === 'Cumple' ? '#ecfdf5' : dre.estadoAvance === 'En proceso' ? '#fffbeb' : '#fef2f2';
                const pillColor = dre.estadoAvance === 'Cumple' ? '#047857' : dre.estadoAvance === 'En proceso' ? '#b45309' : '#b91c1c';
                const pillBorder = dre.estadoAvance === 'Cumple' ? '#a7f3d0' : dre.estadoAvance === 'En proceso' ? '#fde68a' : '#fecaca';
                const barColor = dre.progress >= 80 ? '#10b981' : dre.progress > 0 ? '#f59e0b' : '#ef4444';

                return (
                  <React.Fragment key={group.key}>
                    {/* Fila DRE Padre (colapsada por defecto) */}
                    <tr
                      onClick={() => {
                        setSelectedEntityId(dre.id);
                        setExpandedDreKey((prev) => (prev === group.key ? null : group.key));
                        onSelectSede?.(dre);
                      }}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isDreSelected || isExpanded ? '#f0f7ff' : '#ffffff',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11px' }}>
                        {group.index}
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {group.ugels.length > 0 ? (
                            isExpanded ? (
                              <ChevronDown size={13} color="#1e40af" style={{ flexShrink: 0 }} />
                            ) : (
                              <ChevronRight size={13} color="#64748b" style={{ flexShrink: 0 }} />
                            )
                          ) : (
                            <span style={{ width: 13, flexShrink: 0 }} />
                          )}
                          <Building2 size={13} style={{ color: '#1e40af', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ display: 'block', color: '#0f172a', fontWeight: 700, fontSize: '12px', lineHeight: 1.25 }}>
                              {dre.name}
                            </strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>
                              {dre.region} · {group.ugels.length} UGEL
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          fontWeight: 650,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: pillBg,
                          color: pillColor,
                          border: `1px solid ${pillBorder}`,
                          whiteSpace: 'nowrap',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: barColor }} />
                          {dre.estadoAvance}
                        </span>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${dre.progress}%`, height: '100%', background: barColor, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', minWidth: '28px', textAlign: 'right' }}>
                            {dre.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center', color: '#94a3b8' }}>
                        <ChevronRight size={13} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }} />
                      </td>
                    </tr>

                    {/* Filas UGEL Hijas (visibles solo cuando la DRE está expandida) */}
                    {isExpanded && group.ugels.map((ugel, uIdx) => {
                      const isUgelSelected = selectedEntityId === ugel.id;
                      const uPillBg = ugel.estadoAvance === 'Cumple' ? '#ecfdf5' : ugel.estadoAvance === 'En proceso' ? '#fffbeb' : '#fef2f2';
                      const uPillColor = ugel.estadoAvance === 'Cumple' ? '#047857' : ugel.estadoAvance === 'En proceso' ? '#b45309' : '#b91c1c';
                      const uPillBorder = ugel.estadoAvance === 'Cumple' ? '#a7f3d0' : ugel.estadoAvance === 'En proceso' ? '#fde68a' : '#fecaca';
                      const uBarColor = ugel.progress >= 80 ? '#10b981' : ugel.progress > 0 ? '#f59e0b' : '#ef4444';

                      return (
                        <tr
                          key={ugel.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntityId(ugel.id);
                            onSelectSede?.(ugel);
                          }}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            background: isUgelSelected ? '#e0f2fe' : '#f8fafc',
                            transition: 'background 0.12s ease',
                          }}
                        >
                          <td style={{ padding: '7px 6px', textAlign: 'center', color: '#94a3b8', fontSize: '10.5px' }}>
                            {group.index}.{uIdx + 1}
                          </td>
                          <td style={{ padding: '7px 8px 7px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={12} style={{ color: '#0284c7', flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <span style={{ display: 'block', color: '#1e293b', fontWeight: 600, fontSize: '11.5px', lineHeight: 1.25 }}>
                                  {ugel.name}
                                </span>
                                <small style={{ display: 'block', color: '#94a3b8', fontSize: '9.5px' }}>
                                  {ugel.region}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '7px 6px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              fontWeight: 650,
                              padding: '2px 6px',
                              borderRadius: '999px',
                              background: uPillBg,
                              color: uPillColor,
                              border: `1px solid ${uPillBorder}`,
                              whiteSpace: 'nowrap',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: uBarColor }} />
                              {ugel.estadoAvance}
                            </span>
                          </td>
                          <td style={{ padding: '7px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                                <div style={{ width: `${ugel.progress}%`, height: '100%', background: uBarColor, borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: '10.5px', fontWeight: 650, color: '#475569', minWidth: '28px', textAlign: 'right' }}>
                                {ugel.progress}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '7px 4px', textAlign: 'center', color: '#cbd5e1' }}>
                            <ChevronRight size={12} />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
