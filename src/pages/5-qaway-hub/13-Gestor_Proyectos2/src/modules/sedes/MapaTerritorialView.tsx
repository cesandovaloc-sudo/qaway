// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapPinned,
  RefreshCw,
  Search,
  Building2,
  ChevronRight,
  Maximize2,
  Minimize2,
  Globe2,
  Layers,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { MINEDU_UNIDADES } from '../../data/mineduUnidades';

type Status = 'Cumple' | 'En proceso' | 'No cumple';
export type TerritorialSubView = 'geo-real' | 'tematico-regional' | 'powerbi-analitico';

// Coordenadas por región del Perú (lat, lng, zoom)
const REGION_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  AMAZONAS: { center: [-5.5, -78.2], zoom: 7 },
  ANCASH: { center: [-9.5, -77.5], zoom: 7 },
  APURÍMAC: { center: [-14.1, -73.0], zoom: 8 },
  AREQUIPA: { center: [-16.2, -71.8], zoom: 7 },
  AYACUCHO: { center: [-13.6, -74.2], zoom: 7 },
  CAJAMARCA: { center: [-6.8, -78.6], zoom: 7 },
  CALLAO: { center: [-12.05, -77.12], zoom: 11 },
  CUSCO: { center: [-13.3, -71.8], zoom: 7 },
  HUANCAVELICA: { center: [-12.9, -75.0], zoom: 8 },
  HUÁNUCO: { center: [-9.6, -75.8], zoom: 7 },
  ICA: { center: [-14.3, -75.5], zoom: 8 },
  JUNÍN: { center: [-11.5, -75.1], zoom: 8 },
  'LA LIBERTAD': { center: [-8.0, -78.5], zoom: 7 },
  LAMBAYEQUE: { center: [-6.4, -79.8], zoom: 8 },
  'LIMA METROPOLITANA': { center: [-12.05, -77.03], zoom: 10 },
  'LIMA PROVINCIAS': { center: [-11.8, -76.8], zoom: 8 },
  LORETO: { center: [-4.2, -74.5], zoom: 6 },
  'MADRE DE DIOS': { center: [-12.3, -70.5], zoom: 7 },
  MOQUEGUA: { center: [-17.0, -70.9], zoom: 8 },
  PASCO: { center: [-10.5, -75.5], zoom: 8 },
  PIURA: { center: [-5.0, -80.2], zoom: 7 },
  PUNO: { center: [-15.0, -70.0], zoom: 7 },
  'SAN MARTÍN': { center: [-6.8, -76.7], zoom: 7 },
  TACNA: { center: [-17.8, -70.3], zoom: 8 },
  TUMBES: { center: [-3.8, -80.5], zoom: 9 },
  UCAYALI: { center: [-9.0, -73.8], zoom: 7 },
};

const key = (value: string | undefined) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface RegionPolygonDef {
  id: string;
  name: string;
  displayName: string;
  d: string;
  labelX: number;
  labelY: number;
}

