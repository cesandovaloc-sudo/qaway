import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  MoreHorizontal,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PERU_GEOJSON from '../../data/peru_departamental_simple.json';
import 'leaflet/dist/leaflet.css';

interface SedesCaratulaViewProps {
  items?: any[];
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
  onSelectSede,
}: SedesCaratulaViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [activeMacro, setActiveMacro] = useState<string>('todas');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // 1. Datos representativos de las 28 entidades asignadas (DREs y principales UGELs piloto)
  const entidadesAsignadas = useMemo(() => {
    return [
      { id: 'u-1', name: 'DRE Junín', code: 'DRE-JUN', type: 'DRE', region: 'Junín', macro: 'centro', responsable: 'Javier Ruiz', avatar: 'JR', estado: 'Activa' },
      { id: 'u-2', name: 'UGEL Huancayo', code: 'UGEL-HYO', type: 'UGEL', region: 'Junín', macro: 'centro', responsable: 'María Rojas', avatar: 'MR', estado: 'Activa' },
      { id: 'u-3', name: 'UGEL Tarma', code: 'UGEL-TAR', type: 'UGEL', region: 'Junín', macro: 'centro', responsable: 'Carlos Mendoza', avatar: 'CM', estado: 'En proceso' },
      { id: 'u-4', name: 'UGEL Chanchamayo', code: 'UGEL-CHM', type: 'UGEL', region: 'Junín', macro: 'centro', responsable: 'Ana Beltrán', avatar: 'AB', estado: 'Activa' },
      { id: 'u-5', name: 'UGEL Ayacucho', code: 'UGEL-AYA', type: 'UGEL', region: 'Ayacucho', macro: 'centro', responsable: 'Lucía Flores', avatar: 'LF', estado: 'En proceso' },
      { id: 'u-6', name: 'DRE Ayacucho', code: 'DRE-AYA', type: 'DRE', region: 'Ayacucho', macro: 'centro', responsable: 'Jorge Huamán', avatar: 'JH', estado: 'Activa' },
      { id: 'u-7', name: 'DRE Piura', code: 'DRE-PIU', type: 'DRE', region: 'Piura', macro: 'norte', responsable: 'Carlos Vílchez', avatar: 'CV', estado: 'Activa' },
      { id: 'u-8', name: 'UGEL Piura', code: 'UGEL-PIU', type: 'UGEL', region: 'Piura', macro: 'norte', responsable: 'Marcos Soto', avatar: 'MS', estado: 'Activa' },
      { id: 'u-9', name: 'UGEL Sullana', code: 'UGEL-SUL', type: 'UGEL', region: 'Piura', macro: 'norte', responsable: 'Rosa Panta', avatar: 'RP', estado: 'En proceso' },
      { id: 'u-10', name: 'DRE La Libertad', code: 'DRE-LAL', type: 'DRE', region: 'La Libertad', macro: 'norte', responsable: 'Víctor Chávez', avatar: 'VC', estado: 'Activa' },
      { id: 'u-11', name: 'UGEL Trujillo', code: 'UGEL-TRU', type: 'UGEL', region: 'La Libertad', macro: 'norte', responsable: 'Elena Benites', avatar: 'EB', estado: 'Activa' },
      { id: 'u-12', name: 'DRE Lambayeque', code: 'DRE-LAM', type: 'DRE', region: 'Lambayeque', macro: 'norte', responsable: 'Miguel Benites', avatar: 'MB', estado: 'Activa' },
      { id: 'u-13', name: 'UGEL Chiclayo', code: 'UGEL-CHI', type: 'UGEL', region: 'Lambayeque', macro: 'norte', responsable: 'Walter Torres', avatar: 'WT', estado: 'En proceso' },
      { id: 'u-14', name: 'DRE Cajamarca', code: 'DRE-CAJ', type: 'DRE', region: 'Cajamarca', macro: 'norte', responsable: 'Segundo Díaz', avatar: 'SD', estado: 'Activa' },
      { id: 'u-15', name: 'UGEL Cajamarca', code: 'UGEL-CAJ', type: 'UGEL', region: 'Cajamarca', macro: 'norte', responsable: 'Patricia Mera', avatar: 'PM', estado: 'Inactiva' },
      { id: 'u-16', name: 'DRE Amazonas', code: 'DRE-AMA', type: 'DRE', region: 'Amazonas', macro: 'norte', responsable: 'Wilson Valqui', avatar: 'WV', estado: 'Activa' },
      { id: 'u-17', name: 'UGEL Chachapoyas', code: 'UGEL-CHA', type: 'UGEL', region: 'Amazonas', macro: 'norte', responsable: 'Manuel Mamani', avatar: 'MM', estado: 'Activa' },
      { id: 'u-18', name: 'DRE Arequipa', code: 'DRE-ARE', type: 'DRE', region: 'Arequipa', macro: 'sur', responsable: 'Gabriel Delgado', avatar: 'GD', estado: 'Activa' },
      { id: 'u-19', name: 'UGEL Arequipa Norte', code: 'UGEL-ARN', type: 'UGEL', region: 'Arequipa', macro: 'sur', responsable: 'Fabiola Arce', avatar: 'FA', estado: 'Activa' },
      { id: 'u-20', name: 'UGEL Arequipa Sur', code: 'UGEL-ARS', type: 'UGEL', region: 'Arequipa', macro: 'sur', responsable: 'Raúl Pinto', avatar: 'RP', estado: 'Activa' },
      { id: 'u-21', name: 'DRE Cusco', code: 'DRE-CUS', type: 'DRE', region: 'Cusco', macro: 'sur', responsable: 'Ronald Quispe', avatar: 'RQ', estado: 'Activa' },
      { id: 'u-22', name: 'UGEL Cusco', code: 'UGEL-CUS', type: 'UGEL', region: 'Cusco', macro: 'sur', responsable: 'Celia Nina', avatar: 'CN', estado: 'Activa' },
      { id: 'u-23', name: 'UGEL Urubamba', code: 'UGEL-URU', type: 'UGEL', region: 'Cusco', macro: 'sur', responsable: 'Edwin Paucar', avatar: 'EP', estado: 'Inactiva' },
      { id: 'u-24', name: 'DRE Puno', code: 'DRE-PUN', type: 'DRE', region: 'Puno', macro: 'sur', responsable: 'Walter Mamani', avatar: 'WM', estado: 'Activa' },
      { id: 'u-25', name: 'UGEL Puno', code: 'UGEL-PUN', type: 'UGEL', region: 'Puno', macro: 'sur', responsable: 'David Cutipa', avatar: 'DC', estado: 'En proceso' },
      { id: 'u-26', name: 'DRE Tacna', code: 'DRE-TAC', type: 'DRE', region: 'Tacna', macro: 'sur', responsable: 'Óscar Calizaya', avatar: 'OC', estado: 'Activa' },
      { id: 'u-27', name: 'UGEL Tacna', code: 'UGEL-TAC', type: 'UGEL', region: 'Tacna', macro: 'sur', responsable: 'Gloria Choque', avatar: 'GC', estado: 'Activa' },
      { id: 'u-28', name: 'UGEL Jauja', code: 'UGEL-JAU', type: 'UGEL', region: 'Junín', macro: 'centro', responsable: 'Alberto Vega', avatar: 'AV', estado: 'Inactiva' },
    ];
  }, []);

  // 2. Cálculo dinámico de estados para el Gráfico Donut (Componente 2)
  const donutData = useMemo(() => {
    const activas = entidadesAsignadas.filter((e) => e.estado === 'Activa').length;
    const enProceso = entidadesAsignadas.filter((e) => e.estado === 'En proceso').length;
    const inactivas = entidadesAsignadas.filter((e) => e.estado === 'Inactiva').length;
    const total = entidadesAsignadas.length;

    return {
      total,
      activas: { count: activas, pct: Math.round((activas / total) * 100) },
      enProceso: { count: enProceso, pct: Math.round((enProceso / total) * 100) },
      inactivas: { count: inactivas, pct: Math.round((inactivas / total) * 100) },
      series: [
        { name: 'Activas', value: activas, color: '#10b981' },
        { name: 'En proceso', value: enProceso, color: '#f59e0b' },
        { name: 'Inactivas', value: inactivas, color: '#ef4444' },
      ],
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

  return (
    <div className="sd-caratula-wrapper" style={{
      display: 'grid',
      gridTemplateColumns: '1.28fr 0.72fr',
      gap: '14px',
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
          COMPONENTE 1 (Izquierda): Cobertura territorial del proyecto con Mapa
          Los botones de macrorregión y la leyenda se mantienen a la derecha del mapa
          pero con espaciado compacto optimizado, eliminando el hueco blanco vacío.
          ========================================================================= */}
      <section style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '10px 12px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* Cabecera Mínima: Título en una sola línea compacta sin párrafos redundantes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          flexShrink: 0,
        }}>
          <MapPin size={15} color="#0284c7" />
          <h2 style={{ fontSize: '13.5px', fontWeight: 750, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            Cobertura territorial del proyecto
          </h2>
        </div>

        {/* Lienzo del Mapa + Panel Lateral de Macrorregiones y Leyenda */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 180px',
          gap: '10px',
          flex: '1 1 0%',
          height: '100%',
          minHeight: 0,
        }}>
          {/* Contenedor del Mapa Leaflet Oficial (Se expande ocupando todo el ancho y alto disponible) */}
          <div style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            height: '100%',
            minHeight: 0,
            width: '100%',
          }}>
            <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>

          {/* Panel Lateral: Botones de Macrorregión + Leyenda en su ubicación original pero sin huecos vacíos */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#ffffff',
            padding: '2px 0',
            overflowY: 'auto',
          }}>
            {/* 1. Cobertura por macrorregión */}
            <div>
              <h3 style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Cobertura por macrorregión
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button
                  type="button"
                  onClick={(e) => handleMacroClick('norte', e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: activeMacro === 'norte' ? '#eff6ff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: activeMacro === 'norte' ? '#bfdbfe' : '#eef2f6',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#1e40af', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>Norte</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>5 regiones · 11 entidades</small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleMacroClick('centro', e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: activeMacro === 'centro' ? '#eff6ff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: activeMacro === 'centro' ? '#bfdbfe' : '#eef2f6',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>Centro</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>4 regiones · 9 entidades</small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleMacroClick('sur', e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: activeMacro === 'sur' ? '#eff6ff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: activeMacro === 'sur' ? '#bfdbfe' : '#eef2f6',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#93c5fd', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>Sur</strong>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>4 regiones · 8 entidades</small>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Leyenda del mapa */}
            <div>
              <h3 style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Leyenda del mapa
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0f172a', display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <MapPin size={8} />
                  </span>
                  <span>DRE (Sede regional)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#0284c7', display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <MapPin size={8} />
                  </span>
                  <span>UGEL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #38bdf8', background: 'transparent' }} />
                  <span>Unidad intervención</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 8, borderRadius: '2px', background: '#bfdbfe' }} />
                  <span>Región asignada</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 14, height: 8, borderRadius: '2px', background: '#e2e8f0' }} />
                  <span>Sin asignación</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COLUMNA DERECHA:
          - Componente 2: Gráfico Dona "Entidades por estado" (con Tooltip aprobado)
          - Componente 3: Tablero "Entidades y unidades asignadas" (28 registros)
          ========================================================================= */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* COMPONENTE 2: Entidades por estado (Donut con Tooltip interactivo) */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '14.5px', fontWeight: 750, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Entidades por estado
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '130px' }}>
            {/* Anillo Donut Recharts con Tooltip interactivo */}
            <div style={{ position: 'relative', width: '125px', height: '125px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} entidades (${Math.round((Number(val) / donutData.total) * 100)}%)`,
                      name,
                    ]}
                    contentStyle={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
                    }}
                  />
                  <Pie
                    data={donutData.series}
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {donutData.series.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <b style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{donutData.total}</b>
                <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>entidades</small>
              </div>
            </div>

            {/* Leyenda y porcentaje en lista vertical */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1, paddingLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  Activas
                </span>
                <b style={{ color: '#0f172a' }}>{donutData.activas.count} ({donutData.activas.pct}%)</b>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  En proceso
                </span>
                <b style={{ color: '#0f172a' }}>{donutData.enProceso.count} ({donutData.enProceso.pct}%)</b>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  Inactivas
                </span>
                <b style={{ color: '#0f172a' }}>{donutData.inactivas.count} ({donutData.inactivas.pct}%)</b>
              </div>
            </div>
          </div>
        </section>

        {/* COMPONENTE 3: Tablero / Tabla "Entidades y unidades asignadas" (Fijo al alto de la columna) */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          flex: '1 1 0%',
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
            marginBottom: '10px',
            flexShrink: 0,
          }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 750, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              Entidades y unidades asignadas
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {filteredEntidades.length} registros
            </span>
          </div>

          {/* Tabla con scroll interno contenido que nunca estira la página */}
          <div style={{
            flex: '1 1 0%',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            border: '1px solid #f1f5f9',
            borderRadius: '10px',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12.5px',
              textAlign: 'left',
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 650, fontSize: '11.5px' }}>Entidad</th>
                  <th style={{ padding: '8px 8px', fontWeight: 650, fontSize: '11.5px' }}>Tipo</th>
                  <th style={{ padding: '8px 10px', fontWeight: 650, fontSize: '11.5px' }}>Región</th>
                  <th style={{ padding: '8px 10px', fontWeight: 650, fontSize: '11.5px' }}>Responsable</th>
                  <th style={{ padding: '8px 10px', fontWeight: 650, fontSize: '11.5px' }}>Estado</th>
                  <th style={{ padding: '8px 6px', width: '32px' }} />
                </tr>
              </thead>
              <tbody>
                {filteredEntidades.map((ent) => {
                  const isSelected = selectedEntityId === ent.id;
                  return (
                    <tr
                      key={ent.id}
                      onClick={() => setSelectedEntityId(ent.id)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isSelected ? '#f0f7ff' : '#ffffff',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={13} style={{ color: ent.type === 'DRE' ? '#1e40af' : '#0284c7', flexShrink: 0 }} />
                          <strong style={{ color: '#0f172a', fontWeight: 650 }}>{ent.name}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '8px 8px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: ent.type === 'DRE' ? '#eff6ff' : '#f0fdf4',
                          color: ent.type === 'DRE' ? '#1e40af' : '#15803d',
                        }}>
                          {ent.type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {ent.region}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}>
                            {ent.avatar}
                          </span>
                          <span style={{ color: '#1e293b', fontWeight: 500 }}>{ent.responsable}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 600 }}>
                          <span style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: ent.estado === 'Activa' ? '#10b981' : ent.estado === 'En proceso' ? '#f59e0b' : '#ef4444',
                          }} />
                          <span style={{
                            color: ent.estado === 'Activa' ? '#15803d' : ent.estado === 'En proceso' ? '#b45309' : '#b91c1c',
                          }}>
                            {ent.estado}
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <button
                          type="button"
                          style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                          title="Opciones"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