const JUNIN_POLYGONS: RegionPolygonDef[] = [
  {
    id: 'unit-136',
    name: 'UGEL YAULI',
    displayName: 'Yauli',
    d: 'M 18 190 C 22 175, 45 155, 78 145 C 92 142, 108 152, 115 168 C 112 188, 102 210, 85 228 C 65 240, 40 242, 28 225 Z',
    labelX: 62,
    labelY: 192,
  },
  {
    id: 'unit-135',
    name: 'UGEL TARMA',
    displayName: 'Tarma',
    d: 'M 98 128 C 125 105, 158 98, 185 118 C 190 142, 180 178, 162 198 C 138 202, 118 192, 108 172 C 102 155, 95 142, 98 128 Z',
    labelX: 138,
    labelY: 155,
  },
  {
    id: 'unit-128',
    name: 'UGEL JAUJA',
    displayName: 'Jauja',
    d: 'M 162 198 C 182 178, 205 180, 228 192 C 224 218, 202 238, 178 244 C 158 245, 145 228, 142 215 Z',
    labelX: 185,
    labelY: 215,
  },
  {
    id: 'unit-129',
    name: 'UGEL JUNÍN',
    displayName: 'Junín',
    d: 'M 148 244 C 172 240, 198 245, 208 268 C 198 288, 172 298, 150 292 C 142 278, 142 258, 148 244 Z',
    labelX: 176,
    labelY: 272,
  },
  {
    id: 'unit-124',
    name: 'UGEL CHANCHAMAYO',
    displayName: 'Chanchamayo',
    d: 'M 185 115 C 235 75, 298 92, 335 125 C 315 152, 275 168, 240 162 C 205 158, 190 138, 185 115 Z',
    labelX: 255,
    labelY: 125,
  },
  {
    id: 'unit-134',
    name: 'UGEL SATIPO',
    displayName: 'Satipo',
    d: 'M 295 130 C 345 120, 395 152, 415 198 C 420 235, 395 285, 365 315 C 330 318, 305 292, 292 260 C 285 210, 280 165, 295 130 Z',
    labelX: 350,
    labelY: 220,
  },
  {
    id: 'unit-131',
    name: 'UGEL PICHANAKI',
    displayName: 'Pichanaki',
    d: 'M 412 210 C 445 208, 480 230, 498 262 C 485 292, 448 318, 415 310 C 400 285, 398 245, 412 210 Z',
    labelX: 452,
    labelY: 268,
  },
  {
    id: 'unit-126',
    name: 'UGEL CONCEPCIÓN',
    displayName: 'Concepción',
    d: 'M 215 238 C 248 230, 278 248, 275 272 C 265 292, 235 300, 218 288 C 210 268, 210 250, 215 238 Z',
    labelX: 245,
    labelY: 268,
  },
  {
    id: 'unit-127',
    name: 'UGEL HUANCAYO',
    displayName: 'Huancayo',
    d: 'M 112 278 C 142 270, 168 288, 162 315 C 145 330, 118 335, 102 318 C 98 298, 102 285, 112 278 Z',
    labelX: 132,
    labelY: 305,
  },
  {
    id: 'unit-125',
    name: 'UGEL CHUPACA',
    displayName: 'Chupaca',
    d: 'M 145 320 C 172 315, 192 335, 185 365 C 168 390, 138 385, 128 360 C 125 340, 132 328, 145 320 Z',
    labelX: 158,
    labelY: 352,
  },
  {
    id: 'unit-133',
    name: 'UGEL RIO TAMBO',
    displayName: 'Río Tambo',
    d: 'M 248 295 C 285 285, 320 305, 322 342 C 305 380, 268 392, 240 375 C 235 340, 238 312, 248 295 Z',
    labelX: 278,
    labelY: 338,
  },
  {
    id: 'unit-130',
    name: 'UGEL PANGOA',
    displayName: 'Perené / Pangoa',
    d: 'M 252 380 C 288 375, 318 398, 312 432 C 292 458, 255 455, 235 435 C 232 408, 240 390, 252 380 Z',
    labelX: 272,
    labelY: 418,
  },
];

export interface MapaTerritorialViewProps {
  items: any[];
}

export default function MapaTerritorialView({ items }: MapaTerritorialViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('JUNÍN');
  const [statusFilter, setStatusFilter] = useState<Status | 'Todos'>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subView, setSubView] = useState<TerritorialSubView>('geo-real');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedUgelId, setSelectedUgelId] = useState<string | null>('unit-124');
  const [hoveredUgel, setHoveredUgel] = useState<{
    id: string;
    name: string;
    progress: number;
    state: Status;
    fc: string;
    x: number;
    y: number;
  } | null>(null);

  const [refresh, setRefresh] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletCanvasRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const allRows = useMemo(() => {
    return MINEDU_UNIDADES.map((unit, idx) => {
      const ugelKey = key(unit.name);
      const regKeyUnit = key(unit.region);

      const related = items.filter((item) => {
        const itemUgel = key(item.ugel || item.sede || '');
        const itemReg = key(item.region || '');
        return (
          (itemUgel && (itemUgel.includes(ugelKey) || ugelKey.includes(itemUgel))) ||
          (itemReg && itemReg === regKeyUnit)
        );
      });

      let progress = 0;
      if (related.length > 0) {
        progress = Math.round(
          related.reduce((sum, item) => sum + Number(item.progress || 0), 0) / related.length
        );
      } else {
        const mockPcts = [100, 100, 75, 50, 50, 33, 20, 20, 0, 0, 0, 0];
        progress = mockPcts[idx % mockPcts.length] ?? 0;
      }

      const state: Status =
        progress >= 80 ? 'Cumple' : progress > 0 ? 'En proceso' : 'No cumple';

      const regKey = key(unit.region);
      const regConf = REGION_CONFIG[regKey] || { center: [-9.2, -75.0], zoom: 7 };
      const seed = (unit.id?.charCodeAt(unit.id.length - 1) || idx) % 17 - 8;
      const seed2 = (unit.id?.charCodeAt(0) || idx) % 17 - 8;
      const lat = regConf.center[0] + seed * 0.08;
      const lng = regConf.center[1] + seed2 * 0.08;

      return {
        ...unit,
        progress,
        state,
        coords: [lat, lng] as [number, number],
        lastUpdate: '15 oct. 2026',
        fcDate: '01-12-2026',
      };
    });
  }, [items]);

  const regionsList = useMemo(() => {
    const set = new Set(MINEDU_UNIDADES.map((u) => u.region));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, []);

  const visibleRows = useMemo(() => {
    return allRows.filter((row) => {
      if (selectedRegion !== 'Todas' && key(row.region) !== key(selectedRegion)) {
        return false;
      }
      if (statusFilter !== 'Todos' && row.state !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = key(searchTerm);
        if (!key(row.name).includes(q) && !key(row.region).includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allRows, selectedRegion, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const inRegion = allRows.filter(
      (r) => selectedRegion === 'Todas' || key(r.region) === key(selectedRegion)
    );
    return {
      total: inRegion.length,
      cumple: inRegion.filter((r) => r.state === 'Cumple').length,
      proceso: inRegion.filter((r) => r.state === 'En proceso').length,
      noCumple: inRegion.filter((r) => r.state === 'No cumple').length,
    };
  }, [allRows, selectedRegion]);

  useEffect(() => {
    if (subView !== 'geo-real') return;
    if (!leafletCanvasRef.current) return;

    let disposed = false;
    import('leaflet').then((LModule) => {
      if (disposed) return;
      const L = (LModule as any).default || LModule;

      const regKey = key(selectedRegion);
      const conf = REGION_CONFIG[regKey] || { center: [-9.19, -75.01], zoom: 6 };

      // Prevenir error 'Map container is already initialized'
      if (leafletCanvasRef.current && (leafletCanvasRef.current)._leaflet_id && !leafletRef.current) {
        (leafletCanvasRef.current)._leaflet_id = null;
      }

      if (!leafletRef.current) {
        try {
          const map = L.map(leafletCanvasRef.current, {
            center: conf.center,
            zoom: conf.zoom,
            zoomControl: false,
            attributionControl: false,
          });

          L.control.zoom({ position: 'topleft' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            subdomains: ['a', 'b', 'c'],
          }).addTo(map);

          leafletRef.current = map;
        } catch (err) {
          console.warn('Leaflet init safe-catch:', err);
          return;
        }
      } else {
        try {
          const map = leafletRef.current;
          map.setView(conf.center, conf.zoom, { animate: true });
        } catch (_) {}
      }

      const map = leafletRef.current;

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current.clear();

      visibleRows.forEach((row) => {
        const pinColor =
          row.state === 'Cumple'
            ? '#00b96b'
            : row.state === 'En proceso'
            ? '#fa8c16'
            : '#ef4444';

        const customIconHtml = `
          <div class="qaway-map-pin ${row.id === selectedUgelId ? 'is-selected' : ''}" style="--pin-color: ${pinColor}">
            ${row.id === selectedUgelId ? '<span class="pin-pulse"></span>' : ''}
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
          <div class="qaway-minimal-topplin">
            <div class="topplin-header">
              <span class="topplin-diamond">◆</span>
              <span>${row.name}</span>
            </div>
            <div class="topplin-metric-row">
              <span class="topplin-cumplimiento">Cumplimiento : ${row.progress}%</span>
              <span class="topplin-sep">·</span>
              <span class="topplin-fc">Estado: ${row.state}</span>
            </div>
            <div class="topplin-region-sub">${row.region} · FC: ${row.fcDate}</div>
          </div>
        `;

        const marker = L.marker(row.coords, { icon })
          .addTo(map)
          .bindPopup(popupContent, {
            className: 'qaway-clean-popup',
            offset: [0, -8],
          });

        marker.on('click', () => {
          setSelectedUgelId(row.id);
        });

        markersRef.current.set(row.id, marker);
      });

      if (selectedUgelId && markersRef.current.has(selectedUgelId)) {
        const m = markersRef.current.get(selectedUgelId);
        m.openPopup();
      }

      setTimeout(() => map.invalidateSize(), 250);
    });

    return () => {
      disposed = true;
    };
  }, [subView, visibleRows, selectedRegion, refresh]);

  const handleSelectUgel = (row: typeof allRows[0]) => {
    setSelectedUgelId(row.id);
    if (subView === 'geo-real' && leafletRef.current && markersRef.current.has(row.id)) {
      const map = leafletRef.current;
      map.flyTo(row.coords, Math.max(map.getZoom(), 8), { duration: 0.6 });
      const m = markersRef.current.get(row.id);
      m.openPopup();
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (leafletRef.current) {
        setTimeout(() => leafletRef.current.invalidateSize(), 300);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className={`territorial-hub-wrapper ${isFullscreen ? 'is-fullscreen-territorial' : ''}`}
    >


      <div className="territorial-canvas-body">
        {/* PANEL IZQUIERDO */}
        <aside className="territorial-left-table-panel">
          <div className="panel-inner-head">
            <h3 className="panel-title">Estado por UGEL</h3>
            <span className="panel-badge">{visibleRows.length} resultados</span>
          </div>

          <div className="territorial-table-container">
            <table className="territorial-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>N.°</th>
                  <th>UGEL / Sede</th>
                  <th style={{ width: '110px' }}>Estado</th>
                  <th style={{ width: '130px' }}>Avance actual</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row-msg">
                      No se encontraron unidades operativas para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, idx) => {
                    const isSelected = row.id === selectedUgelId;
                    const statusClass =
                      row.state === 'Cumple'
                        ? 'status-cumple'
                        : row.state === 'En proceso'
                        ? 'status-proceso'
                        : 'status-retraso';

                    return (
                      <tr
                        key={row.id}
                        className={`table-row-ugel ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleSelectUgel(row)}
                      >
                        <td className="col-idx">{idx + 1}</td>
                        <td className="col-name">
                          <strong className="ugel-main-name">{row.name}</strong>
                          <small className="ugel-sub-region">{row.region}</small>
                        </td>
                        <td className="col-status">
                          <span className={`status-pill-clean ${statusClass}`}>
                            <i className="pill-dot" />
                            {row.state}
                          </span>
                        </td>
                        <td className="col-progress">
                          <div className="progress-bar-track">
                            <div
                              className={`progress-bar-fill ${statusClass}`}
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                          <span className="progress-pct-num">{row.progress}%</span>
                        </td>
                        <td className="col-arrow">
                          <ChevronRight size={14} className="row-arrow-icon" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </aside>

        {/* PANEL DERECHO */}
        <main className="territorial-right-map-panel">
          <div className="map-card-wrapper">
            <div className="map-card-header">
              <div className="map-title-wrap">
                <MapPinned size={15} className="map-header-icon" />
                <h4>
                  {subView === 'geo-real' && 'Mapa Geográfico Satelital'}
                  {subView === 'tematico-regional' && 'Mapa Regional Temático (Poligonal)'}
                  {subView === 'powerbi-analitico' && 'Tablero Analítico Territorial'}
                </h4>
              </div>
              <div className="map-legend-pills">
                <span className="legend-item">
                  <i className="leg-dot green" /> Cumple
                </span>
                <span className="legend-item">
                  <i className="leg-dot orange" /> En proceso
                </span>
                <span className="legend-item">
                  <i className="leg-dot red" /> No cumple
                </span>
              </div>
            </div>

            <div className="territorial-view-stage">
              {/* VISTA 1 */}
              <div
                className={`stage-pane ${subView === 'geo-real' ? 'is-active' : ''}`}
                style={{ display: subView === 'geo-real' ? 'block' : 'none' }}
              >
                <div
                  ref={leafletCanvasRef}
                  className="territorial-leaflet-canvas"
                  aria-label="Mapa interactivo territorial"
                />
              </div>

              {/* VISTA 2 */}
              {subView === 'tematico-regional' && (
                <div className="stage-pane is-active thematic-svg-pane">
                  <div className="thematic-map-container">
                    <svg
                      viewBox="0 0 540 480"
                      className="thematic-svg-canvas"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {JUNIN_POLYGONS.map((poly) => {
                        const matchedRow = allRows.find(
                          (r) =>
                            r.id === poly.id ||
                            key(r.name).includes(key(poly.displayName)) ||
                            key(poly.displayName).includes(key(r.name))
                        );

                        const state = matchedRow ? matchedRow.state : 'No cumple';
                        const progress = matchedRow ? matchedRow.progress : 0;
                        const isSelected = selectedUgelId === poly.id;

                        const fillColor =
                          state === 'Cumple'
                            ? '#00b96b'
                            : state === 'En proceso'
                            ? '#fa8c16'
                            : '#ef4444';

                        return (
                          <g
                            key={poly.id}
                            className={`thematic-poly-group ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => setSelectedUgelId(poly.id)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredUgel({
                                id: poly.id,
                                name: poly.name,
                                progress,
                                state,
                                fc: '01-12-2026',
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredUgel(null)}
                          >
                            <path
                              d={poly.d}
                              fill={fillColor}
                              stroke="#ffffff"
                              strokeWidth={isSelected ? 3 : 1.8}
                              className="thematic-poly-path"
                              filter="url(#shadowFilter)"
                            />
                            <text
                              x={poly.labelX}
                              y={poly.labelY}
                              textAnchor="middle"
                              className="thematic-poly-label"
                            >
                              {poly.displayName}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <div className="thematic-phases-widget">
                      <div className="phases-header">
                        <TrendingUp size={13} className="phases-icon" />
                        <span>Avance regional por fase</span>
                      </div>
                      <div className="phase-row">
                        <div className="phase-info">
                          <span className="phase-title">Fase 1 – Planificación</span>
                          <span className="phase-pct">69%</span>
                        </div>
                        <div className="phase-track">
                          <div className="phase-fill green" style={{ width: '69%' }} />
                        </div>
                      </div>

                      <div className="phase-row">
                        <div className="phase-info">
                          <span className="phase-title">Fase 2 – Registro MC SIGA</span>
                          <span className="phase-pct">38%</span>
                        </div>
                        <div className="phase-track">
                          <div className="phase-fill orange" style={{ width: '38%' }} />
                        </div>
                      </div>

                      <div className="phase-row">
                        <div className="phase-info">
                          <span className="phase-title">DEI – Nivel Inicial</span>
                          <span className="phase-pct">23%</span>
                        </div>
                        <div className="phase-track">
                          <div className="phase-fill red" style={{ width: '23%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 3 */}
              {subView === 'powerbi-analitico' && (
                <div className="stage-pane is-active powerbi-analytics-pane">
                  <div className="powerbi-grid-container">
                    <div className="powerbi-card">
                      <div className="card-top">
                        <BarChart3 size={14} className="card-top-icon" />
                        <span>Distribución de Cumplimiento Territorial</span>
                      </div>
                      <div className="powerbi-bars-chart">
                        <div className="bar-group">
                          <div className="bar-label-wrap">
                            <span className="label-dot green" />
                            <span className="label-text">Cumplen meta (≥80%)</span>
                            <span className="label-val">{counts.cumple} UGEL</span>
                          </div>
                          <div className="pbi-track">
                            <div
                              className="pbi-fill green"
                              style={{ width: `${(counts.cumple / (counts.total || 1)) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="bar-group">
                          <div className="bar-label-wrap">
                            <span className="label-dot orange" />
                            <span className="label-text">En ejecución activa (1-79%)</span>
                            <span className="label-val">{counts.proceso} UGEL</span>
                          </div>
                          <div className="pbi-track">
                            <div
                              className="pbi-fill orange"
                              style={{ width: `${(counts.proceso / (counts.total || 1)) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="bar-group">
                          <div className="bar-label-wrap">
                            <span className="label-dot red" />
                            <span className="label-text">No cumplen / Sin reporte (0%)</span>
                            <span className="label-val">{counts.noCumple} UGEL</span>
                          </div>
                          <div className="pbi-track">
                            <div
                              className="pbi-fill red"
                              style={{ width: `${(counts.noCumple / (counts.total || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="powerbi-card">
                      <div className="card-top">
                        <TrendingUp size={14} className="card-top-icon" />
                        <span>Indicadores Clave de Dotación 2027</span>
                      </div>
                      <div className="kpi-mini-grid">
                        <div className="kpi-box">
                          <span className="kpi-num">
                            {counts.total > 0
                              ? Math.round(
                                  visibleRows.reduce((a, b) => a + b.progress, 0) /
                                    (visibleRows.length || 1)
                                )
                              : 0}
                            %
                          </span>
                          <span className="kpi-lbl">Avance Regional Ponderado</span>
                        </div>
                        <div className="kpi-box">
                          <span className="kpi-num">15 oct.</span>
                          <span className="kpi-lbl">Corte de Supervisión MC SIGA</span>
                        </div>
                      </div>
                    </div>

                    <div className="powerbi-card full-span">
                      <div className="card-top">
                        <AlertTriangle size={14} className="card-top-icon alert" />
                        <span>Sedes Territoriales que requieren Asistencia Técnica</span>
                      </div>
                      <div className="pbi-urgent-list">
                        {visibleRows
                          .filter((r) => r.state === 'No cumple')
                          .slice(0, 6)
                          .map((u) => (
                            <div
                              key={u.id}
                              className="urgent-chip"
                              onClick={() => setSelectedUgelId(u.id)}
                            >
                              <span className="chip-name">{u.name}</span>
                              <span className="chip-badge">0% avance</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TOPPLIN FLOTANTE MINIMALISTA */}
            {hoveredUgel && (
              <div
                className="qaway-floating-topplin"
                style={{
                  top: hoveredUgel.y - 65,
                  left: hoveredUgel.x,
                }}
              >
                <div className="topplin-header">
                  <span className="topplin-diamond">◆</span>
                  <span>{hoveredUgel.name}</span>
                </div>
                <div className="topplin-metric-row">
                  <span className="topplin-cumplimiento">
                    Cumplimiento : {hoveredUgel.progress}%
                  </span>
                  <span className="topplin-sep">·</span>
                  <span className="topplin-fc">Estado: {hoveredUgel.state}</span>
                </div>
                <div className="topplin-region-sub">FC: {hoveredUgel.fc} · MINEDU Dotación 2027</div>
              </div>
            )}

            {/* BOTONERA DOCK INFERIOR */}
            <footer className="territorial-bottom-dock">
              <div className="dock-left-modes" role="tablist" aria-label="Modos de Vista del Mapa">
                <button
                  type="button"
                  className={`dock-btn ${subView === 'geo-real' ? 'is-active' : ''}`}
                  onClick={() => setSubView('geo-real')}
                  title="Vista 1: Mapa Geográfico Satelital Interactivo con Pines"
                >
                  <Globe2 size={14} />
                  <span>Mapa Geográfico</span>
                </button>

                <button
                  type="button"
                  className={`dock-btn ${subView === 'tematico-regional' ? 'is-active' : ''}`}
                  onClick={() => setSubView('tematico-regional')}
                  title="Vista 2: Mapa Regional Temático por Provincias y Fases (HubPro)"
                >
                  <Layers size={14} />
                  <span>Mapa Regional Temático</span>
                </button>

                <button
                  type="button"
                  className={`dock-btn ${subView === 'powerbi-analitico' ? 'is-active' : ''}`}
                  onClick={() => setSubView('powerbi-analitico')}
                  title="Vista 3: Tablero Analítico Territorial tipo Power BI"
                >
                  <BarChart3 size={14} />
                  <span>Vista Analítica Power BI</span>
                </button>
              </div>

              <div className="dock-right-controls">
                <button
                  type="button"
                  className="dock-zoom-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
